import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { PlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import EmployeeFormModal from '../../components/payroll/EmployeeFormModal';
import CreatePayrollRunModal from '../../components/payroll/CreatePayrollRunModal';
import ExecutePayrollModal from '../../components/payroll/ExecutePayrollModal';
import EmployeeTable from '../../components/payroll/EmployeeTable';
import PayrollHistory from '../../components/payroll/PayrollHistory';

const PayrollPage = () => {
    const { data: employees, loading: employeesLoading, error: employeesError, request: refetchEmployees } = useApi('/business/employees');
    const { data: payrollRuns, loading: runsLoading, error: runsError, request: refetchRuns } = useApi('/business/payroll-runs');

    const [modalState, setModalState] = useState({
        employeeForm: { isOpen: false, employee: null },
        createRun: false,
        executeRun: null,
    });

    const hasActiveEmployees = useMemo(() => employees && employees.some(e => e.is_active), [employees]);

    const handleEmployeeSave = (isEditing) => {
        setModalState(prev => ({ ...prev, employeeForm: { isOpen: false, employee: null } }));
        refetchEmployees();
        toast.success(`Team member ${isEditing ? 'updated' : 'added'} successfully.`);
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
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Global Payroll</h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">Manage your international team and run payroll in multiple currencies with one click.</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <Button onClick={() => setModalState(prev => ({ ...prev, employeeForm: { isOpen: true, employee: null } }))} variant="secondary">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add/Edit Team
                        </Button>
                         <Button onClick={() => setModalState(prev => ({ ...prev, createRun: true }))} disabled={!hasActiveEmployees || employeesLoading}>
                            <ChevronRightIcon className="h-5 w-5 mr-2" />
                            Create Payroll Run
                        </Button>
                    </div>
                </div>

                <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-display mb-4">Your Team</h2>
                    <EmployeeTable
                        employees={employees}
                        isLoading={employeesLoading}
                        error={employeesError}
                        onEdit={(emp) => setModalState(prev => ({ ...prev, employeeForm: { isOpen: true, employee: emp } }))}
                        onDelete={(emp) => { /* Add delete logic here */ }}
                    />
                </div>

                 <div>
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white font-display mb-4">Payroll History</h2>
                    <PayrollHistory
                        payrollRuns={payrollRuns}
                        isLoading={runsLoading}
                        error={runsError}
                        onExecute={(run) => setModalState(prev => ({ ...prev, executeRun: run }))}
                    />
                </div>
            </div>

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