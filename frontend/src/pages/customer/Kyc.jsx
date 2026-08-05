import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiUserCheck,
  FiShield,
  FiCreditCard,
  FiImage,
  FiCheckCircle,
  FiUploadCloud,
  FiFileText,
} from 'react-icons/fi';
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
  selfImage: yup.string().url('Please enter a valid image URL').optional(),
});

const Kyc = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);

  // File upload state
  const [aadharFile, setAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('files'); // 'files' | 'urls'

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
      if (uploadMode === 'files') {
        if (!aadharFile || !panFile || !selfieFile) {
          toast.error('Please upload all required files (Aadhaar Card, PAN Card, and Selfie Photo).');
          setIsSubmitting(false);
          return;
        }

        const formData = new FormData();
        formData.append('aadharFile', aadharFile);
        formData.append('panFile', panFile);
        formData.append('selfie', selfieFile);

        const response = await kycService.uploadKyc(formData);
        const msg = response?.message || 'KYC document files uploaded successfully for verification!';
        toast.success(msg);
        setKycSubmitted(true);
      } else {
        const response = await kycService.submitKyc({
          aadharNum: data.aadharNum,
          panNum: data.panNum,
          selfImage: data.selfImage,
        });
        const msg = typeof response === 'string' ? response : response?.message || 'KYC documents submitted successfully!';
        toast.success(msg);
        setKycSubmitted(true);
      }
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
      subtitle="Submit or upload your identity documents for instant paperless account verification."
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
                  : 'Upload your Aadhaar, PAN, and selfie photo to complete verification.'}
              </p>
            </div>
          </div>
          <Badge variant={kycSubmitted ? 'PENDING' : 'PENDING'}>
            {kycSubmitted ? 'PENDING AUDIT' : 'ACTION REQUIRED'}
          </Badge>
        </div>

        {/* KYC Form Card */}
        <Card
          title="Submit Identity Documents"
          subtitle="Choose between uploading file documents or supplying digital credentials."
        >
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setUploadMode('files')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                uploadMode === 'files'
                  ? 'bg-white text-navy-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiUploadCloud className="w-4 h-4 text-coral-500" /> Direct File Upload (Recommended)
            </button>
            <button
              type="button"
              onClick={() => setUploadMode('urls')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                uploadMode === 'urls'
                  ? 'bg-white text-navy-900 shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FiFileText className="w-4 h-4 text-coral-500" /> Number & Image URL Entry
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {uploadMode === 'files' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Aadhaar Card Document (PDF/JPG/PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setAadharFile(e.target.files[0])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
                  />
                  {aadharFile && (
                    <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Selected: {aadharFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    PAN Card Document (PDF/JPG/PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) => setPanFile(e.target.files[0])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
                  />
                  {panFile && (
                    <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Selected: {panFile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Selfie Portrait Photo (JPG/PNG)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelfieFile(e.target.files[0])}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-coral-500"
                  />
                  {selfieFile && (
                    <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Selected: {selfieFile.name}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
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
              </div>
            )}

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
