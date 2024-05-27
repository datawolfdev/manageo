import { companySearch } from "@/api_management/function";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.setHeader("Allow", ["POST"]).status(405).end(`Method ${req.method} Not Allowed`);

  try {
    const { sirets } = req.body;
    if (!Array.isArray(sirets) || sirets.length === 0) return res.status(400).json({ error: "Invalid or empty SIRET list." });
    const processBatches = async (sirets, batchSize = 10) => {
      let results = [];
      for (let i = 0; i < sirets.length; i += batchSize) {
        const batch = sirets.slice(i, i + batchSize);
        const batchResults = await Promise.all(batch.map(async siret => (await companySearch(siret)).companies[0]?.name1));
        results = results.concat(batchResults);
      }
      return results;
    };

    const compagnies = await processBatches(sirets);
    res.status(200).json({ message: "Company data retrieved successfully", compagnies });
  } catch (error) {
    console.error("Failed to search company data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
