// FILE: src/pages/business/BusinessDashboardPage.js

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import IncomeExpenseChart from '../../components/dashboard/IncomeExpenseChart';
import BusinessActivityFeed from '../../components/dashboard/BusinessActivityFeed';
import Button from '../../components/common/Button';

// --- Hook Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';

// --- Icon Imports ---
import { ChartPieIcon, BanknotesIcon, ArrowUpOnSquareIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const BusinessDashboardPage = () => {
    const { dbUser } = useAuth();
    
    // [THE FIX] Destructure and rename loading/error states for each API call to avoid conflicts.
    const { data: stats, loading: statsLoading, error: statsError } = useApi('/business/dashboard-stats');
    const { data: rawChartData, loading: chartLoading, error: chartError } = useApi('/business/analytics/income-expense-chart');

    // [THE FIX] Safely transform chart data using useMemo, handling null or undefined initial states.
    const chartData = useMemo(() => {
        if (!rawChartData || !rawChartData.data_points) {
            return { labels: [], income: [], expenses: [] };
        }
        const labels = rawChartData.data_points.map(dp => dp.label);
        const incomeData = rawChartData.data_points.map(dp => dp.income);
        const expenseData = rawChartData.data_points.map(dp => dp.expenses);
        return { labels, income: incomeData, expenses: expenseData };
    }, [rawChartData]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    return (
        <DashboardLayout pageTitleKey="business_dashboard_title">
            <div className="space-y-8">
                {/* Header and Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">
                            {dbUser?.business_profile?.business_name || 'Business Dashboard'}
                        </h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                            A real-time overview of your business operations.
                        </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex space-x-3">
                         <Link to="/business/invoicing/new">
                            <Button variant="secondary">Create Invoice</Button>
                         </Link>
                         <Link to="/business/payroll">
                            <Button>Run Payroll</Button>
                         </Link>
                    </div>
                </div>

                {/* Stat Cards Grid */}
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* [THE FIX] Use nullish coalescing operator (??) as a failsafe for all stat values. */}
                    <StatCard
                        title={`Sales Today (${stats?.primary_currency ?? '...'})`}
                        value={(stats?.total_sales_today ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        icon={ChartPieIcon}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title="Transactions Today"
                        value={stats?.transaction_count_today ?? '...'}
                        icon={DocumentTextIcon}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title={`Sales (30d)`}
                        value={(stats?.total_sales_30d ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        icon={BanknotesIcon}
                        isLoading={statsLoading}
                    />
                     <StatCard
                        title="Pending Expenses"
                        value={stats?.pending_expenses_count ?? '...'}
                        icon={ArrowUpOnSquareIcon}
                        isLoading={statsLoading}
                    />
                </motion.div>

                {/* Chart and Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <motion.div
                        className="lg:col-span-2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                       {/* [THE UPGRADE] Use the superior, theme-aware chart component. */}
                       <IncomeExpenseChart data={chartData} isLoading={chartLoading} error={chartError} />
                    </motion.div>
                    
                    <motion.div
                        className="lg:col-span-1"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        {/* [THE UPGRADE] Add the new activity feed component. */}
                        <BusinessActivityFeed />
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BusinessDashboardPage;