import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Settings, Briefcase, Camera, 
  MapPin, Phone, Mail, Building, Clock, Activity, 
  Lock, Bell, Smartphone, Globe, AlertTriangle, Key,
  X, CheckCircle2, ChevronDown, Edit3, Save, Trash2, Eye, EyeOff, Users, Target, FileText, ExternalLink
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useManager } from '../../context/ManagerContext';
import { useCurrency } from '../../hooks/useCurrency';
import { uploadAPI } from '../../utils/apiService';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import { useDateFormat } from '../../hooks/useDateFormat';
import DatePicker from '../../shared/components/common/DatePicker';

const ManagerProfile = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const { user } = useAuth();
  const { profile, updateProfile, teamMembers, documents, uploadDoc, deleteDoc, showToast } = useManager();

  // Mode state
  const [isEditing, setIsEditing] = useState(false);
  
  // UI states
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarPreview, setAvatarPreview] = useState('');
  const fileInputRef = useRef(null);
  const docInputRef = useRef(null);
  
  // Data State
  const [profileData, setProfileData] = useState({
    personal: { fullName: '', email: '', phone: '', dob: '', gender: '', address: '', bio: '' },
    work: { employeeId: '', department: '', role: '', reportingTo: '', joiningDate: '', location: '' },
    teamScope: { teamSize: 0, directReports: 0, budget: `${getSymbol()}250,000 / Quarter`, projectsActive: 4 },
    emergency: { contactName: '', relation: '', phone: '' }
  });

  // Sync DB profile to state
  useEffect(() => {
    if (profile) {
      setProfileData({
        personal: {
          fullName: profile.fullName || user?.name || '',
          email: profile.user?.email || user?.email || '',
          phone: profile.phone || '',
          dob: profile.dob ? profile.dob.split('T')[0] : '',
          gender: profile.gender || '',
          address: profile.address || '',
          bio: 'Regional Manager focus on team growth and sustainable results.',
          avatarUrl: profile.avatarUrl || ''
        },
        work: {
          employeeId: profile.employeeId || '',
          department: profile.department?.name || 'Operations',
          role: profile.user?.role || 'MANAGER',
          reportingTo: profile.manager?.fullName || 'N/A',
          joiningDate: profile.joiningDate ? profile.joiningDate.split('T')[0] : '',
          location: 'HQ'
        },
        teamScope: {
          teamSize: teamMembers.length,
          directReports: teamMembers.length,
          budget: `${getSymbol()}250,000 / Quarter`,
          projectsActive: 4
        },
        emergency: {
          contactName: profile.emergencyName || '',
          relation: profile.emergencyRelation || '',
          phone: profile.emergencyPhone || ''
        }
      });
      setAvatarPreview(profile.avatarUrl || '');
    }
  }, [profile, user, teamMembers]);

  // Handlers
  const handleSave = async () => {
    if (isEditing) {
      if (!profileData.personal.fullName) {
         showToast('Error: Name cannot be empty.', 'error');
         return;
      }
      
      const updatePayload = {
        fullName: profileData.personal.fullName,
        phone: profileData.personal.phone,
        dob: profileData.personal.dob || null,
        gender: profileData.personal.gender,
        address: profileData.personal.address,
        emergencyName: profileData.emergency.contactName,
        emergencyRelation: profileData.emergency.relation,
        emergencyPhone: profileData.emergency.phone,
      };

      if (profileData.personal.avatarUrl) {
         updatePayload.avatarUrl = profileData.personal.avatarUrl;
      } else if (avatarPreview === '') {
         updatePayload.avatarUrl = null; // trigger remove
      }

      await updateProfile(updatePayload);
      setIsEditing(false);
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
          updateField('personal', 'avatarUrl', cloudUrl);
        } else {
          throw new Error('No URL returned');
        }
      } catch (err) {
        console.error('Cloud avatar upload failed, using base64 fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setAvatarPreview(reader.result);
          updateField('personal', 'avatarUrl', reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDocUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { showToast('File too large (max 5MB)', 'error'); return; }
      try {
        const response = await uploadAPI.uploadDocument(file, 'hcm/documents');
        const cloudUrl = response.data?.data?.url;
        if (cloudUrl) {
          uploadDoc({
            name: file.name,
            category: 'Document',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
            fileBase64: cloudUrl
          });
        } else {
          throw new Error('No URL returned');
        }
      } catch (err) {
        console.error('Cloud doc upload failed, using base64 fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
           uploadDoc({ 
             name: file.name, 
             category: 'Document', 
             size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
             fileBase64: reader.result 
           });
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Updaters
  const updateField = (category, field, value) => {
    setProfileData(prev => ({ ...prev, [category]: { ...prev[category], [field]: value } }));
  };

  const inputClass = isEditing 
    ? "input-field h-12 font-bold bg-white border-2 border-primary-200 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-100" 
    : "input-field h-12 font-bold bg-slate-50 border-transparent text-slate-600 cursor-default";

  const textareaClass = isEditing 
    ? "input-field py-3 font-bold resize-none bg-white border-2 border-primary-200 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-100" 
    : "input-field py-3 font-bold resize-none bg-slate-50 border-transparent text-slate-600 cursor-default";

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'work', label: 'Work Info', icon: Briefcase },
    { id: 'team', label: 'Team Scope', icon: Users },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Manager Profile</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Manage your team leadership identity and records</p>
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
                 <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary-50 relative group/avatar">
                    <img src={avatarPreview || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.personal.fullName || 'Manager')}&background=4f46e5&color=fff`} alt="Profile" className="w-full h-full object-cover" />
                    {isEditing && (
                       <>
                         <label className="absolute inset-0 bg-slate-900/50 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer backdrop-blur-sm z-10">
                            <Camera size={24} className="mb-1" />
                            <span className="text-[10px] font-bold">Upload</span>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                         </label>
                         {avatarPreview && (
                            <button type="button" onClick={(e) => { e.preventDefault(); setAvatarPreview(''); updateField('personal', 'avatarUrl', null); }} className="absolute top-2 right-2 bg-rose-500 text-white p-1.5 rounded-full z-20 hover:bg-rose-600 shadow-lg" title="Remove Avatar">
                               <Trash2 size={12} />
                            </button>
                         )}
                       </>
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
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <div className="flex items-center gap-2 mt-1">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                       <span className="text-sm font-bold text-emerald-600 tracking-tight">Active</span>
                    </div>
                 </div>
              </div>
           </div>

           <div className="card p-6 bg-white shadow-soft space-y-5">
              <h3 className="text-xs font-bold text-slate-400">Quick Recap</h3>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Users size={18} className="text-emerald-500" />
                    <span className="text-sm font-bold text-slate-700">Team Members</span>
                 </div>
                 <span className="text-sm font-black text-slate-900">{profileData.teamScope.teamSize}</span>
              </div>
              <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Target size={18} className="text-indigo-500" />
                    <span className="text-sm font-bold text-slate-700">Active Goals</span>
                 </div>
                 <span className="text-sm font-black text-slate-900">{profileData.teamScope.projectsActive}</span>
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
                          <div className="space-y-2 text-left">
                             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1 text-left">Full Name</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.fullName} onChange={e => updateField('personal', 'fullName', e.target.value)} className={inputClass} />
                          </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1 text-left">Email <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="email" readOnly value={profileData.personal.email} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                          <div className="space-y-2 text-left">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Phone</label>
                             <PhoneInput name="phone" disabled={!isEditing} value={profileData.personal.phone} onChange={e => updateField('personal', 'phone', e.target.value)} className={isEditing ? "bg-white border-2 border-primary-200 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-100" : "bg-slate-50 border-transparent text-slate-600 cursor-default"} />
                          </div>
                          <div className="space-y-2 text-left">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Gender</label>
                             <select disabled={!isEditing} value={profileData.personal.gender} onChange={e => updateField('personal', 'gender', e.target.value)} className={cn(inputClass, "appearance-none")}>
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                             </select>
                          </div>
                          <div className="space-y-2 text-left">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Date of Birth</label>
                             <DatePicker  readOnly={!isEditing} value={profileData.personal.dob} onChange={e => updateField('personal', 'dob', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-2 text-left md:col-span-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Address</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.address} onChange={e => updateField('personal', 'address', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-2 text-left md:col-span-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Bio</label>
                             <textarea readOnly={!isEditing} value={profileData.personal.bio} onChange={e => updateField('personal', 'bio', e.target.value)} rows="3" className={textareaClass} />
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {/* WORK INFO TAB */}
                 {activeTab === 'work' && (
                    <motion.div key="work" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-2 text-left">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Manager ID <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                             <input type="text" readOnly value={profileData.work.employeeId} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                          </div>
                          <div className="space-y-2 text-left">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Role <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                             <input type="text" readOnly value={profileData.work.role} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                          </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Department <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="text" readOnly value={profileData.work.department} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Reporting To <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="text" readOnly value={profileData.work.reportingTo} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Joining Date <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="text" readOnly value={profileData.work.joiningDate} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Work Location <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="text" readOnly value={profileData.work.location} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                       </div>
                    </motion.div>
                 )}

                 {/* TEAM SCOPE TAB */}
                 {activeTab === 'team' && (
                    <motion.div key="team" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Team Size <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="number" readOnly value={profileData.teamScope.teamSize} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Direct Reports <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="number" readOnly value={profileData.teamScope.directReports} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Quarterly Budget <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="text" readOnly value={profileData.teamScope.budget} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                           <div className="space-y-2 text-left">
                              <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Active Projects <span className="text-indigo-400 ml-1">(Read-Only)</span></label>
                              <input type="number" readOnly value={profileData.teamScope.projectsActive} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                           </div>
                       </div>
                    </motion.div>
                 )}

                 {/* EMERGENCY TAB */}
                 {activeTab === 'emergency' && (
                    <motion.div key="emergency" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                          <div className="space-y-2 text-left">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Contact Name</label>
                             <input type="text" readOnly={!isEditing} value={profileData.emergency.contactName} onChange={e => updateField('emergency', 'contactName', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-2 text-left">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Relation</label>
                             <input type="text" readOnly={!isEditing} value={profileData.emergency.relation} onChange={e => updateField('emergency', 'relation', e.target.value)} className={inputClass} />
                          </div>
                          <div className="space-y-2 text-left md:col-span-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1 text-left">Phone Number</label>
                             <PhoneInput name="emergencyPhone" disabled={!isEditing} value={profileData.emergency.phone} onChange={e => updateField('emergency', 'phone', e.target.value)} className={isEditing ? "bg-white border-2 border-primary-200 shadow-sm focus:border-primary-400 focus:ring focus:ring-primary-100" : "bg-slate-50 border-transparent text-slate-600 cursor-default"} />
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {/* DOCUMENTS TAB */}
                 {activeTab === 'documents' && (
                    <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                       <div className="flex items-center justify-between">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white">Employment Records</h3>
                         <input type="file" ref={docInputRef} className="hidden" onChange={handleDocUpload} />
                         <button onClick={() => docInputRef.current?.click()} className="btn-secondary px-4 py-2 font-bold text-sm">Upload New</button>
                       </div>
                       <div className="grid grid-cols-1 gap-4">
                          {documents.map((doc, i) => (
                             <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all group">
                                <div className="flex items-center gap-4">
                                   <div className="p-3 bg-white rounded-xl text-slate-400">
                                      <FileText size={20} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-slate-700">{doc.name || 'Untitled Document'}</p>
                                      <p className="text-[10px] font-bold text-slate-400 font-bold">{doc.category || 'Document'} • {formatDate(doc.createdAt)}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2">
                                   {doc.url && (
                                     <a href={doc.url} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all flex items-center gap-2" title="View Document">
                                        <ExternalLink size={18} />
                                     </a>
                                   )}
                                   <button onClick={() => deleteDoc(doc.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all" title="Delete Document">
                                      <Trash2 size={18} />
                                   </button>
                                </div>
                             </div>
                          ))}
                          {documents.length === 0 && (
                            <p className="text-slate-400 text-sm font-bold p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">No documents found.</p>
                          )}
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

export default ManagerProfile;
