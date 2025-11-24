'use client';

import { forwardRef } from 'react';
import { useTheme } from '@/lib/contexts/ThemeContext';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
      <div className="iphone-form-group">
        {label && (
          <label className="iphone-form-label" htmlFor={props.id}>
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`iphone-form-input ${error ? 'border-red-500' : ''} ${className}`}
          style={{
            fontSize: '16px', // Prevents zoom on iOS
          }}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1" role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

