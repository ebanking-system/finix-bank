import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiPhone, FiMapPin, FiCheckCircle } from 'react-icons/fi';
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
  mobile: yup.string().matches(/^[0-9]{10}$/, 'Mobile must be 10 digits').required('Mobile is required'),
  address: yup.string().trim().required('Address is required'),
});

const CustProfile = () => {
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
      await customerService.updateProfile(data);
      toast.success('Profile updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Customer Profile"
      subtitle="View and update your personal details and contact information."
    >
      <div className="max-w-3xl space-y-6">
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Spinner size="lg" className="text-coral-500" />
            <p className="text-sm font-medium text-slate-600">Loading profile records...</p>
          </div>
        ) : (
          <Card title="Edit Personal Details" subtitle="PATCH /api/customers/profile">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input label="First Name" error={errors.firstName} {...register('firstName')} />
                <Input label="Middle Name" error={errors.middleName} {...register('middleName')} />
                <Input label="Last Name" error={errors.lastName} {...register('lastName')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Mobile Number" icon={FiPhone} error={errors.mobile} {...register('mobile')} />
                <Input label="Residential Address" icon={FiMapPin} error={errors.address} {...register('address')} />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSubmitting} icon={FiCheckCircle}>
                  Save Profile Changes
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustProfile;
