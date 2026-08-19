import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, X, Download, ShieldCheck, Mail, Edit3, Trash2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const PolicyDrawer = ({ isOpen, onClose, policy, onEdit }) => {
  if (!policy) return null;

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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-white text-primary-600 shadow-sm border border-slate-100">
                  <FileText size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{policy.name}</h2>
                  <p className="text-xs font-medium text-slate-500 mt-1 uppercase tracking-widest">{policy.category} • V{policy.version}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-8 space-y-8">
               <div className="grid grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl">
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 font-bold">Effective Date</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{policy.effectiveDate || policy.date || 'TBD'}</p>
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 font-bold">Status</p>
                      <p className={cn(
                          "text-sm font-bold mt-1",
                          policy.status === 'Active' ? 'text-emerald-600' : 'text-amber-500'
                      )}>{policy.status}</p>
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Owner</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">{policy.owner}</p>
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Required Signature</p>
                      <p className="text-sm font-bold text-slate-900 mt-1">Yes</p>
                  </div>
               </div>

               <div>
                   <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 dark:text-white">Description</h3>
                   <p className="text-sm text-slate-600 leading-relaxed">{policy.description || 'No detailed description provided for this policy document.'}</p>
               </div>

               <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 dark:text-white">Acknowledgment Progress</h3>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                     <div className="flex justify-between items-end">
                        <div>
                            <span className="text-2xl font-bold text-slate-900">
                                {policy.acknowledgments ? policy.acknowledgments.split('/')[0] : 0}
                            </span>
                            <span className="text-sm font-bold text-slate-400"> / {policy.acknowledgments ? policy.acknowledgments.split('/')[1] : 428}</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">Accepted</span>
                     </div>
                     <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                           className="h-full bg-emerald-500" 
                           style={{ width: `${(parseInt(policy.acknowledgments ? policy.acknowledgments.split('/')[0] : 0) / parseInt(policy.acknowledgments ? policy.acknowledgments.split('/')[1] : 428)) * 100}%` }} 
                        />
                     </div>
                  </div>
               </div>

               <div className="p-6 border-2 border-slate-100 rounded-2xl flex items-center justify-between">
                   <div className="flex items-center gap-3">
                       <FileText size={20} className="text-primary-600" />
                       <div>
                           <p className="text-sm font-bold text-slate-900">Document.pdf</p>
                           <p className="text-[10px] text-slate-400 font-medium">1.2 MB</p>
                       </div>
                   </div>
                   <button className="text-primary-600 hover:text-primary-700 bg-primary-50 p-2 rounded-lg">
                       <Download size={18} />
                   </button>
               </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-4">
                <button 
                  onClick={() => {
                      onClose();
                      onEdit(policy);
                  }}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
                   <Edit3 size={16} /> Edit
                </button>
                <button className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all">
                   <Mail size={16} /> Send Reminder
                </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PolicyDrawer;
