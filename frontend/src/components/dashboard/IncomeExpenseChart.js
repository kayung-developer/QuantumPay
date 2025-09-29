import React, { useMemo, useRef, useEffect } from 'react';
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
  Filler, // Important for the gradient fill
} from 'chart.js';
import { useTranslation } from 'react-i18next';
import { useAppearance } from '../../context/AppearanceContext';
import Spinner from '../common/Spinner';

// [REAL SYSTEM] Register all necessary Chart.js components
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

// Helper function to create the background gradient for the chart lines
const createGradient = (ctx, area, color1, color2) => {
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top);
  gradient.addColorStop(0, color1);
  gradient.addColorStop(1, color2);
  return gradient;
};

const IncomeExpenseChart = ({ chartData, isLoading, error }) => {
    const { t } = useTranslation();
    const { theme } = useAppearance();
    const chartRef = useRef(null); // Ref to access the chart instance

    const isDarkMode = useMemo(() => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
    }, [theme]);

    const chartOptions = useMemo(() => {
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 and slate-500

        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    align: 'end',
                    labels: { color: textColor, boxWidth: 12, padding: 20 },
                },
                tooltip: {
                    backgroundColor: isDarkMode ? '#0f172a' : '#ffffff', // slate-900
                    titleColor: isDarkMode ? '#f1f5f9' : '#0f172a', // slate-100
                    bodyColor: isDarkMode ? '#e2e8f0' : '#334155', // slate-200 and slate-700
                    borderColor: gridColor,
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: (context) => `${context.dataset.label}: ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(context.raw)}`,
                    },
                },
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: { color: textColor },
                },
                y: {
                    grid: { color: gridColor, borderDash: [3, 3] },
                    ticks: {
                        color: textColor,
                        callback: (value) => `$${value / 1000}k`,
                    },
                },
            },
            elements: {
                line: { tension: 0.4 },
                point: { radius: 0 },
            },
            interaction: {
                intersect: false,
                mode: 'index',
            },
        };
    }, [isDarkMode, textColor, gridColor]);

    const data = useMemo(() => {
        const chart = chartRef.current;
        let incomeGradient = 'rgba(22, 163, 74, 0.2)'; // Default fallback color
        let expenseGradient = 'rgba(239, 68, 68, 0.2)'; // Default fallback color

        if (chart) { // The chart context is required to create a gradient
            incomeGradient = createGradient(chart.ctx, chart.chartArea, 'rgba(22, 163, 74, 0)', 'rgba(22, 163, 74, 0.5)');
            expenseGradient = createGradient(chart.ctx, chart.chartArea, 'rgba(239, 68, 68, 0)', 'rgba(239, 68, 68, 0.5)');
        }

        return {
            labels: chartData.labels,
            datasets: [
                {
                    label: t('chart_income_label'),
                    data: chartData.income,
                    borderColor: '#16a34a', // green-600
                    backgroundColor: incomeGradient,
                    fill: true,
                },
                {
                    label: t('chart_expenses_label'),
                    data: chartData.expenses,
                    borderColor: '#ef4444', // red-500
                    backgroundColor: expenseGradient,
                    fill: true,
                },
            ],
        };
    }, [chartData, t, isDarkMode]); // Re-calculate if chartData or theme changes

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex h-full w-full items-center justify-center">
                    <Spinner />
                </div>
            );
        }
        if (error) {
            return <p className="text-center text-red-500">Could not load chart data.</p>;
        }
        if (!chartData || chartData.labels.length === 0) {
            return <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">{t('chart_empty_message')}</p>;
        }

        return <Line ref={chartRef} options={chartOptions} data={data} />;
    };

    return (
        <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg shadow border border-neutral-200 dark:border-neutral-800 h-full">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white font-display">
                {t('chart_title')}
            </h3>
            <div className="mt-4 h-80">
                {renderContent()}
            </div>
        </div>
    );
};

export default IncomeExpenseChart;