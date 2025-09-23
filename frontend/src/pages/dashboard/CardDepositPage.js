import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { useApiPost } from '../../hooks/useApi';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCardIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

// Luhn algorithm check for basic card number validation
const luhnCheck = (val) => {
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
    .matches(/^[0-9]{15,19}$/, 'Enter a valid card number')
    .test('luhn-check', 'Invalid card number', value => value ? luhnCheck(value) : false)
    .required('Card number is required'),
  expiry_month: Yup.string().matches(/^(0[1-9]|1[0-2])$/, 'MM').required('Required'),
  expiry_year: Yup.string().matches(/^(20)\d{2}$/, 'YYYY').required('Required'),
  cvc: Yup.string().matches(/^[0-9]{3,4}$/, 'CVC').required('Required'),
});


const CardDepositPage = () => {
    const { post: initializeCharge, loading: initLoading } = useApiPost('/cards/charge/initialize');
    const { post: verifyCharge, loading: verifyLoading } = useApiPost('/cards/charge/verify');
    const navigate = useNavigate();

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
                number: values.number,
                cvc: values.cvc,
                expiry_month: values.expiry_month,
                expiry_year: values.expiry_year,
            },
        };

        const result = await initializeCharge(payload);

        if (result.success) {
            if (result.data.status === 'success') {
                // Charge was successful without 3DS, proceed to verify
                await handleVerification(result.data.reference);
            } else {
                // 3DS is required
                setChargeState({
                    status: result.data.status, // pending_redirect or pending_authentication
                    message: result.data.message,
                    reference: result.data.reference,
                    auth_url: result.data.authentication_url || '',
                });
                if (result.data.authentication_url) {
                    // For a real system, you would redirect the user to this URL
                    window.open(result.data.authentication_url, '_blank');
                }
            }
        } else {
            setFieldError('number', result.error || 'An error occurred with the card processor.');
        }
    };

    const handleVerification = async (reference) => {
        const result = await verifyCharge({ reference });
        if (result.success) {
            setChargeState({ status: 'success', message: `Successfully deposited NGN ${result.data.amount.toFixed(2)}!`, reference: '' });
        } else {
            toast.error(result.error || "Verification failed. Please contact support.");
            setChargeState({ status: 'form', message: '', reference: '' }); // Reset form
        }
    };

    return (
        <DashboardLayout pageTitle="Fund with Card">
            <div className="max-w-xl mx-auto">
                <div className="flex items-center space-x-3 mb-6">
                    <CreditCardIcon className="h-8 w-8 text-primary"/>
                    <div>
                        <h1 className="text-3xl font-bold font-display text-white">Fund Wallet with Card</h1>
                        <p className="mt-1 text-neutral-400">Securely add funds using your Verve, Visa, or Mastercard.</p>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-8">
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
                                            <FormInput label="Amount (NGN)" name="amount" type="number" />
                                            <FormInput label="Card Number" name="number" />
                                            <div className="flex gap-4">
                                                <FormInput label="Expiry Month" name="expiry_month" placeholder="MM" />
                                                <FormInput label="Expiry Year" name="expiry_year" placeholder="YYYY" />
                                                <FormInput label="CVC" name="cvc" />
                                            </div>
                                            <div className="pt-4">
                                                <Button type="submit" isLoading={initLoading} fullWidth>
                                                    Pay Now
                                                </Button>
                                            </div>
                                            <p className="text-xs text-neutral-500 flex items-center justify-center pt-2">
                                                <LockClosedIcon className="h-4 w-4 mr-1"/> Secure payments powered by QuantumPay
                                            </p>
                                        </Form>
                                    )}
                                </Formik>
                             </motion.div>
                        )}

                        {(chargeState.status === 'pending_authentication' || chargeState.status === 'pending_redirect') && (
                            <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                                <h2 className="text-xl font-semibold text-white">Authentication Required</h2>
                                <p className="text-neutral-300">{chargeState.message}</p>
                                {chargeState.status === 'pending_redirect' && (
                                    <p className="text-sm text-yellow-400">Please complete the authentication in the new tab that opened.</p>
                                )}
                                <div className="pt-4">
                                    <Button onClick={() => handleVerification(chargeState.reference)} isLoading={verifyLoading}>
                                        I have authenticated, Verify Payment
                                    </Button>
                                </div>
                            </motion.div>
                        )}

                        {chargeState.status === 'success' && (
                             <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center space-y-4">
                                <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400"/>
                                <h2 className="text-xl font-semibold text-white">Deposit Successful!</h2>
                                <p className="text-neutral-300">{chargeState.message}</p>
                                <div className="pt-4">
                                    <Button onClick={() => navigate('/dashboard/wallets')}>
                                        Back to Wallets
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CardDepositPage;