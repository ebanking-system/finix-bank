import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer active:scale-[0.99]';

  const variantClasses = {
    primary:
      'bg-coral-500 hover:bg-coral-600 text-white shadow-md shadow-coral-500/20 focus:ring-coral-500 focus:ring-offset-0',
    secondary:
      'bg-navy-800 hover:bg-navy-900 text-white shadow-md shadow-navy-900/20 focus:ring-navy-800 focus:ring-offset-0',
    outline:
      'border border-slate-300 hover:border-navy-800 text-navy-800 bg-white hover:bg-slate-50 focus:ring-navy-500 focus:ring-offset-0',
    'dark-outline':
      'border border-navy-700 hover:border-coral-500 text-slate-200 hover:text-white bg-navy-900/60 hover:bg-coral-500/20 focus:ring-coral-500 focus:ring-offset-0',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 focus:ring-red-500 focus:ring-offset-0',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-2.5',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variantClasses[variant] || variantClasses.primary} ${sizeClasses[size] || sizeClasses.md} ${widthClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner size={size === 'lg' ? 'md' : 'sm'} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="text-current shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="text-current shrink-0" />}
        </>
      )}
    </button>
  );
};

export default Button;
