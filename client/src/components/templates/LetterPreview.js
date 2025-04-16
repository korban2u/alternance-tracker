import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { XMarkIcon, CheckIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { jsPDF } from 'jspdf';

const LetterPreview = ({ template, onClose }) => {
    const [variables, setVariables] = useState({});
    const [preview, setPreview] = useState({
        content: template.content,
        structure: template.structure
    });
    const [variableInputs, setVariableInputs] = useState(
        template.variables.reduce((acc, variable) => {
            acc[variable.key] = '';
            return acc;
        }, {})
    );
    const [copied, setCopied] = useState(false);
    const [companyName, setCompanyName] = useState('');
    const [offerTitle, setOfferTitle] = useState('');

    const handleVariableChange = (key, value) => {
        setVariableInputs({
            ...variableInputs,
            [key]: value
        });
    };

    const generatePreview = async () => {
        try {
            // Si pas de variables, utiliser la version originale
            if (Object.keys(variableInputs).every(key => variableInputs[key] === '')) {
                setPreview({
                    content: template.content,
                    structure: template.structure
                });
                return;
            }

            // Sinon, appeler l'API pour remplacer les variables
            const response = await axios.post(`/api/letter-templates/${template._id}/generate`, {
                variables: variableInputs,
                company: { name: companyName },
                offer: { title: offerTitle }
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

    const exportToPDF = () => {
        try {
            const doc = new jsPDF();

            // Configurer la police
            doc.setFont('helvetica');
            doc.setFontSize(11);

            // Format du contenu
            let content = preview.content;

            // Si on a une structure, l'utiliser pour formater le PDF
            if (preview.structure && Object.values(preview.structure).some(Boolean)) {
                const { header, introduction, body, conclusion, signature } = preview.structure;

                // Ajouter les sections avec formatage
                if (header) {
                    doc.setFontSize(10);
                    doc.text(header, 20, 20);
                    doc.setFontSize(11);
                }

                let yPosition = header ? 60 : 20;

                if (introduction) {
                    doc.text(introduction, 20, yPosition);
                    yPosition += (introduction.split('\n').length + 2) * 7;
                }

                if (body) {
                    doc.text(body, 20, yPosition);
                    yPosition += (body.split('\n').length + 2) * 7;
                }

                if (conclusion) {
                    doc.text(conclusion, 20, yPosition);
                    yPosition += (conclusion.split('\n').length + 2) * 7;
                }

                if (signature) {
                    doc.text(signature, 20, yPosition);
                }
            } else {
                // Sinon, simplement ajouter le contenu complet
                doc.text(content, 20, 20);
            }

            // Générer un nom de fichier
            const fileName = template.name.replace(/\s+/g, '_').toLowerCase() + '_lettre';

            // Télécharger le PDF
            doc.save(`${fileName}.pdf`);
            toast.success('Lettre exportée en PDF avec succès');
        } catch (error) {
            toast.error('Erreur lors de l\'export en PDF');
            console.error(error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Informations de candidature */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                    <label htmlFor="companyName" className="form-label">Nom de l'entreprise</label>
                    <input
                        type="text"
                        id="companyName"
                        className="form-input"
                        placeholder="Nom de l'entreprise"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="offerTitle" className="form-label">Titre du poste</label>
                    <input
                        type="text"
                        id="offerTitle"
                        className="form-input"
                        placeholder="Titre du poste"
                        value={offerTitle}
                        onChange={(e) => setOfferTitle(e.target.value)}
                    />
                </div>
            </div>

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
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => copyToClipboard(preview.content)}
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
                        <button
                            type="button"
                            onClick={exportToPDF}
                            className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
                        >
                            Exporter en PDF
                        </button>
                    </div>
                </div>
                <div className="border rounded-md p-4 bg-gray-50 font-mono text-sm whitespace-pre-line overflow-auto max-h-96">
                    {preview.content || (
                        <>
                            {preview.structure.header && <div className="mb-4">{preview.structure.header}</div>}
                            {preview.structure.introduction && <div className="mb-4">{preview.structure.introduction}</div>}
                            {preview.structure.body && <div className="mb-4">{preview.structure.body}</div>}
                            {preview.structure.conclusion && <div className="mb-4">{preview.structure.conclusion}</div>}
                            {preview.structure.signature && <div>{preview.structure.signature}</div>}
                        </>
                    )}
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

export default LetterPreview;