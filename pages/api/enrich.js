import { enrich } from "@/api_management/function";

export default async function handler(req, res) {
    const { compagnies, Contact } = req.body;
    try {
        const { success, message } = await enrich(compagnies.filter(Boolean), Contact)
        if (success) {
            return res.status(200).json({ success: true, message });
        } else {
            return res.status(500).json({ success: false, message });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Erreur interne du serveur." });
    }
}
