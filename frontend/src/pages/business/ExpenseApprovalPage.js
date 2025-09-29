// FILE: src/pages/business/ExpenseApprovalPage.js

import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApi, useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';

const ExpenseApprovalPage = () => {
    const { t } = useTranslation();
    // [THE FIX] This now correctly calls the business-scoped endpoint
    const { data: pendingExpenses, loading, error, request: refetch } = useApi('/business/expenses/pending');
    const [reviewingId, setReviewingId] = useState(null);
    // The useApiPost hook is flexible. The URL will be provided when it's called.
    const { post: reviewExpense, loading: isReviewing } = useApiPost('', { method: 'PUT' });

    const handleReview = async (expenseId, status) => {
        setReviewingId(expenseId);
        // [THE FIX] Call the correct, specific endpoint for reviewing an expense.
        const result = await reviewExpense({ status }, { url: `/business/expenses/${expenseId}/review` });
        if (result.success) {
            toast.success(`Expense has been ${status}.`);
            refetch(); // Refresh the list of pending expenses
        }
        setReviewingId(null);
    };

    const renderContent = () => {
        if (loading) return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;
        if (error) return <p className="text-center p-8 text-red-400">{error.message || t('expenses_load_error')}</p>;
        if (!pendingExpenses || pendingExpenses.length === 0) {
            return <p className="text-center py-12 text-neutral-500 dark:text-neutral-400">{t('expenses_none_pending')}</p>;
        }

        return (
             <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Employee</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Submitted</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {pendingExpenses.map(exp => (
                            <tr key={exp.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-neutral-900 dark:text-white">{exp.employee.full_name}</div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">{exp.employee.email}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-semibold text-neutral-900 dark:text-white">{new Intl.NumberFormat().format(exp.amount)} {exp.currency}</div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">{exp.merchant_name}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                    {format(parseISO(exp.submitted_at), 'MMM d, yyyy')}
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button onClick={() => handleReview(exp.id, 'rejected')} variant="danger" size="sm" isLoading={reviewingId === exp.id && isReviewing} disabled={isReviewing}>
                                        <XMarkIcon className="h-4 w-4"/>
                                    </Button>
                                    <Button onClick={() => handleReview(exp.id, 'approved')} size="sm" isLoading={reviewingId === exp.id && isReviewing} disabled={isReviewing}>
                                        <CheckIcon className="h-4 w-4"/>
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="expense_approvals_title">
             <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('expense_approvals_title')}</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('expenses_header_subtitle')}</p>
                </div>
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default ExpenseApprovalPage;
