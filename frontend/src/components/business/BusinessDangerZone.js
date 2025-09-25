import React, { useState } from 'react';
import SettingsCard from '../settings/SettingsCard';
import Button from '../common/Button';
import Modal from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { useApiPost } from '../../hooks/useApi';
import { toastSuccess, toastError } from '../../components/common/Toast';

const BusinessDangerZone = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { fetchDbUser } = useAuth();
    const { post: deleteProfile, loading } = useApiPost('/business/profile', { method: 'DELETE' });

    const handleDelete = async () => {
        const result = await deleteProfile({});
        if (result.success) {
            toast.success("Your business profile has been deleted.");
            fetchDbUser(); // Refresh state, which will remove business tools
            setIsModalOpen(false);
        }
    };

    return (
        <>
            <SettingsCard
                title="Danger Zone"
                description="These actions have permanent consequences."
            >
                <div className="flex items-center justify-between p-4 border border-red-800 bg-red-900/20 rounded-lg">
                    <div>
                        <p className="font-semibold text-white">Delete Business Profile</p>
                        <p className="text-sm text-neutral-400">Permanently delete your business profile and all associated data (invoices, employees, etc.). This does not affect your personal account.</p>
                    </div>
                    <Button variant="danger" onClick={() => setIsModalOpen(true)}>Delete Profile</Button>
                </div>
            </SettingsCard>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Business Profile Deletion">
                <div className="space-y-4">
                    <p className="text-neutral-300">Are you sure you want to permanently delete your business profile? All associated business data will be lost. This action cannot be undone.</p>
                    <div className="flex justify-end pt-4 space-x-3">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                        <Button variant="danger" onClick={handleDelete} isLoading={loading}>Yes, Delete Business</Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default BusinessDangerZone;