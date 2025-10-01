// FILE: frontend/src/pages/public/PayLinkPage.js

import React from 'react';
import { useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { LockClosedIcon, ExclamationTriangleIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const PayLinkPage = () => {
    const { linkId } = useParams();
    // [THE DEFINITIVE FIX - PART 2] Call the new public API endpoint
    const { data: link, loading, error } = useApi(`/public/links/${linkId}`);

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
        }

        if (error) {
            return (
                <div className="text-center text-red-400 space-y-4">
                    <ExclamationTriangleIcon className="h-12 w-12 mx-auto" />
                    <h2 className="text-2xl font-bold">Payment Link Not Found</h2>
                    <p>{error.message || "This link may be invalid, expired, or has already been used."}</p>
                </div>
            );
        }

        if (!link) return null;

        return (
            <>
                <div className="text-center">
                    <p className="text-neutral-400">You are paying</p>
                    <h1 className="text-2xl font-bold font-display text-white">{link.business_name}</h1>
                    <p className="mt-2 text-lg text-neutral-300">{link.title}</p>
                </div>
                <div className="my-6 p-6 bg-primary/10 border border-primary/20 rounded-lg text-center">
                    <p className="text-sm text-primary-light">Amount to Pay</p>
                    <p className="text-4xl font-bold text-white">
                        {link.amount ?
                            new Intl.NumberFormat('en-US', { style: 'currency', currency: link.currency }).format(link.amount)
                            : "Flexible Amount"
                        }
                    </p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Select Payment Method</h3>
                    {/* In a real system, you would render a dynamic list of payment gateways here */}
                    <div className="p-6 bg-neutral-800 rounded-lg text-center">
                        <BanknotesIcon className="h-8 w-8 mx-auto text-neutral-400"/>
                        <p className="mt-2 text-sm text-neutral-400">
                            A real payment form (like Stripe, Paystack, etc.) would be rendered here to complete the transaction.
                        </p>
                    </div>
                </div>

                <div className="mt-6">
                    <Button fullWidth size="lg">
                        {link.amount ? `Pay ${link.currency} ${link.amount}` : "Proceed to Pay"}
                    </Button>
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-4 font-sans">
             <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl p-8"
            >
                {renderContent()}
            </motion.div>
            <p className="text-xs text-neutral-600 flex items-center mt-6">
                <LockClosedIcon className="h-4 w-4 mr-1"/> Secure payments powered by QuantumPay
            </p>
        </div>
    );
};

export default PayLinkPage;