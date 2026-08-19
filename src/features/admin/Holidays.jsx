import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Search, 
  Plus, 
  Download, 
  Edit3, 
  Trash2, 
  CalendarDays, 
  Target, 
  MapPin,
  Globe2,
  ChevronUp,
  ChevronDown,
  Clock
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';
import HolidayModal from '../../shared/components/admin/HolidayModal';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import WeekendRuleModal from '../../shared/components/admin/WeekendRuleModal';
import CalendarModal from '../../shared/components/admin/CalendarModal';
import AssignmentModal from '../../shared/components/admin/AssignmentModal';
import PermissionGate from '../../shared/components/common/PermissionGate';
import { usePermission } from '../../hooks/usePermission';
import { useDateFormat } from '../../hooks/useDateFormat';



// Dynamically determine status based on today's real date
const getStatus = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const holidayDate = new Date(dateStr);
  holidayDate.setHours(0, 0, 0, 0);
  return holidayDate >= today ? 'Upcoming' : 'Passed';
};

// Days until a future holiday
const daysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const holidayDate = new Date(dateStr);
  holidayDate.setHours(0, 0, 0, 0);
  return Math.ceil((holidayDate - today) / (1000 * 60 * 60 * 24));
};

const HolidayRow = ({ hday, onEdit, onDelete, showToast }) => {
  const { formatDate } = useDateFormat();
  const { check: hasPerm } = usePermission('holidays');
  const status = getStatus(hday.date);
  const isPassed = status === 'Passed';
  const days = !isPassed ? daysUntil(hday.date) : null;

  return (
    <tr className={cn('group transition-colors', isPassed ? 'hover:bg-slate-50/30 dark:hover:bg-slate-800/20 opacity-70' : 'hover:bg-slate-50/40 dark:hover:bg-slate-800/30')}>
      <td className="px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center shrink-0', isPassed ? 'bg-slate-100 dark:bg-slate-800 text-slate-400' : 'bg-primary-50 dark:bg-primary-950/40 text-primary-600')}>
            <Target size={18} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white tracking-tight text-sm">{hday.name}</p>
            {!isPassed && days !== null && days <= 30 && (
              <p className="text-[10px] font-bold text-amber-500 tracking-widest uppercase mt-0.5">
                {days === 0 ? 'Today!' : `In ${days} day${days === 1 ? '' : 's'}`}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-center whitespace-nowrap">
        <p className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{formatDate(hday.date)}</p>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-center hidden sm:table-cell">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{hday.type}</span>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-center hidden md:table-cell">
        <div className="flex items-center justify-center gap-1.5 text-slate-500">
          <MapPin size={11} />
          <span className="text-xs font-medium">{hday.region}</span>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-center">
        <span className={cn(
          'px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border',
          status === 'Upcoming'
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900'
            : 'bg-slate-50 text-slate-400 border-slate-100 dark:bg-slate-800 dark:border-slate-700'
        )}>
          {status}
        </span>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-right">
        <ActionDropdown 
          actions={[
            hasPerm('edit') ? { label: 'Edit Holiday', icon: Edit3, onClick: () => onEdit(hday) } : null,
            hasPerm('create') ? { label: 'Duplicate', icon: Globe2, onClick: () => showToast('Holiday duplicated successfully') } : null,
            hasPerm('delete') ? { label: 'Delete', icon: Trash2, danger: true, onClick: () => onDelete(hday) } : null,
          ].filter(Boolean)}
        />
      </td>
    </tr>
  );
};

const Holidays = () => {
  const { holidays, deleteHoliday, showToast, calendars, deleteCalendar, createCalendar, updateCalendar, assignCalendar, removeAssignment, users, departments } = useAdmin();
  const [activeTab, setActiveTab] = useState('Holidays');
  const [selectedCalendarId, setSelectedCalendarId] = useState('');
  const tabs = ['Work Calendars', 'Holidays', 'Weekend Rules', 'Assignments'];
  const { formatDate } = useDateFormat();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isWeekendRuleModalOpen, setIsWeekendRuleModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [holidayToEdit, setHolidayToEdit] = useState(null);
  const [holidayToDelete, setHolidayToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [showPast, setShowPast] = useState(false);

  // Auto-select a default calendar if none is selected
  useEffect(() => {
    if (calendars && calendars.length > 0 && !selectedCalendarId) {
      const defaultCal = calendars.find(c => c.isDefaultCompanyCalendar) || calendars[0];
      if (defaultCal) setSelectedCalendarId(defaultCal.id);
    }
  }, [calendars, selectedCalendarId]);

  // Apply search & region filters
  const filteredHolidays = useMemo(() => (Array.isArray(holidays) ? holidays : []).filter(h => {
    const matchesSearch =
      h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      h.region.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRegion = regionFilter === 'All Regions' || h.region.includes(regionFilter);
    return matchesSearch && matchesRegion;
  }), [holidays, searchTerm, regionFilter]);

  // Upcoming: nearest date first (dynamically computed from real date)
  const upcomingHolidays = useMemo(() =>
    filteredHolidays
      .filter(h => getStatus(h.date) === 'Upcoming')
      .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [filteredHolidays]
  );

  // Past: most recent first (dynamically computed from real date)
  const pastHolidays = useMemo(() =>
    filteredHolidays
      .filter(h => getStatus(h.date) === 'Passed')
      .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [filteredHolidays]
  );

  const stats = [
    { label: 'Upcoming Holidays', value: upcomingHolidays.length, icon: CalendarDays, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-950/30' },
    { label: 'Total in 2026', value: holidays.length, icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Past This Year', value: pastHolidays.length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  const handleDownload = () => {
    const csvRows = [
      ['Name', 'Date', 'Type', 'Region', 'Status'].join(','),
      ...filteredHolidays.map(h => [h.name, formatDate(h.date), h.type, h.region, getStatus(h.date)].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'holidays_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Holidays exported successfully');
  };

  const tableHead = (
    <thead>
      <tr className="bg-slate-50/70 dark:bg-slate-800/50">
        <th className="px-4 sm:px-8 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Holiday</th>
        <th className="px-4 sm:px-8 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center">Date</th>
        <th className="px-4 sm:px-8 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center hidden sm:table-cell">Type</th>
        <th className="px-4 sm:px-8 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center hidden md:table-cell">Region</th>
        <th className="px-4 sm:px-8 py-3 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center">Status</th>
        <th className="px-4 sm:px-8 py-3 text-right text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Action</th>
      </tr>
    </thead>
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Holiday Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Configure the corporate holiday calendar and synchronized regional events</p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate module="holidays" action="create">
          <button
            onClick={() => {
              if (activeTab === 'Holidays') {
                setHolidayToEdit(null); setIsAddModalOpen(true);
              } else if (activeTab === 'Work Calendars') {
                setIsCalendarModalOpen(true);
              } else if (activeTab === 'Weekend Rules') {
                setIsWeekendRuleModalOpen(true);
              } else if (activeTab === 'Assignments') {
                setIsAssignmentModalOpen(true);
              } else {
                showToast(`Feature coming soon for ${activeTab}`);
              }
            }}
            className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={18} />
            <span>Add {activeTab === 'Holidays' ? 'Holiday' : activeTab === 'Work Calendars' ? 'Calendar' : activeTab === 'Weekend Rules' ? 'Rule' : 'Assignment'}</span>
          </button>
          </PermissionGate>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-full max-w-2xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 px-4 text-sm font-bold rounded-lg transition-all whitespace-nowrap',
              activeTab === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Work Calendars' && (
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">Work Calendars</h2>
          <table className="w-full text-left text-sm text-slate-500">
            <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Timezone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {calendars?.map(cal => (
                <tr key={cal.id} className="border-b">
                  <td className="px-4 py-4 font-bold text-slate-900">{cal.name} {cal.isDefaultCompanyCalendar ? '(Default)' : ''}</td>
                  <td className="px-4 py-4">{cal.timezone}</td>
                  <td className="px-4 py-4">
                    <span className={cn('px-2 py-1 rounded text-xs font-bold', cal.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{cal.status}</span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {!cal.isDefaultCompanyCalendar && (
                      <button onClick={() => {
                        if(window.confirm('Are you sure you want to delete this calendar?')) {
                          deleteCalendar(cal.id);
                        }
                      }} className="text-red-500 hover:text-red-700 p-2">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(!calendars || calendars.length === 0) && <tr><td colSpan="4" className="text-center py-4">No Calendars Found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'Holidays' && (
        <>
          {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -4 }} className="card p-5 sm:p-6">
            <div className="flex items-center gap-4">
              <div className={cn('p-3 rounded-2xl shrink-0', stat.bg, stat.color)}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 font-bold leading-none mb-1.5">{stat.label}</p>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 w-full text-slate-400">
          <Search className="absolute left-3 top-3" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search holidays by name or region..."
            className="input-field pl-10 h-11 bg-white dark:bg-slate-900 border-transparent shadow-sm w-full"
          />
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <select
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
            className="input-field h-11 pr-10 min-w-[140px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm border-none"
          >
            <option>All Regions</option>
            <option>Global</option>
            <option>APAC</option>
            <option>Europe</option>
            <option>India</option>
            <option>USA</option>
          </select>
          <button
            onClick={handleDownload}
            title="Export CSV"
            className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl transition-all h-11 w-11 flex items-center justify-center shrink-0"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="card p-0 border-none bg-white dark:bg-slate-900 shadow-soft overflow-hidden">

        {/* Past Holidays — collapsible, above upcoming */}
        {pastHolidays.length > 0 && (
          <div>
            <button
              onClick={() => setShowPast(p => !p)}
              className="w-full flex items-center justify-between px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
            >
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Clock size={14} />
                <span className="text-[11px] font-extrabold font-bold">
                  {showPast ? 'Hide' : 'Show'} Past Holidays ({pastHolidays.length})
                </span>
              </div>
              <div className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 group-hover:bg-slate-200 dark:group-hover:bg-slate-600 transition-colors">
                {showPast ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
              </div>
            </button>

            <AnimatePresence>
              {showPast && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="overflow-x-auto border-b border-slate-100 dark:border-slate-800">
                    <table className="w-full text-left">
                      {tableHead}
                      <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
                        {pastHolidays.map(hday => (
                          <HolidayRow
                            key={hday.id}
                            hday={hday}
                            onEdit={(h) => { setHolidayToEdit(h); setIsAddModalOpen(true); }}
                            onDelete={setHolidayToDelete}
                            showToast={showToast}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Upcoming Holidays — always visible */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            {tableHead}
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
              {upcomingHolidays.length > 0 ? (
                upcomingHolidays.map(hday => (
                  <HolidayRow
                    key={hday.id}
                    hday={hday}
                    onEdit={(h) => { setHolidayToEdit(h); setIsAddModalOpen(true); }}
                    onDelete={setHolidayToDelete}
                    showToast={showToast}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700">
                        <Calendar size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">No upcoming holidays found</p>
                        <p className="text-sm font-medium text-slate-400">Try adjusting your filters or add a new holiday</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      </>
      )}

      {activeTab === 'Weekend Rules' && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Weekend Rules</h2>
            <select className="input-field max-w-xs" value={selectedCalendarId} onChange={e => setSelectedCalendarId(e.target.value)}>
              <option value="">-- Select Calendar --</option>
              {calendars?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          
          {selectedCalendarId ? (
            <table className="w-full text-left text-sm text-slate-500 mt-4">
              <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                <tr><th className="px-4 py-3">Day of Week</th><th className="px-4 py-3">Type</th><th className="px-4 py-3 text-right">Action</th></tr>
              </thead>
              <tbody>
                {calendars.find(c => c.id === selectedCalendarId)?.versions?.[0]?.weekends?.map(w => (
                  <tr key={w.id} className="border-b">
                    <td className="px-4 py-4 font-bold text-slate-900">{w.dayOfWeek}</td>
                    <td className="px-4 py-4">{w.type}</td>
                    <td className="px-4 py-4 text-right text-red-500 cursor-pointer hover:text-red-700 font-bold" onClick={() => {
                        const cal = calendars.find(c => c.id === selectedCalendarId);
                        const newWeekends = cal.versions[0].weekends.filter(wx => wx.id !== w.id);
                        updateCalendar(selectedCalendarId, { weekends: newWeekends.map(wx => ({ dayOfWeek: wx.dayOfWeek, type: wx.type })) });
                    }}>Remove</td>
                  </tr>
                ))}
                {(!calendars.find(c => c.id === selectedCalendarId)?.versions?.[0]?.weekends?.length) && <tr><td colSpan="3" className="text-center py-4">No Weekend Rules defined.</td></tr>}
              </tbody>
            </table>
          ) : (
            <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm font-medium">Please select a calendar from the dropdown above to view or add weekend rules.</div>
          )}
        </div>
      )}

      {activeTab === 'Assignments' && (
        <div className="card p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Calendar Assignments</h2>
            <select className="input-field max-w-xs" value={selectedCalendarId} onChange={e => setSelectedCalendarId(e.target.value)}>
              <option value="">-- Select Calendar --</option>
              {calendars?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          {selectedCalendarId ? (
            <table className="w-full text-left text-sm text-slate-500 mt-4">
              <thead className="bg-slate-50 text-xs text-slate-700 uppercase">
                <tr>
                  <th className="px-4 py-3">Entity Type</th>
                  <th className="px-4 py-3">Assigned To</th>
                  <th className="px-4 py-3">Effective From</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {calendars.find(c => c.id === selectedCalendarId)?.assignments?.map(a => {
                  let entityLabel = a.entityId;
                  if (a.entityType === 'EMPLOYEE') {
                    const u = users?.find(user => user.id === a.entityId);
                    if (u) entityLabel = `${u.name} (${u.email})`;
                  } else if (a.entityType === 'DEPARTMENT') {
                    const d = departments?.find(dept => dept.id === a.entityId);
                    if (d) entityLabel = d.name;
                  }
                  return (
                    <tr key={a.id} className="border-b">
                      <td className="px-4 py-4 font-bold text-slate-900">{a.entityType}</td>
                      <td className="px-4 py-4">{entityLabel}</td>
                      <td className="px-4 py-4">{new Date(a.effectiveFrom).toLocaleDateString()}</td>
                      <td className="px-4 py-4 text-right">
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to remove this assignment?')) {
                              removeAssignment(a.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-2 font-bold inline-flex items-center gap-1"
                        >
                          <Trash2 size={16} />
                          <span>Remove</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {(!calendars.find(c => c.id === selectedCalendarId)?.assignments?.length) && <tr><td colSpan="4" className="text-center py-4">No Assignments found.</td></tr>}
              </tbody>
            </table>
          ) : (
            <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm font-medium">Please select a calendar from the dropdown above to view assignments.</div>
          )}
        </div>
      )}

      {/* Modals */}
      <HolidayModal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); setHolidayToEdit(null); }}
        holidayToEdit={holidayToEdit}
      />

      <ConfirmDialog
        isOpen={!!holidayToDelete}
        onClose={() => setHolidayToDelete(null)}
        onConfirm={() => deleteHoliday(holidayToDelete.id)}
        title="Delete Holiday"
        message={`Are you sure you want to delete ${holidayToDelete?.name}? This action cannot be undone.`}
      />
      
      <WeekendRuleModal 
        isOpen={isWeekendRuleModalOpen}
        onClose={() => setIsWeekendRuleModalOpen(false)}
        selectedCalendarId={selectedCalendarId}
        setSelectedCalendarId={setSelectedCalendarId}
      />
      
      <CalendarModal 
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
      />
      
      <AssignmentModal 
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        selectedCalendarId={selectedCalendarId}
      />
    </div>
  );
};

export default Holidays;
