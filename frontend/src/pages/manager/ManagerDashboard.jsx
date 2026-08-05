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
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
  FiBriefcase,
  FiList,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiPercent,
  FiDollarSign,
  FiClock,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { loanTypeService } from '../../services/loanTypeService';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

const addEmployeeSchema = yup.object().shape({
  firstName: yup.string().trim().required('First name is required'),
  middleName: yup.string().trim().nullable(),
  lastName: yup.string().trim().required('Last name is required'),
  email: yup.string().email('Valid email is required').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  dob: yup.string().required('Date of birth is required'),
  mobile: yup.string().matches(/^[0-9]{10}$/, '10-digit mobile number required').required('Mobile is required'),
  address: yup.string().trim().required('Address is required'),
  aadharNum: yup.string().matches(/^[0-9]{12}$/, '12-digit Aadhaar number required').required('Aadhaar is required'),
  panNum: yup.string().matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format').required('PAN is required'),
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
  const [activeTab, setActiveTab] = useState('loan-types'); // 'loan-types' | 'employees'

  // Employee form state
  const [isEmployeeSubmitting, setIsEmployeeSubmitting] = useState(false);
  const {
    register: registerEmp,
    handleSubmit: handleSubmitEmp,
    reset: resetEmp,
    formState: { errors: errorsEmp },
  } = useForm({
    resolver: yupResolver(addEmployeeSchema),
    defaultValues: { middleName: '' },
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
      toast.error('Failed to load loan products catalog.');
    } finally {
      setLoanTypesLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanTypes();
  }, []);

  const onAddEmployeeSubmit = async (data) => {
    setIsEmployeeSubmitting(true);
    try {
      const payload = { ...data, role: 'EMPLOYEE' };
      await authService.signup(payload);
      toast.success(`Employee ${data.firstName} ${data.lastName} successfully registered!`);
      resetEmp();
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
              Oversee bank operations, manage loan products catalog, and onboard bank employees.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex bg-navy-800/80 p-1.5 rounded-2xl border border-navy-700/80">
            <button
              onClick={() => setActiveTab('loan-types')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'loan-types'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FiList className="w-4 h-4" /> Loan Products Catalog
            </button>
            <button
              onClick={() => setActiveTab('employees')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'employees'
                  ? 'bg-coral-500 text-white shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <FiUserPlus className="w-4 h-4" /> Register Employee
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

        {/* TAB 2: Register Employee Form */}
        {activeTab === 'employees' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-md">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                  <FiUserPlus className="text-coral-500" /> Add New Bank Employee
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Register an employee account. Role is locked to <span className="font-semibold text-slate-700">EMPLOYEE</span>.
                </p>
              </div>
              <Badge variant="EMPLOYEE">Role Locked: EMPLOYEE</Badge>
            </div>

            <form onSubmit={handleSubmitEmp(onAddEmployeeSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="First Name" placeholder="Jane" error={errorsEmp.firstName} {...registerEmp('firstName')} />
                <Input label="Middle Name" placeholder="R." error={errorsEmp.middleName} {...registerEmp('middleName')} />
                <Input label="Last Name" placeholder="Smith" error={errorsEmp.lastName} {...registerEmp('lastName')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Work Email" type="email" placeholder="jane.smith@finixbank.com" icon={FiMail} error={errorsEmp.email} {...registerEmp('email')} />
                <Input label="Initial Password" type="password" placeholder="••••••••" icon={FiLock} error={errorsEmp.password} {...registerEmp('password')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Mobile Number" type="tel" placeholder="9876543210" icon={FiPhone} error={errorsEmp.mobile} {...registerEmp('mobile')} />
                <Input label="Date of Birth" type="date" icon={FiCalendar} error={errorsEmp.dob} {...registerEmp('dob')} />
              </div>

              <Input label="Residential Address" placeholder="Address lines" icon={FiMapPin} error={errorsEmp.address} {...registerEmp('address')} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Aadhaar Number (12 Digits)" placeholder="123456789012" error={errorsEmp.aadharNum} {...registerEmp('aadharNum')} />
                <Input label="PAN Card Number" placeholder="ABCDE1234F" className="uppercase" error={errorsEmp.panNum} {...registerEmp('panNum')} />
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
