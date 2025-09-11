import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';

// Validation schema using Yup
const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const Logo = () => (
  <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
    <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59L7.71 13.3a.996.996 0 111.41-1.41L11 13.17V7a1 1 0 112 0v6.17l1.88-1.88a.996.996 0 111.41 1.41L13 16.59V17a1 1 0 11-2 0v-.41z"/>
    </svg>
    <span className="font-display text-3xl font-bold text-white">QuantumPay</span>
  </Link>
);

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-glow-radial">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Logo />
        <div className="bg-neutral-900/50 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-neutral-800">
          <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-display text-white">
                  Sign in to your account
              </h2>
              <p className="mt-2 text-sm text-neutral-400">
                  Or{' '}
                  <Link to="/register" className="font-medium text-primary hover:text-primary-light transition-colors">
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