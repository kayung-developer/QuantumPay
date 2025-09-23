import React, { useState, Fragment } from 'react'; // <-- Import Fragment
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { ArrowUpTrayIcon, PlusIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import AddBankAccountModal from '../../components/payouts/AddBankAccountModal';
import PayoutConfirmationModal from '../../components/payouts/PayoutConfirmationModal';
import toast from 'react-hot-toast';
import { Menu, Transition } from '@headlessui/react';

const WithdrawPage = () => {
    // This endpoint must exist on your backend to fetch saved bank accounts
    const { data: savedAccounts, loading, error, request: refetch } = useApi('/payouts/recipients');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [currencyToAdd, setCurrencyToAdd] = useState('NGN');

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        refetch();
        toast.success("Bank account added successfully!");
    };

    const handlePayoutSuccess = () => {
        setSelectedAccount(null);
        toast.success("Your withdrawal has been initiated successfully!");
        // A robust app would also refetch wallet balances here
    };

    const renderContent = () => {
        if (loading) {
            // Theme-aware skeleton loader
            return (
                <div className="space-y-3">
                    <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse"></div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="text-center py-16 text-red-400">
                    <p>Could not load your saved bank accounts.</p>
                    <Button onClick={refetch} variant="secondary" className="mt-4">Retry</Button>
                </div>
            );
        }

        if (!savedAccounts || savedAccounts.length === 0) {
            return (
                <div className="text-center py-16 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                    <BuildingLibraryIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="mt-2 font-semibold text-neutral-800 dark:text-white">No Saved Bank Accounts</h3>
                    <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Add a bank account to start making withdrawals.</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {savedAccounts.map(account => (
                    <div key={account.id} className="bg-white dark:bg-neutral-900 p-4 rounded-lg flex justify-between items-center border border-neutral-200 dark:border-neutral-800">
                        <div>
                            <p className="font-bold text-neutral-900 dark:text-white">{account.account_name}</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">{account.bank_name} - **** {account.account_number_mask}</p>
                        </div>
                        <Button onClick={() => setSelectedAccount(account)}>Withdraw</Button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="Withdraw Funds"> {/* Add to i18n.js */}
            <div className="max-w-3xl mx-auto space-y-6">
                {/* --- [THE DEFINITIVE FIX] --- */}
                {/* The header is now correctly structured with a flex container */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Withdraw to Bank</h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">Send money from your wallet to a saved bank account.</p>
                    </div>

                    {/* The Menu component is the container for the dropdown */}
                    <Menu as="div" className="relative inline-block text-left">
                        <div>
                            {/* The Menu.Button is the visible button the user clicks */}
                            <Menu.Button as={Button} variant="secondary">
                                <PlusIcon className="h-5 w-5 mr-2" />
                                Add Account
                            </Menu.Button>
                        </div>
                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                        >
                            {/* Menu.Items is the dropdown panel */}
                            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-neutral-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-neutral-200 dark:border-neutral-700">
                                <div className="py-1">
    {/* --- Pan-African Payouts --- */}
    <Menu.Item>
        {({ active }) => (
            <button
                onClick={() => { setCurrencyToAdd('NGN'); setIsAddModalOpen(true); }}
                className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                } group flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
            >
                <span className="fi fi-ng mr-3"></span> {/* Nigerian Flag */}
                Nigerian Bank (NGN)
            </button>
        )}
    </Menu.Item>
    <Menu.Item>
        {({ active }) => (
            <button
                onClick={() => { setCurrencyToAdd('GHS'); setIsAddModalOpen(true); }}
                className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                } group flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
            >
                <span className="fi fi-gh mr-3"></span> {/* Ghanaian Flag */}
                Ghanaian Bank (GHS)
            </button>
        )}
    </Menu.Item>
    <Menu.Item>
        {({ active }) => (
            <button
                onClick={() => { setCurrencyToAdd('KES'); setIsAddModalOpen(true); }}
                className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                } group flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
            >
                <span className="fi fi-ke mr-3"></span> {/* Kenyan Flag */}
                Kenyan Bank (KES)
            </button>
        )}
    </Menu.Item>
    <Menu.Item>
        {({ active }) => (
            <button
                onClick={() => { setCurrencyToAdd('ZAR'); setIsAddModalOpen(true); }}
                className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                } group flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
            >
                 <span className="fi fi-za mr-3"></span> {/* South African Flag */}
                South African Bank (ZAR)
            </button>
        )}
    </Menu.Item>

    {/* Divider for separating continental groups */}
    <div className="my-1 h-px bg-neutral-200 dark:bg-neutral-700" />

    {/* --- Global Payouts --- */}
    <Menu.Item>
        {({ active }) => (
            <button
                onClick={() => { setCurrencyToAdd('USD'); setIsAddModalOpen(true); }}
                className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                } group flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
            >
                 <span className="fi fi-us mr-3"></span> {/* US Flag */}
                American Bank (USD - ACH)
            </button>
        )}
    </Menu.Item>
    <Menu.Item>
        {({ active }) => (
            <button
                onClick={() => { setCurrencyToAdd('GBP'); setIsAddModalOpen(true); }}
                className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                } group flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
            >
                 <span className="fi fi-gb mr-3"></span> {/* UK Flag */}
                British Bank (GBP)
            </button>
        )}
    </Menu.Item>
    <Menu.Item>
        {({ active }) => (
            <button
                onClick={() => { setCurrencyToAdd('EUR'); setIsAddModalOpen(true); }}
                className={`${
                    active ? 'bg-neutral-100 dark:bg-neutral-700' : ''
                } group flex w-full items-center px-4 py-2 text-sm text-neutral-700 dark:text-neutral-200`}
            >
                 <span className="fi fi-eu mr-3"></span> {/* EU Flag */}
                European Bank (EUR - SEPA)
            </button>
        )}
    </Menu.Item>
</div>
                            </Menu.Items>
                        </Transition>
                    </Menu>
                </div>
                {/* --- END OF FIX --- */}

                {renderContent()}
            </div>

            <AddBankAccountModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
                currency={currencyToAdd}
            />

            {selectedAccount && (
                <PayoutConfirmationModal
                    isOpen={!!selectedAccount}
                    onClose={() => setSelectedAccount(null)}
                    account={selectedAccount}
                    onSuccess={handlePayoutSuccess}
                />
            )}
        </DashboardLayout>
    );
};

export default WithdrawPage;
