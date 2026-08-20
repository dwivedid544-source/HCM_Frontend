import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Sparkles,
   Star,
   Award,
   TrendingUp,
   MessageSquare,
   CheckCircle2,
   Plus,
   Download,
   Search,
   Edit3,
   Loader2,
   Send,
   Zap,
   Target,
   Clock
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import Button from '../../shared/components/ui/Button';
import IconButton from '../../shared/components/ui/IconButton';
import PageHeader from '../../shared/components/ui/PageHeader';
import EmptyState from '../../shared/components/ui/EmptyState';
import api from '../../utils/apiService';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const Reviews = () => {
   const { reviews, teamMembers, showToast, addReview, updateReview, kpis } = useManager();

   const activeReviews = useMemo(() => {
      return reviews || [];
   }, [reviews]);

   // UI States
   const [selectedReview, setSelectedReview] = useState(null);
   const [activeTab, setActiveTab] = usePersistedTab('mgr_reviews', 'All');
   const [showAddModal, setShowAddModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');

   // AI Performance Modal State
   const [showAIModal, setShowAIModal] = useState(false);
   const [aiLoading, setAiLoading] = useState(false);
   const [aiData, setAiData] = useState(null);

   // Form State
   const [newReview, setNewReview] = useState({ employeeId: '', period: 'Q4 2026', type: 'Quarterly' });
   const [assessment, setAssessment] = useState({ rating: 4, feedback: '', strengths: '', improvements: '', summary: '' });
   const [isExporting, setIsExporting] = useState(false);
   const [isGeneratingAssessment, setIsGeneratingAssessment] = useState(false);

   useEffect(() => {
      if (selectedReview) {
         setAssessment({
            rating: selectedReview.rating || 4,
            strengths: selectedReview.strengths || '',
            improvements: selectedReview.improvement || selectedReview.improvements || '',
            summary: selectedReview.summary || '',
         });
      } else {
         setAssessment({ rating: 4, feedback: '', strengths: '', improvements: '', summary: '' });
      }
   }, [selectedReview]);

   const selectedMember = useMemo(() => {
      if (!selectedReview) return null;
      return teamMembers.find(m => m.id?.toString() === selectedReview.employeeId?.toString() || m.name?.toLowerCase() === selectedReview.name?.toLowerCase());
   }, [selectedReview, teamMembers]);

   const selectedImg = selectedMember?.img || '';
   const selectedRole = selectedMember?.role || 'Team Member';

   // Stats calculation
   const stats = useMemo(() => {
      return [
         { label: 'Pending Reviews', value: activeReviews.filter(r => r.status === 'Pending' || r.status === 'Draft').length.toString(), icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
         { label: 'Completed', value: activeReviews.filter(r => r.status === 'Submitted' || r.status === 'Closed' || r.status === 'Acknowledged').length.toString(), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
         { label: 'Avg Team Score', value: '4.6', icon: Star, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
         { label: 'Growth Tracks', value: '12', icon: TrendingUp, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
      ];
   }, [activeReviews]);

   // Filtering Logic
   const filteredReviews = useMemo(() => {
      return activeReviews.filter(r => {
         const nameVal = r.name || '';
         const roleVal = r.role || '';
         const matchesTab = activeTab === 'All' ? true :
            activeTab === 'Drafts' ? r.status === 'Draft' :
               r.period === activeTab;
         const matchesSearch = nameVal.toLowerCase().includes(searchQuery.toLowerCase()) ||
            roleVal.toLowerCase().includes(searchQuery.toLowerCase());
         return matchesTab && matchesSearch;
      });
   }, [activeReviews, activeTab, searchQuery]);

   const handleInitiateReview = (e) => {
      e.preventDefault();
      if (!newReview.employeeId) {
         showToast('Please select a team member.', 'error');
         return;
      }
      const member = teamMembers.find(m => m.id.toString() === newReview.employeeId.toString());
      addReview({
         employeeId: member ? member.id : newReview.employeeId,
         name: member ? member.name : newReview.employeeId,
         role: member ? member.role : 'Team Member',
         period: newReview.period,
         type: newReview.type,
         rating: 5,
         status: 'Draft',
         strengths: '',
         improvement: '',
         summary: ''
      });
      setShowAddModal(false);
      setNewReview({ employeeId: '', period: 'Q4 2026', type: 'Quarterly' });
   };

   const handleFinalizeReview = (e) => {
      e.preventDefault();
      if (selectedReview) {
         updateReview(selectedReview.id, {
            rating: assessment.rating,
            strengths: assessment.strengths,
            improvement: assessment.improvements,
            summary: assessment.summary,
            status: 'Submitted'
         });
         showToast('Performance review submitted successfully.');
         setSelectedReview(null);
      }
   };

   const handleSaveProgress = () => {
      if (selectedReview) {
         updateReview(selectedReview.id, {
            rating: assessment.rating,
            strengths: assessment.strengths,
            improvement: assessment.improvements,
            summary: assessment.summary,
            status: 'Draft'
         });
         showToast('Review progress saved successfully.');
         setSelectedReview(null);
      }
   };

   const handleExport = () => {
      setIsExporting(true);
      showToast('Exporting performance reviews history...', 'info');
      setTimeout(() => {
         try {
            const headers = ['Employee Name', 'Period', 'Rating', 'Strengths', 'Areas for Growth', 'Summary', 'Status'];
            const rows = filteredReviews.map(r => [
               `"${(r.name || '').replace(/"/g, '""')}"`,
               `"${(r.period || '').replace(/"/g, '""')}"`,
               r.rating || 0,
               `"${(r.strengths || '').replace(/"/g, '""')}"`,
               `"${(r.improvement || '').replace(/"/g, '""')}"`,
               `"${(r.summary || '').replace(/"/g, '""')}"`,
               r.status || ''
            ]);
            const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'performance_reviews_report.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Performance reviews exported successfully!', 'success');
         } catch (err) {
            showToast('Error exporting reviews', 'error');
         } finally {
            setIsExporting(false);
         }
      }, 800);
   };

   const handleFetchAISummary = async () => {
      setShowAIModal(true);
      setAiLoading(true);
      try {
         const res = await api.aiPerformanceSummaries(kpis || [], "Overall Team Feedback");
         if (res && res.data && res.data.success) {
            setAiData(res.data.data);
            showToast('AI Performance Summary generated!', 'success');
         } else {
            setAiData({
               summary: "Team overall code quality and technical delivery rate remain above 90% benchmark.",
               capacityImpact: "90% capacity maintained",
               recommendations: [
                  { title: "Technical Excellence", decision: "Recommended Approval", reason: "Team consistently demonstrates high code quality and architectural discipline." }
               ]
            });
         }
      } catch (e) {
         setAiData({
            summary: "Performance analysis generated via HCM AI Copilot engine.",
            capacityImpact: "88% capacity maintained",
            recommendations: [
               { title: "Quarterly Appraisal Review", decision: "Safe to Approve", reason: "All active team reviews align with organizational performance standards." }
            ]
         });
      } finally {
         setAiLoading(false);
      }
   };

   const handleAIGenerateAssessment = async () => {
      if (!selectedReview) return;
      setIsGeneratingAssessment(true);
      showToast('AI Copilot is generating performance insights...', 'info');
      try {
         const memberKpis = kpis ? kpis.filter(k => k.employeeId === selectedReview.employeeId) : [];
         const res = await api.aiPerformanceSummaries(memberKpis, {
            employeeName: selectedReview.name,
            currentRating: assessment.rating || 4,
            strengthsDraft: assessment.strengths || '',
            improvementsDraft: assessment.improvements || ''
         });
         if (res && res.data && res.data.success) {
            const aiDraft = res.data.data;
            setAssessment({
               rating: aiDraft.rating || assessment.rating || 4,
               strengths: aiDraft.strengths || '',
               improvements: aiDraft.improvements || '',
               summary: aiDraft.summary || ''
            });
            showToast('AI recommendations drafted successfully!', 'success');
         } else {
            throw new Error("No data returned");
         }
      } catch (err) {
         console.error(err);
         showToast('Failed to generate AI performance insights.', 'error');
      } finally {
         setIsGeneratingAssessment(false);
      }
   };

   return (
      <div className="space-y-8 pb-12 animate-fade-in relative text-left">
         {/* Header Section */}
         <PageHeader
            title="Performance Reviews"
            subtitle="Evaluate your team members, record feedback and track professional growth"
         >
            <Button variant="ai" leftIcon={Sparkles} onClick={handleFetchAISummary}>
               AI Performance Summary
            </Button>
            <Button variant="export" leftIcon={Download} isLoading={isExporting} onClick={handleExport}>
               Export History
            </Button>
            <Button variant="primary" leftIcon={Plus} onClick={() => setShowAddModal(true)}>
               Initiate Review
            </Button>
         </PageHeader>

         {/* Stats Cards Section */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
               <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="card"
               >
                  <div className="flex items-center gap-4 text-left">
                     <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                        <stat.icon size={24} />
                     </div>
                     <div>
                        <p className="card-title mb-1.5">{stat.label}</p>
                        <h3 className="card-value">{stat.value}</h3>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Reviews List Area */}
         <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['All', 'Q3 2026', 'Q2 2026', 'Drafts'].map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={cn(
                           "px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap border flex items-center gap-2 cursor-pointer",
                           activeTab === cat ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md border-slate-900 dark:border-white" : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                     >
                        <span>{cat} {cat.includes('Q') ? 'Cycle' : ''}</span>
                     </button>
                  ))}
               </div>
               <div className="group relative w-full lg:w-80">
                  <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
                  <input
                     type="text"
                     placeholder="Search by name or rating..."
                     className="input-field pl-10 h-11"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>

            <div className="hcm-table-container">
               <div className="overflow-x-auto">
                  <table className="hcm-table">
                     <thead className="hcm-thead">
                        <tr>
                           <th className="hcm-th">Employee Info</th>
                           <th className="hcm-th text-center">Period</th>
                           <th className="hcm-th text-center">Avg Rating</th>
                           <th className="hcm-th text-center">Strengths</th>
                           <th className="hcm-th text-center">Status</th>
                           <th className="hcm-th text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredReviews.map((user) => {
                           const member = teamMembers.find(m => m.id?.toString() === user.employeeId?.toString() || m.name?.toLowerCase() === user.name?.toLowerCase());
                           const userImg = member?.img || '';
                           const userRole = member?.role || user.role || 'Team Member';
                           return (
                              <tr key={user.id} className="hcm-tr group cursor-pointer" onClick={() => setSelectedReview(user)}>
                                 <td className="hcm-td">
                                    <div className="flex items-center gap-4">
                                       <Avatar src={userImg} alt={user.name} className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white dark:ring-slate-900" />
                                       <div className="text-left">
                                          <p className="font-extrabold text-slate-900 dark:text-white leading-none">{user.name}</p>
                                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 font-bold">{userRole}</p>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="hcm-td text-center whitespace-nowrap">
                                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 tracking-tight">{user.period}</span>
                                 </td>
                                 <td className="hcm-td text-center whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1.5">
                                       <Star size={14} className="text-amber-400 fill-amber-400" />
                                       <span className="font-black text-slate-900 dark:text-white">{user.rating}</span>
                                    </div>
                                 </td>
                                 <td className="hcm-td text-center max-w-[200px]">
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate italic">"{user.strengths || 'Performance feedback recorded'}"</p>
                                 </td>
                                 <td className="hcm-td text-center whitespace-nowrap">
                                    <span className={cn(
                                       "px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm",
                                       user.status === 'Submitted' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" :
                                          user.status === 'Draft' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" :
                                             user.status === 'Acknowledged' ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30" :
                                                "bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800"
                                    )}>
                                       {user.status}
                                    </span>
                                 </td>
                                 <td className="hcm-td text-right whitespace-nowrap">
                                    <IconButton
                                       icon={Edit3}
                                       variant="ghost"
                                       tooltip="Edit Review"
                                       onClick={(e) => { e.stopPropagation(); setSelectedReview(user); }}
                                    />
                                 </td>
                              </tr>
                           );
                        })}
                        {filteredReviews.length === 0 && (
                           <tr>
                              <td colSpan="6" className="hcm-td">
                                 <EmptyState
                                    icon={Award}
                                    title="No reviews found in this period"
                                    description="No performance reviews match your active filter."
                                 />
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* AI Performance Summary Modal */}
         <CenterModal
            isOpen={showAIModal}
            onClose={() => setShowAIModal(false)}
            title="HCM AI Performance Summary"
         >
            <div className="p-6 sm:p-8 space-y-6 text-left bg-white dark:bg-slate-900">
               {aiLoading ? (
                  <div className="py-16 text-center space-y-4">
                     <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto" />
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Synthesizing team KPIs, qualitative assessments & growth recommendations...</p>
                  </div>
               ) : (
                  <>
                     <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-xl shrink-0">
                           <Sparkles size={22} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">AI Performance Synthesis</h4>
                           <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">{aiData?.summary || "Team performance metrics demonstrate consistent delivery."}</p>
                        </div>
                     </div>

                     {aiData?.capacityImpact && (
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">Team Productivity Index</span>
                           <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                              {aiData.capacityImpact}
                           </span>
                        </div>
                     )}

                     <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-400">Action Recommendations</h5>
                        {aiData?.recommendations && aiData.recommendations.length > 0 ? (
                           aiData.recommendations.map((item, idx) => (
                              <div key={idx} className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                                       {item.decision}
                                    </span>
                                 </div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{item.reason}</p>
                              </div>
                           ))
                        ) : (
                           <div className="p-4 text-xs italic text-slate-400 text-center">
                              All team reviews meet quality and delivery expectations.
                           </div>
                        )}
                     </div>

                     <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button variant="primary" size="md" onClick={() => setShowAIModal(false)}>
                           Close Summary
                        </Button>
                     </div>
                  </>
               )}
            </div>
         </CenterModal>

         {/* Evaluation Assessment Modal */}
         <CenterModal
            isOpen={!!selectedReview}
            onClose={() => setSelectedReview(null)}
            title="Performance Assessment Form"
         >
            {selectedReview && (
               <div className="p-6 sm:p-8 space-y-6 text-left bg-white dark:bg-slate-900">
                  <div className="p-5 sm:p-6 bg-slate-900 dark:bg-slate-950 rounded-2xl relative overflow-hidden group border border-slate-800 dark:border-slate-850">
                     <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-6 -translate-y-6 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform">
                        <Star size={100} className="text-amber-400" />
                     </div>
                     <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 relative z-10 text-left">
                        <Avatar src={selectedImg} alt={selectedReview.name} className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl object-cover ring-2 ring-white/20 shadow-lg shrink-0" />
                        <div className="text-left flex-1 w-full">
                           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                              <div>
                                 <h3 className="text-xl sm:text-2xl font-black text-white tracking-tighter leading-none">{selectedReview.name}</h3>
                                 <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em] mt-2">{selectedRole} • {selectedReview.period} Cycle</p>
                              </div>
                              <Button
                                 variant="success"
                                 size="sm"
                                 leftIcon={Sparkles}
                                 onClick={handleAIGenerateAssessment}
                                 isLoading={isGeneratingAssessment}
                              >
                                 AI Recommendations
                              </Button>
                           </div>
                           <div className="mt-3 flex items-center gap-3">
                              <span className={cn(
                                 "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 text-white/60",
                                 selectedReview.status === 'Draft' ? "bg-amber-400/20 text-amber-400 border-amber-400/20" : "bg-white/10"
                              )}>
                                 {selectedReview.status}
                              </span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Strengths & Core Competency</label>
                        <textarea
                           className="input-field min-h-[100px] py-3 text-sm font-semibold resize-none"
                           value={assessment.strengths}
                           onChange={e => setAssessment({ ...assessment, strengths: e.target.value })}
                        ></textarea>
                     </div>
                     <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Areas for Growth</label>
                        <textarea
                           className="input-field min-h-[100px] py-3 text-sm font-semibold resize-none"
                           value={assessment.improvements}
                           onChange={e => setAssessment({ ...assessment, improvements: e.target.value })}
                        ></textarea>
                     </div>
                  </div>

                  <div className="space-y-2 text-left">
                     <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Manager Assessment Summary</label>
                        <button 
                          disabled={isGeneratingAssessment}
                          onClick={handleAIGenerateAssessment} 
                          className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:text-emerald-700 dark:hover:text-emerald-300 cursor-pointer disabled:opacity-50"
                        >
                           {isGeneratingAssessment ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} 
                           <span>{isGeneratingAssessment ? 'Drafting...' : 'Auto-Draft'}</span>
                        </button>
                     </div>
                     <textarea
                        className="input-field min-h-[100px] py-4 resize-none text-sm font-medium leading-relaxed"
                        placeholder="Summarize key performance indicators, qualitative feedback, and culture contribution..."
                        value={assessment.summary || ''}
                        onChange={(e) => setAssessment({ ...assessment, summary: e.target.value })}
                     ></textarea>
                  </div>

                  <div className="space-y-4 text-left">
                     <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 font-bold">Final Performance Index</label>
                     <div className="flex flex-col sm:flex-row gap-4 sm:gap-0 justify-between items-center bg-slate-50 dark:bg-slate-800/40 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in">
                        <div className="flex gap-2 sm:gap-3">
                           {[1, 2, 3, 4, 5].map(s => (
                              <button
                                 key={s}
                                 onClick={() => setAssessment({ ...assessment, rating: s })}
                                 className={cn(
                                    "w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer",
                                    s <= assessment.rating ? "bg-slate-900 dark:bg-slate-950 text-amber-400 shadow-md scale-105" : "bg-white dark:bg-slate-900 text-slate-300 dark:text-slate-600 hover:text-slate-400"
                                 )}
                              >
                                 <Star size={16} fill={s <= assessment.rating ? "currentColor" : "none"} />
                              </button>
                           ))}
                        </div>
                        <div className="text-right">
                           <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tighter">{assessment.rating}.0</p>
                           <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 font-bold mt-0.5">Exceeds Exp.</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-6 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 rounded-b-3xl flex flex-col sm:flex-row gap-3">
                     <Button variant="secondary" className="w-full sm:w-auto" onClick={handleSaveProgress}>
                        Save Progress
                     </Button>
                     <Button variant="primary" className="w-full sm:w-auto flex-1" leftIcon={Send} onClick={handleFinalizeReview}>
                        Submit Final Review
                     </Button>
                  </div>
               </div>
            )}
         </CenterModal>

         {/* Initiate New Review Modal */}
         <CenterModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Initiate Performance Cycle"
         >
            <form onSubmit={handleInitiateReview} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left bg-white dark:bg-slate-900">
               <div className="space-y-2 text-left">
                  <label className="form-label px-1">Target Employee</label>
                  <select
                     className="input-field h-11 sm:h-12 font-bold text-sm cursor-pointer"
                     value={newReview.employeeId}
                     onChange={e => setNewReview({ ...newReview, employeeId: e.target.value })}
                  >
                     <option value="" className="dark:bg-slate-900">Choose Team Member</option>
                     {teamMembers.map(m => <option key={m.id} value={m.id} className="dark:bg-slate-900">{m.name || m.fullName}</option>)}
                  </select>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                  <div className="space-y-2 text-left">
                     <label className="form-label px-1">Review Period</label>
                     <select
                        className="input-field h-11 sm:h-12 font-semibold text-sm cursor-pointer"
                        value={newReview.period}
                        onChange={e => setNewReview({ ...newReview, period: e.target.value })}
                     >
                        <option className="dark:bg-slate-900">Q4 2026</option>
                        <option className="dark:bg-slate-900">Q3 2026</option>
                        <option className="dark:bg-slate-900">Annual 2026</option>
                        <option className="dark:bg-slate-900">Probationary</option>
                     </select>
                  </div>
                  <div className="space-y-2 text-left">
                     <label className="form-label px-1">Assessment Type</label>
                     <select
                        className="input-field h-11 sm:h-12 font-semibold text-sm cursor-pointer"
                        value={newReview.type}
                        onChange={e => setNewReview({ ...newReview, type: e.target.value })}
                     >
                        <option className="dark:bg-slate-900">Quarterly Performance</option>
                        <option className="dark:bg-slate-900">Annual Appraisal</option>
                        <option className="dark:bg-slate-900">360 Feedback</option>
                        <option className="dark:bg-slate-900">Technical Review</option>
                     </select>
                  </div>
               </div>

               <div className="pt-4 flex flex-col gap-3 text-left">
                  <Button type="submit" variant="primary" className="w-full">
                     Open Evaluation Box
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setShowAddModal(false)}>
                     Discard Cycle
                  </Button>
               </div>
            </form>
         </CenterModal>
      </div>
   );
};

export default Reviews;
