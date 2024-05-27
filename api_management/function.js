import { pool } from "../db";
import axios from "axios";

const apiBaseUrl = process.env.URL_SERVICE_ROCKETLEAD, apiKey = process.env.API_KEY_ROCKETLEAD;
const conn = axios.create({ baseURL: apiBaseUrl, headers: { "Authorization": apiKey, "Content-Type": "application/json" } });

const apiBaseUrlContactFinder = process.env.URL_SERVICE_CONTACTFINDER, apiKeyContactFinder = process.env.API_KEY_CONTACTFINDER;
const connContactFinder = axios.create({ baseURL: apiBaseUrlContactFinder, headers: { "x-api-key": apiKeyContactFinder, "Content-Type": "application/json" } });

async function companySearch(search) {
    try {
        const url = `/api/user/1/selection/?filterNationalCode=${search}&sample=2`;
        console.log(url);
        return (await conn.get(url)).data;
    } catch (error) {
        console.error("Erreur lors de la création de la recherche d'entreprise par siret")
        return { success: false, message: "Erreur serveur." };
    }
}

async function enrich(compagnies, Contact) {
    try {
        console.log({
            role: `${Contact.selectedContact.join(",")}`,
            company_name: `${compagnies.join(",")}`,
            lang: "FR",
            filename: "manageo",
            per_role: `${Contact.selectedProfil}`,
        });
        await connContactFinder.post("/api/job", {
            role: `${Contact.selectedContact.join(",")}`,
            company_name: `${compagnies.join(",")}`,
            lang: "FR",
            filename: "manageo",
            per_role: `${Contact.selectedProfil}`,
        });
        return { success: true, message: "Enrichissement lancé avec succès." };
    } catch (error) {
        console.error("Erreur lors de la création de la tâche d'enrichissement: ", error);
        return { success: false, message: "Erreur lors de la tentative d'enrichissement." };
    }
}


export { companySearch, enrich };