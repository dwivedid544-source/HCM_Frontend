import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileBadge, X, ShieldCheck, Download } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import DatePicker from '../../../shared/components/common/DatePicker';

const ComplianceModal = ({ isOpen, onClose, policy }) => {
  const { addPolicy, updatePolicy } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Internal Policy',
    department: 'Human Resources',
    owner: 'HR Dept',
    effectiveDate: '',
    expiryDate: '',
    version: '1.0',
    requiresSignature: true,
    status: 'Active',
    description: ''
  });

  useEffect(() => {
    if (policy) {
      setFormData({
        name: policy.name,
        category: policy.category,
        department: policy.department || 'Human Resources',
        owner: policy.owner,
        effectiveDate: policy.effectiveDate || policy.date || '',
        expiryDate: policy.expiryDate || '',
        version: policy.version || '1.0',
        requiresSignature: true,
        status: policy.status,
        description: policy.description || ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Internal Policy',
        department: 'Human Resources',
        owner: 'HR Dept',
        effectiveDate: '',
        expiryDate: '',
        version: '1.0',
        requiresSignature: true,
        status: 'Active',
        description: ''
      });
    }
  }, [policy, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (policy) {
      updatePolicy(policy.id, { ...formData, date: formData.effectiveDate || 'TBD' });
    } else {
      addPolicy({
        ...formData,
        date: formData.effectiveDate || 'TBD',
        acknowledgments: '0'
      });
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
             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col h-full">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg transform rotate-6">
                        <FileBadge size={22} fill="currentColor" />
                     </div>
                     <div>
                        <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">{policy ? 'Edit Policy' : 'Publish Policy'}</h2>
                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">Secure workforce agreement</p>
                     </div>
                  </div>
                  <button type="button" onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                     <X size={24} />
                  </button>
               </div>
               
               <div className="flex-1 p-10 space-y-10">
                  <div className="space-y-8">
                     <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Policy Title</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Workplace Ethics Policy 2026" className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 focus:bg-white" />
                     </div>

                     <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Category</label>
                           <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700">
                                 <option>Internal Policy</option>
                                 <option>Legal Compliance</option>
                                 <option>Ethics & Conduct</option>
                                 <option>Health & Safety</option>
                                 <option>Information Security</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Effective Date</label>
                           <DatePicker  value={formData.effectiveDate} onChange={e => setFormData({...formData, effectiveDate: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700" />
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Primary Owner / Dept</label>
                        <div className="relative">
                           <ShieldCheck className="absolute left-4 top-4 text-slate-300" size={18} />
                           <select value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} className="input-field pl-11 h-14 bg-slate-50 border-transparent font-bold text-slate-700">
                              <option>HR Dept</option>
                              <option>Legal</option>
                              <option>Security</option>
                              <option>Ops</option>
                           </select>
                        </div>
                     </div>

                     <div className="p-10 border-2 border-dashed border-slate-100 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-slate-50 hover:border-primary-100 transition-all group">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm group-hover:text-primary-600 transition-colors">
                           <Download className="transform rotate-180" size={32} />
                        </div>
                        <div className="text-center">
                           <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">Upload Policy PDF</p>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 leading-relaxed">Max 10MB • Secured Storage</p>
                        </div>
                     </div>

                     <div className="p-8 bg-primary-50 rounded-[2.5rem] border border-primary-100 border-dashed space-y-4">
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <ShieldCheck size={18} className="text-primary-600" />
                              <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">Requires Signature</span>
                           </div>
                           <input type="checkbox" checked={formData.requiresSignature} onChange={e => setFormData({...formData, requiresSignature: e.target.checked})} className="w-5 h-5 rounded-lg accent-primary-600 cursor-pointer" />
                        </div>
                        <p className="text-[10px] font-medium text-slate-400 tracking-tight leading-relaxed italic">The user must acknowledgment or digitally sign this document before it is marked as completed on their profile.</p>
                     </div>
                  </div>
               </div>
               
               <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center gap-4 shrink-0 mt-auto">
                  <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm">
                     Cancel
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95">
                     {policy ? 'Save Changes' : 'Publish & Notify'}
                  </button>
               </div>
             </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ComplianceModal;
