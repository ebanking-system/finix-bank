import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import {
  FiCreditCard,
  FiPlusCircle,
  FiShield,
  FiCheckCircle,
  FiLock,
  FiRefreshCw,
  FiKey,
  FiEye,
  FiEyeOff,
  FiAlertTriangle,
  FiArrowRight,
} from 'react-icons/fi';
import { cardService } from '../../services/cardService';
import { accountService } from '../../services/accountService';
import { useAuth } from '../../context/AuthContext';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import Spinner from '../../components/common/Spinner';

const Cards = () => {
  const { userId } = useAuth();
  const [accountType, setAccountType] = useState('SAVINGS');
  const [cardType, setCardType] = useState('DEBIT');
  const [issuedCards, setIssuedCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Customer accounts check
  const [userAccounts, setUserAccounts] = useState([]);
  const [hasActiveAccount, setHasActiveAccount] = useState(true);

  // Pin update modal state
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [selectedCardForPin, setSelectedCardForPin] = useState(null);
  const [newPin, setNewPin] = useState('');
  const [pinSubmitting, setPinSubmitting] = useState(false);

  // CVV / PIN visibility state
  const [revealedCardId, setRevealedCardId] = useState(null);

  const fetchAccounts = async () => {
    try {
      if (userId) {
        const accs = await accountService.getCustomerAccounts(userId);
        const list = Array.isArray(accs) ? accs : accs?.data || [];
        setUserAccounts(list);
        const active = list.some((a) => a.status === 'ACTIVE');
        setHasActiveAccount(active);
      }
    } catch (e) {
      // Silent catch
    }
  };

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
      setIssuedCards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [userId]);

  useEffect(() => {
    fetchCardDetails(accountType);
  }, [accountType]);

  const handleIssueCard = async (e) => {
    e.preventDefault();
    if (!hasActiveAccount) {
      toast.warn('You need an active, KYC-verified bank account before you can request a card.');
      return;
    }

    setIsSubmitting(true);
    try {
      await cardService.addCard({ accountType, cardType });
      toast.success(`${cardType} card issued successfully for ${accountType} account!`);
      fetchCardDetails(accountType);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        (typeof error.response?.data === 'string' ? error.response.data : null) ||
        'Failed to issue card. Ensure you have an active account for this type.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePinUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4 || newPin.length > 6) {
      toast.error('PIN must be 4 to 6 digits');
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
      fetchCardDetails(accountType);
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
      <div className="space-y-6">
        {/* Precondition Alert if no active accounts */}
        {!hasActiveAccount && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
                <FiAlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-navy-900">Active Account Required for Card Issuance</h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  You currently do not have an active bank account. Please complete your KYC verification to activate your account before requesting cards.
                </p>
              </div>
            </div>
            <Link to="/customer/kyc">
              <Button variant="primary" size="sm" icon={FiArrowRight}>
                Submit KYC Now
              </Button>
            </Link>
          </div>
        )}

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
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        accountType === 'SAVINGS'
                          ? 'border-coral-500 bg-coral-50 text-coral-600 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      SAVINGS
                    </button>
                    <button
                      type="button"
                      onClick={() => setAccountType('CURRENT')}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        accountType === 'CURRENT'
                          ? 'border-coral-500 bg-coral-50 text-coral-600 shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      CURRENT
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    Card Variety
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setCardType('DEBIT')}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        cardType === 'DEBIT'
                          ? 'border-navy-900 bg-navy-900 text-white shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      DEBIT CARD
                    </button>
                    <button
                      type="button"
                      onClick={() => setCardType('CREDIT')}
                      className={`py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                        cardType === 'CREDIT'
                          ? 'border-navy-900 bg-navy-900 text-white shadow-xs'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
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
                    size="lg"
                    fullWidth
                    isLoading={isSubmitting}
                    disabled={!hasActiveAccount}
                    icon={FiPlusCircle}
                  >
                    Request {cardType} Card
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right Column: Issued Cards Display */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-navy-900">Your Active Cards</h2>
                <p className="text-xs text-slate-500">Linked to your {accountType} account</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                icon={FiRefreshCw}
                onClick={() => fetchCardDetails(accountType)}
                isLoading={loading}
              >
                Refresh
              </Button>
            </div>

            {loading ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <Spinner size="lg" className="text-coral-500" />
                <p className="text-xs text-slate-500">Checking card registry...</p>
              </div>
            ) : issuedCards.length === 0 ? (
              <div className="p-10 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <FiCreditCard className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-navy-900">No Cards Issued Yet</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Issue a zero-annual-fee debit or rewards credit card using the request panel on the left.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {issuedCards.map((c, idx) => {
                  const isRevealed = revealedCardId === (c.cardId || idx);
                  return (
                    <div
                      key={c.cardId || idx}
                      className="p-6 rounded-3xl bg-gradient-to-tr from-navy-950 via-navy-900 to-slate-900 text-white shadow-xl space-y-6 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-2">
                          <Badge variant={c.cardType || cardType}>{c.cardType || cardType}</Badge>
                          <Badge variant={c.status || 'ACTIVE'}>{c.status || 'ACTIVE'}</Badge>
                        </div>
                        <span className="text-xs font-mono tracking-widest text-slate-400">FINIX SECURE</span>
                      </div>

                      <div className="relative z-10 space-y-1">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Card Number</span>
                        <div className="text-xl sm:text-2xl font-mono font-extrabold tracking-widest">
                          {c.cardNum || '•••• •••• •••• 1234'}
                        </div>
                      </div>

                      <div className="flex items-end justify-between relative z-10 text-xs">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">Card Holder</span>
                          <span className="font-bold tracking-wider">{c.cardHolderName || 'VALUED CUSTOMER'}</span>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">Expires</span>
                            <span className="font-mono font-bold">
                              {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' }) : '12/29'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">CVV</span>
                            <span className="font-mono font-bold">{isRevealed ? c.cvv || '123' : '•••'}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => setRevealedCardId(isRevealed ? null : c.cardId || idx)}
                            className="p-2 rounded-xl bg-navy-800 text-slate-300 hover:text-white cursor-pointer"
                            title={isRevealed ? 'Hide details' : 'Show CVV & details'}
                          >
                            {isRevealed ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-navy-800 flex justify-end relative z-10">
                        <Button
                          variant="outline"
                          size="sm"
                          icon={FiKey}
                          onClick={() => {
                            setSelectedCardForPin(c);
                            setPinModalOpen(true);
                          }}
                          className="border-slate-700 text-white hover:bg-slate-800"
                        >
                          Change Security PIN
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* PIN Update Modal */}
      <Modal
        isOpen={pinModalOpen}
        onClose={() => setPinModalOpen(false)}
        title="Update Card Security PIN"
        subtitle="Set a new 4 to 6 digit ATM / POS security PIN."
      >
        <form onSubmit={handlePinUpdateSubmit} className="space-y-4">
          <Input
            label="New PIN (4-6 Digits)"
            type="password"
            placeholder="••••"
            maxLength={6}
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            icon={FiLock}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setPinModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={pinSubmitting} icon={FiCheckCircle}>
              Save New PIN
            </Button>
          </div>
        </form>
      </Modal>
    </CustomerLayout>
  );
};

export default Cards;
