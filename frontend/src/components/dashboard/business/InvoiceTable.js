import React from 'react';
import { format, parseISO } from 'date-fns';

const statusStyles = {
  paid: 'bg-green-900 text-green-300',
  sent: 'bg-blue-900 text-blue-300',
  overdue: 'bg-yellow-900 text-yellow-300',
  draft: 'bg-neutral-700 text-neutral-300',
  void: 'bg-red-900 text-red-300',
};

const InvoiceTable = ({ invoices, isLoading, error }) => {
  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />);
    }
    if (error) {
      return <tr><td colSpan="5" className="text-center py-10 text-red-400">Failed to load invoices.</td></tr>;
    }
    if (!invoices || invoices.length === 0) {
      return <tr><td colSpan="5" className="text-center py-12 text-neutral-500">No invoices found. Create your first one!</td></tr>;
    }
    return invoices.map((invoice) => (
      <tr key={invoice.id} className="hover:bg-neutral-800/50">
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary hover:underline cursor-pointer">{invoice.id}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{invoice.customer_email}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{format(parseISO(invoice.due_date), 'MMM d, yyyy')}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
          {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.amount)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[invoice.status] || statusStyles.draft}`}>
            {invoice.status}
          </span>
        </td>
      </tr>
    ));
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-800">
          <thead className="bg-neutral-800/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Invoice ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {renderContent()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const SkeletonRow = () => (
  <tr>
    <td className="px-6 py-4"><div className="h-4 w-24 bg-neutral-700 rounded animate-pulse" /></td>
    <td className="px-6 py-4"><div className="h-4 w-32 bg-neutral-700 rounded animate-pulse" /></td>
    <td className="px-6 py-4"><div className="h-4 w-20 bg-neutral-700 rounded animate-pulse" /></td>
    <td className="px-6 py-4"><div className="h-4 w-16 bg-neutral-700 rounded animate-pulse" /></td>
    <td className="px-6 py-4"><div className="h-5 w-16 bg-neutral-700 rounded-full inline-block animate-pulse" /></td>
  </tr>
);

export default InvoiceTable;