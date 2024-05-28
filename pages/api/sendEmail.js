import { pool } from "../../db";
import axios from "axios";
import Brevo from "sib-api-v3-sdk";

const connContactFinder = axios.create({
    baseURL: process.env.URL_SERVICE_CONTACTFINDER,
    headers: { "x-api-key": process.env.API_KEY_CONTACTFINDER, "Content-Type": "application/json" }
});

Brevo.ApiClient.instance.authentications["api-key"].apiKey = process.env.BREVO_API_KEY;

const htmlEmail = (uuid) => `
  <html>
    <body>
      <div style="max-width: 700px; margin: 0 auto; border-radius: 10px; background-color: #f2f2f2; padding: 20px; text-align: center; overflow-wrap: break-word;">
        <h1 style="color: #333; margin: 10px 0;">Confirmation de désinscription</h1>
        <p style="font-size: 16px; color: #777; margin: 10px 0;">Veuillez cliquer sur le bouton ci-dessous pour vous désinscrire.</p>
        <div style="margin: 6%;">
          <a href="https://app.enrichcontact.com/unsubscribe?uuid=${uuid}" style="text-decoration: none; color: #fff; background-color: #7e22ce; border-radius: 5px; padding: 10px 20px; display: inline-block;">Se désinscrire</a>
        </div>
      </div>
    </body>
  </html>`;

const sendEmails = async (emails) => {
    const apiInstance = new Brevo.TransactionalEmailsApi();
    await Promise.all(emails.map(email => apiInstance.sendTransacEmail({
        to: [{ email: email.email }],
        subject: "Confirmation de désinscription",
        htmlContent: htmlEmail(email.uuid),
        sender: { email: process.env.EMAIL_USER }
    })));
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
        const { data: { contacts } } = await connContactFinder.get(`/api/job?search_id=${id}`);

        const emailEntries = contacts.map(contact => ({
            email: contact.email,
            contact_type: contact.role || "unknown",
            company_name: contact.company_name || "unknown",
            gender: contact.gender || "unknown"
        }));

        const client = await pool.connect();
        await client.query("BEGIN");

        const updatePromises = emailEntries.map(async entry => {
            const { rows } = await client.query("SELECT * FROM emails WHERE company_name = $1", [entry.company_name]);
            if (rows.length > 0) {
                await client.query(
                    "UPDATE emails SET email = $1, contact_type = $2, gender = $3 WHERE company_name = $4",
                    [entry.email, entry.contact_type, entry.gender, entry.company_name]
                );
                return { email: entry.email, uuid: rows[0].uuid };
            }
            return null;
        });

        const results = (await Promise.all(updatePromises)).filter(result => result !== null);
        await client.query("COMMIT");
        client.release();

        await batchSendEmails(results);

        res.status(200).json({ message: "Le fichier a été mis à jour avec succès, les crédits utilisés et le search_id ont été vidés." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erreur lors de la mise à jour des emails dans la base de données." });
    }
}
