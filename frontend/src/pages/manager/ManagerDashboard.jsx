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
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { loanTypeService } from '../../services/loanTypeService';
import { employeeService } from '../../services/employeeService';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

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
  const [activeTab, setActiveTab] = useState('loan-types'); // 'loan-types' | 'employee-roster' | 'register-employee'

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
    setValue: setValueLt,
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
    fetchLoanTypes();
    fetchEmployees();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Manager Header */}
        <div className="bg-navy-900 text-white p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="MANAGER">MANAGER PORTAL</Badge>
              <span className="text-xs text-slate-400">Manager ID: #{userId}</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Executive Management Console</h1>
            <p className="text-sm text-slate-300 mt-1">
              Oversee bank operations, manage loan products catalog, and handle staff assignments.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap bg-navy-800/80 p-1.5 rounded-2xl border border-navy-700/80 gap-1">
            <button
              onClick={() => setActiveTab('loan-types')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'loan-types'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FiList className="w-4 h-4" /> Loan Products
            </button>
            <button
              onClick={() => setActiveTab('employee-roster')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'employee-roster'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FiUsers className="w-4 h-4" /> Staff Roster ({employees.length})
            </button>
            <button
              onClick={() => setActiveTab('register-employee')}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'register-employee'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FiUserPlus className="w-4 h-4" /> Onboard Staff
            </button>
          </div>
        </div>

        {/* TAB 1: Loan Types Catalog CRUD */}
        {activeTab === 'loan-types' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
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

        {/* TAB 2: Employee Roster & Assignment Manager */}
        {activeTab === 'employee-roster' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md space-y-6">
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

        {/* TAB 3: Register Employee Form */}
        {activeTab === 'register-employee' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
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

            <form onSubmit={handleSubmitEmp(onAddEmployeeSubmit)} className="space-y-6 max-w-2xl">
              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="First Name" placeholder="Jane" error={errorsEmp.firstName} {...registerEmp('firstName')} />
                <Input label="Middle Name (Optional)" placeholder="R." error={errorsEmp.middleName} {...registerEmp('middleName')} />
                <Input label="Last Name" placeholder="Smith" error={errorsEmp.lastName} {...registerEmp('lastName')} />
              </div>

              {/* Account Credentials */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Work Email" type="email" placeholder="jane.smith@finixbank.com" icon={FiMail} error={errorsEmp.email} {...registerEmp('email')} />
                <div>
                  <Input label="Initial Password" type="password" placeholder="••••••••" icon={FiLock} error={errorsEmp.password} {...registerEmp('password')} />
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <FiInfo className="text-slate-400 shrink-0" />
                    5-20 chars: min 1 digit, 1 lowercase letter, 1 special symbol (#, @, $, *)
                  </p>
                </div>
              </div>

              {/* Department & Designation Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Assigned Department
                  </label>
                  <select
                    {...registerEmp('department')}
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
                    Official Designation
                  </label>
                  <select
                    {...registerEmp('designation')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
                  >
                    {DESIGNATIONS.map((des) => (
                      <option key={des} value={des}>
                        {des.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <Button type="submit" variant="primary" size="lg" isLoading={isEmployeeSubmitting} icon={FiBriefcase}>
                  Register Bank Employee
                </Button>
              </div>
            </form>
          </div>
        )}
      </main>

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
