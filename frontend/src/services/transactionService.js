import api from './api';

export const transactionService = {
  /**
   * Perform money transfer
   * @param {Object} data - { accountType, toAccount, amount, referenceNumber, remarks }
   */
  async transferMoney(data) {
    const response = await api.post('/api/transaction', data);
    return response.data; // Plain string message response
  },

  /**
   * Get paginated & filterable transaction history
   * @param {Object} params - { page, size, sortBy, direction, nature, status, fromDate, toDate }
   */
  async getTransactions(params = {}) {
    const response = await api.get('/api/transaction', { params });
    return response.data;
  },
};
