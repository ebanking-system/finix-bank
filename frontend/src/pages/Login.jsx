import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiShield, FiArrowRight } from 'react-icons/fi';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const loginSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const Login = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await authService.signin(data);
      if (!response || !response.jwt) {
        toast.error('Authentication failed. No token received.');
        return;
      }

      login(response);
      toast.success('Successfully logged in!');

      const role = response.userRole;
      if (role === 'CUSTOMER') {
        navigate('/customer/dashboard');
      } else if (role === 'EMPLOYEE') {
        navigate('/employee/dashboard');
      } else if (role === 'MANAGER') {
        navigate('/manager/dashboard');
      } else {
        navigate('/');
      }
    } catch (error) {
      let message = 'Invalid email or password. Please try again.';
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
    <div className="min-h-screen flex flex-col justify-center bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-coral-500 flex items-center justify-center text-white shadow-lg shadow-coral-500/30">
            <FiShield className="w-7 h-7" />
          </div>
        </Link>
        <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">Sign in to Finix Bank</h2>
        <p className="text-sm text-slate-500">
          Access your digital banking portal securely
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-3xl border border-slate-100 sm:px-10">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              icon={FiMail}
              error={errors.email}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={FiLock}
              error={errors.password}
              {...register('password')}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
              icon={FiArrowRight}
              iconPosition="right"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-600">
              New here?{' '}
              <Link to="/signup" className="font-bold text-coral-500 hover:text-coral-600 hover:underline">
                Open a new account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
