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
    const navigate = useNavigate();

    const RegisterSchema = Yup.object().shape({
        full_name: Yup.string()
            .min(2, t('validation.too_short'))
            .required(t('validation.required')),
        email: Yup.string()
            .email(t('validation.email_invalid'))
            .matches(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          "Please enter a valid email address."
            )
            .required(t('validation.required')),
        password: Yup.string()
            .min(8, 'Password must be at least 8 characters long.')
            .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
                "Must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            )
            .required(t('validation.required')),
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
                        initialValues={{ full_name: '', email: '', password: '', country_code: '', phone_number: '' }}
                        validationSchema={RegisterSchema}
                        onSubmit={async (values, { setSubmitting, setFieldError }) => {
                            const toastId = toast.loading('Creating your account...');
                            try {
                                // The register function needs to be updated to accept these new fields
                                await register(values.email, values.password, values.full_name, values.phone_number, values.country_code);
                                toast.success('Registration successful! Welcome.', { id: toastId });
                                navigate('/dashboard'); // Redirect to dashboard on success
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
                                <div>
                                    <label htmlFor="country_code" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">{t('country_label')}</label>
                                    <Field as="select" name="country_code" id="country_code" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                                        <option value="">Select a country...</option>
                                        {allCountries.map(country => <option key={country.code} value={country.code}>{country.name}</option>)}
                                    </Field>
                                </div>
                                <FormInput label={t('phone_number_label')} name="phone_number" type="tel" />
                                <FormInput label={t('password_label')} name="password" type="password" helpText="Min. 8 characters, with uppercase, lowercase, number, and special character."/>
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
