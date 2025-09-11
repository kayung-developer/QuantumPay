import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 py-12 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div>
          <ExclamationTriangleIcon className="mx-auto h-20 w-20 text-primary-light" />
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
            404
          </h1>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Page Not Found
          </h2>
          <p className="mt-4 text-lg text-neutral-400">
            Oops! The page you’re looking for doesn’t exist. It might have been moved or deleted.
          </p>
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button to="/" size="lg">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go back home
          </Button>
          <Button to="/support" variant="ghost" size="lg">
            Contact support <span aria-hidden="true">&rarr;</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;