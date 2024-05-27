import { useState } from "react";

export default function UserGestion({ users }) {
    const [userList, setUserList] = useState(users);
    const [editedUsers, setEditedUsers] = useState({});
    const [message, setMessage] = useState("");

    const handleDeleteUser = async (userId) => {
        console.log(userId);
        try {
            await fetch(`/api/admin/deleteUser`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId }),
            });
            setUserList(userList.filter(user => user.id !== userId));
        } catch (error) {
            console.error("Échec de la suppression de l'utilisateur:", error);
        }
    };

    const handleCommitChanges = async () => {
        try {
            await fetch(`/api/admin/updateUsers`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ updates: editedUsers }),
            });
            setUserList(prevState => prevState.map(user => editedUsers[user.id] ? { ...user, ...editedUsers[user.id] } : user));
            setEditedUsers({});
            setMessage("Les modifications ont été enregistrées avec succès.");
        } catch (error) {
            console.error("Échec de l'enregistrement des modifications:", error);
            setMessage("Échec de l'enregistrement des modifications.");
        }
    };

    const handleAdminChange = (userId, value) => {
        setEditedUsers(prevState => ({
            ...prevState,
            [userId]: { ...prevState[userId], admin: value === "Oui" }
        }));
    };

    const handleVerifiedChange = (userId, value) => {
        setEditedUsers(prevState => ({
            ...prevState,
            [userId]: { ...prevState[userId], verified: value === "Oui" }
        }));
    };

    return (
        <div>
            <div className="overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 border border-gray-200 rounded-lg p-8 md:p-12 col-span-6 row-span-7">
                <h2 className="text-white text-3xl font-extrabold mb-2 p-1">Gestion des Utilisateurs</h2>
                {message && <div className="mb-4 text-green-500">{message}</div>}
                <button onClick={handleCommitChanges} className="mb-4 px-4 py-2 bg-cyan-500 text-white rounded">Enregistrer les modifications</button>
                <div className="relative max-h-96 overflow-y-auto shadow-md sm:rounded-lg">
                    <table className="w-full text-sm text-left rtl:text-right text-gray-100">
                        <thead className="text-xs text-gray-200 uppercase bg-gray-800">
                            <tr>
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Vérifié</th>
                                <th className="px-6 py-3">Admin</th>
                                <th className="px-6 py-3">Date de création</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userList.map(user => (
                                <tr key={user.id} className="bg-gray-700 border-b hover:overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900">
                                    <td className="px-6 py-4">{user.id}</td>
                                    <td className="px-6 py-4">{user.email}</td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={editedUsers[user.id]?.verified ? "Oui" : (user.verified ? "Oui" : "Non")}
                                            onChange={(e) => handleVerifiedChange(user.id, e.target.value)}
                                            className="bg-gray-700 border border-gray-600 text-white p-2 rounded"
                                        >
                                            <option value="Oui">Oui</option>
                                            <option value="Non">Non</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={editedUsers[user.id]?.admin ? "Oui" : (user.admin ? "Oui" : "Non")}
                                            onChange={(e) => handleAdminChange(user.id, e.target.value)}
                                            className="bg-gray-700 border border-gray-600 text-white p-2 rounded"
                                        >
                                            <option value="Oui">Oui</option>
                                            <option value="Non">Non</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">{new Date(user.created_at).toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => handleDeleteUser(user.id)} className="text-red-500 hover:underline">Supprimer</button>
                                    </td>
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
