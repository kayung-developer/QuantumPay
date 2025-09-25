import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { useApiPost } from '../../../hooks/useApi';
import { BanknotesIcon } from '@heroicons/react/24/outline';
import { toastSuccess, toastError } from '../../../components/common/Toast';

const EftSchema = Yup.object().shape({
  amount: Yup.number().min(50, 'Minimum deposit is ZAR 50').required('Amount is required'),
});

const EftDeposit = ({ onDepositInitiated }) => {
    const { post: initializeEft, loading } = useApiPost('/local-payments/za/eft/deposit');

    const handleSubmit = async (values) => {
        const result = await initializeEft(values);
        if (result.success && result.data.authorization_url) {
            toastSuccess("Redirecting you to complete the payment...");
            // Redirect the user to the secure EFT payment page
            window.location.href = result.data.authorization_url;
            if (onDepositInitiated) onDepositInitiated();
        }
    };

    return (
        <div className="p-6 text-center">
            <BanknotesIcon className="h-12 w-12 mx-auto text-primary"/>
            <h3 className="mt-4 text-lg font-semibold text-white">Pay with Instant EFT</h3>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                You will be redirected to our secure partner's page to log in to your bank and approve the payment.
            </p>
            <div className="mt-6">
                <Formik
                    initialValues={{ amount: '' }}
                    validationSchema={EftSchema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form className="space-y-4">
                            <FormInput label="Amount (ZAR)" name="amount" type="number" />
                            <div className="pt-2">
                                <Button type="submit" isLoading={loading} fullWidth>Proceed to Pay</Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
};

export default EftDeposit;