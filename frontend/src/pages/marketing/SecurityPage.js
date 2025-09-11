import React from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  LockClosedIcon,
  CpuChipIcon,
  CubeTransparentIcon,
  DocumentCheckIcon,
  FingerPrintIcon,
} from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="flex flex-col items-start p-8 bg-neutral-900 border border-neutral-800 rounded-lg shadow-lg"
  >
    <div className="p-4 bg-primary/10 rounded-lg">
      <Icon className="h-8 w-8 text-primary-light" />
    </div>
    <h3 className="mt-6 text-xl font-semibold text-white font-display">{title}</h3>
    <p className="mt-2 text-base text-neutral-400">{description}</p>
  </motion.div>
);

const SecurityPage = () => {
  const securityFeatures = [
    {
      icon: CpuChipIcon,
      title: 'AI Fraud Shield V2',
      description: 'Our proprietary AI analyzes thousands of data points in real-time, including behavioral biometrics and transaction velocity, to predict and block fraudulent activity before it happens.',
    },
    {
      icon: LockClosedIcon,
      title: 'Quantum-Resistant Encryption',
      description: 'We utilize state-of-the-art cryptographic algorithms to protect your data both in transit (TLS 1.3) and at rest (AES-256), ensuring it remains secure against current and future threats.',
    },
    {
      icon: FingerPrintIcon,
      title: 'Multi-Factor Authentication (MFA)',
      description: 'Secure your account with more than just a password. We support biometric authentication (Face ID, fingerprints) and authenticator apps to provide a robust defense against unauthorized access.',
    },
    {
      icon: CubeTransparentIcon,
      title: 'Blockchain & Ledger Integrity',
      description: 'Core transactions are recorded on an immutable distributed ledger, providing a verifiable and tamper-proof audit trail for all financial activities, ensuring ultimate accountability.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Proactive Security Audits',
      description: 'Our platform undergoes regular penetration testing and security audits by independent, third-party cybersecurity firms to identify and remediate potential vulnerabilities.',
    },
    {
      icon: DocumentCheckIcon,
      title: 'Regulatory Compliance',
      description: 'We are built to be compliant with global standards like PCI-DSS for card data, GDPR for data privacy, and PSD2 for secure payments, ensuring we meet the highest regulatory requirements.',
    },
  ];

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
                    Security is Our Foundation
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-neutral-300">
                    At QuantumPay, we don't treat security as a feature—it's the bedrock upon which our entire platform is built. We are committed to protecting your funds, your data, and your peace of mind with a multi-layered, defense-in-depth approach.
                    </p>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
                <h2 className="text-base font-semibold leading-7 text-primary">A Proactive Approach</h2>
                <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
                    How We Protect You
                </p>
                <p className="mt-6 text-lg leading-8 text-neutral-400">
                    Our security model is designed to be proactive, not reactive. We combine cutting-edge technology with rigorous protocols to stay ahead of threats.
                </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {securityFeatures.map((feature, index) => (
                        <FeatureCard key={feature.title} {...feature} index={index} />
                    ))}
                </div>
            </div>
        </div>
      </div>

       {/* CTA Section */}
        <div className="bg-neutral-900 py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7 }}
                >
                    <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">
                    Experience Financial Confidence
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-neutral-400">
                    Ready to transact with the peace of mind that comes from world-class security? Join QuantumPay today.
                    </p>
                    <div className="mt-8">
                    <Button to="/register" size="lg">
                        Create Your Secure Account
                    </Button>
                    </div>
                </motion.div>
            </div>
      </div>
    </div>
  );
};

export default SecurityPage;