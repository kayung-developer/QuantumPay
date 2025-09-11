import React from 'react';
import toast from 'react-hot-toast';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import useApi from '../../../hooks/useApi';
import Spinner from '../../common/Spinner';
import Button from '../../common/Button'; // Import Button for the retry action

const DetailRow = ({ label, value }) => {
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        if (!value) return;
        navigator.clipboard.writeText(value);
        setCopied(true);
        toast.success(`${label} copied!`);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex justify-between items-center py-3 border-b border-neutral-800 last:border-b-0">
            <span className="text-sm text-neutral-400">{label}</span>
            <div className="flex items-center space-x-3">
                <span className="font-semibold text-white">{value}</span>
                <button onClick={handleCopy} disabled={!value}>
                    {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardDocumentIcon className="h-5 w-5 text-neutral-500 hover:text-white" />}
                </button>
            </div>
        </div>
    );
};

const BankTransferDetails = ({ wallet }) => {
    // [DEFINITIVE FIX] Get the `request` function from useApi to allow retrying
    const { data: accountDetails, loading, error, request: fetchAccountDetails } = useApi(`/virtual-accounts/${wallet.id}`);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex-grow flex justify-center items-center">
                    <div className="text-center">
                        <Spinner />
                        <p className="mt-2 text-sm text-neutral-400">Generating your unique account details...</p>
                    </div>
                </div>
            );
        }

        if (error) {
            // [DEFINITIVE FIX] Display the detailed error message from Axios/useApi
            return (
                <div className="flex-grow flex flex-col justify-center items-center p-4 text-center">
                    <div className="text-red-400">
                        <h4 className="font-semibold text-white">Could Not Get Account Details</h4>
                        <p className="text-sm mt-2">
                            {/* Axios network errors have a `message`, while API errors have `error.response.data.detail` */}
                            {error.response?.data?.detail || error.message || "The virtual account service is temporarily unavailable."}
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
                    <div className="mt-6 space-y-2 flex-grow">
                        <DetailRow label="Bank Name" value={accountDetails.bank_name} />
                        <DetailRow label="Account Number" value={accountDetails.account_number} />
                        <DetailRow label="Account Name" value={accountDetails.account_name} />
                    </div>
                    <p className="text-xs text-center text-neutral-500 mt-4">
                        This is a dedicated virtual account for your QuantumPay wallet. Transfers may take up to 2 minutes to reflect.
                    </p>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="p-6 flex-grow flex flex-col min-h-[350px]">
            <h3 className="text-lg font-semibold text-white">Transfer to this Account</h3>
            <p className="text-sm text-neutral-400 mt-1">
                To fund your {wallet.currency_code} wallet, make a bank transfer from any Nigerian bank app to the details below.
            </p>
            {renderContent()}
        </div>
    );
};

export default BankTransferDetails;