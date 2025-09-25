import React, { useState } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { useApiPost } from '../../../hooks/useApi';
import { toastSuccess, toastError } from 'components/common/Toast';
import { motion } from 'framer-motion';

const BillerPaymentForm = ({ biller, onPaymentSuccess }) => {
    const [customerDetails, setCustomerDetails] = useState(null);
    // The form is considered validated if the biller doesn't require it, or if validation succeeds.
    const [isValidated, setIsValidated] = useState(!biller.requires_validation);

    const { post: validateCustomer, loading: validating } = useApiPost('/bills/validate-customer');
    const { post: payBill, loading: paying } = useApiPost('/bills/pay');

    const paymentSchema = Yup.object().shape({
        customer_identifier: Yup.string().required('This field is required'),
        amount: Yup.number()
          .min(50, `Minimum is ${biller.currency || 'NGN'} 50`)
          .required('Amount is required'),
    });

    const handleValidation = async (values) => {
        const payload = {
            biller_id: biller.id,
            provider_name: biller.provider,
            customer_id: values.customer_identifier,
        };
        const result = await validateCustomer(payload);

        if (result.success && result.data.status === 'success') {
            setCustomerDetails(result.data);
            setIsValidated(true);
            toastSuccess(`Validated: ${result.data.name}`);
        } else {
            // The useApiPost hook will show the generic error, but we can be more specific.
            toastError(result.data?.message || 'Validation failed.');
        }
    };

    const handleSubmitPayment = async (values) => {
        const payload = {
            biller_id: biller.id,
            provider_name: biller.provider,
            biller_category: biller.category,
            customer_identifier: values.customer_identifier,
            amount: parseFloat(values.amount),
        };
        const result = await payBill(payload);

        if (result.success) {
            toastSuccess("Bill payment successful!");
            onPaymentSuccess();
        }
        // Error toast is handled by the useApiPost hook.
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8">
            <Formik
                initialValues={{
                    customer_identifier: '',
                    amount: customerDetails?.details?.amount || '' // Pre-fill amount if validation returns it (e.g., Remita)
                }}
                validationSchema={paymentSchema}
                onSubmit={isValidated ? handleSubmitPayment : handleValidation}
                enableReinitialize // Allows the form to update when customerDetails changes
            >
                {({ values, errors, touched }) => (
                    <Form className="space-y-4">
                        <FormInput
                            label={biller.category === 'tv' ? 'Smartcard Number' : biller.category === 'airtime' ? 'Phone Number' : 'Customer ID / RRR'}
                            name="customer_identifier"
                            disabled={isValidated}
                        />

                        {isValidated && customerDetails?.name && customerDetails.name !== "N/A" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-green-900/50 border border-green-700 rounded-md text-sm text-green-300"
                            >
                                Customer Name: <span className="font-bold">{customerDetails.name}</span>
                            </motion.div>
                        )}

                        {isValidated && (
                             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <FormInput
                                    label={`Amount (${biller.currency || 'NGN'})`}
                                    name="amount"
                                    type="number"
                                    disabled={!!customerDetails?.details?.amount} // Disable if amount is fixed by validation
                                />
                             </motion.div>
                        )}

                        <div className="pt-4 border-t border-neutral-300 dark:border-neutral-700 flex flex-col items-center">
                            {!isValidated ? (
                                <Button type="submit" isLoading={validating} fullWidth>
                                    Validate Details
                                </Button>
                            ) : (
                                <Button type="submit" isLoading={paying} fullWidth>
                                    Pay {biller.currency || 'NGN'} {values.amount || '0.00'}
                                </Button>
                            )}
                             <p className="text-xs text-neutral-500 mt-2">
                                A service fee of {(biller.fee).toFixed(2)} may apply.
                             </p>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default BillerPaymentForm;