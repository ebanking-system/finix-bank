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
  FiCreditCard,
  FiEye,
  FiImage,
  FiExternalLink,
  FiCheck,
  FiX,
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

const getDocumentFileUrl = (customerId, filePath) => {
  if (!filePath || !customerId) return null;
  const fileName = filePath.replace(/\\/g, '/').split('/').pop();
  return `${API_BASE_URL}/api/kyc/files/${customerId}/${fileName}`;
};

const EmployeeDashboard = () => {
  // KYC State
  const [pendingKycList, setPendingKycList] = useState([]);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycIdInput, setKycIdInput] = useState('');
  const [isApprovingKyc, setIsApprovingKyc] = useState(false);

  // Document Inspection Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Loans State
  const [pendingLoans, setPendingLoans] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPendingKyc = async () => {
    setKycLoading(true);
    try {
      const data = await kycService.getKycByStatus('PENDING');
      setPendingKycList(Array.isArray(data) ? data : []);
    } catch (error) {
      setPendingKycList([]);
    } finally {
      setKycLoading(false);
    }
  };

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
    fetchPendingKyc();
    fetchPendingLoans();
  }, []);

  const handleApproveKycItem = async (kycId, accountType = 'SAVINGS') => {
    try {
      await kycService.updateKycStatus(kycId, { status: 'APPROVED', accountType });
      toast.success(`KYC Record #${kycId} approved and account activated!`);
      fetchPendingKyc();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to approve KYC record. Must be KYC_OFFICER.';
      toast.error(msg);
    }
  };

  const handleRejectKycItem = async (kycId, accountType = 'SAVINGS') => {
    try {
      await kycService.updateKycStatus(kycId, { status: 'REJECTED', accountType });
      toast.success(`KYC Record #${kycId} rejected.`);
      fetchPendingKyc();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reject KYC record.';
      toast.error(msg);
    }
  };

  const handleApproveKycManual = async (e) => {
    e.preventDefault();
    if (!kycIdInput.trim()) {
      toast.error('Please enter a valid KYC ID.');
      return;
    }
    setIsApprovingKyc(true);
    try {
      await kycService.updateKycStatus(kycIdInput, { status: 'APPROVED', accountType: 'SAVINGS' });
      toast.success(`KYC Record #${kycIdInput} approved successfully!`);
      setKycIdInput('');
      fetchPendingKyc();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to approve KYC record. Must be KYC_OFFICER.';
      toast.error(msg);
    } finally {
      setIsApprovingKyc(false);
    }
  };

  const openDocumentPreview = (title, url) => {
    setPreviewTitle(title);
    setPreviewUrl(url);
    setPreviewModalOpen(true);
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
      subtitle="Audit KYC requests, inspect uploaded identity documents, evaluate loan applications, and trigger disbursements."
    >
      <div className="space-y-8">
        
        {/* Section 1: KYC Approval Desk */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                <FiUserCheck className="text-coral-500" /> Digital KYC Audit Desk
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review submitted customer identity cards and facial selfies to approve or reject account activation.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={FiRefreshCw}
              onClick={fetchPendingKyc}
              isLoading={kycLoading}
            >
              Refresh KYC
            </Button>
          </div>

          {/* Pending KYC Table / Cards */}
          {kycLoading ? (
            <div className="p-8 text-center space-y-2">
              <Spinner size="md" className="text-coral-500" />
              <p className="text-xs text-slate-500">Checking pending KYC submissions...</p>
            </div>
          ) : pendingKycList.length === 0 ? (
            <div className="p-6 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
              <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-navy-900">No Pending KYC Submissions</p>
              <p className="text-xs text-slate-500">All customer identity verifications are currently up to date.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {pendingKycList.map((k) => {
                const kId = k.kycId || k.id;
                const aadharUrl = getDocumentFileUrl(k.customerId, k.aadharFile);
                const panUrl = getDocumentFileUrl(k.customerId, k.panFile);
                const selfieUrl = getDocumentFileUrl(k.customerId, k.selfieFile);

                return (
                  <Card
                    key={kId}
                    title={`KYC Application #${kId}`}
                    subtitle={`Customer ID: #${k.customerId || 'N/A'}`}
                    action={<Badge variant="PENDING">PENDING REVIEW</Badge>}
                  >
                    <div className="space-y-4 text-xs">
                      {/* Identity Numbers */}
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">Aadhaar Number</span>
                          <span className="font-mono font-bold text-navy-900">{k.aadharNum || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[11px] text-slate-400 block font-medium">PAN Number</span>
                          <span className="font-mono font-bold text-navy-900">{k.panNum || 'N/A'}</span>
                        </div>
                      </div>

                      {/* Document Attachments Preview */}
                      <div>
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                          Uploaded Document Files
                        </span>
                        <div className="grid grid-cols-3 gap-2">
                          {/* Aadhaar File */}
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-slate-600 truncate w-full">Aadhaar Card</span>
                            {aadharUrl ? (
                              <button
                                type="button"
                                onClick={() => openDocumentPreview(`Aadhaar Card - Customer #${k.customerId}`, aadharUrl)}
                                className="w-full py-1 px-2 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-coral-600 hover:bg-coral-50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <FiEye className="w-3 h-3" /> View
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Not uploaded</span>
                            )}
                          </div>

                          {/* PAN File */}
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-slate-600 truncate w-full">PAN Card</span>
                            {panUrl ? (
                              <button
                                type="button"
                                onClick={() => openDocumentPreview(`PAN Card - Customer #${k.customerId}`, panUrl)}
                                className="w-full py-1 px-2 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-coral-600 hover:bg-coral-50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <FiEye className="w-3 h-3" /> View
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Not uploaded</span>
                            )}
                          </div>

                          {/* Selfie File */}
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200 text-center flex flex-col items-center justify-between gap-1">
                            <span className="text-[10px] font-bold text-slate-600 truncate w-full">Selfie Portrait</span>
                            {selfieUrl ? (
                              <button
                                type="button"
                                onClick={() => openDocumentPreview(`Portrait Selfie - Customer #${k.customerId}`, selfieUrl)}
                                className="w-full py-1 px-2 bg-white border border-slate-200 rounded-lg text-[10px] font-semibold text-coral-600 hover:bg-coral-50 flex items-center justify-center gap-1 cursor-pointer transition-colors"
                              >
                                <FiEye className="w-3 h-3" /> View
                              </button>
                            ) : (
                              <span className="text-[10px] text-slate-400">Not uploaded</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {k.submittedDate && (
                        <div className="flex justify-between py-1 border-t border-slate-100 text-slate-500">
                          <span>Submission Timestamp</span>
                          <span className="font-semibold text-slate-700">
                            {new Date(k.submittedDate).toLocaleString('en-IN')}
                          </span>
                        </div>
                      )}

                      {/* Approval Actions */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRejectKycItem(kId)}
                          icon={FiXCircle}
                          className="text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Reject KYC
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApproveKycItem(kId)}
                          icon={FiCheckCircle}
                        >
                          Approve & Activate Account
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Quick Manual Approval Fallback */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Direct KYC ID Lookup & Approval
            </h3>
            <form onSubmit={handleApproveKycManual} className="flex flex-col sm:flex-row items-end gap-3">
              <div className="flex-1 w-full">
                <Input
                  label="Enter KYC Record ID"
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
                Approve Status
              </Button>
            </form>
          </div>
        </div>

        {/* Section 2: Loan Approval Queue */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                <FiFileText className="text-coral-500" /> Pending Loan Applications Queue
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluate pending credit requests, perform underwriting audit, approve or reject applications.
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
              {pendingLoans.map((loan) => {
                const lId = loan.loanId || loan.id;
                return (
                  <Card
                    key={lId}
                    title={`Loan #${lId} — ${loan.loanType || 'Loan'}`}
                    subtitle={`Amount: ₹${Number(loan.amount || 0).toLocaleString('en-IN')}`}
                    action={<Badge variant={loan.status || 'PENDING'}>{loan.status || 'PENDING'}</Badge>}
                  >
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Tenure</span>
                        <span className="font-bold text-navy-900">{loan.tenureMonths} Months</span>
                      </div>

                      {loan.emi !== undefined && loan.emi !== null && (
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">EMI</span>
                          <span className="font-bold text-coral-600">₹{Number(loan.emi).toLocaleString('en-IN')}</span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedLoanId(lId);
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
                          onClick={() => handleApproveLoan(lId)}
                          icon={FiCheckCircle}
                        >
                          Approve
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDisburseLoan(lId)}
                          icon={FiDollarSign}
                        >
                          Disburse
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* Document Preview Modal */}
      <Modal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewTitle}
        subtitle="Identity document inspection"
      >
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-2xl p-2 flex items-center justify-center min-h-[300px] max-h-[500px] overflow-auto">
            {previewUrl.endsWith('.pdf') ? (
              <iframe src={previewUrl} title={previewTitle} className="w-full h-[450px] rounded-xl" />
            ) : (
              <img
                src={previewUrl}
                alt={previewTitle}
                className="max-w-full max-h-[450px] object-contain rounded-xl"
                onError={(e) => {
                  e.target.style.display = 'none';
                  toast.error('Could not load image file preview.');
                }}
              />
            )}
          </div>
          <div className="flex justify-between items-center pt-2">
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-coral-600 font-semibold hover:underline flex items-center gap-1"
            >
              <FiExternalLink /> Open in new tab
            </a>
            <Button variant="outline" size="sm" onClick={() => setPreviewModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

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
