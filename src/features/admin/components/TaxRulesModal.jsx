import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, Plus, Edit3, Trash2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import DatePicker from '../../../shared/components/common/DatePicker';

const TaxRulesModal = ({ isOpen, onClose }) => {
  const { taxRules, addTaxRule, updateTaxRule, deleteTaxRule } = useAdmin();
  const [view, setView] = useState('list'); // 'list' or 'form'
  const [ruleToEdit, setRuleToEdit] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    region: 'Global',
    slabType: 'Progressive',
    percentage: '',
    minSalary: '',
    maxSalary: '',
    effectiveDate: '',
    status: 'Active'
  });

  useEffect(() => {
    if (isOpen) setView('list');
  }, [isOpen]);

  const handleEdit = (rule) => {
    setRuleToEdit(rule);
    setFormData(rule);
    setView('form');
  };

  const handleAdd = () => {
    setRuleToEdit(null);
    setFormData({
      name: '',
      region: 'Global',
      slabType: 'Progressive',
      percentage: '',
      minSalary: '',
      maxSalary: '',
      effectiveDate: '',
      status: 'Active'
    });
    setView('form');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (ruleToEdit) {
      updateTaxRule(ruleToEdit.id, formData);
    } else {
      addTaxRule(formData);
    }
    setView('list');
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
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-6">
                  <Calculator size={22} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">
                    Tax Rules Configuration
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">
                    Manage slabs & regions
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
            
            {view === 'list' && (
              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                <div className="flex justify-end">
                  <button onClick={handleAdd} className="btn-primary px-4 py-2 font-bold flex items-center gap-2">
                    <Plus size={16} /> Add Rule
                  </button>
                </div>
                {taxRules.length === 0 ? (
                  <p className="text-center text-slate-400 mt-10 text-sm font-medium">No tax rules defined.</p>
                ) : (
                  <div className="space-y-4">
                    {taxRules.map(rule => (
                      <div key={rule.id} className="p-5 border border-slate-100 rounded-2xl flex items-center justify-between hover:border-primary-100 bg-white">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{rule.name} <span className="px-2 py-0.5 bg-slate-100 rounded text-[10px] uppercase">{rule.region}</span></h4>
                          <p className="text-xs text-slate-500 mt-1">{rule.percentage}% • {rule.slabType} • {rule.status}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(rule)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Edit3 size={16} /></button>
                          <button onClick={() => deleteTaxRule(rule.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {view === 'form' && (
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
                <div className="flex-1 p-10 space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Rule Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Standard Federal Tax"
                      className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Region</label>
                      <select
                        value={formData.region}
                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                      >
                        <option>Global</option>
                        <option>USA</option>
                        <option>India</option>
                        <option>Europe</option>
                        <option>APAC</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Slab Type</label>
                      <select
                        value={formData.slabType}
                        onChange={(e) => setFormData({...formData, slabType: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                      >
                        <option>Progressive</option>
                        <option>Flat</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Percentage (%)</label>
                      <input
                        required
                        type="number"
                        step="0.01"
                        value={formData.percentage}
                        onChange={(e) => setFormData({...formData, percentage: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Status</label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                      >
                        <option>Active</option>
                        <option>Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Min Salary</label>
                      <input
                        required
                        type="number"
                        value={formData.minSalary}
                        onChange={(e) => setFormData({...formData, minSalary: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Max Salary</label>
                      <input
                        required
                        type="number"
                        value={formData.maxSalary}
                        onChange={(e) => setFormData({...formData, maxSalary: e.target.value})}
                        className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Effective Date</label>
                    <DatePicker required
                      
                      value={formData.effectiveDate}
                      onChange={(e) => setFormData({...formData, effectiveDate: e.target.value})}
                      className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700"
                    />
                  </div>
                </div>
                
                <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center gap-4 shrink-0">
                  <button 
                    type="button" 
                    onClick={() => setView('list')} 
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm"
                  >
                    Back to List
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95"
                  >
                    Save Tax Rule
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TaxRulesModal;
