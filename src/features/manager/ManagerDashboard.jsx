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

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const { teamMembers, leaveRequests, kpis, tasks, addTask, updateLeaveStatus, attendance, showToast } = useManager();
  
  // States
  const [activeChartTab, setActiveChartTab] = useState('this-week');
  const [showExportModal, setShowExportModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);

  const [selectedFormat, setSelectedFormat] = useState('PDF Report');
  const [dateRange, setDateRange] = useState('Current Month');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadReport = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      try {
        if (selectedFormat === 'PDF Report') {
          const printWindow = window.open('', '_blank');
          if (!printWindow) throw new Error('Popup blocked');
          
          const teamListHtml = teamMembers.map(m => `
            <tr>
              <td>${m.name}</td>
              <td>${m.role}</td>
              <td>${m.department}</td>
              <td class="amount">${m.status}</td>
            </tr>
          `).join('');

          const kpiListHtml = kpis.map(k => `
            <tr>
              <td>${k.title}</td>
              <td>${k.status}</td>
              <td class="amount">${k.progress}%</td>
            </tr>
          `).join('');

          const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
              <title>Team Analytics Report - ${dateRange}</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
import DatePicker from '../../shared/components/common/DatePicker';
                body { font-family: 'Plus Jakarta Sans', sans-serif; color: #0f172a; margin: 0; padding: 40px; }
                .report-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px; }
                .logo { font-size: 20px; font-weight: 800; color: #4f46e5; }
                .title { font-size: 22px; font-weight: 800; text-align: right; }
                .meta-section { margin-bottom: 30px; font-size: 13px; color: #475569; }
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                .table-title { font-size: 14px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; color: #64748b; border-bottom: 1px solid #f1f5f9; padding-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                th { text-align: left; padding: 10px; font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
                td { padding: 12px 10px; font-size: 13px; font-weight: 600; border-bottom: 1px solid #f1f5f9; }
                td.amount { text-align: right; font-weight: 700; }
                .footer { text-align: center; margin-top: 50px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; }
              </style>
            </head>
            <body>
              <div class="report-header">
                <div class="logo">HCM.ai • Manager Portal</div>
                <div class="title">Team Performance Report<div style="font-size: 12px; font-weight: 500; color: #64748b;">Range: ${dateRange}</div></div>
              </div>
              
              <div class="meta-section">
                <h3>Executive Summary</h3>
                <p>This automated dashboard analytics export captures key productivity, attendance, and goal completion scores across the active team workspace. Below is the detailed records of active licenses, attendance, and milestones.</p>
              </div>
              
              <div class="table-title">Team Composition & Active Rosters</div>
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th style="text-align: right;">Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${teamListHtml}
                </tbody>
              </table>

              <div class="table-title">Key Performance Indicators (KPIs)</div>
              <table>
                <thead>
                  <tr>
                    <th>Goal Name</th>
                    <th>Status</th>
                    <th style="text-align: right;">Completion Rate</th>
                  </tr>
                </thead>
                <tbody>
                  ${kpiListHtml}
                </tbody>
              </table>

              <div class="footer">
                <p>Generated by HCM.ai Platform. Confidential - Internal Use Only.</p>
              </div>
            </body>
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              };
            </script>
            </html>
          `;
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          showToast(`Report compiled in new tab successfully!`, 'success');
        } else if (selectedFormat === 'Excel Sheet' || selectedFormat === 'CSV Data') {
          let csvContent = '\uFEFF'; // UTF-8 BOM
          csvContent += 'HCM.ai Team Analytics Report\n';
          csvContent += `Date Range: ${dateRange}\n\n`;
          
          csvContent += 'TEAM MEMBERS ROSTER\n';
          csvContent += 'Name,Role,Department,Status\n';
          teamMembers.forEach(m => {
            csvContent += `"${m.name}","${m.role}","${m.department}","${m.status}"\n`;
          });
          
          csvContent += '\nGOAL AND KPI PROGRESS\n';
          csvContent += 'Goal Title,Status,Progress\n';
          kpis.forEach(k => {
            csvContent += `"${k.title}","${k.status}",${k.progress}%\n`;
          });
          
          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `Team_Report_${dateRange.replace(/\s+/g, '_')}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          showToast(`Report exported successfully!`, 'success');
        }
      } catch (err) {
        console.error(err);
        showToast('Error exporting report. Please try again.', 'error');
      } finally {
        setIsGenerating(false);
        setShowExportModal(false);
      }
    }, 1500);
  };

  // New Task Form State
  const [newTask, setNewTask] = useState({ title: '', employeeId: '', priority: 'Medium', dueDate: '' });
  
  const todayStr = new Date().toISOString().split('T')[0];
  const presentTodayCount = attendance?.filter(a => a.date === todayStr && (a.status === 'Present' || a.status === 'Clocked In')).length || 0;

  const stats = [
    { label: 'Team Size', value: teamMembers.length, icon: Users, trend: '+2 new members', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    { label: 'Present Today', value: presentTodayCount, icon: UserCheck, trend: `${leaveRequests.filter(l => l.status === 'Pending').length} on leave`, color: 'text-emerald-600 dark:text-emerald-450', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Pending Approvals', value: leaveRequests.filter(l => l.status === 'Pending').length, icon: ClipboardCheck, trend: 'Needs review today', color: 'text-amber-600 dark:text-amber-450', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Performance Alerts', value: kpis.filter(k => k.status === 'At Risk' || k.status === 'Delayed').length, icon: AlertTriangle, trend: 'Requires attention', color: 'text-rose-600 dark:text-rose-455', bg: 'bg-rose-50 dark:bg-rose-950/20' },
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
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex items-center gap-4 text-left">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="card-title mb-1.5">{stat.label}</p>
                  <h3 className="card-value">{stat.value}</h3>
                  <p className="card-desc mt-1.5">{stat.trend}</p>
               </div>
            </div>
          </motion.div>
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
                  {[
                     { day: 'Mon', present: activeChartTab === 'this-week' ? 18 : 15, total: 18 },
                     { day: 'Tue', present: activeChartTab === 'this-week' ? 16 : 17, total: 18 },
                     { day: 'Wed', present: activeChartTab === 'this-week' ? 14 : 16, total: 18 },
                     { day: 'Thu', present: activeChartTab === 'this-week' ? 15 : 17, total: 18 },
                     { day: 'Fri', present: activeChartTab === 'this-week' ? 17 : 14, total: 18 },
                     { day: 'Sat', present: 4, total: 6 },
                     { day: 'Sun', present: 0, total: 0 }
                  ].map((d, i) => (
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
               <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <h3 className="hcm-section-heading flex items-center gap-3">
                     <Target className="text-primary-600 dark:text-primary-400" size={24} />
                     Goal Progress Summary
                  </h3>
                  <button onClick={() => navigate('/manager/kpi')} className="text-[10px] font-extrabold text-primary-600 dark:text-primary-400 font-bold hover:underline">View All Goals</button>
               </div>
               <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left bg-white dark:bg-slate-900">
                  {kpis.slice(0, 4).map((goal, i) => (
                     <div key={i} className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-left">
                           <span className="text-slate-600 dark:text-slate-300 truncate mr-4">{goal.title}</span>
                           <span className="text-slate-900 dark:text-white">{goal.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-50 dark:bg-slate-850 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-[1px]">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${goal.progress}%` }}
                             className={cn("h-full rounded-full transition-all duration-1000", goal.status === 'At Risk' ? 'bg-amber-500' : goal.status === 'Delayed' ? 'bg-rose-500' : goal.status === 'Completed' ? 'bg-indigo-500' : 'bg-emerald-500')} 
                           />
                        </div>
                        <p className={cn("text-[10px] font-black uppercase tracking-widest", goal.status === 'At Risk' ? "text-amber-500" : goal.status === 'Delayed' ? "text-rose-500" : "text-emerald-500")}>{goal.status}</p>
                     </div>
                  ))}
               </div>
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
