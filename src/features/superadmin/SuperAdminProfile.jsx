import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Settings, Briefcase, Camera, 
  MapPin, Phone, Mail, Building, Clock, Activity, 
  Lock, Bell, Smartphone, Globe, AlertTriangle, Key,
  X, CheckCircle2, ChevronDown, Edit3, Save, Trash2, Eye, EyeOff
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useTheme } from '../../hooks/ThemeContext';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import { employeeAPI, uploadAPI } from '../../utils/apiService';
import DatePicker from '../../shared/components/common/DatePicker';

const SuperAdminProfile = () => {
  const { user, refreshUser } = useAuth();
  const superAdminContext = useSuperAdmin();
  const { theme, toggleTheme } = useTheme();

  // Local helper to trigger toast messages
  const showToast = (message, type = 'success') => {
    if (superAdminContext?.showToast) {
      superAdminContext.showToast(message, type);
    } else {
      window.dispatchEvent(new CustomEvent('app_toast', { detail: { message, type } }));
    }
  };

  // Editing Mode state
  const [isEditing, setIsEditing] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Super Admin')}&background=4f46e5&color=fff&bold=true`
  );
  const fileInputRef = useRef(null);
  
  // Security Tab States
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Data State
  const [profileData, setProfileData] = useState({
    personal: {
      fullName: user?.name || 'John Doe',
      email: user?.email || 'superadmin@hcm.ai',
      phone: user?.phone || '',
      dob: '1988-11-23',
      gender: 'Male',
      address: '742 Evergreen Terrace',
      city: 'Springfield',
      country: 'USA',
      emergencyContact: '9876543210',
      bio: user?.bio || 'Global HCM Suite Super Administrator. Managing multi-tenant environments, security infrastructure, global billing configurations, and system access controls.'
    },
    work: {
      employeeId: 'SA-00001',
      department: 'Global Executive Admin',
      role: 'Super Admin',
      reportingTo: 'Board of Directors / CEO',
      joiningDate: '2020-01-15',
      location: 'Corporate HQ - Floor 12',
      type: 'Full-Time'
    },
    security: {
      twoFactor: true,
      loginAlerts: true,
      sessionTimeout: '30 Minutes'
    },
    preferences: {
      theme: theme === 'dark' ? 'Dark Mode' : 'Light Mode',
      language: 'English (US)',
      timezone: 'UTC+00:00 (London)',
      dateFormat: 'MM/DD/YYYY',
      emailNotif: true,
      pushNotif: true,
      weeklySummary: true
    }
  });

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'MacBook Pro 16" (M3 Max)', browser: 'Chrome Desktop', ip: '192.168.1.1', lastActive: 'Current Session' },
    { id: 2, device: 'iPhone 15 Pro Max', browser: 'Safari Mobile', ip: '172.56.21.90', lastActive: '4 hours ago' },
    { id: 3, device: 'iPad Pro 12.9"', browser: 'Safari Tablet', ip: '172.56.21.91', lastActive: '2 days ago' }
  ]);

  // Fetch Profile from DB on mount
  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await employeeAPI.getProfile();
        if (res.data?.success && res.data.data) {
          const p = res.data.data;
          setProfileData(prev => ({
            ...prev,
            personal: {
              ...prev.personal,
              fullName: p.fullName || prev.personal.fullName,
              phone: p.phone || prev.personal.phone,
              dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : prev.personal.dob,
              gender: p.gender || prev.personal.gender,
              address: p.address || prev.personal.address,
              emergencyContact: p.emergencyPhone || prev.personal.emergencyContact,
              bio: p.bio || prev.personal.bio
            },
            work: {
              ...prev.work,
              employeeId: p.employeeId || prev.work.employeeId,
              joiningDate: p.joiningDate ? new Date(p.joiningDate).toISOString().split('T')[0] : prev.work.joiningDate,
              type: p.employmentType || prev.work.type
            },
            preferences: {
              ...prev.preferences,
              language: p.language || prev.preferences.language,
              timezone: p.timezone || prev.preferences.timezone,
              dateFormat: p.dateFormat || prev.preferences.dateFormat,
              emailNotif: p.emailNotif !== null && p.emailNotif !== undefined ? p.emailNotif : prev.preferences.emailNotif,
              pushNotif: p.pushNotif !== null && p.pushNotif !== undefined ? p.pushNotif : prev.preferences.pushNotif,
              weeklySummary: p.weeklySummary !== null && p.weeklySummary !== undefined ? p.weeklySummary : prev.preferences.weeklySummary
            }
          }));
          if (p.avatarUrl) {
            setAvatarPreview(p.avatarUrl);
          }
        }
      } catch (err) {
        console.error('Failed to fetch profile', err);
      }
    };
    fetchProfile();
  }, []);

  // Handlers
  const handleSave = async () => {
    if (isEditing) {
      if (!profileData.personal.fullName || !profileData.personal.email) {
         showToast('Error: Name and Email cannot be empty.', 'error');
         return;
      }
      
      try {
        // Save to backend
        const res = await employeeAPI.updateProfile({
          fullName: profileData.personal.fullName,
          phone: profileData.personal.phone,
          dob: profileData.personal.dob,
          gender: profileData.personal.gender,
          address: profileData.personal.address,
          emergencyPhone: profileData.personal.emergencyContact,
          avatarUrl: avatarPreview,
          bio: profileData.personal.bio,
          language: profileData.preferences.language,
          timezone: profileData.preferences.timezone,
          dateFormat: profileData.preferences.dateFormat,
          emailNotif: profileData.preferences.emailNotif,
          pushNotif: profileData.preferences.pushNotif,
          weeklySummary: profileData.preferences.weeklySummary
        });

        if (res.data?.success) {
          // Update local storage user information
          const updatedUser = {
            ...user,
            name: profileData.personal.fullName,
            email: profileData.personal.email,
            phone: profileData.personal.phone,
            avatar: avatarPreview,
            bio: profileData.personal.bio
          };
          localStorage.setItem('hcm_user', JSON.stringify(updatedUser));
          if (refreshUser) {
             await refreshUser();
          }
          setIsEditing(false);
          showToast('Super Admin profile updated securely.');
        } else {
          showToast('Failed to update profile on backend', 'error');
        }
      } catch (err) {
        console.error('Failed to save profile user details:', err);
        showToast('Error saving profile changes', 'error');
      }
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const response = await uploadAPI.uploadImage(file, 'hcm/avatars');
        const cloudUrl = response.data?.data?.url;
        if (cloudUrl) {
          setAvatarPreview(cloudUrl);
          showToast('Profile image uploaded. Save changes to apply.', 'info');
        } else {
          throw new Error('No URL returned');
        }
      } catch (err) {
        console.error('Cloud avatar upload failed, using base64 fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
          showToast('Profile image loaded. Save changes to apply.', 'info');
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const removeSession = (id) => {
    setActiveSessions(prev => prev.filter(s => s.id !== id));
    showToast('Remote session terminated.');
  };

  // Updaters
  const updateField = (category, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleThemeChange = (newThemeStr) => {
    updateField('preferences', 'theme', newThemeStr);
    const targetTheme = newThemeStr.toLowerCase().includes('dark') ? 'dark' : 'light';
    if (theme !== targetTheme) {
      toggleTheme();
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'work', label: 'Platform Work Info', icon: Briefcase },
    { id: 'security', label: 'Security & Auth', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none max-w-7xl mx-auto text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Super Admin Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight mt-1">Manage your administrator identity, security credentials and console preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <>
              <button onClick={() => {
                setIsEditing(false);
                // Reset to initial user values
                setAvatarPreview(user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Super Admin')}&background=4f46e5&color=fff&bold=true`);
                setProfileData(prev => ({
                  ...prev,
                  personal: {
                    ...prev.personal,
                    fullName: user?.name || 'John Doe',
                    email: user?.email || 'superadmin@hcm.ai'
                  }
                }));
              }} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2 border border-slate-200 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button onClick={handleSave} className="btn-primary px-8 py-2.5 font-bold flex items-center gap-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 dark:shadow-none">
                <Save size={18} />
                <span>Save Changes</span>
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar */}
        <div className="lg:col-span-1 space-y-6">
           <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[2rem] shadow-sm text-center group transition-all">
              <div className="relative inline-block mb-4">
                 <div className="w-32 h-32 rounded-2xl overflow-hidden ring-4 ring-primary-50 dark:ring-primary-950/30 relative mx-auto">
                    <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    {isEditing && (
                       <label className="absolute inset-0 bg-slate-900/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                          <Camera size={24} className="mb-1" />
                          <span className="text-[10px] font-bold">Upload</span>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                       </label>
                    )}
                 </div>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white truncate px-2">{profileData.personal.fullName}</h2>
              <span className="mt-2 inline-flex items-center justify-center px-3 py-1 text-[10px] font-bold text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/30 rounded-lg border border-primary-100 dark:border-primary-900/50">
                 {profileData.work.role}
              </span>
              
              <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-left space-y-4">
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-bold mb-1">SuperAdmin Node</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{profileData.personal.email}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-bold mb-1">Access Level</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Global Root / All Orgs</p>
                 </div>
              </div>
           </div>

           <div className="card p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/80 rounded-[2rem] shadow-sm space-y-5">
              <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500">Security Parameters</h3>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Shield size={18} className="text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Vault Score</span>
                 </div>
                 <span className="text-sm font-bold text-slate-900 dark:text-white">100%</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-primary-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Active Terminals</span>
                 </div>
                 <span className="text-sm font-black text-slate-900 dark:text-white">{activeSessions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Security Clearance</span>
                 </div>
                 <span className="text-sm font-black text-slate-900 dark:text-white">Level 5</span>
              </div>
           </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200/60 dark:border-slate-850 shadow-sm overflow-hidden">
           {/* Tabs */}
           <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800 hide-scrollbar bg-slate-50/50 dark:bg-slate-900/30">
              {tabs.map((tab) => {
                 const Icon = tab.icon;
                 const isActive = activeTab === tab.id;
                 return (
                    <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={cn(
                          "flex items-center gap-2 px-8 py-5 text-sm font-bold whitespace-nowrap transition-all border-b-2",
                          isActive 
                            ? "border-primary-600 text-primary-600 bg-white dark:bg-slate-900 dark:text-primary-400" 
                            : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/50"
                       )}
                    >
                       <Icon size={18} />
                       {tab.label}
                    </button>
                 );
              })}
           </div>

           <div className="p-8 flex-1 bg-white dark:bg-slate-900">
              <AnimatePresence mode="wait">
                 {/* PERSONAL INFO TAB */}
                 {activeTab === 'personal' && (
                    <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-bold px-1">Full Name</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.fullName} onChange={e => updateField('personal', 'fullName', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-bold px-1">Email Node <span className="text-red-400">*</span></label>
                             <input type="email" readOnly={!isEditing} value={profileData.personal.email} onChange={e => updateField('personal', 'email', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Phone Terminal</label>
                             <PhoneInput name="phone" disabled={!isEditing} value={profileData.personal.phone} onChange={e => updateField('personal', 'phone', e.target.value)} className={cn(isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Gender</label>
                             <select disabled={!isEditing} value={profileData.personal.gender} onChange={e => updateField('personal', 'gender', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Date of Birth</label>
                             <DatePicker  readOnly={!isEditing} value={profileData.personal.dob} onChange={e => updateField('personal', 'dob', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Emergency Frequency Contact</label>
                             <PhoneInput name="emergencyContact" disabled={!isEditing} value={profileData.personal.emergencyContact} onChange={e => updateField('personal', 'emergencyContact', e.target.value)} className={cn(isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Global Address</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.address} onChange={e => updateField('personal', 'address', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">City</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.city} onChange={e => updateField('personal', 'city', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Country</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.country} onChange={e => updateField('personal', 'country', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Super Administrator Brief / Bio</label>
                             <textarea readOnly={!isEditing} value={profileData.personal.bio} onChange={e => updateField('personal', 'bio', e.target.value)} rows="6" className={cn("input-field h-auto w-full p-4 rounded-xl font-bold border transition-all text-sm resize-none", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {/* WORK INFO TAB */}
                 {activeTab === 'work' && (
                    <motion.div key="work" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">SuperAdmin ID <span className="text-indigo-400 dark:text-indigo-300 ml-1">(Root Key)</span></label>
                             <input type="text" readOnly value={profileData.work.employeeId} className="input-field w-full px-4 h-12 rounded-xl font-bold border text-sm bg-slate-50 dark:bg-slate-950 border-transparent text-slate-500 dark:text-slate-500 cursor-not-allowed" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Platform Role <span className="text-indigo-400 dark:text-indigo-300 ml-1">(Immutable)</span></label>
                             <input type="text" readOnly value={profileData.work.role} className="input-field w-full px-4 h-12 rounded-xl font-bold border text-sm bg-slate-50 dark:bg-slate-950 border-transparent text-slate-500 dark:text-slate-500 cursor-not-allowed" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Management Group</label>
                             <select disabled={!isEditing} value={profileData.work.department} onChange={e => updateField('work', 'department', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")}>
                                <option>Global Executive Admin</option>
                                <option>System Infrastructure</option>
                                <option>Global Operations</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Governance Reporting To</label>
                             <input type="text" readOnly={!isEditing} value={profileData.work.reportingTo} onChange={e => updateField('work', 'reportingTo', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Node Creation Date</label>
                             <DatePicker  readOnly={!isEditing} value={profileData.work.joiningDate} onChange={e => updateField('work', 'joiningDate', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Primary Physical Location</label>
                             <input type="text" readOnly={!isEditing} value={profileData.work.location} onChange={e => updateField('work', 'location', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Duty Type</label>
                             <select disabled={!isEditing} value={profileData.work.type} onChange={e => updateField('work', 'type', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")}>
                                <option>Full-Time</option>
                                <option>Contract</option>
                             </select>
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {/* SECURITY TAB */}
                 {activeTab === 'security' && (
                    <motion.div key="security" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
                       
                       {/* Change Password */}
                       <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-3xl border border-slate-200/50 dark:border-slate-850 space-y-6">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-200/60 dark:border-slate-800 pb-3">Rotate Root Credentials</h3>
                          <div className="grid grid-cols-1 gap-5">
                             {['current', 'new', 'confirm'].map((field) => (
                                <div key={field} className="space-y-2">
                                   <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">{field === 'current' ? 'Current Security Key / Password' : field === 'new' ? 'New Security Key / Password' : 'Confirm New Security Key'}</label>
                                   <div className="relative">
                                      <input 
                                         type={showPassword[field] ? 'text' : 'password'} 
                                         value={passwords[field]} 
                                         onChange={e => setPasswords({...passwords, [field]: e.target.value})} 
                                         className="input-field w-full px-4 h-12 rounded-xl border font-medium bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 pr-10 tracking-widest text-sm"
                                         placeholder="••••••••"
                                      />
                                      <button type="button" onClick={() => setShowPassword({...showPassword, [field]: !showPassword[field]})} className="absolute right-3 top-3 text-slate-400 hover:text-primary-600 transition-colors">
                                         {showPassword[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                                      </button>
                                   </div>
                                </div>
                             ))}
                             <div>
                                <button className="btn-primary px-8 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold mt-2 transition-all" onClick={() => {
                                   if (passwords.new && passwords.new === passwords.confirm) {
                                      showToast('Root password updated and sync completed across data nodes.');
                                      setPasswords({current: '', new: '', confirm: ''});
                                   } else showToast('Error: Passwords do not match or are empty.', 'error');
                                }}>Update Credentials</button>
                             </div>
                          </div>
                       </div>

                       {/* Security Controls */}
                       <div className="space-y-4">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">Real-time Auditing Controls</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-slate-350 transition-colors" onClick={() => isEditing && updateField('security', 'twoFactor', !profileData.security.twoFactor)}>
                                <div>
                                   <span className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2"><Lock size={16} className="text-primary-500" /> Multi-Factor Authentication </span>
                                   <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">Biometric / authenticator code gate</span>
                                </div>
                                <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", profileData.security.twoFactor ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700")}>
                                   <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", profileData.security.twoFactor ? "translate-x-6" : "translate-x-0")} />
                                </div>
                             </div>
                             <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl cursor-pointer hover:border-slate-350 transition-colors" onClick={() => isEditing && updateField('security', 'loginAlerts', !profileData.security.loginAlerts)}>
                                <div>
                                   <span className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Root Sign-in Alerts </span>
                                   <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 block">Immediate SMS & Email dispatch</span>
                                </div>
                                <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", profileData.security.loginAlerts ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700")}>
                                   <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", profileData.security.loginAlerts ? "translate-x-6" : "translate-x-0")} />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Active Sessions */}
                       <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Root Terminals</h3>
                          <div className="border border-slate-150 dark:border-slate-800 overflow-hidden rounded-2xl">
                             <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/60 dark:border-slate-800">
                                   <tr>
                                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400 dark:text-slate-500">Terminal</th>
                                      <th className="px-6 py-4 text-[10px] font-bold font-bold text-slate-400 dark:text-slate-500">IP Node</th>
                                      <th className="px-6 py-4 text-[10px] font-black font-bold text-slate-400 dark:text-slate-500">Status</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 text-right">Action</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                   {activeSessions.map(session => (
                                      <tr key={session.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30">
                                         <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                               {session.device.includes('iPhone') ? <Smartphone size={18} className="text-slate-400" /> : <Globe size={18} className="text-slate-400" />}
                                               <div>
                                                  <p className="text-sm font-bold text-slate-900 dark:text-slate-200">{session.device}</p>
                                                  <p className="text-xs text-slate-500 dark:text-slate-400">{session.browser}</p>
                                               </div>
                                            </div>
                                         </td>
                                         <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{session.ip}</p>
                                         </td>
                                         <td className="px-6 py-4">
                                            <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", session.lastActive === 'Current Session' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400')}>{session.lastActive}</span>
                                         </td>
                                         <td className="px-6 py-4 text-right">
                                            {session.lastActive !== 'Current Session' && (
                                               <button onClick={() => removeSession(session.id)} className="p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-all" title="Terminate Session">
                                                  <Trash2 size={16} />
                                               </button>
                                            )}
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {/* PREFERENCES TAB */}
                 {activeTab === 'preferences' && (
                    <motion.div key="preferences" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-bold px-1">Language System</label>
                             <select disabled={!isEditing} value={profileData.preferences.language} onChange={e => updateField('preferences', 'language', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")}>
                                <option>English (US)</option>
                                <option>Spanish (ES)</option>
                                <option>French (FR)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 font-bold px-1">Global Timezone</label>
                             <select disabled={!isEditing} value={profileData.preferences.timezone} onChange={e => updateField('preferences', 'timezone', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")}>
                                <option>UTC+00:00 (London)</option>
                                <option>UTC-05:00 (Eastern)</option>
                                <option>UTC+05:30 (India)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Date Format Preference</label>
                             <select disabled={!isEditing} value={profileData.preferences.dateFormat} onChange={e => updateField('preferences', 'dateFormat', e.target.value)} className={cn("input-field w-full px-4 h-12 rounded-xl font-bold border transition-all text-sm appearance-none bg-no-repeat", isEditing ? "bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-700" : "bg-slate-50 dark:bg-slate-950 border-transparent text-slate-600 dark:text-slate-400 cursor-default")}>
                                <option>MM/DD/YYYY</option>
                                <option>DD/MM/YYYY</option>
                                <option>YYYY-MM-DD</option>
                             </select>
                          </div>

                          <div className="md:col-span-2 pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
                             <h3 className="text-xs font-bold text-slate-400 dark:text-slate-500 mb-4">Ecosystem Alerts</h3>
                             
                             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent">
                                <div>
                                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Email Root Dispatch</span>
                                   <p className="text-xs text-slate-500 dark:text-slate-400">Receive alerts regarding critical API health and billing events</p>
                                </div>
                                <input type="checkbox" disabled={!isEditing} checked={profileData.preferences.emailNotif} onChange={e => updateField('preferences', 'emailNotif', e.target.checked)} className="w-5 h-5 rounded-lg accent-primary-600 cursor-pointer" />
                             </div>
                             
                             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent">
                                <div>
                                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Real-time Terminal Banner Alerts</span>
                                   <p className="text-xs text-slate-500 dark:text-slate-400">Receive in-app popups for audit logs</p>
                                </div>
                                <input type="checkbox" disabled={!isEditing} checked={profileData.preferences.pushNotif} onChange={e => updateField('preferences', 'pushNotif', e.target.checked)} className="w-5 h-5 rounded-lg accent-primary-600 cursor-pointer" />
                             </div>

                             <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-transparent">
                                <div>
                                   <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Weekly Security Audit Digest</span>
                                   <p className="text-xs text-slate-500 dark:text-slate-400">Consolidated reports on server health and permissions activity</p>
                                </div>
                                <input type="checkbox" disabled={!isEditing} checked={profileData.preferences.weeklySummary} onChange={e => updateField('preferences', 'weeklySummary', e.target.checked)} className="w-5 h-5 rounded-lg accent-primary-600 cursor-pointer" />
                             </div>
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminProfile;
