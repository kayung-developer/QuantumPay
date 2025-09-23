import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { UserCircleIcon, ShieldCheckIcon, BellIcon, ExclamationTriangleIcon, PaintBrushIcon } from '@heroicons/react/24/outline'; // <-- Import new Icon
import ProfileSettings from '../../components/settings/ProfileSettings';
import SecuritySettings from '../../components/settings/SecuritySettings';
import NotificationSettings from '../../components/settings/NotificationSettings';
import DangerZone from '../../components/settings/DangerZone';
import AppearanceSettings from '../../components/settings/AppearanceSettings'; // <-- Import the new component

const TABS = [
    { name: 'Profile', icon: UserCircleIcon, component: ProfileSettings },
    // [THE IMPLEMENTATION] Add the new Appearance tab
    { name: 'Appearance', icon: PaintBrushIcon, component: AppearanceSettings },
    { name: 'Security', icon: ShieldCheckIcon, component: SecuritySettings },
    { name: 'Notifications', icon: BellIcon, component: NotificationSettings },
    { name: 'Danger Zone', icon: ExclamationTriangleIcon, component: DangerZone },
];

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState(TABS[0].name);

    const ActiveComponent = TABS.find(tab => tab.name === activeTab)?.component;

    return (
        <DashboardLayout pageTitleKey="settings_title"> {/* Use a translation key */}
            <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold font-display text-neutral-600 dark:text-white">Settings</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">Manage your profile, security, and notification preferences.</p>
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
                                        ? 'bg-primary/10 text-neutral-400 hover:bg-neutral-800'
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
                        {/* The component will render here */}
                        {ActiveComponent && <ActiveComponent />}
                    </main>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;