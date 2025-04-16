import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const TopTechnologiesChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Technologies les plus demandées</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart
                    data={data}
                    layout="vertical"
                    margin={{
                        top: 5,
                        right: 30,
                        left: 80,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12 }}
                    />
                    <Tooltip formatter={(value) => [`${value} offre(s)`, 'Fréquence']} />
                    <Bar dataKey="count" name="Nombre d'offres" fill="#6366F1" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
export default TopTechnologiesChart;