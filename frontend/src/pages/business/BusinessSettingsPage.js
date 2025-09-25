import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { BuildingOfficeIcon, ScaleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// We will create these child components next
import GeneralBusinessSettings from '../../components/business/GeneralBusinessSettings';
import LegalBusinessSettings from '../../components/business/LegalBusinessSettings';
import BusinessDangerZone from '../../components/business/BusinessDangerZone';
import { useTranslation } from 'react-i18next';

const TABS = [
    { name: 'General', icon: BuildingOfficeIcon, component: GeneralBusinessSettings },
    { name: 'Legal Information', icon: ScaleIcon, component: LegalBusinessSettings },
    { name: 'Danger Zone', icon: ExclamationTriangleIcon, component: BusinessDangerZone },
];

const BusinessSettingsPage = () => {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState(TABS[0].name);
    const ActiveComponent = TABS.find(tab => tab.name === activeTab)?.component;

    return (
         <DashboardLayout pageTitleKey="business_settings_title">
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('business_settings_title')}</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('settings_header_subtitle')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
                                    <tab.icon className="h-5 w-5 mr-3"/>
                                    <span>{tab.name}</span>
                                </button>
                            ))}
                        </nav>
                    </aside>

                    <main className="md:col-span-3">
                        <motion.div
                            key={activeTab}
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