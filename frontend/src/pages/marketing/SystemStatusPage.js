import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useApi from '../../hooks/useApi';
import { format } from 'date-fns';
import { CheckCircleIcon, ExclamationTriangleIcon, InformationCircleIcon, ClockIcon } from '@heroicons/react/24/solid';

const statusMetadata = {
    operational: {
        icon: CheckCircleIcon,
        color: 'text-green-400',
        bgColor: 'bg-green-900/50',
        borderColor: 'border-green-700',
        label: 'Operational'
    },
    degraded_performance: {
        icon: ExclamationTriangleIcon,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/50',
        borderColor: 'border-yellow-700',
        label: 'Degraded Performance'
    },
    partial_outage: {
        icon: ExclamationTriangleIcon,
        color: 'text-orange-400',
        bgColor: 'bg-orange-900/50',
        borderColor: 'border-orange-700',
        label: 'Partial Outage'
    },
    major_outage: {
        icon: InformationCircleIcon,
        color: 'text-red-400',
        bgColor: 'bg-red-900/50',
        borderColor: 'border-red-700',
        label: 'Major Outage'
    }
};

const SystemStatusPage = () => {
    // Use the manual flag in useApi to control refetching
    const { data: statusData, loading, error, request: fetchStatus } = useApi('/utility/health/verbose', {}, true);
    const [lastUpdated, setLastUpdated] = useState(new Date());

    useEffect(() => {
        // Fetch immediately on mount
        fetchStatus();

        // Then set up an interval to poll every 30 seconds
        const intervalId = setInterval(() => {
            fetchStatus();
            setLastUpdated(new Date());
        }, 30000); // 30000 ms = 30 seconds

        // Cleanup interval on component unmount
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array ensures this runs only once on mount

    const overallStatusMeta = statusData?.overall_status === "All Systems Operational"
        ? statusMetadata.operational
        : statusMetadata.major_outage;

    const renderOverallStatus = () => {
        if (loading && !statusData) {
            return (
                <div className="p-6 bg-neutral-800 rounded-lg animate-pulse">
                    <div className="h-8 w-3/4 bg-neutral-700 rounded-md"></div>
                </div>
            );
        }
        if (error) {
            return (
                 <div className={`p-6 ${statusMetadata.major_outage.bgColor} border ${statusMetadata.major_outage.borderColor} rounded-lg flex items-center`}>
                    <statusMetadata.major_outage.icon className={`h-8 w-8 mr-4 ${statusMetadata.major_outage.color}`} />
                    <span className="text-xl font-semibold text-white">Error Fetching Status</span>
                </div>
            );
        }
        if (statusData) {
            return (
                 <div className={`p-6 ${overallStatusMeta.bgColor} border ${overallStatusMeta.borderColor} rounded-lg flex items-center`}>
                    <overallStatusMeta.icon className={`h-8 w-8 mr-4 ${overallStatusMeta.color}`} />
                    <span className="text-xl font-semibold text-white">{statusData.overall_status}</span>
                </div>
            );
        }
        return null;
    }

    return (
        <div className="bg-neutral-950">
            <div className="pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="text-center">
                            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
                                System Status
                            </h1>
                            <p className="mt-6 text-lg leading-8 text-neutral-300">
                                Real-time operational status for all QuantumPay services.
                            </p>
                        </div>

                        <div className="mt-12 space-y-8">
                            {renderOverallStatus()}

                            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-lg space-y-4">
                                {(loading && !statusData ? Array.from({length: 3}) : statusData?.components || []).map((component, index) => {
                                    const meta = component ? statusMetadata[component.status] : statusMetadata.operational;
                                    return (
                                        <div key={component?.name || index} className="flex items-center justify-between p-4 border-b border-neutral-800 last:border-b-0">
                                            {loading ? (
                                                <>
                                                  <div className="h-5 w-1/3 bg-neutral-700 rounded-md animate-pulse"></div>
                                                  <div className="h-5 w-1/4 bg-neutral-700 rounded-md animate-pulse"></div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="font-medium text-white">{component.name}</span>
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

                             <div className="text-center text-sm text-neutral-500 flex items-center justify-center">
                                <ClockIcon className="h-4 w-4 mr-2"/>
                                <span>Last updated: {format(lastUpdated, 'MMM d, yyyy, h:mm:ss a')}</span>
                             </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default SystemStatusPage;