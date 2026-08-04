import React from 'react';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import { FiClock, FiShield, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';

export const FixedDeposits = () => (
  <CustomerLayout title="Fixed Deposits" subtitle="High-yield term deposit investments.">
    <div className="max-w-xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 mx-auto flex items-center justify-center">
        <FiTrendingUp className="w-8 h-8" />
      </div>
      <Badge variant="PENDING">COMING SOON</Badge>
      <h2 className="text-xl font-bold text-navy-900">Fixed Deposits Module Coming Soon</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        High-interest term deposits with flexible tenure options will be available in the next release update.
      </p>
    </div>
  </CustomerLayout>
);

export const Notifications = () => (
  <CustomerLayout title="Notifications & Support" subtitle="Account alerts and live assistant.">
    <div className="max-w-xl mx-auto p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
      <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-600 mx-auto flex items-center justify-center">
        <FiMessageSquare className="w-8 h-8" />
      </div>
      <Badge variant="PENDING">COMING SOON</Badge>
      <h2 className="text-xl font-bold text-navy-900">AI Banking Assistant & Alerts</h2>
      <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
        Real-time push notifications and 24/7 automated banking support assistant coming soon.
      </p>
    </div>
  </CustomerLayout>
);
