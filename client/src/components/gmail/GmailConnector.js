import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { EnvelopeIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const GmailConnector = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [connectedEmail, setConnectedEmail] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/gmail/auth/status');

            if (response.data.success) {
                setIsConnected(response.data.data.isConnected);
                if (response.data.data.isConnected) {
                    setConnectedEmail(response.data.data.email);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la vérification du statut d\'authentification:', error);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/gmail/auth/url');

            if (response.data.success) {
                // Ouvrir la fenêtre d'authentification Google
                window.location.href = response.data.data.authUrl;
            }
        } catch (error) {
            console.error('Erreur lors de la connexion à Gmail:', error);
            toast.error('Erreur lors de la connexion à Gmail');
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        try {
            setLoading(true);
            const response = await axios.delete('/api/gmail/auth');

            if (response.data.success) {
                setIsConnected(false);
                setConnectedEmail('');
                toast.success('Déconnexion de Gmail réussie');
            }
        } catch (error) {
            console.error('Erreur lors de la déconnexion de Gmail:', error);
            toast.error('Erreur lors de la déconnexion de Gmail');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Connexion Gmail</h2>

            {loading ? (
                <div className="flex items-center justify-center">
                    <ArrowPathIcon className="h-5 w-5 animate-spin text-primary-500" />
                    <span className="ml-2 text-sm text-gray-500">Vérification de la connexion...</span>
                </div>
            ) : isConnected ? (
                <div>
                    <div className="flex items-center mb-4">
                        <EnvelopeIcon className="h-5 w-5 text-green-500 mr-2" />
                        <p className="text-sm text-gray-700">
                            Connecté à <span className="font-medium">{connectedEmail}</span>
                        </p>
                    </div>
                    <button
                        onClick={handleDisconnect}
                        className="btn btn-secondary w-full"
                    >
                        Déconnecter Gmail
                    </button>
                </div>
            ) : (
                <div>
                    <p className="text-sm text-gray-500 mb-4">
                        Connectez-vous à votre compte Gmail pour envoyer des emails directement depuis l'application.
                    </p>
                    <button
                        onClick={handleConnect}
                        className="btn btn-primary w-full flex justify-center items-center"
                    >
                        <EnvelopeIcon className="h-5 w-5 mr-2" />
                        Connecter Gmail
                    </button>
                </div>
            )}
        </div>
    );
};

export default GmailConnector;