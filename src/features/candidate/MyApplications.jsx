import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
 Search, Filter, RotateCcw, ChevronRight, X, Calendar, Briefcase, 
 MessageSquare, CheckCircle2, Clock, AlertCircle, FileText, TrendingUp, Trash2, 
 ExternalLink, ChevronDown, Download, ArrowRight, ShieldAlert, Zap
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useNavigate } from 'react-router-dom';
import { useCandidate } from '../../context/CandidateContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import CenterModal from '../../shared/components/layout/CenterModal';

const MyApplications = () => {
 const { applications = [], withdrawApplication, showToast, refetch, offers = [], respondToOffer } = useCandidate();
 const { formatDate } = useDateFormat();
 const navigate = useNavigate();
 
 const [searchTerm, setSearchTerm] = useState('');
 const [statusFilter, setStatusFilter] = useState('');
 const [selectedApp, setSelectedApp] = useState(null);
 const [isWithdrawConfirmOpen, setIsWithdrawConfirmOpen] = useState(false);

 // Trigger backend applications fetch on component mount
 useEffect(() => {
   if (refetch?.fetchApplications) {
     refetch.fetchApplications();
   }
 }, [refetch]);

 const stats = [
    { label: 'Active Applications', value: applications.length, icon: Briefcase, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-950/30', iconColor: 'text-blue-600 dark:text-blue-400' },
    { label: 'Under Review', value: applications.filter(a => a.status === 'Applied' || a.status === 'Under Review').length, icon: Clock, color: 'amber', bg: 'bg-amber-50 dark:bg-amber-950/30', iconColor: 'text-amber-600 dark:text-amber-400' },
    { label: 'Interviews Scheduled', value: applications.filter(a => a.status === 'Shortlisted' || a.status === 'Interview').length, icon: Calendar, color: 'purple', bg: 'bg-purple-50 dark:bg-purple-950/30', iconColor: 'text-purple-600 dark:text-purple-400' },
    { label: 'Success Rate', value: '15%', icon: TrendingUp, color: 'green', bg: 'bg-emerald-50 dark:bg-emerald-950/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
  ];

 const filteredApplications = useMemo(() => {
   return applications.filter(a => {
     const role = a.role || '';
     const company = a.company || '';
     const matchesSearch = role.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           company.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesStatus = !statusFilter || a.status === statusFilter;
     return matchesSearch && matchesStatus;
   });
 }, [applications, searchTerm, statusFilter]);

 const handleWithdraw = () => {
   withdrawApplication(selectedApp.id);
   setIsWithdrawConfirmOpen(false);
   setSelectedApp(null);
 };

 const handleDownloadSummary = (app) => {
    if (!app) return;
    try {
      const timelineText = Array.isArray(app.timeline)
        ? app.timeline.map((step) => `- ${step.status} on ${step.date}`).join('\n')
        : '- Applied';
        
      const content = `==================================================
JOB APPLICATION SUMMARY
==================================================
Application ID: ${app.id || 'N/A'}
Job Role:       ${app.role || 'N/A'}
Company:        ${app.company || 'N/A'}
Date Applied:   ${app.date || 'N/A'}
Current Status: ${app.status || 'N/A'}

--------------------------------------------------
APPLICATION TIMELINE:
${timelineText}

--------------------------------------------------
RECRUITER FEEDBACK:
"Candidate's technical profile aligns with strategic core competencies. Digital footprint shows strong ecosystem engagement. Maintain in high-priority queue."

==================================================
Generated on: ${formatDate(new Date())}
==================================================`;

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Application_Summary_${(app.company || 'Company').replace(/\s+/g, '_')}_${(app.role || 'Role').replace(/\s+/g, '_')}.txt`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Summary report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Failed to generate summary download:', error);
      showToast('Failed to download summary.', 'error');
    }
  };

 const statusMap = {
    'Applied': { bg: 'bg-slate-100 dark:bg-slate-800/60', text: 'text-slate-600 dark:text-slate-350', border: 'border-slate-200 dark:border-slate-700/60' },
    'Under Review': { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-900/50' },
    'Shortlisted': { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-100 dark:border-blue-900/50' },
    'Interview': { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-100 dark:border-purple-900/50' },
    'Offer': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/50' },
    'Offer Received': { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-900/50' },
    'Offer Accepted': { bg: 'bg-emerald-100 dark:bg-emerald-900/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700/60' },
    'Rejected': { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-600 dark:text-rose-400', border: 'border-rose-100 dark:border-rose-900/50' },
  };

 return (
   <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto text-left px-1 sm:px-0">
     {/* Header Section */}
     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
       <div>
         <h1 className="hcm-page-title">My Applications</h1>
         <p className="hcm-page-subtitle">Track your job applications and hiring status</p>
       </div>
       <button 
         onClick={() => navigate('/candidate/jobs')}
         className="btn-primary w-full sm:w-auto px-8 py-3.5 flex items-center justify-center gap-3 shadow-lg shadow-primary-200 dark:shadow-none text-sm font-bold animate-pulse-subtle"
       >
         <Search size={18} />
         <span>Browse Jobs</span>
       </button>
     </div>

     {/* Summary Cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
       {stats.map((stat, idx) => (
         <motion.div
           key={idx}
           whileHover={{ y: -5 }}
           className="card p-5 sm:p-6 md:p-8 group hover:border-primary-100 dark:hover:border-primary-900 transition-colors duration-300"
         >
           <div className="flex items-center gap-5">
             <div className={cn("p-4 rounded-2xl shadow-sm shrink-0", stat.bg, stat.iconColor)}>
               <stat.icon size={26} />
             </div>
             <div>
               <p className="card-title text-slate-400 dark:text-slate-500 font-bold font-bold text-[11px] mb-1">{stat.label}</p>
               <h3 className="card-value text-2xl font-bold text-slate-900 dark:text-white leading-none">{stat.value}</h3>
             </div>
           </div>
         </motion.div>
       ))}
     </div>

     {/* Control Panel */}
     <div className="card p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
       <div className="relative flex-1 w-full">
         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" size={18} />
         <input 
           type="text" 
           placeholder="Search applications by role or company..." 
           className="input-field pl-12 pr-4 h-14 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 font-bold text-sm w-full"
           value={searchTerm}
           onChange={(e) => setSearchTerm(e.target.value)}
         />
       </div>
       <div className="flex items-center gap-3 sm:gap-4 w-full md:w-auto">
         <div className="relative flex-1 md:w-56">
           <select 
             value={statusFilter}
             onChange={(e) => setStatusFilter(e.target.value)}
             className="input-field h-14 pl-6 pr-10 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 font-semibold text-sm appearance-none cursor-pointer w-full"
           >
             <option value="">Filter by Status: All</option>
             <option value="Applied">Applied</option>
             <option value="Under Review">Under Review</option>
             <option value="Shortlisted">Shortlisted</option>
             <option value="Interview">Interview</option>
             <option value="Offer">Offer</option>
             <option value="Offer Accepted">Offer Accepted</option>
             <option value="Rejected">Rejected</option>
           </select>
           <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
         </div>
         <button 
           onClick={() => { setSearchTerm(''); setStatusFilter(''); }}
           className="p-4 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-800 bg-slate-50 dark:bg-slate-955 border border-slate-100 dark:border-slate-850 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center"
           title="Reset Filters"
         >
           <RotateCcw size={22} />
         </button>
       </div>
     </div>

     {/* Mobile Card Layout (Visible on screens below lg) */}
     <div className="lg:hidden space-y-4">
       {filteredApplications.length > 0 ? (
         filteredApplications.map((app) => (
           <div 
             key={app.id} 
             onClick={() => setSelectedApp(app)}
             className="card p-5 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft hover:shadow-premium transition-all duration-300 cursor-pointer flex flex-col gap-4"
           >
             <div className="flex items-center justify-between gap-4">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                   {app.company ? app.company.charAt(0) : 'J'}
                 </div>
                 <div>
                   <h4 className="text-base font-bold text-slate-900 dark:text-white leading-tight">{app.role}</h4>
                   <p className="text-xs font-bold text-slate-500 dark:text-slate-400 font-bold mt-1">{app.company}</p>
                 </div>
               </div>
               <button className="p-2.5 bg-slate-50 dark:bg-slate-850 text-slate-400 dark:text-slate-500 hover:text-primary-600 hover:bg-white rounded-xl border border-slate-100 dark:border-slate-800 shrink-0 shadow-sm transition-all duration-150">
                 <ExternalLink size={16} />
               </button>
             </div>
             
             <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-50 dark:border-slate-800/60 text-xs">
               <div>
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold">Applied On</p>
                 <p className="font-bold text-slate-800 dark:text-slate-200 mt-1">{app.date}</p>
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Status</p>
                 <div className="mt-1">
                   <span className={cn(
                     "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border whitespace-nowrap",
                     statusMap[app.status]?.bg || 'bg-slate-50 dark:bg-slate-800',
                     statusMap[app.status]?.text || 'text-slate-400 dark:text-slate-500',
                     statusMap[app.status]?.border || 'border-slate-100 dark:border-slate-800'
                   )}>
                     {app.status}
                   </span>
                 </div>
               </div>
               <div className="col-span-2 pt-1">
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Next Step</p>
                 <div className="flex items-center gap-2 mt-1.5 font-semibold text-slate-700 dark:text-slate-300">
                   <Zap size={13} className={cn(app.status === 'Shortlisted' ? 'text-blue-500' : 'text-slate-400 dark:text-slate-600')} />
                   <span>{app.status === 'Rejected' ? 'Application Closed' : app.status === 'Offer Accepted' ? 'Onboarding Started' : 'Awaiting Response'}</span>
                 </div>
               </div>
             </div>
           </div>
         ))
       ) : (
         <div className="py-24 text-center card border-dashed border-2 bg-slate-50/50 dark:bg-slate-950/20 text-slate-450 border-slate-200 dark:border-slate-800">
           <Search size={44} className="text-slate-300 dark:text-slate-700 mb-4 animate-pulse mx-auto" />
           <p className="text-xs font-bold text-slate-400 dark:text-slate-500">No applications found</p>
         </div>
       )}
     </div>

     {/* Desktop Table Layout (Visible on lg and larger screens) */}
     <div className="hidden lg:block hcm-table-container">
       <table className="hcm-table">
         <thead className="hcm-thead">
           <tr>
             <th className="hcm-th px-8 py-5 text-xs font-bold uppercase tracking-wider">Job Details</th>
             <th className="hcm-th px-8 py-5 text-center text-xs font-bold uppercase tracking-wider">Applied On</th>
             <th className="hcm-th px-8 py-5 text-center text-xs font-bold uppercase tracking-wider">Status</th>
             <th className="hcm-th px-8 py-5 text-center text-xs font-bold uppercase tracking-wider">Next Step</th>
             <th className="hcm-th px-8 py-5 text-right text-xs font-bold uppercase tracking-wider">Action</th>
           </tr>
         </thead>
         <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
           {filteredApplications.length > 0 ? filteredApplications.map((app) => (
             <tr key={app.id} className="hcm-tr cursor-pointer" onClick={() => setSelectedApp(app)}>
               <td className="hcm-td px-8 py-6">
                 <div className="flex items-center gap-5">
                   <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                     {app.company ? app.company.charAt(0) : 'J'}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{app.role}</p>
                     <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">{app.company}</p>
                   </div>
                 </div>
               </td>
               <td className="hcm-td px-8 py-6 text-center">
                 <p className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">{app.date}</p>
               </td>
               <td className="hcm-td px-8 py-6 text-center">
                 <span className={cn(
                   "px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border whitespace-nowrap",
                   statusMap[app.status]?.bg || 'bg-slate-50 dark:bg-slate-800',
                   statusMap[app.status]?.text || 'text-slate-400 dark:text-slate-500',
                   statusMap[app.status]?.border || 'border-slate-100 dark:border-slate-800'
                 )}>
                   {app.status}
                 </span>
               </td>
               <td className="hcm-td px-8 py-6">
                 <div className="flex items-center gap-2 justify-center">
                   <Zap size={14} className={cn(app.status === 'Shortlisted' ? 'text-blue-500' : 'text-slate-400 dark:text-slate-600')} />
                   <p className="text-xs font-semibold text-slate-650 dark:text-slate-350 uppercase tracking-wider">{app.status === 'Rejected' ? 'Application Closed' : app.status === 'Offer Accepted' ? 'Onboarding Started' : 'Awaiting Response'}</p>
                 </div>
               </td>
               <td className="hcm-td px-8 py-6 text-right">
                 <button className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-white dark:hover:bg-slate-750 border border-slate-100 dark:border-slate-850 rounded-xl shadow-sm transition-all shrink-0">
                   <ExternalLink size={20} />
                 </button>
               </td>
             </tr>
           )) : (
             <tr>
               <td colSpan="5" className="py-32 text-center">
                 <div className="flex flex-col items-center justify-center">
                   <Search size={48} className="text-slate-200 dark:text-slate-800 mb-6 animate-pulse" />
                   <p className="text-xs font-bold text-slate-400 dark:text-slate-600 font-bold">No applications found</p>
                 </div>
               </td>
             </tr>
           )}
         </tbody>
       </table>
     </div>

     {/* Record Tracker Modal */}
     <CenterModal 
       isOpen={!!selectedApp} 
       onClose={() => setSelectedApp(null)} 
       title="Application Details"
       maxWidth="max-w-3xl"
     >
       {selectedApp && (
         <div className="p-5 sm:p-8 md:p-10 space-y-8 md:space-y-12 text-left bg-white dark:bg-slate-900">
           <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 border-b border-slate-150 dark:border-slate-800 pb-8 md:pb-10 text-center sm:text-left">
             <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl sm:rounded-[1.5rem] bg-primary-600 text-white flex items-center justify-center font-bold text-2xl sm:text-3xl shadow-lg">
               {selectedApp.company ? selectedApp.company.charAt(0) : 'J'}
             </div>
             <div className="flex-1">
               <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">{selectedApp.role}</h2>
               <p className="text-sm sm:text-base font-bold text-primary-600 dark:text-primary-400 mt-2 sm:mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                 <span>{selectedApp.company}</span>
                 <span className="opacity-50">•</span>
                 <span>ID: {selectedApp.id}</span>
               </p>
               <div className="flex justify-center sm:justify-start mt-4 sm:mt-6">
                 <div className="px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap uppercase tracking-wider border border-slate-200/60 dark:border-slate-700/60">
                   Applied {selectedApp.date}
                 </div>
               </div>
             </div>
           </div>

           <div className="space-y-8">
             <h3 className="text-xs sm:text-sm font-bold text-slate-450 dark:text-slate-400 font-bold mb-6 leading-none">Application Timeline</h3>
             <div className="relative space-y-10 pl-10 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
               {['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offer'].map((step, idx) => {
                 const historyIndex = selectedApp.timeline.findIndex(t => t.status === step);
                 const isCompleted = historyIndex !== -1;
                 const isLatest = historyIndex === selectedApp.timeline.length - 1;
                 
                 return (
                   <div key={idx} className="relative">
                     <div className={cn(
                       "absolute -left-[50px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-md transition-all duration-500",
                       isCompleted ? "bg-primary-600" : "bg-slate-100 dark:bg-slate-800",
                       isLatest && "scale-125 ring-4 ring-primary-50 dark:ring-primary-950/30"
                     )} />
                     <div className={cn("transition-all duration-500", !isCompleted && "opacity-30")}>
                       <p className="text-sm font-bold text-slate-900 dark:text-white">{step}</p>
                       <p className="text-xs font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">
                         {isCompleted ? `Updated On: ${selectedApp.timeline[historyIndex].date}` : 'Not yet reached'}
                       </p>
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
           {offers.find(o => o.applicationId === selectedApp.id) && (
              <div className="space-y-4">
                {(() => {
                  const appOffer = offers.find(o => o.applicationId === selectedApp.id);
                  if (appOffer.status === 'Sent') {
                    return (
                      <div className="bg-primary-50/50 dark:bg-primary-950/20 p-6 rounded-2xl border border-primary-100 dark:border-primary-900/30 space-y-4">
                        <h4 className="text-sm font-bold text-primary-900 dark:text-primary-400 uppercase tracking-wider">Job Offer Received!</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <p className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Annual Compensation</p>
                            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">{appOffer.salary}</p>
                          </div>
                          <div>
                            <p className="text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wider">Target Joining Date</p>
                            <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 mt-1">{appOffer.joiningDate}</p>
                          </div>
                        </div>
                        <div className="pt-2 flex gap-3">
                          <button
                            onClick={() => respondToOffer(appOffer.id, 'Declined')}
                            className="px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-455 border border-rose-100 dark:border-rose-900/50 rounded-xl text-xs font-bold transition-all"
                          >
                            Decline Offer
                          </button>
                          <button
                            onClick={() => respondToOffer(appOffer.id, 'Accepted')}
                            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/25 transition-all"
                          >
                            Accept Offer
                          </button>
                        </div>
                      </div>
                    );
                  } else if (appOffer.status === 'Accepted') {
                    return (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-450 flex items-center gap-2">
                          <CheckCircle2 size={16} /> Job Offer Accepted! Onboarding process initialized.
                        </p>
                      </div>
                    );
                  } else {
                    return (
                      <div className="bg-rose-50/50 dark:bg-rose-950/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-900/30">
                        <p className="text-sm font-bold text-rose-600 dark:text-rose-455 flex items-center gap-2">
                          <X size={16} /> Job Offer Declined.
                        </p>
                      </div>
                    );
                  }
                })()}
              </div>
            )}

            <div className="bg-slate-50 dark:bg-slate-950/50 p-5 sm:p-6 md:p-8 rounded-2xl text-left relative overflow-hidden border border-slate-100 dark:border-slate-800">
              <div className="absolute top-0 right-0 p-6 opacity-[0.03] dark:opacity-[0.05] pointer-events-none">
                <MessageSquare size={100} className="text-slate-900 dark:text-white" />
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-450 dark:text-slate-550 mb-4 leading-none font-bold">Recruiter Feedback</h4>
              <p className="text-sm font-bold text-slate-650 dark:text-slate-350 leading-relaxed relative z-10">
                "Candidate's technical profile aligns with strategic core competencies. Digital footprint shows strong ecosystem engagement. Maintain in high-priority queue."
              </p>
            </div>

           <div className="pt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 border-t border-slate-100 dark:border-slate-800">
             <button 
               onClick={() => { setIsWithdrawConfirmOpen(true); }}
               className="btn-secondary flex-1 h-12 text-rose-600 dark:text-rose-450 border-rose-100 dark:border-rose-950/60 bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-100/50 dark:hover:bg-rose-900/35 flex items-center justify-center gap-2 text-sm font-bold"
             >
               <Trash2 size={16} /> Withdraw Application
             </button>
             <button 
               onClick={() => handleDownloadSummary(selectedApp)}
               className="btn-primary flex-1 h-12 shadow-xl shadow-primary-200 dark:shadow-none flex items-center justify-center gap-2 text-sm font-bold"
             >
               <Download size={16} /> Download Summary
             </button>
           </div>
         </div>
       )}
     </CenterModal>

     {/* Withdrawal Confirmation Dialog */}
     <CenterModal 
       isOpen={isWithdrawConfirmOpen} 
       onClose={() => setIsWithdrawConfirmOpen(false)} 
       title="Confirm Action"
       maxWidth="max-w-md"
     >
       <div className="p-5 sm:p-8 md:p-10 text-center space-y-6 md:space-y-8 bg-white dark:bg-slate-900">
         <div className="w-16 h-16 sm:w-20 sm:h-20 bg-rose-50 dark:bg-rose-950/30 rounded-2xl flex items-center justify-center mx-auto text-rose-500 shadow-md border border-rose-100 dark:border-rose-900/50 animate-pulse-subtle shrink-0">
           <ShieldAlert size={36} />
         </div>
         <div>
           <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-2 leading-tight">Confirm Withdrawal</h3>
           <p className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed">
             This will permanently withdraw your application for the <span className="text-slate-950 dark:text-white font-extrabold">{selectedApp?.role}</span> position at <span className="text-slate-955 dark:text-white font-extrabold">{selectedApp?.company}</span>.
           </p>
         </div>
         <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4">
           <button 
             onClick={() => setIsWithdrawConfirmOpen(false)} 
             className="btn-secondary flex-1 h-12 text-sm font-bold"
           >
             Cancel
           </button>
           <button 
             onClick={handleWithdraw} 
             className="btn-danger flex-1 h-12 text-sm font-bold shadow-xl shadow-rose-200 dark:shadow-none"
           >
             Withdraw Application
           </button>
         </div>
       </div>
     </CenterModal>
   </div>
 );
};

export default MyApplications;
