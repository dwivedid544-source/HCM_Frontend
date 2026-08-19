import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  BarChart3, 
  TrendingUp, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Search, 
  Download, 
  ChevronRight, 
  Star, 
  Zap, 
  ArrowUpRight, 
  X, 
  Calendar, 
  LayoutGrid,
  TrendingDown,
  User,
  Activity,
  RotateCcw,
  Save,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import PermissionGate from '../../shared/components/common/PermissionGate';
import DatePicker from '../../shared/components/common/DatePicker';

const KPITracking = () => {
  const { kpis, teamMembers, showToast, addKpi, updateKpi } = useManager();
  
  // UI States
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('Active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = () => {
    setIsExporting(true);
    showToast('Compiling KPI metrics report...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Goal/Objective', 'Assigned To', 'Progress %', 'Deadline', 'Status', 'Category', 'Priority'];
        const rows = filteredGoals.map(g => [
          `"${(g.title || '').replace(/"/g, '""')}"`,
          `"${(g.name || '').replace(/"/g, '""')}"`,
          g.progress || 0,
          g.deadline || '',
          g.status || '',
          g.category || '',
          g.priority || ''
        ]);
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'kpi_report.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (err) {
        console.error('Export error:', err);
      }
      setIsExporting(false);
      showToast('KPI report compiled and downloaded successfully!', 'success');
    }, 1500);
  };
  
  // Form State
  const [newGoal, setNewGoal] = useState({ title: '', employeeId: '', category: 'Productivity', priority: 'Medium', deadline: '' });

  // Resolve KPI assignee details from team members dynamically
  const resolvedKpis = useMemo(() => {
    return kpis.map(k => {
      const member = teamMembers.find(m => 
        m.name === k.assignedTo || 
        m.id.toString() === k.employeeId?.toString() ||
        m.id.toString() === k.assignedTo?.toString()
      );
      return {
        ...k,
        name: k.name || k.assignedTo || (member ? member.name : 'Unassigned'),
        img: k.img || (member ? member.img : '')
      };
    });
  }, [kpis, teamMembers]);

  // Stats calculation
  const stats = useMemo(() => {
    return [
      { label: 'Active Goals', value: resolvedKpis.filter(k => k.status !== 'Completed').length.toString(), icon: Target, color: 'text-primary-600', bg: 'bg-primary-50' },
      { label: 'Completed', value: resolvedKpis.filter(k => k.status === 'Completed').length.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'At Risk', value: resolvedKpis.filter(k => k.status === 'At Risk' || k.status === 'Delayed').length.toString(), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
      { label: 'Avg Performance', value: '88%', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    ];
  }, [resolvedKpis]);

  // Filtering Logic
  const filteredGoals = useMemo(() => {
    return resolvedKpis.filter(k => {
      const matchesTab = activeTab === 'All' ? true : 
                         activeTab === 'Active' ? k.status !== 'Completed' :
                         activeTab === 'Completed' ? k.status === 'Completed' :
                         activeTab === 'At Risk' ? (k.status === 'At Risk' || k.status === 'Delayed') : true;
      const titleLower = (k.title || '').toLowerCase();
      const nameLower = (k.name || '').toLowerCase();
      const queryLower = (searchQuery || '').toLowerCase();
      const matchesSearch = titleLower.includes(queryLower) || nameLower.includes(queryLower);
      return matchesTab && matchesSearch;
    });
  }, [resolvedKpis, activeTab, searchQuery]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.employeeId) {
      showToast('Please fill in required fields.', 'error');
      return;
    }
    
    // Call the addKpi method from context
    await addKpi({
      title: newGoal.title,
      assignedTo: teamMembers.find(m => m.id.toString() === newGoal.employeeId)?.name || '',
      employeeId: newGoal.employeeId,
      progress: 0,
      status: 'On Track',
      priority: newGoal.priority,
      deadline: newGoal.deadline,
      category: newGoal.category
    });

    setShowAddModal(false);
    setNewGoal({ title: '', employeeId: '', category: 'Productivity', priority: 'Medium', deadline: '' });
  };

  const handleUpdateKPI = async (e) => {
    e.preventDefault();
    if (selectedGoal) {
      updateKpi(selectedGoal.id, { 
        feedback: feedback
      });
    }
    showToast('KPI metrics updated successfully.');
    setSelectedGoal(null);
    setFeedback('');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">KPI Tracking & Goals</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Track employee objectives, progress and team performance metrics</p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate module="kpi_tracking" action="manage">
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 active:scale-95 transition-all disabled:opacity-50"
          >
            {isExporting ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            <span className="hidden sm:inline">Export KPI</span>
          </button>
          </PermissionGate>
          <PermissionGate module="kpi_tracking" action="create">
          <button onClick={() => setShowAddModal(true)} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200">
             <Plus size={18} />
             <span>Add New Goal</span>
          </button>
          </PermissionGate>
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
                  <p className="text-[10px] font-bold text-slate-400 font-bold leading-none mb-1.5">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter dark:text-white">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Goals Filter & List */}
      <div className="space-y-6">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
               {['Active', 'Completed', 'At Risk', 'All'].map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveTab(cat)}
                    className={cn(
                       "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border capitalize",
                       activeTab === cat ? "bg-slate-900 text-white shadow-xl shadow-slate-200 border-slate-900" : "bg-white text-slate-400 border-slate-100 hover:border-slate-300"
                    )}
                  >
                     {cat} Tracking
                  </button>
               ))}
            </div>
            <div className="relative w-full lg:w-80 text-slate-400">
               <Search className="absolute left-3 top-3 text-slate-400" size={18} />
               <input 
                 type="text" 
                 placeholder="Search by goal or employee..." 
                 className="input-field pl-10 h-11" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
               />
            </div>
         </div>

         <div className="card p-0 border-none bg-white shadow-soft overflow-hidden text-left">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Goal / Objective</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Assigned To</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Progress %</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Deadline</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Status</th>
                        <th className="px-8 py-5 text-right text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                     {filteredGoals.map((goal) => (
                        <tr key={goal.id} className="group hover:bg-slate-50/30 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary-600 border border-slate-100 group-hover:bg-white transition-colors shadow-sm">
                                    <Target size={20} />
                                 </div>
                                 <div className="text-left">
                                    <p className="font-extrabold text-slate-900 leading-none">{goal.title}</p>
                                    <p className="text-[10px] font-black text-slate-400 mt-2 font-bold">{goal.category}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-3">
                                 <Avatar src={goal.img} alt={goal.name} className="w-8 h-8 rounded-lg object-cover shadow-sm ring-2 ring-white" />
                                 <p className="font-extrabold text-slate-700 tracking-tight">{goal.name}</p>
                              </div>
                           </td>
                           <td className="px-8 py-6">
                              <div className="flex flex-col items-center gap-2 min-w-[120px]">
                                 <span className="text-[10px] font-black text-slate-900 tracking-widest">{goal.progress}%</span>
                                 <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden p-[1px]">
                                    <motion.div 
                                      initial={{ width: 0 }}
                                      animate={{ width: `${goal.progress}%` }}
                                      className={cn(
                                         "h-full rounded-full transition-all",
                                         goal.status === 'Completed' ? "bg-emerald-500" : goal.status === 'At Risk' ? "bg-amber-500" : "bg-primary-500"
                                      )} 
                                    />
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <p className="text-xs font-black text-slate-500 tracking-tight">{goal.deadline}</p>
                           </td>
                           <td className="px-4 md:px-8 py-6 text-center font-bold text-[10px] font-black">
                              <span className={cn(
                                 "px-3 py-1.5 rounded-lg border whitespace-nowrap inline-block",
                                 goal.status === 'On Track' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                 goal.status === 'At Risk' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                 goal.status === 'Completed' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                 "bg-rose-50 text-rose-500 border-rose-100"
                              )}>
                                 {goal.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <button onClick={() => { setSelectedGoal(goal); setFeedback(goal.feedback || ''); }} className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                                 <ChevronRight size={20} />
                              </button>
                           </td>
                        </tr>
                     ))}
                     {filteredGoals.length === 0 && (
                        <tr>
                           <td colSpan="6" className="px-8 py-20 text-center">
                              <div className="flex flex-col items-center gap-4 opacity-40">
                                 <Target size={48} className="text-slate-300" />
                                 <p className="text-sm font-bold text-slate-500 font-bold">No matching goals found</p>
                              </div>
                           </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      {/* Goal Review Modal */}
      <CenterModal 
        isOpen={!!selectedGoal} 
        onClose={() => setSelectedGoal(null)} 
        title="Objective Performance Review"
      >
         {selectedGoal && (
            <div className="p-6 sm:p-8 space-y-6 sm:space-y-8 text-left">
               <div className="p-6 bg-slate-900 rounded-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-20 transform translate-x-6 -translate-y-6 group-hover:translate-x-3 group-hover:-translate-y-3 transition-transform">
                     <Target size={120} className="text-primary-500" />
                  </div>
                  <div className="relative z-10 text-left">
                     <div className="flex items-center gap-2 mb-4">
                        <Zap size={16} className="text-primary-400 fill-primary-400" />
                        <span className="text-[10px] font-bold text-primary-400 font-bold">{selectedGoal.category} Objective</span>
                     </div>
                     <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tighter leading-tight max-w-sm">{selectedGoal.title}</h3>
                     
                     <div className="mt-6 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                           <img src={selectedGoal.img} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white/20" />
                           <div>
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Assignee</p>
                              <p className="text-sm font-black text-white">{selectedGoal.name}</p>
                           </div>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden sm:block" />
                        <div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Deadline</p>
                           <p className="text-sm font-black text-white">{selectedGoal.deadline}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4">
                  <div className="flex items-center justify-between text-left">
                     <h4 className="text-[10px] font-bold text-slate-400">Achievement Level</h4>
                     <span className="text-2xl font-black text-slate-900">{selectedGoal.progress}%</span>
                  </div>
                  <div className="relative h-4 bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-1 shadow-inner">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${selectedGoal.progress}%` }} 
                        className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full shadow-lg shadow-primary-200"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 sm:gap-6 text-left">
                  <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Priority Index</p>
                     <div className="flex items-center gap-2">
                        <Star size={16} className={cn(selectedGoal.priority === 'High' ? "text-rose-500 fill-rose-500" : "text-amber-500 fill-amber-500")} />
                        <span className="text-base font-black text-slate-900">{selectedGoal.priority}</span>
                     </div>
                  </div>
                  <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 text-left">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Weightage</p>
                     <span className="text-base font-black text-slate-900">30% (Impact)</span>
                  </div>
               </div>

               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <MessageSquare size={16} className="text-slate-300" /> Qualitative Feedback
                  </label>
                  <textarea 
                     className="input-field min-h-[100px] bg-white border-slate-200 py-3 px-4 text-sm font-medium resize-none shadow-sm focus:shadow-md transition-shadow" 
                     placeholder="Provide constructive feedback for the next sprint..."
                     value={feedback}
                     onChange={(e) => setFeedback(e.target.value)}
                  ></textarea>
               </div>

               <div className="pt-6 border-t border-slate-50 flex gap-4">
                  <button onClick={() => { setSelectedGoal(null); setFeedback(''); }} className="flex-1 py-2.5 sm:py-3 bg-slate-50 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all border border-transparent hover:border-slate-200 text-xs sm:text-sm">
                     Discard
                  </button>
                  <button onClick={handleUpdateKPI} className="flex-1 py-2.5 sm:py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 text-xs sm:text-sm">
                     <Save size={16} />
                     <span>Save Update</span>
                  </button>
               </div>
            </div>
         )}
      </CenterModal>

      {/* Add New Goal Modal */}
      <CenterModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Assign Performance Goal"
      >
         <form onSubmit={handleAddGoal} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left">
            <div className="space-y-2 text-left">
               <label className="text-[10px] font-bold text-slate-400 px-1 text-left">Goal Objective</label>
               <input 
                 type="text" 
                 placeholder="e.g. Implement Zero-trust architecture" 
                 className="input-field h-11 sm:h-12 font-bold"
                 value={newGoal.title}
                 onChange={e => setNewGoal({...newGoal, title: e.target.value})}
               />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold font-bold text-slate-400 px-1">Assign to Member</label>
                  <select 
                    className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white"
                    value={newGoal.employeeId}
                    onChange={e => setNewGoal({...newGoal, employeeId: e.target.value})}
                  >
                     <option value="">Select Member</option>
                     {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Category</label>
                  <select 
                    className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white"
                    value={newGoal.category}
                    onChange={e => setNewGoal({...newGoal, category: e.target.value})}
                  >
                     <option>Productivity</option>
                     <option>Quality</option>
                     <option>Innovation</option>
                     <option>Leadership</option>
                     <option>Compliance</option>
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-6 text-left">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Target Deadline</label>
                  <DatePicker  
                    className="input-field h-11 sm:h-12 font-semibold"
                    value={newGoal.deadline}
                    onChange={e => setNewGoal({...newGoal, deadline: e.target.value})}
                  />
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Priority Level</label>
                  <select 
                    className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white"
                    value={newGoal.priority}
                    onChange={e => setNewGoal({...newGoal, priority: e.target.value})}
                  >
                     <option>Low</option>
                     <option>Medium</option>
                     <option>High</option>
                     <option>Critical</option>
                  </select>
               </div>
            </div>

            <div className="pt-4 flex flex-col gap-3 text-left">
               <button type="submit" className="btn-primary w-full py-2.5 sm:py-3 font-bold shadow-lg shadow-primary-200 text-sm">Set Objective</button>
               <button type="button" onClick={() => setShowAddModal(false)} className="w-full py-2.5 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors">Discard Draft</button>
            </div>
         </form>
      </CenterModal>
    </div>
  );
};

export default KPITracking;
