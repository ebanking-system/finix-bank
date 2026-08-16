import axios from 'axios';
import { toast } from 'react-toastify';

// API Gateway runs on port 9090. All requests flow through the gateway.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Clear stored auth session tokens and notify React AuthContext
 */
export const clearAuthSession = () => {
  localStorage.removeItem('jwt');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userId');
  window.dispatchEvent(new CustomEvent('auth-unauthorized'));
};

// Request Interceptor: Attach JWT Token
// Skip attaching token for public auth routes (signin/signup) so a stale/expired
// JWT in localStorage does not cause the backend JWT filter to block these endpoints.
const PUBLIC_ROUTES = ['/api/auth/signin', '/api/auth/signup'];

api.interceptors.request.use(
  (config) => {
    const isPublicRoute = PUBLIC_ROUTES.some((route) => config.url?.includes(route));
    if (!isPublicRoute) {
      const token = localStorage.getItem('jwt');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & 401/403 Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    let message = 'An unexpected error occurred';
    if (typeof error.response?.data === 'string') {
      message = error.response.data;
    } else if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.response?.data?.data && typeof error.response.data.data === 'string') {
      message = error.response.data.data;
    } else if (error.message) {
      message = error.message;
    }

    if (status === 401) {
      clearAuthSession();
      toast.error('Your session expired. Please sign in again.');
    } else if (status === 403) {
      toast.error(message || 'Access forbidden.');
    } else if (status >= 500) {
      toast.error(message || 'Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;
