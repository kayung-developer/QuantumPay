import React from 'react';
import Modal from '../common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import { format } from 'date-fns';

const CreateRunSchema = Yup.object().shape({
    pay_period_start: Yup.date().required('Start date is required'),
    pay_period_end: Yup.date()
        .required('End date is required')
        .min(Yup.ref('pay_period_start'), "End date can't be before start date"),
    source_currency: Yup.string().required('Source currency is required'),
});

const CreatePayrollRunModal = ({ isOpen, onClose, onSuccess }) => {
    const { post: createRun, loading } = useApiPost('/business/payroll-runs');

    const handleSubmit = async (values, { resetForm }) => {
        const result = await createRun(values);
        if (result.success) {
            onSuccess(result.data);
            resetForm();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Payroll Run">
             <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Define the pay period and the wallet you want to pay from. We will calculate the total cost based on all your active employees and current exchange rates.
            </p>
             <Formik
                initialValues={{
                    pay_period_start: format(new Date(), 'yyyy-MM-dd'),
                    pay_period_end: format(new Date(), 'yyyy-MM-dd'),
                    source_currency: 'USD'
                }}
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
                            <label htmlFor="source_currency" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Payment Wallet</label>
                            <Field as="select" name="source_currency" id="source_currency" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                                <option value="USD">USD Wallet</option>
                                <option value="NGN">NGN Wallet</option>
                                <option value="EUR">EUR Wallet</option>
                            </Field>
                        </div>
                        <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200 dark:border-neutral-800">
                             <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                            <Button type="submit" isLoading={loading}>Calculate & Create</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default CreatePayrollRunModal;