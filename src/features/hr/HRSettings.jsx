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
  Save, 
  RotateCcw, 
  ChevronRight, 
  Zap, 
  Eye,
  Key,
  Smartphone,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useAuth } from '../../hooks/useAuth';
import { useCurrency } from '../../hooks/useCurrency';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const HRSettings = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const { showToast } = useHR();
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = usePersistedTab('hr_settings', 'general');

  const [settings, setSettings] = useState({
    general: {
      fullName: 'HR Manager',
      email: 'hr@globaltech.ai',
      phone: '9876543210',
      timezone: 'UTC-08:00 (Pacific Standard Time)',
      language: 'English (US)',
      dateFormat: 'MM/DD/YYYY'
    },
    security: {
      twoFactor: true,
      loginAlerts: true
    },
    notifications: {
      emailAlerts: true,
      interviewAlerts: true,
      candidateUpdates: true,
      offerAlerts: true,
      browserNotif: false,
      soundAlerts: true
    },
    preferences: {
      theme: 'System Default',
      compactMode: false,
      autoRefresh: true,
      defaultDashboard: 'Overview',
      rowsPerTable: '10'
    }
  });

  const [activeSessions, setActiveSessions] = useState([]);

  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });

  const updateSetting = (category, field, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleSave = () => {
    showToast('All configuration changes saved securely.');
  };

  const terminateSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    showToast('Session terminated successfully.');
  };

  const menuItems = [
    { id: 'general', label: 'General Profile', icon: Monitor },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Profile Settings</h1>
          <p className="text-slate-500 font-medium tracking-tight">Configure your HR dashboard preferences and security</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => showToast('Restored default preferences.')} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <RotateCcw size={18} />
            <span>Reset Defaults</span>
          </button>
          <button onClick={handleSave} className="btn-primary px-8 py-3 font-bold flex items-center gap-2 shadow-xl shadow-primary-200 active:scale-95 transition-transform">
             <Save size={18} />
             <span>Save Changes</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
         {/* Navigation Tab List */}
         <div className="lg:col-span-3 space-y-4">
            <div className="card p-4  min-h-[400px]">
               <p className="text-[10px] font-bold text-slate-400 mb-6 p-4">Settings Tabs</p>
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
            {activeTab === 'general' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="card p-10  space-y-10">
                     <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                           <Monitor size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">General Profile Settings</h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Full Name</label>
                           <input type="text" value={settings.general.fullName} onChange={e => updateSetting('general', 'fullName', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Email Address</label>
                           <input type="email" value={settings.general.email} onChange={e => updateSetting('general', 'email', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                           <PhoneInput name="phone" value={settings.general.phone} onChange={e => updateSetting('general', 'phone', e.target.value)} className="bg-slate-50 border-transparent font-bold text-slate-700" />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">System Language</label>
                           <select value={settings.general.language} onChange={e => updateSetting('general', 'language', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
                              <option>English (US)</option>
                              <option>Spanish (ES)</option>
                              <option>French (FR)</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Primary Timezone</label>
                           <div className="relative">
                              <Clock className="absolute left-4 top-4 text-slate-300" size={18} />
                              <select value={settings.general.timezone} onChange={e => updateSetting('general', 'timezone', e.target.value)} className="input-field h-14 pl-12 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
                                 <option>UTC-08:00 (Pacific Standard Time)</option>
                                 <option>UTC-05:00 (Eastern Standard Time)</option>
                                 <option>UTC+00:00 (London)</option>
                              </select>
                           </div>
                        </div>
                        <div className="space-y-2">
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
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="card p-10  space-y-10">
                     <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                        <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl">
                           <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h3>
                     </div>

                     <div className="space-y-8">
                        {/* Change Password */}
                        <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6 flex-1">
                           <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest dark:text-white">Change Account Password</h4>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {['current', 'new', 'confirm'].map((field) => (
                                 <div key={field} className={cn("space-y-2", field === 'current' ? "md:col-span-2" : "")}>
                                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">{field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm Password'}</label>
                                    <div className="relative">
                                       <input 
                                          type={showPassword[field] ? 'text' : 'password'} 
                                          value={passwords[field]} 
                                          onChange={e => setPasswords({...passwords, [field]: e.target.value})} 
                                          className="input-field h-12 bg-white pr-10 font-bold"
                                          placeholder="••••••••"
                                       />
                                       <button type="button" onClick={() => setShowPassword({...showPassword, [field]: !showPassword[field]})} className="absolute right-3 top-3 text-slate-400 hover:text-primary-600">
                                          {showPassword[field] ? <Eye size={18} /> : <Eye size={18} className="opacity-50" />}
                                       </button>
                                    </div>
                                 </div>
                              ))}
                              <div className="md:col-span-2 mt-2">
                                 <button className="btn-primary px-8 py-3 font-bold flex items-center gap-2 shadow-lg" onClick={() => {
                                    if(passwords.new && passwords.new === passwords.confirm) {
                                       showToast('Password updated securely.');
                                       setPasswords({current: '', new: '', confirm: ''});
                                    } else showToast('Error: Passwords do not match or are empty.', 'error');
                                 }}>
                                    <Key size={18} /> Update Password
                                 </button>
                              </div>
                           </div>
                        </div>

                        {/* Extra Security */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                           <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-300 transition-colors" onClick={() => updateSetting('security', 'twoFactor', !settings.security.twoFactor)}>
                              <div>
                                 <span className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1"><Lock size={16} className="text-primary-500" /> Two-Factor Auth </span>
                                 <span className="text-xs font-medium text-slate-500">Extra layer of security</span>
                              </div>
                              <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", settings.security.twoFactor ? "bg-emerald-500" : "bg-slate-300")}>
                                 <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", settings.security.twoFactor ? "translate-x-6" : "translate-x-0")} />
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-6 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-300 transition-colors" onClick={() => updateSetting('security', 'loginAlerts', !settings.security.loginAlerts)}>
                              <div>
                                 <span className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1"><Bell size={16} className="text-amber-500" /> Login Alerts </span>
                                 <span className="text-xs font-medium text-slate-500">Get notified on new devices</span>
                              </div>
                              <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", settings.security.loginAlerts ? "bg-emerald-500" : "bg-slate-300")}>
                                 <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", settings.security.loginAlerts ? "translate-x-6" : "translate-x-0")} />
                              </div>
                           </div>
                        </div>

                        {/* Active Sessions */}
                        <div className="pt-8 border-t border-slate-100 space-y-4">
                           <div className="flex items-center justify-between">
                              <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Sessions</h3>
                              {activeSessions.length > 1 && (
                                 <button onClick={() => {
                                    setActiveSessions(activeSessions.filter(s => s.lastActive === 'Current Session'));
                                    showToast('Logged out of all other devices.');
                                 }} className="text-xs font-bold text-rose-500 hover:text-rose-600">Logout All Devices</button>
                              )}
                           </div>
                           <div className="space-y-3">
                              {activeSessions.map(session => (
                                 <div key={session.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4">
                                       <div className="p-3 bg-white text-slate-400 rounded-xl shadow-sm">
                                          {session.device.includes('iPhone') ? <Smartphone size={18} /> : <Globe size={18} />}
                                       </div>
                                       <div>
                                          <p className="text-sm font-bold text-slate-900">{session.device} <span className="font-normal text-slate-500 ml-1">• {session.browser}</span></p>
                                          <p className="text-[10px] font-bold text-slate-400 mt-1">{session.ip} • <span className={session.lastActive === 'Current Session' ? 'text-emerald-500' : ''}>{session.lastActive}</span></p>
                                       </div>
                                    </div>
                                    {session.lastActive !== 'Current Session' && (
                                       <button onClick={() => terminateSession(session.id)} className="p-2 text-rose-500 bg-white rounded-lg hover:bg-rose-50 transition-colors shadow-sm" title="Revoke Access">
                                          <Trash2 size={16} />
                                       </button>
                                    )}
                                 </div>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'notifications' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="card p-10  space-y-10">
                     <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                           <Bell size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Notification Alerts</h3>
                     </div>

                     <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           {Object.entries(settings.notifications).map(([key, value]) => (
                              <div key={key} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent cursor-pointer hover:border-slate-200 transition-colors" onClick={() => updateSetting('notifications', key, !value)}>
                                 <span className="text-sm font-bold text-slate-700 capitalize">
                                    {key.replace(/([A-Z])/g, ' {getSymbol()}1').trim()}
                                 </span>
                                 <div className={cn("w-10 h-5 rounded-full p-1 transition-colors", value ? "bg-primary-500" : "bg-slate-300")}>
                                    <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", value ? "translate-x-5" : "translate-x-0")} />
                                 </div>
                              </div>
                           ))}
                        </div>
                        <div className="pt-6">
                           <button onClick={() => showToast('Preferences Saved')} className="btn-primary px-6 py-2.5 font-bold shadow-md">Save Preferences</button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            )}

            {activeTab === 'preferences' && (
               <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                  <div className="card p-10  space-y-10">
                     <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
                        <div className="p-3 bg-slate-100 text-slate-600 rounded-2xl">
                           <SettingsIcon size={24} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Dashboard Preferences</h3>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Interface Theme</label>
                           <select value={settings.preferences.theme} onChange={e => updateSetting('preferences', 'theme', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
                              <option>System Default</option>
                              <option>Light Theme</option>
                              <option>Dark Theme</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Default Dashboard View</label>
                           <select value={settings.preferences.defaultDashboard} onChange={e => updateSetting('preferences', 'defaultDashboard', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
                              <option>Overview</option>
                              <option>Hiring Pipeline</option>
                              <option>Candidates List</option>
                              <option>Interviews</option>
                           </select>
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Rows Per Table Page</label>
                           <select value={settings.preferences.rowsPerTable} onChange={e => updateSetting('preferences', 'rowsPerTable', e.target.value)} className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none">
                              <option>10 Rows</option>
                              <option>25 Rows</option>
                              <option>50 Rows</option>
                           </select>
                        </div>
                        
                        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent cursor-pointer hover:border-slate-200 transition-colors" onClick={() => updateSetting('preferences', 'compactMode', !settings.preferences.compactMode)}>
                              <span className="text-sm font-bold text-slate-700">Enable Compact Mode</span>
                              <div className={cn("w-10 h-5 rounded-full p-1 transition-colors", settings.preferences.compactMode ? "bg-primary-500" : "bg-slate-300")}>
                                 <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", settings.preferences.compactMode ? "translate-x-5" : "translate-x-0")} />
                              </div>
                           </div>
                           <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-transparent cursor-pointer hover:border-slate-200 transition-colors" onClick={() => updateSetting('preferences', 'autoRefresh', !settings.preferences.autoRefresh)}>
                              <span className="text-sm font-bold text-slate-700">Auto-Refresh Dashboards</span>
                              <div className={cn("w-10 h-5 rounded-full p-1 transition-colors", settings.preferences.autoRefresh ? "bg-primary-500" : "bg-slate-300")}>
                                 <div className={cn("w-3 h-3 bg-white rounded-full transition-transform", settings.preferences.autoRefresh ? "translate-x-5" : "translate-x-0")} />
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

export default HRSettings;
