import React, { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Transition } from '@headlessui/react';
import { LanguageIcon } from '@heroicons/react/24/outline';

// This array is the single source of truth for supported languages
const SUPPORTED_LANGUAGES = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'pt', name: 'Português' },
    { code: 'sw', name: 'Kiswahili' },
];

const LanguageMenu = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (langCode) => {
        if (i18n.language !== langCode) {
            i18n.changeLanguage(langCode);
        }
    };

    const currentLanguageName = SUPPORTED_LANGUAGES.find(lang => i18n.language.startsWith(lang.code))?.name || 'Language';

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="p-2 rounded-full text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-neutral-900 focus:ring-primary">
                    <span className="sr-only">Open language menu</span>
                    <LanguageIcon className="h-6 w-6" aria-hidden="true" />
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
                >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-neutral-200 dark:border-neutral-700">
                    <div className="py-1">
                        {SUPPORTED_LANGUAGES.map((lang) => (
                            <Menu.Item key={lang.code}>
                                {({ active }) => (
                                    <button
                                        onClick={() => changeLanguage(lang.code)}
                                        className={`${
                                            i18n.language.startsWith(lang.code) ? 'font-bold text-primary' : 'text-neutral-700 dark:text-neutral-200'
                                        } ${
                                            active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                                        } group flex w-full items-center px-4 py-2 text-sm`}
                                    >
                                        {lang.name}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
};

export default LanguageMenu;