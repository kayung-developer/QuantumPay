// FILE: src/components/business/settings/BusinessDangerZone.js

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

// --- Component Imports ---
import SettingsCard from '../../../components/settings/SettingsCard';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';

// --- Hook Imports ---
import { useAuth } from '../../../context/AuthContext';
import { useApiPost } from '../../../hooks/useApi';

const BusinessDangerZone = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { fetchDbUser } = useAuth();
    
    // Correctly configure the useApiPost hook to send a DELETE request.
    const { post: deleteProfile, loading } = useApiPost('/business/profile', { method: 'DELETE' });

    const handleDelete = async () => {
        const result = await deleteProfile({}); // The body can be empty for a DELETE request.
        
        if (result.success) {
            toast.success("Your business profile has been deleted.");
            
            // [CRITICAL UX] Refresh the global user state. This will remove the business_profile
            // from the user object, causing all business-related UI to disappear automatically.
            fetchDbUser(); 
            
            setIsModalOpen(false);
        }
        // The useApiPost hook will automatically show an error toast on failure.
    };

    return (
        <>
            <SettingsCard
                title="Danger Zone"
                description="These actions have permanent consequences."
            >
                {/* A visually distinct container to warn the user */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-red-800 bg-red-900/20 rounded-lg">
                    <div className="mb-4 sm:mb-0">
                        <p className="font-semibold text-white">Delete Business Profile</p>
                        <p className="text-sm text-neutral-400 max-w-md">
                            Permanently delete your business profile and all associated data (invoices, employees, payment links, etc.). This action does not affect your personal account.
                        </p>
                    </div>
                    <Button variant="danger" onClick={() => setIsModalOpen(true)}>
                        Delete Profile
                    </Button>
                </div>
            </SettingsCard>

            {/* Confirmation Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Confirm Business Profile Deletion">
                <div className="space-y-4">
                    <p className="text-neutral-300">
                        Are you absolutely sure you want to permanently delete your business profile? All associated business data will be lost forever. This action cannot be undone.
                    </p>
                    <div className="flex justify-end pt-4 space-x-3 border-t border-neutral-800">
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={loading}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete} isLoading={loading}>
                            Yes, Delete Business
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
};

export default BusinessDangerZone;