import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import useApi from '../../../hooks/useApi';
import Button from '../../../components/common/Button';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';
import Spinner from '../../../components/common/Spinner';
import { toastSuccess, toastError } from '../../components/common/Toast';
import CreateVaultModal from '../../../components/dashboard/personal/CreateVaultModal';
import VaultDetails from '../../../components/dashboard/personal/VaultDetails';

const VaultListItem = ({ vault, onSelect, isActive }) => (
    <button
        onClick={() => onSelect(vault)}
        className={`w-full text-left p-4 rounded-lg transition-colors ${
            isActive ? 'bg-primary/20' : 'hover:bg-neutral-800/50'
        }`}
    >
        <div className="flex justify-between items-center">
            <span className="font-semibold text-white">{vault.name}</span>
            <span className="font-mono text-sm text-neutral-300">
                 {new Intl.NumberFormat('en-US', { style: 'currency', currency: vault.currency }).format(vault.balance)}
            </span>
        </div>
        <p className="text-xs text-neutral-400 mt-1">{vault.members.length} member(s)</p>
    </button>
);

const SharedVaultsPage = () => {
    const { data: vaults, loading, error, request: refetchVaults } = useApi('/vaults');
    const [selectedVault, setSelectedVault] = useState(null);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);

    // When vaults data is loaded, select the first one by default
    useEffect(() => {
        if (vaults && vaults.length > 0 && !selectedVault) {
            setSelectedVault(vaults[0]);
        }
    }, [vaults, selectedVault]);

    const handleVaultCreated = (newVault) => {
        setCreateModalOpen(false);
        refetchVaults();
        setSelectedVault(newVault); // Select the newly created vault
        toast.success(`Vault "${newVault.name}" created successfully!`);
    };

    const renderVaultsList = () => {
        if (loading) return <div className="flex justify-center p-8"><Spinner /></div>;
        if (error) return <p className="p-4 text-sm text-red-400">Failed to load vaults.</p>;
        if (!vaults || vaults.length === 0) {
            return (
                <div className="text-center p-8">
                    <p className="text-sm text-neutral-500">You are not a part of any shared vaults yet.</p>
                </div>
            )
        }
        return (
            <div className="space-y-2">
                {vaults.map(vault => (
                    <VaultListItem
                        key={vault.id}
                        vault={vault}
                        onSelect={setSelectedVault}
                        isActive={selectedVault?.id === vault.id}
                    />
                ))}
            </div>
        )
    };

    return (
        <DashboardLayout pageTitle="Shared Vaults">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Vaults List */}
                <div className="lg:col-span-1">
                    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                        <div className="p-4 flex justify-between items-center border-b border-neutral-800">
                            <h2 className="text-lg font-semibold text-neutral-600 dark:text-white">My Vaults</h2>
                            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
                                <PlusIcon className="h-5 w-5"/>
                            </Button>
                        </div>
                        <div className="p-2">
                            {renderVaultsList()}
                        </div>
                    </div>
                </div>

                {/* Right Column: Vault Details */}
                <div className="lg:col-span-2">
                    {selectedVault ? (
                        <VaultDetails vault={selectedVault} />
                    ) : (
                         <div className="h-full flex flex-col justify-center items-center text-center p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                            <UsersIcon className="h-12 w-12 text-neutral-600"/>
                            <h3 className="mt-2 font-semibold text-neutral-600 dark:text-white">Select a vault</h3>
                            <p className="mt-1 text-sm text-neutral-400 dark:text-white">Choose a vault from the list to view its details, or create a new one.</p>
                        </div>
                    )}
                </div>
            </div>

            <CreateVaultModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleVaultCreated}
            />
        </DashboardLayout>
    );
};

export default SharedVaultsPage;