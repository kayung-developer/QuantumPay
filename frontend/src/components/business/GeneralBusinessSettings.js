import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import SettingsCard from '../settings/SettingsCard'; // Reusing our card component

const BusinessProfileSchema = Yup.object().shape({
    business_name: Yup.string().min(2, 'Name is too short').required('Business name is required'),
    business_description: Yup.string().nullable(),
});

const GeneralBusinessSettings = () => {
    const { dbUser, fetchDbUser } = useAuth();
    const { post: updateProfile, loading } = useApiPost('/business/profile', { method: 'PUT' });

    const handleSubmit = async (values) => {
        const result = await updateProfile(values);
        if (result.success) {
            fetchDbUser(); // Refresh global state to get the new business name
        }
    };

    return (
        <SettingsCard
            title="General Settings"
            description="Update your business's public name and description."
        >
            <Formik
                initialValues={{
                    business_name: dbUser?.business_profile?.business_name || '',
                    business_description: dbUser?.business_profile?.business_description || '',
                }}
                validationSchema={BusinessProfileSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {() => (
                    <Form className="space-y-4">
                        <FormInput label="Business Name" name="business_name" />
                        <FormInput label="Business Description" name="business_description" as="textarea" rows={3} />
                        <div className="pt-2 flex justify-end">
                            <Button type="submit" isLoading={loading}>Save Changes</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </SettingsCard>
    );
};

export default GeneralBusinessSettings;