import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const ExportHistoryModal = ({ isOpen, onClose }) => {
  const { showToast } = useAdmin();
  const [formData, setFormData] = useState({ dateRange: 'Last 30 Days', status: 'All', format: 'PDF' });

  const handleSubmit = (e) => {
    e.preventDefault();
    showToast(`Billing history exported as ${formData.format}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto max-w-md max-h-[85vh] bg-white shadow-2xl z-[120] flex flex-col rounded-[2.5rem] overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Export History</h2>
                  <p className="text-xs font-bold text-slate-500">Download billing records</p>
                </div>
                <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Date Range</label>
                  <select value={formData.dateRange} onChange={e => setFormData({...formData, dateRange: e.target.value})} className="input-field h-14 bg-slate-50 font-bold text-slate-700 border-none">
                    <option>Last 30 Days</option>
                    <option>Last 90 Days</option>
                    <option>This Year</option>
                    <option>All Time</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-field h-14 bg-slate-50 font-bold text-slate-700 border-none">
                    <option>All</option>
                    <option>Paid</option>
                    <option>Refunded</option>
                    <option>Failed</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Format</label>
                  <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} className="input-field h-14 bg-slate-50 font-bold text-slate-700 border-none">
                    <option>PDF</option>
                    <option>Excel (CSV)</option>
                    <option>JSON</option>
                  </select>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl shrink-0 flex items-center justify-center gap-2"><Download size={16} /> Export</button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default ExportHistoryModal;
