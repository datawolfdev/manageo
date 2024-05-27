import { pool } from "@/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    }
    const { userId } = req.body;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [userId]);
        res.status(200).json({ success: true });
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
}
