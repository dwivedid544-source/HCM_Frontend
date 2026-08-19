import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Clock, Users, Mail } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const ReportSchedulerModal = ({ isOpen, onClose }) => {
  const { addReportSchedule } = useAdmin();
  const [formData, setFormData] = useState({ name: '', frequency: 'Weekly', time: '09:00', recipients: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.recipients) return;
    addReportSchedule(formData);
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
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Calendar size={20} />
                  </div>
                  <div>
                     <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Schedule Report</h2>
                     <p className="text-xs font-bold text-slate-500">Automate report deliveries</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Job Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} type="text" placeholder="e.g., Weekly HR Sync" className="input-field h-14 bg-slate-50 shadow-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Frequency</label>
                  <select value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})} className="input-field h-14 bg-slate-50 font-bold border-none">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Bi-Weekly</option>
                    <option>Monthly</option>
                    <option>Quarterly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Delivery Time (Local)</label>
                  <div className="relative">
                     <Clock size={18} className="absolute left-4 top-4 text-slate-400" />
                     <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="input-field h-14 bg-slate-50 shadow-sm pl-12" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Recipients (Emails)</label>
                  <div className="relative">
                     <Mail size={18} className="absolute left-4 top-4 text-slate-400" />
                     <input required value={formData.recipients} onChange={e => setFormData({...formData, recipients: e.target.value})} type="text" placeholder="management@company.com" className="input-field h-14 bg-slate-50 shadow-sm pl-12" />
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
                <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100">Cancel</button>
                <button type="submit" className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl shrink-0 flex items-center justify-center gap-2">Save Schedule</button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default ReportSchedulerModal;
