import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import useApi, { useApiPost } from '../../hooks/useApi';
import { motion } from 'framer-motion';
import { DocumentCheckIcon, ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { toastSuccess, toastError } from '../../components/common/Toast';

const KYCSubmissionSchema = Yup.object().shape({
    document_type: Yup.string().required('Please select a document type'),
    document_url: Yup.string().url('Please provide a valid link to your document').required('A document link is required'),
});

const KYCStatusBanner = ({ status }) => {
    const statusMeta = {
        not_submitted: { text: "Your account is not verified. Please submit your documents to access all features.", icon: DocumentCheckIcon, color: "yellow" },
        pending_review: { text: "Your documents have been submitted and are under review. This typically takes 24-48 hours.", icon: ClockIcon, color: "blue" },
        verified: { text: "Congratulations! Your identity has been verified.", icon: CheckCircleIcon, color: "green" },
        rejected: { text: "Your recent submission was rejected. Please check the reason and resubmit.", icon: XCircleIcon, color: "red" },
    };

    const meta = statusMeta[status] || statusMeta.not_submitted;
    const colors = {
        yellow: "bg-yellow-900/50 border-yellow-700 text-yellow-300",
        blue: "bg-blue-900/50 border-blue-700 text-blue-300",
        green: "bg-green-900/50 border-green-700 text-green-300",
        red: "bg-red-900/50 border-red-700 text-red-300",
    }

    return (
        <div className={`p-4 flex items-start space-x-3 rounded-lg border ${colors[meta.color]}`}>
            <meta.icon className="h-6 w-6 flex-shrink-0 mt-0.5"/>
            <p>{meta.text}</p>
        </div>
    )
}

const KYCCenterPage = () => {
    const { dbUser, fetchDbUser } = useAuth();
    const { data: kycRules, loading: rulesLoading } = useApi(`/compliance/kyc-rules/${dbUser?.country_code}`);
    const { post: submitKyc, loading: submitting } = useApiPost('/compliance/kyc/submit');

    const handleSubmit = async (values, { resetForm }) => {
        const result = await submitKyc(values);
        if (result.success) {
            toast.success("Documents submitted for review!");
            fetchDbUser(); // Refresh user data to update KYC status
            resetForm();
        }
    };

    const renderSubmissionForm = () => {
        if (rulesLoading) return <div className="flex justify-center p-4"><Spinner /></div>;
        if (!kycRules || !kycRules.documents) return <p className="text-neutral-500">Could not load verification requirements for your country.</p>;

        return (
            <Formik
                initialValues={{ document_type: '', document_url: '' }}
                validationSchema={KYCSubmissionSchema}
                onSubmit={handleSubmit}
            >
                 {({ errors, touched }) => (
                     <Form className="space-y-4">
                        <div>
                             <label htmlFor="document_type" className="block text-sm font-medium text-neutral-300">Document Type</label>
                             <Field as="select" name="document_type" className="mt-1 block w-full pl-3 pr-10 py-2 bg-neutral-800 border-neutral-700 rounded-md text-white">
                                 <option value="">-- Select a document --</option>
                                 {kycRules.documents.map(doc => (
                                     <option key={doc} value={doc}>{doc.replace('_', ' ')}</option>
                                 ))}
                             </Field>
                             {errors.document_type && touched.document_type ? <div className="text-red-500 text-xs mt-1">{errors.document_type}</div> : null}
                        </div>
                        <div>
                            <label htmlFor="document_url" className="block text-sm font-medium text-neutral-300">Document Link</label>
                            <Field name="document_url" placeholder="https://link.to.your/secure/document.pdf" className="mt-1 block w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white"/>
                            <p className="text-xs text-neutral-500 mt-1">In a real system, this would be a secure file upload.</p>
                             {errors.document_url && touched.document_url ? <div className="text-red-500 text-xs mt-1">{errors.document_url}</div> : null}
                        </div>
                        <div className="pt-2">
                            <Button type="submit" isLoading={submitting} fullWidth>Submit for Verification</Button>
                        </div>
                     </Form>
                 )}
            </Formik>
        )
    };

    return (
        <DashboardLayout pageTitle="Verification Center">
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-600 dark:text-white">KYC Verification Center</h1>
                    <p className="mt-1 text-neutral-400">Secure your account and unlock higher transaction limits by verifying your identity.</p>
                </div>

                <KYCStatusBanner status={dbUser?.kyc_status} />

                {(dbUser?.kyc_status === 'not_submitted' || dbUser?.kyc_status === 'rejected') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-neutral-900 border border-neutral-800 rounded-lg p-8"
                    >
                        <h2 className="text-xl font-semibold text-white mb-4">Submit Your Documents</h2>
                        {renderSubmissionForm()}
                    </motion.div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default KYCCenterPage;