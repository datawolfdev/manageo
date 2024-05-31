import Link from "next/link";
import React from "react";

export default function EmailsGestion({ emailsData }) {
    const handleFileDownload = async (e, content, filterAbonnes = false, filterNonAbonnes = false) => {
        e.preventDefault();
        if (content.length === 0 || (content.length === 1 && !content[0])) return;

        if (filterAbonnes) content = content.filter(row => row.receive);
        if (filterNonAbonnes) content = content.filter(row => !row.receive);

        let csvContent = "\uFEFF";
        csvContent += ["Nom de la société", "SIRET", "Nom", "Prénom", "Genre", "Email", "Téléphone", "Abonné", "Rôle", "Date d'ajout", "Date de désinscription", "LinkedIn", "Lieux de collecte", "Famille"].join(";") + "\r\n";
        content.forEach(row => {
            csvContent += [
                `"${row.company_name}"`, `"${row.siret}"`, `"${row.nom}"`, `"${row.prenom}"`, `"${row.gender}"`, `"${row.email}"`, `"${row.phone}"`,
                `"${row.receive}"`, `"${row.contact_type}"`, `"${row.added_at ? new Date(row.added_at).toLocaleString() : ''}"`,
                `"${row.deactivated_at ? new Date(row.deactivated_at).toLocaleString() : ''}"`, `"${row.linkedin}"`, `"${row.collecte}"`, `"${row.famille.join(',')}"`
            ].join(";") + "\r\n";
        });

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const formattedDate = new Date().toLocaleString('fr-FR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/[:/]/g, '-').replace(' ', '_');
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `emails_${filterAbonnes ? 'abonnes_' : filterNonAbonnes ? 'non_abonnes_' : ''}${formattedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const filteredEmailsData = emailsData.filter(el => el.nom && el.prenom && el.gender);

    return (
        <div>
            <div className="overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 border border-gray-200 rounded-lg p-8 md:p-12 col-span-6 row-span-7">
                <h2 className="text-white text-3xl font-extrabold mb-2 p-1">Listes des emails</h2>
                <div className="mb-4 flex gap-4">
                    <button className="px-4 py-2 bg-cyan-500 text-white rounded" onClick={(e) => handleFileDownload(e, filteredEmailsData)}>Télécharger CSV</button>
                    <button className="px-4 py-2 bg-green-500 text-white rounded" onClick={(e) => handleFileDownload(e, filteredEmailsData, true)}>Télécharger les Abonnés</button>
                    <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={(e) => handleFileDownload(e, filteredEmailsData, false, true)}>Télécharger les Désabonnés</button>
                </div>
                <div className="relative max-h-96 overflow-y-auto overflow-x-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-100">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                            <tr>
                                {["SIRET", "Nom de la société", "Nom", "Prénom", "Genre", "Email", "Téléphone", "Abonné", "Rôle", "Date d'ajout", "Date de désinscription", "LinkedIn", "Lieux de la collecte", "Famille"].map(header => (
                                    <th key={header} scope="col" className="px-6 py-3">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEmailsData.map(element => (
                                <tr key={element.id} className="bg-gray-700 border-b hover:overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900">
                                    {["siret", "company_name", "nom", "prenom", "gender", "email", "phone", "receive", "contact_type", "added_at", "deactivated_at", "linkedin", "collecte", "famille"].map(key => (
                                        <td key={key} className={`px-6 py-4 ${key === "siret" ? "font-medium text-white whitespace-nowrap" : ""}`}>
                                            {key === "receive" ? (element[key] ? 'Oui' : 'Non') : key === "added_at" || key === "deactivated_at" ? (element[key] ? new Date(element[key]).toLocaleString() : 'Aucune') : key === "linkedin" ? <Link className="text-cyan-500" href={element[key] || ""}>LinkedIn</Link> : key === "famille" ? element[key].join(',') : element[key]}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="h-2 w-full bg-gradient-to-l via-cyan-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0"></div>
                <div className="h-0.5 group-hover:w-full bg-gradient-to-l via-cyan-950 group-hover:via-cyan-500 w-[70%] m-auto rounded transition-all"></div>
            </div>
        </div>
    );
}
