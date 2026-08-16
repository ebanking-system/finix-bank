import api from './api';

export const accountService = {
  /**
   * Open a new bank account (SAVINGS or CURRENT)
   * Sends { accountType } JSON object matching CreateAccountRequest DTO.
   * @param {'SAVINGS'|'CURRENT'} accountType
   * @returns {Promise<{ status: number, data: any }>}
   */
  async openAccount(accountType) {
    const response = await api.post('/api/accounts', { accountType });
    return response;
  },

  /**
   * Get account details by account ID
   * @param {number|string} accountId
   */
  async getAccountById(accountId) {
    const response = await api.get(`/api/accounts/${accountId}`);
    return response.data?.data || response.data;
  },

  /**
   * Get account details by account number
   * @param {string} accountNumber
   */
  async getAccountByNumber(accountNumber) {
    const response = await api.get(`/api/accounts/number/${accountNumber}`);
    return response.data?.data || response.data;
  },

  /**
   * Get all accounts owned by a customer
   * @param {number|string} customerId
   */
  async getCustomerAccounts(customerId) {
    const response = await api.get(`/api/accounts/customer/${customerId}`);
    return response.data?.data || response.data || [];
  },

  /**
   * Get balance for account type (returns raw BigDecimal number/string)
   * @param {'SAVINGS'|'CURRENT'} accountType
   */
  async getAccountBalance(accountType) {
    const response = await api.get(`/api/accounts/balance`, {
      params: { accountType },
    });
    return response.data;
  },
};
