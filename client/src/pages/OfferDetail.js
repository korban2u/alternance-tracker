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
  MapPinIcon,
  CurrencyEuroIcon,
  CalendarIcon,
  ClockIcon,
  DocumentPlusIcon,
  BriefcaseIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import OfferForm from '../components/offers/OfferForm';

const OfferDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchOfferData();
  }, [id]);

  const fetchOfferData = async () => {
    try {
      setLoading(true);
      
      if (id === 'new') {
        setLoading(false);
        return;
      }
      
      const response = await axios.get(`/api/offers/${id}`);
      
      if (response.data.success) {
        setOffer(response.data.data);
        setCompany(response.data.data.company);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données de l\'offre');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ?')) {
      try {
        const response = await axios.delete(`/api/offers/${id}`);
        if (response.data.success) {
          toast.success('Offre supprimée avec succès');
          navigate('/offers');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'offre');
        console.error(error);
      }
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (id === 'new') {
        // Mode création
        const response = await axios.post('/api/offers', formData);
        if (response.data.success) {
          toast.success('Offre ajoutée avec succès');
          navigate(`/offers/${response.data.data._id}`);
        }
      } else {
        // Mode édition
        const response = await axios.put(`/api/offers/${id}`, formData);
        if (response.data.success) {
          toast.success('Offre mise à jour avec succès');
          setOffer(response.data.data);
          setIsEditModalOpen(false);
          
          // Rechargement des données complètes
          fetchOfferData();
        }
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de l\'offre');
      console.error(error);
    }
  };

  const createApplication = () => {
    navigate('/applications/new', { state: { offer: offer._id, company: company._id } });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Page de création d'une nouvelle offre
  if (id === 'new') {
    return (
      <div>
        <div className="mb-6 flex items-center space-x-4">
          <Link to="/offers" className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Ajouter une offre</h1>
        </div>
        
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <OfferForm 
              onSubmit={handleFormSubmit} 
              onCancel={() => navigate('/offers')}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="text-center py-12">
        <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Offre non trouvée</h3>
        <p className="mt-1 text-sm text-gray-500">
          L'offre que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <div className="mt-6">
          <Link to="/offers" className="btn btn-primary">
            Retour à la liste des offres
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
          <Link to="/offers" className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{offer.title}</h1>
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
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Détails de l'offre
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                {offer.dates.publication && (
                  <>Publiée le {format(new Date(offer.dates.publication), 'dd MMMM yyyy', { locale: fr })}</>
                )}
              </p>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {/* Entreprise */}
                <div className="sm:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Entreprise</h4>
                  <div className="mt-1 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400 mr-2" />
                    <Link to={`/companies/${company._id}`} className="text-primary-600 hover:text-primary-500">
                      {company.name}
                    </Link>
                  </div>
                </div>

                {/* Localisation */}
                <div className="sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500">Localisation</h4>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mr-2" />
                    {offer.location}
                  </p>
                </div>

                {/* Durée */}
                <div className="sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500">Durée</h4>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <ClockIcon className="h-5 w-5 text-gray-400 mr-2" />
                    {offer.duration}
                  </p>
                </div>

                {/* Rémunération */}
                {offer.salary && (
                  <div className="sm:col-span-1">
                    <h4 className="text-sm font-medium text-gray-500">Rémunération</h4>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <CurrencyEuroIcon className="h-5 w-5 text-gray-400 mr-2" />
                      {offer.salary}
                    </p>
                  </div>
                )}

                {/* Dates importantes */}
                <div className="sm:col-span-1">
                  <h4 className="text-sm font-medium text-gray-500">Date limite</h4>
                  <p className="mt-1 text-sm text-gray-900 flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                    {offer.dates.deadline 
                      ? format(new Date(offer.dates.deadline), 'dd MMMM yyyy', { locale: fr })
                      : 'Non spécifiée'
                    }
                  </p>
                </div>

                {/* Source */}
                {offer.sourceUrl && (
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Source</h4>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <GlobeAltIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <a 
                        href={offer.sourceUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500"
                      >
                        {offer.sourceUrl}
                      </a>
                    </p>
                  </div>
                )}

                {/* Technologies */}
                {offer.technologies && offer.technologies.length > 0 && (
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Technologies</h4>
                    <div className="mt-1 flex flex-wrap">
                      {offer.technologies.map((tech, index) => (
                        <span 
                          key={index}
                          className="mr-2 mb-2 px-2 py-1 text-sm rounded-full bg-blue-100 text-blue-800"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="sm:col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Description</h4>
                  <div className="mt-1 text-sm text-gray-900 prose max-w-none">
                    <p className="whitespace-pre-line">{offer.description}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="px-4 py-5 bg-gray-50 sm:px-6">
              <button
                onClick={createApplication}
                className="btn btn-primary w-full"
              >
                <DocumentPlusIcon className="h-5 w-5 mr-2" />
                Créer une candidature pour cette offre
              </button>
            </div>
          </div>
        </div>

        {/* Informations complémentaires */}
        <div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Statut
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Niveau d'intérêt</h4>
                  <p 
                    className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      offer.interestLevel === 'prioritaire' 
                        ? 'bg-red-100 text-red-800' 
                        : offer.interestLevel === 'très intéressant'
                        ? 'bg-orange-100 text-orange-800'
                        : offer.interestLevel === 'intéressant'
                        ? 'bg-green-100 text-green-800'
                        : offer.interestLevel === 'peu intéressant'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {offer.interestLevel}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500">Statut de l'offre</h4>
                  <p 
                    className={`mt-1 inline-flex px-2.5 py-0.5 rounded-full text-sm font-medium ${
                      offer.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : offer.status === 'expirée'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {offer.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour éditer l'offre */}
      {isEditModalOpen && (
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
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Modifier l'offre
                </h3>
                <OfferForm 
                  initialData={offer} 
                  onSubmit={handleFormSubmit} 
                  onCancel={() => setIsEditModalOpen(false)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferDetail;