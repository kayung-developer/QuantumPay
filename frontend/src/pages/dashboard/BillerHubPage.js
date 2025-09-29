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
    const [currentStep, setCurrentStep] = useState('categories'); // 'categories', 'billers', 'form'
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedBiller, setSelectedBiller] = useState(null);

    // [THE FIX] Fetch the single, unified list of all billers from the new endpoint.
    // Also, destructure the `request` function and rename it to `refetch` for clarity.
    const { data: allBillers, loading: billersLoading, error, request: refetch } = useApi('/bills/all/NG'); // Assuming NG for now

    // Derive the list of unique categories from the fetched biller data using useMemo for performance.
    const categories = useMemo(() => {
        if (!allBillers) return [];
        const categoryMap = new Map();
        allBillers.forEach(biller => {
            const categoryName = biller.category?.name || 'Uncategorized';
            if (!categoryMap.has(biller.category_id)) {
                categoryMap.set(biller.category_id, {
                    id: biller.category_id,
                    name: categoryName.replace(/_/g, ' '),
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

        return (
            <AnimatePresence mode="wait">
                <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                    {currentStep === 'categories' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map(category => {
                                const Icon = categoryIcons[category.id.toLowerCase()] || BoltIcon;
                                return (
                                <motion.button key={category.id} onClick={() => handleCategorySelect(category.id)} className="p-6 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center transition-all duration-200 hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Icon className="h-10 w-10 mx-auto text-primary"/>
                                    <p className="mt-4 font-semibold text-neutral-800 dark:text-white capitalize">{category.name}</p>
                                </motion.button>
                            )})}
                        </div>
                    )}
                    {currentStep === 'billers' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredBillers.map(biller => (
                                <motion.button key={biller.id} onClick={() => handleBillerSelect(biller)} className="p-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-left transition-all duration-200 hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <p className="font-semibold text-neutral-800 dark:text-white">{biller.name}</p>
                                    <p className="text-xs text-neutral-500">via {biller.provider_mappings[0].provider_name}</p>
                                </motion.button>
                            ))}
                        </div>
                    )}
                    {currentStep === 'form' && selectedBiller && <BillerPaymentForm biller={selectedBiller} onPaymentSuccess={() => resetFlow(true)} />}
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <DashboardLayout pageTitleKey="pay_bills_title">
             <div className="max-w-4xl mx-auto">
                 <div className="flex items-center mb-6">
                    {currentStep !== 'categories' && (
                        <motion.button onClick={() => resetFlow()} className="mr-4 p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}>
                            <ArrowLeftIcon className="h-6 w-6 text-neutral-600 dark:text-neutral-300"/>
                        </motion.button>
                    )}
                    <h1 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">
                        {pageTitle}
                    </h1>
                </div>
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default BillerHubPage;