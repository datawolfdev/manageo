import { pool } from '@/db';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { templateId } = req.body;

        if (!templateId) {
            return res.status(400).json({ message: 'ID du modèle manquant' });
        }

        try {
            await pool.query('UPDATE emails_templates SET selected = false WHERE selected = true');
            await pool.query('UPDATE emails_templates SET selected = true WHERE id = $1', [templateId]);
            res.status(200).json({ message: 'Modèle sélectionné mis à jour avec succès' });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du modèle sélectionné:', error);
            res.status(500).json({ message: 'Erreur interne du serveur' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
}
