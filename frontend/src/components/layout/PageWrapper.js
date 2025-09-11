import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

/**
 * A wrapper component for all public-facing (marketing) pages.
 * It ensures a consistent layout with a Navbar and Footer.
 * The `children` prop will be the actual page content.
 */
const PageWrapper = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-950">
      <Navbar />

      {/* The main content area grows to fill available space */}
      <main className="flex-grow">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default PageWrapper;