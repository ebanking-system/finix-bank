import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiCreditCard,
  FiSend,
  FiUsers,
  FiUserCheck,
  FiFileText,
  FiPlusCircle,
  FiArrowUpRight,
  FiClock,
  FiShield,
  FiTrendingUp,
} from 'react-icons/fi';
import { accountService } from '../../services/accountService';
import { customerService } from '../../services/customerService';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const CustomerDashboard = () => {
  const { userId } = useAuth();
  const [profile, setProfile] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({ SAVINGS: null, CURRENT: null });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (userId) {
        const [accs, prof] = await Promise.allSettled([
          accountService.getCustomerAccounts(userId),
          customerService.getProfile(),
        ]);

        if (accs.status === 'fulfilled') setAccounts(Array.isArray(accs.value) ? accs.value : []);
        if (prof.status === 'fulfilled') setProfile(prof.value);
      }

      // Fetch live balances
      const balMap = {};
      try {
        balMap.SAVINGS = await accountService.getAccountBalance('SAVINGS');
      } catch (e) {
        balMap.SAVINGS = null;
      }
      try {
        balMap.CURRENT = await accountService.getAccountBalance('CURRENT');
      } catch (e) {
        balMap.CURRENT = null;
      }
      setBalances(balMap);
    } catch (error) {
      // Graceful fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [userId]);

  const customerName = profile
    ? `${profile.firstName || ''} ${profile.lastName || ''}`.trim()
    : 'Valued Customer';

  return (
    <CustomerLayout>
      <div className="space-y-8">
        
        {/* Hero Welcome Banner */}
        <div className="relative overflow-hidden hero-gradient text-white p-8 sm:p-10 rounded-3xl shadow-xl space-y-6">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="CUSTOMER">CUSTOMER PORTAL</Badge>
                <span className="text-xs text-slate-300 font-medium">User ID: #{userId}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                Welcome back, <span className="text-coral-400">{customerName}</span> 👋
              </h1>
              <p className="text-sm text-slate-300 max-w-xl leading-relaxed">
                Manage your zero-balance digital accounts, perform 24/7 instant wire transfers, track loan EMIs, and verify digital KYC.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/customer/transactions">
                <Button variant="primary" size="lg" icon={FiSend}>
                  Transfer Funds
                </Button>
              </Link>
              <Link to="/customer/accounts">
                <Button variant="outline" size="lg" icon={FiPlusCircle} className="border-slate-700 text-white hover:bg-slate-800">
                  Open Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Actions Bar */}
        <div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Shortcuts</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            <Link
              to="/customer/transactions"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-coral-500 transition-all flex flex-col items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-coral-500/10 text-coral-500 flex items-center justify-center group-hover:bg-coral-500 group-hover:text-white transition-colors">
                <FiSend className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-navy-900">Transfer Money</span>
                <span className="text-xs text-slate-500">Instant wire & NEFT</span>
              </div>
            </Link>

            <Link
              to="/customer/beneficiaries"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-800 transition-all flex flex-col items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-navy-900/10 text-navy-900 flex items-center justify-center group-hover:bg-navy-900 group-hover:text-white transition-colors">
                <FiUsers className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-navy-900">Beneficiaries</span>
                <span className="text-xs text-slate-500">Manage saved payees</span>
              </div>
            </Link>

            <Link
              to="/customer/cards"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-navy-800 transition-all flex flex-col items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FiCreditCard className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-navy-900">My Cards</span>
                <span className="text-xs text-slate-500">Issue debit/credit cards</span>
              </div>
            </Link>

            <Link
              to="/customer/kyc"
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-600 transition-all flex flex-col items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FiUserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-sm font-bold text-navy-900">Digital KYC</span>
                <span className="text-xs text-slate-500">Verify identity status</span>
              </div>
            </Link>

          </div>
        </div>

        {/* Live Balance Overview Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <Card
            title="Savings Account Balance"
            subtitle="GET /api/accounts/balance?accountType=SAVINGS"
            action={<Badge variant="SAVINGS">SAVINGS</Badge>}
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Available Balance</p>
              <div className="text-3xl font-extrabold text-navy-900">
                ₹{balances.SAVINGS !== null && balances.SAVINGS !== undefined ? Number(balances.SAVINGS).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> Updated live</span>
                <Link to="/customer/accounts" className="font-bold text-coral-500 hover:underline">View Details →</Link>
              </div>
            </div>
          </Card>

          <Card
            title="Current Account Balance"
            subtitle="GET /api/accounts/balance?accountType=CURRENT"
            action={<Badge variant="CURRENT">CURRENT</Badge>}
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Available Balance</p>
              <div className="text-3xl font-extrabold text-navy-900">
                ₹{balances.CURRENT !== null && balances.CURRENT !== undefined ? Number(balances.CURRENT).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1"><FiClock className="w-3.5 h-3.5" /> Updated live</span>
                <Link to="/customer/accounts" className="font-bold text-coral-500 hover:underline">View Details →</Link>
              </div>
            </div>
          </Card>

          <Card
            title="Digital KYC Verification"
            subtitle="Identity Audit Status"
            action={<Badge variant="PENDING">PENDING</Badge>}
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Account Limits</p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Submit your Aadhaar, PAN, and facial self-image to unlock full transaction limits.
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1"><FiShield className="text-emerald-500" /> 256-Bit Encrypted</span>
                <Link to="/customer/kyc" className="font-bold text-coral-500 hover:underline">Submit KYC →</Link>
              </div>
            </div>
          </Card>

        </div>

        {/* Active Accounts Overview Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <FiCreditCard className="text-coral-500" /> My Bank Accounts ({accounts.length})
              </h2>
              <p className="text-xs text-slate-500">
                List fetched from GET /api/accounts/customer/{userId}
              </p>
            </div>
            <Link to="/customer/accounts">
              <Button variant="primary" size="sm" icon={FiPlusCircle}>
                Open New Account
              </Button>
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center space-y-2">
              <Spinner size="md" className="text-coral-500" />
              <p className="text-xs text-slate-500">Loading account records...</p>
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
              <p className="text-sm font-bold text-navy-900">No active accounts open yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Open a zero-balance Savings or Current account to start receiving deposits.
              </p>
              <Link to="/customer/accounts">
                <Button variant="primary" size="sm" icon={FiPlusCircle}>
                  Open Account Now
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.map((acc, idx) => (
                <div
                  key={acc.id || idx}
                  className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={acc.accountType}>{acc.accountType}</Badge>
                      <span className="text-xs font-mono font-bold text-navy-900">
                        #{acc.accountNumber || acc.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">IFSC: {acc.ifscCode || 'FINIX000101'}</p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] text-slate-400 uppercase font-semibold">Balance</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      ₹{acc.balance !== undefined ? Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : balances[acc.accountType] || '0.00'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </CustomerLayout>
  );
};

export default CustomerDashboard;
