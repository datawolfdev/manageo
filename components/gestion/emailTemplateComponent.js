import { useState } from 'react';
import axios from 'axios';

export default function EmailTemplateGestion({ templates }) {
    const [templatesList, setTemplatesList] = useState(templates);
    const [message, setMessage] = useState('');

    const handleSelectTemplate = async (templateId) => {
        try {
            const response = await axios.post('/api/admin/selectTemplate', { templateId });
            setMessage(response.data.message);
            setTemplatesList(templatesList.map(template => ({
                ...template,
                selected: template.id === templateId,
            })));
        } catch (error) {
            setMessage('Erreur lors de la mise à jour du modèle sélectionné.');
        }
    };

    const handlePreviewTemplate = () => {
        const selectedTemplate = templatesList.find(template => template.selected);
        if (selectedTemplate) {
            window.open(`/api/admin/previewTemplate?id=${selectedTemplate.id}`, '_blank');
        } else {
            setMessage('Veuillez sélectionner un modèle à prévisualiser.');
        }
    };

    return (
        <div className={`overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900 border border-gray-200 rounded-lg p-8 md:p-12 col-span-6 row-span-7`}>
            <h2 className={`text-white text-3xl font-extrabold mb-2 p-1`}>Liste des modèles</h2>
            <button
                className="mb-4 px-4 py-2 bg-cyan-500 text-white rounded"
                onClick={handlePreviewTemplate}
            >
                Aperçu du modèle actuel
            </button>
            {message && <p className="text-green-500 mb-4">{message}</p>}
            <div className={`relative max-h-96 overflow-y-auto overflow-x-hidden shadow-md sm:rounded-lg`}>
                <table className={`w-full text-sm text-left rtl:text-right text-gray-100`}>
                    <thead className={`text-xs text-gray-200 uppercase bg-gray-800`}>
                        <tr>
                            <th scope="col" className={`px-6 py-3`}>Nom</th>
                            <th scope="col" className={`px-6 py-3`}>Sujet</th>
                            <th scope="col" className={`px-6 py-3`}>Date de création</th>
                            <th scope="col" className={`px-6 py-3`}>Sélectionné</th>
                        </tr>
                    </thead>
                    <tbody>
                        {templatesList.map(template => (
                            <tr key={template.id} className={`bg-gray-700 border-b hover:overflow-hidden relative group bg-gradient-to-tl from-gray-900 to-gray-950 hover:from-gray-800 hover:to-gray-950 border-r-2 border-t-2 border-gray-900`}>
                                <td className={`px-6 py-4`}>{template.name}</td>
                                <td className={`px-6 py-4`}>{template.subject}</td>
                                <td className={`px-6 py-4`}>{new Date(template.created_at).toLocaleString()}</td>
                                <td className={`px-6 py-4`}>
                                    <button
                                        onClick={() => handleSelectTemplate(template.id)}
                                        className={`px-4 py-2 text-white rounded ${template.selected ? 'bg-green-500 cursor-not-allowed' : 'bg-cyan-500'}`}
                                    >
                                        {template.selected ? 'Sélectionné' : 'Sélectionner'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={`h-2 w-full bg-gradient-to-l via-cyan-500 group-hover:blur-xl blur-2xl m-auto rounded transition-all absolute bottom-0`}></div>
            <div className={`h-0.5 group-hover:w-full bg-gradient-to-l  via-cyan-950 group-hover:via-cyan-500 w-[70%] m-auto rounded transition-all`}></div>
        </div>
    );
}
