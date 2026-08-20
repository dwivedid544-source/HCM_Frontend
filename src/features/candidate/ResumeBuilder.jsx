import React, { useState, useEffect } from 'react';
import { employeeAPI as api, uploadAPI } from '../../utils/apiService';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Briefcase, GraduationCap, Sparkles, Plus, Trash2, ChevronRight, ChevronLeft,
  Download, Eye, Save, Languages, Award, Settings2, FileText, CheckCircle2,
  Image as ImageIcon, Type, Palette, MapPin, Mail, Phone, Link as LinkIcon,
  PlusCircle, XCircle, Layout, MousePointer2, Zap, Trophy, Globe,
  Check, Info, RotateCcw, Loader2, CloudUpload
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCandidate } from '../../context/CandidateContext';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import CenterModal from '../../shared/components/layout/CenterModal';

const getResumeWithDefaults = (r) => {
  const safeResume = r || {};
  return {
    personal: {
      photo: '', firstName: '', lastName: '', title: '', email: '', phone: '', address: '', city: '', country: '', summary: '', linkedin: '', portfolio: '', avatar: '',
      ...(safeResume.personal || {})
    },
    experience: Array.isArray(safeResume.experience) ? safeResume.experience : [],
    education: Array.isArray(safeResume.education) ? safeResume.education : [],
    skills: Array.isArray(safeResume.skills) ? safeResume.skills : [],
    extras: {
      certs: [], languages: [], awards: [], interests: [],
      ...(safeResume.extras || {})
    },
    template: {
      color: '#0f172a', name: 'Modern Adaptive',
      ...(safeResume.template || {})
    }
  };
};

