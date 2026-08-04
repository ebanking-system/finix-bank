import React from 'react';

const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-5 h-5 border-2',
    lg: 'w-8 h-8 border-3',
  };

  return (
    <span
      className={`inline-block animate-spin rounded-full border-current border-t-transparent ${sizeClasses[size] || sizeClasses.md} ${className}`}
      role="status"
      aria-label="loading"
    />
  );
};

export default Spinner;
