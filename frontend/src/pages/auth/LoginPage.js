import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';
import IconLogo24 from '../../components/icons/IconLogo24';

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Logo = () => (
  <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
    <IconLogo24 />
    <span className="font-display text-3xl font-bold text-neutral-900 dark:text-white">QuantumPay</span>
  </Link>
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  return (
     <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-glow-radial">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Logo />
        <div className="bg-white/50 dark:bg-white/80 dark:bg-neutral-900/50 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-neutral-200 dark:border-neutral-800">
          <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
                  Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Or{' '}
                  <Link to="/register" className="font-medium text-primary hover:text-primary-light">
                      create a new account
                  </Link>
              </p>
          </div>

          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LoginSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                await login(values.email, values.password);
                // Redirect to the page the user was trying to access, or the dashboard
                navigate(from, { replace: true });
              } catch (error) {
                // The error toast is handled in AuthContext, but we can set a field error too.
                setFieldError('password', 'Invalid credentials. Please try again.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-6">
                <FormInput
                  label="Email address"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                <FormInput
                  label="Password"
                  name="password"
                 type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />

                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <Link to="/forgot-password" className="font-medium text-primary hover:text-primary-light transition-colors">
                      Forgot your password?
                    </Link>
                  </div>
                </div>

                <div>
                  <Button type="submit" isLoading={isSubmitting} fullWidth={true} size="lg">
                    Sign in
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