import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   ShieldCheck,
   FileText,
   AlertCircle,
   Plus,
   Search,
   Download,
   History,
   Lock,
   Eye,
   Send,
   Trash2,
   FileBadge,
   Archive,
   RefreshCw,
   Copy,
   Edit3
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';
import StatCard from '../../shared/components/ui/StatCard';
import ComplianceModal from '../../shared/components/admin/ComplianceModal';
import AuditArchiveModal from '../../shared/components/admin/AuditArchiveModal';
import PolicyDrawer from '../../shared/components/admin/PolicyDrawer';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';

const ComplianceCenter = () => {
   const { policies, updatePolicy, deletePolicy, addPolicy, renewPolicy, sendPolicyReminder, showToast, totalActiveEmployees } = useAdmin();
   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [isArchiveOpen, setIsArchiveOpen] = useState(false);
   const [policyToEdit, setPolicyToEdit] = useState(null);
   const [policyToView, setPolicyToView] = useState(null);
   const [policyToDelete, setPolicyToDelete] = useState(null);
   const [policyToArchive, setPolicyToArchive] = useState(null);
   const [showExportMenu, setShowExportMenu] = useState(false);
   const [isRenewing, setIsRenewing] = useState(false);

   const [searchTerm, setSearchTerm] = useState('');
   const [categoryFilter, setCategoryFilter] = useState('All Types');

   const filteredPolicies = policies.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'All Types' ? true : p.category.includes(categoryFilter);
      return matchesSearch && matchesCategory;
   });

   const activePolicies = policies.filter(p => p.status === 'Active').length;

   // Calculate acknowledgment percentage
   const calcAckPercent = () => {
      if (!policies.length) return '0%';
      let totalAck = 0, totalTarget = 0;
      policies.forEach(p => {
         if (typeof p.acknowledgments === 'string' && p.acknowledgments.includes('/')) {
            const [ack, target] = p.acknowledgments.split('/').map(Number);
            totalAck += ack || 0;
            totalTarget += target || 0;
         } else {
            totalAck += Number(p.acknowledgments) || 0;
            totalTarget += totalActiveEmployees || 1;
         }
      });
      return totalTarget > 0 ? Math.round((totalAck / totalTarget) * 100) + '%' : '0%';
   };

   // Stats
   const stats = [
      { label: 'Active Policies', value: activePolicies.toString(), icon: FileBadge, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Avg Ack. Rate', value: calcAckPercent(), icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Pending Renewals', value: policies.filter(p => p.status === 'Renewing' || p.status === 'Expiring Soon').length.toString(), icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
      { label: 'Audit Readiness', value: 'High', icon: Lock, color: 'text-primary-600', bg: 'bg-primary-50' },
   ];

   const handleArchiveClick = (p) => {
      if (p.status === 'Archived') {
         updatePolicy(p.id, { status: 'Active' });
         showToast(`Policy unarchived successfully`);
      } else {
         setPolicyToArchive(p);
      }
   };

   // ---- EXPORT / DOWNLOAD ----
   const handleExport = useCallback((format) => {
      setShowExportMenu(false);
      if (!filteredPolicies.length) {
         showToast('No policies to export', 'error');
         return;
      }

      if (format === 'csv') {
         const headers = ['Name', 'Category', 'Owner', 'Effective Date', 'Status', 'Acknowledgments'];
         const rows = filteredPolicies.map(p => [
            `"${p.name}"`, `"${p.category}"`, `"${p.owner}"`,
            `"${p.effectiveDate || p.date || 'TBD'}"`, `"${p.status}"`,
            `"${p.acknowledgments || '0'}"`
         ]);
         const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
         const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
         const url = URL.createObjectURL(blob);
         const a = document.createElement('a');
         a.href = url;
         a.download = `policies_export_${new Date().toISOString().split('T')[0]}.csv`;
         a.click();
         URL.revokeObjectURL(url);
         showToast('Policies exported as CSV');
      } else {
         // Simple printable PDF via window.print
         const printContent = `
            <html><head><title>Policy Export</title>
            <style>
               body { font-family: -apple-system, sans-serif; padding: 40px; }
               h1 { font-size: 22px; margin-bottom: 20px; }
               table { width: 100%; border-collapse: collapse; font-size: 13px; }
               th, td { border: 1px solid #ddd; padding: 10px 14px; text-align: left; }
               th { background: #f4f4f5; font-weight: 700; }
            </style></head><body>
            <h1>Compliance – Policy Export</h1>
            <table>
               <thead><tr><th>Policy Name</th><th>Category</th><th>Owner</th><th>Effective Date</th><th>Status</th></tr></thead>
               <tbody>${filteredPolicies.map(p => `<tr><td>${p.name}</td><td>${p.category}</td><td>${p.owner}</td><td>${p.effectiveDate || p.date || 'TBD'}</td><td>${p.status}</td></tr>`).join('')}</tbody>
            </table></body></html>`;
         const w = window.open('', '_blank');
         w.document.write(printContent);
         w.document.close();
         w.print();
         showToast('PDF export opened in print dialog');
      }
   }, [filteredPolicies, showToast]);

   // Acknowledgment bar helper
   const getAckWidth = (ack) => {
      if (typeof ack === 'string' && ack.includes('/')) {
         const [a, t] = ack.split('/').map(Number);
         return t > 0 ? Math.round((a / t) * 100) : 0;
      }
      return typeof ack === 'number' ? Math.min(ack, 100) : 0;
   };

   return (
      <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0">
               <h1 className="hcm-page-title">Compliance Center</h1>
               <p className="text-slate-500 font-medium tracking-tight text-sm sm:text-base">Standardize policies, track acknowledgments and manage audits</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
               <button onClick={() => setIsArchiveOpen(true)} className="btn-secondary px-3 sm:px-5 py-2.5 font-bold flex items-center gap-2 text-sm">
                  <History size={18} />
                  <span className="hidden sm:inline">Audit Archive</span>
               </button>
               <button
                  onClick={() => { setPolicyToEdit(null); setIsAddModalOpen(true); }}
                  className="btn-primary px-4 sm:px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200 text-sm"
               >
                  <Plus size={18} />
                  <span>Publish Policy</span>
               </button>
            </div>
         </div>

         {/* Stats Cards */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
               <StatCard
                  key={idx}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  color={stat.color}
                  bg={stat.bg}
               />
            ))}
         </div>
         {/* Main List Area */}
         <div className="space-y-6">
            {/* Search + Filter row – always horizontal */}
            <div className="flex items-center gap-2">
               {/* Search – fills available space */}
               <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                     type="text"
                     placeholder="Search policies..."
                     value={searchTerm}
                     onChange={e => setSearchTerm(e.target.value)}
                     className="input-field pl-9 h-10 bg-white w-full text-sm"
                  />
               </div>

               {/* Type filter */}
               <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="input-field h-10 pr-8 w-[128px] shrink-0 font-bold text-slate-600 bg-white shadow-sm border-none text-sm"
               >
                  <option>All Types</option>
                  <option>Compliance</option>
                  <option>Ethics</option>
                  <option>Legal</option>
                  <option>HR</option>
                  <option>Security</option>
               </select>

               {/* Export dropdown */}
               <div className="relative shrink-0">
                  <button
                     onClick={() => setShowExportMenu(!showExportMenu)}
                     className="p-2 text-slate-400 hover:text-primary-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all h-10 w-10 flex items-center justify-center"
                     title="Export Policies"
                  >
                     <Download size={17} />
                  </button>
                  <AnimatePresence>
                     {showExportMenu && (
                        <>
                           <div className="fixed inset-0 z-40" onClick={() => setShowExportMenu(false)} />
                           <motion.div
                              initial={{ opacity: 0, y: -4, scale: 0.95 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -4, scale: 0.95 }}
                              transition={{ duration: 0.1 }}
                              className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                           >
                              <button onClick={() => handleExport('csv')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 flex items-center gap-2">
                                 <FileText size={15} /> Export as CSV
                              </button>
                              <button onClick={() => handleExport('pdf')} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50 hover:text-primary-600 flex items-center gap-2">
                                 <FileBadge size={15} /> Export as PDF
                              </button>
                           </motion.div>
                        </>
                     )}
                  </AnimatePresence>
               </div>
            </div>

            <div className="card p-0 border-none bg-white shadow-soft overflow-visible rounded-2xl">
               <div className="overflow-x-auto rounded-2xl">
                  <table className="w-full text-left min-w-[700px]">
                     <thead>
                        <tr className="bg-slate-50/50">
                           <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Policy Name</th>
                           <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center hidden sm:table-cell">Category</th>
                           <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center hidden md:table-cell">Effective Date</th>
                           <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center hidden lg:table-cell">Acknowledgments</th>
                           <th className="px-4 sm:px-8 py-4 sm:py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Status</th>
                           <th className="px-4 sm:px-8 py-4 sm:py-5 text-right text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50 text-sm">
                        {filteredPolicies.length > 0 ? filteredPolicies.map((p) => (
                           <tr key={p.id} className="group hover:bg-slate-50/20 transition-colors">
                              <td className="px-4 sm:px-8 py-4 sm:py-6 cursor-pointer" onClick={() => setPolicyToView(p)}>
                                 <div className="flex items-center gap-3 sm:gap-4">
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 flex items-center justify-center text-primary-600 group-hover:bg-primary-50 transition-colors shrink-0">
                                       <FileText size={18} />
                                    </div>
                                    <div className="min-w-0">
                                       <p className="font-bold text-slate-900 tracking-tight group-hover:text-primary-600 transition-colors truncate">{p.name}</p>
                                       <p className="text-[10px] font-bold text-slate-400 mt-0.5 sm:mt-1 font-bold truncate">{p.owner}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6 text-center hidden sm:table-cell">
                                 <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold whitespace-nowrap">{p.category}</span>
                              </td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6 text-center whitespace-nowrap text-xs font-bold text-slate-600 hidden md:table-cell">
                                 {p.effectiveDate || p.date || 'TBD'}
                              </td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6 text-center hidden lg:table-cell">
                                 <div className="flex flex-col items-center gap-1.5">
                                    <span className="font-extrabold text-slate-900 tracking-tight">{p.acknowledgments || `0/${totalActiveEmployees}`}</span>
                                    <div className="w-16 h-1 bg-slate-100 rounded-full overflow-hidden">
                                       <div className="h-full bg-emerald-500" style={{ width: `${getAckWidth(p.acknowledgments || `0/${totalActiveEmployees}`)}%` }} />
                                    </div>
                                 </div>
                              </td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6 text-center">
                                 <span className={cn(
                                    "px-2 sm:px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border whitespace-nowrap",
                                    p.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                       (p.status === 'Renewing' || p.status === 'Expiring Soon') ? "bg-amber-50 text-amber-600 border-amber-100" :
                                          "bg-slate-50 text-slate-400 border-slate-100"
                                 )}>
                                    {p.status}
                                 </span>
                              </td>
                              <td className="px-4 sm:px-8 py-4 sm:py-6 text-right">
                                 <div className="flex justify-end items-center gap-1.5">
                                    <button
                                       onClick={() => setPolicyToView(p)}
                                       className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                       title="View Policy"
                                    >
                                       <Eye size={16} />
                                    </button>
                                    <button
                                       onClick={() => { setPolicyToEdit(p); setIsAddModalOpen(true); }}
                                       className="p-1.5 text-slate-400 hover:text-primary-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                       title="Edit Policy"
                                    >
                                       <Edit3 size={16} />
                                    </button>
                                    <ActionDropdown
                                       actions={[
                                          { label: 'Send Reminder', icon: Send, onClick: () => sendPolicyReminder(p.id) },
                                          { 
                                             label: 'Renew Policy', 
                                             icon: RefreshCw, 
                                             onClick: () => {
                                                setPolicyToEdit(p);
                                                setIsRenewing(true);
                                                setIsAddModalOpen(true);
                                             } 
                                          },
                                          {
                                             label: 'Duplicate', icon: Copy, onClick: () => {
                                                const { id, ...rest } = p;
                                                addPolicy({ ...rest, name: `Copy of ${p.name}` });
                                             }
                                          },
                                          { 
                                             label: p.status === 'Archived' ? 'Unarchive' : 'Archive', 
                                             icon: Archive, 
                                             danger: p.status !== 'Archived',
                                             onClick: () => handleArchiveClick(p) 
                                          },
                                          { label: 'Delete', icon: Trash2, danger: true, onClick: () => setPolicyToDelete(p) },
                                       ]}
                                    />
                                 </div>
                              </td>
                           </tr>
                        )) : (
                           <tr>
                              <td colSpan="6" className="px-8 py-20 text-center text-slate-500">No policies found matching your criteria.</td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         </div>

         {/* Add Policy Modal */}
         <ComplianceModal
            isOpen={isAddModalOpen}
            onClose={() => { setIsAddModalOpen(false); setPolicyToEdit(null); setIsRenewing(false); }}
            policy={policyToEdit}
            isRenewing={isRenewing}
         />

         {/* Audit Archive Modal */}
         <AuditArchiveModal
            isOpen={isArchiveOpen}
            onClose={() => setIsArchiveOpen(false)}
         />

         {/* Policy View Drawer */}
         <PolicyDrawer
            isOpen={!!policyToView}
            onClose={() => setPolicyToView(null)}
            policy={policyToView}
            onEdit={(p) => { setPolicyToEdit(p); setIsAddModalOpen(true); }}
         />

         <ConfirmDialog
            isOpen={!!policyToDelete}
            title="Delete Policy"
            message={`Are you sure you want to permanently delete "${policyToDelete?.name}"? You will lose all acknowledgment records linked to this document.`}
            confirmText="Permanently Delete"
            onConfirm={() => {
               deletePolicy(policyToDelete.id);
               setPolicyToDelete(null);
            }}
            onCancel={() => setPolicyToDelete(null)}
         />

         <ConfirmDialog
            isOpen={!!policyToArchive}
            title="Archive Policy"
            message={`Are you sure you want to archive "${policyToArchive?.name}"? It will no longer be shown as active to employees.`}
            confirmText="Archive"
            type="warning"
            onConfirm={() => {
               updatePolicy(policyToArchive.id, { status: 'Archived' });
               showToast(`Policy "${policyToArchive.name}" archived successfully`);
               setPolicyToArchive(null);
            }}
            onCancel={() => setPolicyToArchive(null)}
         />
      </div>
   );
};

export default ComplianceCenter;
