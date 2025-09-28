// FILE: src/pages/dashboard/SubscriptionSettingsPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format, parseISO } from 'date-fns';

// --- Component Imports ---
import  useApi, {useApiPost } from '../../hooks/useApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { CheckCircleIcon, ExclamationTriangleIcon, CreditCardIcon } from '@heroicons/react/24/solid';

const SubscriptionSettingsPage = () => {
    const { t } = useTranslation();
    const { data: subscription, loading, error, request: refetchSubscription } = useApi('/subscriptions/me');
    const { post: cancelSubscription, loading: cancelling } = useApiPost('/subscriptions/cancel');

    const handleCancel = async () => {
        if (window.confirm("Are you sure you want to cancel your subscription? Your benefits will continue until the end of the current billing period.")) {
            const result = await cancelSubscription();
            if (result.success) {
                refetchSubscription(); // Refresh the subscription data to show the new 'cancelled' status
            }
        }
    };

    const renderStatusBadge = (status) => {
        const statusMap = {
            active: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
            cancelled: 'bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-300',
            past_due: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
        };
        return <span className={`px-3 py-1 text-xs font-medium rounded-full ${statusMap[status] || 'bg-neutral-100 text-neutral-800'}`}>{status}</span>;
    };

    const renderContent = () => {
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <p className="text-center text-red-500">Could not load your subscription details.</p>;
        }
        if (!subscription) {
            return (
                <div className="text-center p-12 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-white">You are on the Free Plan</h3>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">Upgrade to unlock advanced features like lower fees and multi-user business tools.</p>
                    <Link to="/pricing">
                        <Button className="mt-6">View Pricing Plans</Button>
                    </Link>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-neutral-900 rounded-lg shadow border border-neutral-200 dark:border-neutral-800">
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
                                Your Subscription
                            </h2>
                            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                Manage your billing and plan details.
                            </p>
                        </div>
                        {renderStatusBadge(subscription.status)}
                    </div>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-800">
                    <dl className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Current Plan</dt>
                            <dd className="text-sm text-neutral-900 dark:text-white col-span-2 font-semibold">{subscription.plan.name}</dd>
                        </div>
                        <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Price</dt>
                            <dd className="text-sm text-neutral-900 dark:text-white col-span-2">${subscription.plan.monthly_fee_usd.toFixed(2)} / month</dd>
                        </div>
                        <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                {subscription.status === 'cancelled' ? 'Benefits end on' : 'Next renewal on'}
                            </dt>
                            <dd className="text-sm text-neutral-900 dark:text-white col-span-2">{format(parseISO(subscription.current_period_end), 'MMMM d, yyyy')}</dd>
                        </div>
                         <div className="px-6 py-4 grid grid-cols-3 gap-4">
                            <dt className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Payment Method</dt>
                            <dd className="text-sm text-neutral-900 dark:text-white col-span-2 capitalize flex items-center">
                                <CreditCardIcon className="h-5 w-5 mr-2 text-neutral-400"/>
                                Billed via {subscription.payment_provider}
                            </dd>
                        </div>
                    </dl>
                </div>
                 <div className="p-6 bg-neutral-50 dark:bg-neutral-900/50 rounded-b-lg">
                    {subscription.status === 'active' ? (
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">Thinking of changing your plan?</p>
                            <Button variant="danger" onClick={handleCancel} isLoading={cancelling}>Cancel Subscription</Button>
                        </div>
                    ) : (
                         <div className="text-center">
                            <p className="text-sm text-amber-800 dark:text-amber-300">Your subscription is set to be cancelled and will not renew.</p>
                            <Link to="/pricing" className="text-sm font-medium text-primary hover:underline mt-2 inline-block">Re-subscribe to a new plan</Link>
                         </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <DashboardLayout pageTitle="Subscription">
            {renderContent()}
        </DashboardLayout>
    );
};

export default SubscriptionSettingsPage;