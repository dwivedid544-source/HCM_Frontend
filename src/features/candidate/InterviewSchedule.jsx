import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalendarIcon, MapPin, Video, User, Clock, ChevronRight, ExternalLink, 
  Bell, CheckCircle2, AlertCircle, Briefcase, ChevronLeft, CalendarDays, 
  Plus, X, Zap, ShieldCheck, Info, RotateCcw, VideoOff, Play, Save, Check,
  Laptop, BookOpen, AlertTriangle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCandidate } from '../../context/CandidateContext';
import CenterModal from '../../shared/components/layout/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';

const InterviewSchedule = () => {
  const { interviews, showToast } = useCandidate();
  const [view, setView] = useState('list'); 
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  
  // Custom Modals
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isPrepModalOpen, setIsPrepModalOpen] = useState(false);
  const [prepDetails, setPrepDetails] = useState(null);

  const stats = [
    { label: 'Scheduled', value: interviews.length, icon: CalendarIcon, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Completed', value: '18', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Wait Time', value: '4d', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Preparation', value: '94%', icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  const handleJoin = (link) => {
    showToast('Joining interview video session...', 'success');
    window.open(link, '_blank');
  };

  const statusStyles = {
    'Scheduled': 'bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-950/20 dark:text-primary-400 dark:border-primary-900',
    'Completed': 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900',
    'Cancelled': 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900',
  };

  // Helper to open Prep Guide dynamically
  const openPrepGuide = (interview) => {
    const details = {
      role: interview.role || 'Senior Position',
      company: interview.company || 'GlobalTech Solutions',
      round: interview.round || 'Technical Stage',
      focusArea: interview.round?.toLowerCase().includes('technical') 
        ? 'Data structures, algorithm complexity, software design principles, and problem-solving velocity.' 
        : 'System roadmap architecture, scalability solutions, cross-team communication, and project life cycles.',
      steps: interview.round?.toLowerCase().includes('technical')
        ? [
            'Revise Figma layout rules and responsive grid implementations.',
            'Brush up on fundamental CSS concepts (flexbox, grid layouts, custom properties).',
            'Prepare a 5-minute walkthrough of your most complex system build.',
            'Review STAR method behavioral scenarios focusing on code ownership.'
          ]
        : [
            'Prepare a detailed explanation of your strategic product decisions.',
            'Formulate questions regarding team scale and technical roadmap objectives.',
            'Identify past conflict resolution stories using design or product metrics.',
            'Review target market segment details and competitive tech landscapes.'
          ]
    };
    setPrepDetails(details);
    setIsPrepModalOpen(true);
  };

  const handleSyncToCalendar = (platform) => {
    showToast(`Generating iCalendar instructions for ${platform}...`, 'success');
    setIsSyncModalOpen(false);
  };

  const upcomingInterviews = interviews
    .filter(i => i.status === 'Scheduled')
    .sort((a, b) => new Date(a.rawDateTime || a.date) - new Date(b.rawDateTime || b.date));
    
  const nextInterview = upcomingInterviews[0] || null;

  return (
    <div className="space-y-10 pb-12 animate-fade-in max-w-7xl mx-auto text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white dark:bg-slate-900 p-10 rounded-[3.5rem] border border-slate-50 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="hcm-page-title leading-none mb-2">UPCOMING INTERVIEWS</h1>
          <p className="text-slate-400 dark:text-slate-500 font-medium tracking-tight uppercase text-sm">Interview Schedule • <span className="text-slate-900 dark:text-white font-medium">Prepare for your next step</span></p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-50 dark:bg-slate-800 p-2 rounded-xl flex border border-slate-100 dark:border-slate-700">
            <button 
              onClick={() => setView('list')}
              className={cn("px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all", view === 'list' ? "bg-slate-900 dark:bg-primary-600 text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}
            >
              List View
            </button>
            <button 
              onClick={() => setView('calendar')}
              className={cn("px-6 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all", view === 'calendar' ? "bg-slate-900 dark:bg-primary-600 text-white shadow-xl" : "text-slate-400 hover:text-slate-600")}
            >
              Grid View
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="p-8 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 shadow-soft group hover:border-primary-100 transition-all text-left"
          >
            <div className="flex items-center gap-5">
              <div className={cn("p-4 rounded-2xl shadow-inner group-hover:scale-110 transition-transform", stat.bg, stat.color)}>
                <stat.icon size={26} />
              </div>
              <div>
                <p className="text-[10px] font-medium text-slate-400 font-bold leading-none mb-2">{stat.label}</p>
                <h3 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-white">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Focus Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Sidebar: Tactical Insights */}
        <div className="lg:col-span-4 space-y-10 lg:sticky lg:top-24">
          {nextInterview ? (
            <div className="p-10 rounded-[4rem] bg-primary-600 text-white border-none space-y-12 relative overflow-hidden group shadow-premium select-none">
              <div className="absolute -top-10 -right-10 w-48 h-48 bg-primary-600/20 rounded-full blur-3xl opacity-50 animate-pulse" />
              <div className="relative z-10 space-y-10">
                <div>
                  <div className="inline-block px-5 py-2 bg-white/10 backdrop-blur-xl rounded-xl text-[9px] font-medium uppercase tracking-[0.3em] mb-10 border border-white/5">
                    Interview Round: {nextInterview.round}
                  </div>
                  <h3 className="text-4xl font-bold tracking-tight leading-none mb-4 uppercase truncate">{nextInterview.role}</h3>
                  <p className="text-primary-200 font-medium text-lg truncate">{nextInterview.company}</p>
                </div>

                <div className="space-y-6 pt-6 border-t border-white/10">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary-200 shrink-0">
                      <Clock size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-white/40 mb-1">{nextInterview.date}</p>
                      <p className="text-2xl font-bold tracking-tight">{nextInterview.time} <span className="text-sm opacity-35 px-1 uppercase">{nextInterview.timezone}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-primary-200 shrink-0">
                      <User size={22} />
                    </div>
                    <div>
                      <p className="text-[10px] font-medium text-white/40 mb-1">Hiring Panel</p>
                      <p className="text-xl font-bold tracking-tight truncate max-w-[200px]">{nextInterview.interviewer || 'HR Panel'}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-10 flex gap-4">
                  <button 
                    onClick={() => handleJoin(nextInterview.link)}
                    className="w-full py-4 bg-white text-slate-900 rounded-[2rem] text-[10px] font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <Play size={18} fill="currentColor" /> Join Interview
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 rounded-[4rem] bg-slate-100 dark:bg-slate-800 text-center space-y-4">
               <Info className="text-slate-400 mx-auto" size={40} />
               <p className="text-sm font-bold text-slate-600 dark:text-slate-400">No upcoming interviews scheduled yet.</p>
            </div>
          )}

          <div className="card p-10 bg-white dark:bg-slate-900 shadow-soft rounded-[3.5rem] border border-slate-50 dark:border-slate-800 text-left">
            <h3 className="text-[10px] font-bold text-slate-400 font-bold mb-10 flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" size={16} /> Interview Checklist
            </h3>
            <div className="space-y-8">
              {[
                { tip: 'Check camera and microphone settings', done: true },
                { tip: 'Research company and interviewers', done: false },
                { tip: 'Prepare questions for the team', done: false },
                { tip: 'Review your resume and portfolio', done: true }
              ].map((item, i) => (
                <div key={i} className="flex gap-5 group items-center">
                  <div className={cn("w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0", item.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-slate-100 dark:border-slate-700 group-hover:border-primary-400")}>
                    {item.done && <Check size={14} strokeWidth={4} />}
                  </div>
                  <p className={cn("text-[11px] font-bold uppercase tracking-widest leading-relaxed", item.done ? "text-slate-400 line-through" : "text-slate-700 dark:text-slate-300")}>{item.tip}</p>
                </div>
              ))}
            </div>
            <button 
              onClick={() => {
                if (nextInterview) openPrepGuide(nextInterview);
                else showToast('No interview active for preparation guides', 'error');
              }}
              className="w-full mt-12 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[9px] font-bold font-bold rounded-xl hover:bg-primary-50 dark:hover:bg-primary-950/20 hover:text-primary-600 transition-all"
            >
              Open Prep Guide
            </button>
          </div>
        </div>

        {/* Main: Registry / Calendar View */}
        <div className="lg:col-span-8 space-y-10">
          {view === 'list' ? (
            <div className="card p-0 border-none bg-white dark:bg-slate-900 shadow-soft overflow-hidden rounded-[3.5rem]">
              <div className="flex items-center justify-between p-10 border-b border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-800/20">
                <div>
                  <h2 className="text-2xl font-medium text-slate-900 tracking-tight uppercase leading-none mb-2 dark:text-white">INTERVIEW LIST</h2>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">History of your past and upcoming interviews</p>
                </div>
              </div>
              
              <div className="overflow-x-auto text-left">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-850">
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Job / Company</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Date / Time</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">Round</th>
                      <th className="px-10 py-6 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {interviews.map((item) => (
                      <tr key={item.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setSelectedInterview(item)}>
                        <td className="px-10 py-8">
                          <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-xl bg-primary-600 text-white flex items-center justify-center font-bold text-sm shadow-xl group-hover:rotate-6 transition-transform shrink-0">
                              {item.company[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none uppercase tracking-tight truncate">{item.role}</p>
                              <p className="text-[10px] font-bold text-primary-600 mt-2 truncate">{item.company}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-center whitespace-nowrap">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tabular-nums uppercase">{item.date}</p>
                          <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">{item.time}</p>
                        </td>
                        <td className="px-10 py-8 text-center">
                          <div className="flex items-center gap-2 justify-center text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 py-1.5 rounded-xl border border-slate-100 dark:border-slate-700 whitespace-nowrap px-4">
                            {item.type?.includes('Video') ? <Video size={14} className="text-primary-400 shrink-0" /> : <MapPin size={14} className="text-primary-400 shrink-0" />}
                            <span className="text-[9px] font-bold uppercase tracking-wider">{item.round}</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <span className={cn(
                            "px-4 py-1.5 rounded-xl text-[9px] font-bold uppercase tracking-widest border ",
                            statusStyles[item.status] || 'bg-slate-50 text-slate-400'
                          )}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Compact Tactic Cards */}
              {interviews.map(item => (
                <div key={item.id} className="p-8 bg-white dark:bg-slate-900 border border-slate-50 dark:border-slate-800 rounded-[3rem] shadow-soft hover:shadow-xl transition-all group relative overflow-hidden cursor-pointer" onClick={() => setSelectedInterview(item)}>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 dark:bg-slate-800 -mr-16 -mt-16 rounded-full group-hover:scale-110 transition-transform" />
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center text-white font-bold shadow-xl">{item.company[0]}</div>
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest border ",
                      statusStyles[item.status]
                    )}>{item.status}</span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 uppercase tracking-tight mb-2 dark:text-white truncate">{item.role}</h4>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mb-8 truncate">{item.company}</p>
                  <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <CalendarDays size={14} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock size={14} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-[10px] font-semibold text-slate-400">{item.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Prep Guide Modal */}
      <CenterModal isOpen={isPrepModalOpen} onClose={() => setIsPrepModalOpen(false)} title="Interview Prep Guide" maxWidth="max-w-2xl">
        {prepDetails && (
          <div className="p-8 space-y-8 text-left">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-6 space-y-2">
              <span className="px-3 py-1 bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 rounded-lg text-[9px] font-bold uppercase tracking-wider border border-primary-100 dark:border-primary-900">
                Prep Module
              </span>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">{prepDetails.round}</h2>
              <p className="text-sm font-semibold text-slate-400">{prepDetails.role} at {prepDetails.company}</p>
            </div>

            <div className="space-y-6">
              <section className="space-y-3">
                 <h4 className="text-xs font-bold text-slate-400 font-bold flex items-center gap-2">
                    <Laptop size={14} className="text-primary-500" /> Focus Objectives
                 </h4>
                 <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {prepDetails.focusArea}
                 </p>
              </section>

              <section className="space-y-4">
                 <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={14} className="text-emerald-500" /> Action Checklist
                 </h4>
                 <div className="space-y-3">
                    {prepDetails.steps.map((step, idx) => (
                       <div key={idx} className="flex gap-4 items-start p-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">{idx + 1}</div>
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">{step}</p>
                       </div>
                    ))}
                 </div>
              </section>
            </div>

            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
               <button 
                 onClick={() => setIsPrepModalOpen(false)}
                 className="btn-primary px-8 py-3.5 shadow-xl text-xs font-bold"
               >
                  I'm Prepared
               </button>
            </div>
          </div>
        )}
      </CenterModal>

      {/* Interview Detail Modal */}
      <CenterModal isOpen={!!selectedInterview} onClose={() => setSelectedInterview(null)} title="Interview Details">
        {selectedInterview && (
          <div className="p-10 space-y-12 text-left">
            <div className="flex items-start gap-8 border-b border-slate-50 dark:border-slate-850 pb-10">
              <div className="w-20 h-20 rounded-[1.75rem] bg-primary-600 text-white flex items-center justify-center font-bold text-3xl shadow-2xl shrink-0">
                {selectedInterview.company[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-none truncate">{selectedInterview.role}</h2>
                <p className="text-sm font-bold text-primary-600 mt-3 flex items-center gap-3 truncate">
                  {selectedInterview.company} • Interview ID: {selectedInterview.id}
                </p>
                <div className="flex gap-4 mt-6">
                  <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-[9px] font-bold text-slate-400 uppercase whitespace-nowrap">{selectedInterview.round} Interview</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-10">
                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 font-bold mb-6 flex items-center gap-3 leading-none">
                    <Clock size={14} className="text-primary-600" /> Interview Time
                  </h3>
                  <div className="p-8 bg-slate-50 dark:bg-slate-950/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Date</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedInterview.date}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Time</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white uppercase">{selectedInterview.time} {selectedInterview.timezone}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Mode</span>
                      <span className="text-sm font-bold text-slate-900 dark:text-white uppercase flex items-center gap-2">
                        {selectedInterview.type} {selectedInterview.type?.includes('Video') && <Video size={14} className="text-primary-500" />}
                      </span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3 leading-none">
                    <User size={14} className="text-primary-600" /> Interviewer
                  </h3>
                  <div className="flex items-center gap-5 p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-soft">
                    <Avatar src={selectedInterview.interviewerImg || ''} alt={selectedInterview.interviewer} className="w-16 h-16 rounded-xl shadow-lg border-2 border-white dark:border-slate-700" />
                    <div>
                      <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none">{selectedInterview.interviewer || 'Hiring Lead'}</p>
                      <p className="text-[9px] font-bold text-primary-600 mt-2 uppercase">{selectedInterview.interviewerRole || 'Hiring Lead'}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-10">
                <section className="p-10 bg-primary-600 rounded-[3rem] text-white overflow-hidden relative shadow-premium flex flex-col justify-between h-full">
                  <div className="absolute top-0 right-0 p-8 opacity-10 blur-md">
                    <Zap size={140} fill="#fff" />
                  </div>
                  <div className="relative z-10 space-y-4">
                     <p className="text-xs font-bold text-primary-200 uppercase tracking-wider">Hiring Advisor</p>
                     <p className="text-sm font-medium text-white/95 leading-relaxed pl-4 border-l-2 border-primary-200">
                       "This company focuses on core values and technical proficiency. Be prepared to discuss your project history and scaling designs."
                     </p>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedInterview(null);
                      openPrepGuide(selectedInterview);
                    }}
                    className="w-full mt-8 py-4 bg-white/10 hover:bg-white text-white hover:text-slate-900 rounded-xl text-[9px] font-bold transition-all border border-white/10"
                  >
                    View Prep Guide
                  </button>
                </section>
              </div>
            </div>

            {selectedInterview.status === 'Scheduled' && (
              <div className="pt-10 flex gap-4 border-t border-slate-50 dark:border-slate-800">
                <button 
                  onClick={() => { setIsCancelModalOpen(true); }}
                  className="flex-1 py-5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl font-bold text-[10px] font-bold hover:bg-rose-100 dark:hover:bg-rose-900/30 transition-all active:scale-95 flex items-center justify-center gap-3 border border-rose-100 dark:border-rose-900"
                >
                  <VideoOff size={18} /> Reschedule Interview
                </button>
                <button 
                  onClick={() => { handleJoin(selectedInterview.link); }}
                  className="flex-2 py-5 bg-primary-600 text-white rounded-2xl font-bold text-[10px] font-bold shadow-xl shadow-primary-200 dark:shadow-none active:scale-95 flex items-center justify-center gap-3"
                >
                  <Play size={18} fill="currentColor" /> Join Interview
                </button>
              </div>
            )}
          </div>
        )}
      </CenterModal>

      {/* Reschedule Confirmation */}
      <CenterModal isOpen={isCancelModalOpen} onClose={() => setIsCancelModalOpen(false)} title="Reschedule Interview">
        <div className="p-10 text-center space-y-10">
          <div className="w-20 h-20 bg-rose-50 rounded-[2.5rem] flex items-center justify-center mx-auto text-rose-500 shadow-xl border border-rose-100 animate-pulse">
            <AlertCircle size={40} />
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4 uppercase dark:text-white">Confirm Rescheduling</h3>
            <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.1em] leading-relaxed max-w-sm mx-auto">This will notify <span className="text-slate-900 dark:text-white font-extrabold">{selectedInterview?.company}</span> that you would like to reschedule your interview.</p>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setIsCancelModalOpen(false)} className="flex-1 py-4 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-[1.5rem] font-bold text-[10px] font-bold">Cancel</button>
            <button onClick={() => { showToast('Reschedule request successfully dispatched!', 'success'); setIsCancelModalOpen(false); setSelectedInterview(null); }} className="flex-1 py-4 bg-rose-600 text-white rounded-[1.5rem] font-bold text-[10px] font-bold shadow-xl shadow-rose-200 active:scale-95">Send Request</button>
          </div>
        </div>
      </CenterModal>
    </div>
  );
};

// Internal icon for aesthetics
const CalendarHeart = ({ className, size = 24 }) => (
  <svg 
    width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}
  >
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3 10h14" /><path d="m21 10-1 1" /><path d="m20 18 1-1" />
  </svg>
);

export default InterviewSchedule;
