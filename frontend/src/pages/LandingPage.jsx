import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiCheckCircle,
  FiLock,
  FiCreditCard,
  FiZap,
  FiTrendingUp,
  FiShield,
  FiMail,
  FiKey,
  FiArrowRight,
} from 'react-icons/fi';
import { authService } from '../services/authService';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

// Yup Schema for Hero Quick Login Form
const loginSchema = yup.object().shape({
  email: yup.string().email('Enter a valid email address').required('Email is required'),
  password: yup.string().required('Password is required'),
});

const LandingPage = () => {
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

  const onQuickLoginSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await authService.signin(data);
      login(response);
      toast.success('Successfully logged in!');
      
      const role = response.userRole;
      if (role === 'CUSTOMER') navigate('/customer/dashboard');
      else if (role === 'EMPLOYEE') navigate('/employee/dashboard');
      else if (role === 'MANAGER') navigate('/manager/dashboard');
      else navigate('/login');
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      {/* Hero Section with Kotak811-style Card Overlay */}
      <section className="relative hero-gradient text-white overflow-hidden py-16 lg:py-24">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-coral-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 xl:col-span-7 space-y-8 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-navy-800/80 border border-navy-700 text-coral-400 text-xs font-semibold uppercase tracking-wider">
                <FiZap className="w-4 h-4 text-coral-400" />
                <span>Next-Generation Digital Banking</span>
              </div>

              {/* Bold 2-line Hero Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
                One bank account. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-coral-400 via-rose-300 to-slate-200">
                  Infinite possibilities.
                </span>
              </h1>

              <p className="text-lg text-slate-300 max-w-2xl font-normal leading-relaxed">
                Open a full-featured zero-balance digital savings account in under 3 minutes. Built with bank-grade security and instant 24/7 transfers.
              </p>

              {/* Feature Bullets */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-center gap-3 text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Zero balance requirement — No minimum balance fees</span>
                </div>

                <div className="flex items-center gap-3 text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">Instant 24/7 peer-to-peer & cross-account transfers</span>
                </div>

                <div className="flex items-center gap-3 text-slate-200">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <FiCheckCircle className="w-4 h-4" />
                  </div>
                  <span className="font-medium text-sm sm:text-base">100% paperless digital KYC verification</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-navy-800/80 flex items-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <FiLock className="text-emerald-400 w-4 h-4" />
                  <span>BCrypt & JWT Secured</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiShield className="text-coral-400 w-4 h-4" />
                  <span>Role-Based Access</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Auth Card (Kotak811 Style) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-100 text-slate-900 relative">
                
                {/* Floating Badge */}
                <div className="absolute -top-3.5 right-6 bg-gradient-to-r from-coral-500 to-rose-600 text-white text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                  Instant Access
                </div>

                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-navy-900">Welcome Back</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Sign in to manage your account, transfers, and loans.
                  </p>
                </div>

                <form onSubmit={handleSubmit(onQuickLoginSubmit)} className="space-y-4">
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
                    icon={FiKey}
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
                    New to Finix Bank?{' '}
                    <Link to="/signup" className="font-bold text-coral-500 hover:text-coral-600 hover:underline">
                      Open an Account
                    </Link>
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-xs font-bold text-coral-500 uppercase tracking-widest">Designed For Modern Life</h2>
            <p className="text-3xl font-extrabold text-navy-900 sm:text-4xl">
              Everything you need in a modern bank.
            </p>
            <p className="text-base text-slate-600">
              Powerful banking features crafted with simplicity, speed, and elegance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-lg transition-all duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-coral-500/10 text-coral-500 flex items-center justify-center group-hover:bg-coral-500 group-hover:text-white transition-colors">
                <FiZap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">Instant Transfers</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Send money to beneficiaries across any bank in seconds with immediate confirmation and zero transaction delays.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-lg transition-all duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-navy-900/10 text-navy-900 flex items-center justify-center group-hover:bg-navy-900 group-hover:text-white transition-colors">
                <FiCreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">Virtual & Debit Cards</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Issue virtual cards instantly for online purchases or order contactless physical debit cards with personalized spend limits.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/70 hover:shadow-lg transition-all duration-200 space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FiTrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-navy-900">Flexible Loans</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Apply for personal and business loans with transparent interest rates, instant approval tracking, and flexible EMI payments.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* Security CTA Banner */}
      <section id="security" className="py-16 bg-navy-900 text-white">
        <div className="max-w-[1600px] w-full mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-navy-800 text-coral-400 mx-auto flex items-center justify-center border border-navy-700">
            <FiShield className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold sm:text-4xl">Security you can bank on.</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-base">
            Your accounts and transactions are protected by salted BCrypt password hashing, signed JWT session tokens, and strict role-based access control.
          </p>
          <div className="pt-4">
            <Link to="/signup">
              <Button variant="primary" size="lg" icon={FiArrowRight} iconPosition="right">
                Get Started Today
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
