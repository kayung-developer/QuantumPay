import React from 'react';
import { motion } from 'framer-motion';
import { GlobeAmericasIcon, UserGroupIcon, LightBulbIcon, BuildingLibraryIcon } from '@heroicons/react/24/outline';
import CountUp from 'react-countup'; // A library for animating numbers
import { useInView } from 'react-intersection-observer'; // To trigger animations on scroll
import Button from '../../components/common/Button';

// --- Reusable Components for the About Page ---

const PageHeader = ({ title, subtitle }) => (
    <div className="bg-neutral-50 dark:bg-neutral-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <h1 className="text-4xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-6xl font-display">{title}</h1>
                <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">{subtitle}</p>
            </motion.div>
        </div>
    </div>
);

const StatCounter = ({ value, label, suffix }) => {
    const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.5 });
    return (
        <div ref={ref} className="text-center">
            <p className="text-4xl sm:text-5xl font-bold text-primary">
                {inView && <CountUp end={value} duration={3} />}
                {suffix}
            </p>
            <p className="mt-2 text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
        </div>
    );
};

const TeamMemberCard = ({ name, title, imageUrl, linkedInUrl }) => (
    <div className="text-center">
        <img className="mx-auto h-40 w-40 rounded-full object-cover" src={imageUrl} alt={`Photo of ${name}`} />
        <h3 className="mt-6 text-base font-semibold leading-7 tracking-tight text-neutral-900 dark:text-white">{name}</h3>
        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{title}</p>
        <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark transition-colors">
            LinkedIn
        </a>
    </div>
);


const AboutPage = () => {
    const values = [
        { name: 'Our Mission', description: 'To build a global, inclusive, and secure financial infrastructure that empowers individuals and businesses to transact without borders, fostering economic opportunity for all.', icon: GlobeAmericasIcon },
        { name: 'Our Vision', description: 'To be the universally trusted financial operating system for the digital age, where value is exchanged as seamlessly and instantaneously as information.', icon: LightBulbIcon },
        { name: 'Our Culture', description: 'We are a diverse team of passionate innovators and problem-solvers, committed to building a more equitable financial future through collaboration and excellence.', icon: UserGroupIcon },
    ];

    const teamMembers = [
        { name: 'Pascal Aondover', title: 'Founder & CEO', imageUrl: `${process.env.PUBLIC_URL}/img/ceo.png`, linkedInUrl: 'https://linkedIn.com/in/pascal-aondover' },
        { name: 'Olayiwola Akabashorun', title: 'Co-Partner', imageUrl: `${process.env.PUBLIC_URL}/img/coo1.jpg`, linkedInUrl: 'https://linkedIn.com/' },
        { name: 'Kareem Akabashorun', title: 'Co-Partner (IT) ', imageUrl: `${process.env.PUBLIC_URL}/img/coo2.jpeg`, linkedInUrl: 'https://linkedIn.com/' },

    ];

    return (
        // The main container inherits its base theme from PageWrapper
        <div>
            <PageHeader
                title="About QuantumPay"
                subtitle="We are fundamentally reshaping the global financial landscape. Our goal is to create a single, unified platform for the entire financial lifecycle of individuals and businesses, built on the principles of security, speed, and intelligence."
            />

            {/* --- [NEW] "By the Numbers" Section --- */}
            <div className="py-20 sm:py-28 bg-white dark:bg-neutral-950">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-y-12 md:gap-x-8">
                        <StatCounter value={15} suffix="+" label="Countries Served" />
                        <StatCounter value={200} suffix="+" label="Currencies Supported" />
                        <StatCounter value={50} suffix="M+" label="Transactions Processed Annually" />
                    </div>
                </div>
            </div>

            {/* --- Core Values Section (Theme-Aware) --- */}
            <div className="bg-neutral-50 dark:bg-neutral-900 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-base font-semibold leading-7 text-primary">Our Core Principles</h2>
                        <p className="mt-2 text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl font-display">
                            The Foundation of Our Innovation
                        </p>
                    </div>
                    <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                        <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3">
                            {values.map((value) => (
                                <div key={value.name} className="flex flex-col p-8 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-sm">
                                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-neutral-900 dark:text-white">
                                        <value.icon className="h-6 w-6 flex-none text-primary" aria-hidden="true" />
                                        {value.name}
                                    </dt>
                                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-600 dark:text-neutral-400">
                                        <p className="flex-auto">{value.description}</p>
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                </div>
            </div>

             {/* --- [NEW] Leadership Team Section --- */}
            <div className="bg-white dark:bg-neutral-950 py-20 sm:py-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:text-center">
                        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-4xl font-display">Meet Our Leadership</h2>
                        <p className="mt-6 text-lg leading-8 text-neutral-600 dark:text-neutral-400">We’re a dynamic group of leaders with a passion for building the future of finance.</p>
                    </div>
                    <ul role="list" className="mx-auto mt-20 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
                        {teamMembers.map(person => <TeamMemberCard key={person.name} {...person} />)}
                    </ul>
                </div>
            </div>

            {/* --- [NEW] "Join Us" CTA Section --- */}
            <div className="bg-neutral-50 dark:bg-neutral-900">
                <div className="mx-auto max-w-7xl py-24 sm:px-6 sm:py-32 lg:px-8">
                    <div className="relative isolate overflow-hidden bg-neutral-800 px-6 py-24 text-center shadow-2xl sm:rounded-3xl sm:px-16">
                        <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">Want to build the future with us?</h2>
                        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-neutral-300">We are always looking for talented individuals to join our mission. Explore our open positions and find your new career at QuantumPay.</p>
                        <div className="mt-10">
                            <Button to="/careers" size="lg">View Open Positions</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;