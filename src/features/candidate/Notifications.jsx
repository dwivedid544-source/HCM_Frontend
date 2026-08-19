import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Search, Trash2, CheckCircle2, Briefcase, MessageSquare, Calendar,
  AlertCircle, Zap, Star, X, ChevronRight, Filter, Check, CheckCheck,
  ArrowRight, ShieldAlert, Info, RotateCcw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { useCandidate } from '../../context/CandidateContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAllNotifications, showToast } = useCandidate();
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', label: 'All Signals' },
    { id: 'jobs', label: 'Career Vectors' },
    { id: 'interviews', label: 'Audit Phases' },
    { id: 'offers', label: 'Offer Intel' },
    { id: 'system', label: 'Ecosystem' },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter(note => {
      const matchesTab = activeTab === 'all' || note.type === activeTab;
      const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [notifications, activeTab, searchTerm]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const handleAction = (note) => {
    markAsRead(note.id);
    if (note.type === 'interviews') {
      navigate('/candidate/interviews');
      showToast('Redirected to Interview Schedule', 'info');
    } else if (note.type === 'jobs') {
      navigate('/candidate/dashboard');
      showToast('Redirected to Job Vectors', 'info');
    } else if (note.type === 'offers') {
      navigate('/candidate/applications');
      showToast('Redirected to Applications', 'info');
    } else {
      showToast(`Redirecting to: ${note.action || 'Event Details'}`, 'info');
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-fade-in max-w-5xl mx-auto text-left px-4 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-soft">
        <div>
          <h1 className="hcm-page-title uppercase leading-none mb-2">SIGNAL QUEUE</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
            Operational Intelligence • <span className="text-primary-600 dark:text-primary-400 font-bold">{unreadCount} New Alerts</span>
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => { markAllAsRead(); showToast('Ecosystem synchronized'); }}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 px-6 py-4 rounded-xl font-bold text-[11px] font-bold transition-all"
          >
            <CheckCheck size={18} />
            <span className="hidden sm:inline">Mark All Read</span>
          </button>
          <button
            onClick={() => { clearAllNotifications(); showToast('Signal queue purged', 'warning'); }}
            className="flex items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:border-rose-200 dark:hover:border-rose-900 px-6 py-4 rounded-xl transition-all shadow-sm"
            title="Clear all notifications"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Control Engine */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={cn(
                "px-5 py-3 rounded-xl text-[10px] sm:text-xs font-bold transition-all border",
                activeTab === cat.id
                  ? "bg-slate-900 dark:bg-primary-600 text-white border-transparent shadow-xl"
                  : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm"
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Query signals..."
            className="w-full h-14 pl-14 pr-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Signal List */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((note) => {
              const Icon = note.type === 'offers' ? Zap : note.type === 'interviews' ? Calendar : note.type === 'jobs' ? Briefcase : AlertCircle;
              return (
                <motion.div
                  layout
                  key={note.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={cn(
                    "group p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] bg-white dark:bg-slate-900 border shadow-soft transition-all duration-500 relative overflow-hidden",
                    note.isUnread ? "border-slate-200 dark:border-slate-700 border-l-8 border-l-primary-600 dark:border-l-primary-500 shadow-xl" : "border-slate-100 dark:border-slate-800 opacity-75 grayscale-[0.3]"
                  )}
                >
                  <div className="flex flex-col md:flex-row items-start gap-6 md:gap-10 relative z-10">
                    {/* Visual Anchor */}
                    <div className={cn(
                      "w-16 h-16 md:w-20 md:h-20 rounded-[1.5rem] md:rounded-[2rem] flex items-center justify-center shrink-0 shadow-lg md:shadow-2xl transition-transform duration-700 group-hover:rotate-6",
                      note.type === 'offers' ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400" :
                        note.type === 'interviews' ? "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400" :
                          note.type === 'jobs' ? "bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400" : "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400"
                    )}>
                      <Icon className="w-8 h-8 md:w-10 md:h-10" />
                    </div>

                    {/* Metadata Content */}
                    <div className="flex-1 space-y-4 w-full">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-none tracking-tight">{note.title}</h3>
                          {note.isUnread && (
                            <span className="w-2.5 h-2.5 bg-primary-600 dark:bg-primary-500 rounded-full animate-pulse shadow-lg shadow-primary-200 dark:shadow-none shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] md:text-xs font-bold text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-700 self-start sm:self-auto">{note.time}</span>
                      </div>
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">"{note.message}"</p>

                      <div className="pt-6 flex flex-wrap items-center gap-4">
                        <button
                          onClick={() => handleAction(note)}
                          className="btn-primary w-full sm:w-auto px-8 py-3.5 shadow-xl shadow-primary-200 dark:shadow-none text-xs flex items-center justify-center gap-2"
                        >
                          {note.action || 'Execute Response'} <ArrowRight size={14} />
                        </button>
                        <button
                          onClick={() => deleteNotification(note.id)}
                          className="w-full sm:w-auto p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all flex items-center justify-center shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Background Aura */}
                  <div className="absolute -bottom-10 -right-10 opacity-[0.02] dark:opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform duration-1000 hidden md:block">
                    <Icon size={200} />
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="py-24 md:py-40 text-center space-y-8 flex flex-col items-center bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-soft">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-slate-50 dark:bg-slate-800 rounded-[2rem] md:rounded-[2.5rem] flex items-center justify-center text-slate-300 dark:text-slate-600 animate-pulse border border-slate-100 dark:border-slate-700 shadow-inner">
                <Bell size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Silent Ecosystem</h3>
                <p className="text-[10px] font-bold text-slate-400 font-bold mt-4">Monitoring for strategic signals...</p>
              </div>
              <button onClick={() => { setSearchTerm(''); setActiveTab('all'); }} className="text-[10px] font-bold text-primary-600 font-bold hover:underline px-6 py-2 bg-primary-50 dark:bg-primary-950/30 rounded-lg">Reset Frequency</button>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Tertiary Metrics Overlay */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 left-4 right-4 md:bottom-10 md:left-1/2 md:-translate-x-1/2 z-50 p-4 md:px-8 md:py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex flex-col sm:flex-row items-center gap-4 sm:gap-8 border border-slate-700 dark:border-slate-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold">Live Signals: {unreadCount} Priority</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-slate-700 dark:bg-slate-200" />
            <button onClick={markAllAsRead} className="text-[10px] font-bold text-primary-400 hover:text-white dark:hover:text-primary-600 transition-colors w-full sm:w-auto py-2 sm:py-0 border-t sm:border-t-0 border-slate-700 dark:border-slate-200 text-center">Acknowledge All</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notifications;
