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
    LabelList
} from 'recharts';

const statusNames = {
    'à envoyer': 'À envoyer',
    'envoyée': 'Envoyée',
    'relance effectuée': 'Relancée',
    'entretien planifié': 'Entretien',
    'en attente de réponse': 'En attente',
    'acceptée': 'Acceptée',
    'refusée': 'Refusée'
};

const ConversionRateChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    // Formater les données pour l'affichage
    const formattedData = data.map(item => ({
        ...item,
        name: `${statusNames[item.from] || item.from} → ${statusNames[item.to] || item.to}`,
        conversionRate: item.rate
    }));

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Taux de conversion par étape</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={formattedData}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 50,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis label={{ value: 'Taux (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Taux de conversion']} />
                    <Legend />
                    <Bar dataKey="conversionRate" name="Taux de conversion (%)" fill="#3B82F6">
                        <LabelList dataKey="conversionRate" position="top" formatter={(value) => `${value}%`} />
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ConversionRateChart;