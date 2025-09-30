// FILE: src/pages/marketing/PressPage.js

import React from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';

// --- Component Imports ---
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
// [THE FIX] PageWrapper is no longer needed here.
import { useApi } from '../../hooks/useApi';

// --- Icon Imports ---
import { NewspaperIcon, EnvelopeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

// Sub-components remain the same...
const PressReleaseItem = ({ title, date, summary, link }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-6 border-b border-neutral-200 dark:border-neutral-800"
    >
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{format(parseISO(date), 'MMMM d, yyyy')}</p>
        <a href={link || '#'} target="_blank" rel="noopener noreferrer" className="block group">
            <h3 className="mt-2 text-lg font-semibold text-neutral-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary-light transition-colors">{title}</h3>
        </a>
        <p className="mt-1 text-neutral-600 dark:text-neutral-300">{summary}</p>
    </motion.div>
);

const FeaturedInSection = () => {
    const mediaLogos = [
        { name: 'TechCrunch', logoUrl: '/img/media/techcrunch.svg' },
        { name: 'Forbes', logoUrl: '/img/media/forbes.svg' },
        { name: 'TechCabal', logoUrl: '/img/media/techcabal.svg' },
        { name: 'Bloomberg', logoUrl: '/img/media/bloomberg.svg' },
    ];
    return (
        <div className="bg-neutral-50 dark:bg-neutral-900 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <h2 className="text-center text-lg font-semibold leading-8 text-neutral-900 dark:text-white">
                    As Featured In
                </h2>
                <div className="mx-auto mt-10 grid max-w-lg grid-cols-2 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-4 lg:mx-0 lg:max-w-none">
                    {mediaLogos.map(media => (
                        <img key={media.name} className="col-span-1 max-h-12 w-full object-contain filter dark:invert" src={media.logoUrl} alt={media.name} width={158} height={48} />
                    ))}
                </div>
            </div>
        </div>
    );
};


const PressPage = () => {
    const { data: pressReleases, loading, error } = useApi('/content/press-releases');

    return (
        // [THE FIX] The <PageWrapper> has been removed from here.
        <div className="bg-white dark:bg-neutral-950">
            <div className="pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mx-auto max-w-2xl text-center"
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">
                            Press & Media
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                            News, announcements, brand assets, and resources from the QuantumPay team.
                        </p>
                    </motion.div>

                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-16">
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-display flex items-center">
                                <NewspaperIcon className="h-6 w-6 mr-3 text-primary"/>
                                Latest News Releases
                            </h2>
                            <div className="mt-6">
                                {loading && <div className="flex justify-center py-8"><Spinner /></div>}
                                {error && <p className="text-red-500">Could not load news releases.</p>}
                                {pressReleases?.map(release => (
                                    <PressReleaseItem
                                        key={release.id}
                                        title={release.title}
                                        date={release.publication_date}
                                        summary={release.summary}
                                        link={release.link}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-1">
                            <div className="sticky top-24 bg-neutral-50 dark:bg-neutral-900 p-8 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-display flex items-center">
                                    <EnvelopeIcon className="h-6 w-6 mr-3 text-primary"/>
                                    Media Inquiries
                                </h2>
                                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                                    For all media inquiries, please contact our communications team.
                                </p>
                                <p className="mt-4 font-semibold text-primary break-all">
                                    <a href="mailto:press@quantumpay.com">press@quantumpay.com</a>
                                </p>
                                <div className="mt-8 space-y-3">
                                    <Button href="/media-kit.zip" download variant="primary" className="w-full">
                                        <ArrowDownTrayIcon className="h-5 w-5 mr-2"/>
                                        Download Media Kit
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <FeaturedInSection />
        </div>
    );
};

export default PressPage;
