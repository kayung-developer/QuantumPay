// FILE: src/pages/dashboard/DashboardHomePage.js

import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import BusinessSetupModal from '../../components/business/BusinessSetupModal';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import IncomeExpenseChart from '../../components/dashboard/IncomeExpenseChart';

// --- Hook Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';

// --- Icon Imports ---
import { WalletIcon, ArrowsRightLeftIcon, BanknotesIcon, ShieldCheckIcon, BriefcaseIcon } from '@heroicons/react/24/outline';

const DashboardHomePage = () => {
    const { t } = useTranslation();
    const { dbUser, fetchDbUser, loading: authLoading } = useAuth();
    const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

    const { data: stats, loading: statsLoading, error: statsError } = useApi('/analytics/dashboard-stats');
    const { data: rawChartData, loading: chartLoading, error: chartError } = useApi('/analytics/income-expense-chart');
    const { data: transactionsData, loading: transactionsLoading, error: transactionsError } = useApi('/transactions/history?limit=5');
    
    const transactions = transactionsData?.transactions || [];
    const isLoading = authLoading || statsLoading || chartLoading || transactionsLoading;

    const chartData = useMemo(() => {
        if (!rawChartData || !rawChartData.data_points) return { labels: [], income: [], expenses: [] };
        const labels = rawChartData.data_points.map(dp => dp.label);
        const incomeData = rawChartData.data_points.map(dp => dp.income);
        const expenseData = rawChartData.data_points.map(dp => dp.expenses);
        return { labels, income: incomeData, expenses: expenseData };
    }, [rawChartData]);

    const handleBusinessSetupSuccess = () => {
        setIsSetupModalOpen(false);
        fetchDbUser();
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    
    if (isLoading && !stats && !dbUser) {
        return (
            <DashboardLayout pageTitleKey="dashboard_overview">
                <div className="flex h-96 w-full items-center justify-center"><Spinner size="lg" /></div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitleKey="dashboard_overview">
            <div className="space-y-8">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">
                        {t('welcome_back', { name: dbUser?.full_name || 'User' })}!
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('dashboard_header_subtitle')}</p>
                </motion.div>

                <motion.div
                    className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <StatCard
                        title={t('total_balance')}
                        value={`$${(stats?.total_balance_usd_equivalent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                        icon={WalletIcon}
                        isLoading={statsLoading}
                    />
                    <StatCard
                        title={t('monthly_volume')}
                        value={`$${(stats?.monthly_volume_usd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
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
                        value={stats?.credit_score ?? '...'}
                        // [THE DEFINITIVE FIX] Add conditional logic to prevent 'NaN' from rendering.
                        change={stats?.credit_score ? `${Math.round(((stats.credit_score - 300) / 550) * 100)}% Secure` : 'Calculating...'}
                        changeType="positive"
                        isLoading={statsLoading}
                    />
                </motion.div>

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

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <motion.div className="lg:col-span-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                       <IncomeExpenseChart chartData={chartData} isLoading={chartLoading} error={chartError} />
                    </motion.div>
                    <motion.div className="lg:col-span-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                       <RecentTransactions
                            transactions={transactions}
                            isLoading={transactionsLoading}
                            error={transactionsError}
                            currentUserId={dbUser?.id}
                        />
                    </motion.div>
                </div>
            </div>

            <BusinessSetupModal
                isOpen={isSetupModalOpen}
                onClose={() => setIsSetupModalOpen(false)}
                onSuccess={handleBusinessSetupSuccess}
            />
        </DashboardLayout>
    );
};

export default DashboardHomePage;
