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
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center font-black">
                    {(typeof log.user === 'object' && log.user !== null ? (log.user.email || 'S') : (log.user || 'S'))[0]}
                 </div>
                 <div>
                   <h2 className="text-xl font-bold text-slate-900 dark:text-white">{log.action}</h2>
                   <p className="text-xs font-medium text-slate-500 mt-1">LOG-{log.id} • {log.time}</p>
                 </div>
              </div>
              <div className="flex gap-2">
                 <button onClick={() => { navigator.clipboard.writeText(`LOG-${log.id}`); showToast('Copied Log ID'); }} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400" title="Copy Log ID"><Copy size={20} /></button>
                 <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><X size={24} /></button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-bold text-slate-400 block mb-1">Actor</span>
                     <span className="text-sm font-bold text-slate-900">
                        {typeof log.user === 'object' && log.user !== null ? log.user.email : log.user}
                     </span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-bold font-bold text-slate-400 block mb-1">Module</span>
                     <span className="text-sm font-bold text-slate-900">{log.module}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-black font-bold text-slate-400 block mb-1">IP Address</span>
                     <span className="text-sm font-bold text-slate-900">{log.ip}</span>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Device</span>
                     <span className="text-sm font-bold text-slate-900 tracking-tight">{log.device}</span>
                  </div>
               </div>

               <div className="space-y-4">
                  <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-2 dark:text-white">Full Payload</h3>
                  <div className="bg-slate-900 p-6 rounded-2xl overflow-x-auto">
                     <pre className="font-mono text-[11px] text-emerald-400 leading-relaxed">
{JSON.stringify({
   eventId: `LOG-${log.id}`,
   timestamp: new Date().toISOString(),
   actorDetails: {
      name: log.user,
      authentication: 'SSO (Okta)',
   },
   networkContext: {
      clientIp: log.ip,
      clientUserAgent: log.device,
      location: 'US East (N. Virginia)',
   },
   eventData: {
      action: log.action,
      resource: log.module,
      status: 'success'
   }
}, null, 2)}
                     </pre>
                  </div>
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
