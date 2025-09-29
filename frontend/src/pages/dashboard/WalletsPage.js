import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useApi } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import DepositModal from '../../components/dashboard/DepositModal'; // Corrected path assumption
import AddWalletModal from '../../components/wallets/AddWalletModal';

// --- Icon Imports ---
import { PlusIcon, ArrowDownTrayIcon, ArrowUpTrayIcon, WalletIcon } from '@heroicons/react/24/outline';

// --- Sub-component for a single wallet card ---
const WalletCard = ({ wallet, onDeposit }) => {
  const { t } = useTranslation();
  const { currency_code, balance, currency_type } = wallet;

  const isCrypto = currency_type === 'crypto';
  // Use a reliable source for flag icons
  const iconUrl = `https://wise.com/public-resources/assets/flags/rectangle/${currency_code.toLowerCase()}.png`;

  return (
    <motion.div
      layout
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 flex flex-col justify-between shadow hover:shadow-lg transition-shadow duration-300"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src={iconUrl}
              alt={`${currency_code} flag`}
              className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 object-cover"
              // Fallback for flags that don't load
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling.style.display = 'flex'; }}
            />
            <div className="hidden h-8 w-8 rounded-full bg-neutral-700 items-center justify-center font-bold text-white">{currency_code.charAt(0)}</div>
            <span className="font-display text-xl font-semibold text-neutral-900 dark:text-white">{currency_code}</span>
          </div>
          <span className="px-2 py-1 text-xs font-medium text-primary bg-primary/10 dark:bg-primary/20 rounded-full capitalize">
            {currency_type}
          </span>
        </div>
        <div className="mt-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('wallet_card_balance_label')}</p>
          <p className="font-display text-3xl font-bold text-neutral-900 dark:text-white mt-1">
            {new Intl.NumberFormat(undefined, { // Use user's locale
              style: isCrypto ? 'decimal' : 'currency',
              currency: isCrypto ? undefined : currency_code,
              minimumFractionDigits: 2,
              maximumFractionDigits: isCrypto ? 8 : 2,
            }).format(balance)}
          </p>
        </div>
      </div>
      <div className="mt-6 flex items-center space-x-3">
        <Button variant="primary" size="md" className="flex-1" onClick={() => onDeposit(wallet)}>
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          {t('wallet_card_deposit_button')}
        </Button>
        <Button variant="secondary" size="md" className="flex-1" disabled>
           <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
           {t('wallet_card_withdraw_button')}
        </Button>
      </div>
    </motion.div>
  );
};

// --- Main WalletsPage Component ---
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
    toast.success(t('wallet_add_success_toast', { currency: newWallet.currency_code }));
  };

  const handleCloseModal = () => {
    setDepositModalOpen(false);
    setTimeout(() => setSelectedWallet(null), 300); // Allow modal to animate out
  };

  const handleDepositSuccess = () => {
    handleCloseModal();
    toast.success(t('deposit_success_toast', { currency: selectedWallet?.currency_code }));
    // Wait for potential webhook/callback before refetching
    setTimeout(() => refetchWallets(), 5000); 
  };

  const containerVariants = {
    hidden: { opacity: 1 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
               <div key={i} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 rounded-lg h-56 animate-pulse">
                    <div className="flex justify-between items-center"><div className="h-8 w-24 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div><div className="h-6 w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div></div>
                    <div className="mt-6"><div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div><div className="mt-2 h-8 w-2/3 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div></div>
                    <div className="mt-8 flex justify-between items-center space-x-3"><div className="h-12 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md"></div><div className="h-12 w-full bg-neutral-200 dark:bg-neutral-700 rounded-md"></div></div>
                </div>
            ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center bg-red-50 dark:bg-red-900/30 p-6 rounded-lg border border-red-200 dark:border-red-500/30">
          <h3 className="font-semibold text-red-800 dark:text-red-200">{t('wallets_loading_error_title')}</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{t('wallets_loading_error_desc')}</p>
          <Button onClick={() => refetchWallets()} className="mt-4">{t('wallets_try_again_button')}</Button>
        </div>
      );
    }

    if (!wallets || wallets.length === 0) {
      return (
          <div className="text-center py-20 border-2 border-dashed border-neutral-300 dark:border-neutral-700 rounded-lg">
              <WalletIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
              <h3 className="mt-2 text-sm font-semibold text-neutral-800 dark:text-white">{t('wallets_empty_state_title')}</h3>
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t('wallets_empty_state_desc')}</p>
              <div className="mt-6">
                <Button onClick={() => setIsAddWalletModalOpen(true)}>
                    <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
                    {t('add_wallet_button')}
                </Button>
              </div>
          </div>
      );
    }

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
              <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('wallets_title')}</h1>
              <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('wallets_subtitle')}</p>
          </div>
          <Button onClick={() => setIsAddWalletModalOpen(true)}>
            <PlusIcon className="h-5 w-5 mr-2" />
            {t('add_wallet_button')}
          </Button>
        </div>
        {renderContent()}
      </div>
      
      {selectedWallet && (
        <DepositModal
          isOpen={isDepositModalOpen}
          onClose={handleCloseModal}
          wallet={selectedWallet}
          onSuccess={handleDepositSuccess}
        />
      )}
      <AddWalletModal
        isOpen={isAddWalletModalOpen}
        onClose={() => setIsAddWalletModalOpen(false)}
        onSuccess={handleWalletAdded}
        existingWallets={wallets || []}
      />
    </DashboardLayout>
  );
};

export default WalletsPage;
