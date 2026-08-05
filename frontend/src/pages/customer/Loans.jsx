import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiFileText,
  FiPlusCircle,
  FiDollarSign,
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiInfo,
  FiChevronRight,
  FiCreditCard,
} from 'react-icons/fi';
import { loanService } from '../../services/loanService';
import { loanTypeService } from '../../services/loanTypeService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

const applyLoanSchema = yup.object().shape({
  loanTypeId: yup
    .number()
    .typeError('Please select a valid Loan Type')
    .required('Loan Type is required'),
  amount: yup
    .number()
    .typeError('Amount must be a number')
    .positive('Amount must be greater than 0')
    .required('Loan amount is required'),
  tenureMonths: yup
    .number()
    .typeError('Tenure must be a number')
    .positive('Tenure must be positive')
    .integer('Tenure must be whole months')
    .required('Tenure in months is required'),
});

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typesLoading, setTypesLoading] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [repaymentsModalOpen, setRepaymentsModalOpen] = useState(false);

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [repayments, setRepayments] = useState([]);
  const [repaymentsLoading, setRepaymentsLoading] = useState(false);

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState(null);
  const [payAccountType, setPayAccountType] = useState('SAVINGS');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(applyLoanSchema),
    defaultValues: {
      loanTypeId: '',
      amount: 50000,
      tenureMonths: 12,
    },
  });

  const fetchMyLoans = async () => {
    setLoading(true);
    try {
      const data = await loanService.getMyLoans();
      setLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load your loan applications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchLoanTypes = async () => {
    setTypesLoading(true);
    try {
      const data = await loanTypeService.getAllLoanTypes();
      const list = Array.isArray(data) ? data : [];
      setLoanTypes(list);
      if (list.length > 0) {
        setValue('loanTypeId', list[0].loanTypeId || list[0].id);
      }
    } catch (error) {
      toast.error('Failed to load loan products list.');
    } finally {
      setTypesLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLoans();
    fetchLoanTypes();
  }, []);

  const onApplySubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await loanService.applyLoan({
        loanTypeId: Number(data.loanTypeId),
        amount: Number(data.amount),
        tenureMonths: Number(data.tenureMonths),
      });
      toast.success('Loan application submitted successfully for review!');
      setApplyModalOpen(false);
      reset();
      fetchMyLoans();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit loan application.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openRepaymentsModal = async (loan) => {
    const lId = loan.loanId || loan.id;
    setSelectedLoan(loan);
    setRepaymentsModalOpen(true);
    setRepaymentsLoading(true);
    try {
      const data = await loanService.getRepayments(lId);
      setRepayments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load repayment schedule.');
    } finally {
      setRepaymentsLoading(false);
    }
  };

  const handlePayEmi = async () => {
    if (!selectedRepayment) return;
    const rId = selectedRepayment.repaymentId || selectedRepayment.id;
    setIsSubmitting(true);
    try {
      await loanService.payRepayment(rId, payAccountType);
      toast.success('EMI Payment processed successfully!');
      setPayModalOpen(false);
      // Refresh repayments and loans
      if (selectedLoan) {
        openRepaymentsModal(selectedLoan);
      }
      fetchMyLoans();
    } catch (error) {
      const msg = error.response?.data?.message || 'EMI Payment failed. Ensure adequate balance in chosen account.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Loans & EMI Management"
      subtitle="Apply for loans with competitive interest rates, track repayment schedules, and pay monthly EMIs."
    >
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-navy-900">My Loan Applications</h2>
            <p className="text-xs text-slate-500">
              Track pending, approved, and disbursed loans, and manage your EMI repayments.
            </p>
          </div>
          <Button variant="primary" icon={FiPlusCircle} onClick={() => setApplyModalOpen(true)}>
            Apply For New Loan
          </Button>
        </div>

        {/* Loans Table / Cards */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Spinner size="lg" className="text-coral-500" />
            <p className="text-sm font-medium text-slate-600">Loading loan records...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FiFileText className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">No loan applications found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You haven't applied for any loans yet. Click below to explore loan options and apply.
              </p>
            </div>
            <Button variant="primary" icon={FiPlusCircle} onClick={() => setApplyModalOpen(true)}>
              Apply For Loan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loans.map((loan) => {
              const loanId = loan.loanId || loan.id;
              return (
                <Card
                  key={loanId}
                  title={`Loan #${loanId} — ${loan.loanType || 'General Loan'}`}
                  subtitle={`Amount: ₹${Number(loan.amount || 0).toLocaleString('en-IN')}`}
                  action={<Badge variant={loan.status || 'PENDING'}>{loan.status || 'PENDING'}</Badge>}
                >
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Tenure</span>
                      <span className="font-bold text-navy-900">{loan.tenureMonths} Months</span>
                    </div>

                    {loan.emi !== undefined && loan.emi !== null && (
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Monthly EMI</span>
                        <span className="font-bold text-coral-600">₹{Number(loan.emi).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {loan.remainingAmount !== undefined && loan.remainingAmount !== null && (
                      <div className="flex justify-between py-1.5 border-b border-slate-100">
                        <span className="text-slate-500">Remaining Balance</span>
                        <span className="font-bold text-navy-900">₹{Number(loan.remainingAmount).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {loan.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-red-50 text-red-700 text-xs">
                        <span className="font-bold">Rejection Reason:</span> {loan.rejectionReason}
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openRepaymentsModal(loan)}
                        icon={FiCalendar}
                      >
                        Repayment Schedule & Pay EMI
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Loan Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply For a Loan"
        subtitle="Select a loan product and submit your request for bank evaluation."
      >
        <form onSubmit={handleSubmit(onApplySubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Loan Type / Product
            </label>
            {typesLoading ? (
              <div className="p-3 text-xs text-slate-500 bg-slate-50 rounded-xl">Loading loan types...</div>
            ) : loanTypes.length === 0 ? (
              <div className="p-3 text-xs text-amber-700 bg-amber-50 rounded-xl">
                No active loan products currently configured.
              </div>
            ) : (
              <select
                {...register('loanTypeId')}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500 focus:bg-white transition-all cursor-pointer font-medium"
              >
                {loanTypes.map((t) => {
                  const id = t.loanTypeId || t.id;
                  return (
                    <option key={id} value={id}>
                      {t.loanName} — {t.interestRate}% p.a. (Min: ₹{Number(t.minAmount || 0).toLocaleString('en-IN')})
                    </option>
                  );
                })}
              </select>
            )}
            {errors.loanTypeId && (
              <p className="mt-1 text-xs text-red-500 font-medium">{errors.loanTypeId.message}</p>
            )}
          </div>

          <Input
            label="Loan Amount (₹)"
            type="number"
            placeholder="50000"
            icon={FiDollarSign}
            error={errors.amount}
            {...register('amount')}
          />

          <Input
            label="Tenure (Months)"
            type="number"
            placeholder="12"
            icon={FiClock}
            error={errors.tenureMonths}
            {...register('tenureMonths')}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setApplyModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} icon={FiPlusCircle}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Repayments Schedule Modal */}
      <Modal
        isOpen={repaymentsModalOpen}
        onClose={() => setRepaymentsModalOpen(false)}
        title={`Repayment Schedule — Loan #${selectedLoan?.loanId || selectedLoan?.id}`}
        subtitle="Detailed EMI breakdown, due dates, and payment options."
        size="lg"
      >
        {repaymentsLoading ? (
          <div className="p-8 text-center">
            <Spinner size="md" className="text-coral-500" />
            <p className="text-xs text-slate-500 mt-2">Loading EMIs...</p>
          </div>
        ) : repayments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">
            No repayment schedule available yet. Schedule is generated once the loan is approved and disbursed.
          </p>
        ) : (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                    <th className="py-2.5 px-3">EMI #</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Amount Due</th>
                    <th className="py-2.5 px-3">Paid Date</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {repayments.map((r, i) => {
                    const rId = r.repaymentId || r.id;
                    const amount = r.amountDue !== undefined ? r.amountDue : r.amount;
                    const isPaid = r.status === 'PAID' || r.paid === true;

                    return (
                      <tr key={rId || i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 font-bold text-navy-900">
                          #{r.emiNumber || i + 1}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : 'N/A'}
                        </td>
                        <td className="py-3 px-3 font-semibold text-navy-900">
                          ₹{Number(amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {r.paymentDate ? new Date(r.paymentDate).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="py-3 px-3">
                          <Badge variant={isPaid ? 'APPROVED' : r.status === 'OVERDUE' ? 'REJECTED' : 'PENDING'}>
                            {r.status || (isPaid ? 'PAID' : 'PENDING')}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right">
                          {!isPaid ? (
                            <Button
                              variant="primary"
                              size="sm"
                              icon={FiCreditCard}
                              onClick={() => {
                                setSelectedRepayment(r);
                                setPayModalOpen(true);
                              }}
                            >
                              Pay EMI
                            </Button>
                          ) : (
                            <span className="text-emerald-600 text-xs font-semibold flex items-center justify-end gap-1">
                              <FiCheckCircle className="w-3.5 h-3.5" /> Paid
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Modal>

      {/* Pay EMI Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Pay Monthly EMI"
        subtitle={`EMI #${selectedRepayment?.emiNumber || ''} — Amount: ₹${Number(
          selectedRepayment?.amountDue || selectedRepayment?.amount || 0
        ).toLocaleString('en-IN')}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Account To Pay From
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayAccountType('SAVINGS')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  payAccountType === 'SAVINGS'
                    ? 'border-coral-500 bg-coral-50 text-navy-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span>SAVINGS</span>
                <span className="text-[10px] text-slate-400 font-normal">Savings Account</span>
              </button>
              <button
                type="button"
                onClick={() => setPayAccountType('CURRENT')}
                className={`py-3 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer flex flex-col items-center gap-1 ${
                  payAccountType === 'CURRENT'
                    ? 'border-coral-500 bg-coral-50 text-navy-900 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                <span>CURRENT</span>
                <span className="text-[10px] text-slate-400 font-normal">Current Account</span>
              </button>
            </div>
          </div>

          <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-xs flex items-start gap-2">
            <FiInfo className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              The EMI amount of <strong>₹{Number(selectedRepayment?.amountDue || selectedRepayment?.amount || 0).toLocaleString('en-IN')}</strong> will be directly debited from your {payAccountType} account balance.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePayEmi} isLoading={isSubmitting} icon={FiCheckCircle}>
              Confirm EMI Payment
            </Button>
          </div>
        </div>
      </Modal>
    </CustomerLayout>
  );
};

export default Loans;
