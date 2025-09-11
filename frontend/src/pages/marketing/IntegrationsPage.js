import React from 'react';
import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, BuildingStorefrontIcon, PresentationChartLineIcon, CircleStackIcon } from '@heroicons/react/24/outline';
import Button from '../../components/common/Button';

// Dummy logo components for visual representation
const LogoPlaceholder = ({ name, bgColor = 'bg-neutral-800' }) => (
  <div className={`flex items-center justify-center h-16 w-16 rounded-lg ${bgColor}`}>
    <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
  </div>
);

const integrationCategories = [
  {
    name: 'Accounting',
    icon: PresentationChartLineIcon,
    description: 'Automatically sync your QuantumPay transactions, invoices, and payroll data with your accounting software. Close your books faster and eliminate manual data entry.',
    logos: [
      { name: 'QuickBooks' },
      { name: 'Xero' },
      { name: 'Zoho Books' },
      { name: 'SAP' },
    ],
  },
  {
    name: 'eCommerce',
    icon: BuildingStorefrontIcon,
    description: 'Accept payments directly on your online store with our seamless plugins. Unify your sales data, manage inventory, and process refunds effortlessly.',
    logos: [
      { name: 'Shopify' },
      { name: 'WooCommerce' },
      { name: 'Magento' },
      { name: 'BigCommerce' },
    ],
  },
  {
    name: 'CRM & Sales',
    icon: ArrowTrendingUpIcon,
    description: 'Connect sales data with payment information. Trigger actions in your CRM when invoices are paid, and get a complete view of your customer lifecycle.',
    logos: [
      { name: 'Salesforce' },
      { name: 'HubSpot' },
      { name: 'Zoho CRM' },
    ],
  },
  {
    name: 'Databases & Warehouses',
    icon: CircleStackIcon,
    description: 'Stream all your financial data into your own data warehouse for custom analytics, business intelligence, and advanced reporting.',
    logos: [
      { name: 'PostgreSQL' },
      { name: 'Snowflake' },
      { name: 'BigQuery' },
    ],
  },
];

const IntegrationsPage = () => {
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
                <div className="mx-auto max-w-3xl">
                    <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
                    Connect Your Entire Stack
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-neutral-300">
                    QuantumPay is designed to be the central nervous system for your business finances. Integrate seamlessly with the tools you already use and love.
                    </p>
                </div>
            </motion.div>
        </div>
      </div>

      {/* Integration Categories */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="space-y-16">
                {integrationCategories.map((category, index) => (
                    <motion.div
                        key={category.name}
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center"
                    >
                        {/* Description */}
                        <div className="lg:col-span-1">
                            <div className="flex items-center space-x-3">
                                <category.icon className="h-8 w-8 text-primary"/>
                                <h2 className="text-3xl font-bold font-display text-white">{category.name}</h2>
                            </div>
                            <p className="mt-4 text-neutral-400">{category.description}</p>
                        </div>

                        {/* Logos */}
                        <div className="lg:col-span-2">
                           <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                                {category.logos.map(logo => (
                                    <div key={logo.name} className="flex flex-col items-center text-center">
                                        <LogoPlaceholder name={logo.name} />
                                        <p className="mt-2 text-sm font-medium text-neutral-300">{logo.name}</p>
                                    </div>
                                ))}
                           </div>
                        </div>
                    </motion.div>
                ))}
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
                    Ready to Build a Connected Future?
                    </h2>
                    <p className="mt-4 max-w-xl mx-auto text-lg text-neutral-400">
                    Explore our developer documentation to start building powerful, custom integrations with the QuantumPay API.
                    </p>
                    <div className="mt-8">
                    <Button to="/developers" size="lg" variant="outline">
                        View API Docs
                    </Button>
                    </div>
                </motion.div>
            </div>
      </div>
    </div>
  );
};

export default IntegrationsPage;