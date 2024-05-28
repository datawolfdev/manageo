import React from "react";

export default function EmailsGestion({ emailsData }) {
    const handleFileDownload = async (e, content, filterAbonnes = false) => {
        e.preventDefault();
        if (content.length === 0 || (content.length === 1 && !content[0])) {
            return;
        }

        if (filterAbonnes) {
            content = content.filter(row => row.receive);
        }

        let csvContent = "\uFEFF";
        const headers = ["Nom de la société", "SIRET", "Nom", "Prenom", "Genre", "Email", "Abonne", "Role", "Date d'ajouts", "Date de désinscription", "Lieux de collecte", "Famille"].join(";");
        csvContent += headers + "\r\n";
        content.forEach(row => {
            const rowData = [
                `"${row.company_name}"`,
                `"${row.siret}"`,
                `"${row.nom}"`,
                `"${row.prenom}"`,
                `"${row.gender}"`,
                `"${row.email}"`,
                `"${row.receive}"`,
                `"${row.contact_type}"`,
                `"${row.added_at ? new Date(row.added_at).toLocaleString() : ''}"`,
                `"${row.deactivated_at ? new Date(row.deactivated_at).toLocaleString() : ''}"`,
                `"${row.collecte}"`,
                `"${row.famille.join(',')}"`
            ].join(";");
            csvContent += rowData + "\r\n";
        });
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);

        const currentDate = new Date();
        const formattedDate = currentDate.toLocaleString('fr-FR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }).replace(/[:/]/g, '-').replace(' ', '_');

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `emails_${filterAbonnes ? 'abonnes_' : ''}${formattedDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className={`overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 border border-gray-200 rounded-lg p-8 md:p-12 col-span-6 row-span-7`}>
                <h2 className={`text-white text-3xl font-extrabold mb-2 p-1`}>Listes des emails</h2>
                <div className="mb-4 flex gap-4">
                    <button
                        className="px-4 py-2 bg-cyan-500 text-white rounded"
                        onClick={(e) => handleFileDownload(e, emailsData)}
                    >
                        Télécharger CSV
                    </button>
                    <button
                        className="px-4 py-2 bg-green-500 text-white rounded"
                        onClick={(e) => handleFileDownload(e, emailsData, true)}
                    >
                        Télécharger Abonnés
                    </button>
                </div>
                <div className={`relative max-h-96 overflow-y-auto overflow-x-auto shadow-md sm:rounded-lg`}>
                    <table className={`w-full text-sm text-left rtl:text-right text-gray-100`}>
                        <thead className={`text-xs text-gray-200 uppercase bg-gray-800`}>
                            <tr>
                                <th scope="col" className={`px-6 py-3`}>SIRET</th>
                                <th scope="col" className={`px-6 py-3`}>Nom de la société</th>
                                <th scope="col" className={`px-6 py-3`}>Nom</th>
                                <th scope="col" className={`px-6 py-3`}>Prenom</th>
                                <th scope="col" className={`px-6 py-3`}>Genre</th>
                                <th scope="col" className={`px-6 py-3`}>Email</th>
                                <th scope="col" className={`px-6 py-3`}>Abonné</th>
                                <th scope="col" className={`px-6 py-3`}>Rôle</th>
                                <th scope="col" className={`px-6 py-3`}>Date d'ajout</th>
                                <th scope="col" className={`px-6 py-3`}>Date de désinscription</th>
                                <th scope="col" className={`px-6 py-3`}>Lieux de collecte</th>
                                <th scope="col" className={`px-6 py-3`}>Famille</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emailsData && emailsData.map((element) => (
                                <tr key={element.id} className={`bg-gray-700 border-b hover:overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900`}>
                                    <td className={`px-6 py-4 font-medium text-white whitespace-nowrap`}>
                                        {element.siret}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.company_name}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.nom}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.prenom}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.gender}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.email}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.receive ? 'Oui' : 'Non'}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.contact_type}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.added_at ? new Date(element.added_at).toLocaleString() : ''}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.deactivated_at ? new Date(element.deactivated_at).toLocaleString() : 'Aucune'}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.collecte}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.famille.join(',')}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={`h-2 w-full bg-gradient-to-l via-cyan-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0`}></div>
                <div className={`h-0.5 group-hover:w-full bg-gradient-to-l via-cyan-950 group-hover:via-cyan-500 w-[70%] m-auto rounded transition-all`}></div>
            </div>
        </div>
    );
}
