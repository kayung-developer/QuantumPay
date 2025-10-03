// FILE: src/pages/dashboard/BillerHubPage.js

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApi } from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import BillerPaymentForm from '../../components/dashboard/biller/BillerPaymentForm';
import Button from '../../components/common/Button';
import { useAuth } from '../../context/AuthContext';

// --- Icon Imports ---
import { ArrowLeftIcon, BoltIcon, TvIcon, WifiIcon, PhoneIcon, BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Mapping categories to icons for a professional UI
const categoryIcons = {
    airtime: PhoneIcon,
    tv: TvIcon,
    electricity: BoltIcon,
    internet: WifiIcon,
    government: BanknotesIcon,
    // Add more mappings as your backend catalog grows
};

const BillerHubPage = () => {
    const { t } = useTranslation();
    const { dbUser } = useAuth()
    const [currentStep, setCurrentStep] = useState('categories'); // 'categories', 'billers', 'form'
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedBiller, setSelectedBiller] = useState(null);

    // [THE FIX] Fetch the single, unified list of all billers from the new endpoint.
    // Also, destructure the `request` function and rename it to `refetch` for clarity.
    const countryCode = dbUser?.country_code || 'NG';
    const { data: allBillers, loading: billersLoading, error, request: refetch } = useApi('/bills/all/NG'); // Assuming NG for now

    // Derive the list of unique categories from the fetched biller data using useMemo for performance.
    const categories = useMemo(() => {
        if (!allBillers) return [];
        const categoryMap = new Map();
        allBillers.forEach(biller => {
            // Defensive check for biller.category
            if (biller.category && biller.category.id && !categoryMap.has(biller.category.id)) {
                categoryMap.set(biller.category.id, {
                    id: biller.category.id,
                    name: biller.category.name.replace(/_/g, ' '),
                });
            }
        });
        return Array.from(categoryMap.values());
    }, [allBillers]);

    // Filter the list of billers based on the user's selected category ID.
    const filteredBillers = useMemo(() => {
        if (!allBillers || !selectedCategoryId) return [];
        return allBillers.filter(b => b.category_id === selectedCategoryId);
    }, [allBillers, selectedCategoryId]);

    if (selectedBiller) {
        return (
            <DashboardLayout pageTitleKey="pay_bills_title">
                <div className="max-w-2xl mx-auto">
                    <Button onClick={() => setSelectedBiller(null)} variant="link" className="mb-4">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Billers
                    </Button>
                    <BillerPaymentForm
                        biller={selectedBiller}
                        onPaymentSuccess={() => {
                            refetch();
                            setSelectedBiller(null);
                        }}
                    />
                </div>
            </DashboardLayout>
        );
    }


    const handleCategorySelect = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setCurrentStep('billers');
    };

    const handleBillerSelect = (biller) => {
        setSelectedBiller(biller);
        setCurrentStep('form');
    };

    const resetFlow = (isSuccess = false) => {
        if (isSuccess) {
            refetch(); // Refetch data on success in case balances or options changed
        }
        setCurrentStep('categories');
        setSelectedCategoryId(null);
        setSelectedBiller(null);
    };
    
    const pageTitle = useMemo(() => {
        switch (currentStep) {
            case 'billers':
                const category = categories.find(c => c.id === selectedCategoryId);
                return `Select a Biller in ${category?.name || ''}`;
            case 'form':
                return `Pay ${selectedBiller?.name || 'Bill'}`;
            default:
                return 'Select a Category';
        }
    }, [currentStep, selectedCategoryId, selectedBiller, categories]);


    const renderContent = () => {
        if (billersLoading) return <div className="flex justify-center p-10"><Spinner size="lg"/></div>;
        if (error) {
            return (
                <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-lg">
                    <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-red-400" />
                    <h3 className="mt-4 text-xl font-semibold text-white">Could Not Load Biller Options</h3>
                    <p className="mt-2 text-red-300">There was a problem connecting to our payment services.</p>
                    {/* [THE BUG FIX] The onClick now correctly calls the refetch function from the useApi hook. */}
                    <Button onClick={() => refetch()} className="mt-6" variant="secondary">Try Again</Button>
                </div>
            );
        }
    };
        return (
        <DashboardLayout pageTitleKey="pay_bills_title">
             <div className="max-w-4xl mx-auto">
                 <div className="flex items-center mb-6">
                    {currentStep !== 'categories' && (
                        <motion.button onClick={() => resetFlow()} className="mr-4 p-2 rounded-full hover:bg-neutral-800">
                            <ArrowLeftIcon className="h-6 w-6 text-neutral-300"/>
                        </motion.button>
                    )}
                    <h1 className="text-2xl font-bold font-display text-white">
                        {pageTitle}
                    </h1>
                </div>

                {/* Conditionally render the form OR the selection lists */}
                {currentStep === 'form' && selectedBiller ? (
                    <BillerPaymentForm
                        biller={selectedBiller}
                        onPaymentSuccess={() => resetFlow(true)}
                    />
                ) : (
                    renderContent() // renderContent now only handles categories/billers
                )}
            </div>
        </DashboardLayout>
    );
};

export default BillerHubPage;

