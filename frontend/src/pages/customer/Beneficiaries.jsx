import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import {
  FiUsers,
  FiUserPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiCreditCard,
  FiCheckCircle,
  FiInfo,
} from 'react-icons/fi';
import { beneficiaryService } from '../../services/beneficiaryService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';

// Yup Schema for Add Beneficiary
const addBeneficiarySchema = yup.object().shape({
  beneficiaryName: yup.string().trim().required('Beneficiary name is required'),
  accountNumber: yup.string().trim().required('Account number is required'),
  ifscCode: yup.string().trim().required('IFSC code is required'),
});

const Beneficiaries = () => {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  const [editName, setEditName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(addBeneficiarySchema),
  });

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const data = await beneficiaryService.getBeneficiaries();
      console.log('Fetched beneficiaries:', data);
      // API may return array directly or an object with a beneficiaries field
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.beneficiaries)
        ? data.beneficiaries
        : [];
      setBeneficiaries(list);
    } catch (error) {
      toast.error('Could not fetch beneficiaries list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const onAddSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await beneficiaryService.addBeneficiary(data);
      toast.success('Beneficiary added successfully!');
      setAddModalOpen(false);
      reset();
      fetchBeneficiaries();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to add beneficiary.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      toast.error('Name cannot be empty.');
      return;
    }
    setIsSubmitting(true);
    try {
      await beneficiaryService.updateBeneficiaryName(selectedBeneficiary.id, editName);
      toast.success('Beneficiary name updated successfully!');
      setEditModalOpen(false);
      fetchBeneficiaries();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update beneficiary name.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onDeleteConfirm = async () => {
    if (!selectedBeneficiary) return;
    setIsSubmitting(true);
    try {
      await beneficiaryService.deleteBeneficiary(selectedBeneficiary.id);
      toast.success('Beneficiary removed successfully.');
      setDeleteModalOpen(false);
      fetchBeneficiaries();
    } catch (error) {
      toast.error('Failed to delete beneficiary.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Saved Beneficiaries"
      subtitle="Add and manage payee accounts for fast, one-click fund transfers."
    >
      <div className="space-y-6">
        {/* Header Control */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div>
            <h2 className="text-lg font-bold text-navy-900">Registered Beneficiaries</h2>
            <p className="text-xs text-slate-500">
              Easily manage trusted payees for IMPS/NEFT/RTGS transfers.
            </p>
          </div>
          <Button variant="primary" icon={FiUserPlus} onClick={() => setAddModalOpen(true)}>
            Add New Beneficiary
          </Button>
        </div>

        {/* Info Box */}
        <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl text-xs text-sky-800 flex items-start gap-3">
          <FiInfo className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Beneficiary additions take effect instantly. Verify the account number and IFSC code carefully before confirming transactions.
          </p>
        </div>

        {/* Beneficiaries List */}
        {loading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
            <Spinner size="lg" className="text-coral-500" />
            <p className="text-sm font-medium text-slate-600">Loading saved beneficiaries...</p>
          </div>
        ) : beneficiaries.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <FiUsers className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-navy-900">No beneficiaries found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                You haven't saved any payee accounts yet. Click below to add a beneficiary.
              </p>
            </div>
            <Button variant="primary" icon={FiUserPlus} onClick={() => setAddModalOpen(true)}>
              Add Your First Beneficiary
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beneficiaries.map((b) => (
              <Card
                key={b.id ?? b.beneficiaryId}
                title={b.beneficiaryName}
                subtitle={`Account: ${b.accountNumber}`}
                action={
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSelectedBeneficiary(b);
                        setEditName(b.beneficiaryName);
                        setEditModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-navy-900 hover:bg-slate-100 transition-colors"
                      title="Edit Name"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedBeneficiary(b);
                        setDeleteModalOpen(true);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete Beneficiary"
                    >
                      <FiTrash2 className="w-4 h-4" />
                    </button>
                  </div>
                }
              >
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">IFSC Code</span>
                    <span className="font-mono font-bold text-navy-900">{b.ifscCode}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Account Number</span>
                    <span className="font-mono font-bold text-navy-900">{b.accountNumber}</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add Beneficiary Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add New Beneficiary"
        subtitle="Enter the payee's bank details."
      >
        <form onSubmit={handleSubmit(onAddSubmit)} className="space-y-4">
          <Input
            label="Beneficiary Full Name"
            placeholder="e.g. Rahul Sharma"
            error={errors.beneficiaryName}
            {...register('beneficiaryName')}
          />
          <Input
            label="Account Number"
            placeholder="e.g. 100293847561"
            icon={FiCreditCard}
            error={errors.accountNumber}
            {...register('accountNumber')}
          />
          <Input
            label="IFSC Code"
            placeholder="e.g. FINIX000101"
            className="uppercase"
            error={errors.ifscCode}
            {...register('ifscCode')}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting} icon={FiUserPlus}>
              Save Beneficiary
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Beneficiary Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Beneficiary Name"
        subtitle={`Updating name for Account #${selectedBeneficiary?.accountNumber}`}
      >
        <form onSubmit={onEditSubmit} className="space-y-4">
          <Input
            label="New Beneficiary Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="Enter updated name"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isSubmitting}>
              Update Name
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Beneficiary Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Remove Beneficiary"
        subtitle="Are you sure you want to remove this payee?"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            You are about to delete <span className="font-bold text-navy-900">{selectedBeneficiary?.beneficiaryName}</span> (Account #{selectedBeneficiary?.accountNumber}). This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onDeleteConfirm} isLoading={isSubmitting} icon={FiTrash2}>
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </CustomerLayout>
  );
};

export default Beneficiaries;
