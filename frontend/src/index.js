// FILE: src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster, toast, resolveValue } from 'react-hot-toast'; // <-- Import toast and resolveValue
import { Transition } from '@headlessui/react';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// --- Context Providers ---
import { AuthProvider } from './context/AuthContext';
import { AppearanceProvider, useAppearance } from './context/AppearanceContext'; // <-- Import useAppearance

// --- Other Imports ---
import './index.css';
import './i18n';
import App from './App';



const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <AuthProvider>
        <AppearanceProvider>
          {/* [THE DEFINITIVE FIX] The App and the Toaster are now siblings inside the providers */}
          <App />
        </AppearanceProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);