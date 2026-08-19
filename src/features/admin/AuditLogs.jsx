import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, 
  Search, 
  Download, 
  Filter, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink, 
  User, 
  Settings, 
  Database, 
  Activity, 
  Clock, 
  ChevronRight, 
  ChevronLeft,
  Monitor, 
  Globe, 
  Lock, 
  Zap,
  Info,
  Laptop,
  Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAdmin } from '../../context/AdminContext';
import ExportAuditModal from '../../shared/components/admin/ExportAuditModal';
import SecurityScanModal from '../../shared/components/admin/SecurityScanModal';
import AuditFilterModal from '../../shared/components/admin/AuditFilterModal';
import AuditLogDrawer from '../../shared/components/admin/AuditLogDrawer';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import EmptyState from '../../shared/components/ui/EmptyState';

const AuditLogs = () => {
  const { systemLogs = [], fetchAuditLogs, auditPagination = {}, showToast } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState({ severity: 'All', module: 'All', environment: 'All' });
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [logToView, setLogToView] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch paginated audit logs from backend
  const loadLogs = async () => {
    setLoading(true);
    try {
      await fetchAuditLogs({
        page: currentPage,
        limit: 15,
        search: debouncedSearch,
        action: filters.module !== 'All' ? filters.module : undefined
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [currentPage, debouncedSearch, filters.module]);

  const handleExportRow = (log) => {
      const dataStr = JSON.stringify(log, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `audit_log_${log.id}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Row exported successfully', 'success');
  };

  const handleFlagIncident = (log) => {
      showToast(`Incident flagged for log ID: ${log.id}`, 'warning');
  };

  const totalPages = auditPagination.totalPages || 1;

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">System Audit Logs</h1>
          <p className="text-slate-500 font-medium tracking-tight">Immutable record of all platform activities, administrative changes and security events</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsExportOpen(true)} className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2">
            <Download size={18} />
            <span className="hidden sm:inline">Export Audit Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
         <div className="lg:col-span-12 space-y-6 h-full">
            <div className="card p-0 overflow-hidden bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                     <input
                        type="text"
                        placeholder="Search logs by action, details, IP or user..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="input-field pl-10 h-10 bg-slate-50 dark:bg-slate-800/40 border-none shadow-sm text-xs font-bold w-full"
                     />
                  </div>
                  <button onClick={() => setIsFilterOpen(true)} className={cn("p-2.5 hover:text-primary-600 hover:bg-white dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl transition-all h-10 shadow-sm relative shrink-0", Object.values(filters).some(f => f !== 'All') ? "text-primary-600 bg-primary-50 border-primary-100" : "text-slate-400 bg-slate-50 dark:bg-slate-800/30")}>
                     <Filter size={18} />
                     {Object.values(filters).some(f => f !== 'All') && <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full" />}
                  </button>
                </div>

               <div className="p-0 overflow-x-auto min-h-[450px]">
                  {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center text-slate-400">
                      <Loader2 size={32} className="animate-spin mb-3 text-primary-600" />
                      <p className="text-xs font-bold">Querying system audit log database...</p>
                    </div>
                  ) : systemLogs.length === 0 ? (
                    <EmptyState
                      icon={History}
                      title="No Audit Logs Found"
                      description="No administrative activities or audit events matched your search filter criteria."
                    />
                  ) : (
                    <table className="w-full text-left">
                       <thead>
                          <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                             <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Timestamp / Level</th>
                             <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">User Context</th>
                             <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Module</th>
                             <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center font-bold">Action Event</th>
                             <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Environment / IP</th>
                             <th className="px-8 py-5 text-right text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Action</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {systemLogs.map((log) => (
                             <tr key={log.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer" onClick={() => setLogToView(log)}>
                                <td className="px-8 py-5">
                                   <div className="flex flex-col gap-1.5">
                                      <span className={cn(
                                         "px-2 py-0.5 max-w-fit rounded text-[8px] font-black uppercase tracking-widest border",
                                         log.level === 'Security' ? "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-950/30 dark:text-indigo-400 dark:border-indigo-800" :
                                         log.level === 'Critical' ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800" :
                                         log.level === 'Warning' ? "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800" :
                                         "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400"
                                      )}>
                                         {log.level}
                                      </span>
                                      <div className="flex items-center gap-1.5 text-slate-400">
                                         <Clock size={11} />
                                         <span className="text-[10px] font-bold">{log.time}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-5">
                                   <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                                         {(typeof log.user === 'object' && log.user !== null ? (log.user.email || 'S') : (log.user || 'S'))[0]}
                                      </div>
                                      <span className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">
                                         {typeof log.user === 'object' && log.user !== null ? log.user.email : log.user}
                                      </span>
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{log.module}</span>
                                </td>
                                <td className="px-8 py-5 text-center">
                                   <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-primary-600 transition-colors">{log.action}</p>
                                   {log.details && <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{log.details}</p>}
                                </td>
                                <td className="px-8 py-5 text-center">
                                   <div className="flex flex-col items-center gap-1">
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                         <Globe size={12} />
                                         <span>{log.ipAddress || log.ip || '127.0.0.1'}</span>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                   <ActionDropdown 
                                      actions={[
                                         { label: 'View Details', icon: ExternalLink, onClick: () => setLogToView(log) },
                                         { label: 'Copy Log ID', icon: Database, onClick: () => navigator.clipboard.writeText(`LOG-${log.id}`) },
                                         { label: 'Export Row', icon: Download, onClick: () => handleExportRow(log) },
                                         { label: 'Flag Incident', icon: AlertTriangle, onClick: () => handleFlagIncident(log), className: "text-rose-600 hover:text-rose-700 hover:bg-rose-50" },
                                      ]}
                                   />
                                </td>
                             </tr>
                          ))}
                       </tbody>
                    </table>
                  )}
               </div>

               {/* Pagination Controls */}
               <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                  <span className="text-xs font-bold text-slate-400">
                    Showing page {currentPage} of {totalPages} ({auditPagination.total || 0} total logs)
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1 || loading}
                      className="p-2 btn-secondary text-xs disabled:opacity-40"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs font-bold px-3 text-slate-700 dark:text-slate-300">
                      {currentPage} / {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage >= totalPages || loading}
                      className="p-2 btn-secondary text-xs disabled:opacity-40"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <ExportAuditModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
      <SecurityScanModal isOpen={isScanOpen} onClose={() => setIsScanOpen(false)} />
      <AuditFilterModal isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} filters={filters} setFilters={setFilters} />
      <AuditLogDrawer isOpen={!!logToView} onClose={() => setLogToView(null)} log={logToView} />
    </div>
  );
};

export default AuditLogs;
