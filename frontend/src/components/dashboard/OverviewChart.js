import React from 'react';
import { Line } from 'react-chartjs-2';
import { useAppearance } from '../../context/AppearanceContext';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const OverviewChart = ({ data, isLoading }) => {
const { colorScheme } = useAppearance();
  const chartData = {
    labels: data?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Income',
        data: data?.income || [],
        borderColor: '#10B981', // secondary
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#10B981',
      },
      {
        label: 'Expenses',
        data: data?.expenses || [],
        borderColor: '#EF4444', // red-500
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#EF4444',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: colorScheme === 'dark' ? '#CBD5E1' : '#475569',
          font: {
            family: 'Inter, sans-serif'
          }
        },
      },
      title: {
        display: true,
        text: 'Financial Overview',
        color: colorScheme === 'dark' ? '#F8FAFC' : '#0F172A', // neutral-50
        font: {
            size: 18,
            family: 'Lexend, sans-serif'
        }
      },
      tooltip: {
        backgroundColor: colorScheme === 'dark' ? '#1E293B' : '#FFFFFF', titleColor: colorScheme === 'dark' ? '#F8FAFC' : '#0F172A', bodyColor: colorScheme === 'dark' ? '#CBD5E1' : '#334155', borderColor: colorScheme === 'dark' ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        callbacks: {
            label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                    label += ': ';
                }
                if (context.parsed.y !== null) {
                    label += new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.parsed.y);
                }
                return label;
            }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: colorScheme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.5)', // neutral-500 with opacity
          borderColor: '#475569', // neutral-600
        },
        ticks: {
          color: colorScheme === 'dark' ? '#94A3B8' : '#64748B', // neutral-400
        },
      },
      y: {
        grid: {
          color: colorScheme === 'dark' ? 'rgba(100, 116, 139, 0.2)' : 'rgba(203, 213, 225, 0.5)',
          borderColor: '#475569',
        },
        ticks: {
          color: colorScheme === 'dark' ? '#94A3B8' : '#64748B',
          callback: function(value) {
             return '$' + value / 1000 + 'k';
          }
        },
      },
    },
  };

  // Shimmer effect for loading state
  const Shimmer = () => (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent animate-shimmer" />
  );

  return (
    <div className="relative bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 shadow-lg h-96">
        {isLoading && <Shimmer />}
        <div className={`h-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <Line options={options} data={chartData} />
        </div>
    </div>
  );
};

export default OverviewChart;