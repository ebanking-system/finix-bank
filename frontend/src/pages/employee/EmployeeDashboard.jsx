import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FiUserCheck,
  FiFileText,
  FiCheckCircle,
  FiXCircle,
  FiDollarSign,
  FiRefreshCw,
  FiAlertCircle,
  FiSearch,
} from 'react-icons/fi';
import { kycService } from '../../services/kycService';
import { loanService } from '../../services/loanService';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

// TODO: backend needs a list-pending-KYC endpoint

const EmployeeDashboard = () => {
  // KYC State
  const [kycIdInput, setKycIdInput] = useState('');
  const [isApprovingKyc, setIsApprovingKyc] = useState(false);

  // Loans State
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingLoans = async () => {
    setLoansLoading(true);
    try {
      const data = await loanService.getPendingLoans();
      setPendingLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Could not fetch pending loan queue.');
    } finally {
      setLoansLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingLoans();
  }, []);

  const handleApproveKyc = async (e) => {
    e.preventDefault();
    if (!kycIdInput.trim()) {
      toast.error('Please enter a valid KYC ID.');
      return;
    }
    setIsApprovingKyc(true);
    try {
      await kycService.updateKycStatus(kycIdInput, { status: 'APPROVED' });
      toast.success(`KYC Record #${kycIdInput} approved successfully!`);
      setKycIdInput('');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to approve KYC record.';
      toast.error(msg);
    } finally {
      setIsApprovingKyc(false);
    }
  };

  const handleApproveLoan = async (loanId) => {
    try {
      await loanService.approveLoan(loanId);
      toast.success(`Loan #${loanId} approved!`);
      fetchPendingLoans();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to approve loan.';
      toast.error(msg);
    }
  };

  const handleRejectLoanSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason.');
      return;
    }
    setIsSubmitting(true);
    try {
      await loanService.rejectLoan(selectedLoanId, rejectionReason);
      toast.success(`Loan #${selectedLoanId} rejected.`);
      setRejectModalOpen(false);
      setRejectionReason('');
      fetchPendingLoans();
    } catch (error) {
      toast.error('Failed to reject loan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisburseLoan = async (loanId) => {
    try {
      await loanService.disburseLoan(loanId);
      toast.success(`Funds for Loan #${loanId} disbursed to customer account!`);
      fetchPendingLoans();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to disburse loan.';
      toast.error(msg);
    }
  };

  return (
    <StaffLayout
      title="Employee Operations Desk"
      subtitle="Audit KYC requests, evaluate pending loan applications, and trigger disbursements."
    >
      <div className="space-y-8">
        
        {/* Section 1: KYC Approval Desk */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <FiUserCheck className="text-coral-500" /> Digital KYC Audit Desk
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target endpoint: PATCH /api/kyc/{'{id}'}
              </p>
            </div>
            <Badge variant="EMPLOYEE">PATCH /api/kyc/{'{id}'}</Badge>
          </div>

          <form onSubmit={handleApproveKyc} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <Input
                label="Enter KYC Record ID to Approve"
                placeholder="e.g. 1"
                value={kycIdInput}
                onChange={(e) => setKycIdInput(e.target.value)}
                icon={FiSearch}
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              isLoading={isApprovingKyc}
              icon={FiCheckCircle}
            >
              Approve KYC Status
            </Button>
          </form>

          <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-800 flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
            <span>
              Note: If the backend has no list-pending-KYC endpoint, enter the customer's known KYC ID above to trigger sign-off.
            </span>
          </div>
        </div>

        {/* Section 2: Loan Approval Queue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
                <FiFileText className="text-coral-500" /> Pending Loan Applications Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Target endpoint: GET /api/loans/pending
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={FiRefreshCw}
              onClick={fetchPendingLoans}
              isLoading={loansLoading}
            >
              Refresh Queue
            </Button>
          </div>

          {loansLoading ? (
            <div className="p-8 text-center space-y-2">
              <Spinner size="md" className="text-coral-500" />
              <p className="text-xs text-slate-500">Fetching pending loan applications...</p>
            </div>
          ) : pendingLoans.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-navy-900">Loan Queue Clear</p>
              <p className="text-xs text-slate-500">There are currently no pending loan applications requiring review.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingLoans.map((loan) => (
                <Card
                  key={loan.id}
                  title={`Loan #${loan.id}`}
                  subtitle={`Amount: ₹${Number(loan.amount || 0).toLocaleString('en-IN')}`}
                  action={<Badge variant={loan.status}>{loan.status}</Badge>}
                >
                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span className="text-slate-500">Tenure</span>
                      <span className="font-bold text-navy-900">{loan.tenureMonths} Months</span>
                    </div>

                    <div className="pt-2 flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedLoanId(loan.id);
                          setRejectModalOpen(true);
                        }}
                        icon={FiXCircle}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        Reject
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApproveLoan(loan.id)}
                        icon={FiCheckCircle}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDisburseLoan(loan.id)}
                        icon={FiDollarSign}
                      >
                        Disburse
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Loan #${selectedLoanId}`}
        subtitle="Specify the reason for credit application rejection."
      >
        <form onSubmit={handleRejectLoanSubmit} className="space-y-4">
          <Input
            label="Rejection Reason"
            placeholder="e.g. Insufficient credit score or income verification failure"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRejectModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" isLoading={isSubmitting} icon={FiXCircle}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </StaffLayout>
  );
};

export default EmployeeDashboard;
