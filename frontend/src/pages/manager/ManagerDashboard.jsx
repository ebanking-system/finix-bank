import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiUserPlus,
  FiShield,
  FiMail,
  FiLock,
  FiBriefcase,
  FiList,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPercent,
  FiDollarSign,
  FiClock,
  FiUsers,
  FiRefreshCw,
  FiCheckCircle,
  FiInfo,
  FiCheck,
  FiX,
  FiXCircle,
  FiSearch,
  FiEye,
  FiFileText,
  FiUserCheck,
  FiAlertTriangle,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { loanTypeService } from '../../services/loanTypeService';
import { employeeService } from '../../services/employeeService';
import { loanService } from '../../services/loanService';
import { kycService } from '../../services/kycService';
import Navbar from '../../components/common/Navbar';
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

const DEPARTMENTS = ['MANAGEMENT', 'KYC', 'ACCOUNTS', 'LOANS', 'CUSTOMER_SERVICE'];
const DESIGNATIONS = ['MANAGER', 'KYC_OFFICER', 'ACCOUNT_OFFICER', 'LOAN_OFFICER', 'CUSTOMER_SERVICE_OFFICER'];

// Reduced schema matching employee-relevant fields only
const addEmployeeSchema = yup.object().shape({
  firstName: yup.string().trim().required('First name is required'),
  middleName: yup.string().trim().nullable(),
  lastName: yup.string().trim().required('Last name is required'),
  email: yup.string().email('Valid email is required').required('Email is required'),
  password: yup
    .string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[#@$*]).{5,20}$/,
      'Password must be 5-20 characters: min 1 digit, 1 lowercase letter, 1 special symbol (#, @, $, *)'
    )
    .required('Password is required'),
  department: yup.string().oneOf(DEPARTMENTS).required('Department is required'),
  designation: yup.string().oneOf(DESIGNATIONS).required('Designation is required'),
});

const loanTypeSchema = yup.object().shape({
  loanName: yup.string().trim().required('Loan name is required'),
  interestRate: yup.number().typeError('Interest rate must be a number').positive('Interest rate must be positive').required('Interest rate is required'),
  minAmount: yup.number().typeError('Min amount must be a number').positive('Min amount must be positive').required('Min amount is required'),
  maxAmount: yup.number().typeError('Max amount must be a number').positive('Max amount must be positive').required('Max amount is required'),
  minTenureMonths: yup.number().typeError('Min tenure must be a number').positive('Min tenure must be positive').integer('Min tenure must be whole months').required('Min tenure is required'),
  maxTenureMonths: yup.number().typeError('Max tenure must be a number').positive('Max tenure must be positive').integer('Max tenure must be whole months').required('Max tenure is required'),
});

const ManagerDashboard = () => {
  const { userId } = useAuth();
  const [activeTab, setActiveTab] = useState('loans'); // 'loans' | 'kyc' | 'loan-types' | 'employee-roster' | 'register-employee'

  // Document Inspection Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  // Operational Modules: Loans Queue State
  const [allLoansList, setAllLoansList] = useState([]);
  const [loansLoading, setLoansLoading] = useState(true);
  const [loanFilter, setLoanFilter] = useState('ALL'); // 'ALL' | 'UNDER_REVIEW' | 'APPROVED' | 'ACTIVE' | 'REJECTED' | 'CLOSED'
  const [loanSearchQuery, setLoanSearchQuery] = useState('');

  // Reject Loan Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmittingReject, setIsSubmittingReject] = useState(false);

  // Edit Loan Terms Modal State
  const [editLoanModalOpen, setEditLoanModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editTenure, setEditTenure] = useState('');
  const [editLoanTypeId, setEditLoanTypeId] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editRejectionReason, setEditRejectionReason] = useState('');
  const [isUpdatingLoan, setIsUpdatingLoan] = useState(false);

  // Operational Modules: KYC Verification Queue State
  const [allKycList, setAllKycList] = useState([]);
  const [kycLoading, setKycLoading] = useState(true);
  const [kycFilter, setKycFilter] = useState('ALL'); // 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [kycSearchQuery, setKycSearchQuery] = useState('');

  // Employee Roster state
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editDept, setEditDept] = useState('LOANS');
  const [editDesig, setEditDesig] = useState('LOAN_OFFICER');
  const [isUpdatingAssignment, setIsUpdatingAssignment] = useState(false);
  const [isDeletingEmpId, setIsDeletingEmpId] = useState(null);

  // Employee Register form state
  const [isEmployeeSubmitting, setIsEmployeeSubmitting] = useState(false);
  const {
    register: registerEmp,
    handleSubmit: handleSubmitEmp,
    reset: resetEmp,
    formState: { errors: errorsEmp },
  } = useForm({
    resolver: yupResolver(addEmployeeSchema),
    defaultValues: {
      middleName: '',
      department: 'KYC',
      designation: 'KYC_OFFICER',
    },
  });

  // Loan Types catalog state
  const [loanTypes, setLoanTypes] = useState([]);
  const [loanTypesLoading, setLoanTypesLoading] = useState(true);
  const [loanTypeModalOpen, setLoanTypeModalOpen] = useState(false);
  const [editingLoanType, setEditingLoanType] = useState(null);
  const [isLoanTypeSubmitting, setIsLoanTypeSubmitting] = useState(false);

  const {
    register: registerLt,
    handleSubmit: handleSubmitLt,
    reset: resetLt,
    formState: { errors: errorsLt },
  } = useForm({
    resolver: yupResolver(loanTypeSchema),
    defaultValues: {
      loanName: '',
      interestRate: 10.5,
      minAmount: 10000,
      maxAmount: 1000000,
      minTenureMonths: 6,
      maxTenureMonths: 60,
    },
  });

  // Fetch all loans across all statuses
  const fetchLoans = async () => {
    setLoansLoading(true);
    try {
      const data = await loanService.getAllLoans();
      setAllLoansList(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to load loan applications queue.');
      }
      setAllLoansList([]);
    } finally {
      setLoansLoading(false);
    }
  };

  // Fetch all KYC documents across all statuses
  const fetchKyc = async () => {
    setKycLoading(true);
    try {
      const data = await kycService.getAllKyc();
      setAllKycList(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to load KYC verification queue.');
      }
      setAllKycList([]);
    } finally {
      setKycLoading(false);
    }
  };

  const fetchLoanTypes = async () => {
    setLoanTypesLoading(true);
    try {
      const data = await loanTypeService.getAllLoanTypes();
      setLoanTypes(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to load loan products catalog.');
      }
    } finally {
      setLoanTypesLoading(false);
    }
  };

  const fetchEmployees = async () => {
    setEmployeesLoading(true);
    try {
      const data = await employeeService.getAllEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (error) {
      if (error.response?.status !== 401 && error.response?.status !== 403) {
        toast.error('Failed to load employee roster.');
      }
    } finally {
      setEmployeesLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
    fetchKyc();
    fetchLoanTypes();
    fetchEmployees();
  }, []);

  const openDocumentPreview = (title, url) => {
    setPreviewTitle(title);
    setPreviewUrl(url);
    setPreviewModalOpen(true);
  };

  // Loan Actions (Manager Role Override)
  const handleApproveLoan = async (loanId) => {
    try {
      await loanService.approveLoan(loanId);
      toast.success(`Loan #${loanId} approved successfully (Manager Override Logged)`);
      fetchLoans();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.data || 'Failed to approve loan.';
      toast.error(msg);
    }
  };

  const handleRejectLoanSubmit = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      toast.error('Please enter a valid rejection reason.');
      return;
    }
    setIsSubmittingReject(true);
    try {
      await loanService.rejectLoan(selectedLoanId, rejectionReason);
      toast.success(`Loan #${selectedLoanId} rejected (Manager Override Logged)`);
      setRejectModalOpen(false);
      setRejectionReason('');
      setSelectedLoanId(null);
      fetchLoans();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reject loan application.';
      toast.error(msg);
    } finally {
      setIsSubmittingReject(false);
    }
  };

  const handleDisburseLoan = async (loanId) => {
    try {
      await loanService.disburseLoan(loanId);
      toast.success(`Loan #${loanId} disbursed successfully! Funds credited.`);
      fetchLoans();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.data || 'Failed to disburse loan funds.';
      toast.error(msg);
    }
  };

  const handleOpenEditLoan = (loan) => {
    setEditingLoan(loan);
    setEditAmount(loan.amount || '');
    setEditTenure(loan.tenureMonths || '');
    setEditLoanTypeId(loan.loanTypeId || (loan.loanType?.loanTypeId || ''));
    setEditStatus(loan.status || 'UNDER_REVIEW');
    setEditRejectionReason(loan.rejectionReason || '');
    setEditLoanModalOpen(true);
  };

  const handleSaveEditLoan = async (e) => {
    e.preventDefault();
    if (!editingLoan) return;
    const loanId = editingLoan.loanId || editingLoan.id;
    setIsUpdatingLoan(true);
    try {
      const payload = {
        amount: editAmount ? Number(editAmount) : undefined,
        tenureMonths: editTenure ? Number(editTenure) : undefined,
        loanTypeId: editLoanTypeId ? Number(editLoanTypeId) : undefined,
        status: editStatus || undefined,
        rejectionReason: editRejectionReason || undefined,
      };
      await loanService.updateLoan(loanId, payload);
      toast.success(`Loan #${loanId} terms updated successfully (Manager Override Logged)`);
      setEditLoanModalOpen(false);
      fetchLoans();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update loan terms.';
      toast.error(msg);
    } finally {
      setIsUpdatingLoan(false);
    }
  };

  // KYC Actions (Manager Role Override)
  const handleApproveKycItem = async (kycId) => {
    try {
      await kycService.updateKycStatus(kycId, { status: 'APPROVED', accountType: 'SAVINGS' });
      toast.success(`KYC #${kycId} approved (Manager Override Logged). Account activated!`);
      fetchKyc();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to approve KYC application.';
      toast.error(msg);
    }
  };

  const handleRejectKycItem = async (kycId) => {
    try {
      await kycService.updateKycStatus(kycId, { status: 'REJECTED' });
      toast.success(`KYC #${kycId} marked as rejected (Manager Override Logged).`);
      fetchKyc();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to reject KYC application.';
      toast.error(msg);
    }
  };

  const onAddEmployeeSubmit = async (data) => {
    setIsEmployeeSubmitting(true);
    try {
      const payload = { ...data, role: 'EMPLOYEE' };
      const resp = await authService.signup(payload);
      if (resp?.status === 'Failure' || resp?.status === 'failure') {
        toast.error(resp?.data || resp?.message || 'Failed to register employee.');
        return;
      }
      toast.success(`Employee ${data.firstName} ${data.lastName} successfully registered!`);
      resetEmp();
      fetchEmployees();
      setActiveTab('employee-roster');
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to register employee. Please check inputs.';
      toast.error(message);
    } finally {
      setIsEmployeeSubmitting(false);
    }
  };

  const handleOpenEditAssignment = (emp) => {
    setSelectedEmployee(emp);
    setEditDept(emp.department || 'LOANS');
    setEditDesig(emp.designation || 'LOAN_OFFICER');
    setAssignmentModalOpen(true);
  };

  const handleSaveAssignment = async () => {
    if (!selectedEmployee) return;
    const empId = selectedEmployee.employeeId || selectedEmployee.id;
    setIsUpdatingAssignment(true);
    try {
      await employeeService.updateEmployeeAssignment(empId, {
        department: editDept,
        designation: editDesig,
      });
      toast.success(`Assignment for ${selectedEmployee.firstName} updated!`);
      setAssignmentModalOpen(false);
      fetchEmployees();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update employee assignment.';
      toast.error(msg);
    } finally {
      setIsUpdatingAssignment(false);
    }
  };

  const handleDeleteEmployee = async (emp) => {
    const empId = emp.employeeId || emp.id;
    const fullName = [emp.firstName, emp.lastName].filter(Boolean).join(' ');
    if (!window.confirm(`Are you sure you want to delete employee "${fullName}" (ID: #${empId})?`)) {
      return;
    }

    setIsDeletingEmpId(empId);
    try {
      await employeeService.deleteEmployee(empId);
      toast.success(`Employee "${fullName}" deleted successfully.`);
      fetchEmployees();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete employee.';
      toast.error(msg);
    } finally {
      setIsDeletingEmpId(null);
    }
  };

  const handleOpenCreateLoanType = () => {
    setEditingLoanType(null);
    resetLt({
      loanName: '',
      interestRate: 10.5,
      minAmount: 10000,
      maxAmount: 1000000,
      minTenureMonths: 6,
      maxTenureMonths: 60,
    });
    setLoanTypeModalOpen(true);
  };

  const handleOpenEditLoanType = (lt) => {
    setEditingLoanType(lt);
    resetLt({
      loanName: lt.loanName || '',
      interestRate: lt.interestRate || 10,
      minAmount: lt.minAmount || 10000,
      maxAmount: lt.maxAmount || 500000,
      minTenureMonths: lt.minTenureMonths || 6,
      maxTenureMonths: lt.maxTenureMonths || 36,
    });
    setLoanTypeModalOpen(true);
  };

  const onLoanTypeSubmit = async (data) => {
    setIsLoanTypeSubmitting(true);
    try {
      const payload = {
        loanName: data.loanName,
        interestRate: Number(data.interestRate),
        minAmount: Number(data.minAmount),
        maxAmount: Number(data.maxAmount),
        minTenureMonths: Number(data.minTenureMonths),
        maxTenureMonths: Number(data.maxTenureMonths),
      };

      if (editingLoanType) {
        const id = editingLoanType.loanTypeId || editingLoanType.id;
        await loanTypeService.updateLoanType(id, payload);
        toast.success(`Loan Product "${data.loanName}" updated successfully!`);
      } else {
        await loanTypeService.createLoanType(payload);
        toast.success(`Loan Product "${data.loanName}" created successfully!`);
      }
      setLoanTypeModalOpen(false);
      resetLt();
      fetchLoanTypes();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save loan product.';
      toast.error(msg);
    } finally {
      setIsLoanTypeSubmitting(false);
    }
  };

  const handleDeleteLoanType = async (lt) => {
    const id = lt.loanTypeId || lt.id;
    if (!window.confirm(`Are you sure you want to delete loan product "${lt.loanName}"?`)) return;

    try {
      await loanTypeService.deleteLoanType(id);
      toast.success(`Loan product "${lt.loanName}" deleted.`);
      fetchLoanTypes();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to delete loan product.';
      toast.error(msg);
    }
  };

  // Filtered Loans
  const filteredLoans = allLoansList.filter((loan) => {
    const status = (loan.status || 'UNDER_REVIEW').toUpperCase();
    if (loanFilter !== 'ALL' && status !== loanFilter) return false;
    if (!loanSearchQuery.trim()) return true;
    const q = loanSearchQuery.toLowerCase();
    const lId = String(loan.loanId || loan.id || '');
    const cId = String(loan.customerId || '');
    const cName = (loan.customerName || '').toLowerCase();
    const lType = (loan.loanType || '').toLowerCase();
    return lId.includes(q) || cId.includes(q) || cName.includes(q) || lType.includes(q);
  });

  const countPendingLoans = allLoansList.filter((l) => (l.status || '').toUpperCase() === 'UNDER_REVIEW').length;
  const countApprovedLoans = allLoansList.filter((l) => (l.status || '').toUpperCase() === 'APPROVED').length;
  const countActiveLoans = allLoansList.filter((l) => (l.status || '').toUpperCase() === 'ACTIVE').length;
  const countRejectedLoans = allLoansList.filter((l) => (l.status || '').toUpperCase() === 'REJECTED').length;
  const countClosedLoans = allLoansList.filter((l) => (l.status || '').toUpperCase() === 'CLOSED').length;

  // Filtered KYC
  const filteredKyc = allKycList.filter((kyc) => {
    const status = (kyc.status || 'PENDING').toUpperCase();
    if (kycFilter !== 'ALL' && status !== kycFilter) return false;
    if (!kycSearchQuery.trim()) return true;
    const q = kycSearchQuery.toLowerCase();
    const kId = String(kyc.id || kyc.kycId || '');
    const cId = String(kyc.customerId || '');
    const aNum = (kyc.aadharNum || '').toLowerCase();
    const pNum = (kyc.panNum || '').toLowerCase();
    return kId.includes(q) || cId.includes(q) || aNum.includes(q) || pNum.includes(q);
  });

  const countPendingKyc = allKycList.filter((k) => (k.status || '').toUpperCase() === 'PENDING').length;
  const countApprovedKyc = allKycList.filter((k) => (k.status || '').toUpperCase() === 'APPROVED').length;
  const countRejectedKyc = allKycList.filter((k) => (k.status || '').toUpperCase() === 'REJECTED').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-8 space-y-6">
        {/* Manager Header */}
        <div className="bg-navy-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-navy-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="MANAGER">EXECUTIVE MANAGER CONSOLE</Badge>
              <span className="text-xs font-mono text-slate-400">Manager ID: #{userId}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Enterprise Banking Operations</h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Full executive oversight across loans underwriting, KYC compliance, product catalog, and staff management.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap bg-navy-800/90 p-1.5 rounded-2xl border border-navy-700/80 gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('loans')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'loans'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              <FiDollarSign className="w-4 h-4" /> Loan Applications ({countPendingLoans > 0 ? `${countPendingLoans} pending` : allLoansList.length})
            </button>
            <button
              onClick={() => setActiveTab('kyc')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'kyc'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              <FiUserCheck className="w-4 h-4" /> KYC Verification ({countPendingKyc > 0 ? `${countPendingKyc} pending` : allKycList.length})
            </button>
            <button
              onClick={() => setActiveTab('loan-types')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'loan-types'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              <FiList className="w-4 h-4" /> Loan Catalog
            </button>
            <button
              onClick={() => setActiveTab('employee-roster')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'employee-roster'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              <FiUsers className="w-4 h-4" /> Staff Roster ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('register-employee')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'register-employee'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-navy-700/50'
              }`}
            >
              <FiUserPlus className="w-4 h-4" /> Onboard Staff
            </button>
          </div>
        </div>

        {/* TAB 1: Loan Applications Operations (Manager Override Enabled) */}
        {activeTab === 'loans' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                    <FiDollarSign className="text-coral-500" /> Loans Operations & Underwriting Registry
                  </h2>
                  <span className="text-[11px] font-bold text-coral-600 bg-coral-50 px-2 py-0.5 rounded-full border border-coral-200">
                    Manager Override Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Review and edit parameters across all loan applications regardless of assignment, approve credit, disburse funds, or reject ineligible files.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={FiRefreshCw}
                onClick={fetchLoans}
                isLoading={loansLoading}
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
            {loansLoading ? (
              <div className="p-8 text-center space-y-2">
                <Spinner size="md" className="text-coral-500" />
                <p className="text-xs text-slate-500">Loading loan applications...</p>
              </div>
            ) : filteredLoans.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-navy-900">No Loans Found</p>
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
                    {filteredLoans.map((loan) => {
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
                                title="Review or edit loan terms (Manager Override)"
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

        {/* TAB 2: KYC Verification Queue (Manager Override Enabled) */}
        {activeTab === 'kyc' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                    <FiUserCheck className="text-coral-500" /> Digital KYC Verification Compliance Queue
                  </h2>
                  <span className="text-[11px] font-bold text-coral-600 bg-coral-50 px-2 py-0.5 rounded-full border border-coral-200">
                    Manager Override Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Inspect uploaded identity documents, Aadhaar cards, PAN cards, and portrait selfies. Approve or reject verification files with automatic audit logging.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={FiRefreshCw}
                onClick={fetchKyc}
                isLoading={kycLoading}
              >
                Refresh KYC
              </Button>
            </div>

            {/* KYC Filters and Search Bar */}
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
                  placeholder="Search KYC ID / Customer / Aadhaar / PAN..."
                  value={kycSearchQuery}
                  onChange={(e) => setKycSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-coral-500"
                />
              </div>
            </div>

            {/* KYC Table */}
            {kycLoading ? (
              <div className="p-8 text-center space-y-2">
                <Spinner size="md" className="text-coral-500" />
                <p className="text-xs text-slate-500">Loading KYC registry...</p>
              </div>
            ) : filteredKyc.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                <FiCheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
                <p className="text-sm font-bold text-navy-900">No KYC Records Found</p>
                <p className="text-xs text-slate-500">There are no verification files in this category.</p>
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
                      <th className="py-3 px-4">Documents Inspection</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredKyc.map((k) => {
                      const kId = k.id || k.kycId;
                      const status = (k.status || 'PENDING').toUpperCase();
                      const aadhaarUrl = getDocumentFileUrl(k.customerId, k.aadharDocPath);
                      const panUrl = getDocumentFileUrl(k.customerId, k.panDocPath);
                      const selfieUrl = getDocumentFileUrl(k.customerId, k.selfieDocPath);

                      return (
                        <tr key={kId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-500">#{kId}</td>
                          <td className="py-3.5 px-4 font-bold text-navy-900">
                            Customer #{k.customerId || 'N/A'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                            {k.aadharNum || '—'}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-700">
                            {k.panNum || '—'}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              {aadhaarUrl && (
                                <button
                                  type="button"
                                  onClick={() => openDocumentPreview(`Aadhaar Document - Customer #${k.customerId}`, aadhaarUrl)}
                                  className="px-2 py-1 bg-coral-50 text-coral-600 hover:bg-coral-100 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Inspect Aadhaar Document"
                                >
                                  <FiEye /> Aadhaar
                                </button>
                              )}
                              {panUrl && (
                                <button
                                  type="button"
                                  onClick={() => openDocumentPreview(`PAN Card - Customer #${k.customerId}`, panUrl)}
                                  className="px-2 py-1 bg-coral-50 text-coral-600 hover:bg-coral-100 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Inspect PAN Document"
                                >
                                  <FiEye /> PAN
                                </button>
                              )}
                              {selfieUrl && (
                                <button
                                  type="button"
                                  onClick={() => openDocumentPreview(`Portrait Selfie - Customer #${k.customerId}`, selfieUrl)}
                                  className="px-2 py-1 bg-coral-50 text-coral-600 hover:bg-coral-100 rounded-md font-semibold text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                                  title="Inspect Portrait Selfie"
                                >
                                  <FiEye /> Selfie
                                </button>
                              )}
                              {!aadhaarUrl && !panUrl && !selfieUrl && (
                                <span className="text-[11px] text-slate-400">No documents</span>
                              )}
                            </div>
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
        )}

        {/* TAB 3: Loan Types Catalog CRUD */}
        {activeTab === 'loan-types' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <FiList className="text-coral-500" /> Loan Types Catalog Management
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create, edit, or delete loan products offered by Finix Bank to retail customers.
                </p>
              </div>
              <Button variant="primary" icon={FiPlus} onClick={handleOpenCreateLoanType}>
                Add New Loan Product
              </Button>
            </div>

            {loanTypesLoading ? (
              <div className="p-12 text-center space-y-3">
                <Spinner size="lg" className="text-coral-500" />
                <p className="text-xs font-medium text-slate-600">Loading loan catalog...</p>
              </div>
            ) : loanTypes.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                <p className="text-sm font-semibold text-navy-900">No loan types defined yet.</p>
                <p className="text-xs text-slate-500">Click "Add New Loan Product" to create your first loan type.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Loan Name</th>
                      <th className="py-3 px-4">Interest Rate</th>
                      <th className="py-3 px-4">Min Amount</th>
                      <th className="py-3 px-4">Max Amount</th>
                      <th className="py-3 px-4">Tenure Range</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loanTypes.map((lt) => {
                      const id = lt.loanTypeId || lt.id;
                      return (
                        <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{id}</td>
                          <td className="py-3.5 px-4 font-bold text-navy-900">{lt.loanName}</td>
                          <td className="py-3.5 px-4 font-bold text-coral-600">{lt.interestRate}% p.a.</td>
                          <td className="py-3.5 px-4 text-slate-700">₹{Number(lt.minAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4 text-slate-700">₹{Number(lt.maxAmount || 0).toLocaleString('en-IN')}</td>
                          <td className="py-3.5 px-4 text-slate-600">
                            {lt.minTenureMonths} – {lt.maxTenureMonths} Months
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditLoanType(lt)}
                                className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-navy-900 hover:text-white transition-colors cursor-pointer"
                                title="Edit Loan Product"
                              >
                                <FiEdit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteLoanType(lt)}
                                className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                                title="Delete Loan Product"
                              >
                                <FiTrash2 className="w-4 h-4" />
                              </button>
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

        {/* TAB 4: Employee Roster & Assignment Manager */}
        {activeTab === 'employee-roster' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <FiUsers className="text-coral-500" /> Staff Roster & Department Assignments
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  View registered employees, inspect operational roles, reassign departments, or remove staff accounts.
                </p>
              </div>
              <Button variant="outline" size="sm" icon={FiRefreshCw} onClick={fetchEmployees} isLoading={employeesLoading}>
                Refresh Roster
              </Button>
            </div>

            {employeesLoading ? (
              <div className="p-12 text-center space-y-3">
                <Spinner size="lg" className="text-coral-500" />
                <p className="text-xs font-medium text-slate-600">Loading staff directory...</p>
              </div>
            ) : employees.length === 0 ? (
              <div className="p-12 text-center bg-slate-50 rounded-2xl border border-slate-200/60 space-y-3">
                <p className="text-sm font-semibold text-navy-900">No staff members listed yet.</p>
                <p className="text-xs text-slate-500">Switch to the "Onboard Staff" tab to register your first bank employee.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold">
                      <th className="py-3 px-4">Staff ID</th>
                      <th className="py-3 px-4">Full Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp) => {
                      const empId = emp.employeeId || emp.id;
                      return (
                        <tr key={empId} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-400">#{empId}</td>
                          <td className="py-3.5 px-4 font-bold text-navy-900">
                            {[emp.firstName, emp.middleName, emp.lastName].filter(Boolean).join(' ')}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">{emp.email || 'N/A'}</td>
                          <td className="py-3.5 px-4">
                            <Badge variant={emp.department || 'EMPLOYEE'}>{emp.department || 'GENERAL'}</Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="font-semibold text-slate-700">{emp.designation?.replace('_', ' ') || 'OFFICER'}</span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                icon={FiEdit}
                                onClick={() => handleOpenEditAssignment(emp)}
                              >
                                Assignment
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                icon={FiTrash2}
                                onClick={() => handleDeleteEmployee(emp)}
                                isLoading={isDeletingEmpId === empId}
                              >
                                Delete
                              </Button>
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

        {/* TAB 5: Register Employee Form */}
        {activeTab === 'register-employee' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <FiUserPlus className="text-coral-500" /> Onboard Bank Employee
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create an employee credential and assign their operational branch department and designation.
                </p>
              </div>
              <Badge variant="EMPLOYEE">Role Locked: EMPLOYEE</Badge>
            </div>

            <form onSubmit={handleSubmitEmp(onAddEmployeeSubmit)} className="space-y-6 w-full">
              {/* Row 1: Personal Details */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  1. Staff Identity & Personal Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-4">
                    <Input
                      label="First Name"
                      placeholder="Jane"
                      error={errorsEmp.firstName}
                      {...registerEmp('firstName')}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Input
                      label="Middle Name (Optional)"
                      placeholder="R."
                      error={errorsEmp.middleName}
                      {...registerEmp('middleName')}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <Input
                      label="Last Name"
                      placeholder="Smith"
                      error={errorsEmp.lastName}
                      {...registerEmp('lastName')}
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Account Credentials */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  2. Authentication & Access Credentials
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <Input
                      label="Work Email Address"
                      type="email"
                      placeholder="jane.smith@finixbank.com"
                      icon={FiMail}
                      error={errorsEmp.email}
                      {...registerEmp('email')}
                    />
                  </div>
                  <div className="md:col-span-6">
                    <Input
                      label="Initial Password"
                      type="password"
                      placeholder="••••••••"
                      icon={FiLock}
                      error={errorsEmp.password}
                      {...registerEmp('password')}
                    />
                    <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
                      <FiInfo className="text-slate-400 shrink-0 w-3.5 h-3.5" />
                      5-20 chars: min 1 digit, 1 lowercase letter, 1 special symbol (#, @, $, *)
                    </p>
                  </div>
                </div>
              </div>

              {/* Row 3: Department & Designation Assignment */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  3. Operational Department & Branch Designation
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Assigned Department
                    </label>
                    <select
                      {...registerEmp('department')}
                      className="w-full h-11 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500 transition-all cursor-pointer"
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-6">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Official Designation
                    </label>
                    <select
                      {...registerEmp('designation')}
                      className="w-full h-11 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500 transition-all cursor-pointer"
                    >
                      {DESIGNATIONS.map((des) => (
                        <option key={des} value={des}>
                          {des.replace('_', ' ')}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" variant="primary" size="lg" isLoading={isEmployeeSubmitting} icon={FiBriefcase}>
                  Register & Activate Bank Employee
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        title={previewTitle}
        subtitle="Identity Document & Compliance Inspection"
        fileUrl={previewUrl}
      />

      {/* Reject Reason Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title={`Reject Loan Application #${selectedLoanId}`}
        subtitle="Specify the underwriting reason for credit application rejection (Manager Override)."
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
            <Button type="submit" variant="danger" isLoading={isSubmittingReject} icon={FiXCircle}>
              Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Loan Parameters Modal */}
      <Modal
        isOpen={editLoanModalOpen}
        onClose={() => setEditLoanModalOpen(false)}
        title={`Review & Adjust Loan Application #${editingLoan?.loanId || editingLoan?.id}`}
        subtitle="Modify loan amount, tenure months, product type, status, or rejection details."
      >
        <form onSubmit={handleSaveEditLoan} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Loan Amount (₹)"
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              placeholder="e.g. 50000"
              icon={FiDollarSign}
            />
            <Input
              label="Tenure (Months)"
              type="number"
              value={editTenure}
              onChange={(e) => setEditTenure(e.target.value)}
              placeholder="e.g. 12"
              icon={FiClock}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Loan Product Type
              </label>
              <select
                value={editLoanTypeId}
                onChange={(e) => setEditLoanTypeId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
              >
                <option value="">Keep Existing Product</option>
                {loanTypes.map((lt) => (
                  <option key={lt.loanTypeId || lt.id} value={lt.loanTypeId || lt.id}>
                    {lt.loanName} ({lt.interestRate}%)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Application Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
              >
                <option value="UNDER_REVIEW">UNDER_REVIEW (Pending)</option>
                <option value="APPROVED">APPROVED</option>
                <option value="ACTIVE">ACTIVE (Disbursed)</option>
                <option value="REJECTED">REJECTED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {editStatus === 'REJECTED' && (
            <Input
              label="Rejection Reason"
              placeholder="Reason for rejecting this loan"
              value={editRejectionReason}
              onChange={(e) => setEditRejectionReason(e.target.value)}
            />
          )}

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

      {/* Edit Assignment Modal */}
      <Modal
        isOpen={assignmentModalOpen}
        onClose={() => setAssignmentModalOpen(false)}
        title={`Update Assignment — ${selectedEmployee?.firstName || ''} ${selectedEmployee?.lastName || ''}`}
        subtitle={`Staff ID #${selectedEmployee?.employeeId || selectedEmployee?.id}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Department
            </label>
            <select
              value={editDept}
              onChange={(e) => setEditDept(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Designation
            </label>
            <select
              value={editDesig}
              onChange={(e) => setEditDesig(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
            >
              {DESIGNATIONS.map((des) => (
                <option key={des} value={des}>
                  {des.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setAssignmentModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSaveAssignment} isLoading={isUpdatingAssignment} icon={FiCheck}>
              Save Assignment
            </Button>
          </div>
        </div>
      </Modal>

      {/* Loan Type Add/Edit Modal */}
      <Modal
        isOpen={loanTypeModalOpen}
        onClose={() => setLoanTypeModalOpen(false)}
        title={editingLoanType ? `Edit Loan Product #${editingLoanType.loanTypeId || editingLoanType.id}` : 'Add New Loan Product'}
        subtitle="Configure interest rate, limits, and tenure parameters."
      >
        <form onSubmit={handleSubmitLt(onLoanTypeSubmit)} className="space-y-4">
          <Input
            label="Loan Product Name"
            placeholder="e.g. Personal Loan, Home Loan"
            error={errorsLt.loanName}
            {...registerLt('loanName')}
          />

          <Input
            label="Interest Rate (% p.a.)"
            type="number"
            step="0.01"
            placeholder="10.5"
            icon={FiPercent}
            error={errorsLt.interestRate}
            {...registerLt('interestRate')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Min Amount (₹)"
              type="number"
              placeholder="10000"
              icon={FiDollarSign}
              error={errorsLt.minAmount}
              {...registerLt('minAmount')}
            />
            <Input
              label="Max Amount (₹)"
              type="number"
              placeholder="1000000"
              icon={FiDollarSign}
              error={errorsLt.maxAmount}
              {...registerLt('maxAmount')}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Min Tenure (Months)"
              type="number"
              placeholder="6"
              icon={FiClock}
              error={errorsLt.minTenureMonths}
              {...registerLt('minTenureMonths')}
            />
            <Input
              label="Max Tenure (Months)"
              type="number"
              placeholder="60"
              icon={FiClock}
              error={errorsLt.maxTenureMonths}
              {...registerLt('maxTenureMonths')}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setLoanTypeModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoanTypeSubmitting} icon={FiPlus}>
              {editingLoanType ? 'Save Changes' : 'Create Loan Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManagerDashboard;
