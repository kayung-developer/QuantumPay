import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

// This array is the single source of truth for the languages we support.
// To add a new language, simply add its object here and its translations in i18n.js.
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'EN' }, // English
    { code: 'fr', name: 'FR' }, // French
    { code: 'es', name: 'ES' }, // Spanish
    { code: 'pt', name: 'PT' }, // Portuguese
    { code: 'sw', name: 'SW' }, // Swahili
];

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    // The `i18n.changeLanguage` function is provided by the i18next library.
    // It will update the language and automatically cause all components using the `t` function to re-render.
    const changeLanguage = (languageCode) => {
        i18n.changeLanguage(languageCode);
    };

    // We can get the currently active language directly from the i18n instance.
    const currentLanguageCode = i18n.language;

    return (
        <div className="flex items-center p-1 space-x-1 bg-neutral-100 dark:bg-neutral-800 rounded-full">
            {SUPPORTED_LANGUAGES.map((language) => (
                <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`relative px-3 py-1 text-sm font-semibold rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-opacity-75 ${
                        currentLanguageCode === language.code
                            ? 'text-neutral-900 dark:text-white' // Active text color
                            : 'text-neutral-600 dark:text-neutral-400 hover:text-white' // Inactive text color
                    }`}
                >
                    {/* The animated background pill that moves to the active language */}
                    {currentLanguageCode === language.code && (
                        <motion.div
                            layoutId="language-pill" // This ID is crucial for the animation
                            className="absolute inset-0 bg-primary rounded-full"
                            style={{ borderRadius: 9999 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                    )}
                    <span className="relative z-10">{language.name}</span>
                </button>
            ))}
        </div>
    );
};

export default LanguageSwitcher;