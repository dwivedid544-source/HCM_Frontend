import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarDays } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

const WeekendRuleModal = ({ isOpen, onClose, selectedCalendarId, setSelectedCalendarId }) => {
  const { calendars, updateCalendar, showToast } = useAdmin();
  const [localCalendarId, setLocalCalendarId] = useState(selectedCalendarId || '');
  const [dayOfWeek, setDayOfWeek] = useState('SATURDAY');
  const [type, setType] = useState('FULL_DAY');

  // Update local state when prop changes
  React.useEffect(() => {
    if (isOpen) {
      setLocalCalendarId(selectedCalendarId || '');
    }
  }, [isOpen, selectedCalendarId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!localCalendarId) {
      showToast('Please select a calendar first.', 'error');
      return;
    }
    
    const cal = calendars.find(c => c.id === localCalendarId);
    if (!cal) return;

    const activeVersion = cal?.versions?.[0];
    const existingWeekends = activeVersion?.weekends || [];
    
    if (existingWeekends.some(w => w.dayOfWeek === dayOfWeek)) {
      showToast(`${dayOfWeek} is already added as a weekend rule.`, 'error');
      return;
    }

    const newWeekends = [...existingWeekends, { dayOfWeek, type }];
    updateCalendar(localCalendarId, { weekends: newWeekends.map(w => ({ dayOfWeek: w.dayOfWeek, type: w.type })) });
    
    if (setSelectedCalendarId) {
      setSelectedCalendarId(localCalendarId);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-md max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                  <CalendarDays size={20} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 leading-none dark:text-white">
                    Add Weekend Rule
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1.5 leading-none">
                    Configure Non-Working Days
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
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Work Calendar</label>
                  <select 
                    value={localCalendarId}
                    onChange={(e) => setLocalCalendarId(e.target.value)}
                    className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                  >
                    <option value="">-- Select Calendar --</option>
                    {calendars?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Day of Week</label>
                  <select 
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                    className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                  >
                    <option value="MONDAY">Monday</option>
                    <option value="TUESDAY">Tuesday</option>
                    <option value="WEDNESDAY">Wednesday</option>
                    <option value="THURSDAY">Thursday</option>
                    <option value="FRIDAY">Friday</option>
                    <option value="SATURDAY">Saturday</option>
                    <option value="SUNDAY">Sunday</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Rule Type</label>
                  <select 
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                  >
                    <option value="FULL_DAY">Full Day</option>
                    <option value="HALF_DAY">Half Day</option>
                  </select>
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
                  Add Rule
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default WeekendRuleModal;
