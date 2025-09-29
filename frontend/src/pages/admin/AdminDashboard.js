// FILE: src/pages/admin/AdminDashboard.js

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import StatCard from '../../components/dashboard/StatCard';

// --- Hook Imports ---
import { useApi } from '../../hooks/useApi';

// --- Icon Imports ---
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  DocumentCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
    // [THE DEFINITIVE IMPLEMENTATION]
    // Fetch real-time statistics from the new, secure admin-only endpoint.
    const { data: stats, loading, error } = useApi('/admin/dashboard-stats');

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    // A simple, robust error state for the whole page.
    if (error) {
        return (
            <DashboardLayout pageTitle="Admin Overview">
                 <div className="text-center p-8 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <h2 className="text-xl font-bold text-red-700 dark:text-red-300">Failed to Load Dashboard</h2>
                    <p className="mt-2 text-red-600 dark:text-red-400">Error loading dashboard statistics: {error.message}</p>
                 </div>
            </DashboardLayout>
        )
    }

  return (
    <DashboardLayout pageTitle="Admin Overview">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Platform Overview</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">
            A real-time snapshot of QuantumPay's key metrics and activities.
          </p>
        </div>

        {/* --- REAL-TIME Stat Cards Grid --- */}
        <motion.div
          className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <StatCard
            title="Total Users"
            value={stats?.total_users?.toLocaleString('en-US') ?? '...'}
            icon={UserGroupIcon}
            change={`+${stats?.users_last_7_days ?? 0} this week`}
            changeType="positive"
            isLoading={loading}
          />
          <StatCard
            title="Total Volume (30d)"
            value={`$${(stats?.total_volume_30d_usd ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
            icon={CurrencyDollarIcon}
            change={`${(stats?.volume_change_percent ?? 0) >= 0 ? '+' : ''}${(stats?.volume_change_percent ?? 0).toFixed(1)}%`}
            changeType={(stats?.volume_change_percent ?? 0) >= 0 ? 'positive' : 'negative'}
            isLoading={loading}
          />
          <StatCard
            title="Pending KYC"
            value={stats?.pending_kyc_count ?? '...'}
            icon={DocumentCheckIcon}
            change="Action Required"
            changeType="negative"
            isLoading={loading}
          />
          <StatCard
            title="Open Disputes"
            value={stats?.open_disputes_count ?? '...'}
            icon={ShieldExclamationIcon}
            change="Review Needed"
            changeType="negative"
            isLoading={loading}
          />
        </motion.div>

        {/* --- Quick Actions Panel --- */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg p-6"
        >
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-display">Quick Actions</h2>
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link to="/admin/users" className="block p-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                    <UserGroupIcon className="h-8 w-8 text-primary"/>
                    <p className="mt-2 font-semibold text-neutral-900 dark:text-white">Manage Users</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">View, edit, and manage all user accounts.</p>
                </Link>
                 <Link to="/admin/kyc-approvals" className="block p-4 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors">
                    <DocumentCheckIcon className="h-8 w-8 text-primary"/>
                    <p className="mt-2 font-semibold text-neutral-900 dark:text-white">Review KYC</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Process pending identity verifications.</p>
                </Link>
            </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;