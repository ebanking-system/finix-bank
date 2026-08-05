import React, { forwardRef } from 'react';

const Select = forwardRef(({ label, error, options = [], placeholder = 'Select', className = '', ...props }, ref) => {
  const selectId = props.id || props.name;
  const errorMessage = typeof error === 'string' ? error : error?.message;
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative rounded-xl shadow-xs">
        <select
          ref={ref}
          id={selectId}
          className={`block w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-colors ${
            errorMessage ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-navy-800 focus:ring-navy-100 hover:border-slate-300'
          } ${className}`}
          {...props}
        >
          <option value="" disabled>{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {errorMessage && (
        <p className="text-xs font-medium text-red-600 flex items-center gap-1 mt-1">
          <span>⚠️</span> {errorMessage}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
