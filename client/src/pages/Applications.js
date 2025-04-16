import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  DocumentTextIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const Applications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    company: '',
    status: '',
    type: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  });

  useEffect(() => {
    fetchApplications();
    fetchCompanies();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/applications');
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des candidatures');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des entreprises:', error);
    }
  };

  const handleAddApplication = () => {
    navigate('/applications/new');
  };

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Fonction pour obtenir l'icône de tri
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return null;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4" />
    ) : (
      <ChevronDownIcon className="h-4 w-4" />
    );
  };

  // Appliquer les filtres et le tri
  const filteredAndSortedApplications = applications
    .filter(application => {
      // Filtrer par terme de recherche
      const offerTitle = application.offer?.title || '';
      const companyName = application.company?.name || '';
      
      const searchMatch = 
        offerTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrer par entreprise
      const companyMatch = !filters.company || 
        application.company._id === filters.company ||
        application.company === filters.company;
      
      // Filtrer par statut
      const statusMatch = !filters.status || application.status === filters.status;
      
      // Filtrer par type
      const typeMatch = !filters.type || application.type === filters.type;
      
      return searchMatch && companyMatch && statusMatch && typeMatch;
    })
    .sort((a, b) => {
      // Fonction pour accéder à une propriété imbriquée
      const getNestedProperty = (obj, key) => {
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
      };
      
      const aValue = getNestedProperty(a, sortConfig.key);
      const bValue = getNestedProperty(b, sortConfig.key);
      
      if (sortConfig.key === 'company.name') {
        const aName = a.company?.name || '';
        const bName = b.company?.name || '';
        
        if (sortConfig.direction === 'asc') {
          return aName.localeCompare(bName);
        } else {
          return bName.localeCompare(aName);
        }
      }
      
      // Tri par date
      if (sortConfig.key === 'createdAt' || sortConfig.key.includes('date')) {
        const dateA = aValue ? new Date(aValue) : new Date(0);
        const dateB = bValue ? new Date(bValue) : new Date(0);
        
        if (sortConfig.direction === 'asc') {
          return dateA - dateB;
        } else {
          return dateB - dateA;
        }
      }
      
      // Tri par valeur textuelle
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const clearFilters = () => {
    setFilters({
      company: '',
      status: '',
      type: ''
    });
    setSearchTerm('');
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Candidatures</h1>
        <button
          onClick={handleAddApplication}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une candidature
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="bg-white shadow rounded-lg p-4 flex items-center">
          <div className="rounded-md bg-blue-50 p-2 mr-4">
            <DocumentTextIcon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total</p>
            <p className="text-2xl font-semibold">{applications.length}</p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 flex items-center">
          <div className="rounded-md bg-green-50 p-2 mr-4">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Acceptées</p>
            <p className="text-2xl font-semibold">
              {applications.filter(app => app.status === 'acceptée').length}
            </p>
          </div>
        </div>
        
        <div className="bg-white shadow rounded-lg p-4 flex items-center">
          <div className="rounded-md bg-yellow-50 p-2 mr-4">
            <ClockIcon className="h-6 w-6 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">En cours</p>
            <p className="text-2xl font-semibold">
              {applications.filter(app => !['acceptée', 'refusée'].includes(app.status)).length}
            </p>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-4">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="form-input pl-10"
                placeholder="Rechercher par entreprise ou poste..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="company" className="form-label">Entreprise</label>
            <select
              id="company"
              name="company"
              className="form-input"
              value={filters.company}
              onChange={handleFilterChange}
            >
              <option value="">Toutes les entreprises</option>
              {companies.map(company => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="status" className="form-label">Statut</label>
            <select
              id="status"
              name="status"
              className="form-input"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">Tous les statuts</option>
              <option value="à envoyer">À envoyer</option>
              <option value="envoyée">Envoyée</option>
              <option value="relance effectuée">Relance effectuée</option>
              <option value="entretien planifié">Entretien planifié</option>
              <option value="en attente de réponse">En attente de réponse</option>
              <option value="acceptée">Acceptée</option>
              <option value="refusée">Refusée</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="type" className="form-label">Type</label>
            <select
              id="type"
              name="type"
              className="form-input"
              value={filters.type}
              onChange={handleFilterChange}
            >
              <option value="">Tous les types</option>
              <option value="offre">Offre</option>
              <option value="spontanée">Spontanée</option>
            </select>
          </div>
          
          <div className="flex items-end">
            <button
              onClick={clearFilters}
              className="btn btn-secondary w-full"
            >
              Réinitialiser les filtres
            </button>
          </div>
        </div>
      </div>

      {/* Liste des candidatures */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredAndSortedApplications.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune candidature trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter une nouvelle candidature.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddApplication}
              className="btn btn-primary"
            >
              Ajouter une candidature
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="bg-gray-50 px-4 py-3 text-sm flex items-center justify-between border-b border-gray-200">
            <div>
              <span className="font-medium">{filteredAndSortedApplications.length}</span> candidature(s) trouvée(s)
            </div>
            <div className="flex space-x-4">
              <button
                className="text-sm text-gray-600 flex items-center"
                onClick={() => requestSort('company.name')}
              >
                Entreprise {getSortIcon('company.name')}
              </button>
              <button
                className="text-sm text-gray-600 flex items-center"
                onClick={() => requestSort('status')}
              >
                Statut {getSortIcon('status')}
              </button>
              <button
                className="text-sm text-gray-600 flex items-center"
                onClick={() => requestSort('createdAt')}
              >
                Date {getSortIcon('createdAt')}
              </button>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {filteredAndSortedApplications.map(application => (
              <li key={application._id}>
                <Link to={`/applications/${application._id}`} className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-primary-600 truncate">
                        {application.company?.name || 'Entreprise non spécifiée'} 
                        {application.offer?.title && ` - ${application.offer.title}`}
                        {!application.offer?.title && application.type === 'spontanée' && ' - Candidature spontanée'}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(application.status)}`}>
                          {application.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <p className="flex items-center text-sm text-gray-500">
                          {application.type === 'offre' ? (
                            <BriefcaseIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          ) : (
                            <DocumentTextIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          )}
                          {application.type === 'offre' ? 'Offre' : 'Spontanée'}
                        </p>
                        {application.nextAction && (
                          <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                            <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                            Prochaine action: {application.nextAction}
                            {application.nextActionDate && (
                              <span className="ml-1">
                                ({format(new Date(application.nextActionDate), 'dd/MM/yyyy', { locale: fr })})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          {format(new Date(application.createdAt), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Applications;