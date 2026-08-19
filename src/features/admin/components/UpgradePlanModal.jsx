import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';

const UpgradePlanModal = ({ isOpen, onClose }) => {
  const { billingPlan, updatePlan } = useAdmin();
  const [cycle, setCycle] = useState(billingPlan.cycle || 'Monthly');
  const [selectedPlan, setSelectedPlan] = useState(billingPlan.name || 'Enterprise Plan');

  const plans = [
    { name: 'Starter Plan', monthly: 99, yearly: 79, users: 'Up to 10', features: ['Basic Reporting', 'Standard Support', '5GB Storage'] },
    { name: 'Growth Plan', monthly: 299, yearly: 249, users: 'Up to 50', features: ['Advanced Analytics', 'Priority Support', '50GB Storage', 'Custom Roles'] },
    { name: 'Enterprise Plan', monthly: 4280, yearly: 3500, users: 'Unlimited', features: ['Dedicated Account Manager', '24/7 Phone Support', 'Unlimited Storage', 'White-labeling', 'API Access'] },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const planDetails = plans.find(p => p.name === selectedPlan);
    const price = cycle === 'Monthly' ? planDetails.monthly : planDetails.yearly;
    updatePlan({ name: selectedPlan, cycle, price, users: planDetails.users === 'Unlimited' ? 'Unlimited' : parseInt(planDetails.users.match(/\d+/)[0]) });
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
            className="fixed inset-0 m-auto max-w-4xl max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-[2.5rem] overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <Star size={24} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">Upgrade Plan</h2>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Select the best fit for your team</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 flex flex-col gap-8">
               <div className="flex justify-center mb-4">
                  <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1">
                     <button type="button" className={cn("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", cycle === 'Monthly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")} onClick={() => setCycle('Monthly')}>Monthly Billing</button>
                     <button type="button" className={cn("px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all", cycle === 'Yearly' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")} onClick={() => setCycle('Yearly')}>Yearly Billing <span className="text-[9px] text-emerald-500 ml-1">SAVE 20%</span></button>
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 {plans.map(plan => (
                   <div key={plan.name} onClick={() => setSelectedPlan(plan.name)} className={cn("card p-6 border-2 cursor-pointer transition-all", selectedPlan === plan.name ? "border-primary-500 bg-primary-50/20 shadow-xl shadow-primary-500/10 scale-105" : "border-slate-100 bg-white hover:border-slate-200")}>
                      <div className="flex justify-between items-start mb-4">
                         <h3 className="font-extrabold text-slate-900 text-lg dark:text-white">{plan.name}</h3>
                         {selectedPlan === plan.name && <CheckCircle2 className="text-primary-600" size={20} />}
                      </div>
                      <div className="mb-6 flex items-baseline gap-1">
                         <span className="text-3xl font-bold text-slate-900">${cycle === 'Monthly' ? plan.monthly : plan.yearly}</span>
                         <span className="text-xs font-bold text-slate-400 font-bold">/mo</span>
                      </div>
                      <div className="space-y-3 pb-6 border-b border-slate-100 mb-6">
                         <p className="text-xs font-bold text-slate-600 tracking-tight">👤 {plan.users}</p>
                      </div>
                      <ul className="space-y-3">
                         {plan.features.map((f, i) => (
                           <li key={i} className="flex items-center gap-2 text-xs font-medium text-slate-500"><CheckCircle2 size={14} className="text-emerald-500 shrink-0" /> {f}</li>
                         ))}
                      </ul>
                   </div>
                 ))}
               </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
               <div>
                  <p className="text-[10px] font-bold text-slate-400 font-bold">Total Estimated Price</p>
                  <p className="text-xl font-black text-slate-900">${cycle === 'Monthly' ? plans.find(p => p.name === selectedPlan)?.monthly : plans.find(p => p.name === selectedPlan)?.yearly}<span className="text-xs">/mo</span></p>
               </div>
               <div className="flex gap-4">
                  <button type="button" onClick={onClose} className="px-6 py-3.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm">Cancel</button>
                  <button type="button" onClick={handleSubmit} className="px-8 py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-xl shadow-slate-200 flex items-center gap-2">Upgrade Now</button>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpgradePlanModal;
