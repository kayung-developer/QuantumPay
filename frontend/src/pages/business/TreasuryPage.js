// FILE: src/pages/business/TreasuryPage.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { SparklesIcon } from '@heroicons/react/24/solid';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import TreasuryRules from '../../components/business/TreasuryRules'; // <-- Import the component you already have

const TreasuryPage = () => {
    const { t } = useTranslation();

    return (
        <DashboardLayout pageTitleKey="sidebar_treasury">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white flex items-center">
                            <SparklesIcon className="h-8 w-8 mr-3 text-primary"/>
                            {t('sidebar_treasury')}
                        </h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                            Automate your cash flow, currency conversions, and liquidity management.
                        </p>
                    </div>
                </div>

                {/* Render the actual feature component here */}
                <div className="mt-8">
                    <TreasuryRules />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default TreasuryPage;