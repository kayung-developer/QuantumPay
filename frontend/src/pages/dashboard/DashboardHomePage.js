import React, { useMemo, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import OverviewChart from '../../components/dashboard/OverviewChart';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import BusinessSetupModal from '../../components/business/BusinessSetupModal';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

// --- Hook Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';

// --- Icon Imports ---
import { WalletIcon, ArrowsRightLeftIcon, BanknotesIcon, ShieldCheckIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const DashboardHomePage = () => {
    const { t } = useTranslation();
    const { dbUser, fetchDbUser, loading: authLoading } = useAuth();
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

    // --- PARALLEL DATA FETCHING ---
    // The `useApi` hook now correctly waits for an auth token before firing.
    const { data: stats, loading: statsLoading, error: statsError } = useApi('/analytics/dashboard-stats');
    const { data: rawChartData, loading: chartLoading, error: chartError } = useApi('/analytics/income-expense-chart');
    const { data: transactions, loading: transactionsLoading, error: transactionsError } = useApi('/transactions/history?limit=5');

    // --- [DEFINITIVE FIX] This is the core logic to prevent rendering crashes ---
    // We explicitly check for the primary data loading states.
    const isLoading = authLoading || statsLoading || chartLoading || transactionsLoading;
    const hasError = statsError || chartError || transactionsError;

    // Memoize the chart data transformation to prevent re-calculation on every render
    const chartData = useMemo(() => {
        if (!rawChartData || !rawChartData.data_points) {
            return { labels: [], income: [], expenses: [] };
        }
        const labels = rawChartData.data_points.map(dp => dp.label);
        const incomeData = rawChartData.data_points.map(dp => dp.income);
        const expenseData = rawChartData.data_points.map(dp => dp.expenses);
        return { labels, income: incomeData, expenses: expenseData };
    }, [rawChartData]);
    
    // Helper to calculate the credit score percentage
    const getSecurePercentage = (score) => {
        if (!score) return 0;
        const percentage = ((score - 300) / (850 - 300)) * 100;
        return Math.round(Math.max(0, Math.min(100, percentage)));
    };
    
    const handleBusinessSetupSuccess = () => {
        setIsSetupModalOpen(false);
        fetchDbUser(); // Refetch the user to get the new business_profile object
    };

    // Animation variants for staggered loading effect
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 },
        },
    };

    // [DEFINITIVE FIX] Show a full-page loading spinner while initial data is being fetched.
    // This is the primary fix for the "blank page" / "disappearing UI" bug.
    if (isLoading && !stats) { // Only show full spinner on initial load
        return (
            <DashboardLayout pageTitleKey="dashboard_overview">
                <div className="flex h-96 w-full items-center justify-center">
                    <Spinner size="lg" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitleKey="dashboard_overview">
            <div className="space-y-8">
                {/* Welcome Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">
                        {t('welcome_back', { name: dbUser?.full_name || 'User' })}!
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        {t('dashboard_header_subtitle')}
                    </p>
                </motion.div>

                {/* Stat Cards Grid */}
                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* [ROBUSTNESS] Use optional chaining and nullish coalescing (?? 0) for all stats to prevent crashes. */}
                    <StatCard
                        title={t('total_balance')}
                        value={`$${(stats?.total_balance_usd_equivalent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={WalletIcon}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title={t('monthly_volume')}
                        value={`$${(stats?.monthly_volume_usd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                        icon={ArrowsRightLeftIcon}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title={t('monthly_transactions')}
                        value={stats?.transaction_count_30d ?? 0}
                        icon={BanknotesIcon}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title={t('credit_score')}
                        value={stats?.credit_score ?? 300}
                        icon={ShieldCheckIcon}
                        change={`${getSecurePercentage(stats?.credit_score)}% Secure`}
                        changeType="positive"
                        isLoading={statsLoading}
                    />
                </motion.div>

                {/* Business Profile CTA */}
                {!dbUser?.business_profile && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <BriefcaseIcon className="h-10 w-10 text-primary" />
                            <div className="ml-4">
                                <h3 className="font-semibold text-neutral-900 dark:text-white">{t('business_cta_title')}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('business_cta_subtitle')}</p>
                            </div>
                        </div>
                        <Button onClick={() => setIsSetupModalOpen(true)}>{t('business_cta_button')}</Button>
                    </motion.div>
                )}

                {/* Main Content Area: Chart and Recent Transactions */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <motion.div className="lg:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                       {/* [ROBUSTNESS] Pass the transformed chartData to the component. */}
                       <OverviewChart data={chartData} isLoading={chartLoading} error={chartError} />
                    </motion.div>
                    <motion.div className="lg:col-span-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                       {/* [ROBUSTNESS] Pass the transactions array, defaulting to an empty array. */}
                       <RecentTransactions
                            transactions={transactions || []}
                            isLoading={transactionsLoading}
                            error={transactionsError}
                            currentUserId={dbUser?.id}
                        />
                    </motion.div>
                </div>
            </div>

            {/* Business Setup Modal */}
            <BusinessSetupModal
                isOpen={isSetupModalOpen}
                onClose={() => setIsSetupModalOpen(false)}
                onSuccess={handleBusinessSetupSuccess}
            />
        </DashboardLayout>
    );
};

export default DashboardHomePage;
