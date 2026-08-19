import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, X, Bot, Sliders } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';

const AIModuleModal = ({ isOpen, onClose, module }) => {
  const { updateAiModule } = useAdmin();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (module) {
      setFormData({
        status: module.status,
        confidence: module.confidence,
        autoAction: module.settings?.autoAction || false,
        notification: module.settings?.notification || 'None',
        dataSource: module.settings?.dataSource || 'Internal Data',
        refresh: module.settings?.refresh || 'Daily',
        priority: module.settings?.priority || 'Normal',
        notes: module.settings?.notes || '',
        // Specific fields
        minScore: module.settings?.minScore || 80,
        riskThreshold: module.settings?.riskThreshold || 70,
        skillWeight: module.settings?.skillWeight || 50,
        chatTone: module.settings?.chatTone || 'Professional',
      });
    }
  }, [module, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAiModule(module.id, {
      status: formData.status,
      confidence: formData.confidence,
      settings: formData
    });
    onClose();
  };

  if (!module) return null;

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
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-6">
                  <Sliders size={22} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">
                    Configure Rules
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">
                    {module.name}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="flex-1 p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Status</label>
                    <select
                      value={formData.status || 'Active'}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                    >
                      <option>Active</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Priority Level</label>
                    <select
                      value={formData.priority || 'Normal'}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                    >
                      <option>Low</option>
                      <option>Normal</option>
                      <option>High</option>
                      <option>Critical</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                   <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Confidence Threshold</label>
                      <span className="text-xs font-bold text-primary-600">{formData.confidence}%</span>
                   </div>
                   <input 
                      type="range" min="0" max="100" 
                      value={formData.confidence || 80}
                      onChange={e => setFormData({...formData, confidence: parseInt(e.target.value)})}
                      className="w-full accent-primary-600 cursor-pointer"
                   />
                </div>

                {module.name === 'Resume Screening' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Min Acceptable Score</label>
                    <input type="number" value={formData.minScore} onChange={e => setFormData({...formData, minScore: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold" />
                  </div>
                )}

                {module.name === 'Attrition Prediction' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Risk Alert Threshold</label>
                    <input type="number" value={formData.riskThreshold} onChange={e => setFormData({...formData, riskThreshold: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold" />
                  </div>
                )}

                {module.name === 'Smart Hiring Suggestions' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Skill vs Experience Weight</label>
                    <input type="range" min="0" max="100" value={formData.skillWeight} onChange={e => setFormData({...formData, skillWeight: e.target.value})} className="w-full h-2 rounded-full cursor-pointer accent-emerald-500" />
                    <div className="flex justify-between text-xs font-medium text-slate-400">
                        <span>Skills</span>
                        <span>Experience</span>
                    </div>
                  </div>
                )}

                {module.name === 'AI Chat Assistant' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Chat Tone</label>
                    <select value={formData.chatTone} onChange={e => setFormData({...formData, chatTone: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold">
                       <option>Professional</option>
                       <option>Friendly</option>
                       <option>Direct</option>
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Refresh Frequency</label>
                    <select value={formData.refresh} onChange={e => setFormData({...formData, refresh: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700">
                      <option>Real-time</option>
                      <option>Hourly</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Notification Trigger</label>
                    <select value={formData.notification} onChange={e => setFormData({...formData, notification: e.target.value})} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700">
                      <option>None</option>
                      <option>On Event</option>
                      <option>Daily Summary</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                   <div>
                       <p className="text-sm font-bold text-slate-900">Auto Execute Action</p>
                       <p className="text-xs text-slate-500 mt-1">Allow AI to directly take actions based on rules.</p>
                   </div>
                   <input type="checkbox" checked={formData.autoAction} onChange={e => setFormData({...formData, autoAction: e.target.checked})} className="w-5 h-5 accent-primary-600 rounded" />
                </div>
              </div>
              
              <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center gap-4 shrink-0">
                <button type="button" onClick={onClose} className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm">
                  Cancel
                </button>
                <button type="submit" className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95">
                  Save Rules
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AIModuleModal;
