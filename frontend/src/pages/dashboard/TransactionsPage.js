// FILE: src/pages/dashboard/TransactionsPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { format, subDays } from 'date-fns';
import debounce from 'lodash.debounce';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import TransactionTable from '../../components/dashboard/TransactionTable';
import Button from '../../components/common/Button';
import UpgradePrompt from '../../components/common/UpgradePrompt'; 

// --- Hook Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import apiClient from '../../api/axiosConfig';
import { toast } from 'react-hot-toast';

// --- Icon Imports ---
import { DocumentArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const TRANSACTIONS_PER_PAGE = 10;

const TransactionsPage = () => {
  const { t } = useTranslation();
  const { hasActiveSubscription, authToken } = useAuth(); // Get subscription info
  
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
      start: format(subDays(new Date(), 30), 'yyyy-MM-dd'),
      end: format(new Date(), 'yyyy-MM-dd'),
      search: '',
  });

  // Construct the API URL with query parameters based on state.
  const apiUrl = `/transactions/history?skip=${(currentPage - 1) * TRANSACTIONS_PER_PAGE}&limit=${TRANSACTIONS_PER_PAGE}&start_date=${filters.start}&end_date=${filters.end}&search=${filters.search}`;
  
  // Fetch data manually whenever the apiUrl changes.
  const { data, loading, error, request: fetchTransactions } = useApi(apiUrl, {}, true); 
  const [isExporting, setIsExporting] = useState(false);
  
  const totalPages = data ? Math.ceil(data.total / TRANSACTIONS_PER_PAGE) : 1;
  const transactions = data ? data.transactions : [];

  // Re-fetch transactions whenever the API URL changes (due to filters or page changes).
  useEffect(() => {
    fetchTransactions();
  }, [apiUrl, fetchTransactions]);

  // Debounce search input to prevent API calls on every keystroke.
  const debouncedSearch = useCallback(debounce((searchValue) => {
    setFilters(prev => ({ ...prev, search: searchValue }));
    setCurrentPage(1); // Reset to page 1 on new search
  }, 500), []);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };
  
  // --- [THE FEATURE GATING LOGIC] ---
  const canExport = hasActiveSubscription('premium');

  const handleExport = async () => {
    if (!canExport) {
        toast.error("Please upgrade to a Premium plan to export statements.");
        return;
    }
    setIsExporting(true);
    try {
        const response = await apiClient.get('/analytics/export-statement', {
            params: { start_date: filters.start, end_date: filters.end },
            headers: { Authorization: `Bearer ${authToken}` },
            responseType: 'blob', // Critical for handling file downloads
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `QuantumPay_Statement_${filters.start}_to_${filters.end}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Your statement has been downloaded.");
    } catch (err) {
        const errorMessage = err.response?.data?.detail || "Could not generate your statement.";
        toast.error(errorMessage);
    } finally {
        setIsExporting(false);
    }
  };

  return (
    <DashboardLayout pageTitleKey="transactions_title">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Transaction History</h1>
          <p className="mt-1 text-neutral-600 dark:text-neutral-400">View, search, and export your complete transaction record.</p>
        </div>

        <div className="p-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="relative lg:col-span-2">
                    <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                    <input type="search" placeholder="Search by description or email..." onChange={handleSearchChange} className="block w-full rounded-md border-0 py-2 pl-10 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 placeholder:text-neutral-400 focus:ring-2 focus:ring-inset focus:ring-primary" />
                </div>
                <div><input type="date" value={filters.start} onChange={e => setFilters(prev => ({...prev, start: e.target.value}))} className="block w-full rounded-md border-0 py-2 px-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary" /></div>
                <div><input type="date" value={filters.end} onChange={e => setFilters(prev => ({...prev, end: e.target.value}))} className="block w-full rounded-md border-0 py-2 px-3 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 ring-1 ring-inset ring-neutral-300 dark:ring-neutral-700 focus:ring-2 focus:ring-inset focus:ring-primary" /></div>
            </div>
        </div>
        
        <div className="flex justify-end">
            {canExport ? (
                <Button onClick={handleExport} isLoading={isExporting} variant="secondary">
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" /> Export PDF
                </Button>
            ) : <UpgradePrompt featureName="Export Statements" requiredPlan="Premium" />}
        </div>
        
        <TransactionTable transactions={transactions} isLoading={loading} error={error} />

        {data && data.total > 0 && (
            <div className="flex items-center justify-between pt-4">
                <Button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1 || loading} variant="secondary">
                    <ChevronLeftIcon className="h-5 w-5 mr-2"/> Previous
                </Button>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Page <span className="font-bold text-neutral-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-neutral-900 dark:text-white">{totalPages}</span>
                </span>
                <Button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || loading} variant="secondary">
                    Next <ChevronRightIcon className="h-5 w-5 ml-2"/>
                </Button>
            </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;