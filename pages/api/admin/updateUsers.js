import { pool } from "@/db";

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { updates } = req.body;

    try {
        const promises = Object.keys(updates).map(async (userId) => {
            const { admin, verified } = updates[userId];
            await pool.query(`
                UPDATE users 
                SET admin = $1, verified = $2
                WHERE id = $3
            `, [admin, verified, userId]);
        });

        await Promise.all(promises);
        res.status(200).json({ message: 'Users updated successfully' });
    } catch (error) {
        console.error('Error updating users:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
