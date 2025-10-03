// FILE: src/components/settings/ProfileSettings.js

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-hot-toast';

import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import SettingsCard from './SettingsCard';
import allCountries from '../../utils/countries.json'; // Assuming you have this file from previous steps

// [THE DEFINITIVE FIX - Step 1] A complete validation schema for the new fields.
const ProfileSchema = Yup.object().shape({
    full_name: Yup.string().min(2, 'Name is too short').required('Full name is required'),
    phone_number: Yup.string().matches(/^[0-9+-\s()]*$/, 'Invalid phone number format').nullable(),
    date_of_birth: Yup.date().nullable().max(new Date(), "Date of birth cannot be in the future."),
    street_address: Yup.string().nullable(),
    city: Yup.string().nullable(),
    state_province: Yup.string().nullable(),
    postal_code: Yup.string().nullable(),
    country_code: Yup.string().length(2, "Invalid country code").nullable(),
    profile_picture_url: Yup.string().url("Must be a valid URL.").nullable(),
});

const ProfileSettings = () => {
    const { dbUser, fetchDbUser } = useAuth();
    const { post: updateProfile, loading } = useApiPost('/users/me', { method: 'PUT' });

    const handleSubmit = async (values) => {
        // Filter out any fields that haven't changed to send a smaller payload.
        const changedValues = {};
        for (const key in values) {
            if (values[key] !== (dbUser?.[key] || '')) {
                changedValues[key] = values[key];
            }
        }

        // Ensure email is not part of the payload
        delete changedValues.email;

        if (Object.keys(changedValues).length === 0) {
            toast.success("No changes to save.");
            return;
        }

        const result = await updateProfile(changedValues);
        if (result.success) {
            // [THE DEFINITIVE FIX - Step 2] Fetch the user to update the global state.
            toast.success("Profile updated successfully!");
            fetchDbUser(); // This will update the name in the sidebar and everywhere else.
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
                    date_of_birth: dbUser?.date_of_birth || '',
                    street_address: dbUser?.street_address || '',
                    city: dbUser?.city || '',
                    state_province: dbUser?.state_province || '',
                    postal_code: dbUser?.postal_code || '',
                    country_code: dbUser?.country_code || '',
                    profile_picture_url: dbUser?.profile_picture_url || '',
                }}
                validationSchema={ProfileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, dirty }) => (
                    <Form className="space-y-6">
                        {/* [THE DEFINITIVE FIX - Step 3] A complete and well-designed form layout. */}

                        <fieldset>
                            <legend className="text-base font-semibold text-neutral-900 dark:text-white">Profile</legend>
                            <div className="mt-4 flex items-center space-x-4">
                                <img
                                    src={values.profile_picture_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(values.full_name || 'U')}&background=random`}
                                    alt="Profile"
                                    className="h-20 w-20 rounded-full object-cover bg-neutral-800"
                                />
                                <div className="flex-grow">
                                    <FormInput label="Profile Picture URL" name="profile_picture_url" placeholder="https://..." />
                                </div>
                            </div>
                        </fieldset>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Email Address" name="email" disabled />
                            <FormInput label="Full Name" name="full_name" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormInput label="Phone Number" name="phone_number" />
                            <FormInput label="Date of Birth" name="date_of_birth" type="date" />
                        </div>

                        <fieldset className="border-t border-neutral-200 dark:border-neutral-800 pt-6">
                            <legend className="text-base font-semibold text-neutral-900 dark:text-white">Address</legend>
                            <div className="space-y-4 mt-4">
                                <FormInput label="Street Address" name="street_address" />
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <FormInput label="City" name="city" />
                                    <FormInput label="State / Province" name="state_province" />
                                    <FormInput label="Postal Code" name="postal_code" />
                                </div>
                                <div>
                                    <label htmlFor="country_code" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Country</label>
                                    <Field as="select" name="country_code" id="country_code" className="w-full bg-neutral-100 dark:bg-neutral-800 p-2 rounded-md border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white">
                                        <option value="">Select a country...</option>
                                        {allCountries.map(country => <option key={country.code} value={country.code}>{country.name}</option>)}
                                    </Field>
                                </div>
                            </div>
                        </fieldset>

                        {dirty && (
                            <div className="pt-2 flex justify-end">
                                <Button type="submit" isLoading={loading}>Save Changes</Button>
                            </div>
                        )}
                    </Form>
                )}
            </Formik>
        </SettingsCard>
    );
};

export default ProfileSettings;
