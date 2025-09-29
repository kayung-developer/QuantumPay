import React, { useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// --- Component Imports ---
import Button from '../common/Button';

// --- Icon Imports ---
import { ArrowDownCircleIcon, ArrowUpCircleIcon, BanknotesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// [THEME-AWARE & I18N] This configuration object is now fully internationalized and theme-aware.
const transactionConfig = {
  DEPOSIT: { icon: ArrowDownCircleIcon, color: 'text-green-500' },
  P2P_TRANSFER_SENT: { icon: ArrowUpCircleIcon, color: 'text-red-500' },
  P2P_TRANSFER_RECEIVED: { icon: ArrowDownCircleIcon, color: 'text-green-500' },
  PAYMENT: { icon: BanknotesIcon, color: 'text-blue-500' },
  WITHDRAWAL: { icon: ArrowUpCircleIcon, color: 'text-red-500' },
  CURRENCY_EXCHANGE: { icon: ArrowPathIcon, color: 'text-indigo-500' },
  DEFAULT: { icon: BanknotesIcon, color: 'text-neutral-500 dark:text-neutral-400'}
};

// --- [ROBUST] Sub-component for a single transaction item ---
const TransactionItem = ({ tx, currentUserId }) => {
  const { t } = useTranslation();
  const isSent = tx.sender_id === currentUserId;

  let typeKey = tx.transaction_type;
  if (typeKey === 'P2P_TRANSFER') {
    typeKey = isSent ? 'P2P_TRANSFER_SENT' : 'P2P_TRANSFER_RECEIVED';
  }

  const { icon: Icon, color } = transactionConfig[typeKey] || transactionConfig.DEFAULT;
  const amountPrefix = isSent ? '-' : '+';
  const amountColor = isSent ? 'text-red-500' : 'text-green-500';

  // [ROBUST & I18N] Generate a more descriptive and translatable description
  const description = useMemo(() => {
    if (tx.description) return tx.description; // Always prioritize the backend description
    if (isSent) {
      return t('tx_description_to', { recipient: tx.receiver?.email || 'N/A' });
    }
    return t('tx_description_from', { sender: tx.sender?.email || t('tx_description_deposit') });
  }, [tx, isSent, t]);

  return (
    <li className="flex items-center justify-between py-4">
      <div className="flex items-center min-w-0">
        <div className={`p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 flex-shrink-0 ${color}`}>
            <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4 min-w-0">
          <p className="text-sm font-medium text-neutral-900 dark:text-white truncate">{description}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {format(parseISO(tx.created_at), 'MMM d, h:mm a')}
          </p>
        </div>
      </div>
      <div className="text-right ml-4 flex-shrink-0">
        <p className={`text-sm font-semibold ${amountColor}`}>
          {amountPrefix} {new Intl.NumberFormat('en-US', { style: 'currency', currency: tx.currency_code }).format(tx.amount)}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-400 capitalize">{tx.status.toLowerCase()}</p>
      </div>
    </li>
  );
};

// --- [THEME-AWARE] Sub-component for the loading skeleton ---
const SkeletonItem = () => (
    <li className="flex items-center justify-between py-4">
        <div className="flex items-center w-full">
            <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="ml-4 space-y-2 flex-grow">
                <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            </div>
        </div>
        <div className="text-right space-y-2 flex-shrink-0">
             <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
             <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse ml-4" />
        </div>
    </li>
);

// --- Main RecentTransactions Component ---
const RecentTransactions = ({ transactions = [], isLoading, error, currentUserId }) => {
  const { t } = useTranslation();
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };
  
  const renderContent = () => {
      if (isLoading) {
          return Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />);
      }
      if (error) {
          return <p className="text-center py-10 text-sm text-red-500">Could not load transactions.</p>;
      }
      if (transactions.length === 0) {
          return (
              <div className="text-center py-10">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{t('no_transactions_message')}</p>
              </div>
          );
      }

      return (
          <motion.ul variants={containerVariants} initial="hidden" animate="visible" className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {transactions.slice(0, 5).map((tx) => (
                  <motion.li variants={itemVariants} key={tx.id}>
                      <TransactionItem tx={tx} currentUserId={currentUserId} />
                  </motion.li>
              ))}
          </motion.ul>
      );
  };

  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow flex flex-col h-full">
      <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white font-display">{t('recent_transactions_title')}</h3>
        <Link to="/dashboard/transactions">
          <Button variant="ghost" size="sm">{t('view_all_button')}</Button>
        </Link>
      </div>
      <div className="px-5 flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default RecentTransactions;

