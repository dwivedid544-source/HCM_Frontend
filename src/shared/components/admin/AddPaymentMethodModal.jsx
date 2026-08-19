import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, Shield, CheckCircle2, Loader2 } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { cn } from '../../../utils/cn';

const AddPaymentMethodModal = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useAdmin();
  const [name, setName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0); // 0 = Idle, 1 = Verifying, 2 = Success

  // Helper to detect card type
  const getCardType = (num) => {
    const cleanNum = num.replace(/\D/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (cleanNum.match(/^(5[1-5]|2[2-7])/)) return 'Mastercard';
    if (cleanNum.match(/^3[47]/)) return 'AMEX';
    return 'CreditCard';
  };

  const cardType = getCardType(cardNumber);

  // Helper to format card number
  const handleCardNumberChange = (e) => {
    const input = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < input.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) formatted += ' ';
      formatted += input[i];
    }
    setCardNumber(formatted);
  };

  // Helper to format expiry date (MM/YY)
  const handleExpiryChange = (e) => {
    let input = e.target.value.replace(/\D/g, '');
    if (input.length > 4) input = input.substring(0, 4);
    
    if (input.length > 2) {
      setExpiry(`${input.substring(0, 2)}/${input.substring(2)}`);
    } else {
      setExpiry(input);
    }
  };

  // Helper to format CVC
  const handleCvcChange = (e) => {
    const input = e.target.value.replace(/\D/g, '').substring(0, cardType === 'AMEX' ? 4 : 3);
    setCvc(input);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || cardNumber.length < 19 || expiry.length < 5 || cvc.length < 3) {
      showToast('Please fill out all fields correctly', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStep(1); // Verifying

    // Step-based submission simulation for a premium feel
    setTimeout(() => {
      setSubmitStep(2); // Success
      setTimeout(() => {
        const last4 = cardNumber.slice(-4);
        onSuccess({
          type: cardType === 'CreditCard' ? 'Visa' : cardType,
          last4,
          expiry,
          cardholder: name
        });
        showToast('Payment method added successfully!', 'success');
        
        // Reset states
        setName('');
        setCardNumber('');
        setExpiry('');
        setCvc('');
        setSubmitStep(0);
        setIsSubmitting(false);
        onClose();
      }, 1000);
    }, 1800);
  };

  // Dynamic card backdrop gradients based on card type
  const getCardBg = () => {
    if (cardType === 'Visa') return 'bg-gradient-to-br from-blue-700 via-indigo-800 to-indigo-950 text-white';
    if (cardType === 'Mastercard') return 'bg-gradient-to-br from-amber-600 via-rose-700 to-amber-950 text-white';
    if (cardType === 'AMEX') return 'bg-gradient-to-br from-teal-600 via-cyan-800 to-emerald-950 text-white';
    return 'bg-gradient-to-br from-slate-800 via-slate-900 to-black text-white';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={!isSubmitting ? onClose : null}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-full max-w-lg max-h-[95vh] bg-white shadow-2xl z-[120] flex flex-col rounded-[2.5rem] overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <CreditCard size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">Add Payment Method</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Configure credit or debit cards</p>
                </div>
              </div>
              {!isSubmitting && (
                <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {submitStep > 0 ? (
                <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                  {submitStep === 1 ? (
                    <>
                      <Loader2 size={64} className="text-indigo-600 animate-spin mb-6" />
                      <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">Verifying Card Details</h3>
                      <p className="text-sm font-medium text-slate-500 max-w-xs">Connecting securely to authorization gateway to confirm account status...</p>
                    </>
                  ) : (
                    <>
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-6"
                      >
                        <CheckCircle2 size={36} />
                      </motion.div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">Authorization Confirmed!</h3>
                      <p className="text-sm font-medium text-slate-500">Your card has been verified and registered as the default method.</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  {/* Visual Card Preview */}
                  <div className={cn("w-full aspect-[1.586/1] rounded-[2rem] p-6 flex flex-col justify-between shadow-xl transition-all duration-700 relative overflow-hidden", getCardBg())}>
                    <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
                    
                    {/* Chip and Type */}
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-2">
                        {/* Chip */}
                        <div className="w-10 h-8 bg-amber-400/80 rounded-md border border-amber-300/40 relative overflow-hidden">
                          <div className="absolute inset-x-2 inset-y-1 border border-amber-600/30 rounded-sm grid grid-cols-3 gap-0.5">
                            <div className="border-r border-b border-amber-600/20" />
                            <div className="border-r border-b border-amber-600/20" />
                            <div className="border-b border-amber-600/20" />
                          </div>
                        </div>
                      </div>
                      <div className="font-extrabold italic text-lg tracking-tight">
                        {cardType === 'CreditCard' ? 'CARD' : cardType.toUpperCase()}
                      </div>
                    </div>

                    {/* Card Number */}
                    <div className="my-auto">
                      <p className="text-xl font-mono tracking-[0.18em] font-medium leading-none">
                        {cardNumber || '•••• •••• •••• ••••'}
                      </p>
                    </div>

                    {/* Bottom Info */}
                    <div className="flex justify-between items-end">
                      <div className="max-w-[70%]">
                        <p className="text-[8px] font-bold text-white/50 font-bold leading-none mb-1">Card Holder</p>
                        <p className="text-sm font-bold tracking-tight uppercase truncate">
                          {name || 'YOUR NAME HERE'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-bold text-white/50 font-bold leading-none mb-1">Expires</p>
                        <p className="text-sm font-bold font-mono tracking-wider">
                          {expiry || 'MM/YY'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Form fields */}
                  <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Cardholder Name</label>
                      <input
                        type="text"
                        placeholder="John Wick"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="input-field h-12 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 text-sm font-bold w-full"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Card Number</label>
                      <input
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        className="input-field h-12 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 text-sm font-mono tracking-wider w-full"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Expiry Date</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={handleExpiryChange}
                          className="input-field h-12 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 text-sm font-mono tracking-wider w-full"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">CVC</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cvc}
                          onChange={handleCvcChange}
                          className="input-field h-12 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 text-sm font-mono tracking-wider w-full"
                          required
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2.5">
                        <Shield className="text-slate-400" size={16} />
                        <span className="text-xs font-bold text-slate-700">Set as default payment method</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 border-slate-200 focus:ring-indigo-500"
                        disabled={isSubmitting}
                      />
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Footer */}
            {submitStep === 0 && (
              <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  Save Method
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddPaymentMethodModal;
