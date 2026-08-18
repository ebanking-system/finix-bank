import api from './api';

export const employeeService = {
  /**
   * Get all bank employees (Manager only)
   */
  async getAllEmployees() {
    const response = await api.get('/api/employees');
    return response.data?.data || response.data || [];
  },

  /**
   * Get employee by ID (Manager only)
   * @param {number|string} employeeId
   */
  async getEmployeeById(employeeId) {
    const response = await api.get(`/api/employees/${employeeId}`);
    return response.data?.data || response.data;
  },

  /**
   * Update employee department / designation assignment (Manager only)
   * @param {number|string} employeeId
   * @param {Object} data - { department, designation }
   */
  async updateEmployeeAssignment(employeeId, data) {
    const response = await api.patch(`/api/employees/${employeeId}/assignment`, data);
    return response.data?.data || response.data;
  },

  /**
   * Delete an employee (Manager only)
   * @param {number|string} employeeId
   */
  async deleteEmployee(employeeId) {
    const response = await api.delete(`/api/employees/${employeeId}`);
    return response.data?.data || response.data;
  },

  /**
   * Get current logged-in employee profile
   */
  async getMyProfile() {
    const response = await api.get('/api/employees/profile');
    return response.data?.data || response.data;
  },

  /**
   * Update current employee profile name
   * @param {Object} data - { firstName, middleName, lastName }
   */
  async updateMyProfile(data) {
    const response = await api.patch('/api/employees/profile', data);
    return response.data?.data || response.data;
  },

  /**
   * Upload profile photo for logged-in employee
   * @param {File} file
   */
  async uploadProfilePhoto(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/api/employees/profile/photo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data?.data || response.data;
  },

  /**
   * Change password for logged-in employee
   * @param {Object} data - { currentPassword, newPassword, confirmPassword }
   */
  async changePassword(data) {
    const response = await api.post('/api/employees/profile/change-password', data);
    return response.data;
  },

  /**
   * Construct URL to serve employee photo
   * @param {number|string} employeeId
   * @param {string} photoPath
   */
  getEmployeePhotoUrl(employeeId, photoPath) {
    if (!photoPath || !employeeId) return null;
    if (typeof photoPath === 'string' && (photoPath.startsWith('http://') || photoPath.startsWith('https://'))) {
      return photoPath;
    }
    const fileName = String(photoPath).replace(/\\/g, '/').split('/').pop();
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9090';
    return `${baseUrl}/api/employees/photo/${employeeId}/${fileName}`;
  },
};

