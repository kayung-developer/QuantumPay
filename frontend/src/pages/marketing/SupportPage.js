// FILE: src/pages/marketing/SupportPage.js

import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Disclosure } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon, LifebuoyIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

// --- Component Imports ---
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useApi, useApiPost } from '../../hooks/useApi';

const SupportPage = () => {
    const { t } = useTranslation();
    const { post: submitForm, loading: formLoading, data: formResponse } = useApiPost('/utility/support/contact');
    
    // [THE DEFINITIVE FIX] Fetch the FAQ structure from the new backend endpoint.
    const { data: faqData, loading: faqsLoading, error: faqsError } = useApi('/utility/faqs');
    
    const [searchTerm, setSearchTerm] = useState('');

    const ContactSchema = Yup.object().shape({
        name: Yup.string().min(2, t('validation.too_short')).required(t('validation.required')),
        email: Yup.string().email(t('validation.email_invalid')).required(t('validation.required')),
        subject: Yup.string().required(t('validation.required')),
        message: Yup.string().min(10, t('validation.too_short')).required(t('validation.required')),
    });
    
    // Memoize the filtered FAQs to prevent re-calculation on every render
    const filteredFaqs = useMemo(() => {
        if (!faqData) return []; // <-- Robustness: Handle null data
        
        const lowercasedFilter = searchTerm.toLowerCase();

        return faqData
            .map(category => ({
                ...category,
                questions: category.questions.filter(
                    faq => t(faq.q_key).toLowerCase().includes(lowercasedFilter) || t(faq.a_key).toLowerCase().includes(lowercasedFilter)
                ),
            }))
            .filter(category => category.questions.length > 0);

    }, [searchTerm, faqData, t]);
    
    // [THE DEFINITIVE FIX] A dedicated render function for the FAQ section to handle all states.
    const renderFaqs = () => {
        if (faqsLoading) {
            return <div className="pt-6 flex justify-center"><Spinner /></div>;
        }
        if (faqsError) {
            return <p className="pt-6 text-center text-red-500">Could not load FAQs. Please try again later.</p>;
        }
        if (!faqData || filteredFaqs.length === 0) {
            return <p className="text-center text-neutral-500 py-8">{t('faq_no_results', { searchTerm })}</p>;
        }

        return filteredFaqs.map((categoryData) => (
            <div key={categoryData.category}>
                <h3 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-2">{categoryData.category}</h3>
                {categoryData.questions.map((faq, index) => (
                    <Disclosure as="div" key={index} className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                        {({ open }) => (
                            <>
                                <dt><Disclosure.Button className="flex w-full items-start justify-between text-left text-neutral-900 dark:text-white">
                                    <span className="text-base font-semibold leading-7">{t(faq.q_key)}</span>
                                    <span className="ml-6 flex h-7 items-center"><PlusSmallIcon className={`${open ? 'hidden' : 'block'} h-6 w-6`} /><MinusSmallIcon className={`${open ? 'block' : 'hidden'} h-6 w-6`} /></span>
                                </Disclosure.Button></dt>
                                <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                    <p className="text-base leading-7 text-neutral-600 dark:text-neutral-400">{t(faq.a_key)}</p>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                ))}
            </div>
        ));
    };

    return (
        <div className="bg-white dark:bg-neutral-950">
            {/* Hero Section */}
            <div className="bg-neutral-50 dark:bg-neutral-900 pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="mx-auto max-w-2xl text-center">
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">{t('support_title')}</h1>
                        <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">{t('support_subtitle')}</p>
                    </motion.div>
                </div>
            </div>

            {/* FAQ and Contact Form Section */}
            <div className="py-16 sm:py-24">
                 <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                             <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-display flex items-center">
                                <LifebuoyIcon className="h-6 w-6 mr-3 text-primary"/>
                                {t('faq_title')}
                            </h2>
                             <div className="mt-6">
                                <FormInput
                                    name="search"
                                    placeholder={t('faq_search_placeholder')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="mt-6 w-full max-w-3xl space-y-4">
                                {renderFaqs()}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-white dark:bg-neutral-900 p-8 rounded-lg border border-neutral-200 dark:border-neutral-800 sticky top-24">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-display flex items-center">
                                    <EnvelopeIcon className="h-6 w-6 mr-3 text-primary"/>
                                    {t('contact_us_title')}
                                </h2>
                                <p className="mt-4 text-neutral-600 dark:text-neutral-400 text-sm">{t('contact_us_subtitle')}</p>
                                {formResponse ? (
                                    <div className="mt-6 text-center p-4 bg-green-100 dark:bg-green-900/50 border border-green-200 dark:border-green-700 rounded-lg">
                                        <CheckCircleIcon className="h-8 w-8 mx-auto text-green-500"/>
                                        <p className="mt-2 text-neutral-800 dark:text-white font-semibold">{formResponse.message}</p>
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
                                                <FormInput name="name" label={t('full_name_label')} />
                                                <FormInput name="email" type="email" label={t('email_address_label')} />
                                                <FormInput name="subject" label={t('subject_label')} />
                                                <div>
                                                    <label htmlFor="message" className="block text-sm font-medium text-neutral-800 dark:text-neutral-300 mb-1">{t('message_label')}</label>
                                                    <Field as="textarea" id="message" name="message" rows="4"
                                                        className={`block w-full px-3 py-2 bg-neutral-100 dark:bg-neutral-800 border rounded-md shadow-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                                                            errors.message && touched.message ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary'
                                                        }`}
                                                    />
                                                    <ErrorMessage name="message" component="p" className="mt-1.5 text-xs text-red-500" />
                                                </div>
                                                <Button type="submit" isLoading={formLoading} fullWidth>{t('send_message_button')}</Button>
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
