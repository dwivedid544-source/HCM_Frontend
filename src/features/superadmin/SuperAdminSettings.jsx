import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Monitor, 
  Clock, 
  Lock, 
  Database, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  Info,
  Sliders,
  CreditCard,
  Cpu,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useTheme } from '../../hooks/ThemeContext';
import { useCurrency } from '../../hooks/useCurrency';
import { settingsAPI } from '../../utils/apiService';

const SuperAdminSettings = () => {
  const superAdminContext = useSuperAdmin();
  const { theme, toggleTheme } = useTheme();
  const { refreshCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState('system');
  const [isLoading, setIsLoading] = useState(true);

  // Local helper to trigger toast messages
  const showToast = (message, type = 'success') => {
    if (superAdminContext?.showToast) {
      superAdminContext.showToast(message, type);
    } else {
      window.dispatchEvent(new CustomEvent('app_toast', { detail: { message, type } }));
    }
  };

  // State for all settings
  const [settings, setSettings] = useState({
    system: {
      platformMode: 'Production',
      maxOrgs: 'Unlimited',
      defaultTimezone: 'UTC+00:00 (London)',
      masterCurrency: 'USD ($) - US Dollar'
    },
    security: {
      globalMFA: true,
      auditLogRetention: '90 Days',
      failedLoginAttempts: 5,
      ipWhitelisting: false
    },
    billing: {
      basePricePerUser: 8.00,
      freeTrialDays: 14,
      gracePeriodDays: 7,
      invoiceInterval: 'Monthly'
    },
    aiConfig: {
      primaryModel: 'Google Gemini 1.5 Pro',
      resumeScanAutoRank: true,
      matchingThreshold: 75,
      apiRateLimit: 1200
    }
  });

  // Fetch settings from API on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await settingsAPI.getSettings();
        const data = res.data.data;
        if (data) {
          setSettings({
            system: {
              platformMode: data.platformMode || 'Production',
              maxOrgs: data.maxOrgs || 'Unlimited',
              defaultTimezone: data.defaultTimezone || 'UTC+00:00 (London)',
              masterCurrency: data.masterCurrency || 'USD ($) - US Dollar'
            },
            security: {
              globalMFA: data.globalMFA ?? true,
              auditLogRetention: data.auditLogRetention || '90 Days',
              failedLoginAttempts: data.failedLoginAttempts || 5,
              ipWhitelisting: data.ipWhitelisting ?? false
            },
            billing: {
              basePricePerUser: data.basePricePerUser || 8.00,
              freeTrialDays: data.freeTrialDays || 14,
              gracePeriodDays: data.gracePeriodDays || 7,
              invoiceInterval: data.invoiceInterval || 'Monthly'
            },
            aiConfig: {
              primaryModel: data.primaryModel || 'Google Gemini 1.5 Pro',
              resumeScanAutoRank: data.resumeScanAutoRank ?? true,
              matchingThreshold: data.matchingThreshold || 75,
              apiRateLimit: data.apiRateLimit || 1200
            }
          });
        }
      } catch (err) {
        console.error('Failed to load superadmin settings:', err);
        showToast('Failed to load settings from server.', 'error');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    try {
      const payload = {
        platformMode: settings.system.platformMode,
        maxOrgs: settings.system.maxOrgs,
        defaultTimezone: settings.system.defaultTimezone,
        masterCurrency: settings.system.masterCurrency,
        globalMFA: settings.security.globalMFA,
        auditLogRetention: settings.security.auditLogRetention,
        failedLoginAttempts: settings.security.failedLoginAttempts,
        ipWhitelisting: settings.security.ipWhitelisting,
        basePricePerUser: settings.billing.basePricePerUser,
        freeTrialDays: settings.billing.freeTrialDays,
        gracePeriodDays: settings.billing.gracePeriodDays,
        invoiceInterval: settings.billing.invoiceInterval,
        primaryModel: settings.aiConfig.primaryModel,
        resumeScanAutoRank: settings.aiConfig.resumeScanAutoRank,
        matchingThreshold: settings.aiConfig.matchingThreshold,
        apiRateLimit: settings.aiConfig.apiRateLimit
      };
      
      await settingsAPI.updateSettings(payload);
      await refreshCurrency();
      showToast('Global platform configurations saved and synchronized successfully.');
    } catch (err) {
      console.error(err);
      showToast('Failed to save settings. Please try again.', 'error');
    }
  };

  const handleReset = () => {
    const defaults = {
      system: {
        platformMode: 'Production',
        maxOrgs: 'Unlimited',
        defaultTimezone: 'UTC+00:00 (London)',
        masterCurrency: 'USD ($) - US Dollar'
      },
      security: {
        globalMFA: true,
        auditLogRetention: '90 Days',
        failedLoginAttempts: 5,
        ipWhitelisting: false
      },
      billing: {
        basePricePerUser: 8.00,
        freeTrialDays: 14,
        gracePeriodDays: 7,
        invoiceInterval: 'Monthly'
      },
      aiConfig: {
        primaryModel: 'Google Gemini 1.5 Pro',
        resumeScanAutoRank: true,
        matchingThreshold: 75,
        apiRateLimit: 1200
      }
    };
    setSettings(defaults);
    showToast('Platform defaults restored. Please save to apply changes globally.');
  };

  const updateSettingField = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const menuItems = [
    { id: 'system', label: 'Platform Core', icon: Monitor, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30' },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' },
    { id: 'billing', label: 'Billing & Tiers', icon: CreditCard, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' },
    { id: 'aiConfig', label: 'AI & ML Engine', icon: Cpu, color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none max-w-7xl mx-auto text-slate-800 dark:text-slate-100">
      {isLoading && (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      )}
      {!isLoading && (
        <>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Global Platform Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-1">Configure global policies, SaaS billing parameters, security gates, and AI capabilities</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="px-6 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-350 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
            <RotateCcw size={18} />
            <span>Reset Defaults</span>
          </button>
          <button onClick={handleSave} className="btn-primary px-8 py-2.5 font-bold flex items-center gap-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 dark:shadow-none">
             <Save size={18} />
             <span>Save All Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* Navigation Tab List */}
         <div className="lg:col-span-3 space-y-4">
            <div className="card p-4 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[2rem] shadow-sm">
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-4 p-4">Categories</p>
               <nav className="space-y-2">
                  {menuItems.map((item) => (
                     <button
                       key={item.id}
                       onClick={() => setActiveTab(item.id)}
                       className={cn(
                          "w-full group p-4 rounded-2xl transition-all text-left flex items-center justify-between",
                          activeTab === item.id 
                          ? "bg-slate-900 dark:bg-slate-800 text-white shadow-xl shadow-slate-200/50 dark:shadow-none" 
                          : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-850/50 hover:text-slate-900 dark:hover:text-white"
                       )}
                     >
                        <div className="flex items-center gap-3">
                           <item.icon size={20} className={cn(activeTab === item.id ? "text-primary-400" : "text-slate-400")} />
                           <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className={cn("opacity-0 transition-opacity", activeTab === item.id ? "opacity-100" : "group-hover:opacity-40")} />
                     </button>
                  ))}
               </nav>
            </div>
         </div>

         {/* Settings Panel Area */}
         <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
              {activeTab === 'system' && (
                 <motion.div key="system" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-[2rem] shadow-sm space-y-8">
                       <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-2xl">
                             <Monitor size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Platform Core Configuration</h3>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control environments, tenants limits and localization defaults</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-bold px-1">Active Engine Mode</label>
                             <select value={settings.system.platformMode} onChange={e => updateSettingField('system', 'platformMode', e.target.value)} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
                                <option value="Production">Production (Stable)</option>
                                <option value="Maintenance">Maintenance Mode (Block logins)</option>
                                <option value="Sandbox Debug">Sandbox Debug (API mock logs enabled)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-bold px-1">Maximum Organization Tenants</label>
                             <select value={settings.system.maxOrgs} onChange={e => updateSettingField('system', 'maxOrgs', e.target.value)} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
                                <option value="10">10 Organizations Max</option>
                                <option value="50">50 Organizations Max</option>
                                <option value="100">100 Organizations Max</option>
                                <option value="Unlimited">Unlimited Organizations</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Global Default Timezone</label>
                             <div className="relative">
                                <Clock className="absolute left-4 top-3 text-slate-400" size={18} />
                                <select value={settings.system.defaultTimezone} onChange={e => updateSettingField('system', 'defaultTimezone', e.target.value)} className="input-field w-full pl-12 pr-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
                                   <option value="UTC+00:00 (London)">UTC+00:00 (London)</option>
                                   <option value="UTC-05:00 (Eastern Standard Time)">UTC-05:00 (Eastern Standard Time)</option>
                                   <option value="UTC+05:30 (Calcutta / India)">UTC+05:30 (Calcutta / India)</option>
                                </select>
                             </div>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Master Ledger Currency</label>
                             <select value={settings.system.masterCurrency} onChange={e => updateSettingField('system', 'masterCurrency', e.target.value)} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
                                <option value="USD ($) - US Dollar">USD ($) - US Dollar</option>
                                <option value="EUR (€) - Euro">EUR (€) - Euro</option>
                                <option value="GBP (£) - British Pound">GBP (£) - British Pound</option>
                                <option value="INR (₹) - Indian Rupee">INR (₹) - Indian Rupee</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}

              {activeTab === 'security' && (
                 <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-[2rem] shadow-sm space-y-8">
                       <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                             <ShieldCheck size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security & Access Protocols</h3>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Enforce system-wide verification policies and audit criteria</p>
                          </div>
                       </div>

                       <div className="space-y-6">
                          <div className="flex items-center justify-between p-6 bg-slate-900 border border-white/5 rounded-[2rem] shadow-xl relative overflow-hidden group">
                             <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 to-transparent pointer-events-none" />
                             <div className="relative z-10 flex items-center gap-5">
                                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-emerald-400 backdrop-blur-md shadow-md border border-white/15">
                                   <Lock size={24} />
                                </div>
                                <div>
                                   <h4 className="text-md font-extrabold text-white leading-none mb-2 tracking-tight">System-Wide MFA Enforcement</h4>
                                   <p className="text-[11px] font-medium text-slate-450 tracking-tight">Require multi-factor validation for all root administrators and tenant owners.</p>
                                </div>
                             </div>
                             <div className="relative z-10" onClick={() => updateSettingField('security', 'globalMFA', !settings.security.globalMFA)}>
                                <div className={cn("w-12 h-6 rounded-full p-1 cursor-pointer transition-all shadow-md", settings.security.globalMFA ? "bg-emerald-500" : "bg-slate-700")}>
                                   <div className={cn("w-4 h-4 bg-white rounded-full transition-all", settings.security.globalMFA ? "ml-6" : "ml-0")} />
                                </div>
                             </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                             <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Audit Logs Preservation Period</label>
                                <select value={settings.security.auditLogRetention} onChange={e => updateSettingField('security', 'auditLogRetention', e.target.value)} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
                                   <option value="30 Days">30 Days</option>
                                   <option value="90 Days">90 Days</option>
                                   <option value="180 Days">180 Days</option>
                                   <option value="365 Days">1 Year (Regulatory compliance)</option>
                                </select>
                             </div>
                             <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Max Failed Logins Lockout Gate</label>
                                <select value={settings.security.failedLoginAttempts} onChange={e => updateSettingField('security', 'failedLoginAttempts', parseInt(e.target.value))} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
                                   <option value="3">3 Attempts (Highly secure)</option>
                                   <option value="5">5 Attempts (Standard)</option>
                                   <option value="10">10 Attempts (Relaxed)</option>
                                </select>
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}

              {activeTab === 'billing' && (
                 <motion.div key="billing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-[2rem] shadow-sm space-y-8">
                       <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                             <CreditCard size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Billing & Monetization Parameters</h3>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control pricing tiers, free trial periods and invoice intervals</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Base Subscription Price Per User ($ / month)</label>
                             <input type="number" step="0.5" value={settings.billing.basePricePerUser} onChange={e => updateSettingField('billing', 'basePricePerUser', parseFloat(e.target.value))} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">New Tenant Free Trial Duration (Days)</label>
                             <input type="number" value={settings.billing.freeTrialDays} onChange={e => updateSettingField('billing', 'freeTrialDays', parseInt(e.target.value))} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Invoice Payment Grace Period (Days)</label>
                             <input type="number" value={settings.billing.gracePeriodDays} onChange={e => updateSettingField('billing', 'gracePeriodDays', parseInt(e.target.value))} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Standard Invoicing Cycle</label>
                             <select value={settings.billing.invoiceInterval} onChange={e => updateSettingField('billing', 'invoiceInterval', e.target.value)} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
                                <option value="Monthly">Monthly Invoicing</option>
                                <option value="Quarterly">Quarterly Invoicing</option>
                                <option value="Annually">Annually Invoicing (Discounted)</option>
                             </select>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}

              {activeTab === 'aiConfig' && (
                 <motion.div key="aiConfig" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                    <div className="card p-8 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-850 rounded-[2rem] shadow-sm space-y-8">
                       <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-2xl">
                             <Cpu size={24} />
                          </div>
                          <div>
                             <h3 className="text-xl font-bold text-slate-900 dark:text-white">AI & ML Processing Engine</h3>
                             <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Control the central models, scanning algorithms, and API throttling limits</p>
                          </div>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Primary Orchestration Model</label>
                             <select value={settings.aiConfig.primaryModel} onChange={e => updateSettingField('aiConfig', 'primaryModel', e.target.value)} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700">
                                <option value="Google Gemini 1.5 Pro">Google Gemini 1.5 Pro (Recommended)</option>
                                <option value="GPT-4o Stable">GPT-4o Stable (Fast)</option>
                                <option value="Anthropic Claude 3.5 Sonnet">Claude 3.5 Sonnet (Analytical)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">API Node Rate Throttling Limit (req / min)</label>
                             <input type="number" value={settings.aiConfig.apiRateLimit} onChange={e => updateSettingField('aiConfig', 'apiRateLimit', parseInt(e.target.value))} className="input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Auto-Rank Resume Matching Threshold Score (%)</label>
                             <div className="flex items-center gap-4">
                                <input type="range" min="50" max="95" value={settings.aiConfig.matchingThreshold} onChange={e => updateSettingField('aiConfig', 'matchingThreshold', parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer accent-primary-600" />
                                <span className="text-sm font-bold text-slate-900 dark:text-white shrink-0 w-10 text-right">{settings.aiConfig.matchingThreshold}%</span>
                             </div>
                          </div>
                          <div className="space-y-2 flex flex-col justify-center">
                             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent">
                                <div>
                                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200">ML Auto-Scanning On Application</span>
                                   <p className="text-[10px] text-slate-500 dark:text-slate-400">Trigger neural analysis immediately upon upload</p>
                                </div>
                                <input type="checkbox" checked={settings.aiConfig.resumeScanAutoRank} onChange={e => updateSettingField('aiConfig', 'resumeScanAutoRank', e.target.checked)} className="w-5 h-5 rounded-lg accent-primary-600 cursor-pointer" />
                             </div>
                          </div>
                       </div>
                    </div>
                 </motion.div>
              )}
            </AnimatePresence>
         </div>
      </div>
      </>
      )}
    </div>
  );
};

export default SuperAdminSettings;
