import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { MapPinIcon, BuildingOffice2Icon, ClockIcon } from '@heroicons/react/24/outline';

const JobListingCard = ({ job }) => (
    <div className="bg-neutral-900 p-6 rounded-lg border border-neutral-800 hover:border-primary/50 transition-all duration-300 flex flex-col justify-between">
        <div>
            <h3 className="text-lg font-semibold text-white font-display">{job.title}</h3>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-neutral-400">
                <span className="flex items-center"><BuildingOffice2Icon className="h-4 w-4 mr-1.5" />{job.department}</span>
                <span className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1.5" />{job.location}</span>
                <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1.5" />{job.commitment}</span>
            </div>
            <p className="mt-4 text-neutral-300 text-sm line-clamp-2">{job.description}</p>
        </div>
        <div className="mt-6">
            <Button href={job.apply_url} variant="outline" size="sm">Apply Now</Button>
        </div>
    </div>
);

const CareersPage = () => {
    const { data: jobs, loading, error } = useApi('/content/jobs');
    const [filter, setFilter] = useState('All');

    const departments = useMemo(() => {
        if (!jobs) return ['All'];
        return ['All', ...new Set(jobs.map(job => job.department))];
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        if (filter === 'All') return jobs;
        return jobs.filter(job => job.department === filter);
    }, [jobs, filter]);

    const renderJobListings = () => {
        if (loading) {
            return <div className="flex justify-center py-10"><Spinner size="lg" /></div>;
        }
        if (error) {
            return <p className="text-center text-red-400">Failed to load job listings. Please try again later.</p>;
        }
        if (!filteredJobs || filteredJobs.length === 0) {
            return <p className="text-center text-neutral-500 py-10">No open positions in this department right now. Check back soon!</p>;
        }
        return (
            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
                {filteredJobs.map(job => (
                    <motion.div key={job.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                        <JobListingCard job={job} />
                    </motion.div>
                ))}
            </motion.div>
        );
    }

    return (
        <div className="bg-neutral-950">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="mx-auto max-w-2xl">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
                                Build the Future of Finance
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-neutral-300">
                                We're a team of passionate innovators, thinkers, and builders on a mission to create a more accessible and equitable global financial system. Join us.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Job Listings Section */}
            <div className="py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                            Open Positions
                        </h2>
                    </div>

                    {/* Filter Tabs */}
                    <div className="mt-10 mb-12 flex justify-center flex-wrap gap-2">
                        {departments.map(dept => (
                            <button
                                key={dept}
                                onClick={() => setFilter(dept)}
                                className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                    filter === dept
                                    ? 'bg-primary text-white'
                                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                                }`}
                            >
                                {dept}
                            </button>
                        ))}
                    </div>

                    {renderJobListings()}
                </div>
            </div>
        </div>
    );
};

export default CareersPage;