import React from 'react';
import Modal from '../common/Modal';
import { Formik, Form, Field, ErrorMessage, useFormikContext } from 'formik';
import * as Yup from 'yup';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import { useApi } from '../../hooks/useApi';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import Spinner from '../common/Spinner';
import { debounce } from 'lodash';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useEffect, useCallback } from 'react';

// The validation schema now includes the 'verified_account_name' field,
// which will be populated by our verification logic.
const AddAccountSchema = Yup.object().shape({
    bank_code: Yup.string().required('Please select a bank from the list.'),
    account_number: Yup.string()
        .matches(/^[0-9]{10}$/, 'Account number must be exactly 10 digits')
        .required('A 10-digit account number is required.'),
    verified_account_name: Yup.string(), // Not required for input, but part of the form's state
});

// A dedicated "effect" component that lives inside Formik's context.
// This is the clean, modern way to handle side effects based on form state changes.
const AccountVerificationEffect = () => {
    const { values, setFieldValue, setFieldError } = useFormikContext();
    const { post: verifyAccount, loading: verifying, error: verificationError } = useApiPost('/payouts/verify-account');

    const debouncedVerify = useCallback(
        debounce(async (formValues) => {
            if (!formValues.bank_code || formValues.account_number.length !== 10) {
                setFieldValue('verified_account_name', '');
                return;
            }
            const result = await verifyAccount({
                account_number: formValues.account_number,
                bank_code: formValues.bank_code,
            });
            if (result.success && result.data.account_name) {
                setFieldValue('verified_account_name', result.data.account_name);
                // Clear any previous errors on success
                setFieldError('account_number', undefined);
            } else {
                setFieldValue('verified_account_name', '');
                // Use the error from the hook to display a message
                setFieldError('account_number', result.error?.message || 'Could not verify account.');
            }
        }, 800), // 800ms delay after the user stops typing
        [] // Empty dependency array means this debounced function is created only once
    );

    useEffect(() => {
        setFieldValue('verified_account_name', '');
        debouncedVerify(values);
    }, [values.account_number, values.bank_code, debouncedVerify, setFieldValue]);


    // This component renders the UI for the verification status.
    return (
        <div className="h-10 mt-2 flex items-center justify-center">
            {verifying ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 animate-pulse">Verifying account...</p>
            ) : values.verified_account_name ? (
                <div className="p-2 w-full bg-green-900/50 rounded-lg text-green-300 font-semibold text-center">
                    {values.verified_account_name}
                </div>
            ) : verificationError && values.account_number.length === 10 ? (
                 <p className="text-sm text-red-400">{verificationError.message || "Could not verify account."}</p>
            ) : null}
        </div>
    );
};

const AddBankAccountModal = ({ isOpen, onClose, onSuccess, currency }) => {
    // Correctly map the currency to a country code for the API call
    const countryCodeMap = { 'NGN': 'NG', 'GHS': 'GH', 'KES': 'KE', 'ZAR': 'ZA' };
    const countryCode = currency ? countryCodeMap[currency] : null;

    // The API call is now dynamic and only runs when the modal is open and a country is set.
    const { data: banks, loading: banksLoading, error: banksError, request: fetchBanks } = useApi(
        isOpen && countryCode ? `/utility/paystack-banks/${countryCode}` : null
    );
    const { post: createRecipient, loading: creating } = useApiPost('/payouts/recipient');

    const handleSubmit = async (values) => {
        if (!values.verified_account_name) {
            toast.error("Account details must be successfully verified before saving.");
            return;
        }
        const payload = {
            account_number: values.account_number,
            bank_code: values.bank_code,
            name: values.verified_account_name, // Use the verified name now stored in Formik's state
            currency: currency,
        };
        const result = await createRecipient(payload);
        if (result.success) {
            onSuccess();
        }
    };

    const renderModalContent = () => {
        if (banksLoading) {
            return <div className="h-48 flex justify-center items-center"><Spinner /></div>;
        }
        if (banksError) {
            return (
                 <div className="h-48 flex flex-col justify-center items-center text-center">
                    <ExclamationTriangleIcon className="h-10 w-10 text-red-500" />
                    <p className="mt-4 font-semibold text-neutral-900 dark:text-white">Could Not Load Bank List</p>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{banksError.message}</p>
                    <Button onClick={() => fetchBanks()} variant="secondary" className="mt-6">Retry</Button>
                </div>
            );
        }

        return (
            <Formik
                initialValues={{ account_number: '', bank_code: '', verified_account_name: '' }}
                validationSchema={AddAccountSchema}
                onSubmit={handleSubmit}
            >
                {({ values }) => (
                    <Form>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Bank</label>
                                <Field as="select" name="bank_code" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                                    <option value="">Select a bank...</option>
                                    {Array.isArray(banks) && banks.map(bank => <option key={bank.code} value={bank.code}>{bank.name}</option>)}
                                </Field>
                                <ErrorMessage name="bank_code" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Account Number</label>
                                <Field name="account_number" maxLength={10} placeholder="0123456789" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white" />
                                <ErrorMessage name="account_number" component="p" className="text-red-500 text-xs mt-1" />
                            </div>

                            <AccountVerificationEffect />

                            <div className="pt-4 flex justify-end border-t border-neutral-200 dark:border-neutral-800">
                                <Button type="submit" isLoading={creating} disabled={!values.verified_account_name}>
                                    Save Account
                                </Button>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>
        );
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Add ${currency} Bank Account`}>
            {renderModalContent()}
        </Modal>
    );
};

export default AddBankAccountModal;

