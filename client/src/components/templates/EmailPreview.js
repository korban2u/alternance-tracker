import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { XMarkIcon, CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

const EmailPreview = ({ template, onClose }) => {
    const [variables, setVariables] = useState({});
    const [preview, setPreview] = useState({
        subject: template.subject,
        content: template.content
    });
    const [variableInputs, setVariableInputs] = useState(
        template.variables.reduce((acc, variable) => {
            acc[variable.key] = '';
            return acc;
        }, {})
    );
    const [copied, setCopied] = useState(false);

    const handleVariableChange = (key, value) => {
        setVariableInputs({
            ...variableInputs,
            [key]: value
        });
    };

    const generatePreview = async () => {
        try {
            if (Object.keys(variableInputs).length === 0) {
                // Si pas de variables, juste mettre à jour la prévisualisation
                setPreview({
                    subject: template.subject,
                    content: template.content
                });
                return;
            }

            // Sinon, appeler l'API pour remplacer les variables
            const response = await axios.post(`/api/email-templates/${template._id}/generate`, {
                variables: variableInputs
            });

            if (response.data.success) {
                setPreview(response.data.data);
                setVariables(variableInputs);
            }
        } catch (error) {
            toast.error('Erreur lors de la génération de la prévisualisation');
            console.error(error);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text).then(
            () => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
                toast.success('Copié dans le presse-papier');
            },
            () => {
                toast.error('Erreur lors de la copie');
            }
        );
    };

    return (
        <div className="space-y-6">
            {/* Variables */}
            {template.variables && template.variables.length > 0 && (
                <div className="space-y-4">
                    <h4 className="text-sm font-medium text-gray-700">Remplir les variables</h4>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        {template.variables.map((variable, index) => (
                            <div key={index}>
                                <label htmlFor={`var-${variable.key}`} className="form-label">
                                    {variable.description || variable.key}
                                </label>
                                <input
                                    type="text"
                                    id={`var-${variable.key}`}
                                    className="form-input"
                                    placeholder={`Valeur pour ${variable.key}`}
                                    value={variableInputs[variable.key] || ''}
                                    onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={generatePreview}
                            className="btn btn-primary"
                        >
                            Générer la prévisualisation
                        </button>
                    </div>
                </div>
            )}

            {/* Prévisualisation */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium text-gray-700">Prévisualisation</h4>
                    <button
                        type="button"
                        onClick={() => copyToClipboard(`Sujet: ${preview.subject}\n\n${preview.content}`)}
                        className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                    >
                        {copied ? (
                            <>
                                <CheckIcon className="h-5 w-5 mr-1 text-green-500" />
                                Copié!
                            </>
                        ) : (
                            <>
                                <ClipboardDocumentIcon className="h-5 w-5 mr-1" />
                                Copier
                            </>
                        )}
                    </button>
                </div>
                <div className="border rounded-md p-4 bg-gray-50">
                    <div className="border-b pb-2 mb-2">
                        <p className="text-sm font-medium text-gray-900">
                            <span className="text-gray-500">Sujet:</span> {preview.subject}
                        </p>
                    </div>
                    <div className="prose max-w-none text-sm whitespace-pre-line">
                        {preview.content}
                    </div>
                </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={onClose}
                    className="btn btn-secondary"
                >
                    Fermer
                </button>
            </div>
        </div>
    );
};

export default EmailPreview;