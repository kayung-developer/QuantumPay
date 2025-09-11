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

const CookiePolicyPage = () => {
    return (
        <LegalPageLayout title="Cookie Policy" effectiveDate="October 27, 2023">
            <p>
                This Cookie Policy explains what cookies are and how we use them. You should read this policy to understand what cookies are, how we use them, the types of cookies we use, the information we collect using cookies and how that information is used, and how to control your cookie preferences.
            </p>

            <Section title="1. What Are Cookies?">
                <p>
                    Cookies are small text files that are stored on your browser or device by websites, apps, online media, and advertisements. They are widely used to "remember" you and your preferences, either for a single visit (through a "session cookie") or for multiple repeat visits (using a "persistent cookie").
                </p>
            </Section>

            <Section title="2. How We Use Cookies">
                <p>
                    We use cookies for several purposes. Some cookies are required for technical reasons in order for our Services to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our online properties.
                </p>
                <ul>
                    <li><strong>Strictly Necessary Cookies:</strong> These cookies are essential to provide you with services available through our website and to enable you to use some of its features, such as access to secure areas.</li>
                    <li><strong>Performance and Functionality Cookies:</strong> These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.</li>
                    <li><strong>Analytics and Customization Cookies:</strong> These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.</li>
                </ul>
            </Section>

            <Section title="3. Your Choices Regarding Cookies">
                 <p>
                    You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting your preferences in your web browser. Most browsers have an option for turning off the cookie feature, which will prevent your browser from accepting new cookies, as well as (depending on the sophistication of your browser software) allowing you to decide on acceptance of each new cookie in a variety of ways.
                 </p>
            </Section>

             <Section title="4. Contact Us">
                <p>
                    If you have any questions about our use of cookies or other technologies, please email us at: <a href="mailto:privacy@quantumpay.example.com">privacy@quantumpay.example.com</a>.
                </p>
            </Section>
        </LegalPageLayout>
    );
};

export default CookiePolicyPage;