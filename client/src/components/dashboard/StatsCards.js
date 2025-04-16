import React from 'react';
import {
    DocumentTextIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    ChartBarIcon,
    BuildingOfficeIcon,
    BriefcaseIcon
} from '@heroicons/react/24/outline';

const StatsCard = ({ title, value, icon: Icon, color }) => {
    return (
        <div className={`bg-white rounded-lg shadow overflow-hidden`}>
            <div className="p-5 flex items-center">
                <div className={`flex-shrink-0 rounded-md p-3 ${color}`}>
                    <Icon className={`h-6 w-6 ${color.includes('blue') ? 'text-blue-600' : color.includes('green') ? 'text-green-600' : color.includes('red') ? 'text-red-600' : color.includes('yellow') ? 'text-yellow-600' : 'text-gray-600'}`} />
                </div>
                <div className="ml-5 w-0 flex-1">
                    <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
                        <dd>
                            <div className="text-lg font-medium text-gray-900">{value}</div>
                        </dd>
                    </dl>
                </div>
            </div>
        </div>
    );
};

const StatsCards = ({ stats }) => {
    return (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatsCard
                title="Candidatures totales"
                value={stats.totalApplications}
                icon={DocumentTextIcon}
                color="bg-blue-100"
            />
            <StatsCard
                title="Taux de réussite"
                value={`${stats.successRate}%`}
                icon={ChartBarIcon}
                color="bg-green-100"
            />
            <StatsCard
                title="Délai moyen de réponse"
                value={`${stats.averageResponseTime} jours`}
                icon={ClockIcon}
                color="bg-yellow-100"
            />
            <StatsCard
                title="En cours"
                value={stats.activeApplications}
                icon={ClockIcon}
                color="bg-blue-100"
            />
            <StatsCard
                title="Entreprises contactées"
                value={stats.uniqueCompanies}
                icon={BuildingOfficeIcon}
                color="bg-blue-100"
            />
            <StatsCard
                title="Offres suivies"
                value={stats.totalOffers}
                icon={BriefcaseIcon}
                color="bg-blue-100"
            />
            <StatsCard
                title="Acceptées"
                value={stats.acceptedApplications}
                icon={CheckCircleIcon}
                color="bg-green-100"
            />
            <StatsCard
                title="Refusées"
                value={stats.rejectedApplications}
                icon={XCircleIcon}
                color="bg-red-100"
            />
        </div>
    );
};

export default StatsCards;