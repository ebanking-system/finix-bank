import React from 'react';

const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantMap = {
    APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-red-50 text-red-700 border-red-200',
    DISBURSED: 'bg-blue-50 text-blue-700 border-blue-200',
    SAVINGS: 'bg-purple-50 text-purple-700 border-purple-200',
    CURRENT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    CUSTOMER: 'bg-sky-50 text-sky-700 border-sky-200',
    EMPLOYEE: 'bg-teal-50 text-teal-700 border-teal-200',
    MANAGER: 'bg-rose-50 text-rose-700 border-rose-200',
    default: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const key = String(children || variant).toUpperCase();
  const colorClasses = variantMap[key] || variantMap[variant] || variantMap.default;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1 text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colorClasses} ${sizeClasses[size] || sizeClasses.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
