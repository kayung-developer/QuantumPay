import React from 'react';
import { useField } from 'formik';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

const FormInput = ({ label, type = 'text', ...props }) => {
  const [field, meta] = useField(props);
  const [showPassword, setShowPassword] = React.useState(false);

  const isError = meta.touched && meta.error;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={props.id || props.name} className="block text-sm font-medium text-neutral-800 dark:text-neutral-700 dark:text-neutral-300 mb-1">
          {label}
        </label>
      )}
       <div className="relative">
      <input
        {...field}
        {...props}
        type={inputType}
        className={`
          block w-full px-3 py-2
          bg-neutral-100 dark:bg-neutral-800 border
          rounded-md shadow-sm
          text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 dark:placeholder-neutral-500
          focus:outline-none focus:ring-2
          transition-colors duration-200
          ${isError
            ? 'border-red-500 focus:ring-red-500'
            : 'border-neutral-300 dark:border-neutral-300 dark:border-neutral-700 focus:ring-primary'}
        `}
      />
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-600 dark:text-neutral-400 hover:text-neutral-200"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5" />
            ) : (
              <EyeIcon className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      {isError ? (
        <p className="mt-1.5 text-xs text-red-500 animate-fade-in-down">{meta.error}</p>
      ) : null}
    </div>
  );
};

export default FormInput;