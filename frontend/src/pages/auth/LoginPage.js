import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(); // <-- Initialize the hook for translations
  const from = location.state?.from?.pathname || '/dashboard';

  // [I18N] Use translation keys for validation messages.
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .trim() // Remove leading/trailing whitespace
      .lowercase() // Convert to lowercase
      .email(t('validation.email_invalid'))
      // A stricter regex for email validation
      .matches(
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
          "Please enter a valid email address."
      )
      .required(t('validation.required')),
    password: Yup.string()
      .matches(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])/,
                "Must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
      )
      // No need for a complex password check on login, only on registration.
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
              {t('login_title')}
            </h2>
            <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
              {t('login_subtitle_prefix')}{' '}
              <Link to="/register" className="font-medium text-primary hover:text-primary-focus transition-colors">
                {t('login_subtitle_link')}
              </Link>
            </p>
          </div>

          <Formik
                    initialValues={{ email: '', password: '' }}
                    validationSchema={LoginSchema}
                    onSubmit={async (values, { setSubmitting, setFieldError }) => {
                        try {
                            // The values are already trimmed and lowercased by the schema
                            await login(values.email, values.password);
                            navigate(from, { replace: true });
                        } catch (error) {
                            setFieldError('password', t('invalid_credentials_error'));
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
                <FormInput
                  label={t('password_label')}
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-focus transition-colors">
                      {t('forgot_password_link')}
                    </Link>
                  </div>
                </div>

                <div>
                  {/* [THEME-AWARE & I18N] The Button component is already theme-aware. */}
                  <Button type="submit" isLoading={isSubmitting} fullWidth={true} size="lg">
                    {t('sign_in_button')}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;


