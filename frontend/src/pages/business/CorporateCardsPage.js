// FILE: frontend/src/pages/business/CorporateCardsPage.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// --- Icon Imports ---
import { PlusIcon, WifiIcon, StarIcon } from '@heroicons/react/24/solid';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApi } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import CardDetailsModal from '../../components/dashboard/business/CardDetailsModal';
import IssueCardModal from '../../components/dashboard/business/IssueCardModal'; // <-- Use the new, clean modal

// --- The New, Awesome Card Component ---
const CardDisplay = ({ card, onClick }) => {
    const isPremium = card.card_tier === 'premium';
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ scale: 1.03, y: -5 }}
            transition={{ type: 'spring', stiffness: 300 }}
            onClick={() => onClick(card)}
            className={`w-full max-w-sm mx-auto p-6 rounded-2xl text-white shadow-2xl cursor-pointer ${isPremium ? 'from-neutral-800 to-black bg-gradient-to-br' : 'from-primary to-blue-600 bg-gradient-to-br'}`}
        >
            <div className="flex justify-between items-start">
                <span className="font-display font-bold text-xl">QuantumPay</span>
                <div className="flex items-center space-x-2">
                    {isPremium && <StarIcon className="h-6 w-6 text-amber-400" />}
                    <WifiIcon className="h-6 w-6" />
                </div>
            </div>
            <div className="mt-8">
                <p className="font-mono text-xl tracking-widest">{card.card_number}</p>
            </div>
            <div className="mt-6 flex justify-between items-end">
                <div>
                    <p className="text-xs opacity-70">Card Holder</p>
                    <p className="font-medium truncate">{card.assigned_user.full_name}</p>
                </div>
                <div>
                    <p className="text-xs opacity-70">Expires</p>
                    <p className="font-medium">{card.expiry_date}</p>
                </div>
            </div>
        </motion.div>
    );
};


// --- The Main Page Component ---
const CorporateCardsPage = () => {
    const { t } = useTranslation();
    const { data: cards, loading, error, request: refetchCards } = useApi('/business/cards');
    const [isIssueModalOpen, setIssueModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const handleSuccess = (newCard) => {
        setIssueModalOpen(false);
        refetchCards();
        toast.success(`New card issued to ${newCard.assigned_user.full_name}!`);
    };

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const renderContent = () => {
        if (loading) return <div className="text-center p-8"><Spinner /></div>;
        if (error) return <p className="text-red-400 text-center p-8">Could not load corporate cards. Error: {error.message}</p>;
        if (!cards || cards.length === 0) {
            return (
                <div className="text-center py-20 border-2 border-dashed border-neutral-700 rounded-lg">
                    <p className="font-semibold text-neutral-600 dark:text-neutral-400">{t('cards_none_issued')}</p>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">{t('cards_get_started')}</p>
                </div>
            );
        }

        return (
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {cards.map(card => (
                    <CardDisplay key={card.id} card={card} onClick={setSelectedCard} />
                ))}
            </motion.div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="corporate_cards_title">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('corporate_cards_title')}</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('cards_header_subtitle')}</p>
                </div>
                <Button onClick={() => setIssueModalOpen(true)}>
                    <PlusIcon className="h-5 w-5 mr-2" />
                    {t('cards_issue_button')}
                </Button>
            </div>

            {renderContent()}

            <IssueCardModal isOpen={isIssueModalOpen} onClose={() => setIssueModalOpen(false)} onSuccess={handleSuccess} />
            <CardDetailsModal isOpen={!!selectedCard} onClose={() => setSelectedCard(null)} card={selectedCard} />
        </DashboardLayout>
    );
};

export default CorporateCardsPage;
