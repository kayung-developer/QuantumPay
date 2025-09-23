import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';
// [THE FIX] Replace CompassIcon with a valid icon from the library, like MapIcon.
import { MapIcon, ArrowLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const popularLinks = [
    { name: 'Go to your Dashboard', href: '/dashboard' },
    { name: 'Check your Wallets', href: '/dashboard/wallets' },
    { name: 'View your Transactions', href: '/dashboard/transactions' },
    { name: 'Visit our Support Center', href: '/support' },
];

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-neutral-950 px-4 py-12 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-lg"
      >
        <div>
          {/* [THE FIX] Use the valid MapIcon here */}
          <MapIcon className="mx-auto h-16 w-16 text-primary" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">
            404 - Page Not Found
          </h1>
          <p className="mt-4 text-lg leading-8 text-neutral-600 dark:text-neutral-400">
            Oops! It seems you've taken a wrong turn. The page you’re looking for doesn’t exist or has been moved.
          </p>
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-4">
          <Button to="/" size="lg">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go Back Home
          </Button>
          <Button to="/support" variant="outline" size="lg">
            Contact Support
          </Button>
        </div>

        <div className="mt-16">
            <h2 className="text-base font-semibold text-neutral-600 dark:text-neutral-300">
                Here are some helpful links instead:
            </h2>
            <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800 border-t border-b border-neutral-200 dark:border-neutral-800">
                {popularLinks.map((link, index) => (
                    <motion.li
                        key={link.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    >
                        <Link to={link.href} className="group flex items-center justify-between p-4 transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900">
                            <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">{link.name}</span>
                            <ChevronRightIcon className="h-5 w-5 text-neutral-400 transition-transform group-hover:text-primary group-hover:translate-x-1" />
                        </Link>
                    </motion.li>
                ))}
            </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;