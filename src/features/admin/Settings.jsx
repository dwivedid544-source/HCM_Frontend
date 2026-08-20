import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Bell, 
  Monitor, 
  Clock, 
  Globe, 
  Lock, 
  Database, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  Info,
  Type,
  Eye,
  Key,
  Shield,
  History,
  CloudUpload,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAdmin } from '../../context/AdminContext';
import { useSettings } from '../../context/SettingsContext';
import { useCurrency } from '../../hooks/useCurrency';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const Settings = () => {
  const { appSettings, updateSettings: updateAdminSettings, resetSettings, showToast } = useAdmin();
  const { settings: globalSettings, updateSettings: updateGlobalSettings } = useSettings();
  const { masterCurrency } = useCurrency();
  const [activeTab, setActiveTab] = usePersistedTab('admin_settings', 'general');

  const handleSave = () => {
    updateGlobalSettings(globalSettings);
    showToast('All configuration changes saved securely.');
  };

  const handleCountryCodeChange = (e) => {
    const phoneCode = e.target.value;
    updateAdminSettings('general', { countryCode: phoneCode });
    updateGlobalSettings({ defaultPhoneCountry: phoneCode });
  };

  const handleCurrencyChange = (e) => {
    // Deprecated: Currency is now managed globally by Super Admin
  };

  const menuItems = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'security', label: 'Security', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-8 sm:pb-12 animate-fade-in focus:outline-none h-full">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="hcm-page-title">System Settings</h1>
          <p className="text-slate-500 font-medium tracking-tight">Global platform preferences, security protocols and organization branding</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button onClick={resetSettings} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <RotateCcw size={18} />
            <span>Reset Defaults</span>
          </button>
          <button onClick={handleSave} className="btn-primary px-8 py-3 font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-200 active:scale-95 transition-transform">
             <Save size={18} />
             <span>Save All Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-8 xl:gap-10 items-start">
         {/* Navigation Tab List */}
         <div className="xl:col-span-3 space-y-4">
            <div className="card p-4 lg:h-125">
               <p className="text-[10px] font-bold text-slate-400 mb-6 p-4">Configuration Tabs</p>
               <nav className="flex flex-row xl:flex-col gap-2 overflow-x-auto xl:overflow-visible pb-2 xl:pb-0">
                  {menuItems.map((item) => (
                     <button
                       key={item.id}
                       onClick={() => setActiveTab(item.id)}
                       className={cn(
                          "w-full group p-4 rounded-2xl transition-all text-left flex items-center justify-between",
                          activeTab === item.id 
                          ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                       )}
                     >
                        <div className="flex items-center gap-3">
                           <item.icon size={20} className={cn(activeTab === item.id ? "text-primary-400" : "text-slate-300")} />
                           <span className="text-sm font-bold tracking-tight">{item.label}</span>
                        </div>
                        <ChevronRight size={16} className={cn("opacity-0 transition-opacity", activeTab === item.id ? "opacity-100" : "group-hover:opacity-40")} />
                     </button>
                  ))}
               </nav>
            </div>
         </div>

         {/* Settings Panel Area */}
         <div className="xl:col-span-9 space-y-6 sm:space-y-8">
            {activeTab === 'general' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="card p-10  space-y-10">
                     <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                           <Monitor size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">General Preferences</h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Country Code</label>
                           <select value={globalSettings?.defaultPhoneCountry || '+91'} onChange={handleCountryCodeChange} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 notranslate">
                              <option value="+91">🇮🇳 India (+91)</option>
                              <option value="+1">🇺🇸 United States (+1)</option>
                              <option value="+44">🇬🇧 United Kingdom (+44)</option>
                              <option value="+49">🇪🇺 Germany (Europe) (+49)</option>
                              <option value="+971">🇦🇪 United Arab Emirates (+971)</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Primary Timezone</label>
                           <div className="relative">
                              <Clock className="absolute left-4 top-4 text-slate-300" size={18} />
                              <select value={appSettings.general.timezone} onChange={e => updateAdminSettings('general', { timezone: e.target.value })} className="input-field h-14 pl-12 bg-slate-50 border-transparent font-bold text-slate-700 notranslate">
                                 <option value="UTC-08:00 (Pacific Standard Time)">UTC-08:00 (Pacific Standard Time)</option>
                                 <option value="UTC+00:00 (London)">UTC+00:00 (London)</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Date Format</label>
                           <select value={appSettings.general.dateFormat} onChange={e => updateAdminSettings('general', { dateFormat: e.target.value })} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 notranslate">
                              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Default Currency</label>
                           <div className="input-field h-14 bg-slate-100 border-transparent font-bold text-slate-500 flex items-center justify-between cursor-not-allowed">
                              <span>{masterCurrency}</span>
                              <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                 <Lock size={14} />
                                 <span>Inherited from Master Ledger</span>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'security' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="card p-10  space-y-10">
                     <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                           <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security & Authentication</h3>
                     </div>

                     <div className="space-y-8">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-6 sm:p-8 bg-slate-900 border border-white/5 rounded-4xl shadow-2xl relative overflow-hidden group">
                           <div className="absolute inset-0 bg-linear-to-tr from-primary-600/20 to-transparent pointer-events-none" />
                           <div className="relative z-10 flex items-center gap-6">
                              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-primary-400 backdrop-blur-md shadow-lg border border-white/10">
                                 <Lock size={28} />
                              </div>
                              <div>
                                 <h4 className="text-lg font-extrabold text-white leading-none mb-2 tracking-tight">Two-Factor Auth (2FA)</h4>
                                 <p className="text-xs font-medium text-slate-400 tracking-tight">Enforce biometric or app-based authentication for all admin users.</p>
                              </div>
                           </div>
                           <div className="relative z-10" onClick={() => updateAdminSettings('security', { twoFactor: !appSettings.security.twoFactor })}>
                              <div className={cn("w-14 h-7 rounded-full p-1 cursor-pointer shadow-lg custom-transition", appSettings.security.twoFactor ? "bg-emerald-500 shadow-emerald-500/20" : "bg-slate-700")}>
                                 <div className={cn("w-5 h-5 bg-white rounded-full custom-transition", appSettings.security.twoFactor ? "ml-auto" : "ml-0")} />
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                           <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                              <label className="text-[10px] font-bold text-slate-400">Password Policy</label>
                              <div className="space-y-4">
                                 {['Min 12 Characters', 'Mix of Alphanumeric', 'Must change every 90 days'].map((p, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                       <CheckCircle2 size={16} className="text-emerald-500" />
                                       <span className="text-xs font-bold text-slate-700 uppercase tracking-tight">{p}</span>
                                    </div>
                                 ))}
                              </div>
                           </div>

                           <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 flex flex-col justify-center">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Session Protocol</label>
                              <div className="flex items-center justify-between">
                                 <span className="text-sm font-bold text-slate-900 tracking-tight">Auto-Logout Timeout</span>
                                 <select value={appSettings.security.sessionTimeout} onChange={e => updateAdminSettings('security', { sessionTimeout: e.target.value })} className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:outline-none">
                                    <option value="1 Minute">1 Minute (Demo / Test)</option>
                                    <option value="5 Minutes">5 Minutes</option>
                                    <option value="15 Minutes">15 Minutes (Default)</option>
                                    <option value="30 Minutes">30 Minutes</option>
                                    <option value="1 Hour">1 Hour</option>
                                    <option value="2 Hours">2 Hours</option>
                                 </select>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Settings;
