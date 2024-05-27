import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Unsubscribe() {
    const [message, setMessage] = useState('');
    const router = useRouter();
    const { uuid } = router.query;

    const handleUnsubscribe = async () => {
        if (!uuid) {
            setMessage('Demande invalide.');
            return;
        }

        try {
            const response = await fetch('/api/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uuid }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage('Vous vous êtes désabonné avec succès.');
            } else {
                setMessage(data.message || 'Une erreur s\'est produite.');
            }
        } catch (error) {
            console.error('Erreur:', error);
            setMessage('Une erreur s\'est produite lors du traitement de votre demande.');
        }
    };

    return (
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 overflow-auto h-full flex items-center justify-center">
            <div className="bg-gray-800 p-8 rounded shadow-md text-center">
                <h2 className="text-2xl mb-4">Désabonnement</h2>
                <p className="mb-4">Êtes-vous sûr de vouloir vous désabonner ?</p>
                <button
                    onClick={handleUnsubscribe}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                    Se désabonner
                </button>
                {message && <p className="mt-4 text-green-500">{message}</p>}
            </div>
        </div>
    );
}
