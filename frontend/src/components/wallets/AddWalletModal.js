import React, { useMemo } from 'react';
import Modal from '../common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';

const AddWalletSchema = Yup.object().shape({
    currency_code: Yup.string().required('Please select a currency to add.'),
});

const SUPPORTED_CURRENCIES = ["NGN", "KES", "GHS", "ZAR", "USD", "EUR", "GBP"];

const AddWalletModal = ({ isOpen, onClose, onSuccess, existingWallets = [] }) => {
    const { post: createWallet, loading } = useApiPost('/wallets');

    // Filter out currencies for which the user already has a wallet
    const availableCurrencies = useMemo(() => {
        const existingCodes = new Set(existingWallets.map(w => w.currency_code));
        return SUPPORTED_CURRENCIES.filter(c => !existingCodes.has(c));
    }, [existingWallets]);

    const handleSubmit = async (values, { resetForm }) => {
        const result = await createWallet(values);
        if (result.success) {
            onSuccess(result.data); // Pass the new wallet data back
            resetForm();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add New Currency Wallet">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                Select a new currency to add to your QuantumPay account.
            </p>
            {availableCurrencies.length > 0 ? (
                <Formik
                    initialValues={{ currency_code: '' }}
                    validationSchema={AddWalletSchema}
                    onSubmit={handleSubmit}
                >
                    {() => (
                        <Form className="space-y-4">
                            <div>
                                <label htmlFor="currency_code" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Available Currencies</label>
                                <Field
                                    as="select"
                                    name="currency_code"
                                    id="currency_code"
                                    className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white"
                                >
                                    <option value="">Select a currency...</option>
                                    {availableCurrencies.map(currency => (
                                        <option key={currency} value={currency}>{currency}</option>
                                    ))}
                                </Field>
                            </div>
                            <div className="pt-4 flex justify-end">
                                <Button type="submit" isLoading={loading}>Add Wallet</Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            ) : (
                <div className="text-center p-4 text-neutral-500 dark:text-neutral-400">
                    <p>You have already added all available currency wallets.</p>
                </div>
            )}
        </Modal>
    );
};

export default AddWalletModal;