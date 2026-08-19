import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Copy, Download, AlertTriangle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';

const AuditLogDrawer = ({ isOpen, onClose, log }) => {
  const { showToast } = useAdmin();
  if (!log) return null;

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
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black shrink-0">
                    {(typeof log.user === 'object' && log.user !== null ? (log.user.email || 'S') : (log.user || 'S'))[0]}
                 </div>
                 <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">{log.action}</h2>
                    <p className="text-xs font-medium text-slate-500 mt-1">{log.time || (log.createdAt ? new Date(log.createdAt).toLocaleString() : 'Recorded Event')}</p>
                 </div>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 shrink-0"><X size={24} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <span className="text-[10px] font-bold text-slate-400 block mb-1">Actor</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white truncate block">
                        {typeof log.user === 'object' && log.user !== null ? log.user.email : (log.user || 'System Admin')}
                     </span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <span className="text-[10px] font-bold text-slate-400 block mb-1">Module</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white">{log.module || 'System Control'}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <span className="text-[10px] font-bold text-slate-400 block mb-1">IP Address</span>
                     <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">{log.ip || '127.0.0.1'}</span>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                     <span className="text-[10px] font-bold text-slate-400 block mb-1">Status</span>
                     <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                        {log.status || 'Success'}
                     </span>
                  </div>
               </div>

               <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Activity Summary</span>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                     {log.details || log.description || `${log.action} was executed successfully on the ${log.module || 'system'} module.`}
                  </p>
               </div>
            </div>
            
            <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4 mt-auto shrink-0">
               <button onClick={() => showToast('Flagged event for security review', 'error')} className="flex-1 py-4 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-100 transition-all">
                  <AlertTriangle size={18} /> Flag Incident
               </button>
               <button onClick={() => showToast('Log details downloaded')} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black transition-all">
                  <Download size={18} /> Export Row
               </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuditLogDrawer;
