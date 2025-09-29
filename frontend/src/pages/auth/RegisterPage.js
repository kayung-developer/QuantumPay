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
import allCountries from '../../utils/countries.json'; // Although not sent to backend, good for UX

const Logo = () => {
  const { t } = useTranslation();
  return (
    <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
      <IconLogo24 className="h-8 w-auto text-primary" />
      <span className="font-display text-3xl font-bold text-neutral-900 dark:text-white group-hover:text-primary transition-colors">
        QuantumPay
      </span>
    </Link>
  );
};

const RegisterPage = () => {
    const { register } = useAuth();
    const { t } = useTranslation();

    const RegisterSchema = Yup.object().shape({
        full_name: Yup.string().min(2, t('validation.too_short')).required(t('validation.required')),
        email: Yup.string().email(t('validation.email_invalid')).required(t('validation.required')),
        password: Yup.string().min(8, t('validation.password_too_short', { min: 8 })).required(t('validation.required')),
    });

    return (
        <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-glow-radial">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sm:mx-auto sm:w-full sm:max-w-md"
            >
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
                        initialValues={{ full_name: '', email: '', password: '' }}
                        validationSchema={RegisterSchema}
                        onSubmit={async (values, { setSubmitting, setFieldError }) => {
                            const toastId = toast.loading('Creating your account...');
                            try {
                                // [THE DEFINITIVE FIX] Call the simplified register function.
                                // We no longer call login() or navigate() from here.
                                await register(values.email, values.password, values.full_name);
                                
                                toast.success('Registration successful! Welcome.', { id: toastId });
                                // The onAuthStateChanged listener in AuthContext and the ProtectedRoute
                                // component will now handle the redirection to the dashboard automatically
                                // once the user state is fully resolved. This is the most robust pattern.

                            } catch (error) {
                                if (error.code === 'auth/email-already-in-use') {
                                    setFieldError('email', t('email_in_use_error'));
                                    toast.error(t('email_in_use_error'), { id: toastId });
                                } else {
                                    toast.error(error.message || 'An unexpected error occurred.', { id: toastId });
                                }
                            } finally {
                                setSubmitting(false);
                            }
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form className="space-y-4">
                                <FormInput label={t('full_name_label')} name="full_name" />
                                <FormInput label={t('email_address_label')} name="email" type="email" />
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