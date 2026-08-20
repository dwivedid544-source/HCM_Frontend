import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileBadge, X, ShieldCheck, Download, FileText, Trash2 } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { uploadAPI } from '../../../utils/apiService';
import DatePicker from '../../../shared/components/common/DatePicker';

const ComplianceModal = ({ isOpen, onClose, policy, isRenewing }) => {
  const { addPolicy, updatePolicy, renewPolicy, showToast, totalActiveEmployees } = useAdmin();
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
    description: '',
    pdfName: '',
    pdfData: ''
  });

  useEffect(() => {
    if (policy) {
      let nextVersion = policy.version || '1.0';
      let nextPdfName = policy.pdfName || '';
      let nextPdfData = policy.pdfData || '';
      
      if (isRenewing) {
        const currentMajor = parseInt(nextVersion) || 1;
        nextVersion = `${currentMajor + 1}.0`;
        // Keep the old PDF as reference, but usually you'd upload a new one
      }

      setFormData({
        name: policy.name,
        category: policy.category,
        department: policy.department || 'Human Resources',
        owner: policy.owner,
        effectiveDate: policy.effectiveDate || policy.date || '',
        expiryDate: policy.expiryDate || '',
        version: nextVersion,
        requiresSignature: policy.requiresSignature ?? true,
        status: policy.status || 'Active',
        description: policy.description || '',
        pdfName: nextPdfName,
        pdfData: nextPdfData
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
        description: '',
        pdfName: '',
        pdfData: ''
      });
    }
  }, [policy, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (policy) {
      if (isRenewing) {
        renewPolicy(policy.id, { ...formData });
      } else {
        updatePolicy(policy.id, { ...formData });
      }
    } else {
      addPolicy({
        ...formData,
        acknowledgments: `0/${totalActiveEmployees || 1}` // Initialize count based on real employees
      });
    }
    onClose();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please upload a valid PDF document', 'error');
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        showToast('File size must be less than 15MB', 'error');
        return;
      }

      try {
        const res = await uploadAPI.uploadDocument(file, 'hcm/policies');
        const cloudUrl = res.data?.data?.url;
        if (cloudUrl) {
          setFormData(prev => ({
            ...prev,
            pdfName: file.name,
            pdfData: cloudUrl
          }));
          showToast('Policy PDF uploaded to ImageKit successfully!', 'success');
          return;
        }
      } catch (uploadErr) {
        console.warn('Direct ImageKit policy upload failed, using fallback:', uploadErr.message);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          pdfName: file.name,
          pdfData: reader.result
        }));
        showToast('Policy PDF uploaded successfully!', 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setFormData(prev => ({
      ...prev,
      pdfName: '',
      pdfData: ''
    }));
    showToast('Uploaded PDF removed', 'info');
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
             <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col h-full text-left">
                <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                   <div className="flex items-center gap-5">
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg transform rotate-6">
                         <FileBadge size={22} fill="currentColor" />
                      </div>
                      <div>
                         <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">
                           {policy ? (isRenewing ? 'Renew Policy' : 'Edit Policy') : 'Publish Policy'}
                         </h2>
                         <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">Secure workforce agreement</p>
                      </div>
                   </div>
                   <button type="button" onClick={onClose} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400">
                      <X size={24} />
                   </button>
                </div>
                
                <div className="flex-1 p-10 space-y-10">
                   <div className="space-y-8">
                      <div className="space-y-2">
                         <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Policy Title</label>
                         <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Workplace Ethics Policy 2026" className="input-field h-14 bg-slate-50 dark:bg-slate-850 border-transparent font-bold text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900" />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                         <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field h-14 bg-slate-50 dark:bg-slate-850 border-transparent font-bold text-slate-700 dark:text-slate-200">
                                  <option>Internal Policy</option>
                                  <option>Legal Compliance</option>
                                  <option>Ethics & Conduct</option>
                                  <option>Health & Safety</option>
                                  <option>Information Security</option>
                            </select>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Effective Date</label>
                            <DatePicker  value={formData.effectiveDate} onChange={e => setFormData({...formData, effectiveDate: e.target.value})} className="input-field h-14 bg-slate-50 dark:bg-slate-850 border-transparent font-bold text-slate-700 dark:text-slate-200" />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Primary Owner / Dept</label>
                         <div className="relative">
                            <ShieldCheck className="absolute left-4 top-4 text-slate-300 dark:text-slate-600" size={18} />
                            <select value={formData.owner} onChange={e => setFormData({...formData, owner: e.target.value})} className="input-field pl-11 h-14 bg-slate-50 dark:bg-slate-850 border-transparent font-bold text-slate-700 dark:text-slate-200">
                               <option>HR Dept</option>
                               <option>Legal</option>
                               <option>Security</option>
                               <option>Ops</option>
                            </select>
                         </div>
                      </div>

                      <div className="space-y-2">
                         <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Description</label>
                         <textarea 
                           rows={6} 
                           value={formData.description} 
                           onChange={e => setFormData({...formData, description: e.target.value})} 
                           placeholder="Enter policy description or guidelines here..." 
                           className="input-field h-auto min-h-[150px] py-4 bg-slate-50 dark:bg-slate-850 border-transparent font-medium text-slate-700 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 resize-none" 
                         />
                      </div>

                      {formData.pdfName ? (
                         <div className="p-8 border-2 border-emerald-500/20 bg-emerald-50/10 dark:bg-emerald-950/10 rounded-[2.5rem] flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                               <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 dark:shadow-none shrink-0">
                                  <FileText size={22} />
                               </div>
                               <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{formData.pdfName}</p>
                                  <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Uploaded & Secured</p>
                               </div>
                            </div>
                            <button
                               type="button"
                               onClick={handleRemoveFile}
                               className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl text-rose-500 transition-all cursor-pointer shrink-0"
                               title="Remove file"
                            >
                               <Trash2 size={18} />
                            </button>
                         </div>
                      ) : (
                         <label className="p-10 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-primary-100 transition-all group relative">
                            <input 
                              type="file" 
                              accept="application/pdf" 
                              onChange={handleFileChange} 
                              className="hidden" 
                            />
                            <div className="w-16 h-16 bg-white dark:bg-slate-950 rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-sm group-hover:text-primary-600 transition-colors">
                               <Download className="transform rotate-180" size={32} />
                            </div>
                            <div className="text-center">
                               <p className="text-sm font-bold text-slate-900 dark:text-slate-200 group-hover:text-primary-600 transition-colors">Upload Policy PDF</p>
                               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold mt-2 leading-relaxed">Max 10MB • Secured Storage</p>
                            </div>
                         </label>
                      )}

                      <div className="p-8 bg-primary-50 dark:bg-primary-950/10 rounded-[2.5rem] border border-primary-100 dark:border-primary-900/30 border-dashed space-y-4">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                               <ShieldCheck size={18} className="text-primary-600" />
                               <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-bold">Requires Signature</span>
                            </div>
                            <input type="checkbox" checked={formData.requiresSignature} onChange={e => setFormData({...formData, requiresSignature: e.target.checked})} className="w-5 h-5 rounded-lg accent-primary-600 cursor-pointer" />
                         </div>
                         <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 tracking-tight leading-relaxed italic">The user must acknowledgment or digitally sign this document before it is marked as completed on their profile.</p>
                      </div>
                   </div>
                </div>
                
                <div className="p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center gap-4 shrink-0 mt-auto">
                   <button type="button" onClick={onClose} className="flex-1 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-750 transition-all shadow-sm cursor-pointer">
                      Cancel
                   </button>
                   <button type="submit" className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95 cursor-pointer">
                      {isRenewing ? 'Renew Policy' : (policy ? 'Save Changes' : 'Publish & Notify')}
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
