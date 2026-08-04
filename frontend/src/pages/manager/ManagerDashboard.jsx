import React, { useState } from 'react';
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
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import Navbar from '../../components/common/Navbar';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

// TODO(security): backend needs to restrict role field on signup or split into a manager-only endpoint
// Note: The backend currently does not enforce server-side that only a manager can POST /users/signup with role: EMPLOYEE.
// Hiding this form inside the Manager Dashboard is a UX/navigation control, not a strict security boundary.

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

const ManagerDashboard = () => {
  const { userId } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addEmployeeSchema),
    defaultValues: {
      middleName: '',
    },
  });

  const onAddEmployeeSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Role is pre-set / locked to EMPLOYEE. Manager cannot choose MANAGER role.
      const payload = {
        ...data,
        role: 'EMPLOYEE',
      };
      await authService.signup(payload);
      toast.success(`Employee ${data.firstName} ${data.lastName} successfully registered!`);
      reset();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to register employee. Please check inputs.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
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
              Oversee bank operations, review queue stats, and onboard new bank employees.
            </p>
          </div>
        </div>

        {/* Section: Add Employee Form */}
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

          <form onSubmit={handleSubmit(onAddEmployeeSubmit)} className="space-y-6">
            {/* Name Details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input label="First Name" placeholder="Jane" error={errors.firstName} {...register('firstName')} />
              <Input label="Middle Name" placeholder="R." error={errors.middleName} {...register('middleName')} />
              <Input label="Last Name" placeholder="Smith" error={errors.lastName} {...register('lastName')} />
            </div>

            {/* Account Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Work Email" type="email" placeholder="jane.smith@finixbank.com" icon={FiMail} error={errors.email} {...register('email')} />
              <Input label="Initial Password" type="password" placeholder="••••••••" icon={FiLock} error={errors.password} {...register('password')} />
            </div>

            {/* Contact & Date of Birth */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Mobile Number" type="tel" placeholder="9876543210" icon={FiPhone} error={errors.mobile} {...register('mobile')} />
              <Input label="Date of Birth" type="date" icon={FiCalendar} error={errors.dob} {...register('dob')} />
            </div>

            {/* Address */}
            <Input label="Residential Address" placeholder="Address lines" icon={FiMapPin} error={errors.address} {...register('address')} />

            {/* Govt IDs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Aadhaar Number (12 Digits)" placeholder="123456789012" error={errors.aadharNum} {...register('aadharNum')} />
              <Input label="PAN Card Number" placeholder="ABCDE1234F" className="uppercase" error={errors.panNum} {...register('panNum')} />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} icon={FiBriefcase}>
                Register Bank Employee
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ManagerDashboard;
