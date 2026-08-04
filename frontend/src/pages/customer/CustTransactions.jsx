import React, { useState, useEffect } from 'react';
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
} from 'react-icons/fi';
import { transactionService } from '../../services/transactionService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const transferSchema = yup.object().shape({
  accountType: yup.string().required('Account type is required'),
  toAccount: yup.string().trim().required('Recipient account number is required'),
  amount: yup.number().typeError('Amount must be a number').positive('Amount must be greater than 0').required('Amount is required'),
  referenceNumber: yup.string().trim().required('Reference number is required'),
  remarks: yup.string().trim().required('Remarks are required'),
});

const CustTransactions = () => {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'transfer'
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    fetchTransactions();
  }, [page, nature, status, fromDate, toDate]);

  const onTransferSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const msg = await transactionService.transferMoney(data);
      toast.success(typeof msg === 'string' ? msg : 'Transfer processed successfully!');
      reset();
      setActiveTab('history');
      fetchTransactions();
    } catch (error) {
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : null) || 'Transfer failed.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Transactions & Fund Transfers"
      subtitle="Send money instantly and review your complete account passbook."
    >
      <div className="space-y-6">
        {/* Navigation Tabs Bar */}
        <div className="flex items-center justify-between bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-navy-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Transaction Passbook
            </button>
            <button
              onClick={() => setActiveTab('transfer')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'transfer'
                  ? 'bg-coral-500 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Transfer Funds
            </button>
          </div>
        </div>

        {/* Tab 1: Transfer Funds Form */}
        {activeTab === 'transfer' && (
          <div className="max-w-2xl">
            <Card title="Instant Wire Transfer" subtitle="POST /api/transaction">
              <form onSubmit={handleSubmit(onTransferSubmit)} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Source Account Type
                  </label>
                  <select
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-navy-800 focus:outline-none bg-white"
                    {...register('accountType')}
                  >
                    <option value="SAVINGS">SAVINGS ACCOUNT</option>
                    <option value="CURRENT">CURRENT ACCOUNT</option>
                  </select>
                </div>

                <Input
                  label="Recipient Account Number"
                  placeholder="e.g. 100293847561"
                  error={errors.toAccount}
                  {...register('toAccount')}
                />

                <Input
                  label="Transfer Amount (₹)"
                  type="number"
                  placeholder="1000"
                  error={errors.amount}
                  {...register('amount')}
                />

                <Input
                  label="Reference Code"
                  placeholder="REF123456"
                  error={errors.referenceNumber}
                  {...register('referenceNumber')}
                />

                <Input
                  label="Remarks"
                  placeholder="e.g. Invoice settlement, Rent"
                  error={errors.remarks}
                  {...register('remarks')}
                />

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} icon={FiSend}>
                    Confirm & Send Money
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}

        {/* Tab 2: Transaction History & Filters */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nature</label>
                <select
                  value={nature}
                  onChange={(e) => setNature(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="">All Natures</option>
                  <option value="DEBIT">DEBIT</option>
                  <option value="CREDIT">CREDIT</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="">All Statuses</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="FAILED">FAILED</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">From Date</label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">To Date</label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 focus:outline-none"
                />
              </div>
            </div>

            {/* Transactions Table */}
            {loading ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <Spinner size="lg" className="text-coral-500" />
                <p className="text-sm font-medium text-slate-600">Fetching transaction passbook...</p>
              </div>
            ) : !transactionsData?.content || transactionsData.content.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
                <FiRepeat className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-bold text-navy-900">No transaction records found</p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                        <th className="p-3.5">Txn Ref</th>
                        <th className="p-3.5">Target Account</th>
                        <th className="p-3.5">Nature</th>
                        <th className="p-3.5">Amount</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactionsData.content.map((t, idx) => (
                        <tr key={t.id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-mono font-semibold text-navy-900">
                            {t.referenceNumber || `#${t.id}`}
                          </td>
                          <td className="p-3.5 font-mono text-slate-700">{t.toAccount || 'N/A'}</td>
                          <td className="p-3.5">
                            <span
                              className={`inline-flex items-center gap-1 font-bold ${
                                t.nature === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800'
                              }`}
                            >
                              {t.nature === 'CREDIT' ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                              {t.nature || 'DEBIT'}
                            </span>
                          </td>
                          <td className="p-3.5 font-extrabold text-navy-900">
                            ₹{Number(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="p-3.5">
                            <Badge variant={t.status || 'APPROVED'}>{t.status || 'SUCCESS'}</Badge>
                          </td>
                          <td className="p-3.5 text-slate-500">
                            {t.timestamp ? new Date(t.timestamp).toLocaleDateString() : 'Today'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Page {page + 1} of {transactionsData.totalPages || 1}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page === 0}
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      icon={FiChevronLeft}
                    >
                      Prev
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page + 1 >= (transactionsData.totalPages || 1)}
                      onClick={() => setPage((p) => p + 1)}
                      icon={FiChevronRight}
                      iconPosition="right"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustTransactions;
