import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiRepeat,
  FiSend,
  FiFilter,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiRefreshCw,
  FiAlertTriangle,
  FiArrowRight,
} from 'react-icons/fi';
import { transactionService } from '../../services/transactionService';
import { accountService } from '../../services/accountService';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const transferSchema = yup.object().shape({
  accountType: yup.string().required('Account type is required'),
  toAccount: yup.string().trim().required('Recipient account number is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .required('Amount is required'),
  referenceNumber: yup.string().trim().required('Reference number is required'),
  remarks: yup.string().trim().required('Remarks are required'),
});

const CustTransactions = () => {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'transfer'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accounts state
  const [hasActiveAccount, setHasActiveAccount] = useState(true);

  // Pagination & Filters
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [nature, setNature] = useState('');
  const [status, setStatus] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [transactionsData, setTransactionsData] = useState({ content: [], totalPages: 0, totalElements: 0 });
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(transferSchema),
    defaultValues: {
      accountType: 'SAVINGS',
      referenceNumber: `REF-${Date.now().toString().slice(-6)}`,
      remarks: 'Fund Transfer',
    },
  });

  const checkActiveAccounts = async () => {
    try {
      if (userId) {
        const accs = await accountService.getCustomerAccounts(userId);
        const list = Array.isArray(accs) ? accs : accs?.data || [];
        setHasActiveAccount(list.some((a) => a.status === 'ACTIVE'));
      }
    } catch (e) {
      // Silent catch
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = { page, size };
      if (nature) params.nature = nature;
      if (status) params.status = status;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const data = await transactionService.getTransactions(params);
      setTransactionsData(data || { content: [], totalPages: 0, totalElements: 0 });
    } catch (error) {
      toast.error('Failed to load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.toAccount) {
      setActiveTab('transfer');
      reset((prev) => ({
        ...prev,
        toAccount: location.state.toAccount,
        remarks: location.state.beneficiaryName ? `Transfer to ${location.state.beneficiaryName}` : 'Fund Transfer',
      }));
    }
  }, [location.state, reset]);

  useEffect(() => {
    checkActiveAccounts();
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [page, nature, status, fromDate, toDate]);

  const onTransferSubmit = async (data) => {
    if (!hasActiveAccount) {
      toast.warn('Transfers can only be initiated from an active, KYC-verified account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await transactionService.transferMoney({
        accountType: data.accountType,
        toAccount: data.toAccount,
        amount: Number(data.amount),
        referenceNumber: data.referenceNumber,
        remarks: data.remarks,
      });

      toast.success(resp?.message || 'Wire transfer completed successfully!');
      reset({
        accountType: 'SAVINGS',
        toAccount: '',
        amount: '',
        referenceNumber: `REF-${Date.now().toString().slice(-6)}`,
        remarks: 'Fund Transfer',
      });
      setActiveTab('history');
      fetchTransactions();
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Fund transfer failed. Ensure source account is active and recipient account exists.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Transactions & Wire Transfers"
      subtitle="View your account statement, track wire transfers, and perform instant payee transfers."
    >
      <div className="space-y-6">
        {/* Precondition Notice */}
        {!hasActiveAccount && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-900">Active Account Required for Fund Transfers</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Money transfers require an active, KYC-approved account. Please complete KYC submission to unlock wire transfers.
                </p>
              </div>
            </div>
            <Link to="/customer/kyc">
              <Button variant="primary" size="sm" icon={FiArrowRight}>
                Complete KYC
              </Button>
            </Link>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-2xl max-w-md text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'history'
                ? 'bg-white text-navy-900 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FiRepeat className="w-4 h-4 text-coral-500" /> Statement & History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transfer')}
            className={`flex-1 py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
              activeTab === 'transfer'
                ? 'bg-white text-navy-900 shadow-sm font-extrabold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FiSend className="w-4 h-4 text-coral-500" /> Instant Wire Transfer
          </button>
        </div>

        {/* TAB 1: Statement / History */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Filter Bar */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <FiFilter className="text-coral-500" /> Filter Statement
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiRefreshCw}
                  onClick={fetchTransactions}
                  isLoading={loading}
                >
                  Refresh
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Transaction Flow</label>
                  <select
                    value={nature}
                    onChange={(e) => {
                      setNature(e.target.value);
                      setPage(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  >
                    <option value="">All Flow (Debit / Credit)</option>
                    <option value="DEBIT">Debit (Outward)</option>
                    <option value="CREDIT">Credit (Inward)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Status</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setPage(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  >
                    <option value="">All Statuses</option>
                    <option value="SUCCESS">SUCCESS</option>
                    <option value="FAILED">FAILED</option>
                    <option value="PENDING">PENDING</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">From Date</label>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">To Date</label>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(0);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"
                  />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              {loading ? (
                <div className="p-12 text-center space-y-3">
                  <Spinner size="lg" className="text-coral-500" />
                  <p className="text-xs text-slate-500">Fetching account transaction records...</p>
                </div>
              ) : transactionsData.content.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FiClock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">No Transactions Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Your transactions will appear here once you perform deposits or wire transfers.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <th className="py-3.5 px-4">Ref #</th>
                        <th className="py-3.5 px-4">Type</th>
                        <th className="py-3.5 px-4">From Account</th>
                        <th className="py-3.5 px-4">To Account</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactionsData.content.map((tx, idx) => (
                        <tr key={tx.transactionId || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">
                            {tx.referenceNumber || `#${tx.transactionId}`}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700">{tx.transactionType || 'TRANSFER'}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono">{tx.fromAccount || 'Self'}</td>
                          <td className="py-3.5 px-4 font-mono">{tx.toAccount || 'N/A'}</td>
                          <td className="py-3.5 px-4 font-extrabold text-navy-900">
                            ₹{Number(tx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={tx.status || 'SUCCESS'}>{tx.status || 'SUCCESS'}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-500">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString('en-IN') : 'Recent'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {transactionsData.totalPages > 1 && (
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Page {page + 1} of {transactionsData.totalPages} ({transactionsData.totalElements} records)
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      icon={FiChevronLeft}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= transactionsData.totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                      icon={FiChevronRight}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Transfer Money Form */}
        {activeTab === 'transfer' && (
          <div className="max-w-2xl">
            <Card title="Initiate Fund Transfer" subtitle="Send money instantly to any verified Finix Bank account.">
              <form onSubmit={handleSubmit(onTransferSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Source Account Type
                  </label>
                  <select
                    {...register('accountType')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
                  >
                    <option value="SAVINGS">Savings Account</option>
                    <option value="CURRENT">Current Account</option>
                  </select>
                </div>

                <Input
                  label="Recipient 12-Digit Account Number"
                  placeholder="e.g. 544900518923"
                  error={errors.toAccount}
                  {...register('toAccount')}
                />

                <Input
                  label="Transfer Amount (₹)"
                  type="number"
                  step="0.01"
                  placeholder="5000.00"
                  error={errors.amount}
                  {...register('amount')}
                />

                <Input
                  label="Reference / Transaction Note"
                  placeholder="e.g. Monthly rent or vendor invoice"
                  error={errors.remarks}
                  {...register('remarks')}
                />

                <div className="pt-3 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    disabled={!hasActiveAccount}
                    icon={FiSend}
                  >
                    Confirm & Send Money
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustTransactions;
