import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const ResponseTimeChart = ({ data, companies }) => {
    if (!data || !data.bySector || data.bySector.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    // Limiter à 8 secteurs maximum pour la lisibilité
    const chartData = data.bySector.slice(0, 8).map(item => ({
        name: item.sector,
        days: parseFloat(item.averageTime.toFixed(1))
    }));

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
                Délai de réponse moyen par secteur
            </h3>
            <div className="flex justify-center mb-4">
                <div className="bg-blue-100 rounded-lg p-3 text-center">
          <span className="block text-3xl font-bold text-blue-800">
            {data.averageResponseTime} jours
          </span>
                    <span className="text-sm text-blue-600">Délai moyen global</span>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={chartData}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis label={{ value: 'Jours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} jours`, 'Délai moyen']} />
                    <Legend />
                    <Bar dataKey="days" name="Délai moyen (jours)" fill="#3B82F6" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
export default ResponseTimeChart;