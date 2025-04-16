import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
    PlusIcon,
    MagnifyingGlassIcon,
    TrashIcon,
    DocumentArrowDownIcon,
    DocumentCheckIcon,
    DocumentDuplicateIcon,
    DocumentIcon,
    DocumentTextIcon,
    DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import DocumentForm from '../components/documents/DocumentForm';

const Documents = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showVersions, setShowVersions] = useState({});

    useEffect(() => {
        fetchDocuments();
    }, [filter]);

    const fetchDocuments = async () => {
        try {
            setLoading(true);
            let url = '/api/documents';

            // Ajouter les filtres
            if (filter !== 'all') {
                url += `?type=${filter}`;
            }

            const response = await axios.get(url);
            if (response.data.success) {
                setDocuments(response.data.data);
            }
        } catch (error) {
            toast.error('Erreur lors du chargement des documents');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
            try {
                const response = await axios.delete(`/api/documents/${id}`);
                if (response.data.success) {
                    toast.success('Document supprimé avec succès');
                    setDocuments(documents.filter(doc => doc._id !== id));
                }
            } catch (error) {
                toast.error('Erreur lors de la suppression du document');
                console.error(error);
            }
        }
    };

    const downloadDocument = async (id, fileName) => {
        try {
            const response = await axios.get(`/api/documents/${id}/download`, {
                responseType: 'blob'
            });

            // Créer un lien temporaire pour le téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();

            toast.success('Téléchargement démarré');
        } catch (error) {
            toast.error('Erreur lors du téléchargement du document');
            console.error(error);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleFormSubmit = async (formData) => {
        try {
            const response = await axios.post('/api/documents', formData);
            if (response.data.success) {
                toast.success('Document ajouté avec succès');
                fetchDocuments(); // Rafraîchir la liste
            }
            closeModal();
        } catch (error) {
            toast.error('Erreur lors de l\'upload du document');
            console.error(error);
        }
    };

    const toggleVersions = (id) => {
        setShowVersions(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const fetchVersions = async (name, type) => {
        try {
            const response = await axios.get(`/api/documents/versions?name=${name}&type=${type}`);
            if (response.data.success && response.data.data.length > 0) {
                const versions = response.data.data;
                return versions;
            }
            return [];
        } catch (error) {
            console.error('Erreur lors du chargement des versions:', error);
            return [];
        }
    };

    // Filtrer les documents avec le terme de recherche
    const filteredDocuments = documents.filter(doc =>
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    // Obtenir l'icône du type de document
    const getDocumentIcon = (type) => {
        switch (type) {
            case 'cv':
                return <DocumentChartBarIcon className="h-8 w-8 text-blue-500" />;
            case 'lettre_de_motivation':
                return <DocumentTextIcon className="h-8 w-8 text-green-500" />;
            case 'portfolio':
                return <DocumentDuplicateIcon className="h-8 w-8 text-purple-500" />;
            default:
                return <DocumentIcon className="h-8 w-8 text-gray-500" />;
        }
    };

    // Formater la taille du fichier
    const formatFileSize = (bytes) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Documents</h1>
                <button
                    onClick={openModal}
                    className="btn btn-primary flex items-center"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Ajouter un document
                </button>
            </div>

            {/* Filtres et recherche */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                    <div className="relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            className="form-input pl-10"
                            placeholder="Rechercher par nom, fichier ou tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="sm:w-48">
                    <select
                        className="form-input w-full"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">Tous les documents</option>
                        <option value="cv">CV</option>
                        <option value="lettre_de_motivation">Lettres de motivation</option>
                        <option value="portfolio">Portfolios</option>
                        <option value="autre">Autres</option>
                    </select>
                </div>
            </div>

            {/* Liste des documents */}
            {loading ? (
                <div className="flex items-center justify-center h-60">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">Aucun document trouvé</h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {filter !== 'all'
                            ? 'Essayez de modifier vos filtres ou d\'ajouter un nouveau document.'
                            : 'Commencez par ajouter un nouveau document.'}
                    </p>
                    <div className="mt-6">
                        <button
                            onClick={openModal}
                            className="btn btn-primary"
                        >
                            Ajouter un document
                        </button>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow rounded-lg">
                    <ul className="divide-y divide-gray-200">
                        {filteredDocuments.map(document => (
                            <React.Fragment key={document._id}>
                                <li className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            {getDocumentIcon(document.type)}
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h4 className="text-lg font-medium text-gray-900">
                                                        {document.name}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        {document.fileName}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => downloadDocument(document._id, document.fileName)}
                                                        className="inline-flex items-center p-1.5 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                        title="Télécharger"
                                                    >
                                                        <DocumentArrowDownIcon className="h-5 w-5 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleVersions(document._id)}
                                                        className="inline-flex items-center p-1.5 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                        title="Voir les versions"
                                                    >
                                                        <DocumentDuplicateIcon className="h-5 w-5 text-gray-500" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(document._id)}
                                                        className="inline-flex items-center p-1.5 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        title="Supprimer"
                                                    >
                                                        <TrashIcon className="h-5 w-5 text-red-500" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {document.type.replace('_', ' ')}
                        </span>
                                                <span className="text-xs text-gray-500">
                          Version: {document.version}
                        </span>
                                                <span className="text-xs text-gray-500">
                          Taille: {formatFileSize(document.fileSize)}
                        </span>
                                                <span className="text-xs text-gray-500">
                          Ajouté le: {format(new Date(document.createdAt), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                                                {document.isActive && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <DocumentCheckIcon className="h-3 w-3 mr-1" />
                            Actif
                          </span>
                                                )}
                                            </div>
                                            {document.tags && document.tags.length > 0 && (
                                                <div className="mt-2 flex flex-wrap gap-2">
                                                    {document.tags.map((tag, tagIndex) => (
                                                        <span
                                                            key={tagIndex}
                                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                        >
                              {tag}
                            </span>
                                                    ))}
                                                </div>
                                            )}
                                            {document.applications && document.applications.length > 0 && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Utilisé dans {document.applications.length} candidature(s)
                                                </div>
                                            )}
                                            {document.versionNote && (
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Note: {document.versionNote}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                                {showVersions[document._id] && (
                                    <li className="bg-gray-50 px-4 py-3 sm:px-6">
                                        <VersionsList
                                            documentName={document.name}
                                            documentType={document.type}
                                            onDownload={downloadDocument}
                                        />
                                    </li>
                                )}
                            </React.Fragment>
                        ))}
                    </ul>
                </div>
            )}

            {/* Modal pour ajouter un document */}
            {isModalOpen && (
                <div className="fixed inset-0 overflow-y-auto z-50">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>
                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                        <div
                            className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                        >
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Ajouter un document
                                </h3>
                                <div className="mt-4">
                                    <DocumentForm
                                        onSubmit={handleFormSubmit}
                                        onCancel={closeModal}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Composant pour afficher les versions d'un document
const VersionsList = ({ documentName, documentType, onDownload }) => {
    const [versions, setVersions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVersions = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`/api/documents/versions?name=${documentName}&type=${documentType}`);
                if (response.data.success) {
                    setVersions(response.data.data);
                }
            } catch (error) {
                console.error('Erreur lors du chargement des versions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchVersions();
    }, [documentName, documentType]);

    if (loading) {
        return <div className="text-center py-2">Chargement des versions...</div>;
    }

    if (versions.length === 0) {
        return <div className="text-center py-2 text-gray-500">Aucune autre version disponible</div>;
    }

    // Trier les versions par date (plus récentes en premier)
    const sortedVersions = [...versions].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    return (
        <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Versions du document</h4>
            <ul className="space-y-2">
                {sortedVersions.map(version => (
                    <li key={version._id} className="flex items-center justify-between bg-white p-2 rounded-md border border-gray-200">
                        <div>
                            <span className="text-sm font-medium">Version {version.version}</span>
                            <span className="ml-2 text-xs text-gray-500">
                {format(new Date(version.createdAt), 'dd/MM/yyyy HH:mm', { locale: fr })}
              </span>
                            {version.versionNote && (
                                <p className="text-xs text-gray-500 mt-1">{version.versionNote}</p>
                            )}
                        </div>
                        <button
                            onClick={() => onDownload(version._id, version.fileName)}
                            className="inline-flex items-center p-1 text-sm font-medium text-gray-700 bg-white rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                            title="Télécharger cette version"
                        >
                            <DocumentArrowDownIcon className="h-4 w-4 text-gray-500" />
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Documents;