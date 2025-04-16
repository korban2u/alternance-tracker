import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { XMarkIcon } from '@heroicons/react/24/outline';

const DocumentForm = ({ onSubmit, onCancel }) => {
    const [applications, setApplications] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const [tags, setTags] = useState([]);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Récupérer les données pour les références
            const [applicationsRes, companiesRes] = await Promise.all([
                axios.get('/api/applications'),
                axios.get('/api/companies')
            ]);

            setApplications(applicationsRes.data.data);
            setCompanies(companiesRes.data.data);
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        } finally {
            setLoading(false);
        }
    };

    const formik = useFormik({
        initialValues: {
            name: '',
            type: 'cv',
            version: '1.0',
            versionNote: '',
            isActive: true,
            company: '',
            application: ''
        },
        validationSchema: Yup.object({
            name: Yup.string().required('Le nom est requis'),
            type: Yup.string().required('Le type est requis'),
            version: Yup.string().required('La version est requise'),
            versionNote: Yup.string(),
            isActive: Yup.boolean(),
            company: Yup.string(),
            application: Yup.string()
        }),
        onSubmit: (values) => {
            if (!selectedFile) {
                alert('Veuillez sélectionner un fichier');
                return;
            }

            // Créer un FormData pour l'upload du fichier
            const formData = new FormData();
            formData.append('file', selectedFile);
            formData.append('name', values.name);
            formData.append('type', values.type);
            formData.append('version', values.version);
            formData.append('versionNote', values.versionNote);
            formData.append('isActive', values.isActive);
            formData.append('tags', JSON.stringify(tags));

            if (values.company) {
                formData.append('company', values.company);
            }

            if (values.application) {
                formData.append('application', values.application);

                // Déterminer si le document a été envoyé
                const application = applications.find(app => app._id === values.application);
                if (application) {
                    formData.append('sent', 'true');
                }
            }

            onSubmit(formData);
        }
    });

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);

            // Extraire le nom du fichier (sans extension) et le pré-remplir
            const fileName = file.name.replace(/\.[^/.]+$/, "");
            if (!formik.values.name) {
                formik.setFieldValue('name', fileName);
            }

            // Détecter le type de document à partir du nom
            if (file.name.toLowerCase().includes('cv')) {
                formik.setFieldValue('type', 'cv');
            } else if (file.name.toLowerCase().includes('lettre') || file.name.toLowerCase().includes('motivation')) {
                formik.setFieldValue('type', 'lettre_de_motivation');
            }
        }
    };

    const handleApplicationChange = (e) => {
        const applicationId = e.target.value;
        formik.setFieldValue('application', applicationId);

        if (applicationId) {
            // Trouver l'application et pré-remplir l'entreprise
            const application = applications.find(app => app._id === applicationId);
            if (application) {
                const companyId = application.company._id || application.company;
                formik.setFieldValue('company', companyId);
            }
        }
    };

    const addTag = () => {
        if (tagInput.trim() === '' || tags.includes(tagInput.trim())) return;

        setTags([...tags, tagInput.trim()]);
        setTagInput('');
    };

    const removeTag = (tag) => {
        setTags(tags.filter(t => t !== tag));
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <form onSubmit={formik.handleSubmit}>
            <div className="space-y-6">
                {/* Sélection du fichier */}
                <div>
                    <label htmlFor="file-upload" className="form-label">Fichier*</label>
                    <input
                        id="file-upload"
                        name="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.odt"
                        onChange={handleFileChange}
                        className="form-input"
                        required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                        Formats acceptés: PDF, DOC, DOCX, TXT, ODT (max: 5MB)
                    </p>
                </div>

                {/* Nom et type */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="name" className="form-label">Nom du document*</label>
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
                        <label htmlFor="type" className="form-label">Type de document*</label>
                        <select
                            id="type"
                            name="type"
                            className={`form-input ${formik.touched.type && formik.errors.type ? 'border-red-300' : ''}`}
                            {...formik.getFieldProps('type')}
                        >
                            <option value="cv">CV</option>
                            <option value="lettre_de_motivation">Lettre de motivation</option>
                            <option value="portfolio">Portfolio</option>
                            <option value="autre">Autre</option>
                        </select>
                        {formik.touched.type && formik.errors.type && (
                            <p className="form-error">{formik.errors.type}</p>
                        )}
                    </div>
                </div>

                {/* Version */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="version" className="form-label">Version*</label>
                        <input
                            type="text"
                            id="version"
                            name="version"
                            placeholder="ex: 1.0, v2, etc."
                            className={`form-input ${formik.touched.version && formik.errors.version ? 'border-red-300' : ''}`}
                            {...formik.getFieldProps('version')}
                        />
                        {formik.touched.version && formik.errors.version && (
                            <p className="form-error">{formik.errors.version}</p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="versionNote" className="form-label">Note sur la version</label>
                        <input
                            type="text"
                            id="versionNote"
                            name="versionNote"
                            placeholder="ex: Ajout de la section projets"
                            className={`form-input ${formik.touched.versionNote && formik.errors.versionNote ? 'border-red-300' : ''}`}
                            {...formik.getFieldProps('versionNote')}
                        />
                        {formik.touched.versionNote && formik.errors.versionNote && (
                            <p className="form-error">{formik.errors.versionNote}</p>
                        )}
                    </div>
                </div>

                {/* Tags */}
                <div>
                    <h4 className="form-label">Tags</h4>
                    <div className="flex space-x-2">
                        <input
                            type="text"
                            placeholder="Ajouter un tag (technologies, compétences...)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="form-input w-full"
                        />
                        <button
                            type="button"
                            onClick={addTag}
                            className="btn btn-secondary"
                        >
                            Ajouter
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

                {/* Références */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                        <label htmlFor="application" className="form-label">Candidature associée</label>
                        <select
                            id="application"
                            name="application"
                            className="form-input"
                            value={formik.values.application}
                            onChange={handleApplicationChange}
                            disabled={loading}
                        >
                            <option value="">Aucune candidature</option>
                            {applications.map(app => (
                                <option key={app._id} value={app._id}>
                                    {app.company?.name || 'Entreprise'}
                                    {app.offer?.title ? ` - ${app.offer.title}` : ' - Candidature spontanée'}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="company" className="form-label">Entreprise associée</label>
                        <select
                            id="company"
                            name="company"
                            className="form-input"
                            {...formik.getFieldProps('company')}
                            disabled={loading || formik.values.application}
                        >
                            <option value="">Aucune entreprise</option>
                            {companies.map(company => (
                                <option key={company._id} value={company._id}>
                                    {company.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Document actif */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isActive"
                        name="isActive"
                        checked={formik.values.isActive}
                        onChange={formik.handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                        Définir comme version active (pour ce type de document)
                    </label>
                </div>

                {/* Actions */}
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
                        disabled={formik.isSubmitting || !selectedFile}
                    >
                        {formik.isSubmitting ? 'Envoi en cours...' : 'Enregistrer'}
                    </button>
                </div>
            </div>
        </form>
    );
};

export default DocumentForm;