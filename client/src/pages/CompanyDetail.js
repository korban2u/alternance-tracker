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
  GlobeAltIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  PlusIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import CompanyForm from '../components/companies/CompanyForm';

const CompanyDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [companyOffers, setCompanyOffers] = useState([]);
  const [companyApplications, setCompanyApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchCompanyData();
  }, [id]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      
      // Récupérer les informations de l'entreprise
      const companyResponse = await axios.get(`/api/companies/${id}`);
      
      if (companyResponse.data.success) {
        setCompany(companyResponse.data.data);
        
        // Récupérer les offres de l'entreprise
        const offersResponse = await axios.get('/api/offers');
        const offers = offersResponse.data.data.filter(
          offer => offer.company === id || offer.company._id === id
        );
        setCompanyOffers(offers);
        
        // Récupérer les candidatures de l'entreprise
        const applicationsResponse = await axios.get('/api/applications');
        const applications = applicationsResponse.data.data.filter(
          application => application.company === id || application.company._id === id
        );
        setCompanyApplications(applications);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des données de l\'entreprise');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      try {
        const response = await axios.delete(`/api/companies/${id}`);
        if (response.data.success) {
          toast.success('Entreprise supprimée avec succès');
          navigate('/companies');
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'entreprise');
        console.error(error);
      }
    }
  };

  const handleUpdateSubmit = async (formData) => {
    try {
      const response = await axios.put(`/api/companies/${id}`, formData);
      if (response.data.success) {
        toast.success('Entreprise mise à jour avec succès');
        setCompany(response.data.data);
        setIsEditModalOpen(false);
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de l\'entreprise');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">Entreprise non trouvée</h3>
        <p className="mt-1 text-sm text-gray-500">
          L'entreprise que vous recherchez n'existe pas ou a été supprimée.
        </p>
        <div className="mt-6">
          <Link to="/companies" className="btn btn-primary">
            Retour à la liste des entreprises
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
          <Link to="/companies" className="text-gray-500 hover:text-gray-700">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">{company.name}</h1>
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
        {/* Informations générales */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Informations générales
              </h3>
            </div>
            <div className="px-4 py-5 sm:p-6">
              <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Secteur d'activité</h4>
                  <p className="mt-1 text-sm text-gray-900">{company.sector}</p>
                </div>

                {company.website && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Site web</h4>
                    <p className="mt-1 text-sm text-gray-900 flex items-center">
                      <GlobeAltIcon className="h-4 w-4 mr-1 text-gray-400" />
                      <a 
                        href={company.website.startsWith('http') ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-500"
                      >
                        {company.website}
                      </a>
                    </p>
                  </div>
                )}

                {company.address && (company.address.street || company.address.city || company.address.postalCode) && (
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Adresse</h4>
                    <p className="mt-1 text-sm text-gray-900 flex items-start">
                      <MapPinIcon className="h-4 w-4 mr-1 text-gray-400 mt-1" />
                      <span>
                        {company.address.street && <span>{company.address.street}<br /></span>}
                        {company.address.postalCode && company.address.city && (
                          <span>{company.address.postalCode} {company.address.city}<br /></span>
                        )}
                        {company.address.country && <span>{company.address.country}</span>}
                      </span>
                    </p>
                  </div>
                )}

                {company.tags && company.tags.length > 0 && (
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Tags</h4>
                    <div className="mt-1 flex flex-wrap">
                      {company.tags.map((tag, index) => (
                        <span 
                          key={index}
                          className="mr-2 mb-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {company.notes && (
                  <div className="sm:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-line">{company.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Contacts
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {company.contacts.length}
              </span>
            </div>
            <div className="divide-y divide-gray-200">
              {company.contacts.length === 0 ? (
                <div className="p-4 text-center text-sm text-gray-500">
                  Aucun contact enregistré
                </div>
              ) : (
                company.contacts.map((contact, index) => (
                  <div key={index} className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                    </div>
                    {contact.role && (
                      <p className="text-sm text-gray-500 mt-1">{contact.role}</p>
                    )}
                    <div className="mt-2 flex flex-col space-y-1">
                      {contact.email && (
                        <div className="flex items-center text-sm text-gray-500">
                          <EnvelopeIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <a 
                            href={`mailto:${contact.email}`}
                            className="text-primary-600 hover:text-primary-500"
                          >
                            {contact.email}
                          </a>
                        </div>
                      )}
                      {contact.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <PhoneIcon className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                          <a 
                            href={`tel:${contact.phone}`}
                            className="text-primary-600 hover:text-primary-500"
                          >
                            {contact.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Offres d'emploi */}
      <div className="mt-6">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Offres d'emploi
            </h3>
            <Link 
              to="/offers/new" 
              state={{ company: id }}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Ajouter une offre
            </Link>
          </div>
          <div>
            {companyOffers.length === 0 ? (
              <div className="px-4 py-5 text-center">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune offre</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Commencez par ajouter une offre pour cette entreprise.
                </p>
                <div className="mt-3">
                  <Link 
                    to="/offers/new" 
                    state={{ company: id }}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Ajouter une offre
                  </Link>
                </div>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {companyOffers.map(offer => (
                  <li key={offer._id}>
                    <Link to={`/offers/${offer._id}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {offer.title}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p 
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
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
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              {offer.location}
                            </p>
                            {offer.technologies && offer.technologies.length > 0 && (
                              <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                <span className="flex-shrink-0 mr-1.5">&bull;</span>
                                {offer.technologies.slice(0, 3).join(', ')}
                                {offer.technologies.length > 3 && '...'}
                              </p>
                            )}
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>
                              {offer.dates.publication && `Publié le ${format(new Date(offer.dates.publication), 'dd MMMM yyyy', { locale: fr })}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour éditer l'entreprise */}
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
                  Modifier l'entreprise
                </h3>
                <CompanyForm 
                  initialData={company} 
                  onSubmit={handleUpdateSubmit} 
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

export default CompanyDetail;