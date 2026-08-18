import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import {
  FiUser,
  FiMail,
  FiBriefcase,
  FiShield,
  FiLock,
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiSave,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
} from 'react-icons/fi';
import { employeeService } from '../../services/employeeService';
import { useAuth } from '../../context/AuthContext';
import StaffLayout from '../../components/layout/StaffLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';

const EmployeeProfile = () => {
  const { userRole, userId } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Name Edit Form State
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Photo Upload State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoTimestamp, setPhotoTimestamp] = useState(Date.now());

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await employeeService.getMyProfile();
      const p = data?.data || data;
      setProfile(p);
      setFirstName(p.firstName || '');
      setMiddleName(p.middleName || '');
      setLastName(p.lastName || '');
    } catch (error) {
      toast.error('Failed to load employee profile details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!firstName.trim()) {
      toast.error('First name is required.');
      return;
    }

    setIsUpdatingProfile(true);
    try {
      const resp = await employeeService.updateMyProfile({
        firstName: firstName.trim(),
        middleName: middleName.trim() || null,
        lastName: lastName.trim() || null,
      });
      const updated = resp?.data || resp;
      setProfile((prev) => ({ ...prev, ...updated }));
      toast.success('Profile details updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update profile name.';
      toast.error(msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be under 5MB.');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const resp = await employeeService.uploadProfilePhoto(file);
      const updated = resp?.data || resp;
      setProfile((prev) => ({ ...prev, ...updated }));
      setPhotoTimestamp(Date.now());
      toast.success('Profile photo updated successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to upload photo.';
      toast.error(msg);
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Password Validation Rules
  const hasLength = newPassword.length >= 5 && newPassword.length <= 20;
  const hasDigit = /\d/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasSpecial = /[@$!%*?&#]/.test(newPassword);
  const isPasswordValid = hasLength && hasDigit && hasLower && hasSpecial;
  const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }

    if (!isPasswordValid) {
      toast.error('New password does not meet security requirements.');
      return;
    }

    if (!passwordsMatch) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const resp = await employeeService.changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      toast.success(resp?.message || resp?.data || 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      const msg =
        error.response?.data?.data ||
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to update password.';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const isManager = userRole === 'MANAGER';
  const rawPhotoUrl = employeeService.getEmployeePhotoUrl(profile?.employeeId, profile?.profilePhotoPath);
  const photoUrl = rawPhotoUrl ? `${rawPhotoUrl}?t=${photoTimestamp}` : null;

  const pageTitle = isManager ? 'Executive Manager Profile' : 'My Staff Profile';
  const pageSubtitle = isManager
    ? 'Manage your executive credentials, manager avatar photo, and account security credentials.'
    : 'Manage your personal details, profile picture, and account security credentials.';

  if (loading) {
    return (
      <StaffLayout title={pageTitle} subtitle="Loading profile information...">
        <div className="bg-white rounded-3xl p-12 border border-slate-200 shadow-xs text-center space-y-3">
          <Spinner size="lg" className="text-coral-500 mx-auto" />
          <p className="text-sm font-medium text-slate-600">Retrieving profile...</p>
        </div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout
      title={pageTitle}
      subtitle={pageSubtitle}
    >
      <div className="space-y-8">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar with Upload Trigger */}
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-navy-900 text-white flex items-center justify-center border-4 border-slate-100 shadow-md">
                {photoUrl ? (
                  <img
                    key={photoUrl}
                    src={photoUrl}
                    alt="Staff Avatar"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <span className="text-2xl font-extrabold text-coral-400">
                    {profile?.firstName ? profile.firstName[0] : isManager ? 'M' : 'S'}
                    {profile?.lastName ? profile.lastName[0] : ''}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute -bottom-2 -right-2 p-2 bg-coral-500 hover:bg-coral-600 text-white rounded-xl shadow-lg transition-all cursor-pointer"
                title="Change profile photo"
              >
                {isUploadingPhoto ? <Spinner size="sm" /> : <FiCamera className="w-4 h-4" />}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-navy-900">
                  {profile?.firstName} {profile?.middleName ? `${profile.middleName} ` : ''}{profile?.lastName}
                </h2>
                <Badge variant={isManager ? 'MANAGER' : (profile?.department || 'EMPLOYEE')}>
                  {isManager ? 'EXECUTIVE MANAGEMENT' : (profile?.department || 'OPERATIONS')}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Designation: <span className="font-semibold text-slate-700">{profile?.designation ? profile.designation.replace(/_/g, ' ') : userRole}</span>
              </p>
              <p className="text-xs text-slate-500">
                Staff ID: <span className="font-mono font-bold text-navy-900">#{profile?.employeeId || userId}</span>
              </p>
            </div>
          </div>

          <Button variant="outline" size="sm" icon={FiRefreshCw} onClick={fetchProfile}>
            Refresh Profile
          </Button>
        </div>

        {/* 2-Column Section: Personal Info & Password Change */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Personal Info (Editable Name + Read-Only Assignment) */}
          <div className="lg:col-span-6 space-y-6">
            <Card
              title="Personal Details"
              subtitle="Update your employee name. Department & designation assignments are managed by your Branch Manager."
            >
              <form onSubmit={handleUpdateName} className="space-y-4">
                <Input
                  label="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Rahul"
                  icon={FiUser}
                />

                <Input
                  label="Middle Name (Optional)"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  placeholder="e.g. Kumar"
                  icon={FiUser}
                />

                <Input
                  label="Last Name (Optional)"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Sharma"
                  icon={FiUser}
                />

                {/* Read-Only Fields */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Official Work Email (Read-Only)
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600 font-mono">
                      <FiMail className="w-4 h-4 text-slate-400" />
                      <span>{profile?.email || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Department (Read-Only)
                      </label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-navy-900">
                        {profile?.department || 'OPERATIONS'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                        Designation (Read-Only)
                      </label>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-navy-900">
                        {profile?.designation?.replace(/_/g, ' ') || 'STAFF'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isUpdatingProfile}
                    icon={FiSave}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Change Password */}
          <div className="lg:col-span-6 space-y-6">
            <Card
              title="Security & Password"
              subtitle="Update your employee portal login credentials."
            >
              <form onSubmit={handleChangePassword} className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Current Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:border-coral-500 focus:outline-hidden pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:border-coral-500 focus:outline-hidden pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Password Criteria Checklist */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <span className="font-semibold text-slate-600 block mb-1">Password Requirements:</span>
                  <div className={`flex items-center gap-1.5 ${hasLength ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <FiCheckCircle className="w-3.5 h-3.5" /> 5 to 20 characters
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasDigit ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <FiCheckCircle className="w-3.5 h-3.5" /> At least one number (0-9)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasLower ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <FiCheckCircle className="w-3.5 h-3.5" /> At least one lowercase letter (a-z)
                  </div>
                  <div className={`flex items-center gap-1.5 ${hasSpecial ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <FiCheckCircle className="w-3.5 h-3.5" /> At least one special symbol (@$!%*?&#)
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm focus:border-coral-500 focus:outline-hidden"
                  />
                  {confirmPassword && (
                    <p className={`text-xs mt-1 font-semibold ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                      {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    isLoading={isChangingPassword}
                    disabled={!isPasswordValid || !passwordsMatch || !currentPassword}
                    icon={FiLock}
                  >
                    Update Password
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default EmployeeProfile;
