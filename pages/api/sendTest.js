import { pool } from "@/db";
import Brevo from "sib-api-v3-sdk";

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

export default async function handler(req, res) {
    try {
        const { email, type } = req.body;
        const { rows } = await pool.query("INSERT INTO emails (email, contact_type) VALUES ($1, $2) RETURNING uuid", [email, type]);
        const apiInstance = new Brevo.TransactionalEmailsApi();
        apiInstance.sendTransacEmail({
            to: [{ email: email }],
            subject: "Confirmation de désinscription",
            htmlContent: htmlEmail(rows[0].uuid),
            sender: { email: process.env.EMAIL_USER }
        });
        res.status(200).json({ message: "Tous les emails on été envoyer." });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error })
    }
}
