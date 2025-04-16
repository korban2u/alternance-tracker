import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const ApplicationsOverTimeChart = ({ data }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 bg-white rounded-lg border border-gray-200">
                <p className="text-gray-500">Aucune donnée disponible</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Évolution des candidatures</h3>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart
                    data={data}
                    margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="total"
                        name="Total"
                        stroke="#3B82F6"
                        activeDot={{ r: 8 }}
                        strokeWidth={2}
                    />
                    <Line
                        type="monotone"
                        dataKey="acceptée"
                        name="Acceptées"
                        stroke="#10B981"
                    />
                    <Line
                        type="monotone"
                        dataKey="refusée"
                        name="Refusées"
                        stroke="#EF4444"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ApplicationsOverTimeChart;
