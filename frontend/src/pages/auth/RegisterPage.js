// FILE: src/pages/auth/RegisterPage.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import IconLogo24 from '../../components/icons/IconLogo24';
import allCountries from '../../utils/countries.json';

const Logo = () => (
    <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
      <IconLogo24 className="h-8 w-auto text-primary" />
      <span className="font-display text-3xl font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
        QuantumPay
      </span>
    </Link>
);

const RegisterPage = () => {
    const navigate = useNavigate();
    // [THE FIX] We only need the register function now.
    const { register } = useAuth();
    const { t } = useTranslation();

    const RegisterSchema = Yup.object().shape({
        full_name: Yup.string().min(2, t('validation.too_short')).required(t('validation.required')),
        email: Yup.string().email(t('validation.email_invalid')).required(t('validation.required')),
        country_code: Yup.string().required(t('validation.required')),
        phone_number: Yup.string().matches(/^[0-9]{7,15}$/, t('validation.phone_invalid')).required(t('validation.required')),
        password: Yup.string().min(8, t('validation.password_too_short', { min: 8 })).required(t('validation.required')),
    });

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-glow-radial">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="sm:mx-auto sm:w-full sm:max-w-md">
                <Logo />
                <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-lg py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-neutral-200 dark:border-neutral-800">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">{t('register_title')}</h2>
                        <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                            {t('register_subtitle_prefix')}{' '}
                            <Link to="/login" className="font-medium text-primary hover:text-primary-focus transition-colors">{t('register_subtitle_link')}</Link>
                        </p>
                    </div>

                    <Formik
                        initialValues={{ full_name: '', email: '', country_code: 'US', phone_number: '', password: '' }}
                        validationSchema={RegisterSchema}
                        onSubmit={async (values, { setSubmitting, setFieldError }) => {
                            try {
                                // [THE DEFINITIVE FIX] We only call register. Firebase automatically
                                // signs the user in, which triggers our onAuthStateChanged listener.
                                // The listener then handles token storage and JIT provisioning.
                                // The ProtectedRoute component will handle navigation once isAuthenticated is true.
                                await register(values.email, values.password, values.full_name);
                                toast.success('Registration successful! Welcome to QuantumPay.');
                                // No more navigate() or login() call here!
                            } catch (error) {
                                if (error.code === 'auth/email-already-in-use') {
                                    setFieldError('email', t('email_in_use_error'));
                                } else {
                                    toast.error(error.message || 'An unexpected error occurred.');
                                }
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting, errors, touched }) => (
                            <Form className="space-y-4">
                                <FormInput label={t('full_name_label')} name="full_name" />
                                <FormInput label={t('email_address_label')} name="email" type="email" />
                                <div>
                                    <label htmlFor="country_code" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('country_label')}</label>
                                    <Field as="select" id="country_code" name="country_code" className={`block w-full px-3 py-2 bg-white dark:bg-neutral-800 border rounded-md shadow-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 transition-colors duration-200 ${errors.country_code && touched.country_code ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary'}`}>
                                        <option value="">Select a country...</option>
                                        {allCountries.map(country => (<option key={country.code} value={country.code}>{country.name}</option>))}
                                    </Field>
                                    <ErrorMessage name="country_code" component="p" className="mt-1.5 text-xs text-red-500" />
                                </div>
                                <FormInput label={t('phone_number_label')} name="phone_number" type="tel" />
                                <FormInput label={t('password_label')} name="password" type="password" />
                                <div>
                                    <Button type="submit" isLoading={isSubmitting} fullWidth size="lg">{t('create_account_button')}</Button>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;
