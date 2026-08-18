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
  FiAlertTriangle,
  FiCheckCircle,
  FiArrowRight,
  FiInfo,
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

  const hasActiveAccount = accounts.some((acc) => acc.status === 'ACTIVE');
  const hasOnlyClosedAccounts = accounts.length > 0 && accounts.every((acc) => acc.status === 'CLOSED');
  const hasNoAccounts = accounts.length === 0;
  const isKycApproved = hasActiveAccount;

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
                Manage your zero-balance digital accounts, perform 24/7 instant money transfers, track loan EMIs, and verify digital KYC.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link to="/customer/transactions">
                <Button variant="primary" size="lg" icon={FiSend}>
                  Transfer Funds
                </Button>
              </Link>
              <Link to="/customer/accounts">
                <Button variant="dark-outline" size="lg" icon={FiPlusCircle}>
                  Open Account
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Persistent Warning Banners (Shown when KYC is not yet approved / No active accounts) */}
        {!isKycApproved && (
          <div className="space-y-4">
            {/* Banner 1: KYC Pending / Under Review */}
            <div className="bg-amber-500/10 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                  <FiAlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-amber-800">
                      Action Required
                    </span>
                    <Badge variant="PENDING">KYC PENDING</Badge>
                  </div>
                  <h2 className="text-base font-bold text-navy-900">
                    Identity Verification Pending
                  </h2>
                  <p className="text-xs text-slate-600 max-w-2xl mt-0.5 leading-relaxed">
                    Your digital identity has not been verified yet. Upload your Aadhaar, PAN card, and portrait photo to enable live banking services and unlock instant fund transfers.
                  </p>
                </div>
              </div>
              <Link to="/customer/kyc" className="shrink-0 w-full sm:w-auto">
                <Button variant="primary" size="md" icon={FiArrowRight} className="w-full sm:w-auto">
                  Submit KYC Now
                </Button>
              </Link>
            </div>

            {/* Banner 2: No Active Account Yet */}
            <div className="bg-slate-100/90 border border-slate-200 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-xs">
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center shrink-0 shadow-md">
                  <FiCreditCard className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold uppercase tracking-widest text-slate-500">
                      Account Status
                    </span>
                    <Badge variant="CLOSED">NO ACTIVE ACCOUNT</Badge>
                  </div>
                  <h2 className="text-base font-bold text-navy-900">
                    Account Inactive / Closed
                  </h2>
                  <p className="text-xs text-slate-600 max-w-2xl mt-0.5 leading-relaxed">
                    A bank account cannot be operated until your Digital KYC is approved. Once approved by a KYC Officer, your account will activate automatically with full transaction capability.
                  </p>
                </div>
              </div>
              <Link to="/customer/accounts" className="shrink-0 w-full sm:w-auto">
                <Button variant="outline" size="md" icon={FiInfo} className="w-full sm:w-auto">
                  View Account Details
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Positive Verified Banner (Shown when KYC is Approved) */}
        {isKycApproved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  Identity Verified & Account Active <Badge variant="ACTIVE">VERIFIED</Badge>
                </h2>
                <p className="text-xs text-slate-600">
                  Your KYC is approved! You can perform 24/7 instant money transfers, request debit cards, and book fixed deposits.
                </p>
              </div>
            </div>
            <Link to="/customer/accounts">
              <Button variant="outline" size="sm" icon={FiPlusCircle}>
                Open Another Account
              </Button>
            </Link>
          </div>
        )}

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
                <span className="text-xs text-slate-500">Instant fund transfers</span>
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
            subtitle="Primary digital savings account"
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
            subtitle="Business & everyday operations account"
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
            action={<Badge variant={isKycApproved ? 'ACTIVE' : 'PENDING'}>{isKycApproved ? 'APPROVED' : 'ACTION REQUIRED'}</Badge>}
          >
            <div className="space-y-3">
              <p className="text-xs text-slate-500">Verification Status</p>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {isKycApproved
                  ? 'Your Aadhaar, PAN, and facial selfie are verified. Full transaction limits enabled.'
                  : 'Submit your Aadhaar, PAN, and facial self-image to unlock account activation and full limits.'}
              </p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1"><FiShield className="text-emerald-500" /> Identity Verified</span>
                <Link to="/customer/kyc" className="font-bold text-coral-500 hover:underline">
                  {isKycApproved ? 'View KYC Status →' : 'Submit KYC →'}
                </Link>
              </div>
            </div>
          </Card>

        </div>

        {/* Active Accounts Overview Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <FiCreditCard className="text-coral-500" /> My Bank Accounts ({accounts.length})
              </h2>
              <p className="text-xs text-slate-500">
                Your active checking and savings accounts
              </p>
            </div>
            <Link to="/customer/accounts" className="self-start sm:self-auto">
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
                  className="p-4 sm:p-5 rounded-2xl border border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={acc.accountType}>{acc.accountType}</Badge>
                      <Badge variant={acc.status || 'ACTIVE'}>{acc.status || 'ACTIVE'}</Badge>
                      <span className="text-xs font-mono font-bold text-navy-900">
                        #{acc.accountNumber || acc.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">IFSC: {acc.ifscCode || 'FINX0000001'}</p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/60">
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
