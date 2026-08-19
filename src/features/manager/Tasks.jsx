import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  User, 
  Calendar, 
  Paperclip, 
  MessageSquare, 
  Filter, 
  ChevronRight, 
  X, 
  Briefcase, 
  Zap, 
  ArrowUpRight,
  TrendingUp,
  Target,
  RotateCcw,
  Save,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import StatCard from '../../shared/components/ui/StatCard';
import CenterModal from '../../shared/components/common/CenterModal';
import PermissionGate from '../../shared/components/common/PermissionGate';
import DatePicker from '../../shared/components/common/DatePicker';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-50 text-red-600 rounded-lg whitespace-pre-wrap">{this.state.error.toString()}\n{this.state.error.stack}</div>;
    }
    return this.props.children;
  }
}

const Tasks = () => {
  const { tasks, teamMembers, showToast, addTask, updateTaskStatus } = useManager();
  
  // UI States
  const [viewMode, setViewMode] = useState('board');
  const [selectedTask, setSelectedTask] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [newTask, setNewTask] = useState({ title: '', userId: '', priority: 'Medium', deadline: '', status: 'Pending', description: '' });
  const [isDeploying, setIsDeploying] = useState(false);
  const [deployStep, setDeployStep] = useState(0); // 0 = Idle, 1 = Initiating, 2 = Securing Channels

  // Stats calculation
  const stats = useMemo(() => {
    return [
      { label: 'Total Tasks', value: tasks.length.toString(), icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
      { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length.toString(), icon: Zap, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Final Review', value: tasks.filter(t => t.status === 'Review').length.toString(), icon: AlertCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length.toString(), icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];
  }, [tasks]);

  const columns = [
    { title: 'Pending', color: 'text-slate-400', bg: 'bg-slate-400' },
    { title: 'In Progress', color: 'text-amber-500', bg: 'bg-amber-500' },
    { title: 'Review', color: 'text-indigo-500', bg: 'bg-indigo-500' },
    { title: 'Completed', color: 'text-emerald-500', bg: 'bg-emerald-500' },
  ];

  // Resolve task assignee details from team members dynamically and handle backend/db schema alignment
  const resolvedTasks = useMemo(() => {
    return tasks.map(t => {
      const uName = t.user || t.assignee || t.employee?.fullName || 'Unassigned';
      const deadlineVal = t.deadline || (t.dueDate ? t.dueDate.split('T')[0] : 'N/A');
      return {
        ...t,
        user: uName,
        deadline: deadlineVal,
      };
    });
  }, [tasks]);

  // Filtering Logic
  const filteredTasks = useMemo(() => {
    return resolvedTasks.filter(t => {
      const matchesSearch = (t.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                           t.user.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [resolvedTasks, searchQuery]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.userId) {
      showToast('Mission Title and Lead Agent are required.', 'error');
      return;
    }

    setIsDeploying(true);
    setDeployStep(1); // Initiating

    setTimeout(() => {
      setDeployStep(2); // Securing channels
      
      setTimeout(async () => {
        const assignee = teamMembers.find(m => m.id.toString() === newTask.userId.toString());
        await addTask({
          employeeId: newTask.userId.toString(),
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority || 'Medium',
          dueDate: newTask.deadline,
          status: newTask.status,
        });
        
        setIsDeploying(false);
        setDeployStep(0);
        setShowAddModal(false);
        setNewTask({ title: '', userId: '', priority: 'Medium', deadline: '', status: 'Pending', description: '' });
      }, 1000);
    }, 1200);
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTaskStatus(taskId, newStatus);
    showToast(`Task status updated to ${newStatus}.`, 'success');
    setSelectedTask(null);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Team Task Management</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Oversee work distribution, monitor progress and ensure deadlines are met</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner border border-slate-200">
            <button 
              onClick={() => setViewMode('board')}
              className={cn("p-2 rounded-xl transition-all shadow-sm", viewMode === 'board' ? "bg-white text-primary-600 ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600")}
            >
              <LayoutGrid size={20} />
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={cn("p-2 rounded-xl transition-all shadow-sm", viewMode === 'table' ? "bg-white text-primary-600 ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600")}
            >
              <ListIcon size={20} />
            </button>
          </div>
          <PermissionGate module="tasks" action="create">
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200 active:scale-95"
          >
             <Plus size={18} />
             <span>Create Task</span>
          </button>
          </PermissionGate>
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

      {/* Main View Area */}
      <div className="space-y-6">
         <div className="relative max-w-md">
            <Search className="absolute left-3 top-3.5 text-slate-400" size={18} />
            <input 
               type="text" 
               placeholder="Search missions, assets or players..." 
               className="input-field pl-10 h-12 bg-white shadow-soft font-bold rounded-2xl"
               value={searchQuery || ''}
               onChange={(e) => setSearchQuery(e.target.value)}
            />
         </div>

         {viewMode === 'board' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 items-start auto-rows-max">
              {columns.map((col, idx) => (
                 <div key={idx} className="flex flex-col gap-5 h-full">
                    <div className="flex items-center justify-between px-3">
                       <div className="flex items-center gap-3">
                          <div className={cn("w-2 h-2 rounded-full", col.bg)} />
                          <h3 className="text-[11px] font-black text-slate-900 font-bold dark:text-white">{col.title}</h3>
                       </div>
                       <span className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[9px] font-black shadow-md">
                          {filteredTasks.filter(t => t.status === col.title).length}
                       </span>
                    </div>

                    <div className="space-y-4 min-h-[500px] p-2 rounded-[2.5rem] bg-slate-50/50 border border-transparent hover:border-slate-100 transition-all">
                       {filteredTasks.filter(t => t.status === col.title).map((task) => (
                          <motion.div
                            key={task.id}
                            layoutId={`task-${task.id}`}
                            whileHover={{ y: -4, rotate: 0.5 }}
                            onClick={() => setSelectedTask(task)}
                            className="card p-6 bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all group cursor-pointer text-left relative overflow-hidden"
                          >
                             <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 transform rotate-45 translate-x-16 -translate-y-16 group-hover:rotate-12 transition-transform opacity-30" />
                             
                             <div className="flex justify-between items-start mb-5 relative z-10">
                                <div className={cn(
                                   "text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest border",
                                   task.priority === 'Urgent' ? "bg-rose-50 text-rose-500 border-rose-100" :
                                   task.priority === 'High' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                   "bg-indigo-50 text-indigo-600 border-indigo-100"
                                )}>
                                   {task.priority || 'Medium'}
                                </div>
                                <div className="p-1.5 transition-all text-slate-300 hover:text-slate-900">
                                   <ChevronRight size={16} />
                                </div>
                             </div>
                             
                             <h4 className="text-sm font-black text-slate-900 mb-8 leading-relaxed group-hover:text-primary-600 transition-colors uppercase tracking-tight relative z-10 dark:text-white">
                                {task.title}
                             </h4>
                             
                             <div className="flex items-center justify-between mt-auto relative z-10">
                                <div className="flex items-center gap-2.5">
                                   <div className="w-7 h-7 rounded-xl bg-slate-900 flex items-center justify-center text-[10px] text-white font-black uppercase shadow-lg">
                                      {(() => {
                                        const uName = task.user || task.assignee || '';
                                        const parts = uName.split(' ');
                                        const first = parts[0] ? parts[0][0] : '';
                                        const second = parts[1] ? parts[1][0] : '';
                                        return `${first}${second}`;
                                      })()}
                                   </div>
                                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{task.user || task.assignee || 'Unassigned'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-lg">
                                   <Calendar size={12} className="text-slate-300" />
                                   {task.deadline || task.dueDate || 'N/A'}
                                </div>
                             </div>
                          </motion.div>
                       ))}
                       <button 
                         onClick={() => {
                           setShowAddModal(true);
                           setNewTask({...newTask, status: col.title});
                         }}
                         className="w-full py-5 border-2 border-dashed border-slate-200 rounded-[2rem] text-[10px] font-bold text-slate-400 font-bold hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50/20 transition-all flex items-center justify-center gap-3 group active:scale-95"
                       >
                          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
                          Initialize
                       </button>
                    </div>
                 </div>
              ))}
           </div>
         ) : (
           <ErrorBoundary>
             <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
               <div className="overflow-x-auto text-left">
                  <table className="w-full text-left min-w-[800px]">
                     <thead>
                        <tr className="bg-slate-50/50 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">
                           <th className="px-8 py-5">Mission Detail</th>
                           <th className="px-8 py-5">Assigned Agent</th>
                           <th className="px-8 py-5 text-center">Priority Index</th>
                           <th className="px-8 py-5 text-center">Completion %</th>
                           <th className="px-8 py-5 text-right">Expiration</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                       {filteredTasks.map((task) => (
                          <tr key={task.id} className="group hover:bg-slate-50/30 transition-colors cursor-pointer" onClick={() => setSelectedTask(task)}>
                             <td className="px-8 py-6">
                                <div className="text-left">
                                   <p className="text-sm font-black text-slate-900 mb-1.5 uppercase tracking-tight">{task.title}</p>
                                   <span className="text-[10px] font-black text-slate-400 font-bold flex items-center gap-2">
                                      <div className={cn("w-1.5 h-1.5 rounded-full", columns.find(c => c.title === task.status)?.bg)} />
                                      {task.status}
                                   </span>
                                </div>
                             </td>
                             <td className="px-8 py-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-slate-900 border-2 border-white shadow-md flex items-center justify-center text-[10px] text-white font-black uppercase">
                                       {(() => {
                                         const uName = task.user || task.assignee || '';
                                         const parts = uName.split(' ');
                                         const first = parts[0] ? parts[0][0] : '';
                                         const second = parts[1] ? parts[1][0] : '';
                                         return `${first}${second}`;
                                       })()}
                                    </div>
                                    <span className="text-xs font-black text-slate-700 tracking-tight">{task.user || task.assignee || 'Unassigned'}</span>
                                 </div>
                             </td>
                              <td className="px-8 py-6 text-center">
                                 <span className={cn(
                                    "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                    task.priority === 'High' ? "bg-rose-50 text-rose-500 border-rose-100" :
                                    task.priority === 'Medium' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                    "bg-slate-100 text-slate-500 border-slate-200"
                                 )}>{task.priority || 'Medium'}</span>
                              </td>
                             <td className="px-8 py-6">
                                <div className="flex items-center justify-center gap-4">
                                   <div className="flex-1 max-w-[100px] h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50 p-[1px] shadow-inner">
                                      <motion.div initial={{ width: 0 }} animate={{ width: `${task.progress || 0}%` }} className="h-full bg-primary-600 rounded-full shadow-lg shadow-primary-200" />
                                   </div>
                                   <span className="text-[11px] font-black text-slate-900 tabular-nums">{task.progress || 0}%</span>
                                </div>
                             </td>
                             <td className="px-8 py-6 text-right">
                                <div className="flex flex-col items-end">
                                   <p className="text-xs font-black text-slate-700 tracking-tight">{task.deadline || task.dueDate || 'N/A'}</p>
                                   <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                      {task.deadline && task.deadline !== 'N/A' && !isNaN(new Date(task.deadline).getTime()) 
                                         ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'long' }).toUpperCase() 
                                         : 'N/A'}
                                   </p>
                                </div>
                             </td>
                          </tr>
                       ))}
                       {filteredTasks.length === 0 && (
                          <tr>
                             <td colSpan="5" className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-4 opacity-40">
                                   <Briefcase size={48} className="text-slate-300" />
                                   <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">No matching missions deployed</p>
                                </div>
                             </td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
           </div>
           </ErrorBoundary>
         )}
      </div>

      {/* Task Detail Modal */}
      <CenterModal 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)} 
        title="Mission Intelligence"
      >
         {selectedTask && (
            <div className="p-6 sm:p-10 space-y-8 sm:space-y-12 text-left">
               <div className="p-6 sm:p-10 bg-slate-900 rounded-[2rem] sm:rounded-[3rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-10 opacity-20 transform translate-x-10 -translate-y-10 group-hover:translate-x-5 group-hover:-translate-y-5 transition-transform">
                     <Target size={180} className="text-primary-500" />
                  </div>
                  <div className="relative z-10 text-left">
                     <div className="flex items-center gap-2 mb-4">
                        <Zap size={16} className="text-primary-400 fill-primary-400" />
                        <span className="text-[10px] font-black text-primary-400 uppercase tracking-[0.3em]">Priority {selectedTask.priority}</span>
                     </div>
                     <h3 className="text-4xl font-black text-white tracking-tighter leading-tight max-w-sm">{selectedTask.title}</h3>
                     
                     <div className="mt-8 flex flex-wrap items-center gap-6">
                        <div className="flex items-center gap-3">
                           <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-lg text-white font-black uppercase">
                              {(() => {
                                const uName = selectedTask.user || selectedTask.assignee || '';
                                return uName ? uName[0] : '';
                              })()}
                           </div>
                           <div>
                              <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Operator</p>
                              <p className="text-sm font-black text-white">{selectedTask.user || selectedTask.assignee || 'Unassigned'}</p>
                           </div>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden sm:block" />
                        <div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Deadline</p>
                           <p className="text-sm font-black text-white">{selectedTask.deadline || selectedTask.dueDate || 'N/A'}</p>
                        </div>
                        <div className="h-10 w-px bg-white/10 hidden sm:block" />
                        <div>
                           <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Phase</p>
                           <p className="text-sm font-black text-white">{selectedTask.status}</p>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Progress</label>
                     <span className="text-sm font-black text-slate-900">{selectedTask.progress}%</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-50 shadow-inner">
                     <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${selectedTask.progress}%` }} 
                        className="h-full bg-gradient-to-r from-primary-600 to-indigo-600 rounded-full shadow-lg shadow-primary-200"
                     />
                  </div>
               </div>

               <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                     <MessageSquare size={16} className="text-slate-300" /> Operational Objectives
                  </label>
                  <p className="text-base font-medium text-slate-600 leading-relaxed bg-slate-50 p-6 sm:p-8 rounded-[2rem] italic border border-slate-100">
                     {selectedTask.description ? `"${selectedTask.description}"` : '"No detailed mission scope or deliverables specified."'}
                  </p>
               </div>

               <div className="space-y-4 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Update Status Phase</label>
                  <select 
                    value={selectedTask.status} 
                    onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
                    className="input-field h-12 font-bold appearance-none bg-white dark:bg-slate-900 border border-slate-200"
                  >
                    <option>Pending</option>
                    <option>In Progress</option>
                    <option>Review</option>
                    <option>Completed</option>
                  </select>
               </div>

               <div className="pt-8 border-t border-slate-50 flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => handleStatusChange(selectedTask.id, 'In Progress')}
                    className="flex-1 py-4 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-3"
                  >
                     <RotateCcw size={18} />
                     <span>Reassign (In Progress)</span>
                  </button>
                  <button 
                    onClick={() => handleStatusChange(selectedTask.id, 'Completed')}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-3"
                  >
                     <CheckCircle size={18} />
                     <span>Mark Complete</span>
                  </button>
               </div>
            </div>
         )}
      </CenterModal>

      {/* Deploy Task Modal */}
      <CenterModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        title="Deploy New Mission"
      >
         <form onSubmit={handleAddTask} className="p-6 sm:p-10 space-y-6 sm:space-y-8 text-left">
            <div className="space-y-2 text-left">
               <label className="text-[10px] font-bold text-slate-400 px-1 text-left">Misson Title</label>
               <input 
                 type="text" 
                 placeholder="e.g. Infrastructure Load Testing" 
                 className="input-field h-14 font-bold font-bold"
                 value={newTask.title || ''}
                 onChange={e => setNewTask({...newTask, title: e.target.value})}
               />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 px-1">Lead Agent</label>
                  <select 
                    className="input-field h-14 font-bold appearance-none bg-white"
                    value={newTask.userId || ''}
                    onChange={e => setNewTask({...newTask, userId: e.target.value})}
                  >
                     <option value="">Choose Agent</option>
                     {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
               </div>
                <div className="space-y-2 text-left">
                   <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Priority Class</label>
                   <select 
                     className="input-field h-14 font-bold appearance-none bg-white"
                     value={newTask.priority || 'Medium'}
                     onChange={e => setNewTask({...newTask, priority: e.target.value})}
                   >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                   </select>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 text-left">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Deadline Date</label>
                  <DatePicker  
                    className="input-field h-14 font-bold"
                    value={newTask.deadline || ''}
                    onChange={e => setNewTask({...newTask, deadline: e.target.value})}
                  />
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Initial Status</label>
                  <select 
                    className="input-field h-14 font-bold appearance-none bg-white"
                    value={newTask.status || 'Pending'}
                    onChange={e => setNewTask({...newTask, status: e.target.value})}
                  >
                     <option>Pending</option>
                     <option>In Progress</option>
                     <option>Review</option>
                  </select>
               </div>
            </div>

            <div className="space-y-2 text-left">
               <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Mission Intel & Deliverables</label>
               <textarea 
                  className="input-field min-h-[120px] py-4 bg-white border-slate-200 resize-none font-medium" 
                  placeholder="Define the scope and expected results..."
                  value={newTask.description || ''}
                  onChange={e => setNewTask({...newTask, description: e.target.value})}
               ></textarea>
            </div>

            <div className="pt-6 flex flex-col gap-4 text-left">
               <button 
                 type="submit" 
                 disabled={isDeploying}
                 className="btn-primary w-full py-4 font-bold shadow-xl shadow-primary-200 active:scale-[0.98] disabled:bg-primary-300 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
               >
                 {isDeploying ? (
                    <>
                       <Loader2 size={18} className="animate-spin" />
                       {deployStep === 1 ? 'Initiating Deployment...' : 'Securing Channels...'}
                    </>
                 ) : (
                    <>Deploy Mission</>
                 )}
               </button>
               {!isDeploying && (
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)} 
                    className="w-full py-4 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Abort Deployment
                  </button>
               )}
            </div>
         </form>
      </CenterModal>
    </div>
  );
};

export default Tasks;
