import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { PlusIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { toastSuccess, toastError } from 'components/common/Toast';
import IssueCardModal from '../../components/dashboard/business/IssueCardModal';
import CardDetailsModal from '../../components/dashboard/business/CardDetailsModal';
import Spinner from '../../components/common/Spinner';
import { useTranslation } from 'react-i18next';

const CardRow = ({ card, onSelectCard }) => (
    <tr className="hover:bg-neutral-800/50 cursor-pointer" onClick={() => onSelectCard(card)}>
        <td className="px-6 py-4 whitespace-nowrap">
            <div className="text-sm font-medium text-white">{card.assigned_user.full_name}</div>
            <div className="text-sm text-neutral-400">{card.assigned_user.email}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-neutral-300">
            {card.card_number}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300 capitalize">{card.card_type}</td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-300">
            ${card.current_spend.toFixed(2)} / ${card.monthly_limit.toFixed(2)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${card.is_active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                {card.is_active ? 'Active' : 'Frozen'}
            </span>
        </td>
    </tr>
);

const SkeletonRow = () => (
    <tr>
        <td className="px-6 py-4"><div className="h-4 w-32 bg-neutral-700 rounded animate-pulse" /></td>
        <td className="px-6 py-4"><div className="h-4 w-40 bg-neutral-700 rounded animate-pulse" /></td>
        <td className="px-6 py-4"><div className="h-4 w-16 bg-neutral-700 rounded animate-pulse" /></td>
        <td className="px-6 py-4"><div className="h-4 w-24 bg-neutral-700 rounded animate-pulse" /></td>
        <td className="px-6 py-4"><div className="h-5 w-16 bg-neutral-700 rounded-full inline-block animate-pulse" /></td>
    </tr>
);


const CorporateCardsPage = () => {
    // In a real system, card data would be fetched from a dedicated endpoint.
    // For now, we manage it in state after creation.
    const { t } = useTranslation();
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(false); // Simulate loading
    const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedCard, setSelectedCard] = useState(null);

    const handleCardIssued = (newCard) => {
        setCards(prev => [...prev, newCard]);
        setIsIssueModalOpen(false);
        toastSuccess(`Successfully issued a ${newCard.card_type} card to ${newCard.assigned_user.full_name}.`);
    };

    const handleSelectCard = (card) => {
        setSelectedCard(card);
        setIsDetailsModalOpen(true);
    }

    return (
        <DashboardLayout pageTitleKey="corporate_cards_title">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('corporate_cards_title')}</h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('cards_header_subtitle')}</p>
                    </div>
                    <div className="mt-4 md:mt-0">
                        <Button onClick={() => setIsIssueModalOpen(true)}>
                            <PlusIcon className="h-5 w-5 mr-2" />
                            {t('cards_issue_button')}
                        </Button>
                    </div>
                </div>

                <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-neutral-800">
                            <thead className="bg-neutral-800/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Card Holder</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Card Number</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Spend (Monthly)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-800">
                               {loading ? (
                                   Array.from({length: 3}).map((_, i) => <SkeletonRow key={i}/>)
                               ) : cards.length > 0 ? (
                                   cards.map(card => <CardRow key={card.id} card={card} onSelectCard={handleSelectCard} />)
                               ) : (
                                   <tr>
                                       <td colSpan="5" className="text-center py-12">
                                           <CreditCardIcon className="mx-auto h-10 w-10 text-neutral-500"/>
                                           <h3 className="mt-2 font-semibold text-neutral-600 dark:text-white">{t('cards_none_issued')}</h3>
                                           <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t('cards_get_started')}</p>
                                       </td>
                                   </tr>
                               )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <IssueCardModal
                isOpen={isIssueModalOpen}
                onClose={() => setIsIssueModalOpen(false)}
                onSuccess={handleCardIssued}
            />

            <CardDetailsModal
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
                card={selectedCard}
            />

        </DashboardLayout>
    );
};

export default CorporateCardsPage;