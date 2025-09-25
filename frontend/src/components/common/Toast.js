// FILE: src/components/common/Toast.js

import React from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { CheckCircleIcon, XCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useAppearance } from '../../context/AppearanceContext';

// [REAL SYSTEM IMPLEMENTATION] This is the central component for all pop-up notifications.

// 1. Export individual toast functions
export const toastSuccess = (message) => {
    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'}
                    max-w-md w-full bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <CheckCircleIcon className="h-6 w-6 text-green-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">Success</p>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
                        </div>
                    </div>
                </div>
                <div className="flex border-l border-neutral-200 dark:border-neutral-700">
                    <button
                        onClick={() => toast.dismiss(t.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-primary hover:text-primary-focus focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        Close
                    </button>
                </div>
            </div>
        ),
        { id: message } // Use message as ID to prevent duplicates of the same toast
    );
};

export const toastError = (message) => {
    toast.custom(
        (t) => (
            <div
                className={`${t.visible ? 'animate-enter' : 'animate-leave'}
                    max-w-md w-full bg-white dark:bg-neutral-800 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 dark:ring-white dark:ring-opacity-10`}
            >
                <div className="flex-1 w-0 p-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                            <XCircleIcon className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-neutral-900 dark:text-white">Error</p>
                            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
                        </div>
                    </div>
                </div>
                 <div className="flex border-l border-neutral-200 dark:border-neutral-700">
                    <button onClick={() => toast.dismiss(t.id)} className="w-full ...">Close</button>
                </div>
            </div>
        ),
        { id: message }
    );
};


// 2. Export the Toaster container component
export const CustomToaster = () => {
    const { theme } = useAppearance();

    return (
        <Toaster
            position="bottom-center"
            gutter={8}
            toastOptions={{
                duration: 4000,
                // Apply theme-aware styles directly if needed, but the custom component handles it
                style: {
                    background: theme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                    color: theme === 'dark' ? '#FFFFFF' : '#1E1E1E',
                },
            }}
        />
    );
};