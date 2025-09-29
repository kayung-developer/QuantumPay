// FILE: src/pages/business/BatchPayoutsPage.js

import React, { useState, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDropzone } from 'react-dropzone';
import { format, parseISO } from 'date-fns';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import UpgradePrompt from '../../components/common/UpgradePrompt'; // Assuming this component exists
import { DocumentArrowDownIcon, DocumentArrowUpIcon, BanknotesIcon, CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import apiClient from '../../api/axiosConfig';

const BatchPayoutsPage = () => {
    const { t } = useTranslation();
    const { hasActiveSubscription, authToken } = useAuth();
    const isFeatureUnlocked = hasActiveSubscription('ultimate');
    
    const { data: runs, loading, error, request: refetchRuns } = useApi('/business/batch-payouts', {}, !isFeatureUnlocked);
    const [isUploading, setIsUploading] = useState(false);
    
    const onDrop = useCallback(async (acceptedFiles) => {
        if (!isFeatureUnlocked) return;
        if (acceptedFiles.length === 0) {
            toast.error("Please select a valid CSV file.");
            return;
        }
        const file = acceptedFiles[0];
        
        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            await apiClient.post('/business/batch-payouts/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${authToken}`
                }
            });
            toast.success("File uploaded! Payouts are now being processed in the background.");
            // Add a small delay before refetching to allow the backend to create the record
            setTimeout(() => refetchRuns(), 1000);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || "File upload failed. Please check the CSV format and your balance.";
            toast.error(errorMessage);
        } finally {
            setIsUploading(false);
        }
    }, [authToken, refetchRuns, isFeatureUnlocked]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
        onDrop, 
        accept: {'text/csv': ['.csv']},
        maxFiles: 1,
        disabled: !isFeatureUnlocked || isUploading
    });
    
    const downloadTemplate = () => {
        const csvHeader = "recipient_email,amount,currency,description\n";
        const csvExample = "employee.one@example.com,500.00,USD,Bonus for Q3\ncontractor.two@example.com,1250.75,NGN,Payment for services\n";
        const csvContent = "data:text/csv;charset=utf-8," + encodeURI(csvHeader + csvExample);
        
        const link = document.createElement("a");
        link.setAttribute("href", csvContent);
        link.setAttribute("download", "quantumpay_payout_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const getStatusIndicator = (status) => {
        const statusMap = {
            processing: { icon: ClockIcon, color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300', label: 'Processing' },
            completed: { icon: CheckCircleIcon, color: 'text-green-500 bg-green-100 dark:bg-green-900/50 dark:text-green-300', label: 'Completed' },
            failed: { icon: XCircleIcon, color: 'text-red-500 bg-red-100 dark:bg-red-900/50 dark:text-red-300', label: 'Failed' },
        };
        const config = statusMap[status] || { icon: ClockIcon, color: 'text-neutral-500 bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-300', label: status };
        const Icon = config.icon;
        return (
            <span className={`inline-flex items-center gap-x-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.color}`}>
                <Icon className="-ml-0.5 h-3.5 w-3.5" />
                {config.label}
            </span>
        );
    };

    const renderHistory = () => {
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <p className="p-12 text-center text-red-500">Could not load batch payout history.</p>;
        }
        if (!runs || runs.length === 0) {
            return <p className="p-12 text-center text-neutral-500 dark:text-neutral-400">No batch payouts have been initiated yet.</p>;
        }
        
        return (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{t('batch_processed_on')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{t('batch_status_label')}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{t('batch_recipients_label')}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">{t('batch_total_label')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {runs.map(run => (
                            <tr key={run.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-800 dark:text-neutral-200">{format(parseISO(run.created_at), 'MMM d, yyyy, p')}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusIndicator(run.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                                    <span className="text-green-500">{run.success_count} Succeeded</span>, <span className="text-red-500">{run.failed_count} Failed</span> of {run.total_recipients}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold text-neutral-900 dark:text-white">
                                    {new Intl.NumberFormat('en-US', { style: 'currency', currency: run.currency }).format(run.total_amount)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="batch_payouts_title">
             <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white flex items-center">
                        <BanknotesIcon className="h-8 w-8 mr-3 text-primary" />
                        {t('batch_payouts_title')}
                    </h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('batch_payouts_subtitle')}</p>
                </div>
                {isFeatureUnlocked && (
                    <Button onClick={downloadTemplate} variant="link">
                        <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                        {t('download_template_link')}
                    </Button>
                )}
            </div>

            {isFeatureUnlocked ? (
                <div className="space-y-6">
                    <div {...getRootProps()} className={`relative p-12 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${!isFeatureUnlocked || isUploading ? 'cursor-not-allowed bg-neutral-50 dark:bg-neutral-800/50' : isDragActive ? 'border-primary bg-primary/10' : 'border-neutral-300 dark:border-neutral-700 hover:border-primary'}`}>
                        <input {...getInputProps()} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <DocumentArrowUpIcon className="h-12 w-12 mx-auto text-neutral-400 dark:text-neutral-500" />
                            <p className="mt-2 font-semibold text-neutral-900 dark:text-white">{t('upload_csv_button')}</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">{t('batch_upload_instructions')}</p>
                            {isUploading && <div className="mt-4"><Spinner /> <p className="text-sm mt-2">Uploading and validating...</p></div>}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-xl font-semibold mb-4 text-neutral-900 dark:text-white">Payout History</h3>
                        {renderHistory()}
                    </div>
                </div>
            ) : (
                <UpgradePrompt featureName="Batch Payments (Mass Payouts)" requiredPlan="Ultimate" />
            )}
        </DashboardLayout>
    );
};

export default BatchPayoutsPage;