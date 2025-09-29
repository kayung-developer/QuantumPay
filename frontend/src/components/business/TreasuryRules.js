// FILE: src/components/business/TreasuryRules.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import { StarIcon, SparklesIcon } from '@heroicons/react/24/solid';

// This is a reusable "Upgrade Prompt" component for gated features.
const UpgradePrompt = ({ featureName, requiredPlan }) => {
    const { t } = useTranslation();
    return (
        <div className="text-center p-8 bg-neutral-50 dark:bg-neutral-900 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <SparklesIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{featureName}</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                This is an advanced feature available on the <span className="font-bold">{requiredPlan}</span> plan. Upgrade your subscription to unlock this and other powerful tools.
            </p>
            <Link to="/pricing">
                <Button className="mt-6">View Pricing Plans</Button>
            </Link>
        </div>
    );
};

// The main TreasuryRules feature component
const TreasuryRules = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription, dbUser } = useAuth();

    // [THE DEFINITIVE FEATURE GATING LOGIC]
    // We check if the user has an active subscription for the 'ultimate' plan or higher.
    const isFeatureUnlocked = hasActiveSubscription('ultimate');

    // In a real component, you would use useApi to fetch existing rules
    // const { data: rules, loading, error } = useApi('/business/treasury/rules');
    const loading = false; // Placeholder
    const rules = []; // Placeholder

    if (!isFeatureUnlocked) {
        return <UpgradePrompt featureName="Automated Treasury Management" requiredPlan="Ultimate" />;
    }

    if (loading) {
        return <div className="p-8 text-center"><Spinner /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Treasury Rules</h2>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Automate your cash flow and currency conversions.</p>
                </div>
                <Button>Create New Rule</Button>
            </div>

            {rules.length > 0 ? (
                <div className="space-y-4">
                    {/* Map over and display existing rules here */}
                </div>
            ) : (
                <div className="text-center p-8 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                    <p className="text-neutral-600 dark:text-neutral-400">You haven't created any treasury rules yet.</p>
                </div>
            )}
        </div>
    );
};

export default TreasuryRules;