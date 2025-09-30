// FILE: src/pages/marketing/PricingPage.js

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { CheckIcon } from '@heroicons/react/24/solid';
import { useNavigate, useLocation } from 'react-router-dom';

// --- Component Imports ---
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import PageWrapper from '../../components/layout/PageWrapper';

// --- Reusable PricingCard Component (No changes needed here) ---
const PricingCard = ({ plan, isMostPopular, onSubscribe, isLoading, currentPlanId, isLoggedIn, index }) => {
    const { t } = useTranslation();
    const getButtonText = () => {
        if (currentPlanId === plan.id) return t('current_plan_label');
        if (plan.id === 'free') return t('included_label');
        if (isLoggedIn) return t('upgrade_plan_button');
        return t('get_started_button');
    };

    return (
        <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className={`rounded-3xl p-8 ring-1 xl:p-10 transition-all duration-300 h-full flex flex-col ${
                isMostPopular
                    ? 'ring-2 ring-primary bg-neutral-50 dark:bg-neutral-900 shadow-2xl'
                    : 'ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-950'
            }`}
        >
            <div className="flex items-center justify-between gap-x-4">
                <h3 className="text-lg font-semibold leading-8 text-neutral-900 dark:text-white">
                    {plan.name}
                </h3>
                {isMostPopular && (
                    <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
                        {t('most_popular_badge')}
                    </p>
                )}
            </div>
            <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                {t(`plan_${plan.id}_desc`)}
            </p>
            <p className="mt-6 flex items-baseline gap-x-1">
                <span className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    ${plan.monthly_fee_usd}
                </span>
                <span className="text-sm font-semibold leading-6 text-neutral-500 dark:text-neutral-400">
                    {t('per_month_suffix')}
                </span>
            </p>
            <Button
                onClick={() => onSubscribe(plan.id)}
                isLoading={isLoading}
                disabled={plan.id === 'free' || currentPlanId === plan.id}
                fullWidth
                size="lg"
                className="mt-6"
                variant={isMostPopular ? 'primary' : 'secondary'}
            >
                {getButtonText()}
            </Button>
            <ul className="mt-8 space-y-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300 xl:mt-10 flex-grow">
                {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                        <CheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                        {feature}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

// --- Theme-Aware Skeleton Card for loading state ---
const SkeletonCard = () => (
    <div className="rounded-3xl p-8 ring-1 ring-neutral-200 dark:ring-neutral-800 xl:p-10 animate-pulse">
        <div className="h-6 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="mt-4 h-4 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="mt-6 h-10 w-32 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="mt-6 h-12 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        <div className="mt-8 space-y-3">
            <div className="h-5 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
            <div className="h-5 w-5/6 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
            <div className="h-5 w-4/6 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
        </div>
    </div>
);

// --- Main Pricing Page Component ---
const PricingPage = () => {
    const { t } = useTranslation();
    const { dbUser, loading: authLoading } = useAuth(); // <-- Get authLoading state
    const navigate = useNavigate();
    const location = useLocation();

    // --- [THE DEFINITIVE FIX - Step 1] ---
    // Change the useApi call to be manual (third argument is `true`).
    const { data: plans, loading: plansLoading, error, request: fetchPlans } = useApi('/subscriptions/plans', {}, true);
    
    const { post: createCheckout, loading: checkoutLoading } = useApiPost('/subscriptions/create');

    // --- [THE DEFINITIVE FIX - Step 2] ---
    // Use useEffect to trigger the fetch only when the auth state is no longer loading.
    useEffect(() => {
        if (!authLoading) {
            fetchPlans();
        }
    }, [authLoading, fetchPlans]);

    const handleSubscribe = async (planId) => {
        if (!dbUser) {
            navigate('/login', { state: { from: location } });
            return;
        }
        const result = await createCheckout({
            plan_id: planId,
            provider: 'paystack'
        });
        if (result.success && result.data.checkout_url) {
            window.location.href = result.data.checkout_url;
        }
    };

    const renderContent = () => {
        if (plansLoading || authLoading) { // <-- Show skeleton while auth is loading too
            return (
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </div>
            );
        }
        if (error) {
            return <p className="mt-16 text-center text-red-500">Could not load pricing plans. Please try again later.</p>;
        }
        if (!plans || plans.length === 0) {
            return <p className="mt-16 text-center text-neutral-500">No pricing plans are available at this time.</p>;
        }

        return (
            <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                {plans.map((plan, index) => (
                    <PricingCard
                        key={plan.id}
                        plan={plan}
                        index={index}
                        isMostPopular={plan.id === 'premium'}
                        onSubscribe={handleSubscribe}
                        isLoading={checkoutLoading}
                        currentPlanId={dbUser?.subscription?.plan_id}
                        isLoggedIn={!!dbUser}
                    />
                ))}
            </div>
        );
    };

    return (
        <PageWrapper>
            <div className="bg-white dark:bg-neutral-950">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="text-base font-semibold leading-7 text-primary">{t('pricing_page_title')}</h1>
                        <p className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl font-display">
                            {t('pricing_page_header')}
                        </p>
                    </div>
                    <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                        {t('pricing_page_subtitle')}
                    </p>
                    {renderContent()}
                </div>
            </div>
        </PageWrapper>
    );
};

export default PricingPage;
