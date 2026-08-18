import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShield, FiMenu, FiX, FiUserCheck, FiLogOut, FiArrowRight } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Button from './Button';

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated, userRole, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    switch (userRole) {
      case 'CUSTOMER':
        return '/customer/dashboard';
      case 'EMPLOYEE':
        return '/employee/dashboard';
      case 'MANAGER':
        return '/manager/dashboard';
      default:
        return '/login';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-navy-900/95 backdrop-blur-md border-b border-navy-800 text-white">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-coral-600 to-coral-400 flex items-center justify-center shadow-lg shadow-coral-500/30 group-hover:scale-105 transition-transform">
              <FiShield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white font-sans">
                FINIX <span className="text-coral-500">BANK</span>
              </span>
              <span className="block text-[10px] uppercase font-semibold text-slate-400 tracking-widest -mt-1">
                Next-Gen Banking
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Home
            </Link>
            <a href="/#features" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Features
            </a>
            <a href="/#security" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Security
            </a>
            <a href="/#contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              Contact
            </a>
          </nav>

          {/* Desktop Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()}>
                  <Button variant="secondary" size="sm" icon={FiUserCheck}>
                    My Dashboard
                  </Button>
                </Link>
                <Button
                  variant="dark-outline"
                  size="sm"
                  onClick={handleLogout}
                  icon={FiLogOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <span className="text-sm font-semibold text-slate-200 hover:text-white px-3 py-2 transition-colors">
                    Sign In
                  </span>
                </Link>
                <Link to="/signup">
                  <Button variant="primary" size="md" icon={FiArrowRight} iconPosition="right">
                    Open Account
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-navy-800 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX className="w-6 h-6" /> : <FiMenu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-navy-950 border-b border-navy-800 px-4 pt-2 pb-6 space-y-4">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-navy-800"
          >
            Home
          </Link>
          <a
            href="/#features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-navy-800"
          >
            Features
          </a>
          <a
            href="/#security"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-navy-800"
          >
            Security
          </a>
          <a
            href="/#contact"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-200 hover:bg-navy-800"
          >
            Contact
          </a>
          <div className="pt-4 border-t border-navy-800 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth icon={FiUserCheck}>
                    Go to Dashboard
                  </Button>
                </Link>
                <Button
                  variant="dark-outline"
                  fullWidth
                  onClick={handleLogout}
                  icon={FiLogOut}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" fullWidth className="text-white border-slate-700 hover:bg-slate-800">
                    Sign In
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth icon={FiArrowRight} iconPosition="right">
                    Open an Account
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
