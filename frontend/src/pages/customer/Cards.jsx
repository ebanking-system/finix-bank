import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiCreditCard, FiPlusCircle, FiShield, FiCheckCircle, FiLock, FiRefreshCw, FiKey } from 'react-icons/fi';
import { cardService } from '../../services/cardService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';

const Cards = () => {
  const [accountType, setAccountType] = useState('SAVINGS');
  const [cardType, setCardType] = useState('DEBIT');
  const [issuedCards, setIssuedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pin update modal state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [selectedCardForPin, setSelectedCardForPin] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [pinSubmitting, setPinSubmitting] = useState(false);

  const fetchCardDetails = async (accType) => {
    setLoading(true);
    try {
      const data = await cardService.getCard(accType);
      if (data) {
        setIssuedCards(Array.isArray(data) ? data : [data]);
      } else {
        setIssuedCards([]);
      }
    } catch (error) {
      // 404 or missing card is normal if not issued yet
      setIssuedCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardDetails(accountType);
  }, [accountType]);

  const handleIssueCard = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await cardService.addCard({ accountType, cardType });
      toast.success(`${cardType} card issued successfully for ${accountType} account!`);
      fetchCardDetails(accountType);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to issue card. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!newPin || newPin.length !== 4) {
      toast.error('PIN must be exactly 4 digits');
      return;
    }

    setPinSubmitting(true);
    try {
      await cardService.updatePin({
        accountType: selectedCardForPin?.accountType || accountType,
        cardType: selectedCardForPin?.cardType || 'DEBIT',
        pin: newPin,
      });
      toast.success('Card PIN updated successfully!');
      setPinModalOpen(false);
      setNewPin('');
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update card PIN.';
      toast.error(msg);
    } finally {
      setPinSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Debit & Credit Cards"
      subtitle="Issue virtual or physical cards, view card details, and update security PINs."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Issue Card Form */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Issue New Card" subtitle="Select your linked account and card type.">
            <form onSubmit={handleIssueCard} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Linked Account Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAccountType('SAVINGS')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      accountType === 'SAVINGS'
                        ? 'border-coral-500 bg-coral-50 text-coral-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    SAVINGS
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('CURRENT')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      accountType === 'CURRENT'
                        ? 'border-coral-500 bg-coral-50 text-coral-600'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    CURRENT
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Card Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCardType('DEBIT')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      cardType === 'DEBIT'
                        ? 'border-navy-800 bg-navy-50 text-navy-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    DEBIT CARD
                  </button>
                  <button
                    type="button"
                    onClick={() => setCardType('CREDIT')}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                      cardType === 'CREDIT'
                        ? 'border-navy-800 bg-navy-50 text-navy-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    CREDIT CARD
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  isLoading={isSubmitting}
                  icon={FiPlusCircle}
                >
                  Confirm Card Issuance
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Right Column: Issued Cards Display */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
              <FiCreditCard className="text-coral-500" /> Active Cards ({issuedCards.length})
            </h2>
            <Button
              variant="outline"
              size="sm"
              icon={FiRefreshCw}
              onClick={() => fetchCardDetails(accountType)}
            >
              Refresh
            </Button>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
              <Spinner size="lg" className="text-coral-500" />
              <p className="text-xs font-medium text-slate-600">Fetching card details...</p>
            </div>
          ) : issuedCards.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <FiCreditCard className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-navy-900">No cards issued for {accountType} account.</p>
              <p className="text-xs text-slate-500">Use the form on the left to issue a new card.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {issuedCards.map((card, idx) => {
                const cardId = card.cardId || idx;
                return (
                  <div
                    key={cardId}
                    className="bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6 border border-navy-700/80 flex flex-col justify-between"
                  >
                    {/* Chip & Brand */}
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-7 rounded-md bg-amber-400/90 border border-amber-300/60 shadow-xs flex items-center justify-center">
                        <div className="w-6 h-4 border border-amber-600/40 rounded-xs" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={card.accountType || accountType}>
                          {card.accountType || accountType}
                        </Badge>
                        <span className="text-xs font-extrabold tracking-widest text-slate-300 uppercase">
                          {card.cardType || 'CARD'}
                        </span>
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="font-mono text-lg tracking-widest font-semibold text-slate-100">
                      {card.cardNum || card.cardNumber || '•••• •••• •••• 8910'}
                    </div>

                    {/* Card Holder & Expiry & Actions */}
                    <div className="space-y-3 pt-2 border-t border-navy-700/60">
                      <div className="flex items-center justify-between text-xs text-slate-300">
                        <div>
                          <span className="block text-[10px] uppercase text-slate-400">Card Holder</span>
                          <span className="font-semibold">{card.cardHolderName || 'VALUED CUSTOMER'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase text-slate-400">Expires</span>
                          <span className="font-semibold font-mono">
                            {card.expiryDate
                              ? new Date(card.expiryDate).toLocaleDateString('en-US', {
                                  month: '2-digit',
                                  year: '2-digit',
                                })
                              : card.expiry || '12/28'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCardForPin(card);
                            setPinModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-navy-800/90 hover:bg-coral-500 text-xs font-bold text-white transition-colors cursor-pointer flex items-center gap-1.5 border border-navy-700"
                        >
                          <FiKey className="w-3.5 h-3.5" /> Reset PIN
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* PIN Update Modal */}
      <Modal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        title="Update Card Security PIN"
        subtitle="Set a new 4-digit ATM/Transaction PIN for your card."
      >
        <form onSubmit={handlePinUpdateSubmit} className="space-y-4">
          <Input
            label="New 4-Digit PIN"
            type="password"
            maxLength={4}
            placeholder="1234"
            icon={FiLock}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setPinModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={pinSubmitting} icon={FiCheckCircle}>
              Update PIN
            </Button>
          </div>
        </form>
      </Modal>
    </CustomerLayout>
  );
};

export default Cards;
