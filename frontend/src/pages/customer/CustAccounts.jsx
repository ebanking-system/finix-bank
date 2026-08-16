import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiCreditCard,
  FiPlusCircle,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiDollarSign,
  FiArrowDownRight,
  FiZap,
} from 'react-icons/fi';
import { accountService } from '../../services/accountService';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';

const quickDepositAmounts = [1000, 5000, 10000, 25000, 50000];

const CustAccounts = () => {
  const { userId } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);

  // Open Account Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('SAVINGS');
  const [initialDeposit, setInitialDeposit] = useState('');
  const [isOpening, setIsOpening] = useState(false);

  // Deposit / Add Funds Modal State
  const [depositModalOpen, setDepositModalOpen] = useState(false);
  const [depositAccountType, setDepositAccountType] = useState('SAVINGS');
  const [depositAmount, setDepositAmount] = useState('10000');
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [depositRemarks, setDepositRemarks] = useState('');
  const [isDepositing, setIsDepositing] = useState(false);

  const fetchAccountsAndBalances = async () => {
    setLoading(true);
    try {
      if (userId) {
        const data = await accountService.getCustomerAccounts(userId);
        setAccounts(Array.isArray(data) ? data : []);
      }

      // Fetch live balances for SAVINGS and CURRENT
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

  const hasActiveSavings = accounts.some(
    (acc) => acc.accountType === 'SAVINGS' && (acc.status === 'ACTIVE' || !acc.status)
  );
  const hasActiveCurrent = accounts.some(
    (acc) => acc.accountType === 'CURRENT' && (acc.status === 'ACTIVE' || !acc.status)
  );
  const allAccountsAtLimit = hasActiveSavings && hasActiveCurrent;

  const handleOpenModal = () => {
    if (!hasActiveSavings) {
      setSelectedType('SAVINGS');
    } else if (!hasActiveCurrent) {
      setSelectedType('CURRENT');
    }
    setInitialDeposit('');
    setModalOpen(true);
  };

  const handleOpenAccount = async () => {
    if (selectedType === 'SAVINGS' && hasActiveSavings) {
      toast.error('You already have an active Savings account. Close it before opening a new one.');
      return;
    }
    if (selectedType === 'CURRENT' && hasActiveCurrent) {
      toast.error('You already have an active Current account. Close it before opening a new one.');
      return;
    }

    const initAmt = initialDeposit ? Number(initialDeposit) : 0;
    if (initAmt < 0) {
      toast.error('Initial deposit amount cannot be negative.');
      return;
    }

    setIsOpening(true);
    try {
      const response = await accountService.openAccount(selectedType, initAmt);

      if (response.status === 204) {
        toast.warn('Your account cannot be opened until your Digital KYC is approved by the bank.');
        setModalOpen(false);
        return;
      }

      toast.success(`${selectedType} account opened successfully${initAmt > 0 ? ` with initial deposit of ₹${initAmt.toLocaleString('en-IN')}` : ''}!`);
      setModalOpen(false);
      fetchAccountsAndBalances();
    } catch (error) {
      const msg =
        error.response?.data?.data ||
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to open account. Ensure your KYC status is approved.';
      toast.error(msg);
    } finally {
      setIsOpening(false);
    }
  };

  const handleOpenDepositModal = (type = 'SAVINGS') => {
    setDepositAccountType(type);
    setDepositAmount('10000');
    setDepositRemarks('');
    setDepositModalOpen(true);
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    const numAmt = Number(depositAmount);
    if (!numAmt || numAmt <= 0) {
      toast.error('Please enter a valid deposit amount greater than ₹0.');
      return;
    }

    setIsDepositing(true);
    try {
      const resp = await accountService.depositSelf({
        accountType: depositAccountType,
        amount: numAmt,
        paymentMethod,
        remarks: depositRemarks || `Self-Service deposit via ${paymentMethod}`,
      });
      toast.success(resp.data || `₹${numAmt.toLocaleString('en-IN')} deposited successfully!`);
      setDepositModalOpen(false);
      fetchAccountsAndBalances();
    } catch (error) {
      const msg =
        error.response?.data?.data ||
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to process deposit. Please check account details.';
      toast.error(msg);
    } finally {
      setIsDepositing(false);
    }
  };

  return (
    <CustomerLayout
      title="My Bank Accounts"
      subtitle="View active accounts, deposit funds, check live balances, or open a new savings/current account."
    >
      <div className="space-y-6">
        {/* Header Action Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-900 text-white flex items-center justify-center shadow-md">
              <FiCreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-navy-900">Manage Accounts & Funds</h2>
              <p className="text-xs text-slate-500">
                You have {accounts.length} active account(s) associated with your profile (Limit: 1 Savings, 1 Current).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              icon={FiRefreshCw}
              onClick={fetchAccountsAndBalances}
              isLoading={loading}
            >
              Refresh
            </Button>
            {accounts.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                icon={FiArrowDownRight}
                onClick={() => handleOpenDepositModal(hasActiveSavings ? 'SAVINGS' : 'CURRENT')}
              >
                Add Money / Deposit
              </Button>
            )}
            <Button
              variant="primary"
              size="sm"
              icon={FiPlusCircle}
              onClick={handleOpenModal}
              disabled={allAccountsAtLimit}
              title={allAccountsAtLimit ? 'You already have active Savings and Current accounts (Max limit: 1 each)' : 'Open New Account'}
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
              {hasActiveSavings ? (
                <button
                  onClick={() => handleOpenDepositModal('SAVINGS')}
                  className="font-bold text-coral-400 hover:text-coral-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <FiArrowDownRight /> + Add Funds
                </button>
              ) : (
                <span>No active account</span>
              )}
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
              {hasActiveCurrent ? (
                <button
                  onClick={() => handleOpenDepositModal('CURRENT')}
                  className="font-bold text-coral-400 hover:text-coral-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <FiArrowDownRight /> + Add Funds
                </button>
              ) : (
                <span>No active account</span>
              )}
              <FiShield className="text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Accounts List Cards */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <Spinner size="lg" className="text-coral-500" />
            <p className="text-sm font-medium text-slate-600">Fetching bank account records...</p>
          </div>
        ) : accounts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FiCreditCard className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">No accounts open yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Click below to open your zero-balance Savings or high-limit Current account.
              </p>
            </div>
            <Button variant="primary" icon={FiPlusCircle} onClick={handleOpenModal}>
              Open Your First Account
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {accounts.map((acc, index) => (
              <Card
                key={acc.accountId || acc.accountNumber || index}
                title={`Account #${acc.accountNumber || acc.accountId}`}
                subtitle={`IFSC: ${acc.ifscCode || 'FINX0000001'}`}
                action={<Badge variant={acc.status || 'ACTIVE'}>{acc.status || 'ACTIVE'}</Badge>}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500">Account Type</span>
                    <span className="text-sm font-bold text-navy-900">{acc.accountType}</span>
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-xs text-slate-500">Account Balance</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      ₹{acc.balance !== undefined ? Number(acc.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 }) : balances[acc.accountType] || '0.00'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1">
                      <FiCheckCircle /> {acc.status || 'ACTIVE'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      icon={FiArrowDownRight}
                      onClick={() => handleOpenDepositModal(acc.accountType)}
                    >
                      Deposit Funds
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Funds / Deposit Modal */}
      <Modal
        isOpen={depositModalOpen}
        onClose={() => setDepositModalOpen(false)}
        title="Deposit Money into Account"
        subtitle="Simulate instant funding via UPI, Net Banking, or Wire Transfer."
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Destination Account
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDepositAccountType('SAVINGS')}
                disabled={!hasActiveSavings}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  depositAccountType === 'SAVINGS'
                    ? 'border-coral-500 bg-coral-50 text-navy-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                } ${!hasActiveSavings ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                SAVINGS ACCOUNT
              </button>
              <button
                type="button"
                onClick={() => setDepositAccountType('CURRENT')}
                disabled={!hasActiveCurrent}
                className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                  depositAccountType === 'CURRENT'
                    ? 'border-coral-500 bg-coral-50 text-navy-900 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                } ${!hasActiveCurrent ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                CURRENT ACCOUNT
              </button>
            </div>
          </div>

          <div>
            <Input
              label="Deposit Amount (₹)"
              type="number"
              min="1"
              max="500000"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder="e.g. 25000"
              icon={FiDollarSign}
            />
            {/* Quick chips */}
            <div className="flex gap-2 mt-2 flex-wrap">
              {quickDepositAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setDepositAmount(String(amt))}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium cursor-pointer"
                >
                  +₹{amt.toLocaleString('en-IN')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI', 'IMPS', 'DEBIT_CARD'].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentMethod(m)}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer text-center ${
                    paymentMethod === m
                      ? 'border-navy-900 bg-navy-900 text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {m === 'DEBIT_CARD' ? 'Debit Card' : m}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Transaction Remarks / Reference (Optional)"
            placeholder="e.g. Monthly salary or personal savings"
            value={depositRemarks}
            onChange={(e) => setDepositRemarks(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDepositModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isDepositing} icon={FiCheckCircle}>
              Confirm & Deposit Funds
            </Button>
          </div>
        </form>
      </Modal>

      {/* Open Account Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Open a New Bank Account"
        subtitle="Select the account type you would like to activate (Retail Limit: 1 Savings, 1 Current)."
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleOpenAccount}
              isLoading={isOpening}
              disabled={allAccountsAtLimit || !selectedType || (selectedType === 'SAVINGS' && hasActiveSavings) || (selectedType === 'CURRENT' && hasActiveCurrent)}
              icon={FiPlusCircle}
            >
              Submit Application
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {allAccountsAtLimit ? (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-xs text-blue-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <FiCheckCircle className="text-blue-600 w-5 h-5" /> Account Limit Reached
              </div>
              <p>
                You already have an active Savings account and an active Current account (1 of each, the maximum allowed per customer under retail banking regulations).
              </p>
              <p className="text-slate-600">
                To open a new account, please close an existing account or reach out to bank support.
              </p>
            </div>
          ) : (
            <>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Select Account Type
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SAVINGS OPTION */}
                <button
                  type="button"
                  disabled={hasActiveSavings}
                  onClick={() => setSelectedType('SAVINGS')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    hasActiveSavings
                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-75'
                      : selectedType === 'SAVINGS'
                      ? 'border-coral-500 bg-coral-50/50 text-navy-900 shadow-sm cursor-pointer'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">Savings Account</span>
                    <Badge variant="SAVINGS">SAVINGS</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    Zero balance requirement, high interest yield, unlimited online transfers.
                  </p>
                  {hasActiveSavings ? (
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      <FiAlertCircle className="w-3.5 h-3.5" /> 1 Active (Limit: 1)
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Available to Open
                    </div>
                  )}
                </button>

                {/* CURRENT OPTION */}
                <button
                  type="button"
                  disabled={hasActiveCurrent}
                  onClick={() => setSelectedType('CURRENT')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    hasActiveCurrent
                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed opacity-75'
                      : selectedType === 'CURRENT'
                      ? 'border-coral-500 bg-coral-50/50 text-navy-900 shadow-sm cursor-pointer'
                      : 'border-slate-200 hover:border-slate-300 bg-white text-slate-600 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm">Current Account</span>
                    <Badge variant="CURRENT">CURRENT</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    Designed for businesses with high transaction limits and merchant tools.
                  </p>
                  {hasActiveCurrent ? (
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      <FiAlertCircle className="w-3.5 h-3.5" /> 1 Active (Limit: 1)
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                      <FiCheckCircle className="w-3.5 h-3.5" /> Available to Open
                    </div>
                  )}
                </button>
              </div>

              <div className="pt-2">
                <Input
                  label="Initial Deposit (₹) - Optional"
                  type="number"
                  placeholder="0 (or enter initial funding amount, e.g. 5000)"
                  value={initialDeposit}
                  onChange={(e) => setInitialDeposit(e.target.value)}
                  icon={FiDollarSign}
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  You can open with ₹0 or credit funds immediately on creation.
                </p>
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
            </>
          )}
        </div>
      </Modal>
    </CustomerLayout>
  );
};

export default CustAccounts;
