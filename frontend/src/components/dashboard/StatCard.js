import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const StatCard = ({ title, value, icon: Icon, change, changeType, isLoading }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const renderChange = () => {
    if (!change) return null;

    const isPositive = changeType === 'positive';

    return (
      <div className={`flex items-center text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? (
          <ArrowUpIcon className="h-4 w-4 mr-1" />
        ) : (
          <ArrowDownIcon className="h-4 w-4 mr-1" />
        )}
        <span>{change}</span>
      </div>
    );
  };

  // Shimmer effect for loading state
  const Shimmer = () => (
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/50 to-transparent animate-shimmer" />
  );

  return (
    <motion.div
      variants={cardVariants}
      className="relative overflow-hidden bg-neutral-900 border border-neutral-800 rounded-lg p-5 shadow-lg flex items-start justify-between"
    >
      {isLoading && <Shimmer />}

      <div className="flex flex-col space-y-2">
        <p className={`text-sm font-medium text-neutral-400 ${isLoading ? 'bg-neutral-700 rounded w-24 h-4' : ''}`}>{!isLoading && title}</p>
        <p className={`font-display text-3xl font-bold text-white ${isLoading ? 'bg-neutral-700 rounded w-32 h-9 mt-1' : ''}`}>{!isLoading && value}</p>
        <div className={`h-4 mt-1 ${isLoading ? 'bg-neutral-700 rounded w-16' : ''}`}>
          {!isLoading && renderChange()}
        </div>
      </div>
      <div className="flex-shrink-0">
        <div className="p-3 bg-primary/20 rounded-lg">
          <Icon className={`h-6 w-6 text-primary-light ${isLoading ? 'opacity-0' : ''}`} />
        </div>
      </div>
    </motion.div>
  );
};

export default StatCard;