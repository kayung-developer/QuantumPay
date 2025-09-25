import React, { useState, useCallback } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useDropzone } from 'react-dropzone';
import { useApiPost } from '../../hooks/useApi';
import apiClient from '../../api/axiosConfig';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import { ArrowUpOnSquareIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ApplicationSchema = Yup.object().shape({
    full_name: Yup.string().min(2, 'Name is too short').required('Your full name is required'),
    email: Yup.string().email('Invalid email address').required('Your email is required'),
    phone: Yup.string().nullable(),
    cover_letter: Yup.string().nullable(),
});

const ApplicationForm = ({ jobId }) => {
    const [file, setFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const { post: submitApplication, loading: isSubmitting } = useApiPost(`/content/jobs/${jobId}/apply`);

    const onDrop = useCallback(acceptedFiles => {
        if (acceptedFiles.length > 0) {
            // Add basic file size validation (e.g., 5MB)
            if (acceptedFiles[0].size > 5 * 1024 * 1024) {
                toast.error("File is too large. Please upload a resume under 5MB.");
                return;
            }
            setFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxFiles: 1,
    });

    const handleSubmit = async (values) => {
        if (!file) {
            toast.error("Please upload your resume/CV to apply.");
            return;
        }
        setIsUploading(true);
        try {
            // Step 1: Get a secure upload signature from our backend.
            const sigResponse = await apiClient.get(`/compliance/upload-signature?file_name=${file.name}`);
            const { signature, api_key, cloud_name, folder } = sigResponse.data;

            // Step 2: Upload the file DIRECTLY to Cloudinary.
            const formData = new FormData();
            formData.append('file', file);
            formData.append('api_key', api_key);
            formData.append('signature', signature);
            formData.append('timestamp', (Math.floor(Date.now() / 1000)).toString());
            formData.append('folder', 'quantumpay/resumes'); // A dedicated folder

            const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, {
                method: 'POST',
                body: formData,
            });
            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) throw new Error(uploadData.error.message);

            const resume_url = uploadData.secure_url;
            setIsUploading(false); // Upload is done, now submit to our server

            // Step 3: Send all data, including the secure URL, to our backend.
            const payload = { ...values, resume_url };
            const result = await submitApplication(payload);
            if (result.success) {
                setIsSubmitted(true);
            }
        } catch (err) {
            toast.error(err.message || "An error occurred. Please try again.");
            setIsUploading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="text-center p-12 bg-green-50 dark:bg-green-900/50 rounded-lg border border-green-200 dark:border-green-700">
                <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500"/>
                <h3 className="mt-4 text-xl font-semibold text-neutral-900 dark:text-white">Application Received!</h3>
                <p className="mt-2 text-neutral-600 dark:text-neutral-300">
                    Thank you for your interest in QuantumPay. We have received your application and will be in touch if your qualifications match our needs.
                </p>
            </div>
        );
    }

    return (
        <div className="mt-6">
            <Formik
                initialValues={{ full_name: '', email: '', phone: '', cover_letter: '' }}
                validationSchema={ApplicationSchema}
                onSubmit={handleSubmit}
            >
                {() => (
                    <Form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput label="Full Name" name="full_name" autoComplete="name" />
                            <FormInput label="Email Address" name="email" type="email" autoComplete="email" />
                        </div>
                        <FormInput label="Phone Number (Optional)" name="phone" type="tel" autoComplete="tel" />

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">Resume/CV</label>
                            <div {...getRootProps()} className={`p-8 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-neutral-300 dark:border-neutral-700 hover:border-primary'}`}>
                                <input {...getInputProps()} />
                                <ArrowUpOnSquareIcon className="h-10 w-10 mx-auto text-neutral-400 dark:text-neutral-500" />
                                {file ? (
                                    <p className="mt-2 text-green-500 font-semibold">{file.name}</p>
                                ) : (
                                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">Drag & drop file, or click to select</p>
                                )}
                                <p className="text-xs text-neutral-500 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                            </div>
                        </div>

                        <FormInput label="Cover Letter (Optional)" name="cover_letter" as="textarea" rows={5} />

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={isUploading || isSubmitting} size="lg">
                                {isUploading ? 'Uploading Resume...' : 'Submit Application'}
                            </Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </div>
    );
};

export default ApplicationForm;