import React, { useState } from 'react';
import { useApiPost } from '../../../hooks/useApi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Toaster, toast, resolveValue } from 'react-hot-toast';

// Luhn algorithm check for basic card number validation
const luhnCheck = (val) => {
    if (!val) return false;
    let sum = 0;
    let numDigits = val.length;
    let parity = numDigits % 2;
    for (let i = 0; i < numDigits; i++) {
        let digit = parseInt(val.charAt(i));
        if (i % 2 === parity) digit *= 2;
        if (digit > 9) digit -= 9;
        sum += digit;
    }
    return (sum % 10) === 0;
};

const CardDepositSchema = Yup.object().shape({
  amount: Yup.number().min(100, 'Minimum deposit is NGN 100').required('Amount is required'),
  number: Yup.string()
    .matches(/^[0-9\s]{15,19}$/, 'Enter a valid card number')
    .transform(value => value.replace(/\s/g, ''))
    .test('luhn-check', 'Invalid card number checksum', value => luhnCheck(value))
    .required('Card number is required'),
  expiry_month: Yup.string().matches(/^(0[1-9]|1[0-2])$/, 'MM').required('Required'),
  expiry_year: Yup.string().matches(/^20\d{2}$/, 'YYYY').required('Required'),
  cvc: Yup.string().matches(/^[0-9]{3,4}$/, 'CVC').required('Required'),
});

const CardDepositForm = ({ onDepositSuccess }) => {
    const { post: initializeCharge, loading: initLoading } = useApiPost('/cards/charge/initialize');
    const { post: verifyCharge, loading: verifyLoading } = useApiPost('/cards/charge/verify');

    const [chargeState, setChargeState] = useState({
        status: 'form', // form, pending_auth, success
        message: '',
        reference: '',
        auth_url: '',
    });

    const handleCharge = async (values, { setFieldError }) => {
        const payload = {
            amount: values.amount,
            currency: 'NGN',
            card: {
                number: values.number.replace(/\s/g, ''),
                cvc: values.cvc,
                expiry_month: values.expiry_month,
                expiry_year: values.expiry_year,
            },
        };

        const result = await initializeCharge(payload);

        if (result.success) {
            if (result.data.status === 'success') {
                await handleVerification(result.data.reference);
            } else {
                setChargeState({
                    status: result.data.status,
                    message: result.data.message,
                    reference: result.data.reference,
                    auth_url: result.data.authentication_url || '',
                });
                if (result.data.authentication_url) {
                    window.open(result.data.authentication_url, '_blank');
                }
            }
        } else {
            // [THE FIX] Extract the error message string before passing it to the form.
            const errorMessage = result.error?.message || 'This card was declined by the processor.';
            setFieldError('number', errorMessage);
        }
    };

    const handleVerification = async (reference) => {
        const result = await verifyCharge({ reference });
        if (result.success) {
            setChargeState({ status: 'success', message: `Successfully deposited NGN ${result.data.amount.toFixed(2)}!` });
        } else {
            toast.error(result.error?.message || "Verification failed. If funds were debited, please contact support.");
            setChargeState({ status: 'form', message: '', reference: '' });
        }
    };

    return (
        <div className="p-6">
            <AnimatePresence mode="wait">
                {chargeState.status === 'form' && (
                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <Formik
                            initialValues={{ amount: '', number: '', expiry_month: '', expiry_year: '', cvc: '' }}
                            validationSchema={CardDepositSchema}
                            onSubmit={handleCharge}
                        >
                            {() => (
                                <Form className="space-y-4">
                                    <FormInput label="Amount (NGN)" name="amount" type="number" placeholder="e.g., 5000" />
                                    <FormInput label="Card Number" name="number" placeholder="0000 0000 0000 0000" />
                                    <div className="flex gap-4">
                                        <div className="flex-1"><FormInput label="Expiry (MM)" name="expiry_month" placeholder="MM" /></div>
                                        <div className="flex-1"><FormInput label="Expiry (YYYY)" name="expiry_year" placeholder="YYYY" /></div>
                                        <div className="flex-1"><FormInput label="CVC" name="cvc" placeholder="123" /></div>
                                    </div>
                                    <div className="pt-4">
                                        <Button type="submit" isLoading={initLoading} fullWidth>Pay Now</Button>
                                    </div>
                                    <p className="text-xs text-neutral-500 flex items-center justify-center pt-2">
                                        <LockClosedIcon className="h-4 w-4 mr-1"/> Secure payments by QuantumPay
                                    </p>
                                </Form>
                            )}
                        </Formik>
                    </motion.div>
                )}

                {(chargeState.status === 'pending_authentication' || chargeState.status === 'pending_redirect') && (
                    <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-8">
                        <h2 className="text-xl font-semibold text-white">Complete Authentication</h2>
                        <p className="text-neutral-700 dark:text-neutral-300">{chargeState.message}</p>
                        {chargeState.status === 'pending_redirect' && (
                            <p className="text-sm text-yellow-400">A secure window should have opened. If not, please check your pop-up blocker.</p>
                        )}
                        <div className="pt-4">
                            <Button onClick={() => handleVerification(chargeState.reference)} isLoading={verifyLoading}>
                                I have completed authentication, Verify
                            </Button>
                        </div>
                    </motion.div>
                )}

                {chargeState.status === 'success' && (
                     <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4 py-8">
                        <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400"/>
                        <h2 className="text-2xl font-semibold text-white">Deposit Successful!</h2>
                        <p className="text-neutral-700 dark:text-neutral-300">{chargeState.message}</p>
                        <div className="pt-4">
                            <Button onClick={onDepositSuccess}>
                                Done
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CardDepositForm;