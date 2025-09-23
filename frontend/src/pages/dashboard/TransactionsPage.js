import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import TransactionTable from '../../components/dashboard/TransactionTable';
import Button from '../../components/common/Button';
import { ChevronLeftIcon, ChevronRightIcon, FunnelIcon } from '@heroicons/react/24/solid';

const TRANSACTIONS_PER_PAGE = 10;

const TransactionsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1); // Will be set by API response in a real system
  const [filters, setFilters] = useState({}); // For future implementation

  // Calculate the 'skip' parameter for the API call
  const skip = (currentPage - 1) * TRANSACTIONS_PER_PAGE;

  // Construct the API URL with query parameters
  // NOTE: In a real system, the API would return the total count of transactions
  // to allow for proper pagination. We will simulate this on the frontend for now.
  const apiUrl = `/transactions/history?skip=${skip}&limit=${TRANSACTIONS_PER_PAGE}`;

  const { data: transactions, loading, error, request: fetchTransactions } = useApi(apiUrl, {}, true);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage]); // Refetch when currentPage changes

  // Simulate total pages. This is a frontend-only simulation.
  // A robust backend would provide a `total` count in the response.
  useEffect(() => {
    if (transactions) {
        // If we received fewer items than we asked for, we're likely on the last page.
        if (transactions.length < TRANSACTIONS_PER_PAGE) {
            setTotalPages(currentPage);
        } else {
            // Otherwise, there might be more pages.
            setTotalPages(currentPage + 1); // This is an optimistic assumption
        }
    }
  }, [transactions, currentPage]);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };


  return (
    <DashboardLayout pageTitleKey="transactions_title">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold font-display text-neutral-600 dark:text-white">Transaction History</h1>
          <p className="mt-1 text-neutral-400">View, search, and filter your complete transaction record.</p>
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="w-full md:w-1/2 lg:w-1/3">
                <input
                    type="search"
                    placeholder="Search by ID, email, or description..."
                    className="block w-full px-4 py-2 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-200"
                />
            </div>
            <div className="flex items-center space-x-3">
                <Button variant="secondary" disabled>
                    <FunnelIcon className="h-5 w-5 mr-2" />
                    Filter
                </Button>
                <Button variant="secondary" disabled>
                    Export CSV
                </Button>
            </div>
        </div>

        {/* Transaction Table */}
        <TransactionTable transactions={transactions} isLoading={loading} />

        {/* Pagination Controls */}
        {transactions && transactions.length > 0 && (
            <div className="flex items-center justify-between pt-4">
                <Button onClick={handlePrevPage} disabled={currentPage === 1 || loading} variant="secondary">
                    <ChevronLeftIcon className="h-5 w-5 mr-2"/>
                    Previous
                </Button>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    Page <span className="font-bold text-neutral-900 dark:text-white">{currentPage}</span> of <span className="font-bold text-neutral-900 dark:text-white">{totalPages}</span>
                </span>
                <Button onClick={handleNextPage} disabled={currentPage === totalPages || loading} variant="secondary">
                    Next
                    <ChevronRightIcon className="h-5 w-5 ml-2"/>
                </Button>
            </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default TransactionsPage;
