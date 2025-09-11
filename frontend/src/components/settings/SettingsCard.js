import React from 'react';

const SettingsCard = ({ title, description, children }) => (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
        <div className="p-6 border-b border-neutral-800">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            {description && <p className="mt-1 text-sm text-neutral-400">{description}</p>}
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

export default SettingsCard;