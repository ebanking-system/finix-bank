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
};
