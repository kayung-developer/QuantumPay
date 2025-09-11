import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { ArrowUpTrayIcon, PlusIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import AddBankAccountModal from '../../components/payouts/AddBankAccountModal';
import PayoutConfirmationModal from '../../components/payouts/PayoutConfirmationModal';
import toast from 'react-hot-toast';

const WithdrawPage = () => {
    // This endpoint fetches the list of UserLinkedBankAccount records.
    const { data: savedAccounts, loading, error, request: refetch } = useApi('/payouts/recipients');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null); // This holds the account for the payout modal

    const handleAddSuccess = () => {
        setIsAddModalOpen(false);
        refetch(); // Refetch the list of saved accounts to show the new one.
        toast.success("Bank account added successfully!");
    };

    const handlePayoutSuccess = () => {
        setSelectedAccount(null);
        toast.success("Your withdrawal has been initiated successfully!");
        // A robust app would also refetch wallet balances here to show the deduction.
        // refetchWallets();
    };

    const renderContent = () => {
        if (loading) {
            // Render a skeleton loader while fetching saved accounts.
            return (
                <div className="space-y-3">
                    <div className="h-20 bg-neutral-900 rounded-lg animate-pulse"></div>
                    <div className="h-20 bg-neutral-900 rounded-lg animate-pulse"></div>
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
                <div className="text-center py-16 border-2 border-dashed border-neutral-700 rounded-lg">
                    <BuildingLibraryIcon className="mx-auto h-12 w-12 text-neutral-500" />
                    <h3 className="mt-2 font-semibold text-white">No Saved Bank Accounts</h3>
                    <p className="mt-1 text-sm text-neutral-400">Add a bank account to start making withdrawals.</p>
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {savedAccounts.map(account => (
                    <div key={account.id} className="bg-neutral-900 p-4 rounded-lg flex justify-between items-center transition-colors">
                        <div>
                            <p className="font-bold text-white">{account.account_name}</p>
                            <p className="text-sm text-neutral-400">{account.bank_name} - **** {account.account_number_mask}</p>
                        </div>
                        <Button onClick={() => setSelectedAccount(account)}>Withdraw</Button>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <DashboardLayout pageTitle="Withdraw Funds">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-white">Withdraw to Bank</h1>
                        <p className="mt-1 text-neutral-400">Send money from your wallet to a saved bank account.</p>
                    </div>
                    <Button onClick={() => setIsAddModalOpen(true)} variant="secondary">
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Account
                    </Button>
                </div>

                {renderContent()}
            </div>

            <AddBankAccountModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddSuccess}
            />

            {/* Render the confirmation modal only when an account is selected */}
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