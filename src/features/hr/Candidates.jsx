import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Plus, Search, FileText, Filter, RotateCcw, 
  Download, CheckCircle2, Clock, 
  X, Eye, Mail, Phone, Calendar, ArrowRight, 
  Briefcase, Star, MapPin, ExternalLink, Trash2,
  Sparkles, Upload, Users, User, Edit3, ShieldCheck
  Sparkles, Upload, Users, User, Edit3, AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useAdmin } from '../../context/AdminContext';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import PermissionGate from '../../shared/components/common/PermissionGate';
import ImportModal from '../../shared/components/import/ImportModal';

const Candidates = () => {
  const { candidates, addCandidate, updateCandidate, moveCandidateStage, deleteCandidate, getCandidateAiSummary, showToast } = useHR();
  const { users } = useAdmin();
  const teamMembers = users.filter(u => u.role !== 'Candidate');
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [candidateToDelete, setCandidateToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMatch, setFilteredMatch] = useState('');
  const [filteredStatus, setFilteredStatus] = useState('');

  const [candidateSummaryText, setCandidateSummaryText] = useState('');
  const [isEditedSummary, setIsEditedSummary] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [showConfirmOverwrite, setShowConfirmOverwrite] = useState(false);
  const [aiSummaryError, setAiSummaryError] = useState(false);

  useEffect(() => {
    if (selectedCandidate) {
      setCandidateSummaryText(selectedCandidate.summary || selectedCandidate.coverLetter || '');
      setIsEditedSummary(false);
      setAiSummaryError(false);
    }
  }, [selectedCandidate]);

  const handleGenerateSummary = async (force = false) => {
    if (!selectedCandidate) return;
    if (isEditedSummary && !force) {
      setShowConfirmOverwrite(true);
      return;
    }

    if (!selectedCandidate.name && !selectedCandidate.skills?.length && !selectedCandidate.experience && !selectedCandidate.coverLetter) {
      showToast('No candidate details or resume data available to generate AI summary.', 'error');
      return;
    }

    setIsGeneratingSummary(true);
    setAiSummaryError(false);
    try {
      const result = await getCandidateAiSummary({
        candidateName: selectedCandidate.name,
        role: selectedCandidate.role,
        experience: selectedCandidate.exp || selectedCandidate.experience,
        skills: selectedCandidate.skills,
        resumeText: selectedCandidate.coverLetter || ''
      });
      if (result && result.summary) {
        setCandidateSummaryText(result.summary);
        setIsEditedSummary(false);
        showToast('AI candidate summary generated!', 'success');
      }
    } catch (err) {
      console.error(err);
      setAiSummaryError(true);
    } finally {
      setIsGeneratingSummary(false);
      setShowConfirmOverwrite(false);
    }
  };

  const [formData, setFormData] = useState({
    name: '', email: '', role: '', exp: '1 Year', match: 75, status: 'Applied', stage: 'Applied', interviewers: []
  });

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate();
      window.history.replaceState({}, document.title);
    } else if (location.state?.search) {
      setSearchTerm(location.state.search);
      window.history.replaceState({}, document.title);
    } else if (location.state?.editCandidateId) {
      const cand = candidates.find(c => c.id === location.state.editCandidateId);
      if (cand) {
        handleOpenEdit(cand);
      }
      window.history.replaceState({}, document.title);
    }
  }, [location, candidates]);
  const [previewingResume, setPreviewingResume] = useState(null);

  const stats = [
    { label: 'Total Candidates', value: candidates.length, icon: FileText, bg: 'bg-blue-50 dark:bg-blue-950/20', color: 'text-blue-600 dark:text-blue-450' },
    { label: 'Shortlisted', value: candidates.filter(c=>c.stage==='Shortlisted').length, icon: CheckCircle2, bg: 'bg-emerald-50 dark:bg-emerald-950/20', color: 'text-emerald-600 dark:text-emerald-450' },
    { label: 'Interviewing', value: candidates.filter(c=>c.stage==='Interview').length, icon: Clock, bg: 'bg-amber-50 dark:bg-amber-950/20', color: 'text-amber-600 dark:text-amber-400' },
    { label: 'Hires', value: candidates.filter(c=>c.stage==='Hired').length, icon: Briefcase, bg: 'bg-indigo-50 dark:bg-indigo-950/20', color: 'text-indigo-600 dark:text-indigo-400' },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Shortlisted': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30';
      case 'Interview': return 'bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30';
      case 'Screening': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30';
      case 'Offer': return 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30';
      case 'Hired': return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30';
      case 'Rejected': return 'bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-455 border-rose-100 dark:border-rose-900/30';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        c.role.toLowerCase().includes(searchTerm.toLowerCase());
    let matchAI = true;
    if (filteredMatch === '90') matchAI = c.match >= 90;
    if (filteredMatch === '75') matchAI = c.match >= 75 && c.match < 90;
    
    const matchStatus = filteredStatus ? c.stage.toLowerCase() === filteredStatus.toLowerCase() : true;

    return matchSearch && matchAI && matchStatus;
  });

  const handleOpenCreate = () => {
    setEditingCandidate(null);
    setFormData({ name: '', email: '', role: '', exp: '1 Year', match: 75, status: 'Applied', stage: 'Applied', interviewers: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cand) => {
    setEditingCandidate(cand.id);
    setFormData({ interviewers: [], ...cand });
    setIsModalOpen(true);
    setSelectedCandidate(null);
  };

  const handleExportCandidates = () => {
    showToast('Preparing candidates database...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Name', 'Email', 'Role Applied', 'Experience', 'AI Match', 'Stage', 'Phone', 'Location'];
        const rows = candidates.map(c => [
          `"${c.name}"`,
          `"${c.email}"`,
          `"${c.role}"`,
          `"${c.exp || c.experience || ''}"`,
          `"${c.match || ''}"`,
          `"${c.stage}"`,
          `"${c.phone || ''}"`,
          `"${c.location || ''}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `candidates_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Candidates exported successfully!', 'success');
      } catch (err) {
        showToast('Error exporting candidates', 'error');
      }
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.name || !formData.email) return showToast("Name and Email required", "error");
    
    // Auto sync status and stage for UI
    const processedData = {
      ...formData,
      status: formData.stage,
      img: formData.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=random`
    };

    if (editingCandidate) {
      updateCandidate(editingCandidate, processedData);
    } else {
      addCandidate(processedData);
    }
    setIsModalOpen(false);
  };

  const handleStageChange = (id, newStage) => {
    moveCandidateStage(id, newStage);
    if(selectedCandidate?.id === id) {
      setSelectedCandidate({ ...selectedCandidate, stage: newStage, status: newStage });
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Candidates</h1>
          <p className="hcm-page-subtitle">Review applicants and move top talent through the pipeline</p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate module="candidates" action="create">
            <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary flex items-center gap-2">
              <Upload size={18} />
              <span className="hidden sm:inline">Import</span>
            </button>
          </PermissionGate>
          <PermissionGate module="candidates" action="view">
            <button onClick={handleExportCandidates} className="btn-secondary flex items-center gap-2">
              <Download size={18} />
              <span className="hidden sm:inline">Bulk Export</span>
            </button>
          </PermissionGate>
          <PermissionGate module="candidates" action="create">
          <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
             <Plus size={18} />
             <span>Add Candidate</span>
          </button>
          </PermissionGate>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -5 }} className="card">
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl transition-colors", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="card-title mb-1.5">{stat.label}</p>
                  <h3 className="card-value">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card flex flex-col lg:flex-row items-center gap-4 overflow-visible bg-white dark:bg-slate-900">
        <div className="relative flex-1 w-full text-slate-400 dark:text-slate-500">
          <Search className="absolute left-3 top-3" size={18} />
          <input type="text" placeholder="Search by name, email, or role..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10 h-11" />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select value={filteredMatch} onChange={e => setFilteredMatch(e.target.value)} className="input-field h-11 appearance-none pr-10 w-full sm:min-w-[160px] sm:w-auto font-bold text-slate-600 dark:text-slate-300">
            <option value="">AI Match Range</option>
            <option value="90">90% +</option>
            <option value="75">75% - 90%</option>
          </select>
          <select value={filteredStatus} onChange={e => setFilteredStatus(e.target.value)} className="input-field h-11 appearance-none pr-10 w-full sm:min-w-[160px] sm:w-auto font-bold text-slate-600 dark:text-slate-300">
            <option value="">All Statuses</option>
            <option value="Applied">Applied</option>
            <option value="Screening">Screening</option>
            <option value="Interview">Interview</option>
            <option value="Offer">Offer</option>
            <option value="Rejected">Rejected</option>
          </select>
          <button onClick={() => { setSearchTerm(''); setFilteredMatch(''); setFilteredStatus(''); }} className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl transition-all h-11 w-11 flex items-center justify-center shrink-0 bg-white dark:bg-slate-900">
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      <div className="hcm-table-container min-h-[400px]">
        {filteredCandidates.length === 0 ? (
          <div className="hcm-empty-state py-20 text-slate-400 dark:text-slate-500">
            <Users size={48} className="mb-4 opacity-50" />
            <h3 className="text-xl font-bold text-slate-700 dark:text-white">No candidates found</h3>
            <p className="mt-2 text-sm font-medium">Try adjusting your filters or add a new candidate.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="hcm-table">
              <thead className="hcm-thead">
                <tr>
                  <th className="hcm-th">Candidate Info</th>
                  <th className="hcm-th">Role Applied</th>
                  <th className="hcm-th text-center">AI Match</th>
                  <th className="hcm-th">Stage</th>
                  <th className="hcm-th">Resume</th>
                  <th className="hcm-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredCandidates.map((cand) => (
                  <tr key={cand.id} className="hcm-tr">
                    <td className="hcm-td cursor-pointer" onClick={async () => {
                      setSelectedCandidate(cand);
                      try { await hrAPI.trackCandidateProfile(cand.id, { action: 'view' }); } catch(e) {}
                    }}>
                      <div className="flex items-center gap-4">
                        <img src={cand.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(cand.name)}&background=random`} alt={cand.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white leading-none group-hover:text-primary-600 transition-colors">{cand.name}</p>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1.5">{cand.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hcm-td cursor-pointer" onClick={async () => {
                      setSelectedCandidate(cand);
                      try { await hrAPI.trackCandidateProfile(cand.id, { action: 'view' }); } catch(e) {}
                    }}>
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{cand.role}</p>
                        <p className="text-xs font-medium text-slate-400 dark:text-slate-500">{cand.exp || 'Entry'} Exp</p>
                      </div>
                    </td>
                    <td className="hcm-td">
                      <div className="flex flex-col items-center gap-1.5">
                         <span className={cn("text-[10px] font-extrabold uppercase tracking-widest", cand.match > 90 ? "text-emerald-500 dark:text-emerald-450" : cand.match >= 75 ? "text-primary-500 dark:text-primary-400" : "text-amber-500 dark:text-amber-450")}>
                           {cand.match}% Match
                         </span>
                         <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                            <div className={cn("h-full rounded-full transition-all", cand.match > 90 ? "bg-emerald-50 dark:bg-emerald-400" : cand.match >= 75 ? "bg-primary-500 dark:bg-primary-400" : "bg-amber-500 dark:bg-amber-400")} style={{ width: `${cand.match}%` }} />
                         </div>
                      </div>
                    </td>
                    <td className="hcm-td">
                      <span className={cn("px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusStyle(cand.stage))}>
                        {cand.stage}
                      </span>
                    </td>
                    <td className="hcm-td">
                      <button onClick={async () => {
                        setPreviewingResume(cand);
                        try { await hrAPI.trackCandidateProfile(cand.id, { action: 'download' }); } catch(e) {}
                      }} className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition-all flex items-center gap-2">
                         <FileText size={18} />
                         <span className="text-xs font-bold hidden xl:inline">View</span>
                      </button>
                    </td>
                    <td className="hcm-td text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => navigate(`/admin/roles?role=Candidate&user=${cand.id}`)} className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-all" title="Permissions Matrix"><ShieldCheck size={18} /></button>
                        <button onClick={async () => {
                          setSelectedCandidate(cand);
                          try { await hrAPI.trackCandidateProfile(cand.id, { action: 'view' }); } catch(e) {}
                        }} className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-lg transition-all" title="View Details"><Eye size={18} /></button>
                        <PermissionGate module="interviews" action="create">
                        <button onClick={() => navigate('/hr/interviews', { state: { openCreate: true, candidate: cand.name } })} className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-all" title="Schedule Interview"><Calendar size={18} /></button>
                        </PermissionGate>
                        <PermissionGate module="candidates" action="delete">
                        <button onClick={() => setCandidateToDelete(cand)} className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 rounded-lg transition-all" title="Delete Candidate"><Trash2 size={18} /></button>
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
        {selectedCandidate && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCandidate(null)} className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70" />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
               <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
                  <div className="flex items-center gap-4">
                     <img src={selectedCandidate.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedCandidate.name)}&background=random`} alt={selectedCandidate.name} className="w-12 h-12 rounded-2xl object-cover ring-4 ring-white dark:ring-slate-800 shadow-xl" />
                     <div>
                        <h2 className="text-xl font-extrabold text-slate-900 dark:text-white leading-none">{selectedCandidate.name}</h2>
                        <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">{selectedCandidate.role}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-2">
                      <button onClick={() => navigate(`/admin/roles?role=Candidate&user=${selectedCandidate.id}`)} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:text-indigo-400 rounded-xl text-xs font-bold transition-all" title="Permissions Matrix">
                         <ShieldCheck size={16} />
                         <span>Permissions</span>
                      </button>
                      <button onClick={() => handleOpenEdit(selectedCandidate)} className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all" title="Edit">
                         <Edit3 size={20} />
                      </button>
                     <button onClick={() => setSelectedCandidate(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 dark:text-slate-500">
                        <X size={24} />
                     </button>
                  </div>
               </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-white dark:bg-slate-900">
                  <div className="grid grid-cols-2 gap-6">
                     <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold mb-1">AI Match Score</p>
                        <div className="flex items-end gap-2">
                           <span className={cn("text-3xl font-extrabold", selectedCandidate.match > 90 ? "text-emerald-600 dark:text-emerald-450" : "text-primary-600 dark:text-primary-400")}>{selectedCandidate.match || 80}%</span>
                           {(selectedCandidate.match > 90 || !selectedCandidate.match) && <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 mb-1 flex items-center gap-0.5"><Sparkles size={12} /> Elite Match</span>}
                        </div>
                     </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold mb-1 flex items-center justify-between">
                           Current Stage
                           <span className={cn("px-2 py-0.5 rounded text-[8px]", getStatusStyle(selectedCandidate.stage))}>{selectedCandidate.stage}</span>
                        </p>
                        <select 
                          value={selectedCandidate.stage} 
                          onChange={(e) => handleStageChange(selectedCandidate.id, e.target.value)}
                          className="mt-2 w-full text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b-2 border-slate-200 dark:border-slate-800 pb-1 focus:outline-none focus:border-primary-500"
                        >
                          <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Applied</option>
                          <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Screening</option>
                          <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Shortlisted</option>
                          <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Interview</option>
                          <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Offer</option>
                          <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Hired</option>
                          <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Rejected</option>
                        </select>
                     </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Expected Salary</p>
                        <div className="flex items-end gap-2">
                           <span className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedCandidate.expectedSalary || 'Not Specified'}</span>
                        </div>
                     </div>
                     <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Experience</p>
                        <div className="flex items-end gap-2">
                           <span className="text-xl font-extrabold text-slate-900 dark:text-white">{selectedCandidate.experience || '3-5 Years'}</span>
                        </div>
                     </div>
                  </div>

                  <section className="space-y-4">
                     <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-[0.2em]">Assigned Team Members / Interviewers</h3>
                     <div className="flex flex-wrap gap-2">
                        {(selectedCandidate.interviewers || []).length > 0 ? (
                           (selectedCandidate.interviewers || []).map((name, idx) => {
                              const member = users.find(u => u.name === name) || {};
                              return (
                                 <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                                    <img src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`} alt={name} className="w-5 h-5 rounded-full object-cover" />
                                    <span>{name}</span>
                                 </div>
                              );
                           })
                        ) : (
                           <span className="text-xs font-bold text-slate-400 dark:text-slate-500 italic">No team members assigned</span>
                        )}
                     </div>
                  </section>

                  <section className="space-y-4">
                     <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-[0.2em]">Contact Details</h3>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 italic">
                           <Mail size={16} className="text-slate-300 dark:text-slate-600" />
                           <span className="text-sm font-medium">{selectedCandidate.email}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 italic">
                           <Phone size={16} className="text-slate-300 dark:text-slate-600" />
                           <span className="text-sm font-medium">{selectedCandidate.phone || 'Not Provided'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400 italic">
                           <MapPin size={16} className="text-slate-300 dark:text-slate-600" />
                           <span className="text-sm font-medium">{selectedCandidate.location || 'Not Provided'}</span>
                        </div>
                        {selectedCandidate.linkedin ? (
                           <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 cursor-pointer hover:underline" onClick={() => window.open(selectedCandidate.linkedin, '_blank')}>
                              <ExternalLink size={16} className="text-primary-300 dark:text-primary-650" />
                              <span className="text-sm font-bold">LinkedIn Profile</span>
                           </div>
                        ) : (
                           <div className="flex items-center gap-3 text-slate-450 dark:text-slate-550 italic">
                              <ExternalLink size={16} className="text-slate-300 dark:text-slate-700" />
                              <span className="text-sm font-medium">No LinkedIn Profile</span>
                           </div>
                        )}
                        {selectedCandidate.portfolio && (
                           <div className="flex items-center gap-3 text-primary-600 dark:text-primary-400 cursor-pointer hover:underline col-span-2" onClick={() => window.open(selectedCandidate.portfolio, '_blank')}>
                              <ExternalLink size={16} className="text-primary-300" />
                              <span className="text-sm font-bold">Portfolio: {selectedCandidate.portfolio}</span>
                           </div>
                        )}
                     </div>
                  </section>

                  {/* AI Generated Summary Section */}
                  <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                     <div className="flex items-center justify-between">
                        <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                           <Sparkles size={14} className="text-indigo-500" />
                           AI Candidate Summary
                        </h3>
                        <button
                           onClick={() => handleGenerateSummary(false)}
                           disabled={isGeneratingSummary}
                           className="btn-secondary px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800"
                        >
                           {isGeneratingSummary ? <Loader2 size={12} className="animate-spin" /> : (aiSummaryError ? <RotateCcw size={12} /> : <Sparkles size={12} />)}
                           <span>{isGeneratingSummary ? 'Generating...' : aiSummaryError ? 'Retry Generation' : candidateSummaryText ? 'Regenerate' : 'Auto-Generate Summary'}</span>
                        </button>
                     </div>
                     {aiSummaryError && (
                        <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs font-bold flex items-center gap-2">
                           <AlertCircle size={14} />
                           Failed to connect to AI Service. Please ensure the AI server is running on port 5001.
                        </div>
                     )}
                     <textarea
                        value={candidateSummaryText}
                        onChange={(e) => {
                           setCandidateSummaryText(e.target.value);
                           setIsEditedSummary(true);
                        }}
                        className={cn("input-field py-3 resize-none h-28 text-xs font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/30", aiSummaryError && "border-rose-300 bg-rose-50/30")}
                        placeholder="Click 'Auto-Generate Summary' to parse candidate resume and experience..."
                     />
                  </section>

                  {selectedCandidate.coverLetter && (
                     <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-[0.2em]">Cover Letter / Statement</h3>
                        <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/20 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 whitespace-pre-line">
                           {selectedCandidate.coverLetter}
                        </p>
                     </section>
                  )}

                  <section className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                     <h3 className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-[0.2em]">Recruiter Notes</h3>
                     <textarea className="input-field py-4 resize-none h-32" placeholder="Add a recruiter note for this candidate..."></textarea>
                     <button className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline" onClick={() => showToast('Note saved')}>Save Note</button>
                  </section>
               </div>

               <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center gap-3 shrink-0">
                  <button onClick={() => handleStageChange(selectedCandidate.id, 'Rejected')} className="flex-1 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-800 transition-all shadow-sm">
                     Reject Candidate
                  </button>
                  <button onClick={() => navigate('/hr/interviews', { state: { openCreate: true, candidate: selectedCandidate.name } })} className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg active:scale-95">
                     Schedule Interview
                  </button>
               </div>
            </motion.div>
          </div>
        )}

        {previewingResume && (
           <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreviewingResume(null)} className="absolute inset-0 bg-slate-900/70 dark:bg-slate-950/80" />
              <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
                 <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center text-primary-600 dark:text-primary-400">
                          <Users size={22} />
                       </div>
                        <div>
                           <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{previewingResume.resumeUrl || `${(previewingResume.name || 'Candidate').replace(/\s+/g, '_')}_Resume.pdf`}</h2>
                           <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-bold">Candidate Resume • AI Analyzed</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-3 text-slate-500">
                        <button onClick={() => {
                           const resolvedUrl = (previewingResume.resumeUrl && (previewingResume.resumeUrl.startsWith('http') || previewingResume.resumeUrl.startsWith('data:'))) 
                                               ? previewingResume.resumeUrl 
                                               : '/demo_resume.pdf';
                           const link = document.createElement('a');
                           link.href = resolvedUrl;
                           link.download = `${previewingResume.name.replace(/\s+/g, '_')}_Resume.pdf`;
                           document.body.appendChild(link);
                           link.click();
                           document.body.removeChild(link);
                           showToast('Resume downloaded successfully!', 'success');
                        }} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"><Download size={20} /></button>
                        <button onClick={() => setPreviewingResume(null)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 dark:text-slate-500"><X size={24} /></button>
                     </div>
                  </div>
                  <div className="flex-1 bg-slate-100 dark:bg-slate-950 overflow-y-auto p-4 sm:p-10 flex justify-center min-h-[70vh]">
                     {previewingResume.resumeUrl ? (
                        <iframe 
                           src={(previewingResume.resumeUrl.startsWith('http') || previewingResume.resumeUrl.startsWith('data:')) ? previewingResume.resumeUrl : '/demo_resume.pdf'}
                           className="w-full max-w-4xl bg-white shadow-2xl rounded-2xl min-h-[70vh] border border-slate-200 dark:border-slate-800" 
                           title="Resume Preview"
                        />
                     ) : (
                        <div className="w-full max-w-[800px] bg-white dark:bg-slate-900 shadow-2xl rounded-sm p-12 sm:p-20 relative overflow-hidden ring-1 ring-slate-900/5 dark:ring-slate-800 min-h-[60vh] flex flex-col items-center justify-center text-center">
                           <FileText size={64} className="text-slate-200 dark:text-slate-800 mb-6" />
                           <h3 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-2">No Resume Uploaded</h3>
                           <p className="text-slate-500 dark:text-slate-400 max-w-md">
                              {previewingResume.name} has not uploaded a formatted resume or sufficient profile details to generate one.
                           </p>
                           {/* AI Overlay Checkmark Placeholder */}
                           <div className="absolute top-12 right-12 flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-full shadow-xl opacity-50">
                              <Sparkles size={16} />
                              <span className="text-xs font-bold">N/A</span>
                           </div>
                        </div>
                     )}
                  </div>
                 <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 shrink-0">
                    <button onClick={() => setPreviewingResume(null)} className="px-6 py-2.5 text-slate-500 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all">Close</button>
                    <button onClick={() => {
                       window.print();
                    }} className="px-8 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg active:scale-95">Print Resume</button>
                 </div>
              </motion.div>
           </div>
        )}


        {isModalOpen && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/50 dark:bg-slate-950/70" onClick={() => setIsModalOpen(false)} />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 shrink-0">
                   <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">{editingCandidate ? 'Edit Candidate' : 'Add New Candidate'}</h2>
                   <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 dark:text-slate-500"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                  <div className="p-8 space-y-6 bg-white dark:bg-slate-900">
                     <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-750 hover:border-primary-500 dark:hover:border-primary-400 hover:text-primary-600 transition-all">
                           <Upload size={20} className="mb-1" />
                           <span className="text-[9px] font-bold">Avatar</span>
                        </div>
                        <div className="flex-1 space-y-2">
                           <label className="form-label">Full Name <span className="text-rose-500">*</span></label>
                           <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Wick" className="input-field h-12" />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="form-label">Email <span className="text-rose-500">*</span></label>
                           <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" className="input-field h-12" />
                        </div>
                        <div className="space-y-2">
                           <label className="form-label">Role Applied For</label>
                           <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Product Manager" className="input-field h-12" />
                        </div>
                        <div className="space-y-2">
                           <label className="form-label">Experience</label>
                           <input type="text" value={formData.exp} onChange={e => setFormData({...formData, exp: e.target.value})} placeholder="e.g. 5 Years" className="input-field h-12" />
                        </div>
                        <div className="space-y-2">
                           <label className="form-label">AI Match Score</label>
                           <input type="number" min="0" max="100" value={formData.match} onChange={e => setFormData({...formData, match: parseInt(e.target.value)})} className="input-field h-12" />
                        </div>
                        <div className="space-y-2">
                           <label className="form-label">Pipeline Stage</label>
                           <select value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})} className="input-field h-12">
                              <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Applied</option>
                              <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Screening</option>
                              <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Shortlisted</option>
                              <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Interview</option>
                              <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Offer</option>
                              <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Hired</option>
                              <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Rejected</option>
                           </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                             <label className="form-label">Assign Team Members / Interviewers</label>
                             <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 max-h-40 overflow-y-auto">
                                {teamMembers.map(member => {
                                   const isSelected = (formData.interviewers || []).includes(member.name);
                                   return (
                                      <button
                                         type="button"
                                         key={member.id}
                                         onClick={() => {
                                            const currentList = formData.interviewers || [];
                                            const newList = currentList.includes(member.name)
                                               ? currentList.filter(name => name !== member.name)
                                               : [...currentList, member.name];
                                            setFormData({ ...formData, interviewers: newList });
                                         }}
                                         className={cn(
                                            "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer",
                                            isSelected 
                                               ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-slate-100 shadow-sm" 
                                               : "bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                         )}
                                      >
                                         <img src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}`} alt={member.name} className="w-5 h-5 rounded-full object-cover" />
                                         <span>{member.name}</span>
                                      </button>
                                   );
                                })}
                             </div>
                          </div>
                      </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex items-center justify-end gap-3 shrink-0">
                     <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
                     <button type="submit" className="btn-primary text-sm shadow-lg shadow-primary-500/20">{editingCandidate ? 'Save Changes' : 'Add Candidate'}</button>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entity="candidates"
      />

      <ConfirmDialog
        isOpen={!!candidateToDelete}
        onClose={() => setCandidateToDelete(null)}
        onConfirm={() => {
          deleteCandidate(candidateToDelete.id);
          setCandidateToDelete(null);
        }}
        title="Delete Candidate"
        message={`Are you sure you want to delete ${candidateToDelete?.name}'s application? All related data will be permanently removed.`}
      />

      <ConfirmDialog
        isOpen={showConfirmOverwrite}
        onClose={() => setShowConfirmOverwrite(false)}
        onConfirm={() => handleGenerateSummary(true)}
        title="Overwrite Manually Edited Summary?"
        message="You have manually edited the candidate summary. Generating a new AI summary will overwrite your current edits. Do you wish to proceed?"
      />
    </div>
  );
};

export default Candidates;
