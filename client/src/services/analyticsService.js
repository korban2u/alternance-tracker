/**
 * Services pour l'analyse et le traitement des données de candidature
 */

// Format et traitement des données pour les graphiques
const formatDateForGrouping = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const formatMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split('-');
    const monthNames = [
        'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
        'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
};

// Grouper les candidatures par mois
export const groupApplicationsByMonth = (applications) => {
    const monthGroups = {};

    // Initialiser les groupes avec toutes les dates où nous avons des données
    applications.forEach(app => {
        const monthKey = formatDateForGrouping(app.createdAt);
        if (!monthGroups[monthKey]) {
            monthGroups[monthKey] = {
                month: formatMonthLabel(monthKey),
                total: 0,
                byStatus: {
                    'à envoyer': 0,
                    'envoyée': 0,
                    'relance effectuée': 0,
                    'entretien planifié': 0,
                    'en attente de réponse': 0,
                    'acceptée': 0,
                    'refusée': 0
                }
            };
        }
    });

    // Trier les clés de mois par ordre chronologique
    const sortedMonthKeys = Object.keys(monthGroups).sort();

    // Compter les candidatures pour chaque mois
    applications.forEach(app => {
        const monthKey = formatDateForGrouping(app.createdAt);
        monthGroups[monthKey].total += 1;

        // Incrémenter le compteur pour ce statut
        if (app.status) {
            monthGroups[monthKey].byStatus[app.status] += 1;
        }
    });

    // Convertir l'objet en tableau pour Chart.js
    return sortedMonthKeys.map(key => ({
        name: monthGroups[key].month,
        total: monthGroups[key].total,
        ...monthGroups[key].byStatus
    }));
};

// Calculer la répartition des candidatures par secteur
export const getApplicationsBySector = (applications, companies) => {
    // Créer un dictionnaire companyId -> sector pour un accès rapide
    const companySectors = {};
    companies.forEach(company => {
        companySectors[company._id] = company.sector;
    });

    // Regrouper par secteur
    const sectorCount = {};
    applications.forEach(app => {
        // Gérer le cas où company est un objet ou juste un ID
        const companyId = app.company._id || app.company;
        const sector = companySectors[companyId] || 'Non spécifié';

        if (!sectorCount[sector]) {
            sectorCount[sector] = 0;
        }
        sectorCount[sector] += 1;
    });

    // Trier les secteurs par nombre de candidatures (ordre décroissant)
    return Object.entries(sectorCount)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);
};

// Calculer la répartition des candidatures par statut
export const getApplicationsByStatus = (applications) => {
    const statusCount = {
        'à envoyer': 0,
        'envoyée': 0,
        'relance effectuée': 0,
        'entretien planifié': 0,
        'en attente de réponse': 0,
        'acceptée': 0,
        'refusée': 0
    };

    applications.forEach(app => {
        if (app.status) {
            statusCount[app.status] += 1;
        }
    });

    return Object.entries(statusCount)
        .map(([name, value]) => ({ name, value }))
        .filter(item => item.value > 0); // Filtrer les statuts sans candidatures
};

// Calculer le taux de conversion par étape
export const getConversionRates = (applications) => {
    // Définir les étapes du processus dans l'ordre
    const stages = [
        'à envoyer',
        'envoyée',
        'relance effectuée',
        'entretien planifié',
        'en attente de réponse',
        'acceptée'
    ];

    // Compter le nombre de candidatures à chaque étape
    const stageCounts = {};
    stages.forEach(stage => {
        stageCounts[stage] = applications.filter(app => app.status === stage).length;
    });

    // Calculer les taux de conversion entre les étapes
    const conversionRates = [];
    for (let i = 0; i < stages.length - 1; i++) {
        const currentStage = stages[i];
        const nextStage = stages[i + 1];
        const currentCount = stageCounts[currentStage];
        const nextCount = stageCounts[nextStage];

        let rate = 0;
        if (currentCount > 0) {
            rate = (nextCount / currentCount) * 100;
        }

        conversionRates.push({
            from: currentStage,
            to: nextStage,
            rate: parseFloat(rate.toFixed(1))
        });
    }

    return conversionRates;
};

