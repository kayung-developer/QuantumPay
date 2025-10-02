// FILE: frontend/src/components/icons/IconLogo24.js

import React from 'react';

/**
 * [THEME AWARE]
 * A 24x24 pixel QuantumPay logo component.
 * It uses CSS variables for its gradient, allowing it to adapt to light/dark themes automatically.
 * @param {object} props - Standard React component props. Accepts `className` for additional styling.
 */
const IconLogo24 = ({ className = '', ...props }) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        <linearGradient id="orbit-bg-24" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          {/* [THE DEFINITIVE FIX - PART 2] Use CSS variables for the gradient stops. */}
          <stop stopColor="var(--logo-gradient-start)"/>
          <stop offset="1" stopColor="var(--logo-gradient-end)"/>
        </linearGradient>
      </defs>

      {/* Background rectangle now uses the theme-aware gradient */}
      <rect width="24" height="24" rx="4.5" fill="url(#orbit-bg-24)"/>

      {/* Main orbital path */}
      <path
        d="M18.375 14.25 C 20.25 10.5, 18 6, 13.5 5.25 C 9 4.5, 5.25 7.5, 5.25 12 C 5.25 16.5, 9 19.5, 13.5 18.75"
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        fill="none"
      />

      {/* Secondary, faded path */}
      <path
        d="M12.75 18.75 C 15 18, 16.875 16.5, 18.375 14.25"
        stroke="white"
        strokeWidth="2.25"
        strokeLinecap="round"
        fill="none"
        opacity="0.5"
      />

      {/* "Satellite" circle now uses a theme-aware color */}
      <circle
        cx="7.3125"
        cy="7.3125"
        r="1.875"
        fill="var(--logo-gradient-end)" // Use the end gradient color for the satellite
        stroke="#FFFFFF"
        strokeWidth="0.75"
      />
    </svg>
  );
};

export default IconLogo24;
