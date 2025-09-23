import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppearanceProvider } from './context/AppearanceContext';

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
        <App />
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            className: '',
            duration: 5000,
            style: {
              background: '#1E293B', // neutral-800
              color: '#F1F5F9', // neutral-100
              border: '1px solid #334155', // neutral-700
            },
            success: {
              duration: 3000,
              theme: {
                primary: '#059669', // secondary
                secondary: '#F1F5F9',
              },
            },
            error: {
              duration: 5000,
              theme: {
                primary: '#DC2626', // red-600
                secondary: '#F1F5F9',
              },
            },
          }}
        />
        </AppearanceProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
//document.body.classList.add('react-loaded');