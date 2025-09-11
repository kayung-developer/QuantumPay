import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';

// Validation schema using Yup
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const Logo = () => (
  <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
    <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59L7.71 13.3a.996.996 0 111.41-1.41L11 13.17V7a1 1 0 112 0v6.17l1.88-1.88a.996.996 0 111.41 1.41L13 16.59V17a1 1 0 11-2 0v-.41z"/>
    </svg>
    <span className="font-display text-3xl font-bold text-white">QuantumPay</span>
  </Link>
);

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

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
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-neutral-400">
              Enter your email and we'll send you a link to get back into your account.
            </p>
          </div>

          {isSubmitted ? (
            <div className="text-center p-4 bg-secondary/20 border border-secondary rounded-md">
              <p className="text-secondary-light font-medium">
                Password reset email sent!
              </p>
              <p className="text-neutral-300 mt-2 text-sm">
                Please check your inbox (and spam folder) for further instructions.
              </p>
              <Link to="/login" className="mt-4 inline-block font-medium text-primary hover:text-primary-light transition-colors">
                &larr; Back to login
              </Link>
            </div>
          ) : (
            <Formik
              initialValues={{ email: '' }}
              validationSchema={ForgotPasswordSchema}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await resetPassword(values.email);
                  setIsSubmitted(true);
                } catch (error) {
                  // Error toast is handled in AuthContext
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
                  <div>
                    <Button type="submit" isLoading={isSubmitting} fullWidth={true} size="lg">
                      Send reset link
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