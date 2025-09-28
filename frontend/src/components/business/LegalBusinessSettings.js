import React from 'react';
import SettingsCard from '../settings/SettingsCard';
import { useAuth } from '../../context/AuthContext';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';

const LegalInfoSchema = Yup.object().shape({
    cac_rc_number: Yup.string().matches(/^(RC|BN)\d+$/, 'Enter a valid CAC/BN number (e.g., RC12345)').required('CAC/RC number is required'),
    tin_number: Yup.string().matches(/^\d{8}-\d{4}$/, 'Enter a valid TIN (e.g., 12345678-0001)').required('Tax ID Number is required'),
});

const LegalBusinessSettings = () => {
    const { dbUser, fetchDbUser } = useAuth();
    const { post: updateLegalInfo, loading } = useApiPost('/business/legal-info', { method: 'PUT' });

    const handleSubmit = async (values) => {
        const result = await updateLegalInfo(values);
        if (result.success) {
            fetchDbUser(); // Refresh global state to get verification status
        }
    };

    const business = dbUser?.business_profile;

    if (business?.is_cac_verified) {
        return (
            <SettingsCard title="Legal Information">
                <div className="text-center p-8">
                    <CheckBadgeIcon className="h-16 w-16 mx-auto text-green-500"/>
                    <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">Business Verified</h3>
                    <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                        Your business, {business.business_name}, has been successfully verified.
                    </p>
                    <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-500">CAC: {business.cac_rc_number}</p>
                </div>
            </SettingsCard>
        );
    }

    return (
        <SettingsCard
            title="Legal Information"
            description="Provide your official business registration details to get verified and unlock higher limits."
        >
            <Formik
                initialValues={{
                    cac_rc_number: business?.cac_rc_number || '',
                    tin_number: business?.tin_number || '',
                }}
                validationSchema={LegalInfoSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {() => (
                    <Form className="space-y-4">
                        <FormInput label="CAC Registration Number (RC/BN)" name="cac_rc_number" />
                        <FormInput label="Tax Identification Number (TIN)" name="tin_number" />
                        <div className="pt-2 flex justify-end">
                            <Button type="submit" isLoading={loading}>Save & Verify</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </SettingsCard>
    );
};

export default LegalBusinessSettings;