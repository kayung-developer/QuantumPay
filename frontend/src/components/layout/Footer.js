import React from 'react';
import { Link } from 'react-router-dom';
import IconLogo24 from '../icons/IconLogo24';
const Logo = () => (
    <Link to="/" className="flex items-center space-x-2">
         <IconLogo24 className="h-6 w-auto" /> {/* Example styling */}
        <span className="font-display text-3xl font-bold text-neutral-900 dark:text-white">
            QuantumPay
        </span>
    </Link>
);

const SocialIcon = ({ href, children }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
        {children}
    </a>
);


const Footer = () => {
    const currentYear = new Date().getFullYear();

    const sections = {
        'Product': [
            { name: 'Features', href: '/#features' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Security', href: '/security' },
            { name: 'Integrations', href: '/integrations' },
        ],
        'Company': [
            { name: 'About Us', href: '/about' },
            { name: 'Careers', href: '/careers' },
            { name: 'Press', href: '/press' },
            { name: 'Blog', href: '/blog' },
        ],
        'Resources': [
            { name: 'API Documentation', href: '/developers' },
            { name: 'Support', href: '/support' },
            { name: 'System Status', href: '/status' },
        ],
        'Legal': [
            { name: 'Privacy Policy', href: '/privacy-policy' },
            { name: 'Terms of Service', href: '/terms-of-service' },
            { name: 'Cookie Policy', href: '/cookie-policy' },
        ],
    };

    return (
        <footer className="bg-neutral-100 dark:bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-200 dark:border-neutral-800">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="xl:grid xl:grid-cols-3 xl:gap-8">
                    <div className="space-y-8 xl:col-span-1">
                        <Logo />
                        <p className="text-neutral-600 dark:text-neutral-400 text-base">
                            The hyper-secure, AI-powered global payment system of the future.
                        </p>
                        <div className="flex space-x-6">
                            {/* Replace with your actual social media links */}
                            <SocialIcon href="#">
                                <span className="sr-only">Twitter</span>
                                {/* Heroicon: AcademicCap (Placeholder for Twitter/X) */}
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v1.586m-6.5-1.586a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25m-6.5 6.253v1.586m6.5-1.586v1.586m0 0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25m6.5 0a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25m-6.5-6.253a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25m0 0a2.25 2.25 0 00-2.25-2.25h-1.5a2.25 2.25 0 00-2.25 2.25" /></svg>
                            </SocialIcon>
                            <SocialIcon href="#">
                                <span className="sr-only">LinkedIn</span>
                                {/* Heroicon: Briefcase (Placeholder for LinkedIn) */}
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                            </SocialIcon>
                        </div>
                    </div>
                    <div className="mt-12 grid grid-cols-2 gap-8 xl:mt-0 xl:col-span-2">
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-900 dark:text-white tracking-wider uppercase">Product</h3>
                                <ul className="mt-4 space-y-4">
                                    {sections.Product.map(item => (
                                        <li key={item.name}>
                                            <Link to={item.href} className="text-base text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-900 dark:text-white tracking-wider uppercase">Company</h3>
                                <ul className="mt-4 space-y-4">
                                    {sections.Company.map(item => (
                                        <li key={item.name}>
                                            <Link to={item.href} className="text-base text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="md:grid md:grid-cols-2 md:gap-8">
                            <div>
                                <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-900 dark:text-white tracking-wider uppercase">Resources</h3>
                                <ul className="mt-4 space-y-4">
                                    {sections.Resources.map(item => (
                                        <li key={item.name}>
                                            <Link to={item.href} className="text-base text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="mt-12 md:mt-0">
                                <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-900 dark:text-white tracking-wider uppercase">Legal</h3>
                                <ul className="mt-4 space-y-4">
                                    {sections.Legal.map(item => (
                                        <li key={item.name}>
                                            <Link to={item.href} className="text-base text-neutral-600 dark:text-neutral-400 hover:text-primary transition-colors">
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-12 border-t border-neutral-200 dark:border-neutral-200 dark:border-neutral-800 pt-8">
                    <p className="text-base text-neutral-500 dark:text-neutral-600 dark:text-neutral-400 xl:text-center">
                        &copy; {currentYear} QuantumPay Technologies Inc. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};


export default Footer;
