import api from './api';

export const kycService = {
  /**
   * Customer KYC submission / resubmission (PATCH /api/kyc)
   * @param {Object} data - { aadharNum, panNum }
   */
  async submitKyc(data) {
    const response = await api.patch('/api/kyc', data);
    return response.data;
  },

  /**
   * Customer KYC upload with files (POST /api/kyc/upload)
   * Uses multipart/form-data — pass a FormData object with aadharFile, panFile, selfie.
   * @param {FormData} formData
   */
  async uploadKyc(formData) {
    const response = await api.post('/api/kyc/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Fetch KYC applications by status (GET /api/kyc/status/{status})
   * @param {'PENDING'|'APPROVED'|'REJECTED'} status
   */
  async getKycByStatus(status = 'PENDING') {
    const response = await api.get(`/api/kyc/status/${status}`);
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  /**
   * Employee side KYC status update (PATCH /api/kyc/{id})
   * @param {number|string} id   - KYC record ID
   * @param {Object}        body - { status: 'APPROVED' | 'REJECTED', accountType: 'SAVINGS' | 'CURRENT' }
   */
  async updateKycStatus(id, body) {
    const payload = {
      accountType: body.accountType || 'SAVINGS',
      status: body.status || 'APPROVED',
    };
    const response = await api.patch(`/api/kyc/${id}`, payload);
    return response.data;
  },
};
