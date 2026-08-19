import React, { useState, useEffect } from 'react';
import { 
  Receipt, Plus, Trash2, Edit3, Save, X, Eye, 
  ArrowUp, ArrowDown, CheckCircle2, AlertCircle, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { superAdminAPI, settingsAPI } from '../../utils/apiService';
import { useCurrency } from '../../hooks/useCurrency';

const PricingManagement = () => {
  const { formatCurrency, getSymbol, masterCurrency, currencyCode, convertAmount } = useCurrency();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [previewPlanData, setPreviewPlanData] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('0');
  const [yearlyPrice, setYearlyPrice] = useState('0');
  const [currency, setCurrency] = useState('USD');
  const [billingCycle, setBillingCycle] = useState('Both');
  const [trialDays, setTrialDays] = useState('14');
  const [maxEmployees, setMaxEmployees] = useState('100');
  const [maxAdmins, setMaxAdmins] = useState('3');
  const [storageLimit, setStorageLimit] = useState('10');
  const [aiCredits, setAiCredits] = useState('0');
  const [supportLevel, setSupportLevel] = useState('Standard');
  const [buttonText, setButtonText] = useState('Start Free Trial');
  const [buttonLink, setButtonLink] = useState('/login');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState('0');
  const [features, setFeatures] = useState([]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await superAdminAPI.getAdminPricingPlans();
      if (res.data && res.data.success) {
        setPlans(res.data.data || []);
      }
    } catch (err) {
      showToast('Failed to load pricing plans.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setName('');
    setDescription('');
    setMonthlyPrice('19');
    setYearlyPrice('180');
    setCurrency(currencyCode || 'USD');
    setBillingCycle('Both');
    setTrialDays('14');
    setMaxEmployees('50');
    setMaxAdmins('3');
    setStorageLimit('10');
    setAiCredits('100');
    setSupportLevel('Priority Email');
    setButtonText('Start Free Trial');
    setButtonLink('/login');
    setIsPopular(false);
    setIsActive(true);
    setDisplayOrder('0');
    setFeatures([{ id: Date.now().toString(), text: 'Core Directory access', displayOrder: 0 }]);
    setIsModalOpen(true);
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setName(plan.name);
    setDescription(plan.description);
    setMonthlyPrice(plan.monthlyPrice.toString());
    setYearlyPrice(plan.yearlyPrice.toString());
    setCurrency(plan.currency || 'USD');
    setBillingCycle(plan.billingCycle);
    setTrialDays(plan.trialDays.toString());
    setMaxEmployees(plan.maxEmployees.toString());
    setMaxAdmins(plan.maxAdmins.toString());
    setStorageLimit(plan.storageLimit.toString());
    setAiCredits((plan.aiCredits || 0).toString());
    setSupportLevel(plan.supportLevel);
    setButtonText(plan.buttonText);
    setButtonLink(plan.buttonLink);
    setIsPopular(plan.isPopular);
    setIsActive(plan.isActive);
    setDisplayOrder(plan.displayOrder.toString());
    setFeatures(
      plan.features.map(f => ({
        id: f.id,
        text: f.feature,
        displayOrder: f.displayOrder
      }))
    );
    setIsModalOpen(true);
  };

  const handleAddFeature = () => {
    setFeatures([...features, { id: Date.now().toString(), text: '', displayOrder: features.length }]);
  };

  const handleRemoveFeature = (id) => {
    const updated = features.filter(f => f.id !== id).map((f, index) => ({ ...f, displayOrder: index }));
    setFeatures(updated);
  };

  const handleFeatureTextChange = (id, text) => {
    setFeatures(features.map(f => f.id === id ? { ...f, text } : f));
  };

  const moveFeature = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === features.length - 1) return;

    const newFeatures = [...features];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newFeatures[index];
    newFeatures[index] = newFeatures[targetIndex];
    newFeatures[targetIndex] = temp;

    // Recalculate displayOrders
    const reordered = newFeatures.map((f, i) => ({ ...f, displayOrder: i }));
    setFeatures(reordered);
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await superAdminAPI.togglePricingPlanStatus(id);
      if (res.data && res.data.success) {
        showToast(res.data.message || 'Status updated successfully.');
        setPlans(plans.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p));
      }
    } catch (err) {
      showToast('Failed to toggle status.', 'error');
    }
  };

  const handleMovePlan = async (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === plans.length - 1) return;

    const newPlans = [...plans];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap
    const temp = newPlans[index];
    newPlans[index] = newPlans[targetIndex];
    newPlans[targetIndex] = temp;

    setPlans(newPlans);

    try {
      const ids = newPlans.map(p => p.id);
      await superAdminAPI.reorderPricingPlans(ids);
      showToast('Display order updated.');
    } catch {
      showToast('Failed to update display order on server.', 'error');
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm('Are you absolutely sure you want to delete this pricing plan? This cannot be undone.')) return;
    
    try {
      const res = await superAdminAPI.deletePricingPlan(id);
      if (res.data && res.data.success) {
        showToast('Pricing plan deleted successfully.');
        setPlans(plans.filter(p => p.id !== id));
      }
    } catch (err) {
      showToast('Failed to delete pricing plan.', 'error');
    }
  };

  const handlePreview = () => {
    setPreviewPlanData({
      name,
      description,
      monthlyPrice: parseFloat(monthlyPrice) || 0,
      yearlyPrice: parseFloat(yearlyPrice) || 0,
      currency,
      billingCycle,
      trialDays: parseInt(trialDays) || 0,
      maxEmployees: parseInt(maxEmployees) || 0,
      maxAdmins: parseInt(maxAdmins) || 0,
      storageLimit: parseInt(storageLimit) || 0,
      aiCredits: parseInt(aiCredits) || 0,
      supportLevel,
      buttonText,
      buttonLink,
      isPopular,
      isActive,
      features: features.filter(f => f.text.trim() !== '').map(f => f.text)
    });
    setIsPreviewOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Plan Name is required.', 'error');
      return;
    }

    const payload = {
      name,
      description,
      monthlyPrice: parseFloat(monthlyPrice) || 0,
      yearlyPrice: parseFloat(yearlyPrice) || 0,
      currency,
      billingCycle,
      trialDays: parseInt(trialDays) || 0,
      maxEmployees: parseInt(maxEmployees) || 0,
      maxAdmins: parseInt(maxAdmins) || 0,
      storageLimit: parseInt(storageLimit) || 0,
      aiCredits: parseInt(aiCredits) || 0,
      supportLevel,
      buttonText,
      buttonLink,
      isPopular,
      isActive,
      features: features.filter(f => f.text.trim() !== '').map(f => ({
        feature: f.text.trim(),
        displayOrder: f.displayOrder
      }))
    };

    try {
      setLoading(true);
      let res;
      if (editingPlan) {
        res = await superAdminAPI.updatePricingPlan(editingPlan.id, payload);
      } else {
        res = await superAdminAPI.createPricingPlan(payload);
      }

      if (res.data && res.data.success) {
        showToast(res.data.message || 'Plan saved successfully.');
        setIsModalOpen(false);
        fetchPlans();
      }
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to save plan.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 w-full space-y-6 text-left">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border ${
              toast.type === 'error' 
                ? 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/20 dark:border-rose-900/50 dark:text-rose-400' 
                : 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50 dark:text-emerald-400'
            }`}
          >
            {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
            <span className="text-sm font-bold">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Receipt className="text-primary-600" size={32} />
            Pricing Plans Management
          </h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">
            Configure system-wide SaaS tiers, quotas, add-ons, features, and active/popular statuses.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center gap-2 self-start md:self-auto shadow-lg shadow-primary-200"
        >
          <Plus size={18} />
          <span>Create Plan</span>
        </button>
      </div>

      {/* Plans List Table/Grid */}
      {loading && plans.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : plans.length === 0 ? (
        <div className="card p-12 text-center border border-slate-100 shadow-soft">
          <Receipt size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-800">No Pricing Tiers Defined</h3>
          <p className="text-slate-500 text-sm max-w-sm mx-auto mt-2">
            Click Create Plan to configure your first subscription pricing card. Default plans will seed automatically on the homepage if left empty.
          </p>
        </div>
      ) : (
        <div className="card p-0 border border-slate-100 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Order</th>
                  <th className="px-6 py-4 text-[10px] font-black font-bold text-slate-400">Plan Details</th>
                  <th className="px-6 py-4 text-[10px] font-black font-bold text-slate-400">Pricing</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Quotas (Users/Admins)</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Features</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Badges</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan, index) => (
                  <tr key={plan.id} className="hover:bg-slate-50/40 group">
                    {/* Reordering column */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 items-center justify-center">
                        <button 
                          disabled={index === 0}
                          onClick={() => handleMovePlan(index, 'up')}
                          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-500"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button 
                          disabled={index === plans.length - 1}
                          onClick={() => handleMovePlan(index, 'down')}
                          className="p-1 hover:bg-slate-100 disabled:opacity-30 rounded text-slate-500"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    </td>
                    {/* Name & description */}
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-extrabold text-slate-900 flex items-center gap-2">
                          {plan.name}
                          {plan.isPopular && (
                            <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-600 rounded text-[9px] font-bold font-bold">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-slate-400 text-xs mt-0.5 line-clamp-2 max-w-xs">{plan.description}</div>
                      </div>
                    </td>
                    {/* Pricing */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-black text-slate-800">
                        {getSymbol()}{plan.monthlyPrice} <span className="text-[10px] text-slate-400 font-medium">/mo</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {getSymbol()}{plan.yearlyPrice} <span className="text-[10px] text-slate-400 font-medium">/yr</span>
                      </div>
                    </td>
                    {/* Quotas */}
                    <td className="px-6 py-4 text-center">
                      <div className="text-xs font-bold text-slate-700">
                        {plan.maxEmployees === 9999 ? 'Unlimited' : `${plan.maxEmployees} Employees`}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {plan.maxAdmins} Admins • {plan.storageLimit}GB Storage
                      </div>
                    </td>
                    {/* Features list count */}
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">
                        {plan.features?.length || 0} Features
                      </span>
                    </td>
                    {/* Popular badge */}
                    <td className="px-6 py-4 text-center">
                      <span className={`text-xs font-bold ${plan.isPopular ? 'text-amber-600' : 'text-slate-400'}`}>
                        {plan.isPopular ? 'Popular Badge' : 'Standard'}
                      </span>
                    </td>
                    {/* Status Toggle */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleToggleStatus(plan.id)}
                        className={`p-1 rounded-full transition-colors ${plan.isActive ? 'text-emerald-500' : 'text-slate-300'}`}
                        title={plan.isActive ? 'Deactivate Plan' : 'Activate Plan'}
                      >
                        {plan.isActive ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                      </button>
                    </td>
                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(plan)}
                          className="p-2 text-slate-500 hover:text-primary-600 hover:bg-slate-100 rounded-lg transition-all"
                          title="Edit Plan"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Delete Plan"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl border border-slate-100 overflow-hidden relative z-50 flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {editingPlan ? `Edit Plan: ${editingPlan.name}` : 'Create Pricing Plan'}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 font-bold mt-1">
                    Fill in subscription metrics and feature limits
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handlePreview}
                    className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
                  >
                    <Eye size={14} />
                    <span>Live Preview</span>
                  </button>
                  <button 
                    onClick={() => setIsModalOpen(false)} 
                    className="p-2 hover:bg-slate-50 rounded-xl text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Form Body - Scrollable */}
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                
                {/* Basic Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 font-bold block">Plan Name *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Starter, Premium, Custom" 
                      className="input-field w-full font-bold"
                      value={name}
                      onChange={e => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 font-bold block">Short Description</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Essential scaling features for early teams" 
                      className="input-field w-full"
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                    />
                  </div>
                </div>

                {/* Prices & Commitments */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Monthly Price ({getSymbol()}) *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      className="input-field w-full font-black text-lg"
                      value={monthlyPrice}
                      onChange={e => setMonthlyPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Yearly Price ({getSymbol()}) *</label>
                    <input 
                      type="number" 
                      required
                      min="0"
                      className="input-field w-full font-black text-lg"
                      value={yearlyPrice}
                      onChange={e => setYearlyPrice(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Billing Cycle</label>
                    <select 
                      className="input-field w-full font-bold text-slate-700"
                      value={billingCycle}
                      onChange={e => setBillingCycle(e.target.value)}
                    >
                      <option value="Monthly">Monthly Only</option>
                      <option value="Yearly">Yearly Only</option>
                      <option value="Both">Both (Toggle enabled)</option>
                    </select>
                  </div>
                </div>

                {/* Quota Allocations */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Max Employees</label>
                    <input 
                      type="number" 
                      min="1"
                      className="input-field w-full font-bold"
                      value={maxEmployees}
                      onChange={e => setMaxEmployees(e.target.value)}
                      placeholder="9999 = Unlimited"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Max Admins</label>
                    <input 
                      type="number" 
                      min="1"
                      className="input-field w-full font-bold"
                      value={maxAdmins}
                      onChange={e => setMaxAdmins(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Storage Limit (GB)</label>
                    <input 
                      type="number" 
                      min="1"
                      className="input-field w-full font-bold"
                      value={storageLimit}
                      onChange={e => setStorageLimit(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">AI Credits / Month</label>
                    <input 
                      type="number" 
                      min="0"
                      className="input-field w-full font-bold"
                      value={aiCredits}
                      onChange={e => setAiCredits(e.target.value)}
                    />
                  </div>
                </div>

                {/* Trial & Support */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Trial Period (Days)</label>
                    <input 
                      type="number" 
                      min="0"
                      className="input-field w-full font-bold"
                      value={trialDays}
                      onChange={e => setTrialDays(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Support SLA Level</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Priority 24/7 Phone & Web" 
                      className="input-field w-full"
                      value={supportLevel}
                      onChange={e => setSupportLevel(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Display Sort Order</label>
                    <input 
                      type="number" 
                      className="input-field w-full font-bold"
                      value={displayOrder}
                      onChange={e => setDisplayOrder(e.target.value)}
                    />
                  </div>
                </div>

                {/* Button Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Button CTA Text</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Choose Professional" 
                      className="input-field w-full"
                      value={buttonText}
                      onChange={e => setButtonText(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Button URL Link</label>
                    <input 
                      type="text" 
                      placeholder="e.g. /login or /book-demo" 
                      className="input-field w-full"
                      value={buttonLink}
                      onChange={e => setButtonLink(e.target.value)}
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex flex-wrap gap-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                      checked={isPopular}
                      onChange={e => setIsPopular(e.target.checked)}
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-800">Highlight as Popular</span>
                      <p className="text-[10px] font-medium text-slate-400">Puts badge and distinct frame on pricing layout</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-primary-600 focus:ring-primary-500 cursor-pointer"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-800">Publish Immediately</span>
                      <p className="text-[10px] font-medium text-slate-400">Make this plan visible on the landing page</p>
                    </div>
                  </label>
                </div>

                {/* Features Management Section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900">Features Checklist</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Define bullet points for the plan</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
                    >
                      <Plus size={14} />
                      <span>Add Feature</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {features.map((feature, idx) => (
                      <div key={feature.id} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm group/item">
                        {/* Up Down arrows for sorting features */}
                        <div className="flex flex-col gap-0.5">
                          <button 
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveFeature(idx, 'up')}
                            className="p-0.5 hover:bg-slate-100 disabled:opacity-20 rounded text-slate-400"
                          >
                            <ArrowUp size={12} />
                          </button>
                          <button 
                            type="button"
                            disabled={idx === features.length - 1}
                            onClick={() => moveFeature(idx, 'down')}
                            className="p-0.5 hover:bg-slate-100 disabled:opacity-20 rounded text-slate-400"
                          >
                            <ArrowDown size={12} />
                          </button>
                        </div>
                        
                        <input 
                          type="text" 
                          placeholder="e.g. Direct Deposit Setup, Mobile Clock In" 
                          className="input-field flex-1 h-10 text-xs font-bold"
                          value={feature.text}
                          onChange={e => handleFeatureTextChange(feature.id, e.target.value)}
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveFeature(feature.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 opacity-0 group-hover/item:opacity-100 transition-opacity"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                    {features.length === 0 && (
                      <p className="text-slate-400 text-xs text-center py-4 border border-dashed border-slate-200 rounded-xl">
                        No features added yet. Click Add Feature to start listing options.
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary px-6 py-2.5 font-bold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary px-8 py-2.5 font-bold shadow-lg shadow-primary-200"
                  >
                    Save Plan Settings
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LIVE PREVIEW MODAL */}
      <AnimatePresence>
        {isPreviewOpen && previewPlanData && (
          <div className="fixed inset-0 z-[100] overflow-y-auto flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 text-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden relative z-50 p-8 border border-white/10"
            >
              <div className="flex justify-between items-center mb-8">
                <span className="text-[10px] font-bold text-primary-400 font-bold flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Live Landing Card Preview
                </span>
                <button 
                  onClick={() => setIsPreviewOpen(false)} 
                  className="p-1 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Pricing Card Simulation */}
              <div className={`relative rounded-3xl p-6 border transition-all ${
                previewPlanData.isPopular 
                  ? 'bg-slate-800 border-primary-500 shadow-xl shadow-primary-500/5 ring-2 ring-primary-500/20' 
                  : 'bg-slate-900/50 border-white/10'
              }`}>
                {previewPlanData.isPopular && (
                  <span className="absolute -top-3 right-6 px-3 py-1 bg-primary-600 rounded-full text-[9px] font-bold font-bold text-white shadow-lg shadow-primary-900/20">
                    Most Popular
                  </span>
                )}
                
                <h3 className="text-xl font-bold uppercase tracking-wider text-white">{previewPlanData.name}</h3>
                <p className="text-xs font-bold text-slate-400 mt-2 line-clamp-2 h-8">{previewPlanData.description}</p>
                
                <div className="my-6">
                  <span className="text-5xl font-black tracking-tighter text-white">
                    {getSymbol()}{previewPlanData.monthlyPrice}
                  </span>
                  <span className="text-sm font-semibold text-slate-400 ml-1">/mo</span>
                </div>

                <div className="space-y-3.5 mb-8 border-t border-white/5 pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-350">{previewPlanData.maxEmployees === 9999 ? 'Unlimited' : `Up to ${previewPlanData.maxEmployees}`} Employees</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                    <span className="text-xs font-bold text-slate-350">{previewPlanData.supportLevel}</span>
                  </div>
                  {previewPlanData.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                      <span className="text-xs font-bold text-slate-350">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  type="button"
                  className={`w-full py-4.5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-md transition-all text-center block ${
                    previewPlanData.isPopular
                      ? 'bg-primary-600 text-white hover:bg-primary-750'
                      : 'bg-white/5 border border-white/10 text-white hover:bg-white/10'
                  }`}
                >
                  {previewPlanData.buttonText}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default PricingManagement;
