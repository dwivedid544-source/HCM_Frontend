import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, X, Zap, Key } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';

const IntegrationModal = ({ isOpen, onClose, integration }) => {
  const { addIntegration, updateIntegration } = useAdmin();
  const [formData, setFormData] = useState({
    name: '',
    category: 'Communication',
    apiKey: '',
    secretKey: '',
    syncFrequency: 'Every 5m',
    environment: 'Live',
    notes: ''
  });

  useEffect(() => {
    if (integration) {
      setFormData({
        name: integration.name,
        category: integration.category || 'Communication',
        syncFrequency: integration.sync || 'Every 5m',
        apiKey: integration.apiKey || 'sk_live_1234567890',
        secretKey: integration.secretKey || '••••••••••••••••',
        environment: 'Live',
        notes: ''
      });
    } else {
      setFormData({
        name: '',
        category: 'Communication',
        apiKey: '',
        secretKey: '',
        syncFrequency: 'Every 5m',
        environment: 'Live',
        notes: ''
      });
    }
  }, [integration, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (integration) {
      updateIntegration(integration.id, { 
        sync: formData.syncFrequency,
        status: 'Connected'
      });
    } else {
      addIntegration({
        ...formData,
        status: 'Connected',
        sync: formData.syncFrequency,
        icon: 'Terminal'
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-xl max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col h-full">
               <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-5">
                     <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-3">
                        <Terminal size={22} fill="currentColor" />
                     </div>
                     <div>
                        <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">{integration ? 'Configure API keys' : 'Connect Integration'}</h2>
                        <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">Webhook & Sync Settings</p>
                     </div>
                  </div>
                  <button type="button" onClick={onClose} className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                     <X size={24} />
                  </button>
               </div>
               
               <div className="flex-1 p-10 space-y-10">
                  <div className="space-y-8">

                    {!integration && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Integration Name</label>
                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Asana Enterprise" className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 focus:bg-white" />
                      </div>
                    )}

                    {!integration && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                          <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Category</label>
                            <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700">
                                <option>Communication</option>
                                <option>HR Tools</option>
                                <option>Accounting</option>
                                <option>AI</option>
                                <option>Productivity</option>
                                <option>Video</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Environment</label>
                            <select value={formData.environment} onChange={e => setFormData({...formData, environment: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700">
                                <option>Sandbox</option>
                                <option>Live</option>
                            </select>
                          </div>
                      </div>
                    )}

                     <div className="space-y-6 bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">API Key</label>
                            <div className="relative">
                              <Key className="absolute left-4 top-4 text-slate-300" size={18} />
                              <input required type="text" value={formData.apiKey} onChange={e => setFormData({...formData, apiKey: e.target.value})} placeholder="sk_live_..." className="input-field pl-11 h-14 bg-white font-mono text-sm text-slate-700 border-none shadow-sm" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Organization Secret</label>
                            <div className="relative">
                              <Key className="absolute left-4 top-4 text-slate-300" size={18} />
                              <input type="password" value={formData.secretKey} onChange={e => setFormData({...formData, secretKey: e.target.value})} placeholder="••••••••••••••••" className="input-field pl-11 h-14 bg-white font-mono text-sm text-slate-700 border-none shadow-sm" />
                            </div>
                        </div>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Data Sync Frequency</label>
                        <select value={formData.syncFrequency} onChange={e => setFormData({...formData, syncFrequency: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700">
                           <option>Real-time</option>
                           <option>Every 5m</option>
                           <option>Hourly</option>
                           <option>Daily</option>
                           <option>Manual Sync Only</option>
                        </select>
                     </div>

                  </div>
               </div>
               
               <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center gap-4 shrink-0 mt-auto">
                  <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm">
                     Cancel
                  </button>
                  <button type="submit" className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 active:scale-95 flex items-center justify-center gap-2">
                     <Zap size={16} fill="currentColor" /> {integration ? 'Update Keys' : 'Connect'}
                  </button>
               </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default IntegrationModal;
