import React from 'react';
import Spinner from '../common/Spinner';
import { format, parseISO } from 'date-fns';
import Button from '../common/Button';

const statusStyles = {
    pending: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
    completed: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
    processing: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 animate-pulse',
    failed: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
};

const PayrollHistory = ({ payrollRuns, isLoading, error, onExecute }) => {
    if (isLoading) return <div className="p-8 text-center"><Spinner /></div>;
    if (error) return <p className="p-8 text-center text-red-400">Could not load payroll history.</p>;

    return (
         <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Pay Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Total Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {payrollRuns?.length > 0 ? payrollRuns.map(run => (
                        <tr key={run.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-900 dark:text-white">
                                {format(parseISO(run.pay_period_start), 'MMM d')} - {format(parseISO(run.pay_period_end), 'MMM d, yyyy')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900 dark:text-white">
                                {new Intl.NumberFormat().format(run.total_source_cost)} {run.source_currency}
                            </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[run.status]}`}>
                                    {run.status}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                {run.status === 'pending' && (
                                    <Button size="sm" onClick={() => onExecute(run)}>Execute</Button>
                                )}
                                {run.status === 'completed' && (
                                     <span className="text-xs text-neutral-500">Paid on {format(parseISO(run.execution_date), 'MMM d')}</span>
                                )}
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" className="text-center py-12 text-neutral-500 dark:text-neutral-400">No payroll runs have been created yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default PayrollHistory;