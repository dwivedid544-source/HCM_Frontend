import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, Calendar, Award, UserCircle, TrendingUp, Search, Plus, ExternalLink, 
  ChevronRight, Clock, Video, FileText, CheckCircle2, Info, ArrowUpRight, Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCandidate } from '../../context/CandidateContext';
import { useNavigate } from 'react-router-dom';
import CenterModal from '../../shared/components/layout/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';

const CandidateDashboard = () => {
  const { profile, applications, interviews, offers, showToast } = useCandidate();
  const navigate = useNavigate();
  const [selectedApp, setSelectedApp] = useState(null);
  const [requestedUpdates, setRequestedUpdates] = useState({});
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);

  const upcomingInterviews = interviews.filter(iv => iv.status === 'Scheduled').sort((a, b) => {
    const dateA = a.rawDateTime ? new Date(a.rawDateTime) : new Date(a.date);
    const dateB = b.rawDateTime ? new Date(b.rawDateTime) : new Date(b.date);
    return dateA - dateB;
  });

  const recentApplications = applications.filter(app => new Date(app.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length;

  const offersCount = offers ? offers.length : 0;
  const recentOffers = offers ? offers.filter(o => new Date(o.createdAt || o.sentDate) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length : 0;

  const shortlistsCount = applications.filter(a => ['Shortlisted', 'Interview', 'Offer', 'Offer Accepted', 'Hired'].includes(a.status)).length;
  
  // Add base views for historical data if the candidate was already shortlisted before tracking started
  const historicalBase = shortlistsCount > 0 ? 1 : 0;
  const recruiterViews = (profile.profileViews || 0) + historicalBase;
  const resumeDownloads = (profile.resumeDownloads || 0) + historicalBase;

  const recentVisits = applications
    .filter(a => a.status !== 'Rejected' && a.status !== 'Applied')
    .slice(0, 3)
    .map(a => ({
      company: a.company || 'GlobalTech Solutions',
      industry: a.role || 'Recruiting Team',
      time: a.date
    }));

  if (recentVisits.length === 0) {
    recentVisits.push(
      { company: 'GlobalTech Solutions', industry: 'SaaS & Enterprise Tech', time: '2 hours ago' },
      { company: 'FinEdge Corp', industry: 'Fintech / Banking', time: '1 day ago' },
      { company: 'CloudScale Inc', industry: 'Cloud & Infrastructure', time: '3 days ago' }
    );
  }

  const requiredFields = ['fullName', 'email', 'phone', 'location', 'resumeUrl', 'skills'];
  const filledFields = requiredFields.filter(field => {
    const val = profile[field];
    if (Array.isArray(val)) return val.length > 0;
    return val && String(val).trim().length > 0;
  });
  const completionPercentage = Math.round((filledFields.length / requiredFields.length) * 100);

  const stats = [
    {
      title: 'Applied Jobs',
      value: applications.length,
      trend: recentApplications > 0 ? `+${recentApplications} this week` : 'No recent applications',
      icon: Briefcase,
      color: 'blue',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      title: 'Interviews Scheduled',
      value: upcomingInterviews.length,
      trend: upcomingInterviews.length > 0 ? `Next: ${upcomingInterviews[0].date}` : 'None scheduled',
      icon: Calendar,
      color: 'purple',
      bg: 'bg-purple-50 dark:bg-purple-950/20',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      title: 'Offers Received',
      value: offersCount,
      trend: recentOffers > 0 ? `+${recentOffers} this week` : 'No recent offers',
      icon: Award,
      color: 'green',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      title: 'Profile Completion',
      value: `${completionPercentage}%`,
      trend: completionPercentage === 100 ? 'Fully optimized' : 'Complete fields to reach 100%',
      icon: UserCircle,
      color: 'orange',
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      iconColor: 'text-orange-600 dark:text-orange-400',
      isProgress: true,
      rawPercentage: completionPercentage
    }
  ];

  const handleJoinMeeting = (link) => {
    showToast('Joining secure meeting session...');
    window.open(link, '_blank');
  };

  const handleRequestUpdate = (appId) => {
    setRequestedUpdates(prev => ({ ...prev, [appId]: true }));
    showToast('Status update request submitted to hiring team.', 'success');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="hcm-page-title">Candidate Dashboard</h1>
          <p className="hcm-page-subtitle">Welcome Back, {profile.fullName?.split(' ')[0] || 'Candidate'}!</p>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card transition-all"
          >
            <div className="flex items-center gap-4 text-left">
              <div className={cn("p-3 rounded-2xl bg-opacity-100 dark:bg-opacity-10", stat.bg, stat.iconColor)}>
                <stat.icon size={26} />
              </div>
              <div className="flex-1 w-full">
                <p className="card-title mb-1.5">{stat.title}</p>
                <h3 className="card-value mt-0">{stat.value}</h3>
                {stat.isProgress ? (
                  <div className="mt-2">
                    <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-950 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-[1px]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.rawPercentage || 0}%` }}
                        className="h-full bg-orange-500 rounded-full"
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                    <p className="card-desc mt-1.5">{stat.trend}</p>
                  </div>
                ) : (
                  <p className="card-desc mt-1.5">{stat.trend}</p>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Recent Applications */}
        <div className="lg:col-span-8 space-y-8">
          <div className="hcm-table-container">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="hcm-section-heading flex items-center gap-3">
                <Briefcase className="text-primary-600" size={24} />
                Recent Applications
              </h3>
              <button onClick={() => navigate('/candidate/applications')} className="text-[10px] font-extrabold text-primary-600 hover:underline">
                View Full History
              </button>
            </div>
            
            <div className="overflow-x-auto text-left">
              <table className="hcm-table">
                <thead className="hcm-thead">
                  <tr>
                    <th className="hcm-th px-6">Job Role</th>
                    <th className="hcm-th px-6 text-center">Applied On</th>
                    <th className="hcm-th px-6 text-center">Application Status</th>
                    <th className="hcm-th px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {applications.slice(0, 4).map((app) => (
                    <tr key={app.id} className="hcm-tr cursor-pointer" onClick={() => setSelectedApp(app)}>
                      <td className="hcm-td px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center font-medium">
                            {app.company.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{app.role}</p>
                            <p className="text-[10px] font-medium text-slate-600 dark:text-slate-500 mt-1">{app.company}</p>
                          </div>
                        </div>
                      </td>
                      <td className="hcm-td px-6 py-4 text-center">
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums uppercase">{app.date}</p>
                      </td>
                      <td className="hcm-td px-6 py-4 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest",
                          app.status === 'Shortlisted' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" :
                          app.status === 'Interview' ? "bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400" :
                          app.status === 'Under Review' ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        )}>
                          {app.status}
                        </span>
                      </td>
                      <td className="hcm-td px-6 py-4 text-right">
                        <button className="p-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-primary-600 hover:scale-110 rounded-xl shadow-sm transition-all">
                          <ExternalLink size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-10 overflow-hidden relative group flex flex-col justify-end min-h-[250px] text-left">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 pointer-events-none text-slate-900 dark:text-white">
                <FileText size={250} />
              </div>
              <div className="relative z-10 transition-transform duration-500 group-hover:-translate-y-2">
                <h3 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight leading-none mb-4">Resume Builder</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-10 leading-relaxed max-w-[250px]">Use our AI-driven builder to optimize your professional profile.</p>
                <button onClick={() => navigate('/candidate/resume')} className="btn-primary w-full py-4 shadow-xl shadow-primary-200 dark:shadow-none flex items-center justify-center gap-3">
                  Improve Resume <Plus size={16} />
                </button>
              </div>
            </div>
        
            {/* Clickable Profile Analytics Card */}
            <div 
              onClick={() => setIsAnalyticsOpen(true)}
              className="card p-10 flex flex-col justify-between group text-left cursor-pointer hover:shadow-2xl border hover:border-primary-100 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h3 className="hcm-section-heading leading-none">Profile Analytics</h3>
                  <div className="p-3 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl group-hover:scale-110 transition-transform">
                    <TrendingUp size={22} />
                  </div>
                </div>
                <p className="card-title mb-2">Weekly Metric</p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed">
                  Your professional profile has been viewed by <span className="text-slate-900 dark:text-white font-bold">{recruiterViews} recruiters</span> in this cycle.
                </p>
              </div>
              <div className="mt-10 p-5 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800 group-hover:bg-white dark:group-hover:bg-slate-800 transition-all group-hover:shadow-xl group-hover:border-transparent">
                <div className="flex -space-x-3">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-10 h-10 rounded-xl border-4 border-white dark:border-slate-900 overflow-hidden shadow-lg transform hover:scale-110 transition-transform cursor-pointer relative z-[10] flex items-center justify-center">
                      <Avatar src="" alt="lead" className="w-full h-full" />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold text-primary-600 font-bold hover:underline flex items-center gap-1">
                  Full Report <ArrowUpRight size={14} />
                </span>
              </div>
            </div>
          </div>
        </div>
      
        {/* Right: Sidebar content */}
        <div className="lg:col-span-4 space-y-8">
          {/* Upcoming Interviews */}
          <div className="card text-left">
            <div className="flex items-center justify-between mb-8">
              <h3 className="hcm-section-heading flex items-center gap-3">
                <Calendar size={24} className="text-primary-600" />
                Upcoming Interviews
              </h3>
            </div>
            
            <div className="space-y-6">
              {upcomingInterviews.length > 0 ? upcomingInterviews.map((interview) => (
                <div key={interview.id} className="p-6 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 group/item hover:bg-white dark:hover:bg-slate-900 hover:border-transparent hover:shadow-xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[10px] font-medium text-primary-600 dark:text-primary-400 leading-none mb-3">{interview.date} @ {interview.time}</p>
                      <h4 className="text-lg font-medium text-slate-900 dark:text-white tracking-tight leading-none">{interview.company}</h4>
                      <p className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-2 px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-md inline-block">{interview.round}</p>
                    </div>
                    <div className="w-12 h-12 rounded-[1.25rem] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-350 dark:text-slate-600 group-hover/item:text-primary-600 group-hover/item:scale-110 transition-all shadow-sm">
                      <Video size={22} />
                    </div>
                  </div>
                  <button 
                    onClick={() => handleJoinMeeting(interview.link)}
                    className="btn-primary w-full py-4 shadow-xl shadow-primary-200 dark:shadow-none"
                  >
                    Join Interview
                  </button>
                </div>
              )) : (
                <div className="py-12 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl text-center flex flex-col items-center">
                  <Clock size={32} className="text-slate-200 dark:text-slate-700 mb-4 animate-pulse" />
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500">No Active Sessions</p>
                </div>
              )}
            </div>
            <button 
              onClick={() => navigate('/candidate/interviews')}
              className="w-full mt-8 py-3 text-[10px] font-medium text-slate-400 dark:text-slate-500 font-bold hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              Browse Full Schedule
            </button>
          </div>
      
          {/* Quick Actions */}
          <div className="card text-left">
            <h3 className="hcm-section-heading mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              {[
                { label: 'Optimize Resume', icon: FileText, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20', path: '/candidate/resume' },
                { label: 'Finalize Profile', icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20', path: '/candidate/settings' },
                { label: 'Strategic Search', icon: Search, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/20', path: '/candidate/jobs' },
              ].map((action, idx) => (
                <button 
                  key={idx} 
                  onClick={() => navigate(action.path)}
                  className="flex items-center gap-4 p-5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-transparent hover:bg-white dark:hover:bg-slate-900 hover:shadow-xl transition-all group w-full text-left bg-slate-50/50 dark:bg-slate-950/40"
                >
                  <div className={cn("p-3 rounded-xl transition-transform group-hover:rotate-12 bg-opacity-100 dark:bg-opacity-10", action.bg, action.color)}>
                    <action.icon size={18} />
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{action.label}</span>
                  <ChevronRight size={16} className="ml-auto text-slate-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      <CenterModal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="Application Details">
        {selectedApp && (
          <div className="p-10 space-y-10 text-left bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-8 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-primary-600 rounded-xl flex items-center justify-center text-white text-xl font-medium shadow-2xl">
                  {selectedApp.company?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-2xl font-medium text-slate-900 dark:text-white tracking-tight leading-none">{selectedApp.role}</h2>
                  <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-2">{selectedApp.company} • Applied {selectedApp.date}</p>
                </div>
              </div>
              <span className={cn(
                "px-5 py-2 rounded-2xl text-[10px] font-bold uppercase tracking-widest border",
                selectedApp.status === 'Shortlisted' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900" : "bg-primary-50 text-primary-600 border-primary-100 dark:bg-primary-950/30 dark:text-primary-400 dark:border-primary-900"
              )}>{selectedApp.status}</span>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-medium text-slate-450 dark:text-slate-500 font-bold mb-4 leading-none">Process Timeline</h4>
              <div className="relative space-y-10 pl-10 border-l-2 border-slate-100 dark:border-slate-800 ml-4">
                {selectedApp.timeline?.map((step, i) => (
                  <div key={i} className="relative">
                    <div className={cn(
                      "absolute -left-[50px] top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 shadow-lg",
                      i === selectedApp.timeline.length - 1 ? "bg-primary-600 scale-125" : "bg-slate-200 dark:bg-slate-700"
                    )} />
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white tracking-tight">{step.status}</p>
                      <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-1">Last Updated: {step.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedApp.feedback ? (
              <div className="p-8 bg-slate-50 dark:bg-slate-950 rounded-[2.5rem] border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Info size={18} className="text-primary-600" />
                    <span className="text-[10px] font-medium text-slate-900 dark:text-white leading-none">Recruiter Feedback</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">"{selectedApp.feedback}"</p>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <p className="text-xs font-medium text-slate-500">No feedback available yet.</p>
              </div>
            )}

            <div className="pt-4 flex gap-4">
              <button onClick={() => setSelectedApp(null)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-medium text-[10px]">Close</button>
              {selectedApp.status !== 'Rejected' && (
                <button 
                  onClick={() => handleRequestUpdate(selectedApp.id)} 
                  disabled={requestedUpdates[selectedApp.id]}
                  className={cn(
                    "flex-2 py-4 rounded-xl font-medium text-[10px] shadow-xl transition-all",
                    requestedUpdates[selectedApp.id]
                      ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none"
                      : "bg-primary-600 text-white shadow-primary-200 dark:shadow-none hover:bg-primary-700"
                  )}
                >
                  {requestedUpdates[selectedApp.id] ? 'Update Requested' : 'Request Status Update'}
                </button>
              )}
            </div>
          </div>
        )}
      </CenterModal>

      {/* Profile Analytics Modal */}
      <CenterModal isOpen={isAnalyticsOpen} onClose={() => setIsAnalyticsOpen(false)} title="Profile Analytics Report">
        <div className="p-10 space-y-8 text-left bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Profile Views & Engagement</h2>
              <p className="text-sm text-slate-600">Performance insights for your profile</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 rounded-xl">
              <TrendingUp size={24} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 font-bold block">Recruiter Views</span>
              <span className="text-2xl font-extrabold text-slate-950 dark:text-white block mt-1">{recruiterViews}</span>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 block">▲ {Math.round(recruiterViews * 0.15)}% vs last week</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Resume Downloads</span>
              <span className="text-2xl font-extrabold text-slate-950 dark:text-white block mt-1">{resumeDownloads}</span>
              <span className="text-[10px] text-emerald-500 font-bold mt-1 block">▲ {Math.round(resumeDownloads * 0.1)}% vs last week</span>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Shortlists</span>
              <span className="text-2xl font-extrabold text-slate-950 dark:text-white block mt-1">{shortlistsCount}</span>
              <span className="text-[10px] text-slate-500 font-bold mt-1 block">{shortlistsCount > 0 ? '▲ Active' : '▬ Stable'}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recent Profile Visits</h3>
            <div className="space-y-3">
              {recentVisits.map((visit, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-955 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{visit.company}</h4>
                    <p className="text-[10px] font-medium text-slate-600 mt-0.5">{visit.industry}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                    <Clock size={12} /> {visit.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4">
            <button onClick={() => setIsAnalyticsOpen(false)} className="btn-secondary w-full py-4 rounded-xl font-bold text-sm">
              Close Report
            </button>
          </div>
        </div>
      </CenterModal>
    </div>
  );
};

export default CandidateDashboard;
