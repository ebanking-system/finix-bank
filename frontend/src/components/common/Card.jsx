import React from 'react';

const Card = ({ children, title, subtitle, action, className = '', headerClassName = '', glass = false }) => {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-md transition-shadow duration-200 overflow-hidden ${
        glass ? 'glass-panel' : ''
      } ${className}`}
    >
      {(title || subtitle || action) && (
        <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-4 ${headerClassName}`}>
          <div>
            {title && <h3 className="text-base font-bold text-slate-900">{title}</h3>}
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};

export default Card;
