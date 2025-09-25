import React from 'react';
import SettingsCard from './SettingsCard';
import { useAppearance } from '../../context/AppearanceContext';
import { useTranslation } from 'react-i18next';
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';

// The list of languages we support, to build the dropdown dynamically.
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français (French)' },
    { code: 'es', name: 'Español (Spanish)' },
    { code: 'pt', name: 'Português (Portuguese)' },
    { code: 'sw', name: 'Kiswahili (Swahili)' },
];

const AppearanceSettings = () => {
    const { theme, setTheme, setLanguage } = useAppearance();
    const { i18n } = useTranslation();

    const themeOptions = [
        { value: 'light', label: 'Light', icon: SunIcon },
        { value: 'dark', label: 'Dark', icon: MoonIcon },
        { value: 'system', label: 'System', icon: ComputerDesktopIcon },
    ];

    return (
        <SettingsCard
            title="Appearance"
            description="Customize the look and feel of your QuantumPay experience."
        >
            <div className="space-y-6">
                {/* --- Theme Selector --- */}
                <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Theme</label>
                    <div className="mt-2 grid grid-cols-3 gap-3">
                        {themeOptions.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => setTheme(option.value)}
                                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-colors ${
                                    theme === option.value
                                    ? 'border-primary bg-primary/10'
                                    : 'border-neutral-300 dark:border-neutral-700 bg-neutral-800 hover:border-neutral-600'
                                }`}
                            >
                                <option.icon className={`h-6 w-6 mb-2 ${theme === option.value ? 'text-primary' : 'text-neutral-600 dark:text-neutral-400'}`} />
                                <span className={`text-sm font-medium ${theme === option.value ? 'text-white' : 'text-neutral-700 dark:text-neutral-300'}`}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* --- Language Selector --- */}
                <div>
                    <label htmlFor="language-select" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Language</label>
                    <select
                        id="language-select"
                        value={i18n.language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="mt-2 block w-full pl-3 pr-10 py-2 bg-neutral-800 border-neutral-300 dark:border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        </SettingsCard>
    );
};

export default AppearanceSettings;

