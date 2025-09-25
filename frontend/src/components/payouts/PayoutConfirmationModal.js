import React, { useMemo } from 'react';
import Modal from '../common/Modal';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useApiPost } from '../../hooks/useApi';
import useApi from '../../hooks/useApi'; // Import useApi to fetch wallet data
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import Spinner from '../common/Spinner';

const PayoutConfirmationModal = ({ isOpen, onClose, account, onSuccess }) => {
    // [REAL SYSTEM] Fetch all user wallets to get the specific one we need.
    // This ensures we always have the most up-to-date balance for validation.
    const { data: wallets, loading: walletsLoading } = useApi(isOpen ? '/wallets/me' : null);

    const { post: executePayout, loading: payoutLoading } = useApiPost('/payouts/execute');

    // useMemo will find the correct wallet once the wallets data is available.
    const sourceWallet = useMemo(() => {
        if (!wallets || !account) return null;
        return wallets.find(w => w.currency_code === account.currency);
    }, [wallets, account]);

    // [REAL SYSTEM] The validation schema is dynamically created based on the fetched wallet balance.
    // This is a highly robust pattern.
    const PayoutSchema = Yup.object().shape({
        amount: Yup.number()
            .positive('Amount must be a positive number.')
            .max(
                sourceWallet?.balance || 0,
                `Amount cannot exceed your available balance of ${sourceWallet?.balance.toFixed(2) || '0.00'}`
            )
            .required('An amount is required.'),
    });

    const handleSubmit = async (values) => {
        const payload = {
            recipient_code: account.provider_recipient_code,
            amount: parseFloat(values.amount),
            source_currency: account.currency,
            reason: `Withdrawal for ${account.account_name}` // A good default reason
        };
        const result = await executePayout(payload);
        if (result.success) {
            // The useApiPost hook already shows a success toast.
            onSuccess(); // Call the parent's success handler to close modal & refetch
        }
        // The hook also shows an error toast on failure.
    };

    if (!isOpen) {
        return null;
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Withdraw to ${account?.bank_name}`}>
            <div className="space-y-4">
                 {/* Read-only display of the selected recipient */}
                 <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Recipient</p>
                    <p className="text-base font-bold text-white mt-1">{account.account_name}</p>
                    <p className="text-sm text-neutral-700 dark:text-neutral-300">{account.bank_name} - **** {account.account_number_mask}</p>
                 </div>

                {/* Show a loading spinner while fetching the wallet balance */}
                {walletsLoading && (
                    <div className="flex justify-center items-center h-24">
                        <Spinner />
                    </div>
                )}

                {/* Only render the form once the wallet data is available */}
                {!walletsLoading && sourceWallet && (
                    <Formik
                        initialValues={{ amount: '' }}
                        validationSchema={PayoutSchema}
                        onSubmit={handleSubmit}
                        enableReinitialize // Ensures the validation schema updates if the wallet balance changes
                    >
                        {({ handleSubmit: submitForm, values, errors, touched }) => (
                            <Form>
                                <FormInput
                                    label={`Amount to Withdraw (${account.currency})`}
                                    name="amount"
                                    type="number"
                                    placeholder="0.00"
                                    // Manually pass error to ensure it's displayed
                                    error={touched.amount && errors.amount ? errors.amount : undefined}
                                />
                                <p className="text-neutral-500 text-xs mt-1 text-right">
                                    Available Balance: {sourceWallet.balance.toFixed(2)} {account.currency}
                                </p>

                                <div className="pt-6 flex justify-end items-center border-t border-neutral-200 dark:border-neutral-800 mt-4">
                                    <Button
                                        type="button"
                                        onClick={onClose}
                                        variant="secondary"
                                        className="mr-3"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={submitForm}
                                        isLoading={payoutLoading}
                                    >
                                        Confirm Withdrawal
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                )}

                 {/* Handle the case where the user has no wallet for that currency */}
                {!walletsLoading && !sourceWallet && (
                    <div className="text-center p-4 text-red-400">
                        You do not have a {account.currency} wallet to withdraw from.
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default PayoutConfirmationModal;