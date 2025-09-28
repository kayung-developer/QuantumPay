// FILE: src/pages/marketing/ApiDocumentationPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, ghcolors } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';
import { useAppearance } from '../../context/AppearanceContext';
import { Toaster, toast, resolveValue } from 'react-hot-toast';

// [THE UPGRADE] Use the environment variable for the API base URL.
// This should be the public URL of your DEPLOYED backend, not the Netlify frontend URL.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://kayung-developer-quantumpay-backend.hf.space';

// --- Reusable, Theme-Aware CodeSnippet Component ---
const CodeSnippet = ({ snippets }) => {
    const [activeLang, setActiveLang] = useState(Object.keys(snippets)[0]);
    const [copied, setCopied] = useState(false);
    const { theme } = useAppearance();

    const handleCopy = () => {
        navigator.clipboard.writeText(snippets[activeLang]);
        setCopied(true);
        toast.success("Code snippet copied!");
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
                <button onClick={handleCopy} className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors" aria-label="Copy code">
                    {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                </button>
            </div>
            <div className="p-4 text-sm overflow-x-auto">
                <SyntaxHighlighter language={activeLang.toLowerCase()} style={activeSyntaxTheme} customStyle={{ margin: 0, padding: 0, background: 'transparent', fontSize: '0.875rem' }}>
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
        { id: 'introduction', title: 'Introduction' },
        { id: 'authentication', title: 'Authentication' },
        { id: 'transactions', title: 'Transactions API' },
        { id: 'invoicing', title: 'Invoicing API' },
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

    // [THE UPGRADE] Define complete, realistic code snippets for each language
    const authSnippets = {
        'cURL': `curl "${API_BASE_URL}/users/me" \\\n  -H "Authorization: Bearer YOUR_SECRET_KEY"`,
        'Node.js': `const axios = require('axios');\n\nconst apiKey = 'YOUR_SECRET_KEY';\n\naxios.get('${API_BASE_URL}/users/me', {\n  headers: {\n    'Authorization': \`Bearer \${apiKey}\`\n  }\n})\n.then(response => console.log(response.data))\n.catch(error => console.error(error));`,
        'Python': `import requests\n\napi_key = "YOUR_SECRET_KEY"\nurl = "${API_BASE_URL}/users/me"\n\nheaders = {\n    "Authorization": f"Bearer {api_key}"\n}\n\nresponse = requests.get(url, headers=headers)\nprint(response.json())`,
        'JavaScript': `const apiKey = 'YOUR_SECRET_KEY';\n\nfetch('${API_BASE_URL}/users/me', {\n  method: 'GET',\n  headers: {\n    'Authorization': \`Bearer \${apiKey}\`,\n    'Content-Type': 'application/json'\n  }\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error(error));`
    };

    const p2pSnippets = {
        'cURL': `curl -X POST "${API_BASE_URL}/transactions/p2p" \\\n  -H "Authorization: Bearer YOUR_SECRET_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "receiver_email": "receiver@example.com",\n    "amount": 50.00,\n    "currency_code": "USD",\n    "description": "Payment for services"\n  }'`,
        'Node.js': `const axios = require('axios');\n\nconst apiKey = 'YOUR_SECRET_KEY';\nconst payload = {\n  receiver_email: 'receiver@example.com',\n  amount: 50.00,\n  currency_code: 'USD',\n  description: 'Payment for services'\n};\n\naxios.post('${API_BASE_URL}/transactions/p2p', payload, {\n  headers: {\n    'Authorization': \`Bearer \${apiKey}\`\n  }\n})\n.then(response => console.log(response.data))\n.catch(error => console.error(error));`,
        'Python': `import requests\n\napi_key = "YOUR_SECRET_KEY"\nurl = "${API_BASE_URL}/transactions/p2p"\n\npayload = {\n    "receiver_email": "receiver@example.com",\n    "amount": 50.00,\n    "currency_code": "USD",\n    "description": "Payment for services"\n}\n\nheaders = {\n    "Authorization": f"Bearer {api_key}",\n    "Content-Type": "application/json"\n}\n\nresponse = requests.post(url, json=payload, headers=headers)\nprint(response.json())`,
        'JavaScript': `const apiKey = 'YOUR_SECRET_KEY';\nconst payload = {\n  receiver_email: 'receiver@example.com',\n  amount: 50.00,\n  currency_code: 'USD',\n  description: 'Payment for services'\n};\n\nfetch('${API_BASE_URL}/transactions/p2p', {\n  method: 'POST',\n  headers: {\n    'Authorization': \`Bearer \${apiKey}\`,\n    'Content-Type': 'application/json'\n  },\n  body: JSON.stringify(payload)\n})\n.then(response => response.json())\n.then(data => console.log(data))\n.catch(error => console.error(error));`
    };

    return (
        <div className="bg-white dark:bg-neutral-950">
             <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <nav className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
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

                    <main className="lg:col-span-9">
                        <section id="introduction">
                            <h1 className="text-3xl font-bold font-display text-neutral-900 dark:text-white">API Introduction</h1>
                            <p className="mt-4 text-neutral-600 dark:text-neutral-300">Welcome to the QuantumPay API. Our API is designed to be predictable, resource-oriented, and uses standard HTTP response codes. All API requests must be made over HTTPS.</p>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-300">The base URL for all API requests is: <code className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded text-sm">{API_BASE_URL}</code></p>
                        </section>

                        <section id="authentication" className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">Authentication</h2>
                            <p className="mt-4 text-neutral-600 dark:text-neutral-300">All API requests must be authenticated with an API key. Your API keys carry many privileges; be sure to keep them secure! Authentication is done by providing your secret key in the HTTP <code>Authorization</code> header as a Bearer token.</p>
                            <CodeSnippet snippets={authSnippets} />
                        </section>

                        <section id="transactions" className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                             <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">Transactions API</h2>
                            <h3 className="text-xl font-semibold mt-6 text-neutral-800 dark:text-neutral-100">Create P2P Transfer</h3>
                             <p className="mt-2 text-neutral-600 dark:text-neutral-300">Creates a peer-to-peer transfer to another QuantumPay user. This endpoint is idempotent and processes the transfer atomically.</p>
                            <p className="mt-1 text-sm text-neutral-500"><code className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded">POST</code> <code className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded">/transactions/p2p</code></p>
                            <CodeSnippet snippets={p2pSnippets} />
                        </section>

                         <section id="invoicing" className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                            <h2 className="text-2xl font-bold font-display text-neutral-900 dark:text-white">Invoicing API</h2>
                            <p className="mt-4 text-neutral-600 dark:text-neutral-300">The invoicing API is available to users with an active Business Profile. It allows for the creation and management of invoices.</p>
                             <h3 className="text-xl font-semibold mt-6 text-neutral-800 dark:text-neutral-100">Create an Invoice</h3>
                            <p className="mt-1 text-sm text-neutral-500"><code className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded">POST</code> <code className="bg-neutral-100 dark:bg-neutral-800 p-1 rounded">/business/invoices</code></p>
                         </section>
                    </main>
                </div>
            </div>
        </div>
    );
};

export default ApiDocumentationPage;