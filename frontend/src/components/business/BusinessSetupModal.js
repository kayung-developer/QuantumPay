// FILE: src/components/business/BusinessSetupModal.js

import React from 'react';
import Modal from '../common/Modal';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Button from '../common/Button';
import FormInput from '../common/FormInput';
import { useApiPost } from '../../hooks/useApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next'; // <-- Import the hook

const BusinessSetupModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation(); // <-- Initialize the hook
    const { post: setupBusiness, loading } = useApiPost('/business/setup');

    // [I18N] Update validation messages to use the translation function
    const BusinessSetupSchema = Yup.object().shape({
        business_name: Yup.string().min(3, t('validation.too_short')).required(t('validation.required')),
        bvn: Yup.string().matches(/^[0-9]{11}$/, t('validation.bvn_invalid')).required(t('validation.required')),
        nin: Yup.string().matches(/^[0-9]{11}$/, t('validation.nin_invalid')).nullable(),
        monnify_contract_code: Yup.string().required(t('validation.required')),
    });
    // Note: You will need to add the 'validation.*' keys to your i18n.js file as well for this to be fully translated.

    const handleSubmit = async (values) => {
        const result = await setupBusiness(values);
        if (result.success) {
            toast.success(t('setup_business_success')); // <-- Use translated toast
            onSuccess();
        }
    };

    return (
        // [THEME-AWARE] The Modal component is already theme-aware.
        <Modal isOpen={isOpen} onClose={onClose} title={t('setup_business_title')} size="lg">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6">
                {t('setup_business_subtitle')}
            </p>
            <Formik
                initialValues={{
                    business_name: '',
                    bvn: '',
                    nin: '',
                    monnify_contract_code: '',
                }}
                validationSchema={BusinessSetupSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-4">
                        {/* [THEME-AWARE & I18N] Using the FormInput component which is already theme-aware
                            and passing translated labels and placeholders. */}
                        <FormInput
                            label={t('business_name_label')}
                            name="business_name"
                            placeholder="Your Company LTD"
                        />
                        <FormInput
                            label={t('bvn_label')}
                            name="bvn"
                            placeholder="11-digit BVN"
                        />
                        <FormInput
                            label={`${t('nin_label')} (Optional)`}
                            name="nin"
                            placeholder="11-digit NIN"
                        />
                        <FormInput
                            label={t('monnify_code_label')}
                            name="monnify_contract_code"
                            placeholder="Your Monnify contract code"
                        />
                        
                        <div className="pt-4 flex justify-end border-t border-neutral-200 dark:border-neutral-800">
                            {/* [THEME-AWARE & I18N] The Button component is already theme-aware. */}
                            <Button type="submit" isLoading={loading}>
                                {t('create_profile_button')}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default BusinessSetupModal;
