// FILE: src/pages/business/PayrollPage.js

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApi, useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { PlusIcon, ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import EmployeeTable from '../../components/payroll/EmployeeTable';
import PayrollHistory from '../../components/payroll/PayrollHistory';
import EmployeeFormModal from '../../components/payroll/EmployeeFormModal';
import CreatePayrollRunModal from '../../components/payroll/CreatePayrollRunModal';
import ExecutePayrollModal from '../../components/payroll/ExecutePayrollModal';

const PayrollPage = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth(); // Use the gating hook
    
    const { data: employees, loading: employeesLoading, error: employeesError, request: refetchEmployees } = useApi('/business/employees');
    const { data: payrollRuns, loading: runsLoading, error: runsError, request: refetchRuns } = useApi('/business/payroll-runs');

    const [modalState, setModalState] = useState({
        employeeForm: { isOpen: false, employee: null },
        createRun: false,
        executeRun: null,
    });
    
    const { post: deleteEmployeeApi } = useApiPost('', { method: 'DELETE' });

    // --- [THE FEATURE GATING LOGIC] ---
    const planLimits = useMemo(() => {
        if (hasActiveSubscription('ultimate')) return { max_team_members: 1000 };
        if (hasActiveSubscription('premium')) return { max_team_members: 10 };
        return { max_team_members: 3 }; // Free plan
    }, [hasActiveSubscription]);

    const activeEmployeeCount = useMemo(() => employees?.filter(e => e.is_active).length || 0, [employees]);
    const hasReachedTeamLimit = activeEmployeeCount >= planLimits.max_team_members;

    const handleEmployeeSave = (isEditing) => {
        setModalState(prev => ({ ...prev, employeeForm: { isOpen: false, employee: null } }));
        refetchEmployees();
        toast.success(`Team member ${isEditing ? 'updated' : 'added'} successfully.`);
    };

    const handleDeleteEmployee = async (employee) => {
        if (window.confirm(`Are you sure you want to remove ${employee.user.full_name}? This will deactivate them.`)) {
            const result = await deleteEmployeeApi({}, { url: `/business/employees/${employee.id}` });
            if (result.success) {
                refetchEmployees();
            }
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
        toast.success("Payroll has been executed successfully!");
    };

    return (
        <DashboardLayout pageTitleKey="payroll_title">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('payroll_title')}</h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('payroll_header_subtitle')}</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex flex-col md:flex-row items-end md:items-center space-y-2 md:space-y-0 md:space-x-3">
                        {hasReachedTeamLimit ? (
                             <div className="text-right">
                                <p className="text-sm font-medium text-amber-600 dark:text-amber-400 flex items-center">
                                    <ExclamationTriangleIcon className="h-4 w-4 mr-1.5" /> Team limit reached
                                </p>
                                <Link to="/pricing" className="text-sm text-primary hover:underline">Upgrade to add more members &rarr;</Link>
                            </div>
                        ) : (
                            <Button onClick={() => setModalState(prev => ({ ...prev, employeeForm: { isOpen: true, employee: null } }))} variant="secondary">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                {t('payroll_add_team_button')} ({activeEmployeeCount}/{planLimits.max_team_members})
                            </Button>
                        )}
                        <Button onClick={() => setModalState(prev => ({ ...prev, createRun: true }))} disabled={activeEmployeeCount === 0 || employeesLoading}>
                            <ChevronRightIcon className="h-5 w-5 mr-2" />
                            {t('payroll_create_run_button')}
                        </Button>
                    </div>
                </div>
                
                <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-display mb-4">{t('payroll_team_title')}</h2>
                    <EmployeeTable employees={employees} isLoading={employeesLoading} error={employeesError} onEdit={(emp) => setModalState(prev => ({ ...prev, employeeForm: { isOpen: true, employee: emp } }))} onDelete={handleDeleteEmployee} />
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-display mb-4">{t('payroll_history_title')}</h2>
                    <PayrollHistory payrollRuns={payrollRuns} isLoading={runsLoading} error={runsError} onExecute={(run) => setModalState(prev => ({ ...prev, executeRun: run }))} />
                </div>
            </div>

            <EmployeeFormModal isOpen={modalState.employeeForm.isOpen} onClose={() => setModalState(prev => ({ ...prev, employeeForm: { isOpen: false, employee: null } }))} onSuccess={handleEmployeeSave} employee={modalState.employeeForm.employee} />
            <CreatePayrollRunModal isOpen={modalState.createRun} onClose={() => setModalState(prev => ({ ...prev, createRun: false }))} onSuccess={handleRunCreated} />
            {modalState.executeRun && (
                <ExecutePayrollModal isOpen={!!modalState.executeRun} onClose={() => setModalState(prev => ({ ...prev, executeRun: null }))} onSuccess={handleRunExecuted} payrollRun={modalState.executeRun} />
            )}
        </DashboardLayout>
    );
};

export default PayrollPage;