// FILE: src/context/NotificationContext.js

import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Notification from '../components/common/Notification'; // We will create this component next

const NotificationContext = createContext(null);

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const addNotification = useCallback((type, message, details = '') => {
        const id = new Date().getTime();
        setNotifications(prev => [...prev, { id, type, message, details }]);

        // Auto-remove the notification after a delay
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 6000); // 6-second visibility
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const value = {
        notifySuccess: (message, details) => addNotification('success', message, details),
        notifyError: (message, details) => addNotification('error', message, details),
        notifyInfo: (message, details) => addNotification('info', message, details),
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            {/* This is the container where all notifications will be rendered */}
            <div className="fixed bottom-0 right-0 p-4 sm:p-6 space-y-3 z-[100]">
                <AnimatePresence>
                    {notifications.map(notification => (
                        <Notification
                            key={notification.id}
                            notification={notification}
                            onClose={() => removeNotification(notification.id)}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};
