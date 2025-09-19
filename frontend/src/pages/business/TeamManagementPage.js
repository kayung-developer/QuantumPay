import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi, { useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { PlusIcon, UserGroupIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import toast from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import { useAuth } from '../../context/AuthContext';
import { Alert } from '@headlessui/react'; // For confirmation dialog

// --- Reusable Add/Edit Employee Modal ---
const EmployeeFormModal = ({ isOpen, onClose, onSuccess, employee }) => {
    const isEditing = !!employee;
    const endpoint = isEditing ? `/business/employees/${employee.id}` : '/business/employees';
    const { post: saveEmployee, loading } = useApiPost(endpoint, { method: isEditing ? 'PUT' : 'POST' });

    const EmployeeSchema = Yup.object().shape({
        user_email: Yup.string().email('Invalid email').required('Employee email is required'),
        salary: Yup.number().min(0, 'Salary can be 0, but not negative').required('Salary is required'),
        salary_currency: Yup.string().required('Currency is required'),
        role: Yup.string().required('Role is required'),
    });

    const handleSubmit = async (values) => {
        const payload = { ...values, salary: parseFloat(values.salary) };
        const result = await saveEmployee(payload);
        if (result.success) {
            onSuccess(result.data, isEditing);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Team Member" : "Add Team Member"}>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {isEditing ? "Update the details for this team member." : "The user must have a QuantumPay account. They will be sent an invitation to join your business team."}
            </p>
            <Formik
                initialValues={{
                    user_email: employee?.user.email || '',
                    salary: employee?.salary || '',
                    salary_currency: employee?.salary_currency || 'NGN',
                    role: employee?.role || 'Staff',
                }}
                validationSchema={EmployeeSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {() => (
                    <Form className="space-y-4">
                        <FormInput label="Employee's QuantumPay Email" name="user_email" disabled={isEditing} />
                        <div className="flex gap-4">
                            <div className="flex-grow"><FormInput label="Monthly Salary" name="salary" type="number" /></div>
                            <div className="w-1/3">
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Currency</label>
                                <Field as="select" name="salary_currency" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                                    <option value="NGN">NGN</option><option value="KES">KES</option><option value="USD">USD</option>
                                </Field>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Role</label>
                            <Field
                                as="select"
                                name="role"
                                id="role"
                                className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                            >
                                <option value="Staff">Staff</option>
                                <option value="Accountant">Accountant</option>
                                <option value="Admin">Admin</option>
                            </Field>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={loading}>{isEditing ? 'Save Changes' : 'Add Member'}</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

// --- Main Team Management Page ---
const TeamManagementPage = () => {
    const { data: employees, loading, error, request: refetchEmployees } = useApi('/business/employees');
    const [modalState, setModalState] = useState({ isOpen: false, employee: null });

    // Hook for the delete action
    const { post: deleteEmployee, loading: deleting } = useApiPost('', { method: 'DELETE' });

    const handleSave = (employee, isEditing) => {
        setModalState({ isOpen: false, employee: null });
        refetchEmployees();
        toast.success(`Team member ${isEditing ? 'updated' : 'added'} successfully.`);
    };

    const handleDelete = (employee) => {
        // Use a simple browser confirm dialog for this critical action
        if (window.confirm(`Are you sure you want to remove ${employee.user.full_name} from your team?`)) {
            const result = deleteEmployee({}, { url: `/business/employees/${employee.id}` });
            if (result) {
                toast.success("Team member removed.");
                refetchEmployees();
            }
        }
    }

    const openAddModal = () => setModalState({ isOpen: true, employee: null });
    const openEditModal = (employee) => setModalState({ isOpen: true, employee: employee });

    const renderContent = () => {
        if (loading) return <tr><td colSpan="5" className="p-8 text-center"><Spinner /></td></tr>;
        if (error) return <tr><td colSpan="5" className="p-8 text-center text-red-400">Could not load team members.</td></tr>;
        if (!employees || employees.length === 0) return <tr><td colSpan="5" className="text-center py-12 text-neutral-500 dark:text-neutral-400">No team members added yet.</td></tr>;

        return employees.map(emp => (
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
                    <Button onClick={() => openEditModal(emp)} variant="ghost" size="sm"><PencilIcon className="h-4 w-4"/></Button>
                    <Button onClick={() => handleDelete(emp)} variant="ghost" size="sm"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
                </td>
            </tr>
        ));
    };

    return (
        <DashboardLayout pageTitleKey="team_management_title">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Team Management</h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">Add, view, and manage your business team members.</p>
                    </div>
                    <Button onClick={openAddModal}><PlusIcon className="h-5 w-5 mr-2" />Invite Member</Button>
                </div>

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
                           {renderContent()}
                        </tbody>
                    </table>
                </div>
            </div>

            <EmployeeFormModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ isOpen: false, employee: null })}
                onSuccess={handleSave}
                employee={modalState.employee}
            />
        </DashboardLayout>
    );
};

export default TeamManagementPage;