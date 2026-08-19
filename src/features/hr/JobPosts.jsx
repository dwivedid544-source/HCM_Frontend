import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import {
  Plus, Search, Download, Filter, RotateCcw,
  MoreVertical, Users, Briefcase, Calendar,
  MapPin, DollarSign, CheckCircle2, Clock,
  AlertCircle, X, FileText, ChevronRight, Eye,
  Edit2, Copy, Archive, Trash2, Sparkles, Loader2, GraduationCap, Upload
} from 'lucide-react';
import { hrAPI, adminAPI } from '../../utils/apiService';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import PermissionGate from '../../shared/components/common/PermissionGate';
import ImportModal from '../../shared/components/import/ImportModal';

const JobPosts = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const { jobs, addJob, updateJob, deleteJob, showToast } = useHR();
  const location = useLocation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDept, setFilteredDept] = useState('');
  const [filteredStatus, setFilteredStatus] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [realDepartments, setRealDepartments] = useState([]);

  useEffect(() => {
    const loadDepts = async () => {
      try {
        const res = await adminAPI.getDepartments();
        if (res.data && res.data.data) {
          setRealDepartments(res.data.data.map(d => d.name).sort());
        }
      } catch (err) {
        console.error("Failed to load departments", err);
      }
    };
    loadDepts();
  }, []);

  const [formData, setFormData] = useState({
    title: '', department: 'Engineering', openings: 1, salary: '', type: 'Full Time', description: '', status: 'Published', requirements: '', location: 'Mumbai, India', experience: ''
  });

  const handleExportJobs = () => {
    setIsExporting(true);
    showToast('Preparing job listings database...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Job Title', 'Department', 'Job Type', 'Salary Range', 'Openings', 'Status', 'Applicants'];
        const rows = jobs.map(j => [
          `"${j.title}"`,
          `"${j.department}"`,
          `"${j.type}"`,
          `"${j.salary || 'N/A'}"`,
          `"${j.openings || 1}"`,
          `"${j.status}"`,
          `"${j.applied || 0}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `job_listings_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Job posts exported successfully!', 'success');
      } catch (err) {
        showToast('Error exporting job posts', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
    }
  }, [location]);

  const stats = [
    { label: 'Total Jobs', value: jobs.length, icon: Briefcase, bg: 'bg-blue-50', color: 'text-blue-600' },
    { label: 'Published', value: jobs.filter(j => j.status === 'Published').length, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    { label: 'Drafts', value: jobs.filter(j => j.status === 'Draft').length, icon: FileText, bg: 'bg-amber-50', color: 'text-amber-600' },
    { label: 'Closed', value: jobs.filter(j => j.status === 'Closed').length, icon: Archive, bg: 'bg-slate-50', color: 'text-slate-600' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Published': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      case 'Draft': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'Closed': return 'bg-slate-100 text-slate-500 border-slate-200';
      default: return 'bg-slate-100 text-slate-600';
    }
  }

  const handleOpenCreate = () => {
    setEditingJob(null);
    setFormData({ title: '', department: realDepartments.length > 0 ? realDepartments[0] : 'Engineering', openings: 1, salary: '', type: 'Full Time', description: '', status: 'Published', requirements: '', location: '', experience: '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (job) => {
    setEditingJob(job.id);
    setFormData({
      ...job,
      salary: job.salary || job.salaryRange || '',
      type: job.type || job.jobType || 'Full Time',
      requirements: job.requirements || '',
      location: job.location || 'Mumbai, India',
      experience: job.experience || ''
    });
    setIsModalOpen(true);
  };

  const handleAIGenerateDescription = () => {
    if (!formData.title) {
      showToast("Please enter a Job Title first to generate description", "error");
      return;
    }
    showToast("AI Copilot is drafting a custom description...", "info");

    setTimeout(() => {
      const title = formData.title;
      const sampleDescriptions = {
        designer: `We are seeking a creative Senior Product Designer to join our product team. You will lead UI/UX architecture, design high-fidelity interactive wireframes, establish cohesive design systems, and translate user feedback into premium experiences.\n\nKey Responsibilities:\n* Formulate design guidelines and component libraries.\n* Collaborate with product managers and engineers to build slick experiences.\n* Drive user research and competitive interface analysis.`,
        developer: `We are looking for a highly skilled Front-End Engineer to architect robust UI components. You will leverage modern React configurations, program fluid CSS animations, write clean custom state hooks, and optimize bundle sizing for maximum client performance.\n\nKey Responsibilities:\n* Write modular, testable, and reusable React code.\n* Collaborate on APIs integrations and client-side database schemas.\n* Optimize web pages for maximum scalability.`,
        engineer: `We are seeking a Full Stack Software Engineer to build scalable infrastructure and perform API engineering. You will manage PostgreSQL databases, optimize network gateways, and code responsive client interfaces.\n\nKey Responsibilities:\n* Program solid API endpoints and background workers.\n* Design transactional tables and secure permission locks.\n* Direct cloud deployment and CI/CD pipelines.`,
        hr: `We are hiring an HR Manager to manage corporate talent acquisition, employee relations, and policy compliance. You will orchestrate the entire lifecycle from onboarding templates to exit interview clearance.\n\nKey Responsibilities:\n* Architect recruiting pipelines and review candidate resume insights.\n* Refine company benefits, payroll centers, and holidays schedules.\n* Lead team-building initiatives and training systems.`
      };

      let draft = "";
      const lowerTitle = title.toLowerCase();
      const capitalize = (str) => str.replace(/\b\w/g, c => c.toUpperCase());
      const capitalizedTitle = capitalize(title);

      if (lowerTitle.includes("design") || lowerTitle.includes("ux") || lowerTitle.includes("graphic") || lowerTitle.includes("illustrator") || lowerTitle.includes("figma")) {
        // Pure Design/UX roles
        draft = sampleDescriptions.designer.replace(/Senior Product Designer/g, capitalizedTitle);
      } else if (lowerTitle.includes("hr") || lowerTitle.includes("recruit") || lowerTitle.includes("talent") || lowerTitle.includes("people ops") || lowerTitle.includes("human resources")) {
        // HR roles
        draft = sampleDescriptions.hr.replace(/HR Manager/g, capitalizedTitle);
      } else if (lowerTitle.includes("ui ") || lowerTitle.includes(" ui") || lowerTitle === "ui" || lowerTitle.includes("frontend ui")) {
        // Only strictly UI-labeled frontend roles (not general 'developer' or 'engineer')
        draft = sampleDescriptions.developer.replace(/Front-End Engineer/g, capitalizedTitle);
      } else {
        // Default: All developer, engineer, blockchain, backend, fullstack, software, mobile, data, QA roles
        draft = sampleDescriptions.engineer.replace(/Full Stack Software Engineer/g, capitalizedTitle);
      }

      setFormData(prev => ({ ...prev, description: draft }));
      showToast("Job description drafted by AI Copilot successfully!", "success");
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) return showToast("Title is required", "error");

    if (editingJob) {
      updateJob(editingJob, formData);
    } else {
      addJob({ ...formData, date: formatDate(new Date()) });
    }
    setIsModalOpen(false);
  };

  const filteredJobs = jobs.filter(j => {
    const matchSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDept = filteredDept ? j.department === filteredDept : true;
    const matchStatus = filteredStatus ? j.status === filteredStatus : true;
    return matchSearch && matchDept && matchStatus;
  });

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Job Posts</h1>
          <p className="hcm-page-subtitle">Create, manage and publish hiring opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate module="job_posts" action="manage">
            <button
              onClick={handleExportJobs}
              disabled={isExporting}
              className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
            >
              {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
              <span className="hidden sm:inline">Export Jobs</span>
            </button>
          </PermissionGate>
          <PermissionGate module="job_posts" action="create">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 active:scale-95 transition-all bg-white"
            >
              <Upload size={18} />
              <span className="hidden sm:inline">Import Jobs</span>
            </button>
            <button onClick={handleOpenCreate} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200">
              <Plus size={18} />
              <span>Create New Job</span>
            </button>
          </PermissionGate>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -5 }} className="card p-6 bg-white border border-slate-100 shadow-soft">
            <div className="flex items-center gap-4">
              <div className={cn("p-3 rounded-2xl transition-colors", stat.bg, stat.color)}>
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-400 font-bold leading-none mb-1.5">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card p-6 border-none bg-white shadow-soft flex flex-col lg:flex-row items-center gap-4 overflow-visible">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input type="text" placeholder="Search job title or keyword..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10 h-11" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select value={filteredDept} onChange={e => setFilteredDept(e.target.value)} className="input-field h-11 appearance-none pr-10 w-full sm:min-w-[180px] sm:w-auto font-bold text-slate-600">
            <option value="">All Departments</option>
            <option value="Design">Design</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Marketing">Marketing</option>
            <option value="Human Resources">Human Resources</option>
          </select>
          <select value={filteredStatus} onChange={e => setFilteredStatus(e.target.value)} className="input-field h-11 appearance-none pr-10 w-full sm:min-w-[160px] sm:w-auto font-bold text-slate-600">
            <option value="">All Statuses</option>
            <option value="Published">Published</option>
            <option value="Draft">Draft</option>
            <option value="Closed">Closed</option>
          </select>
          <button onClick={() => { setSearchTerm(''); setFilteredDept(''); setFilteredStatus(''); }} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all h-11 w-11 flex items-center justify-center shrink-0">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="card p-0 border-none bg-white shadow-soft overflow-hidden min-h-[400px]">
        {filteredJobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Briefcase size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-700">No jobs found</h3>
            <p className="mt-2 text-sm font-medium">Try adjusting your filters or create a new job post.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 font-bold">Job Title & Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 font-bold">Department</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Type / Openings</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Applicants</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="group hover:bg-slate-50/10 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary-600 font-bold">
                          {job.title[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 leading-none">{job.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 mt-1.5 uppercase tracking-widest">Posted on {job.date || 'Recently'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="text-sm font-bold text-slate-600 tracking-tight">{job.department}</span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700">{job.type}</p>
                        <p className="text-xs font-medium text-slate-400">{job.openings || 1} positions</p>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusStyle(job.status))}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-slate-300" />
                        <span className="text-sm font-bold text-slate-700">{job.applied || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-1">
                        <PermissionGate module="job_posts" action="edit">
                          <button onClick={() => updateJob(job.id, { status: job.status === 'Published' ? 'Closed' : 'Published' })} className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all" title="Toggle Status"><Archive size={18} /></button>
                          <button onClick={() => handleOpenEdit(job)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Edit"><Edit2 size={18} /></button>
                        </PermissionGate>
                        <PermissionGate module="job_posts" action="delete">
                          <button onClick={() => deleteJob(job.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete"><Trash2 size={18} /></button>
                        </PermissionGate>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h2 className="text-xl font-extrabold text-slate-900">{editingJob ? 'Edit Job Post' : 'Create New Job Post'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Job Title <span className="text-rose-500">*</span></label>
                      <input required type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Senior Product Designer" className="input-field h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Department</label>
                      <select
                        value={formData.department}
                        onChange={e => setFormData({ ...formData, department: e.target.value })}
                        className="input-field h-12 appearance-none"
                      >
                        {realDepartments.length === 0 && <option value="Engineering">Engineering</option>}
                        {realDepartments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Salary Range</label>
                      <div className="relative">
                        {React.createElement(getIcon(), { className: "absolute left-3 top-3.5 text-slate-400", size: 18 })}
                        <input type="text" value={formData.salary} onChange={e => setFormData({ ...formData, salary: e.target.value })} placeholder={`e.g. ${getSymbol()}120k - ${getSymbol()}160k`} className="input-field h-12 pl-10" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Job Type</label>
                      <select
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        className="input-field h-12 appearance-none"
                      >
                        <option value="Full Time">Full Time</option>
                        <option value="Remote">Remote</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3.5 text-slate-400 z-10 pointer-events-none" size={18} />
                          <input
                            type="text"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            placeholder="e.g. Mumbai, India"
                            className="input-field h-12 pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Experience Required</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-3 top-3.5 text-slate-400 pointer-events-none" size={18} />
                          <select
                            value={formData.experience}
                            onChange={e => setFormData({ ...formData, experience: e.target.value })}
                            className="input-field h-12 pl-10 appearance-none"
                          >
                            <option value="" disabled>Select Experience</option>
                            <option value="Entry Level (0-1 Year)">Entry Level (0-1 Year)</option>
                            <option value="1-3 Years">1-3 Years</option>
                            <option value="3-5 Years">3-5 Years</option>
                            <option value="5-8 Years">5-8 Years</option>
                            <option value="8+ Years">8+ Years</option>
                            <option value="Fresher">Fresher</option>
                            <option value="Any Experience">Any Experience</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Openings</label>
                      <input type="number" min="1" value={formData.openings} onChange={e => setFormData({ ...formData, openings: e.target.value })} className="input-field h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                      <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })} className="input-field h-12 appearance-none">
                        <option>Published</option>
                        <option>Draft</option>
                        <option>Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 ml-1">Job Requirements</label>
                    <textarea value={formData.requirements} onChange={e => setFormData({ ...formData, requirements: e.target.value })} rows={3} className="input-field py-4 resize-none" placeholder="e.g. React, Node.js, TypeScript (comma separated)"></textarea>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-700 ml-1">Job Description</label>
                      <button
                        type="button"
                        onClick={handleAIGenerateDescription}
                        className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1.5 bg-primary-50 dark:bg-primary-950/40 px-3 py-1 rounded-xl hover:bg-primary-100/80 transition-all border border-primary-100/50"
                      >
                        <Sparkles size={12} className="text-primary-500 animate-pulse" />
                        <span>Draft with AI</span>
                      </button>
                    </div>
                    <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={12} className="input-field py-4 resize-y" placeholder="Enter detailed job requirements and responsibilities..."></textarea>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end gap-3 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 text-slate-500 font-bold hover:bg-white rounded-xl transition-all">Cancel</button>
                  <button type="submit" className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200">{editingJob ? 'Save Changes' : 'Publish Job'}</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entity="jobs"
        onImportSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default JobPosts;
