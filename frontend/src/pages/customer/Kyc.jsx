import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { FiUserCheck, FiShield, FiCreditCard, FiImage, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { kycService } from '../../services/kycService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const kycSchema = yup.object().shape({
  aadharNum: yup
    .string()
    .matches(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits')
    .required('Aadhaar number is required'),
  panNum: yup
    .string()
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Invalid PAN card format (e.g. ABCDE1234F)')
    .required('PAN card number is required'),
  selfImage: yup
    .string()
    .url('Please enter a valid image URL')
    .required('Self image photo URL is required'),
});

const Kyc = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(kycSchema),
    defaultValues: {
      selfImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const response = await kycService.submitKyc(data);
      const msg = typeof response === 'string' ? response : response?.message || 'KYC documents submitted successfully for bank verification!';
      toast.success(msg);
      setKycSubmitted(true);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit KYC documents.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Digital KYC Verification"
      subtitle="Submit or resubmit your identity documents for instant paperless account verification."
    >
      <div className="max-w-3xl space-y-6">
        {/* Status Alert Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <FiUserCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">Current Verification Status</h2>
              <p className="text-xs text-slate-500">
                {kycSubmitted
                  ? 'Your KYC documents have been submitted and are pending employee sign-off.'
                  : 'Submit your Aadhaar, PAN, and self-image to unlock account features.'}
              </p>
            </div>
          </div>
          <Badge variant={kycSubmitted ? 'PENDING' : 'PENDING'}>
            {kycSubmitted ? 'PENDING AUDIT' : 'ACTION REQUIRED'}
          </Badge>
        </div>

        {/* KYC Form Card */}
        <Card title="Submit Identity Documents" subtitle="Target endpoint: PATCH /api/kyc">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Aadhaar Number (12 Digits)"
              placeholder="123456789012"
              icon={FiCreditCard}
              error={errors.aadharNum}
              {...register('aadharNum')}
            />

            <Input
              label="PAN Card Number (10 Chars)"
              placeholder="ABCDE1234F"
              className="uppercase"
              icon={FiCreditCard}
              error={errors.panNum}
              {...register('panNum')}
            />

            <Input
              label="Self Image Photo URL"
              placeholder="https://example.com/my-photo.jpg"
              icon={FiImage}
              error={errors.selfImage}
              helperText="Provide a direct URL to your portrait photo for facial verification."
              {...register('selfImage')}
            />

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                isLoading={isSubmitting}
                icon={FiCheckCircle}
              >
                Submit KYC For Approval
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </CustomerLayout>
  );
};

export default Kyc;
