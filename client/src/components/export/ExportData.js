import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';

const ExportData = () => {
  const [companies, setCompanies] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState('json');
  const [exportTarget, setExportTarget] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const [companiesRes, offersRes, applicationsRes] = await Promise.all([
        axios.get('/api/companies'),
        axios.get('/api/offers'),
        axios.get('/api/applications')
      ]);
      
      setCompanies(companiesRes.data.data);
      setOffers(offersRes.data.data);
      setApplications(applicationsRes.data.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    let dataToExport;
    let fileName;
    
    // Déterminer quelles données exporter
    switch (exportTarget) {
      case 'companies':
        dataToExport = companies;
        fileName = 'entreprises';
        break;
      case 'offers':
        dataToExport = offers;
        fileName = 'offres';
        break;
      case 'applications':
        dataToExport = applications;
        fileName = 'candidatures';
        break;
      case 'all':
      default:
        dataToExport = {
          companies,
          offers,
          applications
        };
        fileName = 'toutes_les_donnees';
        break;
    }
    
    // Format d'export
    if (exportType === 'json') {
      exportAsJSON(dataToExport, fileName);
    } else if (exportType === 'csv') {
      exportAsCSV(dataToExport, fileName);
    }
  };

  const exportAsJSON = (data, fileName) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    downloadBlob(blob, `${fileName}.json`);
  };

  const exportAsCSV = (data, fileName) => {
    let csvContent;
    
    // Si c'est un tableau, nous pouvons le traiter directement
    if (Array.isArray(data)) {
      csvContent = arrayToCSV(data);
    } 
    // Si c'est un objet contenant plusieurs tableaux, nous créons un fichier zip
    else {
      // Dans une implémentation réelle, nous utiliserions JSZip
      // Pour la simplicité, nous exportons seulement le premier tableau
      const firstKey = Object.keys(data)[0];
      csvContent = arrayToCSV(data[firstKey]);
      fileName = firstKey;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `${fileName}.csv`);
  };

  const arrayToCSV = (array) => {
    if (!array || array.length === 0) return '';
    
    // Extraire les en-têtes du premier objet
    const headers = Object.keys(array[0]);
    
    // Créer la ligne d'en-tête
    let csvContent = headers.join(',') + '\n';
    
    // Ajouter les lignes de données
    array.forEach(item => {
      const row = headers.map(header => {
        let cell = item[header];
        
        // Gérer les objets imbriqués et les tableaux
        if (typeof cell === 'object' && cell !== null) {
          cell = JSON.stringify(cell);
        }
        
        // Échapper les guillemets et entourer la cellule de guillemets si elle contient une virgule
        if (cell !== undefined && cell !== null) {
          cell = String(cell).replace(/"/g, '""');
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
            cell = `"${cell}"`;
          }
        } else {
          cell = '';
        }
        
        return cell;
      }).join(',');
      
      csvContent += row + '\n';
    });
    
    return csvContent;
  };

  const downloadBlob = (blob, fileName) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
    
    toast.success(`Le fichier ${fileName} a été téléchargé avec succès`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Exportation des données
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Exportez vos données dans différents formats pour les utiliser dans d'autres applications.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="exportTarget" className="form-label">Données à exporter</label>
          <select
            id="exportTarget"
            name="exportTarget"
            className="form-input"
            value={exportTarget}
            onChange={(e) => setExportTarget(e.target.value)}
          >
            <option value="all">Toutes les données</option>
            <option value="companies">Entreprises</option>
            <option value="offers">Offres</option>
            <option value="applications">Candidatures</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="exportType" className="form-label">Format d'exportation</label>
          <select
            id="exportType"
            name="exportType"
            className="form-input"
            value={exportType}
            onChange={(e) => setExportType(e.target.value)}
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BuildingOfficeIcon className="h-8 w-8 text-primary-500 mr-3" />
            <div>
              <h4 className="text-lg font-medium text-gray-900">Entreprises</h4>
              <p className="text-sm text-gray-500">{companies.length} entreprises</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BriefcaseIcon className="h-8 w-8 text-blue-500 mr-3" />
            <div>
              <h4 className="text-lg font-medium text-gray-900">Offres</h4>
              <p className="text-sm text-gray-500">{offers.length} offres</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DocumentTextIcon className="h-8 w-8 text-green-500 mr-3" />
            <div>
              <h4 className="text-lg font-medium text-gray-900">Candidatures</h4>
              <p className="text-sm text-gray-500">{applications.length} candidatures</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleExport}
          className="btn btn-primary flex items-center"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Exporter les données
        </button>
      </div>

      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
        <h4 className="text-sm font-medium text-yellow-800">Note sur l'exportation</h4>
        <p className="mt-1 text-sm text-yellow-700">
          L'exportation au format CSV peut ne pas inclure toutes les relations et les données imbriquées. 
          Pour une exportation complète avec toutes les relations, utilisez le format JSON.
        </p>
      </div>
    </div>
  );
};

export default ExportData;