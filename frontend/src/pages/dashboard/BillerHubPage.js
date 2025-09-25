import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, BoltIcon, TvIcon, WifiIcon, PhoneIcon, BanknotesIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'; // Correctly import ExclamationTriangleIcon
import Spinner from '../../components/common/Spinner';
import BillerPaymentForm from '../../components/dashboard/biller/BillerPaymentForm';
import Button from '../../components/common/Button'; // Corrected import path

// Mapping categories to icons for a professional UI
const categoryIcons = {
    airtime: PhoneIcon,
    tv: TvIcon,
    electricity: BoltIcon,
    internet: WifiIcon,
    government: BanknotesIcon,
};

const BillerHubPage = () => {
    // Manages the three steps of the user flow
    const [currentStep, setCurrentStep] = useState('categories'); // 'categories', 'billers', 'form'
    const [selectedCategoryId, setSelectedCategoryId] = useState(null); // Use a simple string ID for state
    const [selectedBiller, setSelectedBiller] = useState(null);

    // Fetch the single, unified list of all billers from all providers
    // [FIX] Destructure the `refetch` function from the useApi hook
    const { data: allBillers, loading: billersLoading, error, request: refetch } = useApi('/bills/all');

    // Derive the list of unique categories from the fetched biller data
    const categories = useMemo(() => {
        if (!allBillers) return [];
        const categoryMap = new Map();
        allBillers.forEach(biller => {
            if (!categoryMap.has(biller.category)) {
                categoryMap.set(biller.category, {
                    id: biller.category,
                    name: biller.category.replace(/_/g, ' '),
                });
            }
        });
        return Array.from(categoryMap.values());
    }, [allBillers]);

    // Filter the list of billers based on the user's selected category ID
    const filteredBillers = useMemo(() => {
        if (!allBillers || !selectedCategoryId) return [];
        return allBillers.filter(b => b.category === selectedCategoryId);
    }, [allBillers, selectedCategoryId]);

    const selectedCategoryName = useMemo(() => {
        if(!selectedCategoryId || !categories) return '';
        return categories.find(c => c.id === selectedCategoryId)?.name || '';
    }, [categories, selectedCategoryId]);

    const handleCategorySelect = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setCurrentStep('billers');
    };

    const handleBillerSelect = (biller) => {
        setSelectedBiller(biller);
        setCurrentStep('form');
    };

    const resetFlow = () => {
        setCurrentStep('categories');
        setSelectedCategoryId(null);
        setSelectedBiller(null);
    };

    const renderContent = () => {
        if (billersLoading) {
            return <div className="flex justify-center p-10"><Spinner size="lg"/></div>;
        }

        if (error) {
            return (
                <div className="text-center p-8 bg-red-900/50 border border-red-700 rounded-lg">
                    <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-red-400" />
                    <h3 className="mt-4 text-xl font-semibold text-white">Could Not Load Biller Options</h3>
                    <p className="mt-2 text-red-300">There was a problem connecting to our payment services. Please check your internet connection.</p>
                    <p className="mt-1 text-xs text-red-500">Error: {error.message}</p>
                    {/* [FIX] The onClick now correctly calls the refetch function */}
                    <Button onClick={refetch} className="mt-6" variant="secondary">Try Again</Button>
                </div>
            );
        }

        if (!allBillers || allBillers.length === 0) {
            return (
                <div className="text-center p-8 bg-neutral-800 border border-neutral-700 rounded-lg">
                    <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-yellow-400" />
                    <h3 className="mt-4 text-xl font-semibold text-white">Services Temporarily Unavailable</h3>
                    <p className="mt-2 text-neutral-300">We are currently unable to retrieve the list of billers. Please try again in a few moments.</p>
                    <Button onClick={refetch} className="mt-6" variant="secondary">Refresh</Button>
                </div>
            );
        }

        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                >
                    {currentStep === 'categories' && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {categories.map(category => {
                                // [FIX] Use category.id and category.name correctly
                                const Icon = categoryIcons[category.id.toLowerCase()] || BoltIcon;
                                return (
                                <motion.button
                                    key={category.id}
                                    onClick={() => handleCategorySelect(category.id)}
                                    className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-center transition-all duration-200 hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icon className="h-10 w-10 mx-auto text-primary"/>
                                    <p className="mt-4 font-semibold text-white capitalize">{category.name}</p>
                                </motion.button>
                            )})}
                        </div>
                    )}

                    {currentStep === 'billers' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredBillers.map(biller => (
                                <motion.button
                                    key={biller.id}
                                    onClick={() => handleBillerSelect(biller)}
                                    className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-left transition-all duration-200 hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <p className="font-semibold text-white">{biller.name}</p>
                                    <p className="text-xs text-neutral-500">via {biller.provider}</p>
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {currentStep === 'form' && selectedBiller && (
                        <BillerPaymentForm biller={selectedBiller} onPaymentSuccess={resetFlow} />
                    )}
                </motion.div>
            </AnimatePresence>
        );
    }

    return (
        <DashboardLayout pageTitle="Pay Bills & Utilities">
             <div className="max-w-4xl mx-auto">
                 <div className="flex items-center mb-6">
                    {currentStep !== 'categories' && (
                        <motion.button
                            onClick={resetFlow}
                            className="mr-4 p-2 rounded-full hover:bg-neutral-800"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <ArrowLeftIcon className="h-6 w-6 text-neutral-300"/>
                        </motion.button>
                    )}
                    <h1 className="text-2xl font-bold font-display text-neutral-600 dark:text-white">
                        {/* [FIX] Use the derived selectedCategoryName for a clean title */}
                        {{
                            categories: "Select a Category",
                            billers: `Select a Biller in ${selectedCategoryName}`,
                            form: `Pay ${selectedBiller?.name}`
                        }[currentStep]}
                    </h1>
                </div>
                {renderContent()}
            </div>
        </DashboardLayout>
    );
};

export default BillerHubPage;