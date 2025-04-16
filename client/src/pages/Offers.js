import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  BriefcaseIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ClockIcon,
  ChevronUpIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';

const Offers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    company: '',
    interestLevel: '',
    status: ''
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'dates.publication',
    direction: 'desc'
  });

  useEffect(() => {
    fetchOffers();
    fetchCompanies();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/offers');
      if (response.data.success) {
        setOffers(response.data.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des offres');
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

  const handleAddOffer = () => {
    navigate('/offers/new');
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
  const filteredAndSortedOffers = offers
    .filter(offer => {
      // Filtrer par terme de recherche
      const searchMatch = 
        offer.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offer.company.name && offer.company.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        offer.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (offer.technologies && offer.technologies.some(tech => 
          tech.toLowerCase().includes(searchTerm.toLowerCase())
        ));
      
      // Filtrer par entreprise
      const companyMatch = !filters.company || offer.company._id === filters.company;
      
      // Filtrer par niveau d'intérêt
      const interestMatch = !filters.interestLevel || offer.interestLevel === filters.interestLevel;
      
      // Filtrer par statut
      const statusMatch = !filters.status || offer.status === filters.status;
      
      return searchMatch && companyMatch && interestMatch && statusMatch;
    })
    .sort((a, b) => {
      // Fonction pour accéder à une propriété imbriquée
      const getNestedProperty = (obj, key) => {
        return key.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
      };
      
      const aValue = getNestedProperty(a, sortConfig.key);
      const bValue = getNestedProperty(b, sortConfig.key);
      
      // Tri par date
      if (sortConfig.key.includes('date')) {
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
      interestLevel: '',
      status: ''
    });
    setSearchTerm('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Offres d'alternance</h1>
        <button
          onClick={handleAddOffer}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une offre
        </button>
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
                placeholder="Rechercher par titre, entreprise, lieu ou technologies..."
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
            <label htmlFor="interestLevel" className="form-label">Niveau d'intérêt</label>
            <select
              id="interestLevel"
              name="interestLevel"
              className="form-input"
              value={filters.interestLevel}
              onChange={handleFilterChange}
            >
              <option value="">Tous les niveaux</option>
              <option value="prioritaire">Prioritaire</option>
              <option value="très intéressant">Très intéressant</option>
              <option value="intéressant">Intéressant</option>
              <option value="peu intéressant">Peu intéressant</option>
              <option value="non intéressant">Non intéressant</option>
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
              <option value="active">Active</option>
              <option value="expirée">Expirée</option>
              <option value="pourvue">Pourvue</option>
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

      {/* Liste des offres */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredAndSortedOffers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune offre trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter une nouvelle offre d'alternance.
          </p>
          <div className="mt-6">
            <button
              onClick={handleAddOffer}
              className="btn btn-primary"
            >
              Ajouter une offre
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="bg-gray-50 px-4 py-3 text-sm flex items-center justify-between border-b border-gray-200">
            <div>
              <span className="font-medium">{filteredAndSortedOffers.length}</span> offre(s) trouvée(s)
            </div>
            <div className="flex space-x-4">
              <button
                className="text-sm text-gray-600 flex items-center"
                onClick={() => requestSort('title')}
              >
                Titre {getSortIcon('title')}
              </button>
              <button
                className="text-sm text-gray-600 flex items-center"
                onClick={() => requestSort('company.name')}
              >
                Entreprise {getSortIcon('company.name')}
              </button>
              <button
                className="text-sm text-gray-600 flex items-center"
                onClick={() => requestSort('dates.publication')}
              >
                Date {getSortIcon('dates.publication')}
              </button>
            </div>
          </div>
          <ul className="divide-y divide-gray-200">
            {filteredAndSortedOffers.map(offer => (
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
                            offer.interestLevel === 'prioritaire' 
                              ? 'bg-red-100 text-red-800' 
                              : offer.interestLevel === 'très intéressant'
                              ? 'bg-orange-100 text-orange-800'
                              : offer.interestLevel === 'intéressant'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {offer.interestLevel}
                        </p>
                        <p 
                          className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            offer.status === 'active' 
                              ? 'bg-blue-100 text-blue-800' 
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
                          <BuildingOfficeIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {offer.company.name || 'Entreprise non spécifiée'}
                        </p>
                        <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                          <MapPinIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                          {offer.location}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <ClockIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        {offer.dates.publication 
                          ? format(new Date(offer.dates.publication), 'dd MMMM yyyy', { locale: fr })
                          : 'Date non spécifiée'
                        }
                        {offer.dates.deadline && (
                          <span className="ml-2">
                            &bull; Limite: {format(new Date(offer.dates.deadline), 'dd MMMM yyyy', { locale: fr })}
                          </span>
                        )}
                      </div>
                    </div>
                    {offer.technologies && offer.technologies.length > 0 && (
                      <div className="mt-2 flex flex-wrap">
                        {offer.technologies.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="mr-2 mb-1 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
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

export default Offers;