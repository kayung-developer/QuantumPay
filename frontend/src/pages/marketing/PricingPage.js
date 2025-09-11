import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { CheckIcon } from '@heroicons/react/24/outline';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';

const PricingCard = ({ tier, isMostPopular }) => (
  <div
    key={tier.id}
    className={`rounded-3xl p-8 ring-1 xl:p-10 ${
      isMostPopular ? 'ring-2 ring-primary bg-neutral-900' : 'ring-neutral-800'
    }`}
  >
    <div className="flex items-center justify-between gap-x-4">
      <h3 id={tier.id} className="text-lg font-semibold leading-8 text-white">
        {tier.name}
      </h3>
      {isMostPopular && (
        <p className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold leading-5 text-primary">
          Most popular
        </p>
      )}
    </div>
    <p className="mt-4 text-sm leading-6 text-neutral-300">{tier.description || `The perfect plan to get started with ${tier.name} features.`}</p>
    <p className="mt-6 flex items-baseline gap-x-1">
      <span className="text-4xl font-bold tracking-tight text-white">${tier.price.toFixed(2)}</span>
      <span className="text-sm font-semibold leading-6 text-neutral-400">/month</span>
    </p>
    <Button
      to={`/register?plan=${tier.name.toLowerCase()}`}
      aria-describedby={tier.id}
      variant={isMostPopular ? 'primary' : 'secondary'}
      className="mt-6 w-full"
    >
      Get Started
    </Button>
    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-neutral-300 xl:mt-10">
      {tier.features.map((feature) => (
        <li key={feature} className="flex gap-x-3">
          <CheckIcon className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
          {feature}
        </li>
      ))}
    </ul>
  </div>
);

const SkeletonCard = () => (
    <div className="rounded-3xl p-8 ring-1 ring-neutral-800 xl:p-10 animate-pulse">
        <div className="h-6 w-24 bg-neutral-700 rounded-md"></div>
        <div className="mt-4 h-4 w-48 bg-neutral-700 rounded-md"></div>
        <div className="mt-6 h-10 w-32 bg-neutral-700 rounded-md"></div>
        <div className="mt-6 h-12 w-full bg-neutral-700 rounded-md"></div>
        <div className="mt-8 space-y-3">
            <div className="h-5 w-full bg-neutral-700 rounded-md"></div>
            <div className="h-5 w-5/6 bg-neutral-700 rounded-md"></div>
            <div className="h-5 w-4/6 bg-neutral-700 rounded-md"></div>
        </div>
    </div>
)


const PricingPage = () => {
    const { data: plans, loading, error } = useApi('/subscriptions/plans');

    // Simple logic to determine the "most popular" plan, e.g., the middle one.
    const mostPopularIndex = plans ? Math.floor(plans.length / 2) : -1;

    const renderContent = () => {
        if (loading) {
            return (
                 <div className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                 </div>
            )
        }
        if (error) {
            return <p className="text-center text-red-400 mt-10">Failed to load pricing plans. Please try again later.</p>
        }
        if (plans) {
             return (
                 <motion.div
                    className="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3"
                    initial="hidden"
                    animate="visible"
                    variants={{
                        visible: { transition: { staggerChildren: 0.1 } }
                    }}
                >
                    {plans.map((tier, index) => (
                        <motion.div
                           key={tier.id}
                           variants={{
                               hidden: { opacity: 0, y: 50 },
                               visible: { opacity: 1, y: 0 }
                           }}
                        >
                            <PricingCard tier={tier} isMostPopular={index === mostPopularIndex} />
                        </motion.div>
                    ))}
                 </motion.div>
             )
        }
        return null;
    }

  return (
    <div className="bg-neutral-950 pt-24 pb-32 sm:pt-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mx-auto max-w-4xl text-center"
        >
          <h1 className="text-base font-semibold leading-7 text-primary">Pricing</h1>
          <p className="mt-2 text-4xl font-bold tracking-tight text-white sm:text-5xl font-display">
            Transparent Pricing for Every Scale
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-neutral-300">
            Choose the plan that fits your needs. All plans start with a 14-day free trial. No credit card required.
          </p>
        </motion.div>

        {renderContent()}

      </div>
    </div>
  );
};

export default PricingPage;