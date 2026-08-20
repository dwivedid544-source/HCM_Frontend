import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  ShieldCheck, 
  Bell, 
  Monitor, 
  Clock, 
  Lock, 
  Save, 
  RotateCcw, 
  ChevronRight, 
  Eye,
  EyeOff,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const EmployeeSettings = () => {
  const { showToast, profile, submitResignation } = useEmployee();
  const [activeTab, setActiveTab] = usePersistedTab('emp_settings', 'general');

  const [resignationData, setResignationData] = useState({
    reason: '',
    lastWorkingDay: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  });

  const handleSubmitResignation = async () => {
    if (!resignationData.reason || !resignationData.lastWorkingDay) {
      showToast('All fields are required.', 'error');
      return;
    }
    const res = await submitResignation(resignationData);
    if (res?.success) {
      setResignationData({ reason: '', lastWorkingDay: '' });
    }
  };

  const [settings, setSettings] = useState({
    general: {
      fullname: 'John Doe',
      email: 'john.doe@hcm.ai',
      timezone: 'UTC -08:00 (Pacific Time)',
      language: 'English (US)',
      dateFormat: 'MM/DD/YYYY'
    },
    security: {
      twoFactor: true,
      loginAlerts: true
    },
    notifications: {
      emailAlerts: true,
      attendanceAlerts: true,
      payrollAlerts: true,
      performanceAlerts: true,
      browserNotif: false,
    },
    preferences: {
      theme: 'System Default',
      compactMode: false,
      autoRefresh: true
    }
  });

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const updateSetting = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleSave = () => {
    showToast('Settings updated successfully');
  };

  const menuItems = [
    { id: 'general', label: 'General', icon: Monitor },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'resignation', label: 'Resignation', icon: Clock },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Employee Settings</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Manage your account preferences and security</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => showToast('Settings reset to defaults', 'info')} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2">
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
          <button onClick={handleSave} className="btn-primary px-8 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200 active:scale-95 transition-all">
             <Save size={18} />
             <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* Navigation Tab List */}
         <div className="lg:col-span-3 space-y-4">
            <div className="card p-4  min-h-[400px]">
               <p className="text-[10px] font-bold text-slate-400 mb-6 px-4 pt-4">Categories</p>
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
         <div className="lg:col-span-9">
            <AnimatePresence mode="wait">
               {activeTab === 'general' && (
                  <motion.div key="general" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="card p-8 md:p-10  space-y-10">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                           <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                              <Monitor size={24} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">General Information</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Display Name</label>
                              <input type="text" value={settings.general.fullname} onChange={e => updateSetting('general', 'fullname', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700" />
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Preferred Language</label>
                              <select value={settings.general.language} onChange={e => updateSetting('general', 'language', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
                                 <option>English (US)</option>
                                 <option>Spanish (ES)</option>
                                 <option>French (FR)</option>
                              </select>
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Local Timezone</label>
                              <div className="relative">
                                 <Clock className="absolute left-4 top-5 text-slate-300" size={18} />
                                 <select value={settings.general.timezone} onChange={e => updateSetting('general', 'timezone', e.target.value)} className="input-field h-14 pl-12 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
                                    <option>UTC -08:00 (Pacific Time)</option>
                                    <option>UTC -05:00 (Eastern Time)</option>
                                    <option>UTC +00:00 (London)</option>
                                 </select>
                              </div>
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Date Format</label>
                              <select value={settings.general.dateFormat} onChange={e => updateSetting('general', 'dateFormat', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
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
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Credentials</h3>
                        </div>

                        <div className="space-y-8">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="space-y-2 text-left">
                                 <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">New Password</label>
                                 <div className="relative">
                                    <input 
                                      type={showPassword.new ? 'text' : 'password'} 
                                      className="input-field h-14 bg-slate-50 border-transparent pr-12 font-bold" 
                                      placeholder="••••••••"
                                      value={passwords.new}
                                      onChange={e => setPasswords({...passwords, new: e.target.value})}
                                    />
                                    <button onClick={() => setShowPassword({...showPassword, new: !showPassword.new})} className="absolute right-4 top-5 text-slate-400">
                                       {showPassword.new ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                 </div>
                              </div>
                              <div className="space-y-2 text-left">
                                 <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Confirm Password</label>
                                 <div className="relative">
                                    <input 
                                      type={showPassword.confirm ? 'text' : 'password'} 
                                      className="input-field h-14 bg-slate-50 border-transparent pr-12 font-bold" 
                                      placeholder="••••••••"
                                      value={passwords.confirm}
                                      onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                                    />
                                    <button onClick={() => setShowPassword({...showPassword, confirm: !showPassword.confirm})} className="absolute right-4 top-5 text-slate-400">
                                       {showPassword.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                                 <div className="text-left">
                                    <p className="text-sm font-bold text-slate-700">Two-Factor Auth</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Extra security layer</p>
                                 </div>
                                 <button onClick={() => updateSetting('security', 'twoFactor', !settings.security.twoFactor)} className={cn("w-12 h-6 rounded-full p-1 transition-colors", settings.security.twoFactor ? "bg-emerald-500" : "bg-slate-300")}>
                                    <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", settings.security.twoFactor ? "translate-x-6" : "translate-x-0")} />
                                 </button>
                              </div>
                              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                                 <div className="text-left">
                                    <p className="text-sm font-bold text-slate-700">Login Alerts</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Get notified on login</p>
                                 </div>
                                 <button onClick={() => updateSetting('security', 'loginAlerts', !settings.security.loginAlerts)} className={cn("w-12 h-6 rounded-full p-1 transition-colors", settings.security.loginAlerts ? "bg-emerald-500" : "bg-slate-300")}>
                                    <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", settings.security.loginAlerts ? "translate-x-6" : "translate-x-0")} />
                                 </button>
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
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Communication Prefs</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {[
                              { id: 'emailAlerts', label: 'Email Notifications' },
                              { id: 'attendanceAlerts', label: 'Attendance Reminders' },
                              { id: 'payrollAlerts', label: 'Payroll Updates' },
                              { id: 'performanceAlerts', label: 'Review Alerts' },
                              { id: 'browserNotif', label: 'Browser Notifications' },
                           ].map(item => (
                              <div key={item.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
                                 <span className="text-sm font-bold text-slate-700">{item.label}</span>
                                 <button onClick={() => updateSetting('notifications', item.id, !settings.notifications[item.id])} className={cn("w-10 h-5 rounded-full p-1 transition-colors", settings.notifications[item.id] ? "bg-primary-500" : "bg-slate-300")}>
                                    <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", settings.notifications[item.id] ? "translate-x-5" : "translate-x-0")} />
                                 </button>
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
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Interface Customization</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Theme Mode</label>
                              <select value={settings.preferences.theme} onChange={e => updateSetting('preferences', 'theme', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
                                 <option>System Default</option>
                                 <option>Light Mode</option>
                                 <option>Dark Mode</option>
                              </select>
                           </div>
                           <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl cursor-pointer" onClick={() => updateSetting('preferences', 'compactMode', !settings.preferences.compactMode)}>
                              <div className="text-left">
                                 <p className="text-sm font-bold text-slate-700">Compact Mode</p>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">Denser UI layout</p>
                              </div>
                              <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", settings.preferences.compactMode ? "bg-emerald-500" : "bg-slate-300")}>
                                 <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", settings.preferences.compactMode ? "translate-x-6" : "translate-x-0")} />
                              </div>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               )}

               {activeTab === 'resignation' && (
                  <motion.div key="resignation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-8">
                     <div className="card p-10 space-y-10">
                        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
                           <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl">
                              <Clock size={24} />
                           </div>
                           <h3 className="text-xl font-bold text-slate-900 dark:text-white">Resignation Request</h3>
                        </div>

                        {profile?.lifecycleStatus === 'ON_NOTICE' || profile?.lifecycleStatus === 'TERMINATED' ? (
                           <div className="p-6 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-left">
                              <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                                 Your resignation/exit request is currently in progress.
                              </p>
                              <p className="text-xs font-bold text-slate-500 mt-2">
                                 Status: <span className="font-bold text-amber-600">{profile.lifecycleStatus}</span>
                              </p>
                              {profile.probationEnd && (
                                 <p className="text-xs font-semibold text-slate-500 mt-1">
                                    Estimated Last Working Day: {new Date(profile.probationEnd).toLocaleDateString()}
                                 </p>
                              )}
                           </div>
                        ) : (
                           <div className="space-y-6 text-left">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                 <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-450 dark:text-slate-500 font-bold">Proposed Last Working Day *</label>
                                    <input 
                                       type="date" 
                                       value={resignationData.lastWorkingDay} 
                                       onChange={e => setResignationData({...resignationData, lastWorkingDay: e.target.value})} 
                                       className="input-field h-12"
                                    />
                                 </div>
                              </div>
                              <div className="space-y-2">
                                 <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Reason for Resignation *</label>
                                 <textarea 
                                    rows={4} 
                                    placeholder="Please share the reasons for your departure..."
                                    value={resignationData.reason} 
                                    onChange={e => setResignationData({...resignationData, reason: e.target.value})} 
                                    className="input-field p-4 text-sm"
                                 />
                              </div>
                              <div className="pt-2 flex justify-end">
                                 <button 
                                    onClick={handleSubmitResignation}
                                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-sm font-bold shadow-md shadow-rose-600/25 transition-all"
                                 >
                                    Submit Resignation
                                 </button>
                              </div>
                           </div>
                        )}
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;
