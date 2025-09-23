import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import Spinner from '../../components/common/Spinner';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const CashflowPage = () => {
    const { data, loading, error } = useApi('/business/cashflow-forecast');

    const chartData = {
        labels: data?.labels || [],
        datasets: [
            {
                label: 'Forecasted Balance',
                data: data?.forecast || [],
                borderColor: '#4F46E5', // primary
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                fill: 'origin',
                tension: 0.4,
            },
            {
                label: 'Upper Confidence',
                data: data?.confidence_upper || [],
                borderColor: 'rgba(100, 116, 139, 0.3)',
                pointRadius: 0,
                fill: false,
                tension: 0.4,
            },
             {
                label: 'Lower Confidence',
                data: data?.confidence_lower || [],
                borderColor: 'rgba(100, 116, 139, 0.3)',
                backgroundColor: 'rgba(100, 116, 139, 0.1)',
                pointRadius: 0,
                fill: '-1', // Fill to the dataset above (Upper Confidence)
                tension: 0.4,
            }
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            title: { display: true, text: '30-Day Cash Flow Forecast', color: '#F8FAFC', font: { size: 18, family: 'Lexend, sans-serif' } },
        },
        scales: {
            x: { grid: { color: 'rgba(100, 116, 139, 0.2)' }, ticks: { color: '#94A3B8' } },
            y: { grid: { color: 'rgba(100, 116, 139, 0.2)' }, ticks: { color: '#94A3B8' } },
        },
    };

    const renderContent = () => {
        if (loading) return <div className="flex justify-center items-center h-96"><Spinner size="lg"/></div>;
        if (error || data?.error) return <p className="text-center text-red-400">{error?.message || data.error}</p>;
        return <Line options={options} data={chartData} />;
    }

    return (
        <DashboardLayout pageTitleKey="cashflow_title">
            <div>
                <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Cash Flow</h1>
                <p className="mt-1 text-neutral-400">AI-powered 30-day forecast based on your historical transaction data.</p>
            </div>
            <div className="mt-6 bg-neutral-900 border border-neutral-800 rounded-lg p-6 shadow-lg h-96">
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default CashflowPage;
