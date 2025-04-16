import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    PencilIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import LetterTemplateForm from '../components/templates/LetterTemplateForm';
import LetterPreview from '../components/templates/LetterPreview';

const LetterTemplates = () => {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTemplate, setCurrentTemplate] = useState(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [previewTemplate, setPreviewTemplate] = useState(null);

    useEffect(() => {
        fetchTemplates();
    }, []);

    const fetchTemplates = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/letter-templates');
            if (response.data.success) {
                setTemplates(response.data.data);
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des templates de lettre');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce template ?')) {
            try {
                const response = await axios.delete(`/api/letter-templates/${id}`);
                if (response.data.success) {
                    toast.success('Template supprimé avec succès');
                    setTemplates(templates.filter(template => template._id !== id));
                }
            } catch (error) {
                toast.error('Erreur lors de la suppression du template');
                console.error(error);
            }
        }
    };

    const openAddModal = () => {
        setCurrentTemplate(null);
        setIsModalOpen(true);
    };

    const openEditModal = (template) => {
        setCurrentTemplate(template);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTemplate(null);
    };

    const openPreview = (template) => {
        setPreviewTemplate(template);
        setIsPreviewOpen(true);
    };

    const closePreview = () => {
        setIsPreviewOpen(false);
        setPreviewTemplate(null);
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (currentTemplate) {
                // Mode édition
                const response = await axios.put(`/api/letter-templates/${currentTemplate._id}`, formData);
                if (response.data.success) {
                    toast.success('Template mis à jour avec succès');
                    setTemplates(templates.map(template =>
                        template._id === currentTemplate._id ? response.data.data : template
                    ));
                }
            } else {
                // Mode création
                const response = await axios.post('/api/letter-templates', formData);
                if (response.data.success) {
                    toast.success('Template ajouté avec succès');
                    setTemplates([...templates, response.data.data]);
                }
            }
            closeModal();
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement du template');
            console.error(error);
        }
    };

    const filteredTemplates = templates.filter(template =>
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.tags && template.tags.some(tag =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
        ))
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Templates de Lettre de Motivation</h1>
                <button
                    onClick={openAddModal}
                    className="btn btn-primary flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Ajouter un template
                </button>
            </div>

            {/* Barre de recherche */}
            <div className="mb-6">
                <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="form-input pl-10"
                        placeholder="Rechercher par nom ou tags..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Liste des templates */}
            {loading ? (
                <div className="flex items-center justify-center h-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : filteredTemplates.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun template trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        Commencez par ajouter un nouveau template de lettre de motivation.
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={openAddModal}
                            className="btn btn-primary"
                        >
                            Ajouter un template
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {filteredTemplates.map(template => (
                            <li key={template._id}>
                                <div className="px-4 py-4 flex items-center sm:px-6">
                                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                                        <div>
                                            <h4 className="text-lg font-medium text-primary-600">
                                                {template.name}
                                            </h4>
                                            {template.tags && template.tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap">
                                                    {template.tags.map((tag, tagIndex) => (
                                                        <span
                                                            key={tagIndex}
                                                            className="mr-2 mb-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                                                        >
                              {tag}
                            </span>
                                                    ))}
                                                </div>
                                            )}
                                            {template.isDefault && (
                                                <span className="mt-2 inline-flex px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Template par défaut
                        </span>
                                            )}
                                        </div>
                                        <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                                            <div className="flex overflow-hidden">
                                                <button
                                                    onClick={() => openPreview(template)}
                                                    className="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                    title="Prévisualiser"
                                                >
                                                    <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(template)}
                                                    className="ml-2 inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                    title="Modifier"
                                                >
                                                    <PencilIcon className="h-5 w-5 text-gray-500" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(template._id)}
                                                    className="ml-2 inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                    title="Supprimer"
                                                >
                                                    <TrashIcon className="h-5 w-5 text-red-500" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Modal pour ajouter/éditer un template */}
            {isModalOpen && (
                <div className="fixed inset-0 overflow-y-auto z-50">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    {currentTemplate ? 'Modifier le template' : 'Ajouter un template'}
                                </h3>
                                <div className="mt-4">
                                    <LetterTemplateForm
                                        initialData={currentTemplate}
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeModal}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de prévisualisation */}
            {isPreviewOpen && (
                <div className="fixed inset-0 overflow-y-auto z-50">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                    Prévisualisation du template
                                </h3>
                                <LetterPreview template={previewTemplate} onClose={closePreview} />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LetterTemplates;