// Calculer les délais de réponse moyens
export const getResponseTimeStats = (applications) => {
    // Filtrer les candidatures avec des entrées de timeline pertinentes
    const applicationsWithResponses = applications.filter(app =>
        app.timeline && app.timeline.length >= 2
    );

    const responseTimesByCompany = {};
    const responseTimesBySector = {};
    let totalResponseTime = 0;
    let totalCount = 0;

    applicationsWithResponses.forEach(app => {
        // Trouver la date d'envoi (première entrée avec "envoi" ou "envoyée")
        const sentEntry = app.timeline.find(entry =>
            entry.action.toLowerCase().includes('envoi') ||
            entry.action.toLowerCase().includes('envoyée')
        );

        // Trouver la date de réponse (première entrée après l'envoi qui mentionne une réponse)
        let responseEntry = null;
        if (sentEntry) {
            responseEntry = app.timeline.find(entry =>
                new Date(entry.date) > new Date(sentEntry.date) &&
                (entry.action.toLowerCase().includes('réponse') ||
                    entry.action.toLowerCase().includes('refus') ||
                    entry.action.toLowerCase().includes('accepté') ||
                    entry.action.toLowerCase().includes('entretien'))
            );
        }

        if (sentEntry && responseEntry) {
            // Calculer le délai en jours
            const sentDate = new Date(sentEntry.date);
            const responseDate = new Date(responseEntry.date);
            const responseTime = Math.round((responseDate - sentDate) / (1000 * 60 * 60 * 24));

            // Ajouter au total
            totalResponseTime += responseTime;
            totalCount++;

            // Grouper par entreprise
            const companyId = app.company._id || app.company;
            if (!responseTimesByCompany[companyId]) {
                responseTimesByCompany[companyId] = { total: 0, count: 0 };
            }
            responseTimesByCompany[companyId].total += responseTime;
            responseTimesByCompany[companyId].count++;

            // Si nous avons l'objet company complet et qu'il a un secteur
            if (app.company.sector) {
                const sector = app.company.sector;
                if (!responseTimesBySector[sector]) {
                    responseTimesBySector[sector] = { total: 0, count: 0 };
                }
                responseTimesBySector[sector].total += responseTime;
                responseTimesBySector[sector].count++;
            }
        }
    });

    // Calculer les moyennes
    const averageResponseTime = totalCount > 0 ? totalResponseTime / totalCount : 0;

    // Préparer les données par entreprise
    const companyResponseTimes = Object.entries(responseTimesByCompany).map(([companyId, data]) => ({
        companyId,
        averageTime: data.count > 0 ? data.total / data.count : 0
    }));

    // Préparer les données par secteur
    const sectorResponseTimes = Object.entries(responseTimesBySector).map(([sector, data]) => ({
        sector,
        averageTime: data.count > 0 ? data.total / data.count : 0
    }));

    return {
        averageResponseTime: parseFloat(averageResponseTime.toFixed(1)),
        byCompany: companyResponseTimes,
        bySector: sectorResponseTimes.sort((a, b) => b.averageTime - a.averageTime)
    };
};

// Calculer les statistiques sur les compétences demandées
export const getTopTechnologies = (offers) => {
    const technologyCount = {};

    offers.forEach(offer => {
        if (offer.technologies && Array.isArray(offer.technologies)) {
            offer.technologies.forEach(tech => {
                const normalizedTech = tech.toLowerCase().trim();
                if (!technologyCount[normalizedTech]) {
                    technologyCount[normalizedTech] = 0;
                }
                technologyCount[normalizedTech] += 1;
            });
        }
    });

    // Convertir en tableau et trier par fréquence décroissante
    return Object.entries(technologyCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Prendre les 10 plus fréquentes
};

// Calculer le taux de réussite global
export const getSuccessRate = (applications) => {
    if (applications.length === 0) return 0;

    const respondedApplications = applications.filter(app =>
        app.status === 'acceptée' || app.status === 'refusée'
    );

    const successfulApplications = applications.filter(app =>
        app.status === 'acceptée'
    );

    if (respondedApplications.length === 0) return 0;

    return parseFloat(((successfulApplications.length / respondedApplications.length) * 100).toFixed(1));
};