import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useApiPost } from '../hooks/useApi';
import i18n from '../i18n';

const AppearanceContext = createContext();

export const AppearanceProvider = ({ children }) => {
    const { isAuthenticated, dbUser } = useAuth();
    const { post: updateAppearanceSettings } = useApiPost('/users/me/appearance', { method: 'PUT' });

    // State holds the current theme ('light', 'dark', 'system')
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');

    // This effect applies the theme to the HTML tag for Tailwind CSS to work
    useEffect(() => {
        const root = window.document.documentElement;
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

        root.classList.remove('light', 'dark');

        if (theme === 'system') {
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme);
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    // Sync theme and language with user's saved preferences on login
    useEffect(() => {
        if (isAuthenticated && dbUser) {
            if (dbUser.preferred_theme) {
                setTheme(dbUser.preferred_theme);
            }
            if (dbUser.preferred_language && dbUser.preferred_language !== i18n.language) {
                i18n.changeLanguage(dbUser.preferred_language);
            }
        }
    }, [isAuthenticated, dbUser]);

    const saveTheme = useCallback((newTheme) => {
        setTheme(newTheme);
        if (isAuthenticated) {
            updateAppearanceSettings({ theme: newTheme });
        }
    }, [isAuthenticated, updateAppearanceSettings]);

    const saveLanguage = useCallback((newLang) => {
        i18n.changeLanguage(newLang);
        if (isAuthenticated) {
            updateAppearanceSettings({ language: newLang });
        }
    }, [isAuthenticated, updateAppearanceSettings]);

    const value = {
        theme,
        setTheme: saveTheme,
        setLanguage: saveLanguage,
    };

    return (
        <AppearanceContext.Provider value={value}>
            {children}
        </AppearanceContext.Provider>
    );
};

export const useAppearance = () => useContext(AppearanceContext);