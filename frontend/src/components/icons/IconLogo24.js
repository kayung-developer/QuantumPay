import React from 'react';

/**
 * A 24x24 pixel QuantumPay logo component.
 * It is a self-contained SVG, making it highly performant and easy to use.
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
      className={className} // Allows passing Tailwind classes like `w-6 h-6`
      {...props} // Spreads other props like `aria-label`
    >
      <defs>
        {/* The gradient ID is unique to this component to prevent conflicts */}
        <linearGradient id="orbit-bg-24" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
          <stop stopColor="#5E54F3"/>
          <stop offset="1" stopColor="#2DD4BF"/>
        </linearGradient>
      </defs>

      {/* Background rectangle */}
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

      {/* "Satellite" circle */}
      <circle
        cx="7.3125"
        cy="7.3125"
        r="1.875"
        fill="#2DD4BF"
        stroke="#FFFFFF"
        strokeWidth="0.75"
      />
    </svg>
  );
};

export default IconLogo24;