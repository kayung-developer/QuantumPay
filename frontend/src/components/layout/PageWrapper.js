import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const PageWrapper = ({ children }) => {
  return (
    // [THE FIX] Added theme-aware background and text colors.
    // The default is a light theme (bg-white, text-neutral-800).
    // The `dark:` variants apply the dark theme styles.
    <div className="flex flex-col min-h-screen bg-white dark:bg-neutral-950 text-neutral-800 dark:text-neutral-700 dark:text-neutral-300">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageWrapper;