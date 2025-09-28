import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { formatDistanceToNow, parseISO } from 'date-fns';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi, useApiPost } from '../../hooks/useApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import UpgradePrompt from '../../components/common/UpgradePrompt';
import { CheckCircleIcon, CircleStackIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';

// --- Sub-component for the "Not Connected" state ---
const InitialState = ({ onConnect, isLoading }) => {
    const { t } = useTranslation();
    return (
        <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg text-center">
            <img src="/img/logos/quickbooks.svg" alt="QuickBooks Logo" className="h-12 mx-auto filter dark:invert" />
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
                Connect your QuickBooks account to automatically sync your sales, expenses, and payroll data every night. Save hours of manual data entry.
            </p>
            <Button onClick={onConnect} isLoading={isLoading} className="mt-6">
                {t('connect_button', { provider: 'QuickBooks' })}
            </Button>
        </div>
    );
};

// --- Sub-component for the "Connected" state ---
const ConnectedState = ({ status, onDisconnect, isLoading }) => {
    const { t } = useTranslation();
    return (
        <div className="p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
            <div className="flex flex-col sm:flex-row items-center sm:justify-between">
                <div className="flex items-center">
                    <img src="/img/logos/quickbooks.svg" alt="QuickBooks Logo" className="h-10 filter dark:invert" />
                    <div className="ml-4">
                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">QuickBooks Online</h3>
                        <span className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300">
                            <CheckCircleIcon className="h-4 w-4" />
                            {t('status_connected')}
                        </span>
                    </div>
                </div>
                <Button onClick={onDisconnect} isLoading={isLoading} variant="danger" className="mt-4 sm:mt-0">
                    {t('disconnect_button')}
                </Button>
            </div>
            <div className="mt-6 border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {t('last_sync_label')}: <span className="font-medium text-neutral-800 dark:text-neutral-200">{status.last_sync ? formatDistanceToNow(parseISO(status.last_sync), { addSuffix: true }) : t('sync_never')}</span>
                </p>
            </div>
        </div>
    );
};

const { post: disconnectApiCall } = useApiPost('/accounting/disconnect');
// --- Main Accounting Sync Page Component ---
const AccountingSyncPage = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription } = useAuth();
    const isFeatureUnlocked = hasActiveSubscription('ultimate');
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const { data: status, loading, error, request: refetchStatus } = useApi('/accounting/status', {}, !isFeatureUnlocked);
    const { post: getAuthUrl, loading: authUrlLoading } = useApiPost('/accounting/quickbooks/authorize-url');
    const { post: handleCallbackPost, loading: callbackLoading } = useApiPost('/accounting/quickbooks/callback'); // We need a POST endpoint for this

    // [REAL SYSTEM] Handle the OAuth2 callback from QuickBooks
    useEffect(() => {
        const code = searchParams.get('code');
        const realmId = searchParams.get('realmId');
        const state = searchParams.get('state');

        if (code && realmId && state) {
            const processCallback = async () => {
                const result = await handleCallbackPost({ code, realmId, state });
                if (result.success) {
                    refetchStatus(); // Refresh the UI to show the "Connected" state
                }
                // Clean the URL by removing the query parameters
                navigate('/business/accounting-sync', { replace: true });
            };
            processCallback();
        }
    }, [searchParams, handleCallbackPost, navigate, refetchStatus]);


    const handleConnect = async () => {
        const result = await getAuthUrl();
        if (result.success && result.data.authorization_url) {
            window.location.href = result.data.authorization_url;
        }
    };

    const handleDisconnect = async () => {
        // You would create a '/accounting/disconnect' endpoint in main.py
        if (window.confirm("Are you sure you want to disconnect? Your data will no longer sync automatically.")) {
            const result = await disconnectApiCall();
            if (result.success) refetchStatus();
            toast.success("Disconnected successfully.");
        }
    };

    const renderContent = () => {
        if (!isFeatureUnlocked) {
            return <UpgradePrompt featureName="Automated Accounting Sync" requiredPlan="Ultimate" />;
        }
        if (loading || callbackLoading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return (
                <div className="p-8 text-center bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-500/30 rounded-lg">
                    <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mx-auto"/>
                    <h3 className="mt-2 font-semibold text-red-800 dark:text-red-300">Could not load integration status.</h3>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">{error.message}</p>
                </div>
            );
        }
        
        if (status && status.is_active) {
            return <ConnectedState status={status} onDisconnect={handleDisconnect} />;
        }
        
        return <InitialState onConnect={handleConnect} isLoading={authUrlLoading} />;
    };

    return (
        <DashboardLayout pageTitleKey="accounting_sync_title">
             <div className="mb-6">
                <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white flex items-center">
                    <CircleStackIcon className="h-8 w-8 mr-3 text-primary"/>
                    {t('accounting_sync_title')}
                </h1>
                <p className="mt-1 text-neutral-600 dark:text-neutral-400">
                    {t('accounting_sync_subtitle')}
                </p>
            </div>
            {renderContent()}
        </DashboardLayout>
    );
};


export default AccountingSyncPage;
