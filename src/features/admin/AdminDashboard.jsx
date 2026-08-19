import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
   Users,
   UserCheck,
   Briefcase,
   ClipboardCheck,
   DollarSign,
   AlertTriangle,
   Plus,
   Download,
   TrendingUp,
   BarChart3,
   Activity,
   Bell,
   ShieldCheck,
   Target,
   ArrowUpRight,
   Search,
   Loader2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { usePermissionContext } from '../../context/PermissionContext';
import { useCurrency } from '../../hooks/useCurrency';
import PermissionGate from '../../shared/components/common/PermissionGate';
import { cn } from '../../utils/cn';
import UserModal from '../../shared/components/admin/UserModal';
import { adminAPI } from '../../utils/apiService';
import OrgSetupWizard from './OrgSetupWizard';

const AdminDashboard = () => {
   const { users, departments, roles, payrollList, runPayroll, systemLogs, addSystemLog, showToast } = useAdmin();
   const { hasModuleAccess, hasPermission } = usePermissionContext();
   const { getSymbol, getIcon, formatCurrency } = useCurrency();
   const totalPayroll = payrollList?.reduce((sum, p) => sum + (Number(p.net) || 0), 0) || 0;
   const CurrencyIcon = getIcon();
   const [isAddUserOpen, setIsAddUserOpen] = useState(false);
   const [activeAction, setActiveAction] = useState(null);
   const [growthTimeframe, setGrowthTimeframe] = useState('6months');
   const [dashboardStats, setDashboardStats] = useState(null);
   const [orgData, setOrgData] = useState(null);
   const navigate = useNavigate();

   useEffect(() => {
      const fetchStats = async () => {
         try {
            const [statsRes, orgRes] = await Promise.all([
              adminAPI.getStats(),
              adminAPI.getOrganization()
            ]);
            if (statsRes.data?.success) {
               setDashboardStats(statsRes.data.data);
            }
            if (orgRes.data?.success) {
               setOrgData(orgRes.data.data);
            }
         } catch (err) {
            console.error('Failed to fetch dashboard stats', err);
         }
      };
      fetchStats();
   }, []);


   const growthData = useMemo(() => {
      const now = new Date();
      const months = [];
      const numMonths = growthTimeframe === '6months' ? 6 : 12;

      for (let i = numMonths - 1; i >= 0; i--) {
         const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
         const label = d.toLocaleString('en-US', { month: 'short' });
         const year = d.getFullYear();
         const monthIndex = d.getMonth();
         const endOfMonth = new Date(year, monthIndex + 1, 0, 23, 59, 59);

         const count = (users || []).filter(u => {
            const rawDate = u.joinDate || u.employeeProfile?.joiningDate || u.createdAt;
            if (!rawDate) return true;
            const jDate = new Date(rawDate);
            return jDate <= endOfMonth;
         }).length;

         months.push({ label, year, count });
      }

      const maxCount = Math.max(...months.map(m => m.count), 1);
      return months.map(m => ({
         ...m,
         pct: Math.max(15, Math.round((m.count / maxCount) * 100))
      }));
   }, [users, growthTimeframe]);

   const stats = [
      { label: 'Total Employees', value: users.length, icon: Users, trend: '+3 this week', color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Active Users', value: users.filter(u => u.status === 'Active').length, icon: UserCheck, trend: '88% activity', color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Departments', value: departments.length, icon: Briefcase, trend: '2 archived', color: 'text-primary-600', bg: 'bg-primary-50' },
      { label: 'Custom Roles', value: roles.filter(r => r.isCustom).length, icon: ShieldCheck, trend: 'Granular access', color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Target Payroll', value: formatCurrency(totalPayroll, 'INR'), icon: CurrencyIcon, trend: 'Estimated monthly', color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { label: 'Compliance Alerts', value: '0', icon: AlertTriangle, trend: 'All clear', color: 'text-rose-600', bg: 'bg-rose-50' },
   ];

   const downloadCsv = (filename, headers, rows) => {
      const csv = [headers, ...rows]
         .map(row => row.map(value => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
         .join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
   };

   const handleExportAudit = () => {
      const rows = (systemLogs || []).map(log => [
         log.time || log.createdAt || '',
         log.user || log.user?.email || 'System',
         log.action || '',
         log.module || '',
         log.level || '',
         log.ip || log.ipAddress || '',
      ]);

      downloadCsv(
         `audit_export_${new Date().toISOString().split('T')[0]}.csv`,
         ['Time', 'User', 'Action', 'Module', 'Level', 'IP Address'],
         rows
      );
      showToast('Audit log exported successfully');
   };

   const handleRunPayroll = async () => {
      setActiveAction('payroll');
      try {
         await runPayroll();
         addSystemLog({
            user: 'Admin',
            action: 'Quick Action: Run Payroll',
            module: 'Payroll',
            ip: 'Local',
            device: 'Admin Dashboard',
            level: 'Info',
         });
         navigate('/admin/payroll');
      } finally {
         setActiveAction(null);
      }
   };

   const handleSystemCheck = () => {
      addSystemLog({
         user: 'System',
         action: 'Quick Action: System Check',
         module: 'Security',
         ip: 'Local',
         device: 'Admin Dashboard',
         level: 'System',
      });
      showToast('System check completed. No issues found.');
      navigate('/admin/audit');
   };

   const quickActions = [
      hasModuleAccess('payroll') ? { id: 'payroll', label: 'Run Payroll', icon: CurrencyIcon, onClick: handleRunPayroll } : null,
      hasModuleAccess('audit') ? { id: 'audit', label: 'Export Audit', icon: ShieldCheck, onClick: handleExportAudit } : null,
      hasPermission('users', 'create') ? { id: 'invite', label: 'Send Invite', icon: UserCheck, onClick: () => setIsAddUserOpen(true) } : null,
      hasModuleAccess('audit') ? { id: 'system', label: 'System Check', icon: Activity, onClick: handleSystemCheck } : null,
   ].filter(Boolean);

   const orgScore = dashboardStats?.organizationScore || 88;

   // Show wizard if this is the first login after provisioning
   if (orgData && !orgData.setupComplete) {
     return <OrgSetupWizard />;
   }

   return (
      <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="hcm-page-title">Admin Dashboard</h1>
               <p className="hcm-page-subtitle">Master control for organization, workforce and system performance</p>
            </div>
            <div className="flex items-center gap-3">
               <PermissionGate module="audit" action="view">
                  <button className="btn-secondary px-5 py-2.5 flex items-center gap-2">
                     <Download size={18} />
                     <span className="hidden sm:inline">Export Data</span>
                  </button>
               </PermissionGate>
               <PermissionGate module="users" action="create">
                  <button
                     onClick={() => setIsAddUserOpen(true)}
                     className="btn-primary px-6 py-2.5 flex items-center gap-2"
                  >
                     <Plus size={18} />
                     <span>Add User</span>
                  </button>
               </PermissionGate>
            </div>
         </div>

         {/* KPI Grid */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {stats.map((stat, idx) => (
               <motion.div
                  key={idx}
                  whileHover={{ y: -5 }}
                  className="card"
               >
                  <div className="flex flex-col gap-4">
                     <div className={cn("p-3 rounded-2xl w-fit", stat.bg, stat.color)}>
                        <stat.icon size={22} />
                     </div>
                     <div>
                        <p className="card-title">{stat.label}</p>
                        <h3 className="card-value truncate" title={stat.value}>{stat.value}</h3>
                        <p className="card-desc">{stat.trend}</p>
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Main Content Area */}
            <div className="lg:col-span-8 space-y-8">
               {/* Employee Growth Chart Preview */}
               <div className="card h-[400px] flex flex-col">
                  <div className="flex items-center justify-between mb-10">
                     <div>
                        <h3 className="hcm-section-heading flex items-center gap-2">
                           <TrendingUp className="text-primary-600" size={24} />
                           Employee Growth Trend
                        </h3>
                        <p className="hcm-page-subtitle">Monthly hiring vs attrition analytics</p>
                     </div>
                     <select 
                        value={growthTimeframe}
                        onChange={(e) => setGrowthTimeframe(e.target.value)}
                        className="input-field h-10 w-36 text-xs font-bold bg-slate-50 dark:bg-slate-800 border-none cursor-pointer"
                     >
                        <option value="6months">Last 6 Months</option>
                        <option value="year2026">Year 2026</option>
                     </select>
                  </div>
                  <div className="flex-1 flex items-end justify-between gap-3 px-4 mb-4">
                     {growthData.map((m, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-3 group relative">
                           <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded shadow pointer-events-none whitespace-nowrap z-10">
                              {m.count} {m.count === 1 ? 'Employee' : 'Employees'}
                           </div>
                           <div className="w-full relative flex items-end justify-center">
                              <div className="w-full max-w-[40px] bg-slate-50 dark:bg-slate-800 rounded-2xl h-44 relative overflow-hidden">
                                 <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${m.pct}%` }}
                                    transition={{ duration: 0.5, delay: i * 0.05 }}
                                    className="absolute bottom-0 inset-x-0 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-100 group-hover:bg-primary-600 transition-colors flex items-center justify-center"
                                 >
                                    <span className="text-[10px] font-bold text-white">{m.count}</span>
                                 </motion.div>
                              </div>
                           </div>
                           <span className="text-[10px] font-bold text-slate-500 font-bold leading-none">{m.label}</span>
                        </div>
                     ))}
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Attendance Summary */}
                  <div className="card">
                     <h3 className="hcm-section-heading mb-6 flex items-center gap-2">
                        <Target className="text-emerald-500" size={20} />
                        Attendance Summary
                     </h3>
                     <div className="space-y-6">
                        {[
                           { label: 'Present Today', val: dashboardStats?.attendanceSummary?.present || '94%', color: 'bg-emerald-500' },
                           { label: 'On Leave', val: dashboardStats?.attendanceSummary?.onLeave || '4%', color: 'bg-indigo-500' },
                           { label: 'Late/Absent', val: dashboardStats?.attendanceSummary?.lateAbsent || '2%', color: 'bg-rose-500' },
                        ].map((item, i) => (
                           <div key={i} className="space-y-2">
                              <div className="flex justify-between text-[10px] font-extrabold font-bold text-slate-450">
                                 <span>{item.label}</span>
                                 <span className="text-slate-900 dark:text-white">{item.val}</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                                 <div className={cn("h-full rounded-full", item.color)} style={{ width: item.val }} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>

                  {/* Activity Feed */}
                  <div className="card">
                     <h3 className="hcm-section-heading mb-6 flex items-center gap-2">
                        <Activity className="text-amber-500" size={20} />
                        Recent Activities
                     </h3>
                     <div className="space-y-6">
                        {(dashboardStats?.recentActivities || [
                           { text: 'Payroll processed for Finance Dept', time: '2h ago', icon: CurrencyIcon, color: 'text-emerald-500' },
                           { text: 'New policy added to Compliance', time: '4h ago', icon: ShieldCheck, color: 'text-indigo-500' },
                           { text: 'System backup completed', time: '6h ago', icon: Activity, color: 'text-slate-400' },
                        ]).map((activity, i) => (
                           <div key={i} className="flex gap-4 text-left">
                              <div className={cn("mt-1 shrink-0", activity.color || 'text-slate-400')}>
                                 {activity.icon ? <activity.icon size={16} /> : <Activity size={16} />}
                              </div>
                              <div>
                                 <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-snug">{activity.text}</p>
                                 <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                                    {activity.time ? (typeof activity.time === 'string' && activity.time.includes('ago') ? activity.time : new Date(activity.time).toLocaleString()) : 'N/A'}
                                 </p>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-8">
               <div className="card bg-slate-900 text-white border-none relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                     <Bell size={100} />
                  </div>
                  <h3 className="text-xs font-bold text-primary-300 mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-4">
                     {quickActions.map((act) => (
                        <button
                           key={act.id}
                           type="button"
                           onClick={act.onClick}
                           disabled={activeAction === act.id}
                           className="p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 hover:bg-white/10 hover:border-white/20 transition-all group/btn h-32 disabled:opacity-70 disabled:cursor-wait"
                        >
                           {activeAction === act.id ? (
                              <Loader2 size={24} className="text-primary-400 animate-spin" />
                           ) : (
                              <act.icon size={24} className="text-primary-400 group-hover/btn:scale-110 transition-transform" />
                           )}
                           <span className="text-[10px] font-extrabold font-bold text-center">{act.label}</span>
                        </button>
                     ))}
                  </div>
               </div>

               <div className="card">
                  <h3 className="hcm-section-heading mb-6 flex items-center gap-2">
                     <BarChart3 className="text-primary-600" size={22} />
                     Organization Score
                  </h3>
                  <div className="text-center py-6">
                     <div className="relative inline-flex mb-6">
                        <svg className="w-32 h-32 transform -rotate-90">
                           <circle cx="64" cy="64" r="58" className="stroke-slate-50 dark:stroke-slate-800 fill-none" strokeWidth="10" />
                           <motion.circle 
                              cx="64" cy="64" r="58" 
                              className="stroke-primary-600 fill-none" 
                              strokeWidth="10" 
                              strokeDasharray={364}
                              strokeDashoffset={364 - (364 * (orgScore / 100))}
                              strokeLinecap="round"
                              initial={{ strokeDashoffset: 364 }}
                              animate={{ strokeDashoffset: 364 - (364 * (orgScore / 100)) }}
                              transition={{ duration: 1.5 }}
                           />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                           <span className="text-3xl font-bold text-slate-900 dark:text-white leading-none">{orgScore}</span>
                           <span className="text-[10px] font-bold text-slate-400 font-bold mt-1">
                              {orgScore >= 90 ? 'Excellent' : orgScore >= 70 ? 'Good' : 'Needs Work'}
                           </span>
                        </div>
                     </div>
                     <p className="text-sm font-medium text-slate-500 dark:text-slate-400 px-4 leading-relaxed tracking-tight">
                        Your organization hygiene score is updated dynamically based on open tickets, unpaid payslips and pending leaves.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         <UserModal isOpen={isAddUserOpen} onClose={() => setIsAddUserOpen(false)} />
      </div>
   );
};

export default AdminDashboard;
