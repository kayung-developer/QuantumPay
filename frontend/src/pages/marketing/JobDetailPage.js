import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import { ArrowLeftIcon, MapPinIcon, BuildingOffice2Icon, ClockIcon } from '@heroicons/react/24/outline';
import ApplicationForm from '../../components/careers/ApplicationForm';
import { motion } from 'framer-motion';

const JobDetailPage = () => {
    const { jobId } = useParams();
    // Fetch the full, detailed job description from our dedicated endpoint
    const { data: job, loading, error } = useApi(`/content/jobs/${jobId}`);

    const renderContent = () => {
        if (loading) {
            return (
                <div className="h-96 flex justify-center items-center">
                    <Spinner size="lg" />
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-12 text-center text-red-500 dark:text-red-400">
                    <h2 className="text-2xl font-bold">Job Opening Not Found</h2>
                    <p className="mt-2">This position may have been filled or the link is incorrect.</p>
                    <Link to="/careers" className="mt-6 inline-block text-primary hover:underline">
                        &larr; View all open positions
                    </Link>
                </div>
            );
        }

        if (!job) return null;

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Job Header */}
                <div className="pb-8 border-b border-neutral-200 dark:border-neutral-800">
                    <Link to="/careers" className="flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to all openings
                    </Link>
                    <h1 className="mt-4 text-4xl font-bold font-display text-neutral-900 dark:text-white sm:text-5xl">{job.title}</h1>
                    <div className="mt-4 flex items-center flex-wrap gap-x-6 gap-y-2 text-neutral-600 dark:text-neutral-400">
                        <span className="flex items-center"><BuildingOffice2Icon className="h-5 w-5 mr-1.5" />{job.department}</span>
                        <span className="flex items-center"><MapPinIcon className="h-5 w-5 mr-1.5" />{job.location}</span>
                        <span className="flex items-center"><ClockIcon className="h-5 w-5 mr-1.5" />{job.commitment}</span>
                    </div>
                </div>

                {/* Full Job Description - Rendered from Markdown/HTML */}
                <div
                    className="prose dark:prose-invert mt-8 max-w-none text-neutral-700 dark:text-neutral-300 prose-headings:text-neutral-900 dark:prose-headings:text-white prose-a:text-primary"
                    dangerouslySetInnerHTML={{ __html: job.full_description }}
                />

                {/* Application Form Section */}
                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                    <h2 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">Apply for this role</h2>
                    <ApplicationForm jobId={jobId} />
                </div>
            </motion.div>
        );
    }

    return (
        // The main container inherits its theme from PageWrapper
        <div className="bg-white dark:bg-neutral-950 py-20">
            <div className="max-w-4xl mx-auto px-6">
               {renderContent()}
            </div>
        </div>
    );
};

export default JobDetailPage;