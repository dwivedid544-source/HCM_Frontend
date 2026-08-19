import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

const AssignmentModal = ({ isOpen, onClose, selectedCalendarId }) => {
  const { calendars, assignCalendar, showToast, users, departments, shifts } = useAdmin();
  const [localCalendarId, setLocalCalendarId] = useState(selectedCalendarId || '');
  const [entityType, setEntityType] = useState('EMPLOYEE');
  const [entityId, setEntityId] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!localCalendarId) {
      showToast('Please select a calendar.', 'error');
      return;
    }
    if (!entityId.trim()) {
      showToast('Entity ID is required.', 'error');
      return;
    }
    
    assignCalendar({ 
      calendarId: localCalendarId, 
      entityType, 
      entityId: entityId.trim() 
    });
    
    // Reset fields except calendar
    setEntityId('');
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
                  <LinkIcon size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 leading-none dark:text-white">
                    Assign Calendar
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-1.5 leading-none">
                    Link to an entity
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
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Calendar</label>
                  <select 
                    value={localCalendarId}
                    onChange={(e) => setLocalCalendarId(e.target.value)}
                    className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                    required
                  >
                    <option value="" disabled>Select a Calendar</option>
                    {calendars.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Entity Type</label>
                  <select 
                    value={entityType}
                    onChange={(e) => setEntityType(e.target.value)}
                    className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                  >
                    <option value="EMPLOYEE">Employee</option>
                    <option value="DEPARTMENT">Department</option>
                    <option value="LOCATION">Location</option>
                    <option value="SHIFT">Shift</option>
                    <option value="BRANCH">Branch</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">
                    Select {entityType.toLowerCase()}
                  </label>
                  
                  {entityType === 'EMPLOYEE' && (
                    <select
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                      required
                    >
                      <option value="" disabled>Select an Employee</option>
                      {users?.map(u => (
                        <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                      ))}
                    </select>
                  )}
                  
                  {entityType === 'DEPARTMENT' && (
                    <select
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                      required
                    >
                      <option value="" disabled>Select a Department (Assigns to all inside)</option>
                      {departments?.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                  )}
                  
                  {entityType === 'SHIFT' && (
                    <select
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                      required
                    >
                      <option value="" disabled>Select a Shift</option>
                      {shifts?.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.startTime} - {s.endTime})</option>
                      ))}
                    </select>
                  )}
                  
                  {(entityType === 'LOCATION' || entityType === 'BRANCH') && (
                    <input 
                      type="text"
                      value={entityId}
                      onChange={(e) => setEntityId(e.target.value)}
                      placeholder={`Enter ${entityType.toLowerCase()} UUID...`}
                      className="input-field h-12 bg-slate-50 border-transparent font-bold text-slate-700 w-full"
                      required
                    />
                  )}
                  
                  <p className="text-xs text-slate-400 px-1 mt-1 font-medium">
                    {entityType === 'EMPLOYEE' 
                      ? "Assigns this calendar to a specific employee only." 
                      : entityType === 'DEPARTMENT' 
                        ? "Assigns this calendar to all employees within this department." 
                        : "Enter the exact ID to link this calendar."}
                  </p>
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
                  Add Assignment
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AssignmentModal;
