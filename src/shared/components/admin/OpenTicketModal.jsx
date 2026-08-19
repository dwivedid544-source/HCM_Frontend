import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, CheckCircle2, Loader2, Info, Paperclip, AlertOctagon } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { cn } from '../../../utils/cn';

const OpenTicketModal = ({ isOpen, onClose }) => {
  const { showToast } = useAdmin();
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Invoice Issue');
  const [priority, setPriority] = useState('Medium');
  const [description, setDescription] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState(0); // 0 = Idle, 1 = Submitting, 2 = Success
  const [ticketId, setTicketId] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAttachmentName(e.target.files[0].name);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!subject || !description) {
      showToast('Please fill out Subject and Description', 'error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStep(1); // Submitting

    const randomTkt = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    setTicketId(randomTkt);

    setTimeout(() => {
      setSubmitStep(2); // Success
      setTimeout(() => {
        showToast(`Billing support ticket ${randomTkt} submitted successfully!`, 'success');
        
        // Reset states
        setSubject('');
        setCategory('Invoice Issue');
        setPriority('Medium');
        setDescription('');
        setAttachmentName('');
        setSubmitStep(0);
        setIsSubmitting(false);
        onClose();
      }, 1200);
    }, 1800);
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
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-full max-w-xl max-h-[95vh] bg-white shadow-2xl z-[120] flex flex-col rounded-[2.5rem] overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Mail size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">Billing Support Desk</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Open a ticket with our billing desk</p>
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
                      <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">Submitting Support Request</h3>
                      <p className="text-sm font-medium text-slate-500 max-w-xs">Creating secure dispatch with ID and uploading files to support dashboard...</p>
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
                      <h3 className="text-lg font-bold text-slate-900 mb-2 dark:text-white">Ticket Successfully Created!</h3>
                      <p className="text-sm font-medium text-slate-500 mb-1">Your ticket identifier is <span className="font-extrabold text-slate-900">{ticketId}</span>.</p>
                      <p className="text-xs font-bold text-slate-400 max-w-xs">A support representative from our billing desk will respond via your administrator email within 2 hours.</p>
                    </>
                  )}
                </div>
              ) : (
                <>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Category & Priority Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 font-bold block mb-2">Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="input-field h-12 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 text-xs font-bold w-full bg-white"
                          disabled={isSubmitting}
                        >
                          <option>Invoice Issue</option>
                          <option>Custom Purchase Order</option>
                          <option>Tax-Exemption Setup</option>
                          <option>Subscription Query</option>
                          <option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 font-bold block mb-2">Priority</label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="input-field h-12 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 text-xs font-bold w-full bg-white"
                          disabled={isSubmitting}
                        >
                          <option>Low</option>
                          <option>Medium</option>
                          <option>High</option>
                          <option>Critical</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Ticket Subject</label>
                      <input
                        type="text"
                        placeholder="Requesting custom PO generation for next cycle"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="input-field h-12 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 text-sm font-bold w-full"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Description & Notes</label>
                      <textarea
                        rows={4}
                        placeholder="Please describe your billing request in detail..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="input-field py-3 border border-slate-200 focus:border-indigo-500 rounded-xl px-4 text-sm font-medium w-full resize-none"
                        required
                        disabled={isSubmitting}
                      />
                    </div>

                    {/* File Attachment Area */}
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Attach Document (Optional)</label>
                      <label className="border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 transition-colors">
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                        />
                        <Paperclip size={20} className="text-slate-400" />
                        <span className="text-xs font-bold text-slate-600">
                          {attachmentName ? attachmentName : 'Upload tax certificates or contract drafts'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">Accepts PDF, JPG, PNG or DOCX up to 10MB</span>
                      </label>
                    </div>

                    <div className="flex gap-2.5 p-4 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-100 text-xs font-medium leading-relaxed">
                      <Info size={16} className="shrink-0 mt-0.5" />
                      <p>Opening a ticket automatically bundles your active workspace configuration, licensing limits, and billing records to help resolve questions efficiently.</p>
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
                  className="flex-1 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"
                  disabled={isSubmitting}
                >
                  Submit Ticket
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OpenTicketModal;
