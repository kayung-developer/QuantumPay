import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../common/Modal';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import useApi from '../../hooks/useApi';
import toast from 'react-hot-toast';
import Spinner from '../common/Spinner';
import { debounce } from 'lodash'; // A utility for debouncing

const AddAccountSchema = Yup.object().shape({
    bank_code: Yup.string().required('Please select a bank'),
    account_number: Yup.string()
        .matches(/^[0-9]{10}$/, 'Account number must be exactly 10 digits')
        .required('Account number is required'),
});

const AddBankAccountModal = ({ isOpen, onClose, onSuccess }) => {
    // Fetches the list of available banks from Paystack via our backend
    const { data: banks, loading: banksLoading } = useApi('/utility/paystack-banks');

    const { post: verifyAccount, loading: verifying, error: verificationError } = useApiPost('/payouts/verify-account');
    const { post: createRecipient, loading: creating } = useApiPost('/payouts/recipient');

    const [accountName, setAccountName] = useState('');
    const [verificationAttempted, setVerificationAttempted] = useState(false);

    // Debounce the validation function to avoid making API calls on every keystroke
    const debouncedVerify = useCallback(
        debounce(async (values) => {
            if (!values.bank_code || values.account_number.length !== 10) {
                setAccountName('');
                return;
            }
            setVerificationAttempted(true);
            const result = await verifyAccount({
                account_number: values.account_number,
                bank_code: values.bank_code,
            });

            if (result.success && result.data.account_name) {
                setAccountName(result.data.account_name);
            } else {
                setAccountName(''); // Clear name on failure
            }
        }, 800), // Wait 800ms after the user stops typing
        [] // Empty dependency array means this function is created only once
    );

    const handleSubmit = async (values) => {
        if (!accountName) {
            toast.error("Please verify the account details before saving.");
            return;
        }
        const payload = {
            ...values,
            name: accountName,
            currency: 'NGN', // Assuming NGN for Nigerian bank accounts
        };
        const result = await createRecipient(payload);
        if (result.success) {
            onSuccess();
        }
    };

    // Effect to trigger verification when form values change
    const handleFormChange = (values) => {
        debouncedVerify(values);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add a New Bank Account">
            <Formik
                initialValues={{ account_number: '', bank_code: '' }}
                validationSchema={AddAccountSchema}
                onSubmit={handleSubmit}
            >
                {({ values, errors, touched, setFieldValue }) => (
                    <Form onChange={handleFormChange(values)}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Bank</label>
                                {banksLoading ? <Spinner /> : (
                                    <>
                                        <Field as="select" name="bank_code" className="w-full bg-neutral-800 p-2 rounded-md border border-neutral-700 text-white">
                                            <option value="">Select a bank...</option>
                                            {banks?.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                                        </Field>
                                        <ErrorMessage name="bank_code" component="p" className="text-red-500 text-xs mt-1" />
                                    </>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-300 mb-1">Account Number</label>
                                <Field name="account_number" maxLength={10} className="w-full bg-neutral-800 p-2 rounded-md border border-neutral-700 text-white" />
                                <ErrorMessage name="account_number" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            {/* Verification status display */}
                            <div className="h-10 mt-2 flex items-center justify-center">
                                {verifying ? (
                                    <p className="text-sm text-neutral-400 animate-pulse">Verifying account...</p>
                                ) : accountName ? (
                                    <div className="p-2 w-full bg-green-900/50 rounded-lg text-green-300 font-semibold text-center">
                                        {accountName}
                                    </div>
                                ) : verificationAttempted && !verificationError ? (
                                    <p className="text-sm text-red-400">Account not found. Please check the details.</p>
                                ) : null}
                            </div>

                            <div className="pt-4 flex justify-end border-t border-neutral-800">
                                <Button type="submit" isLoading={creating} disabled={!accountName || verifying}>
                                    Save Account
                                </Button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default AddBankAccountModal;