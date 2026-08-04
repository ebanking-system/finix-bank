import api from './api';

export const customerService = {
  /**
   * Get authenticated customer profile
   */
  async getProfile() {
    const response = await api.get('/api/customers/profile');
    return response.data?.data || response.data;
  },

  /**
   * Update customer profile
   * @param {Object} data - { firstName, middleName, lastName, mobile, address }
   */
  async updateProfile(data) {
    const response = await api.patch('/api/customers/profile', data);
    return response.data?.data || response.data;
  },
};
