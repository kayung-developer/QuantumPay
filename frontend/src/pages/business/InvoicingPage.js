import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import { PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import { format, parseISO } from 'date-fns';

const statusStyles = {
    paid: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    sent: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
    overdue: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
    draft: 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300',
};

const InvoicingPage = () => {
    const { data: invoices, loading, error } = useApi('/business/invoices');

    const renderContent = () => {
        if (loading) return <div className="p-12 text-center"><Spinner /></div>;
        if (error) return <div className="p-12 text-center text-red-400">Could not load invoices.</div>;
        if (!invoices || invoices.length === 0) {
            return (
                <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                    <DocumentTextIcon className="h-12 w-12 mx-auto"/>
                    <p className="mt-2 font-semibold">You haven't created any invoices yet.</p>
                    <p className="mt-1 text-sm">Click "Create Invoice" to send your first one.</p>
                </div>
            );
        }

        return (
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                            <th className="px-6 py-3 ...">Customer</th>
                            <th className="px-6 py-3 ...">Amount</th>
                            <th className="px-6 py-3 ...">Due Date</th>
                            <th className="px-6 py-3 ...">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {invoices.map(inv => (
                            <tr key={inv.id}>
                                <td className="px-6 py-4"><div className="font-medium">{inv.customer_email}</div><div className="text-sm text-neutral-500">{inv.invoice_number}</div></td>
                                <td className="px-6 py-4 font-semibold">{new Intl.NumberFormat('en-US', { style: 'currency', currency: inv.currency }).format(inv.total_amount)}</td>
                                <td className="px-6 py-4 text-sm">{format(parseISO(inv.due_date), 'MMM d, yyyy')}</td>
                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs font-semibold rounded-full ${statusStyles[inv.status]}`}>{inv.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="invoicing_title">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Invoices</h1>
                <Link to="/business/invoicing/new">
                    <Button><PlusIcon className="h-5 w-5 mr-2"/>Create Invoice</Button>
                </Link>
            </div>
            <div className="bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default InvoicingPage;