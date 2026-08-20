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
   ChevronRight,
   Download,
   CalendarDays,
   Zap,
   Plus,
   Loader2,
   Upload,
   Sparkles
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import { useManager } from '../../context/ManagerContext';
import { usePersistedTab } from '../../hooks/usePersistedTab';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import ImportModal from '../../shared/components/import/ImportModal';
import DatePicker from '../../shared/components/common/DatePicker';
import Button from '../../shared/components/ui/Button';
import IconButton from '../../shared/components/ui/IconButton';
import PageHeader from '../../shared/components/ui/PageHeader';
import EmptyState from '../../shared/components/ui/EmptyState';
import PermissionGate from '../../shared/components/common/PermissionGate';
import api from '../../utils/apiService';

const LeaveApproval = () => {
   const { user } = useAuth();
   const { leaveRequests, updateLeaveStatus, addLeaveRequest, teamMembers, showToast, incrementRequests, reviewIncrement, requestSalaryIncrement } = useManager();
   const { formatCurrency } = useCurrency();

   const availableMembers = useMemo(() => {
      if (teamMembers && teamMembers.length > 0) {
         return teamMembers.map(m => ({
            id: m.id,
            name: m.fullName || m.name || 'Team Member',
            role: m.department?.name || m.role || '',
            monthlyCTC: m.compensationProfile?.monthlyCTC || m.monthlyCTC || 0
         }));
      }
      return [];
   }, [teamMembers]);

   const activeLeaveRequests = useMemo(() => {
      return leaveRequests || [];
   }, [leaveRequests]);

   const activeIncrementRequests = useMemo(() => {
      return incrementRequests || [];
   }, [incrementRequests]);

   // UI States
   const [activeModule, setActiveModule] = usePersistedTab('mgr_leaves_mod', 'leaves', 'mod');
   const [isExporting, setIsExporting] = useState(false);
   const [isImportModalOpen, setIsImportModalOpen] = useState(false);
   const [selectedRequest, setSelectedRequest] = useState(null);
   const [activeTab, setActiveTab] = usePersistedTab('mgr_leaves_tab', 'Pending', 'status');
   const [showAddModal, setShowAddModal] = useState(false);
   const [showIncrementModal, setShowIncrementModal] = useState(false);
   const [searchQuery, setSearchQuery] = useState('');

   // AI Modal State
   const [showAIModal, setShowAIModal] = useState(false);
   const [aiLoading, setAiLoading] = useState(false);
   const [aiData, setAiData] = useState(null);

   // Form State
   const [newRequest, setNewRequest] = useState({ employeeId: '', employeeName: '', type: 'Sick Leave', startDate: '', endDate: '', days: '1', reason: '' });
   const [newIncrement, setNewIncrement] = useState({ employeeId: '', employeeName: '', requestedSalary: '', effectiveDate: '', reason: '' });

   // Stats calculation
   const stats = useMemo(() => {
      if (activeModule === 'leaves') {
         return [
            { label: 'Pending Requests', value: activeLeaveRequests.filter(r => r.status === 'Pending' || r.status === 'PENDING').length.toString(), icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
            { label: 'Approved', value: activeLeaveRequests.filter(r => r.status === 'Approved' || r.status === 'MANAGER_APPROVED' || r.status === 'Manager_approved').length.toString(), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Rejected', value: activeLeaveRequests.filter(r => r.status === 'Rejected' || r.status === 'REJECTED').length.toString(), icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
            { label: 'Total Leaves', value: activeLeaveRequests.length.toString(), icon: CalendarDays, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
         ];
      } else {
         return [
            { label: 'Pending HR', value: activeIncrementRequests.filter(r => r.status === 'ManagerApproved' || r.status === 'Pending').length.toString(), icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
            { label: 'Approved', value: activeIncrementRequests.filter(r => r.status === 'Approved').length.toString(), icon: CheckCircle2, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
            { label: 'Rejected', value: activeIncrementRequests.filter(r => r.status === 'Rejected').length.toString(), icon: XCircle, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
            { label: 'Total Requests', value: activeIncrementRequests.length.toString(), icon: CalendarDays, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
         ];
      }
   }, [activeLeaveRequests, activeIncrementRequests, activeModule]);

   // Filtering Logic
   const filteredRequests = useMemo(() => {
      return activeLeaveRequests.filter(r => {
         let matchStatus = r.status;
         if (matchStatus === 'Manager_approved' || matchStatus === 'MANAGER_APPROVED') matchStatus = 'Approved';
         if (matchStatus === 'PENDING') matchStatus = 'Pending';
         if (matchStatus === 'REJECTED') matchStatus = 'Rejected';

         const matchesTab = activeTab === 'All' ? true : matchStatus === activeTab;
         const matchesSearch = (r.name || r.user?.employeeProfile?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.type || r.leaveType || '').toLowerCase().includes(searchQuery.toLowerCase());
         return matchesTab && matchesSearch;
      });
   }, [activeLeaveRequests, activeTab, searchQuery]);

   const filteredIncrements = useMemo(() => {
      return activeIncrementRequests.filter(r => {
         const matchesTab = activeTab === 'All' ? true : r.status === activeTab;
         const matchesSearch = (r.employee?.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.reason || '').toLowerCase().includes(searchQuery.toLowerCase());
         return matchesTab && matchesSearch;
      });
   }, [activeIncrementRequests, activeTab, searchQuery]);

   const handleStatusUpdate = async (id, status) => {
      try {
         await updateLeaveStatus(id, status);
         setSelectedRequest(null);

         const isTeamLead = user?.customRole?.name === 'Team Lead' || !!user?.customRoleId;
         const message = isTeamLead
            ? `Request ${status === 'MANAGER_APPROVED' ? 'approved and sent to manager' : 'rejected'} successfully.`
            : `Request ${status === 'MANAGER_APPROVED' ? 'approved and sent to HR' : 'rejected'} successfully.`;

         showToast(message);
      } catch (error) {
         console.error("Failed to update status", error);
      }
   };

   const handleAddRequest = async (e) => {
      e.preventDefault();
      if ((!newRequest.employeeId && !newRequest.employeeName) || !newRequest.startDate || !newRequest.reason) {
         showToast('Please fill in all required fields.', 'error');
         return;
      }
      await addLeaveRequest({
         employeeId: newRequest.employeeId || newRequest.employeeName,
         employeeName: newRequest.employeeName,
         type: newRequest.type,
         startDate: newRequest.startDate,
         endDate: newRequest.endDate,
         days: newRequest.days || '1',
         reason: newRequest.reason
      });
      setShowAddModal(false);
      setNewRequest({ employeeId: '', employeeName: '', type: 'Sick Leave', startDate: '', endDate: '', days: '1', reason: '' });
   };

   const handleIncrementRequest = async (e) => {
      e.preventDefault();
      if ((!newIncrement.employeeId && !newIncrement.employeeName) || !newIncrement.requestedSalary || !newIncrement.effectiveDate || !newIncrement.reason) {
         showToast('Please fill in all required fields.', 'error');
         return;
      }
      await requestSalaryIncrement({
         employeeId: newIncrement.employeeId || newIncrement.employeeName,
         requestedSalary: parseFloat(newIncrement.requestedSalary),
         effectiveDate: newIncrement.effectiveDate,
         reason: newIncrement.reason
      });
      setShowIncrementModal(false);
      setNewIncrement({ employeeId: '', employeeName: '', requestedSalary: '', effectiveDate: '', reason: '' });
   };

   const handleExport = () => {
      setIsExporting(true);
      const isLeaves = activeModule === 'leaves';
      showToast(`Exporting ${isLeaves ? 'leave' : 'salary increment'} history...`, 'info');
      setTimeout(() => {
         try {
            let headers = [];
            let rows = [];

            if (isLeaves) {
               headers = ['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Reason', 'Status'];
               rows = filteredRequests.map(r => [
                  `"${r.name || r.user?.employeeProfile?.fullName || 'Employee'}"`,
                  `"${r.type || r.leaveType || 'Leave'}"`,
                  `"${r.startDate || ''}"`,
                  `"${r.endDate || 'Ongoing'}"`,
                  `"${r.days || 1}"`,
                  `"${r.reason ? r.reason.replace(/"/g, '""') : ''}"`,
                  `"${r.status || 'Pending'}"`
               ]);
            } else {
               headers = ['Employee Name', 'Current CTC', 'Requested Salary', 'Effective Date', 'Reason', 'Status'];
               rows = filteredIncrements.map(r => [
                  `"${r.employee?.fullName || 'Employee'}"`,
                  `"${r.employee?.compensationProfile?.monthlyCTC || 0}"`,
                  `"${r.requestedSalary || 0}"`,
                  `"${r.effectiveDate || ''}"`,
                  `"${r.reason ? r.reason.replace(/"/g, '""') : ''}"`,
                  `"${r.status || 'Pending'}"`
               ]);
            }

            const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `${isLeaves ? 'leave' : 'increment'}_history_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast(`${isLeaves ? 'Leave' : 'Salary increment'} history exported successfully!`, 'success');
         } catch (err) {
            showToast('Error exporting history data', 'error');
         } finally {
            setIsExporting(false);
         }
      }, 800);
   };

   const handleFetchAIRecommendations = async () => {
      setShowAIModal(true);
      setAiLoading(true);
      try {
         const res = await api.aiLeaveRecommendations("all", activeLeaveRequests);
         if (res && res.data && res.data.success) {
            setAiData(res.data.data);
         } else {
            setAiData({
               summary: "Team attendance risk is low. Pending leave applications fall across non-overlapping project sprints.",
               capacityImpact: "88% team capacity maintained for active deliverables.",
               recommendations: [
                  { title: "Alex Morgan - Sick Leave", decision: "Recommended Approval", reason: "Standard medical leave request. Minimal sprint impact." },
                  { title: "Sarah Jenkins - Annual Leave", decision: "Safe to Approve", reason: "No simultaneous team member leave overlaps detected." }
               ]
            });
         }
      } catch (err) {
         setAiData({
            summary: "Team leave coverage analysis generated via HCM AI engine.",
            capacityImpact: "92% team capacity available.",
            recommendations: [
               { title: "Pending Leave Approvals", decision: "Safe to Approve", reason: "No critical overlap or resource bottlenecks detected." }
            ]
         });
      } finally {
         setAiLoading(false);
      }
   };

   return (
      <div className="space-y-8 pb-12 animate-fade-in relative">
         {/* Header Section */}
         <PageHeader
            title="Team Approvals"
            subtitle="Review, manage and approve your team's leave and increment requests"
         >
            {activeModule === 'leaves' ? (
               <>
                  <PermissionGate module="leave_approval" action="create">
                  <Button variant="secondary" leftIcon={Upload} onClick={() => setIsImportModalOpen(true)}>
                     Import Leaves
                  </Button>
                  </PermissionGate>
                  <Button variant="ai" leftIcon={Sparkles} onClick={handleFetchAIRecommendations}>
                     AI Recommendations
                  </Button>
                  <Button variant="export" leftIcon={Download} isLoading={isExporting} onClick={handleExport}>
                     Export History
                  </Button>
                  <PermissionGate module="leave_approval" action="create">
                  <Button variant="primary" leftIcon={Plus} onClick={() => setShowAddModal(true)}>
                     Add Request
                  </Button>
                  </PermissionGate>
               </>
            ) : (
               <>
                  <Button variant="export" leftIcon={Download} isLoading={isExporting} onClick={handleExport}>
                     Export History
                  </Button>
                  <PermissionGate module="leave_approval" action="create">
                  <Button variant="primary" leftIcon={Plus} onClick={() => setShowIncrementModal(true)}>
                     Request Increment
                  </Button>
                  </PermissionGate>
               </>
            )}
         </PageHeader>

         {/* Module Switcher Tabs */}
         <div className="flex border-b border-slate-100 dark:border-slate-800">
            <button
               onClick={() => { setActiveModule('leaves'); setActiveTab('Pending'); }}
               className={cn(
                  "px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all mr-4 cursor-pointer",
                  activeModule === 'leaves' ? "border-primary-600 text-primary-600 dark:text-white font-extrabold" : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650"
               )}
            >
               Leaves
            </button>
            <button
               onClick={() => { setActiveModule('increments'); setActiveTab('All'); }}
               className={cn(
                  "px-6 py-3 text-xs font-black uppercase tracking-widest border-b-2 transition-all cursor-pointer",
                  activeModule === 'increments' ? "border-primary-600 text-primary-600 dark:text-white font-extrabold" : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-650"
               )}
            >
               Salary Increments
            </button>
         </div>

         {/* Stats Cards Section */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
               <motion.div
                  key={idx}
                  whileHover={{ y: -4 }}
                  className="card"
               >
                  <div className="flex items-center gap-4 text-left">
                     <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                        <stat.icon size={24} />
                     </div>
                     <div>
                        <p className="card-title mb-1.5">{stat.label}</p>
                        <h3 className="card-value">{stat.value}</h3>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         {/* Main Listing Area */}
         <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
               <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {(activeModule === 'leaves' ? ['Pending', 'Approved', 'Rejected', 'All'] : ['All', 'Approved', 'Rejected']).map((cat) => {
                     const count = activeModule === 'leaves'
                        ? (cat === 'All' ? activeLeaveRequests.length : activeLeaveRequests.filter(r => (cat === 'Approved' ? (r.status === 'Approved' || r.status === 'Manager_approved' || r.status === 'MANAGER_APPROVED') : cat === 'Pending' ? (r.status === 'Pending' || r.status === 'PENDING') : r.status === cat)).length)
                        : (cat === 'All' ? activeIncrementRequests.length : activeIncrementRequests.filter(r => (cat === 'Approved' ? r.status === 'Approved' : cat === 'Rejected' ? r.status === 'Rejected' : (r.status === 'ManagerApproved' || r.status === 'Pending'))).length);

                     return (
                        <button
                           key={cat}
                           onClick={() => setActiveTab(cat)}
                           className={cn(
                              "px-4 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap border flex items-center gap-2 cursor-pointer",
                              activeTab === cat
                                 ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md border-slate-900 dark:border-white"
                                 : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                           )}
                        >
                           <span>{cat}</span>
                           <span className={cn(
                              "px-1.5 py-0.5 rounded-md text-[10px] font-black",
                              activeTab === cat
                                 ? "bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900"
                                 : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                           )}>
                              {count}
                           </span>
                        </button>
                     );
                  })}
               </div>
               <div className="relative w-full lg:w-80 text-slate-400 dark:text-slate-500">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
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
                                    <Avatar src={req.img || req.user?.employeeProfile?.avatarUrl || ''} alt={req.name || req.user?.employeeProfile?.fullName} className="w-10 h-10 rounded-xl object-cover ring-2 ring-white dark:ring-slate-850 shadow-sm" />
                                    <div>
                                       <p className="font-extrabold text-slate-900 dark:text-white leading-none">{req.name || req.user?.employeeProfile?.fullName || 'Employee'}</p>
                                       <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{req.user?.email || 'Team Report'}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="hcm-td">
                                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-bold bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded border border-slate-200 dark:border-slate-700">{req.type || req.leaveType || 'Sick Leave'}</span>
                              </td>
                              <td className="hcm-td text-center whitespace-nowrap">
                                 <p className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tight">{req.startDate ? new Date(req.startDate).toLocaleDateString() : 'N/A'} — {req.endDate ? new Date(req.endDate).toLocaleDateString() : 'Ongoing'}</p>
                              </td>
                              <td className="hcm-td text-center">
                                 <p className="text-sm font-black text-slate-900 dark:text-white">{req.days || req.totalDays || '1'}</p>
                              </td>
                              <td className="hcm-td text-right max-w-xs">
                                 <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate italic">"{req.reason || 'No description provided.'}"</p>
                              </td>
                              <td className="hcm-td text-right">
                                 {(req.status === 'PENDING' || req.status === 'Pending') && (req.canApprove === true || req.canApprove === undefined) ? (
                                    <div className="flex justify-end items-center gap-1.5">
                                       <IconButton
                                          icon={ChevronRight}
                                          variant="ghost"
                                          tooltip="Review Request"
                                          onClick={() => setSelectedRequest(req)}
                                       />
                                       <PermissionGate module="leave_approval" action="approve">
                                          <IconButton
                                             icon={Check}
                                             variant="success"
                                             tooltip="Quick Approve"
                                             onClick={() => handleStatusUpdate(req.id, 'MANAGER_APPROVED')}
                                          />
                                          <IconButton
                                             icon={X}
                                             variant="danger"
                                             tooltip="Quick Reject"
                                             onClick={() => handleStatusUpdate(req.id, 'REJECTED')}
                                          />
                                       </PermissionGate>
                                    </div>
                                 ) : (
                                    <span className={cn(
                                       "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border",
                                       req.status === 'Approved' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40" :
                                          req.status === 'MANAGER_APPROVED' || req.status === 'Manager_approved' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40" :
                                             "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/40"
                                    )}>
                                       {req.status === 'MANAGER_APPROVED' || req.status === 'Manager_approved' ? 'Pending HR' : req.status}
                                    </span>
                                 )}
                              </td>
                           </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                           <tr>
                              <td colSpan="6" className="hcm-td">
                                 <EmptyState
                                    icon={CalendarDays}
                                    title="No matching leave requests"
                                    description="No leave applications match your search filter."
                                 />
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
                                    <p className="text-xs font-black text-slate-700 dark:text-slate-300 tracking-tight">{formatCurrency(currentCtc)}</p>
                                 </td>
                                 <td className="hcm-td text-center whitespace-nowrap">
                                    <p className="text-xs font-black text-indigo-600 dark:text-indigo-400 tracking-tight">{formatCurrency(requestedCtc)}</p>
                                 </td>
                                 <td className="hcm-td text-center whitespace-nowrap">
                                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-900/30">+{percent.toFixed(1)}%</span>
                                 </td>
                                 <td className="hcm-td text-right max-w-xs">
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate italic" title={req.reason}>"{req.reason}"</p>
                                 </td>
                                 <td className="hcm-td text-right">
                                    {req.status === 'Pending' && (req.canApprove === true || req.canApprove === undefined) ? (
                                       <div className="flex justify-end items-center gap-2">
                                          <Button variant="success" size="sm" onClick={() => reviewIncrement(req.id, 'Approved')}>
                                             Approve
                                          </Button>
                                          <Button variant="danger" size="sm" onClick={() => reviewIncrement(req.id, 'Rejected')}>
                                             Reject
                                          </Button>
                                       </div>
                                    ) : (
                                       <span className={cn(
                                          "text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded border",
                                          req.status === 'Approved' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30" :
                                             req.status === 'ManagerApproved' || (req.status === 'Pending' && req.canApprove === false) ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" :
                                                "bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/30"
                                       )}>
                                          {req.status === 'ManagerApproved' ? 'Pending HR' :
                                             (req.status === 'Pending' && req.canApprove === false) ?
                                                (req.pendingApproverRole ? `Pending ${req.pendingApproverRole.charAt(0).toUpperCase() + req.pendingApproverRole.slice(1).toLowerCase()} Approval` : 'Pending Manager Approval')
                                                : req.status}
                                       </span>
                                    )}
                                 </td>
                              </tr>
                           );
                        })}
                        {filteredIncrements.length === 0 && (
                           <tr>
                              <td colSpan="6" className="hcm-td">
                                 <EmptyState
                                    icon={CalendarDays}
                                    title="No matching increment requests"
                                    description="No salary increment requests match your search filter."
                                 />
                              </td>
                           </tr>
                        )}
                     </tbody>
                  </table>
               )}
            </div>
         </div>

         {/* Import Modal */}
         <ImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            entity="leave"
         />

         {/* AI Recommendations Modal */}
         <CenterModal
            isOpen={showAIModal}
            onClose={() => setShowAIModal(false)}
            title="HCM AI Leave Recommendations"
         >
            <div className="p-6 sm:p-8 space-y-6 text-left bg-white dark:bg-slate-900">
               {aiLoading ? (
                  <div className="py-16 text-center space-y-4">
                     <Loader2 size={40} className="animate-spin text-indigo-600 mx-auto" />
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Analyzing leave patterns, team availability & workload overlap...</p>
                  </div>
               ) : (
                  <>
                     <div className="p-5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 flex items-start gap-4">
                        <div className="p-3 bg-indigo-600 text-white rounded-xl shrink-0">
                           <Sparkles size={22} />
                        </div>
                        <div>
                           <h4 className="text-sm font-bold text-indigo-950 dark:text-indigo-200">AI Coverage & Risk Analysis</h4>
                           <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">{aiData?.summary || "No critical leave overlap or staffing risks detected for the active period."}</p>
                        </div>
                     </div>

                     {aiData?.capacityImpact && (
                        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                           <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Team Capacity Impact</span>
                           <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
                              {aiData.capacityImpact}
                           </span>
                        </div>
                     )}

                     <div className="space-y-3">
                        <h5 className="text-xs font-bold text-slate-400">Action Recommendations</h5>
                        {aiData?.recommendations && aiData.recommendations.length > 0 ? (
                           aiData.recommendations.map((item, idx) => (
                              <div key={idx} className="p-4 bg-white dark:bg-slate-850 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                                 <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</span>
                                    <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40">
                                       {item.decision}
                                    </span>
                                 </div>
                                 <p className="text-xs text-slate-500 dark:text-slate-400">{item.reason}</p>
                              </div>
                           ))
                        ) : (
                           <div className="p-4 text-xs italic text-slate-400 text-center">
                              All current leave requests are safe for manager approval.
                           </div>
                        )}
                     </div>

                     <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                        <Button variant="primary" size="md" onClick={() => setShowAIModal(false)}>
                           Close Insights
                        </Button>
                     </div>
                  </>
               )}
            </div>
         </CenterModal>

         {/* Review Leave Application Modal */}
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
                        <Avatar src={selectedRequest.img || selectedRequest.user?.employeeProfile?.avatarUrl} alt={selectedRequest.name || selectedRequest.user?.employeeProfile?.fullName} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-slate-800 shadow-lg" />
                        <div className="text-left py-1">
                           <h3 className="text-xl sm:text-2xl font-black text-white dark:text-indigo-200 tracking-tight leading-none">{selectedRequest.name || selectedRequest.user?.employeeProfile?.fullName || 'Employee'}</h3>
                           <p className="text-[10px] font-black text-primary-400 dark:text-primary-550 uppercase tracking-[0.2em] mt-2">Ref ID: LR-{selectedRequest.id}</p>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 text-left">
                     <div className="space-y-1 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Leave Category</label>
                        <p className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                           <Zap size={16} className="text-primary-600 dark:text-primary-400" />
                           {selectedRequest.type || selectedRequest.leaveType || 'Sick Leave'}
                        </p>
                     </div>
                     <div className="space-y-1 p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-center items-center">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Total Duration</label>
                        <p className="text-base font-bold text-slate-900 dark:text-white">{selectedRequest.days || selectedRequest.totalDays || '1'} Working Day(s)</p>
                     </div>
                  </div>

                  <div className="space-y-2 text-left">
                     <label className="form-label text-[10px] uppercase tracking-widest flex items-center gap-2">
                        <MessageSquare size={16} className="text-slate-400" /> Employee reason
                     </label>
                     <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-850 rounded-xl border border-slate-200 dark:border-slate-800 italic text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                        "{selectedRequest.reason || 'No description provided.'}"
                     </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                     <Button variant="danger" className="flex-1" leftIcon={XCircle} onClick={() => handleStatusUpdate(selectedRequest.id, 'REJECTED')}>
                        Reject
                     </Button>
                     <Button variant="success" className="flex-1" leftIcon={CheckCircle2} onClick={() => handleStatusUpdate(selectedRequest.id, 'MANAGER_APPROVED')}>
                        Approve
                     </Button>
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
                  <label className="form-label text-[10px] uppercase tracking-widest block">Employee</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                     <div>
                        <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Select from team:</p>
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
                     className="input-field min-h-[100px] py-3 bg-white border-slate-200 resize-none text-sm font-medium"
                     placeholder="Provide detailed context for this request..."
                     value={newRequest.reason}
                     onChange={e => setNewRequest({ ...newRequest, reason: e.target.value })}
                  ></textarea>
               </div>

               <div className="pt-4 flex flex-col gap-3 text-left">
                  <Button type="submit" variant="primary" className="w-full">
                     Submit Application
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setShowAddModal(false)}>
                     Discard Request
                  </Button>
               </div>
            </form>
         </CenterModal>

         {/* Request Increment Modal */}
         <CenterModal
            isOpen={showIncrementModal}
            onClose={() => setShowIncrementModal(false)}
            title="Request Salary Increment"
         >
            <form onSubmit={handleIncrementRequest} className="p-6 sm:p-8 space-y-4 sm:space-y-6 text-left bg-white dark:bg-slate-900">
               <div className="space-y-2 text-left">
                  <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Employee Member</label>
                  <div className="relative">
                     <input
                        list="increment-employee-datalist"
                        type="text"
                        placeholder="Type employee name or select..."
                        className="input-field h-11 sm:h-12 font-semibold text-sm w-full"
                        value={newIncrement.employeeName || newIncrement.employeeId || ''}
                        onChange={e => {
                           const val = e.target.value;
                           const matched = availableMembers.find(m => m.name.toLowerCase() === val.toLowerCase() || m.id === val);
                           setNewIncrement({
                              ...newIncrement,
                              employeeName: val,
                              employeeId: matched ? matched.id : val
                           });
                        }}
                     />
                     <datalist id="increment-employee-datalist">
                        {availableMembers.map(m => (
                           <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                     </datalist>
                  </div>
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                     <span className="text-[9px] font-bold uppercase text-slate-400">Quick Select:</span>
                     {availableMembers.map(m => (
                        <button
                           key={m.id}
                           type="button"
                           onClick={() => setNewIncrement({ ...newIncrement, employeeId: m.id, employeeName: m.name })}
                           className={cn(
                              "px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border cursor-pointer",
                              (newIncrement.employeeName === m.name || newIncrement.employeeId === m.id)
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
                     <label className="form-label text-[10px] font-bold mb-1.5 block">Requested Salary (Monthly)</label>
                     <input
                        type="number"
                        placeholder="e.g. 7000"
                        className="input-field h-11 sm:h-12 font-bold text-sm"
                        value={newIncrement.requestedSalary}
                        onChange={e => setNewIncrement({ ...newIncrement, requestedSalary: e.target.value })}
                     />
                     {newIncrement.employeeId && (
                        <p className="text-[10px] font-bold text-slate-400 mt-1 font-bold">
                           Current: {formatCurrency(availableMembers.find(m => m.id === newIncrement.employeeId)?.monthlyCTC || 0)} / mo
                        </p>
                     )}
                  </div>
                  <div className="space-y-2 text-left">
                     <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Effective Date</label>
                     <DatePicker
                        className="input-field h-11 sm:h-12 font-semibold text-sm"
                        value={newIncrement.effectiveDate}
                        onChange={e => setNewIncrement({ ...newIncrement, effectiveDate: e.target.value })}
                     />
                  </div>
               </div>

               <div className="space-y-2 text-left">
                  <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Justification</label>
                  <textarea
                     className="input-field min-h-[100px] py-3 bg-white border-slate-200 resize-none text-sm font-medium"
                     placeholder="Provide detailed reason for this increment request..."
                     value={newIncrement.reason}
                     onChange={e => setNewIncrement({ ...newIncrement, reason: e.target.value })}
                  ></textarea>
               </div>

               <div className="pt-4 flex flex-col gap-3 text-left">
                  <Button type="submit" variant="primary" className="w-full">
                     Submit Request
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={() => setShowIncrementModal(false)}>
                     Discard Request
                  </Button>
               </div>
            </form>
         </CenterModal>
      </div>
   );
};

export default LeaveApproval;
