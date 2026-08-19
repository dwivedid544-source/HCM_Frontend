import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

const CalendarModal = ({ isOpen, onClose }) => {
  const { createCalendar, showToast } = useAdmin();
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Calendar name is required.', 'error');
      return;
    }
    
    createCalendar({ name, timezone, description });
    
    // Reset form
    setName('');
    setTimezone('UTC');
    setDescription('');
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
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <Calendar size={20} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 leading-none dark:text-white">
                    Add Work Calendar
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1.5 leading-none">
                    Create a new schedule
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Calendar Name</label>
                  <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. US Shift Calendar"
                    className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Timezone</label>
                  <select 
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                  >
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">EST (America/New_York)</option>
                    <option value="America/Los_Angeles">PST (America/Los_Angeles)</option>
                    <option value="Europe/London">GMT (Europe/London)</option>
                    <option value="Asia/Kolkata">IST (Asia/Kolkata)</option>
                    <option value="Asia/Singapore">SGT (Asia/Singapore)</option>
                    <option value="Australia/Sydney">AEST (Australia/Sydney)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Description</label>
                  <textarea 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description about this calendar..."
                    className="input-field min-h-[80px] py-3 bg-slate-50 border-transparent font-medium text-slate-700 w-full resize-none"
                  />
                </div>
              </div>
              
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all shadow-sm text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95 text-sm"
                >
                  Create Calendar
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CalendarModal;
