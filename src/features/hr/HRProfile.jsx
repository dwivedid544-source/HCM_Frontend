import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Settings, Briefcase, Camera, 
  MapPin, Phone, Mail, Building, Clock, Activity, 
  Lock, Bell, Smartphone, Globe, AlertTriangle, Key,
  X, CheckCircle2, ChevronDown, Edit3, Save, Trash2, Eye, EyeOff, FileText, Upload, Download
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAuth } from '../../hooks/useAuth';
import { useHR } from '../../context/HRContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import { employeeAPI, uploadAPI } from '../../utils/apiService';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import DatePicker from '../../shared/components/common/DatePicker';

const HRProfile = () => {
  const { user } = useAuth();
  const { profile, updateProfile, uploadDoc, showToast } = useHR();
  const { formatDate } = useDateFormat();

  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [docToDelete, setDocToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [profileData, setProfileData] = useState({
    personal: {
      fullName: user?.name || 'HR Manager',
      email: user?.email || 'hr@demo.com',
      phone: '',
      dob: '',
      gender: '',
      address: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    },
    work: {
      employeeId: '',
      role: '',
      department: '',
      designation: '',
      managerName: '',
      joinDate: '',
      type: 'Full-Time',
      location: '',
      shiftTiming: '',
      status: 'Active'
    },
    emergency: {
      contactName: '',
      relation: '',
      phone: '',
      alternatePhone: '',
      email: '',
      address: ''
    },
    documents: []
  });

  const loadProfileData = async () => {
    try {
      const [profileRes, docsRes] = await Promise.all([
        employeeAPI.getProfile(),
        employeeAPI.getDocuments()
      ]);
      
      if (profileRes.data?.success) {
        const p = profileRes.data.data;
        setAvatarPreview(p.avatarUrl || '');
        
        setProfileData(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            fullName: p.fullName || user?.name || '',
            email: user?.email || '',
            phone: p.phone || '',
            dob: p.dob ? new Date(p.dob).toISOString().split('T')[0] : '',
            gender: p.gender || '',
            address: p.address || '',
          },
          work: {
            ...prev.work,
            employeeId: p.employeeId || '',
            role: user?.role || 'HR',
            department: p.department?.name || '',
            managerName: p.manager?.fullName || '',
            joinDate: p.joiningDate ? new Date(p.joiningDate).toISOString().split('T')[0] : ''
          },
          emergency: {
            ...prev.emergency,
            contactName: p.emergencyName || '',
            phone: p.emergencyPhone || '',
            relation: p.emergencyRelation || '',
          }
        }));
      }

      if (docsRes.data?.success) {
        setProfileData(prev => ({
          ...prev,
          documents: docsRes.data.data
        }));
      }
    } catch (err) {
      console.error(err);
      showToast('Failed to load profile data.', 'error');
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleSave = async () => {
    if (isEditing) {
      if (!profileData.personal.fullName) {
         showToast('Error: Name cannot be empty.', 'error');
         return;
      }
      
      try {
        const payload = {
          fullName: profileData.personal.fullName,
          phone: profileData.personal.phone,
          gender: profileData.personal.gender,
          address: profileData.personal.address,
          avatarUrl: avatarPreview,
          emergencyName: profileData.emergency.contactName,
          emergencyPhone: profileData.emergency.phone,
          emergencyRelation: profileData.emergency.relation,
          dob: profileData.personal.dob || null
        };
        
        const res = await employeeAPI.updateProfile(payload);
        if (res.data?.success) {
          setIsEditing(false);
          showToast('Profile updated securely.');
        }
      } catch (err) {
        showToast('Failed to update profile.', 'error');
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
        } else {
          throw new Error('No URL returned');
        }
      } catch (err) {
        console.error('Cloud avatar upload failed, using base64 fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => setAvatarPreview(reader.result);
        reader.readAsDataURL(file);
      }
    }
  };

  const removeAvatar = () => {
    setAvatarPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateField = (category, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [category]: { ...prev[category], [field]: value }
    }));
  };

  const handleDocumentUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Uploading document...');
      const sizeMB = (file.size / (1024 * 1024)).toFixed(2) + ' MB';

      // Try cloud upload first
      let fileData;
      try {
        const cloudResponse = await uploadAPI.uploadDocument(file, 'hcm/documents');
        fileData = cloudResponse.data?.data?.url;
      } catch (cloudErr) {
        console.error('Cloud doc upload failed, using base64 fallback:', cloudErr);
        // Fallback to base64
        fileData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });
      }

      const payload = {
        name: file.name,
        category: 'Document',
        size: sizeMB,
        fileBase64: fileData
      };

      const res = await employeeAPI.uploadDocument(payload);
      if (res.data?.success) {
        showToast('Document uploaded successfully.');
        setProfileData(prev => ({
          ...prev,
          documents: [res.data.data, ...prev.documents]
        }));
      }
    } catch (err) {
      showToast('Failed to upload document.', 'error');
    }
    if (documentInputRef.current) documentInputRef.current.value = '';
  };

  const deleteDocument = async (id) => {
    try {
      const res = await employeeAPI.deleteDocument(id);
      if (res.data?.success) {
        setProfileData(prev => ({
          ...prev,
          documents: prev.documents.filter(d => d.id !== id)
        }));
        showToast('Document deleted.');
      }
    } catch (err) {
      showToast('Failed to delete document.', 'error');
    }
    setDocToDelete(null);
  };

  const viewDocument = (url) => {
    if (url) window.open(url, '_blank');
    else showToast('Document URL not found', 'error');
  };

  const downloadDocument = async (url, filename) => {
    if (!url) {
      showToast('Document URL not found', 'error');
      return;
    }
    try {
      showToast(`Downloading ${filename}...`);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename || 'document';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      showToast('Download failed.', 'error');
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'work', label: 'Work Details', icon: Briefcase },
    { id: 'emergency', label: 'Emergency Contact', icon: AlertTriangle },
    { id: 'documents', label: 'Documents', icon: FileText }
  ];

  // Helper for input classes
  const getInputClass = () => cn(
    "input-field h-12 font-bold",
    isEditing ? "bg-white border-slate-300 focus:border-primary-500 shadow-sm" : "bg-slate-50 border-transparent text-slate-600 cursor-default"
  );
  const getSelectClass = () => cn(
    "input-field h-12 font-bold appearance-none",
    isEditing ? "bg-white border-slate-300 focus:border-primary-500 shadow-sm" : "bg-slate-50 border-transparent text-slate-600 cursor-default"
  );
  const getTextareaClass = () => cn(
    "input-field py-3 font-bold resize-none",
    isEditing ? "bg-white border-slate-300 focus:border-primary-500 shadow-sm" : "bg-slate-50 border-transparent text-slate-600 cursor-default"
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">HR Profile</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Manage your professional identity and records</p>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2">
              <Edit3 size={18} />
              <span>Edit Profile</span>
            </button>
          ) : (
            <>
              <button onClick={() => { setIsEditing(false); loadProfileData(); }} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2">
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
                 <div className="w-32 h-32 rounded-full overflow-hidden ring-4 ring-primary-50 relative bg-slate-100 flex items-center justify-center">
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
                 {isEditing && avatarPreview && (
                   <button onClick={removeAvatar} className="absolute top-0 right-0 p-1.5 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-colors z-10">
                     <X size={14} />
                   </button>
                 )}
              </div>
              <h2 className="text-xl font-extrabold text-slate-900">{profileData.personal.fullName}</h2>
              <span className="mt-2 inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold text-primary-600 bg-primary-50 rounded border border-primary-100">
                 {profileData.work.role}
              </span>
              
              <div className="mt-6 pt-6 border-t border-slate-50 text-left space-y-4">
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-400 font-bold mb-1">Email</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{profileData.personal.email}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-400 font-bold mb-1">Phone</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{profileData.personal.phone || '-'}</p>
                 </div>
                 <div>
                    <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Join Date</p>
                    <p className="text-sm font-bold text-slate-700 truncate">{profileData.work.joinDate || '-'}</p>
                 </div>
              </div>
           </div>

           <div className="card p-6 bg-white shadow-soft space-y-5 flex flex-col justify-center">
               <h3 className="text-xs font-bold text-slate-400">Account Status</h3>
               <div className="flex items-center gap-3 justify-center mb-2 mt-4">
                  <div className="p-3 bg-emerald-50 rounded-full text-emerald-600 shadow-sm border border-emerald-100">
                     <CheckCircle2 size={28} />
                  </div>
               </div>
               <p className="text-center text-sm font-bold text-emerald-600 uppercase tracking-widest">Active & Verified</p>
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
                          <div className="space-y-2 relative">
                             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Full Name</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.fullName} onChange={e => updateField('personal', 'fullName', e.target.value)} className={getInputClass()} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Email <span className="text-red-400">*</span></label>
                             <input type="email" readOnly={true} value={profileData.personal.email} className={cn("input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed")} title="Email cannot be changed" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Phone</label>
                             <PhoneInput name="phone" disabled={!isEditing} value={profileData.personal.phone} onChange={e => updateField('personal', 'phone', e.target.value)} className={isEditing ? "bg-white border-slate-300 focus:border-primary-500 shadow-sm" : "bg-slate-50 border-transparent text-slate-600 cursor-default"} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Gender</label>
                             <select disabled={!isEditing} value={profileData.personal.gender} onChange={e => updateField('personal', 'gender', e.target.value)} className={getSelectClass()}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                             </select>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Date of Birth</label>
                             <DatePicker  readOnly={!isEditing} value={profileData.personal.dob} onChange={e => updateField('personal', 'dob', e.target.value)} className={getInputClass()} />
                          </div>
                          <div className="space-y-2 md:col-span-2 pt-4 border-t border-slate-50">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Address Location</label>
                             <input type="text" readOnly={!isEditing} value={profileData.personal.address} onChange={e => updateField('personal', 'address', e.target.value)} className={getInputClass()} />
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
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Department</label>
                             <input type="text" readOnly value={profileData.work.department} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Manager Name</label>
                             <input type="text" readOnly value={profileData.work.managerName} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Join Date</label>
                             <input type="text" readOnly value={profileData.work.joinDate} className="input-field h-12 font-bold bg-slate-50 border-transparent text-slate-500 cursor-not-allowed" />
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {/* EMERGENCY CONTACT TAB */}
                 {activeTab === 'emergency' && (
                    <motion.div key="emergency" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 flex-1">
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Contact Name</label>
                             <input type="text" readOnly={!isEditing} value={profileData.emergency.contactName} onChange={e => updateField('emergency', 'contactName', e.target.value)} className={getInputClass()} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Relationship</label>
                             <input type="text" readOnly={!isEditing} value={profileData.emergency.relation} onChange={e => updateField('emergency', 'relation', e.target.value)} className={getInputClass()} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                             <PhoneInput name="emergencyPhone" disabled={!isEditing} value={profileData.emergency.phone} onChange={e => updateField('emergency', 'phone', e.target.value)} className={isEditing ? "bg-white border-slate-300 focus:border-primary-500 shadow-sm" : "bg-slate-50 border-transparent text-slate-600 cursor-default"} />
                          </div>
                       </div>
                    </motion.div>
                 )}

                 {/* DOCUMENTS TAB */}
                 {activeTab === 'documents' && (
                    <motion.div key="documents" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                       <div className="flex items-center justify-between">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Personal Documents</h3>
                          <label className="btn-primary px-4 py-2 font-bold flex items-center gap-2 shadow-sm text-sm cursor-pointer">
                             <Upload size={16} />
                             <span>Upload File</span>
                             <input type="file" className="hidden" ref={documentInputRef} onChange={handleDocumentUpload} />
                          </label>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {profileData.documents.map(doc => (
                             <div key={doc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-primary-200 transition-colors">
                                <div className="flex items-center gap-4">
                                   <div className="p-3 bg-white rounded-xl text-primary-500 shadow-sm border border-slate-100">
                                      <FileText size={20} />
                                   </div>
                                   <div>
                                      <p className="text-sm font-bold text-slate-900 group-hover:text-primary-700 transition-colors">{doc.name}</p>
                                      <p className="text-[10px] font-bold text-slate-400 mt-1">{doc.category || 'Document'} • {formatDate(doc.date || new Date())}</p>
                                   </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => downloadDocument(doc.url, doc.name)} className="p-2 text-slate-500 hover:text-primary-600 hover:bg-white rounded-lg shadow-sm transition-all" title="Download">
                                      <Download size={16} />
                                   </button>
                                   <button onClick={() => viewDocument(doc.url)} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-lg shadow-sm transition-all" title="View">
                                      <Eye size={16} />
                                   </button>
                                   <button onClick={() => setDocToDelete(doc)} className="p-2 text-slate-500 hover:text-rose-500 hover:bg-white rounded-lg shadow-sm transition-all" title="Delete">
                                      <Trash2 size={16} />
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                       {profileData.documents.length === 0 && (
                          <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-slate-200 rounded-3xl text-slate-400 bg-slate-50">
                             <FileText size={32} className="mb-4 text-slate-300" />
                             <p className="text-sm font-bold">No documents uploaded yet.</p>
                          </div>
                       )}
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>
        </div>
      </div>
      <ConfirmDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={() => deleteDocument(docToDelete.id)}
        title="Delete Document"
        message={`Are you sure you want to delete "${docToDelete?.name}"? This action cannot be undone.`}
      />
    </div>
  );
};

export default HRProfile;
