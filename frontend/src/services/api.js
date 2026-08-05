import axios from 'axios';
import { toast } from 'react-toastify';

// API Gateway runs on port 9090. All requests flow through the gateway.
// To configure via env: create .env.development with VITE_API_BASE_URL=http://localhost:9090
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Response Interceptor: Global Error Handling & 401 Handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.response?.data || error.message || 'An unexpected error occurred';

    if (status === 401) {
      localStorage.removeItem('jwt');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userId');

      // Dispatch custom auth-unauthorized event so AuthContext handles redirect gracefully
      window.dispatchEvent(new CustomEvent('auth-unauthorized'));
      toast.error('Session expired or unauthorized. Please sign in again.');
    } else if (status === 403) {
      toast.error('Access forbidden. You do not have permission for this resource.');
    } else if (status >= 500) {
      toast.error('Server error. Please try again later.');
    }

    return Promise.reject(error);
  }
);

export default api;
