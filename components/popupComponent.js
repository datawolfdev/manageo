"use client"
import axios from "axios";
import { useEffect, useState } from "react";
import ReactDOM from "react-dom";

export default function PopupComponent({ type, compagnies, Contact, setMessage, setProgress, setOpenPopup, nSiret }) {
    const [name, setName] = useState("");
    const [title, setTitle] = useState("");
    const [messagePopup, setMessagePopup] = useState("");

    useEffect(() => {
        switch (type) {
            case "Siret":
                setName("Mon Fichier");
                setTitle("Confirmation d'action");
                setMessagePopup(`Confirmez-vous cette action ? Elle consommera au maximum ${Math.round(compagnies.length * Contact.selectedContact.length * Contact.selectedProfil)} lignes.`);
                break;
            default:
                setName("");
                setTitle("");
                setMessagePopup("");
                break;
        }
    }, [type, compagnies, Contact]);

    const handleSubmit = async (e, confirm) => {
        e.preventDefault();
        try {
            if (type === "Siret" && confirm !== false) {
                await axios.post("/api/email/enrich", { nSiret, compagnies, Contact });
                setMessage("Envoi des mails en cours. Redirection en cours...");
                setProgress(100);
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setOpenPopup(false)
    };

    const handleCancel = async (e) => {
        e.preventDefault();
        setOpenPopup(false);
        setMessage("")
        setMessagePopup("")
        setProgress(0)
    }

    return ReactDOM.createPortal(
        <div className={`fixed inset-0 z-50 overflow-y-auto flex items-center justify-center`} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
            <div className={`relative p-4 w-full max-w-md max-h-full`}>
                <div className={`relative bg-white rounded-lg shadow`}>
                    <button onClick={handleCancel} type="button" className={`absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center`} data-modal-hide="popup-modal">
                        <svg className={`w-3 h-3`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                        </svg>
                        <span className={`sr-only`}>Fermer</span>
                    </button>
                    <div className={`p-4 md:p-5 text-center`}>
                        <svg className={`mx-auto mb-4 text-gray-400 w-12 h-12`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                        </svg>
                        <h3 className={`mb-5 text-lg font-normal text-gray-500`}>{title}</h3>
                        <p className={`mb-5 text-sm text-gray-500`} dangerouslySetInnerHTML={{ __html: messagePopup }}></p>
                        <div>
                            <button onClick={e => handleSubmit(e, true)} className={`text-white bg-green-600 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center mr-2`}>
                                Oui, je suis sûr
                            </button>
                            <button onClick={handleCancel} className={`py-2.5 px-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-cyan-700 focus:z-10 focus:ring-4 focus:ring-gray-100`}>Non</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}