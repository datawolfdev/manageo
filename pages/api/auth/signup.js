import { pool } from "@/db";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
    if (req.method !== "POST") return res.status(405).end(`Méthode ${req.method} non autorisée.`);
    
    const { email, password, confirmPassword } = req.body;
    if (!email || !password || !confirmPassword || password !== confirmPassword)
        return res.status(400).json({ success: false, message: "Champs invalides ou mots de passe ne correspondent pas." });

    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        const verifiedUserExists = rows.some(row => row.verified);
        const unverifiedUser = rows.find(row => !row.verified);

        if (verifiedUserExists) return res.status(409).json({ success: false, message: "Un utilisateur vérifié existe déjà avec cet email." });

        if (unverifiedUser) {
            const userId = unverifiedUser.id;
            await pool.query("DELETE FROM users WHERE id = $1 AND verified = false", [userId]);
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id", [email, hashedPassword])
        return res.status(201).json({ success: true, message: "Utilisateur enregistrer, attente d'un admin pour valide ce compte" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
}