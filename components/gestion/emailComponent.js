import React from "react";

export default function EmailsGestion({ emailsData }) {
    const handleFileDownload = async (e, content) => {
        e.preventDefault();
        if (content.length === 0 || (content.length === 1 && !content[0])) {
            return;
        }
        let csvContent = "\uFEFF";
        const headers = ["Email", "Abonne", "Role", "Date d'ajouts", "Date de désinscription"].join(";");
        csvContent += headers + "\r\n";
        content.forEach(row => {
            const rowData = [
                `"${row.email}"`,
                `"${row.receive}"`,
                `"${row.contact_type}"`,
                `"${row.added_at ? new Date(row.added_at).toLocaleString() : ''}"`,
                `"${row.deactivated_at ? new Date(row.deactivated_at).toLocaleString() : ''}"`
            ].join(";");
            csvContent += rowData + "\r\n";
        });
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "emails.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div>
            <div className={`overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 border border-gray-200 rounded-lg p-8 md:p-12 col-span-6 row-span-7`}>
                <h2 className={`text-white text-3xl font-extrabold mb-2 p-1`}>Listes des emails</h2>
                <button
                    className="mb-4 px-4 py-2 bg-cyan-500 text-white rounded"
                    onClick={(e) => handleFileDownload(e, emailsData)}
                >
                    Télécharger CSV
                </button>
                <div className={`relative max-h-96 overflow-y-auto overflow-x-hidden shadow-md sm:rounded-lg`}>
                    <table className={`w-full text-sm text-left rtl:text-right text-gray-100`}>
                        <thead className={`text-xs text-gray-200 uppercase bg-gray-800`}>
                            <tr>
                                <th scope="col" className={`px-6 py-3`}>Email</th>
                                <th scope="col" className={`px-6 py-3`}>Abonné</th>
                                <th scope="col" className={`px-6 py-3`}>Rôle</th>
                                <th scope="col" className={`px-6 py-3`}>Date d'ajout</th>
                                <th scope="col" className={`px-6 py-3`}>Date de désinscription</th>
                            </tr>
                        </thead>
                        <tbody>
                            {emailsData && emailsData.map((element) => (
                                <tr key={element.id} className={`bg-gray-700 border-b hover:overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900`}>
                                    <th scope="row" className={`px-6 py-4 font-medium text-white whitespace-nowrap`}>
                                        {element.email}
                                    </th>
                                    <td className={`px-6 py-4`}>
                                        {element.receive ? 'Oui' : 'Non'}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {element.contact_type}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {new Date(element.added_at).toLocaleString()}
                                    </td>
                                    <td className={`px-6 py-4`}>
                                        {new Date(element.deactivated_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className={`h-2 w-full bg-gradient-to-l via-cyan-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0`}></div>
                <div className={`h-0.5 group-hover:w-full bg-gradient-to-l  via-cyan-950 group-hover:via-cyan-500 w-[70%] m-auto rounded transition-all`}></div>
            </div>
        </div>
    );
}
