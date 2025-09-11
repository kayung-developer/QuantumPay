import React from 'react';
import Modal from '../common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';

const AddEmployeeSchema = Yup.object().shape({
    user_email: Yup.string().email('Invalid email address').required('Employee\'s QuantumPay email is required'),
    salary: Yup.number().min(1, 'Salary must be a positive number').required('Salary is required'),
    salary_currency: Yup.string().length(3, 'Use 3-letter currency code').required('Currency is required'),
    role: Yup.string().min(2, 'Role is too short').required('Role is required'),
});

const AddEmployeeModal = ({ isOpen, onClose, onSuccess }) => {
    const { post: addEmployee, loading } = useApiPost('/business/employees');

    const handleSubmit = async (values, { resetForm }) => {
        const payload = {
            ...values,
            salary: parseFloat(values.salary),
        };
        const result = await addEmployee(payload);
        if (result.success) {
            onSuccess(result.data);
            resetForm();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Employee">
            <p className="text-sm text-neutral-400 mb-6">
                The user must already have a QuantumPay account. Enter their details below to add them to your payroll.
            </p>
            <Formik
                initialValues={{ user_email: '', salary: '', salary_currency: 'NGN', role: 'Staff' }}
                validationSchema={AddEmployeeSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-4">
                        <FormInput
                            label="Employee's QuantumPay Email"
                            name="user_email"
                            type="email"
                            placeholder="employee@email.com"
                        />
                        <div className="flex gap-4">
                            <div className="flex-grow">
                                <FormInput
                                    label="Monthly Salary"
                                    name="salary"
                                    type="number"
                                    placeholder="500000"
                                />
                            </div>
                            <div className="w-1/3">
                                <label htmlFor="salary_currency" className="block text-sm font-medium text-neutral-300 mb-1">Currency</label>
                                <Field
                                    as="select"
                                    name="salary_currency"
                                    id="salary_currency"
                                    className="block w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"
                                >
                                    <option value="NGN">NGN</option>
                                    <option value="KES">KES</option>
                                    <option value="GHS">GHS</option>
                                    <option value="ZAR">ZAR</option>
                                    <option value="USD">USD</option>
                                </Field>
                            </div>
                        </div>
                        <FormInput
                            label="Role"
                            name="role"
                            placeholder="e.g., Software Engineer"
                        />
                        <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-800">
                            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>Add Employee</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default AddEmployeeModal;