// FILE: src/pages/business/TreasuryPage.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import UpgradePrompt from '../../components/common/UpgradePrompt'; // Assuming you have this
import { SparklesIcon } from '@heroicons/react/24/solid';

const TreasuryPage = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth();
    
    // [THE FEATURE GATING LOGIC]
    const isFeatureUnlocked = hasActiveSubscription('ultimate');

    const { data: rules, loading, error } = useApi('/business/treasury/rules', {}, !isFeatureUnlocked);

    const renderContent = () => {
        if (!isFeatureUnlocked) {
            return <UpgradePrompt featureName="Automated Treasury Management" requiredPlan="Ultimate" />;
        }
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <p className="text-red-500 text-center">Could not load your treasury rules.</p>;
        }
        
        return (
            <div className="space-y-4">
                {/* A button to open a creation modal would go here */}
                <Button>Create New Rule</Button>
                
                {rules && rules.length > 0 ? (
                    rules.map(rule => (
                        <div key={rule.id} className="p-4 bg-white dark:bg-neutral-900 border rounded-lg">
                            <p className="font-bold text-neutral-900 dark:text-white">{rule.name}</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                When balance is greater than {rule.trigger_amount}, sweep excess funds.
                            </p>
                            {/* More details and edit/delete buttons would go here */}
                        </div>
                    ))
                ) : (
                    <div className="text-center p-12 border-2 border-dashed rounded-lg">
                        <p>You haven't set up any automation rules yet.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout pageTitle="Treasury">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white flex items-center">
                        <SparklesIcon className="h-8 w-8 mr-3 text-primary"/>
                        Automated Treasury
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        Set rules to automatically manage your cash flow and multi-currency balances.
                    </p>
                </div>
            </div>
            {renderContent()}
        </DashboardLayout>
    );
};

export default TreasuryPage;