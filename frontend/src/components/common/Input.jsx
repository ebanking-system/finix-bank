import React, { forwardRef } from 'react';

const Input = forwardRef(
  (
    {
      label,
      error,
      icon: Icon,
      helperText,
      type = 'text',
      className = '',
      id,
      name,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const inputId = id || name;
    const errorMessage = typeof error === 'string' ? error : error?.message;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-xs">
          {Icon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Icon className="h-5 w-5" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            id={inputId}
            name={name}
            disabled={disabled}
            className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors disabled:bg-slate-100 disabled:text-slate-500 ${
              Icon ? 'pl-11' : ''
            } ${
              errorMessage
                ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                : 'border-slate-200 focus:border-navy-800 focus:ring-navy-100 hover:border-slate-300'
            } ${className}`}
            {...props}
          />
        </div>
        {errorMessage ? (
          <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
            <span>⚠️</span> {errorMessage}
          </p>
        ) : helperText ? (
          <p className="text-xs text-slate-500 mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
