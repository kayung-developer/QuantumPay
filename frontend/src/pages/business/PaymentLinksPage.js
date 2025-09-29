// FILE: src/pages/business/PaymentLinksPage.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import UpgradePrompt from '../../components/common/UpgradePrompt';
import { LinkIcon, PlusIcon, ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// We'll create the creation modal in the same file for simplicity
import PaymentLinkFormModal from '../../components/business/PaymentLinkFormModal';

const PaymentLinksPage = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth();
    const isFeatureUnlocked = hasActiveSubscription('premium');
    
    const { data: links, loading, error, request: refetchLinks } = useApi('/business/payment-links', {}, !isFeatureUnlocked);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = () => {
        setIsModalOpen(false);
        refetchLinks();
    };

    const copyLink = (linkUrl) => {
        navigator.clipboard.writeText(linkUrl);
        toast.success("Payment link copied to clipboard!");
    };

    const renderContent = () => {
        if (!isFeatureUnlocked) {
            return <UpgradePrompt featureName="Payment Links" requiredPlan="Premium" />;
        }
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <p className="text-red-500 text-center">Could not load your payment links.</p>;
        }

        return (
            <div className="space-y-4">
                {links && links.length > 0 ? (
                    links.map(link => (
                        <div key={link.id} className="p-4 bg-white dark:bg-neutral-900 border rounded-lg flex items-center justify-between">
                            <div>
                                <p className="font-bold text-neutral-900 dark:text-white">{link.title}</p>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400 font-mono">{link.link_url}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => copyLink(link.link_url)}>
                                <ClipboardDocumentIcon className="h-5 w-5 mr-2" />
                                Copy Link
                            </Button>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-12 border-2 border-dashed rounded-lg">
                        <p>Create your first payment link to get paid easily.</p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="payment_links_title">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white flex items-center">
                        <LinkIcon className="h-8 w-8 mr-3 text-primary"/>
                        {t('payment_links_title')}
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                        {t('payment_links_subtitle')}
                    </p>
                </div>
                {isFeatureUnlocked && (
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        {t('create_link_button')}
                    </Button>
                )}
            </div>
            {renderContent()}
            
            <PaymentLinkFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </DashboardLayout>
    );
};

export default PaymentLinksPage;