// FILE: frontend/src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';

// Import global CSS and i18n configuration
import './index.css';
import './i18n';

// Import top-level providers
import { AuthProvider } from './context/AuthContext';
import { AppearanceProvider } from './context/AppearanceContext';

// Import the main App component
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/*
      [DEFINITIVE STRUCTURE]
      1. Router provides routing capabilities to the entire app.
      2. AuthProvider provides user authentication state.
      3. AppearanceProvider provides theme and language state.
      These wrap the <App /> component so all pages can access their context.
    */}
    <Router>
      <AuthProvider>
        <AppearanceProvider>
          <App />
        </AppearanceProvider>
      </AuthProvider>
    </Router>
  </React.StrictMode>
);
