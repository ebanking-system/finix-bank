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
};
