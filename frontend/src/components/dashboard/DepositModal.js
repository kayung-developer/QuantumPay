// FILE: src/components/dashboard/DepositModal.js

import React, { useState, useMemo, useEffect } from 'react';
import Modal from '../common/Modal';
import { CreditCardIcon, BanknotesIcon, BuildingLibraryIcon, DevicePhoneMobileIcon, LinkIcon } from '@heroicons/react/24/outline';
import CardDepositForm from './funding/CardDepositForm';
import MpesaDeposit from './funding/MpesaDeposit';
import BankTransferDetails from './funding/BankTransferDetails';
import MomoDeposit from './funding/MomoDeposit';
import EftDeposit from './funding/EftDeposit';
import PlaidLink from './funding/PlaidLink';

const SvgMpesa = () => (
    <svg viewBox="0 0 256 256" className="h-6 w-6" fill="currentColor"><path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm-21.36 56.88a8 8 0 0 1 10.15-.12l21.33 16.54a8 8 0 0 1 0 12.18l-37.47 29.06a8 8 0 0 1-10.16-12.06l24-18.61-24-18.61a8 8 0 0 1-4-11.38Zm58.19 36.19a8 8 0 0 1-10.16-12.06l24-18.61-24-18.61a8 8 0 0 1-4-11.38 8 8 0 0 1 10.15-.12l21.34 16.54a8 8 0 0 1 0 12.18Z"/></svg>
);

const DepositModal = ({ isOpen, onClose, wallet, onDepositSuccess }) => {
    const [selectedMethod, setSelectedMethod] = useState('');

    const availableMethods = useMemo(() => {
        if (!wallet) return [];

        const currency_country_map = {"NGN": "NG", "KES": "KE", "GHS": "GH", "ZAR": "ZA", "USD": "US"};
        const country = currency_country_map[wallet.currency_code];
        if (!country) return [];

        const allMethods = [
            { id: 'bank_transfer', name: 'Bank Transfer', icon: BuildingLibraryIcon, supported: ['NG'] },
            { id: 'card', name: 'Debit/Credit Card', icon: CreditCardIcon, supported: ['NG', 'KE', 'GH', 'ZA', 'US'] },
            { id: 'mpesa', name: 'M-Pesa', icon: SvgMpesa, supported: ['KE'] },
            { id: 'momo', name: 'Mobile Money', icon: DevicePhoneMobileIcon, supported: ['GH'] },
            { id: 'eft', name: 'Instant EFT', icon: BanknotesIcon, supported: ['ZA'] },
            { id: 'open_banking', name: 'Bank Account (ACH)', icon: LinkIcon, supported: ['US'] },
        ];

        return allMethods.filter(method => method.supported.includes(country));
    }, [wallet]);

    useEffect(() => {
        if (isOpen && availableMethods.length > 0) {
            const isCurrentMethodValid = availableMethods.some(m => m.id === selectedMethod);
            if (!isCurrentMethodValid) {
                setSelectedMethod(availableMethods[0].id);
            }
        } else if (!isOpen) {
            setSelectedMethod('');
        }
    }, [isOpen, availableMethods, selectedMethod]);

    const renderMethodContent = () => {
        switch (selectedMethod) {
            case 'bank_transfer':
                return <BankTransferDetails wallet={wallet} />;
            case 'card':
                return <CardDepositForm onDepositSuccess={onDepositSuccess} />;
            case 'mpesa':
                return <MpesaDeposit onDepositInitiated={onDepositSuccess} />;
            case 'momo':
                return <MomoDeposit onDepositInitiated={onDepositSuccess} />;
            case 'eft':
                return <EftDeposit onDepositInitiated={onDepositSuccess} />;
            case 'open_banking':
                return <PlaidLink onLinkSuccess={onDepositSuccess} />;
            default:
                return (
                    <div className="p-8 text-center text-neutral-600 dark:text-neutral-400 h-full flex flex-col justify-center">
                        <BanknotesIcon className="h-12 w-12 mx-auto text-neutral-600"/>
                        <p className="mt-4 font-semibold text-white">No Deposit Methods Available</p>
                        <p className="mt-2 text-sm">We do not currently support deposits for the {wallet?.currency_code} wallet.</p>
                    </div>
                );
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Deposit to ${wallet?.currency_code} Wallet`}
            size={availableMethods.length > 1 ? '2xl' : 'lg'}
        >
            {wallet ? (
                 <div className="flex flex-col md:flex-row gap-6 items-start">
                    {availableMethods.length > 1 && (
                        <div className="w-full md:w-1/3 space-y-2">
                             {availableMethods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 focus:ring-primary ${
                                        selectedMethod === method.id
                                        ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                                        : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    <method.icon className="h-6 w-6 mr-3 flex-shrink-0" />
                                    <span className={`font-semibold text-sm ${
                                        selectedMethod === method.id ? '' : 'text-neutral-800 dark:text-neutral-200'
                                    }`}>
                                        {method.name}
                                    </span>
                                </button>
                             ))}
                        </div>
                    )}
                    <div className="w-full md:flex-1">
                        <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg min-h-[350px] flex flex-col">
                            {renderMethodContent()}
                        </div>
                    </div>
                 </div>
            ) : null}
        </Modal>
    );
};

export default DepositModal;