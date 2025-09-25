import React from 'react';
import { motion } from 'framer-motion';

// --- [THE IMPLEMENTATION] The Advanced, Reusable LegalPageLayout ---
const LegalPageLayout = ({ title, effectiveDate, children }) => (
    // The main container inherits its base theme from the PageWrapper component
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
                // [THEME AWARE] Using Tailwind Typography plugin's `dark:prose-invert` is the
                // most robust way to style a large block of text for theming.
                // We add our own text color classes to ensure consistency.
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


// --- [THE IMPLEMENTATION] The Advanced, Reusable Section Component ---
const Section = ({ title, children }) => (
    <div className="mt-12 first:mt-8">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <div className="mt-6 space-y-4">
            {children}
        </div>
    </div>
);

const CookiePolicyPage = () => {
    return (
        <LegalPageLayout title="Cookie Policy" effectiveDate="October 28, 2023">
            <p>
                This Cookie Policy explains what cookies are and how we use them. You should read this policy to understand what cookies are, how we use them, the types of cookies we use, the information we collect using cookies, how that information is used, and how to control your cookie preferences.
            </p>

            <Section title="1. What Are Cookies?">
                <p>
                    Cookies are small text files that are stored on your browser or device by websites, apps, online media, and advertisements. They are widely used to "remember" you and your preferences, either for a single visit (through a "session cookie") or for multiple repeat visits (using a "persistent cookie"). They ensure a consistent and efficient experience for visitors.
                </p>
            </Section>

            <Section title="2. How We Use Cookies on QuantumPay">
                <p>
                    We use cookies for several purposes. Some cookies are required for technical reasons for our Services to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance their experience.
                </p>
                <ul className="space-y-2">
                    <li><strong>Strictly Necessary Cookies:</strong> These are essential to provide you with services available through our website and to use some of its features, such as access to secure areas and managing your session.</li>
                    <li><strong>Performance and Functionality Cookies:</strong> These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. For example, they remember your preferred language or theme.</li>
                    <li><strong>Analytics and Customization Cookies:</strong> These cookies, such as those from Google Analytics, collect information that is used in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, which helps us to improve our services for you.</li>
                </ul>
            </Section>

            <Section title="3. Your Choices Regarding Cookies">
                 <p>
                    You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser. Most modern web browsers allow you to see what cookies you have, and to clear them individually or all at once.
                 </p>
                 <p>
                    Please note that if you choose to block or delete cookies, this may impact the functionality of the QuantumPay platform.
                 </p>
            </Section>

             <Section title="4. Changes to This Cookie Policy">
                <p>
                    We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
                </p>
            </Section>

             <Section title="5. Contact Us">
                <p>
                    If you have any questions about our use of cookies or other technologies, please email our Data Protection Officer at: <a href="mailto:privacy@quantumpay.example.com">privacy@quantumpay.example.com</a>.
                </p>
            </Section>
        </LegalPageLayout>
    );
};

export default CookiePolicyPage;