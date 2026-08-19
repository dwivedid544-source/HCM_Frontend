import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Globe2, Zap } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import DatePicker from '../../../shared/components/common/DatePicker';

const HolidayModal = ({ isOpen, onClose, holidayToEdit }) => {
  const { addHoliday, updateHoliday } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    date: '',
    type: 'Public',
    region: 'All Regions',
    repeat: false,
    description: '',
    status: 'Upcoming'
  });

  useEffect(() => {
    if (holidayToEdit) {
      setFormData(holidayToEdit);
    } else {
      setFormData({
        name: '',
        date: '',
        type: 'Public',
        region: 'All Regions',
        repeat: false,
        description: '',
        status: 'Upcoming'
      });
    }
  }, [holidayToEdit, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (holidayToEdit) {
      updateHoliday(holidayToEdit.id, formData);
    } else {
      // Basic check for status based on date
      const hDate = new Date(formData.date);
      const isPassed = hDate < new Date();
      addHoliday({ ...formData, status: isPassed ? 'Passed' : 'Upcoming' });
    }
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-6">
                  <Calendar size={22} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">
                    {holidayToEdit ? 'Edit Holiday' : 'Add Global Holiday'}
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">
                    Schedule workforce pause
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="flex-1 p-10 space-y-10">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Holiday Name</label>
                    <input 
                      required
                      type="text" 
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Lunar New Year" 
                      className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700" 
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Execution Date</label>
                      <DatePicker required
                         
                        value={formData.date}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Holiday Type</label>
                      <select 
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                      >
                        <option>Public</option>
                        <option>Regional</option>
                        <option>Company Holiday</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Impacted Region</label>
                    <div className="relative">
                      <Globe2 className="absolute left-4 top-4 text-slate-300" size={18} />
                      <select 
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="input-field h-14 pl-12 bg-slate-50 border-transparent font-bold text-slate-700"
                      >
                        <option>All Regions</option>
                        <option>Global-US East</option>
                        <option>APAC-India</option>
                        <option>Europe</option>
                      </select>
                    </div>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 border-dashed space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Zap size={18} className="text-amber-500 fill-amber-500" />
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Repeat Annually</span>
                      </div>
                      <input 
                        type="checkbox" 
                        checked={formData.repeat}
                        onChange={(e) => setFormData({...formData, repeat: e.target.checked})}
                        className="w-5 h-5 rounded-lg accent-primary-600 cursor-pointer" 
                      />
                    </div>
                    <p className="text-[10px] font-medium text-slate-400 tracking-tight leading-relaxed italic">
                      Enabling this will automatically recreate this holiday entry for future years based on the selected date pattern.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center gap-4 shrink-0">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95"
                >
                  Save Holiday
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default HolidayModal;
