import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

// --- Reusable Components for the Docs Page ---

const CodeSnippet = ({ snippets }) => {
    const [activeLang, setActiveLang] = useState(Object.keys(snippets)[0]);
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(snippets[activeLang]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="bg-[#1E1E1E] rounded-lg border border-neutral-700 my-6">
            <div className="flex items-center justify-between px-4 py-2 border-b border-neutral-700">
                <div className="flex space-x-1">
                    {Object.keys(snippets).map(lang => (
                        <button
                            key={lang}
                            onClick={() => setActiveLang(lang)}
                            className={`px-3 py-1 text-xs rounded-md transition-colors ${
                                activeLang === lang ? 'bg-primary text-white' : 'text-neutral-400 hover:bg-neutral-800'
                            }`}
                        >
                            {lang}
                        </button>
                    ))}
                </div>
                <button onClick={handleCopy} className="text-neutral-400 hover:text-white transition-colors">
                    {copied ? <CheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                </button>
            </div>
            <div className="p-4 text-sm">
                <SyntaxHighlighter language={activeLang.toLowerCase()} style={vscDarkPlus} customStyle={{ margin: 0, background: 'transparent' }}>
                    {snippets[activeLang]}
                </SyntaxHighlighter>
            </div>
        </div>
    );
};

const Section = ({ title, id, children }) => (
    <section id={id} className="py-8 scroll-mt-24">
        <h2 className="text-2xl font-bold font-display text-white border-b border-neutral-800 pb-2">{title}</h2>
        <div className="mt-4 prose prose-invert prose-lg max-w-none text-neutral-300 prose-headings:text-white prose-a:text-primary hover:prose-a:text-primary-light prose-code:bg-neutral-800 prose-code:p-1 prose-code:rounded-md prose-code:font-mono">
            {children}
        </div>
    </section>
);

const docSections = [
    { id: 'introduction', title: 'Introduction' },
    { id: 'authentication', title: 'Authentication' },
    { id: 'wallets', title: 'Wallets API' },
    { id: 'transactions', title: 'Transactions API' },
];

// --- Main API Documentation Page ---

const ApiDocumentationPage = () => {
    const [activeSection, setActiveSection] = useState('introduction');

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { rootMargin: '-20% 0px -80% 0px' } // Trigger when section is in the middle 20% of the viewport
        );

        docSections.forEach(section => {
            const el = document.getElementById(section.id);
            if (el) observer.observe(el);
        });

        return () => observer.disconnect();
    }, []);

    return (
        <div className="bg-neutral-950 pt-24 pb-20 sm:pt-32 sm:pb-28">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    {/* Left Sidebar Navigation */}
                    <nav className="hidden lg:block lg:col-span-3 sticky top-24 self-start">
                        <ul className="space-y-2">
                            {docSections.map(section => (
                                <li key={section.id}>
                                    <a
                                        href={`#${section.id}`}
                                        className={`block pl-4 py-1 text-sm border-l-2 transition-colors ${
                                            activeSection === section.id
                                            ? 'border-primary text-primary font-semibold'
                                            : 'border-neutral-800 text-neutral-400 hover:text-white'
                                        }`}
                                    >
                                        {section.title}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    {/* Main Content */}
                    <main className="lg:col-span-9">
                        <Section id="introduction" title="Introduction">
                            <p>Welcome to the QuantumPay API documentation. Our API is designed to be predictable, resource-oriented, and uses standard HTTP response codes to indicate API errors. You can use our API in test mode for development and live mode for production transactions.</p>
                            <p>The base URL for all API requests is: <code>https://api.quantumpay.example.com</code></p>
                        </Section>

                        <Section id="authentication" title="Authentication">
                            <p>All API requests must be authenticated with an API key. Your API keys carry many privileges; be sure to keep them secure! Do not share your secret API keys in publicly accessible areas such as GitHub, client-side code, and so forth.</p>
                            <p>Authentication is done by providing your secret key in the HTTP `Authorization` header.</p>
                            <CodeSnippet snippets={{
                                'cURL': `curl https://api.quantumpay.example.com/v1/wallets \\
  -H "Authorization: Bearer YOUR_SECRET_KEY"`,
                                'Python': `import requests

headers = {
    "Authorization": "Bearer YOUR_SECRET_KEY"
}
response = requests.get("https://api.quantumpay.example.com/v1/wallets", headers=headers)
print(response.json())`,
                                'Node.js': `const axios = require('axios');

axios.get('https://api.quantumpay.example.com/v1/wallets', {
  headers: {
    'Authorization': 'Bearer YOUR_SECRET_KEY'
  }
})
.then(response => console.log(response.data))
.catch(error => console.error(error));`
                            }} />
                        </Section>

                        <Section id="wallets" title="Wallets API">
                            <p>The Wallets API allows you to retrieve information about a user's currency wallets.</p>
                            <h4>Retrieve all wallets</h4>
                            <p>Returns a list of wallet objects associated with your account.</p>
                            <CodeSnippet snippets={{
                                'cURL': `curl https://api.quantumpay.example.com/v1/wallets/me \\
  -H "Authorization: Bearer YOUR_SECRET_KEY"`,
                                'Python': `# (Same as authentication example)`
                            }} />
                        </Section>

                        <Section id="transactions" title="Transactions API">
                            <p>The Transactions API is the core of QuantumPay, allowing you to create payments and transfers.</p>
                            <h4>Create a P2P Transfer</h4>
                            <p>Creates a new peer-to-peer transfer to another QuantumPay user.</p>
                             <CodeSnippet snippets={{
                                'cURL': `curl https://api.quantumpay.example.com/v1/transactions/p2p \\
  -H "Authorization: Bearer YOUR_SECRET_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "receiver_email": "jane.doe@example.com",
    "amount": 50.00,
    "currency_code": "USD",
    "description": "Payment for services"
  }'`,
                                'Python': `import requests

payload = {
    "receiver_email": "jane.doe@example.com",
    "amount": 50.00,
    "currency_code": "USD",
    "description": "Payment for services"
}
headers = {
    "Authorization": "Bearer YOUR_SECRET_KEY",
    "Content-Type": "application/json"
}
response = requests.post("https://api.quantumpay.example.com/v1/transactions/p2p", json=payload, headers=headers)
print(response.json())`
                            }} />
                        </Section>

                    </main>
                </div>
            </div>
        </div>
    );
};

export default ApiDocumentationPage;