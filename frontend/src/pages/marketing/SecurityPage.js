// FILE: src/pages/marketing/SecurityPage.js

import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

// --- Component Imports ---
import Button from '../../components/common/Button';
import PageWrapper from '../../components/layout/PageWrapper';
import { useApi } from '../../hooks/useApi';

// --- Icon Imports ---
import {
  ShieldCheckIcon, LockClosedIcon, CpuChipIcon, CubeTransparentIcon,
  DocumentCheckIcon, FingerPrintIcon
} from '@heroicons/react/24/outline';

// =================================================================================
// SUB-COMPONENTS FOR A CLEANER, MORE MODULAR PAGE
// =================================================================================

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }}
    className="flex flex-col items-start p-8 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg"
  >
    <div className="p-4 bg-primary/10 rounded-lg"><Icon className="h-8 w-8 text-primary" /></div>
    <h3 className="mt-6 text-xl font-semibold text-neutral-900 dark:text-white font-display">{title}</h3>
    <p className="mt-2 text-base text-neutral-600 dark:text-neutral-400">{description}</p>
  </motion.div>
);

const LiveStatusIndicator = () => {
    // Fetches the simple health check for the badge
    const { data, loading } = useApi('/utility/health/verbose');

    const statusMeta = {
        operational: { label: "All Systems Operational", color: "bg-green-500" },
        major_outage: { label: "Experiencing Issues", color: "bg-red-500" },
        degraded_performance: { label: "Degraded Performance", color: "bg-yellow-500" },
    };

    if (loading) return <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-700 rounded-full animate-pulse"></div>;
    
    const statusKey = data?.overall_status === "All Systems Operational" ? "operational" : "major_outage";
    const meta = statusMeta[statusKey];

    return (
        <Link to="/status" className="inline-flex items-center space-x-2 p-2 pr-4 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-full hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors group">
            <span className={`h-3 w-3 rounded-full ${meta.color} animate-pulse`}></span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200 group-hover:text-primary">{meta.label}</span>
        </Link>
    );
};

// =================================================================================
// MAIN SECURITY PAGE COMPONENT
// =================================================================================

const SecurityPage = () => {
  const securityFeatures = [
    { icon: CpuChipIcon, title: 'AI Fraud Shield V2', description: 'Our proprietary AI analyzes thousands of data points in real-time to predict and block fraudulent activity before it happens.' },
    { icon: LockClosedIcon, title: 'End-to-End Encryption', description: 'We use state-of-the-art cryptographic algorithms to protect your data in transit (TLS 1.3) and at rest (AES-256).' },
    { icon: FingerPrintIcon, title: 'Multi-Factor Authentication', description: 'Secure your account with biometrics and authenticator apps, providing a robust defense against unauthorized access.' },
    { icon: CubeTransparentIcon, title: 'Immutable Ledger', description: 'Core transactions are recorded on a distributed ledger, providing a verifiable and tamper-proof audit trail for all activities.' },
    { icon: ShieldCheckIcon, title: 'Proactive Security Audits', description: 'Our platform undergoes regular penetration testing and audits by independent, third-party cybersecurity firms.' },
    { icon: DocumentCheckIcon, title: 'Regulatory Compliance', description: 'Built to be compliant with global standards like PCI-DSS, GDPR, and NDPR to meet the highest regulatory requirements.' },
  ];

  return (
    <PageWrapper>
      <div className="relative isolate overflow-hidden pt-24 pb-20 sm:pt-32 sm:pb-28 bg-neutral-50 dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <div className="mx-auto max-w-3xl">
                     <div className="mb-8"><LiveStatusIndicator /></div>
                    <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">
                        Trust & Security
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300">
                        Security isn't a feature—it's our foundation. We are committed to protecting your funds, your data, and your peace of mind with a multi-layered, proactive defense system.
                    </p>
                </div>
            </motion.div>
        </div>
      </div>

      <div className="py-20 sm:py-28 bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">A Proactive Approach</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl font-display">
                    How We Protect You
                </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {securityFeatures.map((feature, index) => <FeatureCard key={feature.title} {...feature} index={index} />)}
                </div>
            </div>
        </div>
      </div>

       <div className="bg-neutral-50 dark:bg-neutral-900 py-20 sm:py-28">
         <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl font-display">Compliance & Certifications</h2>
                <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">We adhere to the highest industry standards to ensure your data is handled securely and in compliance with global regulations.</p>
            </div>
            <div className="mx-auto mt-16 flex justify-center items-center gap-8 flex-wrap">
                <p className="font-semibold text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 px-4 py-2 rounded-lg">PCI-DSS Compliant</p>
                <p className="font-semibold text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 px-4 py-2 rounded-lg">GDPR Ready</p>
                <p className="font-semibold text-neutral-600 dark:text-neutral-300 border border-neutral-300 dark:border-neutral-600 px-4 py-2 rounded-lg">NDPR Compliant</p>
            </div>
         </div>
       </div>

       <div className="bg-white dark:bg-neutral-950 py-20 sm:py-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
                    <h2 className="font-display text-3xl lg:text-4xl font-bold text-neutral-900 dark:text-white">
                        Experience Financial Confidence
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-neutral-600 dark:text-neutral-400">
                        Ready to transact with the peace of mind that comes from world-class security? Join QuantumPay today.
                    </p>
                    <div className="mt-8">
                        <Button to="/register" size="lg">Create Your Secure Account</Button>
                    </div>
                </motion.div>
            </div>
      </div>
    </PageWrapper>
  );
};

export default SecurityPage;