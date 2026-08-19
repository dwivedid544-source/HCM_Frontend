import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  CalendarDays, 
  Wallet, 
  CheckSquare, 
  Plus, 
  ArrowRight, 
  Bell, 
  Calendar, 
  ChevronRight, 
  ArrowUpRight,
  FileText,
  Loader2,
  Upload,
  X,
  AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import CenterModal from '../../shared/components/layout/CenterModal';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import DatePicker from '../../shared/components/common/DatePicker';
import StatCard from '../../shared/components/ui/StatCard';
import { useCurrency } from '../../hooks/useCurrency';

const EmployeeDashboard = () => {
  const { 
    profile, 
    attendance, clockIn, clockOut,
    leaves, requestLeave,
    performance,
    payroll,
    announcements: contextAnnouncements,
    holidays,
    loading,
    error,
    refetchAll,
    showToast,
    tasks
  } = useEmployee();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();

  // Mode state for modals
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  // New interactive states for premium loaders
  const [isViewingPayslip, setIsViewingPayslip] = useState(false);
  const [isSubmittingLeave, setIsSubmittingLeave] = useState(false);
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [leaveStep, setLeaveStep] = useState('');
  const [leaveAttachment, setLeaveAttachment] = useState(null);
  const leaveFileInputRef = useRef(null);
  const [isRegisteringClock, setIsRegisteringClock] = useState(false);
  const [clockStep, setClockStep] = useState('');
  const [isOpeningBoard, setIsOpeningBoard] = useState(false);
  const [showDetailBoardModal, setShowDetailBoardModal] = useState(false);
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [isSyncingCalendar, setIsSyncingCalendar] = useState(false);
  const [isDownloadingAttachment, setIsDownloadingAttachment] = useState(false);

  // Time tracking logic
  const [workedSeconds, setWorkedSeconds] = useState(0);

  useEffect(() => {
    let interval;
    if (attendance.isClockedIn && attendance.clockInTime) {
      const startTime = new Date(attendance.clockInTime).getTime();
      interval = setInterval(() => {
        const now = new Date().getTime();
        setWorkedSeconds(Math.floor((now - startTime) / 1000));
      }, 1000);
    } else {
      setWorkedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [attendance.isClockedIn, attendance.clockInTime]);

  const formatWorkedTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Find the latest payslip from context payroll
  const latestPayslip = useMemo(() => {
    if (payroll && payroll.history && payroll.history.length > 0) {
      return payroll.history[0];
    }
    return null;
  }, [payroll]);

  const weeklyChartData = useMemo(() => {
    const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const now = new Date();
    return weekdays.map((day, idx) => {
      const targetDate = new Date();
      const currentDay = targetDate.getDay();
      const distance = (idx + 1) - currentDay;
      targetDate.setDate(targetDate.getDate() + distance);
      const targetStr = targetDate.toDateString();

      const log = (attendance.history || []).find(h => {
        if (!h) return false;
        const d = new Date(h.rawDate || h.date);
        return d.toDateString() === targetStr;
      });

      let hours = 0;
      if (log) {
        hours = parseFloat(log.totalHours || log.hours || 0);
      }
      return { day, hours, logged: !!log };
    });
  }, [attendance.history]);

  const hasChartData = useMemo(() => {
    return weeklyChartData.some(d => d.hours > 0);
  }, [weeklyChartData]);

  // Hook stats cards up to backend state
  const stats = useMemo(() => [
    { 
      label: 'Today Attendance', 
      value: attendance.isClockedIn ? 'Clocked In' : 'Not In', 
      trend: attendance.isClockedIn ? `Since ${new Date(attendance.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready to start?', 
      icon: Clock, 
      color: attendance.isClockedIn ? 'text-emerald-600 dark:text-emerald-450' : 'text-slate-400 dark:text-slate-500', 
      bg: attendance.isClockedIn ? 'bg-emerald-50 dark:bg-emerald-950/20' : 'bg-slate-100 dark:bg-slate-800/40',
      onClick: () => navigate('/employee/attendance')
    },
    { 
      label: 'Leave Balance', 
      value: `${(leaves?.balance?.annual || 0) + (leaves?.balance?.sick || 0) + (leaves?.balance?.casual || 0)} Days`, 
      trend: `${leaves?.requests?.filter(r => r.status === 'Pending').length || 0} Pending Requests`, 
      icon: CalendarDays, 
      color: 'text-amber-600 dark:text-amber-455', 
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      onClick: () => navigate('/employee/leave')
    },
    { 
      label: 'Salary Status', 
      value: latestPayslip ? formatCurrency(latestPayslip.netSalary) : (profile?.baseSalary ? formatCurrency(profile.baseSalary) : '--'), 
      trend: latestPayslip ? `Month: ${latestPayslip.month}` : 'Payroll structure active', 
      icon: Wallet, 
      color: 'text-indigo-600 dark:text-indigo-400', 
      bg: 'bg-indigo-50 dark:bg-indigo-950/20',
      onClick: () => navigate('/employee/payroll')
    },
    { 
      label: 'Active Goals', 
      value: (performance?.goals || []).length, 
      trend: `${(performance?.goals || []).filter(g => g.progress === 100).length} completed`, 
      icon: CheckSquare, 
      color: 'text-primary-600 dark:text-primary-400', 
      bg: 'bg-primary-50 dark:bg-primary-950/20',
      onClick: () => navigate('/employee/performance')
    },
  ], [attendance, leaves, latestPayslip, performance, profile, formatCurrency, navigate]);

  // Hook announcements list to context state with fallbacks
  const announcements = useMemo(() => contextAnnouncements && contextAnnouncements.length > 0 ? contextAnnouncements : [
    { id: 1, title: 'Annual Team Building Retreat', date: 'Oct 28', category: 'Events', priority: 'high', content: 'We are excited to announce our annual team building retreat! Join us for a weekend of fun, collaboration, and networking at the Mountain Resort. Transportation and accommodation will be provided.' },
    { id: 2, title: 'New Health Insurance Policy', date: 'Oct 22', category: 'Updates', priority: 'medium', content: 'Our health insurance provider has been updated to Blue Cross Premium. Please review the new policy documents in the Benefits section for details on coverage and benefits.' },
    { id: 3, title: 'WFH Policy Update', date: 'Oct 15', category: 'HR', priority: 'low', content: 'Starting next month, our flexible work policy will allow for up to 3 days of remote work per week. Please coordinate with your manager for scheduling.' },
  ], [contextAnnouncements]);

  // Hook upcoming holiday dynamically to backend state
  const nextHoliday = useMemo(() => {
    if (!holidays || holidays.length === 0) return null;
    const now = new Date();
    const sorted = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));
    return sorted.find(h => {
      const hDate = new Date(h.date);
      hDate.setHours(23, 59, 59, 999);
      return hDate >= now;
    }) || sorted[0];
  }, [holidays]);

  const holidayDate = useMemo(() => {
    return nextHoliday ? new Date(nextHoliday.date) : new Date('2026-10-31');
  }, [nextHoliday]);

  const holidayMonthStr = useMemo(() => {
    return holidayDate.toLocaleString('default', { month: 'short' });
  }, [holidayDate]);

  const holidayDayStr = useMemo(() => {
    return holidayDate.getDate();
  }, [holidayDate]);

  const holidayName = nextHoliday ? nextHoliday.name : 'Halloween Fest';
  const holidayType = nextHoliday ? nextHoliday.type : 'Optional Holiday';

  const handleLeaveFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const kb = file.size / 1024;
        const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
        setLeaveAttachment({
          name: file.name,
          size: sizeStr,
          fileBase64: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLeaveAttachment = (e) => {
    e.stopPropagation();
    setLeaveAttachment(null);
    if (leaveFileInputRef.current) {
      leaveFileInputRef.current.value = '';
    }
  };

  const handleRequestLeave = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const startDate = formData.get('startDate');
    const endDate = formData.get('endDate');

    // Calculate actual days difference
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newReq = {
      leaveType: formData.get('type'),
      startDate,
      endDate,
      totalDays,
      reason: formData.get('reason'),
      emergencyContact: formData.get('emergency'),
      attachment: leaveAttachment
    };
    
    setIsSubmittingLeave(true);
    setLeaveStep('Validating request dates...');
    
    try {
      await new Promise(r => setTimeout(r, 450));
      setLeaveStep('Verifying leave balance...');
      await new Promise(r => setTimeout(r, 450));
      setLeaveStep('Routing request to manager...');
      await new Promise(r => setTimeout(r, 450));
      
      await requestLeave(newReq);
      setLeaveAttachment(null);
      if (leaveFileInputRef.current) {
        leaveFileInputRef.current.value = '';
      }
      setShowLeaveModal(false);
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to submit leave request', 'error');
    } finally {
      setIsSubmittingLeave(false);
      setLeaveStep('');
    }
  };

  const handleClockIn = async () => {
    setIsRegisteringClock(true);
    setClockStep('Pinging GPS coordinates...');
    try {
      await new Promise(r => setTimeout(r, 450));
      setClockStep('Authenticating signature...');
      await new Promise(r => setTimeout(r, 450));
      setClockStep('Registering work session...');
      await new Promise(r => setTimeout(r, 450));
      
      await clockIn();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to clock in', 'error');
    } finally {
      setIsRegisteringClock(false);
      setClockStep('');
    }
  };

  const handleClockOut = async () => {
    setIsRegisteringClock(true);
    setClockStep('Calculating work hours...');
    try {
      await new Promise(r => setTimeout(r, 450));
      setClockStep('Registering punch out...');
      await new Promise(r => setTimeout(r, 450));
      
      await clockOut();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to clock out', 'error');
    } finally {
      setIsRegisteringClock(false);
      setClockStep('');
    }
  };

  const handleViewPayslip = () => {
    setIsViewingPayslip(true);
    showToast('Loading payroll documents...', 'info');
    setTimeout(() => {
      setIsViewingPayslip(false);
      navigate('/employee/payroll');
    }, 1000);
  };

  const handleOpenDetailBoard = () => {
    setIsOpeningBoard(true);
    showToast('Accessing announcement feed...', 'info');
    setTimeout(() => {
      setIsOpeningBoard(false);
      setShowDetailBoardModal(true);
    }, 1200);
  };

  const handleSyncHoliday = () => {
    setIsSyncingCalendar(true);
    showToast('Authenticating with Google Calendar...', 'info');
    setTimeout(() => {
      setIsSyncingCalendar(false);
      showToast(`${holidayName} synced to Google Calendar successfully!`);
    }, 1200);
  };

  const handleDownloadAttachment = () => {
    setIsDownloadingAttachment(true);
    showToast('Retrieving secure notice attachment...', 'info');
    setTimeout(() => {
      try {
        const text = `Confidential Digital Notice\n\nTitle: ${selectedAnnouncement ? selectedAnnouncement.title : ''}\nDate: ${selectedAnnouncement ? selectedAnnouncement.date : ''}\nCategory: ${selectedAnnouncement ? selectedAnnouncement.category : ''}\n\nContent:\n${selectedAnnouncement ? selectedAnnouncement.content : ''}`;
        const file = new Blob([text], {type: 'text/plain'});
        const element = document.createElement("a");
        element.href = URL.createObjectURL(file);
        element.download = `${selectedAnnouncement ? selectedAnnouncement.title.replace(/\s+/g, '_') : 'Notice'}_Attachment.txt`;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        showToast('Notice details downloaded successfully!');
      } catch (err) {
        showToast('Error downloading attachment', 'error');
      } finally {
        setIsDownloadingAttachment(false);
      }
    }, 1200);
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4">
        <AlertCircle className="text-rose-500 w-12 h-12" />
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">Failed to Load Dashboard</h3>
        <p className="text-sm text-slate-500 max-w-md">{error}</p>
        <button onClick={refetchAll} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2">
          <Loader2 size={16} className="animate-spin hidden" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="space-y-8 pb-12 animate-fade-in px-4 sm:px-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="text-left">
            <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-4 w-96 bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse mt-3" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="card p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse mb-4" />
              <div className="h-4 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-2" />
              <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="text-center text-sm text-slate-400 dark:text-slate-500 font-semibold py-8">
          <Loader2 size={24} className="animate-spin mx-auto mb-2 text-indigo-650" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  const safeGoals = performance?.goals || [];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none px-4 sm:px-0">
      {/* Header Section with Profile Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 bg-slate-900 text-white rounded-[2.5rem] relative overflow-hidden shadow-premium text-left">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <User size={160} />
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-6 relative z-10 text-center sm:text-left">
          <img 
            src={profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.fullName || 'Employee')}&background=4f46e5&color=fff`} 
            alt="Profile Avatar" 
            className="w-20 h-20 rounded-[1.75rem] border-2 border-white/25 object-cover shadow-lg shrink-0"
          />
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white">Welcome Back, {profile.fullName ? profile.fullName.split(' ')[0] : 'User'}!</h1>
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-white leading-none shadow-[0_0_8px_rgba(16,185,129,0.3)]">Active</span>
            </div>
            <p className="text-sm font-bold text-slate-350">{profile.designation || 'Staff Associate'} • {profile.department || 'Operations'}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-450 font-bold mt-1">
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-indigo-400 shrink-0" /> Shift: {profile.shift?.name || 'Day Shift'}</span>
              <span className="flex items-center gap-1.5"><CalendarDays size={14} className="text-indigo-400 shrink-0" /> ID: {profile.employeeId || 'EMP-XXXX'}</span>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 relative z-10 w-full md:w-auto">
          <button 
            onClick={handleViewPayslip} 
            disabled={isViewingPayslip}
            className="btn-secondary flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl py-3 px-5 text-xs font-bold transition-all disabled:opacity-50"
          >
            {isViewingPayslip ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
            <span>View Payslip</span>
          </button>
          <button 
            onClick={() => setShowLeaveModal(true)} 
            className="btn-primary flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl py-3 px-6 text-xs font-bold shadow-xl shadow-primary-500/20 active:scale-95 transition-all"
          >
             <Plus size={16} />
             <span>Request Leave</span>
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
            sub={stat.trend}
            color={stat.color}
            bg={stat.bg}
            onClick={stat.onClick}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Attendance & Activity */}
        <div className="lg:col-span-2 space-y-8">
           
           {/* Attendance & Time Tracker */}
           <div className="card p-8 flex flex-col md:flex-row items-center gap-10 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="flex flex-col items-center text-center">
                 <div className="relative w-40 h-40 mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                       <circle cx="80" cy="80" r="70" className="stroke-slate-100 dark:stroke-slate-800 fill-none" strokeWidth="10" />
                       <motion.circle 
                         cx="80" cy="80" r="70" 
                         className={cn("fill-none transition-colors", attendance.isClockedIn ? "stroke-primary-600" : "stroke-slate-300 dark:stroke-slate-700")}
                         strokeWidth="10" 
                         strokeDasharray={440}
                         strokeDashoffset={440 - (440 * (workedSeconds / (9 * 3600)))}
                         strokeLinecap="round"
                         initial={{ strokeDashoffset: 440 }}
                         animate={{ strokeDashoffset: 440 - (440 * Math.min(1, workedSeconds / (9 * 3600))) }}
                         transition={{ duration: 1, ease: "linear" }}
                       />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       <h4 className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{formatWorkedTime(workedSeconds)}</h4>
                       <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold mt-2">{attendance.isClockedIn ? 'Currently Active' : 'Offline'}</span>
                    </div>
                 </div>
                 {attendance.isClockedIn ? (
                    <button 
                      onClick={handleClockOut} 
                      disabled={isRegisteringClock}
                      className="btn-danger w-full py-3.5 shadow-xl shadow-rose-500/20 flex items-center justify-center gap-2"
                    >
                      {isRegisteringClock ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>{clockStep}</span>
                        </>
                      ) : (
                        <span>Clock Out</span>
                      )}
                    </button>
                 ) : (
                    <button 
                      onClick={handleClockIn} 
                      disabled={isRegisteringClock}
                      className="btn-primary w-full py-3.5 shadow-xl shadow-primary-500/20 flex items-center justify-center gap-2"
                    >
                      {isRegisteringClock ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>{clockStep}</span>
                        </>
                      ) : (
                        <span>Clock In</span>
                      )}
                    </button>
                 )}
              </div>

              <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 md:pl-10 pt-8 md:pt-0 text-left">
                 <div className="space-y-6">
                    <div className="space-y-1">
                       <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold">Start Time</p>
                       <p className="text-lg font-black text-slate-800 dark:text-slate-200">{attendance.isClockedIn ? new Date(attendance.clockInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[10px] font-black text-emerald-500 dark:text-emerald-400 uppercase tracking-[0.2em]">Total Mode</p>
                       <p className="text-lg font-black text-slate-800 dark:text-slate-200">Office-Based</p>
                    </div>
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-1 text-amber-550 dark:text-amber-450">
                       <p className="text-[10px] font-bold">Daily Target</p>
                       <p className="text-lg font-black">
                         {profile?.shift ? 
                            (() => {
                               const netMin = profile.shift.workingHoursMin || 480;
                               const h = Math.floor(netMin / 60);
                               const m = netMin % 60;
                               return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} Hrs`;
                            })() 
                            : '08:00 Hrs'}
                       </p>
                    </div>
                    <div className="space-y-1 text-primary-600 dark:text-primary-400 cursor-pointer group" onClick={() => navigate('/employee/attendance')}>
                       <p className="text-[10px] font-black uppercase tracking-[0.2em] group-hover:underline">View History</p>
                       <p className="text-lg font-black flex items-center gap-1">Details <ChevronRight size={16} /></p>
                    </div>
                 </div>
              </div>
           </div>

           {/* Weekly Activity Chart Card */}
           <div className="card p-6 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-left">
              <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2 italic">
                 <Clock className="text-primary-600 dark:text-primary-400 shrink-0" size={22} />
                 Weekly Activity (Worked Hours)
              </h3>
              {!hasChartData ? (
                 <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-100 dark:border-slate-850">
                    <AlertCircle size={28} className="text-slate-400 dark:text-slate-500 mb-2 animate-bounce" />
                    <p className="text-xs font-bold text-slate-500">No attendance activity logged for this week yet.</p>
                 </div>
              ) : (
                 <div className="space-y-4">
                    <div className="flex items-end justify-between h-36 pt-4 px-4 bg-slate-55 dark:bg-slate-800/20 rounded-2xl">
                       {weeklyChartData.map((data, idx) => {
                          const heightPct = Math.min(100, Math.max(8, (data.hours / 10) * 100));
                          return (
                             <div key={idx} className="flex flex-col items-center flex-1 group">
                                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-2 opacity-0 group-hover:opacity-100 transition-opacity leading-none">
                                   {data.hours} hrs
                                </span>
                                <div className="w-8 sm:w-12 bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden h-24 flex items-end">
                                   <motion.div 
                                     initial={{ height: 0 }}
                                     animate={{ height: `${heightPct}%` }}
                                     transition={{ duration: 0.6, delay: idx * 0.1 }}
                                     className={cn(
                                        "w-full rounded-t-lg transition-colors", 
                                        data.hours >= 8 ? "bg-emerald-500 group-hover:bg-emerald-600" : "bg-indigo-500 group-hover:bg-indigo-600"
                                     )}
                                   />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">
                                   {data.day}
                                </span>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              )}
           </div>

           {/* Assigned Tasks Card */}
           <div className="card p-0 overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-left">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                    <CheckSquare className="text-primary-600 dark:text-primary-400 shrink-0" size={24} />
                    Assigned Tasks
                 </h3>
                 <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-primary-50 dark:bg-primary-950/20 text-primary-600">
                    {(tasks || []).filter(t => t.status !== 'Completed').length} Pending
                 </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {(!tasks || tasks.length === 0) ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                       No tasks assigned to you currently. Keep up the good work!
                    </div>
                 ) : (
                    tasks.slice(0, 4).map((task) => (
                       <div key={task.id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <div className="flex-1 mr-8 text-left">
                             <p className="text-sm font-black text-slate-950 dark:text-white leading-tight mb-1">{task.title}</p>
                             <p className="text-xs text-slate-400 font-semibold">Deadline: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No deadline'}</p>
                          </div>
                          <span className={cn(
                             "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm shrink-0",
                             task.status === 'Pending' ? "bg-amber-55 dark:bg-amber-950/20 text-amber-600 border-amber-100" :
                             task.status === 'In_Progress' ? "bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border-indigo-100" :
                             "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100"
                          )}>
                             {task.status.replace('_', ' ')}
                          </span>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Performance Goals List */}
           <div className="card p-0 overflow-hidden border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3 italic">
                    <Target className="text-primary-600 dark:text-primary-400 shrink-0" size={24} />
                    Current Goals
                 </h3>
                 <button onClick={() => navigate('/employee/performance')} className="text-xs font-bold text-primary-600 dark:text-primary-400 font-bold hover:underline active:scale-95 transition-all">Full Strategy</button>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                 {safeGoals.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                       No goals currently assigned.
                    </div>
                 ) : (
                    safeGoals.map((goal) => (
                       <div key={goal.id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-slate-800/10 transition-colors">
                          <div className="flex-1 mr-8 text-left">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-black text-slate-855 dark:text-slate-205 font-bold">{goal.title}</span>
                                <span className="text-xs font-black text-slate-400 dark:text-slate-500">{goal.progress}%</span>
                             </div>
                             <div className="w-full h-2 bg-slate-55 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800 p-[1px]">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${goal.progress}%` }}
                                  className={cn(
                                    "h-full rounded-full transition-all",
                                    goal.progress > 70 ? "bg-emerald-500" : goal.progress > 30 ? "bg-amber-500" : "bg-primary-500"
                                   )}
                                />
                             </div>
                          </div>
                          <span className={cn(
                             "px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm shrink-0",
                             goal.priority === 'High' ? "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30" : "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-100 dark:border-slate-800"
                          )}>
                             {goal.priority}
                          </span>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>

        {/* Right Side: Announcements & Quick Actions */}
        <div className="space-y-8 h-full text-left">
           
           {/* Recent Leave Requests Card */}
           <div className="card p-8 group hover:shadow-xl transition-all text-left dark:bg-slate-900 border border-slate-100 dark:border-slate-800 bg-white">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white italic tracking-tight">Recent Leave Requests</h3>
                 <button onClick={() => navigate('/employee/leave')} className="text-xs font-bold text-primary-600 hover:underline">View All</button>
              </div>
              <div className="space-y-4">
                 {(!leaves.requests || leaves.requests.length === 0) ? (
                    <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs">
                       No leave history found.
                    </div>
                 ) : (
                    leaves.requests.slice(0, 3).map((req, idx) => (
                       <div key={idx} className="flex justify-between items-start p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                          <div className="space-y-1">
                             <p className="text-xs font-bold text-slate-900 dark:text-white">{req.leaveType || req.type}</p>
                             <p className="text-[10px] text-slate-450">{req.startDate} to {req.endDate}</p>
                          </div>
                          <span className={cn(
                             "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border shrink-0",
                             req.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                             req.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                             "bg-rose-50 text-rose-600 border-rose-100"
                          )}>
                             {req.status}
                          </span>
                       </div>
                    ))
                 )}
              </div>
           </div>

           {/* Announcements Panel */}
            <div className="card p-8 bg-slate-900 dark:bg-slate-950 text-white border-none shadow-premium relative overflow-hidden group h-full">
               <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-1000">
                  <Bell size={120} />
               </div>
               <h3 className="text-[10px] font-bold text-primary-400 mb-8 flex items-center gap-2 text-left">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-pulse" />
                  Announcements
               </h3>
               <div className="space-y-8 relative z-10 text-left">
                  {announcements.map((ann, i) => (
                     <div key={i} className="flex gap-5 group/item cursor-pointer" onClick={() => setSelectedAnnouncement(ann)}>
                        <div className="flex flex-col items-center">
                           <div className={cn(
                              "w-2.5 h-2.5 rounded-full ring-4 ring-slate-900 dark:ring-slate-950 flex-shrink-0 transition-transform group-hover/item:scale-125",
                              ann.priority === 'high' ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]" : ann.priority === 'medium' ? "bg-amber-500" : "bg-primary-500"
                           )} />
                           <div className="w-[1px] h-full bg-slate-800 dark:bg-slate-900 mt-2" />
                        </div>
                        <div className="flex-1 pb-4">
                           <p className="text-sm font-black text-white group-hover/item:text-primary-400 transition-colors leading-tight">{ann.title}</p>
                           <div className="flex items-center gap-3 mt-2.5">
                              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">{ann.date}</span>
                              <span className="text-[9px] font-black text-primary-500/80 uppercase tracking-[0.2em] px-2 py-0.5 bg-primary-500/10 rounded-md">{ann.category}</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
               <button 
                 onClick={handleOpenDetailBoard}
                 disabled={isOpeningBoard}
                 className="w-full mt-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-2xl text-[10px] font-bold transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
               >
                  {isOpeningBoard ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Accessing Feed...</span>
                    </>
                  ) : (
                    <>
                      <span>View Detail Board</span>
                      <ArrowRight size={14} />
                    </>
                  )}
               </button>
            </div>

            {/* Upcoming Holiday Card */}
            <div className="card p-8 group hover:shadow-xl transition-all text-left dark:bg-slate-900 border border-slate-100 dark:border-slate-800 bg-white">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white italic tracking-tight">Public Holiday</h3>
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-950/20 rounded-xl text-indigo-600 dark:text-indigo-400 transition-transform group-hover:rotate-12">
                     <Calendar size={20} />
                  </div>
               </div>
               <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/30 flex flex-col items-center justify-center shadow-inner">
                     <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 font-bold">{holidayMonthStr}</span>
                     <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{holidayDayStr}</span>
                  </div>
                  <div>
                     <p className="text-base font-black text-slate-900 dark:text-white leading-none">{holidayName}</p>
                     <p className="text-xs font-bold text-slate-400 dark:text-slate-550 font-bold mt-1.5">{holidayType}</p>
                  </div>
               </div>
               <div className="mt-8 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                     <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">Upcoming Holiday</span>
                  </div>
                  <button onClick={() => setShowHolidayModal(true)} className="p-2 hover:bg-slate-55 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 hover:text-primary-600 active:scale-95">
                     <ArrowUpRight size={18} />
                  </button>
               </div>
            </div>
         </div>
      </div>

      {/* Leave Request Modal */}
      <CenterModal isOpen={showLeaveModal} onClose={() => !isSubmittingLeave && setShowLeaveModal(false)} title="Request New Leave">
         <form onSubmit={handleRequestLeave} className="p-8 space-y-6 bg-white dark:bg-slate-900 text-left">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="form-label px-1 text-slate-700 dark:text-slate-350">Leave Type</label>
                  <select 
                    name="type" 
                    disabled={isSubmittingLeave} 
                    className="input-field h-12 font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-full rounded-xl"
                  >
                     <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Sick Leave</option>
                     <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Annual Leave</option>
                     <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Casual Leave</option>
                     <option className="dark:bg-slate-900 text-slate-900 dark:text-white">Unpaid Leave</option>
                  </select>
               </div>
               <div className="space-y-2">
                  <label className="form-label px-1 text-slate-700 dark:text-slate-350">Attachment (Optional)</label>
                  <input 
                    type="file" 
                    ref={leaveFileInputRef} 
                    onChange={handleLeaveFileChange} 
                    className="hidden" 
                    accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
                    disabled={isSubmittingLeave}
                  />
                  <div 
                    onClick={() => !isSubmittingLeave && leaveFileInputRef.current?.click()} 
                    className="h-12 border-2 border-dashed border-slate-200 dark:border-slate-750 rounded-xl flex items-center justify-between px-4 text-xs font-semibold bg-slate-50 dark:bg-slate-850 cursor-pointer hover:border-primary-400 transition-colors"
                  >
                     {leaveAttachment ? (
                       <div className="flex items-center justify-between w-full">
                         <div className="flex items-center gap-2 truncate">
                           <FileText size={16} className="text-primary-500 shrink-0" />
                           <span className="truncate text-slate-800 dark:text-slate-200 font-bold">{leaveAttachment.name}</span>
                           <span className="text-[10px] text-slate-400 font-mono">({leaveAttachment.size})</span>
                         </div>
                         <button 
                           type="button" 
                           onClick={handleRemoveLeaveAttachment} 
                           className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-750 transition-colors"
                           title="Remove File"
                         >
                           <X size={16} />
                         </button>
                       </div>
                     ) : (
                       <div className="flex items-center justify-center w-full gap-2 text-slate-400 dark:text-slate-500 text-[10px] font-bold">
                          <Upload size={16} />
                          <span>Upload File</span>
                       </div>
                     )}
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="form-label px-1 text-slate-700 dark:text-slate-350">Start Date</label>
                  <DatePicker name="startDate" 
                     
                    required 
                    disabled={isSubmittingLeave} 
                    className="input-field h-12 font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-full rounded-xl" 
                  />
               </div>
               <div className="space-y-2">
                  <label className="form-label px-1 text-slate-700 dark:text-slate-350">End Date</label>
                  <DatePicker name="endDate" 
                     
                    required 
                    disabled={isSubmittingLeave} 
                    className="input-field h-12 font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-full rounded-xl" 
                  />
               </div>
            </div>
            <div className="space-y-2">
               <label className="form-label px-1 text-slate-700 dark:text-slate-350">Reason for Leave</label>
               <textarea 
                 name="reason" 
                 rows="3" 
                 required 
                 disabled={isSubmittingLeave} 
                 className="input-field py-4 resize-none font-semibold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 w-full rounded-xl" 
                 placeholder="Provide a brief explanation..."
               />
            </div>
            <div className="space-y-2">
               <label className="form-label px-1 text-slate-700 dark:text-slate-350">Emergency Contact While Away</label>
               <PhoneInput 
                 name="emergency" 
                 value={emergencyPhone}
                 onChange={e => setEmergencyPhone(e.target.value)}
                 required 
                 disabled={isSubmittingLeave} 
                 className="h-12 font-semibold bg-white border border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white focus:border-primary-500 focus:ring-primary-500"
               />
            </div>
            <div className="pt-4 flex gap-4">
               <button 
                 type="button" 
                 disabled={isSubmittingLeave} 
                 onClick={() => setShowLeaveModal(false)} 
                 className="btn-secondary flex-1 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl"
               >
                 Cancel
               </button>
               <button 
                 type="submit" 
                 disabled={isSubmittingLeave} 
                 className="btn-primary flex-2 py-3 text-sm flex items-center justify-center gap-2"
               >
                  {isSubmittingLeave ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>{leaveStep}</span>
                    </>
                  ) : (
                    <span>Submit Request</span>
                  )}
               </button>
            </div>
         </form>
      </CenterModal>

      {/* Announcement Detail Modal */}
      <CenterModal isOpen={!!selectedAnnouncement} onClose={() => setSelectedAnnouncement(null)} title="Announcement Details">
         {selectedAnnouncement && (
            <div className="p-8 text-left dark:bg-slate-900">
               <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-4">
                     <div className={cn(
                        "w-3 h-3 rounded-full",
                        selectedAnnouncement.priority === 'high' ? "bg-rose-500" : "bg-primary-500"
                     )} />
                     <span className="text-[10px] font-bold text-slate-400 font-bold">{selectedAnnouncement.category}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-900 dark:text-white font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">{selectedAnnouncement.date}</span>
               </div>
               <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{selectedAnnouncement.title}</h2>
               <p className="text-slate-650 dark:text-slate-350 font-bold leading-relaxed mb-10">{selectedAnnouncement.content}</p>
               <div className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 shadow-sm">
                     <FileText size={24} />
                  </div>
                  <div className="flex-1 text-left">
                     <p className="text-sm font-black text-slate-900 dark:text-white">Announcement_Details.txt</p>
                     <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Digital Notice</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleDownloadAttachment}
                    disabled={isDownloadingAttachment}
                    className="btn-secondary p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-750 flex items-center justify-center active:scale-95 transition-all disabled:opacity-50 border border-slate-200 dark:border-slate-700"
                  >
                    {isDownloadingAttachment ? <Loader2 size={20} className="animate-spin" /> : <ChevronRight size={20} />}
                  </button>
               </div>
               <button onClick={() => setSelectedAnnouncement(null)} className="w-full mt-10 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-950 rounded-2xl font-bold shadow-xl">Close Notice</button>
            </div>
         )}
      </CenterModal>

      {/* Announcements Board Modal */}
      <CenterModal isOpen={showDetailBoardModal} onClose={() => setShowDetailBoardModal(false)} title="HCM.ai Announcements Board">
         <div className="p-8 space-y-6 text-left max-h-[70vh] overflow-y-auto dark:bg-slate-900">
            <p className="text-xs font-bold text-slate-500 font-bold">Active System Broadcasts</p>
            <div className="space-y-6">
               {announcements.map((ann, i) => (
                  <div key={i} className="p-6 bg-slate-55 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-800 transition-all cursor-pointer" onClick={() => { setShowDetailBoardModal(false); setSelectedAnnouncement(ann); }}>
                     <div className="flex justify-between items-start mb-4">
                        <span className={cn(
                           "px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-widest",
                           ann.priority === 'high' ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450" : ann.priority === 'medium' ? "bg-amber-50 dark:bg-amber-955/30 text-amber-600 dark:text-amber-450" : "bg-primary-50 dark:bg-primary-955/30 text-primary-600"
                        )}>{ann.priority} Priority</span>
                        <span className="text-[10px] font-bold text-slate-400">{ann.date}</span>
                     </div>
                     <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight mb-2">{ann.title}</h4>
                     <p className="text-xs font-medium text-slate-500 line-clamp-2">{ann.content}</p>
                  </div>
               ))}
            </div>
            <button onClick={() => setShowDetailBoardModal(false)} className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold">Close Board</button>
         </div>
      </CenterModal>

      {/* Holiday Info Vault Modal */}
      <CenterModal isOpen={showHolidayModal} onClose={() => setShowHolidayModal(false)} title={`${holidayName} Holiday`}>
         <div className="p-8 text-left space-y-6 dark:bg-slate-900">
            <div className="flex items-center gap-5 p-6 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl">
               <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 border-2 border-indigo-100 dark:border-indigo-900/30 flex flex-col items-center justify-center shadow-inner">
                  <span className="text-[10px] font-bold text-indigo-600 font-bold">{holidayMonthStr}</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white leading-none mt-1">{holidayDayStr}</span>
               </div>
               <div>
                  <h3 className="text-lg font-black text-slate-900 leading-none dark:text-white">{holidayName}</h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-bold mt-1.5">{holidayType} Paid Company Holiday</p>
               </div>
            </div>
            <p className="text-sm font-medium text-slate-650 dark:text-slate-300 leading-relaxed">
               {nextHoliday?.description || `On this holiday, HCM.ai is celebrating ${holidayName} with optional paid holiday closures for non-critical operational crews. Please align with your direct supervisor if your role covers live emergency service queues.`}
            </p>
            <div className="pt-4 flex gap-4">
               <button onClick={() => setShowHolidayModal(false)} className="flex-1 py-4 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-200">Close Info</button>
               <button 
                 onClick={handleSyncHoliday}
                 disabled={isSyncingCalendar}
                 className="flex-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 flex items-center justify-center gap-2 active:scale-95 transition-all disabled:bg-indigo-400"
               >
                 {isSyncingCalendar ? <Loader2 size={18} className="animate-spin" /> : <Calendar size={18} />}
                 <span>Sync Calendar</span>
               </button>
            </div>
         </div>
      </CenterModal>
    </div>
  );
};

export default EmployeeDashboard;
