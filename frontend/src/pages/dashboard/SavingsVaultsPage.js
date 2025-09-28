// FILE: src/pages/dashboard/SavingsVaultsPage.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import UpgradePrompt from '../../components/common/UpgradePrompt';
import { BanknotesIcon, PlusIcon, SparklesIcon } from '@heroicons/react/24/solid';

const SavingsVaultsPage = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth();
    const isFeatureUnlocked = hasActiveSubscription('premium');
    
    const { data: vaults, loading, error } = useApi('/savings', {}, !isFeatureUnlocked);

    const renderContent = () => {
        if (!isFeatureUnlocked) {
            return <UpgradePrompt featureName="Savings Vaults" requiredPlan="Premium" />;
        }
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <p className="text-red-500 text-center">Could not load your savings vaults.</p>;
        }
        
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vaults && vaults.map(vault => (
                        <div key={vault.id} className="p-6 bg-white dark:bg-neutral-900 border rounded-lg shadow">
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{vault.name}</h3>
                            <p className="text-2xl font-bold text-primary mt-2">
                                {new Intl.NumberFormat('en-US', { style: 'currency', currency: vault.currency }).format(vault.balance)}
                            </p>
                            {/* Progress Bar */}
                            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 mt-4">
                                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${(vault.balance / vault.goal_amount) * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-neutral-500 mt-1">
                                Goal: {new Intl.NumberFormat('en-US', { style: 'currency', currency: vault.currency }).format(vault.goal_amount)}
                            </p>
                        </div>
                    ))}
                </div>
                {/* Automation Rules section would go here, gated for Ultimate users */}
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="savings_vaults_title">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white flex items-center">
                        <BanknotesIcon className="h-8 w-8 mr-3 text-primary"/>
                        {t('savings_vaults_title')}
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        {t('savings_vaults_subtitle')}
                    </p>
                </div>
                {isFeatureUnlocked && (
                    <Button onClick={() => {/* Open Create Modal */}}>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        {t('create_vault_button')}
                    </Button>
                )}
            </div>
            {renderContent()}
        </DashboardLayout>
    );
};

export default SavingsVaultsPage;