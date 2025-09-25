import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { useApiPost } from '../../hooks/useApi';
import { LifebuoyIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Disclosure, Tab } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/solid';

// --- [REAL SYSTEM] Expanded and Categorized FAQ Data ---
const faqs = {
    "General": [
        { q: "What is QuantumPay?", a: "QuantumPay is a global financial super-app that allows you to send, spend, and manage money across multiple currencies, pay bills, run payroll, and much more." },
        { q: "Is QuantumPay free to use?", a: "Creating an account is free. We offer various plans with competitive, transparent fees for transactions. Please see our Pricing page for details." },
        { q: "Which countries is QuantumPay available in?", a: "We are currently live in Nigeria, Kenya, Ghana, and South Africa, with plans to expand globally. Core features like USD, EUR, and GBP wallets are available to all users." },
        { q: "How do I add a new currency wallet?", a: "From your Wallets page in the dashboard, click the 'Add New Wallet' button and select from the list of available currencies." }
    ],
    "Security": [
        { q: "Is my money safe with QuantumPay?", a: "Yes. Security is our top priority. We use bank-grade encryption, AI-powered fraud detection, and adhere to global security standards like PCI-DSS to protect your funds and data." },
        { q: "How do I enable Two-Factor Authentication (2FA)?", a: "In your dashboard, navigate to Settings > Security. You can enable 2FA using any standard authenticator app. We highly recommend this for all users." },
        { q: "What is a Credit Score?", a: "Our AI calculates a dynamic credit score based on your transaction history and account health. A higher score can unlock benefits like lower fees and access to credit features." },
        { q: "How do you protect against SIM swap fraud?", a: "Our system monitors for suspicious login activity, such as a new device associated with your number. High-risk activities will trigger additional verification steps to protect your account." },
    ],
    "Payments & Transfers": [
        { q: "How long do transfers take?", a: "Transfers between QuantumPay users are instant (under 2 seconds). Withdrawals to external bank accounts vary by country and method, from instant (SEPA/ACH) to 1-2 business days (SWIFT)." },
        { q: "What are the limits on my account?", a: "Transaction limits are based on your KYC (Know Your Customer) verification tier. To increase your limits, please complete the identity verification process in your dashboard's Verification Center." },
        { q: "Can I send money to someone who is not on QuantumPay?", a: "You can send an email-based payment request. They will receive a secure link to sign up and claim their funds." },
        { q: "How does currency exchange work?", a: "Our QuantumFX engine provides live, competitive exchange rates. You can convert between your currency wallets instantly from the 'Exchange' page in your dashboard." },
    ],
    "Business Accounts": [
        { q: "How do I create a business account?", a: "After signing up, you will see a 'Become a Merchant' or 'Create Business' prompt on your dashboard. Simply fill in your business name to get started." },
        { q: "Can I run payroll for international employees?", a: "Yes. Our Global Payroll suite allows you to pay team members in their local currencies. We handle the FX conversion automatically." },
        { q: "How does the mobile POS work?", a: "Our mobile app allows you to enter an amount or select products to generate a dynamic QR code. Your customer scans this code with their own QuantumPay app to complete the payment instantly." },
        { q: "Are invoices customizable?", a: "Yes, you can add your business logo, line items, notes, and country-specific taxes to all invoices you create." }
    ],
};

const ContactSchema = Yup.object().shape({ /* ... (Schema remains the same) ... */ });

