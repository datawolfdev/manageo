import { pool } from "@/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { name, subject, html_content } = req.body;

    if (!name || !subject || !html_content) {
        return res.status(400).json({ message: 'Tous les champs sont obligatoires' });
    }

    try {
        const client = await pool.connect();
        await client.query(
            "INSERT INTO emails_templates (name, subject, html_content) VALUES ($1, $2, $3)",
            [name, subject, html_content]
        );
        client.release();
        res.status(201).json({ message: "Email sauvegardé avec succès" });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de l\'email:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}
