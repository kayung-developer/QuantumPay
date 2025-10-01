// FILE: src/pages/business/TreasuryPage.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { toast } from 'react-hot-toast';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import UpgradePrompt from '../../components/common/UpgradePrompt';
import CreateTreasuryRuleModal from '../../components/business/CreateTreasuryRuleModal'; // <-- Import the new modal

// --- Hook Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';

// --- Icon Imports ---
import { SparklesIcon, PlusIcon, ArrowRightIcon, PowerIcon } from '@heroicons/react/24/solid';


// --- Sub-component to render a single rule ---
const RuleCard = ({ rule }) => {
    return (
        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-bold text-neutral-900 dark:text-white">{rule.name}</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 flex items-center space-x-2">
                    <span>Sweep {rule.source_wallet_id.substring(0,3)}...</span>
                    <ArrowRightIcon className="h-4 w-4" />
                    <span>{rule.destination_wallet_id.substring(0,3)}...</span>
                </p>
            </div>
            <div className="text-right">
                <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${rule.is_active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300'}`}>
                    {rule.is_active ? 'Active' : 'Disabled'}
                </span>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                    Last run: {rule.last_executed ? formatDistanceToNow(parseISO(rule.last_executed), { addSuffix: true }) : 'Never'}
                </p>
            </div>
        </div>
    );
};

// --- Main Treasury Page Component ---
const TreasuryPage = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth();

    const isFeatureUnlocked = hasActiveSubscription('ultimate');

    const { data: rules, loading, error, request: refetchRules } = useApi('/business/treasury/rules', {}, !isFeatureUnlocked);

    // [THE DEFINITIVE FIX] State and handlers for the modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleSuccess = (newRule) => {
        setIsCreateModalOpen(false);
        refetchRules();
        toast.success(`Treasury rule "${newRule.name}" created successfully!`);
    };

    const renderContent = () => {
        if (!isFeatureUnlocked) {
            return <UpgradePrompt featureName="Automated Treasury" requiredPlan="Ultimate" />;
        }
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <p className="p-12 text-center text-red-500">Could not load your treasury rules.</p>;
        }
        if (!rules || rules.length === 0) {
            return (
                 <div className="text-center py-20 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                    <SparklesIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="mt-2 text-sm font-semibold text-neutral-800 dark:text-white">Automate Your Cash Flow</h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Create your first rule to automatically manage wallet balances.</p>
                </div>
            )
        }

        return (
            <div className="space-y-4">
                {rules.map(rule => <RuleCard key={rule.id} rule={rule} />)}
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="sidebar_treasury">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white flex items-center">
                        <SparklesIcon className="h-8 w-8 mr-3 text-primary"/>
                        {t('sidebar_treasury')}
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        Automate your cash flow, currency conversions, and liquidity management.
                    </p>
                </div>
                {isFeatureUnlocked && (
                    <Button onClick={() => setIsCreateModalOpen(true)}>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create New Rule
                    </Button>
                )}
            </div>

            {renderContent()}

            {isFeatureUnlocked && (
                <CreateTreasuryRuleModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </DashboardLayout>
    );
};

export default TreasuryPage;
