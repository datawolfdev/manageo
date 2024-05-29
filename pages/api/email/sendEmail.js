import { pool } from "@/db";
import axios from "axios";
import Brevo from "sib-api-v3-sdk";

const connContactFinder = axios.create({
    baseURL: process.env.URL_SERVICE_CONTACTFINDER,
    headers: { "x-api-key": process.env.API_KEY_CONTACTFINDER, "Content-Type": "application/json" }
});

Brevo.ApiClient.instance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const htmlEmail = (content, uuid) => content.replace(/{{uuid}}/g, uuid);

const sendEmails = async (emails, content, subject) => {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    await Promise.all(emails.map(email => apiInstance.sendTransacEmail({
        to: [{ email: email.email }],
        subject: subject,
        htmlContent: htmlEmail(content, email.uuid),
        sender: { email: process.env.EMAIL_USER }
    })));
};

const batchSendEmails = async (allEmails, content, subject) => {
    for (let i = 0; i < allEmails.length; i += 10) {
        await sendEmails(allEmails.slice(i, i + 10), content, subject);
    }
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.setHeader("Allow", "POST").status(405).json({ message: "Méthode non autorisée." });

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "search_id manquant dans la requête." });

    try {
        const { data: { contacts } } = await connContactFinder.get(`/api/job?search_id=${id}`);

        const emailEntries = contacts.map(contact => ({
            email: contact.email,
            contact_type: contact.role || "unknown",
            nom: contact.lastname || "unknown",
            prenom: contact.firstname || "unknown",
            company_name: contact.company_name || "unknown",
            gender: contact.gender || "unknown"
        }));

        const client = await pool.connect();
        await client.query("BEGIN");

        const updatePromises = emailEntries.map(async entry => {
            const { rows } = await client.query("SELECT * FROM emails WHERE company_name = $1 AND receive = true", [entry.company_name]);
            if (rows.length > 0) {
                await client.query(
                    "UPDATE emails SET email = $1, nom = $2, prenom = $3, contact_type = $4, gender = $5 WHERE company_name = $6",
                    [entry.email, entry.nom, entry.prenom, entry.contact_type, entry.gender, entry.company_name]
                );
                return { email: entry.email, uuid: rows[0].uuid };
            }
            return null;
        });

        const results = (await Promise.all(updatePromises)).filter(result => result !== null);

        const templateResult = await client.query("SELECT * FROM emails_templates WHERE selected = true");
        if (templateResult.rows.length === 0) {
            await client.query("COMMIT");
            client.release();
            return res.status(400).json({ message: "Aucun modèle de courriel sélectionné." });
        }
        const { html_content: templateContent, subject } = templateResult.rows[0];

        await client.query("COMMIT");
        client.release();
        await batchSendEmails(results, templateContent, subject);
        const emailCount = emailEntries.length;
        console.log(emailCount)
        await pool.query("UPDATE operations SET email_count = $1 WHERE created_at = (SELECT MAX(created_at) FROM operations)", [emailCount]);
        res.status(200).json({ message: "Le fichier a été mis à jour avec succès, les crédits utilisés et le search_id ont été vidés." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour des emails dans la base de données." });
    }
}
