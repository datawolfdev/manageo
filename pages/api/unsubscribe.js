import { pool } from "@/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Méthode non autorisée.' });
    }

    const { uuid } = req.body;

    if (!uuid) {
        return res.status(400).json({ message: 'UUID est requis.' });
    }

    try {
        const result = await pool.query(`
            UPDATE emails 
            SET receive = false, deactivated_at = NOW()
            WHERE uuid = $1
            RETURNING email
        `, [uuid]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Email non trouvé.' });
        }

        res.status(200).json({ message: 'Désabonnement réussi.' });
    } catch (error) {
        console.error('Erreur lors du désabonnement:', error);
        res.status(500).json({ message: 'Erreur interne du serveur.' });
    }
}
