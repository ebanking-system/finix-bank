import api from './api';

export const fdService = {
  /**
   * Create a new Fixed Deposit
   * @param {Object} data - { accountType, depositAmount, tenure }
   */
  async createFD(data) {
    const response = await api.post('/fd', data);
    return response.data;
  },
};
