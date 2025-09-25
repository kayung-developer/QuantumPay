import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi, { useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { format, parseISO } from 'date-fns';
import Modal from '../../components/common/Modal';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toastSuccess, toastError } from '../../components/common/Toast';
import Spinner from '../../components/common/Spinner';

// --- KYC Review Modal (Real System Implementation) ---
const KYCReviewModal = ({ isOpen, onClose, kycRecord, onReviewed }) => {
    const [isRejecting, setIsRejecting] = useState(false);
    // [THE FIX] Use the correct PUT method
    const { post: submitReview, loading } = useApiPost(`/admin/kyc/review/${kycRecord?.id}`, { method: 'PUT' });

    const RejectionSchema = Yup.object().shape({
        rejection_reason: Yup.string().min(10, 'Reason must be at least 10 characters').required('A reason is required for rejection.'),
    });

    const handleApprove = async () => {
        const result = await submitReview({ status: 'verified' });
        if(result.success) {
            toastSuccess("KYC record approved successfully.");
            onReviewed(result.data); // Pass the updated record back
            onClose();
        }
    };

    const handleReject = async (values) => {
        const payload = { status: 'rejected', rejection_reason: values.rejection_reason };
        const result = await submitReview(payload);
        if(result.success) {
            toastSuccess("KYC record rejected.");
            onReviewed(result.data);
            onClose();
        }
    }

    if(!kycRecord) return null;

    return (
        // [THE FIX] The modal title now correctly accesses the user's email.
        <Modal isOpen={isOpen} onClose={onClose} title={`Review KYC for ${kycRecord.user?.email || 'user'}`}>
            <div className="space-y-4">
                <div>
                    <h3 className="font-medium text-white">User Details</h3>
                    <p className="text-sm text-neutral-400">User ID: {kycRecord.user_id}</p>
                </div>
                 <div>
                    <h3 className="font-medium text-white">Document Submitted</h3>
                    <p className="text-sm text-neutral-400">Type: {kycRecord.document_type}</p>
                    {/* In a real system, the document_url would be a secure, expiring S3 link */}
                    <a href={kycRecord.document_url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        View Document
                    </a>
                </div>
                <div className="border-t border-neutral-700 pt-4">
                    {!isRejecting ? (
                         <div className="flex justify-end space-x-3">
                            <Button variant="secondary" onClick={() => setIsRejecting(true)}>Reject</Button>
                            <Button variant="primary" onClick={handleApprove} isLoading={loading}>Approve</Button>
                        </div>
                    ) : (
                        <Formik
                            initialValues={{ rejection_reason: '' }}
                            validationSchema={RejectionSchema}
                            onSubmit={handleReject}
                        >
                            {({ errors, touched }) => (
                                <Form className="space-y-4">
                                    <label htmlFor="rejection_reason" className="block text-sm font-medium text-neutral-300">Reason for Rejection</label>
                                    <Field as="textarea" name="rejection_reason" rows={3} className="mt-1 block w-full text-base bg-neutral-800 border-neutral-700 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-white"/>
                                    {errors.rejection_reason && touched.rejection_reason ? (<div className="text-red-500 text-xs mt-1">{errors.rejection_reason}</div>) : null}
                                    <div className="flex justify-end space-x-3">
                                        <Button type="button" variant="secondary" onClick={() => setIsRejecting(false)}>Cancel</Button>
                                        <Button type="submit" variant="danger" isLoading={loading}>Confirm Rejection</Button>
                                    </div>
                                </Form>
                            )}
                        </Formik>
                    )}
                </div>
            </div>
        </Modal>
    )
}

// --- Main KYC Approvals Page ---
const KYCApprovalsPage = () => {
    // We manage state locally to allow for instant UI updates
    const [pendingKYC, setPendingKYC] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedKYC, setSelectedKYC] = useState(null);

    const { data: fetchedData, loading, error, request: refetch } = useApi('/admin/kyc/pending');

    useEffect(() => {
        if(fetchedData) {
            setPendingKYC(fetchedData);
        }
    }, [fetchedData]);

    const handleReviewClick = (kycRecord) => {
        setSelectedKYC(kycRecord);
        setIsModalOpen(true);
    };

    const handleReviewed = (reviewedRecord) => {
        // [THE FIX] This instantly removes the processed record from the UI list
        // without needing a full refetch, making the app feel faster.
        setPendingKYC(prev => prev.filter(item => item.id !== reviewedRecord.id));
    };

    const renderContent = () => {
        if (loading) return <tr><td colSpan="4" className="text-center py-10"><Spinner/></td></tr>;
        if (error) return <tr><td colSpan="4" className="text-center py-10 text-red-400">Failed to load KYC requests.</td></tr>;
        if (pendingKYC.length === 0) return <tr><td colSpan="4" className="text-center py-12 text-neutral-500">The KYC queue is empty. Great job!</td></tr>;

        return pendingKYC.map(record => (
            <tr key={record.id} className="hover:bg-neutral-800/50">
                {/* [THE FIX] Correctly access the nested user email */}
                <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{record.user?.email || record.user_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-neutral-300">{record.document_type}</td>
                <td className="px-6 py-4 whitespace-nowrap text-neutral-400">{format(parseISO(record.submitted_at), 'MMM d, yyyy h:mm a')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right">
                    <Button onClick={() => handleReviewClick(record)}>Review</Button>
                </td>
            </tr>
        ));
    };

    return (
        <DashboardLayout pageTitle="KYC Approvals">
            <div className="space-y-6">
                 <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-600 dark:text-white">KYC Approval Queue</h1>
                    <p className="mt-1 text-neutral-400">Review and process pending user identity verifications.</p>
                </div>
                 <div className="bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                         <table className="min-w-full divide-y divide-neutral-800">
                             <thead className="bg-neutral-800/50">
                                 <tr>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">User Email</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Document Type</th>
                                     <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase">Submitted At</th>
                                     <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase">Actions</th>
                                 </tr>
                             </thead>
                             <tbody className="divide-y divide-neutral-800">
                                {renderContent()}
                             </tbody>
                         </table>
                    </div>
                 </div>
            </div>

            {selectedKYC && (
                 <KYCReviewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    kycRecord={selectedKYC}
                    onReviewed={handleReviewed}
                />
            )}
        </DashboardLayout>
    );
};

export default KYCApprovalsPage;