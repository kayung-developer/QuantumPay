import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../common/Button';
import { ArrowUpOnSquareIcon, CheckBadgeIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../context/AuthContext';

const VaultDetails = ({ vault }) => {
    const { dbUser } = useAuth();
    if (!vault) return null;

    const userIsAdmin = true; // Placeholder for role logic

    return (
        <motion.div
            key={vault.id} // Ensures re-animation when vault changes
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-6"
        >
            {/* Header */}
            <div className="border-b border-neutral-800 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold font-display text-white">{vault.name}</h2>
                        <p className="text-neutral-400 text-sm mt-1">{vault.description}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-neutral-400">Total Balance</p>
                        <p className="text-3xl font-bold font-display text-primary-light">
                             {new Intl.NumberFormat('en-US', { style: 'currency', currency: vault.currency }).format(vault.balance)}
                        </p>
                    </div>
                </div>
                 <div className="mt-4">
                    <Button><ArrowUpOnSquareIcon className="h-5 w-5 mr-2" /> Request Withdrawal</Button>
                 </div>
            </div>

            {/* Pending Requests */}
            <div>
                 <h3 className="text-lg font-semibold text-white">Pending Requests</h3>
                 <div className="mt-4 text-center text-sm text-neutral-500 p-8 bg-neutral-800/50 rounded-lg">
                    No pending withdrawal requests.
                 </div>
            </div>

            {/* Members */}
            <div>
                 <h3 className="text-lg font-semibold text-white">Members ({vault.members.length})</h3>
                 <p className="text-xs text-neutral-500">Requires {vault.approval_threshold} approval(s) for withdrawals.</p>
                 <ul className="mt-4 space-y-3">
                    {vault.members.map(member => (
                        <li key={member.id} className="flex items-center justify-between p-3 bg-neutral-800/50 rounded-md">
                            <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center font-bold text-white">
                                    {member.full_name ? member.full_name.charAt(0) : 'U'}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-white">{member.full_name} {member.id === dbUser.id && '(You)'}</p>
                                    <p className="text-xs text-neutral-400">{member.email}</p>
                                </div>
                            </div>
                            {userIsAdmin && member.id === dbUser.id && (
                                <CheckBadgeIcon className="h-5 w-5 text-yellow-400" title="Admin"/>
                            )}
                        </li>
                    ))}
                 </ul>
            </div>
        </motion.div>
    );
};

export default VaultDetails;