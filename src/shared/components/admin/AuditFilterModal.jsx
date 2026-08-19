import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, X } from 'lucide-react';

const AuditFilterModal = ({ isOpen, onClose, filters, setFilters }) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFilters(localFilters);
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
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-full max-w-md max-h-[85vh] bg-white shadow-2xl z-[120] flex flex-col rounded-[2.5rem] overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="flex flex-col h-full">
              <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                      <Filter size={20} />
                   </div>
                   <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Advanced Filters</h2>
                </div>
                <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Severity</label>
                  <select value={localFilters.severity} onChange={e => setLocalFilters({...localFilters, severity: e.target.value})} className="input-field h-14 bg-slate-50 font-bold text-slate-700 border-none">
                    <option>All</option>
                    <option>Security</option>
                    <option>Critical</option>
                    <option>Warning</option>
                    <option>Info</option>
                    <option>System</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Module</label>
                  <select value={localFilters.module} onChange={e => setLocalFilters({...localFilters, module: e.target.value})} className="input-field h-14 bg-slate-50 font-bold text-slate-700 border-none">
                    <option>All</option>
                    <option>Auth</option>
                    <option>Payroll</option>
                    <option>Roles</option>
                    <option>Integrations</option>
                    <option>Settings</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Environment</label>
                  <select value={localFilters.environment} onChange={e => setLocalFilters({...localFilters, environment: e.target.value})} className="input-field h-14 bg-slate-50 font-bold text-slate-700 border-none">
                    <option>All</option>
                    <option>Production</option>
                    <option>Staging</option>
                  </select>
                </div>
              </div>

              <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
                <button type="button" onClick={() => setLocalFilters({ severity: 'All', module: 'All', environment: 'All' })} className="flex-1 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100">Clear</button>
                <button type="submit" className="flex-1 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl shrink-0">Apply Filters</button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
export default AuditFilterModal;
