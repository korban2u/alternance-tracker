import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const GmailComplete = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const completeAuth = async () => {
            // Récupérer le sessionId de l'URL
            const searchParams = new URLSearchParams(location.search);
            const sessionId = searchParams.get('sessionId');

            if (!sessionId) {
                setError('Session ID manquant. Authentification échouée.');
                setLoading(false);
                return;
            }

            try {
                // Appeler l'API pour finaliser l'authentification
                const response = await axios.post('/api/gmail/auth/complete', { sessionId });

                if (response.data.success) {
                    toast.success('Connexion à Gmail réussie !');
                    // Rediriger vers la page de profil après 2 secondes
                    setTimeout(() => navigate('/profile'), 2000);
                } else {
                    setError('Erreur lors de la finalisation de l\'authentification.');
                }
            } catch (error) {
                console.error('Erreur lors de la finalisation de l\'authentification Gmail:', error);
                setError(error.response?.data?.message || 'Erreur lors de la connexion à Gmail');
            } finally {
                setLoading(false);
            }
        };

        completeAuth();
    }, [location, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Connexion Gmail
                    </h2>
                </div>
                <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center">
                            <ArrowPathIcon className="h-12 w-12 animate-spin text-primary-500" />
                            <p className="mt-4 text-lg text-gray-700">Finalisation de la connexion Gmail...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                                <EnvelopeIcon className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">Échec de la connexion</h3>
                            <p className="mt-2 text-sm text-gray-500">{error}</p>
                            <div className="mt-5">
                                <button
                                    onClick={() => navigate('/profile')}
                                    className="btn btn-primary"
                                >
                                    Retour au profil
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                                <EnvelopeIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="mt-3 text-lg font-medium text-gray-900">Connexion réussie</h3>
                            <p className="mt-2 text-sm text-gray-500">
                                Vous êtes maintenant connecté à Gmail. Redirection en cours...
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GmailComplete;