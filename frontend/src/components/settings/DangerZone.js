import React, { useState } from 'react';
import SettingsCard from './SettingsCard';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useApiPost } from '../../hooks/useApi';
import toast from 'react-hot-toast';

const DangerZone = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const { logout } = useAuth();

    // [THE FIX] Explicitly tell the hook to use the DELETE method for this action.
    const { post: deleteAccount, loading } = useApiPost('/users/me', { method: 'DELETE' });

    const handleDelete = async () => {
        if (confirmText !== 'delete my account') {
            toast.error("Confirmation text does not match.");
            return;
        }

        const result = await deleteAccount({}); // The body can be empty for a DELETE request

        // The useApiPost hook automatically handles success/error toasts.
        // We only need to handle the successful logout action.
        if (result.success) {
            // A slight delay to allow the user to read the success toast before being logged out.
            setTimeout(() => {
                logout();
            }, 1500);
        }
    };

    return (
        <>
            <SettingsCard
                title="Danger Zone"
                description="These actions are irreversible. Please be certain."
            >
                <div className="flex items-center justify-between p-4 border border-red-800 bg-red-900/20 rounded-lg">
                    <div>
                        <p className="font-semibold text-white">Delete Account</p>
                        <p className="text-sm text-neutral-400">Permanently delete your account and all associated data.</p>
                    </div>
                    <Button variant="danger" onClick={() => setIsModalOpen(true)}>Delete My Account</Button>
                </div>
            </SettingsCard>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Account Deletion">
                <div className="space-y-4">
                    <p className="text-neutral-300">This action is permanent. All your data, including wallets and transaction history, will be permanently removed.</p>
                    <p className="text-white">To confirm, please type <strong className="font-mono text-red-400">delete my account</strong> below.</p>
                    <input
                        type="text"
                        value={confirmText}
                        onChange={(e) => setConfirmText(e.target.value)}
                        className="w-full bg-neutral-800 border-neutral-700 p-2 rounded-md text-white font-mono"
                        placeholder="delete my account"
                    />
                    <div className="flex justify-end pt-4">
                        <Button
                            variant="danger"
                            onClick={handleDelete}
                            isLoading={loading}
                            disabled={confirmText.toLowerCase() !== 'delete my account' || loading}
                        >
                            I understand, Delete My Account
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default DangerZone;