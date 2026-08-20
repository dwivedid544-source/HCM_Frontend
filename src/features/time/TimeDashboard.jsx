import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  CalendarDays, 
  Watch, 
  BarChart2, 
  Check, 
  X, 
  Search, 
  Settings, 
  Save, 
  Users, 
  Coffee, 
  ArrowRight, 
  MapPin, 
  Monitor, 
  Calendar,
  Zap,
  Sliders,
  Play
} from 'lucide-react';
import PageHeader from '../../shared/components/layout/PageHeader';
import StatCard from '../../shared/components/ui/StatCard';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../../shared/components/ui/Avatar';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const TimeDashboard = () => {
  // --- Data States ---
  const [globalAttendance, setGlobalAttendance] = useState([]);
  const [globalLeaves, setGlobalLeaves] = useState([]);
  const [shiftConfig, setShiftConfig] = useState({
    shiftStart: '09:00',
    shiftEnd: '18:00',
    gracePeriod: '15',
    lunchDuration: '60',
    overtimeRate: '1.5'
  });

  // --- UI States ---
  const [activeTab, setActiveTab] = usePersistedTab('time_dashboard', 'live'); // live, leaves, schedule, history
  const [searchTerm, setSearchTerm] = useState('');
  const [modeFilter, setModeFilter] = useState('All');
  const [leaveSearch, setLeaveSearch] = useState('');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [toast, setToast] = useState(null);

  // --- Sync State ---
  const loadGlobalData = () => {
    // Load attendance
    let att = localStorage.getItem('hcm_global_attendance');
    if (!att) {
      const defaultAttendance = [
        { id: '1', name: 'John Wick', date: '2026-06-01', clockIn: '09:00 AM', clockOut: '-', totalHours: '0h', status: 'Present', mode: 'Office' },
        { id: '2', name: 'Alice Cooper', date: '2026-06-01', clockIn: '08:45 AM', clockOut: '-', totalHours: '0h', status: 'Present', mode: 'Remote' },
        { id: '3', name: 'Bob Marley', date: '2026-06-01', clockIn: '09:20 AM', clockOut: '-', totalHours: '0h', status: 'Late', mode: 'Office' },
        { id: '4', name: 'Sarah Connor', date: '2026-05-31', clockIn: '08:55 AM', clockOut: '05:45 PM', totalHours: '8h 50m', status: 'Present', mode: 'Remote' },
        { id: '5', name: 'John Doe', date: '2026-05-31', clockIn: '09:00 AM', clockOut: '06:05 PM', totalHours: '9h 5m', status: 'Present', mode: 'Office' },
        { id: '6', name: 'Jim Halpert', date: '2026-05-31', clockIn: '09:10 AM', clockOut: '06:30 PM', totalHours: '9h 20m', status: 'Late', mode: 'Office' },
        { id: '7', name: 'John Doe', date: '2026-05-30', clockIn: '-', clockOut: '-', totalHours: '0h', status: 'On Leave', mode: '-' },
      ];
      localStorage.setItem('hcm_global_attendance', JSON.stringify(defaultAttendance));
      att = JSON.stringify(defaultAttendance);
    }
    setGlobalAttendance(JSON.parse(att));

    // Load leaves
    let lvs = localStorage.getItem('hcm_global_leaves');
    if (!lvs) {
      const defaultLeaves = [
        { id: 1, name: 'John Doe', type: 'Annual Leave', startDate: '2026-06-05', endDate: '2026-06-12', days: 6, reason: 'Family vacation to Hawaii', status: 'Pending', managerComment: '', emergencyContact: '9876543210', submittedAt: '2026-05-31' },
        { id: 2, name: 'Bob Marley', type: 'Sick Leave', startDate: '2026-06-02', endDate: '2026-06-03', days: 2, reason: 'Medical checkup and recovery', status: 'Pending', managerComment: '', emergencyContact: '9876543210', submittedAt: '2026-06-01' },
        { id: 3, name: 'John Doe', type: 'Sick Leave', startDate: '2026-05-30', endDate: '2026-05-30', days: 1, reason: 'High fever', status: 'Approved', managerComment: 'Get well soon!', emergencyContact: '9876543210', submittedAt: '2026-05-29' },
      ];
      localStorage.setItem('hcm_global_leaves', JSON.stringify(defaultLeaves));
      lvs = JSON.stringify(defaultLeaves);
    }
    setGlobalLeaves(JSON.parse(lvs));

    // Load shift config
    let conf = localStorage.getItem('company_shift_config');
    if (!conf) {
      const defaultConf = {
        shiftStart: '09:00',
        shiftEnd: '18:00',
        gracePeriod: '15',
        lunchDuration: '60',
        overtimeRate: '1.5'
      };
      localStorage.setItem('company_shift_config', JSON.stringify(defaultConf));
      conf = JSON.stringify(defaultConf);
    }
    setShiftConfig(JSON.parse(conf));
  };

  useEffect(() => {
    loadGlobalData();
    window.addEventListener('hcm_global_sync', loadGlobalData);
    window.addEventListener('storage', loadGlobalData);
    return () => {
      window.removeEventListener('hcm_global_sync', loadGlobalData);
      window.removeEventListener('storage', loadGlobalData);
    };
  }, []);

  const triggerSync = () => {
    window.dispatchEvent(new CustomEvent('hcm_global_sync'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Actions ---
  const handleLeaveAction = (id, status) => {
    const updatedLeaves = globalLeaves.map(l => {
      if (l.id === id) {
        if (status === 'Approved') {
          // Add On Leave entry to attendance for dates
          const onLeaveEntry = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
            name: l.name,
            date: l.startDate,
            clockIn: '-',
            clockOut: '-',
            totalHours: '0h',
            status: 'On Leave',
            mode: '-'
          };
          const updatedAtt = [onLeaveEntry, ...globalAttendance];
          localStorage.setItem('hcm_global_attendance', JSON.stringify(updatedAtt));
          setGlobalAttendance(updatedAtt);
        }
        return { ...l, status, managerComment: 'Reviewed by Super Admin' };
      }
      return l;
    });

    localStorage.setItem('hcm_global_leaves', JSON.stringify(updatedLeaves));
    setGlobalLeaves(updatedLeaves);
    triggerSync();
    showToast(`Leave application ${status.toLowerCase()} successfully`);
    setSelectedLeave(null);
  };

  const handleSaveShiftConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('company_shift_config', JSON.stringify(shiftConfig));
    triggerSync();
    showToast('Corporate shift parameters updated company-wide');
  };

  // --- Calculations for Stats ---
  const activeWorkers = globalAttendance.filter(a => a.clockOut === '-');
  const onLeaveToday = globalLeaves.filter(l => {
    const today = new Date().toISOString().split('T')[0];
    return l.status === 'Approved' && today >= l.startDate && today <= l.endDate;
  }).length;

  const stats = [
    { label: 'Clocked In', value: activeWorkers.length, sub: 'Active workers', icon: Clock, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'On Leave Today', value: onLeaveToday || 1, sub: 'Approved leaves', icon: CalendarDays, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
    { label: 'Pending Approvals', value: globalLeaves.filter(l => l.status === 'Pending').length, sub: 'Leave requests', icon: Watch, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
    { label: 'Avg Work Hours', value: '8.4 hrs', sub: 'Weekly average', icon: BarChart2, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
  ];

  // Filtering
  const filteredLive = activeWorkers.filter(w => 
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLeaves = globalLeaves.filter(l => 
    l.name.toLowerCase().includes(leaveSearch.toLowerCase()) ||
    l.type.toLowerCase().includes(leaveSearch.toLowerCase())
  );

  const filteredHistory = globalAttendance.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(historySearch.toLowerCase());
    const matchesMode = modeFilter === 'All' || h.mode === modeFilter;
    return matchesSearch && matchesMode;
  });

  return (
    <div className="w-full space-y-8 pb-16 animate-fade-in relative text-left">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-sm font-black uppercase tracking-wider ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        icon={Clock}
        title="Time & Attendance System"
        subtitle="Real-time work session tracking, corporate shifts, and leave approvals."
      />

      {/* Stats Board */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <StatCard
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            sub={stat.sub}
            color={stat.color}
            bg={stat.bg}
          />
        ))}
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 gap-6">
        {[
          { id: 'live', label: 'Live Operations', icon: Play },
          { id: 'leaves', label: 'Leave Requests', icon: CalendarDays, badge: globalLeaves.filter(l => l.status === 'Pending').length },
          { id: 'schedule', label: 'Shift Scheduler', icon: Sliders },
          { id: 'history', label: 'Attendance Audit Log', icon: Calendar },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-2 font-black uppercase tracking-widest text-xs flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === tab.id 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 p-8 shadow-soft min-h-[400px]">
        {activeTab === 'live' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Active Work Sessions</h3>
                <p className="text-xs text-slate-400 font-medium">Currently clocked-in employees across all departments</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search live users..." 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-950/30 transition-all text-slate-700 dark:text-slate-200" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 font-bold">Employee</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 font-bold text-center">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Work Mode</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Clocked In At</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-xs">
                  {filteredLive.length > 0 ? filteredLive.map((w) => (
                    <tr key={w.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar src={w.img || ''} alt={w.name} className="w-9 h-9 rounded-xl object-cover" />
                          <div>
                            <p className="font-black text-slate-850 dark:text-slate-100 text-sm leading-none mb-1.5">{w.name}</p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ID: #{String(w.id).slice(-4)}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-2.5 py-1 rounded-lg text-[9px] font-black bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 uppercase tracking-widest">Active</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {w.mode === 'Office' ? <MapPin size={12} className="text-slate-450" /> : <Monitor size={12} className="text-slate-450" />}
                          <span className="font-bold text-slate-600 dark:text-slate-300">{w.mode}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-slate-800 dark:text-slate-200 tabular-nums">
                        {w.clockIn}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => {
                            const updated = globalAttendance.map(a => a.id === w.id ? { ...a, clockOut: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }), totalHours: '8h 0m' } : a);
                            localStorage.setItem('hcm_global_attendance', JSON.stringify(updated));
                            setGlobalAttendance(updated);
                            triggerSync();
                            showToast('Employee successfully clocked out');
                          }}
                          className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[9px] font-bold font-bold transition-colors"
                        >
                          Force Out
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-16 text-center text-slate-300 dark:text-slate-700">
                        <Clock size={40} className="mx-auto mb-3" />
                        <p className="text-[10px] font-bold">No active sessions right now</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'leaves' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Leave Approvals</h3>
                <p className="text-xs text-slate-400 font-medium">Review and process active employee time off applications</p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
                <input 
                  type="text" 
                  value={leaveSearch}
                  onChange={(e) => setLeaveSearch(e.target.value)}
                  placeholder="Search requests..." 
                  className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-950/30 transition-all text-slate-700 dark:text-slate-200" 
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 font-bold">Employee</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Leave Type</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Dates</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Days</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-xs">
                  {filteredLeaves.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar src={l.img || ''} alt={l.name} className="w-9 h-9 rounded-xl object-cover" />
                          <div>
                            <p className="font-black text-slate-850 dark:text-slate-100 text-sm leading-none mb-1">{l.name}</p>
                            <span className="text-[9px] font-bold text-slate-400 italic">"{l.reason.slice(0, 30)}..."</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded uppercase tracking-wider">{l.type}</span>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-slate-600 dark:text-slate-300">
                        {l.startDate} — {l.endDate}
                      </td>
                      <td className="px-6 py-5 text-center font-black text-slate-800 dark:text-slate-200">
                        {l.days}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          l.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                          l.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                          'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                        }`}>
                          {l.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {l.status === 'Pending' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleLeaveAction(l.id, 'Approved')}
                              className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => handleLeaveAction(l.id, 'Rejected')}
                              className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredLeaves.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-300 dark:text-slate-700">
                        <Calendar size={40} className="mx-auto mb-3" />
                        <p className="text-[10px] font-bold">No leave requests found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-8 max-w-2xl mx-auto">
            <div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Shift Settings</h3>
              <p className="text-xs text-slate-400 font-medium">Update the standard working hours and compliance rules globally</p>
            </div>

            <form onSubmit={handleSaveShiftConfig} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold block">Standard Start Time</label>
                  <input 
                    type="time" 
                    value={shiftConfig.shiftStart}
                    onChange={(e) => setShiftConfig({...shiftConfig, shiftStart: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold block">Standard End Time</label>
                  <input 
                    type="time" 
                    value={shiftConfig.shiftEnd}
                    onChange={(e) => setShiftConfig({...shiftConfig, shiftEnd: e.target.value})}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Late Grace (Mins)</label>
                  <input 
                    type="number" 
                    value={shiftConfig.gracePeriod}
                    onChange={(e) => setShiftConfig({...shiftConfig, gracePeriod: e.target.value})}
                    placeholder="15" 
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Lunch Break (Mins)</label>
                  <input 
                    type="number" 
                    value={shiftConfig.lunchDuration}
                    onChange={(e) => setShiftConfig({...shiftConfig, lunchDuration: e.target.value})}
                    placeholder="60" 
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Overtime Rate</label>
                  <input 
                    type="text" 
                    value={shiftConfig.overtimeRate}
                    onChange={(e) => setShiftConfig({...shiftConfig, overtimeRate: e.target.value})}
                    placeholder="1.5x" 
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                <Save size={16} />
                <span>Save Configuration</span>
              </button>
            </form>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Audit Logs</h3>
                <p className="text-xs text-slate-400 font-medium">Full historical archive of all clocked-in/out records</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                  {['All', 'Office', 'Remote', 'Hybrid'].map(mode => (
                    <button 
                      key={mode} 
                      onClick={() => setModeFilter(mode)}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        modeFilter === mode 
                          ? 'bg-slate-900 text-white' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-56">
                  <Search size={14} className="absolute left-3 top-3 text-slate-450" />
                  <input 
                    type="text" 
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                    placeholder="Search logs..." 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-950/30 transition-all text-slate-700 dark:text-slate-200" 
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 font-bold">Date</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 font-bold">Employee</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Mode</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Punch In/Out</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Total Hours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-xs">
                  {filteredHistory.map((h, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-5 font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                        {h.date}
                      </td>
                      <td className="px-6 py-5 font-black text-slate-800 dark:text-slate-100">
                        {h.name}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{h.mode}</span>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                        {h.clockIn} <span className="text-slate-200 dark:text-slate-800 mx-1">→</span> {h.clockOut}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          h.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                          h.status === 'Late' ? 'bg-amber-50 text-amber-600 border border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                          'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {h.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right font-black text-slate-800 dark:text-slate-200 tabular-nums">
                        {h.totalHours}
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-300 dark:text-slate-700">
                        <Clock size={40} className="mx-auto mb-3" />
                        <p className="text-[10px] font-bold">No logs found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeDashboard;
