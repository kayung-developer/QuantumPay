import React from 'react';
import Spinner from '../common/Spinner';
import Button from '../common/Button';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

const EmployeeTable = ({ employees, isLoading, error, onEdit, onDelete }) => {
    if (isLoading) {
        return (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 text-center">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return <p className="p-8 text-center text-red-400">Could not load employee data.</p>;
    }

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Salary</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                    {employees?.length > 0 ? employees.map(emp => (
                        <tr key={emp.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-neutral-900 dark:text-white">{emp.user.full_name}</div>
                                <div className="text-sm text-neutral-500 dark:text-neutral-400">{emp.user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-300">{emp.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-neutral-900 dark:text-white">
                                {new Intl.NumberFormat().format(emp.salary)} {emp.salary_currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.is_active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300'}`}>
                                    {emp.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                                <Button onClick={() => onEdit(emp)} variant="ghost" size="sm"><PencilIcon className="h-4 w-4"/></Button>
                                <Button onClick={() => onDelete(emp)} variant="ghost" size="sm"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
                            </td>
                        </tr>
                    )) : (
                        <tr><td colSpan="5" className="text-center py-12 text-neutral-500 dark:text-neutral-400">No employees have been added to your payroll.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTable;