import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  ClipboardCheck, 
  AlertTriangle, 
  TrendingUp, 
  Plus, 
  Download, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ArrowUpRight,
  Target,
  LayoutGrid,
  BarChart3,
  Search,
  FileText,
  CalendarDays,
  X,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import ConfirmDialog from '../../shared/components/common/ConfirmDialog';
import DatePicker from '../../shared/components/common/DatePicker';
import StatCard from '../../shared/components/ui/StatCard';

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { dashboardData, dashboardLoading, teamMembers, leaveRequests, kpis, tasks, addTask, updateLeaveStatus, attendance, showToast } = useManager();

  // State Declarations
  const [activeChartTab, setActiveChartTab] = useState('this-week');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', employeeId: '', priority: 'Medium', dueDate: '' });
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('PDF Report');
  const [dateRange, setDateRange] = useState('Current Month');

  const handleDownloadReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowExportModal(false);
      showToast('Report generated successfully!', 'success');
    }, 2000);
  };

  const metrics = dashboardData?.metrics || {
    teamSize: teamMembers.length,
    presentToday: attendance?.filter(a => a.status === 'Present' || a.clockIn).length || 0,
    absentToday: Math.max(0, teamMembers.length - (attendance?.filter(a => a.status === 'Present' || a.clockIn).length || 0)),
    pendingLeaveApprovals: leaveRequests.filter(l => l.status === 'Pending').length,
    pendingReimbursements: 0
  };

  const stats = [
    { label: 'Team Size', value: metrics.teamSize, icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    { label: 'Present Today', value: metrics.presentToday, icon: UserCheck, color: 'text-emerald-600 dark:text-emerald-450', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Pending Approvals', value: metrics.pendingLeaveApprovals, icon: ClipboardCheck, color: 'text-amber-600 dark:text-amber-450', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Performance Alerts', value: dashboardData?.performanceAlerts?.length || kpis.filter(k => k.status === 'At Risk' || k.status === 'Delayed').length, icon: AlertTriangle, color: 'text-rose-600 dark:text-rose-455', bg: 'bg-rose-50 dark:bg-rose-950/20' },
  ];

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.employeeId) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    addTask({
      title: newTask.title,
      employeeId: newTask.employeeId,
      priority: newTask.priority,
      dueDate: newTask.dueDate || undefined
    });
    setShowTaskModal(false);
    setNewTask({ title: '', employeeId: '', priority: 'Medium', dueDate: '' });
    showToast('Task added and assigned successfully.');
  };

  const handleLeaveAction = (status) => {
    if (selectedLeave) {
      updateLeaveStatus(selectedLeave.id, status);
      setShowReviewModal(false);
      showToast(`Leave request ${status.toLowerCase()}ed.`);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Manager Dashboard</h1>
          <p className="hcm-page-subtitle">Monitor team productivity, approvals and performance in real-time</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowExportModal(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export Report</span>
          </button>
          <button 
            onClick={() => setShowTaskModal(true)}
            className="btn-primary flex items-center gap-2 shadow-xl shadow-primary-500/20"
          >
             <Plus size={18} />
             <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            color={stat.color}
            bg={stat.bg}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         {/* Team Attendance & Activity */}
         <div className="lg:col-span-8 space-y-8">
            <div className="card h-[400px] flex flex-col p-8 bg-white dark:bg-slate-900">
               <div className="flex items-center justify-between mb-10">
                  <div className="text-left">
                     <h3 className="hcm-section-heading">Team Attendance Overview</h3>
                     <p className="hcm-muted-text mt-1">Activity comparison across departments</p>
                  </div>
                  <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                     <button 
                       onClick={() => setActiveChartTab('this-week')}
                       className={cn("px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all", activeChartTab === 'this-week' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
                     >
                       This Week
                     </button>
                     <button 
                       onClick={() => setActiveChartTab('previous')}
                       className={cn("px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-lg transition-all", activeChartTab === 'previous' ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300")}
                     >
                       Previous
                     </button>
                  </div>
               </div>
               
               <div className="flex-1 flex items-end justify-between gap-8 px-4 mb-4">
                  {(dashboardData?.teamAttendanceTrends || [
                     { day: 'Mon', present: 0, total: 0 },
                     { day: 'Tue', present: 0, total: 0 },
                     { day: 'Wed', present: 0, total: 0 },
                     { day: 'Thu', present: 0, total: 0 },
                     { day: 'Fri', present: 0, total: 0 },
                     { day: 'Sat', present: 0, total: 0 },
                     { day: 'Sun', present: 0, total: 0 }
                  ]).map((d, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                        <div className="w-full relative flex items-end justify-center">
                           <div className="w-full max-w-[20px] bg-slate-100 dark:bg-slate-805 rounded-full h-40 relative overflow-hidden">
                              <motion.div 
                                initial={{ height: 0 }}
                                animate={{ height: d.total > 0 ? `${(d.present / d.total) * 100}%` : 0 }}
                                transition={{ type: 'spring', damping: 15 }}
                                className="absolute bottom-0 inset-x-0 bg-primary-600 rounded-full shadow-lg shadow-primary-500/20" 
                              />
                           </div>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold">{d.day}</span>
                     </div>
                  ))}
               </div>
            </div>

            {/* Recent Goal Tracking */}
             <div className="card p-0 overflow-hidden">
                <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <h3 className="hcm-section-heading flex items-center gap-3">
                      <Target className="text-primary-600 dark:text-primary-400" size={24} />
                      Goal Progress Summary
                   </h3>
                   <button onClick={() => navigate('/manager/kpi')} className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 hover:underline">View All Goals</button>
                </div>

                {kpis.length === 0 ? (
                   <div className="p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-4">
                         <Target className="text-slate-300 dark:text-slate-600" size={28} />
                      </div>
                      <p className="text-sm font-bold text-slate-400 dark:text-slate-500 mb-1">No goals set yet</p>
                      <p className="text-xs text-slate-400 dark:text-slate-600">Goals from KPI tracking will appear here</p>
                      <button onClick={() => navigate('/manager/kpi')} className="mt-5 px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl hover:bg-primary-700 transition-colors">
                         <Plus size={14} className="inline mr-1.5 -mt-0.5" />Add Goal
                      </button>
                   </div>
                ) : (
                   <div className="p-6 sm:p-8 bg-white dark:bg-slate-900">

                      {/* Goals Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                         {kpis.slice(0, 4).map((goal, i) => {
                            const statusColor = goal.status === 'At Risk' ? 'amber' : goal.status === 'Delayed' ? 'rose' : goal.status === 'Completed' ? 'indigo' : 'emerald';
                            const progress = goal.progress || 0;
                            return (
                               <motion.div 
                                  key={goal.id || i} 
                                  whileHover={{ scale: 1.01 }}
                                  className="p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all cursor-pointer group"
                                  onClick={() => navigate('/manager/kpi')}
                               >
                                  <div className="flex justify-between items-start gap-3 mb-3">
                                     <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 truncate">{goal.title}</p>
                                        {goal.assignedTo && (
                                           <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{goal.assignedTo}</p>
                                        )}
                                     </div>
                                     <span className={cn(
                                        "shrink-0 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg",
                                        statusColor === 'amber' && "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400",
                                        statusColor === 'rose' && "bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400",
                                        statusColor === 'indigo' && "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400",
                                        statusColor === 'emerald' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400",
                                     )}>
                                        {goal.status || 'On Track'}
                                     </span>
                                  </div>
                                  <div className="flex items-center gap-3">
                                     <div className="flex-1 h-2.5 bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                        <motion.div 
                                           initial={{ width: 0 }}
                                           animate={{ width: `${progress}%` }}
                                           transition={{ duration: 1, delay: i * 0.15, ease: 'easeOut' }}
                                           className={cn(
                                              "h-full rounded-full",
                                              statusColor === 'amber' && 'bg-amber-500',
                                              statusColor === 'rose' && 'bg-rose-500',
                                              statusColor === 'indigo' && 'bg-indigo-500',
                                              statusColor === 'emerald' && 'bg-emerald-500',
                                           )} 
                                        />
                                     </div>
                                     <span className={cn(
                                        "text-xs font-extrabold tabular-nums min-w-[36px] text-right",
                                        statusColor === 'amber' && 'text-amber-600 dark:text-amber-400',
                                        statusColor === 'rose' && 'text-rose-600 dark:text-rose-400',
                                        statusColor === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
                                        statusColor === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
                                     )}>
                                        {progress}%
                                     </span>
                                  </div>
                               </motion.div>
                            );
                         })}
                      </div>

                      {/* Show more indicator */}
                      {kpis.length > 4 && (
                         <button 
                            onClick={() => navigate('/manager/kpi')}
                            className="w-full mt-4 py-3 text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800/30 rounded-xl transition-colors flex items-center justify-center gap-1.5"
                         >
                            View all {kpis.length} goals <ChevronRight size={12} />
                         </button>
                      )}
                   </div>
                )}
              </div>
          </div>

         {/* Sidebar: Approvals & Analytics */}
         <div className="lg:col-span-4 space-y-8 flex flex-col">
            <div className="card p-8 bg-slate-900 dark:bg-slate-950 text-white border-none flex-1 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <ClipboardCheck size={100} />
               </div>
               <h3 className="text-xs font-bold text-primary-400 mb-8 text-left">Pending Approvals</h3>
               <div className="space-y-5 text-left">
                  {leaveRequests.filter(l => l.status === 'Pending').slice(0, 3).map((req, i) => (
                     <div 
                       key={i} 
                       onClick={() => { setSelectedLeave(req); setShowReviewModal(true); }}
                       className="group p-5 bg-white/5 border border-white/10 rounded-[1.8rem] hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
                     >
                        <div className="flex items-center gap-4 mb-4 text-left">
                           <Avatar src={req.img} alt={req.name} className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/10 shadow-sm" />
                           <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold truncate text-white">{req.name}</p>
                              <p className="text-[9px] font-bold text-slate-500 font-bold mt-0.5">{req.type}</p>
                           </div>
                        </div>
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] font-bold text-primary-400 uppercase tracking-widest flex items-center gap-1.5">
                              <Calendar size={12} />
                              {req.startDate}
                           </span>
                           <div className="text-[10px] font-black text-white uppercase tracking-[0.05em] flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-lg group-hover:bg-primary-600 transition-all">
                              Review <ArrowUpRight size={12} className="opacity-50" />
                           </div>
                        </div>
                     </div>
                  ))}
                  {leaveRequests.filter(l => l.status === 'Pending').length === 0 && (
                     <div className="py-12 text-center">
                        <CheckCircle2 className="mx-auto text-emerald-500 mb-4 opacity-60" size={40} />
                        <p className="text-sm font-bold text-slate-500">All cleared for today!</p>
                     </div>
                  )}
               </div>
               <button onClick={() => navigate('/manager/approvals')} className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl text-[10px] font-bold shadow-2xl hover:scale-[1.02] active:scale-95 transition-all">Go to Requests</button>
            </div>

            <div className="card p-8 text-left">
               <h3 className="hcm-section-heading mb-6 flex items-center gap-2">
                  <BarChart3 size={18} className="text-primary-600 dark:text-primary-400" />
                  Index Analytics
               </h3>
               <div className="space-y-6">
                  {[
                     { label: 'Team Efficiency', score: 94, color: 'text-indigo-600 dark:text-indigo-400' },
                     { label: 'Client Satisfaction', score: 88, color: 'text-blue-600 dark:text-blue-400' },
                     { label: 'Goal Velocity', score: 76, color: 'text-amber-600 dark:text-amber-400' },
                  ].map((dept, i) => (
                     <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold">{dept.label}</span>
                        <span className={cn("text-2xl font-black tracking-tighter", dept.color)}>{dept.score}%</span>
                     </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* --- Modals --- */}
      
      {/* Export Modal */}
      <CenterModal isOpen={showExportModal} onClose={() => !isGenerating && setShowExportModal(false)} title="Export Dashboard Analytics" maxWidth="max-w-md">
         <div className="p-8 space-y-6 text-left bg-white dark:bg-slate-900">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Select export format and date range for your team report.</p>
            <div className="grid grid-cols-2 gap-4">
               {['PDF Report', 'Excel Sheet', 'CSV Data'].map(format => {
                  const isActive = selectedFormat === format;
                  return (
                     <button 
                        key={format} 
                        type="button"
                        disabled={isGenerating}
                        onClick={() => setSelectedFormat(format)}
                        className={cn(
                           "flex flex-col items-center gap-3 p-6 rounded-3xl border transition-all group cursor-pointer", 
                           isActive 
                               ? "border-primary-500 bg-primary-50/20 dark:bg-primary-950/25 shadow-md scale-[1.02]" 
                               : "bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-750 hover:border-slate-200 dark:hover:border-slate-700"
                        )}
                     >
                        {format === 'PDF Report' && <FileText size={24} className={cn(isActive ? "text-rose-500 dark:text-rose-400" : "text-slate-400 dark:text-slate-500 group-hover:text-rose-400")} />}
                        {format === 'Excel Sheet' && <FileSpreadsheet size={24} className={cn(isActive ? "text-emerald-500 dark:text-emerald-450" : "text-slate-400 dark:text-slate-500 group-hover:text-emerald-400")} />}
                        {format === 'CSV Data' && <FileSpreadsheet size={24} className={cn(isActive ? "text-cyan-500 dark:text-cyan-455" : "text-slate-400 dark:text-slate-500 group-hover:text-cyan-400")} />}
                        <span className={cn("text-[10px] font-black uppercase tracking-widest transition-all", isActive ? "text-primary-700 dark:text-primary-400" : "text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white")}>{format}</span>
                     </button>
                  );
               })}
            </div>
            <div className="space-y-2">
               <label className="form-label text-[10px] font-bold mb-1.5 block">Date Range</label>
               <select 
                  value={dateRange}
                  onChange={e => setDateRange(e.target.value)}
                  disabled={isGenerating}
                  className="input-field h-14 font-bold"
               >
                  <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Current Month</option>
                  <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Last 3 Months</option>
                  <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Year to Date</option>
                  <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Custom Range</option>
               </select>
            </div>
            <button 
              type="button"
              disabled={isGenerating}
              onClick={handleDownloadReport}
              className="btn-primary w-full py-4 font-bold shadow-xl shadow-primary-500/20 active:scale-[0.98] disabled:bg-primary-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
               {isGenerating ? (
                  <>
                     <Loader2 size={18} className="animate-spin" />
                     {selectedFormat === 'PDF Report' ? 'Compiling PDF...' : 'Exporting...'}
                  </>
               ) : (
                  <>Download Report</>
               )}
            </button>
         </div>
      </CenterModal>

      {/* Add Task Modal */}
      <CenterModal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Assign New Task">
         <form onSubmit={handleAddTask} className="p-8 space-y-6 text-left bg-white dark:bg-slate-900">
            <div className="space-y-2">
               <label className="form-label text-[10px] font-bold mb-1.5 block">Task Title</label>
               <input 
                 type="text" 
                 placeholder="e.g. Design System Audit" 
                 className="input-field h-14 font-bold"
                 value={newTask.title}
                 onChange={e => setNewTask({...newTask, title: e.target.value})}
               />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="form-label text-[10px] font-bold mb-1.5 block">Assignee</label>
                  <select 
                    className="input-field h-14 font-bold"
                    value={newTask.employeeId}
                    onChange={e => setNewTask({...newTask, employeeId: e.target.value})}
                  >
                     <option value="" className="dark:bg-slate-900">Select Employee</option>
                     {teamMembers.map(m => <option key={m.id} value={m.id} className="dark:bg-slate-900">{m.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Due Date</label>
                  <DatePicker  
                    className="input-field h-14 font-bold"
                    value={newTask.dueDate}
                    onChange={e => setNewTask({...newTask, dueDate: e.target.value})}
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Priority</label>
               <div className="grid grid-cols-3 gap-4">
                  {['Low', 'Medium', 'High'].map(p => (
                     <button
                       key={p}
                       type="button"
                       onClick={() => setNewTask({...newTask, priority: p})}
                       className={cn(
                          "py-3 rounded-2xl text-xs font-bold transition-all border cursor-pointer",
                          newTask.priority === p 
                          ? "bg-slate-900 dark:bg-white border-slate-900 dark:border-white text-white dark:text-slate-900 shadow-xl" 
                          : "bg-slate-50 dark:bg-slate-800 border-slate-105 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-300"
                       )}
                     >
                        {p}
                     </button>
                  ))}
               </div>
            </div>
            <button type="submit" className="btn-primary w-full py-4 font-bold shadow-xl shadow-primary-500/20 mt-4">Create & Assign Task</button>
         </form>
      </CenterModal>

      {/* Leave Review Modal */}
      <CenterModal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title="Review Leave Request">
         {selectedLeave && (
            <div className="p-8 text-left bg-white dark:bg-slate-900">
               <div className="flex items-center gap-6 mb-10 pb-8 border-b border-slate-50 dark:border-slate-800 shrink-0">
                  <Avatar src={selectedLeave.img} alt={selectedLeave.name} className="w-20 h-20 rounded-3xl object-cover ring-4 ring-slate-50 dark:ring-slate-800" />
                  <div>
                     <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{selectedLeave.name}</h2>
                     <p className="text-sm font-bold text-slate-400 dark:text-slate-500 font-bold mt-1">{selectedLeave.type}</p>
                     <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-850 px-3 py-1 rounded-lg">
                           <Calendar size={14} /> {selectedLeave.startDate} — {selectedLeave.endDate}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-3 py-1 rounded-lg">
                           <Clock size={14} /> {selectedLeave.days} Days
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="space-y-8">
                  <div>
                     <label className="form-label text-[10px] font-bold mb-1.5 block">Reason for Leave</label>
                     <div className="p-6 bg-slate-50 dark:bg-slate-850 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium leading-relaxed italic">
                        "{selectedLeave.reason}"
                     </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-10">
                     <div>
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Available Balance</label>
                        <p className="text-xl font-black text-slate-900 dark:text-white">14 Days</p>
                     </div>
                     <div>
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Submitted On</label>
                        <p className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest">{selectedLeave.submittedAt}</p>
                     </div>
                  </div>

                  <div className="flex items-center gap-3 pt-6">
                     <button onClick={() => handleLeaveAction('Rejected')} className="btn-secondary flex-1 py-4 uppercase text-xs">Reject</button>
                     <button onClick={() => handleLeaveAction('Approved')} className="btn-success flex-1 py-4 uppercase text-xs">Approve</button>
                  </div>
                  <button className="w-full py-4 text-[10px] font-bold text-slate-450 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Request more information</button>
               </div>
            </div>
         )}
      </CenterModal>
    </div>
  );
};

export default ManagerDashboard;
