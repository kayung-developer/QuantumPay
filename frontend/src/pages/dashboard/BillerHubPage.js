import React, { useState, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, BoltIcon, TvIcon, WifiIcon, PhoneIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import Spinner from '../../components/common/Spinner';
import BillerPaymentForm from '../../components/dashboard/biller/BillerPaymentForm';

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
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedBiller, setSelectedBiller] = useState(null);

    // Fetch the single, unified list of all billers from all providers
    const { data: allBillers, loading: billersLoading, error } = useApi('/bills/all');

    // Derive the list of unique categories from the fetched biller data
    const categories = useMemo(() => {
        if (!allBillers) return [];
        const categorySet = new Set(allBillers.map(b => b.category));
        return Array.from(categorySet);
    }, [allBillers]);

    // Filter the list of billers based on the user's selected category
    const filteredBillers = useMemo(() => {
        if (!allBillers || !selectedCategory) return [];
        return allBillers.filter(b => b.category === selectedCategory);
    }, [allBillers, selectedCategory]);

    const handleCategorySelect = (category) => {
        setSelectedCategory(category);
        setCurrentStep('billers');
    };

    const handleBillerSelect = (biller) => {
        setSelectedBiller(biller);
        setCurrentStep('form');
    };

    const resetFlow = () => {
        setCurrentStep('categories');
        setSelectedCategory(null);
        setSelectedBiller(null);
    };

    const renderContent = () => {
        if (billersLoading) {
            return (
                <div className="flex justify-center items-center h-64">
                    <Spinner size="lg" />
                    <p className="ml-4 text-neutral-400">Loading payment options...</p>
                </div>
            );
        }
        if (error) {
            return <p className="text-center text-red-400 p-8">Could not load bill payment options. Please check your connection and try again later.</p>;
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
                                const Icon = categoryIcons[category.toLowerCase()] || BoltIcon;
                                return (
                                <motion.button
                                    key={category}
                                    onClick={() => handleCategorySelect(category)}
                                    className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg text-center transition-all duration-200 hover:border-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    <Icon className="h-10 w-10 mx-auto text-primary"/>
                                    <p className="mt-4 font-semibold text-white capitalize">{category}</p>
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
                    <h1 className="text-2xl font-bold font-display text-white capitalize">
                        {{
                            categories: "Select a Category",
                            billers: `Select a Biller in ${selectedCategory}`,
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