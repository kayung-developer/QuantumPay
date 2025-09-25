import React from 'react';
import { toastSuccess, toastError } from '../../components/common/Toast';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import useApi from '../../../hooks/useApi';
import Spinner from '../../common/Spinner';
import Button from '../../common/Button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const DetailRow = ({ label, value }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        toastSuccess(`${label} copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        // [THEME AWARE] Update border color
        <div className="flex justify-between items-center py-3 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
            {/* [THEME AWARE] Update label text color */}
            <span className="text-sm text-neutral-600 dark:text-neutral-400">{label}</span>
            <div className="flex items-center space-x-3">
                {/* [THEME AWARE] Update value text color */}
                <span className="font-semibold text-neutral-900 dark:text-white">{value}</span>
                <button onClick={handleCopy} disabled={!value}>
                    {copied ? (
                        <CheckIcon className="h-5 w-5 text-green-500" />
                    ) : (
                        // [THEME AWARE] Update icon color
                        <ClipboardDocumentIcon className="h-5 w-5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-800 dark:hover:text-white" />
                    )}
                </button>
            </div>
        </div>
    );
};

const BankTransferDetails = ({ wallet }) => {
    const { data: accountDetails, loading, error, request: fetchAccountDetails } = useApi(
        wallet ? `/virtual-accounts/${wallet.id}` : null
    );

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex-grow flex justify-center items-center">
                    <div className="text-center">
                        <Spinner />
                        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Generating your unique account details...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            return (
                <div className="flex-grow flex flex-col justify-center items-center p-4 text-center">
                    <div className="text-red-500">
                        <ExclamationTriangleIcon className="h-10 w-10 mx-auto text-red-500" />
                        <h4 className="mt-2 font-semibold text-neutral-900 dark:text-white">Could Not Get Account Details</h4>
                        <p className="text-sm mt-1 text-red-500 dark:text-red-400">
                            {error.message || "The virtual account service is temporarily unavailable."}
                        </p>
                    </div>
                     <Button onClick={() => fetchAccountDetails()} className="mt-6" variant="secondary">
                        Try Again
                     </Button>
                </div>
            );
        }

        if (accountDetails) {
            return (
                <div className="flex-grow flex flex-col">
                    <div className="mt-4 space-y-2 flex-grow">
                        <DetailRow label="Bank Name" value={accountDetails.bank_name} />
                        <DetailRow label="Account Number" value={accountDetails.account_number} />
                        <DetailRow label="Account Name" value={accountDetails.account_name} />
                    </div>
                    <p className="text-xs text-center text-neutral-500 dark:text-neutral-500 mt-4">
                        This is a dedicated virtual account. Transfers may take up to 2 minutes to reflect.
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="p-6 flex-grow flex flex-col min-h-[350px]">
            {/* [THEME AWARE] Update text colors */}
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Transfer to this Account</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                To fund your {wallet.currency_code} wallet, make a bank transfer from any Nigerian bank app to the details below.
            </p>
            {renderContent()}
        </div>
    );
};

export default BankTransferDetails;