import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';

const EmailTemplateForm = ({ initialData, onSubmit, onCancel }) => {
    const [variables, setVariables] = useState(initialData?.variables || []);
    const [variableKey, setVariableKey] = useState('');
    const [variableDesc, setVariableDesc] = useState('');

    const formik = useFormik({
        initialValues: {
            name: initialData?.name || '',
            subject: initialData?.subject || '',
            content: initialData?.content || '',
            type: initialData?.type || 'candidature',
            isDefault: initialData?.isDefault || false
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Le nom est requis'),
            subject: Yup.string().required('Le sujet est requis'),
            content: Yup.string().required('Le contenu est requis'),
            type: Yup.string().required('Le type est requis'),
            isDefault: Yup.boolean()
        }),
        onSubmit: (values) => {
            // Inclure les variables dans les données soumises
            const formattedValues = {
                ...values,
                variables
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

    const insertVariable = (key) => {
        const textArea = document.getElementById('content');
        const cursorPos = textArea.selectionStart;
        const textBefore = formik.values.content.substring(0, cursorPos);
        const textAfter = formik.values.content.substring(cursorPos);

        const newText = `${textBefore}{{${key}}}${textAfter}`;
        formik.setFieldValue('content', newText);

        // Remettre le focus sur le textarea après l'insertion
        setTimeout(() => {
            textArea.focus();
            const newCursorPos = cursorPos + key.length + 4; // +4 pour les accolades {{}}
            textArea.setSelectionRange(newCursorPos, newCursorPos);
        }, 0);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addVariable();
        }
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
                {/* Informations de base */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                    <div>
                        <label htmlFor="type" className="form-label">Type de message*</label>
                        <select
                            id="type"
                            name="type"
                            className={`form-input ${formik.touched.type && formik.errors.type ? 'border-red-300' : ''}`}
                            {...formik.getFieldProps('type')}
                        >
                            <option value="candidature">Candidature</option>
                            <option value="relance">Relance</option>
                            <option value="remerciement">Remerciement</option>
                            <option value="autre">Autre</option>
                        </select>
                        {formik.touched.type && formik.errors.type && (
                            <p className="form-error">{formik.errors.type}</p>
                        )}
                    </div>
                </div>

                {/* Sujet */}
                <div>
                    <label htmlFor="subject" className="form-label">Sujet de l'email*</label>
                    <input
                        type="text"
                        id="subject"
                        name="subject"
                        className={`form-input ${formik.touched.subject && formik.errors.subject ? 'border-red-300' : ''}`}
                        {...formik.getFieldProps('subject')}
                    />
                    {formik.touched.subject && formik.errors.subject && (
                        <p className="form-error">{formik.errors.subject}</p>
                    )}
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
                            onKeyPress={handleKeyPress}
                            className="form-input w-1/3"
                        />
                        <input
                            type="text"
                            placeholder="Description (optionnel)"
                            value={variableDesc}
                            onChange={(e) => setVariableDesc(e.target.value)}
                            onKeyPress={handleKeyPress}
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
                                            onClick={() => insertVariable(variable.key)}
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

                {/* Contenu */}
                <div>
                    <label htmlFor="content" className="form-label">Contenu de l'email*</label>
                    <textarea
                        id="content"
                        name="content"
                        rows="12"
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
                        Définir comme template par défaut pour ce type de message
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

export default EmailTemplateForm;