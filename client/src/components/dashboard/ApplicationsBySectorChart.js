import React from 'react';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6',
    '#F97316', '#06B6D4', '#0EA5E9', '#8B5CF6'
];

const ApplicationsBySectorChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Répartition par secteur</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} candidature(s)`, 'Nombre']} />
                    <Legend layout="vertical" verticalAlign="middle" align="right" />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ApplicationsBySectorChart;