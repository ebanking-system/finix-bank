import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiTrendingUp,
  FiDollarSign,
  FiClock,
  FiCheckCircle,
  FiShield,
  FiRefreshCw,
  FiCalendar,
  FiPercent,
} from 'react-icons/fi';
import { fdService } from '../../services/fdService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';

const fdSchema = yup.object().shape({
  depositAmount: yup
    .number()
    .typeError('Deposit amount must be a number')
    .min(1000, 'Minimum deposit amount is ₹1,000')
    .required('Deposit amount is required'),
});

const tenureOptions = [
  { value: 'ONE_YEAR', label: '1 Year (6.5% p.a.)', rate: 6.5 },
  { value: 'TWO_YEARS', label: '2 Years (6.8% p.a.)', rate: 6.8 },
  { value: 'THREE_YEARS', label: '3 Years (7.0% p.a.)', rate: 7.0 },
  { value: 'FOUR_YEARS', label: '4 Years (7.2% p.a.)', rate: 7.2 },
  { value: 'FIVE_YEARS', label: '5 Years (7.5% p.a.)', rate: 7.5 },
];

const FixedDeposits = () => {
  const [accountType, setAccountType] = useState('SAVINGS');
  const [tenureYears, setTenureYears] = useState('ONE_YEAR');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [fdList, setFdList] = useState([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(fdSchema),
    defaultValues: {
      depositAmount: 25000,
    },
  });

  const fetchFixedDeposits = async (accType) => {
    setLoading(true);
    try {
      const data = await fdService.getFDDetails(accType);
      setFdList(Array.isArray(data) ? data : []);
    } catch (error) {
      setFdList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFixedDeposits(accountType);
  }, [accountType]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await fdService.createFD({
        accountType,
        depositAmount: Number(data.depositAmount),
        tenureYears,
      });
      toast.success('Fixed Deposit created successfully!');
      reset();
      fetchFixedDeposits(accountType);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to create Fixed Deposit. Ensure sufficient account balance.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Fixed Deposits"
      subtitle="Invest in high-yield term deposits with guaranteed returns and flexible tenure terms."
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Create FD Form */}
          <div className="lg:col-span-7 space-y-6">
            <Card
              title="Open a New Fixed Deposit"
              subtitle="Lock funds with guaranteed returns and instant interest maturity."
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Source Account
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setAccountType('SAVINGS')}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        accountType === 'SAVINGS'
                          ? 'border-coral-500 bg-coral-50 text-navy-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      SAVINGS ACCOUNT
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('CURRENT')}
                      className={`py-3 px-4 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        accountType === 'CURRENT'
                          ? 'border-coral-500 bg-coral-50 text-navy-900 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-600'
                      }`}
                    >
                      CURRENT ACCOUNT
                    </button>
                  </div>
                </div>

                <Input
                  label="Deposit Amount (₹)"
                  type="number"
                  placeholder="25000"
                  icon={FiDollarSign}
                  error={errors.depositAmount}
                  {...register('depositAmount')}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Select Deposit Tenure
                  </label>
                  <select
                    value={tenureYears}
                    onChange={(e) => setTenureYears(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:bg-white transition-all cursor-pointer font-medium"
                  >
                    {tenureOptions.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    isLoading={isSubmitting}
                    icon={FiCheckCircle}
                  >
                    Confirm & Open Fixed Deposit
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Rate Card / Features */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-navy-900 text-white rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="SAVINGS">GUARANTEED RETURNS</Badge>
              </div>
              <h3 className="text-xl font-bold">Why Choose Finix FD?</h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <FiCheckCircle className="text-emerald-400 shrink-0" /> Up to 7.50% p.a. annual yield
                </li>
                <li className="flex items-center gap-2">
                  <FiShield className="text-emerald-400 shrink-0" /> DICGC Insured protection
                </li>
                <li className="flex items-center gap-2">
                  <FiClock className="text-emerald-400 shrink-0" /> Instant booking debited from active account
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Section 2: Active Fixed Deposits List */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                <FiTrendingUp className="text-coral-500" /> Active Fixed Deposits ({fdList.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Overview of term deposit investments linked to your {accountType} account.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={FiRefreshCw}
              onClick={() => fetchFixedDeposits(accountType)}
              isLoading={loading}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center space-y-3">
              <Spinner size="lg" className="text-coral-500" />
              <p className="text-xs font-medium text-slate-600">Loading fixed deposit portfolio...</p>
            </div>
          ) : fdList.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <FiClock className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-bold text-navy-900">No Fixed Deposits</p>
              <p className="text-xs text-slate-500">You do not have any active Fixed Deposits linked to your {accountType} account.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fdList.map((fd, index) => {
                const fdId = fd.id || index;
                return (
                  <Card
                    key={fdId}
                    title={`Fixed Deposit #${fdId}`}
                    subtitle={`Rate: ${fd.interestRate}% p.a.`}
                    action={<Badge variant={fd.status || 'ACTIVE'}>{fd.status || 'ACTIVE'}</Badge>}
                  >
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Principal Deposit</span>
                        <span className="font-bold text-navy-900">₹{Number(fd.depositAmount || 0).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Maturity Amount</span>
                        <span className="font-bold text-emerald-600">₹{Number(fd.maturityAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Tenure</span>
                        <span className="font-semibold text-slate-700">{fd.tenureYears?.replace('_', ' ') || 'N/A'}</span>
                      </div>
                      {fd.maturityDate && (
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Maturity Date</span>
                          <span className="text-slate-700">{new Date(fd.maturityDate).toLocaleDateString('en-IN')}</span>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
};

export default FixedDeposits;
