import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

/**
 * Dedicated clean axios instance for auth endpoints (signin / signup).
 * No JWT interceptors — never attaches Authorization header.
 * A stale token in localStorage must never block public routes.
 */
const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const authService = {
  /**
   * User Signin
   * @param {Object} credentials - { email, password }
   * @returns {Promise<{ id: string|number, userRole: string, jwt: string }>}
   */
  async signin(credentials) {
    const response = await authApi.post('/api/auth/signin', credentials);
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
    const response = await authApi.post('/api/auth/signup', payload);
    return response.data;
  },
};
