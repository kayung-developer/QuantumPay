// FILE: src/pages/dashboard/TransactionsPage.js

import React, { useState, useEffect, useMemo, useCallback } from 'react'; // <-- Import useCallback
import { useTranslation } from 'react-i18next';
import { format, parseISO, subDays } from 'date-fns';
import { motion } from 'framer-motion';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import UpgradePrompt from '../../components/common/UpgradePrompt';

// --- Hook Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi'; // useApiPost is not needed here
import apiClient from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';

// --- Icon Imports ---
import { DocumentArrowDownIcon, ArrowDownCircleIcon, ArrowUpCircleIcon, BanknotesIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

// --- Sub-Components (These are correct) ---

const StatBox = ({ title, value, currency, color = 'text-white' }) => (
    <div className="bg-neutral-800 p-4 rounded-lg">
        <p className="text-sm text-neutral-400">{title}</p>
        <p className={`text-2xl font-semibold ${color}`}>
            {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(value)}
        </p>
    </div>
);

const TransactionRow = ({ tx, currentUserId, currency }) => {
    const isDebit = tx.sender_id === currentUserId;
    const amountPrefix = isDebit ? '-' : '+';
    const amountColor = isDebit ? 'text-red-400' : 'text-green-400';

    const config = {
      DEPOSIT: { icon: ArrowDownCircleIcon, color: 'text-green-500' },
      P2P_TRANSFER: { icon: isDebit ? ArrowUpCircleIcon : ArrowDownCircleIcon, color: isDebit ? 'text-red-500' : 'text-green-500'},
      PAYMENT: { icon: BanknotesIcon, color: 'text-blue-500' },
      WITHDRAWAL: { icon: ArrowUpCircleIcon, color: 'text-red-500' },
      CURRENCY_EXCHANGE: { icon: ArrowPathIcon, color: 'text-indigo-500' },
    };
    const { icon: Icon, color: iconColor } = config[tx.transaction_type] || config.P2P_TRANSFER;

    return (
        <li className="flex items-center justify-between py-4">
            <div className="flex items-center min-w-0">
                <div className={`p-2 rounded-full bg-neutral-800 ${iconColor}`}><Icon className="h-6 w-6" /></div>
                <div className="ml-4 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{tx.description}</p>
                    <p className="text-xs text-neutral-400">{format(parseISO(tx.created_at), 'h:mm a')}</p>
                </div>
            </div>
            <div className="text-right ml-4 flex-shrink-0">
                <p className={`text-sm font-semibold ${amountColor}`}>{amountPrefix} {new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(tx.amount)}</p>
                <p className="text-xs text-neutral-500 font-mono">{new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(tx.running_balance)}</p>
            </div>
        </li>
    );
};



const TransactionsPage = () => {
  const { t } = useTranslation();
  const { hasActiveSubscription, dbUser, authToken } = useAuth(); // <-- [THE FIX] Get authToken
  const { data: wallets, loading: walletsLoading } = useApi('/wallets/me');

  const [filters, setFilters] = useState({
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
      currency: 'USD',
  });

  // [THE FIX] Define the isExporting state and its setter
  const [isExporting, setIsExporting] = useState(false);

  const canExport = hasActiveSubscription('premium');

  const apiUrl = filters.currency ? `/transactions/advanced-history?start_date=${filters.start}&end_date=${filters.end}&currency=${filters.currency}` : null;
  const { data, loading, error, request: fetchTransactions } = useApi(apiUrl, {}, true);

  // Set default currency once wallets are loaded
  useEffect(() => {
    if (wallets && wallets.length > 0 && !wallets.some(w => w.currency_code === filters.currency)) {
      setFilters(prev => ({ ...prev, currency: wallets[0].currency_code }));
    }
  }, [wallets, filters.currency]);

  // Fetch transactions when filters change
  const fetchCallback = useCallback(() => {
    if(filters.currency) {
      fetchTransactions();
    }
  }, [filters.currency, filters.start, filters.end, fetchTransactions]);

  useEffect(() => {
    fetchCallback();
  }, [fetchCallback]);

  const groupedTransactions = useMemo(() => {
    if (!data?.transactions) return {};
    return data.transactions.reduce((acc, tx) => {
      const date = format(parseISO(tx.created_at), 'MMMM d, yyyy');
      if (!acc[date]) acc[date] = [];
      acc[date].push(tx);
      return acc;
    }, {});
  }, [data]);

  const handleExport = async () => {
    if (!canExport) {
        toast.error("Please upgrade to a Premium plan to export statements.");
        return;
    }
    setIsExporting(true);
    try {
        // [THE DEFINITIVE, FINAL FIX IS HERE]
        // We must tell Axios to expect a binary 'blob' as the response type.
        const response = await apiClient.get('/analytics/export-statement', {
            params: { start_date: filters.start, end_date: filters.end },
            headers: { Authorization: `Bearer ${authToken}` },
            responseType: 'blob', // <-- THIS LINE SOLVES THE CORRUPTION ISSUE
        });

        // The 'response.data' will now be a Blob object, not garbled text.
        const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `QuantumPay_Statement_${filters.start}_to_${filters.end}.pdf`);
        document.body.appendChild(link);
        link.click();

        // Clean up the object URL after the download is initiated
        window.URL.revokeObjectURL(url);
        link.remove();

        toast.success("Your statement has been downloaded.");

    } catch (err) {
        // This is a failsafe in case the blob itself contains an error message from the server
        try {
            const errorText = await err.response.data.text();
            const errorJson = JSON.parse(errorText);
            toast.error(errorJson.detail || "Could not generate your statement.");
        } catch {
            toast.error("An unknown error occurred while generating your statement.");
        }
    } finally {
        setIsExporting(false);
    }
  };
  // [THE DEFINITIVE FIX] Wrap the main JSX in a renderContent function.
  const renderContent = () => {
    if (walletsLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (wallets && wallets.length === 0) return <p className="text-center text-neutral-400 py-10">You need a wallet to view transactions.</p>;
    if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;
    if (error) return <p className="text-center text-red-400 py-10">Could not load transaction history for {filters.currency}.</p>;
    if (!data || data.transactions.length === 0) return <p className="text-center text-neutral-400 py-10">No transactions found for the selected period.</p>;

    return (
      <div className="space-y-8 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatBox title="Total Inflow" value={data.total_inflow} currency={filters.currency} color="text-green-400" />
          <StatBox title="Total Outflow" value={data.total_outflow} currency={filters.currency} color="text-red-400" />
          <StatBox title="Net Change" value={data.net_change} currency={filters.currency} color={data.net_change >= 0 ? 'text-green-400' : 'text-red-400'}/>
        </div>
        <div>
          {Object.entries(groupedTransactions).map(([date, txs]) => (
            <div key={date} className="mb-6">
              <h3 className="text-sm font-semibold text-neutral-400 py-2 border-b border-neutral-800">{date}</h3>
              <ul className="divide-y divide-neutral-800">
                {txs.map(tx => <TransactionRow key={tx.id} tx={tx} currentUserId={dbUser?.id} currency={filters.currency} />)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout pageTitleKey="transactions_title">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Statements</h1>
            <div className="flex items-center gap-4 bg-neutral-900 p-2 rounded-lg">
                {wallets && <select value={filters.currency} onChange={e => setFilters(prev => ({...prev, currency: e.target.value}))} className="bg-neutral-800 rounded-md border-neutral-700 text-white focus:ring-primary">
                    {wallets.map(w => <option key={w.currency_code} value={w.currency_code}>{w.currency_code}</option>)}
                </select>}
                <input type="date" value={filters.start} onChange={e => setFilters(prev => ({...prev, start: e.target.value}))} className="bg-neutral-800 rounded-md border-neutral-700 text-white focus:ring-primary"/>
                <input type="date" value={filters.end} onChange={e => setFilters(prev => ({...prev, end: e.target.value}))} className="bg-neutral-800 rounded-md border-neutral-700 text-white focus:ring-primary"/>
                {canExport ? (
                    <Button onClick={handleExport} isLoading={isExporting} variant="secondary" className="!py-2">
                        <DocumentArrowDownIcon className="h-5 w-5"/>
                    </Button>
                ) : (
                    <div className="w-10 h-10 flex items-center justify-center">
                        <UpgradePrompt featureName="" requiredPlan="Premium" />
                    </div>
                )}
            </div>
        </div>
        {renderContent()} {/* <-- [THE FIX] Call the render function */}
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;
