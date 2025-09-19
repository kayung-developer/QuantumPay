import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
// [THEME AWARE] Import both a dark and a light theme for the code snippets
import { vscDarkPlus, ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAppearance } from '../../context/AppearanceContext'; // To detect the current theme

// --- Reusable, Theme-Aware CodeSnippet Component ---
const CodeSnippet = ({ snippets }) => {
    const [activeLang, setActiveLang] = useState(Object.keys(snippets)[0]);
    const [copied, setCopied] = useState(false);
    const { theme } = useAppearance();

    const handleCopy = () => {
        navigator.clipboard.writeText(snippets[activeLang]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const activeSyntaxTheme = useMemo(() => {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        const currentTheme = theme === 'system' ? systemTheme : theme;
        return currentTheme === 'dark' ? vscDarkPlus : ghcolors;
    }, [theme]);

    return (
        <div className="bg-neutral-50 dark:bg-[#1E1E1E] rounded-lg border border-neutral-200 dark:border-neutral-700 my-6">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                <div className="flex space-x-1">
                    {Object.keys(snippets).map(lang => (
                        <button
                            key={lang}
                            onClick={() => setActiveLang(lang)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                activeLang === lang ? 'bg-primary text-white' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <button onClick={handleCopy} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                </button>
            </div>
            <div className="p-4 text-sm">
                <SyntaxHighlighter language={activeLang.toLowerCase()} style={activeSyntaxTheme} customStyle={{ margin: 0, background: 'transparent', fontSize: '0.875rem' }}>
                    {snippets[activeLang].trim()}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

// --- Main API Documentation Page ---
const ApiDocumentationPage = () => {
    const [activeSection, setActiveSection] = useState('introduction');

    const docSections = useMemo(() => [
        { id: 'introduction', title: 'Introduction', headers: [] },
        { id: 'authentication', title: 'Authentication', headers: [] },
        { id: 'wallets', title: 'Wallets API', headers: ['Retrieve Wallets'] },
        { id: 'transactions', title: 'Transactions API', headers: ['Create P2P Transfer', 'Create QR Payment'] },
        { id: 'invoicing', title: 'Invoicing API', headers: ['Create Invoice'] },
    ], []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -70% 0px' }
        );

        docSections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, [docSections]);

    return (
        <div className="bg-white dark:bg-neutral-950">
             <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Left Sidebar Navigation */}
                    <nav className="hidden lg:block lg:col-span-2 sticky top-24 self-start">
                         <h3 className="font-semibold text-neutral-900 dark:text-white">API Reference</h3>
                        <ul className="space-y-2 mt-4">
                            {docSections.map(section => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className={`block pl-3 py-1 text-sm border-l-2 transition-colors ${
                                            activeSection === section.id
                                            ? 'border-primary text-primary font-semibold'
                                            : 'border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:border-neutral-400'
                                        }`}
                                    >
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Main Content */}
                    <main className="lg:col-span-7">
                        <section id="introduction">
                            <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">API Introduction</h1>
                            <p className="mt-4 text-neutral-600 dark:text-neutral-300">Welcome to the QuantumPay API. Our API is designed to be predictable, resource-oriented, and uses standard HTTP response codes. All API requests must be made over HTTPS.</p>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-300">The base URL for all API requests is: <code>https://api.quantumpay.com</code></p>
                        </section>

                         <section id="authentication" className="mt-12">
                            <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">Authentication</h2>
                            <p className="mt-4 text-neutral-600 dark:text-neutral-300">All API requests must be authenticated with an API key. Your API keys carry many privileges; be sure to keep them secure! Authentication is done by providing your secret key in the HTTP <code>Authorization</code> header as a Bearer token.</p>
                            <CodeSnippet snippets={{ 'cURL': `curl "https://api.quantumpay.com/users/me" \\\n  -H "Authorization: Bearer YOUR_SECRET_KEY"` }} />
                        </section>

                         <section id="wallets" className="mt-12">
                            <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">Wallets API</h2>
                            <h3 className="text-xl font-semibold mt-6 text-neutral-800 dark:text-neutral-100">Retrieve Wallets</h3>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-300">Returns a list of all wallet objects associated with your account.</p>
                             <CodeSnippet snippets={{ 'Endpoint': `GET /wallets/me` }} />
                        </section>

                        <section id="transactions" className="mt-12">
                             <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">Transactions API</h2>
                            <h3 className="text-xl font-semibold mt-6 text-neutral-800 dark:text-neutral-100">Create P2P Transfer</h3>
                             <p className="mt-2 text-neutral-600 dark:text-neutral-300">Creates a peer-to-peer transfer to another QuantumPay user.</p>
                              <CodeSnippet snippets={{ 'Endpoint': `POST /transactions/p2p` }} />
                        </section>

                         <section id="invoicing" className="mt-12">
                            <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">Invoicing API</h2>
                            <h3 className="text-xl font-semibold mt-6 text-neutral-800 dark:text-neutral-100">Create Invoice</h3>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-300">Creates a new invoice for a customer. The invoice is automatically sent upon creation.</p>
                            <CodeSnippet snippets={{ 'Endpoint': `POST /business/invoices` }} />
                            <p className="mt-2 text-neutral-600 dark:text-neutral-300">Body parameters include <code>customer_email</code>, <code>currency</code>, <code>due_date</code>, and an array of <code>items</code>.</p>
                        </section>
                    </main>

                     {/* Right "On This Page" Sidebar */}
                    <aside className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
                         <h3 className="font-semibold text-neutral-900 dark:text-white">On this page</h3>
                         <ul className="space-y-2 mt-4">
                            {docSections.find(s => s.id === activeSection)?.headers.map(header => (
                                <li key={header}>
                                     <a href={`#`} className="block pl-3 py-1 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
                                        {header}
                                    </a>
                                </li>
                            ))}
                         </ul>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ApiDocumentationPage;