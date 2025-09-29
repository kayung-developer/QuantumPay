// FILE: src/pages/business/BusinessSettingsPage.js

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import GeneralBusinessSettings from '../../components/business/settings/GeneralBusinessSettings';
import LegalBusinessSettings from '../../components/business/settings/LegalBusinessSettings';
import BusinessDangerZone from '../../components/business/settings/BusinessDangerZone';

// --- Icon Imports ---
import { BuildingOfficeIcon, ScaleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// This configuration object defines the navigation tabs and which component to render for each.
const TABS = [
    { name: 'General', icon: BuildingOfficeIcon, component: GeneralBusinessSettings },
    { name: 'Legal Information', icon: ScaleIcon, component: LegalBusinessSettings },
    { name: 'Danger Zone', icon: ExclamationTriangleIcon, component: BusinessDangerZone },
];

const BusinessSettingsPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(TABS[0].name);
    
    // Dynamically find the component to render based on the active tab.
    const ActiveComponent = TABS.find(tab => tab.name === activeTab)?.component;

    return (
         <DashboardLayout pageTitleKey="business_settings_title">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('business_settings_title')}</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('settings_header_subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* --- Tab Navigation Sidebar --- */}
                    <aside className="md:col-span-1">
                        <nav className="space-y-1">
                            {TABS.map(tab => (
                                <button
                                    key={tab.name}
                                    onClick={() => setActiveTab(tab.name)}
                                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        activeTab === tab.name
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    <tab.icon className="h-5 w-5 mr-3 flex-shrink-0"/>
                                    <span>{t(`settings_nav_${tab.name.toLowerCase().replace(' ', '_')}`, { defaultValue: tab.name })}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    {/* --- Main Content Area for the Active Tab --- */}
                    <main className="md:col-span-3">
                        <motion.div
                            key={activeTab} // This key is crucial for framer-motion to detect a component change and re-animate
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                           {ActiveComponent && <ActiveComponent />}
                        </motion.div>
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default BusinessSettingsPage;