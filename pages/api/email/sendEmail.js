import { pool } from "@/db";
import axios from "axios";
import Brevo from "sib-api-v3-sdk";

const connContactFinder = axios.create({
    baseURL: process.env.URL_SERVICE_CONTACTFINDER,
    headers: { "x-api-key": process.env.API_KEY_CONTACTFINDER, "Content-Type": "application/json" }
});

Brevo.ApiClient.instance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const htmlEmail = (content, replacements) => {
    let result = content;
    for (const [key, value] of Object.entries(replacements)) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    }
    return result;
};

const sendEmails = async (emails, content, subject) => {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    await Promise.all(emails.map(email => apiInstance.sendTransacEmail({
        to: [{ email: email.email }],
        subject: subject,
        htmlContent: htmlEmail(content, { uuid: email.uuid, gender: email.gender, lastName: email.nom, firstName: email.prenom, domaine: process.env.DOMAIN }),
        sender: { email: process.env.EMAIL_USER }
    })));
};

const batchSendEmails = async (allEmails, content, subject) => {
    for (let i = 0; i < allEmails.length; i += 10) {
        await sendEmails(allEmails.slice(i, i + 10), content, subject);
    }
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.setHeader("Allow", ["POST"]).status(405).json({ message: "Méthode non autorisée." });

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "search_id manquant dans la requête." });

    const client = await pool.connect();
    await client.query("BEGIN");

    try {
        const { data: { contacts } } = await connContactFinder.get(`/api/job?search_id=${id}`);
        const emailEntries = contacts.map(contact => ({
            email: contact.email, contact_type: contact.role || "unknown", nom: contact.lastname || "unknown",
            prenom: contact.firstname || "unknown", company_name: contact.company_name || "unknown",
            gender: contact.gender || "unknown", linkedin: contact.linkedin || "unknown"
        }));

        const updatePromises = emailEntries.map(async entry => {
            const { rows: entrepriseRows } = await client.query("SELECT id, emails FROM entreprises WHERE company_name = $1", [entry.company_name]);
            if (entrepriseRows.length > 0) {
                const entreprise_id = entrepriseRows[0].id;
                const { rows: emailRows } = await client.query("SELECT id FROM emails WHERE entreprise_id = $1 AND email = $2", [entreprise_id, entry.email]);
                let email_id;
                if (emailRows.length > 0) {
                    email_id = emailRows[0].id;
                    await client.query("UPDATE emails SET nom = $1, prenom = $2, contact_type = $3, gender = $4, linkedin = $5 WHERE id = $6", [entry.nom, entry.prenom, entry.contact_type, entry.gender, entry.linkedin, email_id]);
                } else {
                    const { rows } = await client.query("INSERT INTO emails (entreprise_id, email, nom, prenom, contact_type, gender, linkedin) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", [entreprise_id, entry.email, entry.nom, entry.prenom, entry.contact_type, entry.gender, entry.linkedin]);
                    email_id = rows[0].id;
                }
                if (!entrepriseRows[0].emails.includes(email_id)) await client.query("UPDATE entreprises SET emails = array_append(emails, $1) WHERE id = $2", [email_id, entreprise_id]);
                return { email: entry.email, uuid: email_id, gender: entry.gender, nom: entry.nom, prenom: entry.prenom };
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
        await pool.query("UPDATE operations SET email_count = $1 WHERE created_at = (SELECT MAX(created_at) FROM operations)", [emailCount]);
        res.status(200).json({ message: "Le fichier a été mis à jour avec succès, les crédits utilisés et le search_id ont été vidés." });
    } catch (error) {
        console.log(id, "\nemail non trouver")
        await client.query("ROLLBACK");
        client.release();
        res.status(500).json({ message: "Erreur lors de la mise à jour des emails dans la base de données." });
    }
}
