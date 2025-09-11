import React from 'react';
import { motion } from 'framer-motion';
import { GlobeAmericasIcon, UserGroupIcon, LightBulbIcon } from '@heroicons/react/24/outline';

const PageHeader = ({ title, subtitle }) => (
    <div className="bg-neutral-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
            >
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl font-display">{title}</h1>
                <p className="mt-6 text-lg leading-8 text-neutral-300 max-w-3xl mx-auto">{subtitle}</p>
            </motion.div>
        </div>
    </div>
);

const values = [
  {
    name: 'Our Mission',
    description: 'To build a global, inclusive, and secure financial infrastructure that empowers individuals and businesses to transact without borders, fostering economic opportunity for all.',
    icon: GlobeAmericasIcon,
  },
  {
    name: 'Our Vision',
    description: 'To be the universally trusted financial operating system for the digital age, where value is exchanged as seamlessly and instantaneously as information.',
    icon: LightBulbIcon,
  },
  {
    name: 'Our Team',
    description: 'We are a diverse team of engineers, designers, and financial experts passionate about solving complex problems and building a more equitable financial future.',
    icon: UserGroupIcon,
  },
]

const AboutPage = () => {
  return (
    <div className="bg-neutral-950">
      <PageHeader
        title="About QuantumPay"
        subtitle="We are fundamentally reshaping the global financial landscape. Our goal is to create a single, unified platform for the entire financial lifecycle of individuals and businesses, built on the principles of security, speed, and intelligence."
      />

      <div className="mx-auto my-20 max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto max-w-2xl lg:text-center"
        >
          <h2 className="text-base font-semibold leading-7 text-primary">Our Core Values</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl font-display">
            The principles that drive our innovation
          </p>
        </motion.div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {values.map((value, index) => (
              <motion.div
                key={value.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                className="flex flex-col p-8 bg-neutral-900 border border-neutral-800 rounded-lg"
              >
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                  <value.icon className="h-6 w-6 flex-none text-primary" aria-hidden="true" />
                  {value.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-neutral-400">
                  <p className="flex-auto">{value.description}</p>
                </dd>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;