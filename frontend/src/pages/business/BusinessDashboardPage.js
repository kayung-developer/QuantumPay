import React, { useMemo } from 'react'; // <-- FIX #1: Import useMemo
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApi } from '../../hooks/useApi';
import { motion } from 'framer-motion';
import { ChartPieIcon, ShoppingBagIcon, BanknotesIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import StatCard from '../../components/dashboard/StatCard';
import OverviewChart from '../../components/dashboard/OverviewChart';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';
import BusinessActivityFeed from '../../components/dashboard/BusinessActivityFeed';

const BusinessDashboardPage = () => {
    // FIX #2: Rename the destructured variables to avoid conflicts and for clarity.
    const { data: stats, loading: statsLoading, error: statsError } = useApi('/business/dashboard-stats');
    const { data: rawChartData, loading: chartLoading, error: chartError } = useApi('/business/analytics/income-expense-chart');
    const { dbUser } = useAuth();

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
            transition: {
                staggerChildren: 0.1,
            },
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
                    {/* FIX #2 (continued): Pass the correct `statsLoading` variable to the isLoading prop */}
                    <StatCard
                        title={`Today's Sales (${stats?.primary_currency || '...'})`}
                        value={stats ? new Intl.NumberFormat().format(stats.total_sales_today) : '...'}
                        icon={ChartPieIcon}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title="Today's Transactions"
                        value={stats?.transaction_count_today ?? '...'}
                        icon={ShoppingBagIcon}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title={`Sales (30d)`}
                        value={stats ? new Intl.NumberFormat().format(stats.total_sales_30d) : '...'}
                        icon={BanknotesIcon}
                        isLoading={statsLoading}
                    />
                     <StatCard
                        title="Pending Expenses"
                        value={"0"}
                        icon={ArrowUpOnSquareIcon}
                        isLoading={statsLoading}
                    />
                </motion.div>

                {/* Chart and Recent Activity */}
                <div className="grid grid-cols-1">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                       {/* The chart has its own loading state, so we pass `chartLoading` */}
                       <OverviewChart data={chartData} isLoading={chartLoading} />
                       <BusinessActivityFeed />
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BusinessDashboardPage;