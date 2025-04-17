import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Ce composant facilite le remplissage automatique des variables de template
// en utilisant des données du système (entreprise, offre, candidature, etc.)
const AutoVariableFill = ({
                              variables,
                              applicationId,
                              companyId,
                              offerId,
                              onApplyValues
                          }) => {
    const [loading, setLoading] = useState(false);
    const [autoFillValues, setAutoFillValues] = useState({});
    const [applicationData, setApplicationData] = useState(null);
    const [companyData, setCompanyData] = useState(null);
    const [offerData, setOfferData] = useState(null);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        if (variables && variables.length > 0) {
            fetchRelevantData();
        }
    }, [variables, applicationId, companyId, offerId]);

    const fetchRelevantData = async () => {
        setLoading(true);
        try {
            // Déterminons quelles données nous devons chercher
            const needsApplication = variables.some(v =>
                v.key.toLowerCase().includes('candidature') ||
                v.key.toLowerCase().includes('application')
            );

            const needsCompany = variables.some(v =>
                v.key.toLowerCase().includes('entreprise') ||
                v.key.toLowerCase().includes('company') ||
                v.key.toLowerCase().includes('societe')
            );

            const needsOffer = variables.some(v =>
                v.key.toLowerCase().includes('offre') ||
                v.key.toLowerCase().includes('offer') ||
                v.key.toLowerCase().includes('poste')
            );

            const needsUser = variables.some(v =>
                v.key.toLowerCase().includes('utilisateur') ||
                v.key.toLowerCase().includes('user') ||
                v.key.toLowerCase().includes('candidat')
            );

            // Chargons les données nécessaires
            const requests = [];

            if (needsApplication && applicationId) {
                requests.push(
                    axios.get(`/api/applications/${applicationId}`)
                        .then(res => setApplicationData(res.data.data))
                );
            }

            if (needsCompany && companyId) {
                requests.push(
                    axios.get(`/api/companies/${companyId}`)
                        .then(res => setCompanyData(res.data.data))
                );
            }

            if (needsOffer && offerId) {
                requests.push(
                    axios.get(`/api/offers/${offerId}`)
                        .then(res => setOfferData(res.data.data))
                );
            }

            if (needsUser) {
                requests.push(
                    axios.get('/api/users/profile')
                        .then(res => setUserData(res.data.data))
                );
            }

            await Promise.all(requests);

            // Générer les valeurs de remplissage automatique
            generateAutoFillValues();
        } catch (error) {
            console.error('Erreur lors du chargement des données pour les variables:', error);
            toast.error('Erreur lors du chargement des données');
        } finally {
            setLoading(false);
        }
    };

    const generateAutoFillValues = () => {
        const values = {};

        variables.forEach(variable => {
            const key = variable.key.toLowerCase();

            // Variables liées à l'entreprise
            if (companyData) {
                if (key === 'company' || key === 'entreprise') {
                    values[variable.key] = companyData.name;
                } else if (key === 'company_address' || key === 'adresse_entreprise') {
                    const address = companyData.address;
                    values[variable.key] = address ?
                        `${address.street || ''}, ${address.postalCode || ''} ${address.city || ''}, ${address.country || ''}`.trim() : '';
                }
            }

            // Variables liées à l'offre
            if (offerData) {
                if (key === 'offer' || key === 'offre' || key === 'poste') {
                    values[variable.key] = offerData.title;
                } else if (key === 'duration' || key === 'duree') {
                    values[variable.key] = offerData.duration;
                }
            }

            // Variables liées à l'utilisateur
            if (userData) {
                if (key === 'user_name' || key === 'nom_utilisateur') {
                    values[variable.key] = `${userData.firstName} ${userData.lastName}`;
                } else if (key === 'first_name' || key === 'prenom') {
                    values[variable.key] = userData.firstName;
                } else if (key === 'last_name' || key === 'nom') {
                    values[variable.key] = userData.lastName;
                } else if (key === 'email') {
                    values[variable.key] = userData.email;
                }
            }

            // Si valeur non trouvée, laisser vide
            if (!values[variable.key]) {
                values[variable.key] = '';
            }
        });

        setAutoFillValues(values);
    };

    const handleApplyAutoFill = () => {
        onApplyValues(autoFillValues);
        toast.success('Variables remplies automatiquement');
    };

    if (!variables || variables.length === 0) {
        return null;
    }

    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
                <h5 className="text-sm font-medium text-gray-700">Remplissage automatique</h5>
                <button
                    type="button"
                    onClick={handleApplyAutoFill}
                    disabled={loading || Object.keys(autoFillValues).length === 0}
                    className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800 hover:bg-green-200"
                >
                    {loading ? 'Chargement...' : 'Appliquer les suggestions'}
                </button>
            </div>

            <div className="text-xs text-gray-500">
                {loading ? (
                    <p>Chargement des données...</p>
                ) : Object.keys(autoFillValues).length > 0 ? (
                    <ul className="list-disc pl-4 space-y-1">
                        {Object.entries(autoFillValues).map(([key, value]) => (
                            value ? (
                                <li key={key}>
                                    <span className="font-medium">{key}</span>: {value}
                                </li>
                            ) : null
                        ))}
                    </ul>
                ) : (
                    <p>Aucune suggestion disponible</p>
                )}
            </div>
        </div>
    );
};

export default AutoVariableFill;