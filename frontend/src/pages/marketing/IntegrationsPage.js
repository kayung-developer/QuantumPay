import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import useApi from '../../hooks/useApi';
import Spinner from '../../components/common/Spinner';

// --- Reusable, Theme-Aware IntegrationCard Component ---
const IntegrationCard = ({ integration }) => (
    <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg p-6 flex flex-col h-full text-center items-center">
        <img src={integration.logo_url} alt={`${integration.name} logo`} className="h-16 w-16" />
        <h3 className="mt-4 text-lg font-semibold text-neutral-900 dark:text-white">{integration.name}</h3>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400 flex-grow">{integration.description}</p>
        <div className="mt-4">
            {integration.status === 'coming_soon' ? (
                <span className="px-3 py-1 text-xs font-medium text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                    Coming Soon
                </span>
            ) : (
                <Button variant="outline" size="sm">Connect</Button>
            )}
        </div>
    </div>
);

// --- Main Integrations Marketplace Page ---
const IntegrationsPage = () => {
    const { data: integrations, loading, error } = useApi('/content/integrations');
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');

    const categories = useMemo(() => {
        if (!integrations) return [];
        return ['All', ...new Set(integrations.map(i => i.category))];
    }, [integrations]);

    const filteredIntegrations = useMemo(() => {
        if (!integrations) return [];
        return integrations
            .filter(i => filter === 'All' || i.category === filter)
            .filter(i => i.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }, [integrations, filter, searchQuery]);

    return (
        <div className="bg-white dark:bg-neutral-950">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 bg-neutral-50 dark:bg-neutral-900">
                <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                        <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">
                            Integration Marketplace
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                            Connect QuantumPay with the tools you use every day to automate workflows and unify your financial data.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Marketplace Section */}
            <div className="py-16 sm:py-24">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    {/* Filter and Search Controls */}
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-12">
                        <div className="flex-grow w-full md:w-auto">
                            <input
                                type="search"
                                placeholder="Search integrations..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md p-3 text-neutral-900 dark:text-white"
                            />
                        </div>
                        <div className="flex-shrink-0">
                            <select
                                value={filter}
                                onChange={e => setFilter(e.target.value)}
                                className="bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-md p-3 text-neutral-900 dark:text-white"
                            >
                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* Integrations Grid */}
                    {loading && <div className="flex justify-center"><Spinner size="lg"/></div>}
                    {error && <p className="text-center text-red-500">Could not load integrations.</p>}
                    {!loading && !error && (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
                            initial="hidden"
                            animate="visible"
                        >
                            {filteredIntegrations.map(integration => (
                                <motion.div key={integration.id} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                                    <IntegrationCard integration={integration} />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                     {!loading && filteredIntegrations.length === 0 && (
                        <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">No integrations found matching your criteria.</p>
                     )}
                </div>
            </div>

       {/* CTA Section */}
        <div className="bg-neutral-50 dark:bg-neutral-900 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="font-display text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">
                    Ready to Build a Connected Future?
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-neutral-400 dark:text-white">
                    Explore our developer documentation to start building powerful, custom integrations with the QuantumPay API.
                    </p>
                    <div className="mt-8">
                    <Button to="/developers" size="lg" variant="outline">
                        View API Docs
                    </Button>
                    </div>
                </motion.div>
            </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;