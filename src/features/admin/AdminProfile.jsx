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
import { useAdmin } from '../../context/AdminContext';
import { uploadAPI } from '../../utils/apiService';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import DatePicker from '../../shared/components/common/DatePicker';

const AdminProfile = () => {
  const { user } = useAuth();
  const { showToast } = useAdmin();

  // Format role for display: 'ADMIN' -> 'Admin', 'SUPERADMIN' -> 'Super Admin'
  const formatRole = (role) => {
    if (!role) return 'Admin';
    const roleMap = {
      SUPERADMIN: 'Super Admin',
      ADMIN: 'Admin',
      HR: 'HR Manager',
      MANAGER: 'Manager',
      EMPLOYEE: 'Employee',
    };
    return roleMap[role.toUpperCase()] || role;
  };

  const displayRole = formatRole(user?.role);
  const displayName = user?.name || user?.fullName || 'Admin User';
  const displayEmail = user?.email || 'admin@demo.com';

  // Mode state
  const [isEditing, setIsEditing] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const fileInputRef = useRef(null);
  
  // Security Tab States
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  // Data State
  const [profileData, setProfileData] = useState({
    personal: {
      fullName: displayName,
      email: displayEmail,
      phone: user?.phone || '',
      dob: user?.dob || '1985-06-15',
      gender: user?.gender || 'Male',
      address: user?.address || '123 Enterprise Drive',
      city: user?.city || 'San Francisco',
      country: user?.country || 'USA',
      emergencyContact: user?.emergencyContact || '',
      bio: user?.bio || 'System Administrator overseeing core infrastructure and security protocols.'
    },
    work: {
      employeeId: user?.employeeId || user?.empId || 'EMP-00142',
      department: user?.department || 'Engineering & IT',
      role: displayRole,
      reportingTo: user?.reportingTo || user?.manager || 'Sarah Connor (CTO)',
      joiningDate: user?.joiningDate || user?.joinDate || '2021-03-01',
      location: user?.location || 'SF Office - Floor 4',
      type: user?.empType || 'Full-Time'
    },
    security: {
      twoFactor: true,
      loginAlerts: true,
      sessionTimeout: '30 Minutes'
    },
    preferences: {
      theme: 'System Default',
      language: 'English (US)',
      timezone: 'UTC-08:00 (Pacific)',
      dateFormat: 'MM/DD/YYYY',
      emailNotif: true,
      pushNotif: false,
      weeklySummary: true
    }
  });

  const [activeSessions, setActiveSessions] = useState([
    { id: 1, device: 'MacBook Pro 16"', browser: 'Chrome', ip: '192.168.1.104', lastActive: 'Current Session' },
    { id: 2, device: 'iPhone 15 Pro', browser: 'Safari', ip: '172.20.10.2', lastActive: '2 hours ago' },
    { id: 3, device: 'Windows Desktop', browser: 'Edge', ip: '10.0.0.45', lastActive: 'Yesterday' }
  ]);

  // Handlers
  const handleSave = () => {
    if (isEditing) {
      if (!profileData.personal.fullName || !profileData.personal.email) {
         showToast('Error: Name and Email cannot be empty.');
         return;
      }
      setIsEditing(false);
      showToast('Profile updated securely.');
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
          showToast('Avatar uploaded successfully!');
        } else {
          throw new Error('No URL returned');
        }
      } catch (err) {
        console.error('Cloud avatar upload failed, using base64 fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
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

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'work', label: 'Work Info', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">My Profile</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Manage your account information and preferences</p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2">
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <>
              <button onClick={() => setIsEditing(false)} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2">
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button onClick={handleSave} className="btn-primary px-8 py-2.5 font-bold flex items-center gap-2 shadow-xl shadow-primary-200">
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
           <div className="card p-6 bg-white shadow-soft text-center group">
              <div className="relative inline-block mb-4">
                 <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary-50 relative bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    {avatarPreview ? (
                      <img src={avatarPreview} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-slate-400" />
                    )}
                    {isEditing && (
                       <label className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-sm">
                          <Camera size={24} className="mb-1" />
                          <span className="text-[10px] font-bold">Upload</span>
                          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                       </label>
                    )}
                 </div>
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{profileData.personal.fullName}</h2>
              <span className="mt-2 inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold text-primary-600 bg-primary-50 rounded border border-primary-100">
                 {profileData.work.role}
              </span>
              
              <div className="mt-6 pt-6 border-t border-slate-50 text-left space-y-4">
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-400 font-bold mb-1">Email</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{profileData.personal.email}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-400 font-bold mb-1">Last Login</p>
                    <p className="text-sm font-bold text-slate-700">Just now</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Account Status</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                       <span className="text-sm font-bold text-emerald-600 tracking-tight">Active & Secured</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="card p-6 bg-white shadow-soft space-y-5">
              <h3 className="text-xs font-bold text-slate-400">Quick Stats</h3>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Shield size={18} className="text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700">Security Score</span>
                 </div>
                 <span className="text-sm font-black text-slate-900">98%</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Smartphone size={18} className="text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700">Active Sessions</span>
                 </div>
                 <span className="text-sm font-black text-slate-900">{activeSessions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-primary-500" />
                    <span className="text-sm font-bold text-slate-700">Profile Completion</span>
                 </div>
                 <span className="text-sm font-black text-slate-900">100%</span>
              </div>
           </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-3 flex flex-col h-full bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
           {/* Tabs */}
           <div className="flex overflow-x-auto border-b border-slate-100 hide-scrollbar bg-slate-50/50">
              {tabs.map((tab) => {
                 const Icon = tab.icon;
                 const isActive = activeTab === tab.id;
                 return (
                    <button
                       key={tab.id}
                       onClick={() => setActiveTab(tab.id)}
                       className={cn(
                          "flex items-center gap-2 px-8 py-5 text-sm font-bold whitespace-nowrap transition-all border-b-2",
                          isActive ? "border-primary-600 text-primary-600 bg-white" : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                       )}
                    >
                       <Icon size={18} />
                       {tab.label}
                    </button>
                 );
              })}
           </div>

           <div className="p-8 flex-1 bg-white">
              <AnimatePresence mode="wait">
                 {/* PERSONAL INFO TAB */}
                 {activeTab === 'personal' && (
                    <motion.div key="personal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Full Name</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.fullName} onChange={e => updateField('personal', 'fullName', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Email <span className="text-red-400">*</span></label>
                             <input type="email" readOnly={!isEditing} value={profileData.personal.email} onChange={e => updateField('personal', 'email', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Phone</label>
                             <PhoneInput name="phone" disabled={!isEditing} value={profileData.personal.phone} onChange={e => updateField('personal', 'phone', e.target.value)} className={cn(isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Gender</label>
                             <select disabled={!isEditing} value={profileData.personal.gender} onChange={e => updateField('personal', 'gender', e.target.value)} className={cn("input-field h-12 font-bold appearance-none", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                             <DatePicker  readOnly={!isEditing} value={profileData.personal.dob} onChange={e => updateField('personal', 'dob', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Emergency Contact</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.emergencyContact} onChange={e => updateField('personal', 'emergencyContact', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Address</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.address} onChange={e => updateField('personal', 'address', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">City</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.city} onChange={e => updateField('personal', 'city', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Country</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.country} onChange={e => updateField('personal', 'country', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2 md:col-span-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Bio</label>
                             <textarea readOnly={!isEditing} value={profileData.personal.bio} onChange={e => updateField('personal', 'bio', e.target.value)} rows="6" className={cn("input-field h-auto w-full p-4 rounded-xl font-bold border transition-all text-sm resize-none", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {/* WORK INFO TAB */}
                 {activeTab === 'work' && (
                    <motion.div key="work" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Employee ID <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                             <input type="text" readOnly value={profileData.work.employeeId} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Role <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                             <input type="text" readOnly value={profileData.work.role} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Department</label>
                             <select disabled={!isEditing} value={profileData.work.department} onChange={e => updateField('work', 'department', e.target.value)} className={cn("input-field h-12 font-bold appearance-none", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")}>
                                <option>Engineering & IT</option>
                                <option>Human Resources</option>
                                <option>Finance</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Reporting To</label>
                             <input type="text" readOnly={!isEditing} value={profileData.work.reportingTo} onChange={e => updateField('work', 'reportingTo', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Joining Date</label>
                             <DatePicker  readOnly={!isEditing} value={profileData.work.joiningDate} onChange={e => updateField('work', 'joiningDate', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Work Location</label>
                             <input type="text" readOnly={!isEditing} value={profileData.work.location} onChange={e => updateField('work', 'location', e.target.value)} className={cn("input-field h-12 font-bold", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Employment Type</label>
                             <select disabled={!isEditing} value={profileData.work.type} onChange={e => updateField('work', 'type', e.target.value)} className={cn("input-field h-12 font-bold appearance-none", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")}>
                                <option>Full-Time</option>
                                <option>Part-Time</option>
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
                       <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-6">
                          <h3 className="text-base font-bold text-slate-900 border-b border-slate-200 pb-3 dark:text-white">Change Password</h3>
                          <div className="grid grid-cols-1 gap-5">
                             {['current', 'new', 'confirm'].map((field) => (
                                <div key={field} className="space-y-2">
                                   <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">{field === 'current' ? 'Current Password' : field === 'new' ? 'New Password' : 'Confirm Password'}</label>
                                   <div className="relative">
                                      <input 
                                         type={showPassword[field] ? 'text' : 'password'} 
                                         value={passwords[field]} 
                                         onChange={e => setPasswords({...passwords, [field]: e.target.value})} 
                                         className="input-field h-12 bg-white pr-10 font-medium tracking-widest"
                                         placeholder="••••••••"
                                      />
                                      <button type="button" onClick={() => setShowPassword({...showPassword, [field]: !showPassword[field]})} className="absolute right-3 top-3 text-slate-400 hover:text-primary-600">
                                         {showPassword[field] ? <EyeOff size={18} /> : <Eye size={18} />}
                                      </button>
                                   </div>
                                </div>
                             ))}
                             <div>
                                <button className="btn-primary w-full sm:w-auto px-8 py-3 font-bold mt-2" onClick={() => {
                                   if(passwords.new && passwords.new === passwords.confirm) {
                                      showToast('Password updated securely.');
                                      setPasswords({current: '', new: '', confirm: ''});
                                   } else showToast('Error: Passwords do not match or are empty.');
                                }}>Update Password</button>
                             </div>
                          </div>
                       </div>

                       {/* Security Controls */}
                       <div className="space-y-4">
                          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 dark:text-white">Security Controls</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-300" onClick={() => isEditing && updateField('security', 'twoFactor', !profileData.security.twoFactor)}>
                                <div>
                                   <span className="text-sm font-bold text-slate-900 flex items-center gap-2"><Lock size={16} className="text-primary-500" /> Two-Factor Auth </span>
                                   <span className="text-xs font-medium text-slate-500 mt-1 block">Enhance account security</span>
                                </div>
                                <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", profileData.security.twoFactor ? "bg-emerald-500" : "bg-slate-300")}>
                                   <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", profileData.security.twoFactor ? "translate-x-6" : "translate-x-0")} />
                                </div>
                             </div>
                             <div className="flex items-center justify-between p-5 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-slate-300" onClick={() => isEditing && updateField('security', 'loginAlerts', !profileData.security.loginAlerts)}>
                                <div>
                                   <span className="text-sm font-bold text-slate-900 flex items-center gap-2"><AlertTriangle size={16} className="text-amber-500" /> Login Alerts </span>
                                   <span className="text-xs font-medium text-slate-500 mt-1 block">Notify on new devices</span>
                                </div>
                                <div className={cn("w-12 h-6 rounded-full p-1 transition-colors", profileData.security.loginAlerts ? "bg-emerald-500" : "bg-slate-300")}>
                                   <div className={cn("w-4 h-4 bg-white rounded-full transition-transform", profileData.security.loginAlerts ? "translate-x-6" : "translate-x-0")} />
                                </div>
                             </div>
                          </div>
                       </div>

                       {/* Active Sessions */}
                       <div className="space-y-4 pt-4 border-t border-slate-100">
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Sessions</h3>
                          <div className="card border border-slate-100 overflow-hidden shadow-none">
                             <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-100">
                                   <tr>
                                      <th className="px-6 py-4 text-[10px] font-bold text-slate-400">Device</th>
                                      <th className="px-6 py-4 text-[10px] font-bold font-bold text-slate-400">Location / IP</th>
                                      <th className="px-6 py-4 text-[10px] font-black font-bold text-slate-400">Last Active</th>
                                      <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Action</th>
                                   </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                   {activeSessions.map(session => (
                                      <tr key={session.id} className="hover:bg-slate-50/50">
                                         <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                               {session.device.includes('iPhone') ? <Smartphone size={18} className="text-slate-400" /> : <Globe size={18} className="text-slate-400" />}
                                               <div>
                                                  <p className="text-sm font-bold text-slate-900">{session.device}</p>
                                                  <p className="text-xs text-slate-500">{session.browser}</p>
                                               </div>
                                            </div>
                                         </td>
                                         <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-slate-600">{session.ip}</p>
                                         </td>
                                         <td className="px-6 py-4">
                                            <span className={cn("text-xs font-bold px-2 py-1 rounded", session.lastActive === 'Current Session' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500')}>{session.lastActive}</span>
                                         </td>
                                         <td className="px-6 py-4 text-right">
                                            {session.lastActive !== 'Current Session' && (
                                               <button onClick={() => removeSession(session.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Logout Session">
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
                             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Language</label>
                             <select disabled={!isEditing} value={profileData.preferences.language} onChange={e => updateField('preferences', 'language', e.target.value)} className={cn("input-field h-12 font-bold appearance-none", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")}>
                                <option>English (US)</option>
                                <option>Spanish (ES)</option>
                                <option>French (FR)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Timezone</label>
                             <select disabled={!isEditing} value={profileData.preferences.timezone} onChange={e => updateField('preferences', 'timezone', e.target.value)} className={cn("input-field h-12 font-bold appearance-none", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")}>
                                <option>UTC-08:00 (Pacific)</option>
                                <option>UTC-05:00 (Eastern)</option>
                                <option>UTC+00:00 (London)</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Date Format</label>
                             <select disabled={!isEditing} value={profileData.preferences.dateFormat} onChange={e => updateField('preferences', 'dateFormat', e.target.value)} className={cn("input-field h-12 font-bold appearance-none", isEditing ? "bg-white" : "bg-slate-50 border-transparent text-slate-600 cursor-default")}>
                                <option>MM/DD/YYYY</option>
                                <option>DD/MM/YYYY</option>
                                <option>YYYY-MM-DD</option>
                             </select>
                          </div>

                          <div className="md:col-span-2 pt-6 border-t border-slate-100 space-y-4">
                             <h3 className="text-xs font-bold text-slate-400 mb-4">Notification Settings</h3>
                             
                             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent">
                                <div>
                                   <span className="text-sm font-bold text-slate-700">Email Notifications</span>
                                   <p className="text-xs text-slate-500">Receive alerts via email</p>
                                </div>
                                <input type="checkbox" disabled={!isEditing} checked={profileData.preferences.emailNotif} onChange={e => updateField('preferences', 'emailNotif', e.target.checked)} className="w-5 h-5 rounded-lg accent-primary-600" />
                             </div>
                             
                             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent">
                                <div>
                                   <span className="text-sm font-bold text-slate-700">Push Notifications</span>
                                   <p className="text-xs text-slate-500">Receive real-time in-app alerts</p>
                                </div>
                                <input type="checkbox" disabled={!isEditing} checked={profileData.preferences.pushNotif} onChange={e => updateField('preferences', 'pushNotif', e.target.checked)} className="w-5 h-5 rounded-lg accent-primary-600" />
                             </div>

                             <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-transparent">
                                <div>
                                   <span className="text-sm font-bold text-slate-700">Weekly Digest</span>
                                   <p className="text-xs text-slate-500">Receive weekly system health summaries</p>
                                </div>
                                <input type="checkbox" disabled={!isEditing} checked={profileData.preferences.weeklySummary} onChange={e => updateField('preferences', 'weeklySummary', e.target.checked)} className="w-5 h-5 rounded-lg accent-primary-600" />
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

export default AdminProfile;
