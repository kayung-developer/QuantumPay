// FILE: src/pages/dashboard/MyExpensesPage.js

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useDropzone } from 'react-dropzone';

// --- Component Imports ---
import DashboardLayout from '../../components/layout/DashboardLayout';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Modal from '../../components/common/Modal';
import { toast } from 'react-hot-toast';

// --- Hook Imports ---
import { useApi, useApiPost } from '../../hooks/useApi';
import apiClient from '../../api/axiosConfig'; // Used for the direct-to-cloud upload flow

// --- Icon Imports ---
import { PlusIcon, DocumentTextIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';

// --- [THE DEFINITIVE IMPLEMENTATION] Submit Expense Modal with Secure, Direct-to-Cloud Upload ---
const SubmitExpenseModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation();
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    
    // This hook is for the FINAL step: sending the Cloudinary URL to our backend.
    const { post: submitExpenseForReview, loading: isSubmitting } = useApiPost('/business/expenses');

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            // Basic file size validation (e.g., 5MB)
            if (acceptedFiles[0].size > 5 * 1024 * 1024) {
                toast.error("File is too large. Please upload a receipt under 5MB.");
                return;
            }
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [], 'application/pdf': [] },
        maxFiles: 1,
    });

    const handleSubmit = async () => {
        if (!file) {
            toast.error("Please select a receipt file to upload.");
            return;
        }
        setIsUploading(true);
        try {
            // Step 1: Get a secure upload signature from our backend.
            const sigResponse = await apiClient.get(`/compliance/upload-signature?upload_preset=expense_receipts`);
            const { signature, timestamp, api_key, cloud_name, folder } = sigResponse.data;

            // Step 2: Upload the file DIRECTLY to Cloudinary's API.
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('folder', folder);

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadData.error.message);
            
            setIsUploading(false); // Upload is done, now submit to our server.

            // Step 3: Send the secure URL of the uploaded file to our backend.
            const result = await submitExpenseForReview({ receipt_url: uploadData.secure_url });
            if (result.success) {
                onSuccess(result.data); // Pass the new expense data back
            }
        } catch (err) {
            toast.error(err.message || "An error occurred during upload. Please try again.");
            setIsUploading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit New Expense">
            <div className="space-y-4">
                <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-neutral-300 dark:border-neutral-700 hover:border-primary'}`}>
                    <input {...getInputProps()} />
                    <ArrowUpOnSquareIcon className="h-10 w-10 mx-auto text-neutral-400 dark:text-neutral-500" />
                    {file ? (
                        <p className="mt-2 text-green-500 font-semibold">{file.name}</p>
                    ) : (
                        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Drag & drop receipt, or click to select</p>
                    )}
                     <p className="text-xs text-neutral-500 mt-1">PNG, JPG, PDF (Max 5MB)</p>
                </div>
                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSubmit} isLoading={isUploading || isSubmitting} disabled={!file}>
                        {isUploading ? 'Uploading Receipt...' : 'Submit for Approval'}
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

const MyExpensesPage = () => {
    const { t } = useTranslation();
    const { data: expenses, loading, error, request: refetch } = useApi('/users/me/expenses');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = () => {
        setIsModalOpen(false);
        refetch();
        toast.success("Expense submitted successfully for approval!");
    };

    const statusStyles = {
        PENDING: 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300',
        APPROVED: 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300',
        REJECTED: 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300',
        REIMBURSED: 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300',
    };

    const renderContent = () => {
        if (loading) return <div className="p-12 text-center"><Spinner /></div>;
        if (error) return <div className="p-12 text-center text-red-400">Could not load your expense history.</div>;
        if (!expenses || expenses.length === 0) {
            return (
                <div className="text-center py-16">
                    <DocumentTextIcon className="mx-auto h-12 w-12 text-neutral-400 dark:text-neutral-500" />
                    <h3 className="mt-2 text-sm font-semibold text-neutral-800 dark:text-white">You haven't submitted any expenses yet.</h3>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">Click "Submit Expense" to get started.</p>
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Submitted</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {expenses.map(exp => (
                            <tr key={exp.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <a href={exp.receipt_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">{exp.merchant_name}</a>
                                </td>
                                <td className="px-6 py-4 font-medium text-neutral-800 dark:text-white">{new Intl.NumberFormat().format(exp.amount)} {exp.currency}</td>
                                <td className="px-6 py-4 text-sm text-neutral-600 dark:text-neutral-400">{formatDistanceToNow(parseISO(exp.submitted_at), { addSuffix: true })}</td>
                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full capitalize ${statusStyles[exp.status]}`}>{exp.status.replace('_', ' ')}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="my_expenses_title">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">My Expenses</h1>
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">Submit and track your business expense reports for reimbursement.</p>
                    </div>
                    <Button onClick={() => setIsModalOpen(true)}>
                        <PlusIcon className="h-5 w-5 mr-2"/>
                        Submit Expense
                    </Button>
                </div>
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
                    {renderContent()}
                </div>
            </div>
            <SubmitExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={handleSuccess}
            />
        </DashboardLayout>
    );
};

export default MyExpensesPage;