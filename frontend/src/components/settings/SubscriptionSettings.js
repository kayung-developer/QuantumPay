// FILE: src/components/settings/SubscriptionSettings.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

// --- Component Imports ---
import useApi, { useApiPost } from '../../hooks/useApi';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import SettingsCard from './SettingsCard';
import { CreditCardIcon, ShieldCheckIcon } from '@heroicons/react/24/solid'; // <-- Import ShieldCheckIcon
import { useAuth } from '../../context/AuthContext'; // <-- [THE FIX - Step 1] Import useAuth

const SubscriptionSettings = () => {
    const { t } = useTranslation();
    const { dbUser } = useAuth(); // <-- [THE FIX - Step 2] Get the authenticated user's data
    const { data: subscription, loading, error, request: refetchSubscription } = useApi('/subscriptions/me');
    const { post: cancelSubscription, loading: cancelling } = useApiPost('/subscriptions/cancel');

    const handleCancel = async () => {
        if (window.confirm("Are you sure you want to cancel your subscription?")) {
            const result = await cancelSubscription();
            if (result.success) {
                refetchSubscription();
            }
        }
    };


    const renderStatusBadge = (status) => {
        const statusMap = {
            active: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
            cancelled: 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300',
            past_due: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
        };
        const statusText = t(`status_${status}`, { defaultValue: status });
        return <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${statusMap[status] || 'bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-300'}`}>{statusText}</span>;
    };

    const renderContent = () => {
         if (dbUser?.role === 'superuser' || dbUser?.role === 'admin') {
            const planName = dbUser.role === 'superuser' ? 'Ultimate' : 'Premium';
            return (
                <SettingsCard
                    title="Administrator Access"
                    description={`Your account has elevated privileges.`}
                >
                    <div className="text-center p-8">
                        <ShieldCheckIcon className="h-16 w-16 mx-auto text-primary"/>
                        <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">
                            Full Access Granted
                        </h3>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            As a <span className="font-bold capitalize">{dbUser.role}</span>, you have automatic access equivalent to the <span className="font-bold">{planName}</span> plan. All features are unlocked.
                        </p>
                    </div>
                </SettingsCard>
            );
        }

        if (loading) {
            return (
                <div className="py-24 flex justify-center items-center">
                    <Spinner />
                </div>
            );
        }
        if (error) {
            return <p className="p-6 text-center text-red-500">Could not load your subscription details.</p>;
        }
        if (!subscription) {
            return (
                <SettingsCard
                    title={t('subscription_free_title')}
                    description={t('subscription_free_subtitle')}
                >
                    <div className="flex justify-start">
                         <Link to="/pricing">
                            <Button variant="primary">{t('subscription_view_plans_button')}</Button>
                        </Link>
                    </div>
                </SettingsCard>
            );
        }

        return (
            <SettingsCard
                title={t('subscription_active_title')}
                description={t('subscription_active_subtitle')}
            >
                <div className="overflow-hidden shadow sm:rounded-md">
                    <div className="bg-white dark:bg-neutral-900">
                        <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
                            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('subscription_label_plan')}</dt>
                                <dd className="mt-1 text-sm text-neutral-900 dark:text-white sm:col-span-2 sm:mt-0 flex items-center justify-between">
                                    <span className="font-semibold">{subscription.plan.name}</span>
                                    {renderStatusBadge(subscription.status)}
                                </dd>
                            </div>
                            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('subscription_label_price')}</dt>
                                <dd className="mt-1 text-sm text-neutral-900 dark:text-white sm:col-span-2 sm:mt-0">
                                    ${subscription.plan.monthly_fee_usd.toFixed(2)} / month
                                </dd>
                            </div>
                            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    {subscription.status === 'cancelled' ? t('subscription_label_benefits_end') : t('subscription_label_renewal')}
                                </dt>
                                <dd className="mt-1 text-sm text-neutral-900 dark:text-white sm:col-span-2 sm:mt-0">
                                    {format(parseISO(subscription.current_period_end), 'MMMM d, yyyy')}
                                </dd>
                            </div>
                            <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                                <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">{t('subscription_label_payment_method')}</dt>
                                <dd className="mt-1 text-sm text-neutral-900 dark:text-white sm:col-span-2 sm:mt-0 capitalize flex items-center">
                                    <CreditCardIcon className="h-5 w-5 mr-2 text-neutral-400"/>
                                    {t('subscription_payment_method_value', { provider: subscription.payment_provider })}
                                </dd>
                            </div>
                        </dl>
                    </div>
                    <div className="px-4 py-5 bg-neutral-50 dark:bg-neutral-800/50 sm:px-6">
                        {subscription.status === 'active' ? (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('subscription_cancel_prompt')}</p>
                                <Button variant="danger" onClick={handleCancel} isLoading={cancelling}>
                                    {t('subscription_cancel_button')}
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center">
                                <p className="text-sm text-amber-800 dark:text-amber-300">{t('subscription_cancelled_notice')}</p>
                                <Link to="/pricing" className="text-sm font-medium text-primary hover:underline mt-2 inline-block">
                                    {t('subscription_resubscribe_link')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </SettingsCard>
        );
    };

    return (
        // The parent SettingsPage provides the main layout and title.
        // This component only needs to render its specific content.
        renderContent()
    );
};

export default SubscriptionSettings;
