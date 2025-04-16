import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  PencilIcon, 
  TrashIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import CompanyForm from '../components/companies/CompanyForm';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/companies');
      if (response.data.success) {
        setCompanies(response.data.data);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des entreprises');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      try {
        const response = await axios.delete(`/api/companies/${id}`);
        if (response.data.success) {
          toast.success('Entreprise supprimée avec succès');
          setCompanies(companies.filter(company => company._id !== id));
        }
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'entreprise');
        console.error(error);
      }
    }
  };

  const openAddModal = () => {
    setCurrentCompany(null);
    setIsModalOpen(true);
  };

  const openEditModal = (company) => {
    setCurrentCompany(company);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCompany(null);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (currentCompany) {
        // Mode édition
        const response = await axios.put(`/api/companies/${currentCompany._id}`, formData);
        if (response.data.success) {
          toast.success('Entreprise mise à jour avec succès');
          setCompanies(companies.map(company => 
            company._id === currentCompany._id ? response.data.data : company
          ));
        }
      } else {
        // Mode création
        const response = await axios.post('/api/companies', formData);
        if (response.data.success) {
          toast.success('Entreprise ajoutée avec succès');
          setCompanies([...companies, response.data.data]);
        }
      }
      closeModal();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement de l\'entreprise');
      console.error(error);
    }
  };

  const filteredCompanies = companies.filter(company => 
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.sector.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (company.tags && company.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Entreprises</h1>
        <button
          onClick={openAddModal}
          className="btn btn-primary flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Ajouter une entreprise
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
            placeholder="Rechercher par nom, secteur ou tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Liste des entreprises */}
      {loading ? (
        <div className="flex items-center justify-center h-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : filteredCompanies.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-lg font-medium text-gray-900">Aucune entreprise trouvée</h3>
          <p className="mt-1 text-sm text-gray-500">
            Commencez par ajouter une nouvelle entreprise.
          </p>
          <div className="mt-6">
            <button
              onClick={openAddModal}
              className="btn btn-primary"
            >
              Ajouter une entreprise
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredCompanies.map(company => (
              <li key={company._id}>
                <div className="px-4 py-4 flex items-center sm:px-6">
                  <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <Link to={`/companies/${company._id}`} className="text-lg font-medium text-primary-600 hover:text-primary-900">
                        {company.name}
                      </Link>
                      <p className="mt-1 text-sm text-gray-500">
                        Secteur: {company.sector}
                      </p>
                      {company.tags && company.tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap">
                          {company.tags.map((tag, tagIndex) => (
                            <span 
                              key={tagIndex}
                              className="mr-2 mb-2 px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                      <div className="flex overflow-hidden">
                        <button
                          onClick={() => openEditModal(company)}
                          className="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          <PencilIcon className="h-5 w-5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => handleDelete(company._id)}
                          className="ml-2 inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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

      {/* Modal pour ajouter/éditer une entreprise */}
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
                  {currentCompany ? 'Modifier l\'entreprise' : 'Ajouter une entreprise'}
                </h3>
                <div className="mt-4">
                  <CompanyForm 
                    initialData={currentCompany} 
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

export default Companies;