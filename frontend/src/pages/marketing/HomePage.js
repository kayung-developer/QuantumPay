import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../../components/common/Button';
import {
  ShieldCheckIcon,
  GlobeAltIcon,
  CpuChipIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

// --- Sub-components for HomePage Sections ---

const HeroSection = () => (
  <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 text-center bg-glow-radial overflow-hidden">
    <div className="container mx-auto px-4 z-10 relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight">
          The Future of Global Payments,
          <br />
          <span className="text-primary-light">Secured & Simplified.</span>
        </h1>
        <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-neutral-300">
          QuantumPay is a hyper-secure, AI-powered global payment system for instantaneous transactions, multi-currency wallets, and comprehensive financial tools for individuals and businesses.
        </p>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
        className="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4"
      >
        <Button to="/register" size="lg" className="w-full sm:w-auto">
          Get Started for Free
        </Button>
        <Button to="/#features" variant="outline" size="lg" className="w-full sm:w-auto">
          Explore Features
        </Button>
      </motion.div>
    </div>
    {/* Animated background shapes for visual appeal */}
    <div className="absolute top-0 left-0 w-full h-full z-0">
        <motion.div
            className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full filter blur-2xl"
            animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
            className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full filter blur-3xl"
            animate={{ y: [0, -15, 0], x: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
    </div>
  </section>
);

const features = [
  {
    icon: ShieldCheckIcon,
    title: 'Hyper-Secure Infrastructure',
    description: 'Quantum-resistant encryption and AI-driven fraud detection protect every transaction.',
  },
  {
    icon: GlobeAltIcon,
    title: 'Universal Currency Support',
    description: 'Manage 150+ fiat and 50+ cryptocurrencies in one multi-currency wallet with auto-conversion.',
  },
  {
    icon: BoltIcon,
    title: 'Instantaneous Transactions',
    description: 'Leveraging Layer-2 blockchain and AI routing, payments settle globally in under 2 seconds.',
  },
  {
    icon: CpuChipIcon,
    title: 'AI-Powered Intelligence',
    description: 'From predictive analytics to dynamic credit scoring, our AI provides actionable financial insights.',
  },
];

const FeaturesSection = () => (
  <section id="features" className="py-20 lg:py-32 bg-neutral-950">
    <div className="container mx-auto px-4">
      <div className="text-center">
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">Why Choose QuantumPay?</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-400">
          We've built a platform that goes beyond payments. It's a complete financial operating system.
        </p>
      </div>
      <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="bg-neutral-900 border border-neutral-800 p-8 rounded-lg shadow-lg text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <div className="inline-flex p-4 bg-primary/10 rounded-full">
              <feature.icon className="h-8 w-8 text-primary-light" />
            </div>
            <h3 className="mt-6 font-display text-xl font-semibold text-white">{feature.title}</h3>
            <p className="mt-2 text-neutral-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);


const testimonials = [
    {
        quote: "QuantumPay has revolutionized how our startup handles international payments. The speed and low fees are unmatched. It's a game-changer.",
        name: 'Sarah Johnson',
        title: 'CEO, InnovateTech',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    },
    {
        quote: "The AI-powered Fraud Shield saved us from a major security incident. I trust QuantumPay with our entire company's payroll and vendor payments.",
        name: 'Michael Chen',
        title: 'CFO, Global Exports Inc.',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026705d'
    },
    {
        quote: "As a freelancer, getting paid from clients worldwide used to be a headache. Now, it's instant. The multi-currency wallet is a lifesaver.",
        name: 'Elena Rodriguez',
        title: 'Independent Designer',
        avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026706d'
    }
];

const TestimonialsSection = () => (
  <section className="py-20 lg:py-32 bg-neutral-900">
    <div className="container mx-auto px-4">
      <div className="text-center">
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">Trusted by Innovators Worldwide</h2>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-neutral-400">
          Don't just take our word for it. Here's what our users are saying.
        </p>
      </div>
      <div className="mt-16 grid gap-8 md:grid-cols-1 lg:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <motion.div
            key={index}
            className="bg-neutral-950 border border-neutral-800 p-8 rounded-lg shadow-lg flex flex-col"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <p className="text-neutral-300 flex-grow">"{testimonial.quote}"</p>
            <div className="mt-6 flex items-center">
              <img className="h-12 w-12 rounded-full" src={testimonial.avatar} alt={testimonial.name} />
              <div className="ml-4">
                <p className="font-semibold text-white">{testimonial.name}</p>
                <p className="text-neutral-400">{testimonial.title}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);


const CTASection = () => (
  <section className="py-20 lg:py-32 bg-neutral-950">
    <div className="container mx-auto px-4 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
      >
        <h2 className="font-display text-3xl lg:text-4xl font-bold text-white">
          Ready to Step into the Future of Finance?
        </h2>
        <p className="mt-4 max-w-xl mx-auto text-lg text-neutral-400">
          Join thousands of users and businesses building their financial future on QuantumPay.
        </p>
        <div className="mt-8">
          <Button to="/register" size="lg">
            Create Your Free Account
          </Button>
        </div>
      </motion.div>
    </div>
  </section>
);


// --- Main HomePage Component ---
const HomePage = () => {
  return (
    <>
      <HeroSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
};

export default HomePage;