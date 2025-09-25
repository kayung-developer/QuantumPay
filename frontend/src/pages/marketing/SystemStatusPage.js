import React, {useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

// This metadata object defines the visual properties for each possible status.
// It is fully theme-aware with `dark:` variants.
const statusMetadata = {
    operational: {
        icon: CheckCircleIcon,
        color: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-50 dark:bg-green-900/50',
        borderColor: 'border-green-300 dark:border-green-700',
        label: 'Operational'
    },
    degraded_performance: {
        icon: ExclamationTriangleIcon,
        color: 'text-yellow-600 dark:text-yellow-400',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/50',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        label: 'Degraded Performance'
    },
    partial_outage: {
        icon: ExclamationTriangleIcon,
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/50',
        borderColor: 'border-orange-300 dark:border-orange-700',
        label: 'Partial Outage'
    },
    major_outage: {
        icon: InformationCircleIcon,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/50',
        borderColor: 'border-red-300 dark:border-red-700',
        label: 'Major Outage'
    }
};

// A dedicated component for the incident timeline for better code structure and readability.
const IncidentTimeline = () => {
    const { data: incidents, loading, error, request: refetchIncidents } = useApi('/utility/incidents');

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Spinner />
            </div>
        );
    }
    if (error) {
        return (
            <div className="p-4 text-center text-red-500 dark:text-red-400">
                <p>Could not load incident history.</p>
                <Button onClick={refetchIncidents} variant="secondary" size="sm" className="mt-2">Retry</Button>
            </div>
        );
    }
    if (!incidents || incidents.length === 0) {
        return <p className="text-center text-sm text-neutral-500 dark:text-neutral-400">No past incidents to report in the last 90 days.</p>;
    }

    return (
        <div className="flow-root">
            <ul role="list" className="-mb-8">
                {incidents.map((incident, index) => (
                    <li key={incident.id}>
                        <div className="relative pb-8">
                             {index !== incidents.length - 1 ? (
                                <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-neutral-200 dark:bg-neutral-700" aria-hidden="true" />
                            ) : null}
                            <div className="relative flex space-x-3">
                                <div>
                                    <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white dark:ring-neutral-950">
                                        <CheckCircleIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                    </span>
                                </div>
                                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                    <div>
                                        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{incident.title}</p>
                                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{incident.description}</p>
                                    </div>
                                    <div className="whitespace-nowrap text-right text-sm text-neutral-500 dark:text-neutral-500">
                                        <time dateTime={incident.start_timestamp}>{format(new Date(incident.start_timestamp), 'MMM d, yyyy')}</time>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};


const SystemStatusPage = () => {
    const { data: statusData, loading, error, request: fetchStatus } = useApi('/utility/health/verbose', {}, true);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const [timeAgo, setTimeAgo] = useState('a few seconds ago');

    // This effect manages the polling for real-time status and the live-updating timestamp.
    useEffect(() => {
        fetchStatus(); // Fetch immediately on mount

        const pollInterval = setInterval(() => {
            fetchStatus();
            setLastUpdated(new Date());
        }, 30000); // Poll every 30 seconds for new status

        const timeAgoInterval = setInterval(() => {
            // Update the "time ago" string every second for a live feel
            setTimeAgo(formatDistanceToNowStrict(lastUpdated, { addSuffix: true }));
        }, 1000);

        // Cleanup function to clear intervals when the component unmounts
        return () => {
            clearInterval(pollInterval);
            clearInterval(timeAgoInterval);
        };
    }, [fetchStatus]); // The dependency array is correct

    const overallStatusKey = statusData?.overall_status === "All Systems Operational" ? 'operational' : 'major_outage';
    const overallStatusMeta = statusMetadata[overallStatusKey];

    const renderOverallStatus = () => {
        if (loading && !statusData) {
            return (
                <div className="p-6 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse">
                    <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-700 rounded-md"></div>
                </div>
            );
        }
        if (error) {
            return (
                 <div className={`p-6 ${statusMetadata.major_outage.bgColor} border ${statusMetadata.major_outage.borderColor} rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between`}>
                    <div className="flex items-center">
                        <statusMetadata.major_outage.icon className={`h-8 w-8 mr-4 ${statusMetadata.major_outage.color}`} />
                        <span className="text-xl font-semibold text-neutral-900 dark:text-white">Error Fetching Status</span>
                    </div>
                    <Button onClick={fetchStatus} variant="secondary" className="mt-4 sm:mt-0">Retry</Button>
                </div>
            );
        }
        if (statusData) {
            return (
                 <div className={`p-6 ${overallStatusMeta.bgColor} border ${overallStatusMeta.borderColor} rounded-lg flex items-center`}>
                    <overallStatusMeta.icon className={`h-8 w-8 mr-4 ${overallStatusMeta.color}`} />
                    <span className="text-xl font-semibold text-neutral-900 dark:text-white">{statusData.overall_status}</span>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="bg-white dark:bg-neutral-950">
            <div className="pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">
                                System Status
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                                Real-time operational status for all QuantumPay services.
                            </p>
                        </div>

                        <div className="mt-12 space-y-8">
                            {renderOverallStatus()}

                            <div className="p-6 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg space-y-4">
                                {(loading && !statusData ? Array.from({length: 3}) : statusData?.components || []).map((component, index) => {
                                    const meta = component ? statusMetadata[component.status] : statusMetadata.operational;
                                    return (
                                        <div key={component?.name || index} className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-800 last:border-b-0">
                                            {loading && !statusData ? (
                                                <>
                                                  <div className="h-5 w-1/3 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse"></div>
                                                  <div className="h-5 w-1/4 bg-neutral-200 dark:bg-neutral-700 rounded-md animate-pulse"></div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-neutral-800 dark:text-white">{component.name}</span>
                                                    <div className="flex items-center space-x-2">
                                                        <meta.icon className={`h-5 w-5 ${meta.color}`} />
                                                        <span className={`font-semibold ${meta.color}`}>{meta.label}</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                             <div className="text-center text-sm text-neutral-500 dark:text-neutral-500 flex items-center justify-center">
                                <ClockIcon className="h-4 w-4 mr-2"/>
                                <span>Last updated: {timeAgo}</span>
                             </div>
                        </div>

                        <div className="mt-20">
                             <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl font-display text-center">
                                Past Incidents
                            </h2>
                            <div className="mt-8">
                                <IncidentTimeline />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SystemStatusPage;