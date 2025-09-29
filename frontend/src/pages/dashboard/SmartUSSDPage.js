// FILE: src/pages/dashboard/SmartUSSDPage.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';

// --- Icon Imports ---
import { PhoneIcon, ClipboardDocumentIcon, CheckIcon, SignalIcon } from '@heroicons/react/24/outline';

const SmartUSSDPage = () => {
    const { t } = useTranslation();
    const [generatedString, setGeneratedString] = useState('');
    const [copied, setCopied] = useState(false);

    // This would be your bank's specific USSD base code. We use a generic one for demonstration.
    const YOUR_BANK_USSD_CODE = '*979#';

    // Validation schema using translated error messages.
    const UssdSchema = Yup.object().shape({
        recipientPhone: Yup.string()
            .matches(/^0[789][01]\d{8}$/, 'Must be a valid 11-digit Nigerian phone number')
            .required(t('validation.required')),
        amount: Yup.number()
            .min(50, 'Minimum amount is NGN 50')
            .required(t('validation.required')),
        pin: Yup.string()
            .matches(/^[0-9]{4}$/, 'PIN must be 4 digits')
            .required('Your 4-digit transaction PIN is required'),
    });

    const handleCopy = () => {
        if (!generatedString) return;
        navigator.clipboard.writeText(generatedString);
        setCopied(true);
        toast.success("USSD code copied to clipboard!");
        setTimeout(() => setCopied(false), 2000); // Reset icon after 2 seconds
    };

    return (
        <DashboardLayout pageTitleKey="smart_ussd_title">
            <div className="space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('smart_ussd_title')}</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400 max-w-2xl">
                        No data? No problem. Use this tool to generate a secure USSD code to complete your transaction offline. Simply generate, copy, and dial.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    {/* Form for generating USSD string */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8"
                    >
                        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white mb-4">Create Transaction</h2>
                        <Formik
                            initialValues={{ recipientPhone: '', amount: '', pin: '' }}
                            validationSchema={UssdSchema}
                            onSubmit={(values) => {
                                // This simulates the app generating the string.
                                const ussd = `${YOUR_BANK_USSD_CODE.replace('#','')}*1*${values.recipientPhone}*${values.amount}*${values.pin}#`;
                                setGeneratedString(ussd);
                                setCopied(false); // Reset copy status on new generation
                            }}
                        >
                            {() => (
                                <Form className="space-y-4">
                                    <FormInput
                                        label="Recipient's Phone Number"
                                        name="recipientPhone"
                                        type="tel"
                                        placeholder="08012345678"
                                    />
                                    <FormInput
                                        label="Amount (NGN)"
                                        name="amount"
                                        type="number"
                                        placeholder="5000"
                                    />
                                    <FormInput
                                        label="Your 4-Digit Transaction PIN"
                                        name="pin"
                                        type="password"
                                        maxLength="4"
                                        placeholder="••••"
                                    />
                                    <div className="pt-2">
                                        <Button type="submit" fullWidth>Generate USSD Code</Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    </motion.div>

                    {/* Display area for the generated string */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 sticky top-24"
                    >
                        <h2 className="text-xl font-semibold text-neutral-800 dark:text-white">Your Code</h2>
                        {generatedString ? (
                            <div className="space-y-4 mt-4">
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">Copy the code below and paste it into your phone's dialer to complete the transaction.</p>
                                <div className="p-4 bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-lg flex items-center justify-between">
                                    <pre className="text-lg font-mono text-primary">{generatedString}</pre>
                                    <button onClick={handleCopy} className="text-neutral-500 dark:text-neutral-400 hover:text-white dark:hover:text-primary transition-colors">
                                        {copied ? <CheckIcon className="h-6 w-6 text-green-500"/> : <ClipboardDocumentIcon className="h-6 w-6"/>}
                                    </button>
                                </div>
                                <Button href={`tel:${encodeURIComponent(generatedString)}`} fullWidth variant="secondary">
                                    <PhoneIcon className="h-5 w-5 mr-2"/>
                                    Dial Now
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-neutral-500">
                                <SignalIcon className="h-10 w-10 mx-auto text-neutral-400"/>
                                <p className="mt-2">Your USSD code will appear here once generated.</p>
                            </div>
                        )}
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SmartUSSDPage;