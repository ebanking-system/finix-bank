import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiLock,
  FiPhone,
  FiMapPin,
  FiCreditCard,
  FiCalendar,
  FiShield,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import { authService } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Select from '../components/common/Select';
import { ACCOUNT_TYPES } from '../services/accountTypes';

// Validation Schema matching backend AuthRequest & RegistrationDto requirements
const signupSchema = yup.object().shape({
  firstName: yup.string().trim().required('First name is required'),
  middleName: yup.string().trim().nullable(),
  lastName: yup.string().trim().required('Last name is required'),
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup
    .string()
    .matches(
      /^(?=.*\d)(?=.*[a-z])(?=.*[#@$*]).{5,20}$/,
      'Password must be 5-20 characters, with at least 1 digit, 1 lowercase letter, and 1 special symbol (#, @, $, *)'
    )
    .required('Password is required'),
  dob: yup.string().required('Date of birth is required'),
  mobile: yup
    .string()
    .matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits')
    .required('Mobile number is required'),
  address: yup.string().trim().required('Residential address is required'),
  aadharNum: yup
    .string()
    .matches(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits')
    .required('Aadhaar number is required'),
  panNum: yup
    .string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN format (e.g., ABCDE1234F)')
    .required('PAN number is required'),
  accountType: yup
    .string()
    .oneOf(Object.values(ACCOUNT_TYPES), 'Select a valid account type')
    .required('Account type is required'),
});

const Signup = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    defaultValues: {
      middleName: '',
      accountType: ACCOUNT_TYPES.SAVINGS,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        role: 'CUSTOMER', // Fixed customer role for public signup
      };
      const resp = await authService.signup(payload);
      if (resp?.status === 'Failure' || resp?.status === 'failure') {
        toast.error(resp?.data || resp?.message || 'Registration failed.');
        return;
      }
      toast.success('Registration successful! Please sign in to your new account.');
      navigate('/login');
    } catch (error) {
      let message = 'Registration failed. Please check your information and try again.';
      if (typeof error.response?.data === 'string') {
        message = error.response.data;
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.response?.data?.data && typeof error.response.data.data === 'string') {
        message = error.response.data.data;
      }
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 flex items-center justify-center text-white shadow-lg shadow-coral-500/30">
            <FiShield className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Open Your Digital Bank Account</h2>
        <p className="text-sm text-slate-500">
          Complete the form below to register your Finix Bank Customer Account
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100 sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Personal Details Section */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <FiUser className="text-coral-500" /> Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="First Name"
                  placeholder="John"
                  error={errors.firstName}
                  {...register('firstName')}
                />
                <Input
                  label="Middle Name"
                  placeholder="M."
                  error={errors.middleName}
                  {...register('middleName')}
                />
                <Input
                  label="Last Name"
                  placeholder="Doe"
                  error={errors.lastName}
                  {...register('lastName')}
                />
              </div>
            </div>

            {/* Account Type */}
            <Select
              label="Account Type"
              options={Object.entries(ACCOUNT_TYPES).map(([key, value]) => ({
                value,
                label: key.charAt(0) + key.slice(1).toLowerCase(),
              }))}
              error={errors.accountType}
              {...register('accountType')}
            />

            {/* Account Credentials */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <FiMail className="text-coral-500" /> Security Credentials
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="john.doe@example.com"
                  icon={FiMail}
                  error={errors.email}
                  {...register('email')}
                />
                <div>
                  <Input
                    label="Password"
                    type="password"
                    placeholder="••••••••"
                    icon={FiLock}
                    error={errors.password}
                    {...register('password')}
                  />
                  <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                    <FiInfo className="text-slate-400 shrink-0" />
                    5-20 chars: min. 1 digit, 1 lowercase letter, 1 special char (#, @, $, *)
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Address */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <FiPhone className="text-coral-500" /> Contact & Residence
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mobile Number (10 Digits)"
                  type="tel"
                  placeholder="9876543210"
                  icon={FiPhone}
                  error={errors.mobile}
                  {...register('mobile')}
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  icon={FiCalendar}
                  error={errors.dob}
                  {...register('dob')}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Residential Address"
                  placeholder="Street address, city, state, postal code"
                  icon={FiMapPin}
                  error={errors.address}
                  {...register('address')}
                />
              </div>
            </div>

            {/* Government Identification Details */}
            <div>
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider mb-4 border-b pb-2 flex items-center gap-2">
                <FiCreditCard className="text-coral-500" /> Identity Verification
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Aadhaar Number (12 Digits)"
                  placeholder="123456789012"
                  error={errors.aadharNum}
                  {...register('aadharNum')}
                />
                <Input
                  label="PAN Card Number (10 Chars)"
                  placeholder="ABCDE1234F"
                  className="uppercase"
                  error={errors.panNum}
                  {...register('panNum')}
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              icon={FiCheckCircle}
            >
              Complete Account Opening
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-coral-500 hover:text-coral-600 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
