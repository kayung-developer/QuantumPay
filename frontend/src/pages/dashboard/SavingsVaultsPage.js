// FILE: src/pages/dashboard/SavingsVaultsPage.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import UpgradePrompt from '../../components/common/UpgradePrompt';

// --- Hook Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';

// --- Icon Imports ---
import { BanknotesIcon, PlusIcon } from '@heroicons/react/24/solid';

const SavingsVaultsPage = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth();
    
    // [THE FEATURE GATING LOGIC]
    // The feature is available for 'premium' and 'ultimate' subscribers.
    const isFeatureUnlocked = hasActiveSubscription('premium');
    
    // The API call is now conditional. It will not run if the feature is locked.
    const { data: vaults, loading, error } = useApi('/savings', {}, !isFeatureUnlocked);
    
    // State for a future "Create Vault" modal.
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    const renderContent = () => {
        // --- 1. Gate the feature ---
        if (!isFeatureUnlocked) {
            return <UpgradePrompt featureName="Savings Vaults" requiredPlan="Premium" />;
        }
        
        // --- 2. Handle API states ---
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <p className="p-12 text-center text-red-500">Could not load your savings vaults.</p>;
        }
        if (!vaults || vaults.length === 0) {
            return (
                 <div className="text-center py-20 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                    <BanknotesIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="mt-2 text-sm font-semibold text-neutral-800 dark:text-white">Create Your First Savings Vault</h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Set a goal and start saving automatically.</p>
                </div>
            )
        }
        
        // --- 3. Render the vaults grid ---
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vaults.map(vault => {
                        const progress = vault.goal_amount > 0 ? (vault.balance / vault.goal_amount) * 100 : 0;
                        return (
                            <div key={vault.id} className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                                <h3 className="font-bold text-lg text-neutral-900 dark:text-white">{vault.name}</h3>
                                <p className="text-2xl font-bold text-primary mt-2">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: vault.currency }).format(vault.balance)}
                                </p>
                                
                                {vault.goal_amount > 0 && (
                                    <>
                                        <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 mt-4">
                                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                        </div>
                                        <div className="flex justify-between items-center text-xs text-neutral-500 mt-1">
                                            <span>{Math.round(progress)}% complete</span>
                                            <span>Goal: {new Intl.NumberFormat('en-US', { style: 'currency', currency: vault.currency }).format(vault.goal_amount)}</span>
                                        </div>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
                {/* 
                    Placeholder for Automation Rules. This would be another gated component
                    that only appears for 'ultimate' subscribers.
                    {hasActiveSubscription('ultimate') && <AutomationRulesComponent />}
                */}
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
                    <Button onClick={() => setCreateModalOpen(true)}>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        {t('create_vault_button')}
                    </Button>
                )}
            </div>
            {renderContent()}
            {/*
              A future CreateSavingsVaultModal would be rendered here:
              <CreateSavingsVaultModal isOpen={isCreateModalOpen} onClose={() => setCreateModalOpen(false)} />
            */}
        </DashboardLayout>
    );
};

export default SavingsVaultsPage;