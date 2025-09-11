import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';

// Import Dashboard components
import StatCard from '../../components/dashboard/StatCard';
import OverviewChart from '../../components/dashboard/OverviewChart';
import RecentTransactions from '../../components/dashboard/RecentTransactions';
import CurrencySwitcher from '../../components/dashboard/CurrencySwitcher';
import { useTranslation } from 'react-i18next';

// Import icons for StatCards
import { WalletIcon, ArrowsRightLeftIcon, BanknotesIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const DashboardHomePage = () => {
  const { dbUser } = useAuth();
  const { t } = useTranslation();

  // --- REAL-SYSTEM DATA FETCHING ---
  // 1. Fetch real-time dashboard statistics from our new analytics endpoint.
  const { data: stats, loading: statsLoading, error: statsError } = useApi('/analytics/dashboard-stats');

  // 2. Fetch the 5 most recent transactions.
  const { data: transactions, loading: transactionsLoading, error: transactionsError } = useApi('/transactions/history?limit=5');

  // A single loading state for the entire dashboard UI.
  const isLoading = statsLoading || transactionsLoading;

  // Dummy data for the chart, as a dedicated chart endpoint is a future step.
  // A real implementation would fetch this from an endpoint like `/analytics/income-expense-chart`.
  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    income: [4000, 3000, 5000, 4500, 6000, 7500],
    expenses: [2400, 1900, 2800, 3100, 4200, 4800],
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
    <DashboardLayout pageTitle={t('Overview')}>
      <div className="space-y-8">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold font-display text-white">
            {t('welcome_back', { name: dbUser?.full_name || 'User' })}!
          </h1>
          <p className="mt-1 text-neutral-400">
            Here's a snapshot of your financial activity.
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

        {/* Main Content Area: Chart and Real Recent Transactions */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <OverviewChart data={chartData} isLoading={isLoading} />
          </motion.div>

          <motion.div
            className="lg:col-span-1"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* --- Pass REAL transaction data to the component --- */}
            <RecentTransactions
                transactions={transactions}
                isLoading={isLoading}
                currentUserId={dbUser?.id}
            />
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHomePage;