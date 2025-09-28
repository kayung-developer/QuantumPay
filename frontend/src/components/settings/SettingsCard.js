import React from 'react';

const SettingsCard = ({ title, description, children }) => (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-200 dark:border-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-200 dark:border-neutral-800">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{title}</h3>
            {description && <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-600 dark:text-neutral-400">{description}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default SettingsCard;