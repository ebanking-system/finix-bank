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
  FiCheck,
  FiX,
  FiFilter,
  FiDownload,
  FiCalendar,
  FiEdit,
  FiLayers,
  FiShield,
  FiBriefcase,
  FiInfo,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { employeeService } from '../../services/employeeService';
import { kycService } from '../../services/kycService';
import { loanService } from '../../services/loanService';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import DocumentPreviewModal from '../../components/common/DocumentPreviewModal';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

const getDocumentFileUrl = (customerId, filePath) => {
  if (!filePath || !customerId) return null;
  const fileName = filePath.replace(/\\/g, '/').split('/').pop();
  return `${API_BASE_URL}/api/kyc/files/${customerId}/${fileName}`;
};

const EmployeeDashboard = () => {
  const { userRole } = useAuth();

  // Employee Profile & Department/Designation State
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // KYC State
  const [pendingKycList, setPendingKycList] = useState([]);
  const [allKycList, setAllKycList] = useState([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [allKycLoading, setAllKycLoading] = useState(false);
  const [kycFilter, setKycFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [kycSearchQuery, setKycSearchQuery] = useState('');
  const [kycIdInput, setKycIdInput] = useState('');
  const [isApprovingKyc, setIsApprovingKyc] = useState(false);

  // Document Inspection Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Loans State
  const [pendingLoans, setPendingLoans] = useState([]);
  const [allLoansList, setAllLoansList] = useState([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [allLoansLoading, setAllLoansLoading] = useState(false);
  const [loanFilter, setLoanFilter] = useState('ALL'); // 'ALL' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'CLOSED'
  const [loanSearchQuery, setLoanSearchQuery] = useState('');

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Loan Modal State
  const [editLoanModalOpen, setEditLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editTenure, setEditTenure] = useState('');
  const [isUpdatingLoan, setIsUpdatingLoan] = useState(false);

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

  const fetchAllKyc = async () => {
    setAllKycLoading(true);
    try {
      const data = await kycService.getAllKyc();
      setAllKycList(Array.isArray(data) ? data : []);
    } catch (error) {
      setAllKycList([]);
    } finally {
      setAllKycLoading(false);
    }
  };

  const fetchPendingLoans = async () => {
    setLoansLoading(true);
    try {
      const data = await loanService.getPendingLoans();
      setPendingLoans(Array.isArray(data) ? data : []);
    } catch (error) {
      setPendingLoans([]);
    } finally {
      setLoansLoading(false);
    }
  };

  const fetchAllLoans = async () => {
    setAllLoansLoading(true);
    try {
      const data = await loanService.getAllLoans();
      setAllLoansList(Array.isArray(data) ? data : []);
    } catch (error) {
      setAllLoansList([]);
    } finally {
      setAllLoansLoading(false);
    }
  };

  const refreshAllKycData = () => {
    fetchPendingKyc();
    fetchAllKyc();
  };

  const refreshAllLoanData = () => {
    fetchPendingLoans();
    fetchAllLoans();
  };

  useEffect(() => {
    const fetchProfileAndScopedData = async () => {
      setProfileLoading(true);
      try {
        const res = await employeeService.getMyProfile();
        const empData = res?.data || res;
        setProfile(empData);

        const isKyc =
          empData?.department === 'KYC' ||
          empData?.designation === 'KYC_OFFICER' ||
          userRole === 'MANAGER';
        const isLoans =
          empData?.department === 'LOANS' ||
          empData?.designation === 'LOAN_OFFICER' ||
          userRole === 'MANAGER';

        if (isKyc) {
          fetchPendingKyc();
          fetchAllKyc();
        }
        if (isLoans) {
          fetchPendingLoans();
          fetchAllLoans();
        }
      } catch (err) {
        console.error('Failed to load employee profile', err);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfileAndScopedData();
  }, [userRole]);

  // Operational Scoping Flags
  const isKycOfficer =
    profile?.department === 'KYC' ||
    profile?.designation === 'KYC_OFFICER' ||
    userRole === 'MANAGER';

  const isLoanOfficer =
    profile?.department === 'LOANS' ||
    profile?.designation === 'LOAN_OFFICER' ||
    userRole === 'MANAGER';

  const handleApproveKycItem = async (kycId, accountType = 'SAVINGS') => {
    try {
      await kycService.updateKycStatus(kycId, { status: 'APPROVED', accountType });
      toast.success(`KYC Record #${kycId} approved and account activated!`);
      refreshAllKycData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to approve KYC record. Must be KYC_OFFICER.';
      toast.error(msg);
    }
  };

  const handleRejectKycItem = async (kycId, accountType = 'SAVINGS') => {
    try {
      await kycService.updateKycStatus(kycId, { status: 'REJECTED', accountType });
      toast.success(`KYC Record #${kycId} rejected.`);
      refreshAllKycData();
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
      refreshAllKycData();
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
      refreshAllLoanData();
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
      refreshAllLoanData();
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
      refreshAllLoanData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to disburse loan.';
      toast.error(msg);
    }
  };

  const handleOpenEditLoan = (loan) => {
    setEditingLoan(loan);
    setEditAmount(loan.amount || '');
    setEditTenure(loan.tenureMonths || '');
    setEditLoanModalOpen(true);
  };

  const handleUpdateLoanSubmit = async (e) => {
    e.preventDefault();
    if (!editingLoan) return;

    setIsUpdatingLoan(true);
    try {
      await loanService.updateLoan(editingLoan.loanId || editingLoan.id, {
        amount: Number(editAmount),
        tenureMonths: Number(editTenure),
      });
      toast.success(`Loan #${editingLoan.loanId || editingLoan.id} terms updated successfully!`);
      setEditLoanModalOpen(false);
      setEditingLoan(null);
      refreshAllLoanData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update loan terms.';
      toast.error(msg);
    } finally {
      setIsUpdatingLoan(false);
    }
  };

  // Filter & Search KYC Records
  const filteredKycList = allKycList.filter((item) => {
    const matchesFilter =
      kycFilter === 'ALL' ? true : (item.status || 'PENDING').toUpperCase() === kycFilter;

    const q = kycSearchQuery.trim().toLowerCase();
    if (!q) return matchesFilter;

    const matchId = String(item.id || item.kycId || '').toLowerCase().includes(q);
    const matchCustId = String(item.customerId || '').toLowerCase().includes(q);
    const matchAadhar = String(item.aadharNum || '').toLowerCase().includes(q);
    const matchPan = String(item.panNum || '').toLowerCase().includes(q);

    return matchesFilter && (matchId || matchCustId || matchAadhar || matchPan);
  });

  const countPendingKyc = allKycList.filter((k) => (k.status || 'PENDING') === 'PENDING').length;
  const countApprovedKyc = allKycList.filter((k) => k.status === 'APPROVED').length;
  const countRejectedKyc = allKycList.filter((k) => k.status === 'REJECTED').length;

  // Filter & Search Loans
  const filteredLoansList = allLoansList.filter((loan) => {
    const status = (loan.status || 'UNDER_REVIEW').toUpperCase();
    const matchesFilter =
      loanFilter === 'ALL' ? true : status === loanFilter;

    const q = loanSearchQuery.trim().toLowerCase();
    if (!q) return matchesFilter;

    const matchId = String(loan.loanId || loan.id || '').toLowerCase().includes(q);
    const matchCustId = String(loan.customerId || '').toLowerCase().includes(q);
    const matchCustName = String(loan.customerName || '').toLowerCase().includes(q);
    const matchMobile = String(loan.mobile || '').toLowerCase().includes(q);
    const matchType = String(loan.loanType || '').toLowerCase().includes(q);

    return matchesFilter && (matchId || matchCustId || matchCustName || matchMobile || matchType);
  });

  const countPendingLoans = allLoansList.filter((l) => (l.status || 'UNDER_REVIEW') === 'UNDER_REVIEW').length;
  const countApprovedLoans = allLoansList.filter((l) => l.status === 'APPROVED').length;
  const countRejectedLoans = allLoansList.filter((l) => l.status === 'REJECTED').length;
  const countActiveLoans = allLoansList.filter((l) => l.status === 'ACTIVE').length;
  const countClosedLoans = allLoansList.filter((l) => l.status === 'CLOSED').length;

  if (profileLoading) {
    return (
      <StaffLayout title="Operations Desk" subtitle="Loading staff profile and operational queues...">
        <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-xs text-center space-y-3">
          <Spinner size="lg" className="text-coral-500 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Initializing your branch operational desk...</p>
        </div>
      </StaffLayout>
    );
  }

  const deptLabel = profile?.department || 'Operations';
  const desigLabel = profile?.designation?.replace(/_/g, ' ') || 'Staff Member';

  return (
    <StaffLayout
      title={`Operations Desk — ${deptLabel}`}
      subtitle={`Scoped operational queue for ${desigLabel} (Staff ID: #${profile?.employeeId || '—'})`}
    >
      <div className="space-y-8">
        {/* Department Banner */}
        <div className="bg-gradient-to-r from-navy-900 to-navy-800 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-navy-700 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-coral-500 flex items-center justify-center text-white">
              <FiBriefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-white">{profile?.firstName} {profile?.lastName}</span>
                <Badge variant={profile?.department || 'EMPLOYEE'}>{profile?.department || 'GENERAL'}</Badge>
              </div>
              <p className="text-xs text-slate-300">Designation: <span className="font-semibold text-white">{desigLabel}</span></p>
            </div>
          </div>
          <div className="text-xs text-slate-400 bg-navy-950/60 px-3 py-1.5 rounded-xl border border-navy-800 self-start sm:self-auto">
            Operational Scope: <span className="font-semibold text-emerald-400">{isKycOfficer && isLoanOfficer ? 'All Modules (Executive)' : isKycOfficer ? 'KYC Compliance' : isLoanOfficer ? 'Lending & Underwriting' : profile?.department}</span>
          </div>
        </div>

        {/* ========================================================== */}
        {/* CONDITION 1: KYC OFFICER SECTIONS                         */}
        {/* ========================================================== */}
        {isKycOfficer && (
          <>
            {/* Section 1: Action Required - Pending KYC Queue */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                    <FiUserCheck className="text-coral-500" /> Pending KYC Approvals Queue
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Review recently uploaded customer documents and activate verified customer accounts.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  icon={FiRefreshCw}
                  onClick={refreshAllKycData}
                  isLoading={kycLoading || allKycLoading}
                >
                  Refresh KYC
                </Button>
              </div>

              {kycLoading ? (
                <div className="p-8 text-center space-y-2">
                  <Spinner size="md" className="text-coral-500" />
                  <p className="text-xs text-slate-500">Checking pending KYC queue...</p>
                </div>
              ) : pendingKycList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-navy-900">All Caught Up!</p>
                  <p className="text-xs text-slate-500">No pending KYC submissions in the queue right now.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingKycList.map((kyc) => {
                    const kId = kyc.id || kyc.kycId;
                    const aadhaarUrl = getDocumentFileUrl(kyc.customerId, kyc.aadharDocPath);
                    const panUrl = getDocumentFileUrl(kyc.customerId, kyc.panDocPath);
                    const selfieUrl = getDocumentFileUrl(kyc.customerId, kyc.selfieDocPath);

                    return (
                      <Card
                        key={kId}
                        title={`KYC Application #${kId}`}
                        subtitle={`Customer ID: #${kyc.customerId || 'N/A'}`}
                        action={<Badge variant={kyc.status || 'PENDING'}>{kyc.status || 'PENDING'}</Badge>}
                      >
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">Aadhaar No</span>
                            <span className="font-mono font-bold text-navy-900">{kyc.aadharNum || 'N/A'}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-slate-100">
                            <span className="text-slate-500">PAN No</span>
                            <span className="font-mono font-bold text-navy-900">{kyc.panNum || 'N/A'}</span>
                          </div>

                          {/* Documents Preview Trigger */}
                          <div className="pt-2 border-t border-slate-100 space-y-2">
                            <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider block">
                              Uploaded Documents
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {aadhaarUrl && (
                                <button
                                  type="button"
                                  onClick={() => openDocumentPreview(`Aadhaar Document - Customer #${kyc.customerId}`, aadhaarUrl)}
                                  className="px-2.5 py-1 bg-coral-50 text-coral-600 hover:bg-coral-100 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <FiEye /> Aadhaar
                                </button>
                              )}
                              {panUrl && (
                                <button
                                  type="button"
                                  onClick={() => openDocumentPreview(`PAN Card - Customer #${kyc.customerId}`, panUrl)}
                                  className="px-2.5 py-1 bg-coral-50 text-coral-600 hover:bg-coral-100 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <FiEye /> PAN
                                </button>
                              )}
                              {selfieUrl && (
                                <button
                                  type="button"
                                  onClick={() => openDocumentPreview(`Portrait Selfie - Customer #${kyc.customerId}`, selfieUrl)}
                                  className="px-2.5 py-1 bg-coral-50 text-coral-600 hover:bg-coral-100 rounded-lg font-semibold text-[11px] flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <FiEye /> Selfie
                                </button>
                              )}
                              {!aadhaarUrl && !panUrl && !selfieUrl && (
                                <span className="text-[11px] text-slate-400">No documents</span>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRejectKycItem(kId)}
                              icon={FiXCircle}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              Reject
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApproveKycItem(kId)}
                              icon={FiCheckCircle}
                            >
                              Approve & Activate
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Section 2: Complete KYC Registry & Audit Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                    <FiFileText className="text-coral-500" /> Digital KYC Audit Registry
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Full search and filter audit log of all customer KYC submissions across all statuses.
                  </p>
                </div>
                
                {/* Quick Action Input */}
                <form onSubmit={handleApproveKycManual} className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Direct KYC ID..."
                    value={kycIdInput}
                    onChange={(e) => setKycIdInput(e.target.value)}
                    className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500 w-32"
                  />
                  <Button type="submit" variant="primary" size="sm" isLoading={isApprovingKyc}>
                    Quick Approve
                  </Button>
                </form>
              </div>

              {/* Status Filter Tabs & Search Bar */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1 text-xs">
                  <button
                    onClick={() => setKycFilter('ALL')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      kycFilter === 'ALL' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-slate-600 hover:text-navy-900'
                    }`}
                  >
                    All ({allKycList.length})
                  </button>
                  <button
                    onClick={() => setKycFilter('PENDING')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      kycFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-amber-700'
                    }`}
                  >
                    Pending ({countPendingKyc})
                  </button>
                  <button
                    onClick={() => setKycFilter('APPROVED')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      kycFilter === 'APPROVED' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-emerald-700'
                    }`}
                  >
                    Approved ({countApprovedKyc})
                  </button>
                  <button
                    onClick={() => setKycFilter('REJECTED')}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                      kycFilter === 'REJECTED' ? 'bg-white text-red-700 shadow-xs font-bold' : 'text-slate-600 hover:text-red-700'
                    }`}
                  >
                    Rejected ({countRejectedKyc})
                  </button>
                </div>

                <div className="relative min-w-[240px]">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                  <input
                    type="text"
                    placeholder="Search KYC / Customer / ID..."
                    value={kycSearchQuery}
                    onChange={(e) => setKycSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500"
                  />
                </div>
              </div>

              {/* KYC Table */}
              {allKycLoading ? (
                <div className="p-8 text-center space-y-2">
                  <Spinner size="md" className="text-coral-500" />
                  <p className="text-xs text-slate-500">Loading KYC registry records...</p>
                </div>
              ) : filteredKycList.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                  <FiAlertCircle className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-navy-900">No matching KYC records found</p>
                  <p className="text-xs text-slate-500">Try adjusting your status filter or search term.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                        <th className="py-3 px-4">KYC ID</th>
                        <th className="py-3 px-4">Customer ID</th>
                        <th className="py-3 px-4">Aadhaar No</th>
                        <th className="py-3 px-4">PAN No</th>
                        <th className="py-3 px-4">Documents</th>
                        <th className="py-3 px-4">Submitted Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredKycList.map((k) => {
                        const kId = k.id || k.kycId;
                        const status = (k.status || 'PENDING').toUpperCase();
                        const aadhaarUrl = getDocumentFileUrl(k.customerId, k.aadharDocPath);
                        const panUrl = getDocumentFileUrl(k.customerId, k.panDocPath);
                        const selfieUrl = getDocumentFileUrl(k.customerId, k.selfieDocPath);

                        return (
                          <tr key={kId} className="hover:bg-slate-50/80 transition-colors">
                            <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{kId}</td>
                            <td className="py-3.5 px-4 font-bold text-navy-900">#{k.customerId || '—'}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-700">{k.aadharNum || '—'}</td>
                            <td className="py-3.5 px-4 font-mono text-slate-700">{k.panNum || '—'}</td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                {aadhaarUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => openDocumentPreview(`Aadhaar Document - Customer #${k.customerId}`, aadhaarUrl)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-coral-50 hover:text-coral-600 text-slate-700 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                                  >
                                    <FiEye className="w-3 h-3 text-coral-500" /> Aadhaar
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-300">No Aadhaar</span>
                                )}

                                {panUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => openDocumentPreview(`PAN Card - Customer #${k.customerId}`, panUrl)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-coral-50 hover:text-coral-600 text-slate-700 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                                  >
                                    <FiEye className="w-3 h-3 text-coral-500" /> PAN
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-300">No PAN</span>
                                )}

                                {selfieUrl ? (
                                  <button
                                    type="button"
                                    onClick={() => openDocumentPreview(`Portrait Selfie - Customer #${k.customerId}`, selfieUrl)}
                                    className="px-2 py-1 bg-slate-100 hover:bg-coral-50 hover:text-coral-600 text-slate-700 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors border border-slate-200"
                                  >
                                    <FiEye className="w-3 h-3 text-coral-500" /> Selfie
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-300">No Selfie</span>
                                )}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                              {k.submittedDate ? (
                                <span className="flex items-center gap-1">
                                  <FiCalendar className="w-3 h-3 text-slate-400" />
                                  {new Date(k.submittedDate).toLocaleDateString('en-IN', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                </span>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td className="py-3.5 px-4">
                              <Badge variant={status}>{status}</Badge>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {status === 'PENDING' ? (
                                <div className="flex items-center justify-end gap-1.5">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectKycItem(kId)}
                                    icon={FiX}
                                    className="text-red-600 border-red-200 hover:bg-red-50 text-[11px] py-1 px-2.5"
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleApproveKycItem(kId)}
                                    icon={FiCheck}
                                    className="text-[11px] py-1 px-2.5"
                                  >
                                    Approve
                                  </Button>
                                </div>
                              ) : status === 'APPROVED' ? (
                                <span className="text-[11px] font-semibold text-emerald-600 flex items-center justify-end gap-1">
                                  <FiCheckCircle className="w-3.5 h-3.5" /> Activated
                                </span>
                              ) : (
                                <span className="text-[11px] font-semibold text-red-500 flex items-center justify-end gap-1">
                                  <FiXCircle className="w-3.5 h-3.5" /> Rejected
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {/* ========================================================== */}
        {/* CONDITION 2: LOAN OFFICER SECTIONS                        */}
        {/* ========================================================== */}
        {isLoanOfficer && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <FiDollarSign className="text-coral-500" /> Loan Applications Operations & Registry
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Review loan underwriting, adjust terms, approve credit, reject ineligible applications, and disburse approved funds.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={FiRefreshCw}
                onClick={refreshAllLoanData}
                isLoading={loansLoading || allLoansLoading}
              >
                Refresh Loans
              </Button>
            </div>

            {/* Loan Filters and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              {/* Status Tabs */}
              <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl gap-1 text-xs">
                <button
                  onClick={() => setLoanFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    loanFilter === 'ALL' ? 'bg-white text-navy-900 shadow-xs font-bold' : 'text-slate-600 hover:text-navy-900'
                  }`}
                >
                  All ({allLoansList.length})
                </button>
                <button
                  onClick={() => setLoanFilter('UNDER_REVIEW')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    loanFilter === 'UNDER_REVIEW' ? 'bg-white text-amber-700 shadow-xs font-bold' : 'text-slate-600 hover:text-amber-700'
                  }`}
                >
                  Pending ({countPendingLoans})
                </button>
                <button
                  onClick={() => setLoanFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    loanFilter === 'APPROVED' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-blue-700'
                  }`}
                >
                  Approved ({countApprovedLoans})
                </button>
                <button
                  onClick={() => setLoanFilter('ACTIVE')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    loanFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  Active / Disbursed ({countActiveLoans})
                </button>
                <button
                  onClick={() => setLoanFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    loanFilter === 'REJECTED' ? 'bg-white text-red-700 shadow-xs font-bold' : 'text-slate-600 hover:text-red-700'
                  }`}
                >
                  Rejected ({countRejectedLoans})
                </button>
                <button
                  onClick={() => setLoanFilter('CLOSED')}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                    loanFilter === 'CLOSED' ? 'bg-white text-slate-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-700'
                  }`}
                >
                  Closed ({countClosedLoans})
                </button>
              </div>

              {/* Search Input */}
              <div className="relative min-w-[240px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
                <input
                  type="text"
                  placeholder="Search Loan / Customer / Type..."
                  value={loanSearchQuery}
                  onChange={(e) => setLoanSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500"
                />
              </div>
            </div>

            {/* Comprehensive Loans Table */}
            {allLoansLoading ? (
              <div className="p-8 text-center space-y-2">
                <Spinner size="md" className="text-coral-500" />
                <p className="text-xs text-slate-500">Loading loan applications...</p>
              </div>
            ) : filteredLoansList.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-navy-900">No Loans in this Category</p>
                <p className="text-xs text-slate-500">There are no loan records matching the active filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                      <th className="py-3 px-4">Loan ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Loan Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Tenure / EMI</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredLoansList.map((loan) => {
                      const lId = loan.loanId || loan.id;
                      const status = (loan.status || 'UNDER_REVIEW').toUpperCase();

                      return (
                        <tr key={lId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{lId}</td>
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-navy-900">{loan.customerName || `Customer #${loan.customerId}`}</div>
                            <div className="text-[11px] text-slate-500">ID: #{loan.customerId} • {loan.mobile || '—'}</div>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-700">{loan.loanType || 'Personal Loan'}</td>
                          <td className="py-3.5 px-4 font-bold text-navy-900">
                            ₹{Number(loan.amount || 0).toLocaleString('en-IN')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{loan.tenureMonths} Months</div>
                            {loan.emi ? (
                              <div className="text-[11px] font-bold text-coral-600">EMI: ₹{Number(loan.emi).toLocaleString('en-IN')}</div>
                            ) : null}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={status}>{status}</Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Review & Edit Terms Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEditLoan(loan)}
                                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Review or edit loan terms"
                              >
                                <FiEdit className="w-3.5 h-3.5" />
                              </button>

                              {/* Actions by Status */}
                              {status === 'UNDER_REVIEW' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedLoanId(lId);
                                      setRejectModalOpen(true);
                                    }}
                                    icon={FiX}
                                    className="text-red-600 border-red-200 hover:bg-red-50 text-[11px] py-1 px-2.5"
                                  >
                                    Reject
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => handleApproveLoan(lId)}
                                    icon={FiCheck}
                                    className="text-[11px] py-1 px-2.5"
                                  >
                                    Approve
                                  </Button>
                                </>
                              )}

                              {status === 'APPROVED' && (
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => handleDisburseLoan(lId)}
                                  icon={FiDollarSign}
                                  className="text-[11px] py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Disburse
                                </Button>
                              )}

                              {status === 'ACTIVE' && (
                                <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                                  <FiCheckCircle /> Active
                                </span>
                              )}

                              {status === 'REJECTED' && (
                                <span className="text-[11px] font-semibold text-red-500 flex items-center gap-1">
                                  <FiXCircle /> Rejected
                                </span>
                              )}

                              {status === 'CLOSED' && (
                                <span className="text-[11px] font-semibold text-slate-500">
                                  Fully Paid
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* CONDITION 3: NEITHER KYC NOR LOANS (OTHER DEPARTMENTS)    */}
        {/* ========================================================== */}
        {!isKycOfficer && !isLoanOfficer && (
          <div className="bg-white rounded-3xl p-10 border border-slate-200/80 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto">
              <FiBriefcase className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-navy-900">{profile?.department} Operational Desk</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You are signed in as an employee in the <span className="font-semibold text-navy-900">{profile?.department}</span> department ({desigLabel}).
              KYC and Lending queues are restricted to their respective officers and managers.
            </p>
          </div>
        )}
      </div>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewTitle}
        subtitle="Identity Document Inspection"
        fileUrl={previewUrl}
      />

      {/* Reject Loan Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Loan Application #${selectedLoanId}`}
        subtitle="Specify the underwriting reason for credit application rejection."
      >
        <form onSubmit={handleRejectLoanSubmit} className="space-y-4">
          <Input
            label="Rejection Reason"
            placeholder="e.g. Insufficient credit score or debt-to-income ratio too high"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            required
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

      {/* Edit Loan Parameters Modal */}
      <Modal
        isOpen={editLoanModalOpen}
        onClose={() => setEditLoanModalOpen(false)}
        title={`Edit Loan Parameters #${editingLoan?.loanId || editingLoan?.id}`}
        subtitle="Adjust requested loan amount or tenure months."
      >
        <form onSubmit={handleUpdateLoanSubmit} className="space-y-4">
          <Input
            label="Loan Amount (₹)"
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            placeholder="e.g. 50000"
            icon={FiDollarSign}
            required
          />
          <Input
            label="Tenure (Months)"
            type="number"
            value={editTenure}
            onChange={(e) => setEditTenure(e.target.value)}
            placeholder="e.g. 12"
            icon={FiCalendar}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditLoanModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isUpdatingLoan} icon={FiCheck}>
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </StaffLayout>
  );
};

export default EmployeeDashboard;
