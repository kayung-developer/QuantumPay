// FILE: frontend/src/components/dashboard/biller/BillerPaymentForm.js

import React, { useState, useMemo } from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

import FormInput from '../../common/FormInput';
import Button from '../../common/Button';
import { useApiPost } from '../../../hooks/useApi';

const BillerPaymentForm = ({ biller, onPaymentSuccess }) => {
    const [step, setStep] = useState(1); // 1: Enter ID, 2: Select Product/Confirm, 3: Final Payment
    const [validationData, setValidationData] = useState(null);

    const { post: validateCustomer, loading: validating } = useApiPost('/bills/validate-customer');
    const { post: payBill, loading: paying } = useApiPost('/bills/pay');

    const providerDetails = useMemo(() => biller.provider_mappings[0], [biller]);

    const getIdentifierLabel = () => {
        // Use a mapping object for a clean, scalable, and complete solution.
        const labelMap = {
            "mobile": "Phone Number",
            "tv": "Smartcard / IUC Number",
            "internet": "Customer / Account ID",
            "electricity": "Meter Number",
            "utilities": "Account / Customer Number",
            "financial": "Loan / Account Number",
            "insurance": "Policy Number",
            "govt": "Remita (RRR) / Invoice Number",
            "education": "Student ID / Form Number",
            "travel": "Booking Reference",
            "shopping": "Order ID / Customer ID",
            "donation": "Reference (Optional)",
            "events": "Ticket Reference",
        };

        // Safely get the category ID and return the specific label, or a generic fallback.
        const categoryId = biller?.category?.id?.toLowerCase();
        return labelMap[categoryId] || 'Customer Identifier';
    };

    const initialSchema = Yup.object().shape({
        customer_identifier: Yup.string().required('This field is required'),
    });

    const finalSchema = Yup.object().shape({
        customer_identifier: Yup.string().required(),
        amount: Yup.number().positive().required('Amount is required'),
        product_code: Yup.string().optional(),
    });

    const handleValidation = async (values, { setFieldError }) => {
        const payload = {
            biller_id: biller.id,
            provider_name: providerDetails.provider_name,
            customer_id: values.customer_identifier,
        };
        const result = await validateCustomer(payload);

        if (result.success && result.data.status === 'success') {
            setValidationData(result.data);
            setStep(2); // Move to the next step
        } else {
            setFieldError('customer_identifier', result.error?.message || 'Validation failed.');
        }
    };

    const handleSubmitPayment = async (values) => {
        const payload = {
            biller_id: biller.id,
            provider_name: providerDetails.provider_name,
            biller_category: biller.category.id,
            customer_identifier: values.customer_identifier,
            amount: parseFloat(values.amount),
            product_code: values.product_code,
        };
        const result = await payBill(payload);
        if (result.success) {
            toast.success("Bill payment successful!");
            onPaymentSuccess();
        }
    };

    return (
        <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">{biller.name}</h2>

            <Formik
                initialValues={{ customer_identifier: '', amount: '', product_code: '' }}
                validationSchema={step === 1 ? initialSchema : finalSchema}
                onSubmit={step === 1 ? handleValidation : handleSubmitPayment}
                enableReinitialize
            >
                {({ values, setFieldValue }) => (
                    <Form className="space-y-4">
                        {/* STEP 1: Enter Customer ID */}
                        <motion.div key="step1" hidden={step !== 1}>
                            <FormInput
                                name="customer_identifier"
                                label={getIdentifierLabel()} // <-- This now returns the correct label
                                disabled={validating}
                            />
                            <Button type="submit" isLoading={validating} fullWidth className="mt-4">
                                Continue
                            </Button>
                        </motion.div>

                        {/* STEP 2: Select Product or Confirm Details */}
                        <motion.div key="step2" hidden={step !== 2}>
                            {validationData?.available_products ? (
                                // Case 1: Service has multiple products (e.g., Data Bundles)
                                <div>
                                    <label className="block text-sm font-medium text-neutral-300 dark:text-white mb-1">Select a Plan</label>
                                    <Field as="select" name="product_code" className="w-full bg-neutral-800 p-2 rounded-md"
                                        onChange={(e) => {
                                            const selectedProduct = validationData.available_products.find(p => p.code === e.target.value);
                                            setFieldValue('product_code', selectedProduct.code);
                                            setFieldValue('amount', selectedProduct.price);
                                        }}
                                    >
                                        <option value="">-- Choose a data plan --</option>
                                        {validationData.available_products.map(p => (
                                            <option key={p.code} value={p.code}>{p.name} - {p.price} {biller.currency}</option>
                                        ))}
                                    </Field>
                                </div>
                            ) : (
                                // Case 2: Service requires a variable amount
                                <div>
                                    <p className="text-sm text-green-400">Validated: {validationData?.name}</p>
                                    <FormInput name="amount" label={`Amount (${biller.currency})`} type="number" />
                                </div>
                            )}
                            <Button type="submit" isLoading={paying} fullWidth className="mt-4" disabled={!values.amount}>
                                Pay {values.amount ? `${values.amount} ${biller.currency}` : ''}
                            </Button>
                        </motion.div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default BillerPaymentForm;
