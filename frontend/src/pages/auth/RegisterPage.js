import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik'; // Import Field and ErrorMessage
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import FormInput from '../../components/common/FormInput';
import Button from '../../components/common/Button';
import { motion } from 'framer-motion';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth as firebaseAuth } from '../../firebase'; // Corrected Path
import apiClient from '../../api/axiosConfig';

const countryOptions = [
    { value: 'NG', label: 'Nigeria (+234)' },
    { value: 'KE', label: 'Kenya (+254)' },
    { value: 'GH', label: 'Ghana (+233)' },
    { value: 'ZA', label: 'South Africa (+27)' },
];

const RegisterSchema = Yup.object().shape({
  full_name: Yup.string().min(2, 'Name is too short').max(50, 'Too long').required('Full name is required'),
  email: Yup.string().email('Invalid email address').required('Email is required'),
  country_code: Yup.string().required('Please select your country'),
  phone_number: Yup.string().matches(/^[0-9]{7,15}$/, 'Enter a valid phone number').required('Phone number is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const Logo = () => (
  <Link to="/" className="flex items-center justify-center space-x-3 mb-8">
    <svg className="h-10 w-10 text-primary" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.59L7.71 13.3a.996.996 0 111.41-1.41L11 13.17V7a1 1 0 112 0v6.17l1.88-1.88a.996.996 0 111.41 1.41L13 16.59V17a1 1 0 11-2 0v-.41z"/></svg>
    <span className="font-display text-3xl font-bold text-white">QuantumPay</span>
  </Link>
);

const RegisterPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

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
            <h2 className="text-2xl font-bold font-display text-white">Create your account</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-light">Sign in</Link>
            </p>
          </div>

          <Formik
            initialValues={{
                full_name: '',
                email: '',
                country_code: 'NG',
                phone_number: '',
                password: '',
            }}
            validationSchema={RegisterSchema}
            onSubmit={async (values, { setSubmitting, setFieldError }) => {
              try {
                const userCredential = await createUserWithEmailAndPassword(firebaseAuth, values.email, values.password);
                const user = userCredential.user;
                await updateProfile(user, { displayName: values.full_name });
                const token = await user.getIdToken();

                await apiClient.post('/auth/complete-registration',
                    {
                        firebase_uid: user.uid,
                        email: values.email,
                        full_name: values.full_name,
                        country_code: values.country_code,
                        phone_number: values.phone_number,
                    },
                    { headers: { Authorization: `Bearer ${token}` } }
                );

                await login(values.email, values.password);
                navigate('/dashboard');
              } catch (error) {
                 if (error.code === 'auth/email-already-in-use') {
                    setFieldError('email', 'This email address is already in use.');
                 } else {
                    setFieldError('password', error.response?.data?.detail || 'An unexpected error occurred.');
                 }
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({ isSubmitting, errors, touched }) => ( // Expose errors and touched for the select field
              <Form className="space-y-4">
                <FormInput label="Full Name" name="full_name" />
                <FormInput label="Email address" name="email" type="email" />

                {/* --- THIS IS THE CORRECTED SECTION --- */}
                <div>
                    <label htmlFor="country_code" className="block text-sm font-medium text-neutral-300 mb-1">Country</label>
                    <Field
                        as="select"
                        id="country_code"
                        name="country_code"
                        className={`block w-full px-3 py-2 bg-neutral-800 border rounded-md shadow-sm text-neutral-100 placeholder-neutral-500 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                            errors.country_code && touched.country_code ? 'border-red-500 focus:ring-red-500' : 'border-neutral-700 focus:ring-primary'
                        }`}
                    >
                        {countryOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </Field>
                    <ErrorMessage name="country_code" component="p" className="mt-1.5 text-xs text-red-500" />
                </div>
                {/* --- END OF CORRECTION --- */}

                <FormInput label="Phone Number" name="phone_number" type="tel" />
                <FormInput label="Password" name="password" type="password" />

                <div>
                  <Button type="submit" isLoading={isSubmitting} fullWidth size="lg">Create Account</Button>
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