import React, { useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi, { useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { PlusIcon, DocumentTextIcon, ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import Modal from '../../components/common/Modal';
import { useDropzone } from 'react-dropzone';
import Spinner from '../../components/common/Spinner';
import { format, formatDistanceToNow } from 'date-fns';
import apiClient from '../../api/axiosConfig'; // <-- THE FIX IS HERE: Import apiClient

// --- Submit Expense Modal Component (with Real File Upload) ---
const SubmitExpenseModal = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const { post: submitExpenseForReview } = useApiPost('/business/expenses');

    const onDrop = useCallback(acceptedFiles => { if (acceptedFiles.length > 0) setFile(acceptedFiles[0]); }, []);
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpeg', '.png'], 'application/pdf': ['.pdf'] }, maxFiles: 1 });

    const handleSubmit = async () => {
        if (!file) { toast.error("Please select a file."); return; }
        setIsUploading(true);
        try {
            // Step 1: Get secure upload signature from our backend
            const sigResponse = await apiClient.get(`/compliance/upload-signature?upload_preset=expense_receipts`);
            const { signature, timestamp, api_key, upload_preset } = sigResponse.data;

            // Step 2: Upload the file DIRECTLY to Cloudinary
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('upload_preset', upload_preset);

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/auto/upload`, {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadData.error.message);

            // Step 3: Send the secure URL to our backend
            const result = await submitExpenseForReview({ receipt_url: uploadData.secure_url });
            if (result.success) onSuccess(result.data);

        } catch (err) {
            toast.error(err.message || "An error occurred.");
        } finally {
            setIsUploading(false);
            setFile(null);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Submit New Expense">
            <div className="space-y-4">
                <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-neutral-700 hover:border-primary'}`}>
                    <input {...getInputProps()} />
                    <ArrowUpOnSquareIcon className="h-10 w-10 mx-auto text-neutral-500" />
                    {file ? (
                        <p className="mt-2 text-green-400 font-semibold">{file.name}</p>
                    ) : (
                        <p className="mt-2 text-neutral-400">Drag & drop receipt, or click to select</p>
                    )}
                </div>
                <div className="pt-4 flex justify-end">
                    <Button onClick={handleSubmit} isLoading={isUploading} disabled={!file}>
                        Upload & Submit
                    </Button>
                </div>
            </div>
        </Modal>
    );
};


// --- Main My Expenses Page ---
const MyExpensesPage = () => {
    const { data: expenses, loading, error, request: refetch } = useApi('/users/me/expenses');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleSuccess = () => {
        setIsModalOpen(false);
        refetch();
        toast.success("Expense submitted successfully for approval!");
    };

    const statusStyles = {
        PENDING: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300',
        APPROVED: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300',
        REJECTED: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300',
        REIMBURSED: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300',
    };

    const renderContent = () => {
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <div className="p-12 text-center text-red-400">Could not load your expense history.</div>;
        }
        if (!expenses || expenses.length === 0) {
            return (
                <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                    <DocumentTextIcon className="h-12 w-12 mx-auto"/>
                    <p className="mt-2 font-semibold">You haven't submitted any expenses yet.</p>
                    <p className="mt-1 text-sm">Click "Submit Expense" to get started.</p>
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
                                <td className="px-6 py-4 whitespace-nowrap"><a href={exp.receipt_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">{exp.merchant_name}</a></td>
                                <td className="px-6 py-4 font-medium">{new Intl.NumberFormat().format(exp.amount)} {exp.currency}</td>
                                <td className="px-6 py-4 text-sm">{formatDistanceToNow(new Date(exp.submitted_at), { addSuffix: true })}</td>
                                <td className="px-6 py-4"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[exp.status]}`}>{exp.status.replace('_', ' ')}</span></td>
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
                        <p className="mt-1 text-neutral-600 dark:text-neutral-400">Submit and track your business expense reports.</p>
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