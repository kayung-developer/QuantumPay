import React from 'react';
import Modal from '../common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';

const EmployeeSchema = Yup.object().shape({
    user_email: Yup.string().email('Invalid email address').required('Employee\'s QuantumPay email is required'),
    salary: Yup.number().min(0, 'Salary can be 0, but not negative').required('Salary is required'),
    salary_currency: Yup.string().length(3, 'Use 3-letter currency code').required('Currency is required'),
    role: Yup.string().min(2, 'Role is too short').required('Role is required'),
});

const EmployeeFormModal = ({ isOpen, onClose, onSuccess, employee }) => {
    const isEditing = !!employee;
    // The endpoint is determined dynamically based on whether we are editing or creating
    const endpoint = isEditing ? `/business/employees/${employee.id}` : '/business/employees';
    const { post: saveEmployee, loading } = useApiPost(endpoint, { method: isEditing ? 'PUT' : 'POST' });

    const handleSubmit = async (values) => {
        const payload = { ...values, salary: parseFloat(values.salary) };
        const result = await saveEmployee(payload);
        if (result.success) {
            onSuccess(isEditing); // Pass back whether it was an edit or add action
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Team Member" : "Add Team Member"}>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {isEditing ? "Update the details for this team member." : "The user must have a QuantumPay account to be added to your team."}
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
                enableReinitialize // Important for pre-filling the form in edit mode
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
                                    <option value="GHS">GHS</option><option value="ZAR">ZAR</option>
                                </Field>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Role</label>
                             <Field as="select" name="role" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
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

export default EmployeeFormModal;