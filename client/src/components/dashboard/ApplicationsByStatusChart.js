import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

const statusColors = {
    'à envoyer': '#9CA3AF',
    'envoyée': '#3B82F6',
    'relance effectuée': '#8B5CF6',
    'entretien planifié': '#6366F1',
    'en attente de réponse': '#F59E0B',
    'acceptée': '#10B981',
    'refusée': '#EF4444'
};

const ApplicationsByStatusChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    const statusNames = {
        'à envoyer': 'À envoyer',
        'envoyée': 'Envoyée',
        'relance effectuée': 'Relancée',
        'entretien planifié': 'Entretien',
        'en attente de réponse': 'En attente',
        'acceptée': 'Acceptée',
        'refusée': 'Refusée'
    };

    // Transformer les données pour afficher des noms plus courts sur le graphique
    const formattedData = data.map(item => ({
        ...item,
        displayName: statusNames[item.name] || item.name
    }));

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par statut</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={formattedData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="displayName" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} candidature(s)`, 'Nombre']} />
                    <Legend />
                    <Bar dataKey="value" name="Candidatures" fill="#3B82F6">
                        {formattedData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={statusColors[entry.name] || '#3B82F6'} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
export default ApplicationsByStatusChart;