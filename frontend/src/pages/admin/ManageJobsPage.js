// FILE: src/pages/admin/ManageJobsPage.js

import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import useApi, { useApiPost } from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { PlusIcon, BriefcaseIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Toaster, toast, resolveValue } from 'react-hot-toast';
import JobFormModal from '../../components/admin/JobFormModal';
import Spinner from '../../components/common/Spinner';
import { format, parseISO } from 'date-fns';

const ManageJobsPage = () => {
    const { data: jobs, loading, error, request: refetchJobs } = useApi('/admin/jobs/all');
    const { post: deleteJob, loading: deleting } = useApiPost('', { method: 'DELETE' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);

    const handleSave = (isEditing) => {
        setIsModalOpen(false);
        setSelectedJob(null);
        refetchJobs();
        toast.success(`Job listing has been successfully ${isEditing ? 'updated' : 'created'}.`);
    };

    // [THE FIX] Correctly use async/await to handle the API call and its result.
    const handleDelete = async (job) => {
        if (window.confirm(`Are you sure you want to permanently delete the listing for "${job.title}"?`)) {
            const result = await deleteJob({}, { url: `/admin/jobs/${job.id}` });
            if (result.success) {
                toast.success("Job listing deleted.");
                refetchJobs();
            }
            // The useApiPost hook will automatically show an error toast if it fails.
        }
    };

    const renderContent = () => {
        if (loading) {
            return <div className="p-12 text-center"><Spinner /></div>;
        }
        if (error) {
            return <div className="p-12 text-center text-red-400">Could not load job listings. Error: {error.message}</div>;
        }
        // [THE FIX] Add a robust check to ensure 'jobs' is an array before attempting to map over it.
        if (!Array.isArray(jobs) || jobs.length === 0) {
            return (
                <div className="p-12 text-center text-neutral-500 dark:text-neutral-400">
                    <BriefcaseIcon className="h-12 w-12 mx-auto"/>
                    <p className="mt-2 font-semibold">No job listings have been created yet.</p>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800">
                    <thead className="bg-neutral-50 dark:bg-neutral-800/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Position</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Details</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                        {jobs.map(job => (
                            <tr key={job.id}>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-neutral-900 dark:text-white">{job.title}</div>
                                    <div className="text-sm text-neutral-500 dark:text-neutral-400">Created: {format(parseISO(job.created_at), 'MMM d, yyyy')}</div>
                                </td>
                                <td className="px-6 py-4 text-sm text-neutral-500 dark:text-neutral-300">{job.department} &bull; {job.location}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${job.is_active ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-800 dark:text-neutral-300'}`}>
                                        {job.is_active ? 'Active' : 'Archived'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button onClick={() => { setSelectedJob(job); setIsModalOpen(true); }} variant="ghost" size="sm" aria-label="Edit"><PencilIcon className="h-4 w-4"/></Button>
                                    <Button onClick={() => handleDelete(job)} variant="ghost" size="sm" isLoading={deleting} aria-label="Delete"><TrashIcon className="h-4 w-4 text-red-500"/></Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <DashboardLayout pageTitle="Manage Job Listings">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Job Listings</h1>
                    <p className="mt-1 text-neutral-600 dark:text-neutral-400">Create, edit, and manage all open positions for your careers page.</p>
                </div>
                <Button onClick={() => { setSelectedJob(null); setIsModalOpen(true); }}>
                    <PlusIcon className="h-5 w-5 mr-2"/>New Listing
                </Button>
            </div>
            {renderContent()}

            <JobFormModal
                isOpen={isModalOpen}
                onClose={() => { setSelectedJob(null); setIsModalOpen(false); }}
                onSuccess={handleSave}
                job={selectedJob}
            />
        </DashboardLayout>
    );
};

export default ManageJobsPage;