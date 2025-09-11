import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { useApiPost } from '../../hooks/useApi';
import { LifebuoyIcon, EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Disclosure } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/solid';

const faqs = [
    {
      question: "What are the transaction fees?",
      answer: "QuantumPay offers a competitive fee structure. For most P2P transactions, fees are as low as 0.5%. Card processing and international transfers may have different rates. Please see our pricing page for a detailed breakdown.",
    },
    {
      question: "How do I secure my account?",
      answer: "We highly recommend enabling Multi-Factor Authentication (MFA) in your account settings. You can use an authenticator app or biometric security for the strongest protection.",
    },
    {
      question: "How long do deposits take to reflect in my wallet?",
      answer: "Deposits via bank transfer or card payments are typically instant and should reflect in your wallet within seconds. In rare cases, bank processing delays may cause it to take up to 5 minutes.",
    },
]

const ContactSchema = Yup.object().shape({
    name: Yup.string().min(2, 'Name is too short').required('Your name is required'),
    email: Yup.string().email('Invalid email address').required('Your email is required'),
    subject: Yup.string().required('A subject is required'),
    message: Yup.string().min(10, 'Message is too short').required('A message is required'),
});

const SupportPage = () => {
    const { post: submitForm, loading, data: response } = useApiPost('/utility/support/contact');

    return (
        <div className="bg-neutral-950">
            <div className="pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mx-auto max-w-2xl text-center"
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
                            Support Center
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-neutral-300">
                            We're here to help. Find answers to common questions or get in touch with our support team.
                        </p>
                    </motion.div>

                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* FAQ Section */}
                        <div className="lg:col-span-2">
                             <h2 className="text-2xl font-bold text-white font-display flex items-center">
                                <LifebuoyIcon className="h-6 w-6 mr-3 text-primary"/>
                                Frequently Asked Questions
                            </h2>
                            <div className="mt-6 w-full max-w-3xl space-y-4">
                                {faqs.map((faq, index) => (
                                    <Disclosure as="div" key={index} className="pt-4 border-t border-neutral-800">
                                        {({ open }) => (
                                            <>
                                                <dt>
                                                    <Disclosure.Button className="flex w-full items-start justify-between text-left text-white">
                                                        <span className="text-base font-semibold leading-7">{faq.question}</span>
                                                        <span className="ml-6 flex h-7 items-center">
                                                            {open ? <MinusSmallIcon className="h-6 w-6" /> : <PlusSmallIcon className="h-6 w-6" />}
                                                        </span>
                                                    </Disclosure.Button>
                                                </dt>
                                                <Disclosure.Panel as="dd" className="mt-2 pr-12">
                                                    <p className="text-base leading-7 text-neutral-400">{faq.answer}</p>
                                                </Disclosure.Panel>
                                            </>
                                        )}
                                    </Disclosure>
                                ))}
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-1">
                            <div className="bg-neutral-900 p-8 rounded-lg border border-neutral-800">
                                <h2 className="text-2xl font-bold text-white font-display flex items-center">
                                    <EnvelopeIcon className="h-6 w-6 mr-3 text-primary"/>
                                    Contact Us
                                </h2>
                                <p className="mt-4 text-neutral-400 text-sm">
                                    Can't find an answer? Fill out the form and our team will get back to you within 24 hours.
                                </p>
                                {response ? (
                                    <div className="mt-6 text-center p-4 bg-green-900/50 border border-green-700 rounded-lg">
                                        <CheckCircleIcon className="h-8 w-8 mx-auto text-green-400"/>
                                        <p className="mt-2 text-white font-semibold">{response.message}</p>
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
                                        {() => (
                                            <Form className="mt-6 space-y-4">
                                                <FormInput name="name" label="Full Name" />
                                                <FormInput name="email" type="email" label="Email Address" />
                                                <FormInput name="subject" label="Subject" />
                                                <FormInput as="textarea" name="message" label="Message" rows={4} />
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