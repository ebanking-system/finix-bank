import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FiCreditCard, FiPlusCircle, FiShield, FiCheckCircle, FiLock } from 'react-icons/fi';
import { cardService } from '../../services/cardService';
import CustomerLayout from '../../components/layout/CustomerLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

const Cards = () => {
  const [accountType, setAccountType] = useState('SAVINGS');
  const [cardType, setCardType] = useState('DEBIT');
  const [issuedCards, setIssuedCards] = useState([
    {
      id: 1,
      cardNumber: '4532 •••• •••• 8910',
      accountType: 'SAVINGS',
      cardType: 'DEBIT',
      holderName: 'VALUED CUSTOMER',
      expiry: '08/29',
    },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleIssueCard = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const response = await cardService.addCard({ accountType, cardType });
      toast.success(`${cardType} card issued successfully for ${accountType} account!`);

      // Append new card preview
      const newCard = {
        id: Date.now(),
        cardNumber: `4${Math.floor(1000 + Math.random() * 9000)} •••• •••• ${Math.floor(1000 + Math.random() * 9000)}`,
        accountType: response.accountType || accountType,
        cardType: response.cardType || cardType,
        holderName: 'VALUED CUSTOMER',
        expiry: '08/30',
      };
      setIssuedCards([newCard, ...issuedCards]);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to issue card. Please try again.';
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomerLayout
      title="Debit & Credit Cards"
      subtitle="Issue virtual or physical debit cards linked to your Savings/Current account."
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Issue Card Form */}
        <div className="lg:col-span-5">
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
          <h2 className="text-lg font-bold text-navy-900 flex items-center gap-2">
            <FiCreditCard className="text-coral-500" /> Active Cards ({issuedCards.length})
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {issuedCards.map((card) => (
              <div
                key={card.id}
                className="bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden space-y-6 border border-navy-700/80"
              >
                {/* Chip & Brand */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-7 rounded-md bg-amber-400/90 border border-amber-300/60 shadow-xs flex items-center justify-center">
                    <div className="w-6 h-4 border border-amber-600/40 rounded-xs" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={card.accountType}>{card.accountType}</Badge>
                    <span className="text-xs font-extrabold tracking-widest text-slate-300 uppercase">
                      {card.cardType}
                    </span>
                  </div>
                </div>

                {/* Card Number */}
                <div className="font-mono text-lg tracking-widest font-semibold text-slate-100">
                  {card.cardNumber}
                </div>

                {/* Card Holder & Expiry */}
                <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-navy-700/60">
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Card Holder</span>
                    <span className="font-semibold">{card.holderName}</span>
                  </div>
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400">Expires</span>
                    <span className="font-semibold font-mono">{card.expiry}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </CustomerLayout>
  );
};

export default Cards;
