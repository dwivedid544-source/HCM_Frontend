import React, { useState, useMemo } from 'react';
import { useCurrency } from '../../hooks/useCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import {
   CheckCircle2,
   XCircle,
   Clock,
   Search,
   MessageSquare,
   Check,
   X,
   FileText,
   Calendar,
   History,
   ChevronRight,
   Download,
   CalendarDays,
   Zap,
   Info,
   Plus,
   RotateCcw,

   Loader2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../../shared/components/ui/StatCard';
import { useHR } from '../../context/HRContext';
import { hrAPI, adminAPI } from '../../utils/apiService';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import PermissionGate from '../../shared/components/common/PermissionGate';
import ImportModal from '../../shared/components/import/ImportModal';
import { Upload } from 'lucide-react';
import DatePicker from '../../shared/components/common/DatePicker';

const HRApprovals = () => {
   const {
      pendingLeaves, employees, showToast, refetch,
      incrementRequests, approveIncrementRequest, rejectIncrementRequest
   } = useHR();
   const leaveRequests = pendingLeaves || [];
   const teamMembers = employees || [];
   const { formatCurrency } = useCurrency();

   const defaultMembers = useMemo(() => [
     { id: 'emp-1', name: 'Alex Morgan' },
     { id: 'emp-2', name: 'Sarah Jenkins' },
     { id: 'emp-3', name: 'Michael Chen' },
     { id: 'emp-4', name: 'Emily Davis' },
     { id: 'emp-5', name: 'David Wilson' }
   ], []);

   const availableMembers = useMemo(() => {
     if (employees && employees.length > 0) {
       return employees.map(e => ({ id: e.id, name: e.fullName || e.name || e.user?.email || 'Employee' }));
     }
     return defaultMembers;
   }, [employees, defaultMembers]);

   // UI States
   const [activeModule, setActiveModule] = useState('leaves'); // 'leaves' | 'increments'
   const [isExporting, setIsExporting] = useState(false);
   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
   const [selectedRequest, setSelectedRequest] = useState(null);
   const [activeTab, setActiveTab] = useState('Pending');
   const [showAddModal, setShowAddModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');

   // Form State
   const [newRequest, setNewRequest] = useState({ employeeId: '', type: 'Sick Leave', startDate: '', endDate: '', reason: '' });

   // Stats calculation
   const stats = useMemo(() => {
      if (activeModule === 'leaves') {
         return [
            { label: 'Pending Approvals', value: leaveRequests.filter(r => r.status === 'MANAGER_APPROVED' || r.status === 'HR_APPROVED' || r.status === 'Pending').length.toString(), icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
            { label: 'Approved', value: leaveRequests.filter(r => r.status === 'APPROVED' || r.status === 'Approved').length.toString(), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-450', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Rejected', value: leaveRequests.filter(r => r.status === 'REJECTED' || r.status === 'Rejected').length.toString(), icon: XCircle, color: 'text-rose-600 dark:text-rose-455', bg: 'bg-rose-50 dark:bg-rose-950/20' },
            { label: 'Total Leaves', value: leaveRequests.length.toString(), icon: CalendarDays, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
         ];
      } else {
         return [
            { label: 'Pending Approvals', value: incrementRequests.filter(r => r.status === 'ManagerApproved' || r.status === 'HR_APPROVED' || r.status === 'Pending').length.toString(), icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
            { label: 'Approved', value: incrementRequests.filter(r => r.status === 'Approved' || r.status === 'APPROVED').length.toString(), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-450', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Rejected', value: incrementRequests.filter(r => r.status === 'Rejected' || r.status === 'REJECTED').length.toString(), icon: XCircle, color: 'text-rose-600 dark:text-rose-455', bg: 'bg-rose-50 dark:bg-rose-950/20' },
            { label: 'Total Requests', value: incrementRequests.length.toString(), icon: CalendarDays, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
         ];
      }
   }, [leaveRequests, incrementRequests, activeModule]);

   // Filtering Logic
   const filteredRequests = useMemo(() => {
      return leaveRequests.filter(r => {
         let rStatus = r.status;
         if (rStatus === 'MANAGER_APPROVED' || rStatus === 'HR_APPROVED' || rStatus === 'PENDING') rStatus = 'Pending';
         if (rStatus === 'APPROVED') rStatus = 'Approved';
         if (rStatus === 'REJECTED') rStatus = 'Rejected';
         const matchesTab = activeTab === 'All' ? true : rStatus === activeTab;
         const matchesSearch = (r.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.type || '').toLowerCase().includes(searchQuery.toLowerCase());
         return matchesTab && matchesSearch;
      });
   }, [leaveRequests, activeTab, searchQuery]);

   const filteredIncrements = useMemo(() => {
      return incrementRequests.filter(r => {
         let matchStatus = r.status;
         if (matchStatus === 'ManagerApproved') matchStatus = 'Pending';
         const matchesTab = activeTab === 'All' ? true : matchStatus === activeTab;
         const matchesSearch = (r.employee?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
         return matchesTab && matchesSearch;
      });
   }, [incrementRequests, activeTab, searchQuery]);

   const handleStatusUpdate = async (id, status) => {
      try {
         await adminAPI.reviewLeave(id, { status });
         setSelectedRequest(null);
         showToast(`Request ${status === 'APPROVED' ? 'approved' : 'rejected'} successfully.`);
         refetch.fetchPendingLeaves();
      } catch (e) {
         console.error('Leave review error:', e);
         showToast(e.response?.data?.error?.message || 'Failed to update request', 'error');
      }
   };

   const handleAddRequest = async (e) => {
      e.preventDefault();
      const emp = teamMembers.find(m => m.id === newRequest.employeeId);
      if (!emp || !newRequest.startDate || !newRequest.reason) {
         showToast('Please fill in all required fields.', 'error');
         return;
      }
      try {
         await managerAPI.addTeamLeaveRequest(newRequest);
         showToast('Leave request created');
         refetch.fetchPendingLeaves();
         setShowAddModal(false);
         setNewRequest({ employeeId: '', type: 'Sick Leave', startDate: '', endDate: '', reason: '' });
      } catch (e) {
         showToast('Failed to create request', 'error');
      }
   };

   const handleExport = () => {
      setIsExporting(true);
      showToast('Exporting leave history...', 'info');
      setTimeout(() => {
         try {
            const headers = ['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status'];
            const rows = filteredRequests.map(r => [
               `"${r.name}"`,
               `"${r.type}"`,
               `"${r.startDate}"`,
               `"${r.endDate || 'Ongoing'}"`,
               `"${r.days || 1}"`,
               `"${r.reason ? r.reason.replace(/"/g, '""') : ''}"`,
               `"${r.status}"`
            ]);
            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `leave_history_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('Leave history exported successfully!', 'success');
         } catch (err) {
            showToast('Error exporting leave history', 'error');
         } finally {
            setIsExporting(false);
         }
      }, 1500);
   };

   return (
      <div className="space-y-8 pb-12 animate-fade-in relative">
         {/* Header Section */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="hcm-page-title">Company Approvals</h1>
               <p className="hcm-page-subtitle">Review, manage and finalize company-wide leave and increment requests</p>
            </div>
            <div className="flex items-center gap-3">
               {activeModule === 'leaves' && (
                  <>
                     <div className="flex gap-2">
                        <button
                           onClick={() => setIsImportModalOpen(true)}
                           className="btn-secondary flex items-center gap-2"
                        >
                           <Upload size={18} />
                           <span className="hidden sm:inline">Import Leaves</span>
                        </button>
                        <button
                           onClick={handleExport}
                           disabled={isExporting}
                           className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                        >
                           {isExporting ? (
                              <Loader2 size={18} className="animate-spin text-primary-500" />
                           ) : (
                              <Download size={18} />
                           )}
                           <span className="hidden sm:inline">Export History</span>
                        </button>
                     </div>
                     <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
                        <Plus size={18} />
                        <span>Add Request</span>
                     </button>
                  </>
               )}
            </div>
         </div>

         {/* Module Switcher Tabs */}
         <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button
               onClick={() => { setActiveModule('leaves'); setActiveTab('Pending'); }}
               className={cn(
                  "px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all mr-4",
                  activeModule === 'leaves' ? "border-primary-600 text-primary-600 dark:text-white font-extrabold" : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650"
               )}
            >
               Leaves
            </button>
            <button
               onClick={() => { setActiveModule('increments'); setActiveTab('All'); }}
               className={cn(
                  "px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all",
                  activeModule === 'increments' ? "border-primary-600 text-primary-600 dark:text-white font-extrabold" : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650"
               )}
            >
               Salary Increments
            </button>
         </div>

         {/* Stats Cards Section */}
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

         {/* Main Listing Area */}
         <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {['Pending', 'Approved', 'Rejected', 'All'].map((cat) => (
                     <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        className={cn(
                           "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border capitalize",
                           activeTab === cat ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xl shadow-slate-200/10 border-slate-900 dark:border-white" : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                        )}
                     >
                        {cat} {cat === 'Pending' ? `(${activeModule === 'leaves' ? leaveRequests.filter(r => r.status === 'MANAGER_APPROVED').length : incrementRequests.filter(r => r.status === 'ManagerApproved').length})` : ''}
                     </button>
                  ))}
               </div>
               <div className="relative w-full lg:w-80 text-slate-400 dark:text-slate-500">
                  <Search className="absolute left-3 top-3" size={18} />
                  <input
                     type="text"
                     placeholder="Search by name or type..."
                     className="input-field pl-10 h-11"
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                  />
               </div>
            </div>

            <div className="hcm-table-container">
               {activeModule === 'leaves' ? (
                  <table className="hcm-table">
                     <thead className="hcm-thead">
                        <tr>
                           <th className="hcm-th">Employee</th>
                           <th className="hcm-th">Leave Type</th>
                           <th className="hcm-th text-center">Duration</th>
                           <th className="hcm-th text-center">Days</th>
                           <th className="hcm-th text-right">Reason Preview</th>
                           <th className="hcm-th text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredRequests.map((req) => (
                           <tr key={req.id} className="hcm-tr">
                              <td className="hcm-td">
                                 <div className="flex items-center gap-4">
                                    <Avatar src={req.img} alt={req.name} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-850 shadow-sm" />
                                    <p className="font-extrabold text-slate-900 dark:text-white leading-none">{req.name}</p>
                                 </div>
                              </td>
                              <td className="hcm-td">
                                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-105 dark:border-slate-800">{req.type}</span>
                              </td>
                              <td className="hcm-td text-center whitespace-nowrap">
                                 <p className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tight">{req.startDate} — {req.endDate || 'Ongoing'}</p>
                              </td>
                              <td className="hcm-td text-center">
                                 <p className="text-sm font-black text-slate-900 dark:text-white">{req.days || '1'}</p>
                              </td>
                              <td className="hcm-td text-right max-w-xs">
                                 <p className="text-[11px] font-medium text-slate-405 dark:text-slate-495 truncate italic">"{req.reason}"</p>
                              </td>
                              <td className="hcm-td text-right">
                                 {req.status === 'MANAGER_APPROVED' || req.status === 'HR_APPROVED' || req.status === 'Pending' || req.status === 'PENDING' ? (
                                    <div className="flex justify-end items-center gap-2">
                                       <button
                                          onClick={() => setSelectedRequest(req)}
                                          className="p-2.5 text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                                          title="Review Request"
                                       >
                                          <ChevronRight size={20} />
                                       </button>
                                       <button
                                          onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                          className="p-2.5 text-rose-500 dark:text-rose-455 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all shadow-sm"
                                          title="Quick Reject"
                                       ><X size={20} /></button>
                                       <button
                                          onClick={() => handleStatusUpdate(req.id, 'APPROVED')}
                                          className="p-2.5 text-emerald-500 dark:text-emerald-450 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-xl transition-all shadow-sm"
                                          title="Quick Approve"
                                       ><Check size={20} /></button>
                                    </div>
                                 ) : (
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                       req.status === 'APPROVED' || req.status === 'Approved' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30" :
                                       req.status === 'MANAGER_APPROVED' || req.status === 'HR_APPROVED' || req.status === 'Pending' || req.status === 'PENDING' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" :
                                       "bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-455 border-rose-100 dark:border-rose-900/30"
                                    }`}>
                                       {req.status === 'MANAGER_APPROVED' ? 'Pending HR' :
                                        req.status === 'HR_APPROVED' ? 'Pending Admin' :
                                        req.status === 'Pending' || req.status === 'PENDING' ? (req.pendingApproverRole ? `Pending ${req.pendingApproverRole.charAt(0).toUpperCase() + req.pendingApproverRole.slice(1).toLowerCase()}` : 'Pending Manager') : req.status}
                                    </span>
                                 )}
                              </td>
                           </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                           <tr>
                              <td colSpan="6" className="hcm-td">
                                 <div className="hcm-empty-state py-20 text-center opacity-40">
                                    <Calendar size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 font-bold">No matching requests</p>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               ) : (
                  <table className="hcm-table">
                     <thead className="hcm-thead">
                        <tr>
                           <th className="hcm-th">Employee</th>
                           <th className="hcm-th text-center">Current CTC</th>
                           <th className="hcm-th text-center">Requested CTC</th>
                           <th className="hcm-th text-center">Percentage Raise</th>
                           <th className="hcm-th text-right">Reason</th>
                           <th className="hcm-th text-right">Action</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {filteredIncrements.map((req) => {
                           const currentCtc = req.employee?.compensationProfile?.monthlyCTC || 0;
                           const requestedCtc = req.requestedSalary || 0;
                           const diff = requestedCtc - currentCtc;
                           const percent = currentCtc > 0 ? (diff / currentCtc) * 100 : 0;
                           return (
                              <tr key={req.id} className="hcm-tr">
                                 <td className="hcm-td">
                                    <div className="flex items-center gap-4">
                                       <Avatar src={req.employee?.avatarUrl || ''} alt={req.employee?.fullName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-850 shadow-sm" />
                                       <p className="font-extrabold text-slate-900 dark:text-white leading-none">{req.employee?.fullName || 'Employee'}</p>
                                    </div>
                                 </td>
                                 <td className="hcm-td text-center whitespace-nowrap">
                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 tracking-tight">{formatCurrency(currentCtc)}</p>
                                 </td>
                                 <td className="hcm-td text-center whitespace-nowrap">
                                    <p className="text-xs font-black text-indigo-650 dark:text-indigo-400 tracking-tight">{formatCurrency(requestedCtc)}</p>
                                 </td>
                                 <td className="hcm-td text-center whitespace-nowrap">
                                    <span className="text-[10px] font-black text-emerald-650 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-900/30">+{percent.toFixed(1)}%</span>
                                 </td>
                                 <td className="hcm-td text-right max-w-xs">
                                    <p className="text-[11px] font-medium text-slate-405 dark:text-slate-495 truncate italic" title={req.reason}>"{req.reason}"</p>
                                 </td>
                                 <td className="hcm-td text-right">
                                    {req.status === 'ManagerApproved' || req.status === 'HR_APPROVED' || req.status === 'Pending' ? (
                                       <div className="flex justify-end items-center gap-2">
                                          <button
                                             onClick={() => approveIncrementRequest(req.id)}
                                             className="px-3 py-1.5 text-[10px] uppercase bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg transition-all shadow-sm font-bold border border-emerald-100 dark:border-emerald-900/30"
                                             title="Approve"
                                          >Approve</button>
                                          <button
                                             onClick={() => rejectIncrementRequest(req.id)}
                                             className="px-3 py-1.5 text-[10px] uppercase bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-500 dark:text-rose-455 rounded-lg transition-all shadow-sm font-bold border border-rose-100 dark:border-rose-900/30"
                                             title="Reject"
                                          >Reject</button>
                                       </div>
                                    ) : (
                                       <span className={cn(
                                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border",
                                          req.status === 'Approved' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30" :
                                             req.status === 'ManagerApproved' || req.status === 'HR_APPROVED' || req.status === 'Pending' || req.status === 'PENDING' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" :
                                                "bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-455 border-rose-100 dark:border-rose-900/30"
                                       )}>
                                          {req.status === 'ManagerApproved' ? 'Pending HR' : 
                                       req.status === 'HR_APPROVED' ? 'Pending Admin' :
                                       req.status === 'Pending' || req.status === 'PENDING' ? (req.pendingApproverRole ? `Pending ${req.pendingApproverRole.charAt(0).toUpperCase() + req.pendingApproverRole.slice(1).toLowerCase()}` : 'Pending Manager') : req.status}
                                       </span>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                        {filteredIncrements.length === 0 && (
                           <tr>
                              <td colSpan="6" className="hcm-td">
                                 <div className="hcm-empty-state py-20 text-center opacity-40">
                                    <Calendar size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 font-bold">No matching requests</p>
                                 </div>
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               )}
            </div>
         </div>

         {/* Review Modal */}
         <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            entity="leave"
         />

         <CenterModal
            isOpen={!!selectedRequest}
            onClose={() => setSelectedRequest(null)}
            title="Review Leave Application"
         >
            {selectedRequest && (
               <div className="p-6 sm:p-8 space-y-6 text-left bg-white dark:bg-slate-900">
                  <div className="p-5 sm:p-6 bg-slate-900 dark:bg-slate-950 rounded-2xl relative overflow-hidden group">
                     <div className="absolute top-0 right-0 p-6 opacity-10">
                        <FileText size={80} className="text-white" />
                     </div>
                     <div className="flex items-center gap-4 relative z-10">
                        <Avatar src={selectedRequest.img} alt={selectedRequest.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-slate-800 shadow-lg" />
                        <div className="text-left py-1">
                           <h3 className="text-xl sm:text-2xl font-black text-white dark:text-indigo-200 tracking-tight leading-none">{selectedRequest.name}</h3>
                           <p className="text-[10px] font-black text-primary-400 dark:text-primary-550 font-bold mt-2">Ref ID: LR-{selectedRequest.id}820</p>
                           <div className="mt-3 flex items-center gap-3">
                              <span className="text-xs font-bold text-white/60 bg-white/10 px-2 py-0.5 rounded-md">Designer</span>
                              <span className="text-xs font-semibold text-white/60 bg-white/10 px-2 py-0.5 rounded-md">Team Apex</span>
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                     <div className="space-y-1 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Leave Category</label>
                        <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Zap size={16} className="text-primary-600 dark:text-primary-400" />
                           {selectedRequest.type}
                        </p>
                     </div>
                     <div className="space-y-1 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Total Duration</label>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{selectedRequest.days || '1'} Working Day(s)</p>
                     </div>
                  </div>

                  <div className="space-y-2 text-left">
                     <label className="form-label text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={16} className="text-slate-300 dark:text-slate-600" /> Employee reason
                     </label>
                     <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-105 dark:border-slate-800 italic text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        "{selectedRequest.reason}"
                     </div>
                  </div>

                  <div className="space-y-2 text-left">
                     <label className="form-label text-[10px] uppercase tracking-widest">Internal review note (Optional)</label>
                     <textarea className="input-field min-h-[100px] py-3 bg-slate-50 border-transparent resize-none text-sm font-medium" placeholder="Add feedback for the employee..."></textarea>
                  </div>

                  <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3">
                     <button
                        onClick={() => handleStatusUpdate(selectedRequest.id, 'REJECTED')}
                        className="flex-1 py-2.5 sm:py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-rose-500 dark:text-rose-455 rounded-xl font-bold hover:bg-rose-50 dark:hover:bg-rose-955/20 hover:border-rose-100 dark:hover:border-rose-900 transition-all shadow-sm flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                     >
                        <XCircle size={16} />
                        <span>Reject</span>
                     </button>
                     <button
                        onClick={() => handleStatusUpdate(selectedRequest.id, 'APPROVED')}
                        className="btn-success flex-1 py-2.5 sm:py-3 font-bold flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer"
                     >
                        <CheckCircle2 size={16} />
                        <span>Approve</span>
                     </button>
                  </div>
               </div>
            )}
         </CenterModal>

         {/* Add Request Modal */}
         <CenterModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Submit Leave Request"
         >
            <form onSubmit={handleAddRequest} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left bg-white dark:bg-slate-900">
            <div className="space-y-3 text-left">
               <label className="form-label text-[10px] font-bold block">Employee</label>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Select from list:</p>
                     <select 
                        className="input-field h-11 font-bold text-sm w-full cursor-pointer bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={newRequest.employeeId || ''}
                        onChange={e => {
                           const selected = availableMembers.find(m => m.id === e.target.value);
                           setNewRequest({ 
                              ...newRequest, 
                              employeeId: e.target.value, 
                              employeeName: selected ? selected.name : e.target.value 
                           });
                        }}
                     >
                        <option value="" className="dark:bg-slate-900">-- Select Member --</option>
                        {availableMembers.map(m => (
                           <option key={m.id} value={m.id} className="dark:bg-slate-900 font-medium">
                              {m.name} {m.role ? `(${m.role})` : ''}
                           </option>
                        ))}
                     </select>
                  </div>

                  <div>
                     <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Or type employee name:</p>
                     <input 
                        type="text"
                        placeholder="Type custom name..."
                        className="input-field h-11 font-semibold text-sm w-full bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        value={newRequest.employeeName || ''}
                        onChange={e => setNewRequest({ ...newRequest, employeeName: e.target.value, employeeId: e.target.value })}
                     />
                  </div>
               </div>

               <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[9px] font-black uppercase text-slate-400">Quick Select:</span>
                  {availableMembers.map(m => (
                     <button
                       key={m.id}
                       type="button"
                       onClick={() => setNewRequest({ ...newRequest, employeeId: m.id, employeeName: m.name })}
                       className={cn(
                         "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer",
                         (newRequest.employeeName === m.name || newRequest.employeeId === m.id)
                           ? "bg-primary-600 text-white border-primary-600 shadow-sm"
                           : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700"
                       )}
                     >
                        {m.name}
                     </button>
                  ))}
               </div>
            </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                  <div className="space-y-2 text-left">
                     <label className="form-label text-[10px] font-bold mb-1.5 block">Leave Category</label>
                     <select
                        className="input-field h-11 sm:h-12 font-bold text-sm"
                        value={newRequest.type}
                        onChange={e => setNewRequest({ ...newRequest, type: e.target.value })}
                     >
                        <option className="dark:bg-slate-900">Sick Leave</option>
                        <option className="dark:bg-slate-900">Annual Leave</option>
                        <option className="dark:bg-slate-900">Casual Leave</option>
                        <option className="dark:bg-slate-900">Unpaid Leave</option>
                     </select>
                  </div>
                  <div className="space-y-2 text-left">
                     <label className="form-label text-[10px] font-bold mb-1.5 block">Total Days</label>
                     <input
                        type="number"
                        placeholder="1"
                        className="input-field h-11 sm:h-12 font-semibold text-sm"
                        value={newRequest.days}
                        onChange={e => setNewRequest({ ...newRequest, days: e.target.value })}
                     />
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-4 sm:gap-6 text-left">
                  <div className="space-y-2 text-left">
                     <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Start Date</label>
                     <DatePicker
                        className="input-field h-11 sm:h-12 font-semibold text-sm"
                        value={newRequest.startDate}
                        onChange={e => setNewRequest({ ...newRequest, startDate: e.target.value })}
                     />
                  </div>
                  <div className="space-y-2 text-left">
                     <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">End Date</label>
                     <DatePicker
                        className="input-field h-11 sm:h-12 font-semibold text-sm"
                        value={newRequest.endDate}
                        onChange={e => setNewRequest({ ...newRequest, endDate: e.target.value })}
                     />
                  </div>
               </div>

               <div className="space-y-2 text-left">
                  <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Reason for Leave</label>
                  <textarea
                     className="input-field min-h-[100px] py-3 bg-white border-slate-205 resize-none text-sm font-medium"
                     placeholder="Provide detailed context for this request..."
                     value={newRequest.reason}
                     onChange={e => setNewRequest({ ...newRequest, reason: e.target.value })}
                  ></textarea>
               </div>

               <div className="pt-4 flex flex-col gap-3 text-left">
                  <button type="submit" className="btn-primary w-full py-2.5 sm:py-3 font-bold shadow-md shadow-primary-500/20 text-sm">Submit Application</button>
                  <button type="button" onClick={() => setShowAddModal(false)} className="w-full py-2 text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">Discard Request</button>
               </div>
            </form>
         </CenterModal>
      </div>
   );
};

export default HRApprovals;
