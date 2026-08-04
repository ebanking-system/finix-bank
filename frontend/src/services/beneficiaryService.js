import api from './api';

export const beneficiaryService = {
  /**
   * Add a new beneficiary
   * @param {Object} data - { beneficiaryName, accountNumber, ifscCode }
   */
  async addBeneficiary(data) {
    const response = await api.post('/api/beneficiary/add', data);
    return response.data;
  },

  /**
   * Get list of beneficiaries (defensively parsed)
   */
  async getBeneficiaries() {
    const response = await api.get('/api/beneficiary');
    const result = response.data?.data || response.data;
    return Array.isArray(result) ? result : [];
  },

  /**
   * Update beneficiary name using query parameter `?name=...`
   * @param {number|string} id
   * @param {string} name
   */
  async updateBeneficiaryName(id, name) {
    const response = await api.patch(`/api/beneficiary/${id}`, null, {
      params: { name },
    });
    return response.data;
  },

  /**
   * Delete beneficiary by ID
   * @param {number|string} id
   */
  async deleteBeneficiary(id) {
    const response = await api.delete(`/api/beneficiary/${id}`);
    return response;
  },
};
