import api from './api';

/**
 * Loan Type Service — CRUD for loan product types (Manager only).
 * Base path: /api/loan-types
 */
export const loanTypeService = {
  /**
   * Get all available loan types
   */
  async getAllLoanTypes() {
    const response = await api.get('/api/loan-types');
    return response.data?.data || response.data || [];
  },

  /**
   * Get a single loan type by ID
   * @param {number|string} loanTypeId
   */
  async getLoanTypeById(loanTypeId) {
    const response = await api.get(`/api/loan-types/${loanTypeId}`);
    return response.data?.data || response.data;
  },

  /**
   * Create a new loan type (Manager)
   * @param {Object} data - { typeName, description, interestRate, maxAmount, minAmount, maxTenureMonths }
   */
  async createLoanType(data) {
    const response = await api.post('/api/loan-types', data);
    return response.data;
  },

  /**
   * Update a loan type (Manager)
   * @param {number|string} loanTypeId
   * @param {Object} data
   */
  async updateLoanType(loanTypeId, data) {
    const response = await api.put(`/api/loan-types/${loanTypeId}`, data);
    return response.data;
  },

  /**
   * Delete a loan type (Manager)
   * @param {number|string} loanTypeId
   */
  async deleteLoanType(loanTypeId) {
    const response = await api.delete(`/api/loan-types/${loanTypeId}`);
    return response.data;
  },
};
