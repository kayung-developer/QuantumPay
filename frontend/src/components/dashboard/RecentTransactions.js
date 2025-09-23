import React from 'react';
import { format, parseISO } from 'date-fns';
import { ArrowDownCircleIcon, ArrowUpCircleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { motion } from 'framer-motion';

const transactionIcons = {
  DEPOSIT: { icon: ArrowDownCircleIcon, color: 'text-green-500' }, // Kept semantic colors (green/red)
  P2P_TRANSFER_SENT: { icon: ArrowUpCircleIcon, color: 'text-red-500' },
  P2P_TRANSFER_RECEIVED: { icon: ArrowDownCircleIcon, color: 'text-green-500' },
  PAYMENT: { icon: BanknotesIcon, color: 'text-blue-500' },
  WITHDRAWAL: { icon: ArrowUpCircleIcon, color: 'text-red-500' },
  DEFAULT: { icon: BanknotesIcon, color: 'text-neutral-500 dark:text-neutral-400'}
};

const TransactionItem = ({ tx, currentUserId }) => {
  const isSent = tx.sender_id === currentUserId;
  const isReceived = tx.receiver_id === currentUserId;

  let typeKey = tx.transaction_type;
  if (typeKey === 'P2P_TRANSFER') {
    typeKey = isSent ? 'P2P_TRANSFER_SENT' : 'P2P_TRANSFER_RECEIVED';
  }

  const { icon: Icon, color } = transactionIcons[typeKey] || transactionIcons.DEFAULT;
  const amountPrefix = isSent ? '-' : '+';
  const amountColor = isSent ? 'text-red-500' : 'text-green-500';

  const description = isSent
      ? `To: ${tx.receiver?.email || 'N/A'}`
      : `From: ${tx.sender?.email || 'Deposit'}`;

  return (
    <li className="flex items-center justify-between py-4">
      <div className="flex items-center">
        {/* [THEME FIX] Updated icon background color */}
        <div className={`p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 ${color}`}>
            <Icon className="h-6 w-6" />
        </div>
        <div className="ml-4">
          {/* [THEME FIX] Updated text colors */}
          <p className="text-sm font-medium text-neutral-900 dark:text-white">{tx.description || description}</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            {format(parseISO(tx.created_at), 'MMM d, yyyy h:mm a')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-sm font-semibold ${amountColor}`}>
          {amountPrefix} ${tx.amount.toFixed(2)}
        </p>
        <p className="text-xs text-neutral-500 dark:text-neutral-500 capitalize">{tx.status.toLowerCase()}</p>
      </div>
    </li>
  );
};

const SkeletonItem = () => (
    <li className="flex items-center justify-between py-4">
        <div className="flex items-center">
            {/* [THEME FIX] Updated skeleton colors */}
            <div className="h-10 w-10 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
            <div className="ml-4 space-y-2">
                <div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                <div className="h-3 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
            </div>
        </div>
        <div className="text-right space-y-2">
             <div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
             <div className="h-3 w-12 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
        </div>
    </li>
);

const RecentTransactions = ({ transactions = [], isLoading, currentUserId }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    // [THEME FIX] Updated main container background and border colors
  <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 ...">
    <div className="flex items-center justify-between p-5 border-b border-neutral-200 dark:border-neutral-800">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-white font-display">Recent Transactions</h3>
        <Button to="/dashboard/transactions" variant="ghost" size="sm">View All</Button>
      </div>
      <div className="px-5 flex-grow">
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, i) => <SkeletonItem key={i} />)
          ) : (
            transactions.length > 0 ? (
                <motion.ul variants={containerVariants} initial="hidden" animate="visible">
                    {transactions.slice(0, 5).map((tx) => (
                        <motion.li variants={itemVariants} key={tx.id}>
                            <TransactionItem tx={tx} currentUserId={currentUserId} />
                        </motion.li>
                    ))}
                </motion.ul>
            ) : (
              <div className="text-center py-10">
                {/* [THEME FIX] Updated empty state text color */}
                <p className="text-neutral-500 dark:text-neutral-400">No recent transactions.</p>
              </div>
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default RecentTransactions;