const SupportPage = () => {
    const { post: submitForm, loading, data: response } = useApiPost('/utility/support/contact');
    const [searchTerm, setSearchTerm] = useState('');

    // Filter FAQs based on the search term
    const filteredFaqs = useMemo(() => {
        if (!searchTerm) return faqs;
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = {};
        for (const category in faqs) {
            const questions = faqs[category].filter(
                faq => faq.q.toLowerCase().includes(lowercasedFilter) || faq.a.toLowerCase().includes(lowercasedFilter)
            );
            if (questions.length > 0) {
                filtered[category] = questions;
            }
        }
        return filtered;
    }, [searchTerm]);

    return (
        // Main container inherits theme from PageWrapper
        <div className="bg-white dark:bg-neutral-950">
            {/* Hero Section */}
            <div className="bg-neutral-50 dark:bg-neutral-900 pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">Support Center</h1>
                        <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">We're here to help. Find answers to common questions or get in touch with our support team.</p>
                    </motion.div>
                </div>
            </div>

            {/* FAQ and Contact Form Section */}
            <div className="py-16 sm:py-24">
                 <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* FAQ Section */}
                        <div className="lg:col-span-2">
                             <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-display flex items-center">
                                <LifebuoyIcon className="h-6 w-6 mr-3 text-primary"/>
                                Frequently Asked Questions
                            </h2>
                            {/* [NEW] Search Bar */}
                             <div className="mt-6">
                                <FormInput
                                    name="search"
                                    placeholder="Search for answers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="mt-6 w-full max-w-3xl space-y-4">
                                {Object.keys(filteredFaqs).length > 0 ? Object.entries(filteredFaqs).map(([category, questions]) => (
                                    <div key={category}>
                                        <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">{category}</h3>
                                        {questions.map((faq, index) => (
                                            <Disclosure as="div" key={index} className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                                {({ open }) => (
                                                    <>
                                                        <dt><Disclosure.Button className="flex w-full items-start justify-between text-left text-neutral-900 dark:text-white">
                                                            <span className="text-base font-semibold leading-7">{faq.q}</span>
                                                            <span className="ml-6 flex h-7 items-center"><PlusSmallIcon className={`${open ? 'hidden' : 'block'} h-6 w-6`} /><MinusSmallIcon className={`${open ? 'block' : 'hidden'} h-6 w-6`} /></span>
                                                        </Disclosure.Button></dt>
                                                        <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                                            <p className="text-base leading-7 text-neutral-600 dark:text-neutral-400">{faq.a}</p>
                                                        </Disclosure.Panel>
                                                    </>
                                                )}
                                            </Disclosure>
                                        ))}
                                    </div>
                                )) : <p className="text-center text-neutral-500 py-8">No results found for "{searchTerm}".</p>}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-neutral-900 p-8 rounded-lg border border-neutral-200 dark:border-neutral-800 sticky top-24">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-display flex items-center">
                                    <EnvelopeIcon className="h-6 w-6 mr-3 text-primary"/>
                                    Contact Us
                                </h2>
                                <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-sm">Can't find an answer? Our team will get back to you within 24 hours.</p>
                                {response ? (
                                    <div className="mt-6 text-center p-4 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
                                        <CheckCircleIcon className="h-8 w-8 mx-auto text-green-500"/>
                                        <p className="mt-2 text-neutral-800 dark:text-white font-semibold">{response.message}</p>
                                    </div>
                                ) : (
                                    <Formik
                                    initialValues={{ name: '', email: '', subject: '', message: '' }}
                                    validationSchema={ContactSchema}
                                    onSubmit={async (values, { resetForm }) => {
                                        const result = await submitForm(values);
                                        if(result.success) {
                                            resetForm();
                                        }
                                    }}
                                >
                                    {({ errors, touched }) => (
                                        <Form className="mt-6 space-y-4">
                                            <FormInput name="name" label="Full Name" />
                                            <FormInput name="email" type="email" label="Email Address" />
                                            <FormInput name="subject" label="Subject" />

                                            {/* --- [THE DEFINITIVE FIX] --- */}
                                            <div>
                                                <label htmlFor="message" className="block text-sm font-medium text-neutral-800 dark:text-neutral-300 mb-1">Message</label>
                                                <Field
                                                    as="textarea"
                                                    id="message"
                                                    name="message"
                                                    rows="4"
                                                    className={`block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border rounded-md shadow-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                                                        errors.message && touched.message ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary'
                                                    }`}
                                                />
                                                <ErrorMessage name="message" component="p" className="mt-1.5 text-xs text-red-500" />
                                            </div>
                                            {/* --- END OF FIX --- */}

                                            <Button type="submit" isLoading={loading} fullWidth>Send Message</Button>
                                        </Form>
                                    )}
                                </Formik>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;