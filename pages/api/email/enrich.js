import { enrich } from "@/api_management/function";
import { pool } from "@/db";

export default async function handler(req, res) {
    const { nSiret, compagnies, Contact } = req.body;
    try {
        const { success, message } = await enrich(compagnies.filter(Boolean), Contact)
        if (success) {
            const companyCount = compagnies.filter(name => name).length;
            await pool.query("INSERT INTO operations (siret_count, company_count) VALUES ($1, $2)", [nSiret, companyCount]);
            return res.status(200).json({ success: true, message });
        } else {
            return res.status(500).json({ success: false, message });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
}
