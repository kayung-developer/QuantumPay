// FILE: src/pages/marketing/JobApplicationPage.js

import React from 'react';
import { useParams, Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import ApplicationForm from '../../components/forms/ApplicationForm'; // <-- Your form component
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const JobApplicationPage = () => {
    const { jobId } = useParams();
    const { data: job, loading, error } = useApi(`/content/jobs/${jobId}`);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center text-center p-6">
                <h1 className="text-2xl font-bold text-red-500">Job Not Found</h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                    This position may have been filled or the link is incorrect.
                </p>
                <Link to="/careers" className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
                    <ArrowLeftIcon className="h-5 w-5 mr-2" />
                    Back to Careers
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-neutral-950 min-h-screen">
            <div className="mx-auto max-w-4xl px-6 lg:px-8 py-20 sm:py-28">
                <Link to="/careers" className="inline-flex items-center text-sm font-medium text-primary hover:text-primary-focus mb-8">
                    <ArrowLeftIcon className="h-4 w-4 mr-2" />
                    All Open Positions
                </Link>

                <h1 className="text-4xl font-bold font-display text-neutral-900 dark:text-white">{job.title}</h1>
                <p className="mt-2 text-lg text-neutral-600 dark:text-neutral-400">
                    {job.department} &bull; {job.location} &bull; {job.commitment}
                </p>

                <div className="mt-8 prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: job.full_description.replace(/\n/g, '<br />') }} />

                <div className="mt-12 pt-12 border-t border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">Apply for this role</h2>
                    <ApplicationForm jobId={jobId} />
                </div>
            </div>
        </div>
    );
};

export default JobApplicationPage;