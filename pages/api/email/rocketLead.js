import { pool } from "@/db";
import { companySearch } from "@/api_management/function";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", ["POST"]);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const { sirets } = req.body;
        if (!Array.isArray(sirets) || sirets.length === 0) return res.status(400).json({ error: "Invalid or empty SIRET list." });

        const processBatches = async (sirets, batchSize = 10) => {
            let results = [];
            for (let i = 0; i < sirets.length; i += batchSize) {
                const batch = sirets.slice(i, i + batchSize);
                const batchResults = await Promise.all(batch.map(async siret => {
                    const { companies } = await companySearch(siret);
                    const company_name = companies[0]?.name1;
                    if (company_name) await pool.query("INSERT INTO entreprises (siret, company_name) VALUES ($1, $2) ON CONFLICT (siret) DO NOTHING", [siret, company_name]);
                    return company_name;
                }));
                results = results.concat(batchResults);
            }
            return results;
        };

        const compagnies = await processBatches(sirets);
        res.status(200).json({ message: "Company data retrieved and saved successfully", compagnies });
    } catch (error) {
        console.error("Failed to search and save company data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
}
