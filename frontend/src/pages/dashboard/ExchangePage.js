import React, {useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import { useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowsRightLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Toaster, toast, resolveValue } from 'react-hot-toast';

const CurrencyInput = ({ wallets, selected, onSelect, amount, onAmountChange, disabled }) => {
    const selectedWallet = wallets.find(w => w.currency_code === selected);

    return (
        <div className="bg-neutral-100 dark:bg-neutral-800 p-4 rounded-lg">
            <div className="flex justify-between items-center">
                <select
                    value={selected}
                    onChange={(e) => onSelect(e.target.value)}
                    className="bg-transparent text-2xl font-bold text-neutral-900 dark:text-white focus:outline-none appearance-none"
                    disabled={disabled}
                >
                    {wallets.map(wallet => (
                        <option key={wallet.currency_code} value={wallet.currency_code}>
                            {wallet.currency_code}
                        </option>
                    ))}
                </select>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => onAmountChange(e.target.value)}
                    placeholder="0.00"
                    className="bg-transparent text-2xl font-bold text-neutral-900 dark:text-white text-right w-full focus:outline-none"
                    disabled={disabled}
                />
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                Balance: {selectedWallet ? selectedWallet.balance.toFixed(2) : '0.00'}
            </p>
        </div>
    );
};


const ExchangePage = () => {
    const { data: wallets, loading: walletsLoading } = useApi('/wallets/me');
    const { post: getQuote, loading: quoteLoading } = useApiPost('/forex/quote');
    const { post: executeTrade, loading: executeLoading } = useApiPost('/forex/execute');

    const [fromCurrency, setFromCurrency] = useState('');
    const [toCurrency, setToCurrency] = useState('');
    const [fromAmount, setFromAmount] = useState('');
    const [quote, setQuote] = useState(null);
    const [transactionResult, setTransactionResult] = useState(null);

    // Set default currencies once wallets are loaded
    useEffect(() => {
        if (wallets && wallets.length > 1) {
            setFromCurrency(wallets[0].currency_code);
            setToCurrency(wallets[1].currency_code);
        } else if (wallets && wallets.length > 0) {
            setFromCurrency(wallets[0].currency_code);
        }
    }, [wallets]);

    // Debounce quote fetching to avoid excessive API calls
    useEffect(() => {
        if (parseFloat(fromAmount) > 0 && fromCurrency && toCurrency) {
            const handler = setTimeout(() => {
                handleGetQuote();
            }, 500); // 500ms delay
            return () => clearTimeout(handler);
        } else {
            setQuote(null); // Clear quote if amount is zero or invalid
        }
    }, [fromAmount, fromCurrency, toCurrency]);

    const handleGetQuote = async () => {
        const result = await getQuote({
            from_currency: fromCurrency,
            to_currency: toCurrency,
            amount: parseFloat(fromAmount),
        });
        if (result.success) {
            setQuote(result.data);
        } else {
            setQuote(null);
        }
    };

    const handleExecute = async () => {
        if (!quote?.quote_id) return;
        const result = await executeTrade({ quote_id: quote.quote_id });
        if (result.success) {
            setTransactionResult(result.data);
            toast.success("Exchange successful!");
        }
    };

    const handleSwapCurrencies = () => {
        setFromCurrency(toCurrency);
        setToCurrency(fromCurrency);
    };

    if (walletsLoading) {
        return <DashboardLayout pageTitle="Exchange"><Spinner /></DashboardLayout>;
    }

    if (!wallets || wallets.length < 2) {
        return (
            <DashboardLayout pageTitle="Exchange">
                 <div className="text-center p-8 bg-white dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Currency Exchange Not Available</h2>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">You need at least two different currency wallets to use the exchange.</p>
                 </div>
            </DashboardLayout>
        )
    }

    if (transactionResult) {
        return (
             <DashboardLayout pageTitle="Exchange">
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-md mx-auto space-y-4 py-8">
                    <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400"/>
                    <h2 className="text-2xl font-semibold text-white">Exchange Complete</h2>
                    <p className="text-neutral-300">{transactionResult.description}</p>
                    <div className="pt-4">
                        <Button onClick={() => setTransactionResult(null)}>Make Another Exchange</Button>
                    </div>
                </motion.div>
             </DashboardLayout>
        )
    }

    return (
        <DashboardLayout pageTitle="Currency Exchange">
            <div className="max-w-md mx-auto bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8 space-y-6">
                <CurrencyInput
                    wallets={wallets}
                    selected={fromCurrency}
                    onSelect={setFromCurrency}
                    amount={fromAmount}
                    onAmountChange={setFromAmount}
                />

                <div className="relative flex justify-center items-center">
                    <div className="absolute w-full h-px bg-neutral-200 dark:bg-neutral-700"></div>
                    <button
                        onClick={handleSwapCurrencies}
                        className="relative z-10 p-2 bg-white dark:bg-neutral-900 border-2 border-primary rounded-full text-primary hover:bg-primary hover:text-white transition-colors duration-200"
                    >
                        <ArrowsRightLeftIcon className="h-6 w-6"/>
                    </button>
                </div>

                <CurrencyInput
                    wallets={wallets}
                    selected={toCurrency}
                    onSelect={setToCurrency}
                    amount={quote ? quote.converted_amount.toFixed(2) : ''}
                    onAmountChange={() => {}} // This is a display-only field
                    disabled={true}
                />

                <AnimatePresence>
                {quote && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-center text-neutral-600 dark:text-neutral-400 pt-4 border-t border-neutral-200 dark:border-neutral-700"
                    >
                       <p>Rate: 1 {fromCurrency} ≈ {quote.rate.toFixed(4)} {toCurrency}</p>
                       <p className="text-xs">(Quote is valid for 60 seconds)</p>
                    </motion.div>
                )}
                </AnimatePresence>

                <div className="pt-4">
                    <Button
                        fullWidth
                        onClick={handleExecute}
                        disabled={!quote || executeLoading || quoteLoading}
                        isLoading={executeLoading}
                    >
                        {quoteLoading ? 'Getting Quote...' : 'Exchange'}
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ExchangePage;