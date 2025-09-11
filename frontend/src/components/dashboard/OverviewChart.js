import React from 'react';
import { Line } from 'react-chartjs-2';
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
          color: '#CBD5E1', // neutral-300
          font: {
            family: 'Inter, sans-serif'
          }
        },
      },
      title: {
        display: true,
        text: 'Financial Overview',
        color: '#F8FAFC', // neutral-50
        font: {
            size: 18,
            family: 'Lexend, sans-serif'
        }
      },
      tooltip: {
        backgroundColor: '#1E293B', // neutral-800
        titleColor: '#F8FAFC',
        bodyColor: '#CBD5E1',
        borderColor: '#334155', // neutral-700
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
          color: 'rgba(100, 116, 139, 0.2)', // neutral-500 with opacity
          borderColor: '#475569', // neutral-600
        },
        ticks: {
          color: '#94A3B8', // neutral-400
        },
      },
      y: {
        grid: {
          color: 'rgba(100, 116, 139, 0.2)',
          borderColor: '#475569',
        },
        ticks: {
          color: '#94A3B8',
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
    <div className="relative bg-neutral-900 border border-neutral-800 rounded-lg p-6 shadow-lg h-96">
        {isLoading && <Shimmer />}
        <div className={`h-full ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
            <Line options={options} data={chartData} />
        </div>
    </div>
  );
};

export default OverviewChart;