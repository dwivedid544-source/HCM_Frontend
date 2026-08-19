import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Bell, 
  Monitor, 
  Clock, 
  Globe, 
  Lock, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  Zap, 
  Eye,
  Key,
  Smartphone,
  CheckCircle2,
  Trash2,
  EyeOff
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import { authAPI } from '../../utils/apiService';

const ManagerSettings = () => {
  const { profile, updateProfile, showToast } = useManager();
  const [activeTab, setActiveTab] = useState('general');

  const [settings, setSettings] = useState({
    general: {
      fullName: '',
      email: '',
      timezone: 'UTC-05:00 (Scranton Efficiency Time)',
      language: 'English (US)',
      dateFormat: 'MM/DD/YYYY'
    },
    security: {
      twoFactor: true,
      loginAlerts: true
    },
    notifications: {
      emailAlerts: true,
      leaveAlerts: true,
      kpiAlerts: true,
      taskAlerts: true,
      browserNotif: false,
    },
    preferences: {
      theme: 'System Default',
      tableRows: '10',
      autoRefresh: true,
      defaultPage: 'Dashboard'
    }
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  // Load settings from localStorage and sync with profile
  useEffect(() => {
    if (profile) {
      const localPrefs = localStorage.getItem(`manager_settings_${profile.id}`);
      let parsedPrefs = {};
      if (localPrefs) {
        try {
          parsedPrefs = JSON.parse(localPrefs);
        } catch (e) {
          console.error(e);
        }
      }

      setSettings({
        general: {
          fullName: profile.fullName || '',
          email: profile.user?.email || '',
          timezone: parsedPrefs.general?.timezone || 'UTC-05:00 (Scranton Efficiency Time)',
          language: parsedPrefs.general?.language || 'English (US)',
          dateFormat: parsedPrefs.general?.dateFormat || 'MM/DD/YYYY'
        },
        security: {
          twoFactor: parsedPrefs.security?.twoFactor !== undefined ? parsedPrefs.security.twoFactor : true,
          loginAlerts: parsedPrefs.security?.loginAlerts !== undefined ? parsedPrefs.security.loginAlerts : true
        },
        notifications: {
          emailAlerts: parsedPrefs.notifications?.emailAlerts !== undefined ? parsedPrefs.notifications.emailAlerts : true,
          leaveAlerts: parsedPrefs.notifications?.leaveAlerts !== undefined ? parsedPrefs.notifications.leaveAlerts : true,
          kpiAlerts: parsedPrefs.notifications?.kpiAlerts !== undefined ? parsedPrefs.notifications.kpiAlerts : true,
          taskAlerts: parsedPrefs.notifications?.taskAlerts !== undefined ? parsedPrefs.notifications.taskAlerts : true,
          browserNotif: parsedPrefs.notifications?.browserNotif !== undefined ? parsedPrefs.notifications.browserNotif : false,
        },
        preferences: {
          theme: parsedPrefs.preferences?.theme || 'System Default',
          tableRows: parsedPrefs.preferences?.tableRows || '10',
          autoRefresh: parsedPrefs.preferences?.autoRefresh !== undefined ? parsedPrefs.preferences.autoRefresh : true,
          defaultPage: parsedPrefs.preferences?.defaultPage || 'Dashboard'
        }
      });
    }
  }, [profile]);

  const updateSetting = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleSave = async () => {
    if (!profile) return;
    try {
      if (!settings.general.fullName.trim()) {
        showToast('Full Name cannot be empty.', 'error');
        return;
      }
      await updateProfile({ fullName: settings.general.fullName });

      localStorage.setItem(`manager_settings_${profile.id}`, JSON.stringify(settings));
      showToast('Settings saved successfully.');
    } catch {
      showToast('Failed to save settings.', 'error');
    }
  };

  const handleReset = () => {
    if (!profile) return;
    localStorage.removeItem(`manager_settings_${profile.id}`);
    showToast('Defaults restored.');
    setSettings(prev => ({
      ...prev,
      general: {
        ...prev.general,
        timezone: 'UTC-05:00 (Scranton Efficiency Time)',
        language: 'English (US)',
        dateFormat: 'MM/DD/YYYY'
      },
      security: { twoFactor: true, loginAlerts: true },
      notifications: { emailAlerts: true, leaveAlerts: true, kpiAlerts: true, taskAlerts: true, browserNotif: false },
      preferences: { theme: 'System Default', tableRows: '10', autoRefresh: true, defaultPage: 'Dashboard' }
    }));
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      showToast('All password fields are required.', 'error');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      showToast('New passwords do not match.', 'error');
      return;
    }
    if (passwords.new.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }

    try {
      await authAPI.changePassword({
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      showToast('Password updated successfully!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      const errMsg = err.response?.data?.error?.message || 'Failed to update password.';
      showToast(errMsg, 'error');
    }
  };

  const inputClass = "input-field h-14 bg-white border-2 border-slate-100 hover:border-slate-200 focus:border-primary-400 focus:ring focus:ring-primary-100 shadow-sm font-bold text-slate-700";

  const menuItems = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Manager Settings</h1>
          <p className="text-slate-500 font-medium tracking-tight">Configure your region and platform preferences</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
          <button onClick={handleSave} className="btn-primary px-8 py-3 font-bold flex items-center gap-2 shadow-xl shadow-primary-200 active:scale-95 transition-transform">
             <Save size={18} />
             <span>Save All</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
         {/* Navigation Tab List */}
         <div className="lg:col-span-3 space-y-4">
            <div className="card p-4  min-h-[400px]">
               <p className="text-[10px] font-bold text-slate-400 mb-6 p-4">Categories</p>
               <nav className="space-y-2">
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
         <div className="lg:col-span-9 space-y-8">
            <AnimatePresence mode="wait">
               {activeTab === 'general' && (
                  <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="card p-10  space-y-10">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                              <Monitor size={24} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 text-left dark:text-white">General Preferences</h3>
                        </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2 text-left">
                               <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Manager Identity</label>
                               <input type="text" value={settings.general.fullName} onChange={e => updateSetting('general', 'fullName', e.target.value)} className={inputClass} />
                            </div>
                            <div className="space-y-2 text-left">
                               <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">System Language</label>
                               <select value={settings.general.language} onChange={e => updateSetting('general', 'language', e.target.value)} className={cn(inputClass, "appearance-none")}>
                                  <option>English (US)</option>
                                  <option>Spanish (ES)</option>
                                  <option>French (FR)</option>
                               </select>
                            </div>
                            <div className="space-y-2 text-left">
                               <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Primary Timezone</label>
                               <div className="relative">
                                  <Clock className="absolute left-4 top-4 text-slate-300" size={18} />
                                  <select value={settings.general.timezone} onChange={e => updateSetting('general', 'timezone', e.target.value)} className={cn(inputClass, "pl-12 appearance-none")}>
                                     <option>UTC-08:00 (Pacific Time)</option>
                                     <option>UTC-05:00 (Scranton Efficiency Time)</option>
                                     <option>UTC+00:00 (London)</option>
                                  </select>
                               </div>
                            </div>
                            <div className="space-y-2 text-left">
                               <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Date Format</label>
                               <select value={settings.general.dateFormat} onChange={e => updateSetting('general', 'dateFormat', e.target.value)} className={cn(inputClass, "appearance-none")}>
                                  <option>MM/DD/YYYY</option>
                                  <option>DD/MM/YYYY</option>
                                  <option>YYYY-MM-DD</option>
                               </select>
                            </div>
                         </div>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'security' && (
                  <motion.div key="security" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="card p-10  space-y-10">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                           <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                              <ShieldCheck size={24} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 text-left dark:text-white">Security & Access</h3>
                        </div>

                        <div className="space-y-8">
                           {/* Password Row */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                               <div className="space-y-2 text-left md:col-span-2">
                                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Current Password</label>
                                  <div className="relative">
                                     <input 
                                       type={showPassword.current ? 'text' : 'password'} 
                                       className={cn(inputClass, "pr-12")} 
                                       value={passwords.current}
                                       onChange={e => setPasswords({...passwords, current: e.target.value})}
                                       placeholder="Enter your current password"
                                     />
                                     <button onClick={() => setShowPassword({...showPassword, current: !showPassword.current})} className="absolute right-4 top-4 text-slate-400">
                                        {showPassword.current ? <EyeOff size={20} /> : <Eye size={20} />}
                                     </button>
                                  </div>
                               </div>
                               <div className="space-y-2 text-left">
                                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">New Password</label>
                                  <div className="relative">
                                     <input 
                                       type={showPassword.new ? 'text' : 'password'} 
                                       className={cn(inputClass, "pr-12")} 
                                       value={passwords.new}
                                       onChange={e => setPasswords({...passwords, new: e.target.value})}
                                       placeholder="At least 6 characters"
                                     />
                                     <button onClick={() => setShowPassword({...showPassword, new: !showPassword.new})} className="absolute right-4 top-4 text-slate-400">
                                        {showPassword.new ? <EyeOff size={20} /> : <Eye size={20} />}
                                     </button>
                                  </div>
                               </div>
                               <div className="space-y-2 text-left">
                                  <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Confirm Password</label>
                                  <div className="relative">
                                     <input 
                                       type={showPassword.confirm ? 'text' : 'password'} 
                                       className={cn(inputClass, "pr-12")} 
                                       value={passwords.confirm}
                                       onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                       placeholder="Re-enter new password"
                                     />
                                     <button onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute right-4 top-4 text-slate-400">
                                        {showPassword.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
                                     </button>
                                  </div>
                               </div>
                               <div className="md:col-span-2 text-right">
                                  <button onClick={handleUpdatePassword} className="btn-secondary px-6 py-2.5 font-bold shadow-md hover:bg-slate-50 transition-all">
                                     Update Password
                                  </button>
                               </div>
                            </div>

                           {/* Toggles */}
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => updateSetting('security', 'twoFactor', !settings.security.twoFactor)}>
                                 <div className="text-left">
                                    <p className="text-sm font-bold text-slate-700">Two-Factor Auth</p>
                                    <p className="text-[10px] font-bold text-slate-400 font-bold mt-1">Extra account safety</p>
                                 </div>
                                 <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", settings.security.twoFactor ? "bg-emerald-500" : "bg-slate-300")}>
                                    <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", settings.security.twoFactor ? "translate-x-6" : "translate-x-0")} />
                                 </div>
                              </div>
                              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => updateSetting('security', 'loginAlerts', !settings.security.loginAlerts)}>
                                 <div className="text-left">
                                    <p className="text-sm font-bold text-slate-700">Login Alerts</p>
                                    <p className="text-[10px] font-bold text-slate-400 font-bold mt-1">In-app notifications</p>
                                 </div>
                                 <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", settings.security.loginAlerts ? "bg-emerald-500" : "bg-slate-300")}>
                                    <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", settings.security.loginAlerts ? "translate-x-6" : "translate-x-0")} />
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'notifications' && (
                  <motion.div key="notifications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="card p-10  space-y-10">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                           <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                              <Bell size={24} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 text-left dark:text-white">Alerts & Notifications</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {[
                              { id: 'emailAlerts', label: 'Email Alerts' },
                              { id: 'leaveAlerts', label: 'Leave Requests' },
                              { id: 'kpiAlerts', label: 'KPI Thresholds' },
                              { id: 'taskAlerts', label: 'Team Task Updates' },
                           ].map(item => (
                              <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => updateSetting('notifications', item.id, !settings.notifications[item.id])}>
                                 <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                 <div className={cn("w-10 h-5 rounded-full p-1 transition-colors", settings.notifications[item.id] ? "bg-primary-500" : "bg-slate-300")}>
                                    <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", settings.notifications[item.id] ? "translate-x-5" : "translate-x-0")} />
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'preferences' && (
                  <motion.div key="preferences" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="card p-10  space-y-10">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                           <div className="p-3 bg-slate-50 text-slate-600 rounded-2xl">
                              <SettingsIcon size={24} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 text-left dark:text-white">User Interface Preferences</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-2 text-left md:col-span-2">
                               <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Rows Per Table</label>
                               <select value={settings.preferences.tableRows} onChange={e => updateSetting('preferences', 'tableRows', e.target.value)} className={cn(inputClass, "appearance-none")}>
                                  <option>10</option>
                                  <option>25</option>
                                  <option>50</option>
                                  <option>100</option>
                               </select>
                            </div>
                            <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl cursor-pointer hover:bg-slate-100 transition-colors md:col-span-2" onClick={() => updateSetting('preferences', 'autoRefresh', !settings.preferences.autoRefresh)}>
                               <div className="text-left">
                                  <p className="text-sm font-bold text-slate-700">Auto-Refresh Dashboards</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Keep data current</p>
                               </div>
                               <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", settings.preferences.autoRefresh ? "bg-emerald-500" : "bg-slate-300")}>
                                  <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", settings.preferences.autoRefresh ? "translate-x-6" : "translate-x-0")} />
                               </div>
                            </div>
                         </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};

export default ManagerSettings;
