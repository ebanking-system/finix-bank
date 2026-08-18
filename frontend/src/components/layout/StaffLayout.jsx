import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiShield,
  FiUserCheck,
  FiLogOut,
  FiMenu,
  FiX,
  FiBriefcase,
  FiDollarSign,
  FiList,
  FiUsers,
  FiUserPlus,
  FiUser,
  FiChevronRight,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import Button from '../common/Button';
import Badge from '../common/Badge';

const StaffLayout = ({ children, title, subtitle, activeTab, onTabChange }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [imgError, setImgError] = useState(false);

  const { userRole, userId, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStaffProfile = async () => {
      try {
        const data = await employeeService.getMyProfile();
        const p = data?.data || data;
        setProfile(p);
      } catch (err) {
        // Silent catch
      }
    };
    fetchStaffProfile();
  }, [userId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isManager = userRole === 'MANAGER';
  const photoUrl = employeeService.getEmployeePhotoUrl(profile?.employeeId || userId, profile?.profilePhotoPath);

  // Manager Navigation Items with direct Tab Linking
  const managerNavItems = [
    { label: 'Executive Console', path: '/manager/dashboard', tab: 'loans', icon: FiBriefcase },
    { label: 'Loan Applications', path: '/manager/dashboard', tab: 'loans', icon: FiDollarSign },
    { label: 'KYC Compliance', path: '/manager/dashboard', tab: 'kyc', icon: FiUserCheck },
    { label: 'Loan Product Catalog', path: '/manager/dashboard', tab: 'loan-types', icon: FiList },
    { label: 'Staff Roster', path: '/manager/dashboard', tab: 'employee-roster', icon: FiUsers },
    { label: 'Onboard Staff', path: '/manager/dashboard', tab: 'register-employee', icon: FiUserPlus },
    { label: 'Manager Profile', path: '/manager/profile', tab: null, icon: FiUser },
  ];

  // Employee Navigation Items
  const employeeNavItems = [
    { label: 'Operations Desk', path: '/employee/dashboard', tab: null, icon: FiBriefcase },
    { label: 'My Staff Profile', path: '/employee/profile', tab: null, icon: FiUserCheck },
  ];

  const currentNavItems = isManager ? managerNavItems : employeeNavItems;

  const handleNavClick = (item) => {
    setSidebarOpen(false);
    if (item.tab && onTabChange && location.pathname === item.path) {
      onTabChange(item.tab);
    } else if (item.tab) {
      navigate(`${item.path}?tab=${item.tab}`);
    } else {
      navigate(item.path);
    }
  };

  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    : isManager ? 'Branch Manager' : 'Staff Member';

  const userInitial = profile?.firstName?.charAt(0)?.toUpperCase() || (isManager ? 'M' : 'E');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row relative">
      {/* Mobile Header */}
      <div className="lg:hidden bg-navy-950 text-white px-4 py-4 flex items-center justify-between border-b border-navy-800 sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-coral-500 flex items-center justify-center text-white">
            <FiShield className="w-5 h-5" />
          </div>
          <span className="font-extrabold tracking-tight">
            {isManager ? 'FINIX MANAGER' : 'FINIX STAFF'}
          </span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
        >
          {sidebarOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-navy-950/60 backdrop-blur-xs z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-64 bg-navy-950 text-slate-300 flex flex-col justify-between border-r border-navy-800 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } h-screen`}
      >
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Brand Header */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center text-white shadow-lg shadow-coral-500/20">
              <FiShield className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-white tracking-tight">FINIX BANK</span>
              <span className="block text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">
                {isManager ? 'Executive Manager' : 'Operations Portal'}
              </span>
            </div>
          </Link>

          {/* Quick Staff Card in Sidebar */}
          <Link
            to={isManager ? '/manager/profile' : '/employee/profile'}
            className="block p-3 rounded-2xl bg-navy-900/90 border border-navy-800 hover:border-coral-500/60 transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl overflow-hidden bg-navy-800 border-2 border-navy-700 group-hover:border-coral-500 flex items-center justify-center text-white font-bold text-sm shrink-0 transition-colors">
                {photoUrl && !imgError ? (
                  <img
                    src={photoUrl}
                    alt={fullName}
                    onError={() => setImgError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-coral-400">{userInitial}</span>
                )}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate group-hover:text-coral-400 transition-colors">
                  {fullName}
                </p>
                <span className="inline-block text-[10px] font-mono text-emerald-400 font-semibold uppercase">
                  {profile?.designation ? profile.designation.replace(/_/g, ' ') : userRole}
                </span>
              </div>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {currentNavItems.map((item, idx) => {
              const Icon = item.icon;
              const isRouteActive = location.pathname === item.path;
              const isTabActive = item.tab ? activeTab === item.tab : isRouteActive;
              const isActive = item.tab ? isRouteActive && isTabActive : isRouteActive;

              return (
                <button
                  key={`${item.path}-${item.tab || idx}`}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-coral-500 text-white shadow-md shadow-coral-500/20 font-bold'
                      : 'text-slate-300 hover:bg-navy-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {isActive && <FiChevronRight className="w-3.5 h-3.5 text-white" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-navy-800 space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Staff ID</span>
            <span className="font-mono font-bold text-white">#{profile?.employeeId || userId}</span>
          </div>

          <Button
            variant="dark-outline"
            fullWidth
            size="sm"
            onClick={handleLogout}
            icon={FiLogOut}
          >
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0 bg-slate-50 p-4 sm:p-6 lg:p-10 space-y-8 overflow-y-auto">
        {(title || subtitle) && (
          <div className="border-b border-slate-200 pb-5">
            {title && <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">{title}</h1>}
            {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
};

export default StaffLayout;


