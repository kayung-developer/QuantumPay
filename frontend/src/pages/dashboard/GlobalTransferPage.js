import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import { useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';
import { GlobeAltIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const GlobalTransferPage = () => {
    const { data: wallets, loading: walletsLoading } = useApi('/wallets/me');
    const { post: getQuote, loading: quoteLoading } = useApiPost('/forex/quote');
    const { post: executeTransfer, loading: transferLoading } = useApiPost('/transactions/global-transfer');

    const [formState, setFormState] = useState({
        receiver_email: '',
        send_amount: '',
        send_currency: '',
    });
    const [quote, setQuote] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (wallets && wallets.length > 0 && formState.send_currency === '') {
            setFormState(prev => ({ ...prev, send_currency: wallets[0].currency_code }));
        }
    }, [wallets]);

    // Debounced quote fetching
    useEffect(() => {
        const { send_amount, send_currency, receiver_email } = formState;
        if (parseFloat(send_amount) > 0 && send_currency && receiver_email.includes('@')) {
            const handler = setTimeout(() => {
                // In a real system, you might need the receiver's currency.
                // Our backend cleverly deduces it from their profile.
                getQuote({
                    from_currency: send_currency,
                    to_currency: 'USD', // The backend will ignore this and use the receiver's local currency
                    amount: parseFloat(send_amount),
                }).then(result => {
                    if (result.success) setQuote(result.data);
                    else setQuote(null);
                });
            }, 700);
            return () => clearTimeout(handler);
        } else {
            setQuote(null);
        }
    }, [formState.send_amount, formState.send_currency, formState.receiver_email]);

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        const result = await executeTransfer(formState);
        if (result.success) {
            toast.success("Transfer successful!");
            setIsSuccess(true);
        }
    };

    if (isSuccess) {
        return (
            <DashboardLayout pageTitle="Send Global">
                <div className="text-center max-w-md mx-auto py-12">
                     <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400"/>
                     <h2 className="mt-4 text-2xl font-semibold text-white">Transfer Sent!</h2>
                     <p className="mt-2 text-neutral-300">Your global transfer to {formState.receiver_email} has been completed successfully.</p>
                     <div className="mt-6 flex gap-4 justify-center">
                        <Button onClick={() => setIsSuccess(false)}>Send Another</Button>
                        <Button onClick={() => navigate('/dashboard/transactions')} variant="secondary">View History</Button>
                     </div>
                </div>
            </DashboardLayout>
        )
    }

    return (
        <DashboardLayout pageTitle="Send Global">
            <div className="max-w-lg mx-auto">
                 <div className="mb-8 text-center">
                    <GlobeAltIcon className="h-12 w-12 mx-auto text-primary"/>
                    <h1 className="mt-4 text-3xl font-bold font-display text-neutral-600 dark:text-white">Send Money Across Africa</h1>
                    <p className="mt-2 text-neutral-400">Instantly send funds to any QuantumPay user in another country. We handle the conversion.</p>
                </div>

                <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">Recipient's Email</label>
                        <input name="receiver_email" value={formState.receiver_email} onChange={handleChange}
                               // [THEME AWARE] Input styling
                               className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-md text-neutral-900 dark:text-white border border-neutral-300 dark:border-neutral-700 focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-neutral-300 mb-1">You Send</label>
                        <div className="flex">
                            <input name="send_amount" value={formState.send_amount} onChange={handleChange} type="number" className="w-full bg-neutral-100 dark:bg-neutral-800 p-3 rounded-l-md text-neutral-900 dark:text-white border-y border-l border-neutral-300 dark:border-neutral-700 focus:ring-primary focus:border-primary" />
                            <select name="send_currency" value={formState.send_currency} onChange={handleChange}  className="bg-neutral-200 dark:bg-neutral-700 p-3 rounded-r-md text-neutral-900 dark:text-white border-y border-r border-neutral-300 dark:border-neutral-700 focus:ring-primary focus:border-primary">
                                {wallets?.map(w => <option key={w.currency_code} value={w.currency_code}>{w.currency_code}</option>)}
                            </select>
                        </div>
                    </div>

                    {(quoteLoading || quote) && (
                        <div className="flex justify-center items-center py-6 text-neutral-300">
                             <ArrowRightIcon className="h-6 w-6 text-neutral-500"/>
                             <div className="flex-grow text-center">
                                {quoteLoading ? <Spinner /> : (
                                     <p>Recipient gets approx. <span className="font-bold text-white">{quote.converted_amount.toFixed(2)} {quote.to_currency}</span></p>
                                )}
                             </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-neutral-700">
                        <Button fullWidth onClick={handleSubmit} isLoading={transferLoading} disabled={!quote || transferLoading}>
                            Send Money
                        </Button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default GlobalTransferPage;