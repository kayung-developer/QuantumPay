import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi from '../../hooks/useApi';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { motion } from 'framer-motion';
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, WalletIcon } from '@heroicons/react/24/outline';
import DepositModal from '../../components/dashboard/funding/DepositModal';
import AddWalletModal from '../../components/wallets/AddWalletModal';
import toast from 'react-hot-toast'; // Added for better user feedback
import { useTranslation } from 'react-i18next';


// A simple component to render a wallet card (No changes needed here)
const WalletCard = ({ wallet, onDeposit }) => {
  const { currency_code, balance, currency_type } = wallet;

  const isCrypto = currency_type === 'crypto';
  const iconUrl = isCrypto
    ? `https://cryptoicons.org/api/color/${currency_code.toLowerCase()}/200`
    : `https://wise.com/public-resources/assets/flags/rectangle/${currency_code.toLowerCase()}.png`;

  return (
    <motion.div
      layout
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
       className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 flex flex-col justify-between shadow-lg hover:shadow-primary/10 transition-all duration-300"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={iconUrl}
              alt={`${currency_code} flag`}
              className="h-8 w-8 rounded-full bg-neutral-700 object-cover"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
            />
            <div className="h-8 w-8 rounded-full bg-neutral-700 items-center justify-center font-bold text-white hidden">{currency_code.charAt(0)}</div>
            <span className="font-display text-xl font-semibold text-neutral-900 dark:text-white">{currency_code}</span>
          </div>
          <span className="px-2 py-1 text-xs font-medium text-primary-light bg-primary/20 rounded-full capitalize">
            {currency_type}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Balance</p>
          <p className="font-display text-3xl font-bold text-neutral-900 dark:text-white mt-1">
            {new Intl.NumberFormat('en-US', {
              style: isCrypto ? 'decimal' : 'currency',
              currency: isCrypto ? undefined : currency_code,
              minimumFractionDigits: 2,
              maximumFractionDigits: isCrypto ? 8 : 2,
            }).format(balance)}
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-center space-x-3">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          onClick={() => onDeposit(wallet)}
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          Deposit
        </Button>
        <Button variant="secondary" size="md" className="flex-1" disabled>
           <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
           Withdraw
        </Button>
      </div>
    </motion.div>
  );
};


// The main page component with robust enhancements
const WalletsPage = () => {
  const { t } = useTranslation();
  const { data: wallets, loading, error, request: refetchWallets } = useApi('/wallets/me');
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [isAddWalletModalOpen, setIsAddWalletModalOpen] = useState(false);

  const handleDepositClick = (wallet) => {
    setSelectedWallet(wallet);
    setDepositModalOpen(true);
  };

  const handleWalletAdded = (newWallet) => {
        setIsAddWalletModalOpen(false);
        refetchWallets();
        toast.success(`Your new ${newWallet.currency_code} wallet has been added!`);
    };

  const handleCloseModal = () => {
    setDepositModalOpen(false);
    // Setting selected wallet to null after a short delay allows the modal to animate out smoothly
    setTimeout(() => setSelectedWallet(null), 300);
  };

  const handleDepositSuccess = () => {
    handleCloseModal();
    toast.success(`Deposit initiated! Your ${selectedWallet?.currency_code} balance will be updated shortly.`);
    // Refetch wallet data after a delay to give the backend time to process the webhook/callback
    setTimeout(() => {
        refetchWallets();
    }, 5000); // 5-second delay is a reasonable time to wait for most payment callbacks
  };

  const containerVariants = {
    hidden: { opacity: 1 }, // Set to 1 to allow staggerChildren to work correctly
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07, // A subtle, professional stagger effect
      },
    },
  };

  const renderContent = () => {
    if (loading) {
      // **ENHANCEMENT:** Use a skeleton loader that mimics the final layout for a better UX.
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg h-56 animate-pulse">
                    <div className="flex justify-between items-center">
                        <div className="h-8 w-24 bg-neutral-700 rounded-md"></div>
                        <div className="h-6 w-16 bg-neutral-700 rounded-full"></div>
                    </div>
                    <div className="mt-6">
                        <div className="h-4 w-1/3 bg-neutral-700 rounded-md"></div>
                        <div className="mt-2 h-8 w-2/3 bg-neutral-700 rounded-md"></div>
                    </div>
                     <div className="mt-8 flex justify-between items-center space-x-3">
                        <div className="h-12 w-full bg-neutral-700 rounded-md"></div>
                        <div className="h-12 w-full bg-neutral-700 rounded-md"></div>
                    </div>
                </div>
            ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg">
          <h3 className="font-semibold text-white">Could Not Load Wallets</h3>
          <p className="mt-2 text-sm">There was an issue connecting to the server. Please check your internet connection.</p>
          <p className="mt-1 text-xs text-red-400">Error: {error.message}</p>
          <Button onClick={() => refetchWallets()} className="mt-4">Try Again</Button>
        </div>
      );
    }

    if (!wallets || wallets.length === 0) {
      // **ENHANCEMENT:** Added a more engaging "Add New Wallet" button, even if disabled.
      return (
          <div className="text-center py-20 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
                    <WalletIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="mt-2 text-sm font-semibold text-neutral-800 dark:text-white">No wallets found</h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Your wallets will appear here once your account is set up.</p>
              <div className="mt-6">
                <Button disabled>
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    Add New Wallet
                </Button>
              </div>
          </div>
      );
    }

    // **ENHANCEMENT:** Wrapped the map in the motion.div for staggered animation
    return (
      <motion.div
        className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {wallets.map((wallet) => (
          <WalletCard key={wallet.id} wallet={wallet} onDeposit={handleDepositClick} />
        ))}
      </motion.div>
    );
  };

  return (
    <DashboardLayout pageTitleKey="wallets_title">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
              <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Wallets</h1>
              <p className="mt-1 text-neutral-400">Manage your multi-currency balances and funds.</p>
          </div>
 <Button onClick={() => setIsAddWalletModalOpen(true)}>
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add New Wallet
                    </Button>
        </div>

        {renderContent()}
      </div>

      {/* **ENHANCEMENT:** Ensure the modal is only rendered when a wallet is selected to prevent state issues. */}
      {selectedWallet && (
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={handleCloseModal}
          wallet={selectedWallet}
          onSuccess={handleDepositSuccess} // Renamed prop for clarity
        />
      )}
      <AddWalletModal
                isOpen={isAddWalletModalOpen}
                onClose={() => setIsAddWalletModalOpen(false)}
                onSuccess={handleWalletAdded}
                existingWallets={wallets || []} // Pass existing wallets to prevent duplicates
            />
    </DashboardLayout>
  );
};

export default WalletsPage;