import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, Download, User, X, ExternalLink, MapPin, Mail, Phone, Calendar, Loader2, ArrowRight, Eye, CheckCircle2, XCircle, ChevronRight, Ban, RotateCcw
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useAdmin } from '../../context/AdminContext';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import PermissionGate from '../../shared/components/common/PermissionGate';
import Button from '../../shared/components/ui/Button';
import IconButton from '../../shared/components/ui/IconButton';
import PageHeader from '../../shared/components/ui/PageHeader';
import EmptyState from '../../shared/components/ui/EmptyState';

const STAGES_CONFIG = [
  { id: 'Applied', label: 'Applied', color: 'bg-slate-100 text-slate-650' },
  { id: 'Screening', label: 'Screening', color: 'bg-amber-50 text-amber-600' },
  { id: 'Shortlisted', label: 'Shortlisted', color: 'bg-blue-50 text-blue-600' },
  { id: 'Interview', label: 'Interview', color: 'bg-purple-50 text-purple-650' },
  { id: 'Offer', label: 'Offer', color: 'bg-emerald-50 text-emerald-600' },
  { id: 'Hired', label: 'Hired', color: 'bg-indigo-550 text-white' },
];

const HiringPipeline = () => {
  const { candidates, moveCandidateStage, showToast, interviews = [], offers = [], refetch } = useHR();
  const { users } = useAdmin();
  const navigate = useNavigate();

  const [activeCandidate, setActiveCandidate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStage, setFilterStage] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Dynamic real-time auto-synchronization
  useEffect(() => {
    if (typeof refetch === 'function') {
      refetch();
    }
    const interval = setInterval(() => {
      if (typeof refetch === 'function') {
        refetch();
      }
    }, 4000);

    const handleFocus = () => {
      if (typeof refetch === 'function') {
        refetch();
      }
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refetch]);

  // Dynamic roles filter based on available candidates
  const uniqueRoles = useMemo(() => {
    const roles = new Set(candidates.map(c => c.role).filter(Boolean));
    return Array.from(roles).sort();
  }, [candidates]);

  const filteredCandidates = useMemo(() => {
    return candidates.filter(c => {
      const matchSearch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          c.role?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = filterRole ? c.role === filterRole : true;
      const matchStage = filterStage ? c.stage === filterStage : c.stage !== 'Rejected';
      return matchSearch && matchRole && matchStage;
    });
  }, [candidates, searchTerm, filterRole, filterStage]);

  const handleExportPipeline = () => {
    setIsExporting(true);
    showToast('Compiling recruitment funnel data...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Candidate Name', 'Target Role', 'Current Pipeline Stage', 'AI Match Rating', 'Experience'];
        const rows = candidates
          .filter(c => c.stage !== 'Rejected')
          .map(c => [
            `"${c.name}"`,
            `"${c.role}"`,
            `"${c.stage}"`,
            `"${c.match}%"`,
            `"${c.exp || 'N/A'}"`
          ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hiring_pipeline_funnel_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Pipeline data exported successfully!', 'success');
      } catch (err) {
        showToast('Error exporting pipeline data', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  const isInterviewCompleted = (cand) => {
    const candidateInterviews = interviews.filter(i => i.applicationId === cand.id || i.candidate === cand.name);
    if (candidateInterviews.length === 0) return false;
    return candidateInterviews.some(i => i.status === 'Completed');
  };

  const isOfferAccepted = (cand) => {
    const candidateOffers = offers.filter(o => o.applicationId === cand.id || o.candidate === cand.name);
    if (candidateOffers.length === 0) return false;
    return candidateOffers.some(o => o.status === 'Accepted');
  };

  const isNextButtonDisabled = (cand) => {
    if (cand.stage === 'Interview' && !isInterviewCompleted(cand)) return true;
    if (cand.stage === 'Offer' && !isOfferAccepted(cand)) return true;
    return false;
  };

  const getNextButtonText = (cand) => {
    if (cand.stage === 'Interview' && !isInterviewCompleted(cand)) return 'Interview Pending';
    if (cand.stage === 'Offer' && !isOfferAccepted(cand)) return 'Offer Pending';
    return 'Move to Next Stage';
  };

  const moveNextStage = (cand, fromListView = false) => {
    const currentIndex = STAGES_CONFIG.findIndex(s => s.id === cand.stage);
    if (currentIndex < STAGES_CONFIG.length - 1) {
      const nextStage = STAGES_CONFIG[currentIndex + 1].id;
      moveCandidateStage(cand.id, nextStage);
      showToast(`Moved ${cand.name} to ${nextStage}`);
      
      // Only update modal if it's already open, or if this action came from inside the modal
      if (!fromListView || activeCandidate?.id === cand.id) {
        setActiveCandidate({ ...cand, stage: nextStage });
      }
    }
  };

  const handleStageClick = (cand, targetStage) => {
    if (cand.stage === 'Rejected') {
      showToast('Cannot change stage of a rejected candidate. Please restore them first.', 'warning');
      return;
    }
    
    const currentIndex = STAGES_CONFIG.findIndex(s => s.id === cand.stage);
    const targetIndex = STAGES_CONFIG.findIndex(s => s.id === targetStage.id);
    
    if (currentIndex === targetIndex) return;

    // Check dependency locks if moving forward
    if (targetIndex > currentIndex) {
      // If passing through/beyond Interview stage
      const interviewIdx = STAGES_CONFIG.findIndex(s => s.id === 'Interview');
      if (currentIndex <= interviewIdx && targetIndex > interviewIdx && !isInterviewCompleted(cand)) {
        showToast('Interview must be completed before moving forward.', 'error');
        return;
      }
      // If passing through/beyond Offer stage
      const offerIdx = STAGES_CONFIG.findIndex(s => s.id === 'Offer');
      if (currentIndex <= offerIdx && targetIndex > offerIdx && !isOfferAccepted(cand)) {
        showToast('Offer must be accepted before hiring.', 'error');
        return;
      }
    }

    moveCandidateStage(cand.id, targetStage.id);
    showToast(`Moved ${cand.name} to ${targetStage.label}`, 'success');
  };

  const rejectCandidate = (cand) => {
    moveCandidateStage(cand.id, 'Rejected');
    showToast(`${cand.name} marked as Rejected`, 'info');
    if (activeCandidate?.id === cand.id) {
       setActiveCandidate(null);
    }
  };

  const getStageColor = (stageId) => {
    const stage = STAGES_CONFIG.find(s => s.id === stageId);
    return stage ? stage.color : 'bg-slate-100 text-slate-650';
  };

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6 pb-12 animate-fade-in relative text-left">
      {/* Header */}
      <PageHeader
        title="Hiring Pipeline"
        subtitle="Manage and track candidates through sequential evaluation runs"
      >
        <Button variant="secondary" leftIcon={Download} isLoading={isExporting} onClick={handleExportPipeline}>
          Export Pipeline
        </Button>
        <Button variant="primary" leftIcon={Plus} onClick={() => navigate('/hr/candidates', { state: { openCreate: true } })}>
          Add Candidate
        </Button>
      </PageHeader>

      {/* Filters */}
      <div className="card p-4 flex flex-col md:flex-row items-center gap-4 shrink-0 bg-white dark:bg-slate-900 border-none shadow-soft">
        <div className="relative flex-1 w-full text-slate-400 dark:text-slate-550">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} />
          <input
            type="text"
            placeholder="Search candidate by name or role..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-10 h-11 w-full"
          />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <select
            value={filterStage}
            onChange={e => setFilterStage(e.target.value)}
            className="input-field h-11 w-full sm:w-44 font-bold dark:bg-slate-900"
          >
            <option value="">All Stages (Active)</option>
            {STAGES_CONFIG.map(stage => (
              <option key={stage.id} value={stage.id}>{stage.label}</option>
            ))}
            <option value="Rejected">Rejected</option>
          </select>
          <select
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
            className="input-field h-11 w-full sm:w-44 font-bold dark:bg-slate-900"
          >
            <option value="">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List View Data Table */}
      <div className="hcm-table-container max-w-[calc(100vw-32px)] lg:max-w-[calc(100vw-260px-64px)]">
        <div className="overflow-x-auto">
          <table className="hcm-table">
            <thead className="hcm-thead">
              <tr>
                <th className="hcm-th">Candidate</th>
                <th className="hcm-th">Role</th>
                <th className="hcm-th text-center min-w-[280px]">CI/CD Pipeline Flow</th>
                <th className="hcm-th uppercase tracking-widest">AI Match</th>
                <th className="hcm-th uppercase tracking-widest hidden md:table-cell">Interviewers</th>
                <th className="hcm-th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="hcm-td">
                     <EmptyState
                        icon={User}
                        title="No candidates in pipeline"
                        description="No applicants match the current stages or filters."
                     />
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cand) => (
                  <tr key={cand.id} className="hcm-tr group">
                    <td className="hcm-td">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={cand.img}
                          alt={cand.name}
                          className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-900 shadow-sm"
                        />
                        <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{cand.name}</p>
                          <p className="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5">{cand.email || 'No email'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="hcm-td">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-350">{cand.role}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{cand.exp ? `${cand.exp} Exp` : 'Exp N/A'}</p>
                    </td>
                    <td className="hcm-td text-center">
                        <div className="flex items-center justify-center gap-1.5 min-w-[280px] py-1.5">
                         {STAGES_CONFIG.map((stage, idx) => {
                            const isHired = cand.stage === 'Hired' || cand.stage === 'HIRED';
                            const currentIdx = STAGES_CONFIG.findIndex(s => s.id === cand.stage);
                            const isCompleted = isHired || currentIdx > idx;
                            const isCurrent = !isHired && cand.stage === stage.id;
                            const isFuture = !isHired && currentIdx < idx;
                            const isRejected = cand.stage === 'Rejected';

                            return (
                               <React.Fragment key={stage.id}>
                                  <div className="flex flex-col items-center relative group/node">
                                     <div 
                                        onClick={() => handleStageClick(cand, stage)}
                                        className={cn(
                                           "w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black transition-all border shadow-sm cursor-pointer hover:scale-110 active:scale-95",
                                           isHired && idx === 5 ? "bg-emerald-600 border-emerald-500 text-white ring-4 ring-emerald-500/25 scale-110 shadow-md" :
                                           isCurrent && !isRejected ? "bg-indigo-600 border-indigo-500 text-white animate-pulse scale-110 shadow-md ring-4 ring-indigo-500/25" :
                                           isCompleted && !isRejected ? "bg-emerald-500 border-emerald-500 text-white" :
                                           isRejected && idx <= currentIdx ? "bg-rose-500 border-rose-500 text-white" :
                                           "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-750 text-slate-400 dark:text-slate-500 hover:border-slate-400 dark:hover:border-slate-500"
                                        )}
                                     >
                                        {isCompleted && !isRejected ? (
                                           <span className="text-[10px]">✓</span>
                                        ) : (
                                           <span>{idx + 1}</span>
                                        )}
                                     </div>
                                     
                                     {/* Simple Pure CSS Tooltip */}
                                     <div className="absolute bottom-full mb-1.5 hidden group-hover/node:block bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[9px] font-black px-2 py-1 rounded shadow-premium whitespace-nowrap z-50 capitalize">
                                        {stage.label} ({isHired ? 'Completed' : isCurrent ? 'In Progress' : isCompleted ? 'Success' : 'Pending'})
                                     </div>
                                  </div>
                                  
                                  {/* Connector Line */}
                                  {idx < STAGES_CONFIG.length - 1 && (
                                     <div className={cn(
                                        "flex-grow h-0.5 min-w-[20px] max-w-[40px] transition-all",
                                        isCompleted && !isRejected ? "bg-emerald-500" :
                                        isCurrent && !isRejected ? "bg-slate-200 dark:bg-slate-800 border-t border-dashed border-indigo-400" :
                                        "bg-slate-200 dark:bg-slate-800"
                                     )} />
                                  )}
                               </React.Fragment>
                            );
                         })}
                       </div>
                    </td>
                    <td className="hcm-td">
                      <div className="flex items-center gap-2 w-24">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={cn("h-full rounded-full", cand.match > 85 ? "bg-emerald-500" : cand.match > 70 ? "bg-amber-500" : "bg-rose-500")}
                            style={{ width: `${cand.match}%` }}
                          />
                        </div>
                        <span className={cn("text-xs font-bold", cand.match > 85 ? "text-emerald-600 dark:text-emerald-400" : cand.match > 70 ? "text-amber-600 dark:text-amber-400" : "text-rose-500")}>
                          {cand.match}%
                        </span>
                      </div>
                    </td>
                    <td className="hcm-td hidden md:table-cell">
                      <div className="flex -space-x-1.5 overflow-hidden">
                        {(cand.interviewers || []).slice(0, 3).map((name, idx) => {
                          const member = users?.find(u => u.name === name) || {};
                          const initials = name.split(' ').map(n => n[0]).join('');
                          return (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[8px] font-bold text-slate-700 dark:text-slate-300 uppercase overflow-hidden"
                              title={name}
                            >
                              {member.img ? (
                                <img src={member.img} alt={name} className="w-full h-full object-cover" />
                              ) : (
                                initials
                              )}
                            </div>
                          );
                        })}
                        {(!cand.interviewers || cand.interviewers.length === 0) && (
                          <span className="text-[10px] text-slate-400 italic">Unassigned</span>
                        )}
                      </div>
                    </td>
                    <td className="hcm-td text-right">
                      <div className="flex items-center justify-end gap-2">
                        <IconButton
                           icon={Eye}
                           variant="ghost"
                           tooltip="Review Candidate Profile"
                           onClick={() => setActiveCandidate(cand)}
                        />
                        {cand.stage !== 'Rejected' && cand.stage !== 'Hired' && (
                          <IconButton
                             icon={Ban}
                             variant="danger"
                             tooltip="Reject Candidate"
                             onClick={() => rejectCandidate(cand)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Candidate Detail Modal */}
      <CenterModal
        isOpen={!!activeCandidate}
        onClose={() => setActiveCandidate(null)}
        title="Candidate Profile Review"
      >
        {activeCandidate && (
          <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900">
            {/* Header info card */}
            <div className="p-5 sm:p-6 bg-slate-900 dark:bg-slate-950 rounded-2xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-6 opacity-10">
                  <User size={80} className="text-white" />
               </div>
               <div className="flex items-center gap-4 relative z-10">
                  <Avatar
                    src={activeCandidate.img}
                    alt={activeCandidate.name}
                    className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-slate-800 shadow-lg"
                  />
                  <div className="text-left">
                     <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none">{activeCandidate.name}</h3>
                     <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mt-2">Target: {activeCandidate.role}</p>
                  </div>
               </div>
            </div>

            {/* Quick Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                 <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block mb-1">Email Contact</span>
                 <a href={`mailto:${activeCandidate.email}`} className="text-xs font-bold text-slate-850 dark:text-slate-200 hover:underline">{activeCandidate.email || 'No email listed'}</a>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 text-left">
                 <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block mb-1">Experience Level</span>
                 <p className="text-xs font-bold text-slate-850 dark:text-slate-200">{activeCandidate.exp || 'Not specified'}</p>
              </div>
            </div>

            {/* Pipeline Stage Controller */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 text-left space-y-3">
               <span className="text-[9px] font-black text-slate-450 uppercase tracking-wider block">Pipeline Control Round</span>
               <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                     <span className={cn("px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border", getStageColor(activeCandidate.stage))}>
                        {activeCandidate.stage}
                     </span>
                     {isNextButtonDisabled(activeCandidate) && (
                        <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/20 px-2.5 py-1 rounded-lg border border-rose-100 dark:border-rose-900/30">
                           {activeCandidate.stage === 'Interview' ? 'Awaiting Scorecard Submit' : 'Awaiting Offer Acceptance'}
                        </span>
                     )}
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                     {activeCandidate.stage !== 'Hired' && activeCandidate.stage !== 'Rejected' && (
                        <Button
                           variant="primary"
                           size="sm"
                           isDisabled={isNextButtonDisabled(activeCandidate)}
                           onClick={() => moveNextStage(activeCandidate)}
                           className="flex-1 sm:flex-initial"
                        >
                           {getNextButtonText(activeCandidate)}
                        </Button>
                     )}
                     {activeCandidate.stage !== 'Rejected' && activeCandidate.stage !== 'Hired' && (
                        <Button
                           variant="danger"
                           size="sm"
                           onClick={() => rejectCandidate(activeCandidate)}
                        >
                           Reject
                        </Button>
                     )}
                  </div>
               </div>
            </div>

            {/* Foot note */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
               <Button variant="secondary" size="md" onClick={() => setActiveCandidate(null)}>
                  Close Review
               </Button>
            </div>
          </div>
        )}
      </CenterModal>
    </div>
  );
};

export default HiringPipeline;
