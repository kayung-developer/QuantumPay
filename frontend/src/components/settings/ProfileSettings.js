// FILE: src/components/settings/ProfileSettings.js

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import SettingsCard from './SettingsCard';

// [THE DEFINITIVE FIX - Step 1] Add new fields to the validation schema
const ProfileSchema = Yup.object().shape({
    full_name: Yup.string().min(2, 'Name is too short').required('Full name is required'),
    phone_number: Yup.string().matches(/^[0-9+-\s()]*$/, 'Invalid phone number format').nullable(),
    date_of_birth: Yup.date().nullable().max(new Date(), "Date of birth cannot be in the future."),
    street_address: Yup.string().nullable(),
    city: Yup.string().nullable(),
    state_province: Yup.string().nullable(),
    postal_code: Yup.string().nullable(),
    profile_picture_url: Yup.string().url("Must be a valid URL.").nullable(),
});

const ProfileSettings = () => {
    const { dbUser, fetchDbUser } = useAuth();
    const { post: updateProfile, loading } = useApiPost('/users/me', { method: 'PUT' });

    const handleSubmit = async (values) => {
        // Filter out empty strings so the backend receives them as null
        const payload = Object.fromEntries(
            Object.entries(values).filter(([_, v]) => v !== '')
        );
        const result = await updateProfile(payload);
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
                // [THE DEFINITIVE FIX - Step 2] Add new fields to initialValues
                initialValues={{
                    email: dbUser?.email || '',
                    full_name: dbUser?.full_name || '',
                    phone_number: dbUser?.phone_number || '',
                    date_of_birth: dbUser?.date_of_birth || '',
                    street_address: dbUser?.street_address || '',
                    city: dbUser?.city || '',
                    state_province: dbUser?.state_province || '',
                    postal_code: dbUser?.postal_code || '',
                    profile_picture_url: dbUser?.profile_picture_url || '',
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values }) => (
                    <Form className="space-y-6">
                        {/* --- [THE DEFINITIVE FIX - Step 3] Add new form inputs --- */}

                        {/* Profile Picture Preview */}
                        <div className="flex items-center space-x-4">
                            <img
                                src={values.profile_picture_url || `https://ui-avatars.com/api/?name=${values.full_name || 'User'}&background=random`}
                                alt="Profile"
                                className="h-16 w-16 rounded-full object-cover bg-neutral-800"
                            />
                            <div className="flex-grow">
                                <FormInput label="Profile Picture URL" name="profile_picture_url" placeholder="https://example.com/your-image.png"/>
                            </div>
                        </div>

                        <FormInput label="Email Address" name="email" disabled />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Full Name" name="full_name" />
                            <FormInput label="Phone Number" name="phone_number" />
                        </div>

                        <FormInput label="Date of Birth" name="date_of_birth" type="date" />

                        <fieldset className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                            <legend className="text-base font-semibold text-neutral-900 dark:text-white">Address</legend>
                            <div className="space-y-4 mt-4">
                                <FormInput label="Street Address" name="street_address" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormInput label="City" name="city" />
                                    <FormInput label="State / Province" name="state_province" />
                                    <FormInput label="Postal Code" name="postal_code" />
                                </div>
                            </div>
                        </fieldset>

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
