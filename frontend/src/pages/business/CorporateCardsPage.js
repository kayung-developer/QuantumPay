// FILE: src/pages/business/CorporateCardsPage.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { RadioGroup } from '@headlessui/react';
import { StarIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApi, useApiPost } from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../../components/common/FormInput';
import CardDetailsModal from '../../components/dashboard/business/CardDetailsModal';


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

    const handleSubmit = async (values) => {
        // [THE DEFINITIVE FIX]
        // 1. Convert monthly_limit from a string to a number.
        // 2. Use the correct 'card_type' from the form values (which is already lowercase 'virtual').
        const payload = {
            ...values,
            monthly_limit: parseFloat(values.monthly_limit),
            card_type: values.card_type || 'virtual' // Ensure it sends the correct lowercase value
        };
        const result = await issueCard(payload);
        if (result.success) onSuccess();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={t('issue_card_modal_title')} size="lg">
            <Formik initialValues={{ assigned_user_email: '', monthly_limit: '', card_tier: 'standard' }} validationSchema={validationSchema} onSubmit={handleSubmit}>
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

                        <div className="pt-4 flex justify-end"><Button type="submit" isLoading={loading}>{t('cards_issue_button')}</Button></div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

const CorporateCardsPage = () => {
    const { t } = useTranslation();
    const { data: cards, loading, error, request: refetchCards } = useApi('/business/cards');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);
    
    const handleSuccess = () => {
        setIsModalOpen(false);
        refetchCards();
    };

    const renderContent = () => {
        if (loading) return <div className="text-center p-8"><Spinner /></div>;
        if (error) return <p className="text-red-400 text-center p-8">Could not load corporate cards.</p>;
        if (!cards || cards.length === 0) return <div className="text-center p-12 border-2 border-dashed rounded-lg"><p>{t('cards_none_issued')}</p><p className="text-sm text-neutral-500">{t('cards_get_started')}</p></div>;

        return (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cards.map(card => (
                    <button key={card.id} onClick={() => setSelectedCard(card)} className="text-left">
                        <div className={`p-6 rounded-xl shadow-md transition-transform hover:-translate-y-1 ${card.card_tier === 'premium' ? 'bg-gradient-to-br from-neutral-800 to-black text-white' : 'bg-white dark:bg-neutral-900'}`}>
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm opacity-70">{card.assigned_user.full_name}</p>
                                    <p className="font-mono text-lg tracking-wider mt-2">{card.card_number}</p>
                                </div>
                                {card.card_tier === 'premium' && <StarIcon className="h-5 w-5 text-amber-400" />}
                            </div>
                            <div className="flex justify-between items-end mt-4">
                                <div><p className="text-xs opacity-70">Expires</p><p className="font-mono">{card.expiry_date}</p></div>
                                <p className={`font-bold text-xl ${card.card_tier === 'premium' ? 'text-white' : 'text-neutral-900 dark:text-white'}`}>{card.card_type}</p>
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="corporate_cards_title">
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('corporate_cards_title')}</h1><p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('cards_header_subtitle')}</p></div>
                <Button onClick={() => setIsModalOpen(true)}>{t('cards_issue_button')}</Button>
            </div>
            
            {renderContent()}

            <IssueCardModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={handleSuccess} />
            <CardDetailsModal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} card={selectedCard} />
        </DashboardLayout>
    );
};

export default CorporateCardsPage;
