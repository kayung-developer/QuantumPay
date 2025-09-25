import React from 'react';

const Spinner = ({ size = 'md', color = 'primary' }) => {
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  const colorClasses = {
    primary: 'border-primary',
    white: 'border-white',
    neutral: 'border-neutral-500',
  };

  const spinnerSizeClass = sizeClasses[size] || sizeClasses.md;
  const spinnerColorClass = colorClasses[color] || colorClasses.primary;

  return (
    <div
      className={`
        animate-spin
        rounded-full
        border-t-2
        border-b-2
        border-solid
        ${spinnerSizeClass}
        ${spinnerColorClass}
        border-t-transparent
      `}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;