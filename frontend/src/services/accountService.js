import api from './api';

export const accountService = {
  /**
   * Open a new bank account (SAVINGS or CURRENT) with optional initial deposit
   * @param {'SAVINGS'|'CURRENT'} accountType
   * @param {number} [initialDeposit=0]
   * @returns {Promise<{ status: number, data: any }>}
   */
  async openAccount(accountType, initialDeposit = 0) {
    const payload = {
      accountType,
      initialDeposit: initialDeposit > 0 ? Number(initialDeposit) : 0,
    };
    const response = await api.post('/api/accounts', payload);
    return response;
  },

  /**
   * Self-service customer deposit / add funds
   * @param {Object} data - { accountType, accountNumber, amount, paymentMethod, referenceNumber, remarks }
   */
  async depositSelf(data) {
    const payload = {
      accountType: data.accountType,
      accountNumber: data.accountNumber,
      amount: Number(data.amount),
      paymentMethod: data.paymentMethod || 'UPI',
      referenceNumber: data.referenceNumber,
      remarks: data.remarks,
    };
    const response = await api.post('/api/accounts/deposit', payload);
    return response.data;
  },

  /**
   * Staff / Teller-assisted deposit for customer account
   * @param {Object} data - { accountNumber, amount, depositType, referenceNumber, depositorName, remarks }
   */
  async depositEmployee(data) {
    const payload = {
      accountNumber: data.accountNumber,
      amount: Number(data.amount),
      depositType: data.depositType || 'CASH',
      referenceNumber: data.referenceNumber,
      depositorName: data.depositorName,
      remarks: data.remarks,
    };
    const response = await api.post('/api/accounts/employee/deposit', payload);
    return response.data;
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
