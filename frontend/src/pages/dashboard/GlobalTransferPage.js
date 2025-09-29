// FILE: src/pages/dashboard/GlobalTransferPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

// --- Hook Imports ---
import { useApi, useApiPost } from '../../hooks/useApi';

// --- Icon Imports ---
import { GlobeAltIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const GlobalTransferPage = () => {
    const { data: wallets, loading: walletsLoading } = useApi('/wallets/me');
    const { post: getQuote, loading: quoteLoading } = useApiPost('/forex/quote');
    const { post: executeTransfer, loading: transferLoading } = useApiPost('/transactions/global-transfer');

    const navigate = useNavigate();
    const [formState, setFormState] = useState({
        receiver_email: '',
        send_amount: '',
        send_currency: '',
    });
    const [quote, setQuote] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [successDetails, setSuccessDetails] = useState(null);

    // Set a default currency once wallets are loaded
    useEffect(() => {
        if (wallets && wallets.length > 0 && formState.send_currency === '') {
            setFormState(prev => ({ ...prev, send_currency: wallets[0].currency_code }));
        }
    }, [wallets, formState.send_currency]);

    // Debounced quote fetching for real-time recipient amount display
    useEffect(() => {
        const { send_amount, send_currency, receiver_email } = formState;
        const amount = parseFloat(send_amount);

        if (amount > 0 && send_currency && receiver_email.includes('@')) {
            const handler = setTimeout(async () => {
                // The backend deduces the receiver's currency. We can use a common target like USD for the quote.
                const result = await getQuote({
                    from_currency: send_currency,
                    to_currency: 'USD', // The backend intelligently ignores this and uses the receiver's primary currency
                    amount: amount,
                });
                if (result.success) setQuote(result.data);
                else setQuote(null);
            }, 700); // 700ms debounce delay
            return () => clearTimeout(handler);
        } else {
            setQuote(null);
        }
    }, [formState.send_amount, formState.send_currency, formState.receiver_email, getQuote]);

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await executeTransfer(formState);
        if (result.success) {
            toast.success("Transfer sent successfully!");
            setSuccessDetails({ ...formState, quote: quote });
            setIsSuccess(true);
            setFormState({ receiver_email: '', send_amount: '', send_currency: formState.send_currency });
            setQuote(null);
        }
    };

    if (isSuccess) {
        return (
            <DashboardLayout pageTitle="Send Global">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md mx-auto py-12"
                >
                     <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400"/>
                     <h2 className="mt-4 text-2xl font-semibold text-white">Transfer Sent!</h2>
                     <p className="mt-2 text-neutral-300">
                         Your global transfer to {successDetails.receiver_email} has been completed successfully.
                     </p>
                     <div className="mt-6 flex gap-4 justify-center">
                        <Button onClick={() => setIsSuccess(false)}>Send Another</Button>
                        <Button onClick={() => navigate('/dashboard/transactions')} variant="secondary">View History</Button>
                     </div>
                </motion.div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout pageTitle="Send Global">
            <div className="max-w-lg mx-auto">
                 <div className="mb-8 text-center">
                    <GlobeAltIcon className="h-12 w-12 mx-auto text-primary"/>
                    <h1 className="mt-4 text-3xl font-bold font-display text-neutral-900 dark:text-white">Send Money Globally</h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">Instantly send funds to any QuantumPay user in another country. We handle the conversion.</p>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-6"
                >
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Recipient's Email</label>
                        <input name="receiver_email" type="email" required value={formState.receiver_email} onChange={handleChange}
                               className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">You Send</label>
                        <div className="flex">
                            <input name="send_amount" value={formState.send_amount} onChange={handleChange} type="number" step="0.01" required className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-l-md text-neutral-900 dark:text-white border-y border-l border-neutral-300 dark:border-neutral-700 focus:ring-primary focus:border-primary" />
                            <select name="send_currency" value={formState.send_currency} onChange={handleChange}  className="bg-neutral-200 dark:bg-neutral-700 p-3 rounded-r-md text-neutral-900 dark:text-white border-y border-r border-neutral-300 dark:border-neutral-700 focus:ring-primary focus:border-primary">
                                {walletsLoading && <option>Loading...</option>}
                                {wallets?.map(w => <option key={w.currency_code} value={w.currency_code}>{w.currency_code}</option>)}
                            </select>
                        </div>
                    </div>

                    <AnimatePresence>
                    {(quoteLoading || quote) && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex justify-center items-center py-6 text-neutral-600 dark:text-neutral-300 space-x-4"
                        >
                             <div className="flex-grow border-t border-dashed border-neutral-300 dark:border-neutral-700"></div>
                             <div className="flex-shrink-0 text-center">
                                {quoteLoading ? <Spinner size="sm"/> : (
                                     <p>Recipient gets approx. <span className="font-bold text-neutral-900 dark:text-white">{quote.converted_amount.toFixed(2)} {quote.to_currency}</span></p>
                                )}
                             </div>
                             <div className="flex-grow border-t border-dashed border-neutral-300 dark:border-neutral-700"></div>
                        </motion.div>
                    )}
                    </AnimatePresence>

                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
                        <Button fullWidth type="submit" isLoading={transferLoading} disabled={!quote || transferLoading}>
                            Send Money
                        </Button>
                    </div>
                </motion.form>
            </div>
        </DashboardLayout>
    );
};

export default GlobalTransferPage;