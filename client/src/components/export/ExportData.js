import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  DocumentArrowDownIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

const ExportData = () => {
  const [companies, setCompanies] = useState([]);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportType, setExportType] = useState('json');
  const [exportTarget, setExportTarget] = useState('all');
  const [fileToImport, setFileToImport] = useState(null);
  const [importTarget, setImportTarget] = useState('companies');
  const [importLoading, setImportLoading] = useState(false);

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
    switch (exportType) {
      case 'json':
        exportAsJSON(dataToExport, fileName);
        break;
      case 'csv':
        exportAsCSV(dataToExport, fileName);
        break;
      case 'excel':
        exportAsExcel(dataToExport, fileName);
        break;
      case 'pdf':
        exportAsPDF(dataToExport, fileName);
        break;
      default:
        exportAsJSON(dataToExport, fileName);
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
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      downloadBlob(blob, `${fileName}.csv`);
    }
    // Si c'est un objet contenant plusieurs tableaux, nous créons un fichier zip
    else {
      import('jszip').then(JSZip => {
        const zip = new JSZip.default();

        // Créer un fichier CSV pour chaque entité
        Object.keys(data).forEach(key => {
          const csvData = arrayToCSV(data[key]);
          zip.file(`${key}.csv`, csvData);
        });

        // Générer le fichier ZIP
        zip.generateAsync({ type: 'blob' }).then(content => {
          downloadBlob(content, `${fileName}.zip`);
        });
      });
    }
  };

  const exportAsExcel = (data, fileName) => {
    // Créer un nouveau classeur
    const workbook = XLSX.utils.book_new();

    // Si c'est un tableau, créer une seule feuille
    if (Array.isArray(data)) {
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, fileName);
    }
    // Si c'est un objet contenant plusieurs tableaux, créer plusieurs feuilles
    else {
      Object.keys(data).forEach(key => {
        const worksheet = XLSX.utils.json_to_sheet(data[key]);
        XLSX.utils.book_append_sheet(workbook, worksheet, key);
      });
    }

    // Convertir le classeur en blob et télécharger
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    downloadBlob(blob, `${fileName}.xlsx`);
  };

  const exportAsPDF = (data, fileName) => {
    // Création du document PDF
    const doc = new jsPDF();

    // Fonction pour ajouter une table
    const addTable = (title, tableData) => {
      doc.setFontSize(16);
      doc.text(title, 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 15 : 15);

      if (tableData.length > 0) {
        // Extraire les en-têtes de la première ligne
        const headers = Object.keys(tableData[0]);

        // Préparer les données pour la table
        const rows = tableData.map(item => headers.map(header => {
          const value = item[header];
          if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
          }
          return value;
        }));

        // Ajouter la table au document
        doc.autoTable({
          head: [headers],
          body: rows,
          startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 20 : 20
        });
      } else {
        doc.setFontSize(12);
        doc.text('Aucune donnée disponible', 14, doc.lastAutoTable ? doc.lastAutoTable.finalY + 25 : 25);
      }
    };

    // Fonction pour ajouter une page si nécessaire
    const addPageIfNeeded = () => {
      if (doc.lastAutoTable && doc.lastAutoTable.finalY > 250) {
        doc.addPage();
      }
    };

    // Si c'est un tableau, ajouter une seule table
    if (Array.isArray(data)) {
      addTable(fileName.charAt(0).toUpperCase() + fileName.slice(1), data);
    }
    // Si c'est un objet contenant plusieurs tableaux, ajouter plusieurs tables
    else {
      // Ajouter le titre du document
      doc.setFontSize(20);
      doc.text('Export de données AltTracker', 14, 15);

      // Ajouter une table pour chaque entité
      Object.keys(data).forEach((key, index) => {
        if (index > 0) {
          addPageIfNeeded();
        }

        // Titre de la section
        const title = key.charAt(0).toUpperCase() + key.slice(1);
        addTable(title, data[key]);
      });
    }

    // Sauvegarder le fichier PDF
    doc.save(`${fileName}.pdf`);
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
    saveAs(blob, fileName);
    toast.success(`Le fichier ${fileName} a été téléchargé avec succès`);
  };

  const handleFileChange = (e) => {
    setFileToImport(e.target.files[0]);
  };

  const handleImport = async () => {
    if (!fileToImport) {
      toast.error('Veuillez sélectionner un fichier à importer');
      return;
    }

    setImportLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', fileToImport);
      formData.append('target', importTarget);

      const response = await axios.post('/api/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        toast.success('Données importées avec succès');

        // Rafraîchir les données
        fetchData();

        // Réinitialiser le formulaire
        setFileToImport(null);
        document.getElementById('file-upload').value = '';
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'importation des données');
      console.error(error);
    } finally {
      setImportLoading(false);
    }
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
              <option value="excel">Excel (XLSX)</option>
              <option value="pdf">PDF</option>
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

        <div className="border-t border-gray-200 pt-6 mt-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Importation des données
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Importez des données à partir de fichiers CSV ou Excel.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="importTarget" className="form-label">Type de données à importer</label>
              <select
                  id="importTarget"
                  name="importTarget"
                  className="form-input"
                  value={importTarget}
                  onChange={(e) => setImportTarget(e.target.value)}
              >
                <option value="companies">Entreprises</option>
                <option value="offers">Offres</option>
                <option value="applications">Candidatures</option>
              </select>
            </div>

            <div>
              <label htmlFor="file-upload" className="form-label">Fichier à importer (CSV, XLSX)</label>
              <input
                  id="file-upload"
                  name="file"
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  className="form-input"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button
                onClick={handleImport}
                disabled={!fileToImport || importLoading}
                className="btn btn-primary flex items-center"
            >
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              {importLoading ? 'Importation en cours...' : 'Importer les données'}
            </button>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h4 className="text-sm font-medium text-yellow-800">Notes sur l'importation et l'exportation</h4>
          <p className="mt-1 text-sm text-yellow-700">
            <strong>Exportation:</strong> L'exportation au format PDF et Excel peut ne pas inclure toutes les données imbriquées.
            Pour une exportation complète avec toutes les relations, utilisez le format JSON.
          </p>
          <p className="mt-2 text-sm text-yellow-700">
            <strong>Importation:</strong> Assurez-vous que le fichier CSV ou Excel respecte la structure attendue.
            Les champs obligatoires doivent être présents et correctement formatés.
          </p>
        </div>
      </div>
  );
};

export default ExportData;