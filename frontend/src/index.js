// FILE: src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

// --- Context Providers ---
import { AuthProvider } from './context/AuthContext';
import { AppearanceProvider, useAppearance } from './context/AppearanceContext';

// --- Other Imports ---
import './index.css'; // Tailwind CSS
import 'flag-icons/css/flag-icons.min.css'; // Flag icons for global features
import './i18n'; // Internationalization setup
import App from './App';
import ErrorBoundary from './components/utility/ErrorBoundary';

// [THE UPGRADE] A small, powerful sub-component to render the correct icon based on toast type.
const ToastIcon = ({ toast }) => {
  switch (toast.type) {
    case 'success':
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />;
    case 'error':
      return <XCircleIcon className="h-6 w-6 text-red-500" />;
    case 'loading':
      return (
        <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    default:
      return <InformationCircleIcon className="h-6 w-6 text-neutral-500" />;
  }
};

// [THE UPGRADE] A component to wrap the Toaster logic and access the theme context.
const ThemedToaster = () => {
    const { theme } = useAppearance();
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    return (
        <Toaster position="bottom-center" gutter={12}>
            {(t) => (
                <Transition
                    show={t.visible}
                    as={React.Fragment}
                    enter="transform ease-out duration-300 transition"
                    enterFrom="translate-y-2 opacity-0"
                    enterTo="translate-y-0 opacity-100"
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className={`max-w-sm w-full shadow-lg rounded-xl pointer-events-auto flex ring-1 ${isDark ? 'bg-neutral-800 ring-black ring-opacity-20 border border-neutral-700' : 'bg-white ring-black ring-opacity-5 border border-neutral-200'}`}>
                        <div className="flex-1 w-0 p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0 pt-0.5"><ToastIcon toast={t} /></div>
                                <div className="ml-3 flex-1">
                                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-neutral-900'}`}>{t.type.charAt(0).toUpperCase() + t.type.slice(1)}</p>
                                    <p className={`mt-1 text-sm ${isDark ? 'text-neutral-300' : 'text-neutral-600'}`}>{resolveValue(t.message, t)}</p>
                                </div>
                            </div>
                        </div>
                        <div className={`flex border-l ${isDark ? 'border-neutral-700' : 'border-neutral-200'}`}>
                            <button onClick={() => toast.dismiss(t.id)} className="w-full border border-transparent rounded-none rounded-r-xl p-4 flex items-center justify-center text-sm font-medium text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary transition-colors">
                                Close
                            </button>
                        </div>
                    </div>
                </Transition>
            )}
        </Toaster>
    );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <AppearanceProvider>
            <App />
            <ThemedToaster />
          </AppearanceProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  </React.StrictMode>
);
