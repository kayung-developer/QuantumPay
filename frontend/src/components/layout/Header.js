import React from 'react';
import { Bars3Icon } from '@heroicons/react/24/outline';
import { BellIcon } from '@heroicons/react/24/solid';

const Header = ({ onMenuClick, pageTitle }) => {
  return (
    <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
      {/* Mobile menu button */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-neutral-400 hover:text-white lg:hidden"
        onClick={onMenuClick}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Separator for mobile view */}
      <div className="h-6 w-px bg-neutral-700 lg:hidden" aria-hidden="true" />

      <div className="flex flex-1 items-center justify-between gap-x-4 self-stretch lg:gap-x-6">
        <h1 className="text-xl font-semibold text-white font-display">{pageTitle}</h1>

        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <button type="button" className="-m-2.5 p-2.5 text-neutral-400 hover:text-white">
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Separator */}
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-neutral-700" aria-hidden="true" />

          {/* User profile info is now in the sidebar footer, this area can be used for other actions */}
          <div className="hidden lg:block">
            {/* Placeholder for potential actions like "New Transaction" */}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;