import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { 
  Plus, Search, Calendar, Clock, Video, User, 
  ChevronRight, CheckCircle2, X, RotateCcw, 
  CalendarDays, Trash2, ChevronLeft, Filter,
  AlertTriangle, Loader2, Phone, Link2, Edit3
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import DatePicker from '../../shared/components/common/DatePicker';
import { usePersistedTab } from '../../hooks/usePersistedTab';

// ─── Helper: format time for display ───
const formatDisplayTime = (timeStr) => {
  if (!timeStr) return '';
  if (typeof timeStr === 'string' && timeStr.includes(':')) {
    const parts = timeStr.trim().split(':');
    const hour = parseInt(parts[0], 10);
    const minute = String(parts[1] || '00').slice(0, 2).padStart(2, '0');
    if (isNaN(hour)) return timeStr;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minute} ${ampm}`;
  }
  return timeStr;
};

// ─── Helper: convert to YYYY-MM-DD for comparisons ───
const toDateKey = (dateInput) => {
  if (!dateInput) return '';
  if (typeof dateInput === 'string') {
    const trimmed = dateInput.trim();
    // 1. Check YYYY-MM-DD
    const ymdMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
    if (ymdMatch) {
      return `${ymdMatch[1]}-${ymdMatch[2].padStart(2, '0')}-${ymdMatch[3].padStart(2, '0')}`;
    }
    // 2. Check DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = trimmed.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
    if (dmyMatch) {
      return `${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}`;
    }
  }
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch { return ''; }
};

// ─── Skeleton Loader ───
const SkeletonRow = () => (
  <tr className="animate-pulse">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-6 py-6">
        <div className={cn("h-4 bg-slate-100 rounded-lg", i === 0 ? "w-40" : "w-24")} />
      </td>
    ))}
  </tr>
);

const InterviewManagement = () => {
  const { interviews, addInterview, updateInterview, deleteInterview, candidates, showToast, loading: ctxLoading, refetch, employees = [] } = useHR();
  const location = useLocation();
  const { formatDate } = useDateFormat();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeView, setActiveView] = usePersistedTab('hr_interviews_view', 'list', 'view');

  const handleViewChange = (mode) => {
    setActiveView(mode);
  };
  const [editingInterview, setEditingInterview] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedCalDay, setSelectedCalDay] = useState(null);

  const [formData, setFormData] = useState({
    candidate: '', role: '', interviewer: '', date: '', time: '', 
    round: 'Technical Round', link: '', type: 'Video Call', status: 'Scheduled'
  });
  const [formErrors, setFormErrors] = useState({});

  // Initial load
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (interviews.length > 0) setIsLoading(false);
  }, [interviews]);

  useEffect(() => {
    if (location.state?.openCreate) {
      handleOpenCreate(location.state.candidate || '');
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // ─── Filtering ───
  const filteredInterviews = useMemo(() => {
    let result = [...interviews];
    if (statusFilter !== 'All') {
      result = result.filter(i => i.status === statusFilter);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(i => 
        (i.candidate || '').toLowerCase().includes(q) ||
        (i.role || '').toLowerCase().includes(q) ||
        (i.interviewer || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [interviews, statusFilter, searchQuery]);

  // ─── Stats ───
  const stats = useMemo(() => {
    const todayK = toDateKey(new Date());
    return [
      { label: "Today's Interviews", value: interviews.filter(i => toDateKey(i.rawDate || i.dateTime || i.date) === todayK).length, icon: Calendar, bg: 'bg-primary-50', color: 'text-primary-600', gradient: 'from-primary-500 to-primary-600' },
      { label: 'Upcoming', value: interviews.filter(i => i.status === 'Scheduled').length, icon: Clock, bg: 'bg-amber-50', color: 'text-amber-600', gradient: 'from-amber-500 to-amber-600' },
      { label: 'Completed', value: interviews.filter(i => i.status === 'Completed').length, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-600', gradient: 'from-emerald-500 to-emerald-600' },
      { label: 'Cancelled', value: interviews.filter(i => i.status === 'Cancelled').length, icon: RotateCcw, bg: 'bg-rose-50', color: 'text-rose-600', gradient: 'from-rose-500 to-rose-600' },
    ];
  }, [interviews]);

  // ─── Form handlers ───
  const handleOpenCreate = useCallback((prefillCandidate = '') => {
    setEditingInterview(null);
    setFormData({ candidate: prefillCandidate, role: '', interviewer: '', date: '', time: '', round: 'Technical Round', link: '', type: 'Video Call', status: 'Scheduled' });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((interview) => {
    setEditingInterview(interview.id);
    setFormData({ 
      candidate: interview.candidate || '',
      role: interview.role || '',
      interviewer: interview.interviewerId || (typeof interview.interviewer === 'string' ? interview.interviewer : ''),
      date: interview.rawDate || interview.date || '',
      time: interview.time || '10:00',
      round: interview.round || 'Technical Round',
      link: interview.link || interview.meetingLink || '',
      type: interview.type || 'Video Call',
      status: interview.status || 'Scheduled',
    });
    setFormErrors({});
    setIsModalOpen(true);
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.candidate.trim()) errors.candidate = 'Candidate name is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.time) errors.time = 'Time is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        interviewerId: formData.interviewer || undefined,
        meetingLink: formData.link || undefined
      };
      if (editingInterview) {
        await updateInterview(editingInterview, payload);
      } else {
        await addInterview(payload);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Scheduled' ? 'Completed' : currentStatus === 'Completed' ? 'Scheduled' : currentStatus;
    await updateInterview(id, { status: newStatus });
  };

  const handleDelete = async (id) => {
    await deleteInterview(id);
    setDeleteConfirm(null);
  };

  // ─── Calendar helpers ───
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(calYear, calMonth, 1).getDay();
  const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const interviewsByDate = useMemo(() => {
    const map = {};
    interviews.forEach(i => {
      const key = toDateKey(i.rawDate || i.dateTime || i.date);
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(i);
      }
    });
    return map;
  }, [interviews]);

  const calendarDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, dateKey, interviews: interviewsByDate[dateKey] || [] });
    }
    return days;
  }, [calYear, calMonth, daysInMonth, firstDayOfWeek, interviewsByDate]);

  const selectedDayInterviews = useMemo(() => {
    if (!selectedCalDay) return [];
    const key = toDateKey(selectedCalDay);
    return interviewsByDate[key] || [];
  }, [selectedCalDay, interviewsByDate]);

  const todayKey = toDateKey(new Date());

  useEffect(() => {
    if (activeView === 'calendar' && !selectedCalDay) {
      const curMonthPrefix = `${calYear}-${String(calMonth + 1).padStart(2, '0')}`;
      const matchingDate = Object.keys(interviewsByDate).find(k => k.startsWith(curMonthPrefix));
      setSelectedCalDay(matchingDate || todayKey);
    }
  }, [activeView, todayKey, selectedCalDay, interviewsByDate, calYear, calMonth]);

  // ─── Status filter tabs ───
  const statusTabs = ['All', 'Scheduled', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6 lg:space-y-8 pb-12 animate-fade-in relative">
      {/* ─── Header ─── */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="hcm-page-title">Interview Scheduling</h1>
            <p className="text-slate-500 font-medium text-sm sm:text-base">Manage interviews and coordinate hiring rounds across teams</p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-white border border-slate-200 p-1 rounded-xl flex shadow-sm">
              <button 
                onClick={() => handleViewChange('list')}
                className={cn("px-3 sm:px-4 py-2 text-sm font-bold rounded-lg transition-all", activeView === 'list' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}
              >
                List
              </button>
              <button 
                onClick={() => handleViewChange('calendar')}
                className={cn("px-3 sm:px-4 py-2 text-sm font-bold rounded-lg transition-all", activeView === 'calendar' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-900")}
              >
                Calendar
              </button>
            </div>
            <button 
              onClick={() => handleOpenCreate()}
              className="btn-primary px-4 sm:px-6 py-3 text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">Schedule Interview</span>
              <span className="sm:hidden">Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -4 }} className="card p-4 lg:p-6 transition-all cursor-default">
            <div className="flex items-center justify-between mb-3 lg:mb-4">
              <div className={cn("p-2.5 lg:p-3 rounded-2xl transition-colors", stat.bg, stat.color)}>
                <stat.icon size={22} className="lg:w-[26px] lg:h-[26px]" />
              </div>
              <span className="text-[9px] lg:text-[10px] font-bold text-slate-400 font-bold leading-none">Real-time</span>
            </div>
            <div>
              <p className="text-[10px] lg:text-sm font-bold text-slate-400 font-bold leading-none mb-1 lg:mb-1.5">{stat.label}</p>
              <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ─── Search & Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by candidate, role, or interviewer..." 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)}
            className="input-field h-11 pl-11 text-sm w-full"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {statusTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={cn(
                "px-3 sm:px-4 py-2 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                statusFilter === tab 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-white text-slate-500 hover:text-slate-900 border border-slate-200 hover:border-slate-300"
              )}
            >
              {tab}
              {tab !== 'All' && (
                <span className="ml-1.5 text-[10px] opacity-70">
                  {tab === 'Scheduled' ? stats[1].value : tab === 'Completed' ? stats[2].value : stats[3].value}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Main Content ─── */}
      {activeView === 'list' ? (
        <div className="card p-0 border-none bg-white shadow-soft overflow-hidden min-h-[300px]">
          {isLoading ? (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 font-bold">Candidate & Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 font-bold hidden md:table-cell">Interviewer</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Round</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          ) : filteredInterviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-slate-400 px-6">
              <Calendar size={48} className="mb-4 opacity-50" />
              <h3 className="text-lg sm:text-xl font-bold text-slate-700 text-center">
                {searchQuery || statusFilter !== 'All' ? 'No interviews match your filters' : 'No interviews scheduled'}
              </h3>
              <p className="text-sm text-slate-400 mt-1 text-center">
                {searchQuery || statusFilter !== 'All' ? 'Try adjusting your search or filters' : 'Click "Schedule Interview" to create one'}
              </p>
              {(searchQuery || statusFilter !== 'All') && (
                <button onClick={() => { setSearchQuery(''); setStatusFilter('All'); }} className="mt-4 px-4 py-2 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-all">
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 font-bold">Candidate & Role</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 font-bold hidden md:table-cell">Interviewer</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Date & Time</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest hidden lg:table-cell">Round</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredInterviews.map((item) => (
                      <motion.tr 
                        key={item.id} 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group hover:bg-slate-50/30 transition-colors"
                      >
                        <td className="px-6 py-5 cursor-pointer" onClick={() => handleOpenEdit(item)}>
                          <div className="flex items-center gap-3">
                            <img src={item.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.candidate)}&background=random&bold=true`} alt={item.candidate} className="w-9 h-9 rounded-xl object-cover ring-2 ring-white shadow-sm" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none group-hover:text-primary-600 transition-colors">{item.candidate}</p>
                              <p className="text-[10px] font-bold text-primary-600 mt-1.5 uppercase tracking-widest">{item.role}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden md:table-cell">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-600">{item.interviewer}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-0.5">
                            <p className="text-sm font-bold text-slate-700">{formatDate(item.date)}</p>
                            <p className="text-xs font-medium text-slate-400">{formatDisplayTime(item.time)}</p>
                          </div>
                        </td>
                        <td className="px-6 py-5 hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-slate-500">
                            <Video size={14} className="opacity-50" />
                            <span className="text-xs font-bold uppercase tracking-wider">{item.round}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <button 
                            onClick={() => handleStatusChange(item.id, item.status)}
                            className={cn(
                              "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95",
                              item.status === 'Scheduled' ? "bg-primary-50 text-primary-600 hover:bg-primary-100" : 
                              item.status === 'Completed' ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : 
                              "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            )}
                          >
                            {item.status}
                          </button>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex justify-end gap-1.5">
                            <button onClick={() => handleOpenEdit(item)} className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="Edit">
                              <Edit3 size={16} />
                            </button>
                            <button onClick={() => { if(item.link) window.open(item.link, '_blank'); else showToast('No meeting link provided', 'error'); }} className="px-3 py-1.5 text-xs font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all shadow-md active:scale-95">Join</button>
                            <button onClick={() => setDeleteConfirm(item.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile card layout */}
              <div className="sm:hidden divide-y divide-slate-100">
                {filteredInterviews.map((item) => (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <img src={item.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.candidate)}&background=random&bold=true`} alt={item.candidate} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white shadow-sm flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div onClick={() => handleOpenEdit(item)} className="cursor-pointer">
                            <p className="text-sm font-bold text-slate-900 leading-tight">{item.candidate}</p>
                            <p className="text-[10px] font-bold text-primary-600 mt-0.5 font-bold">{item.role}</p>
                          </div>
                          <button 
                            onClick={() => handleStatusChange(item.id, item.status)}
                            className={cn(
                              "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex-shrink-0",
                              item.status === 'Scheduled' ? "bg-primary-50 text-primary-600" : 
                              item.status === 'Completed' ? "bg-emerald-50 text-emerald-600" : 
                              "bg-rose-50 text-rose-600"
                            )}
                          >
                            {item.status}
                          </button>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(item.date)}</span>
                          <span className="flex items-center gap-1"><Clock size={12} /> {formatDisplayTime(item.time)}</span>
                          <span className="flex items-center gap-1"><User size={12} /> {item.interviewer}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-3">
                          <button onClick={() => handleOpenEdit(item)} className="flex-1 px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-all text-center">Edit</button>
                          <button onClick={() => { if(item.link) window.open(item.link, '_blank'); else showToast('No meeting link provided', 'error'); }} className="flex-1 px-3 py-1.5 text-xs font-bold bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all text-center">Join</button>
                          <button onClick={() => setDeleteConfirm(item.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* ─── Calendar View ─── */
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 card p-0 border-none bg-white shadow-soft overflow-hidden">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 lg:p-6 border-b border-slate-100">
              <button onClick={() => setCalendarDate(new Date(calYear, calMonth - 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{monthName}</h3>
              <button onClick={() => setCalendarDate(new Date(calYear, calMonth + 1))} className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-slate-100">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="py-3 text-center text-[10px] lg:text-xs font-bold text-slate-400 font-bold">{d}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7">
              {calendarDays.map((cell, idx) => (
                <div
                  key={idx}
                  onClick={() => cell && setSelectedCalDay(cell.dateKey)}
                  className={cn(
                    "min-h-[60px] sm:min-h-[80px] lg:min-h-[100px] p-1 sm:p-2 border-b border-r border-slate-50 transition-all cursor-pointer",
                    cell ? "hover:bg-primary-50/30" : "bg-slate-50/30",
                    cell?.dateKey === selectedCalDay && "bg-primary-50 ring-1 ring-primary-200",
                    cell?.dateKey === todayKey && "bg-amber-50/40"
                  )}
                >
                  {cell && (
                    <>
                      <div className={cn(
                        "text-xs sm:text-sm font-bold mb-1",
                        cell.dateKey === todayKey ? "text-primary-600" : "text-slate-700",
                        cell.dateKey === selectedCalDay && "text-primary-700"
                      )}>
                        {cell.day}
                        {cell.dateKey === todayKey && <span className="ml-1 text-[8px] font-bold text-primary-500 uppercase">Today</span>}
                      </div>
                      {cell.interviews.length > 0 && (
                        <div className="space-y-1 mt-1">
                          {cell.interviews.slice(0, 2).map((intv, i) => (
                            <div key={i} className={cn(
                              "text-[9px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 shadow-xs border",
                              intv.status === 'Scheduled' ? "bg-primary-50 text-primary-700 border-primary-200/70 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-900/40" :
                              intv.status === 'Completed' ? "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/40" :
                              "bg-rose-50 text-rose-700 border-rose-200/70 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/40"
                            )}>
                              <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                              <span className="truncate">{intv.candidate || 'Candidate'}</span>
                            </div>
                          ))}
                          {cell.interviews.length > 2 && (
                            <div className="text-[8px] sm:text-[9px] font-extrabold text-primary-600 pl-1">+{cell.interviews.length - 2} more</div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected day panel */}
          <div className="lg:w-80 xl:w-96 card p-0 border-none bg-white shadow-soft overflow-hidden flex flex-col">
            <div className="p-4 lg:p-6 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {selectedCalDay 
                  ? formatDate(selectedCalDay) 
                  : 'Select a Day'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5 font-medium">
                {selectedCalDay 
                  ? `${selectedDayInterviews.length} interview${selectedDayInterviews.length !== 1 ? 's' : ''}`
                  : 'Click a day on the calendar to view interviews'
                }
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {!selectedCalDay ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <CalendarDays size={48} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No day selected</p>
                </div>
              ) : selectedDayInterviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                  <Calendar size={40} className="mb-3 opacity-30" />
                  <p className="text-sm font-medium">No interviews this day</p>
                  <button 
                    onClick={() => { 
                      handleOpenCreate();
                      setFormData(prev => ({ ...prev, date: selectedCalDay }));
                    }}
                    className="mt-3 px-4 py-2 text-xs font-bold text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-all flex items-center gap-1.5"
                  >
                    <Plus size={14} /> Schedule here
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {selectedDayInterviews.map(intv => (
                    <div key={intv.id} className="p-4 hover:bg-slate-50/50 transition-colors cursor-pointer" onClick={() => handleOpenEdit(intv)}>
                      <div className="flex items-center gap-3">
                        <img src={intv.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(intv.candidate)}&background=random&bold=true`} alt={intv.candidate} className="w-8 h-8 rounded-lg ring-1 ring-white shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate">{intv.candidate}</p>
                          <p className="text-[10px] font-bold text-primary-600 font-bold mt-0.5">{intv.role}</p>
                        </div>
                        <span className={cn(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                          intv.status === 'Scheduled' ? "bg-primary-50 text-primary-600" :
                          intv.status === 'Completed' ? "bg-emerald-50 text-emerald-600" :
                          "bg-rose-50 text-rose-600"
                        )}>
                          {intv.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Clock size={11} /> {formatDisplayTime(intv.time)}</span>
                        <span className="flex items-center gap-1"><User size={11} /> {intv.interviewer}</span>
                        <span className="flex items-center gap-1"><Video size={11} /> {intv.round}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Schedule / Edit Modal ─── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !isSubmitting && setIsModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">{editingInterview ? 'Edit Interview' : 'Schedule New Interview'}</h2>
                <button onClick={() => !isSubmitting && setIsModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={22} /></button>
              </div>
              <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                <div className="p-5 sm:p-8 space-y-6 sm:space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                    {/* Candidate */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Candidate <span className="text-rose-500">*</span></label>
                      <input 
                        list="candidate-list"
                        type="text" 
                        value={formData.candidate} 
                        onChange={e => {
                          const val = e.target.value;
                          const matchedCandidate = (candidates || []).find(c => c.name === val);
                          setFormData(prev => ({
                            ...prev,
                            candidate: val,
                            role: matchedCandidate ? matchedCandidate.role : prev.role
                          }));
                          setFormErrors(p => ({...p, candidate: ''}));
                        }}
                        placeholder="Search or type candidate name" 
                        className={cn("input-field h-12", formErrors.candidate && "ring-2 ring-rose-300 border-rose-300")}
                      />
                      <datalist id="candidate-list">
                        {(candidates || []).map(c => (
                          <option key={c.id} value={c.name}>{c.name} — {c.role}</option>
                        ))}
                      </datalist>
                      {formErrors.candidate && <p className="text-xs text-rose-500 font-medium ml-1">{formErrors.candidate}</p>}
                    </div>

                    {/* Role */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Role</label>
                      <input type="text" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Frontend Engineer" className="input-field h-12" />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Date <span className="text-rose-500">*</span></label>
                      <DatePicker  
                        value={formData.date} 
                        onChange={e => { setFormData({...formData, date: e.target.value}); setFormErrors(p => ({...p, date: ''})); }}
                        className={cn("input-field h-12", formErrors.date && "ring-2 ring-rose-300 border-rose-300")}
                      />
                      {formErrors.date && <p className="text-xs text-rose-500 font-medium ml-1">{formErrors.date}</p>}
                    </div>

                    {/* Time */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Time <span className="text-rose-500">*</span></label>
                      <input 
                        type="time" 
                        value={formData.time} 
                        onChange={e => { setFormData({...formData, time: e.target.value}); setFormErrors(p => ({...p, time: ''})); }}
                        className={cn("input-field h-12", formErrors.time && "ring-2 ring-rose-300 border-rose-300")}
                      />
                      {formErrors.time && <p className="text-xs text-rose-500 font-medium ml-1">{formErrors.time}</p>}
                    </div>

                    {/* Interview Round */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Interview Round</label>
                      <select value={formData.round} onChange={e => setFormData({...formData, round: e.target.value})} className="input-field h-12 appearance-none">
                        <option>HR Screening</option>
                        <option>Technical Round</option>
                        <option>Portfolio Review</option>
                        <option>System Design</option>
                        <option>Culture Fit</option>
                        <option>Final Interview</option>
                      </select>
                    </div>

                    {/* Interview Type */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Type</label>
                      <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="input-field h-12 appearance-none">
                        <option>Video Call</option>
                        <option>Phone Call</option>
                        <option>In-Person</option>
                      </select>
                    </div>

                    {/* Interviewer */}
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-700 ml-1">Interviewer</label>
                      <select 
                        value={formData.interviewer} 
                        onChange={e => setFormData({...formData, interviewer: e.target.value})} 
                        className="input-field h-12 appearance-none"
                      >
                        <option value="">Select Interviewer</option>
                        {employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                        ))}
                      </select>
                    </div>

                    {/* Status (only when editing) */}
                    {editingInterview && (
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Status</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-field h-12 appearance-none">
                          <option>Scheduled</option>
                          <option>Completed</option>
                          <option>Cancelled</option>
                        </select>
                      </div>
                    )}

                    {/* Meeting Link */}
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-1.5">
                        <Link2 size={14} className="text-slate-400" />
                        Meeting Link (Zoom/Meet)
                      </label>
                      <input type="url" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} placeholder="https://zoom.us/j/..." className="input-field h-12" />
                    </div>
                  </div>
                </div>
                <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-500 shrink-0">
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="invite" className="w-5 h-5 rounded accent-primary-600" />
                    <label htmlFor="invite" className="text-xs font-bold cursor-pointer">Send Calendar Invites</label>
                  </div>
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button type="button" onClick={() => !isSubmitting && setIsModalOpen(false)} className="flex-1 sm:flex-none px-6 py-2.5 font-bold hover:bg-white rounded-xl transition-all">Cancel</button>
                    <button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                      {editingInterview ? 'Update Schedule' : 'Confirm Schedule'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ─── */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 max-w-sm w-full text-center">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-rose-500" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-2">Delete Interview?</h3>
              <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The interview will be permanently removed from the system.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-50 transition-all">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2.5 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-all shadow-lg">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InterviewManagement;
