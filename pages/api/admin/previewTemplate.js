import { pool } from "@/db";

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'ID de modèle manquant' });
    }

    try {
        const client = await pool.connect();
        const result = await client.query("SELECT html_content FROM emails_templates WHERE id = $1", [id]);
        client.release();

        if (result.rows.length > 0) {
            const htmlContent = result.rows[0].html_content;
            const buffer = Buffer.from(htmlContent, 'utf-8');
            res.setHeader('Content-Type', 'text/html; charset=utf-8');
            console.log(htmlContent);
            res.status(200).send(buffer);
        } else {
            res.status(404).json({ message: 'Modèle non trouvé' });
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du modèle:', error);
        res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}
