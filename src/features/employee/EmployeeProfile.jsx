import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Briefcase, ShieldCheck, Calendar, Award, FolderLock, 
  Edit2, Save, X, Building2, CheckCircle2, Star, Camera, Plus, Trash2, Download, Eye, FileText, Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import { uploadAPI } from '../../utils/apiService';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import DatePicker from '../../shared/components/common/DatePicker';

const EmployeeProfile = () => {
  const { profile, setProfile, documents, uploadDoc, deleteDoc, showToast } = useEmployee();
  const { formatDate } = useDateFormat();
  const [activeTab, setActiveTab] = useState('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState(profile);
  const fileInputRef = useRef(null);

  // Document modal & action states
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('ID Proof');
  const [newDocContent, setNewDocContent] = useState('');
  const [newDocSize, setNewDocSize] = useState('');
  const [previewDoc, setPreviewDoc] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewDocContent(reader.result);
        const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
        setNewDocSize(sizeInMb > 0.1 ? `${sizeInMb} MB` : `${(file.size / 1024).toFixed(0)} KB`);
        if (!newDocName) {
          setNewDocName(file.name);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddDocSubmit = (e) => {
    e.preventDefault();
    if (!newDocName || !newDocContent) {
      showToast('Please provide a name and upload a file', 'error');
      return;
    }
    uploadDoc({
      name: newDocName,
      category: newDocCategory,
      size: newDocSize || '1.0 KB',
      date: new Date().toISOString().split('T')[0],
      content: newDocContent
    });
    showToast('Document uploaded successfully');
    setNewDocName('');
    setNewDocCategory('ID Proof');
    setNewDocContent('');
    setNewDocSize('');
    setIsAddDocOpen(false);
  };

  const handleDownload = (doc) => {
    const element = document.createElement("a");
    let file;
    if (doc.content && doc.content.startsWith('data:')) {
      const parts = doc.content.split(';base64,');
      const contentType = parts[0].split(':')[1];
      const raw = window.atob(parts[1]);
      const rawLength = raw.length;
      const uInt8Array = new Uint8Array(rawLength);
      for (let i = 0; i < rawLength; ++i) {
        uInt8Array[i] = raw.charCodeAt(i);
      }
      file = new Blob([uInt8Array], { type: contentType });
    } else {
      file = new Blob([doc.content || ""], { type: 'text/plain' });
    }
    element.href = URL.createObjectURL(file);
    element.download = doc.name;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    showToast('Download started');
  };

  useEffect(() => {
    if (profile) {
      setEditData(profile);
    }
  }, [profile]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'work', label: 'Work Details', icon: Briefcase },
    { id: 'emergency', label: 'Emergency Contacts', icon: ShieldCheck },
    { id: 'documents', label: 'Documents', icon: FolderLock },
  ];

  const handleSave = async () => {
    try {
      setIsSaving(true);
      let parsedDob = null;
      if (editData.dob) {
        const d = new Date(editData.dob);
        if (!isNaN(d.getTime())) {
          parsedDob = d.toISOString();
        } else {
          parsedDob = editData.dob;
        }
      }

      const payload = {
        fullName: editData.fullName || '',
        email: editData.email || '',
        phone: editData.phone || '',
        dob: parsedDob,
        bloodGroup: editData.bloodGroup || '',
        gender: editData.gender || '',
        address: editData.address || '',
        avatarUrl: editData.avatar || null,
        emergencyName: editData.emergencyContact?.name || editData.emergencyName || '',
        emergencyPhone: editData.emergencyContact?.phone || editData.emergencyPhone || '',
        emergencyRelation: editData.emergencyContact?.relation || editData.emergencyRelation || '',
        emergencyContact: {
          name: editData.emergencyContact?.name || editData.emergencyName || '',
          relation: editData.emergencyContact?.relation || editData.emergencyRelation || '',
          phone: editData.emergencyContact?.phone || editData.emergencyPhone || ''
        }
      };
      await setProfile(payload);
      setIsEditing(false);
    } catch (err) {
      console.error('Save profile error:', err);
      showToast('Failed to save profile changes', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const response = await uploadAPI.uploadImage(file, 'hcm/avatars');
        const cloudUrl = response.data?.data?.url;
        if (cloudUrl) {
          setEditData({ ...editData, avatar: cloudUrl });
          if (!isEditing) {
            const payload = {
              fullName: profile.fullName,
              email: profile.email,
              phone: profile.phone,
              dob: profile.dob ? new Date(profile.dob).toISOString() : null,
              bloodGroup: profile.bloodGroup,
              gender: profile.gender,
              address: profile.address,
              avatarUrl: cloudUrl,
              emergencyName: profile.emergencyContact?.name,
              emergencyPhone: profile.emergencyContact?.phone,
              emergencyRelation: profile.emergencyContact?.relation,
            };
            setProfile(payload);
          }
        } else {
          throw new Error('No URL returned');
        }
      } catch (err) {
        console.error('Cloud avatar upload failed, using base64 fallback:', err);
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditData({ ...editData, avatar: reader.result });
          if (!isEditing) {
            const payload = {
              fullName: profile.fullName,
              email: profile.email,
              phone: profile.phone,
              dob: profile.dob ? new Date(profile.dob).toISOString() : null,
              bloodGroup: profile.bloodGroup,
              gender: profile.gender,
              address: profile.address,
              avatarUrl: reader.result,
              emergencyName: profile.emergencyContact?.name,
              emergencyPhone: profile.emergencyContact?.phone,
              emergencyRelation: profile.emergencyContact?.relation,
            };
            setProfile(payload);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleRemoveAvatar = () => {
    setEditData(prev => ({ ...prev, avatar: null }));
    const payload = {
      fullName: profile.fullName,
      email: profile.email,
      phone: profile.phone,
      dob: profile.dob ? new Date(profile.dob).toISOString() : null,
      bloodGroup: profile.bloodGroup,
      gender: profile.gender,
      address: profile.address,
      avatarUrl: null,
      emergencyName: profile.emergencyContact?.name,
      emergencyPhone: profile.emergencyContact?.phone,
      emergencyRelation: profile.emergencyContact?.relation,
    };
    setProfile(payload);
    showToast('Profile image removed');
  };

  const getAvatarSrc = () => {
    const avatar = isEditing ? editData.avatar : profile.avatar;
    if (avatar) return avatar;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'Employee')}&background=4f46e5&color=fff`;
  };

  const updateNested = (category, field, value) => {
    setEditData(prev => ({
      ...prev,
      [category]: {
        ...(prev?.[category] || {}),
        [field]: value
      }
    }));
  };

  if (!profile || !editData) {
    return (
      <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto px-4 sm:px-0">
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-[2rem] animate-pulse mx-auto mb-6" />
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mx-auto mb-3" />
          <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800/60 rounded animate-pulse mx-auto" />
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-8">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">My Profile</h1>
          <p className="text-slate-500 font-bold tracking-tight">Manage your personal and professional identity</p>
        </div>
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button 
                disabled={isSaving}
                onClick={() => { setIsEditing(false); setEditData(profile); }} 
                className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <X size={18} />
                <span>Cancel</span>
              </button>
              <button 
                disabled={isSaving}
                onClick={handleSave} 
                className="btn-primary px-8 py-2.5 font-bold flex items-center gap-2 shadow-xl shadow-primary-200 disabled:opacity-50"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2">
              <Edit2 size={18} />
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Sidebar */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
           
           {/* Profile Photo & Summary */}
           <div className="card p-8  text-center group">
              <div className="relative inline-block mb-6">
                  <div className="w-40 h-40 rounded-[2.5rem] bg-slate-50 p-1 border-4 border-white shadow-2xl overflow-hidden relative transition-all duration-500">
                    <img 
                      src={getAvatarSrc()} 
                      alt="Profile" 
                      className="w-full h-full object-cover rounded-[2rem]" 
                    />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                       <label className="flex flex-col items-center text-white cursor-pointer hover:text-primary-300">
                          <Camera size={20} />
                          <span className="text-[9px] font-bold uppercase mt-1">Change</span>
                          <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                       </label>
                       {((isEditing ? editData.avatar : profile.avatar)) && !((isEditing ? editData.avatar : profile.avatar)).includes('ui-avatars.com') && (
                          <button 
                             onClick={handleRemoveAvatar}
                             className="flex flex-col items-center text-white hover:text-rose-400"
                          >
                             <Trash2 size={20} />
                             <span className="text-[9px] font-bold uppercase mt-1">Remove</span>
                          </button>
                       )}
                    </div>
                  </div>
                 <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 text-white rounded-2xl flex items-center justify-center border-4 border-white shadow-xl">
                    <CheckCircle2 size={20} />
                 </div>
              </div>

              <h3 className="text-2xl font-black text-slate-900 leading-none dark:text-white">{profile.fullName}</h3>
              <p className="text-primary-600 font-bold text-xs mt-3">{profile.role}</p>
              
              <div className="mt-8 flex flex-wrap justify-center gap-2">
                 <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-black font-bold rounded-lg border border-slate-200">{profile.department}</span>
                 <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black font-bold rounded-lg border border-primary-100">{profile.employeeId}</span>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 space-y-4">
                 <div className="flex items-center gap-3 text-slate-600">
                    <Mail size={16} className="text-slate-300" />
                    <span className="text-sm font-bold truncate">{profile.email}</span>
                 </div>
                 <div className="flex items-center gap-3 text-slate-600">
                    <MapPin size={16} className="text-slate-300" />
                    <span className="text-sm font-bold truncate">{(profile.address || 'Not Provided').split(',')[1] || profile.address || 'Not Provided'}</span>
                 </div>
              </div>
           </div>

           {/* Skills Card (Preview) */}
           <div className="card p-8 ">
              <div className="flex items-center justify-between mb-8">
                 <h4 className="text-[10px] font-bold text-slate-400 leading-none">Core Expertise</h4>
                 <Star size={18} className="text-amber-400" />
              </div>
              <div className="flex flex-wrap gap-2">
                 {['React', 'Node.js', 'Typescript', 'Tailwind'].map((skill, i) => (
                    <span key={i} className="px-3 py-2 hcm-badge hcm-badge-draft text-xs font-black rounded-xl border border-slate-100 italic">
                       #{skill}
                    </span>
                 ))}
                 <button className="px-3 py-2 border-2 border-dashed border-slate-100 text-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all flex items-center gap-2">
                    <Plus size={14} />
                 </button>
              </div>
           </div>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Section Tabs */}
           <div className="flex items-center gap-2 bg-white p-2 rounded-2xl shadow-soft border border-slate-50">
              {tabs.map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={cn(
                      "flex-1 flex items-center justify-center gap-3 py-4 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                      activeTab === tab.id 
                        ? "bg-slate-900 text-white shadow-xl shadow-slate-200" 
                        : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                   )}
                 >
                    <tab.icon size={18} />
                    <span className="hidden md:inline">{tab.label}</span>
                 </button>
              ))}
           </div>

           {/* Details Panel */}
           <div className="card min-h-[600px]  p-10 overflow-hidden">
              <AnimatePresence mode="wait">
                 <motion.div
                   key={activeTab}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   transition={{ duration: 0.2 }}
                 >
                    {activeTab === 'personal' && (
                       <div className="space-y-12">
                          <div className="space-y-8">
                             <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3 border-l-4 border-primary-600 pl-4 leading-none dark:text-white">Personal Data</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                {[
                                   { label: 'Full Name', value: editData.fullName, field: 'fullName' },
                                   { label: 'Email Address', value: editData.email, field: 'email', type: 'email' },
                                   { label: 'Phone Number', value: editData.phone, field: 'phone', type: 'phone' },
                                   { label: 'Date of Birth', value: editData.dob, field: 'dob', type: 'date' },
                                   { label: 'Blood Group', value: editData.bloodGroup, field: 'bloodGroup' },
                                   { label: 'Gender', value: editData.gender, field: 'gender', type: 'select', options: ['Male', 'Female', 'Other'] },
                                ].map((field, i) => (
                                   <div key={i} className="space-y-2 text-left">
                                      <label className="text-[10px] font-black text-slate-400 font-bold px-1">{field.label}</label>
                                       {isEditing ? (
                                          field.type === 'select' ? (
                                             <select 
                                               value={editData[field.field] || ''} 
                                               onChange={(e) => setEditData({ ...editData, [field.field]: e.target.value })} 
                                               className="input-field h-14 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold"
                                             >
                                                <option value="" disabled>Select {field.label}</option>
                                                {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                             </select>
                                          ) : field.type === 'phone' ? (
                                              <PhoneInput 
                                                name={field.field} 
                                                value={editData[field.field] || ''} 
                                                onChange={(e) => setEditData({ ...editData, [field.field]: e.target.value })} 
                                                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold" 
                                              />
                                          ) : field.type === 'date' ? (
                                              <DatePicker 
                                                name={field.field} 
                                                value={editData[field.field] || ''} 
                                                onChange={(e) => setEditData({ ...editData, [field.field]: e.target.value })} 
                                                className="input-field h-14 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold px-4 rounded-xl" 
                                              />
                                          ) : (
                                             <input 
                                               type={field.type || 'text'} 
                                               value={editData[field.field] || ''} 
                                               onChange={(e) => setEditData({ ...editData, [field.field]: e.target.value })} 
                                               className="input-field h-14 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold" 
                                             />
                                          )
                                       ) : (
                                         <p className="px-1 text-sm font-black text-slate-800 dark:text-white">{profile[field.field] || 'Not specified'}</p>
                                      )}
                                   </div>
                                ))}
                                <div className="space-y-2 text-left md:col-span-2">
                                   <label className="text-[10px] font-black text-slate-400 font-bold px-1">Residential Address</label>
                                   {isEditing ? (
                                      <textarea 
                                        rows="2" 
                                        value={editData.address} 
                                        onChange={(e) => setEditData({ ...editData, address: e.target.value })} 
                                        className="input-field py-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold resize-none"
                                      />
                                   ) : (
                                      <p className="px-1 text-sm font-black text-slate-800">{profile.address}</p>
                                   )}
                                </div>
                             </div>
                          </div>
                       </div>
                    )}

                    {activeTab === 'work' && (
                       <div className="space-y-12">
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 border-l-4 border-indigo-600 pl-4 leading-none dark:text-white">Job Profile</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                             {[
                                { label: 'Employee ID', value: profile.employeeId, icon: ShieldCheck, readonly: true },
                                { label: 'Department', value: profile.department, icon: Building2, readonly: true },
                                { label: 'Current Role', value: profile.role, icon: Briefcase, readonly: true },
                                { label: 'Manager', value: profile.manager?.fullName || 'None', icon: User, readonly: true },
                                { label: 'Joining Date', value: profile.joiningDate ? formatDate(profile.joiningDate) : 'Not Specified', icon: Calendar, readonly: true },
                             ].map((field, i) => (
                                <div key={i} className="flex items-center gap-5 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                   <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400">
                                      <field.icon size={20} />
                                   </div>
                                   <div>
                                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{field.label}</p>
                                      <p className="text-sm font-black text-slate-900 leading-none">{field.value}</p>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeTab === 'emergency' && (
                       <div className="space-y-12">
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 border-l-4 border-rose-600 pl-4 leading-none dark:text-white">Emergency Contact</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                             {[
                                { label: 'Contact Name', value: editData.emergencyContact?.name || '', field: 'name' },
                                { label: 'Relationship', value: editData.emergencyContact?.relation || '', field: 'relation' },
                                { label: 'Primary Phone', value: editData.emergencyContact?.phone || '', field: 'phone', type: 'phone' },
                             ].map((field, i) => (
                                <div key={i} className="space-y-2 text-left">
                                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">{field.label}</label>
                                   {isEditing ? (
                                      field.type === 'phone' ? (
                                        <PhoneInput 
                                          name={field.field}
                                          value={field.value}
                                          onChange={(e) => updateNested('emergencyContact', field.field, e.target.value)}
                                          className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold"
                                        />
                                      ) : (
                                        <input 
                                          type="text" 
                                          value={field.value}
                                          onChange={(e) => updateNested('emergencyContact', field.field, e.target.value)} 
                                          className="input-field h-14 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 font-bold" 
                                        />
                                      )
                                   ) : (
                                      <p className="px-1 text-sm font-black text-slate-800 dark:text-white">{profile.emergencyContact?.[field.field] || 'Not Specified'}</p>
                                   )}
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {activeTab === 'documents' && (
                       <div className="space-y-10">
                          <div className="flex items-center justify-between">
                             <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 border-l-4 border-emerald-600 pl-4 leading-none dark:text-white">Employment Record</h3>
                             <button onClick={() => setIsAddDocOpen(true)} className="btn-secondary px-5 py-2 font-bold text-[10px] flex items-center gap-2">
                                <Plus size={16} /> Add New
                             </button>
                          </div>
                          <div className="grid grid-cols-1 gap-4">
                             {documents.map((doc) => (
                                <div key={doc.id} className="group p-5 bg-slate-50 border border-slate-100 rounded-3xl hover:bg-white hover:shadow-xl transition-all flex items-center justify-between">
                                   <div className="flex items-center gap-5">
                                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm">
                                         <FileText size={24} />
                                      </div>
                                      <div>
                                         <p className="text-sm font-bold text-slate-900 leading-none">{doc.name}</p>
                                         <p className="text-[10px] font-bold text-slate-400 font-bold mt-2">{doc.category} • {doc.size} • {doc.date}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-2 transition-opacity">
                                      <button onClick={() => setPreviewDoc(doc)} className="p-3 bg-white text-slate-400 hover:text-primary-600 border border-slate-100 rounded-2xl shadow-sm transition-all" title="Preview"><Eye size={18} /></button>
                                      <button onClick={() => handleDownload(doc)} className="p-3 bg-white text-slate-400 hover:text-emerald-600 border border-slate-100 rounded-2xl shadow-sm transition-all" title="Download"><Download size={18} /></button>
                                      <button onClick={() => { deleteDoc(doc.id); showToast('Document deleted'); }} className="p-3 bg-white text-slate-400 hover:text-rose-600 border border-slate-100 rounded-2xl shadow-sm transition-all" title="Delete"><Trash2 size={18} /></button>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}
                 </motion.div>
              </AnimatePresence>
            </div>
         </div>
       </div>

      {/* Add Document Modal */}
      <AnimatePresence>
        {isAddDocOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Upload New Document</h3>
                <button onClick={() => setIsAddDocOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddDocSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 font-bold px-1">Document Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Passport_Copy.pdf"
                    value={newDocName} 
                    onChange={e => setNewDocName(e.target.value)} 
                    className="input-field h-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 font-bold px-1">Category</label>
                  <select 
                    value={newDocCategory} 
                    onChange={e => setNewDocCategory(e.target.value)} 
                    className="input-field h-12 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option>ID Proof</option>
                    <option>Contracts</option>
                    <option>Education</option>
                    <option>Benefits</option>
                    <option>Medical</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">File Upload</label>
                  <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors relative">
                    <input 
                      type="file" 
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                    <FileText className="mx-auto text-slate-400 mb-2" size={32} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300 block">
                      {newDocSize ? `Selected: (${newDocSize})` : 'Drag & drop or click to upload'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setIsAddDocOpen(false)} className="flex-1 btn-secondary py-3 font-bold text-xs">Cancel</button>
                  <button type="submit" className="flex-1 btn-primary py-3 font-bold text-xs shadow-xl shadow-primary-200">Upload</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Preview Document Modal */}
      <AnimatePresence>
        {previewDoc && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 dark:border-slate-800 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-none">{previewDoc.name}</h3>
                  <span className="text-[10px] font-black font-bold text-slate-400 mt-2 block">{previewDoc.category} • {previewDoc.size}</span>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 min-h-[300px] flex items-center justify-center border border-slate-100 dark:border-slate-900 overflow-auto">
                {previewDoc.content && previewDoc.content.startsWith('data:image') ? (
                  <img src={previewDoc.content} alt={previewDoc.name} className="max-h-[400px] object-contain rounded-lg" />
                ) : (
                  <div className="text-center space-y-3">
                    <FileText className="mx-auto text-primary-500 animate-pulse" size={64} />
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Preview of non-image files is ready for download.</p>
                    <button 
                      onClick={() => { handleDownload(previewDoc); setPreviewDoc(null); }} 
                      className="btn-primary px-6 py-2.5 font-bold text-[10px] inline-flex items-center gap-2 shadow-lg"
                    >
                      <Download size={14} /> Download to View
                    </button>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button onClick={() => setPreviewDoc(null)} className="btn-secondary px-6 py-3 font-bold text-xs">Close</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeProfile;
