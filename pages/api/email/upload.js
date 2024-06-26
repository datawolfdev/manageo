import formidable from "formidable";
import fs from "fs";
import { parse } from "csv-parse";
import { pool } from "@/db";

export const config = { api: { bodyParser: false } };

const extractSIRET = (data, headers, csv = false, limit = 10000) => {
  const siretColumn = headers.find(header => header.toLowerCase() === "siret");
  if (!siretColumn) return [];
  const sirets = csv ? data.map(el => el[siretColumn]).filter(Boolean) : data.map(el => el[headers.indexOf(siretColumn)]).filter(Boolean);
  return sirets.slice(0, limit);
};

const handleFileUpload = async (req, res) => {
  const form = formidable({ multiples: false });
  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Erreur lors de la lecture du fichier." });

    const file = files.file;
    if (!file) return res.status(400).json({ error: "Aucun fichier téléchargé." });

    const filePath = file[0].filepath;
    const fileType = file[0].originalFilename.split(".").pop().toLowerCase();

    let sirets = [];
    try {
      if (fileType === "csv") {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        parse(fileContent, { delimiter: ",", columns: true }, async (err, data) => {
          if (err) return res.status(500).json({ error: "Erreur lors de la lecture du fichier CSV." });
          sirets = extractSIRET(data, Object.keys(data[0]), true);
          sirets = sirets.slice(0, parseInt(process.env.LIMIT_OF_SIRET));
          return res.status(200).json({ message: "SIRETs extraits avec succès", sirets });
        });
        return;
      } else {
        return res.status(400).json({ error: "Type de fichier non supporté." });
      }
    } catch (error) {
      return res.status(500).json({ error: "Erreur lors de la lecture du fichier." });
    }
  });
};

export default handleFileUpload;
