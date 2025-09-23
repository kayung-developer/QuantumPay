import React, { useState, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import Header from './Header';
import ChatWidget from '../support/ChatWidget';
import AIAssistantWidget from '../dashboard/AIAssistantWidget';

/**
 * [V7.1 - THEME-AWARE IMPLEMENTATION]
 * The main layout for all authenticated pages (dashboard, wallets, settings, etc.).
 * It orchestrates the Sidebar, Header, and the main content area.
 * It now includes `dark:` variants for all its elements to support the new
 * Light/Dark/System theme functionality.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The specific page content to be displayed.
 * @param {string} props.pageTitleKey - The translation key for the title to be displayed in the Header.
 */
const DashboardLayout = ({ children, pageTitleKey = 'dashboard_overview' }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLinkClick = () => {
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    // [THEME UPDATE] The main container now has colors for both light and dark modes.
    // Default classes are for light mode, `dark:` prefixed classes are for dark mode.
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 text-neutral-800 dark:text-neutral-200">

      {/* Mobile Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          {/* Backdrop overlay */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                {/* The Sidebar component will need its own dark: classes */}
                <Sidebar onLinkClick={handleLinkClick} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        {/* The Sidebar component will need its own dark: classes */}
        <Sidebar onLinkClick={() => {}} />
      </div>

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* The Header component will need its own dark: classes */}
        <Header onMenuClick={() => setSidebarOpen(true)} pageTitleKey={pageTitleKey} />

        <main className="flex-1 py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>

      {/* The Chat Widget can be styled for both themes as well */}
      <AIAssistantWidget />
      <ChatWidget />
    </div>
  );
};

export default DashboardLayout;