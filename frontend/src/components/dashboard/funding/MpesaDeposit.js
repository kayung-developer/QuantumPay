import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { useApiPost } from '../../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { DevicePhoneMobileIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { toastSuccess, toastError } from '../components/common/Toast';

const MpesaSchema = Yup.object().shape({
  // Kenyan phone numbers are typically 10 digits (e.g., 07... or 01...)
  // The API expects the format 2547...
  // We'll let the user enter their local number and format it on submission.
  phone_number: Yup.string()
    .matches(/^(07|01)\d{8}$/, 'Enter a valid Safaricom number (e.g., 0712345678)')
    .required('Your M-Pesa phone number is required'),
  amount: Yup.number()
    .min(10, 'Minimum deposit is KES 10')
    .required('Amount is required'),
});

const MpesaDeposit = ({ onDepositInitiated }) => {
  const { post: initiateStkPush, loading, error, data } = useApiPost('/mpesa/deposit/stk-push');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (values, { resetForm }) => {
    // Format the phone number to the required 254... format
    const formattedPhoneNumber = `254${values.phone_number.substring(1)}`;

    const payload = {
      phone_number: formattedPhoneNumber,
      amount: values.amount,
    };

    const result = await initiateStkPush(payload);

    if (result.success) {
      toastSuccess("Push notification sent to your phone!");
      setIsSubmitted(true);
      // We can call a parent component function if needed, e.g., to close a modal
      if (onDepositInitiated) {
        onDepositInitiated();
      }
    }
    // The useApiPost hook automatically shows an error toast on failure
  };

  return (
    <div className="p-4">
        <AnimatePresence mode="wait">
            {!isSubmitted ? (
                <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <Formik
                        initialValues={{ phone_number: '', amount: '' }}
                        validationSchema={MpesaSchema}
                        onSubmit={handleSubmit}
                    >
                        {() => (
                            <Form className="space-y-4">
                                <FormInput
                                    label="Safaricom Phone Number"
                                    name="phone_number"
                                    type="tel"
                                    placeholder="0712345678"
                                />
                                <FormInput
                                    label="Amount (KES)"
                                    name="amount"
                                    type="number"
                                    placeholder="1000"
                                />
                                <div className="pt-2">
                                    <Button type="submit" isLoading={loading} fullWidth>
                                        Send Deposit Request
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </motion.div>
            ) : (
                <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center space-y-4 py-8"
                >
                    <DevicePhoneMobileIcon className="h-16 w-16 mx-auto text-primary animate-pulse" />
                    <h2 className="text-xl font-semibold text-white">Check Your Phone</h2>
                    <p className="text-neutral-700 dark:text-neutral-300 max-w-sm mx-auto">
                        We've sent a push notification to your phone. Please enter your M-Pesa PIN to authorize the payment of KES {data?.amount || ''}.
                    </p>
                    <p className="text-xs text-neutral-500">Your wallet balance will update automatically upon completion.</p>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
  );
};

export default MpesaDeposit;