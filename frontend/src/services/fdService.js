import api from './api';

export const fdService = {
  /**
   * Create a new Fixed Deposit
   * @param {Object} data - { accountType, depositAmount, tenureYears }
   */
  async createFD(data) {
    const payload = {
      accountType: data.accountType,
      depositAmount: Number(data.depositAmount),
      tenureYears: data.tenureYears || data.tenure,
    };
    const response = await api.post('/api/fd/create', payload);
    return response.data;
  },

  /**
   * Fetch Fixed Deposits for linked account type
   * @param {'SAVINGS'|'CURRENT'} accountType
   */
  async getFDDetails(accountType = 'SAVINGS') {
    const response = await api.get(`/api/fd/get/${accountType}`);
    return Array.isArray(response.data) ? response.data : response.data?.data || [];
  },

  /**
   * Fetch all Fixed Deposits across all customers (Staff / Management queue)
   */
  async getAllFDs() {
    const response = await api.get('/api/fd/all');
    const resData = response.data?.data || response.data;
    return Array.isArray(resData) ? resData : [];
  },
};
