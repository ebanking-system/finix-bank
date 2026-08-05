import api from './api';

export const cardService = {
  /**
   * Issue / Add a new debit or credit card
   * @param {Object} data - { accountType, cardType }
   */
  async addCard(data) {
    const response = await api.post('/api/cards/add', data);
    return response.data;
  },

  /**
   * Get card by account type (SAVINGS | CURRENT)
   * @param {string} accountType
   */
  async getCard(accountType) {
    const response = await api.get(`/api/cards/get/${accountType}`);
    return response.data;
  },

  /**
   * Update PIN for card
   * @param {Object} data - { accountType, cardType, pin }
   */
  async updatePin(data) {
    const response = await api.patch('/api/cards/pinUpdate', data);
    return response.data;
  },

  /**
   * Deactivate card
   * @param {string} status - INACTIVE
   * @param {string} accountType - SAVINGS | CURRENT
   * @param {string} cardType - DEBIT | CREDIT
   */
  async deactivateCard(status, accountType, cardType) {
    const response = await api.put('/api/cards/deactivate', status, {
      params: { accountType, cardType },
    });
    return response.data;
  },
};
