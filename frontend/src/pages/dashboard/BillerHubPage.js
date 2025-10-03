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


// --- [THE DEFINITIVE FIX - PART 1: Import All Required Icons] ---
import {
    ArrowLeftIcon,
    BoltIcon,       // Electricity
    TvIcon,         // TV
    WifiIcon,       // Internet
    DevicePhoneMobileIcon, // Mobile (replaces PhoneIcon for better representation)
    BanknotesIcon,  // Government & Financial
    AcademicCapIcon, // Education
    ShieldCheckIcon, // Insurance
    TicketIcon,     // Events
    GlobeAltIcon,   // Travel
    BuildingStorefrontIcon, // Shopping
    HeartIcon,      // Donations
    TruckIcon,      // Transport & Tolls
    TrashIcon,      // Waste & Utilities
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

// Mapping categories to icons for a professional UI
const categoryIcons = {
    // Core Utilities
    "mobile": DevicePhoneMobileIcon,
    "tv": TvIcon,
    "internet": WifiIcon,
    "electricity": BoltIcon,
    "utilities": TrashIcon, // For Water, Waste & Tolls

    // Financial
    "financial": BanknotesIcon,
    "insurance": ShieldCheckIcon,

    // Government & Education
    "govt": BanknotesIcon,
    "education": AcademicCapIcon,

    // Lifestyle & Commerce
    "travel": GlobeAltIcon,
    "shopping": BuildingStorefrontIcon,
    "donation": HeartIcon,
    "events": TicketIcon,

    // A fallback icon in case a category is not mapped
    "default": BoltIcon
};


const BillerHubPage = () => {
    // --- [THE DEFINITIVE FIX - Step 1] ---
    // All hooks are now grouped together at the top level, called unconditionally.
    const { t } = useTranslation();
    const { dbUser } = useAuth();
    const [currentStep, setCurrentStep] = useState('categories');
    const [selectedCategoryId, setSelectedCategoryId] = useState(null);
    const [selectedBiller, setSelectedBiller] = useState(null);

    const userCountryCode = dbUser?.country_code || 'NG';
    const { data: allBillers, loading: billersLoading, error, request: refetch } = useApi(`/bills/all/${userCountryCode}`);

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
    const renderContent = () => {
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
                <motion.div key={currentStep} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                    {currentStep === 'categories' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map(category => {
                                const Icon = categoryIcons[category.id.toLowerCase()] || categoryIcons["default"];
                                return (
                                <motion.button key={category.id} onClick={() => handleCategorySelect(category.id)} className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-center transition-all duration-200 hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <Icon className="h-10 w-10 mx-auto text-primary"/>
                                    <p className="mt-4 font-semibold text-white capitalize">{category.name}</p>
                                </motion.button>
                            )})}
                        </div>
                    )}
                    {currentStep === 'billers' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredBillers.map(biller => (
                                <motion.button key={biller.id} onClick={() => handleBillerSelect(biller)} className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-left transition-all duration-200 hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                    <p className="font-semibold text-white">{biller.name}</p>
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

                {currentStep === 'form' && selectedBiller ? (
                    <BillerPaymentForm
                        biller={selectedBiller}
                        onPaymentSuccess={() => resetFlow(true)}
                    />
                ) : (
                    renderContent()
                )}
            </div>
        </DashboardLayout>
    );
};

export default BillerHubPage;
