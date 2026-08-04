import api from './api';

export const kycService = {
  /**
   * Customer KYC submission / resubmission (PATCH /api/kyc)
   * @param {Object} data - { aadharNum, panNum, selfImage }
   */
  async submitKyc(data) {
    const response = await api.patch('/api/kyc', data);
    return response.data;
  },

  /**
   * Customer KYC upload with files (POST /api/kyc/upload)
   * Uses multipart/form-data — pass a FormData object as `data`.
   * @param {FormData} formData
   */
  async uploadKyc(formData) {
    const response = await api.post('/api/kyc/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  /**
   * Employee/Manager side KYC status update (PATCH /api/kyc/{id})
   * @param {number|string} id   - KYC record ID
   * @param {Object}        body - { status: 'APPROVED' | 'REJECTED', remarks? }
   */
  async updateKycStatus(id, body) {
    const response = await api.patch(`/api/kyc/${id}`, body);
    return response.data;
  },
};
