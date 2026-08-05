import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiCreditCard,
  FiUsers,
  FiFileText,
  FiRepeat,
  FiUserCheck,
  FiUser,
  FiLogOut,
  FiShield,
  FiMenu,
  FiX,
  FiChevronRight,
  FiTrendingUp,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';
import FinixBotWidget from '../common/FinixBotWidget';

const navItems = [
  { label: 'Overview', path: '/customer/dashboard', icon: FiHome },
  { label: 'Accounts & Balance', path: '/customer/accounts', icon: FiCreditCard },
  { label: 'Beneficiaries', path: '/customer/beneficiaries', icon: FiUsers },
  { label: 'Cards', path: '/customer/cards', icon: FiCreditCard },
  { label: 'Digital KYC', path: '/customer/kyc', icon: FiUserCheck },
  { label: 'Loans & EMIs', path: '/customer/loans', icon: FiFileText },
  { label: 'Fixed Deposits', path: '/customer/fixed-deposits', icon: FiTrendingUp },
  { label: 'Transactions', path: '/customer/transactions', icon: FiRepeat },
  { label: 'My Profile', path: '/customer/profile', icon: FiUser },
];

const CustomerLayout = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, userId } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-navy-900 text-white px-4 py-4 flex items-center justify-between border-b border-navy-800 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center text-white">
            <FiShield className="w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-tight">FINIX BANK</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
        >
          {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Backdrop for Mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-navy-950/60 backdrop-blur-xs z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-navy-900 text-slate-300 flex flex-col justify-between border-r border-navy-800 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-screen`}
      >
        <div className="p-6 space-y-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center text-white shadow-lg shadow-coral-500/20">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight">FINIX BANK</span>
              <span className="block text-[10px] text-coral-400 font-semibold tracking-wider uppercase">Customer Portal</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20'
                      : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <FiChevronRight className="w-4 h-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Sign Out Footer */}
        <div className="p-6 border-t border-navy-800 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-navy-800 border border-navy-700 text-slate-200 flex items-center justify-center font-bold text-sm">
              #{userId ? String(userId).slice(-2) : 'C'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">Customer Account</p>
              <p className="text-[11px] text-slate-400 truncate">ID: #{userId}</p>
            </div>
          </div>

          <Button
            variant="outline"
            fullWidth
            size="sm"
            onClick={handleLogout}
            icon={FiLogOut}
            className="border-navy-700 text-slate-300 hover:bg-navy-800 hover:text-white"
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 bg-slate-50 p-4 sm:p-6 lg:p-10 space-y-8 overflow-y-auto">
        {(title || subtitle) && (
          <div className="border-b border-slate-200 pb-5">
            {title && <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      {/* Floating FinixBot AI Widget */}
      <FinixBotWidget />
    </div>
  );
};

export default CustomerLayout;
