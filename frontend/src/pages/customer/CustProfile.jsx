import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiCheckCircle, FiShield } from 'react-icons/fi';
import { customerService } from '../../services/customerService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';

const profileSchema = yup.object().shape({
  firstName: yup.string().trim().required('First name is required'),
  middleName: yup.string().trim().nullable(),
  lastName: yup.string().trim().required('Last name is required'),
  mobile: yup.string().matches(/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits').required('Mobile is required'),
  address: yup.string().trim().required('Residential address is required'),
});

const CustProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
  });

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await customerService.getProfile();
      if (data) {
        setProfileData(data);
        setValue('firstName', data.firstName || '');
        setValue('middleName', data.middleName || '');
        setValue('lastName', data.lastName || '');
        setValue('mobile', data.mobile || '');
        setValue('address', data.address || '');
      }
    } catch (error) {
      toast.error('Failed to load profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const updated = await customerService.updateProfile(data);
      toast.success('Profile updated successfully!');
      if (updated) {
        setProfileData((prev) => ({ ...prev, ...updated }));
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="My Customer Profile"
      subtitle="View and update your personal details and contact information."
    >
      <div className="max-w-4xl space-y-6">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <Spinner size="lg" className="text-coral-500" />
            <p className="text-sm font-medium text-slate-600">Loading your profile details...</p>
          </div>
        ) : (
          <>
            {/* Account Overview Header */}
            {profileData && (
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-coral-500 to-coral-400 text-white flex items-center justify-center text-2xl font-black shadow-md shadow-coral-500/20">
                    {profileData.firstName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-navy-900">
                      {[profileData.firstName, profileData.middleName, profileData.lastName]
                        .filter(Boolean)
                        .join(' ')}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <FiMail className="text-slate-400" /> {profileData.email}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 text-xs">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Customer ID</span>
                    <span className="font-mono font-bold text-navy-900">#{profileData.customerId}</span>
                  </div>
                  {profileData.dob && (
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-2.5">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Date of Birth</span>
                      <span className="font-bold text-navy-900 flex items-center gap-1">
                        <FiCalendar className="text-slate-400" /> {profileData.dob}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Profile Edit Form */}
            <Card
              title="Personal Information"
              subtitle="Update your contact and residential address details."
            >
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    label="First Name"
                    placeholder="First Name"
                    error={errors.firstName}
                    {...register('firstName')}
                  />
                  <Input
                    label="Middle Name"
                    placeholder="Middle Name"
                    error={errors.middleName}
                    {...register('middleName')}
                  />
                  <Input
                    label="Last Name"
                    placeholder="Last Name"
                    error={errors.lastName}
                    {...register('lastName')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Mobile Phone (10 Digits)"
                    type="tel"
                    placeholder="9876543210"
                    icon={FiPhone}
                    error={errors.mobile}
                    {...register('mobile')}
                  />
                  <Input
                    label="Residential Address"
                    placeholder="Full residential address"
                    icon={FiMapPin}
                    error={errors.address}
                    {...register('address')}
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    * Identity details (PAN / Aadhaar) cannot be altered without KYC re-audit.
                  </span>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isSubmitting}
                    icon={FiCheckCircle}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustProfile;
