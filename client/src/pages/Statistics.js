import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ChartBarIcon } from '@heroicons/react/24/outline';

// Composants de statistiques
import StatsCards from '../components/dashboard/StatsCards';
import ApplicationsOverTimeChart from '../components/dashboard/ApplicationsOverTimeChart';
import ApplicationsBySectorChart from '../components/dashboard/ApplicationsBySectorChart';
import ApplicationsByStatusChart from '../components/dashboard/ApplicationsByStatusChart';
import ConversionRateChart from '../components/dashboard/ConversionRateChart';
import ResponseTimeChart from '../components/dashboard/ResponseTimeChart';
import TopTechnologiesChart from '../components/dashboard/TopTechnologiesChart';

// Services d'analyse
import {
    groupApplicationsByMonth,
    getApplicationsBySector,
    getApplicationsByStatus,
    getConversionRates,
    getResponseTimeStats,
    getTopTechnologies,
    getSuccessRate
} from '../services/analyticsService';

const Statistics = () => {
    const [applications, setApplications] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalApplications: 0,
        activeApplications: 0,
        acceptedApplications: 0,
        rejectedApplications: 0,
        successRate: 0,
        averageResponseTime: 0,
        uniqueCompanies: 0,
        totalOffers: 0
    });

    // Données pour les graphiques
    const [applicationsOverTime, setApplicationsOverTime] = useState([]);
    const [applicationsBySector, setApplicationsBySector] = useState([]);
    const [applicationsByStatus, setApplicationsByStatus] = useState([]);
    const [conversionRates, setConversionRates] = useState([]);
    const [responseTimeStats, setResponseTimeStats] = useState({});
    const [topTechnologies, setTopTechnologies] = useState([]);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);

            // Récupérer toutes les données nécessaires
            const [applicationsRes, companiesRes, offersRes] = await Promise.all([
                axios.get('/api/applications'),
                axios.get('/api/companies'),
                axios.get('/api/offers')
            ]);

            const applicationsData = applicationsRes.data.data;
            const companiesData = companiesRes.data.data;
            const offersData = offersRes.data.data;

            setApplications(applicationsData);
            setCompanies(companiesData);
            setOffers(offersData);

            // Calculer les statistiques
            calculateStatistics(applicationsData, companiesData, offersData);
        } catch (error) {
            toast.error('Erreur lors du chargement des données');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStatistics = (applicationsData, companiesData, offersData) => {
        // Statistiques de base
        const activeApplications = applicationsData.filter(app => !['acceptée', 'refusée'].includes(app.status)).length;
        const acceptedApplications = applicationsData.filter(app => app.status === 'acceptée').length;
        const rejectedApplications = applicationsData.filter(app => app.status === 'refusée').length;

        // Nombre d'entreprises uniques contactées
        const uniqueCompanyIds = new Set();
        applicationsData.forEach(app => {
            const companyId = app.company._id || app.company;
            uniqueCompanyIds.add(companyId);
        });

        // Succès et délai de réponse
        const successRate = getSuccessRate(applicationsData);
        const responseTimeData = getResponseTimeStats(applicationsData);

        // Mettre à jour les statistiques globales
        setStats({
            totalApplications: applicationsData.length,
            activeApplications,
            acceptedApplications,
            rejectedApplications,
            successRate,
            averageResponseTime: responseTimeData.averageResponseTime,
            uniqueCompanies: uniqueCompanyIds.size,
            totalOffers: offersData.length
        });

        // Préparer les données pour les graphiques
        setApplicationsOverTime(groupApplicationsByMonth(applicationsData));
        setApplicationsBySector(getApplicationsBySector(applicationsData, companiesData));
        setApplicationsByStatus(getApplicationsByStatus(applicationsData));
        setConversionRates(getConversionRates(applicationsData));
        setResponseTimeStats(responseTimeData);
        setTopTechnologies(getTopTechnologies(offersData));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Statistiques et Analyses</h1>
                <button
                    onClick={fetchAllData}
                    className="btn btn-primary flex items-center"
                >
                    <ChartBarIcon className="h-5 w-5 mr-2" />
                    Actualiser
                </button>
            </div>

            {/* Cartes de statistiques */}
            <StatsCards stats={stats} />

            {/* Graphiques sur 2 colonnes */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ApplicationsOverTimeChart data={applicationsOverTime} />
                <ApplicationsByStatusChart data={applicationsByStatus} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ApplicationsBySectorChart data={applicationsBySector} />
                <ResponseTimeChart data={responseTimeStats} companies={companies} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <ConversionRateChart data={conversionRates} />
                <TopTechnologiesChart data={topTechnologies} />
            </div>

            {/* Section d'explication des métriques */}
            <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Comprendre les métriques</h2>

                <div className="space-y-4">
                    <div>
                        <h3 className="font-medium text-gray-700">Taux de réussite</h3>
                        <p className="text-gray-600">Pourcentage de candidatures acceptées parmi celles ayant reçu une réponse définitive (acceptées ou refusées).</p>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-700">Taux de conversion</h3>
                        <p className="text-gray-600">Pourcentage de candidatures qui progressent d'une étape à la suivante dans le processus de recrutement.</p>
                    </div>

                    <div>
                        <h3 className="font-medium text-gray-700">Délai de réponse</h3>
                        <p className="text-gray-600">Nombre moyen de jours entre l'envoi d'une candidature et la réception d'une réponse ou d'une invitation à un entretien.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;

