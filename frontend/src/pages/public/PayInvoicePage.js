import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { LockClosedIcon, CheckCircleIcon, BanknotesIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import { Toaster, toast, resolveValue } from 'react-hot-toast';

// Simple SVG for M-Pesa logo, as we did before
const SvgMpesa = () => (
    <svg viewBox="0 0 256 256" className="h-6 w-6" fill="currentColor"><path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm-21.36 56.88a8 8 0 0 1 10.15-.12l21.33 16.54a8 8 0 0 1 0 12.18l-37.47 29.06a8 8 0 0 1-10.16-12.06l24-18.61-24-18.61a8 8 0 0 1-4-11.38Zm58.19 36.19a8 8 0 0 1-10.16-12.06l24-18.61-24-18.61a8 8 0 0 1-4-11.38 8 8 0 0 1 10.15-.12l21.34 16.54a8 8 0 0 1 0 12.18Z"/></svg>
);

const paymentMethodMeta = {
    mpesa: { name: "Pay with M-Pesa", icon: SvgMpesa },
    card_ng: { name: "Pay with Card / Bank", icon: CreditCardIcon },
    card_ke: { name: "Pay with Card", icon: CreditCardIcon },
    bank_transfer_ng: { name: "Bank Transfer", icon: BanknotesIcon },
};

const PayInvoicePage = () => {
    const { invoiceId } = useParams();
    const { data: invoice, loading, error } = useApi(`/business/invoices/pay/${invoiceId}`);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [isPaid, setIsPaid] = useState(false);

    // In a real system, you'd have a useApiPost here
    const [paying, setPaying] = useState(false);

    const handlePayment = async () => {
        setPaying(true);
        // This is where you would call the real payment processing endpoint
        // For now, we'll simulate it.
        try {
            // const result = await processPayment({ invoiceId, method: selectedMethod, details: {...} });
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
            setIsPaid(true);
            toast.success("Payment successful!");
        } catch (e) {
            toast.error("Payment failed. Please try again.");
        } finally {
            setPaying(false);
        }
    }

    const renderContent = () => {
        if (loading) {
            return <div className="flex justify-center items-center h-screen"><Spinner size="lg" /></div>;
        }
        if (error) {
            return <div className="text-center text-red-400"><h2>Error</h2><p>{error.message || "This invoice link is invalid or has expired."}</p></div>;
        }
        if (!invoice) return null;

        if (isPaid) {
            return (
                <div className="text-center space-y-4">
                    <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400"/>
                    <h2 className="text-2xl font-semibold text-white">Payment Received!</h2>
                    <p className="text-neutral-300">Thank you. Your payment for {invoice.currency} {invoice.amount.toFixed(2)} has been successfully processed.</p>
                </div>
            )
        }

        return (
            <>
                <div className="text-center">
                    <p className="text-neutral-400">Payment to</p>
                    <h1 className="text-2xl font-bold font-display text-white">{invoice.business_name}</h1>
                </div>
                <div className="my-6 p-6 bg-primary/10 border border-primary/20 rounded-lg text-center">
                    <p className="text-sm text-primary-light">Amount Due</p>
                    <p className="text-4xl font-bold text-white">
                        {invoice.currency} {invoice.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">Due by {format(parseISO(invoice.due_date), 'MMM d, yyyy')}</p>
                </div>

                <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Choose a payment method</h3>
                    <div className="space-y-3">
                        {invoice.available_payment_methods.map(method => {
                            const meta = paymentMethodMeta[method] || { name: "Pay Securely", icon: CreditCardIcon };
                            return (
                                <button
                                    key={method}
                                    onClick={() => setSelectedMethod(method)}
                                    className={`w-full p-4 flex items-center rounded-lg border-2 transition-all ${selectedMethod === method ? 'border-primary bg-primary/10' : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'}`}
                                >
                                    <meta.icon className="h-6 w-6 text-primary-light"/>
                                    <span className="ml-4 font-semibold text-white">{meta.name}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {selectedMethod && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                        {/* Here you would render the actual form for the selected method */}
                        {/* For M-Pesa, a phone number input. For Card, the card form. */}
                        <div className="text-center p-4 bg-neutral-800 rounded-lg">
                            <p className="text-sm text-neutral-400">Payment form for {paymentMethodMeta[selectedMethod].name} would appear here.</p>
                        </div>
                        <Button fullWidth className="mt-4" onClick={handlePayment} isLoading={paying}>
                            Pay {invoice.currency} {invoice.amount.toFixed(2)}
                        </Button>
                    </motion.div>
                )}
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

export default PayInvoicePage;