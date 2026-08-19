import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';

const LogsDrawer = ({ isOpen, onClose }) => {
  const { aiLogs } = useAdmin();

  const getIcon = (type) => {
    switch (type) {
      case 'Success': return <CheckCircle2 size={16} className="text-emerald-500" />;
      case 'In Progress': return <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse ml-1" />;
      case 'Queue': return <Clock size={16} className="text-amber-500" />;
      default: return <AlertCircle size={16} className="text-slate-400" />;
    }
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] bg-slate-900 shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden text-slate-300"
          >
            <div className="p-8 border-b border-white/10 flex items-center justify-between bg-slate-950/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white/10 text-white">
                  <Terminal size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">AI Inference Logs</h2>
                  <p className="text-xs font-mono text-slate-500 mt-1">tail -f /var/log/ai-engine.log</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 hover:bg-white/10 rounded-xl transition-all text-slate-400 hover:text-white"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs">
               <div className="space-y-4">
                  {aiLogs.length === 0 ? (
                    <p className="text-slate-600 text-center py-10">No logs found.</p>
                  ) : (
                    aiLogs.map((log) => (
                      <div key={log.id} className="p-4 bg-black/40 rounded-lg border border-white/5 flex gap-4">
                        <div className="min-w-[70px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-300">{log.label}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={cn(
                             "text-[9px] font-black uppercase tracking-widest",
                             log.type === 'Success' ? 'text-emerald-500' :
                             log.type === 'In Progress' ? 'text-primary-400' :
                             'text-amber-500'
                           )}>{log.type}</span>
                           {getIcon(log.type)}
                        </div>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LogsDrawer;
