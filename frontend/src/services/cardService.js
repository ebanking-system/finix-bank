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
   * Get cards by account type (SAVINGS | CURRENT)
   * @param {string} accountType
   */
  async getCard(accountType) {
    const response = await api.get(`/api/cards/get/${accountType}`);
    const resData = response.data?.data || response.data;
    return Array.isArray(resData) ? resData : resData ? [resData] : [];
  },

  /**
   * Toggle block/unblock for a card by card ID
   * @param {number|string} cardId
   */
  async toggleBlock(cardId) {
    const response = await api.patch(`/api/cards/${cardId}/toggle-block`);
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
   * Deactivate/Block card
   * @param {string} status - BLOCKED | ACTIVE
   * @param {string} accountType - SAVINGS | CURRENT
   * @param {string} cardType - DEBIT | CREDIT
   */
  async deactivateCard(status, accountType, cardType) {
    const response = await api.put('/api/cards/deactivate', null, {
      params: { status, accountType, cardType },
    });
    return response.data;
  },

  /**
   * Get all cards (Staff / Operations queue)
   */
  async getAllCards() {
    const response = await api.get('/api/cards/all');
    const resData = response.data?.data || response.data;
    return Array.isArray(resData) ? resData : [];
  },

  /**
   * Update card status (Staff / Manager)
   * @param {number|string} cardId
   * @param {string} status
   */
  async updateCardStatus(cardId, status) {
    const response = await api.patch(`/api/cards/${cardId}/status/${status}`);
    return response.data;
  },
};
