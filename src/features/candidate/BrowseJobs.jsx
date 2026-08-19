import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
 Search, MapPin, Briefcase, DollarSign, Clock, Filter, RotateCcw, Bookmark, 
 ChevronRight, X, Users, GraduationCap, Calendar, Layers, ArrowRight, CheckCircle2,
 BookmarkCheck, Info, Send, FileText, Globe, Zap, ChevronDown
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCandidate } from '../../context/CandidateContext';
import CenterModal from '../../shared/components/layout/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import { useCurrency } from '../../hooks/useCurrency';
import PhoneInput from '../../shared/components/ui/PhoneInput';

const BrowseJobs = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const { jobs = { savedIndices: [], allJobs: [] }, saveJob, applyForJob, showToast, profile } = useCandidate();
  const savedIndices = jobs?.savedIndices || [];
  const navigate = useNavigate();

  const [applicationPhone, setApplicationPhone] = useState(profile?.phone || '');

  const getHiringManager = (dept) => {
    const normalizedDept = (dept || '').toLowerCase();
    if (normalizedDept.includes('design') || normalizedDept.includes('product')) {
      return {
        name: 'Alice Cooper',
        role: 'Head of Product & Design',
        avatar: ''
      };
    } else if (normalizedDept.includes('engineering') || normalizedDept.includes('eng')) {
      return {
        name: 'John Wick',
        role: 'Engineering Director',
        avatar: ''
      };
    } else {
      return {
        name: 'Sarah Connor',
        role: 'HR Strategy Lead',
        avatar: ''
      };
    }
  };

  const fileInputRef = React.useRef(null);
  const [resumeOptions, setResumeOptions] = useState([]);
  const [selectedResume, setSelectedResume] = useState('');
  const [prevResume, setPrevResume] = useState('');

  React.useEffect(() => {
    if (profile && profile.resumeUrl) {
      const fileName = profile.resumeUrl.split('/').pop() || 'My Resume';
      setResumeOptions([fileName]);
      setSelectedResume(fileName);
      setPrevResume(fileName);
    } else {
      setResumeOptions([]);
      setSelectedResume('');
      setPrevResume('');
    }
  }, [profile]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileName = file.name;
      if (!resumeOptions.includes(fileName)) {
        setResumeOptions(prev => [...prev, fileName]);
      }
      setSelectedResume(fileName);
      setPrevResume(fileName);
      showToast(`Selected file: ${fileName}`, 'success');
    } else {
      setSelectedResume(prevResume);
    }
  };
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    type: '',
    experience: '',
    salary: ''
  });
  
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [cameFromDetails, setCameFromDetails] = useState(false);
  const [sortBy, setSortBy] = useState('Newest');
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const handleApplyClick = (job, fromDetails) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
    setCameFromDetails(fromDetails);
  };

  const filteredJobs = useMemo(() => {
    if (!jobs || !jobs.allJobs) return [];
    return jobs.allJobs.filter(job => {
      if (showSavedOnly && !savedIndices.includes(job.id)) return false;
      const title = job.title || '';
      const company = job.company || '';
      const location = job.location || '';
      const type = job.type || '';
      
      const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            company.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Fixed department filtering to normalize "Engineering" and "Eng"
      const matchesDept = !filters.department || (() => {
        const jobDept = (job.department || '').toLowerCase();
        const filterDept = filters.department.toLowerCase();
        if (filterDept === 'engineering' && jobDept.includes('eng')) return true;
        return jobDept === filterDept;
      })();
      
      const matchesLocation = !filters.location || location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesType = !filters.type || type.toLowerCase() === filters.type.toLowerCase();
      
      return matchesSearch && matchesDept && matchesLocation && matchesType;
    }).sort((a, b) => {
      if (sortBy === 'Salary (High)') {
        const salA = a.salary || '';
        const salB = b.salary || '';
        return (parseInt(salB.replace(/\D/g, '')) || 0) - (parseInt(salA.replace(/\D/g, '')) || 0);
      }
      if (sortBy === 'Newest') {
        const getHours = (postedStr) => {
          const str = (postedStr || '').toLowerCase();
          if (str.includes('hour') || str.includes('h ago')) {
            return parseInt(str) || 1;
          }
          if (str.includes('today')) return 0;
          if (str.includes('yesterday')) return 24;
          if (str.includes('d ago')) {
            return (parseInt(str) || 2) * 24;
          }
          return 9999;
        };
        return getHours(a.posted) - getHours(b.posted);
      }
      return 0; // Default Relevance
    });
  }, [jobs.allJobs, searchTerm, filters, sortBy, showSavedOnly, savedIndices]);

  const handleApplySubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const file = fileInputRef.current?.files[0];

    if (!file && !selectedResume) {
      showToast('Please select or upload a resume.', 'error');
      return;
    }

    const submitApp = (base64Data = null) => {
      applyForJob(selectedJob.id, {
        fullName: formData.get('fullName') || profile?.fullName || '',
        email: formData.get('email') || profile?.email || '',
        phone: formData.get('phone') || profile?.phone || '',
        location: formData.get('location') || profile?.location || '',
        linkedin: formData.get('linkedin') || profile?.linkedin || '',
        portfolio: formData.get('portfolio') || profile?.portfolio || '',
        skills: Array.isArray(profile?.skills) ? profile.skills.join(', ') : (profile?.skills || ''),
        expectedSalary: formData.get('expectedSalary'),
        availability: formData.get('availability'),
        coverLetter: formData.get('coverLetter'),
        resumeUrl: file ? file.name : selectedResume,
        resumeBase64: base64Data
      });
      setIsApplyModalOpen(false);
      setSelectedJob(null);
      showToast(`Application for ${selectedJob.title} sent!`);
    };

    if (file) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        submitApp(reader.result);
      };
    } else {
      submitApp(null);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto text-left px-1 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="hcm-page-title">BROWSE JOBS</h1>
          <p className="hcm-page-subtitle">Discover your next career move</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            onClick={() => navigate('/candidate/applications')}
            className="btn-primary w-full sm:w-auto px-6 py-2.5 flex items-center justify-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none text-sm font-bold"
          >
            <Clock size={18} />
            <span>My Applications</span>
          </button>
        </div>
      </div>

      {/* Job Search Filters */}
      <div className="card p-4 sm:p-6 md:p-8 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl">
              <Filter size={20} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-none">Search Filters</h3>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto justify-start sm:justify-end">
            <button 
              onClick={() => setShowSavedOnly(!showSavedOnly)}
              className={cn(
                "text-xs font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-2 shadow-sm",
                showSavedOnly 
                  ? "bg-primary-50 border-primary-200 text-primary-600 dark:bg-primary-950/20 dark:border-primary-900" 
                  : "bg-white border-slate-200 text-slate-500 dark:bg-slate-900 dark:border-slate-800 hover:border-primary-400 hover:text-primary-650"
              )}
            >
              <Bookmark size={14} className={cn(showSavedOnly && "fill-primary-600 text-primary-600")} />
              <span>{showSavedOnly ? "Showing Saved" : "Show Saved"}</span>
            </button>
            
            <button 
              onClick={() => { setSearchTerm(''); setFilters({ department: '', location: '', type: '', experience: '', salary: '' }); setShowSavedOnly(false); }}
              className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 flex items-center gap-2 transition-all px-2 py-1.5"
            >
              <RotateCcw size={14} />
              <span>Clear Filters</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <input 
              type="text" 
              placeholder="Search jobs by title or keyword..." 
              className="input-field pl-12 pr-4 h-14 bg-slate-50 dark:bg-slate-950 border-transparent font-semibold text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <select 
              className="input-field pl-12 pr-10 h-14 bg-slate-50 dark:bg-slate-950 border-transparent font-semibold text-sm appearance-none cursor-pointer w-full"
              value={filters.department}
              onChange={(e) => setFilters({...filters, department: e.target.value})}
            >
              <option value="">All Departments</option>
              <option value="Design">Design</option>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <select 
              className="input-field pl-12 pr-10 h-14 bg-slate-50 dark:bg-slate-950 border-transparent font-semibold text-sm appearance-none cursor-pointer w-full"
              value={filters.location}
              onChange={(e) => setFilters({...filters, location: e.target.value})}
            >
              <option value="">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="New York">New York</option>
              <option value="San Francisco">San Francisco</option>
              <option value="London">London</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
          <div className="relative">
            <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            <select 
              className="input-field pl-12 pr-10 h-14 bg-slate-50 dark:bg-slate-950 border-transparent font-semibold text-sm appearance-none cursor-pointer w-full"
              value={filters.type}
              onChange={(e) => setFilters({...filters, type: e.target.value})}
            >
              <option value="">Job Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Contract">Contract</option>
              <option value="Hybrid">Hybrid</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/60">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Jobs: <span className="text-slate-900 dark:text-white font-bold">{filteredJobs.length} Positions Found</span>
            </span>
            <div className="hidden sm:block h-4 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sort by:</span>
              <div className="relative flex items-center">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 bg-transparent border-none outline-none cursor-pointer pr-4 appearance-none py-1"
                >
                  <option value="Newest" className="dark:bg-slate-900">Newest</option>
                  <option value="Salary (High)" className="dark:bg-slate-900">Salary (High)</option>
                  <option value="Relevance" className="dark:bg-slate-900">Relevance</option>
                </select>
                <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-primary-600 dark:text-primary-400 pointer-events-none ml-1" size={12} />
              </div>
            </div>
          </div>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 font-bold sm:tracking-[0.3em]">Updated 2 minutes ago</p>
        </div>
      </div>

      {/* Job Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -8 }}
                className="group card p-5 sm:p-6 md:p-8 hover:shadow-premium transition-all duration-500 overflow-hidden relative flex flex-col h-full justify-between"
              >
                {/* Decorative BG element */}
                <div className="absolute top-0 right-0 p-6 transition-opacity pointer-events-none">
                  <div className="w-24 h-24 bg-primary-50/50 dark:bg-primary-950/10 rounded-full -mr-12 -mt-12 flex items-center justify-center">
                    <ChevronRight className="text-primary-600/30 dark:text-primary-400/20 ml-[-40px] mt-[40px]" size={32} />
                  </div>
                </div>

                {/* Content Container (takes remaining height to push buttons to the bottom) */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6 relative z-10 gap-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-14 h-14 shrink-0 rounded-2xl bg-primary-600 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:rotate-6 transition-transform">
                        {job.company ? job.company[0] : 'J'}
                      </div>
                      <div>
                        <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-primary-600 transition-colors uppercase">
                          {job.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{job.company}</p>
                          <span className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
                          <p className="text-xs font-semibold text-primary-500">{job.posted}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        saveJob(job.id); 
                        showToast(savedIndices.includes(job.id) ? 'Position Unsaved' : 'Position Saved to Radar', 'info'); 
                      }}
                      className={cn(
                        "p-2.5 rounded-xl transition-all shadow-sm active:scale-90 border shrink-0",
                        savedIndices.includes(job.id) 
                          ? "bg-primary-600 border-primary-600 text-white" 
                          : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                      )}
                    >
                      {savedIndices.includes(job.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                    </button>
                  </div>

                  {/* Tags Section (Flexbox based for perfect responsiveness and alignment) */}
                  <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                    {[
                      { icon: MapPin, text: job.location },
                      { icon: getIcon(), text: job.salary },
                      { icon: Clock, text: job.type },
                      { icon: Users, text: job.department },
                      job.experience ? { icon: GraduationCap, text: job.experience } : null,
                    ].filter(Boolean).map((info, i) => (
                      <div 
                        key={i} 
                        className="flex items-center gap-1.5 text-slate-650 dark:text-slate-300 bg-slate-50 dark:bg-slate-950/40 px-2.5 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800/80 transition-colors text-xs font-bold"
                      >
                        <info.icon size={13} className="text-slate-400 dark:text-slate-500 shrink-0" />
                        <span>{info.text}</span>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6 leading-relaxed line-clamp-3">
                    "{job.desc}"
                  </p>
                </div>

                {/* Actions Section */}
                <div className="flex items-center gap-3 mt-auto relative z-10 pt-4 border-t border-slate-100 dark:border-slate-800/60">
                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="btn-secondary flex-1 py-2.5 text-xs font-bold"
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => { handleApplyClick(job, false); }}
                    className="btn-primary flex-1 py-2.5 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    Apply Now <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full py-40 flex flex-col items-center justify-center card border-dashed border-2 bg-slate-50/50 dark:bg-slate-950/20 text-slate-400 dark:text-slate-600">
              <Search size={64} className="mb-6 opacity-40 animate-pulse" />
              <p className="text-xl font-bold text-slate-900 dark:text-white">No Jobs Found</p>
              <p className="text-sm font-medium mt-2">Adjust your filters to find suitable positions</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Job Record Detail Modal */}
      <CenterModal 
        isOpen={!!selectedJob} 
        onClose={() => setSelectedJob(null)} 
        title="Job Details"
        maxWidth="max-w-4xl"
      >
        {selectedJob && (
          <div className="p-5 sm:p-8 md:p-10 space-y-8 md:space-y-12 text-left bg-white dark:bg-slate-900">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 border-b border-slate-150 dark:border-slate-800 pb-8 md:pb-10 text-center sm:text-left">
              <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 shrink-0 rounded-2xl sm:rounded-[1.5rem] md:rounded-[2rem] bg-primary-600 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl md:text-4xl shadow-lg">
                {selectedJob.company ? selectedJob.company[0] : 'J'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {selectedJob.title}
                </h2>
                <p className="text-base sm:text-lg font-bold text-primary-600 dark:text-primary-400 mt-2 sm:mt-4 flex items-center justify-center sm:justify-start gap-2">
                  {selectedJob.company} <Globe size={18} />
                </p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <div className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-lg text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1.5">
                    <MapPin size={14} />{selectedJob.location}
                  </div>
                  <div className="px-3 py-1.5 bg-primary-50 dark:bg-primary-950/20 rounded-lg text-xs sm:text-sm font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-1.5">
                    {React.createElement(getIcon(), { size: 14 })}{selectedJob.salary}
                  </div>
                  <div className="px-3 py-1.5 bg-primary-600 rounded-lg text-xs sm:text-sm font-semibold text-white flex items-center gap-1.5">
                    <Clock size={14} />{selectedJob.type}
                  </div>
                  {selectedJob.experience && (
                    <div className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                      <GraduationCap size={14} />Experience: {selectedJob.experience}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              <div className="lg:col-span-8 space-y-8 md:space-y-12">
                <section>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                    <Info size={18} className="text-primary-600 shrink-0" /> Job Description
                  </h3>
                  <p className="text-base font-semibold text-slate-650 dark:text-slate-300 leading-relaxed">
                    {selectedJob.desc}
                  </p>
                </section>

                {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Requirements</h3>
                    <div className="grid grid-cols-1 gap-3">
                      {selectedJob.requirements.map((req, i) => (
                        <div 
                          key={i} 
                          className="p-4 rounded-xl bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-800/80 flex items-center gap-4 group hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm transition-all"
                        >
                          <div className="w-8 h-8 rounded-lg bg-white dark:bg-slate-900 flex items-center justify-center text-primary-600 shadow-sm font-bold shrink-0">
                            {i + 1}
                          </div>
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-snug">
                            {req}
                          </p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
             
              <div className="lg:col-span-4 space-y-6">
                <div className="p-6 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group">
                  <div className="absolute -right-5 -top-5 opacity-[0.03] rotate-12 group-hover:scale-125 transition-transform duration-1000">
                    <Zap size={150} className="text-slate-900 dark:text-white" />
                  </div>
                  {selectedJob.benefits && selectedJob.benefits.length > 0 && (
                    <>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 leading-none">Benefits & Perks</h3>
                      <div className="space-y-3.5 relative z-10 mb-6">
                        {selectedJob.benefits.map((ben, i) => (
                          <div key={i} className="flex items-center gap-2.5 text-slate-655 dark:text-slate-300 font-semibold text-sm">
                            <CheckCircle2 size={14} className="text-primary-600 shrink-0" />
                            <span>{ben}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <button 
                    onClick={() => { handleApplyClick(selectedJob, true); }}
                    className="btn-primary w-full py-3 shadow-xl shadow-primary-200 dark:shadow-none relative z-10"
                  >
                    Apply Now
                  </button>
                </div>
                
                {(() => {
                  const manager = getHiringManager(selectedJob.department);
                  return (
                    <div className="p-6 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-bold mb-4">Hiring Manager</p>
                      <div className="flex items-center gap-4">
                        <Avatar 
                          src={manager.avatar} 
                          className="w-12 h-12 rounded-xl border-2 border-white dark:border-slate-800 shadow-md object-cover" 
                          alt="" 
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{manager.name}</p>
                          <p className="text-xs font-bold text-primary-600 mt-1">{manager.role}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </CenterModal>

      {/* Application Submission Modal */}
      <CenterModal 
        isOpen={isApplyModalOpen} 
        onClose={() => { setIsApplyModalOpen(false); if (!cameFromDetails) setSelectedJob(null); }} 
        title="Submit Application"
      >
        {selectedJob && (
          <form onSubmit={handleApplySubmit} className="p-5 sm:p-8 md:p-10 space-y-6 md:space-y-8 text-left bg-white dark:bg-slate-900">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".pdf,.doc,.docx" 
              onChange={handleFileChange} 
            />
            <div className="flex items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white">
              <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center font-bold text-2xl shadow-sm border border-slate-100 dark:border-slate-800 shrink-0">
                {selectedJob.company ? selectedJob.company[0] : 'J'}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 leading-none mb-1.5">Job Role</p>
                <p className="text-lg sm:text-xl font-bold leading-tight">{selectedJob.title}</p>
                <p className="text-xs sm:text-sm font-semibold opacity-80 mt-1">{selectedJob.company}</p>
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-bold border-b border-slate-100 dark:border-slate-800 pb-2">Contact Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="form-label px-1">Full Name</label>
                  <input 
                    name="fullName" 
                    type="text" 
                    defaultValue={profile?.fullName || ''} 
                    placeholder="e.g. Alex Rivera" 
                    className="input-field h-12 font-semibold text-sm" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label px-1">Email Address</label>
                  <input 
                    name="email" 
                    type="email" 
                    defaultValue={profile?.email || ''} 
                    placeholder="e.g. candidate@hcm.ai" 
                    className="input-field h-12 font-semibold text-sm" 
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label px-1">Phone Number</label>
                  <PhoneInput 
                    name="phone" 
                    value={applicationPhone} 
                    onChange={e => setApplicationPhone(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <label className="form-label px-1">Location</label>
                  <input 
                    name="location" 
                    type="text" 
                    defaultValue={profile?.location || ''} 
                    placeholder="e.g. New York, NY" 
                    className="input-field h-12 font-semibold text-sm" 
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="form-label px-1">LinkedIn Profile</label>
                  <input 
                    name="linkedin" 
                    type="url" 
                    defaultValue={profile?.linkedin || ''} 
                    placeholder="https://linkedin.com/in/..." 
                    className="input-field h-12 font-semibold text-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="form-label px-1">Resume</label>
                <div className="relative">
                  <select 
                    value={selectedResume} 
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val === 'upload_new') {
                        setPrevResume(selectedResume);
                        fileInputRef.current.click();
                      } else {
                        setSelectedResume(val);
                        setPrevResume(val);
                      }
                    }}
                    className="input-field h-12 pr-10 font-semibold text-sm appearance-none cursor-pointer w-full"
                  >
                    <option value="" disabled className="dark:bg-slate-900">Select a resume...</option>
                    {resumeOptions.map(opt => (
                      <option key={opt} value={opt} className="dark:bg-slate-900">{opt}</option>
                    ))}
                    <option value="upload_new" className="dark:bg-slate-900 font-bold text-primary-600">Upload New Resume...</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="form-label px-1">Availability</label>
                <div className="relative">
                  <select 
                    name="availability" 
                    className="input-field h-12 pr-10 font-semibold text-sm appearance-none cursor-pointer w-full"
                  >
                    <option className="dark:bg-slate-900">Immediate</option>
                    <option className="dark:bg-slate-900">2 Weeks Notice</option>
                    <option className="dark:bg-slate-900">4 Weeks Notice</option>
                    <option className="dark:bg-slate-900">Negotiable</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="form-label px-1">Expected Salary (Annual)</label>
                <input 
                  name="expectedSalary" 
                  type="text" 
                  placeholder={`e.g. ${getSymbol()}165,000`} 
                  className="input-field h-12 font-semibold text-sm" 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="form-label px-1">Portfolio URL</label>
                <input 
                  name="portfolio" 
                  type="url" 
                  defaultValue={profile?.portfolio || ''} 
                  placeholder="https://registry.design/..." 
                  className="input-field h-12 font-semibold text-sm" 
                />
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <label className="form-label px-1">Cover Letter</label>
              <textarea 
                name="coverLetter" 
                rows="5" 
                required 
                className="input-field py-4 font-semibold text-sm resize-none h-auto" 
                placeholder="Tell us why you are a good fit for this role..."
              ></textarea>
            </div>

            <div className="pt-6 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
              <button 
                type="button" 
                onClick={() => setIsApplyModalOpen(false)} 
                className="btn-secondary flex-1 h-12 text-sm font-bold"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="btn-primary flex-1 h-12 flex items-center justify-center gap-2 text-sm font-bold"
              >
                Submit Application <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}
      </CenterModal>
    </div>
  );
};

export default BrowseJobs;
