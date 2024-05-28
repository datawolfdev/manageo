import { pool } from "../../db";
import axios from "axios";
import Brevo from "sib-api-v3-sdk";

const apiBaseUrlContactFinder = process.env.URL_SERVICE_CONTACTFINDER;
const apiKeyContactFinder = process.env.API_KEY_CONTACTFINDER;
const connContactFinder = axios.create({
    baseURL: apiBaseUrlContactFinder,
    headers: { "x-api-key": apiKeyContactFinder, "Content-Type": "application/json" }
});

Brevo.ApiClient.instance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const htmlEmail = (uuid) => {
    return `
    <html>
      <body>
        <div style="max-width: 700px; margin: 0 auto; border-radius: 10px; background-color: #f2f2f2; padding: 20px; text-align: center; overflow-wrap: break-word;">
          <h1 style="color: #333; margin: 10px 0;">Confirmation de désinscription</h1>
          <p style="font-size: 16px; color: #777; margin: 10px 0;">Veuillez cliquer sur le bouton ci-dessous pour vous désinscrire.</p>
          <div style="margin: 6%;">
            <a href="https://votre-site.com/unsubscribe?uuid=${uuid}" style="text-decoration: none; color: #fff; background-color: #7e22ce; border-radius: 5px; padding: 10px 20px; display: inline-block;">Se désinscrire</a>
          </div>
        </div>
      </body>
    </html>`;
};

const sendEmails = async (emails) => {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    const emailPromises = emails.map(email => apiInstance.sendTransacEmail({
        to: [{ email: email.email }],
        subject: "Confirmation de désinscription",
        htmlContent: htmlEmail(email.uuid),
        sender: { email: process.env.EMAIL_USER }
    }));
    await Promise.all(emailPromises);
};

const batchSendEmails = async (allEmails) => {
    for (let i = 0; i < allEmails.length; i += 10) {
        await sendEmails(allEmails.slice(i, i + 10));
    }
};

export default async function handler(req, res) {
    if (req.method !== "POST") return res.setHeader("Allow", "POST").status(405).json({ message: "Méthode non autorisée." });

    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "search_id manquant dans la requête." });

    try {
        const response = await connContactFinder.get(`/api/job?search_id=${id}`);
        const jsonData = response.data.contacts;
        console.log("JSON Entries: ", jsonData)
        const emailEntries = jsonData.map(contact => ({ email: contact.email, contact_type: contact.type || "unknown" }));
        console.log("Email Entries: ", emailEntries)
        const client = await pool.connect();
        await client.query("BEGIN");
        const insertPromises = emailEntries.map(entry => client.query("INSERT INTO emails (email, uuid, contact_type) VALUES ($1, $2) RETURNING uuid", [entry.email, entry.contact_type]));
        const results = await Promise.all(insertPromises);
        await client.query("COMMIT");
        client.release();

        const allEmails = results.map(result => result.rows[0]);
        await batchSendEmails(allEmails);

        res.status(200).json({ message: "Le fichier a été mis à jour avec succès, les crédits utilisés et le search_id ont été vidés." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de l'ajout des emails à la base de données." });
    }
}
