import React from 'react';
import Modal from '../common/Modal';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import FormInput from '../common/FormInput';
import Button from '../common/Button';
import { useApiPost } from '../../hooks/useApi';
import { Switch } from '@headlessui/react';

// Helper function to generate a URL-friendly slug from the title
const generateSlug = (title) => {
    if (!title) return '';
    return title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')     // Remove all non-word, non-space, non-hyphen chars
        .replace(/[\s_-]+/g, '-')     // Replace spaces and underscores with a single hyphen
        .replace(/^-+|-+$/g, '');       // Remove leading/trailing hyphens
};

const JobSchema = Yup.object().shape({
    id: Yup.string()
        .matches(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
        .required('A unique URL slug is required'),
    title: Yup.string().required('Job title is required'),
    location: Yup.string().required('Location is required'),
    department: Yup.string().required('Department is required'),
    commitment: Yup.string().required('Commitment type is required'),
    short_description: Yup.string().max(200, 'Must be 200 characters or less').required('A short summary is required'),
    full_description: Yup.string().min(50, 'Description is too short').required('The full job description is required'),
    apply_url: Yup.string().url('Must be a valid URL').required('An application link is required'),
    is_active: Yup.boolean(),
});

const JobFormModal = ({ isOpen, onClose, onSuccess, job }) => {
    const isEditing = !!job;
    const endpoint = isEditing ? `/admin/jobs/${job.id}` : '/admin/jobs';
    const { post: saveJob, loading } = useApiPost(endpoint, { method: isEditing ? 'PUT' : 'POST' });

    const handleSubmit = async (values) => {
        const result = await saveJob(values);
        if (result.success) {
            onSuccess(isEditing);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Job Listing' : 'Create Job Listing'} size="2xl">
            <Formik
                initialValues={{
                    id: job?.id || '',
                    title: job?.title || '',
                    location: job?.location || 'Remote',
                    department: job?.department || 'Engineering',
                    commitment: job?.commitment || 'Full-time',
                    short_description: job?.short_description || '',
                    full_description: job?.full_description || '',
                    apply_url: job?.apply_url || '',
                    is_active: job?.is_active ?? true,
                }}
                validationSchema={JobSchema}
                onSubmit={handleSubmit}
                enableReinitialize
            >
                {({ values, setFieldValue }) => (
                    <Form className="space-y-4">
                        <FormInput
                            name="title"
                            label="Job Title"
                            onChange={(e) => {
                                setFieldValue('title', e.target.value);
                                if (!isEditing) {
                                    setFieldValue('id', generateSlug(e.target.value));
                                }
                            }}
                        />
                        <FormInput
                            name="id"
                            label="URL Slug (Unique ID)"
                            disabled={isEditing}
                            helpText="URL-friendly identifier. Auto-generated from title."
                        />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormInput name="location" label="Location" />
                            <FormInput name="department" label="Department" />
                            <FormInput name="commitment" label="Commitment" />
                        </div>
                        <FormInput as="textarea" name="short_description" label="Short Description (for list view)" rows={3} />
                        <FormInput as="textarea" name="full_description" label="Full Job Description (Markdown supported)" rows={10} />
                        <FormInput name="apply_url" label="Application URL" type="url" />

                        <div className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                             <span className="flex-grow flex flex-col">
                                <span className="text-sm font-medium text-neutral-900 dark:text-white">Listing Active</span>
                                <span className="text-sm text-neutral-500 dark:text-neutral-400">Active listings will be visible on the public careers page.</span>
                            </span>
                            <Switch
                                checked={values.is_active}
                                onChange={(value) => setFieldValue('is_active', value)}
                                className={`${values.is_active ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-700'} relative inline-flex h-6 w-11 items-center rounded-full`}
                            >
                                <span className={`${values.is_active ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition`}/>
                            </Switch>
                        </div>

                        <div className="pt-4 flex justify-end">
                            <Button type="submit" isLoading={loading}>{isEditing ? 'Save Changes' : 'Create Listing'}</Button>
                        </div>
                    </Form>
                )}
            </Formik>
        </Modal>
    );
};

export default JobFormModal;
