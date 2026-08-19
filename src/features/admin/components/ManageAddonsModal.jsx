import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, X, Plus, Minus } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';

const ManageAddonsModal = ({ isOpen, onClose }) => {
  const { billingPlan, updatePlan } = useAdmin();
  const [activeAddons, setActiveAddons] = useState(billingPlan.addons || []);

  const addonsList = [
    { name: 'AI Engine', price: 500, desc: 'Full access to AI models and automated insights.' },
    { name: 'Advanced Security', price: 250, desc: 'SSO, data loss prevention, and advanced audit trails.' },
    { name: 'Extra Users (Batch of 50)', price: 300, desc: 'Increases your total seat count by 50.' },
    { name: 'Priority Support', price: 150, desc: '1-hour SLA, 24/7 dedicated assistance hotline.' },
    { name: 'Multi Region Backup', price: 400, desc: 'Geographically distributed continuous backups.' },
  ];

  const handleToggle = (addonName) => {
    setActiveAddons(prev => prev.includes(addonName) ? prev.filter(a => a !== addonName) : [...prev, addonName]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updatePlan({ addons: activeAddons });
    onClose();
  };

  const totalPrice = activeAddons.reduce((acc, aName) => {
    const addon = addonsList.find(al => al.name === aName);
    return acc + (addon ? addon.price : 0);
  }, 0);

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
            className="fixed inset-0 m-auto max-w-xl max-h-[85vh] bg-white shadow-2xl z-[120] flex flex-col rounded-[2.5rem] overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Manage Add-ons</h2>
                  <p className="text-xs font-bold text-slate-500">Supercharge your workspace</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-4">
               {addonsList.map(addon => {
                 const isEnabled = activeAddons.includes(addon.name);
                 return (
                   <div key={addon.name} className={cn("p-5 border-2 rounded-2xl transition-all flex items-center justify-between cursor-pointer", isEnabled ? "border-indigo-600 bg-indigo-50/10" : "border-slate-100 bg-white hover:border-slate-200")} onClick={() => handleToggle(addon.name)}>
                      <div>
                         <h4 className="font-bold text-slate-900 mb-1 dark:text-white">{addon.name} <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md ml-2">+${addon.price}/mo</span></h4>
                         <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-[280px]">{addon.desc}</p>
                      </div>
                      <div className={cn("w-12 h-6 rounded-full relative p-1 transition-colors", isEnabled ? "bg-indigo-600" : "bg-slate-300")}>
                         <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", isEnabled && "translate-x-6")} />
                      </div>
                   </div>
                 );
               })}
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 font-bold">Added to Subscription</p>
                  <p className="text-xl font-bold text-slate-900">+${totalPrice}<span className="text-xs font-bold text-slate-500">/mo</span></p>
               </div>
               <div className="flex gap-4">
                  <button onClick={onClose} className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50">Cancel</button>
                  <button onClick={handleSubmit} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black shadow-xl">Save Updates</button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ManageAddonsModal;
