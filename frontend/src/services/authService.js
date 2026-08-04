import api from './api';

export const authService = {
  /**
   * User Signin
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ id: string|number, userRole: string, jwt: string }>}
   */
  async signin(credentials) {
    const response = await api.post('/users/signin', credentials);
    return response.data;
  },

  /**
   * User Signup
   * @param {Object} formData - Form input values
   * @returns {Promise<Object>} ApiResponse
   */
  async signup(formData) {
    const { password, ...rest } = formData;
    const payload = {
      ...rest,
      passwordHash: password, // Backend expects passwordHash key
    };
    const response = await api.post('/users/signup', payload);
    return response.data;
  },
};
