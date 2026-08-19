import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Download } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const AuditArchiveModal = ({ isOpen, onClose }) => {
  const { showToast } = useAdmin();
  const [formData, setFormData] = useState({
    dateRange: 'This Year',
    policyType: 'All',
    format: 'PDF',
    includeAttachments: false
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    showToast('Audit Archive regeneration initiated!', 'success');
    setTimeout(() => {
        showToast('Audit Archive is ready for download.', 'success');
        onClose();
    }, 1500);
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[120] overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-600">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Archive</h2>
                  <p className="text-xs font-medium text-slate-500">Generate compliance activity reports</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-8 space-y-6 flex flex-col">
              <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Date Range</label>
                    <select value={formData.dateRange} onChange={e => setFormData({...formData, dateRange: e.target.value})} className="input-field h-12 w-full bg-slate-50 text-sm font-bold text-slate-700 border-none">
                        <option>This Month</option>
                        <option>Last Quarter</option>
                        <option>This Year</option>
                        <option>All Time</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Policy Type</label>
                        <select value={formData.policyType} onChange={e => setFormData({...formData, policyType: e.target.value})} className="input-field h-12 w-full bg-slate-50 text-sm font-bold border-none">
                            <option>All Types</option>
                            <option>HR</option>
                            <option>Legal</option>
                            <option>Security</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Export Format</label>
                        <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} className="input-field h-12 w-full bg-slate-50 text-sm font-bold border-none">
                            <option>PDF Document</option>
                            <option>Excel / CSV</option>
                        </select>
                    </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                   <input type="checkbox" id="attachments" checked={formData.includeAttachments} onChange={e => setFormData({...formData, includeAttachments: e.target.checked})} className="w-5 h-5 rounded cursor-pointer accent-primary-600" />
                   <label htmlFor="attachments" className="text-sm font-bold text-slate-600 cursor-pointer">Include signed PDF attachments</label>
                </div>
              </div>

              <div className="flex gap-4 pt-6 mt-auto">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100">Cancel</button>
                <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg flex justify-center items-center gap-2">
                    <Download size={16} fill="currentColor" /> Generate Archive
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuditArchiveModal;
