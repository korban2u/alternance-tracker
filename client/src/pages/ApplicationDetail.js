import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowLeftIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  PlusIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import ApplicationForm from '../components/applications/ApplicationForm';
import TimelineEntryForm from '../components/applications/TimelineEntryForm';
import EmailComposer from '../components/gmail/EmailComposer';
import { EnvelopeIcon } from '@heroicons/react/24/outline';

const ApplicationDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isTimelineModalOpen, setIsTimelineModalOpen] = useState(false);

  useEffect(() => {
    fetchApplicationData();
  }, [id]);

  const fetchApplicationData = async () => {
    try {
      setLoading(true);
      
      if (id === 'new') {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`/api/applications/${id}`);
      
      if (response.data.success) {
        setApplication(response.data.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données de la candidature');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette candidature ?')) {
      try {
        const response = await axios.delete(`/api/applications/${id}`);
        if (response.data.success) {
          toast.success('Candidature supprimée avec succès');
          navigate('/applications');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression de la candidature');
        console.error(error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (id === 'new') {
        // Mode création
        const response = await axios.post('/api/applications', formData);
        if (response.data.success) {
          toast.success('Candidature ajoutée avec succès');
          navigate(`/applications/${response.data.data._id}`);
        }
      } else {
        // Mode édition
        const response = await axios.put(`/api/applications/${id}`, formData);
        if (response.data.success) {
          toast.success('Candidature mise à jour avec succès');
          setApplication(response.data.data);
          setIsEditModalOpen(false);
          
          // Rechargement des données complètes
          fetchApplicationData();
        }
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de la candidature');
      console.error(error);
    }
  };

  const handleTimelineEntrySubmit = async (entryData) => {
    try {
      const response = await axios.post(`/api/applications/${id}/timeline`, entryData);
      if (response.data.success) {
        toast.success('Entrée ajoutée au journal avec succès');
        setApplication(response.data.data);
        setIsTimelineModalOpen(false);
        
        // Rechargement des données complètes
        fetchApplicationData();
      }
    } catch (error) {
      toast.error('Erreur lors de l\'ajout de l\'entrée au journal');
      console.error(error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'à envoyer':
        return 'bg-gray-100 text-gray-800';
      case 'envoyée':
        return 'bg-blue-100 text-blue-800';
      case 'relance effectuée':
        return 'bg-purple-100 text-purple-800';
      case 'entretien planifié':
        return 'bg-indigo-100 text-indigo-800';
      case 'en attente de réponse':
        return 'bg-yellow-100 text-yellow-800';
      case 'acceptée':
        return 'bg-green-100 text-green-800';
      case 'refusée':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const [isEmailComposerOpen, setIsEmailComposerOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Page de création d'une nouvelle candidature
  if (id === 'new') {
    return (
      <div>
        <div className="mb-6 flex items-center space-x-4">
          <Link to="/applications" className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Ajouter une candidature</h1>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <ApplicationForm 
              onSubmit={handleFormSubmit} 
              onCancel={() => navigate('/applications')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="text-center py-12">
        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Candidature non trouvée</h3>
        <p className="mt-1 text-sm text-gray-500">
          La candidature que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <div className="mt-6">
          <Link to="/applications" className="btn btn-primary">
            Retour à la liste des candidatures
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* En-tête */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/applications" className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            Candidature {application.type === 'spontanée' ? 'spontanée' : ''}
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="btn btn-secondary flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Modifier
          </button>
          <button
            onClick={handleDelete}
            className="btn btn-danger flex items-center"
          >
            <TrashIcon className="h-5 w-5 mr-2" />
            Supprimer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Informations principales */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {application.company?.name || 'Entreprise'}
                  {application.offer?.title && ` - ${application.offer.title}`}
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Créée le {format(new Date(application.createdAt), 'dd MMMM yyyy', { locale: fr })}
                </p>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusBadgeClass(application.status)}`}>
                {application.status}
              </span>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {/* Type de candidature */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Type de candidature</h4>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    {application.type === 'offre' ? (
                      <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-400" />
                    ) : (
                      <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                    )}
                    {application.type === 'offre' ? 'Réponse à une offre' : 'Candidature spontanée'}
                  </p>
                </div>

                {/* Entreprise */}
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Entreprise</h4>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                    <Link 
                      to={`/companies/${application.company?._id}`} 
                      className="text-primary-600 hover:text-primary-500"
                    >
                      {application.company?.name || 'Entreprise non spécifiée'}
                    </Link>
                  </p>
                </div>

                {/* Offre associée */}
                {application.type === 'offre' && application.offer && (
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Offre associée</h4>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <BriefcaseIcon className="h-5 w-5 mr-2 text-gray-400" />
                      <Link 
                        to={`/offers/${application.offer._id}`}
                        className="text-primary-600 hover:text-primary-500"
                      >
                        {application.offer.title}
                      </Link>
                    </p>
                  </div>
                )}

                {/* Documents envoyés */}
                <div className="sm:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Documents envoyés</h4>
                  <div className="mt-2 flex flex-col space-y-2">
                    <div className="flex items-center">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {application.documents?.cv?.sent ? (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <span className="ml-2 text-sm text-gray-900">
                        CV {application.documents?.cv?.version && `(version: ${application.documents.cv.version})`}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 flex items-center justify-center">
                        {application.documents?.coverLetter?.sent ? (
                          <CheckIcon className="h-5 w-5 text-green-500" />
                        ) : (
                          <XMarkIcon className="h-5 w-5 text-red-500" />
                        )}
                      </div>
                      <span className="ml-2 text-sm text-gray-900">
                        Lettre de motivation {application.documents?.coverLetter?.version && `(version: ${application.documents.coverLetter.version})`}
                      </span>
                    </div>
                    {application.documents?.other && application.documents.other.length > 0 && (
                      application.documents.other.map((doc, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-6 h-6 flex items-center justify-center">
                            {doc.sent ? (
                              <CheckIcon className="h-5 w-5 text-green-500" />
                            ) : (
                              <XMarkIcon className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <span className="ml-2 text-sm text-gray-900">
                            {doc.name}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Notes */}
                {application.notes && (
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{application.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Statut et prochaine action */}
        <div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Statut et actions
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Statut actuel</h4>
                  <p className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium ${getStatusBadgeClass(application.status)}`}>
                    {application.status}
                  </p>
                </div>

                {application.nextAction && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Prochaine action</h4>
                    <p className="mt-1 text-sm text-gray-900">{application.nextAction}</p>
                    {application.nextActionDate && (
                      <p className="mt-1 text-xs text-gray-500">
                        {format(new Date(application.nextActionDate), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="px-4 py-4 sm:px-6 bg-gray-50">
              <button
                  onClick={() => setIsTimelineModalOpen(true)}
                  className="btn btn-primary w-full flex items-center justify-center mb-3"
              >
                <PlusIcon className="h-5 w-5 mr-2"/>
                Ajouter une entrée au journal
              </button>

              <button
                  onClick={() => setIsEmailComposerOpen(true)}
                  className="btn btn-primary flex items-center w-full"
              >
                <EnvelopeIcon className="h-5 w-5 mr-2"/>
                Envoyer un email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Journal chronologique */}
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Journal chronologique
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            {application.timeline && application.timeline.length > 0 ? (
              <div className="flow-root">
                <ul className="-mb-8">
                  {[...application.timeline].reverse().map((entry, index) => (
                    <li key={index}>
                      <div className="relative pb-8">
                        {index !== application.timeline.length - 1 && (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                        )}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
                              <DocumentTextIcon className="h-5 w-5 text-white" />
                            </span>
                          </div>
                          <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                            <div>
                              <p className="text-sm text-gray-900">{entry.action}</p>
                              {entry.notes && (
                                <p className="mt-2 text-sm text-gray-500">{entry.notes}</p>
                              )}
                            </div>
                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                              {format(new Date(entry.date), 'dd/MM/yyyy', { locale: fr })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">Aucune entrée dans le journal</p>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour éditer la candidature */}
      {isEditModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Modifier la candidature
                </h3>
                <ApplicationForm 
                  initialData={application} 
                  onSubmit={handleFormSubmit} 
                  onCancel={() => setIsEditModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour ajouter une entrée au journal */}
      {isTimelineModalOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Ajouter une entrée au journal
                </h3>
                <TimelineEntryForm 
                  onSubmit={handleTimelineEntrySubmit} 
                  onCancel={() => setIsTimelineModalOpen(false)}
                  currentStatus={application.status}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {isEmailComposerOpen && application && (
          <EmailComposer
              initialTo={application.company?.contacts?.[0]?.email || ''}
              initialSubject={`Candidature - ${application.offer?.title || 'Candidature spontanée'}`}
              applicationId={application._id}
              companyId={application.company?._id || application.company}
              onClose={() => setIsEmailComposerOpen(false)}
              onSent={() => fetchApplicationData()} // Pour rafraîchir les données après l'envoi
          />
      )}
    </div>
  );
};

export default ApplicationDetail;