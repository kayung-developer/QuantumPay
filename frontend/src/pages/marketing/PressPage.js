import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { NewspaperIcon, EnvelopeIcon, ArrowDownTrayIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useApi } from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';
import { format } from 'date-fns';

// A dedicated component for a single press release item
const PressReleaseItem = ({ title, date, summary, link }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-6 border-b border-neutral-200 dark:border-neutral-800"
    >
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{format(new Date(date), 'MMMM d, yyyy')}</p>
        <a href={link || '#'} target="_blank" rel="noopener noreferrer" className="block">
            <h3 className="mt-2 text-lg font-semibold text-neutral-900 dark:text-white hover:text-primary dark:hover:text-primary-light transition-colors cursor-pointer">{title}</h3>
        </a>
        <p className="mt-1 text-neutral-600 dark:text-neutral-300">{summary}</p>
    </motion.div>
);

// A new component to showcase media features
const FeaturedInSection = () => {
    // In a real system, these would be managed in a CMS
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
                        <img key={media.name} className="col-span-1 max-h-12 w-full object-contain" src={media.logoUrl} alt={media.name} width={158} height={48} />
                    ))}
                </div>
            </div>
        </div>
    );
};


const PressPage = () => {
    const { data: pressReleases, loading, error } = useApi('/content/press-releases');

    return (
        // Main container inherits theme from PageWrapper
        <div className="bg-white dark:bg-neutral-950">
            {/* Hero Section */}
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

                    {/* Main Content Grid */}
                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-x-12 gap-y-16">
                        {/* Press Releases List */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-display flex items-center">
                                <NewspaperIcon className="h-6 w-6 mr-3 text-primary"/>
                                Latest News Releases
                            </h2>
                            <div className="mt-6">
                                {loading && <Spinner />}
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

                        {/* Media Contact & Assets Card */}
                        <div className="lg:col-span-1">
                             <div className="sticky top-24 bg-neutral-50 dark:bg-neutral-900 p-8 rounded-lg border border-neutral-200 dark:border-neutral-800">
                                <h2 className="text-2xl font-bold text-neutral-900 dark:text-white font-display flex items-center">
                                    <EnvelopeIcon className="h-6 w-6 mr-3 text-primary"/>
                                    Media Inquiries
                                </h2>
                                <p className="mt-4 text-neutral-600 dark:text-neutral-400">
                                    For all media inquiries, please contact our communications team.
                                </p>
                                <p className="mt-4 font-semibold text-primary">
                                    <a href="mailto:press@quantumpay.example.com">press@quantumpay.example.com</a>
                                </p>
                                <div className="mt-8 space-y-3">
                                    {/* Assume media-kit.zip is in the /public folder */}
                                    <Button href="/media-kit.zip" variant="primary" className="w-full">
                                        <ArrowDownTrayIcon className="h-5 w-5 mr-2"/>
                                        Download Media Kit
                                    </Button>
                                    <Button href="/brand-assets.zip" variant="outline" className="w-full">
                                        <ShareIcon className="h-5 w-5 mr-2"/>
                                        Brand Assets
                                    </Button>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render the new "Featured In" section */}
            <FeaturedInSection />
        </div>
    );
};

export default PressPage;