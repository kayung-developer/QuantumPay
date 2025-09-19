import React from 'react';
import { Link } from 'react-router-dom';
import Spinner from './Spinner';

const Button = ({
  children,
  type = 'button',
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  fullWidth = false,
  className = '',
  to, // for react-router Link
  href, // for standard anchor tag
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

  const variantStyles = {
    primary: 'bg-primary border-transparent text-white hover:bg-primary-dark focus:ring-primary',
    secondary: 'bg-neutral-700 border-transparent text-white hover:bg-neutral-600 focus:ring-neutral-500',
    outline: 'bg-transparent border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary',
    danger: 'bg-red-600 border-transparent text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:bg-neutral-800 focus:ring-primary',
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const widthStyle = fullWidth ? 'w-full' : '';

  const combinedClassName = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${widthStyle}
    ${className}
    ${isLoading ? 'cursor-wait' : ''}
  `;

  const content = isLoading ? (
    <div className="flex items-center">
      <Spinner size="sm" color="white" />
      <span className="ml-2">Loading...</span>
    </div>
  ) : (
    children
  );

  if (to) {
    return (
      <Link to={to} className={combinedClassName} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClassName} target="_blank" rel="noopener noreferrer" {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={combinedClassName}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;