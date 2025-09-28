// FILE: src/components/business/PaymentLinkFormModal.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../../context/AuthContext';
import { useApiPost } from '../../hooks/useApi';
import Modal from '../common/Modal';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { RadioGroup } from '@headlessui/react';
import { Link } from 'react-router-dom';

const PaymentLinkFormModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth();
    const isUltimateSubscriber = hasActiveSubscription('ultimate');
    const { post: createLink, loading } = useApiPost('/business/payment-links');
    
    const [amountType, setAmountType] = useState('fixed');

    const validationSchema = Yup.object().shape({
        title: Yup.string().required(t('validation.required')),
        currency: Yup.string().required(t('validation.required')),
        amount: Yup.number().when([], {
            is: () => amountType === 'fixed',
            then: schema => schema.positive("Amount must be positive").required(t('validation.required')),
            otherwise: schema => schema.nullable(),
        }),
    });

    const handleSubmit = async (values) => {
        const payload = {
            ...values,
            is_reusable: values.is_reusable || false,
            amount: amountType === 'fixed' ? values.amount : null,
        };
        const result = await createLink(payload);
        if (result.success) {
            onSuccess();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('create_link_button')}>
            <Formik
                initialValues={{ title: '', currency: 'USD', amount: '', is_reusable: false }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue, values }) => (
                    <Form className="space-y-6">
                        <FormInput name="title" label={t('link_title_label')} />
                        
                        {/* More advanced fields gated by subscription */}
                        {isUltimateSubscriber ? (
                            <RadioGroup value={values.is_reusable} onChange={(val) => setFieldValue('is_reusable', val)}>
                                <RadioGroup.Label>{t('link_type_label')}</RadioGroup.Label>
                                {/* ... Reusable / Single Use Options ... */}
                            </RadioGroup>
                        ) : (
                           <p className="text-sm">{t('upgrade_for_reusable')} <Link to="/pricing" className="text-primary">Upgrade.</Link></p>
                        )}

                        <FormInput as="select" name="currency" label={t('link_currency_label')}>
                            <option value="USD">USD</option>
                            <option value="NGN">NGN</option>
                            <option value="KES">KES</option>
                        </FormInput>

                        <RadioGroup value={amountType} onChange={setAmountType}>
                           <RadioGroup.Label>{t('amount_type_label')}</RadioGroup.Label>
                           {/* ... Fixed / Customer Decides Options ... */}
                        </RadioGroup>
                        
                        {amountType === 'fixed' && <FormInput name="amount" label={t('link_amount_label')} type="number" />}

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={loading}>{t('create_link_button')}</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default PaymentLinkFormModal;