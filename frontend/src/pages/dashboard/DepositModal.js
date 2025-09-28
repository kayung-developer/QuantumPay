// FILE: src/components/dashboard/DepositModal.js

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';

// --- Component Imports ---
import useApi from '../../hooks/useApi';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import CardDepositForm from './funding/CardDepositForm'; // Your existing form
import MpesaDepositForm from './funding/MpesaDepositForm'; // A new form for M-Pesa

const DepositModal = ({ isOpen, onClose, wallet, onSuccess }) => {
    const { t } = useTranslation();
    const { data: methodsResponse, loading: methodsLoading, error: methodsError } = useApi('/payments/available-methods');
    
    const [step, setStep] = useState(1); // Step 1: Method selection, Step 2: Form
    const [selectedMethod, setSelectedMethod] = useState(null);

    const handleMethodSelect = (method) => {
        setSelectedMethod(method);
        setStep(2);
    };

    const handleBack = () => {
        setSelectedMethod(null);
        setStep(1);
    };
    
    // Custom close handler to reset the modal's state completely
    const handleClose = () => {
        setStep(1);
        setSelectedMethod(null);
        onClose();
    };

    const renderPaymentForm = () => {
        // [THE DYNAMIC LOGIC] Render the correct form component based on the method ID
        switch (selectedMethod?.id) {
            case 'card':
                return <CardDepositForm wallet={wallet} onSuccess={onSuccess} />;
            case 'mpesa':
                return <MpesaDepositForm wallet={wallet} onSuccess={onSuccess} />;
            // Add cases for 'bank_transfer', 'ach', 'momo', etc. as you build them
            default:
                return (
                    <div className="text-center p-8">
                        <p className="text-red-500">This payment method is not yet fully integrated.</p>
                        <Button onClick={handleBack} variant="secondary" className="mt-4">Go Back</Button>
                    </div>
                );
        }
    };

    const renderContent = () => {
        if (methodsLoading) {
            return <div className="py-12 flex justify-center"><Spinner /></div>;
        }
        if (methodsError) {
            return <p className="p-6 text-center text-red-500">Could not load available payment methods. Please try again.</p>;
        }

        const variants = {
            enter: { opacity: 0, x: 30 },
            center: { opacity: 1, x: 0 },
            exit: { opacity: 0, x: -30 },
        };

        return (
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                >
                    {step === 1 && (
                        <div className="space-y-4">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                Choose a secure method to add money to your <span className="font-bold text-neutral-900 dark:text-white">{wallet.currency_code}</span> wallet.
                            </p>
                            {methodsResponse?.methods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => handleMethodSelect(method)}
                                    className="w-full p-4 rounded-lg border text-left transition-all duration-200 ease-in-out bg-white dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 hover:border-primary dark:hover:border-primary hover:shadow-lg"
                                >
                                    <p className="font-medium text-neutral-900 dark:text-white">{method.name}</p>
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-neutral-500">{method.provider.charAt(0).toUpperCase() + method.provider.slice(1)}</p>
                                        {method.is_instant && <span className="text-xs font-semibold text-green-600 dark:text-green-400">Instant</span>}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 2 && (
                        <div>
                            <Button onClick={handleBack} variant="link" size="sm" className="mb-4">&larr; Back to methods</Button>
                            {renderPaymentForm()}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        );
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title={`Deposit to ${wallet.currency_code} Wallet`}
        >
            {renderContent()}
        </Modal>
    );
};

export default DepositModal;