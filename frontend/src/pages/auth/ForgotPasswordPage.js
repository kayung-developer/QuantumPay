import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import IconLogo24 from '../../components/icons/IconLogo24';

// [THEME-AWARE & I18N] The Logo is now a sub-component that uses the theme context.
const Logo = () => {
  return (
    <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
     <IconLogo24 className="h-6 w-auto" /> {/* Example styling */}
        <span className="font-display text-3xl font-bold text-neutral-900 dark:text-white">
            QuantumPay
        </span>
    </Link>
  );
};

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { t } = useTranslation(); // <-- Initialize the hook for translations

  // [I18N] Use translation keys for validation messages.
  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .email(t('validation.email_invalid')) // Ensure you have this key in i18n.js
      .required(t('validation.required')),
  });

  return (
    // [THEME-AWARE] The background colors and glow effect are correctly applied for both themes.
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-glow-radial">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Logo />
        {/* [THEME-AWARE] This container has specific light/dark backgrounds, blurs, and borders. */}
        <div className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-lg py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-neutral-200 dark:border-neutral-800">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
              {t('forgot_password_title')}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {t('forgot_password_subtitle')}
            </p>
          </div>

          {isSubmitted ? (
            // [THEME-AWARE] The success message box has specific light/dark background and border colors.
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-500/30 rounded-md"
            >
              <p className="font-medium text-green-800 dark:text-green-300">
                {t('reset_email_sent')}
              </p>
              <p className="text-neutral-600 dark:text-neutral-300 mt-2 text-sm">
                {t('check_inbox_instructions')}
              </p>
              <Link to="/login" className="mt-4 inline-block font-medium text-primary hover:text-primary-focus transition-colors">
                &larr; {t('back_to_login')}
              </Link>
            </motion.div>
          ) : (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await resetPassword(values.email);
                  setIsSubmitted(true);
                } catch (error) {
                  // Error toast is handled automatically in the AuthContext's resetPassword function.
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-6">
                  {/* [THEME-AWARE & I18N] The FormInput component is already theme-aware. */}
                  <FormInput
                    label={t('email_address_label')}
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                  />
                  <div>
                    {/* [THEME-AWARE & I18N] The Button component is already theme-aware. */}
                    <Button type="submit" isLoading={isSubmitting} fullWidth={true} size="lg">
                      {t('send_reset_link_button')}
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          )}
        </div>
      </motion.div>
    </div>
  );
};


export default ForgotPasswordPage;
