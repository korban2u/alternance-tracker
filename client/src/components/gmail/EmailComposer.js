import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    PaperAirplaneIcon,
    DocumentTextIcon,
    XMarkIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

const EmailComposer = ({
                           initialTo = '',
                           initialSubject = '',
                           initialBody = '',
                           applicationId = null,
                           companyId = null,
                           onClose,
                           onSent
                       }) => {
    const [emailData, setEmailData] = useState({
        to: initialTo,
        cc: '',
        bcc: '',
        subject: initialSubject,
        body: initialBody,
        isHtml: false
    });
    const [showCcBcc, setShowCcBcc] = useState(false);
    const [loading, setLoading] = useState(false);
    const [gmailConnected, setGmailConnected] = useState(false);
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [companyContacts, setCompanyContacts] = useState([]);
    const [checkingConnection, setCheckingConnection] = useState(true);

    useEffect(() => {
        checkGmailConnection();
        fetchTemplates();

        if (companyId) {
            fetchCompanyContacts();
        }
    }, [companyId]);

    const checkGmailConnection = async () => {
        try {
            setCheckingConnection(true);
            const response = await axios.get('/api/gmail/auth/status');

            if (response.data.success) {
                setGmailConnected(response.data.data.isConnected);
            }
        } catch (error) {
            console.error('Erreur lors de la vérification de la connexion Gmail:', error);
            setGmailConnected(false);
        } finally {
            setCheckingConnection(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const response = await axios.get('/api/email-templates');

            if (response.data.success) {
                setTemplates(response.data.data);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des templates:', error);
        }
    };

    const fetchCompanyContacts = async () => {
        try {
            const response = await axios.get(`/api/companies/${companyId}`);

            if (response.data.success && response.data.data.contacts) {
                setCompanyContacts(response.data.data.contacts);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des contacts:', error);
        }
    };

    const handleTemplateChange = async (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);

        if (!templateId) return;

        try {
            const response = await axios.get(`/api/email-templates/${templateId}`);

            if (response.data.success) {
                const template = response.data.data;

                // Préparer un objet avec les variables à remplacer si nécessaire
                let variables = {};

                // Générer le contenu avec les variables
                if (template.variables && template.variables.length > 0) {
                    // Ici, vous pourriez implémenter une logique pour collecter les valeurs des variables
                    // Pour l'instant, on utilise simplement le template brut
                }

                setEmailData({
                    ...emailData,
                    subject: template.subject,
                    body: template.content,
                    isHtml: template.content.includes('<') && template.content.includes('>')
                });
            }
        } catch (error) {
            console.error('Erreur lors du chargement du template:', error);
        }
    };

    const handleContactSelect = (e) => {
        const contactEmail = e.target.value;
        if (contactEmail) {
            setEmailData({
                ...emailData,
                to: contactEmail
            });
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEmailData({
            ...emailData,
            [name]: value
        });
    };

    const handleToggleCcBcc = () => {
        setShowCcBcc(!showCcBcc);
    };

    const handleConnectGmail = async () => {
        try {
            const response = await axios.get('/api/gmail/auth/url');

            if (response.data.success) {
                window.location.href = response.data.data.authUrl;
            }
        } catch (error) {
            console.error('Erreur lors de la connexion à Gmail:', error);
            toast.error('Erreur lors de la connexion à Gmail');
        }
    };

    const handleSendEmail = async () => {
        if (!emailData.to) {
            toast.error('Veuillez spécifier au moins un destinataire');
            return;
        }

        if (!emailData.subject || !emailData.body) {
            toast.error('Le sujet et le contenu sont requis');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/gmail/send', {
                ...emailData,
                applicationId
            });

            if (response.data.success) {
                toast.success('Email envoyé avec succès');
                if (onSent) onSent();
                if (onClose) onClose();
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi de l\'email:', error);
            toast.error('Erreur lors de l\'envoi de l\'email');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveDraft = async () => {
        if (!emailData.subject && !emailData.body) {
            toast.error('Le sujet ou le contenu est requis');
            return;
        }

        try {
            setLoading(true);
            const response = await axios.post('/api/gmail/draft', {
                ...emailData,
                applicationId
            });

            if (response.data.success) {
                toast.success('Brouillon enregistré avec succès');
                if (onSent) onSent();
                if (onClose) onClose();
            }
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du brouillon:', error);
            toast.error('Erreur lors de l\'enregistrement du brouillon');
        } finally {
            setLoading(false);
        }
    };

    if (checkingConnection) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
                    <div className="text-center py-4">
                        <ArrowPathIcon className="h-8 w-8 animate-spin text-primary-500 mx-auto" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900">Vérification de la connexion Gmail...</h3>
                    </div>
                </div>
            </div>
        );
    }

    if (!gmailConnected) {
        return (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                    <div className="text-center">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Connexion à Gmail requise</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Pour envoyer des emails, vous devez d'abord connecter votre compte Gmail.
                        </p>
                        <div className="flex justify-between mt-4">
                            <button
                                onClick={onClose}
                                className="btn btn-secondary"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleConnectGmail}
                                className="btn btn-primary"
                            >
                                Connecter Gmail
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
                {/* En-tête */}
                <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Composer un email</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-500"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Corps */}
                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-4">
                        {/* Templates et contacts */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div>
                                <label htmlFor="template" className="form-label">Utiliser un template</label>
                                <select
                                    id="template"
                                    name="template"
                                    className="form-input"
                                    value={selectedTemplate}
                                    onChange={handleTemplateChange}
                                >
                                    <option value="">Sélectionner un template</option>
                                    {templates.map(template => (
                                        <option key={template._id} value={template._id}>
                                            {template.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {companyContacts.length > 0 && (
                                <div>
                                    <label htmlFor="contact" className="form-label">Contact de l'entreprise</label>
                                    <select
                                        id="contact"
                                        className="form-input"
                                        onChange={handleContactSelect}
                                    >
                                        <option value="">Sélectionner un contact</option>
                                        {companyContacts.map((contact, index) => (
                                            <option key={index} value={contact.email}>
                                                {contact.name} - {contact.role || 'Contact'}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Destinataires */}
                        <div>
                            <div className="flex items-center justify-between">
                                <label htmlFor="to" className="form-label">À</label>
                                <button
                                    type="button"
                                    onClick={handleToggleCcBcc}
                                    className="text-sm text-primary-600 hover:text-primary-500"
                                >
                                    {showCcBcc ? (
                                        <span className="flex items-center">
                                            <ChevronUpIcon className="h-4 w-4 mr-1" />
                                            Masquer Cc/Cci
                                        </span>
                                    ) : (
                                        <span className="flex items-center">
                                            <ChevronDownIcon className="h-4 w-4 mr-1" />
                                            Afficher Cc/Cci
                                        </span>
                                    )}
                                </button>
                            </div>
                            <input
                                type="text"
                                id="to"
                                name="to"
                                className="form-input"
                                placeholder="example@example.com"
                                value={emailData.to}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Cc et Cci */}
                        {showCcBcc && (
                            <>
                                <div>
                                    <label htmlFor="cc" className="form-label">Cc</label>
                                    <input
                                        type="text"
                                        id="cc"
                                        name="cc"
                                        className="form-input"
                                        placeholder="example@example.com"
                                        value={emailData.cc}
                                        onChange={handleInputChange}
                                    />
                                </div>
                                <div>
                                    <label htmlFor="bcc" className="form-label">Cci</label>
                                    <input
                                        type="text"
                                        id="bcc"
                                        name="bcc"
                                        className="form-input"
                                        placeholder="example@example.com"
                                        value={emailData.bcc}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </>
                        )}

                        {/* Sujet */}
                        <div>
                            <label htmlFor="subject" className="form-label">Sujet</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                className="form-input"
                                placeholder="Sujet de l'email"
                                value={emailData.subject}
                                onChange={handleInputChange}
                            />
                        </div>

                        {/* Corps de l'email */}
                        <div>
                            <label htmlFor="body" className="form-label">Message</label>
                            <textarea
                                id="body"
                                name="body"
                                rows="12"
                                className="form-input font-sans"
                                placeholder="Contenu de l'email..."
                                value={emailData.body}
                                onChange={handleInputChange}
                            ></textarea>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                    <button
                        onClick={handleSaveDraft}
                        className="btn btn-secondary flex items-center"
                        disabled={loading}
                    >
                        <DocumentTextIcon className="h-5 w-5 mr-2" />
                        {loading ? 'Enregistrement...' : 'Enregistrer comme brouillon'}
                    </button>
                    <button
                        onClick={handleSendEmail}
                        className="btn btn-primary flex items-center"
                        disabled={loading}
                    >
                        <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                        {loading ? 'Envoi en cours...' : 'Envoyer'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EmailComposer;