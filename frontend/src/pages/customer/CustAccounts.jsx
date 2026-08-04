import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiCreditCard,
  FiPlusCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiShield,
} from 'react-icons/fi';
import { accountService } from '../../services/accountService';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

const CustAccounts = () => {
  const { userId } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('SAVINGS');
  const [isOpening, setIsOpening] = useState(false);

  const fetchAccountsAndBalances = async () => {
    setLoading(true);
    try {
      if (userId) {
        const data = await accountService.getCustomerAccounts(userId);
        setAccounts(Array.isArray(data) ? data : []);
      }

      // Fetch balances for SAVINGS and CURRENT
      const balancesMap = {};
      try {
        const savingsBal = await accountService.getAccountBalance('SAVINGS');
        balancesMap.SAVINGS = savingsBal;
      } catch (err) {
        balancesMap.SAVINGS = null;
      }

      try {
        const currentBal = await accountService.getAccountBalance('CURRENT');
        balancesMap.CURRENT = currentBal;
      } catch (err) {
        balancesMap.CURRENT = null;
      }

      setBalances(balancesMap);
    } catch (error) {
      toast.error('Failed to load accounts. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountsAndBalances();
  }, [userId]);

  const handleOpenAccount = async () => {
    setIsOpening(true);
    try {
      const response = await accountService.openAccount(selectedType);

      // Handle 204 No Content (KYC Not Approved)
      if (response.status === 204) {
        toast.warn(
          <div>
            <p className="font-bold">KYC Approval Required</p>
            <p className="text-xs mt-1">
              Your account cannot be opened until your digital KYC is approved by the bank.
            </p>
          </div>
        );
        setModalOpen(false);
        return;
      }

      toast.success(`${selectedType} account opened successfully!`);
      setModalOpen(false);
      fetchAccountsAndBalances();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to open account. Ensure your KYC status is approved.';
      toast.error(msg);
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <CustomerLayout
      title="My Bank Accounts"
      subtitle="View your active accounts, check live balances, or open a new savings/current account."
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-navy-900 text-white flex items-center justify-center">
              <FiCreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900">Manage Accounts</h2>
              <p className="text-xs text-slate-500">
                You have {accounts.length} active account(s) associated with your profile.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              icon={FiRefreshCw}
              onClick={fetchAccountsAndBalances}
              isLoading={loading}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={FiPlusCircle}
              onClick={() => setModalOpen(true)}
            >
              Open New Account
            </Button>
          </div>
        </div>

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Savings Balance Card */}
          <div className="bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Savings Account</span>
              <Badge variant="SAVINGS">SAVINGS</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400">Available Balance</p>
              <div className="text-3xl font-extrabold text-white mt-1">
                ₹{balances.SAVINGS !== null && balances.SAVINGS !== undefined ? Number(balances.SAVINGS).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
            </div>
            <div className="pt-3 border-t border-navy-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>Instant Transfer Ready</span>
              <FiShield className="text-emerald-400" />
            </div>
          </div>

          {/* Current Balance Card */}
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-navy-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Current Account</span>
              <Badge variant="CURRENT">CURRENT</Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400">Available Balance</p>
              <div className="text-3xl font-extrabold text-white mt-1">
                ₹{balances.CURRENT !== null && balances.CURRENT !== undefined ? Number(balances.CURRENT).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
              </div>
            </div>
            <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
              <span>High-Volume Business Account</span>
              <FiShield className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Accounts List Table / Cards */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Spinner size="lg" className="text-coral-500" />
            <p className="text-sm font-medium text-slate-600">Fetching bank account records...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FiCreditCard className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">No accounts open yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Click below to open your zero-balance Savings or high-limit Current account.
              </p>
            </div>
            <Button variant="primary" icon={FiPlusCircle} onClick={() => setModalOpen(true)}>
              Open Your First Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((acc, index) => (
              <Card
                key={acc.id || acc.accountNumber || index}
                title={`Account #${acc.accountNumber || acc.id}`}
                subtitle={`IFSC: ${acc.ifscCode || 'FINIX000101'}`}
                action={<Badge variant={acc.accountType}>{acc.accountType}</Badge>}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500">Account Type</span>
                    <span className="text-sm font-semibold text-navy-900">{acc.accountType}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500">Account Balance</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      ₹{acc.balance !== undefined ? Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : balances[acc.accountType] || '0.00'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Status: Active</span>
                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                      <FiCheckCircle /> Verified
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Open Account Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Open a New Bank Account"
        subtitle="Select the account type you would like to activate."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenAccount}
              isLoading={isOpening}
              icon={FiPlusCircle}
            >
              Submit Application
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Select Account Type
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSelectedType('SAVINGS')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                selectedType === 'SAVINGS'
                  ? 'border-coral-500 bg-coral-50/50 text-navy-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">Savings Account</span>
                <Badge variant="SAVINGS">SAVINGS</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Zero balance requirement, high interest yield, unlimited online transfers.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedType('CURRENT')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                selectedType === 'CURRENT'
                  ? 'border-coral-500 bg-coral-50/50 text-navy-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-sm">Current Account</span>
                <Badge variant="CURRENT">CURRENT</Badge>
              </div>
              <p className="text-xs text-slate-500">
                Designed for businesses with high transaction limits and merchant tools.
              </p>
            </button>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-xs text-amber-800 flex items-start gap-2.5">
            <FiAlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">KYC Verification Requirement</p>
              <p className="mt-0.5">
                Note: Account activation requires an approved Digital KYC. If your KYC is pending, you can submit documents anytime on the{' '}
                <Link to="/customer/kyc" className="font-bold underline text-amber-900">
                  Digital KYC page
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </CustomerLayout>
  );
};

export default CustAccounts;
