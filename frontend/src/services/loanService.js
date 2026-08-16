import api from './api';

// TODO: replace with GET /api/loans/types once backend adds it

export const loanService = {
  /**
   * Customer apply for a loan
   * @param {Object} data - { loanTypeId, amount, tenureMonths }
   */
  async applyLoan(data) {
    const response = await api.post('/api/loans/apply', data);
    return response.data;
  },

  /**
   * Get loans applied by current customer
   */
  async getMyLoans() {
    const response = await api.get('/api/loans/my-loans');
    return response.data || [];
  },

  /**
   * Get all pending loan applications (Employee/Manager view)
   */
  async getPendingLoans() {
    const response = await api.get('/api/loans/pending');
    return response.data || [];
  },

  /**
   * Approve a loan by ID (Employee/Manager)
   * @param {number|string} loanId
   */
  async approveLoan(loanId) {
    const response = await api.put(`/api/loans/${loanId}/approve`);
    return response.data;
  },

  /**
   * Reject a loan with reason (Employee/Manager)
   * @param {number|string} loanId
   * @param {string} rejectionReason
   */
  async rejectLoan(loanId, rejectionReason) {
    const response = await api.put(`/api/loans/${loanId}/reject`, { rejectionReason });
    return response.data;
  },

  /**
   * Disburse loan funds (Employee/Manager)
   * @param {number|string} loanId
   */
  async disburseLoan(loanId) {
    const response = await api.put(`/api/loans/${loanId}/disburse`);
    return response.data;
  },

  /**
   * Get all loan applications across all statuses (Employee/Manager view)
   */
  async getAllLoans() {
    const response = await api.get('/api/loans/all');
    return response.data || [];
  },

  /**
   * Get loans filtered by status (Employee/Manager view)
   * @param {string} status - e.g. UNDER_REVIEW, APPROVED, REJECTED, ACTIVE, CLOSED, DEFAULTED
   */
  async getLoansByStatus(status) {
    const response = await api.get(`/api/loans/status/${status}`);
    return response.data || [];
  },

  /**
   * Update loan application parameters (Employee/Manager)
   * @param {number|string} loanId
   * @param {Object} data - { amount, tenureMonths, loanTypeId, status, rejectionReason }
   */
  async updateLoan(loanId, data) {
    const response = await api.put(`/api/loans/${loanId}`, data);
    return response.data;
  },

  /**
   * Get repayment schedule for a loan
   * @param {number|string} loanId
   */
  async getRepayments(loanId) {
    const response = await api.get(`/api/loans/${loanId}/repayments`);
    return response.data || [];
  },

  /**
   * Pay a loan repayment / EMI
   * @param {number|string} repaymentId
   * @param {'SAVINGS'|'CURRENT'} accountType
   */
  async payRepayment(repaymentId, accountType) {
    const response = await api.post(`/api/loans/repayments/${repaymentId}/pay`, { accountType });
    return response.data;
  },
};
