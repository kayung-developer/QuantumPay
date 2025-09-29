import React from 'react';
import { motion } from 'framer-motion';

const LegalPageLayout = ({ title, effectiveDate, children }) => (
    <div className="bg-white dark:bg-neutral-950">
        <div className="mx-auto max-w-4xl px-6 lg:px-8 py-24 sm:py-32">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center"
            >
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-5xl font-display">{title}</h1>
                <p className="mt-4 text-neutral-500 dark:text-neutral-400">Last updated: {effectiveDate}</p>
            </motion.div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="prose dark:prose-invert max-w-none mt-12
                           text-neutral-700 dark:text-neutral-300
                           prose-headings:text-neutral-900 dark:prose-headings:text-white
                           prose-a:text-primary hover:prose-a:text-primary-light
                           prose-strong:text-neutral-800 dark:prose-strong:text-neutral-100"
            >
                {children}
            </motion.div>
        </div>
    </div>
);

const Section = ({ title, children }) => (
    <div className="mt-12 first:mt-8">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <div className="mt-6 space-y-4">{children}</div>
    </div>
);

const PrivacyPolicyPage = () => {
    return (
        <LegalPageLayout title="Privacy Policy" effectiveDate="October 26, 2023">
            <p>
                Welcome to QuantumPay ("we," "our," or "us"). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our services. Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the service.
            </p>

            <Section title="1. Information We Collect">
                <p>
                    We may collect information about you in a variety of ways. The information we may collect via the Application includes:
                </p>
                <ul>
                    <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, and demographic information, such as your age, gender, hometown, and interests, that you voluntarily give to us when you register with the Application.</li>
                    <li><strong>Financial Data:</strong> Financial information, such as data related to your payment method (e.g., valid credit card number, card brand, expiration date) that we may collect when you purchase, order, return, exchange, or request information about our services from the Application. We store only very limited, if any, financial information that we collect. Otherwise, all financial information is stored by our payment processors.</li>
                    <li><strong>Data from Social Networks:</strong> User information from social networking sites, such as Apple’s Game Center, Facebook, Google+, Instagram, Pinterest, Twitter, including your name, your social network username, location, gender, birth date, email address, profile picture, and public data for contacts, if you connect your account to such social networks.</li>
                </ul>
            </Section>

            <Section title="2. Use of Your Information">
                <p>
                    Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
                </p>
                <ul>
                    <li>Create and manage your account.</li>
                    <li>Email you regarding your account or order.</li>
                    <li>Process payments and refunds.</li>
                    <li>Monitor and analyze usage and trends to improve your experience with the Application.</li>
                    <li>Notify you of updates to the Application.</li>
                    <li>Perform other business activities as needed.</li>
                </ul>
            </Section>

            <Section title="3. Security of Your Information">
                 <p>
                    We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
                 </p>
            </Section>

             <Section title="4. Contact Us">
                <p>
                    If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@quantumpay.example.com">privacy@quantumpay.example.com</a>.
                </p>
            </Section>
        </LegalPageLayout>
    );
};

export default PrivacyPolicyPage;