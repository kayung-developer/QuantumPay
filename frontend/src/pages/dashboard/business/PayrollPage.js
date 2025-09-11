import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import useApi, { useApiPost } from '../../../hooks/useApi';
import Button from '../../../components/common/Button';
import { PlusIcon, ChevronRightIcon } from '@heroicons/react/24/outline'; // Updated Icon
import Spinner from '../../../components/common/Spinner';
import toast from 'react-hot-toast';
import Modal from '../../../components/common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../../components/common/FormInput';
import { format, parseISO } from 'date-fns'; // Added for date formatting

// --- Component Definitions (Kept within the same file as per original structure, but can be split out) ---

// --- Add Employee Modal (Existing Component - No Changes) ---
const AddEmployeeModal = ({ isOpen, onClose, onSuccess }) => {
    const { post: addEmployee, loading } = useApiPost('/business/employees');
    const AddEmployeeSchema = Yup.object().shape({
        user_email: Yup.string().email('Invalid email').required('Employee email is required'),
        salary: Yup.number().min(1, 'Salary must be positive').required('Salary is required'),
        salary_currency: Yup.string().required('Currency is required'),
        role: Yup.string().required('Role is required'),
    });

    const handleSubmit = async (values, { resetForm }) => {
        // Correctly parse salary to float before sending
        const payload = { ...values, salary: parseFloat(values.salary) };
        const result = await addEmployee(payload);
        if (result.success) {
            onSuccess(result.data);
            resetForm();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee">
            <p className="text-sm text-neutral-400 mb-6">The user must already have a QuantumPay account. Enter their details below to add them to your payroll.</p>
            <Formik
                initialValues={{ user_email: '', salary: '', salary_currency: 'NGN', role: 'Staff' }}
                validationSchema={AddEmployeeSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-4">
                        <FormInput label="Employee's QuantumPay Email" name="user_email" />
                        <div className="flex gap-4">
                            <div className="flex-grow">
                                <FormInput label="Monthly Salary" name="salary" type="number" />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="salary_currency" className="block text-sm font-medium text-neutral-300 mb-1">Currency</label>
                                <Field as="select" name="salary_currency" id="salary_currency" className="block w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white">
                                    <option value="NGN">NGN</option>
                                    <option value="KES">KES</option>
                                    <option value="GHS">GHS</option>
                                    <option value="ZAR">ZAR</option>
                                    <option value="USD">USD</option>
                                </Field>
                            </div>
                        </div>
                        <FormInput label="Role" name="role" />
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={loading}>Add Employee</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

// --- [NEW] Create Payroll Run Modal ---
const CreatePayrollRunModal = ({ isOpen, onClose, onSuccess }) => {
    const { post: createRun, loading } = useApiPost('/business/payroll-runs');
    const CreateRunSchema = Yup.object().shape({
        pay_period_start: Yup.date().required('Start date is required'),
        pay_period_end: Yup.date().required('End date is required').min(Yup.ref('pay_period_start'), "End date can't be before start date"),
        source_currency: Yup.string().required('Source currency is required'),
    });

    const handleSubmit = async (values, { resetForm }) => {
        const result = await createRun(values);
        if (result.success) {
            onSuccess(result.data);
            resetForm();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Payroll Run">
             <p className="text-sm text-neutral-400 mb-6">Define the pay period and the wallet you want to pay from. We will calculate the total cost based on all your active employees.</p>
             <Formik
                initialValues={{ pay_period_start: '', pay_period_end: '', source_currency: 'USD' }}
                validationSchema={CreateRunSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-4">
                        <div className="flex gap-4">
                            <FormInput label="Pay Period Start" name="pay_period_start" type="date" />
                            <FormInput label="Pay Period End" name="pay_period_end" type="date" />
                        </div>
                         <div>
                            <label htmlFor="source_currency" className="block text-sm font-medium text-neutral-300 mb-1">Payment Wallet</label>
                            <Field as="select" name="source_currency" id="source_currency" className="block w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white">
                                <option value="USD">USD Wallet</option>
                                <option value="NGN">NGN Wallet</option>
                                <option value="EUR">EUR Wallet</option>
                            </Field>
                        </div>
                        <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-800">
                             <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>Calculate & Create</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

// --- [NEW] Execute Payroll Modal ---
const ExecutePayrollModal = ({ isOpen, onClose, onSuccess, payrollRun }) => {
    const { post: executeRun, loading } = useApiPost('/business/payroll-runs/execute');

    const handleExecute = async () => {
        const result = await executeRun({ payroll_run_id: payrollRun.id });
        if (result.success) {
            onSuccess(result.data);
        }
    };

    if (!payrollRun) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Payroll Execution" size="2xl">
            <div className="space-y-6">
                <p className="font-semibold text-white">You are about to execute payroll for the period:</p>
                <p className="text-lg font-bold text-primary-light text-center">{format(parseISO(payrollRun.pay_period_start), 'MMM d, yyyy')} to {format(parseISO(payrollRun.pay_period_end), 'MMM d, yyyy')}</p>
                <div className="p-4 bg-neutral-800 rounded-lg text-center">
                    <p className="text-neutral-300">Total Payroll Cost:</p>
                    <p className="text-3xl font-bold text-white">
                        {new Intl.NumberFormat('en-US').format(payrollRun.total_source_cost)} {payrollRun.source_currency}
                    </p>
                </div>
                <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-800">
                    <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleExecute} isLoading={loading} variant="primary">Confirm & Pay</Button>
                </div>
            </div>
        </Modal>
    );
};


// --- [NEW] Table Components ---
const EmployeeTable = ({ employees, isLoading, error }) => {
    if (isLoading) return <div className="p-8 text-center"><Spinner /></div>;
    if (error) return <p className="p-8 text-center text-red-400">Could not load employee data.</p>;

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
                            <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-white">{emp.user.full_name}</div><div className="text-sm text-neutral-400">{emp.user.email}</div></td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">{emp.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{new Intl.NumberFormat().format(emp.salary)} {emp.salary_currency}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${emp.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>{emp.is_active ? 'Active' : 'Inactive'}</span></td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" className="text-center py-12 text-neutral-500">No employees added yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

const PayrollHistory = ({ payrollRuns, isLoading, error, onExecute }) => {
    // ... (This component is new but for clarity I'm including it's code as part of the "update")
    const statusStyles = {
        pending: 'bg-yellow-900 text-yellow-300',
        completed: 'bg-green-900 text-green-300',
        processing: 'bg-blue-900 text-blue-300 animate-pulse',
        failed: 'bg-red-900 text-red-300',
    };

    if (isLoading) return <div className="p-8 text-center"><Spinner /></div>;
    if (error) return <p className="p-8 text-center text-red-400">Could not load payroll history.</p>;

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-neutral-800">
                <thead className="bg-neutral-800/50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Pay Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Total Cost</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                    {payrollRuns?.length > 0 ? payrollRuns.map(run => (
                        <tr key={run.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{format(parseISO(run.pay_period_start), 'MMM d')} - {format(parseISO(run.pay_period_end), 'MMM d, yyyy')}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">{new Intl.NumberFormat().format(run.total_source_cost)} {run.source_currency}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[run.status]}`}>{run.status}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm">{run.status === 'pending' ? <Button size="sm" onClick={() => onExecute(run)}>Execute</Button> : (run.status === 'completed' ? <span className="text-xs text-neutral-500">Paid on {format(parseISO(run.execution_date), 'MMM d')}</span> : null)}</td>
                        </tr>
                    )) : (
                        <tr><td colSpan="4" className="text-center py-12 text-neutral-500">No payroll runs created yet.</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};


// --- The Main, Updated Payroll Page ---
const PayrollPage = () => {
    // UPDATED: Added state and API calls for payroll runs
    const { data: employees, loading: employeesLoading, error: employeesError, request: refetchEmployees } = useApi('/business/employees');
    const { data: payrollRuns, loading: runsLoading, error: runsError, request: refetchRuns } = useApi('/business/payroll-runs');

    const [isAddEmployeeModalOpen, setAddEmployeeModalOpen] = useState(false);
    const [isCreateRunModalOpen, setCreateRunModalOpen] = useState(false);
    const [runToExecute, setRunToExecute] = useState(null);

    const hasActiveEmployees = useMemo(() => employees && employees.some(e => e.is_active), [employees]);

    const handleEmployeeAdded = (newEmployee) => {
        setAddEmployeeModalOpen(false);
        refetchEmployees();
        toast.success(`${newEmployee.user.full_name} has been added to your payroll.`);
    };

    // UPDATED: New handlers for the payroll run flow
    const handleRunCreated = () => {
        setCreateRunModalOpen(false);
        refetchRuns();
        toast.success("Payroll run calculated and saved as pending.");
    };

    const handleRunExecuted = () => {
        setRunToExecute(null);
        refetchRuns();
        // It's also good to refetch employees in case their status or wallets changed
        refetchEmployees();
        toast.success("Payroll has been executed successfully!");
    };


    return (
        <DashboardLayout pageTitle="Global Payroll">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-white">Global Payroll</h1>
                        <p className="mt-1 text-neutral-400">Manage your international team and run payroll in multiple currencies with one click.</p>
                    </div>
                    {/* UPDATED: Buttons and their logic */}
                    <div className="mt-4 md:mt-0 flex space-x-3">
                        <Button onClick={() => setAddEmployeeModalOpen(true)} variant="secondary">
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Add Employee
                        </Button>
                         <Button onClick={() => setCreateRunModalOpen(true)} disabled={!hasActiveEmployees || employeesLoading}>
                            <ChevronRightIcon className="h-5 w-5 mr-2" />
                            Create Payroll Run
                        </Button>
                    </div>
                </div>

                {/* UPDATED: Split into two clear sections */}
                <div>
                    <h2 className="text-xl font-semibold text-white font-display mb-4">Your Team</h2>
                    <EmployeeTable
                        employees={employees}
                        isLoading={employeesLoading}
                        error={employeesError}
                    />
                </div>

                 <div>
                    <h2 className="text-xl font-semibold text-white font-display mb-4">Payroll History</h2>
                    <PayrollHistory
                        payrollRuns={payrollRuns}
                        isLoading={runsLoading}
                        error={runsError}
                        onExecute={setRunToExecute} // Pass the function to trigger the execution modal
                    />
                </div>
            </div>

            {/* UPDATED: Added all necessary modals */}
            <AddEmployeeModal
                isOpen={isAddEmployeeModalOpen}
                onClose={() => setAddEmployeeModalOpen(false)}
                onSuccess={handleEmployeeAdded}
            />
            <CreatePayrollRunModal
                isOpen={isCreateRunModalOpen}
                onClose={() => setCreateRunModalOpen(false)}
                onSuccess={handleRunCreated}
            />
            {runToExecute && (
                 <ExecutePayrollModal
                    isOpen={!!runToExecute}
                    onClose={() => setRunToExecute(null)}
                    onSuccess={handleRunExecuted}
                    payrollRun={runToExecute}
                />
            )}
        </DashboardLayout>
    );
};

export default PayrollPage;