import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import Button from '../../components/common/Button';
import { Link } from 'react-router-dom';
import { MapPinIcon, BuildingOffice2Icon, ClockIcon, LightBulbIcon, ShieldCheckIcon, UserGroupIcon } from '@heroicons/react/24/outline';

// --- Reusable, Theme-Aware JobListingCard Component ---
const JobListingCard = ({ job }) => (
<Link to={`/careers/${job.id}`} className="block h-full">
    <div className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 transition-all duration-300 flex flex-col justify-between h-full group">
        <div>
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white font-display group-hover:text-primary transition-colors">{job.title}</h3>
            <div className="mt-2 flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 text-sm text-neutral-600 dark:text-neutral-400">
                <span className="flex items-center"><BuildingOffice2Icon className="h-4 w-4 mr-1.5" />{job.department}</span>
                <span className="flex items-center"><MapPinIcon className="h-4 w-4 mr-1.5" />{job.location}</span>
                <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1.5" />{job.commitment}</span>
            </div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-300 text-sm line-clamp-3">{job.description}</p>
        </div>
        <div className="mt-6">
            <p className="text-primary font-semibold text-sm">View Details &rarr;</p>
        </div>
    </div>
 </Link>
);

// --- [NEW] Skeleton Loader Component ---
const CareersSkeletonLoader = () => (
    <div className="animate-pulse">
        <div className="mt-10 mb-12 flex justify-center flex-wrap gap-2">
            <div className="h-9 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
            <div className="h-9 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
            <div className="h-9 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white dark:bg-neutral-900 p-6 rounded-lg border border-neutral-200 dark:border-neutral-800 h-60"></div>
            ))}
        </div>
    </div>
);

// --- Main Careers Page Component ---
const CareersPage = () => {
    const { data: jobs, loading, error } = useApi('/content/jobs');
    const [filter, setFilter] = useState('All');

    const departments = useMemo(() => {
        if (!jobs) return [];
        return ['All', ...new Set(jobs.map(job => job.department))];
    }, [jobs]);

    const filteredJobs = useMemo(() => {
        if (!jobs || filter === 'All') return jobs;
        return jobs.filter(job => job.department === filter);
    }, [jobs, filter]);

    const companyValues = [
        { name: 'Innovation', icon: LightBulbIcon, description: 'We relentlessly pursue new ideas and technologies to redefine the future of finance.' },
        { name: 'Integrity', icon: ShieldCheckIcon, description: 'We operate with unwavering honesty and transparency, earning the trust of our users every day.' },
        { name: 'Inclusivity', icon: UserGroupIcon, description: 'We are building a global team and a global product that empowers everyone, everywhere.' },
    ];

    const renderJobListings = () => {
        if (loading) {
            return <CareersSkeletonLoader />;
        }
        if (error) {
            return <p className="text-center text-red-400">Failed to load job listings. Please try again later.</p>;
        }
        if (!filteredJobs || filteredJobs.length === 0) {
            return <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">No open positions in this department right now. Check back soon!</p>;
        }
        return (
            <>
                <div className="mt-10 mb-12 flex justify-center flex-wrap gap-2">
                    {departments.map(dept => (
                        <button
                            key={dept}
                            onClick={() => setFilter(dept)}
                            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                                filter === dept
                                ? 'bg-primary text-white'
                                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                            }`}
                        >
                            {dept}
                        </button>
                    ))}
                </div>
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
            </>
        );
    }

    return (
        // The main container inherits its base theme from PageWrapper
        <div className="bg-white dark:bg-neutral-950">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 bg-neutral-50 dark:bg-neutral-900">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                        <div className="mx-auto max-w-2xl">
                            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">
                                Build the Future of Finance
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                                We're a team of passionate innovators, thinkers, and builders on a mission to create a more accessible and equitable global financial system. Join us.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* --- [NEW] Company Values Section --- */}
            <div className="py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-10 md:gap-x-12">
                        {companyValues.map(value => (
                            <div key={value.name} className="text-center">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                                    <value.icon className="h-6 w-6 text-primary" />
                                </div>
                                <h3 className="mt-6 text-lg font-semibold text-neutral-900 dark:text-white">{value.name}</h3>
                                <p className="mt-2 text-neutral-600 dark:text-neutral-400">{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Job Listings Section */}
            <div className="py-16 sm:py-24 bg-neutral-50 dark:bg-neutral-900">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl font-display">
                            Open Positions
                        </h2>
                    </div>
                    {renderJobListings()}
                </div>
            </div>
        </div>
    );
};

export default CareersPage;