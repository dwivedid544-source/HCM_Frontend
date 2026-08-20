import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, FileText, Trash2, CheckCircle2,
  ChevronRight, Plus, MapPin, Mail, Phone, Globe, Clock, Smartphone,
  Monitor, Camera, LogOut, Save, AlertTriangle, Settings2, Info,
  RotateCcw, ShieldAlert, Key, Zap, Check, Cloud, Download, Edit3, X, ExternalLink
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCandidate } from '../../context/CandidateContext';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import { useDateFormat } from '../../hooks/useDateFormat';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const CandidateProfile = () => {
  const { profile, updateProfile, showToast } = useCandidate();
  const { formatDate } = useDateFormat();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = usePersistedTab('cand_profile', 'personal');
  const [formData, setFormData] = useState(profile);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional Info', icon: Briefcase },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'skills', label: 'Skills', icon: Zap },
    { id: 'social', label: 'Social Links', icon: Globe },
    { id: 'documents', label: 'Documents', icon: Cloud },
  ];

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    showToast('Profile updated successfully');
  };

  const handleCancel = () => {
    setFormData(profile);
    setIsEditing(false);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result, avatarBase64: reader.result }));
        showToast('Profile picture updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, resumeUrl: file.name, resumeBase64: reader.result }));
        showToast('Resume updated');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDocumentUpload = (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => {
          const newDoc = {
            id: `doc-${type.toLowerCase()}`,
            name: file.name,
            type: type,
            date: formatDate(new Date()),
            isNew: true,
            url: reader.result
          };
          const base64Field = type === 'Identification' ? 'identityProofBase64' : 'educationProofBase64';
          return {
            ...prev,
            [base64Field]: reader.result,
            documents: prev.documents ? [...prev.documents.filter(d => d.type !== type), newDoc] : [newDoc]
          };
        });
        showToast(`${type} updated`);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeDocument = (type) => {
    setFormData(prev => {
      const base64Field = type === 'Identification' ? 'identityProofBase64' : 'educationProofBase64';
      const urlField = type === 'Identification' ? 'identityProofUrl' : 'educationProofUrl';
      return {
        ...prev,
        [base64Field]: null,
        [urlField]: null,
        documents: prev.documents ? prev.documents.filter(d => d.type !== type) : []
      };
    });
  };

  const toggleSkill = (skill) => {
    if (!isEditing) return;
    const newSkills = formData.skills.includes(skill)
      ? formData.skills.filter(s => s !== skill)
      : [...formData.skills, skill];
    setFormData(prev => ({ ...prev, skills: newSkills }));
  };

  const addSkill = (e) => {
    e.preventDefault();
    const skill = e.target.skill.value.trim();
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({ ...prev, skills: [...prev.skills, skill] }));
      e.target.reset();
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-fade-in max-w-7xl mx-auto text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-soft">
        <div className="flex items-center gap-8">
          <div className="relative group">
            <div className="w-24 h-24 rounded-2xl bg-slate-50 border-4 border-white shadow-2xl overflow-hidden relative">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400">
                  <User size={40} />
                </div>
              )}
              {isEditing && (
                <label className="absolute inset-0 bg-primary-600/40 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-100">
                  <Camera className="text-white" size={24} />
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                </label>
              )}
            </div>
            {isEditing && formData.avatar && (
              <button onClick={() => setFormData(prev => ({ ...prev, avatar: null, avatarBase64: null, avatarUrl: null }))} className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-lg hover:bg-rose-600 transition-colors z-10">
                <X size={14} />
              </button>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight leading-none mb-2">{formData.fullName}</h1>
            <p className="text-slate-400 font-medium text-sm">{formData.role} • <span className="text-slate-900 font-medium">Professional Profile</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="btn-primary h-14 px-8 shadow-xl shadow-primary-200 flex items-center gap-3 transition-all"
            >
              <Edit3 size={18} /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={handleCancel}
                className="btn-secondary h-14 px-8 flex items-center gap-3 transition-all"
              >
                <X size={18} /> Cancel
              </button>
              <button
                onClick={handleSave}
                className="btn-primary h-14 px-8 shadow-xl shadow-primary-200 flex items-center gap-3 transition-all"
              >
                <Save size={18} /> Save Profile
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation Interface */}
        <div className="lg:col-span-3">
          <div className="card border-none bg-white p-4 shadow-soft rounded-[2.5rem] space-y-2 sticky top-24">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-5 p-5 rounded-[1.75rem] transition-all",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white shadow-premium scale-105"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <div className={cn("p-2 rounded-xl transition-all duration-700", activeTab === tab.id ? "bg-white/20 rotate-12" : "bg-slate-50")}>
                  <tab.icon size={20} className={cn(activeTab === tab.id ? "text-white" : "text-slate-400")} />
                </div>
                <span className="text-sm font-bold text-left">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Configuration Viewport */}
        <div className="lg:col-span-9">
          <div className="card min-h-[600px] border-none bg-white p-12 rounded-[4rem] shadow-soft overflow-hidden relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                {activeTab === 'personal' && (
                  <div className="space-y-12 text-left">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <User className="text-primary-600" size={24} />
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Personal Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                      {[
                        { label: 'Full Name', key: 'fullName', type: 'text' },
                        { label: 'Email Address', key: 'email', type: 'email' },
                        { label: 'Phone Number', key: 'phone', type: 'text' },
                        { label: 'Date of Birth', key: 'dob', type: 'date' },
                        { label: 'Current Location', key: 'location', type: 'text' },
                        { label: 'Street Address', key: 'address', type: 'text' },
                        { label: 'City', key: 'city', type: 'text' },
                        { label: 'Country', key: 'country', type: 'text' },
                      ].map(field => (
                        <div key={field.key} className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 ml-1">{field.label}</label>
                          {field.key === 'phone' ? (
                            <PhoneInput
                              name="phone"
                              value={formData.phone || ''}
                              disabled={!isEditing}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="h-14 bg-slate-50 border-transparent font-bold shadow-inner"
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={
                                field.type === 'date' && formData[field.key] 
                                  ? String(formData[field.key]).split('T')[0] 
                                  : formData[field.key] || ''
                              }
                              readOnly={!isEditing}
                              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                              className={cn(
                                "input-field h-14 bg-slate-50 border-transparent font-bold shadow-inner",
                                !isEditing && "opacity-60 cursor-default"
                              )}
                            />
                          )}
                        </div>
                      ))}
                      <div className="md:col-span-2 space-y-3">
                        <label className="text-xs font-bold text-slate-400 ml-1">Professional Summary (Bio)</label>
                        <textarea
                          value={formData.bio || ''}
                          readOnly={!isEditing}
                          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                          rows={8}
                          className={cn(
                            "input-field p-6 bg-slate-50 border-transparent font-bold shadow-inner resize-none",
                            !isEditing && "opacity-60 cursor-default"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'professional' && (
                  <div className="space-y-12 text-left">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <Briefcase className="text-primary-600" size={24} />
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Employment Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                      {[
                        { label: 'Current Job Title', key: 'role' },
                        { label: 'Years of Experience', key: 'experience' },
                        { label: 'Current Salary', key: 'currentSalary' },
                        { label: 'Expected Salary', key: 'expectedSalary' },
                        { label: 'Notice Period', key: 'noticePeriod' },
                      ].map(field => (
                        <div key={field.key} className="space-y-3">
                          <label className="text-xs font-bold text-slate-400 ml-1">{field.label}</label>
                          <input
                            type="text"
                            value={formData[field.key] || ''}
                            readOnly={!isEditing}
                            onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                            className={cn(
                              "input-field h-14 bg-slate-50 border-transparent font-bold shadow-inner",
                              !isEditing && "opacity-60 cursor-default"
                            )}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'resume' && (
                  <div className="space-y-12 text-left">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <FileText className="text-primary-600" size={24} />
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Resume Documents</h3>
                    </div>

                    {isEditing && (
                      <label className="p-12 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50/50 flex flex-col items-center justify-center group hover:border-primary-200 transition-all cursor-pointer">
                        <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center text-slate-200 group-hover:text-primary-600 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-xl mb-6">
                          <Cloud size={40} />
                        </div>
                        <p className="text-xs font-bold text-slate-400 mb-4">Upload Protocol Active</p>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Upload New Resume</h4>
                        <p className="text-xs font-medium text-slate-300 mt-4">PDF, DOCX (Max 10MB)</p>
                        <input type="file" className="hidden" accept=".pdf,.docx,.doc" onChange={handleResumeUpload} />
                      </label>
                    )}

                    {formData.resumeUrl && (
                      <div className="p-8 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group">
                        <div className="flex items-center gap-6">
                          <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center text-slate-300 group-hover:text-primary-600 transition-colors shadow-sm border border-slate-100">
                            <FileText size={24} />
                          </div>
                          <div className="text-left max-w-[200px] sm:max-w-xs md:max-w-md">
                            <p className="text-sm font-bold text-slate-900 truncate"> {formData.resumeUrl.split('/').pop()} </p>
                            <p className="text-xs font-medium text-slate-400 mt-1">Uploaded Resume</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {formData.resumeUrl.startsWith('http') && (
                            <a href={formData.resumeUrl} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-white text-slate-400 hover:text-primary-600 rounded-xl flex items-center justify-center transition-all shadow-sm border border-slate-100">
                              <Download size={20} />
                            </a>
                          )}
                          {isEditing && (
                            <button onClick={() => setFormData(prev => ({ ...prev, resumeUrl: null, resumeBase64: null }))} className="w-12 h-12 bg-white text-slate-400 hover:text-rose-500 rounded-xl flex items-center justify-center transition-all shadow-sm border border-slate-100">
                              <Trash2 size={20} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'skills' && (
                  <div className="space-y-12 text-left">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <Zap className="text-primary-600" size={24} />
                      <h3 className="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Skills & Expertise</h3>
                    </div>

                    {isEditing && (
                      <form onSubmit={addSkill} className="relative group">
                        <Plus className="absolute left-6 top-6 text-slate-300 group-focus-within:text-primary-600 transition-colors" size={20} />
                        <input
                          name="skill"
                          placeholder="Type a new skill..."
                          className="input-field h-20 pl-16 pr-40 bg-slate-50 border-transparent font-medium shadow-inner text-sm"
                        />
                        <button type="submit" className="btn-primary absolute right-4 top-4 h-12 px-8 shadow-xl">Add Skill</button>
                      </form>
                    )}

                    <div className="flex flex-wrap gap-4">
                      {formData.skills.map(skill => (
                        <motion.div
                          key={skill}
                          layout
                          className={cn(
                            "px-8 py-5 rounded-[2rem] flex items-center gap-4 border transition-all",
                            isEditing ? "bg-white border-slate-100 shadow-soft cursor-pointer hover:border-rose-100 group" : "bg-slate-50 border-transparent"
                          )}
                          onClick={() => toggleSkill(skill)}
                        >
                          <div className="w-2 h-2 rounded-full bg-primary-600 animate-pulse" />
                          <span className="text-[10px] font-medium font-bold text-slate-900">{skill}</span>
                          {isEditing && <X size={14} className="text-slate-200 group-hover:text-rose-500 transition-colors ml-2" />}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'social' && (
                  <div className="space-y-12 text-left">
                    <div className="flex items-center gap-4 border-b border-slate-50 pb-6">
                      <Globe className="text-primary-600" size={24} />
                      <h3 className="text-xl font-medium text-slate-900 tracking-tight uppercase dark:text-white">Online Presence</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {[
                        { label: 'LinkedIn Profile', key: 'linkedin', icon: ExternalLink },
                        { label: 'Portfolio Website', key: 'portfolio', icon: ExternalLink },
                        { label: 'Personal Website', key: 'website', icon: Globe },
                      ].map(field => (
                        <div key={field.key} className="space-y-3 group">
                          <label className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.3em] ml-1">{field.label}</label>
                          <div className="relative">
                            <field.icon className="absolute left-6 top-6 text-slate-200 group-focus-within:text-primary-600 transition-colors" size={20} />
                            <input
                              type="text"
                              value={formData[field.key] || ''}
                              readOnly={!isEditing}
                              onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                              className={cn(
                                "input-field h-20 pl-16 bg-slate-50 border-transparent font-bold shadow-inner text-sm",
                                !isEditing && "opacity-60 cursor-default"
                              )}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'documents' && (
                  <div className="space-y-12 text-left">
                    <div className="flex items-center justify-between border-b border-slate-50 pb-10">
                      <h3 className="text-2xl font-medium text-slate-900 tracking-tight uppercase dark:text-white">Other Documents</h3>
                      {isEditing && (
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2 px-4 py-3 bg-primary-50 text-primary-600 rounded-xl text-[10px] font-medium shadow-sm hover:bg-primary-100 transition-all cursor-pointer">
                            <Plus size={16} /> ID Proof
                            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleDocumentUpload(e, 'Identification')} />
                          </label>
                          <label className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-medium shadow-sm hover:bg-emerald-100 transition-all cursor-pointer">
                            <Plus size={16} /> Education
                            <input type="file" className="hidden" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => handleDocumentUpload(e, 'Education')} />
                          </label>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {formData.documents?.map((doc, idx) => (
                        <div key={idx} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-50 group hover:bg-white hover:shadow-2xl transition-all">
                          <div className="flex items-center gap-6 mb-6">
                            <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center text-slate-200 group-hover:text-primary-600 transition-colors shadow-inner shrink-0">
                              <FileText size={28} />
                            </div>
                            <div className="text-left max-w-full truncate">
                              <p className="text-sm font-medium text-slate-900 uppercase tracking-tight truncate" title={doc.name}>{doc.name}</p>
                              <p className="text-[9px] font-medium text-slate-300 mt-1">{doc.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-medium text-slate-300">{doc.date}</span>
                            <div className="flex gap-2">
                              {doc.url && doc.url.startsWith('http') && (
                                <a href={doc.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-white text-slate-300 hover:text-primary-600 rounded-xl flex items-center justify-center shadow-sm transition-all">
                                  <Download size={18} />
                                </a>
                              )}
                              {isEditing && (
                                <button onClick={() => removeDocument(doc.type)} className="w-10 h-10 bg-white text-slate-300 hover:text-rose-500 rounded-xl flex items-center justify-center shadow-sm transition-all">
                                  <Trash2 size={18} />
                                </button>
                              )}
                            </div>
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
    </div>
  );
};

export default CandidateProfile;
