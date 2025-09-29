import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import SettingsCard from './SettingsCard'; // <-- CORRECTED IMPORT (default)

const ProfileSchema = Yup.object().shape({
    full_name: Yup.string().min(2, 'Name is too short').required('Full name is required'),
    phone_number: Yup.string().matches(/^[0-9+-\s()]*$/, 'Invalid phone number format').nullable(),
});

const ProfileSettings = () => {
    const { dbUser, fetchDbUser } = useAuth();
    const { post: updateProfile, loading } = useApiPost('/users/me', { method: 'PUT' });

    const handleSubmit = async (values) => {
        const result = await updateProfile(values);
        if (result.success) {
            fetchDbUser();
        }
    };

    return (
        <SettingsCard
            title="Personal Information"
            description="Update your personal details. Your email is used for login and cannot be changed."
        >
            <Formik
                initialValues={{
                    email: dbUser?.email || '',
                    full_name: dbUser?.full_name || '',
                    phone_number: dbUser?.phone_number || '',
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {() => (
                    <Form className="space-y-4">
                        <FormInput label="Email Address" name="email" disabled />
                        <FormInput label="Full Name" name="full_name" />
                        <FormInput label="Phone Number" name="phone_number" />
                        <div className="pt-2 flex justify-end">
                            <Button type="submit" isLoading={loading}>Save Changes</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </SettingsCard>
    );
};

export default ProfileSettings;