import React, { useState, useEffect, useMemo } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { PageHeader } from '../../shared/components/layout/PageHeader';
import { 
  FileSearch, Search, Filter, RefreshCw, User, Shield, 
  Globe, Laptop, Clock, Database, AlertCircle, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDateFormat } from '../../hooks/useDateFormat';

const AuditLogs = () => {
  const { activityLogs, users, fetchUserAuditLogs, refetch } = useSuperAdmin();
  const { formatDate } = useDateFormat();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('All');
  const [selectedActionFilter, setSelectedActionFilter] = useState('All');
  
  const [displayedLogs, setDisplayedLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load logs
  useEffect(() => {
    if (selectedUserFilter === 'All') {
      setDisplayedLogs(activityLogs);
    } else {
      loadUserLogs(selectedUserFilter);
    }
  }, [selectedUserFilter, activityLogs]);

  const loadUserLogs = async (userId) => {
    setLoading(true);
    const logs = await fetchUserAuditLogs(userId);
    setDisplayedLogs(logs);
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (refetch && refetch.fetchAuditLogs) {
        await refetch.fetchAuditLogs();
      }
      if (selectedUserFilter !== 'All') {
        await loadUserLogs(selectedUserFilter);
      }
      // Artificial delay for better UX (spinner visibility)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Show success toast if available in context, otherwise dispatch directly
      if (window) {
        window.dispatchEvent(new CustomEvent('app_toast', { detail: { message: 'Audit logs refreshed', type: 'success' } }));
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  };

  // Get unique actions for filter dropdown
  const uniqueActions = useMemo(() => {
    const actions = new Set(activityLogs.map(log => log.action));
    return ['All', ...Array.from(actions)];
  }, [activityLogs]);

  // Client-side filtering (Search and Action filter)
  const filteredLogs = useMemo(() => {
    return displayedLogs.filter(log => {
      const matchAction = selectedActionFilter === 'All' || log.action === selectedActionFilter;
      
      const userEmail = typeof log.user === 'object' && log.user !== null ? (log.user.email || '') : (log.user || '');
      const userRole = typeof log.user === 'object' && log.user !== null ? (log.user.role || '') : 'SYSTEM';
      const userOrg = typeof log.user === 'object' && log.user !== null ? (log.user.organization?.name || '') : 'Platform';
      const details = log.details || '';
      const action = log.action || '';
      
      const matchSearch = 
        details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userRole.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userOrg.toLowerCase().includes(searchTerm.toLowerCase());
        
      return matchAction && matchSearch;
    });
  }, [displayedLogs, selectedActionFilter, searchTerm]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-left">
      {/* Header */}
      <PageHeader
        icon={FileSearch}
        title="System Audit Logs"
        subtitle="Track platform-wide security, administrative changes, and tenant activities."
      >
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2 disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          <span>Refresh</span>
        </button>
      </PageHeader>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search details, emails, roles..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-3 py-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-bold focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* User Filter */}
          <div>
            <select
              value={selectedUserFilter}
              onChange={e => setSelectedUserFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
            >
              <option value="All">All Users</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          {/* Action Event Filter */}
          <div>
            <select
              value={selectedActionFilter}
              onChange={e => setSelectedActionFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
            >
              {uniqueActions.map(action => (
                <option key={action} value={action}>
                  {action === 'All' ? 'All Actions' : action}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800 shrink-0">
          Logs Count: {filteredLogs.length}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-24">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 font-bold">
                  <th className="p-4 pl-6">Timestamp</th>
                  <th className="p-4">User Context</th>
                  <th className="p-4">Action Event</th>
                  <th className="p-4">Details</th>
                  <th className="p-4 text-right pr-6">IP / Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                      {/* Timestamp */}
                      <td className="p-4 pl-6 font-medium text-slate-550 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-400" />
                          <span>{formatDate(log.createdAt)}</span>
                        </div>
                      </td>

                      {/* User Context */}
                      <td className="p-4">
                        {log.user ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-350 flex items-center justify-center font-bold text-[10px] uppercase">
                              {(typeof log.user === 'object' && log.user !== null ? (log.user.email || 'S') : (log.user || 'S')).charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 dark:text-slate-200">
                                {typeof log.user === 'object' && log.user !== null ? log.user.email : log.user}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                {typeof log.user === 'object' && log.user !== null 
                                  ? `${log.user.role || 'USER'} ${log.user.organization ? `• ${log.user.organization.name}` : '• Platform'}`
                                  : 'SYSTEM • Platform'}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">System / Anonymous</span>
                        )}
                      </td>

                      {/* Action Event */}
                      <td className="p-4">
                        <span className="inline-flex px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider text-[9px]">
                          {log.action}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300 max-w-xs sm:max-w-md truncate" title={log.details || log.action}>
                        {log.details || log.action}
                      </td>

                      {/* IP / Device */}
                      <td className="p-4 text-right pr-6">
                        <div className="flex flex-col items-end gap-0.5">
                          {log.ipAddress && (
                            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-450">
                              <Globe size={10} />
                              <span>{log.ipAddress}</span>
                            </div>
                          )}
                          <div className="text-[9px] text-slate-400 dark:text-slate-500 font-medium">
                            Cloud Environment
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-400 font-medium">
                      No audit logs match your search and filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogs;
