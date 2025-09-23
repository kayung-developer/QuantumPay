import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { CheckIcon, MinusIcon } from '@heroicons/react/24/outline';
import useApi from '../../hooks/useApi';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { Disclosure } from '@headlessui/react';
import { ChevronUpIcon } from '@heroicons/react/20/solid';


// --- Reusable, Theme-Aware PricingCard Component ---
const PricingCard = ({ tier, isMostPopular }) => (
  <div
    key={tier.id}
    className={`rounded-3xl p-8 ring-1 xl:p-10 transition-all duration-300 ${
      isMostPopular
      ? 'ring-2 ring-primary bg-white dark:bg-neutral-900 shadow-2xl'
      : 'ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-950'
    }`}
  >
    <div className="flex items-center justify-between gap-x-4">
      <h3 id={tier.id} className="text-lg font-semibold leading-8 text-neutral-900 dark:text-white">
        {tier.name}
      </h3>
      {isMostPopular && (
        <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
          Most popular
        </p>
      )}
    </div>
    <p className="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{tier.description || `The perfect plan for ${tier.name} features.`}</p>
    <p className="mt-6 flex items-baseline gap-x-1">
      <span className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white">${tier.price.toFixed(2)}</span>
      <span className="text-sm font-semibold leading-6 text-neutral-500 dark:text-neutral-400">/month</span>
    </p>
    <Button
      to={`/register?plan=${tier.name.toLowerCase()}`}
      aria-describedby={tier.id}
      variant={isMostPopular ? 'primary' : 'secondary'}
      className="mt-6 w-full"
    >
      Get Started
    </Button>
    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300 xl:mt-10">
      {tier.features.map((feature) => (
        <li key={feature} className="flex gap-x-3">
          <CheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

// --- Theme-Aware Skeleton Card ---
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


// --- Main Pricing Page ---
const PricingPage = () => {
    const { data: plans, loading, error } = useApi('/subscriptions/plans');

    const mostPopularIndex = plans ? Math.floor(plans.length / 2) : -1;

    const renderContent = () => {
        if (loading) {
            return (
                 <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    <SkeletonCard /><SkeletonCard /><SkeletonCard />
                 </div>
            );
        }
        if (error) {
            return (
                <div className="mt-10 text-center p-8 bg-red-900/50 border border-red-700 rounded-lg">
                    <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-red-400" />
                    <h3 className="mt-4 text-xl font-semibold text-white">Failed to Load Pricing Plans</h3>
                    <p className="mt-2 text-red-300">Could not connect to the server. Please try again later.</p>
                </div>
            );
        }
        if (plans) {
             return (
                 <motion.div
                    className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                    initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
                >
                    {plans.map((tier, index) => (
                        <motion.div key={tier.id} variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } }}>
                            <PricingCard tier={tier} isMostPopular={index === mostPopularIndex} />
                        </motion.div>
                    ))}
                 </motion.div>
             );
        }
        return null;
    }

  return (
    // Main container inherits theme from PageWrapper
    <div className="bg-white dark:bg-neutral-950">
      {/* Hero Section */}
      <div className="pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mx-auto max-w-4xl text-center">
                <h1 className="text-base font-semibold leading-7 text-primary">Pricing</h1>
                <p className="mt-2 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl font-display">
                    Transparent Pricing for Every Scale
                </p>
                <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                    Choose the plan that fits your needs. All plans start with a 14-day free trial. No credit card required.
                </p>
            </motion.div>
            {renderContent()}
        </div>
      </div>

      {/* --- [NEW] FAQ Section --- */}
      <div className="bg-neutral-50 dark:bg-neutral-900 py-20 sm:py-28">
        <div className="mx-auto max-w-4xl divide-y divide-neutral-900/10 dark:divide-white/10 px-6">
          <h2 className="text-2xl font-bold leading-10 tracking-tight text-neutral-900 dark:text-white text-center">Frequently Asked Questions</h2>
          <dl className="mt-10 space-y-6 divide-y divide-neutral-900/10 dark:divide-white/10">
            {/* FAQ Items would be mapped here */}
             <Disclosure as="div" className="pt-6">
                {({ open }) => (
                    <>
                    <dt><Disclosure.Button className="flex w-full items-start justify-between text-left text-neutral-900 dark:text-white">
                        <span className="text-base font-semibold leading-7">Can I change my plan later?</span>
                        <span className="ml-6 flex h-7 items-center"><ChevronUpIcon className={`${open ? 'rotate-180' : ''} h-6 w-6 transform transition-transform`} /></span>
                    </Disclosure.Button></dt>
                    <Disclosure.Panel as="dd" className="mt-2 pr-12">
                        <p className="text-base leading-7 text-neutral-600 dark:text-neutral-400">Yes, you can upgrade, downgrade, or cancel your plan at any time from your account settings. Prorated charges will be applied automatically.</p>
                    </Disclosure.Panel>
                    </>
                )}
            </Disclosure>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;