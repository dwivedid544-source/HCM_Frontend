import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Coffee, 
  LogIn, 
  LogOut, 
  MapPin, 
  Monitor, 
  CalendarDays,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Timer,
  Download,
  Search,
  Filter,
  Users
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import CenterModal from '../../shared/components/layout/CenterModal';

const EmployeeAttendance = () => {
  const { attendance, clockIn, clockOut, showToast, refetch, profile, holidays, leaves } = useEmployee();
  const { formatDate } = useDateFormat();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [mode, setMode] = useState('Office');
  const [workedSeconds, setWorkedSeconds] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);

  // Expanded Calendar Modal States
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const [selectedDayDetail, setSelectedDayDetail] = useState(null);

  useEffect(() => {
    refetch.fetchAttendance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let interval;
    if (attendance.isClockedIn && attendance.clockInTime) {
      const startTime = new Date(attendance.clockInTime).getTime();
      interval = setInterval(() => {
        if (!isOnBreak) {
          setWorkedSeconds(Math.floor((new Date().getTime() - startTime) / 1000));
        }
      }, 1000);
    } else {
      setWorkedSeconds(0);
      setIsOnBreak(false);
    }
    return () => clearInterval(interval);
  }, [attendance.isClockedIn, attendance.clockInTime, isOnBreak]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')} : ${minutes.toString().padStart(2, '0')} : ${seconds.toString().padStart(2, '0')}`;
  };

  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() - 1);
      return next;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  // Expanded Calendar Modal Month Navigation
  const handleCalendarPrevMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };
  const handleCalendarNextMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Expanded Calendar Calculations
  const calendarYear = calendarMonth.getFullYear();
  const calendarMonthIdx = calendarMonth.getMonth();
  const calendarMonthName = calendarMonth.toLocaleDateString([], { month: 'long', year: 'numeric' });

  const firstDayOfWeek = new Date(calendarYear, calendarMonthIdx, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonthIdx + 1, 0).getDate();

  const calendarCells = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push({ isPadding: true, key: `pad-${i}` });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cellDate = new Date(calendarYear, calendarMonthIdx, day);
    const dateStr = `${calendarYear}-${String(calendarMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const dayOfWeek = cellDate.getDay();
    let isWeekend = false;
    let weekendType = '';
    
    if (profile?.weekends) {
      const dayNamesMap = { 0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY', 4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY' };
      const wk = profile.weekends.find(w => {
        const wStr = String(w.dayOfWeek).toUpperCase();
        return wStr === dayNamesMap[dayOfWeek] || wStr === String(dayOfWeek);
      });
      if (wk) {
        isWeekend = true;
        weekendType = wk.type;
      }
    } else {
      isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      weekendType = 'FullDay';
    }

    const record = (attendance.history || []).find(h => {
      if (!h) return false;
      const hDate = new Date(h.rawDate || h.date);
      return hDate.getFullYear() === calendarYear &&
             hDate.getMonth() === calendarMonthIdx &&
             hDate.getDate() === day;
    });

    const isHoliday = holidays?.some(h => new Date(h.date).toDateString() === cellDate.toDateString());
    const isApprovedLeave = leaves?.requests?.some(l => {
      if (l.status !== 'Approved') return false;
      const s = new Date(l.rawStartDate || l.startDate);
      const e = new Date(l.rawEndDate || l.endDate);
      s.setHours(0, 0, 0, 0);
      e.setHours(23, 59, 59, 999);
      return cellDate >= s && cellDate <= e;
    });

    let status = 'Not Logged';
    let bgClass = 'bg-slate-50 dark:bg-slate-800/40 text-slate-400 border-slate-100 dark:border-slate-800';
    let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-500';

    if (record && ['Present', 'Late'].includes(record.status)) {
      status = record.status;
      if (record.status === 'Present') {
        bgClass = 'bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40';
        badgeClass = 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300';
      } else if (record.status === 'Late') {
        bgClass = 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40';
        badgeClass = 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300';
      }
    } else if (isApprovedLeave || (record && ['Leave', 'Sick Leave', 'Annual Leave'].includes(record.status))) {
      status = 'On Leave';
      bgClass = 'bg-indigo-50/70 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900/40';
      badgeClass = 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300';
    } else if (isHoliday) {
      status = 'Holiday';
      bgClass = 'bg-rose-50/70 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40';
      badgeClass = 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300';
    } else if (isWeekend) {
      status = weekendType === 'HALF_DAY' ? 'Weekend (Half Day)' : 'Weekend';
      bgClass = 'bg-slate-100/50 dark:bg-slate-850/40 border-slate-200/50 dark:border-slate-800/50';
      badgeClass = 'bg-slate-200/60 dark:bg-slate-800 text-slate-500';
    } else if (record && record.status === 'Absent') {
      status = 'Absent';
      bgClass = 'bg-red-50/70 dark:bg-red-950/20 border-red-200 dark:border-red-900/40';
      badgeClass = 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300';
    }

    calendarCells.push({
      isPadding: false,
      day,
      dateStr,
      dateObj: cellDate,
      record,
      status,
      isWeekend,
      bgClass,
      badgeClass,
      key: `day-${day}`
    });
  }

  const currentMonthYearStr = currentDate.toLocaleDateString([], { month: 'long', year: 'numeric' });

  const filteredHistory = (attendance.history || []).filter(item => {
    const matchesSearch = item.date.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.mode.toLowerCase().includes(searchTerm.toLowerCase());
                          
    const itemDate = new Date(item.rawDate || item.date);
    const matchesMonth = itemDate.getMonth() === currentDate.getMonth() && 
                         itemDate.getFullYear() === currentDate.getFullYear();
                         
    return matchesSearch && matchesMonth;
  });

  const totalPresentDays = filteredHistory.reduce((total, h) => {
    if (h.status === 'Present' || h.status === 'Late') {
      return total + (h.isHalfDay ? 0.5 : 1);
    }
    return total;
  }, 0);
  const lateIncidents = filteredHistory.filter(h => h.status === 'Late').length;

  const stats = [
    { label: 'Present Days', value: totalPresentDays, icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Late Marking', value: lateIncidents, icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Total Mode', value: mode, icon: Monitor, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    { label: 'Working Mode', value: mode, icon: MapPin, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
  ];

  const handleExport = () => {
    if (filteredHistory.length === 0) {
      showToast('No attendance records to export', 'error');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,Date,Mode,Punch In,Punch Out,Status,Activity\n";
    filteredHistory.forEach(item => {
      csvContent += `"${item.date}","${item.mode}","${item.clockIn}","${item.clockOut}","${item.status}","${item.totalHours}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Report_${currentMonthYearStr.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Attendance report exported successfully');
  };

  const handleClockIn = async () => {
    try {
      await clockIn(mode);
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to clock in', 'error');
    }
  };

  const handleClockOut = async () => {
    try {
      await clockOut();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to clock out', 'error');
    }
  };

  const toggleBreak = () => {
    if (!attendance.isClockedIn) {
      showToast('Start a work session first to take a break', 'error');
      return;
    }
    setIsOnBreak(!isOnBreak);
    showToast(isOnBreak ? 'Resuming work session' : 'Coffee break started');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Time & Attendance</h1>
          <p className="hcm-page-subtitle">Real-time work session tracking and historical records</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary px-6 py-2.5 flex items-center gap-2">
            <Download size={18} />
            <span>Export CSV</span>
          </button>
          {attendance.isClockedIn ? (
            <button onClick={handleClockOut} className="btn-primary bg-rose-600 hover:bg-rose-700 px-8 py-2.5 flex items-center gap-2 shadow-xl shadow-rose-100 dark:shadow-none ring-4 ring-white dark:ring-slate-900">
              <LogOut size={18} />
              <span>Clock Out</span>
            </button>
          ) : (
            <button onClick={handleClockIn} className="btn-primary px-8 py-2.5 flex items-center gap-2 shadow-xl shadow-primary-200 dark:shadow-none">
              <LogIn size={18} />
              <span>Clock In</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card transition-all"
          >
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="card-title mb-1.5">{stat.label}</p>
                  <h3 className="card-value">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Live Controls & Summary */}
        <div className="lg:col-span-4 space-y-6">
           <div className="card p-8 bg-slate-900 dark:bg-slate-950 text-white border-none shadow-premium relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                 <Clock size={150} />
              </div>
              <p className="text-[10px] font-bold text-primary-400 mb-8">Active Work Session</p>
              
              <div className="text-center mb-10 py-12 rounded-[2.5rem] bg-white/5 border border-white/10 backdrop-blur-3xl shadow-2xl relative z-10">
                 <h4 className={cn("text-5xl font-black tracking-tighter mb-3 tabular-nums transition-colors duration-300", isOnBreak ? "text-orange-400" : "text-white")}>{formatTime(workedSeconds)}</h4>
                 <p className="text-[10px] font-bold text-slate-400 font-bold">{attendance.isClockedIn ? (isOnBreak ? 'On Coffee Break' : 'Timer Active') : 'Start Session to Track Time'}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 relative z-10">
                 <button onClick={toggleBreak} className={cn("flex flex-col items-center gap-4 p-5 rounded-2xl border transition-all group/btn", isOnBreak ? "bg-orange-500/25 border-orange-500/50 text-orange-400" : "bg-white/10 border-white/5 hover:bg-white/15 text-white")}>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center mb-1 group-hover/btn:scale-110 transition-transform">
                       <Coffee size={24} />
                    </div>
                    <span className="text-[9px] font-bold leading-none">{isOnBreak ? "Resume" : "Coffee Break"}</span>
                 </button>
                 <div className="relative group/mode">
                    <button className="w-full flex flex-col items-center gap-4 p-5 rounded-2xl bg-white/10 border border-white/5 hover:bg-white/15 transition-all">
                       <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-500 flex items-center justify-center mb-1 group-hover/mode:rotate-12 transition-transform">
                          <Monitor size={24} />
                       </div>
                       <span className="text-[9px] font-bold leading-none">{mode} Mode</span>
                    </button>
                    <div className="absolute bottom-full left-0 w-full mb-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 opacity-0 group-hover/mode:opacity-100 pointer-events-none group-hover/mode:pointer-events-auto transition-all p-1 transform translate-y-2 group-hover/mode:translate-y-0">
                       {['Office', 'Remote', 'Hybrid'].map(m => (
                          <button key={m} onClick={() => { setMode(m); showToast(`Work mode changed to ${m}`); }} className="w-full p-3 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left transition-colors">{m}</button>
                       ))}
                    </div>
                 </div>
              </div>
           </div>

           <div className="card">
              <h3 className="card-title mb-2">{profile?.shift ? profile.shift.name : 'Shift Logic & Schedule'}</h3>
              {profile?.shift && (
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 font-bold mb-6">
                  {profile.shift.workingHoursMin ? `${Math.floor(profile.shift.workingHoursMin / 60)}h ${profile.shift.workingHoursMin % 60}m shift` : ''} • {profile.shift.breakDurationMin}m break • {profile.shift.graceInMin}m grace
                </p>
              )}
              <div className="space-y-8 relative ml-4 px-8 border-l-2 border-slate-100 dark:border-slate-800">
                 {(() => {
                   const shift = profile?.shift;
                   const startTime = shift?.startTime || '09:00';
                   const endTime = shift?.endTime || '18:00';
                   const breakDuration = shift?.breakDurationMin || 60;

                   // Calculate break start (midpoint of shift)
                   const [startH, startM] = startTime.split(':').map(Number);
                   const [endH, endM] = endTime.split(':').map(Number);
                   const startTotalMin = startH * 60 + startM;
                   const endTotalMin = endH * 60 + endM;
                   const breakStartMin = Math.floor((startTotalMin + endTotalMin) / 2) - Math.floor(breakDuration / 2);
                   const breakH = Math.floor(breakStartMin / 60);
                   const breakM = breakStartMin % 60;

                   const fmt = (h, m) => {
                     const ampm = h >= 12 ? 'PM' : 'AM';
                     const h12 = h % 12 || 12;
                     return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${ampm}`;
                   };

                   const items = [
                     { time: fmt(startH, startM), label: 'Shift Start', icon: Play, color: 'bg-primary-600' },
                     { time: fmt(breakH, breakM), label: `Break (${breakDuration}m)`, icon: Coffee, color: 'bg-amber-600' },
                     { time: fmt(endH, endM), label: 'Shift End', icon: LogOut, color: 'bg-rose-600' },
                   ];

                   return items.map((log, i) => (
                     <div key={i} className="relative">
                        <div className={cn(
                           "absolute -left-[50px] top-1/2 -translate-y-1/2 w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 shadow-xl flex items-center justify-center text-white",
                           log.color
                        )}>
                           <log.icon size={18} />
                        </div>
                        <div className="text-left">
                           <p className="text-base font-bold text-slate-900 dark:text-white leading-none">{log.time}</p>
                           <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 font-bold mt-1.5">{log.label}</p>
                        </div>
                     </div>
                   ));
                 })()}
              </div>
           </div>
        </div>

        {/* History Area */}
        <div className="lg:col-span-8 space-y-8">
           
           <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight italic">Attendance History</h3>
              <div className="flex items-center gap-3">
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" size={16} />
                    <input 
                      type="text" 
                      placeholder="Search history..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10 pr-4 py-2 text-xs font-bold w-48" 
                    />
                 </div>
                 <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <button onClick={handlePrevMonth} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"><ChevronLeft size={18} /></button>
                    <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 font-bold px-4">{currentMonthYearStr}</span>
                    <button onClick={handleNextMonth} className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white"><ChevronRight size={18} /></button>
                 </div>
              </div>
           </div>

           <div className="hcm-table-container">
              <table className="hcm-table">
                 <thead className="hcm-thead">
                    <tr>
                       <th className="hcm-th px-8">Date</th>
                       <th className="hcm-th px-8">Mode</th>
                       <th className="hcm-th px-8 text-center">Registry (In/Out)</th>
                       <th className="hcm-th px-8 text-center">Status</th>
                       <th className="hcm-th px-8 text-right">Activity</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                    {filteredHistory.length > 0 ? filteredHistory.map((item, i) => (
                       <tr key={i} className="hcm-tr">
                          <td className="hcm-td px-8 py-6">
                             <p className="text-sm font-bold text-slate-900 dark:text-white">{formatDate(item.date)}</p>
                          </td>
                          <td className="hcm-td px-8 py-6">
                             <div className="flex items-center gap-2.5">
                                <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-400 dark:text-slate-500">
                                   {item.mode === 'Office' ? <MapPin size={12} /> : <Monitor size={12} />}
                                </div>
                                <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 font-bold">{item.mode}</span>
                             </div>
                          </td>
                          <td className="hcm-td px-8 py-6 text-center">
                             <div className="flex items-center justify-center gap-5">
                                <div>
                                   <p className="text-[8px] font-black text-slate-300 dark:text-slate-500 font-bold mb-1.5">Punch In</p>
                                   <p className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">{item.clockIn}</p>
                                </div>
                                <ArrowRight size={14} className="text-slate-200 dark:text-slate-700" />
                                <div>
                                   <p className="text-[8px] font-black text-slate-300 dark:text-slate-500 uppercase tracking-widest mb-1.5">Punch Out</p>
                                   <p className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">{item.clockOut}</p>
                                </div>
                             </div>
                          </td>
                          <td className="hcm-td px-8 py-6 text-center">
                             <span className={cn(
                                "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border",
                                item.status === 'Present' 
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30" 
                                  : "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                             )}>
                                {item.status}
                             </span>
                          </td>
                          <td className="hcm-td px-8 py-6 text-right">
                             <p className="text-sm font-black text-slate-900 dark:text-white tabular-nums">{item.totalHours}</p>
                          </td>
                       </tr>
                    )) : (
                       <tr>
                          <td colSpan="5" className="px-8 py-20 text-center">
                             <div className="flex flex-col items-center gap-4 text-slate-300 dark:text-slate-600">
                                <Clock size={48} className="animate-pulse" />
                                <p className="text-xs font-bold">No records found for {currentMonthYearStr}</p>
                             </div>
                          </td>
                       </tr>
                    )}
                 </tbody>
              </table>
           </div>

           {/* Mobile Calendar Hint */}
           <div className="card p-10 bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-none shadow-premium flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
              <div className="absolute -left-10 -bottom-10 opacity-10 rotate-12">
                 <CalendarDays size={200} />
              </div>
              <div className="space-y-2 relative z-10 text-center md:text-left">
                 <h4 className="text-2xl font-black italic tracking-tight">Full Calendar Intelligence</h4>
                 <p className="text-primary-100/80 text-xs font-bold">Visual heatmaps and behavior tracking of your work cycle</p>
              </div>
              <button onClick={() => setIsCalendarModalOpen(true)} className="px-8 py-4 bg-white text-primary-600 rounded-2xl font-bold text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-3 relative z-10">
                 <CalendarDays size={20} />
                 <span>Expand Calendar</span>
              </button>
           </div>
        </div>
      </div>

      {/* Expanded Attendance Calendar Modal */}
      <CenterModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => { setIsCalendarModalOpen(false); setSelectedDayDetail(null); }} 
        title={`Attendance Calendar — ${calendarMonthName}`}
        maxWidth="max-w-5xl"
      >
         <div className="p-6 sm:p-8 space-y-6 bg-white dark:bg-slate-900 text-left">
            {/* Month Control & Legend */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-700">
               <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCalendarPrevMonth} 
                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  >
                     <ChevronLeft size={20} />
                  </button>
                  <span className="text-base font-bold text-slate-900 dark:text-white font-bold min-w-[150px] text-center">
                    {calendarMonthName}
                  </span>
                  <button 
                    onClick={handleCalendarNextMonth} 
                    className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-all border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200"
                  >
                     <ChevronRight size={20} />
                  </button>
               </div>

               <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold font-bold">
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40">
                     <span className="w-2 h-2 rounded-full bg-emerald-500" /> Present
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/40">
                     <span className="w-2 h-2 rounded-full bg-amber-500" /> Late
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/40">
                     <span className="w-2 h-2 rounded-full bg-indigo-500" /> Leave
                  </span>
                  <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                     <span className="w-2 h-2 rounded-full bg-slate-400" /> Weekend
                  </span>
               </div>
            </div>

            {/* Weekday Headers */}
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-black text-slate-400 dark:text-slate-500 font-bold py-2 border-b border-slate-100 dark:border-slate-800">
               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                  <div key={d}>{d}</div>
               ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 gap-2 sm:gap-3">
               {calendarCells.map((cell) => {
                  if (cell.isPadding) {
                     return <div key={cell.key} className="h-24 sm:h-28 rounded-2xl bg-slate-50/30 dark:bg-slate-900/20 border border-dashed border-slate-100 dark:border-slate-800/40 opacity-30" />;
                  }

                  const isSelected = selectedDayDetail?.dateStr === cell.dateStr;

                  return (
                     <div 
                       key={cell.key}
                       onClick={() => setSelectedDayDetail(cell)}
                       className={cn(
                          "h-24 sm:h-28 p-2.5 sm:p-3 rounded-2xl border flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg relative overflow-hidden text-left",
                          cell.bgClass,
                          isSelected ? "ring-2 ring-primary-500 shadow-xl scale-[1.02]" : ""
                       )}
                     >
                        <div className="flex items-center justify-between">
                           <span className="text-sm font-black text-slate-900 dark:text-white leading-none">{cell.day}</span>
                           <span className={cn("text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md", cell.badgeClass)}>
                              {cell.status}
                           </span>
                        </div>

                        {cell.record ? (
                           <div className="space-y-1">
                              <p className="text-[10px] font-bold text-slate-700 dark:text-slate-350 truncate">
                                 {cell.record.clockIn} — {cell.record.clockOut}
                              </p>
                              <div className="flex items-center justify-between text-[9px] font-black text-slate-400">
                                 <span>{cell.record.mode}</span>
                                 <span className="text-primary-600 dark:text-primary-400">{cell.record.totalHours}</span>
                              </div>
                           </div>
                        ) : (
                           <p className="text-[10px] font-medium text-slate-400 italic">
                              {cell.isWeekend ? 'Rest Day' : 'No Entry'}
                           </p>
                        )}
                     </div>
                  );
               })}
            </div>

            {/* Selected Day Info Popup */}
            {selectedDayDetail && (
               <div className="p-5 bg-slate-50 dark:bg-slate-800/70 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                  <div className="space-y-1">
                     <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Details for {selectedDayDetail.dateObj?.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                     </h4>
                     {selectedDayDetail.record ? (
                        <p className="text-xs text-slate-600 dark:text-slate-350 font-medium">
                           Punch In: <strong className="text-slate-900 dark:text-white">{selectedDayDetail.record.clockIn}</strong> • 
                           Punch Out: <strong className="text-slate-900 dark:text-white">{selectedDayDetail.record.clockOut}</strong> • 
                           Duration: <strong className="text-primary-600 dark:text-primary-400">{selectedDayDetail.record.totalHours}</strong> • 
                           Mode: <strong className="text-slate-900 dark:text-white">{selectedDayDetail.record.mode}</strong>
                        </p>
                     ) : (
                        <p className="text-xs text-slate-500 font-medium">
                           {selectedDayDetail.isWeekend ? 'Company Weekend Off' : 'No attendance punch record registered on this date.'}
                        </p>
                     )}
                  </div>
                  <button 
                    onClick={() => setSelectedDayDetail(null)}
                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                     Close Details
                  </button>
               </div>
            )}
         </div>
      </CenterModal>
    </div>
  );
};

export default EmployeeAttendance;
