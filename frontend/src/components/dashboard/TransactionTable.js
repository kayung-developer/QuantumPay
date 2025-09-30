// FILE: src/components/dashboard/TransactionTable.js

import React from 'react';
import { format, parseISO } from 'date-fns';
import { motion } from 'framer-motion';
import { ArrowDownCircleIcon, ArrowUpCircleIcon, BanknotesIcon, ShieldExclamationIcon } from '@heroicons/react/24/outline';

// Helper function to safely format currency
const formatCurrency = (amount, currency) => {
    try {
        // This will throw an error for invalid currency codes
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
    } catch (e) {
        // Fallback for invalid codes or other errors
        return `${currency || '?'} ${amount.toFixed(2)}`;
    }
};

const transactionMetadata = {
  DEPOSIT: { icon: ArrowDownCircleIcon, color: 'text-green-400', label: 'Deposit' },
  P2P_TRANSFER: { icon: BanknotesIcon, color: 'text-blue-400' },
  PAYMENT: { icon: BanknotesIcon, color: 'text-blue-400', label: 'Payment' },
  WITHDRAWAL: { icon: ArrowUpCircleIcon, color: 'text-red-400', label: 'Withdrawal' },
  SUBSCRIPTION: { icon: BanknotesIcon, color: 'text-purple-400', label: 'Subscription'},
  REFUND: { icon: ArrowDownCircleIcon, color: 'text-yellow-400', label: 'Refund' },
  DEFAULT: { icon: BanknotesIcon, color: 'text-neutral-500 dark:text-neutral-400', label: 'Transaction' }
};

const getTransactionDetails = (tx, currentUserId) => {
  const txType = (tx.transaction_type || 'default').toUpperCase();

  if (txType === 'P2P_TRANSFER') {
    const isSent = tx.sender_id === currentUserId;
    return {
      icon: isSent ? ArrowUpCircleIcon : ArrowDownCircleIcon,
      color: isSent ? 'text-red-400' : 'text-green-400',
      label: isSent ? 'Transfer Sent' : 'Transfer Received',
      peer: isSent ? tx.receiver?.email : tx.sender?.email,
      amountPrefix: isSent ? '-' : '+',
      amountColor: isSent ? 'text-red-400' : 'text-green-400'
    };
  }

  const meta = transactionMetadata[txType] || transactionMetadata.DEFAULT;
  const isDebit = ['WITHDRAWAL', 'PAYMENT', 'SUBSCRIPTION'].includes(txType);

  return {
    ...meta,
    peer: tx.description || 'System Transaction',
    amountPrefix: isDebit ? '-' : '+',
    amountColor: isDebit ? 'text-red-400' : 'text-green-400'
  };
};

const TransactionRow = ({ tx, currentUserId }) => {
  const { icon: Icon, color, label, peer, amountPrefix, amountColor } = getTransactionDetails(tx, currentUserId);

  return (
    <motion.tr
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors"
    >
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        <div className="flex items-center">
          <div className={`p-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div className="ml-4">
            <div className="font-medium text-neutral-900 dark:text-white">{label}</div>
            <div className="text-neutral-500 dark:text-neutral-400 text-xs">{peer || 'N/A'}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
        #{tx.id ? tx.id.substring(0, 8) : 'N/A'}...
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
        {tx.created_at ? format(parseISO(tx.created_at), 'MMM d, yyyy, h:mm a') : 'N/A'}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
        <span className={amountColor}>
          {amountPrefix} {formatCurrency(tx.amount || 0, tx.currency_code || 'USD')}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${
          tx.status === 'COMPLETED' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' :
          tx.status === 'PENDING' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300' :
          'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'
        }`}>
          {(tx.status || 'unknown').toLowerCase()}
        </span>
        {tx.is_flagged_as_fraud && (
           <ShieldExclamationIcon className="h-5 w-5 text-red-500 inline-block ml-2" title="Flagged as potential fraud" />
        )}
      </td>
    </motion.tr>
  );
};


const SkeletonRow = () => (
    <tr>
        <td className="px-6 py-4">
            <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
                <div className="ml-4 space-y-2">
                    <div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                    <div className="h-3 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" />
                </div>
            </div>
        </td>
        <td className="px-6 py-4"><div className="h-4 w-20 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /></td>
        <td className="px-6 py-4"><div className="h-4 w-32 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /></td>
        <td className="px-6 py-4"><div className="h-4 w-24 bg-neutral-200 dark:bg-neutral-700 rounded animate-pulse" /></td>
        <td className="px-6 py-4 text-right"><div className="h-5 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full inline-block animate-pulse" /></td>
    </tr>
)

const TransactionTable = ({ transactions, isLoading, currentUserId }) => { // <-- Accept currentUserId as a prop
  return (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
          <thead className="bg-neutral-50 dark:bg-neutral-800/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Details</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Transaction ID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Amount</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => <SkeletonRow key={i} />)
            ) : transactions && transactions.length > 0 ? (
              transactions.map((tx) => <TransactionRow key={tx.id} tx={tx} currentUserId={currentUserId} />) // <-- Pass the prop down
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-12 text-neutral-500 dark:text-neutral-400">
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionTable;
