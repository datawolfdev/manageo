import { serialize } from "cookie";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { pool } from "@/db";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Méthode ${req.method} non autorisée`);
    }
    const { email, password, remember } = req.body;
    if (!email || !password) {
        return res.status(400).json({ success: false, message: "L\"email et le mot de passe sont requis." });
    }
    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE email = $1 AND verified = true", [email]);
        if (rows.length === 0) {
            return res.status(401).json({ success: false, message: "Aucun utilisateur vérifié trouvé." });
        }
        const user = rows[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ success: false, message: "L\"email ou le mot de passe est incorrect." });
        }
        const rememberToken = uuidv4();
        await pool.query("UPDATE users SET token = $2 WHERE email = $1", [email, rememberToken]);
        const serialized = serialize("rememberme", rememberToken, {
            httpOnly: true,
            secure: process.env.NEXT_PUBLIC_ENVIRONMENT !== "development",
            maxAge: remember ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
            path: "/",
        });
        res.setHeader("Set-Cookie", serialized);
        return res.status(201).json({ success: true,  message: "Connexion." });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false,  message: "Erreur interne du serveur." });
    }
}
