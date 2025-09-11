import React from 'react';
import { motion } from 'framer-motion';

const LegalPageLayout = ({ title, effectiveDate, children }) => (
    <div className="bg-neutral-950 pt-24 pb-16 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl font-display">{title}</h1>
                <p className="mt-4 text-neutral-400">Last updated: {effectiveDate}</p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="prose prose-invert prose-lg mx-auto mt-12 text-neutral-300 prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary-light"
            >
                {children}
            </motion.div>
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="mt-10">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="mt-4 space-y-4">{children}</div>
    </div>
);

const TermsOfServicePage = () => {
    return (
        <LegalPageLayout title="Terms of Service" effectiveDate="October 26, 2023">
            <p>
                Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the QuantumPay website and the QuantumPay mobile application (the "Service") operated by QuantumPay Technologies Inc. ("us", "we", or "our").
            </p>
            <p>
                Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. These Terms apply to all visitors, users, and others who access or use the Service.
            </p>

            <Section title="1. Accounts">
                <p>
                    When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                </p>
                <p>
                    You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
                </p>
            </Section>

            <Section title="2. Intellectual Property">
                <p>
                    The Service and its original content, features, and functionality are and will remain the exclusive property of QuantumPay Technologies Inc. and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
                </p>
            </Section>

            <Section title="3. Termination">
                 <p>
                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                 </p>
            </Section>

             <Section title="4. Governing Law">
                <p>
                    These Terms shall be governed and construed in accordance with the laws of Delaware, United States, without regard to its conflict of law provisions.
                </p>
            </Section>

             <Section title="5. Contact Us">
                <p>
                    If you have any questions about these Terms, please contact us at: <a href="mailto:legal@quantumpay.example.com">legal@quantumpay.example.com</a>.
                </p>
            </Section>
        </LegalPageLayout>
    );
};

export default TermsOfServicePage;