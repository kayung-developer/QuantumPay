// FILE: frontend/src/components/dashboard/business/CardDetailsModal.js

import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { LockClosedIcon, WifiIcon, EyeIcon, EyeSlashIcon, ArrowPathIcon, CpuChipIcon, StarIcon } from '@heroicons/react/24/solid';

import IconLogo24 from '../../icons/IconLogo24';
// --- QuantumPay Logo SVG for the card ---
const QuantumPayLogo = () => (
 <div className="flex items-center space-x-2">
     <IconLogo24 className="h-6 w-auto" /> {/* Example styling */}
        <span className="font-display text-3xl font-bold text-neutral-900 dark:text-white">
            QuantumPay
        </span>
    </div>
);

const CardDetailsModal = ({ isOpen, onClose, card }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  useEffect(() => {
    // Reset state when modal opens or card changes
    setIsFlipped(false);
    setIsRevealed(false);
  }, [isOpen, card]);

  useEffect(() => {
    let timer;
    if (isRevealed) {
      // Auto-hide sensitive info after 7 seconds for security
      timer = setTimeout(() => setIsRevealed(false), 7000);
    }
    return () => clearTimeout(timer);
  }, [isRevealed]);

  if (!card) return null;

  const spendPercentage = (card.current_spend / card.monthly_limit) * 100;
  const isPremium = card.card_tier === 'premium';
  const cardBg = isPremium
    ? 'from-neutral-800 to-black bg-gradient-to-br'
    : 'from-primary to-blue-600 bg-gradient-to-br';

  const formatCardNumber = (number) => {
    if (isRevealed) {
        return number.replace(/(.{4})/g, '$1 ').trim();
    }
    return `**** **** **** ${number.slice(-4)}`;
  };

  const CardFront = () => (
    <motion.div
        className={`absolute inset-0 w-full h-full p-6 rounded-xl text-white shadow-2xl flex flex-col justify-between [backface-visibility:hidden] ${cardBg}`}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: 0 }}
        exit={{ rotateY: -180 }}
        transition={{ duration: 0.5 }}
    >
        <div className="flex justify-between items-start">
            <QuantumPayLogo className="h-6 text-white" />
            <div className="flex items-center space-x-2">
                {isPremium && <StarIcon className="h-6 w-6 text-amber-400" />}
                <WifiIcon className="h-6 w-6" />
            </div>
        </div>
        <div>
            <CpuChipIcon className="h-10 w-10 text-neutral-300/70 mb-2" />
            <p className="font-mono text-2xl tracking-wider">{formatCardNumber(card.card_number)}</p>
        </div>
        <div className="flex justify-between items-end text-sm">
            <div>
                <p className="text-xs opacity-70">Card Holder</p>
                <p className="font-medium">{card.assigned_user.full_name}</p>
            </div>
            <div>
                <p className="text-xs opacity-70">Expires</p>
                <p className="font-medium">{card.expiry_date}</p>
            </div>
        </div>
    </motion.div>
  );

  const CardBack = () => (
    <motion.div
        className={`absolute inset-0 w-full h-full rounded-xl text-black shadow-2xl [transform:rotateY(180deg)] [backface-visibility:hidden] ${cardBg}`}
        initial={{ rotateY: 180 }}
        animate={{ rotateY: 180 }}
        exit={{ rotateY: 0 }}
        transition={{ duration: 0.5 }}
    >
        <div className="w-full h-12 bg-black mt-6"></div>
        <div className="px-6 py-4 flex items-center justify-end space-x-4 bg-neutral-200 mt-4">
            <p className="text-sm italic">CVV</p>
            <p className="font-mono text-lg font-bold tracking-widest bg-white px-3 py-1 rounded">
                {isRevealed ? card.cvv : '***'}
            </p>
        </div>
        <div className="px-6 mt-4">
            <QuantumPayLogo className="h-5 text-white/70" />
        </div>
    </motion.div>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Details" size="lg">
      <div className="space-y-6">
        {/* Card Visual with 3D Flip */}
        <div className="w-full max-w-sm mx-auto h-56 [perspective:1000px]">
            <motion.div
                className="relative w-full h-full [transform-style:preserve-3d]"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            >
                <AnimatePresence>
                    {!isFlipped ? <CardFront key="front" /> : <CardBack key="back" />}
                </AnimatePresence>
            </motion.div>
        </div>

        {/* Secure Details Controls */}
        <div className="flex justify-center items-center space-x-3">
            <Button variant="secondary" onClick={() => setIsRevealed(!isRevealed)} size="sm">
                {isRevealed ? <EyeSlashIcon className="h-5 w-5 mr-2" /> : <EyeIcon className="h-5 w-5 mr-2" />}
                {isRevealed ? 'Hide Details' : 'Reveal Details'}
            </Button>
            <Button variant="secondary" onClick={() => setIsFlipped(!isFlipped)} size="sm">
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                {isFlipped ? 'Show Front' : 'Show CVV'}
            </Button>
        </div>


        {/* Card Info */}
        <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg text-center">
                <p className="text-neutral-600 dark:text-neutral-400">Card Type</p>
                <p className="font-semibold text-white capitalize">{card.card_type}</p>
            </div>
             <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg text-center">
                <p className="text-neutral-600 dark:text-neutral-400">Tier</p>
                <p className="font-semibold text-white capitalize">{card.card_tier}</p>
            </div>
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg text-center">
                <p className="text-neutral-600 dark:text-neutral-400">Status</p>
                <p className={`font-semibold capitalize ${card.is_active ? 'text-green-400' : 'text-red-400'}`}>
                    {card.is_active ? 'Active' : 'Frozen'}
                </p>
            </div>
        </div>

        {/* Spending Limit */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium text-white">Monthly Spend</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              <span className="text-white">${card.current_spend.toFixed(2)}</span> / ${card.monthly_limit.toFixed(2)}
            </span>
          </div>
          <div className="w-full bg-neutral-700 rounded-full h-2.5">
            <motion.div
              className="bg-primary h-2.5 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${spendPercentage}%` }}
              transition={{ delay: 0.5, type: 'spring' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 flex justify-center space-x-3 border-t border-neutral-200 dark:border-neutral-800">
            <Button variant={card.is_active ? 'danger' : 'secondary'}>
                <LockClosedIcon className="h-5 w-5 mr-2"/>
                {card.is_active ? 'Freeze Card' : 'Unfreeze Card'}
            </Button>
            <Button variant="secondary" disabled>Edit Limit</Button>
        </div>
      </div>
    </Modal>
  );
};

export default CardDetailsModal;



