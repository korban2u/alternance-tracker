import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BuildingOfficeIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CalendarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';

// Importer les composants de statistiques
import ApplicationsOverTimeChart from '../components/dashboard/ApplicationsOverTimeChart';
import ApplicationsByStatusChart from '../components/dashboard/ApplicationsByStatusChart';
import {
  groupApplicationsByMonth,
  getApplicationsByStatus,
  getSuccessRate
} from '../services/analyticsService';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    totalOffers: 0,
    totalApplications: 0,
    activeApplications: 0,
    successfulApplications: 0,
    rejectedApplications: 0,
    successRate: 0
  });

  const [upcomingActions, setUpcomingActions] = useState([]);
  const [recentApplications, setRecentApplications] = useState([]);
  const [applicationsOverTime, setApplicationsOverTime] = useState([]);
  const [applicationsByStatus, setApplicationsByStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch companies count
      const companiesResponse = await axios.get('/api/companies');

      // Fetch offers count
      const offersResponse = await axios.get('/api/offers');

      // Fetch applications and their statistics
      const applicationsResponse = await axios.get('/api/applications');

      const applications = applicationsResponse.data.data;

      // Calculate application statistics
      const activeApplications = applications.filter(app =>
          !['acceptée', 'refusée'].includes(app.status)
      ).length;

      const successfulApplications = applications.filter(app =>
          app.status === 'acceptée'
      ).length;

      const rejectedApplications = applications.filter(app =>
          app.status === 'refusée'
      ).length;

      // Calculate success rate
      const successRate = getSuccessRate(applications);

      // Get upcoming actions (applications with nextActionDate in the future)
      const upcoming = applications
          .filter(app => app.nextActionDate && new Date(app.nextActionDate) > new Date())
          .sort((a, b) => new Date(a.nextActionDate) - new Date(b.nextActionDate))
          .slice(0, 5);

      // Get recent applications
      const recent = [...applications]
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5);

      // Prepare chart data
      const applicationsTimeData = groupApplicationsByMonth(applications);
      const statusData = getApplicationsByStatus(applications);

      setStats({
        totalCompanies: companiesResponse.data.count,
        totalOffers: offersResponse.data.count,
        totalApplications: applications.length,
        activeApplications,
        successfulApplications,
        rejectedApplications,
        successRate
      });

      setUpcomingActions(upcoming);
      setRecentApplications(recent);
      setApplicationsOverTime(applicationsTimeData);
      setApplicationsByStatus(statusData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Tableau de bord</h1>
          <Link to="/statistics" className="btn btn-primary flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2" />
            Statistiques détaillées
          </Link>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                <BuildingOfficeIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Entreprises</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalCompanies}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/companies" className="font-medium text-primary-600 hover:text-primary-500">
                  Voir toutes les entreprises
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-md p-3">
                <BriefcaseIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Offres</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalOffers}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/offers" className="font-medium text-blue-600 hover:text-blue-500">
                  Voir toutes les offres
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                <DocumentTextIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Candidatures</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.totalApplications}</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/applications" className="font-medium text-green-600 hover:text-green-500">
                  Voir toutes les candidatures
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5 flex items-center">
              <div className="flex-shrink-0 bg-indigo-100 rounded-md p-3">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Taux de réussite</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{stats.successRate}%</div>
                  </dd>
                </dl>
              </div>
            </div>
            <div className="bg-gray-50 px-5 py-3">
              <div className="text-sm">
                <Link to="/statistics" className="font-medium text-indigo-600 hover:text-indigo-500">
                  Voir les statistiques
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Statut des candidatures */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Statut des candidatures</h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="bg-yellow-50 rounded-md p-4 flex">
                <ClockIcon className="h-10 w-10 text-yellow-500" />
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-yellow-800">En cours</h4>
                  <p className="mt-1 text-2xl font-semibold text-yellow-900">{stats.activeApplications}</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-md p-4 flex">
                <CheckCircleIcon className="h-10 w-10 text-green-500" />
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-green-800">Acceptées</h4>
                  <p className="mt-1 text-2xl font-semibold text-green-900">{stats.successfulApplications}</p>
                </div>
              </div>

              <div className="bg-red-50 rounded-md p-4 flex">
                <XCircleIcon className="h-10 w-10 text-red-500" />
                <div className="ml-4">
                  <h4 className="text-sm font-medium text-red-800">Refusées</h4>
                  <p className="mt-1 text-2xl font-semibold text-red-900">{stats.rejectedApplications}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Graphiques */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <ApplicationsOverTimeChart data={applicationsOverTime} />
          <ApplicationsByStatusChart data={applicationsByStatus} />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Actions à venir */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Actions à venir</h3>
              <CalendarIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-200">
              {upcomingActions.length === 0 ? (
                  <p className="px-4 py-5 text-sm text-gray-500 text-center">Aucune action à venir</p>
              ) : (
                  upcomingActions.map((action) => (
                      <div key={action._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {action.company?.name || 'Entreprise'} - {action.nextAction}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {new Date(action.nextActionDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                            <p>Statut: {action.status}</p>
                          </div>
                          <Link
                              to={`/applications/${action._id}`}
                              className="text-sm font-medium text-primary-600 hover:text-primary-500"
                          >
                            Voir détails
                          </Link>
                        </div>
                      </div>
                  ))
              )}
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <Link
                  to="/applications"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Voir toutes les candidatures
              </Link>
            </div>
          </div>

          {/* Candidatures récentes */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Candidatures récentes</h3>
              <DocumentTextIcon className="h-5 w-5 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-200">
              {recentApplications.length === 0 ? (
                  <p className="px-4 py-5 text-sm text-gray-500 text-center">Aucune candidature récente</p>
              ) : (
                  recentApplications.map((application) => (
                      <div key={application._id} className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-primary-600 truncate">
                            {application.company?.name || 'Entreprise'} - {application.offer?.title || 'Candidature spontanée'}
                          </p>
                          <div className="ml-2 flex-shrink-0 flex">
                            <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                application.status === 'acceptée'
                                    ? 'bg-green-100 text-green-800'
                                    : application.status === 'refusée'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {application.status}
                            </p>
                          </div>
                        </div>
                        <div className="mt-2 sm:flex sm:justify-between">
                          <div className="sm:flex">
                            <p className="flex items-center text-sm text-gray-500">
                              <DocumentTextIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                              {application.type === 'offre' ? 'Offre' : 'Spontanée'}
                            </p>
                          </div>
                          <div className="mt-2 flex justify-between items-center text-sm sm:mt-0">
                            <p className="text-gray-500">
                              {format(new Date(application.createdAt), 'dd/MM/yyyy', { locale: fr })}
                            </p>
                            <Link
                                to={`/applications/${application._id}`}
                                className="ml-4 text-sm font-medium text-primary-600 hover:text-primary-500"
                            >
                              Voir détails
                            </Link>
                          </div>
                        </div>
                      </div>
                  ))
              )}
            </div>
            <div className="bg-gray-50 px-4 py-4 sm:px-6">
              <Link
                  to="/applications"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500"
              >
                Voir toutes les candidatures
              </Link>
            </div>
          </div>
        </div>
      </div>
  );
};

export default Dashboard;