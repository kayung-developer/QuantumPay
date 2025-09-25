import React from 'react';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import { motion } from 'framer-motion';
import { LockClosedIcon, WifiIcon } from '@heroicons/react/24/solid';

const CardDetailsModal = ({ isOpen, onClose, card }) => {
  if (!card) return null;

  const spendPercentage = (card.current_spend / card.monthly_limit) * 100;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Card Details" size="lg">
      <div className="space-y-6">
        {/* Card Visual */}
        <motion.div
            initial={{ opacity: 0, scale: 0.8, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 150, damping: 20 }}
            className="w-full max-w-sm mx-auto p-6 rounded-xl bg-gradient-to-br from-primary to-blue-600 text-white shadow-2xl"
        >
          <div className="flex justify-between items-start">
            <span className="font-display font-bold text-xl">QuantumPay</span>
            <WifiIcon className="h-6 w-6" />
          </div>
          <div className="mt-8">
            <p className="font-mono text-xl tracking-widest">{card.card_number}</p>
          </div>
          <div className="mt-6 flex justify-between items-end">
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

        {/* Card Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
                <p className="text-neutral-600 dark:text-neutral-400">Card Type</p>
                <p className="font-semibold text-white capitalize">{card.card_type}</p>
            </div>
             <div className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-lg">
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
            <div
              className="bg-primary h-2.5 rounded-full"
              style={{ width: `${spendPercentage}%` }}
            ></div>
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