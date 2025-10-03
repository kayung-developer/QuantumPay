import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { BellIcon } from '@heroicons/react/24/solid';
import LanguageMenu from '../common/LanguageMenu';
import NotificationCenter from '../common/NotificationCenter';

const Header = ({ onMenuClick, pageTitleKey }) => {
  const { t } = useTranslation();

  return (
    // [THEME UPDATE] Added light/dark mode colors for background, border, and text
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-200 dark:border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-neutral-500 dark:text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="h-6 w-px bg-neutral-300 dark:bg-neutral-700 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-x-4 self-stretch lg:gap-x-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-white font-display">{t(pageTitleKey)}</h1>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <NotificationCenter />


          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-neutral-300 dark:bg-neutral-700" aria-hidden="true" />

          <div className="hidden lg:block">
            {/* Placeholder */}
          </div>
          <LanguageMenu />
        </div>
      </div>
    </header>
  );
};

export default Header;
