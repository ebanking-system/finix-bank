import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiLock, FiMail, FiGlobe } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer id="contact" className="bg-navy-950 text-slate-400 border-t border-navy-800 pt-16 pb-8">
      <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-navy-800">
          
          {/* Column 1: Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-coral-500 flex items-center justify-center text-white shadow-md shadow-coral-500/20">
                <FiShield className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                FINIX <span className="text-coral-500">BANK</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Empowering your financial future with zero-balance digital accounts, instant cross-bank transfers, and secure role-based access control.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 bg-navy-900 w-fit px-3 py-1.5 rounded-lg border border-navy-800">
              <FiLock className="w-4 h-4 text-emerald-400" />
              <span>BCrypt & JWT Secured Platform</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Banking</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/signup" className="hover:text-white transition-colors">Savings Account</Link></li>
              <li><Link to="/signup" className="hover:text-white transition-colors">Current Account</Link></li>
              <li><a href="/#features" className="hover:text-white transition-colors">Digital KYC</a></li>
              <li><a href="/#features" className="hover:text-white transition-colors">Instant Fund Transfer</a></li>
            </ul>
          </div>

          {/* Column 3: Legal & Regulatory */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Security & Governance</h4>
            <ul className="space-y-2.5 text-sm">
              <li><a href="/#security" className="hover:text-white transition-colors">Security Architecture</a></li>
              <li><a href="/#security" className="hover:text-white transition-colors">Multi-Factor Auth</a></li>
              <li><a href="/#security" className="hover:text-white transition-colors">Data Protection Policy</a></li>
              <li><a href="/#security" className="hover:text-white transition-colors">Encrypted Data Storage</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Help & Support</h4>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <FiMail className="w-4 h-4 text-coral-500 shrink-0" />
                <a href="mailto:finixbanking@gmail.com" className="hover:text-white transition-colors">
                  finixbanking@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <FiGlobe className="w-4 h-4 text-coral-500 shrink-0 mt-0.5" />
                <span>Fully digital — no physical branches.</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Finix Bank. All rights reserved.</p>
          <p className="text-slate-600">Built for seamless digital banking.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
