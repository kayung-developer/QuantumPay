// FILE: frontend/src/components/dashboard/business/IssueCardModal.js

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';
import { RadioGroup } from '@headlessui/react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

import { useAuth } from '../../../context/AuthContext';
import { useApiPost } from '../../../hooks/useApi';
import Modal from '../../common/Modal';
import FormInput from '../../common/FormInput';
import Button from '../../common/Button';

const IssueCardModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth();
    const { post: issueCard, loading } = useApiPost('/business/cards');
    const isUltimateSubscriber = hasActiveSubscription('ultimate');

    const cardTiers = [
        { name: t('card_tier_standard'), description: t('card_standard_desc'), tier: 'standard', available: true },
        { name: t('card_tier_premium'), description: t('card_premium_desc'), tier: 'premium', available: isUltimateSubscriber },
    ];

    const validationSchema = Yup.object().shape({
        assigned_user_email: Yup.string().email(t('validation.email_invalid')).required(t('validation.required')),
        monthly_limit: Yup.number().min(10, 'Limit must be at least $10').required(t('validation.required')),
        card_tier: Yup.string().required(),
    });

    const handleSubmit = async (values, { resetForm }) => {
        const payload = {
            ...values,
            monthly_limit: parseFloat(values.monthly_limit),
        };
        const result = await issueCard(payload);
        if (result.success) {
            onSuccess(result.data);
            resetForm();
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('issue_card_modal_title')} size="lg">
            <Formik
                initialValues={{ assigned_user_email: '', monthly_limit: '', card_tier: 'standard' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
            >
                {({ setFieldValue, values }) => (
                    <Form className="space-y-6">
                        <FormInput name="assigned_user_email" label="Assign to (Employee Email)" type="email" />
                        <FormInput name="monthly_limit" label="Monthly Spending Limit (USD)" type="number" />

                        <div>
                            <label className="text-sm font-medium text-neutral-900 dark:text-white">{t('card_tier_label')}</label>
                            <RadioGroup value={values.card_tier} onChange={(value) => setFieldValue('card_tier', value)} className="mt-2">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    {cardTiers.map((card) => (
                                        <RadioGroup.Option key={card.name} value={card.tier} disabled={!card.available} className={({ active, checked }) => `relative flex cursor-pointer rounded-lg border p-4 focus:outline-none ${!card.available ? 'bg-neutral-100 dark:bg-neutral-800 opacity-50' : 'bg-white dark:bg-neutral-900'} ${checked ? 'border-transparent ring-2 ring-primary' : 'border-neutral-300 dark:border-neutral-700'} ${active ? 'ring-2 ring-primary' : ''}`}>
                                            {({ checked }) => (
                                                <>
                                                    <div className="flex flex-1"><div className="flex flex-col"><RadioGroup.Label as="span" className="block text-sm font-medium text-neutral-900 dark:text-white">{card.name}</RadioGroup.Label><RadioGroup.Description as="span" className="mt-1 flex items-center text-sm text-neutral-500 dark:text-neutral-400">{card.description}</RadioGroup.Description></div></div>
                                                    {checked && <CheckCircleIcon className="h-5 w-5 text-primary" aria-hidden="true" />}
                                                </>
                                            )}
                                        </RadioGroup.Option>
                                    ))}
                                </div>
                            </RadioGroup>
                            {!isUltimateSubscriber && <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400"><Link to="/pricing" className="text-primary hover:underline">{t('upgrade_for_premium')}</Link></p>}
                        </div>

                        <div className="pt-4 flex justify-end space-x-3 border-t border-neutral-200 dark:border-neutral-800">
                           <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                           <Button type="submit" isLoading={loading}>{t('cards_issue_button')}</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default IssueCardModal;
