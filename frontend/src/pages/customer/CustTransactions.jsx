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
  FiUsers,
  FiUserCheck,
  FiCreditCard,
  FiCopy,
  FiCheck,
  FiEye,
  FiFileText,
  FiCornerDownRight,
} from 'react-icons/fi';
import { transactionService } from '../../services/transactionService';
import { accountService } from '../../services/accountService';
import { beneficiaryService } from '../../services/beneficiaryService';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

const transferSchema = yup.object().shape({
  accountType: yup.string().required('Account type is required'),
  toAccount: yup
    .string()
    .trim()
    .required('Recipient account number is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .required('Amount is required'),
  referenceNumber: yup.string().trim().required('Reference number is required'),
  remarks: yup.string().trim().required('Remarks are required'),
});

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(d);
  } catch (e) {
    return dateStr;
  }
};

const CustTransactions = () => {
  const { userId } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'transfer'
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accounts & Beneficiaries state
  const [hasActiveAccount, setHasActiveAccount] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [beneficiariesLoading, setBeneficiariesLoading] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  // Receipt Inspection Modal
  const [selectedTx, setSelectedTx] = useState(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

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
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(transferSchema),
    defaultValues: {
      accountType: 'SAVINGS',
      toAccount: '',
      referenceNumber: `REF-${Date.now().toString().slice(-8)}`,
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

  const fetchBeneficiaries = async () => {
    setBeneficiariesLoading(true);
    try {
      const data = await beneficiaryService.getBeneficiaries();
      const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
      setBeneficiaries(list);
    } catch (err) {
      setBeneficiaries([]);
    } finally {
      setBeneficiariesLoading(false);
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

  useEffect(() => {
    if (location.state?.toAccount) {
      setActiveTab('transfer');
      setValue('toAccount', location.state.toAccount);
      if (location.state.beneficiaryName) {
        setValue('remarks', `Transfer to ${location.state.beneficiaryName}`);
      }
    }
  }, [location.state, setValue]);

  useEffect(() => {
    checkActiveAccounts();
    fetchBeneficiaries();
  }, [userId]);

  useEffect(() => {
    fetchTransactions();
  }, [page, nature, status, fromDate, toDate]);

  const handleSelectBeneficiary = (b) => {
    setSelectedBeneficiary(b);
    setValue('toAccount', b.accountNumber);
    setValue('remarks', `Transfer to ${b.beneficiaryName}`);
  };

  const handleCopyReference = (refText) => {
    if (!refText) return;
    navigator.clipboard.writeText(refText);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2000);
    toast.success('Reference number copied!');
  };

  const onTransferSubmit = async (data) => {
    if (!hasActiveAccount) {
      toast.warn('Transfers can only be initiated from an active, KYC-verified account.');
      return;
    }

    setIsSubmitting(true);
    try {
      const resp = await transactionService.transferMoney({
        accountType: data.accountType,
        toAccount: data.toAccount.trim(),
        amount: Number(data.amount),
        referenceNumber: data.referenceNumber.trim(),
        remarks: data.remarks.trim(),
      });

      toast.success(resp?.message || 'Fund transfer completed successfully!');
      reset({
        accountType: 'SAVINGS',
        toAccount: '',
        amount: '',
        referenceNumber: `REF-${Date.now().toString().slice(-8)}`,
        remarks: 'Fund Transfer',
      });
      setSelectedBeneficiary(null);
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

  const openReceipt = (tx) => {
    setSelectedTx(tx);
    setReceiptModalOpen(true);
  };

  return (
    <CustomerLayout
      title="Transactions & Fund Transfers"
      subtitle="View detailed account statements, track money sent and received, and transfer funds to beneficiaries."
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
                  Money transfers require an active, KYC-approved account. Please complete KYC submission to unlock fund transfers.
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
            <FiSend className="w-4 h-4 text-coral-500" /> Instant Fund Transfer
          </button>
        </div>

        {/* ========================================================== */}
        {/* TAB 1: STATEMENT / HISTORY                                 */}
        {/* ========================================================== */}
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500"
                  >
                    <option value="">All Flows (Debit & Credit)</option>
                    <option value="DEBIT">Debit (Money Sent Out)</option>
                    <option value="CREDIT">Credit (Money Received In)</option>
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-coral-500"
                  />
                </div>
              </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
              {loading ? (
                <div className="p-12 text-center space-y-3">
                  <Spinner size="lg" className="text-coral-500 mx-auto" />
                  <p className="text-xs text-slate-500 font-medium">Fetching live account statements and counterparty records...</p>
                </div>
              ) : transactionsData.content.length === 0 ? (
                <div className="p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FiClock className="w-6 h-6" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900">No Transactions Found</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    No transactions match your current filters. Start an instant transfer or deposit to see history.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <th className="py-3.5 px-4">Ref #</th>
                        <th className="py-3.5 px-4">Flow / Type</th>
                        <th className="py-3.5 px-4">From (Sender)</th>
                        <th className="py-3.5 px-4">To (Recipient)</th>
                        <th className="py-3.5 px-4">Amount</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Date & Time</th>
                        <th className="py-3.5 px-4 text-right">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactionsData.content.map((tx, idx) => {
                        const isDebit =
                          String(tx.nature || '').toUpperCase() === 'DEBIT' ||
                          (tx.transactionType === 'WITHDRAWAL');

                        const senderName =
                          isDebit
                            ? 'Self (My Account)'
                            : tx.fromAccountHolderName || tx.counterPartyName || 'Branch Cash Counter';
                        const senderAcc = tx.fromAccountNumber || 'Self';

                        const receiverName =
                          isDebit
                            ? tx.toAccountHolderName || tx.counterPartyName || 'Recipient'
                            : 'Self (My Account)';
                        const receiverAcc = tx.toAccountNumber || tx.counterPartyAccountNumber || 'Self';

                        const formattedAmt = Number(tx.amount || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        });

                        const txStatus = (tx.status || tx.transactionStatus || 'SUCCESS').toUpperCase();

                        return (
                          <tr key={tx.referenceNumber || idx} className="hover:bg-slate-50/80 transition-colors">
                            {/* Ref Number */}
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-600">
                              <span title={tx.referenceNumber}>
                                {tx.referenceNumber
                                  ? tx.referenceNumber.length > 14
                                    ? `${tx.referenceNumber.substring(0, 12)}…`
                                    : tx.referenceNumber
                                  : `#${idx + 1}`}
                              </span>
                            </td>

                            {/* Flow / Type */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    isDebit
                                      ? 'bg-red-50 text-red-600'
                                      : 'bg-emerald-50 text-emerald-600'
                                  }`}
                                >
                                  {isDebit ? (
                                    <FiArrowUpRight className="w-4 h-4" />
                                  ) : (
                                    <FiArrowDownLeft className="w-4 h-4" />
                                  )}
                                </div>
                                <div>
                                  <span
                                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-extrabold ${
                                      isDebit
                                        ? 'bg-red-100/70 text-red-700'
                                        : 'bg-emerald-100/70 text-emerald-700'
                                    }`}
                                  >
                                    {isDebit ? 'DEBIT' : 'CREDIT'}
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-semibold block">
                                    {tx.transactionType || 'TRANSFER'}
                                  </span>
                                </div>
                              </div>
                            </td>

                            {/* From (Sender) */}
                            <td className="py-3.5 px-4">
                              <div>
                                <span className="font-bold text-navy-900 block">{senderName}</span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  {senderAcc !== 'Self' ? `Acc: ${senderAcc}` : 'Sender Account'}
                                </span>
                              </div>
                            </td>

                            {/* To (Recipient) */}
                            <td className="py-3.5 px-4">
                              <div>
                                <span className="font-bold text-navy-900 block">{receiverName}</span>
                                <span className="font-mono text-[11px] text-slate-500">
                                  {receiverAcc !== 'Self' && receiverAcc !== 'N/A' && receiverAcc !== '-'
                                    ? `Acc: ${receiverAcc}`
                                    : 'Receiver Account'}
                                </span>
                              </div>
                            </td>

                            {/* Amount */}
                            <td className="py-3.5 px-4 font-mono font-extrabold text-sm whitespace-nowrap">
                              <span className={isDebit ? 'text-red-600' : 'text-emerald-600'}>
                                {isDebit ? `- ₹${formattedAmt}` : `+ ₹${formattedAmt}`}
                              </span>
                            </td>

                            {/* Status */}
                            <td className="py-3.5 px-4">
                              <Badge variant={txStatus}>{txStatus}</Badge>
                            </td>

                            {/* Date & Time */}
                            <td className="py-3.5 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                              {formatDate(tx.transactionDateTime)}
                            </td>

                            {/* Actions / View Receipt */}
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => openReceipt(tx)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-coral-50 hover:text-coral-600 text-slate-700 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                              >
                                <FiEye className="w-3.5 h-3.5 text-coral-500" /> Receipt
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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

        {/* ========================================================== */}
        {/* TAB 2: TRANSFER MONEY FORM WITH BENEFICIARIES             */}
        {/* ========================================================== */}
        {activeTab === 'transfer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Saved Beneficiaries Quick Picker */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                    <FiUsers className="text-coral-500 w-4 h-4" /> Saved Beneficiaries
                  </h3>
                  <Link
                    to="/customer/beneficiaries"
                    className="text-[11px] font-bold text-coral-600 hover:text-coral-700 flex items-center gap-1"
                  >
                    Manage <FiArrowRight />
                  </Link>
                </div>

                <p className="text-xs text-slate-500">
                  Click any payee below to instantly auto-fill their 12-digit account number.
                </p>

                {beneficiariesLoading ? (
                  <div className="p-6 text-center">
                    <Spinner size="sm" className="text-coral-500 mx-auto" />
                  </div>
                ) : beneficiaries.length === 0 ? (
                  <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <FiUsers className="w-6 h-6 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-navy-900">No Beneficiaries Added Yet</p>
                    <p className="text-[11px] text-slate-500">
                      You can transfer by typing the account number directly or save frequent payees for quick access.
                    </p>
                    <Link to="/customer/beneficiaries" className="inline-block pt-1">
                      <Button variant="outline" size="sm">
                        + Add Beneficiary
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                    {beneficiaries.map((b) => {
                      const isSelected =
                        selectedBeneficiary?.accountNumber === b.accountNumber;
                      return (
                        <div
                          key={b.beneficiaryId || b.id || b.accountNumber}
                          onClick={() => handleSelectBeneficiary(b)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                            isSelected
                              ? 'bg-coral-50/80 border-coral-500 shadow-xs'
                              : 'bg-slate-50 hover:bg-slate-100/80 border-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                isSelected
                                  ? 'bg-coral-500 text-white shadow-xs'
                                  : 'bg-slate-200 text-slate-700'
                              }`}
                            >
                              {b.beneficiaryName?.charAt(0)?.toUpperCase() || 'P'}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-navy-900">{b.beneficiaryName}</h4>
                              <p className="text-[11px] font-mono text-slate-500">
                                Acc: {b.accountNumber}
                              </p>
                              {b.ifscCode && (
                                <span className="text-[10px] font-mono text-slate-400 uppercase">
                                  IFSC: {b.ifscCode}
                                </span>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <span className="text-xs font-bold text-coral-600 flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg border border-coral-200 shadow-2xs">
                              <FiCheck /> Selected
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right Col: Transfer Form */}
            <div className="lg:col-span-7">
              <Card
                title="Initiate Instant Fund Transfer"
                subtitle="Transfers are processed instantly 24/7 across all verified Finix Bank accounts."
              >
                <form onSubmit={handleSubmit(onTransferSubmit)} className="space-y-5">
                  {/* Selected Beneficiary Indicator */}
                  {selectedBeneficiary && (
                    <div className="p-3 bg-coral-50/70 border border-coral-200 rounded-2xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FiUserCheck className="text-coral-600 w-4 h-4" />
                        <div>
                          <span className="font-bold text-navy-900">Transferring to: </span>
                          <span className="text-coral-700 font-semibold">{selectedBeneficiary.beneficiaryName}</span>
                          <span className="font-mono text-slate-500 ml-1">({selectedBeneficiary.accountNumber})</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedBeneficiary(null);
                          setValue('toAccount', '');
                        }}
                        className="text-slate-400 hover:text-slate-600 font-bold text-xs cursor-pointer"
                      >
                        ✕ Clear
                      </button>
                    </div>
                  )}

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
                    label="Reference Number / Tracking ID"
                    placeholder="e.g. REF-12345678"
                    error={errors.referenceNumber}
                    {...register('referenceNumber')}
                  />

                  <Input
                    label="Transaction Note / Remarks"
                    placeholder="e.g. Monthly rent or vendor payment"
                    error={errors.remarks}
                    {...register('remarks')}
                  />

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-[11px] text-slate-400">
                      ⚡ Instant settlement via Finix Real-Time Clearing
                    </p>
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
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* TRANSACTION RECEIPT MODAL                                 */}
      {/* ========================================================== */}
      {selectedTx && (
        <Modal
          isOpen={receiptModalOpen}
          onClose={() => setReceiptModalOpen(false)}
          title="Transaction Receipt"
          subtitle="Official confirmation of fund settlement."
        >
          <div className="space-y-6">
            {/* Top Status Header */}
            <div className="p-5 bg-gradient-to-br from-slate-900 to-navy-950 text-white rounded-2xl text-center space-y-2 border border-slate-800 shadow-md">
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Total Transaction Amount
              </span>
              <h3 className="text-2xl sm:text-3xl font-black font-mono text-coral-400">
                ₹{Number(selectedTx.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </h3>
              <div className="flex items-center justify-center gap-2 pt-1">
                <Badge variant={selectedTx.status || selectedTx.transactionStatus || 'SUCCESS'}>
                  {selectedTx.status || selectedTx.transactionStatus || 'SUCCESS'}
                </Badge>
                <span className="text-xs text-slate-300 font-semibold">
                  • {selectedTx.transactionType || 'TRANSFER'}
                </span>
              </div>
            </div>

            {/* Key Metadata Table */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3 text-xs">
              {/* Reference # */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Reference Number</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-navy-900">
                    {selectedTx.referenceNumber || 'N/A'}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyReference(selectedTx.referenceNumber)}
                    className="p-1 text-slate-400 hover:text-coral-500 cursor-pointer"
                    title="Copy Ref Number"
                  >
                    {copiedRef ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                  </button>
                </div>
              </div>

              {/* Transaction Date */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">Date & Timestamp</span>
                <span className="font-medium text-navy-900">
                  {formatDate(selectedTx.transactionDateTime)}
                </span>
              </div>

              {/* Sender Details */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">From (Sender)</span>
                <div className="text-right">
                  <span className="font-bold text-navy-900 block">
                    {selectedTx.fromAccountHolderName || selectedTx.counterPartyName || 'Self (My Account)'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Acc: {selectedTx.fromAccountNumber || 'Self'}
                  </span>
                </div>
              </div>

              {/* Receiver Details */}
              <div className="flex items-center justify-between py-1.5 border-b border-slate-200/60">
                <span className="text-slate-500 font-medium">To (Recipient)</span>
                <div className="text-right">
                  <span className="font-bold text-navy-900 block">
                    {selectedTx.toAccountHolderName || selectedTx.counterPartyName || 'Self (My Account)'}
                  </span>
                  <span className="font-mono text-[11px] text-slate-500">
                    Acc: {selectedTx.toAccountNumber || selectedTx.counterPartyAccountNumber || 'Self'}
                  </span>
                </div>
              </div>

              {/* Remarks */}
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 font-medium">Remarks / Note</span>
                <span className="font-semibold text-slate-800 text-right max-w-xs truncate">
                  {selectedTx.remarks || 'None'}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <Button variant="primary" size="sm" onClick={() => setReceiptModalOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </CustomerLayout>
  );
};

export default CustTransactions;
