import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppearanceProvider } from './context/AppearanceContext';
import { NotificationProvider } from './context/NotificationContext';

// Import global styles from the CSS file
import './index.css';
import './i18n';

// Import the main App component
import App from './App';

// Import the Auth Provider to wrap the entire application
import { AuthProvider } from './context/AuthContext';

// Create a root element for React to render into.
const root = ReactDOM.createRoot(document.getElementById('root'));

// Render the application
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
      <AppearanceProvider>
          {/* [THE FIX] Wrap the entire app with NotificationProvider */}
          <NotificationProvider>
            <App />
            {/* The Toaster component from react-hot-toast can now be removed */}
          </NotificationProvider>
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
//document.body.classList.add('react-loaded');
