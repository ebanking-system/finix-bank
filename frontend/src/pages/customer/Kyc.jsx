import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiUserCheck,
  FiShield,
  FiCreditCard,
  FiCheckCircle,
  FiUploadCloud,
  FiFileText,
  FiArrowRight,
  FiAlertTriangle,
  FiCheck,
  FiEye,
} from 'react-icons/fi';
import { kycService } from '../../services/kycService';
import { accountService } from '../../services/accountService';
import { useAuth } from '../../context/AuthContext';
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
});

const Kyc = () => {
  const { userId } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [kycSubmitted, setKycSubmitted] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(true);

  // File upload state
  const [aadharFile, setAadharFile] = useState(null);
  const [panFile, setPanFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);

  // Previews
  const [aadharPreview, setAadharPreview] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(kycSchema),
    defaultValues: {
      aadharNum: '',
      panNum: '',
    },
  });

  useEffect(() => {
    const checkCustomerStatus = async () => {
      try {
        if (userId) {
          const accounts = await accountService.getCustomerAccounts(userId);
          const accList = Array.isArray(accounts) ? accounts : accounts?.data || [];
          const hasActiveAccount = accList.some((acc) => acc.status === 'ACTIVE');
          if (hasActiveAccount) {
            setIsApproved(true);
          }
        }
      } catch (err) {
        // Silent catch
      } finally {
        setLoadingStatus(false);
      }
    };

    checkCustomerStatus();
  }, [userId]);

  const handleFileChange = (file, setter, previewSetter) => {
    setter(file);
    if (file && file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      previewSetter(url);
    } else {
      previewSetter(null);
    }
  };

  const onSubmit = async (data) => {
    if (!aadharFile || !panFile || !selfieFile) {
      toast.error('Please upload all 3 required documents: Aadhaar Card, PAN Card, and Selfie Portrait.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload files via multipart/form-data POST /api/kyc/upload
      const formData = new FormData();
      formData.append('aadharFile', aadharFile);
      formData.append('panFile', panFile);
      formData.append('selfie', selfieFile);

      await kycService.uploadKyc(formData);

      // 2. Also ensure latest Aadhaar and PAN numbers are updated via PATCH /api/kyc
      if (data.aadharNum && data.panNum) {
        await kycService.submitKyc({
          aadharNum: data.aadharNum,
          panNum: data.panNum,
        });
      }

      toast.success('KYC documents submitted successfully! Your account will be activated once verified.');
      setKycSubmitted(true);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to submit KYC documents. Please check file format.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Digital KYC Verification"
      subtitle="Upload government-issued identity documents to complete verification and activate your accounts."
    >
      <div className="max-w-3xl space-y-6">
        {/* Status Alert Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isApproved
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : kycSubmitted
                  ? 'bg-blue-500/10 text-blue-600'
                  : 'bg-amber-500/10 text-amber-600'
              }`}
            >
              {isApproved ? (
                <FiCheckCircle className="w-6 h-6" />
              ) : (
                <FiUserCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-navy-900">
                {isApproved
                  ? 'KYC Verification Approved'
                  : kycSubmitted
                  ? 'KYC Under Review'
                  : 'Action Required: Submit KYC Documents'}
              </h2>
              <p className="text-xs text-slate-500">
                {isApproved
                  ? 'Your identity is fully verified. All account features and transfers are active.'
                  : kycSubmitted
                  ? 'Your document images have been submitted and are pending review by a KYC Officer.'
                  : 'Upload your Aadhaar card photo, PAN card photo, and a portrait selfie to verify your identity.'}
              </p>
            </div>
          </div>
          <Badge variant={isApproved ? 'ACTIVE' : kycSubmitted ? 'PENDING' : 'CLOSED'}>
            {isApproved ? 'VERIFIED' : kycSubmitted ? 'UNDER REVIEW' : 'KYC PENDING'}
          </Badge>
        </div>

        {isApproved ? (
          <Card title="Account Verification Complete">
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <FiCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">You're All Set!</h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your KYC identity verification is complete and your bank accounts are active. You can now perform wire transfers, manage cards, and open fixed deposits.
              </p>
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/customer/dashboard')}
                  icon={FiArrowRight}
                >
                  Return to Dashboard
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          /* KYC Upload Form Card */
          <Card
            title="Upload Verification Documents"
            subtitle="Upload clear, legible photos or scans of your identification documents (JPG, PNG, or PDF)."
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Identity Numbers Confirmation */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiCreditCard className="text-coral-500" /> Identity Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Aadhaar Card Number (12 Digits)"
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
                </div>
              </div>

              {/* Document Files Section */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                  <FiUploadCloud className="text-coral-500" /> Document Files (3 Required)
                </h3>

                {/* 1. Aadhaar Card Upload */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      1. Aadhaar Card Photo / Document *
                    </label>
                    {aadharFile && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <FiCheckCircle /> Selected: {aadharFile.name}
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleFileChange(e.target.files[0], setAadharFile, setAadharPreview)
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-coral-500/10 file:text-coral-600 hover:file:bg-coral-500/20 cursor-pointer"
                  />
                  {aadharPreview && (
                    <div className="mt-2">
                      <img
                        src={aadharPreview}
                        alt="Aadhaar Preview"
                        className="h-24 w-auto rounded-lg border border-slate-300 object-cover shadow-xs"
                      />
                    </div>
                  )}
                </div>

                {/* 2. PAN Card Upload */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      2. PAN Card Photo / Document *
                    </label>
                    {panFile && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <FiCheckCircle /> Selected: {panFile.name}
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={(e) =>
                      handleFileChange(e.target.files[0], setPanFile, setPanPreview)
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-coral-500/10 file:text-coral-600 hover:file:bg-coral-500/20 cursor-pointer"
                  />
                  {panPreview && (
                    <div className="mt-2">
                      <img
                        src={panPreview}
                        alt="PAN Preview"
                        className="h-24 w-auto rounded-lg border border-slate-300 object-cover shadow-xs"
                      />
                    </div>
                  )}
                </div>

                {/* 3. Selfie Portrait Upload */}
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-800">
                      3. Portrait Selfie / Face Photo *
                    </label>
                    {selfieFile && (
                      <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                        <FiCheckCircle /> Selected: {selfieFile.name}
                      </span>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleFileChange(e.target.files[0], setSelfieFile, setSelfiePreview)
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-coral-500/10 file:text-coral-600 hover:file:bg-coral-500/20 cursor-pointer"
                  />
                  {selfiePreview && (
                    <div className="mt-2">
                      <img
                        src={selfiePreview}
                        alt="Selfie Preview"
                        className="h-24 w-24 rounded-full border-2 border-coral-400 object-cover shadow-xs"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <FiShield className="text-emerald-500" /> 256-Bit Encrypted Secure Storage
                </p>
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
        )}
      </div>
    </CustomerLayout>
  );
};

export default Kyc;
