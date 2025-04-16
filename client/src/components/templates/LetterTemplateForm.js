import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const LetterTemplateForm = ({ initialData, onSubmit, onCancel }) => {
    const [variables, setVariables] = useState(initialData?.variables || []);
    const [variableKey, setVariableKey] = useState('');
    const [variableDesc, setVariableDesc] = useState('');
    const [tags, setTags] = useState(initialData?.tags || []);
    const [tagInput, setTagInput] = useState('');

    // Déterminer si on doit afficher l'édition par structure ou par texte complet
    const [editMode, setEditMode] = useState(initialData?.content ? 'full' : 'structured');

    const formik = useFormik({
        initialValues: {
            name: initialData?.name || '',
            content: initialData?.content || '',
            structure: {
                header: initialData?.structure?.header || '',
                introduction: initialData?.structure?.introduction || '',
                body: initialData?.structure?.body || '',
                conclusion: initialData?.structure?.conclusion || '',
                signature: initialData?.structure?.signature || ''
            },
            isDefault: initialData?.isDefault || false
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Le nom est requis'),
            content: Yup.string().when('editMode', {
                is: 'full',
                then: Yup.string().required('Le contenu est requis'),
                otherwise: Yup.string()
            }),
            structure: Yup.object({
                header: Yup.string(),
                introduction: Yup.string().when('editMode', {
                    is: 'structured',
                    then: Yup.string().required('L\'introduction est requise'),
                    otherwise: Yup.string()
                }),
                body: Yup.string().when('editMode', {
                    is: 'structured',
                    then: Yup.string().required('Le corps du texte est requis'),
                    otherwise: Yup.string()
                }),
                conclusion: Yup.string().when('editMode', {
                    is: 'structured',
                    then: Yup.string().required('La conclusion est requise'),
                    otherwise: Yup.string()
                }),
                signature: Yup.string()
            }),
            isDefault: Yup.boolean()
        }),
        onSubmit: (values) => {
            // Déterminer le contenu final en fonction du mode d'édition
            let finalContent = values.content;

            if (editMode === 'structured') {
                // Construire le contenu à partir de la structure
                finalContent = [
                    values.structure.header,
                    values.structure.introduction,
                    values.structure.body,
                    values.structure.conclusion,
                    values.structure.signature
                ].filter(Boolean).join('\n\n');
            }

            // Inclure les variables et tags dans les données soumises
            const formattedValues = {
                ...values,
                content: finalContent,
                variables,
                tags
            };

            onSubmit(formattedValues);
        }
    });

    const addVariable = () => {
        if (variableKey.trim() === '') return;

        const newVariable = {
            key: variableKey.trim(),
            description: variableDesc.trim() || 'Variable'
        };

        setVariables([...variables, newVariable]);
        setVariableKey('');
        setVariableDesc('');
    };

    const removeVariable = (index) => {
        const updatedVariables = [...variables];
        updatedVariables.splice(index, 1);
        setVariables(updatedVariables);
    };

    const addTag = () => {
        if (tagInput.trim() === '' || tags.includes(tagInput.trim())) return;

        setTags([...tags, tagInput.trim()]);
        setTagInput('');
    };

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    const insertVariable = (key, field) => {
        // Si on est en mode d'édition structuré
        if (editMode === 'structured') {
            const textarea = document.getElementById(field);
            const cursorPos = textarea.selectionStart;
            const textBefore = formik.values.structure[field].substring(0, cursorPos);
            const textAfter = formik.values.structure[field].substring(cursorPos);

            const newText = `${textBefore}{{${key}}}${textAfter}`;

            formik.setFieldValue(`structure.${field}`, newText);

            // Remettre le focus sur le textarea après l'insertion
            setTimeout(() => {
                textarea.focus();
                const newCursorPos = cursorPos + key.length + 4; // +4 pour les accolades {{}}
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
        // Si on est en mode d'édition complet
        else {
            const textarea = document.getElementById('content');
            const cursorPos = textarea.selectionStart;
            const textBefore = formik.values.content.substring(0, cursorPos);
            const textAfter = formik.values.content.substring(cursorPos);

            const newText = `${textBefore}{{${key}}}${textAfter}`;

            formik.setFieldValue('content', newText);

            // Remettre le focus sur le textarea après l'insertion
            setTimeout(() => {
                textarea.focus();
                const newCursorPos = cursorPos + key.length + 4; // +4 pour les accolades {{}}
                textarea.setSelectionRange(newCursorPos, newCursorPos);
            }, 0);
        }
    };

    const handleKeyPress = (e, type) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (type === 'variable') {
                addVariable();
            } else if (type === 'tag') {
                addTag();
            }
        }
    };

    const switchEditMode = (mode) => {
        if (mode === 'structured' && formik.values.content) {
            // Si on passe de complet à structuré, essayer de diviser le contenu
            const paragraphs = formik.values.content.split('\n\n');

            // Assignation approximative basée sur la position
            formik.setFieldValue('structure.header', paragraphs[0] || '');
            formik.setFieldValue('structure.introduction', paragraphs[1] || '');
            formik.setFieldValue('structure.body', paragraphs.slice(2, -2).join('\n\n') || '');
            formik.setFieldValue('structure.conclusion', paragraphs[paragraphs.length - 2] || '');
            formik.setFieldValue('structure.signature', paragraphs[paragraphs.length - 1] || '');
        }

        setEditMode(mode);
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
                {/* Nom du template */}
                <div>
                    <label htmlFor="name" className="form-label">Nom du template*</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className={`form-input ${formik.touched.name && formik.errors.name ? 'border-red-300' : ''}`}
                        {...formik.getFieldProps('name')}
                    />
                    {formik.touched.name && formik.errors.name && (
                        <p className="form-error">{formik.errors.name}</p>
                    )}
                </div>

                {/* Mode d'édition */}
                <div>
                    <label className="form-label">Mode d'édition</label>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => switchEditMode('structured')}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                                editMode === 'structured'
                                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                                    : 'bg-white text-gray-700 border border-gray-300'
                            }`}
                        >
                            Structure par sections
                        </button>
                        <button
                            type="button"
                            onClick={() => switchEditMode('full')}
                            className={`px-4 py-2 text-sm font-medium rounded-md ${
                                editMode === 'full'
                                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                                    : 'bg-white text-gray-700 border border-gray-300'
                            }`}
                        >
                            Texte complet
                        </button>
                    </div>
                </div>

                {/* Variables */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Variables</h4>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Nom de la variable"
                            value={variableKey}
                            onChange={(e) => setVariableKey(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, 'variable')}
                            className="form-input w-1/3"
                        />
                        <input
                            type="text"
                            placeholder="Description (optionnel)"
                            value={variableDesc}
                            onChange={(e) => setVariableDesc(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, 'variable')}
                            className="form-input w-1/2"
                        />
                        <button
                            type="button"
                            onClick={addVariable}
                            className="btn btn-secondary"
                        >
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {variables.length > 0 && (
                        <div className="mt-3">
                            <p className="text-sm text-gray-500 mb-2">Variables disponibles (cliquez pour insérer):</p>
                            <div className="flex flex-wrap gap-2">
                                {variables.map((variable, index) => (
                                    <div key={index} className="flex items-center bg-blue-50 rounded-full px-3 py-1">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const field = editMode === 'structured' ? 'introduction' : 'content';
                                                insertVariable(variable.key, field);
                                            }}
                                            className="text-blue-600 text-sm hover:text-blue-800"
                                            title={variable.description}
                                        >
                                            {variable.key}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => removeVariable(index)}
                                            className="ml-1 text-gray-400 hover:text-gray-600"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tags */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Ajouter un tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={(e) => handleKeyPress(e, 'tag')}
                            className="form-input w-full"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="btn btn-secondary"
                        >
                            <PlusIcon className="h-5 w-5" />
                        </button>
                    </div>

                    {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {tags.map((tag, index) => (
                                <div key={index} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                                    <span className="text-gray-700 text-sm">{tag}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeTag(tag)}
                                        className="ml-1 text-gray-400 hover:text-gray-600"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Contenu de la lettre - Mode d'édition complet */}
                {editMode === 'full' && (
                    <div>
                        <label htmlFor="content" className="form-label">Contenu de la lettre*</label>
                        <textarea
                            id="content"
                            name="content"
                            rows="18"
                            className={`form-input font-mono ${formik.touched.content && formik.errors.content ? 'border-red-300' : ''}`}
                            {...formik.getFieldProps('content')}
                        ></textarea>
                        {formik.touched.content && formik.errors.content && (
                            <p className="form-error">{formik.errors.content}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">
                            Utilisez les variables entre doubles accolades, par exemple: {"{{"}variable{"}}"}
                        </p>
                    </div>
                )}

                {/* Contenu de la lettre - Mode d'édition par structure */}
                {editMode === 'structured' && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="header" className="form-label">En-tête (coordonnées, date, etc.)</label>
                            <textarea
                                id="header"
                                name="structure.header"
                                rows="3"
                                className="form-input font-mono"
                                {...formik.getFieldProps('structure.header')}
                            ></textarea>
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                        const today = new Date();
                                        const defaultHeader = `[Votre Prénom NOM]\n[Votre adresse]\n[Votre email] | [Votre téléphone]\n\n[Ville], le ${today.toLocaleDateString('fr-FR')}`;
                                        formik.setFieldValue('structure.header', defaultHeader);
                                    }}
                                >
                                    Insérer un modèle
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="introduction" className="form-label">Introduction*</label>
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="text-xs text-gray-500">Variables:</p>
                                {variables.map((variable, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => insertVariable(variable.key, 'introduction')}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                        title={variable.description}
                                    >
                                        {variable.key}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                id="introduction"
                                name="structure.introduction"
                                rows="4"
                                className={`form-input font-mono ${formik.touched.structure?.introduction && formik.errors.structure?.introduction ? 'border-red-300' : ''}`}
                                {...formik.getFieldProps('structure.introduction')}
                            ></textarea>
                            {formik.touched.structure?.introduction && formik.errors.structure?.introduction && (
                                <p className="form-error">{formik.errors.structure.introduction}</p>
                            )}
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                        const defaultIntro = "Madame, Monsieur,\n\nActuellement étudiant(e) en {{formation}}, je suis à la recherche d'une alternance dans le domaine {{domaine}} pour une durée de {{duree}} à partir de {{date_debut}}.";
                                        formik.setFieldValue('structure.introduction', defaultIntro);
                                    }}
                                >
                                    Insérer un modèle
                                </button>
                            </div>
                        </div>

                        <div>
                            <label htmlFor="body" className="form-label">Corps du texte*</label>
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="text-xs text-gray-500">Variables:</p>
                                {variables.map((variable, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => insertVariable(variable.key, 'body')}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                        title={variable.description}
                                    >
                                        {variable.key}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                id="body"
                                name="structure.body"
                                rows="6"
                                className={`form-input font-mono ${formik.touched.structure?.body && formik.errors.structure?.body ? 'border-red-300' : ''}`}
                                {...formik.getFieldProps('structure.body')}
                            ></textarea>
                            {formik.touched.structure?.body && formik.errors.structure?.body && (
                                <p className="form-error">{formik.errors.structure.body}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="conclusion" className="form-label">Conclusion*</label>
                            <div className="flex items-center space-x-2 mb-1">
                                <p className="text-xs text-gray-500">Variables:</p>
                                {variables.map((variable, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        onClick={() => insertVariable(variable.key, 'conclusion')}
                                        className="text-xs text-blue-600 hover:text-blue-800"
                                        title={variable.description}
                                    >
                                        {variable.key}
                                    </button>
                                ))}
                            </div>
                            <textarea
                                id="conclusion"
                                name="structure.conclusion"
                                rows="3"
                                className={`form-input font-mono ${formik.touched.structure?.conclusion && formik.errors.structure?.conclusion ? 'border-red-300' : ''}`}
                                {...formik.getFieldProps('structure.conclusion')}
                            ></textarea>
                            {formik.touched.structure?.conclusion && formik.errors.structure?.conclusion && (
                                <p className="form-error">{formik.errors.structure.conclusion}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="signature" className="form-label">Signature</label>
                            <textarea
                                id="signature"
                                name="structure.signature"
                                rows="2"
                                className="form-input font-mono"
                                {...formik.getFieldProps('structure.signature')}
                            ></textarea>
                            <div className="text-right">
                                <button
                                    type="button"
                                    className="text-xs text-blue-600 hover:text-blue-800"
                                    onClick={() => {
                                        const defaultSignature = "Veuillez agréer, Madame, Monsieur, l'expression de mes salutations distinguées.\n\n[Votre prénom NOM]";
                                        formik.setFieldValue('structure.signature', defaultSignature);
                                    }}
                                >
                                    Insérer un modèle
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Template par défaut */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isDefault"
                        name="isDefault"
                        checked={formik.values.isDefault}
                        onChange={formik.handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                        Définir comme template par défaut
                    </label>
                </div>

                {/* Boutons d'action */}
                <div className="flex justify-end space-x-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="btn btn-secondary"
                    >
                        Annuler
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={formik.isSubmitting}
                    >
                        {formik.isSubmitting
                            ? 'Enregistrement...'
                            : initialData
                                ? 'Mettre à jour'
                                : 'Enregistrer'
                        }
                    </button>
                </div>
            </div>
        </form>
    );
};

export default LetterTemplateForm;