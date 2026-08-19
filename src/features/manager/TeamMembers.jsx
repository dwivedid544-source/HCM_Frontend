import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Plus,
  Download,
  Filter,
  RotateCcw,
  Eye,
  CheckCircle2,
  Calendar,
  Star,
  ArrowRight,
  ShieldCheck,
  Clock,
  X,
  Mail,
  Phone,
  Briefcase,
  Target,
  BarChart3,
  TrendingUp,
  MapPin,
  ExternalLink,
  MessageSquare,
  FileText,
  LayoutGrid,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import PermissionGate from '../../shared/components/common/PermissionGate';
import { useDateFormat } from '../../hooks/useDateFormat';
import { useCurrency } from '../../hooks/useCurrency';
import DatePicker from '../../shared/components/common/DatePicker';
import Button from '../../shared/components/ui/Button';
import IconButton from '../../shared/components/ui/IconButton';
import PageHeader from '../../shared/components/ui/PageHeader';
import EmptyState from '../../shared/components/ui/EmptyState';


const TeamMembers = () => {
  const { teamMembers, addTeamMember, tasks, kpis, attendance, showToast, orgEmployees, addKpi, addReview, profile, assignTask, requestSalaryIncrement } = useManager();
  const { formatDate } = useDateFormat();
  const { formatCurrency } = useCurrency();

  // UI States
  const [selectedMember, setSelectedMember] = useState(null);
  const [profileTab, setProfileTab] = useState('summary');
  const [isExporting, setIsExporting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  // Form State
  const [newMember, setNewMember] = useState({ name: '', email: '', role: '', department: 'Engineering', phone: '', joinDate: '' });

  // Goal & Review Modals State
  const [showAssignGoalModal, setShowAssignGoalModal] = useState(false);
  const [showInitiateReviewModal, setShowInitiateReviewModal] = useState(false);

  // Goal Form State
  const [newGoal, setNewGoal] = useState({ title: '', category: 'Productivity', priority: 'Medium', deadline: '' });

  // Review Form State
  const [newReview, setNewReview] = useState({ period: 'Q4 2026', type: 'Quarterly', rating: 5, strengths: '', improvement: '', summary: '' });

  // Task Modal & Form State
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'Medium', deadline: '' });

  // Notes State
  const [notesList, setNotesList] = useState([]);
  const [noteText, setNoteText] = useState('');

  // Increment Modal State
  const [showIncrementModal, setShowIncrementModal] = useState(false);
  const [incrementReq, setIncrementReq] = useState({ requestedSalary: '', effectiveDate: '', reason: '' });

  // Filtering Logic
  const filteredTeam = useMemo(() => {
    return teamMembers.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDept = deptFilter ? m.department === deptFilter : true;
      const matchesRating = ratingFilter ? m.rating >= parseFloat(ratingFilter) : true;
      return matchesSearch && matchesDept && matchesRating;
    });
  }, [teamMembers, searchQuery, deptFilter, ratingFilter]);

  const summaryMetrics = useMemo(() => {
    if (!selectedMember) return { taskRatio: '0 / 0', reliability: '100%' };
    const userTasks = tasks.filter(t => t.employeeId === selectedMember.id);
    const completedTasks = userTasks.filter(t => t.status === 'Completed').length;
    const totalTasks = userTasks.length;
    const taskRatio = `${completedTasks} / ${totalTasks}`;

    const userAttendance = attendance.filter(a => a.userId === selectedMember.userId);
    const presentDays = userAttendance.filter(a => a.status === 'Present' || a.status === 'Clocked In').length;
    const totalDays = userAttendance.length;
    const reliability = totalDays > 0 ? `${Math.round((presentDays / totalDays) * 100)}%` : '100%';

    return { taskRatio, reliability };
  }, [selectedMember, tasks, attendance]);

  useEffect(() => {
    if (selectedMember) {
      const saved = localStorage.getItem(`manager_notes_${selectedMember.id}`);
      setNotesList(saved ? JSON.parse(saved) : [
        { text: "Candidate for Senior Lead promotion by end of Year. Consistently mentors juniors.", author: "Michael Scott", date: "Oct 12, 2026" }
      ]);
    }
  }, [selectedMember]);

  const resetFilters = () => {
    setSearchQuery('');
    setDeptFilter('');
    setRatingFilter('');
  };

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMember.name || !newMember.email || !newMember.role) {
      showToast('Please fill in required fields.', 'error');
      return;
    }
    addTeamMember({ ...newMember, status: 'Online', rating: 0, img: '' });
    setShowAddModal(false);
    setNewMember({ name: '', email: '', role: '', department: 'Engineering', phone: '', joinDate: '' });
    showToast(`${newMember.name} added to the team.`);
  };

  const handleAssignGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title || !newGoal.deadline) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    await addKpi({
      title: newGoal.title,
      assignedTo: selectedMember.name,
      employeeId: selectedMember.id,
      progress: 0,
      status: 'On Track',
      priority: newGoal.priority,
      deadline: newGoal.deadline,
      category: newGoal.category
    });
    setShowAssignGoalModal(false);
    setNewGoal({ title: '', category: 'Productivity', priority: 'Medium', deadline: '' });
    setProfileTab('kpi');
  };

  const handleInitiateReviewSubmit = async (e) => {
    e.preventDefault();
    await addReview({
      employeeId: selectedMember.id,
      name: selectedMember.name,
      role: selectedMember.role,
      period: newReview.period,
      type: newReview.type,
      rating: Number(newReview.rating),
      status: 'Draft',
      strengths: newReview.strengths || '',
      improvement: newReview.improvement || '',
      summary: newReview.summary || ''
    });
    setShowInitiateReviewModal(false);
    setNewReview({ period: 'Q4 2026', type: 'Quarterly', rating: 5, strengths: '', improvement: '', summary: '' });
    showToast(`Review cycle initiated for ${selectedMember.name}`);
  };

  const handleRequestIncrement = async (e) => {
    e.preventDefault();
    if (!incrementReq.requestedSalary || !incrementReq.effectiveDate) {
      showToast('Please fill in required fields.', 'error');
      return;
    }
    await requestSalaryIncrement({
      employeeId: selectedMember.id,
      requestedSalary: Number(incrementReq.requestedSalary),
      effectiveDate: incrementReq.effectiveDate,
      reason: incrementReq.reason
    });
    setShowIncrementModal(false);
    setIncrementReq({ requestedSalary: '', effectiveDate: '', reason: '' });
  };

  const handlePostNote = () => {
    if (!noteText.trim()) return;
    const newNote = {
      text: noteText,
      author: profile?.fullName || "Manager",
      date: formatDate(new Date())
    };
    const updated = [newNote, ...notesList];
    setNotesList(updated);
    localStorage.setItem(`manager_notes_${selectedMember.id}`, JSON.stringify(updated));
    setNoteText('');
    showToast('Internal note posted successfully');
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title || !newTask.deadline) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }
    await assignTask({
      employeeId: selectedMember.id,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      dueDate: newTask.deadline
    });
    setShowAssignTaskModal(false);
    setNewTask({ title: '', description: '', priority: 'Medium', deadline: '' });
    setProfileTab('tasks');
  };

  const handleExport = () => {
    setIsExporting(true);
    showToast('Preparing team roster database...', 'info');
    setTimeout(() => {
      try {
        const headers = ['Name', 'Email', 'Role', 'Department', 'Phone', 'Join Date', 'Status'];
        const rows = teamMembers.map(m => [
          `"${m.name}"`,
          `"${m.email}"`,
          `"${m.role}"`,
          `"${m.department}"`,
          `"${m.phone || 'N/A'}"`,
          `"${m.joinDate || 'N/A'}"`,
          `"${m.status}"`
        ]);
        const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `team_members_export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast('Team roster database exported successfully!', 'success');
      } catch (err) {
        showToast('Error exporting team members', 'error');
      } finally {
        setIsExporting(false);
      }
    }, 1500);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      {/* Header Section */}
      <PageHeader
        title="Team Members"
        subtitle="Manage your team's access, view performance and assign roles"
      >
        <PermissionGate module="team_members" action="manage">
          <Button variant="secondary" leftIcon={Download} isLoading={isExporting} onClick={handleExport}>
            Export List
          </Button>
        </PermissionGate>
        <PermissionGate module="team_members" action="create">
          <Button variant="primary" leftIcon={Plus} onClick={() => setShowAddModal(true)}>
            Add Member
          </Button>
        </PermissionGate>
      </PageHeader>

      {/* Filter Bar */}
      <div className="card p-6 border-none bg-white shadow-soft flex flex-col lg:flex-row items-center gap-4 overflow-visible">
        <div className="relative flex-1 w-full text-slate-400">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name, email or role..."
            className="input-field pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <select
            className="input-field h-11 pr-10 w-full sm:w-44 font-bold text-slate-600 appearance-none bg-no-repeat bg-[right_1rem_center]"
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Design">Design</option>
            <option value="Marketing">Marketing</option>
          </select>
          <select
            className="input-field h-11 pr-10 w-full sm:w-36 font-bold text-slate-600 appearance-none bg-no-repeat bg-[right_1rem_center]"
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
          >
            <option value="">All Ratings</option>
            <option value="4.5">4.5+ ★</option>
            <option value="4.0">4.0+ ★</option>
            <option value="3.5">3.5+ ★</option>
          </select>
          <IconButton
            icon={RotateCcw}
            variant="ghost"
            tooltip="Reset Filters"
            onClick={resetFilters}
            className="h-11 w-11 border border-slate-100 dark:border-slate-800"
          />
        </div>
      </div>

      {/* Team Table */}
      <div className="card p-0 border-none bg-white dark:bg-slate-900 shadow-soft overflow-hidden">
        <div className="overflow-x-auto text-left">
          <table className="hcm-table">
            <thead className="hcm-thead">
              <tr>
                <th className="hcm-th">Member Info</th>
                <th className="hcm-th">Position / Dept</th>
                <th className="hcm-th text-center">Avg Rating</th>
                <th className="hcm-th text-center">Status</th>
                <th className="hcm-th text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {filteredTeam.map((user) => (
                <tr key={user.id} className="hcm-tr">
                  <td className="hcm-td">
                    <div className="flex items-center gap-4">
                      <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-200 ring-2 ring-white shadow-sm">
                        <Avatar src={user.img} alt={user.name} className="w-full h-full object-cover rounded-2xl" />
                        <div className={cn(
                          "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm",
                          user.status === 'Online' || user.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-300'
                        )} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white leading-none">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hcm-td">
                    <p className="font-bold text-slate-700 dark:text-slate-300 leading-none">{user.role}</p>
                    <p className="text-[10px] font-black text-slate-400 mt-2 uppercase tracking-widest">{user.department}</p>
                  </td>
                  <td className="hcm-td">
                    <div className="flex items-center justify-center gap-1.5">
                      <Star size={14} className={cn("fill-amber-400", user.rating > 0 ? "text-amber-400" : "text-slate-200")} />
                      <span className="font-black text-slate-900 dark:text-white">{user.rating || '-'}</span>
                    </div>
                  </td>
                  <td className="hcm-td text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                      user.status === 'Active' || user.status === 'Online' ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" : "bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-800"
                    )}>{user.status}</span>
                  </td>
                  <td className="hcm-td text-right">
                    <IconButton
                      icon={Eye}
                      variant="ghost"
                      tooltip="View Details"
                      onClick={() => setSelectedMember(user)}
                    />
                  </td>
                </tr>
              ))}
              {filteredTeam.length === 0 && (
                <tr>
                  <td colSpan="5" className="hcm-td">
                    <EmptyState
                      icon={Users}
                      title="No team members found"
                      description="No team members match your active search filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>


      {/* Member Profile Modal */}
      <CenterModal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title="Member Performance Profile"
        maxWidth="max-w-4xl"
      >
        {selectedMember && (
          <div className="flex flex-col h-full overflow-hidden">
            {/* Hero Section */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row items-center gap-6 bg-slate-50/50">
              <Avatar src={selectedMember.img} alt={selectedMember.name} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white shadow-lg" />
              <div className="text-center md:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-1.5">
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight dark:text-white">{selectedMember.name}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded border border-emerald-100">
                    {selectedMember.status}
                  </span>
                </div>
                <p className="text-primary-600 font-black uppercase tracking-[0.15em] text-[10px] pb-2 border-b border-white pr-3 inline-block">{selectedMember.role}</p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Mail size={14} /> <span className="text-xs sm:text-sm font-bold">{selectedMember.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone size={14} /> <span className="text-xs sm:text-sm font-bold">{selectedMember.phone || ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={14} /> <span className="text-xs sm:text-sm font-bold">San Francisco, CA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1.5 px-6 border-b border-slate-100 bg-white overflow-x-auto hide-scrollbar">
              {[
                { id: 'summary', label: 'Summary', icon: LayoutGrid },
                { id: 'attendance', label: 'Attendance', icon: Clock },
                { id: 'tasks', label: 'Team Tasks', icon: CheckCircle2 },
                { id: 'kpi', label: 'KPI Index', icon: Target },
                { id: 'notes', label: 'Internal Notes', icon: MessageSquare }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 sm:py-3.5 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                    profileTab === tab.id ? "text-primary-600 border-primary-600" : "text-slate-400 border-transparent hover:text-slate-600"
                  )}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-5 sm:p-6 flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {profileTab === 'summary' && (
                  <motion.div key="summary" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 text-left">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                      <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] font-bold text-slate-400 font-bold mb-1.5">Performance</p>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-slate-900">{selectedMember.rating || 'N/A'}</span>
                          <Star size={14} className="text-amber-400 fill-amber-400 ml-1" />
                        </div>
                      </div>
                      <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] font-black text-slate-400 font-bold mb-1.5">Task Ratio</p>
                        <span className="text-2xl font-black text-slate-900">{summaryMetrics.taskRatio}</span>
                      </div>
                      <div className="p-4 sm:p-5 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-center items-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Reliability</p>
                        <span className="text-2xl font-black text-emerald-600">{summaryMetrics.reliability}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-slate-400 border-b border-slate-50 pb-3">Professional Insight</h4>
                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic">
                        "{selectedMember.name} has been a core member of the {selectedMember.department} team since their joining. Demonstrates high adaptability and consistent delivery quality in agile sprints."
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8 pt-4">
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                        <p className="text-sm font-bold text-slate-800">{selectedMember.department}</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Joining Date</label>
                        <p className="text-sm font-bold text-slate-800">{selectedMember.joinDate || 'Jan 15, 2023'}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {profileTab === 'attendance' && (() => {
                  const userAttendance = attendance.filter(a => a.userId === selectedMember.userId);
                  const presentDays = userAttendance.filter(a => a.status === 'Present' || a.status === 'Clocked In').length;
                  const totalDays = userAttendance.length || 1;
                  const eff = userAttendance.length > 0 ? Math.round((presentDays / totalDays) * 100) : 0;
                  return (
                    <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                      <div className="card p-4 sm:p-5 bg-slate-900 border-none shadow-lg text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="flex items-center justify-between relative z-10">
                          <div>
                            <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-1">Monthly Attendance Score</p>
                            <h4 className="text-2xl font-black tracking-tight">{userAttendance.length === 0 ? 'N/A' : `${eff}% Efficiency`}</h4>
                          </div>
                          <TrendingUp size={28} className="text-primary-500 opacity-20" />
                        </div>
                      </div>
                      <div className="grid grid-cols-7 gap-2">
                        {Array.from({ length: 31 }).map((_, i) => {
                          const dayAtt = userAttendance.find(a => new Date(a.date).getDate() === i + 1);
                          const isPresent = dayAtt && (dayAtt.status === 'Present' || dayAtt.status === 'Clocked In');
                          return (
                            <div key={i} className={cn(
                              "aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border border-slate-100",
                              !dayAtt ? "bg-slate-50 opacity-40 text-slate-300" : isPresent ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                            )}>
                              <span className="text-[9px] font-black opacity-40">{i + 1}</span>
                              <CheckCircle2 size={12} className={!dayAtt ? "hidden" : "block"} />
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })()}

                {profileTab === 'tasks' && (
                  <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4 text-left">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-bold text-slate-400">Current Assignments</h4>
                      <button 
                        onClick={() => setShowAssignTaskModal(true)}
                        className="text-[10px] font-bold text-primary-500 uppercase hover:underline"
                      >
                        Assign Task
                      </button>
                    </div>
                    {tasks.filter(t => t.employeeId === selectedMember.id).map((task, i) => (
                      <div key={i} className="p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group">
                        <div className="flex items-center justify-between mb-2 text-left">
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-800 line-clamp-1">{task.title}</p>
                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 font-bold">Due {task.dueDate ? formatDate(task.dueDate) : 'N/A'} • {task.priority || 'Medium'} Priority</p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs font-black text-slate-900">{task.status}</span>
                          </div>
                        </div>
                        <div className="w-full h-1 bg-white rounded-full overflow-hidden p-[1px]">
                          <div className="h-full bg-primary-600 rounded-full" style={{ width: task.status === 'Completed' ? '100%' : task.status === 'In Progress' ? '50%' : '0%' }} />
                        </div>
                      </div>
                    ))}
                    {tasks.filter(t => t.employeeId === selectedMember.id).length === 0 && (
                      <p className="text-xs text-slate-500 font-bold mt-4">No active tasks.</p>
                    )}
                  </motion.div>
                )}

                {profileTab === 'kpi' && (
                  <motion.div key="kpi" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                    <div className="p-4 sm:p-5 bg-indigo-50 border border-indigo-100 rounded-2xl text-center">
                      <h4 className="text-2xl font-black text-indigo-900 mb-1">Elite Performer</h4>
                      <p className="text-xs font-bold text-indigo-600 font-bold">Calculated across core metrics</p>
                    </div>
                    <div className="space-y-4">
                      {kpis.filter(k => k.employeeId === selectedMember.id).map((m, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                          <span className="text-[10px] font-bold text-slate-400 w-full sm:w-40 shrink-0 truncate">{m.title}</span>
                          <div className="flex-1 flex items-center gap-4 w-full">
                            <div className="flex-1 h-3 bg-slate-50 border border-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 rounded-full shadow-[0_0_8px_rgba(79,70,229,0.3)]" style={{ width: `${m.progress || 0}%` }} />
                            </div>
                            <span className="text-xs font-black text-slate-900 w-10 text-right shrink-0">{m.progress || 0}%</span>
                          </div>
                        </div>
                      ))}
                      {kpis.filter(k => k.employeeId === selectedMember.id).length === 0 && (
                        <p className="text-xs text-slate-500 font-bold mt-4">No active KPIs.</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {profileTab === 'notes' && (
                  <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                    <textarea
                      placeholder="Add internal performance notes for this member..."
                      className="w-full h-28 input-field py-3 resize-none font-medium text-slate-700 bg-slate-50 border-transparent placeholder:text-slate-300 text-sm"
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                    />
                    <div className="flex justify-end">
                      <button 
                        onClick={handlePostNote}
                        className="btn-primary px-4 py-2 font-bold text-xs font-bold"
                      >
                        Post Internal Note
                      </button>
                    </div>
                    <div className="space-y-3 pt-3 border-t border-slate-50">
                      {notesList.map((note, index) => (
                        <div key={index} className="p-3 bg-slate-50 rounded-xl text-left italic relative group">
                          <p className="text-xs text-slate-500 leading-relaxed font-medium">"{note.text}"</p>
                          <p className="text-[9px] font-bold text-slate-400 mt-1.5 font-bold">— {note.author}, {note.date}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 shrink-0">
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowAssignGoalModal(true); }}
                className="flex-1 py-2.5 sm:py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <Target size={16} />
                <span>Assign New Goal</span>
              </button>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowInitiateReviewModal(true); }}
                className="flex-1 py-2.5 sm:py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <BarChart3 size={16} />
                <span>Initiate Review</span>
              </button>
              <button 
                type="button"
                onClick={(e) => { e.stopPropagation(); setShowIncrementModal(true); }}
                className="flex-1 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm"
              >
                <TrendingUp size={16} />
                <span>Request Increment</span>
              </button>
            </div>
          </div>
        )}
      </CenterModal>

      {/* Add Member Modal */}
      <CenterModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Team Member"
      >
        <form onSubmit={handleAddMember} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
            <div className="space-y-2 text-left sm:col-span-2">
              <label className="text-[10px] font-bold text-slate-400 px-1 text-left">Select Employee</label>
              <select
                className="input-field h-11 sm:h-12 font-bold appearance-none bg-white text-sm"
                value={newMember.id || ''}
                onChange={e => {
                  // Use the orgEmployees variable from the component scope
                  const emp = orgEmployees?.find(emp => emp.id === e.target.value);
                  if (emp) {
                    setNewMember({
                      id: emp.id,
                      name: emp.fullName,
                      email: emp.user?.email || '',
                      role: emp.user?.role || 'EMPLOYEE',
                      department: emp.department?.name || 'Engineering',
                      phone: emp.phone || '',
                      joinDate: emp.joiningDate ? emp.joiningDate.split('T')[0] : ''
                    });
                  } else {
                    setNewMember({ id: '', name: '', email: '', role: '', department: 'Engineering', phone: '', joinDate: '' });
                  }
                }}
              >
                <option value="">-- Select an employee to add to your team --</option>
                {orgEmployees?.map(emp => (
                  <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.user?.email})</option>
                ))}
              </select>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-bold font-bold text-slate-400 px-1 text-left">Work Email</label>
              <input
                type="email"
                placeholder="pam@globaltech.ai"
                className="input-field h-11 sm:h-12 font-semibold text-sm"
                value={newMember.email}
                onChange={e => setNewMember({ ...newMember, email: e.target.value })}
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 text-left">Primary Role</label>
              <input
                type="text"
                placeholder="e.g. Sales Representative"
                className="input-field h-11 sm:h-12 font-semibold text-sm"
                value={newMember.role}
                onChange={e => setNewMember({ ...newMember, role: e.target.value })}
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 text-left">Department</label>
              <select
                className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white text-sm"
                value={newMember.department}
                onChange={e => setNewMember({ ...newMember, department: e.target.value })}
              >
                <option>Engineering</option>
                <option>Product</option>
                <option>Design</option>
                <option>Sales</option>
                <option>HR</option>
              </select>
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 text-left">Phone Number</label>
              <PhoneInput
                name="phone"
                value={newMember.phone}
                onChange={e => setNewMember({ ...newMember, phone: e.target.value })}
                className="h-11 sm:h-12 font-semibold text-sm"
              />
            </div>
            <div className="space-y-2 text-left">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1 text-left">Joining Date</label>
              <DatePicker 
                className="input-field h-11 sm:h-12 font-semibold text-sm"
                value={newMember.joinDate}
                onChange={e => setNewMember({ ...newMember, joinDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button type="submit" className="btn-primary w-full py-2.5 sm:py-3 font-bold shadow-md shadow-primary-100 text-sm">Confirm Onboarding</button>
            <button
              type="button"
              onClick={() => setShowAddModal(false)}
              className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 transition-colors"
            >Cancel Registration</button>
          </div>
        </form>
      </CenterModal>

      {/* Assign Goal Modal */}
      <CenterModal
        isOpen={showAssignGoalModal}
        onClose={() => setShowAssignGoalModal(false)}
        title={`Assign Goal: ${selectedMember?.name}`}
      >
        <form onSubmit={handleAssignGoal} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 px-1">Goal/Objective Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Complete Q4 API Refactoring"
              className="input-field h-11 sm:h-12 font-bold text-sm"
              value={newGoal.title}
              onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-bold text-slate-400 px-1">Category</label>
              <select
                className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white text-sm"
                value={newGoal.category}
                onChange={e => setNewGoal({ ...newGoal, category: e.target.value })}
              >
                <option>Productivity</option>
                <option>Quality</option>
                <option>Development</option>
                <option>Sales</option>
                <option>Operations</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Priority Strategy</label>
              <select
                className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white text-sm"
                value={newGoal.priority}
                onChange={e => setNewGoal({ ...newGoal, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Deadline Date</label>
            <DatePicker 
              required
              className="input-field h-11 sm:h-12 font-semibold text-sm"
              value={newGoal.deadline}
              onChange={e => setNewGoal({ ...newGoal, deadline: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowAssignGoalModal(false)} className="flex-1 btn-secondary text-xs px-3 py-2">Discard</button>
            <button type="submit" className="flex-1 btn-primary text-xs px-3 py-2">Create Goal</button>
          </div>
        </form>
      </CenterModal>

      {/* Initiate Review Modal */}
      <CenterModal
        isOpen={showInitiateReviewModal}
        onClose={() => setShowInitiateReviewModal(false)}
        title={`Initiate Performance Review: ${selectedMember?.name}`}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleInitiateReviewSubmit} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 px-1">Review Period</label>
              <select
                className="input-field h-11 sm:h-12 font-bold appearance-none bg-white text-sm"
                value={newReview.period}
                onChange={e => setNewReview({ ...newReview, period: e.target.value })}
              >
                <option>Q1 2026</option>
                <option>Q2 2026</option>
                <option>Q3 2026</option>
                <option>Q4 2026</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold font-bold text-slate-400 px-1">Type</label>
              <select
                className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white text-sm"
                value={newReview.type}
                onChange={e => setNewReview({ ...newReview, type: e.target.value })}
              >
                <option>Quarterly</option>
                <option>Semi-Annual</option>
                <option>Annual</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Rating score (1-5)</label>
              <input
                type="number"
                min="1"
                max="5"
                step="0.5"
                required
                className="input-field h-11 sm:h-12 font-semibold text-sm"
                value={newReview.rating}
                onChange={e => setNewReview({ ...newReview, rating: parseFloat(e.target.value) })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Core Strengths</label>
            <textarea
              rows="2"
              placeholder="List out performance strengths..."
              className="w-full input-field py-3 resize-none font-medium text-slate-700 bg-slate-50 border-transparent text-sm"
              value={newReview.strengths}
              onChange={e => setNewReview({ ...newReview, strengths: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Areas of Improvement</label>
            <textarea
              rows="2"
              placeholder="Highlight areas that need focus..."
              className="w-full input-field py-3 resize-none font-medium text-slate-700 bg-slate-50 border-transparent text-sm"
              value={newReview.improvement}
              onChange={e => setNewReview({ ...newReview, improvement: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Evaluation Summary</label>
            <textarea
              rows="3"
              placeholder="Provide a detailed evaluation summary..."
              className="w-full input-field py-3 resize-none font-medium text-slate-700 bg-slate-50 border-transparent text-sm"
              value={newReview.summary}
              onChange={e => setNewReview({ ...newReview, summary: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowInitiateReviewModal(false)} className="flex-1 btn-secondary text-xs px-3 py-2">Discard</button>
            <button type="submit" className="flex-1 btn-primary text-xs px-3 py-2">Submit Review</button>
          </div>
        </form>
      </CenterModal>

      {/* Increment Request Modal */}
      <CenterModal
        isOpen={showIncrementModal}
        onClose={() => setShowIncrementModal(false)}
        title={`Request Increment: ${selectedMember?.name}`}
      >
        <form onSubmit={handleRequestIncrement} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left">
          {selectedMember?.compensationProfile?.monthlyCTC && (
            <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-indigo-400">Current Monthly Salary</p>
                <p className="text-xl font-bold text-indigo-900 mt-1">{formatCurrency(selectedMember.compensationProfile.monthlyCTC)}</p>
              </div>
              <TrendingUp className="text-indigo-200" size={32} />
            </div>
          )}
          <div className="space-y-2">
            <label className="text-[10px] font-black font-bold text-slate-400 px-1">Requested Monthly Salary ($)</label>
            <input
              type="number"
              required
              min="0"
              placeholder="e.g. 5000"
              className="input-field h-11 sm:h-12 font-bold text-sm"
              value={incrementReq.requestedSalary}
              onChange={e => setIncrementReq({ ...incrementReq, requestedSalary: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Effective Date</label>
            <DatePicker 
              required
              className="input-field h-11 sm:h-12 font-semibold text-sm"
              value={incrementReq.effectiveDate}
              onChange={e => setIncrementReq({ ...incrementReq, effectiveDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Reason for Increment</label>
            <textarea
              className="input-field py-3 min-h-[100px] resize-none font-semibold text-sm"
              placeholder="e.g. Exceptional performance in Q3, taking on lead responsibilities..."
              value={incrementReq.reason}
              onChange={e => setIncrementReq({ ...incrementReq, reason: e.target.value })}
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowIncrementModal(false)} className="flex-1 btn-secondary text-xs px-3 py-2">Cancel</button>
            <button type="submit" className="flex-1 btn-primary text-xs px-3 py-2">Request Increment</button>
          </div>
        </form>
      </CenterModal>

      {/* Assign Task Modal */}
      <CenterModal
        isOpen={showAssignTaskModal}
        onClose={() => setShowAssignTaskModal(false)}
        title={`Assign Task: ${selectedMember?.name}`}
      >
        <form onSubmit={handleCreateTask} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-slate-400 px-1">Task Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Write unit tests for auth middleware"
              className="input-field h-11 sm:h-12 font-bold text-sm"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold font-bold text-slate-400 px-1">Description (Optional)</label>
            <textarea
              rows="3"
              placeholder="Provide context and requirements..."
              className="w-full input-field py-3 resize-none font-medium text-slate-700 bg-slate-50 border-transparent text-sm"
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Priority Strategy</label>
              <select
                className="input-field h-11 sm:h-12 font-semibold appearance-none bg-white text-sm"
                value={newTask.priority}
                onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Due Date</label>
              <DatePicker 
                required
                className="input-field h-11 sm:h-12 font-semibold text-sm"
                value={newTask.deadline}
                onChange={e => setNewTask({ ...newTask, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setShowAssignTaskModal(false)} className="flex-1 btn-secondary text-xs px-3 py-2">Discard</button>
            <button type="submit" className="flex-1 btn-primary text-xs px-3 py-2">Assign Task</button>
          </div>
        </form>
      </CenterModal>
    </div>
  );
};

export default TeamMembers;
