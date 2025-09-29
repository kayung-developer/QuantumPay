import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// --- Component Imports ---
import { useAuth } from '../../context/AuthContext';
import { useApi, useApiPost } from '../../hooks/useApi';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { toastError, toastSuccess } from '../../components/common/Toast';
import apiClient from '../../api/axiosConfig';

// --- Icon Imports ---
import { DocumentCheckIcon, ClockIcon, CheckCircleIcon, XCircleIcon, DocumentArrowUpIcon } from '@heroicons/react/24/outline';

// =================================================================================
// SUB-COMPONENTS FOR CLEANER CODE
// =================================================================================

const KYCStatusBanner = ({ status, rejectionReason }) => {
    const { t } = useTranslation();

    const statusMeta = {
        not_submitted: { textKey: 'kyc_status_not_verified', descKey: 'kyc_not_verified_desc', icon: DocumentCheckIcon, color: "amber" },
        pending_review: { textKey: 'kyc_status_pending', descKey: 'kyc_pending_desc', icon: ClockIcon, color: "blue" },
        verified: { textKey: 'kyc_status_verified', descKey: 'kyc_verified_desc', icon: CheckCircleIcon, color: "green" },
        rejected: { textKey: 'kyc_status_rejected', descKey: 'kyc_rejected_desc', icon: XCircleIcon, color: "red" },
    };

    const meta = statusMeta[status] || statusMeta.not_submitted;
    const colors = {
        amber: "bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-500/30 text-amber-800 dark:text-amber-300",
        blue: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-500/30 text-blue-800 dark:text-blue-300",
        green: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-500/30 text-green-800 dark:text-green-300",
        red: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-500/30 text-red-800 dark:text-red-300",
    };

    return (
        <div className={`p-4 flex items-start space-x-4 rounded-lg border ${colors[meta.color]}`}>
            <meta.icon className="h-6 w-6 flex-shrink-0 mt-0.5"/>
            <div>
                <p className="font-semibold">{t(meta.textKey)}</p>
                <p className="text-sm opacity-90">{t(meta.descKey)}</p>
                {status === 'rejected' && rejectionReason && (
                    <p className="mt-2 text-xs font-mono p-2 bg-red-100/50 dark:bg-red-900/50 rounded">Reason: {rejectionReason}</p>
                )}
            </div>
        </div>
    );
};

const KYCSubmissionForm = ({ kycRules, onSuccess }) => {
    const { t } = useTranslation();
    const { post: submitKyc, loading: submitting } = useApiPost('/compliance/kyc/submit');
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            if (acceptedFiles[0].size > 5 * 1024 * 1024) { // 5MB limit
                toastError("File is too large. Please upload a document under 5MB.");
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
    
    const handleSubmit = async (values) => {
        if (!file) {
            toastError("Please upload a document file to submit.");
            return;
        }
        setIsUploading(true);
        try {
            const sigResponse = await apiClient.get(`/compliance/upload-signature?upload_preset=kyc_documents`);
            const { signature, timestamp, api_key, cloud_name, folder } = sigResponse.data;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('signature', signature);
            formData.append('timestamp', timestamp);
            formData.append('folder', folder);
            
            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/image/upload`, {
                method: 'POST', body: formData,
            });
            const uploadData = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadData.error.message);

            setIsUploading(false);

            const payload = { ...values, document_url: uploadData.secure_url };
            const result = await submitKyc(payload);
            if (result.success) {
                toastSuccess("Documents submitted successfully for review!");
                onSuccess();
            }
        } catch (err) {
            toastError(err.message || "An error occurred during upload. Please try again.");
            setIsUploading(false);
        }
    };

    return (
        <Formik
            initialValues={{ document_type: '' }}
            validationSchema={Yup.object().shape({ document_type: Yup.string().required(t('validation.required')) })}
            onSubmit={handleSubmit}
        >
            {({ errors, touched }) => (
                 <Form className="space-y-6">
                    <div>
                        <label htmlFor="document_type" className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Document Type</label>
                        <Field as="select" name="document_type" className={`mt-1 block w-full pl-3 pr-10 py-2 bg-white dark:bg-neutral-800 border rounded-md text-neutral-900 dark:text-white focus:outline-none focus:ring-2 ${errors.document_type && touched.document_type ? 'border-red-500 focus:ring-red-500' : 'border-neutral-300 dark:border-neutral-700 focus:ring-primary'}`}>
                             <option value="">-- Select a document --</option>
                             {kycRules.documents.map(doc => (
                                 <option key={doc} value={doc}>{doc.replace(/_/g, ' ')}</option>
                             ))}
                        </Field>
                        <ErrorMessage name="document_type" component="p" className="text-red-500 text-xs mt-1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Upload Document</label>
                        <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-neutral-300 dark:border-neutral-700 hover:border-primary'}`}>
                            <input {...getInputProps()} />
                            <DocumentArrowUpIcon className="h-10 w-10 mx-auto text-neutral-400 dark:text-neutral-500" />
                            {file ? (
                                <p className="mt-2 text-green-500 font-semibold">{file.name}</p>
                            ) : (
                                <p className="mt-2 text-neutral-600 dark:text-neutral-400">Drag & drop file, or click to select</p>
                            )}
                            <p className="text-xs text-neutral-500 mt-1">PNG, JPG, PDF (Max 5MB)</p>
                        </div>
                    </div>
                    <div className="pt-2">
                        <Button type="submit" isLoading={isUploading || submitting} fullWidth size="lg">
                            {isUploading ? 'Uploading Document...' : 'Submit for Verification'}
                        </Button>
                    </div>
                 </Form>
             )}
        </Formik>
    );
};

// =================================================================================
// MAIN KYC CENTER PAGE COMPONENT
// =================================================================================

const KYCCenterPage = () => {
    const { t } = useTranslation();
    const { dbUser, loading: authLoading, fetchDbUser } = useAuth();

    const shouldFetchRules = dbUser && (dbUser.kyc_status === 'not_submitted' || dbUser.kyc_status === 'rejected');
    const { data: kycRules, loading: rulesLoading, error: rulesError } = useApi(
        dbUser ? `/compliance/kyc-rules/${dbUser.country_code}` : null,
        {},
        !shouldFetchRules
    );

    const renderSubmissionContent = () => {
        if (rulesLoading) return <div className="flex justify-center p-8"><Spinner /></div>;
        if (rulesError || !kycRules || !kycRules.documents) {
            return <p className="p-4 text-center text-sm text-red-700 dark:text-red-400">{t('kyc_load_error')}</p>;
        }

        return (
             <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-8"
            >
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">Submit Your Documents</h2>
                <KYCSubmissionForm kycRules={kycRules} onSuccess={fetchDbUser} />
            </motion.div>
        );
    };

    return (
        <DashboardLayout pageTitleKey="kyc_title">
            <div className="max-w-3xl mx-auto space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">{t('kyc_title')}</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">{t('kyc_subtitle')}</p>
                </div>
                
                {authLoading ? (
                    <div className="flex justify-center p-8"><Spinner size="lg" /></div>
                ) : (
                    <>
                        <KYCStatusBanner status={dbUser?.kyc_status} rejectionReason={dbUser?.kyc_rejection_reason} />
                        {(dbUser?.kyc_status === 'not_submitted' || dbUser?.kyc_status === 'rejected') && renderSubmissionContent()}
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default KYCCenterPage;
