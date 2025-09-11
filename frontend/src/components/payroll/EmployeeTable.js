import React from 'react';
import Spinner from '../common/Spinner';

const EmployeeTable = ({ employees, isLoading, error }) => {
    if (isLoading) return <div className="flex justify-center p-8"><Spinner size="lg" /></div>;
    if (error) return <p className="text-center text-red-400">Could not load employee data.</p>;

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-800">
                <thead className="bg-neutral-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Employee</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Salary</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                    {employees?.length > 0 ? employees.map(emp => (
                        <tr key={emp.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-white">{emp.user.full_name}</div>
                                <div className="text-sm text-neutral-400">{emp.user.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{emp.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                                {new Intl.NumberFormat('en-US').format(emp.salary)} {emp.salary_currency}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                    {emp.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </td>
                        </tr>
                    )) : (
                        <tr>
                            <td colSpan="4" className="text-center py-12 text-neutral-500">No employees have been added to your payroll.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default EmployeeTable;