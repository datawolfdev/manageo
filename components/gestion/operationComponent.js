export default function OperationsTable({ operations }) {
    const totalSiret = operations.reduce((sum, operation) => sum + operation.siret_count, 0);
    const totalCompany = operations.reduce((sum, operation) => sum + operation.company_count, 0);
    const totalEmail = operations.reduce((sum, operation) => sum + operation.email_count, 0);

    return (
        <div className="overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 border border-gray-200 rounded-lg p-8 md:p-12 col-span-6 row-span-7">
            <h2 className="text-white text-3xl font-extrabold mb-2 p-1">Liste des opérations</h2>
            <div className="relative max-h-96 overflow-y-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-100">
                    <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Nombre de SIRET</th>
                            <th className="px-6 py-3">Nombre de sociétés</th>
                            <th className="px-6 py-3">Nombre d'emails</th>
                            <th className="px-6 py-3">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {operations.map((operation) => (
                            <tr key={operation.id} className="bg-gray-700 border-b hover:overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900">
                                <td className="px-6 py-4">{operation.id}</td>
                                <td className="px-6 py-4">{operation.siret_count}</td>
                                <td className="px-6 py-4">{operation.company_count}</td>
                                <td className="px-6 py-4">{operation.email_count}</td>
                                <td className="px-6 py-4">{new Date(operation.created_at).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="text-xs text-gray-200 uppercase bg-gray-800">
                        <tr>
                            <td className="px-6 py-3 font-bold">Total</td>
                            <td className="px-6 py-3 font-bold">{totalSiret}</td>
                            <td className="px-6 py-3 font-bold">{totalCompany}</td>
                            <td className="px-6 py-3 font-bold">{totalEmail}</td>
                            <td className="px-6 py-3 font-bold"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            <div className="h-2 w-full bg-gradient-to-l via-cyan-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0"></div>
            <div className="h-0.5 group-hover:w-full bg-gradient-to-l via-cyan-950 group-hover:via-cyan-500 w-[70%] m-auto rounded transition-all"></div>
        </div>
    );
}
