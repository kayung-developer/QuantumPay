import React, { useMemo, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';

import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
// Import Dashboard components
import StatCard from '../../components/dashboard/StatCard';
import OverviewChart from '../../components/dashboard/OverviewChart';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import CurrencySwitcher from '../../components/dashboard/CurrencySwitcher';
import { useTranslation } from 'react-i18next';

// Import icons for StatCards
import { WalletIcon, ArrowsRightLeftIcon, BanknotesIcon, ShieldCheckIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

import BusinessSetupModal from '../../components/business/BusinessSetupModal';

const DashboardHomePage = () => {
  const { t } = useTranslation();
  const { dbUser, fetchDbUser, loading: authLoading } = useAuth();
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);

// --- PARALLEL DATA FETCHING ---
  const { data: stats, loading: statsLoading, error: statsError, request: refetchStats } = useApi('/analytics/dashboard-stats');
  const { data: transactions, loading: transactionsLoading, error: transactionsError, request: refetchTransactions } = useApi('/transactions/history?limit=5');
  const { data: wallets, loading: walletsLoading, error: walletsError, request: refetchWallets } = useApi('/wallets/me');

    // [THE IMPLEMENTATION - Step 1] Fetch real chart data from our new endpoint.
  const { data: rawChartData, loading: chartLoading, error: chartError, request: refetchChart } = useApi('/analytics/income-expense-chart');

    // isLoading and hasError flags now include the new chart data source
  const isLoading = authLoading || statsLoading || transactionsLoading || walletsLoading || chartLoading;
  const hasError = statsError || transactionsError || walletsError || chartError;

  const chartData = useMemo(() => {
        if (!rawChartData || !rawChartData.data_points) {
            return { labels: [], income: [], expenses: [] };
        }
        // This transformation logic is critical for the chart component
      const labels = rawChartData.data_points.map(dp => dp.label);
      const incomeData = rawChartData.data_points.map(dp => dp.income);
      const expenseData = rawChartData.data_points.map(dp => dp.expenses);

        return { labels, income: incomeData, expenses: expenseData };
    }, [rawChartData]);

        const handleBusinessSetupSuccess = () => {
        setIsSetupModalOpen(false);
        fetchDbUser(); // <-- CRITICAL: Refetch the user profile to get the new business_profile object
    };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };


  // Helper to calculate the "secure" percentage for the credit score
  const getSecurePercentage = (score) => {
      if (!score) return 0;
      // Scale from 300-850 range to 0-100
      const percentage = ((score - 300) / (850 - 300)) * 100;
      return Math.round(Math.max(0, Math.min(100, percentage)));
  }

  return (
    //<DashboardLayout pageTitle="Overview">
    <DashboardLayout pageTitleKey="dashboard_overview">
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">
            {t('welcome_back', { name: dbUser?.full_name || 'User' })}!
          </h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            {t('dashboard_header_subtitle')}
          </p>
        </motion.div>

        {/* --- REAL-TIME Stat Cards Grid --- */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            title={t('total_balance')}
            // Use optional chaining and nullish coalescing for safety
            value={`$${(stats?.total_balance_usd_equivalent ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={WalletIcon}
            // Change data would come from the API in a real system
            change="+5.2%"
            changeType="positive"
            isLoading={isLoading}
          />
          <StatCard
            title={t('monthly_volume')}
            value={`$${(stats?.monthly_volume_usd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={ArrowsRightLeftIcon}
            change="-1.8%"
            changeType="negative"
            isLoading={isLoading}
          />
          <StatCard
            title={t('monthly_transactions')}
            value={stats?.transaction_count_30d ?? 0}
            icon={BanknotesIcon}
            // This 'change' value could also be part of the API response
            change="+10"
            changeType="positive"
            isLoading={isLoading}
          />
          <StatCard
            title={t('credit_score')}
            value={stats?.credit_score ?? 300}
            icon={ShieldCheckIcon}
            change={`${getSecurePercentage(stats?.credit_score)}% Secure`}
            changeType="positive"
            isLoading={isLoading}
          />
        </motion.div>

        {!dbUser?.business_profile && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-primary/10 dark:bg-primary/20 border border-primary/20 dark:border-primary/30 rounded-lg flex items-center justify-between"
                    >
                        <div className="flex items-center">
                            <BriefcaseIcon className="h-10 w-10 text-primary" />
                            <div className="ml-4">
                              <h3 className="font-semibold text-neutral-900 dark:text-white">{t('business_cta_title')}</h3>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                {t('business_cta_subtitle')}
                            </p>
                            </div>
                        </div>
                        <Button onClick={() => setIsSetupModalOpen(true)}>{t('business_cta_button')}</Button>
                    </motion.div>
        )}

        {/* Main Content Area: Chart and Real Recent Transactions */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                       {/* [THE IMPLEMENTATION - Step 3] Pass the real, transformed chartData to the component */}
                       <OverviewChart data={chartData} isLoading={chartLoading} />
                    </motion.div>
                    <motion.div className="lg:col-span-1" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                       <RecentTransactions
                            transactions={transactions}
                            isLoading={transactionsLoading}
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