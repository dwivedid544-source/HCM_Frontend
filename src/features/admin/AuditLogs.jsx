import React from 'react';
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
  Monitor, 
  Globe, 
  Lock, 
  Zap,
  Info,
  Laptop
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAdmin } from '../../context/AdminContext';
import { useState } from 'react';
import ExportAuditModal from '../../shared/components/admin/ExportAuditModal';
import SecurityScanModal from '../../shared/components/admin/SecurityScanModal';
import AuditFilterModal from '../../shared/components/admin/AuditFilterModal';
import AuditLogDrawer from '../../shared/components/admin/AuditLogDrawer';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';

const AuditLogs = () => {
  const { systemLogs, showToast } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ severity: 'All', module: 'All', environment: 'All' });
  
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [logToView, setLogToView] = useState(null);

  const filteredLogs = systemLogs.filter(log => {
      const matchSearch = Object.entries(log).some(([key, val]) => {
         if (key === 'user' && typeof val === 'object' && val !== null) {
            return (val.email || '').toLowerCase().includes(searchTerm.toLowerCase());
         }
         return String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      });
      const matchSeverity = filters.severity === 'All' ? true : log.level === filters.severity;
      const matchModule = filters.module === 'All' ? true : log.module === filters.module;
      const matchEnvironment = filters.environment === 'All' ? true : true; // all local mock is 1 env currently
      return matchSearch && matchSeverity && matchModule && matchEnvironment;
  });

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
            <div className="card p-0 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between gap-4">
                  <div className="relative flex-1">
                     <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                     <input type="text" placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 h-10 bg-slate-50 border-none shadow-sm text-xs font-bold w-full" />
                  </div>
                  <button onClick={() => setIsFilterOpen(true)} className={cn("p-2.5 hover:text-primary-600 hover:bg-white border border-slate-50 rounded-xl transition-all h-10 shadow-sm relative shrink-0", Object.values(filters).some(f => f !== 'All') ? "text-primary-600 bg-primary-50 border-primary-100" : "text-slate-400 bg-slate-50")}>
                     <Filter size={18} />
                     {Object.values(filters).some(f => f !== 'All') && <span className="absolute top-1 right-1 w-2 h-2 bg-primary-600 rounded-full" />}
                  </button>
                </div>

               <div className="p-0 overflow-x-auto min-h-[600px]">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/50">
                           <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Timestamp / Level</th>
                           <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">User Context</th>
                           <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Module</th>
                           <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center font-bold">Action Event</th>
                           <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Environment</th>
                           <th className="px-8 py-5 text-right text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {filteredLogs.map((log) => (
                           <tr key={log.id} className="group hover:bg-slate-50/20 transition-colors cursor-pointer" onClick={() => setLogToView(log)}>
                              <td className="px-8 py-6">
                                 <div className="flex flex-col gap-2">
                                    <span className={cn(
                                       "px-2 py-1 max-w-fit rounded text-[8px] font-black uppercase tracking-widest border",
                                       log.level === 'Security' ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                                       log.level === 'Critical' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                       log.level === 'Warning' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                       "bg-slate-100 text-slate-400 border-slate-200"
                                    )}>
                                       {log.level}
                                    </span>
                                    <div className="flex items-center gap-2 text-slate-400">
                                       <Clock size={12} />
                                       <span className="text-[10px] font-bold font-bold">{log.time}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-[10px] font-black">
                                       {(typeof log.user === 'object' && log.user !== null ? (log.user.email || 'S') : (log.user || 'S'))[0]}
                                    </div>
                                    <span className="text-sm font-bold text-slate-900 tracking-tight">
                                       {typeof log.user === 'object' && log.user !== null ? log.user.email : log.user}
                                    </span>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <span className="text-[10px] font-bold text-slate-400 font-bold">{log.module}</span>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <p className="text-sm font-extrabold text-slate-700 tracking-tight leading-none group-hover:text-primary-600 transition-colors">{log.action}</p>
                              </td>
                              <td className="px-8 py-6 text-center">
                                 <div className="flex flex-col items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                                       <Globe size={12} />
                                       <span>{log.ip}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 tracking-widest">
                                       <Laptop size={10} />
                                       <span>{log.device}</span>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right" onClick={(e) => e.stopPropagation()}>
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
