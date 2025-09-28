// FILE: src/components/common/UpgradePrompt.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid';
import Button from './Button';

const UpgradePrompt = ({ featureName, requiredPlan }) => {
    const { t } = useTranslation();

    return (
        <div className="p-6 text-center bg-neutral-50 dark:bg-neutral-800/50 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <SparklesIcon className="h-6 w-6 text-primary" aria-hidden="true" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
                {t('upgrade_prompt_title', { featureName })}
            </h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                {t('upgrade_prompt_subtitle', { requiredPlan })}
            </p>
            <Link to="/pricing">
                <Button className="mt-6" size="sm">
                    {t('upgrade_prompt_button')}
                </Button>
            </Link>
        </div>
    );
};

export default UpgradePrompt;