import React from 'react';
import { motion } from 'framer-motion';

const BrandedLoader = ({ size = 80 }) => {
    // Animation variants for the SVG paths
    const pathVariants = {
        hidden: {
            pathLength: 0,
            opacity: 0,
        },
        visible: {
            pathLength: 1,
            opacity: 1,
            transition: {
                duration: 1.5,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "loop",
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4">
            <svg
                role="img"
                aria-label="QuantumPay Logo Loading"
                width={size}
                height={size}
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: '#6D28D9', stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: '#4F46E5', stopOpacity: 1 }} />
                    </linearGradient>
                </defs>

                {/* The outer circle with a subtle pulse animation */}
                <motion.path
                    d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2Z"
                    stroke="url(#logoGradient)"
                    strokeWidth="1.5"
                    initial={{ opacity: 0.3 }}
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />

                {/* The inner lines with the "drawing" animation */}
                <motion.path
                    d="M12 6V18"
                    stroke="url(#logoGradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={pathVariants}
                    initial="hidden"
                    animate="visible"
                />
                 <motion.path
                    d="M8 10L16 14"
                    stroke="url(#logoGradient)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    variants={pathVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ ...pathVariants.visible.transition, delay: 0.5 }} // Stagger the animation
                />
            </svg>
            <p className="text-neutral-400 text-sm animate-pulse">Loading dashboard...</p>
        </div>
    );
};

export default BrandedLoader;