import React from 'react';
import { Link } from 'react-router-dom';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';
import IconLogo24 from '../../components/icons/IconLogo24';


// Validation schema using Yup
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string().email('Invalid email address').required('Email is required'),
});

const Logo = () => (
  <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
    <IconLogo24 />
    <span className="font-display text-3xl font-bold text-neutral-900 dark:text-white">QuantumPay</span>
  </Link>
);

const ForgotPasswordPage = () => {
  const { resetPassword } = useAuth();
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 dark:bg-glow-radial">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <Logo />
        <div className="bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 border border-neutral-200 dark:border-neutral-800">
          <div className="text-center mb-6">
              <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
                  Sign in to your account
              </h2>
            <p className="mt-2 text-sm text-neutral-700 dark:text-neutral-400">
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