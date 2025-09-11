import React, { useState, useEffect } from 'react';
import { usePlaidLink } from 'react-plaid-link';
import { useApiPost } from '../../../hooks/useApi';
import apiClient from '../../../api/axiosConfig';
import Button from '../../common/Button';
import Spinner from '../../common/Spinner';
import { LinkIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const PlaidLink = ({ onLinkSuccess }) => {
    const [linkToken, setLinkToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isLinked, setIsLinked] = useState(false);

    // This hook will be used to exchange the public token
    const { post: exchangePublicToken } = useApiPost('/open-banking/plaid/exchange-public-token');

    // Fetch the link_token from our backend when the component mounts
    useEffect(() => {
        const createLinkToken = async () => {
            setIsLoading(true);
            try {
                const response = await apiClient.post('/open-banking/plaid/create-link-token');
                setLinkToken(response.data.link_token);
            } catch (error) {
                toast.error("Could not connect to our banking partner. Please try again later.");
                console.error("Plaid link_token creation failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        createLinkToken();
    }, []);

    const onSuccess = React.useCallback(async (public_token, metadata) => {
        // This function is called by the Plaid Link modal when the user
        // successfully links their account.
        const toastId = toast.loading("Securely linking your bank account...");
        const result = await exchangePublicToken({ public_token });

        if (result.success) {
            toast.success("Bank account linked successfully!", { id: toastId });
            setIsLinked(true);
            // In a full flow, you might proceed to a funding step here.
            // For now, we'll call the main success handler.
            if (onLinkSuccess) {
                onLinkSuccess();
            }
        } else {
            toast.error("Failed to link your bank account. Please try again.", { id: toastId });
        }
    }, [exchangePublicToken, onLinkSuccess]);

    // Initialize the Plaid Link hook
    const { open, ready } = usePlaidLink({
        token: linkToken,
        onSuccess,
        // onExit: (err, metadata) => console.log('Plaid Link exited', err, metadata),
    });

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center items-center h-full">
                <Spinner />
            </div>
        );
    }

    if (isLinked) {
        return (
             <div className="p-8 text-center space-y-4">
                <CheckCircleIcon className="h-16 w-16 mx-auto text-green-400"/>
                <h2 className="text-xl font-semibold text-white">Account Linked!</h2>
                <p className="text-neutral-300">Your bank account is now securely connected. You can now make deposits via ACH.</p>
                {/* A next step could be a form to enter the deposit amount */}
            </div>
        )
    }

    return (
        <div className="p-8 text-center flex flex-col justify-center items-center h-full">
            <LinkIcon className="h-12 w-12 text-primary" />
            <h3 className="mt-4 text-lg font-semibold text-white">Connect Your Bank Account</h3>
            <p className="mt-2 text-sm text-neutral-400 max-w-sm mx-auto">
                Securely link your bank account using Plaid to enable fast and low-cost ACH deposits. QuantumPay never sees your bank credentials.
            </p>
            <div className="mt-6 w-full">
                <Button onClick={() => open()} disabled={!ready} fullWidth>
                    Connect Securely with Plaid
                </Button>
            </div>
        </div>
    );
};

export default PlaidLink;