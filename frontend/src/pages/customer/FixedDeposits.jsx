import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FiTrendingUp, FiDollarSign, FiClock, FiCheckCircle, FiShield } from 'react-icons/fi';
import { fdService } from '../../services/fdService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const fdSchema = yup.object().shape({
  depositAmount: yup
    .number()
    .typeError('Deposit amount must be a number')
    .min(1000, 'Minimum deposit amount is ₹1,000')
    .required('Deposit amount is required'),
});

const tenureOptions = [
  { value: 'ONE_YEAR', label: '1 Year (6.5% p.a.)', months: 12 },
  { value: 'TWO_YEARS', label: '2 Years (7.0% p.a.)', months: 24 },
  { value: 'THREE_YEARS', label: '3 Years (7.25% p.a.)', months: 36 },
  { value: 'FOUR_YEARS', label: '4 Years (7.5% p.a.)', months: 48 },
  { value: 'FIVE_YEARS', label: '5 Years (7.75% p.a.)', months: 60 },
];

const FixedDeposits = () => {
  const [accountType, setAccountType] = useState('SAVINGS');
  const [tenure, setTenure] = useState('ONE_YEAR');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await fdService.createFD({
        accountType,
        depositAmount: Number(data.depositAmount),
        tenure,
      });
      toast.success('Fixed Deposit created successfully!');
      reset();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create Fixed Deposit. Ensure sufficient balance.';
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Create FD Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Open a New Fixed Deposit" subtitle="Target endpoint: POST /fd">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Select Source Account
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('SAVINGS')}
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                    className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
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
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
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
                <FiCheckCircle className="text-emerald-400 shrink-0" /> Up to 7.75% p.a. annual returns
              </li>
              <li className="flex items-center gap-2">
                <FiShield className="text-emerald-400 shrink-0" /> DICGC Insured up to ₹5,00,000
              </li>
              <li className="flex items-center gap-2">
                <FiClock className="text-emerald-400 shrink-0" /> Instant booking directly from active balance
              </li>
            </ul>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
};

export default FixedDeposits;
