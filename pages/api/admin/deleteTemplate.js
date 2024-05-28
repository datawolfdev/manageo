import { pool } from "@/db";

export default async function handler(req, res) {
    if (req.method !== 'DELETE') {
        return res.status(405).json({ message: 'Méthode non autorisée' });
    }

    const { templateId } = req.body;

    if (!templateId) {
        return res.status(400).json({ message: 'ID du modèle manquant' });
    }

    try {
        const client = await pool.connect();
        const selectedResult = await client.query("SELECT selected FROM emails_templates WHERE id = $1", [templateId]);
        if (selectedResult.rows.length === 0) {
            client.release();
            return res.status(404).json({ message: 'Modèle non trouvé' });
        }
        if (selectedResult.rows[0].selected) {
            client.release();
            return res.status(400).json({ message: 'Impossible de supprimer un modèle sélectionné' });
        }

        await client.query("DELETE FROM emails_templates WHERE id = $1", [templateId]);
        client.release();

        return res.status(200).json({ message: 'Modèle supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du modèle:', error);
        return res.status(500).json({ message: 'Erreur interne du serveur' });
    }
}
