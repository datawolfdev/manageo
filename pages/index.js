import { useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import useContacts from "@/hooks/useContact";
import ContactComponent from "@/components/contactComponent";
import checkAuth from "@/lib/checkAuth";
import SpeedDial from "@/components/speedDialComponent";

export default function Home({ userData }) {
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState("");
    const fileInputRef = useRef(null);
    const Contact = useContacts();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        const allowedTypes = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "application/vnd.ms-excel", "text/csv"];
        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
            setFile(selectedFile);
            setError("");
        } else {
            setError("Seuls les fichiers .xlsx, .csv sont autorisés.");
            setFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (file && Contact.selectedContact.length !== 0) {
            const formData = new FormData();
            formData.append("file", file);
            setProgress(0);
            setMessage("Extraction des Siret...");
            try {
                const { data: { sirets } } = await axios.post("/api/email/upload", formData);
                if (sirets) {
                    setMessage("Extraction des SIRET réussie, recherche en cours...");
                    setProgress(33)
                    const { data: { compagnies } } = await axios.post("/api/emai/rocketLead", { sirets, Contact });
                    setMessage("Recherche terminée, traitement des données...");
                    setProgress(66)
                    await axios.post("/api/email/enrich", { compagnies, Contact });
                    setMessage("Envoie des mails en cours.");
                    setProgress(100);
                }
            } catch (err) {
                setError(err.response?.data?.error || "Erreur lors de l\"envoi du fichier.");
                setProgress(0);
            }
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
        setError("");
        setProgress(0);
        setMessage("");
        fileInputRef.current.value = null;
    };

    return (
        <section className="bg-gradient-to-r from-slate-900 to-slate-950 overflow-auto h-full">
            <SpeedDial />
            <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 flex flex-col justify-center items-center h-full gap-5">
                <h1 className="text-white text-2xl">Envoyer votre fichier</h1>
                <div className="input-div relative w-24 h-24 rounded-full border-2 border-cyan-300 flex justify-center items-center overflow-hidden shadow-[0px_0px_100px_rgb(1,235,252),inset_0px_0px_10px_rgb(1,235,252),0px_0px_5px_rgb(255,255,255)] animate-flicker">
                    <input
                        className={`input z-10 absolute opacity-0 w-full h-full ${file ? "cursor-not-allowed" : "cursor-pointer"}`}
                        name="file"
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileChange}
                        disabled={file !== null}
                        ref={fileInputRef}
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="icon text-cyan-300 w-8 h-8 animate-iconflicker" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <polyline points="16 16 12 12 8 16"></polyline>
                        <line y2="21" x2="12" y1="12" x1="12"></line>
                        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"></path>
                        <polyline points="16 16 12 12 8 16"></polyline>
                    </svg>
                </div>
                <ContactComponent Contact={Contact} />
                {file && (
                    <div className="relative flex flex-col justify-center items-center mt-4 h-32 w-32 bg-white rounded-lg gap-2">
                        <button className="absolute top-0 right-0 text-red-600" onClick={handleRemoveFile}>
                            <Image className="h-6 w-6" width={100} height={100} src="/icones/cross.png" alt="cross" />
                        </button>
                        <Image className="h-16 w-16" width={100} height={100} src="/icones/xlsx.png" alt="xlsx" />
                        <span className="text-black text-sm">{file.name}</span>
                    </div>
                )}
                {progress > 0 && (
                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                    </div>
                )}
                {message && <p className="text-green-500 mt-2">{message}</p>}
                {error && <p className="text-red-500 mt-2">{error}</p>}
                <button onClick={handleSubmit} className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded">Envoyer</button>
            </div>
        </section>
    );
}

export const getServerSideProps = async (context) => {
    return checkAuth(context);
};
