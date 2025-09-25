import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from '../common/LanguageSwitcher';
import IconLogo24 from '../icons/IconLogo24';

// Replace with your actual logo component or image
const Logo = () => (
  <Link to="/" className="flex items-center space-x-2">
    {/* You can use an SVG or an Image here */}
    <IconLogo24 />
    <span className="font-display text-2xl font-bold text-neutral-900 dark:text-white">QuantumPay</span>
  </Link>
);

const navLinks = [
  { name: 'Features', href: '/#features' }, // Example for hash link
  { name: 'Pricing', href: '/pricing' },
  { name: 'Security', href: '/security' },
  { name: 'About Us', href: '/about' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
    exit: { opacity: 0, y: -20 }
  };

  const mobileLinkVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || isOpen
        ? 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md shadow-lg'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
             {/* The Logo component itself needs to be updated */}
             <Logo />
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.href}
                  // [THE FIX] Added theme-aware text colors for nav links
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                      ? 'text-primary'
                      : 'text-neutral-600 dark:text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-100 dark:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6 space-x-3">
              {currentUser ? (
                <>
                  <Link
                    to="/dashboard"
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 transform hover:scale-105"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:bg-neutral-800 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300 transform hover:scale-105"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="bg-neutral-100 dark:bg-neutral-800 inline-flex items-center justify-center p-2 rounded-md text-neutral-600 dark:text-neutral-400 hover:text-white hover:bg-neutral-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <XMarkIcon className="block h-6 w-6" /> : <Bars3Icon className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden"
            id="mobile-menu"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <motion.div variants={mobileLinkVariants} key={link.name}>
                    <NavLink
                        to={link.href}
                         className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-base font-medium ${
                            isActive ? 'bg-primary text-white' : 'text-neutral-600 dark:text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-neutral-900 dark:hover:text-white'
                            }`
                        }
                        onClick={() => setIsOpen(false)}
                    >
                        {link.name}
                    </NavLink>
                </motion.div>
              ))}
            </div>
            <div className="pt-4 pb-3 border-t border-neutral-300 dark:border-neutral-700">
                <div className="ml-4 flex items-center md:ml-6 space-x-4">
                <LanguageSwitcher />
                    {currentUser ? (
                    <>
                        <motion.div variants={mobileLinkVariants} className="w-full">
                            <Link
                                to="/dashboard"
                                onClick={() => setIsOpen(false)}
                                className="w-full text-left bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300"
                            >
                                Dashboard
                            </Link>
                        </motion.div>
                        <motion.div variants={mobileLinkVariants} className="w-full">
                            <button
                                onClick={() => { handleLogout(); setIsOpen(false); }}
                                className="w-full text-left bg-neutral-700 hover:bg-neutral-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                            >
                                Logout
                            </button>
                        </motion.div>
                    </>
                    ) : (
                    <>
                        <motion.div variants={mobileLinkVariants} className="w-full">
                            <Link
                                to="/login"
                                onClick={() => setIsOpen(false)}
                                className="w-full text-left text-neutral-700 dark:text-neutral-300 hover:bg-neutral-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                            >
                                Login
                            </Link>
                        </motion.div>
                         <motion.div variants={mobileLinkVariants} className="w-full">
                            <Link
                                to="/register"
                                onClick={() => setIsOpen(false)}
                                className="w-full text-left bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-md transition duration-300"
                            >
                                Get Started
                            </Link>
                        </motion.div>
                    </>
                    )}
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;