import React from 'react';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import { NewspaperIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

const PressRelease = ({ title, date, summary }) => (
    <div className="py-6 border-b border-neutral-800">
        <p className="text-sm text-neutral-400">{date}</p>
        <h3 className="mt-2 text-lg font-semibold text-white hover:text-primary transition-colors cursor-pointer">{title}</h3>
        <p className="mt-1 text-neutral-300">{summary}</p>
    </div>
);

const PressPage = () => {
    return (
        <div className="bg-neutral-950">
            <div className="pt-24 pb-20 sm:pt-32 sm:pb-28">
                <div className="mx-auto max-w-7xl px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="mx-auto max-w-2xl text-center"
                    >
                        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">
                            Press & Media
                        </h1>
                        <p className="mt-6 text-lg leading-8 text-neutral-300">
                            News, announcements, and resources from the QuantumPay team.
                        </p>
                    </motion.div>

                    <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Press Releases */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-white font-display flex items-center">
                                <NewspaperIcon className="h-6 w-6 mr-3 text-primary"/>
                                Latest News
                            </h2>
                            <div className="mt-6">
                                <PressRelease
                                    title="QuantumPay Launches V4.2, Expanding into Enterprise Solutions"
                                    date="October 27, 2023"
                                    summary="The latest version introduces a full invoicing suite, a developer platform with webhooks, and a dynamic job board, solidifying its position as a financial super-app."
                                />
                                 <PressRelease
                                    title="QuantumPay Secures $50M in Series A Funding"
                                    date="September 15, 2023"
                                    summary="The new capital will accelerate product development and international expansion."
                                />
                            </div>
                        </div>

                        {/* Media Contact */}
                        <div className="lg:col-span-1">
                             <div className="bg-neutral-900 p-8 rounded-lg border border-neutral-800">
                                <h2 className="text-2xl font-bold text-white font-display flex items-center">
                                    <EnvelopeIcon className="h-6 w-6 mr-3 text-primary"/>
                                    Media Inquiries
                                </h2>
                                <p className="mt-4 text-neutral-400">
                                    For all media inquiries, please contact our communications team.
                                </p>
                                <p className="mt-4 font-semibold text-primary">
                                    <a href="mailto:press@quantumpay.example.com">press@quantumpay.example.com</a>
                                </p>
                                <div className="mt-6">
                                    <Button variant="outline" className="w-full">Download Media Kit</Button>
                                </div>
                             </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PressPage;