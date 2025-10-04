// FILE: frontend/src/components/icons/IconLogo24.js

import React from 'react';

/**
 * [THEME AWARE]
 * A 24x24 pixel QuantumPay logo component.
 * It uses CSS variables for its gradient, allowing it to adapt to light/dark themes automatically.
 * @param {object} props - Standard React component props. Accepts `className` for additional styling.
 */
 import logoSrc from '../../assets/logo.png';
const IconLogo24 = ({ className, width, height }) => {
  return (
        <img
            src={logoSrc}
            alt="QuantumPay Logo"
            className={className} // Allows passing Tailwind CSS classes like "h-6 w-auto"
            width={width}         // Allows setting a specific width
            height={height}       // Allows setting a specific height
            loading="lazy"        // Good practice for performance
        />
    );
};

export default IconLogo24;
