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
} from 'react-icons/fi';
import { loanService } from '../../services/loanService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

// TODO: replace with GET /api/loans/types once backend adds it
const staticLoanTypes = [
  { id: 1, name: 'Personal Loan (Code #1)' },
  { id: 2, name: 'Home Loan (Code #2)' },
  { id: 3, name: 'Vehicle Loan (Code #3)' },
];

const applyLoanSchema = yup.object().shape({
  loanTypeId: yup
    .number()
    .typeError('Loan Type Code must be a number')
    .required('Loan Type ID is required'),
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
  const [loading, setLoading] = useState(true);
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
    formState: { errors },
  } = useForm({
    resolver: yupResolver(applyLoanSchema),
    defaultValues: {
      loanTypeId: 1,
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

  useEffect(() => {
    fetchMyLoans();
  }, []);

  const onApplySubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await loanService.applyLoan(data);
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
    setSelectedLoan(loan);
    setRepaymentsModalOpen(true);
    setRepaymentsLoading(true);
    try {
      const data = await loanService.getRepayments(loan.id);
      setRepayments(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load repayment schedule.');
    } finally {
      setRepaymentsLoading(false);
    }
  };

  const handlePayEmi = async () => {
    if (!selectedRepayment) return;
    setIsSubmitting(true);
    try {
      await loanService.payRepayment(selectedRepayment.id, payAccountType);
      toast.success('EMI Payment processed successfully!');
      setPayModalOpen(false);
      // Refresh repayments
      if (selectedLoan) {
        openRepaymentsModal(selectedLoan);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'EMI Payment failed. Ensure adequate balance.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Loans & EMI Management"
      subtitle="Apply for personal/business loans, view status, and pay monthly EMIs."
    >
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-navy-900">My Loan Applications</h2>
            <p className="text-xs text-slate-500">
              Track pending, approved, and disbursed loans.
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
                You haven't applied for any loans yet. Click below to submit an application.
              </p>
            </div>
            <Button variant="primary" icon={FiPlusCircle} onClick={() => setApplyModalOpen(true)}>
              Apply For Loan
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loans.map((loan) => (
              <Card
                key={loan.id}
                title={`Loan #${loan.id}`}
                subtitle={`Amount: ₹${Number(loan.amount || 0).toLocaleString('en-IN')}`}
                action={<Badge variant={loan.status || 'PENDING'}>{loan.status || 'PENDING'}</Badge>}
              >
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Tenure</span>
                    <span className="font-bold text-navy-900">{loan.tenureMonths} Months</span>
                  </div>

                  {loan.interestRate && (
                    <div className="flex justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500">Interest Rate</span>
                      <span className="font-bold text-navy-900">{loan.interestRate}% p.a.</span>
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
                      Repayment Schedule
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Apply Loan Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title="Apply For a Loan"
        subtitle="Submit your loan request for bank credit evaluation."
      >
        <form onSubmit={handleSubmit(onApplySubmit)} className="space-y-4">
          <Input
            label="Loan Type Code (ID)"
            type="number"
            placeholder="1"
            helperText="Ask your bank for the loan type code (e.g. 1 for Personal, 2 for Home)"
            error={errors.loanTypeId}
            {...register('loanTypeId')}
          />

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
        title={`Repayment Schedule — Loan #${selectedLoan?.id}`}
        subtitle="View EMI due dates and make monthly payments."
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
          <div className="space-y-3">
            {repayments.map((r, i) => (
              <div
                key={r.id || i}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50 text-xs"
              >
                <div>
                  <span className="font-bold text-navy-900">EMI #{i + 1} — ₹{Number(r.amount || 0).toLocaleString('en-IN')}</span>
                  <span className="block text-[11px] text-slate-500">Due: {r.dueDate || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={r.paid ? 'APPROVED' : 'PENDING'}>
                    {r.paid ? 'PAID' : 'DUE'}
                  </Badge>
                  {!r.paid && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setSelectedRepayment(r);
                        setPayModalOpen(true);
                      }}
                    >
                      Pay EMI
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* Pay EMI Modal */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title="Pay Monthly EMI"
        subtitle={`Amount: ₹${selectedRepayment?.amount || 0}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Select Account For Payment
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPayAccountType('SAVINGS')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  payAccountType === 'SAVINGS'
                    ? 'border-coral-500 bg-coral-50 text-navy-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                SAVINGS
              </button>
              <button
                type="button"
                onClick={() => setPayAccountType('CURRENT')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  payAccountType === 'CURRENT'
                    ? 'border-coral-500 bg-coral-50 text-navy-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                }`}
              >
                CURRENT
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setPayModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handlePayEmi} isLoading={isSubmitting}>
              Confirm EMI Payment
            </Button>
          </div>
        </div>
      </Modal>
    </CustomerLayout>
  );
};

export default Loans;
