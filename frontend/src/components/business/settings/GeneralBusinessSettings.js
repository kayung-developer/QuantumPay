// FILE: src/components/business/settings/GeneralBusinessSettings.js

import React from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

// --- Component Imports ---
import SettingsCard from '../../../components/settings/SettingsCard';
import FormInput from '../../../components/common/FormInput';
import Button from '../../../components/common/Button';

// --- Hook Imports ---
import { useAuth } from '../../../context/AuthContext';
import { useApiPost } from '../../../hooks/useApi';

// Define the validation schema for the form fields.
const BusinessProfileSchema = Yup.object().shape({
    business_name: Yup.string().min(2, 'Name is too short').required('Business name is required'),
    business_description: Yup.string().nullable(),
});

const GeneralBusinessSettings = () => {
    // Get the current user data and the function to refresh it from the global context.
    const { dbUser, fetchDbUser } = useAuth();
    
    // Setup the API hook for making the PUT request to update the profile.
    const { post: updateProfile, loading } = useApiPost('/business/profile', { method: 'PUT' });

    // This function is called when the form is submitted.
    const handleSubmit = async (values) => {
        const result = await updateProfile(values);
        if (result.success) {
            // [CRITICAL UX] After a successful update, refresh the global user state.
            // This ensures the new business name is reflected everywhere in the app.
            fetchDbUser();
        }
    };

    return (
        <SettingsCard
            title="General Settings"
            description="Update your business's public name and description."
        >
            <Formik
                // Pre-fill the form with data from the user's business profile.
                // Use optional chaining (?.) and the nullish coalescing operator (??) for safety.
                initialValues={{
                    business_name: dbUser?.business_profile?.business_name ?? '',
                    business_description: dbUser?.business_profile?.business_description ?? '',
                }}
                validationSchema={BusinessProfileSchema}
                onSubmit={handleSubmit}
                enableReinitialize // This ensures the form updates if dbUser changes.
            >
                {() => (
                    <Form className="space-y-4">
                        <FormInput 
                            label="Business Name" 
                            name="business_name" 
                        />
                        <FormInput 
                            label="Business Description" 
                            name="business_description" 
                            as="textarea" 
                            rows={3} 
                        />
                        <div className="pt-2 flex justify-end">
                            <Button type="submit" isLoading={loading}>
                                Save Changes
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </SettingsCard>
    );
};

export default GeneralBusinessSettings;