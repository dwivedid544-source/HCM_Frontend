import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 User, Mail, Phone as PhoneIcon, Upload, FileText, Link as LinkIcon, MapPin, DollarSign, 
 Calendar, Globe, Plus, X, ArrowLeft, CheckCircle2, AlertCircle, Briefcase, 
 ChevronDown, Zap, ShieldCheck, Info, RotateCcw, Cloud, Trash2, ArrowRight, Clock
} from 'lucide-react';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import { cn } from '../../utils/cn';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCandidate } from '../../context/CandidateContext';
import { useCurrency } from '../../hooks/useCurrency';

const ApplicationForm = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

 const navigate = useNavigate();
 const location = useLocation();
 const { applyForJob, jobs, profile, showToast } = useCandidate();
 
 // Extract job from location state or fallback to default
 const jobInfo = location.state?.job || jobs.allJobs[0];

 const [isSubmitted, setIsSubmitted] = useState(false);
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [formData, setFormData] = useState({
 fullName: profile.fullName,
 email: profile.email,
 phone: profile.phone,
 location: profile.location,
 experience: '3-5 Years',
 expectedSalary: profile.expectedSalary,
 noticePeriod: profile.noticePeriod,
 coverLetter: '',
 linkedin: profile.linkedin,
 portfolio: profile.portfolio
 });
 const [resume, setResume] = useState({ name: 'Alex_Rivera_CV_2026.pdf', size: '2.4 MB' });
 const [skills, setSkills] = useState(profile.skills || []);
 const [skillInput, setSkillInput] = useState('');

 const handleAddSkill = (e) => {
 if (e.key === 'Enter' && skillInput.trim()) {
 e.preventDefault();
 if (!skills.includes(skillInput.trim())) setSkills([...skills, skillInput.trim()]);
 setSkillInput('');
 }
 };

 const removeSkill = (skill) => setSkills(skills.filter(s => s !== skill));

  const handleSubmit = (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  
  const submitApp = (base64Data = null) => {
    const payload = {
      ...formData,
      skills: skills,
      resumeUrl: resume ? resume.name : null,
      resumeBase64: base64Data
    };
    
    setTimeout(() => {
      applyForJob(jobInfo.id, payload);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  if (resume && resume instanceof File) {
    const reader = new FileReader();
    reader.readAsDataURL(resume);
    reader.onload = () => {
      submitApp(reader.result);
    };
  } else {
    submitApp(null);
  }
  };

 if (isSubmitted) {
 return (
 <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fade-in">
 <motion.div 
 initial={{ opacity: 0, scale: 0.9 }}
 animate={{ opacity: 1, scale: 1 }}
 className="max-w-xl w-full bg-white rounded-[4rem] p-16 text-center shadow-premium border border-slate-50"
 >
 <div className="w-24 h-24 bg-emerald-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 text-emerald-600 shadow-inner group grow">
 <CheckCircle2 size={48} className="animate-bounce" />
 </div>
 <h2 className="text-4xl font-medium text-slate-900 mb-4 tracking-tight uppercase leading-none dark:text-white">PAYLOAD DISPATCHED</h2>
 <p className="text-lg font-medium text-slate-400 mb-12 uppercase tracking-tight leading-relaxed px-8">
 Your career artifact for <span className="text-slate-900">{jobInfo.title}</span> has entered the recruitment buffer at <span className="text-primary-600">{jobInfo.company}</span>.
 </p>
 <div className="space-y-4 max-w-sm mx-auto">
 <button 
 onClick={() => navigate('/candidate/applications')}
 className="w-full h-16 bg-primary-600 text-white rounded-2xl font-medium font-bold text-[10px] shadow-2xl hover:bg-primary-700 transition-all active:scale-95 flex items-center justify-center gap-3"
 >
 <FileText size={18} /> View Registry
 </button>
 <button 
 onClick={() => navigate('/candidate/jobs')}
 className="w-full h-16 bg-white text-slate-600 border border-slate-200 rounded-2xl font-medium font-bold text-[10px] hover:text-slate-900 transition-all active:scale-95 flex items-center justify-center gap-3"
 >
 <RotateCcw size={18} /> Scan More Nodes
 </button>
 </div>
 </motion.div>
 </div>
 );
 }

 return (
 <div className="space-y-10 pb-12 animate-fade-in max-w-7xl mx-auto text-left">
 {/* Header Section */}
 <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-soft">
 <div className="flex items-center gap-6">
 <button 
 onClick={() => navigate(-1)}
 className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-all flex items-center justify-center shadow-sm"
 >
 <ArrowLeft size={24} />
 </button>
 <div>
 <h1 className="hcm-page-title uppercase leading-none mb-2">ENGAGEMENT PROTOCOL</h1>
 <p className="hcm-page-subtitle">Phased submission for <span className="text-slate-900 dark:text-white font-bold">{jobInfo.title}</span></p>
 </div>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
 
 {/* Main Configuration Engine */}
 <div className="lg:col-span-8">
 <form onSubmit={handleSubmit} className="card p-12 lg:p-14 space-y-14 rounded-[4rem]">
 
 {/* Identity Vectors */}
 <section className="space-y-10">
 <div className="flex items-center gap-4 mb-2 border-b border-slate-100 dark:border-slate-800 pb-6">
 <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 flex items-center justify-center">
 <User size={24} />
 </div>
 <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight uppercase">Identity Node</h3>
 </div>
 
 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
 <div className="space-y-3 group text-left">
 <label className="form-label px-1">Full Engagement Name</label>
 <div className="relative">
 <User className="absolute left-5 top-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
 <input type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} required className="input-field pl-14 h-12 font-medium" />
 </div>
 </div>
 <div className="space-y-3 group text-left">
 <label className="form-label px-1">Digital Interface (Email)</label>
 <div className="relative">
 <Mail className="absolute left-5 top-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
 <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required className="input-field pl-14 h-12 font-medium" />
 </div>
 </div>
 <div className="space-y-3 group text-left">
 <label className="form-label px-1">Voice Comms Line</label>
 <div className="relative">
 <PhoneInput value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required className="h-12 font-medium bg-slate-50 border-transparent text-slate-900" />
 </div>
 </div>
 <div className="space-y-3 group text-left">
 <label className="form-label px-1">Operational Hub (Loc)</label>
 <div className="relative">
 <MapPin className="absolute left-5 top-4 text-slate-300 group-focus-within:text-primary-500 transition-colors" size={18} />
 <input type="text" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="input-field pl-14 h-12 font-medium" />
 </div>
 </div>
 </div>
 </section>

 {/* Career Artifacts */}
 <section className="space-y-10">
  <div className="flex items-center gap-4 mb-2 border-b border-slate-100 dark:border-slate-800 pb-6">
  <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
  <Briefcase size={24} />
  </div>
  <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight uppercase">Strategic Artifacts</h3>
  </div>

  <div className="space-y-4 text-left">
  <label className="form-label px-1">Payload Submission (Resume)</label>
  <div 
  className={cn(
  "relative group cursor-pointer border-4 border-dashed rounded-[2.5rem] p-12 text-center transition-all duration-700",
  resume ? "border-emerald-100 dark:border-emerald-950/20 bg-emerald-50/20 dark:bg-emerald-950/10" : "border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-slate-50/50 dark:hover:bg-slate-950/10"
  )}
  onClick={(e) => {
    if (e.target.closest('button')) return;
    document.getElementById('resume-upload').click();
  }}
  >
  <input id="resume-upload" type="file" className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => setResume(e.target.files[0])} />
  {resume ? (
  <div className="flex items-center justify-between group-hover:px-4 transition-all">
  <div className="flex items-center gap-6">
  <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 shadow-xl group-hover:rotate-6 transition-transform">
  <FileText size={36} />
  </div>
  <div className="text-left">
  <p className="text-lg font-medium text-slate-900 dark:text-white font-bold">{resume.name}</p>
  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2 uppercase tracking-[0.3em]">{resume.size} • SYNC READY</p>
  </div>
  </div>
  <button type="button" onClick={(e) => { e.stopPropagation(); setResume(null); }} className="w-12 h-12 bg-white dark:bg-slate-800 text-rose-500 rounded-xl flex items-center justify-center shadow-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 group-hover:scale-110 transition-all border border-slate-100 dark:border-slate-700"><Trash2 size={24} /></button>
  </div>
  ) : (
  <div className="py-10">
  <div className="w-20 h-20 rounded-[1.75rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-600 mx-auto mb-8 group-hover:bg-primary-50 dark:group-hover:bg-primary-950/20 group-hover:text-primary-500 transition-all duration-700 shadow-inner group-hover:-rotate-6">
  <Upload size={36} />
  </div>
  <p className="text-2xl font-medium text-slate-900 dark:text-white font-bold mb-2">Transmit Registry Artifact</p>
  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-550 uppercase tracking-[0.4em]">PDF / DOCX (MAX 5MB)</p>
  </div>
  )}
  </div>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
  <div className="space-y-3 group text-left">
  <label className="form-label px-1">Skill Matrix Coverage</label>
  <div className="input-field min-h-[56px] p-3 flex flex-wrap gap-2 transition-all">
  {skills.map(skill => (
  <span key={skill} className="flex items-center gap-3 px-4 py-2 bg-primary-600 text-white rounded-xl text-[10px] font-medium group grow shadow-xl">
  {skill}
  <button type="button" onClick={() => removeSkill(skill)} className="text-white/30 hover:text-white transition-colors"><X size={14} strokeWidth={4} /></button>
  </span>
  ))}
  <input 
  type="text" 
  value={skillInput}
  onChange={(e) => setSkillInput(e.target.value)}
  onKeyDown={handleAddSkill}
  placeholder={skills.length === 0 ? "QUERY SKILLS..." : "ADD VECTOR..."}
  className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-slate-900 dark:text-white uppercase"
  />
  </div>
  </div>
  <div className="space-y-3 group text-left">
  <label className="form-label px-1">Comp. Expectation</label>
  <div className="relative">
  {React.createElement(getIcon(), { className: "absolute left-5 top-4 text-slate-300 group-focus-within:text-primary-500 transition-colors", size: 18 })}
  <input type="text" value={formData.expectedSalary} onChange={e => setFormData({...formData, expectedSalary: e.target.value})} placeholder={`e.g. ${getSymbol()}145,000`} className="input-field pl-14 h-12 font-medium" />
  </div>
  </div>
  </div>
  </section>

  {/* Strategic Comms */}
  <section className="space-y-10">
  <div className="flex items-center gap-4 mb-2 border-b border-slate-100 dark:border-slate-800 pb-6">
  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
  <Zap size={24} />
  </div>
  <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight uppercase">Strategic Comms</h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
  <div className="space-y-3 group text-left">
  <label className="form-label px-1">LinkedIn Node</label>
  <div className="relative">
  <Globe className="absolute left-5 top-4 text-slate-300" size={18} />
  <input type="url" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/..." className="input-field pl-14 h-12 font-medium" />
  </div>
  </div>
  <div className="space-y-3 group text-left">
  <label className="form-label px-1">Artifact Portfolio</label>
  <div className="relative">
  <LinkIcon className="absolute left-5 top-4 text-slate-300" size={18} />
  <input type="url" value={formData.portfolio} onChange={e => setFormData({...formData, portfolio: e.target.value})} placeholder="https://dossier.design" className="input-field pl-14 h-12 font-medium" />
  </div>
  </div>
  </div>

  <div className="space-y-3 text-left">
  <div className="flex items-center justify-between mb-2">
  <label className="form-label px-1">Operational Intent (Cover Letter)</label>
  <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">Phase Buffer: 2000 Units</span>
  </div>
  <textarea 
  rows={8} 
  value={formData.coverLetter}
  onChange={e => setFormData({...formData, coverLetter: e.target.value})}
  placeholder="Outline your strategic alignment with this role and the HCM ecosystem..." 
  className="input-field py-4 px-6 resize-none font-medium text-sm leading-relaxed"
  />
  </div>
  </section>
  <div className="pt-10 flex flex-col md:flex-row gap-6">
  <button 
  type="submit" 
  disabled={isSubmitting}
  className="flex-3 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 overflow-hidden relative group"
  >
  <AnimatePresence mode="wait">
  {isSubmitting ? (
  <motion.div initial={{ y: 20 }} animate={{ y: 0 }} key="submitting" className="flex items-center justify-center gap-4">
  <div className="w-5 h-5 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
  <span>TRANSMITTING...</span>
  </motion.div>
  ) : (
  <motion.div initial={{ y: 20 }} animate={{ y: 0 }} key="static" className="flex items-center justify-center gap-4">
  <span>DISPATCH PAYLOAD</span>
  <ArrowRight size={24} className="group-hover:translate-x-4 transition-transform" />
  </motion.div>
  )}
  </AnimatePresence>
  </button>
  <button 
  type="button" 
  onClick={() => { showToast('Payload buffered to persistence engine'); navigate(-1); }}
  className="btn-secondary flex-1 h-14 rounded-xl font-medium font-bold text-[10px]"
  >
  Buffer Draft
  </button>
  </div>
  </form>
  </div>

  {/* Tactical Support Column */}
  <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-10">
  <div className="card p-10 bg-primary-600 text-white border-none shadow-premium rounded-[3.5rem] relative overflow-hidden group">
  <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl group-hover:scale-110 transition-transform duration-1000">
  <ShieldCheck size={140} fill="#fff" />
  </div>
  <h3 className="text-[10px] font-medium uppercase tracking-[0.4em] text-primary-400 mb-10 leading-none">Target Snapshot</h3>
  <div className="space-y-10 relative z-10">
  <div className="space-y-3">
  <h4 className="text-3xl font-medium tracking-tight uppercase leading-none">{jobInfo.title}</h4>
  <p className="text-sm font-medium text-slate-400">{jobInfo.department} Operational Unit</p>
  </div>
  
  <div className="grid grid-cols-1 gap-6">
  {[
  { icon: MapPin, text: jobInfo.location, label: 'HUB' },
  { icon: getIcon(), text: jobInfo.salary, label: 'COMP' },
  { icon: Briefcase, text: jobInfo.type, label: 'ALLOC' },
  { icon: Clock, text: `Audit Ends: ${jobInfo.deadline || '12d ago'}`, label: 'TTL' },
  ].map((item, i) => (
  <div key={i} className="flex items-center gap-5 group/item">
  <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-primary-400 group-hover/item:bg-white group-hover/item:text-slate-900 transition-all">
  <item.icon size={18} />
  </div>
  <div>
  <p className="text-[8px] font-medium uppercase tracking-[0.4em] text-slate-500 mb-1 leading-none">{item.label}</p>
  <span className="text-sm font-medium">{item.text}</span>
  </div>
  </div>
  ))}
  </div>
  
  <div className="pt-10 border-t border-white/5">
  <div className="p-8 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl group grow">
  <p className="text-[9px] font-medium uppercase tracking-[0.4em] text-slate-400 dark:text-slate-500 mb-4 leading-none">Security Clearance</p>
  <div className="flex items-center gap-4">
  <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
  <ShieldCheck size={28} />
  </div>
  <span className="text-sm font-medium uppercase tracking-tight">Active Protocol</span>
  </div>
  </div>
  </div>
  </div>
  </div>

  <div className="card text-left">
  <h3 className="card-title mb-10 flex items-center gap-3">
  <Zap className="text-amber-500" size={14} /> Optimization Insights
  </h3>
  <div className="space-y-8">
  {[
  { title: 'Resume Yield', desc: 'Higher semantic overlap detected with 2026 templates.' },
  { title: 'Vector Coverage', desc: 'Deploying 5+ skill nodes elevates audit visibility by 48%.' },
  { title: 'Strategic Comms', desc: 'Personalized intent logs drive higher officer engagement.' }
  ].map((tip, i) => (
  <div key={i} className="space-y-2 group">
  <p className="text-[11px] font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary-600 transition-colors uppercase">{tip.title}</p>
  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-relaxed opacity-80">{tip.desc}</p>
  </div>
  ))}
  </div>
  <button className="w-full mt-12 py-3 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 text-[9px] font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 transition-all">Retrieve Full Guide</button>
  </div>
  </div>
  </div>
  </div>
);
};

export default ApplicationForm;