const ResumeBuilder = () => {
  const { resume, updateResumeStep, syncResumeToBackend, showToast } = useCandidate();
  const [activeStep, setActiveStep] = useState(0);
  const [localData, setLocalData] = useState(() => getResumeWithDefaults(resume));
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // ✨ AI Summary Preview Modal States
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [aiSummaryResult, setAiSummaryResult] = useState(null);
  const [isEditingSummary, setIsEditingSummary] = useState(false);
  const [editedSummaryText, setEditedSummaryText] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');

  // Sync internal state with context on load
  useEffect(() => {
    setLocalData(prev => getResumeWithDefaults(resume));
  }, [resume]);

  // Persist to context locally (autosave simulator)
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSaving(true);
      updateResumeStep(steps[activeStep].title.toLowerCase(), localData[steps[activeStep].title.toLowerCase()]);
      setTimeout(() => setIsSaving(false), 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, [localData, activeStep]);

  const steps = [
    { title: 'Personal', icon: User, helper: 'Basic contact information' },
    { title: 'Experience', icon: Briefcase, helper: 'Work history' },
    { title: 'Education', icon: GraduationCap, helper: 'Academic background' },
    { title: 'Skills', icon: Sparkles, helper: 'Technical & professional skills' },
    { title: 'Extras', icon: Award, helper: 'Certifications & achievements' },
    { title: 'Template', icon: Layout, helper: 'Visual layout design' },
  ];

  const handleNext = () => {
    updateResumeStep(steps[activeStep].title.toLowerCase(), localData[steps[activeStep].title.toLowerCase()]);
    setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => setActiveStep(prev => Math.max(prev - 1, 0));

  const handleResetStep = () => {
    const currentKey = steps[activeStep].title.toLowerCase();
    
    const defaults = {
      personal: { firstName: '', lastName: '', title: '', email: '', phone: '', city: '', linkedin: '', portfolio: '', summary: '', avatar: '' },
      experience: [],
      education: [],
      skills: [],
      extras: { certs: [], languages: [], awards: [], interests: [] },
      template: { color: '#0f172a', name: 'Modern Adaptive' }
    };
    
    setLocalData(prev => ({ ...prev, [currentKey]: defaults[currentKey] }));
    showToast(`${steps[activeStep].title} section reset to default`, 'info');
  };

  const handleSyncToBackend = async () => {
    setIsSaving(true);
    await syncResumeToBackend(localData);
    setIsSaving(false);
  };

  const handleAIGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await api.aiBuildResume(localData);
      if (response && response.data && response.data.success !== false) {
        const payload = response.data.data || response.data;
        const summaryText = payload.summary || payload.reply || '';
        const insightsObj = payload.insights || {
          strengths: ["Strong verified skill profile"],
          missingInformation: ["Measurable project metrics"],
          suggestions: ["Add bullet points detailing key responsibilities"]
        };

        setAiSummaryResult({
          summary: summaryText,
          insights: insightsObj
        });
        setEditedSummaryText(summaryText);
        setIsEditingSummary(false);
        setGeneratedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        setIsSummaryModalOpen(true);
        showToast('AI Summary & Insights Generated!', 'success');
      } else {
        throw new Error(response?.data?.error?.message || 'Failed to generate AI summary');
      }
    } catch (error) {
      console.error('AI Generation Failed', error);
      showToast(error.message || 'AI Generation Failed. Please try again.', 'error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySummary = async (customText) => {
    const textToApply = customText !== undefined ? customText : (isEditingSummary ? editedSummaryText : aiSummaryResult?.summary);
    if (!textToApply || !textToApply.trim()) {
      showToast('Summary text cannot be empty', 'error');
      return;
    }

    const updatedData = {
      ...localData,
      personal: {
        ...localData.personal,
        summary: textToApply.trim()
      }
    };

    setLocalData(updatedData);
    setIsSummaryModalOpen(false);
    showToast('Summary applied to your resume!', 'success');

    if (isAuthed) {
      await syncResumeToBackend(updatedData);
    }
  };

  const handleDownloadPDF = () => {
    showToast('Preparing document for PDF saving...', 'info');
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const updatePersonal = (field, value) => {
    setLocalData(prev => ({ ...prev, personal: { ...prev.personal, [field]: value } }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const res = await uploadAPI.uploadImage(file, 'hcm/avatars');
        const cloudUrl = res.data?.data?.url;
        if (cloudUrl) {
          updatePersonal('avatar', cloudUrl);
          showToast('Resume avatar uploaded to Cloudinary', 'success');
          return;
        }
      } catch (uploadErr) {
        console.warn('Resume avatar upload failed, using fallback:', uploadErr.message);
      }
      const reader = new FileReader();
      reader.onloadend = () => updatePersonal('avatar', reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = (e) => {
    e.preventDefault();
    e.stopPropagation();
    updatePersonal('avatar', '');
  };

  const updateTemplate = (field, value) => {
    setLocalData(prev => ({
      ...prev,
      template: { ...(prev.template || {}), [field]: value }
    }));
  };

  const addItem = (section) => {
    const freshItems = {
      experience: { id: Date.now(), company: '', role: '', type: 'Full-time', start: '', end: '', current: false, desc: '' },
      education: { id: Date.now(), school: '', degree: '', field: '', start: '', end: '', grade: '' },
      skills: { name: '', level: 50 }
    };
    setLocalData(prev => ({
      ...prev,
      [section]: [...prev[section], freshItems[section]]
    }));
  };

  const removeItem = (section, index) => {
    setLocalData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (section, index, field, value) => {
    setLocalData(prev => {
      const newList = [...prev[section]];
      if (field === 'current' && value === true) {
         newList[index] = { ...newList[index], current: true, end: '' };
      } else {
         newList[index] = { ...newList[index], [field]: value };
      }
      return { ...prev, [section]: newList };
    });
  };

  const renderPersonal = () => (
    <div className="space-y-10 animate-fade-in text-left">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-12">
        <div className="group relative">
          <label className="w-36 h-36 rounded-[2.5rem] bg-slate-50 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:bg-primary-50 hover:border-primary-300 transition-all cursor-pointer overflow-hidden shadow-inner relative">
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
            {localData.personal.avatar ? (
              <>
                <img src={localData.personal.avatar} alt="Avatar" className="w-full h-full object-cover" />
                <button 
                  onClick={removeAvatar} 
                  className="absolute top-2 right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 shadow-lg scale-0 group-hover:scale-100 transition-transform z-10"
                >
                  <XCircle size={16} />
                </button>
              </>
            ) : (
              <>
                <ImageIcon size={40} className="group-hover:scale-110 transition-transform duration-500" />
                <span className="text-[9px] font-medium mt-3 font-bold">Upload Identity</span>
              </>
            )}
          </label>
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight dark:text-white">Personal Information</h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed max-w-md">Provide your contact details and professional summary for potential employers.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[
          { label: 'First Name', key: 'firstName', icon: User },
          { label: 'Last Name', key: 'lastName', icon: User },
          { label: 'Job Title', key: 'title', icon: Briefcase },
          { label: 'Email', key: 'email', icon: Mail, type: 'email' },
          { label: 'Phone', key: 'phone', icon: Phone, type: 'phone' },
          { label: 'City / Location', key: 'city', icon: MapPin },
          { label: 'LinkedIn', key: 'linkedin', icon: Globe },
          { label: 'Portfolio URL', key: 'portfolio', icon: LinkIcon },
        ].map(field => (
          <div key={field.key} className="space-y-2 group">
            <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 group-focus-within:text-primary-600 transition-colors uppercase tracking-wider">{field.label}</label>
            {field.type === 'phone' ? (
              <PhoneInput
                name={field.key}
                value={localData.personal[field.key] || ''}
                onChange={(e) => updatePersonal(field.key, e.target.value)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-bold text-sm"
              />
            ) : (
              <div className="relative">
                <field.icon size={16} className="absolute left-4 top-4.5 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type={field.type || 'text'}
                  value={localData.personal[field.key] || ''}
                  onChange={(e) => updatePersonal(field.key, e.target.value)}
                  className="input-field h-14 pl-12 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-semibold text-sm"
                />
              </div>
            )}
          </div>
        ))}
        <div className="md:col-span-2 space-y-2 group">
          <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 ml-1 group-focus-within:text-primary-600 transition-colors uppercase tracking-wider">Professional Summary</label>
          <textarea
            rows={10}
            value={localData.personal.summary || ''}
            onChange={(e) => updatePersonal('summary', e.target.value)}
            className="input-field py-6 px-6 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-primary-500 resize-none font-semibold text-sm leading-relaxed"
            placeholder="Summarize your career goals and key strengths..."
          />
        </div>
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-12 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Work Experience</h3>
          <p className="text-sm font-medium text-slate-500">Add your previous employment history</p>
        </div>
        <button
          onClick={() => addItem('experience')}
          className="btn-primary px-8 py-3.5 shadow-lg shadow-primary-200 text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={18} /> <span>Add Experience</span>
        </button>
      </div>

      <div className="space-y-10">
        {localData.experience.map((exp, idx) => (
          <div key={idx} className="p-6 sm:p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft relative group hover:border-primary-100 transition-all">
            <button
              onClick={() => removeItem('experience', idx)}
              className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 text-rose-500 rounded-xl flex items-center justify-center shadow-xl border border-rose-50 dark:border-rose-900 hover:bg-rose-600 hover:text-white transition-all z-10 scale-90 hover:rotate-90"
            >
              <Trash2 size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">Job Title</label>
                <input
                  type="text"
                  value={exp.role}
                  onChange={(e) => updateArrayItem('experience', idx, 'role', e.target.value)}
                  className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-bold text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Company Name</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateArrayItem('experience', idx, 'company', e.target.value)}
                  className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-semibold text-sm"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:col-span-1">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Start Date</label>
                  <input type="month" value={exp.start} onChange={(e) => updateArrayItem('experience', idx, 'start', e.target.value)} className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-semibold text-sm px-4" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">End Date</label>
                  <input type="month" disabled={exp.current} value={exp.end} onChange={(e) => updateArrayItem('experience', idx, 'end', e.target.value)} className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-semibold text-sm px-4 disabled:opacity-50" />
                </div>
              </div>
              <div className="md:col-span-1 flex items-center gap-4 pt-4 sm:pt-8">
                <input type="checkbox" checked={exp.current} onChange={(e) => updateArrayItem('experience', idx, 'current', e.target.checked)} className="w-6 h-6 rounded-lg accent-primary-600 border-2 border-slate-300 dark:border-slate-700" />
                <label className="text-sm font-bold text-slate-600 dark:text-slate-400">I am currently working here</label>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description & Achievements</label>
                <textarea
                  rows={8}
                  value={exp.desc}
                  onChange={(e) => updateArrayItem('experience', idx, 'desc', e.target.value)}
                  className="input-field py-6 px-6 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 resize-none font-semibold text-sm leading-relaxed"
                  placeholder="Describe your role and key accomplishments..."
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEducation = () => (
    <div className="space-y-12 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Education</h3>
          <p className="text-sm font-medium text-slate-500">Academic background and qualifications</p>
        </div>
        <button
          onClick={() => addItem('education')}
          className="btn-primary px-8 py-3.5 shadow-lg shadow-primary-200 text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto"
        >
          <Plus size={18} /> <span>Add Education</span>
        </button>
      </div>

      <div className="space-y-10">
        {localData.education.map((edu, idx) => (
          <div key={idx} className="p-6 sm:p-10 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-soft relative group hover:border-primary-100 transition-all">
            <button onClick={() => removeItem('education', idx)} className="absolute -top-3 -right-3 w-10 h-10 bg-white dark:bg-slate-800 text-rose-500 rounded-xl flex items-center justify-center shadow-xl border border-rose-50 dark:border-rose-900 scale-90 hover:rotate-90 transition-all">
              <Trash2 size={20} />
            </button>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">School / University</label>
                <input type="text" value={edu.school} onChange={(e) => updateArrayItem('education', idx, 'school', e.target.value)} className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-bold text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Degree / Qualification</label>
                <input type="text" value={edu.degree} onChange={(e) => updateArrayItem('education', idx, 'degree', e.target.value)} className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-semibold text-sm" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Field of Study</label>
                <input type="text" value={edu.field} onChange={(e) => updateArrayItem('education', idx, 'field', e.target.value)} className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-semibold text-sm" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="col-span-1 space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Completion Year</label>
                  <input type="text" value={edu.end} onChange={(e) => updateArrayItem('education', idx, 'end', e.target.value)} className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-semibold text-sm" />
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Grade / GPA</label>
                  <input type="text" value={edu.grade} onChange={(e) => updateArrayItem('education', idx, 'grade', e.target.value)} className="input-field h-14 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-primary-500 font-semibold text-sm px-6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSkills = () => (
    <div className="space-y-12 animate-fade-in text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Skills</h3>
          <p className="text-sm font-medium text-slate-500">Highlight your technical and professional expertise</p>
        </div>
        <button onClick={() => addItem('skills')} className="btn-primary px-8 py-3.5 shadow-lg shadow-primary-200 text-sm font-bold flex items-center justify-center gap-2 w-full sm:w-auto">
          <Plus size={18} /> <span>Add Skill</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {localData.skills.map((skill, idx) => (
          <div key={idx} className="p-6 sm:p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-start sm:items-center gap-6 group hover:bg-white dark:hover:bg-slate-950 hover:shadow-xl transition-all relative">
            <div className="flex-1 space-y-5 w-full overflow-hidden">
              <div className="flex items-center justify-between px-1">
                <input
                  type="text"
                  value={skill.name}
                  onChange={(e) => updateArrayItem('skills', idx, 'name', e.target.value)}
                  placeholder="Type skill..."
                  className="bg-transparent border-none text-base font-bold text-slate-900 dark:text-white focus:ring-0 p-0 w-3/4"
                />
                <span className="text-xs font-bold text-primary-600 dark:text-primary-400 shrink-0">{skill.level}%</span>
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateArrayItem('skills', idx, 'level', Math.max(0, parseInt(skill.level) - 1))}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0 font-bold"
                >-</button>
                <div 
                  className="flex-1 relative h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percent = Math.round((x / rect.width) * 100);
                    updateArrayItem('skills', idx, 'level', Math.max(0, Math.min(100, percent)));
                  }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    className="h-full bg-primary-600 rounded-full"
                  />
                </div>
                <button 
                  onClick={() => updateArrayItem('skills', idx, 'level', Math.min(100, parseInt(skill.level) + 1))}
                  className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors shrink-0 font-bold"
                >+</button>
              </div>
            </div>
            <button onClick={() => removeItem('skills', idx)} className="text-slate-300 dark:text-slate-600 hover:text-rose-500 transition-colors shrink-0 mt-1 sm:mt-0 relative z-10 p-2">
              <XCircle size={24} />
            </button>
          </div>
        ))}
      </div>

      <div className="p-6 sm:p-10 bg-slate-50 dark:bg-slate-900 rounded-2xl text-left relative overflow-hidden border border-slate-100 dark:border-slate-800 group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-110 transition-transform duration-1000">
          <Zap size={150} />
        </div>
        <div className="relative z-10">
          <h4 className="text-xs font-bold text-slate-400 font-bold mb-4 leading-none">Recommended Skills</h4>
          <p className="text-lg font-bold text-slate-900 dark:text-white mb-8 leading-tight max-w-[350px]">Employers in your sector are looking for these skills.</p>
          <div className="flex flex-wrap gap-3">
            {['Rust Engineering', 'LLM Fine-tuning', 'Vector Databases', 'Strategic Forecasting', 'Cyber Audit'].map(s => (
              <button key={s} onClick={() => { setLocalData(prev => ({ ...prev, skills: [...prev.skills, { name: s, level: 75 }] })); showToast(`Skill ${s} drafted`); }} className="px-5 py-2.5 bg-white dark:bg-slate-800 hover:bg-primary-600 dark:hover:bg-primary-600 text-slate-600 dark:text-slate-300 hover:text-white rounded-full text-xs font-bold transition-all border border-slate-100 dark:border-slate-700">
                + {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderExtras = () => (
    <div className="space-y-12 animate-fade-in text-left">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Certs & Languages */}
        <div className="space-y-10">
          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h4 className="text-xs font-bold text-slate-400 font-bold">Certifications</h4>
              <button onClick={() => setLocalData(prev => ({ ...prev, extras: { ...prev.extras, certs: [...prev.extras.certs, 'New Certification'] } }))} className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors">+ ADD</button>
            </div>
            {localData.extras.certs.map((c, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-primary-600 font-bold shadow-sm group-hover:scale-110 transition-transform shrink-0">{i + 1}</div>
                <input
                  type="text"
                  value={c}
                  onChange={(e) => {
                    const newCerts = [...localData.extras.certs];
                    newCerts[i] = e.target.value;
                    setLocalData(prev => ({ ...prev, extras: { ...prev.extras, certs: newCerts } }));
                  }}
                  className="flex-1 bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-slate-200 focus:ring-0"
                />
                <button onClick={() => setLocalData(prev => ({ ...prev, extras: { ...prev.extras, certs: prev.extras.certs.filter((_, ci) => ci !== i) } }))} className="text-slate-300 hover:text-rose-500 shrink-0"><Trash2 size={16} /></button>
              </div>
            ))}
          </section>

          <section className="space-y-6">
            <div className="flex justify-between items-center px-2">
              <h4 className="text-xs font-bold text-slate-400 font-bold">Languages</h4>
              <button onClick={() => setLocalData(prev => ({ ...prev, extras: { ...prev.extras, languages: [...prev.extras.languages, 'New Language (Basic)'] } }))} className="text-xs font-bold text-primary-600 hover:text-primary-800 transition-colors">+ ADD</button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {localData.extras.languages.map((l, i) => (
                <div key={i} className="p-5 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-between gap-4">
                  <input
                    className="bg-transparent border-none p-0 text-sm font-bold text-slate-800 dark:text-slate-200 w-1/2 focus:ring-0"
                    value={l.split(' (')[0]}
                    onChange={(e) => {
                      const newLangs = [...localData.extras.languages];
                      newLangs[i] = `${e.target.value} (${l.split(' (')[1] || 'Native'})`;
                      setLocalData(prev => ({ ...prev, extras: { ...prev.extras, languages: newLangs } }));
                    }}
                  />
                  <div className="flex items-center gap-3">
                    <select
                      value={l.split(' (')[1]?.replace(')', '') || 'Native'}
                      onChange={(e) => {
                        const newLangs = [...localData.extras.languages];
                        newLangs[i] = `${l.split(' (')[0]} (${e.target.value})`;
                        setLocalData(prev => ({ ...prev, extras: { ...prev.extras, languages: newLangs } }));
                      }}
                      className="text-xs font-bold text-primary-600 bg-white dark:bg-slate-800 px-3 py-2 rounded-lg border-none shadow-sm cursor-pointer focus:ring-0"
                    >
                      <option>Native</option>
                      <option>Fluent</option>
                      <option>Intermediate</option>
                    </select>
                    <button 
                      onClick={() => setLocalData(prev => ({ 
                        ...prev, 
                        extras: { 
                          ...prev.extras, 
                          languages: prev.extras.languages.filter((_, li) => li !== i) 
                        } 
                      }))} 
                      className="text-slate-400 hover:text-rose-500 shrink-0 p-1 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Awards & Projects */}
        <div className="space-y-10">
          <section className="p-8 sm:p-10 bg-primary-600 rounded-[3rem] text-white overflow-hidden relative shadow-premium">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Trophy size={140} fill="#fff" />
            </div>
            <div className="relative z-10">
              <h4 className="text-xs font-bold text-primary-200 font-bold mb-6">Achievements & Awards</h4>
              <div className="space-y-6">
                {localData.extras.awards.map((a, i) => (
                  <div key={i} className="flex gap-4 group items-center">
                    <div className="w-1.5 h-6 bg-white/20 rounded-full shrink-0" />
                    <input
                      type="text"
                      value={a}
                      onChange={(e) => {
                        const newAwards = [...localData.extras.awards];
                        newAwards[i] = e.target.value;
                        setLocalData(prev => ({ ...prev, extras: { ...prev.extras, awards: newAwards } }));
                      }}
                      className="flex-1 min-w-0 bg-transparent border-none p-0 text-base sm:text-lg font-bold focus:ring-0 text-white"
                    />
                    <button 
                      onClick={() => setLocalData(prev => ({ ...prev, extras: { ...prev.extras, awards: prev.extras.awards.filter((_, ai) => ai !== i) } }))} 
                      className="text-white/75 hover:text-rose-300 shrink-0 transition-colors p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button onClick={() => setLocalData(prev => ({ ...prev, extras: { ...prev.extras, awards: [...prev.extras.awards, 'New Award Title'] } }))} className="text-xs font-bold text-primary-200 hover:text-white transition-all mt-4">+ Add Award</button>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <h4 className="text-xs font-bold text-slate-400 px-2 font-bold">Interests</h4>
            <div className="flex flex-wrap gap-3">
              {localData.extras.interests.map((int, i) => (
                <div key={i} className="px-5 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold flex items-center gap-3">
                  {int}
                  <button onClick={() => setLocalData(prev => ({ ...prev, extras: { ...prev.extras, interests: prev.extras.interests.filter((_, ii) => ii !== i) } }))} className="text-white/40 hover:text-white"><XCircle size={14} /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 max-w-xs mt-4">
              <input
                type="text"
                placeholder="Add interest (e.g. Hiking)"
                id="new-interest-input"
                className="input-field h-10 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = e.currentTarget.value.trim();
                    if (val) {
                      setLocalData(prev => ({ ...prev, extras: { ...prev.extras, interests: [...prev.extras.interests, val] } }));
                      e.currentTarget.value = '';
                    }
                  }
                }}
              />
              <button 
                onClick={() => {
                  const input = document.getElementById('new-interest-input');
                  if (input) {
                    const val = input.value.trim();
                    if (val) {
                      setLocalData(prev => ({ ...prev, extras: { ...prev.extras, interests: [...prev.extras.interests, val] } }));
                      input.value = '';
                    }
                  }
                }} 
                className="btn-primary h-10 px-4 text-xs font-bold shrink-0"
              >
                Add
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderTemplate = () => (
    <div className="space-y-12 animate-fade-in text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Customizer */}
        <div className="lg:col-span-1 space-y-10">
          <div className="space-y-6">
            <p className="text-xs font-bold text-slate-500 font-bold">Color Scheme</p>
            <div className="grid grid-cols-5 gap-4">
              {['#0f172a', '#4f46e5', '#10b981', '#f43f5e', '#8b5cf6', '#d946ef', '#f97316', '#22c55e', '#ec4899', '#14b8a6'].map(c => (
                <button 
                  key={c} 
                  onClick={() => updateTemplate('color', c)}
                  style={{ backgroundColor: c }} 
                  className={cn(
                    "w-12 h-12 rounded-xl border-4 shadow-md hover:scale-110 transition-transform active:rotate-12",
                    localData.template?.color === c ? "border-slate-300 dark:border-slate-600 scale-110" : "border-white dark:border-slate-900"
                  )} 
                />
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <p className="text-xs font-bold text-slate-500 font-bold">Resume Template</p>
            <div className="grid grid-cols-1 gap-3">
              {['Modern Adaptive', 'Strict Industrial', 'Strategic Clean', 'High-Impact Grid'].map((t) => (
                <button 
                  key={t} 
                  onClick={() => updateTemplate('name', t)}
                  className={cn(
                    "p-5 rounded-2xl border text-xs font-bold text-left transition-all", 
                    localData.template?.name === t ? "bg-slate-900 text-white border-transparent shadow-xl translate-x-2 sm:translate-x-4" : "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800"
                  )}>
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Template Preview Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-8">
          {['Modern Adaptive', 'Strict Industrial', 'Strategic Clean', 'High-Impact Grid'].map((t, idx) => {
            const isSelected = localData.template?.name === t;
            return (
              <div 
                key={idx} 
                onClick={() => updateTemplate('name', t)}
                className="group relative overflow-hidden rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft cursor-pointer"
              >
                <div className="aspect-[4/5] bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-8 overflow-hidden group-hover:scale-105 transition-transform duration-1000">
                  <div className="w-full h-full bg-white dark:bg-slate-900 shadow-2xl rounded-md transform translate-y-8 group-hover:translate-y-0 transition-transform duration-700">
                    <div className="p-6 space-y-4">
                      <div className="w-1/2 h-4 rounded-sm" style={{ backgroundColor: isSelected ? (localData.template?.color || '#4f46e5') : '#94a3b8' }} />
                      <div className="w-3/4 h-2 bg-slate-200 dark:bg-slate-800 rounded-sm" />
                      <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="h-20 bg-slate-50 dark:bg-slate-950 rounded-lg" />
                        <div className="h-20 bg-slate-50 dark:bg-slate-950 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent transition-opacity flex flex-col justify-end p-8 text-left",
                  isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}>
                  <p className="text-white font-bold text-xl">{t}</p>
                  <button className="mt-4 py-3 bg-white text-slate-900 rounded-xl text-xs font-bold w-32 shadow-lg">Select</button>
                </div>
                {isSelected && (
                  <div className="absolute top-6 left-6 p-2 bg-primary-600 text-white rounded-lg shadow-xl animate-bounce">
                    <Check size={16} strokeWidth={4} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // --- RENDERING TEMPLATES ---
  
  const renderModernAdaptive = () => (
    <div className="bg-white shadow-[0_30px_100px_rgba(0,0,0,0.1)] rounded-sm min-h-[1100px] flex flex-col mx-auto max-w-[800px] overflow-hidden text-slate-900 font-sans">
      <div className="p-16 text-white grid grid-cols-12 gap-8 relative overflow-hidden" style={{ backgroundColor: localData.template?.color || '#4f46e5' }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 -mr-32 -mt-32 rounded-full" />
        <div className="col-span-8 space-y-6 relative z-10">
          <div className="flex items-center gap-6">
            {localData.personal.avatar && (
              <img src={localData.personal.avatar} alt="Avatar" className="w-24 h-24 rounded-full object-cover border-4 border-white/20 shadow-lg" />
            )}
            <div>
              <h2 className="text-4xl font-bold leading-tight">{localData.personal.firstName} {localData.personal.lastName}</h2>
              <p className="text-xl font-bold opacity-90 leading-none mt-2">{localData.personal.title}</p>
            </div>
          </div>
          <p className="text-sm font-medium opacity-80 leading-relaxed max-w-lg">"{localData.personal.summary}"</p>
        </div>
        <div className="col-span-4 flex flex-col justify-end items-end space-y-3 relative z-10">
          {localData.personal.city && <div className="flex items-center gap-3 text-sm font-medium text-white/80">{localData.personal.city} <MapPin size={14} /></div>}
          {localData.personal.email && <div className="flex items-center gap-3 text-sm font-medium text-white">{localData.personal.email} <Mail size={14} /></div>}
          {localData.personal.phone && <div className="flex items-center gap-3 text-sm font-medium text-white/80">{localData.personal.phone} <Phone size={14} /></div>}
        </div>
      </div>

      <div className="p-10 sm:p-16 grid grid-cols-12 gap-10 sm:gap-16 flex-1">
        <div className="col-span-12 sm:col-span-8 space-y-12">
          <section className="space-y-8">
            <h3 className="text-sm font-bold text-slate-300 font-bold border-b-2 border-slate-100 pb-2">Employment History</h3>
            <div className="space-y-10">
              {localData.experience.map((e, i) => (
                <div key={i} className="relative pl-8">
                  <div className="absolute left-0 top-2 bottom-0 w-1 rounded-full opacity-20" style={{ backgroundColor: localData.template?.color || '#4f46e5' }} />
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-xl font-bold text-slate-900">{e.role}</h4>
                      <p className="text-xs font-bold mt-1 font-bold" style={{ color: localData.template?.color || '#4f46e5' }}>{e.company}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-md shrink-0">{e.start} — {e.current ? 'PRESENT' : e.end}</span>
                  </div>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed mt-3">{e.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 sm:col-span-4 space-y-12">
          <section className="space-y-6">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b-2 border-slate-100 pb-2">Technical Skills</h3>
            <div className="space-y-5">
              {localData.skills.map((s, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-900">
                    <span>{s.name}</span>
                    <span style={{ color: localData.template?.color || '#4f46e5' }}>{s.level}%</span>
                  </div>
                  <div className="h-1 bg-slate-100 w-full rounded-full">
                    <div className="h-full rounded-full" style={{ width: `${s.level}%`, backgroundColor: localData.template?.color || '#4f46e5' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
          
          {localData.education.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest border-b-2 border-slate-100 pb-2">Education</h3>
              <div className="space-y-5">
                {localData.education.map((edu, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">{edu.degree} - {edu.field}</h4>
                    <p className="text-xs font-bold text-slate-500">{edu.school} • {edu.end}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  const renderStrictIndustrial = () => (
    <div className="bg-white min-h-[1100px] mx-auto max-w-[800px] text-slate-900 font-serif p-12 shadow-[0_30px_100px_rgba(0,0,0,0.1)]">
      <div className="border-b-4 pb-8 mb-8" style={{ borderBottomColor: localData.template?.color || '#000' }}>
        <h1 className="text-5xl font-bold uppercase text-center tracking-tight mb-2">{localData.personal.firstName} {localData.personal.lastName}</h1>
        <h2 className="text-xl font-bold text-center text-slate-600 uppercase tracking-widest">{localData.personal.title}</h2>
        <div className="flex justify-center items-center gap-4 text-sm font-semibold mt-4 text-slate-500">
          {localData.personal.city && <span>{localData.personal.city}</span>}
          {localData.personal.phone && <span>• {localData.personal.phone}</span>}
          {localData.personal.email && <span>• {localData.personal.email}</span>}
          {localData.personal.linkedin && <span>• {localData.personal.linkedin}</span>}
        </div>
      </div>
      
      {localData.personal.summary && (
        <div className="mb-10 text-justify text-sm leading-relaxed font-medium">
          {localData.personal.summary}
        </div>
      )}

      <div className="space-y-10">
        <section>
          <h3 className="text-xl font-black uppercase mb-4 tracking-wider" style={{ color: localData.template?.color || '#000' }}>Professional Experience</h3>
          <div className="space-y-6">
            {localData.experience.map((e, i) => (
              <div key={i}>
                <div className="flex justify-between items-end border-b border-slate-200 pb-1 mb-2">
                  <h4 className="text-lg font-bold">{e.role} <span className="text-slate-400 font-normal">| {e.company}</span></h4>
                  <span className="text-sm font-bold text-slate-600">{e.start} - {e.current ? 'Present' : e.end}</span>
                </div>
                <p className="text-sm leading-relaxed font-medium">{e.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="text-xl font-black uppercase mb-4 tracking-wider" style={{ color: localData.template?.color || '#000' }}>Core Competencies</h3>
          <div className="flex flex-wrap gap-2">
            {localData.skills.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 text-slate-800 text-sm font-bold border border-slate-300">
                {s.name}
              </span>
            ))}
          </div>
        </section>

        {localData.education.length > 0 && (
          <section>
            <h3 className="text-xl font-black uppercase mb-4 tracking-wider" style={{ color: localData.template?.color || '#000' }}>Education & Credentials</h3>
            <div className="space-y-4">
              {localData.education.map((edu, i) => (
                <div key={i} className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-bold">{edu.degree} in {edu.field}</h4>
                    <p className="text-sm text-slate-600">{edu.school}</p>
                  </div>
                  <span className="text-sm font-bold">{edu.end}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );

  const renderStrategicClean = () => (
    <div className="bg-slate-50 shadow-[0_30px_100px_rgba(0,0,0,0.1)] min-h-[1100px] flex flex-col mx-auto max-w-[800px] p-16 text-slate-800 font-sans">
      <header className="mb-16">
        <h1 className="text-5xl font-light text-slate-900 tracking-tight mb-2" style={{ color: localData.template?.color || '#000' }}>{localData.personal.firstName} <span className="font-bold">{localData.personal.lastName}</span></h1>
        <p className="text-xl font-medium text-slate-500 mb-6">{localData.personal.title}</p>
        <div className="flex gap-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
          {localData.personal.email && <span>{localData.personal.email}</span>}
          {localData.personal.phone && <span>{localData.personal.phone}</span>}
          {localData.personal.city && <span>{localData.personal.city}</span>}
        </div>
      </header>

      <div className="grid grid-cols-12 gap-16">
        <div className="col-span-3 space-y-12">
          {localData.skills.length > 0 && (
            <section>
              <h3 className="text-xs font-bold text-slate-400 mb-6">Expertise</h3>
              <ul className="space-y-3">
                {localData.skills.map((s, i) => (
                  <li key={i} className="text-sm font-semibold">{s.name}</li>
                ))}
              </ul>
            </section>
          )}

          {localData.education.length > 0 && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Education</h3>
              <div className="space-y-5">
                {localData.education.map((edu, i) => (
                  <div key={i}>
                    <p className="text-sm font-bold">{edu.degree}</p>
                    <p className="text-xs text-slate-500 mt-1">{edu.school}</p>
                    <p className="text-xs text-slate-400 mt-1">{edu.end}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="col-span-9 space-y-12">
          {localData.personal.summary && (
            <section>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Profile</h3>
              <p className="text-sm font-medium leading-relaxed text-slate-600">{localData.personal.summary}</p>
            </section>
          )}

          <section>
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Experience</h3>
            <div className="space-y-10">
              {localData.experience.map((e, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-6 top-1.5 w-2 h-2 rounded-full" style={{ backgroundColor: localData.template?.color || '#000' }} />
                  <h4 className="text-lg font-bold text-slate-900">{e.role}</h4>
                  <p className="text-sm font-semibold" style={{ color: localData.template?.color || '#000' }}>{e.company} • <span className="text-slate-500">{e.start} - {e.current ? 'Present' : e.end}</span></p>
                  <p className="text-sm leading-relaxed text-slate-600 mt-4">{e.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );

  const renderHighImpactGrid = () => (
    <div className="bg-white min-h-[1100px] mx-auto max-w-[800px] text-slate-900 font-sans flex flex-col shadow-[0_30px_100px_rgba(0,0,0,0.1)] border-t-8" style={{ borderTopColor: localData.template?.color || '#000' }}>
      <header className="p-12 pb-8 border-b-2 border-slate-100 flex justify-between items-center bg-slate-50">
        <div>
          <h1 className="text-5xl font-black uppercase tracking-tighter" style={{ color: localData.template?.color || '#000' }}>{localData.personal.firstName} <br/> {localData.personal.lastName}</h1>
          <h2 className="text-xl font-bold text-slate-500 mt-2">{localData.personal.title}</h2>
        </div>
        <div className="text-right text-xs font-bold space-y-1 uppercase tracking-widest text-slate-600">
          <p>{localData.personal.email}</p>
          <p>{localData.personal.phone}</p>
          <p>{localData.personal.city}</p>
        </div>
      </header>
      
      <div className="grid grid-cols-2 flex-1">
        <div className="p-10 border-r-2 border-slate-100 space-y-10">
          <section>
            <h3 className="text-sm font-bold mb-6" style={{ color: localData.template?.color || '#000' }}>Career Overview</h3>
            <p className="text-sm font-semibold leading-relaxed text-slate-700">{localData.personal.summary}</p>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: localData.template?.color || '#000' }}>Experience</h3>
            <div className="space-y-8">
              {localData.experience.map((e, i) => (
                <div key={i}>
                  <div className="flex justify-between font-bold text-sm mb-1">
                    <span className="text-slate-900">{e.role}</span>
                    <span className="text-slate-400">{e.start}-{e.current?'Pres':e.end.split('-')[0]}</span>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: localData.template?.color || '#000' }}>{e.company}</div>
                  <p className="text-xs leading-relaxed font-semibold text-slate-600">{e.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-10 space-y-10 bg-white">
          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: localData.template?.color || '#000' }}>Technical Arsenal</h3>
            <div className="flex flex-wrap gap-2">
              {localData.skills.map((s, i) => (
                <div key={i} className="px-4 py-2 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-sm">
                  {s.name}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: localData.template?.color || '#000' }}>Academic Profile</h3>
            <div className="space-y-6">
              {localData.education.map((edu, i) => (
                <div key={i}>
                  <p className="text-sm font-bold">{edu.degree} — {edu.field}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{edu.school}</p>
                  <p className="text-xs font-bold mt-1" style={{ color: localData.template?.color || '#000' }}>Class of {edu.end}</p>
                </div>
              ))}
            </div>
          </section>

          {localData.extras.awards.length > 0 && (
            <section>
              <h3 className="text-sm font-black uppercase tracking-widest mb-6" style={{ color: localData.template?.color || '#000' }}>Key Achievements</h3>
              <ul className="space-y-3">
                {localData.extras.awards.map((a, i) => (
                  <li key={i} className="text-xs font-bold leading-relaxed flex items-start gap-2 text-slate-700">
                    <span style={{ color: localData.template?.color || '#000' }}>■</span> {a}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );

  const renderResumeDocument = () => {
    switch (localData.template?.name) {
      case 'Strict Industrial': return renderStrictIndustrial();
      case 'Strategic Clean': return renderStrategicClean();
      case 'High-Impact Grid': return renderHighImpactGrid();
      case 'Modern Adaptive':
      default: return renderModernAdaptive();
    }
  };

  return (
    <>
      <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto flex flex-col min-h-screen lg:min-h-0 print:hidden">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft">
          <div className="text-left">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Resume Builder</h1>
            <p className="text-slate-500 font-medium text-sm">Phased Configuration: <span className="text-slate-900 dark:text-white font-bold">{steps[activeStep].title}</span></p>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button 
              onClick={handleSyncToBackend}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100 dark:border-emerald-900/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-all h-12 sm:h-14 disabled:opacity-70"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CloudUpload size={16} />} 
              <span className="hidden sm:inline">{isSaving ? 'Syncing...' : 'Save & Sync'}</span>
            </button>
            <button onClick={() => setIsPreviewOpen(true)} className="w-12 h-12 sm:w-14 sm:h-14 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-primary-600 rounded-xl flex items-center justify-center transition-all shadow-sm">
              <Eye size={24} />
            </button>
            <button onClick={handleDownloadPDF} className="btn-primary h-12 sm:h-14 px-6 sm:px-8 shadow-xl shadow-primary-200 dark:shadow-none flex items-center justify-center gap-3 transition-all text-sm font-bold w-full sm:w-auto">
              <Download size={18} /> Download PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 flex-1">
          {/* Navigation */}
          <div className="lg:col-span-3 space-y-8">
            <div className="card p-4 border-none bg-white dark:bg-slate-900 shadow-soft rounded-[2.5rem]">
              <nav className="flex flex-col gap-3 relative">
                <div className="absolute left-6 top-10 bottom-10 w-0.5 bg-slate-100 dark:bg-slate-800" />
                {steps.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => { updateResumeStep(steps[activeStep].title.toLowerCase(), localData[steps[activeStep].title.toLowerCase()]); setActiveStep(i); }}
                    className={cn(
                      "w-full flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-[1.75rem] transition-all relative z-10",
                      activeStep === i 
                        ? "bg-slate-900 dark:bg-primary-600 text-white shadow-premium scale-100 sm:scale-105" 
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className={cn("p-2 rounded-xl transition-all duration-700 shrink-0", activeStep === i ? "bg-white/20 rotate-12 scale-110" : "bg-slate-100 dark:bg-slate-800")}>
                      <s.icon size={20} className={cn(activeStep === i ? "text-white" : "text-slate-400")} />
                    </div>
                    <span className="text-xs font-bold text-left">{s.title}</span>
                    {i < activeStep && <CheckCircle2 size={14} className={cn("ml-auto", activeStep === i ? "text-white/70" : "text-emerald-500")} />}
                  </button>
                ))}
              </nav>
            </div>

            <div className="card p-8 sm:p-10 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 rounded-[3rem] text-white overflow-hidden relative shadow-premium border-none text-left">
              <div className="absolute top-0 right-0 p-8 opacity-20 animate-pulse">
                <Sparkles size={120} />
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1 rounded-full border border-white/20">
                  <span className={cn("w-2 h-2 rounded-full", isGenerating ? "bg-amber-400 animate-ping" : aiSummaryResult ? "bg-emerald-400" : "bg-indigo-300")} />
                  <span className="text-[10px] font-bold text-indigo-100 uppercase tracking-wider">
                    {isGenerating ? "Analyzing..." : aiSummaryResult ? "Generated" : "Ready"}
                  </span>
                </div>
                <Sparkles size={18} className="text-indigo-200" />
              </div>

              <p className="text-xs font-bold text-indigo-200 font-bold mb-2">AI Generative Mode</p>
              <h4 className="text-xl font-bold mb-6 leading-tight">Elevate your summary with AI insights.</h4>
              
              <button 
                onClick={handleAIGenerate}
                disabled={isGenerating}
                className="w-full h-14 flex items-center justify-center gap-2 bg-white text-indigo-600 rounded-xl text-xs font-bold shadow-2xl hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-80"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    <span>Analyzing your experience...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    <span>Auto-Generate Summary</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Content Viewport */}
          <div className="lg:col-span-9 flex flex-col h-full">
            <div className="card h-full p-6 sm:p-8 md:p-12 flex flex-col relative rounded-[2.5rem] sm:rounded-[3.5rem] min-h-[600px] sm:min-h-[750px]">
              <div className="flex-1">
                <div className="mb-8 sm:mb-12 text-left">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-2">{steps[activeStep].title} Details</h2>
                  <p className="text-slate-500 font-medium text-sm">{steps[activeStep].helper}</p>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {activeStep === 0 && renderPersonal()}
                    {activeStep === 1 && renderExperience()}
                    {activeStep === 2 && renderEducation()}
                    {activeStep === 3 && renderSkills()}
                    {activeStep === 4 && renderExtras()}
                    {activeStep === 5 && renderTemplate()}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Viewport Actions */}
              <div className="pt-8 sm:pt-10 border-t border-slate-100 dark:border-slate-800 mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                <button
                  onClick={handleBack}
                  disabled={activeStep === 0}
                  className="w-full sm:w-auto flex justify-center items-center gap-3 px-8 py-4 text-slate-500 hover:text-slate-900 dark:hover:text-white text-sm font-bold disabled:opacity-0 transition-all"
                >
                  <ChevronLeft size={20} /> Previous Step
                </button>
                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
                  <button 
                    onClick={handleResetStep}
                    className="flex items-center justify-center gap-3 px-6 py-4 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all w-full sm:w-auto"
                  >
                    <RotateCcw size={16} /> Reset Step
                  </button>
                  <button
                    onClick={() => activeStep === steps.length - 1 ? setIsPreviewOpen(true) : handleNext()}
                    className="btn-primary px-10 py-4 shadow-xl shadow-primary-200 dark:shadow-none flex items-center justify-center gap-3 group text-sm font-bold w-full sm:w-auto"
                  >
                    <span>{activeStep === steps.length - 1 ? 'Preview Resume' : 'Continue to Next Step'}</span>
                    <ChevronRight size={18} className="group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Artifact Preview Modal */}
      <CenterModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Resume Preview" maxWidth="max-w-5xl">
        <div className="p-4 sm:p-12 text-left bg-slate-100 dark:bg-slate-800">
          
          {renderResumeDocument()}

          <div className="mt-8 flex justify-center items-center gap-4 print:hidden">
            <button onClick={() => setIsPreviewOpen(false)} className="px-8 py-4 bg-white text-slate-600 rounded-xl font-bold shadow-sm hover:text-slate-900 transition-colors">Close Preview</button>
            <button onClick={handleDownloadPDF} className="btn-primary px-8 py-4 shadow-xl text-sm font-bold flex items-center gap-3">
              <Download size={18} /> Download Resume
            </button>
          </div>
        </div>
      </CenterModal>

      {/* ✨ AI Generated Summary & Insights Preview Modal */}
      <CenterModal 
        isOpen={isSummaryModalOpen} 
        onClose={() => setIsSummaryModalOpen(false)} 
        title="✨ AI Generated Professional Summary" 
        maxWidth="max-w-2xl"
      >
        <div className="p-6 space-y-6 text-left bg-white dark:bg-slate-900">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold rounded-lg border border-indigo-100 dark:border-indigo-900">
                ✨ ATS Optimized
              </span>
              <span className="text-slate-400 font-semibold">Generated at {generatedAt}</span>
            </div>
            
            <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
              <span>{editedSummaryText.split(/\s+/).filter(Boolean).length} Words</span>
              <span>•</span>
              <span>{editedSummaryText.length} Characters</span>
            </div>
          </div>

          {/* Main Summary Section (Read or Edit) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Professional Summary</label>
              {!isEditingSummary && (
                <button 
                  onClick={() => setIsEditingSummary(true)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  <Type size={13} />
                  <span>Edit Text</span>
                </button>
              )}
            </div>

            {isEditingSummary ? (
              <div className="space-y-3">
                <textarea
                  rows={6}
                  value={editedSummaryText}
                  onChange={(e) => setEditedSummaryText(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-2xl text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  placeholder="Edit summary..."
                />
                <div className="flex justify-end gap-2 text-xs">
                  <button 
                    onClick={() => {
                      setEditedSummaryText(aiSummaryResult?.summary || '');
                      setIsEditingSummary(false);
                    }}
                    className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={() => setIsEditingSummary(false)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700"
                  >
                    Done Editing
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-indigo-50/50 dark:bg-slate-800/60 border border-indigo-100 dark:border-indigo-900/60 rounded-2xl text-xs font-medium leading-relaxed text-slate-800 dark:text-slate-200">
                {editedSummaryText}
              </div>
            )}
          </div>

          {/* AI Insights Section */}
          {aiSummaryResult?.insights && (
            <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400">ATS Insights & Recommendations</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Strengths */}
                <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={14} />
                    <span>Strengths</span>
                  </div>
                  <ul className="text-[10.5px] font-medium text-emerald-900 dark:text-emerald-200 space-y-1 list-disc pl-3">
                    {(aiSummaryResult.insights.strengths || []).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>

                {/* Missing Info */}
                <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-400">
                    <Info size={14} />
                    <span>Missing Info</span>
                  </div>
                  <ul className="text-[10.5px] font-medium text-amber-900 dark:text-amber-200 space-y-1 list-disc pl-3">
                    {(aiSummaryResult.insights.missingInformation || []).map((m, idx) => (
                      <li key={idx}>{m}</li>
                    ))}
                  </ul>
                </div>

                {/* Suggestions */}
                <div className="p-3.5 bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-400">
                    <Sparkles size={14} />
                    <span>Suggestions</span>
                  </div>
                  <ul className="text-[10.5px] font-medium text-indigo-900 dark:text-indigo-200 space-y-1 list-disc pl-3">
                    {(aiSummaryResult.insights.suggestions || []).map((s, idx) => (
                      <li key={idx}>{s}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={handleAIGenerate}
              disabled={isGenerating}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors flex items-center gap-2"
            >
              <RotateCcw size={14} className={isGenerating ? 'animate-spin' : ''} />
              <span>Regenerate</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSummaryModalOpen(false)}
                className="px-5 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl text-xs transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={() => handleApplySummary()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl text-xs shadow-lg transition-colors flex items-center gap-2"
              >
                <Check size={15} />
                <span>Use This Summary</span>
              </button>
            </div>
          </div>
        </div>
      </CenterModal>

      {/* Persistent Hidden Printable Document */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #resume-persistent-print-container, #resume-persistent-print-container * { visibility: visible; }
          #resume-persistent-print-container { display: block !important; position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; background: white; }
          .modal-overlay { display: none !important; }
        }
      `}</style>
      <div id="resume-persistent-print-container" className="hidden z-[99999]">
        {renderResumeDocument()}
      </div>
    </>
  );
};

export default ResumeBuilder;
