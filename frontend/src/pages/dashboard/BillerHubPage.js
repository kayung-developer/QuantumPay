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
    // --- [THE DEFINITIVE FIX - Step 1] ---
    // All hooks are now grouped together at the top level, called unconditionally.
    const { t } = useTranslation();
    const { dbUser } = useAuth();
    const [currentStep, setCurrentStep] = useState('categories');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedBiller, setSelectedBiller] = useState(null);

    const countryCode = dbUser?.country_code || 'NG';
    const { data: allBillers, loading: billersLoading, error, request: refetch } = useApi(`/bills/all/${countryCode}`);

    const categories = useMemo(() => {
        if (!allBillers) return [];
        const categoryMap = new Map();
        allBillers.forEach(biller => {
            if (biller.category && biller.category.id && !categoryMap.has(biller.category.id)) {
                categoryMap.set(biller.category.id, {
                    id: biller.category.id,
                    name: biller.category.name.replace(/_/g, ' '),
                });
            }
        });
        return Array.from(categoryMap.values());
    }, [allBillers]);

    const filteredBillers = useMemo(() => {
        if (!allBillers || !selectedCategoryId) return [];
        // This was also a subtle bug. It should filter on the nested category object.
        return allBillers.filter(b => b.category?.id === selectedCategoryId);
    }, [allBillers, selectedCategoryId]);

    const pageTitle = useMemo(() => {
        // This hook is now called before any conditional returns.
        if (currentStep === 'billers') {
            const category = categories.find(c => c.id === selectedCategoryId);
            return `Select a Biller in ${category?.name || ''}`;
        }
        if (currentStep === 'form' && selectedBiller) {
            return `Pay ${selectedBiller?.name || 'Bill'}`;
        }
        return 'Select a Category';
    }, [currentStep, selectedCategoryId, selectedBiller, categories]);

    // --- Event Handlers (no changes needed) ---
    const handleCategorySelect = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setCurrentStep('billers');
    };

    const handleBillerSelect = (biller) => {
        setSelectedBiller(biller);
        setCurrentStep('form');
    };

    const resetFlow = (isSuccess = false) => {
        if (isSuccess) refetch();
        setCurrentStep('categories');
        setSelectedCategoryId(null);
        setSelectedBiller(null);
    };

    // --- Render Logic ---
    const renderSelectionContent = () => {
        if (billersLoading) return <div className="flex justify-center p-10"><Spinner size="lg"/></div>;
        if (error) {
            return (
                <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-lg">
                    <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-red-400" />
                    <h3 className="mt-4 text-xl font-semibold text-white">Could Not Load Biller Options</h3>
                    <p className="mt-2 text-red-300">There was a problem connecting to our payment services.</p>
                    <Button onClick={() => refetch()} className="mt-6" variant="secondary">Try Again</Button>
                </div>
            );
        }

        return (
            <AnimatePresence mode="wait">
                <motion.div key={currentStep} /* ... animation props ... */>
                    {currentStep === 'categories' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map(category => (
                                <motion.button key={category.id} onClick={() => handleCategorySelect(category.id)} /* ... */ >
                                    {/* ... category button JSX ... */}
                                </motion.button>
                            ))}
                        </div>
                    )}
                    {currentStep === 'billers' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredBillers.map(biller => (
                                <motion.button key={biller.id} onClick={() => handleBillerSelect(biller)} /* ... */>
                                    <p className="font-semibold text-neutral-800 dark:text-white">{biller.name}</p>
                                    <p className="text-xs text-neutral-500">via {biller.provider_mappings[0].provider_name}</p>
                                </motion.button>
                            ))}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        );
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
                
                {selectedBiller ? (
                    <BillerPaymentForm 
                        biller={selectedBiller} 
                        onPaymentSuccess={() => resetFlow(true)} 
                    />
                ) : (
                    renderSelectionContent()
                )}
            </div>
        </DashboardLayout>
    );
};

export default BillerHubPage;
