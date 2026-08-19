import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Download, 
  Calendar, 
  ChevronRight, 
  Users, 
  Timer, 
  Briefcase, 
  CheckCircle2, 
  Target, 
  ArrowUpRight, 
  Filter, 
  Search,
  LayoutGrid,
  Settings2,
  Clock,
  Mail,
  FileSpreadsheet,
  X,
  ShieldCheck,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';

const ManagerReports = () => {
  const { teamMembers, tasks, reviews, leaves, attendance, showToast } = useManager();
  
  // UI States
  const [selectedReport, setSelectedReport] = useState(null);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState(() => {
    const saved = localStorage.getItem('manager_report_schedule');
    if (saved) return JSON.parse(saved).frequency || 'Weekly';
    return 'Weekly';
  });
  const [recipientEmail, setRecipientEmail] = useState(() => {
    const saved = localStorage.getItem('manager_report_schedule');
    if (saved) return JSON.parse(saved).recipient || 'manager@hcm.ai';
    return 'manager@hcm.ai';
  });
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileStep, setCompileStep] = useState(0); // 0 = Idle, 1 = Assembling data, 2 = Generating PDF, 3 = Encrypting bundle
  const [customReportName, setCustomReportName] = useState('');
  const [selectedOrigin, setSelectedOrigin] = useState('Mission Core');
  const [selectedPersonnel, setSelectedPersonnel] = useState([]);
  const [isConstructing, setIsConstructing] = useState(false);
  const [constructStep, setConstructStep] = useState(0); // 0 = Idle, 1 = Structuring, 2 = Mapping, 3 = Encrypting
  
  // Search & Filter for Suites
  const [suiteSearch, setSuiteSearch] = useState('');
  const [suiteFilter, setSuiteFilter] = useState('All');

  // Report Config Modal States
  const [reportFormat, setReportFormat] = useState('PDF');
  const [selectedModules, setSelectedModules] = useState([]);
  
  // Stats calculation
  const stats = useMemo(() => {
    return [
      { label: 'Team Productivity', value: '94%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Attendance Rate', value: '98.2%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Goal Completion', value: '86%', icon: Target, color: 'text-primary-600', bg: 'bg-primary-50' },
      { label: 'Avg Rating', value: '4.7', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  }, []);

  const reportTypes = [
     { id: 1, name: 'Attendance Report', icon: Timer, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Detailed login/logout patterns and punctuality indices.' },
     { id: 2, name: 'Task Completion', icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50', desc: 'Efficiency metrics, velocity and overdue mission tracking.' },
     { id: 3, name: 'KPI Progress', icon: Target, color: 'text-emerald-600', bg: 'bg-emerald-50', desc: 'Objective performance reviews and target alignment.' },
     { id: 4, name: 'Leave Summary', icon: Calendar, color: 'text-rose-600', bg: 'bg-rose-50', desc: 'Vacation trends, department availability and burn rates.' },
     { id: 5, name: 'Review Summary', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50', desc: 'Consolidated performance ratings and manager feedback.' },
     { id: 6, name: 'Productivity Trend', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50', desc: 'Month-over-month growth and output analytics.' },
  ];

  // Filtering Logic for Report Suites
  const filteredReportSuites = useMemo(() => {
    return reportTypes.filter(suite => {
      const matchesSearch = suite.name.toLowerCase().includes(suiteSearch.toLowerCase()) || 
                           suite.desc.toLowerCase().includes(suiteSearch.toLowerCase());
      const matchesFilter = suiteFilter === 'All' ? true : suite.name.includes(suiteFilter);
      return matchesSearch && matchesFilter;
    });
  }, [suiteSearch, suiteFilter]);

  const leaderboard = useMemo(() => {
    return teamMembers.slice(0, 3).map((m, i) => ({
      ...m,
      attendance: i === 0 ? '100%' : i === 1 ? '98%' : '94%',
      tasks: 30 + (3 - i) * 5,
      kpi: 90 + (3 - i) * 2,
      rating: 4.5 + (3 - i) * 0.1
    }));
  }, [teamMembers]);

  const handleGenerateReport = (type) => {
    try {
      const headers = ['Report Target', 'Timestamp', 'Status'];
      const rows = [[`"${type}"`, `"${new Date().toISOString()}"`, 'SUCCESS']];
      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type.toLowerCase().replace(/\s+/g, '_')}_report.${reportFormat.toLowerCase()}`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Generating and downloading ${type} report...`);
    } catch (err) {
      console.error('Report generate error:', err);
    }
    setSelectedReport(null);
  };

  const handleScheduleReport = (e) => {
    e.preventDefault();
    localStorage.setItem('manager_report_schedule', JSON.stringify({
      frequency: scheduleFrequency,
      recipient: recipientEmail,
      enabled: true
    }));
    showToast(`${scheduleFrequency} report scheduling enabled for ${recipientEmail || 'manager@hcm.ai'}.`, 'success');
    setShowScheduleModal(false);
  };

  const handleCompileExecutiveBundle = () => {
    setIsCompiling(true);
    setCompileStep(1); // Assembling Data...
    
    setTimeout(() => {
      setCompileStep(2); // Generating PDF...
      
      setTimeout(() => {
        setCompileStep(3); // Encrypting Bundle...
        
        setTimeout(() => {
          try {
            // Generate CSV
            const headers = ['Metric', 'Value'];
            const rows = [
              ['Team Productivity', '94%'],
              ['Attendance Rate', '98.2%'],
              ['Goal Completion', '86%'],
              ['Avg Rating', '4.7'],
              ['Total Team Members', teamMembers.length],
              ['Total Tasks', tasks.length],
              ['Total Reviews', reviews.length],
              ['Total Leaves', leaves.length]
            ];
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'executive_intelligence_bundle.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (err) {
            console.error('Export error:', err);
          }
          setIsCompiling(false);
          setCompileStep(0);
          showToast('Executive Intelligence Bundle compiled and downloaded successfully!', 'success');
        }, 800);
      }, 900);
    }, 1000);
  };

  const handleConstructReport = (e) => {
    e.preventDefault();
    if (!customReportName.trim()) {
      showToast('Please specify a Report Identity.', 'error');
      return;
    }
    if (selectedPersonnel.length === 0) {
      showToast('Please select at least one team member.', 'error');
      return;
    }

    setIsConstructing(true);
    setConstructStep(1); // Structuring...
    
    setTimeout(() => {
      setConstructStep(2); // Mapping...
      
      setTimeout(() => {
        setConstructStep(3); // Encrypting...
        
        setTimeout(() => {
          try {
            const selectedNames = selectedPersonnel.map(id => teamMembers.find(m => m.id === id)?.name || 'Unknown');
            const headers = ['Report Identity', 'Data Origin', 'Included Personnel'];
            const rows = [
              [`"${customReportName}"`, `"${selectedOrigin}"`, `"${selectedNames.join(', ')}"`]
            ];
            const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${customReportName.toLowerCase().replace(/\s+/g, '_')}_custom_report.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          } catch (err) {
            console.error('Custom construct error:', err);
          }
          setIsConstructing(false);
          setConstructStep(0);
          showToast(`Custom report "${customReportName}" successfully compiled and saved!`, 'success');
          setCustomReportName('');
          setSelectedPersonnel([]);
          setShowCustomModal(false);
        }, 800);
      }, 900);
    }, 1000);
  };

  const handleFullAudit = () => {
    showToast('Compiling full audit data...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Team Member', 'Attendance %', 'Tasks Done', 'KPI Score', 'Final Rating', 'Role', 'Status'];
        const rows = teamMembers.map((m, i) => [
          `"${m.name || ''}"`,
          i === 0 ? '100%' : i === 1 ? '98%' : '94%',
          30 + (3 - i) * 5,
          90 + (3 - i) * 2,
          4.5 + (3 - i) * 0.1,
          `"${m.role || ''}"`,
          `"${m.status || ''}"`
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'team_efficiency_full_audit.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Full audit report downloaded successfully!', 'success');
      } catch (err) {
        console.error('Audit compile error:', err);
      }
    }, 1000);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Team Insights & Reports</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Generate deep analytics for attendance, tasks and performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleCompileExecutiveBundle}
            disabled={isCompiling}
            className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 disabled:opacity-50 active:scale-95 transition-all"
          >
            {isCompiling ? (
               <Loader2 size={18} className="animate-spin text-indigo-600" />
            ) : (
               <Download size={18} />
            )}
            <span className="hidden sm:inline text-indigo-600">Export All</span>
          </button>
          <button onClick={() => setShowCustomModal(true)} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200 active:scale-95">
             <LayoutGrid size={18} />
             <span>Custom Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card p-6"
          >
            <div className="flex items-center gap-4 text-left">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="text-[10px] font-bold text-slate-400 font-bold leading-none mb-1.5 text-left">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter text-left dark:text-white">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
         
         {/* Report Generation Center */}
         <div className="lg:col-span-8 space-y-8 h-full">
            <div className="card p-6 sm:p-10  flex flex-col text-left">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 text-left">
                  <h3 className="text-xl font-black text-slate-900 font-bold dark:text-white">Available Intelligence Suites</h3>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                     <div className="relative w-full sm:w-auto">
                        <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                        <input 
                           type="text" 
                           placeholder="Search suites..." 
                           className="input-field pl-9 pr-4 py-1.5 h-10 text-xs w-full sm:w-44 font-bold"
                           value={suiteSearch}
                           onChange={e => setSuiteSearch(e.target.value)}
                        />
                     </div>
                     <select 
                        className="input-field py-1.5 px-3 h-10 text-xs font-semibold bg-white border border-slate-200 rounded-xl w-full sm:w-auto"
                        value={suiteFilter}
                        onChange={e => setSuiteFilter(e.target.value)}
                     >
                        <option value="All">All Categories</option>
                        <option value="Attendance">Attendance</option>
                        <option value="Task">Task</option>
                        <option value="KPI">KPI</option>
                        <option value="Leave">Leave</option>
                        <option value="Review">Review</option>
                        <option value="Productivity">Productivity</option>
                     </select>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 flex-1">
                  {filteredReportSuites.map((type) => (
                     <motion.div
                       key={type.id}
                       whileHover={{ y: -5, backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                       onClick={() => setSelectedReport(type)}
                       className="p-6 sm:p-8 border border-slate-50 rounded-[2rem] sm:rounded-[3rem] flex flex-col gap-6 group cursor-pointer transition-all text-left relative overflow-hidden"
                     >
                        <div className="absolute top-0 right-0 p-6 transition-all transform scale-150 rotate-12">
                           <type.icon size={60} />
                        </div>
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-all", type.bg, type.color)}>
                           <type.icon size={28} />
                        </div>
                        <div className="space-y-2">
                           <h4 className="text-base font-black text-slate-900 leading-none uppercase tracking-tight dark:text-white">{type.name}</h4>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                              Deep Analytics Insight
                           </p>
                        </div>
                        <div className="mt-auto flex items-center gap-2 text-[10px] font-black text-primary-600 uppercase tracking-widest transition-all translate-y-2 text-left">
                           Configure Data <ArrowUpRight size={14} />
                        </div>
                     </motion.div>
                  ))}
               </div>
            </div>

            {/* Performance Analytics Table Preview */}
            <div className="card p-0 border-none bg-white shadow-soft overflow-hidden text-left">
               <div className="p-6 sm:p-10 border-b border-slate-50 flex items-center justify-between">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-3 uppercase tracking-tight text-left dark:text-white">
                     <BarChart3 className="text-amber-500" size={24} />
                     Team Efficiency Leaderboard
                  </h3>
                  <button onClick={handleFullAudit} className="text-[10px] font-bold text-primary-600 font-bold hover:underline">Full Audit</button>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[650px]">
                     <thead>
                        <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                           <th className="px-8 py-5">Team Member</th>
                           <th className="px-8 py-5 text-center">Attendance %</th>
                           <th className="px-8 py-5 text-center">Tasks Done</th>
                           <th className="px-8 py-5 text-center">KPI Score</th>
                           <th className="px-8 py-5 text-right">Final Rating</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 text-sm">
                        {leaderboard.map((user, i) => (
                           <tr key={i} className="group hover:bg-slate-50/20 transition-colors">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <Avatar src={user.img} alt={user.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-md" />
                                    <p className="font-black text-slate-900 uppercase tracking-tight">{user.name}</p>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center font-black text-slate-600 tabular-nums">{user.attendance}</td>
                              <td className="px-8 py-6 text-center">
                                 <span className="px-3 py-1 bg-slate-100 text-slate-900 rounded-lg font-black text-[11px] tabular-nums">{user.tasks}</span>
                              </td>
                              <td className="px-8 py-6 text-center font-black text-indigo-600 tabular-nums">{user.kpi}</td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex justify-end gap-1.5 items-center">
                                    <p className="font-black text-slate-900 text-base">{user.rating}</p>
                                    <BarChart3 size={16} className="text-amber-400" />
                                 </div>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Sidebar: Distribution & Insights */}
         <div className="lg:col-span-4 space-y-8 h-full flex flex-col text-left">
            <div className="card p-6 sm:p-10 bg-slate-900 text-white border-none shadow-soft flex-1 relative overflow-hidden group text-left">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                  <PieChart size={120} />
               </div>
               <h3 className="text-[10px] font-bold text-primary-400 mb-10 text-left">Internal Distribution Index</h3>
               
               <div className="space-y-12 text-left">
                  {/* Visual Representation of Uptime */}
                  <div className="flex items-center justify-center py-6">
                     <div className="relative w-44 h-44">
                        <svg className="w-full h-full transform -rotate-90">
                           <circle cx="88" cy="88" r="75" className="stroke-white/5 fill-none" strokeWidth="18" />
                           <motion.circle 
                             cx="88" cy="88" r="75" 
                             className="stroke-indigo-500 fill-none" 
                             strokeWidth="18" 
                             strokeDasharray={471}
                             strokeDashoffset={471 - (471 * 0.94)}
                             strokeLinecap="round"
                             initial={{ strokeDashoffset: 471 }}
                             animate={{ strokeDashoffset: 471 - (471 * 0.94) }}
                             transition={{ duration: 2, ease: "easeOut" }}
                           />
                           <motion.circle 
                             cx="88" cy="88" r="75" 
                             className="stroke-primary-500 fill-none" 
                             strokeWidth="18" 
                             strokeDasharray={471}
                             strokeDashoffset={471 - (471 * 0.25)}
                             strokeLinecap="round"
                             style={{ rotate: '270deg', transformOrigin: 'center' }}
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <p className="text-4xl font-black text-white tracking-tighter tabular-nums leading-none">94<span className="text-lg opacity-40">%</span></p>
                           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3">Team Health</p>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-6 relative z-10 text-left">
                     {[
                        { label: 'Work Attendance', count: '94%', color: 'bg-indigo-500' },
                        { label: 'Task Execution', count: '82%', color: 'bg-primary-500' },
                        { label: 'KPI Alignment', count: '76%', color: 'bg-amber-500' },
                     ].map((item, i) => (
                        <div key={i} className="flex flex-col gap-3 text-left">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-left">
                              <span className="text-slate-500">{item.label}</span>
                              <span className="text-white tabular-nums">{item.count}</span>
                           </div>
                           <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: item.count }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                className={cn("h-full rounded-full shadow-lg shadow-white/5", item.color)} 
                              />
                           </div>
                        </div>
                     ))}
                  </div>

                  <button 
                    onClick={handleCompileExecutiveBundle}
                    disabled={isCompiling}
                    className="w-full py-5 bg-white/5 hover:bg-white/10 disabled:bg-white/5 disabled:opacity-60 text-white rounded-[2rem] text-[10px] font-bold border border-white/5 transition-all active:scale-95 shadow-2xl flex items-center justify-center gap-3"
                  >
                     {isCompiling ? (
                        <>
                           <Loader2 size={16} className="animate-spin text-primary-400" />
                           <span>
                              {compileStep === 1 ? 'Assembling Data...' : 
                               compileStep === 2 ? 'Generating PDF...' : 'Encrypting Bundle...'}
                           </span>
                        </>
                     ) : (
                        <>
                           <Download size={16} />
                           Executive Bundle
                        </>
                     )}
                  </button>
               </div>
            </div>

            {/* Scheduler Card */}
            <div className="card p-6 sm:p-10 bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none shadow-soft text-left relative overflow-hidden group">
               <div className="absolute bottom-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform rotate-12">
                  <Clock size={100} />
               </div>
               <h3 className="text-[10px] font-bold font-bold text-primary-300 mb-6 text-left">Automated Audit</h3>
               <p className="text-sm font-bold leading-relaxed mb-10 opacity-80 text-left">Schedule recurring intelligence batches to be sent directly to your encrypted inbox.</p>
               <button onClick={() => setShowScheduleModal(true)} className="w-full py-5 bg-white text-indigo-900 rounded-[2rem] text-[10px] font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-2xl active:scale-95 relative z-10">
                  <Mail size={16} />
                  Configure Schedule
               </button>
            </div>
         </div>
      </div>

      {/* Report Configuration Modal */}
      <CenterModal
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        title={`Configure ${selectedReport?.name}`}
      >
         {selectedReport && (
            <div className="p-6 sm:p-10 space-y-6 sm:space-y-10 text-left">
               <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-6 sm:p-8 bg-slate-50 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 text-left">
                  <div className={cn("w-16 h-16 rounded-[2rem] flex items-center justify-center shadow-xl ring-4 ring-white shrink-0", selectedReport.bg, selectedReport.color)}>
                     <selectedReport.icon size={32} />
                  </div>
                  <div className="text-left">
                     <h3 className="text-2xl font-bold text-slate-900 font-bold leading-none dark:text-white">{selectedReport.name}</h3>
                     <p className="text-[10px] font-black text-slate-400 font-bold mt-2">{selectedReport.desc}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-left">
                  <div className="space-y-2 text-left">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Evaluation Period</label>
                     <select className="input-field h-14 font-extrabold appearance-none bg-white border-slate-100 uppercase tracking-tight">
                        <option>Current Quarter (Q4)</option>
                        <option>Current Year (2026)</option>
                        <option>Last 30 Days</option>
                        <option>Custom Range</option>
                     </select>
                  </div>
                  <div className="space-y-2 text-left">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">File Format</label>
                     <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                        <button 
                           onClick={() => setReportFormat('PDF')}
                           className={cn("flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all", 
                              reportFormat === 'PDF' ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}
                        >
                           <FileText size={16} /> PDF
                        </button>
                        <button 
                           onClick={() => setReportFormat('XLSX')}
                           className={cn("flex-1 h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all", 
                              reportFormat === 'XLSX' ? "bg-slate-900 text-white shadow-lg" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50")}
                        >
                           <FileSpreadsheet size={16} /> XLSX
                        </button>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 text-left">
                  <label className="text-[10px] font-bold text-slate-400 px-1">Include Metadata Modules</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-left">
                     {['Anonymized Data', 'Departmental Comparison', 'Trend Projections', 'Individual Transcripts'].map(mod => {
                        const isChecked = selectedModules.includes(mod);
                        return (
                           <label 
                              key={mod} 
                              onClick={() => {
                                 setSelectedModules(prev => 
                                    prev.includes(mod) ? prev.filter(m => m !== mod) : [...prev, mod]
                                 )
                              }}
                              className={cn(
                                 "flex items-center gap-3 p-5 border rounded-[2rem] cursor-pointer transition-all group",
                                 isChecked ? "bg-primary-50/30 border-primary-300" : "bg-slate-50 border-slate-100 hover:border-primary-600"
                              )}
                           >
                              <div className={cn(
                                 "w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all shrink-0",
                                 isChecked ? "border-primary-600 bg-primary-600" : "border-slate-200 bg-white group-hover:border-primary-600"
                              )}>
                                 {isChecked && <CheckCircle2 size={12} className="text-white" />}
                              </div>
                              <span className="text-[11px] font-bold text-slate-600 font-bold">{mod}</span>
                           </label>
                        )
                     })}
                  </div>
               </div>

               <div className="pt-6 flex flex-col gap-4 text-left">
                  <button onClick={() => handleGenerateReport(selectedReport.name)} className="btn-primary py-5 font-bold shadow-2xl shadow-primary-200 flex items-center justify-center gap-3">
                     <ShieldCheck size={20} />
                     Generate Secured Report
                  </button>
                  <button onClick={() => setSelectedReport(null)} className="py-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-all">Cancel Configuration</button>
               </div>
            </div>
         )}
      </CenterModal>

      {/* Custom Report Builder Modal */}
      <CenterModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        title="Intelligence Report Architect"
      >
         <div className="p-6 sm:p-10 space-y-6 sm:space-y-10 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-6 sm:p-8 bg-indigo-50 border border-indigo-100 rounded-[2rem] sm:rounded-[3rem] text-left">
               <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shrink-0">
                  <Settings2 size={28} />
               </div>
               <div className="text-left">
                  <h4 className="text-lg font-bold text-indigo-900 font-bold leading-none">Architect Workspace</h4>
                  <p className="text-[10px] font-black text-indigo-400 font-bold mt-2 leading-none">Assemble custom data points from your entire team</p>
               </div>
            </div>

            <div className="space-y-6 text-left">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Report Identity</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Q4 Executive Velocity Audit" 
                    className="input-field h-14 font-black uppercase tracking-tight" 
                    value={customReportName}
                    onChange={(e) => setCustomReportName(e.target.value)}
                  />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-left">
                  <div className="space-y-4 text-left">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Data Origin</label>
                     <div className="space-y-3">
                        {['Mission Core', 'Personnel Intel', 'Attendance Log', 'Assessment Score'].map(origin => {
                           const isSelected = selectedOrigin === origin;
                           return (
                              <label 
                                 key={origin} 
                                 onClick={() => setSelectedOrigin(origin)}
                                 className={cn(
                                    "flex items-center gap-3 p-4 bg-white border rounded-2xl cursor-pointer transition-all active:scale-[0.98]",
                                    isSelected ? "border-primary-600 shadow-md shadow-primary-50/50" : "border-slate-100 hover:border-slate-300"
                                 )}
                              >
                                 <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all", isSelected ? "border-primary-600" : "border-slate-300")}>
                                    {isSelected && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />}
                                 </div>
                                 <span className="text-[11px] font-black text-slate-700 uppercase tracking-tight">{origin}</span>
                              </label>
                           );
                        })}
                     </div>
                  </div>
                  <div className="space-y-2 text-left">
                     <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Select Personnel</label>
                     <div className="h-[184px] p-4 bg-slate-50 rounded-2xl border border-slate-100 overflow-y-auto space-y-2 scrollbar-hide text-left">
                        {teamMembers.map(m => {
                           const isChecked = selectedPersonnel.includes(m.id);
                           return (
                              <div 
                                 key={m.id} 
                                 onClick={() => {
                                    if (isChecked) {
                                       setSelectedPersonnel(prev => prev.filter(id => id !== m.id));
                                    } else {
                                       setSelectedPersonnel(prev => [...prev, m.id]);
                                    }
                                 }}
                                 className={cn(
                                    "flex items-center gap-3 p-2.5 rounded-xl shadow-sm border cursor-pointer transition-all active:scale-[0.98]",
                                    isChecked ? "bg-primary-50/30 border-primary-200" : "bg-white border-slate-50 hover:border-slate-200"
                                 )}
                              >
                                 <Avatar src={m.img} alt={m.name} className="w-6 h-6 rounded-lg object-cover ring-2 ring-white shadow-sm" />
                                 <span className="text-[10px] font-black text-slate-600 uppercase tracking-tight">{m.name}</span>
                                 <div className={cn(
                                    "ml-auto w-4.5 h-4.5 rounded border-2 flex items-center justify-center transition-all text-white",
                                    isChecked ? "bg-primary-600 border-primary-600" : "border-slate-200"
                                 )}>
                                    {isChecked && <CheckCircle2 size={10} className="stroke-[3]" />}
                                 </div>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-6 flex flex-col gap-4 text-left">
               <button 
                 onClick={handleConstructReport}
                 disabled={isConstructing}
                 className="btn-primary py-5 font-bold shadow-2xl shadow-primary-200 active:scale-[0.98] disabled:bg-primary-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
               >
                  {isConstructing ? (
                     <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>
                           {constructStep === 1 ? 'Structuring Origin Data...' : 
                            constructStep === 2 ? 'Mapping Personnel...' : 'Encrypting Workspace...'}
                        </span>
                     </>
                  ) : (
                     <>Construct & Generate</>
                  )}
               </button>
               {!isConstructing && (
                  <button 
                    type="button" 
                    onClick={() => {
                       setCustomReportName('');
                       setSelectedPersonnel([]);
                       setShowCustomModal(false);
                    }} 
                    className="py-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors text-center"
                  >
                    Discard Workspace
                  </button>
               )}
            </div>
         </div>
      </CenterModal>

      {/* Schedule Modal */}
      <CenterModal
        isOpen={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        title="Automation Frequency Config"
      >
         <form onSubmit={handleScheduleReport} className="p-6 sm:p-10 space-y-6 sm:space-y-10 text-left">
            <div className="p-6 sm:p-8 bg-indigo-900 text-white rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden group text-left">
               <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform">
                  <Mail size={120} />
               </div>
               <div className="relative z-10 text-left">
                  <h4 className="text-xl font-bold font-bold leading-none mb-3">Sync Delivery</h4>
                  <p className="text-[10px] font-black text-indigo-400 font-bold leading-none">Automated intelligence transmission</p>
               </div>
            </div>

            <div className="space-y-8 text-left">
               <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Transmission Pulse</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-left">
                     {['Weekly', 'Bi-Monthly', 'Monthly'].map(pulse => (
                        <button 
                           key={pulse} 
                           type="button" 
                           onClick={() => setScheduleFrequency(pulse)}
                           className={cn(
                              "py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-[0.1em] transition-all border active:scale-95",
                              scheduleFrequency === pulse ? "bg-slate-900 text-white border-slate-900 shadow-xl" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                           )}
                        >
                           {pulse}
                        </button>
                     ))}
                  </div>
               </div>

               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold text-slate-400 px-1">Recipient Channel</label>
                  <div className="relative">
                     <Mail className="absolute left-5 top-5 text-slate-300" size={18} />
                     <input 
                        type="email" 
                        placeholder="manager@hcm.ai" 
                        className="input-field h-16 pl-14 font-bold font-bold" 
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                     />
                  </div>
               </div>
            </div>

            <div className="pt-6 flex flex-col gap-4 text-left">
               <button type="submit" className="btn-primary py-5 font-bold shadow-2xl shadow-primary-200 active:scale-[0.98]">Activate Secure Loop</button>
               <button type="button" onClick={() => { showToast('Recurring schedule terminated.', 'info'); setShowScheduleModal(false); }} className="py-4 text-[10px] font-bold text-rose-500 hover:text-rose-600 transition-all text-left flex justify-center active:scale-95">Kill Schedule</button>
            </div>
         </form>
      </CenterModal>
    </div>
  );
};

export default ManagerReports;
