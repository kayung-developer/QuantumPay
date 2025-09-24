// FILE: src/pages/business/PayrollPage.js

import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi, { useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { PlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

// Import the reusable components that were previously on separate pages
import EmployeeTable from '../../components/payroll/EmployeeTable';
import PayrollHistory from '../../components/payroll/PayrollHistory';
import EmployeeFormModal from '../../components/payroll/EmployeeFormModal';
import CreatePayrollRunModal from '../../components/payroll/CreatePayrollRunModal';
import ExecutePayrollModal from '../../components/payroll/ExecutePayrollModal';

const PayrollPage = () => {
    const { t } = useTranslation();

    // API hooks for both data sources are now in one place
    const { data: employees, loading: employeesLoading, error: employeesError, request: refetchEmployees } = useApi('/business/employees');
    const { data: payrollRuns, loading: runsLoading, error: runsError, request: refetchRuns } = useApi('/business/payroll-runs');

    // Consolidated state for all modals on this page
    const [modalState, setModalState] = useState({
        employeeForm: { isOpen: false, employee: null },
        createRun: false,
        executeRun: null,
    });

    const hasActiveEmployees = useMemo(() => employees && employees.some(e => e.is_active), [employees]);

    // Hook for the delete employee action
    const { post: deleteEmployee } = useApiPost('', { method: 'DELETE' });

    // Consolidated event handlers
    const handleEmployeeSave = (isEditing) => {
        setModalState(prev => ({ ...prev, employeeForm: { isOpen: false, employee: null } }));
        refetchEmployees();
        toast.success(`Team member ${isEditing ? 'updated' : 'added'} successfully.`);
    };

    const handleDeleteEmployee = (employee) => {
        if (window.confirm(`Are you sure you want to remove ${employee.user.full_name} from your team? This will make them inactive.`)) {
            deleteEmployee({}, { url: `/business/employees/${employee.id}` }).then(result => {
                if (result.success) {
                    toast.success(result.data.message || "Team member updated.");
                    refetchEmployees(); // Refetch to show the 'inactive' status
                }
            });
        }
    };

    const handleRunCreated = () => {
        setModalState(prev => ({ ...prev, createRun: false }));
        refetchRuns();
        toast.success("Payroll run calculated and saved as pending.");
    };

    const handleRunExecuted = () => {
        setModalState(prev => ({ ...prev, executeRun: null }));
        refetchRuns();
        refetchEmployees(); // Also refetch employees as balances/states might change
        toast.success("Payroll has been executed successfully!");
    };

    return (
        <DashboardLayout pageTitleKey="payroll_title">
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('payroll_title')}</h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('payroll_header_subtitle')}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <Button onClick={() => setModalState(prev => ({ ...prev, employeeForm: { isOpen: true, employee: null } }))} variant="secondary">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            {t('payroll_add_team_button')}
                        </Button>
                        <Button onClick={() => setModalState(prev => ({ ...prev, createRun: true }))} disabled={!hasActiveEmployees || employeesLoading}>
                            <ChevronRightIcon className="h-5 w-5 mr-2" />
                            {t('payroll_create_run_button')}
                        </Button>
                    </div>
                </div>

                {/* Team Management Section */}
                <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-display mb-4">{t('payroll_team_title')}</h2>
                    <EmployeeTable
                        employees={employees}
                        isLoading={employeesLoading}
                        error={employeesError}
                        onEdit={(emp) => setModalState(prev => ({ ...prev, employeeForm: { isOpen: true, employee: emp } }))}
                        onDelete={handleDeleteEmployee}
                    />
                </div>

                {/* Payroll History Section */}
                <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-display mb-4">{t('payroll_history_title')}</h2>
                    <PayrollHistory
                        payrollRuns={payrollRuns}
                        isLoading={runsLoading}
                        error={runsError}
                        onExecute={(run) => setModalState(prev => ({ ...prev, executeRun: run }))}
                    />
                </div>
            </div>

            {/* All Modals for this page */}
            <EmployeeFormModal
                isOpen={modalState.employeeForm.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, employeeForm: { isOpen: false, employee: null } }))}
                onSuccess={handleEmployeeSave}
                employee={modalState.employeeForm.employee}
            />
            <CreatePayrollRunModal
                isOpen={modalState.createRun}
                onClose={() => setModalState(prev => ({ ...prev, createRun: false }))}
                onSuccess={handleRunCreated}
            />
            {modalState.executeRun && (
                <ExecutePayrollModal
                    isOpen={!!modalState.executeRun}
                    onClose={() => setModalState(prev => ({ ...prev, executeRun: null }))}
                    onSuccess={handleRunExecuted}
                    payrollRun={modalState.executeRun}
                />
            )}
        </DashboardLayout>
    );
};

export default PayrollPage;
