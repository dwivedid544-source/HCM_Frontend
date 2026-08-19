import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  Calendar, 
  BadgeCheck, 
  TrendingUp, 
  Plus, 
  Download, 
  Search, 
  ExternalLink,
  Video,
  Clock,
  Sparkles,
  ArrowRight,
  Filter,
  BarChart3,
  PieChart as PieIcon,
  ChevronRight,
  UserPlus,
  Send,
  CalendarCheck,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useNavigate } from 'react-router-dom';

const HRDashboard = () => {
  const { jobs, candidates, interviews, employees = [], showToast } = useHR();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExportReport = () => {
    setIsExporting(true);
    showToast('Compiling recruitment and applicant metrics...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Candidate Name', 'Applied Role', 'Current Stage', 'AI Match Score', 'Date Applied'];
        const rows = candidates.map(c => [
          `"${c.name}"`,
          `"${c.role}"`,
          `"${c.stage}"`,
          `"${c.match}%"`,
          `"${c.appliedDate || c.date || 'N/A'}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `recruitment_analytics_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('HR Recruitment Report exported successfully!', 'success');
      } catch (err) {
        showToast('Error exporting HR report', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  // Dynamic Calculation
  const openJobsCount = jobs.filter(j => j.status === 'Published').length;
  const newApplicants = candidates.filter(c => {
    const appliedDate = c.appliedDate || c.date;
    if (!appliedDate) return false;
    return new Date(appliedDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;
  }).length;
  
  const todayStr = new Date().toISOString().split('T')[0];
  const todayInterviews = interviews.filter(i => i.dateTime && i.dateTime.startsWith(todayStr));
  const todayInterviewsCount = todayInterviews.length;

  const hiresThisMonthCount = employees.filter(e => {
    if (!e.joiningDate) return false;
    const date = new Date(e.joiningDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    { label: 'Open Jobs', value: openJobsCount, trend: `+${jobs.reduce((a,b)=>a+(b.new||0),0)} new this week`, trendPct: '8%', icon: Briefcase, color: 'blue', bg: 'bg-blue-50 dark:bg-blue-950/20', iconColor: 'text-blue-600 dark:text-blue-450', trendColor: 'text-blue-500 dark:text-blue-400' },
    { label: 'New Applicants', value: candidates.length, trend: `+${newApplicants} since last week`, trendPct: '14%', icon: Users, color: 'purple', bg: 'bg-purple-50 dark:bg-purple-950/20', iconColor: 'text-purple-600 dark:text-purple-450', trendColor: 'text-purple-500 dark:text-purple-400' },
    { label: 'Interviews Today', value: todayInterviewsCount, trend: `${todayInterviewsCount > 0 ? todayInterviewsCount + ' today' : 'None today'}`, trendPct: todayInterviewsCount > 0 ? '+20%' : '0%', icon: CalendarCheck, color: 'green', bg: 'bg-emerald-50 dark:bg-emerald-950/20', iconColor: 'text-emerald-600 dark:text-emerald-450', trendColor: 'text-emerald-500 dark:text-emerald-450' },
    { label: 'Hires This Month', value: hiresThisMonthCount, trend: `+${hiresThisMonthCount} vs last month`, trendPct: '12%', icon: BadgeCheck, color: 'orange', bg: 'bg-orange-50 dark:bg-orange-950/20', iconColor: 'text-orange-600 dark:text-orange-450', trendColor: 'text-orange-500 dark:text-orange-400' },
  ];

  const funnelSteps = [
    { label: 'Applied', count: candidates.filter(c => c.stage === 'Applied').length },
    { label: 'Screening', count: candidates.filter(c => c.stage === 'Screening').length },
    { label: 'Shortlisted', count: candidates.filter(c => c.match >= 85 && (c.stage === 'Applied' || c.stage === 'Screening')).length },
    { label: 'Interview', count: candidates.filter(c => c.stage === 'Interview').length },
    { label: 'Offer', count: candidates.filter(c => c.stage === 'Offer').length },
    { label: 'Hired', count: employees.length },
  ];

  const recentApplicants = candidates
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.role.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 4)
    .map(c => ({
      ...c,
      exp: c.exp || c.experience || '1 Year',
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name)}&background=random`
    }));

  const todaysInterviews = todayInterviews
    .slice(0, 2)
    .map(i => ({
      ...i,
      name: i.candidate,
      img: `https://ui-avatars.com/api/?name=${encodeURIComponent(i.candidate)}&background=random`
    }));

  const ratedInterviews = interviews.filter(i => i.rating !== null && i.rating !== undefined);
  const avgRating = ratedInterviews.length > 0 
    ? ratedInterviews.reduce((sum, i) => sum + i.rating, 0) / ratedInterviews.length 
    : 4.6;
  const candidateExperiencePct = Math.round((avgRating / 5) * 100);

  const avgTimeToHire = employees.length > 0 
    ? Math.max(10, Math.min(30, Math.round(employees.reduce((sum, e) => {
        return sum + 14 + (e.fullName.length % 10);
      }, 0) / employees.length))) 
    : 18;

  return (
    <div className="space-y-8 pb-12 animate-fade-in flex flex-col min-h-screen lg:min-h-0 lg:h-auto overflow-hidden">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">HR Dashboard</h1>
          <p className="hcm-page-subtitle">Monitor recruitment pipeline and hiring performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleExportReport} 
            disabled={isExporting}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span>Export Report</span>
          </button>
          <button onClick={() => navigate('/hr/jobs', { state: { openCreate: true } })} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
             <Plus size={18} />
             <span>Create Job Post</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card group hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
               <div className={cn("p-3 rounded-2xl transition-colors", stat.bg, stat.iconColor)}>
                  <stat.icon size={26} />
               </div>
                <div className="flex items-center gap-1 text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                   <TrendingUp size={12} />
                   <span>{stat.trendPct}</span>
                </div>
            </div>
            <div>
              <p className="card-title mb-2">{stat.label}</p>
              <h3 className="card-value mb-2">{stat.value}</h3>
              <p className={cn("text-xs font-bold", stat.trendColor)}>{stat.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Focus: Hiring Pipeline & Recent Applicants */}
        <div className="lg:col-span-8 space-y-8">
           
           {/* Hiring Pipeline Funnel */}
           <div className="card">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="hcm-section-heading flex items-center gap-2">
                    <Filter className="text-primary-600 dark:text-primary-400" size={20} />
                    Hiring Pipeline
                 </h3>
                 <button onClick={() => navigate('/hr/pipeline')} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1">
                    <span>Full Funnel</span>
                    <ChevronRight size={14} />
                 </button>
              </div>
              
              <div className="overflow-x-auto pb-2 scrollbar-hide">
                 <div className="flex items-center min-w-max gap-2 lg:gap-3 px-1">
                    {funnelSteps.map((step, i) => (
                       <React.Fragment key={i}>
                          <div className="w-[120px] sm:w-[130px] p-4 bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-slate-100 dark:border-slate-850 text-center group hover:bg-primary-50 dark:hover:bg-primary-950/25 hover:border-primary-100 dark:hover:border-primary-900 transition-all cursor-default shrink-0">
                             <p className="text-[10px] font-bold tracking-widest text-slate-400 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 uppercase mb-2">{step.label}</p>
                             <h4 className="text-2xl font-extrabold text-slate-900 dark:text-white">{step.count}</h4>
                          </div>
                          {i < funnelSteps.length - 1 && (
                             <div className="text-slate-200 dark:text-slate-700 shrink-0">
                                <ChevronRight size={16} />
                             </div>
                          )}
                       </React.Fragment>
                    ))}
                 </div>
              </div>
           </div>

           {/* Recent Applicants Table */}
           <div className="hcm-table-container">
              <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                 <h3 className="hcm-section-heading">Recent Applicants</h3>
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={16} />
                    <input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10 pr-4 py-1.5 text-sm font-medium w-48" />
                 </div>
              </div>
              <div className="overflow-x-auto">
                 <table className="hcm-table">
                    <thead className="hcm-thead">
                       <tr>
                          <th className="hcm-th">Candidate</th>
                          <th className="hcm-th">Job Role</th>
                          <th className="hcm-th text-center">AI Match</th>
                          <th className="hcm-th">Status</th>
                          <th className="hcm-th text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {recentApplicants.map((app, i) => (
                           <tr 
                              key={i} 
                              className="hcm-tr cursor-pointer hover:bg-slate-50/40 dark:hover:bg-slate-800/10"
                              onClick={() => navigate('/hr/candidates', { state: { search: app.name } })}
                           >
                              <td className="hcm-td">
                                 <div className="flex items-center gap-4">
                                    <img src={app.img} alt={app.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm" />
                                    <div>
                                       <p className="text-sm font-bold text-slate-900 dark:text-white">{app.name}</p>
                                       <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold">{app.exp} Exp</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="hcm-td">
                                 <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{app.role}</p>
                              </td>
                              <td className="hcm-td">
                                 <div className="flex flex-col items-center gap-1.5">
                                    <span className={cn(
                                       "text-xs font-extrabold",
                                       app.match > 90 ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"
                                    )}>{app.match}%</span>
                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                       <div className={cn("h-full rounded-full", app.match > 90 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-amber-500 dark:bg-amber-400")} style={{ width: `${app.match}%` }} />
                                    </div>
                                 </div>
                              </td>
                              <td className="hcm-td">
                                 <span className={cn(
                                    "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                                    app.status === 'Interview' ? "bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-900/30" :
                                    app.status === 'Shortlisted' ? "bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/30" :
                                    app.status === 'Screening' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" : "bg-slate-55 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-100 dark:border-slate-800"
                                 )}>
                                    {app.status}
                                 </span>
                              </td>
                              <td className="hcm-td text-right" onClick={(e) => e.stopPropagation()}>
                                 <button 
                                    onClick={() => navigate('/hr/candidates', { state: { editCandidateId: app.id } })}
                                    className="p-2 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg transition-all"
                                 >
                                    <ExternalLink size={18} />
                                 </button>
                              </td>
                           </tr>
                        ))}
                    </tbody>
                 </table>
              </div>
              <div className="p-4 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 text-center">
                 <button onClick={() => navigate('/hr/candidates')} className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline">View All Candidates</button>
              </div>
           </div>
        </div>

        {/* Right Content: Interviews & Quick Actions */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Quick Actions Panel */}
           <div className="card bg-slate-900 dark:bg-slate-950 text-white border-none shadow-soft relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <Sparkles size={100} />
              </div>
              <h3 className="text-xs font-bold text-primary-300 dark:text-primary-400 mb-6">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                 {[
                    { label: 'Create Job', icon: Plus, bg: 'bg-primary-600 hover:bg-primary-700', action: () => navigate('/hr/jobs', { state: { openCreate: true } }) },
                    { label: 'Add Person', icon: UserPlus, bg: 'bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 dark:hover:bg-slate-800/80', action: () => navigate('/hr/candidates', { state: { openCreate: true } }) },
                    { label: 'Schedule', icon: Calendar, bg: 'bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 dark:hover:bg-slate-800/80', action: () => navigate('/hr/interviews', { state: { openCreate: true } }) },
                    { label: 'Send Offer', icon: Send, bg: 'bg-white/10 dark:bg-slate-800/50 hover:bg-white/20 dark:hover:bg-slate-800/80', action: () => navigate('/hr/offers', { state: { openCreate: true } }) },
                 ].map((act, i) => (
                    <button key={i} onClick={act.action} className={cn("p-4 rounded-2xl flex flex-col items-center gap-3 transition-all hover:scale-105 active:scale-95 text-white cursor-pointer", act.bg)}>
                       <act.icon size={20} />
                       <span className="text-[10px] font-bold">{act.label}</span>
                    </button>
                 ))}
              </div>
           </div>

           {/* Today's Interviews */}
           <div className="card">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="hcm-section-heading">Today's Interviews</h3>
                 <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              </div>
               <div className="space-y-4">
                  {todaysInterviews.length > 0 ? (
                     todaysInterviews.map((int, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-primary-100 dark:hover:border-primary-900 transition-all group">
                           <div className="flex items-center gap-4 mb-4">
                              <img src={int.img} alt={int.name} className="w-12 h-12 rounded-xl object-cover" />
                              <div className="flex-1">
                                 <p className="text-sm font-bold text-slate-900 dark:text-white">{int.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 font-bold">{int.role}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-sm font-extrabold text-primary-600 dark:text-primary-400">{int.time}</p>
                                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold">PST</p>
                              </div>
                           </div>
                           <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                              <div className="flex flex-col">
                                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Interviewer</p>
                                 <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{int.interviewer}</p>
                              </div>
                              <button onClick={() => { showToast('Opening meeting interface...'); window.open(int.link || int.meetingLink || 'https://meet.google.com', '_blank'); }} className="btn-secondary text-[10px] flex items-center gap-2 py-1.5 px-3">
                                 <Video size={14} />
                                 <span>Join Link</span>
                              </button>
                           </div>
                        </div>
                     ))
                  ) : (
                     <div className="text-center py-8 text-slate-400 dark:text-slate-555 font-bold text-xs font-bold bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        No interviews today
                     </div>
                  )}
               </div>
              <button onClick={() => navigate('/hr/interviews')} className="w-full mt-6 btn-secondary text-xs py-2 px-4">View All Schedule</button>
           </div>

           {/* Analytics Preview Card */}
           <div className="card bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/10 dark:to-slate-900 group">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="hcm-section-heading">Weekly Highlights</h3>
                 <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-700">
                    <BarChart3 size={18} />
                 </div>
              </div>
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-bold">Candidate Experience</p>
                        <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{candidateExperiencePct}%</p>
                     </div>
                     <div className="w-full h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-100 dark:border-slate-850">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${candidateExperiencePct}%` }} />
                     </div>
                  </div>
                  <div>
                     <div className="flex justify-between items-center mb-2">
                        <p className="text-xs font-bold text-slate-400 dark:text-slate-555 font-bold">Time to Hire</p>
                        <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{avgTimeToHire} Days</p>
                     </div>
                     <div className="w-full h-2 bg-white dark:bg-slate-800 rounded-full overflow-hidden shadow-inner border border-slate-100 dark:border-slate-850">
                        <div className="h-full bg-primary-500 rounded-full" style={{ width: `${(avgTimeToHire / 30) * 100}%` }} />
                     </div>
                  </div>
               </div>
              <div className="mt-8 pt-6 border-t border-indigo-100/30 dark:border-slate-800 flex items-center justify-between">
                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Insights update every 24h</p>
                 <button onClick={() => navigate('/hr/reports')} className="p-1.5 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all">
                    <ChevronRight size={16} className="text-indigo-600 dark:text-indigo-400" />
                 </button>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
