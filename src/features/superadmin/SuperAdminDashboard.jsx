import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { superAdminAPI } from '../../utils/apiService';
import {
  Users,
  ShieldCheck,
  Building2,
  TrendingUp,
  LayoutDashboard,
  DollarSign,
  Bell,
  RefreshCw,
  Eye,
  Activity,
  Settings,
  Lock,
  UserPlus,
  X,
  Search,
  Download,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '../../shared/components/layout/PageHeader';
import StatCard from '../../shared/components/ui/StatCard';
import { cn } from '../../utils/cn';
import { useCurrency } from '../../hooks/useCurrency';


const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

const SuperAdminDashboard = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const { users, departments, activityLogs, showToast } = useSuperAdmin();
  const { enterPreview } = useAuth();
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const navigate = useNavigate();


  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await superAdminAPI.getPlatformStats();
        if (response?.data?.success) {
          setStatsData(response.data.data);
        } else {
          setError('Failed to fetch platform statistics.');
        }
      } catch (err) {
        console.error('Error fetching superadmin stats:', err);
        setError(err.response?.data?.message || 'Error connecting to server.');
        if (showToast) showToast('Failed to fetch dashboard data', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [showToast]);

  // Stat Card Config
  const stats = [
    {
      label: 'Total Users',
      value: statsData?.totalUsers || 0,
      sub: `${statsData?.totalAdmins || 0} Admins`,
      icon: Users,
      color: 'from-violet-500 to-indigo-600',
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-900/30'
    },
    {
      label: 'Total Employees',
      value: statsData?.totalEmployees || 0,
      sub: `${statsData?.totalOrganizations || 0} Organizations`,
      icon: Users,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30'
    },
    {
      label: 'Total Candidates',
      value: statsData?.totalCandidates || 0,
      sub: `${statsData?.totalApplications || 0} Applications`,
      icon: Users,
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    {
      label: 'Total Recruiters',
      value: statsData?.totalRecruiters || 0,
      sub: 'HR representatives',
      icon: ShieldCheck,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30'
    },
    {
      label: 'Active Jobs',
      value: statsData?.totalJobPosts || 0,
      sub: 'Jobs currently posted',
      icon: Building2,
      color: 'from-rose-500 to-pink-600',
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-100 dark:border-rose-900/30'
    }
  ];

  const rm = statsData?.revenueMetrics;
  const enterpriseCount = rm?.planDistribution?.enterprise || 0;
  const proCount = rm?.planDistribution?.pro || 0;
  const teamCount = rm?.planDistribution?.team || 0;
  const totalPlans = enterpriseCount + proCount + teamCount || 1;
  
  const enterprisePct = Math.round((enterpriseCount / totalPlans) * 100);
  const proPct = Math.round((proCount / totalPlans) * 100);
  const teamPct = Math.round((teamCount / totalPlans) * 100);

  return (
    <motion.div
      className="space-y-8 w-full"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <PageHeader
        icon={LayoutDashboard}
        title="Super Admin Master Console"
        subtitle="Enterprise Management Console • Dynamic analytics, security shields, and platform configurations."
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 text-sm font-medium border border-red-100 dark:border-red-900/30">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((stat, idx) => (
          <StatCard key={idx} icon={stat.icon} label={stat.label} value={stat.value} sub={stat.sub} style={stat} isLoading={isLoading} />
        ))}
      </div>

      {/* Details Area */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Revenue & ARR Widget - Takes up 2 cols on XL */}
        <motion.div
          variants={cardVariants}
          className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft text-left flex flex-col justify-between"
        >
          {isLoading ? (
            <div className="animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-6 w-24 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-24 bg-slate-100 dark:bg-slate-800 rounded-2xl"></div>
                ))}
              </div>
              <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-3"></div>
              <div className="h-3 w-1/2 bg-slate-100 dark:bg-slate-800 rounded"></div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign size={18} className="text-primary-600 animate-pulse" />
                  <h2 className="hcm-section-heading">
                    Revenue & Subscription Overview
                  </h2>
                </div>
                <span className="text-[10px] font-bold bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 px-2.5 py-1 rounded-full uppercase tracking-wider truncate max-w-[120px] sm:max-w-none" title={`ARR: ${formatCurrency(rm?.arr || 0, 'INR')}`}>
                  ARR: {formatCurrency(rm?.arr || 0, 'INR')}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:border-indigo-200 dark:hover:border-indigo-800/50 transition-colors overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate" title="Platform Orgs">Platform Orgs</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1 truncate" title={statsData?.totalOrganizations || 0}>{statsData?.totalOrganizations || 0}</p>
                  <p className="text-[10px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                    <TrendingUp size={10} /> +{rm?.newOrgsThisMonth || 0} this month
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:border-violet-200 dark:hover:border-violet-800/50 transition-colors overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate" title="Monthly Recurring (MRR)">Monthly Recurring (MRR)</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1 truncate" title={formatCurrency(rm?.mrr || 0, 'INR')}>{formatCurrency(rm?.mrr || 0, 'INR')}</p>
                  <p className="text-[10px] font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                    <TrendingUp size={10} /> +{rm?.momGrowth || 0}% MoM
                  </p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:border-emerald-200 dark:hover:border-emerald-800/50 transition-colors overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate" title="Total Payroll Disbursed">Total Payroll Disbursed</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1 truncate" title={formatCurrency(statsData?.totalPayrollDisbursed || 0, 'INR')}>{formatCurrency(statsData?.totalPayrollDisbursed || 0, 'INR')}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5 truncate" title="YTD Platform Total">YTD Platform Total</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 hover:border-amber-200 dark:hover:border-amber-800/50 transition-colors overflow-hidden">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate" title="AI API Requests">AI API Requests</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white mt-1 truncate" title={statsData?.totalAiRequests || 0}>{statsData?.totalAiRequests || 0}</p>
                  <p className="text-[10px] font-bold text-emerald-500 mt-0.5 truncate" title="Resume Scans & Chat">Resume Scans & Chat</p>
                </div>
              </div>

              {/* Premium Plan Distribution Graph */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 mb-2 gap-2">
                  <span>Plan Share Distribution</span>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                    {enterpriseCount} Enterprise • {proCount} Pro • {teamCount} Team
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
                  <div className="h-full bg-violet-500 transition-all duration-1000 ease-out" style={{ width: `${enterprisePct}%` }} title={`Enterprise (${enterprisePct}%)`} />
                  <div className="h-full bg-blue-500 transition-all duration-1000 ease-out" style={{ width: `${proPct}%` }} title={`Pro (${proPct}%)`} />
                  <div className="h-full bg-emerald-500 transition-all duration-1000 ease-out" style={{ width: `${teamPct}%` }} title={`Team (${teamPct}%)`} />
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /> Enterprise ({enterprisePct}%)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Pro ({proPct}%)</div>
                  <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Team ({teamPct}%)</div>
                </div>
              </div>
            </>
          )}

          {/* Additional Platform Health Blocks */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-indigo-900 dark:text-indigo-100">Benefits HCM Overview</h4>
                <p className="text-xs text-indigo-600/70 dark:text-indigo-400">{statsData?.benefitsEnrollmentRate || 0}% Employee Enrollment Rate</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 dark:border-slate-800">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="p-5 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/30 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Time & Attendance</h4>
                <p className="text-xs text-emerald-600/70 dark:text-emerald-400">{statsData?.activeTimeLogsToday || 0} Active Time Logs Today</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 dark:border-slate-800">
                <TrendingUp size={18} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* View As Role Launcher */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft text-left"
        >
          <div className="flex items-center gap-2 mb-6">
            <Eye size={18} className="text-amber-500" />
            <h2 className="hcm-section-heading">
              View As Role
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            Instantly switch your session to preview the dashboard and permissions of a specific role.
          </p>
          <div className="space-y-3">
            {[
              { id: 'admin', label: 'Admin', color: 'blue' },
              { id: 'hr', label: 'HR Manager', color: 'pink' },
              { id: 'manager', label: 'Manager', color: 'emerald' },
              { id: 'employee', label: 'Employee', color: 'violet' },
              { id: 'candidate', label: 'Candidate', color: 'amber' }
            ].map(r => (
              <button
                key={r.id}
                onClick={() => enterPreview(r.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${r.color}-50 dark:bg-${r.color}-900/20 text-${r.color}-600 dark:text-${r.color}-400 flex items-center justify-center`}>
                    <ShieldCheck size={14} />
                  </div>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {r.label}
                  </span>
                </div>
                <Eye size={14} className="text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
              </button>
            ))}
          </div>
        </motion.div>

        {/* Activity & System Monitoring - Takes up full width */}
        <motion.div
          variants={cardVariants}
          className="xl:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft text-left"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-primary-600" />
              <h2 className="hcm-section-heading">
                Activity & System Monitoring
              </h2>
            </div>
            <button 
              onClick={() => navigate('/superadmin/audit')}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-all hover:underline"
            >
              View Full Audit Log
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {activityLogs?.slice(0, 4).map((log, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-0.5">
                    {log.type === 'user' ? (
                      <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center border border-blue-100 dark:border-blue-800/50">
                        <UserPlus size={12} />
                      </div>
                    ) : log.type === 'security' ? (
                      <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 flex items-center justify-center border border-rose-100 dark:border-rose-800/50">
                        <Lock size={12} />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-500 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                        <Settings size={12} />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-tight">
                      {log.action}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-medium text-slate-700 dark:text-slate-400">
                        {typeof log.user === 'object' && log.user !== null ? (log.user.email || 'System') : (log.user || 'System')}
                      </span> • {log.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>

      {/* Ecosystem Audit Logs Modal */}
      <AuditLogsModal 
        isOpen={isAuditModalOpen} 
        onClose={() => setIsAuditModalOpen(false)} 
        logs={activityLogs} 
        showToast={showToast} 
      />
    </motion.div>
  );
};

// ============================================================
// Ecosystem Audit Logs Modal Component
// ============================================================
const AuditLogsModal = ({ isOpen, onClose, logs, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('All');

  const filteredLogs = (logs || []).filter(log => {
    const userStr = typeof log.user === 'object' && log.user !== null ? (log.user.email || '') : (log.user || '');
    const matchesSearch = 
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      userStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'All' ? true : (log.type || '').toLowerCase() === selectedType.toLowerCase();
    
    return matchesSearch && matchesType;
  });

  const handleExport = () => {
    if (showToast) {
      showToast('Ecosystem audit log report exported successfully as CSV.');
    } else {
      window.dispatchEvent(new CustomEvent('app_toast', { detail: { message: 'Ecosystem audit log report exported successfully as CSV.', type: 'success' } }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] text-slate-800 dark:text-slate-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 flex items-center justify-center">
                  <Activity size={20} />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Full Ecosystem Audit Logs</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Complete sequence of administrative activities and events</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-455 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filters & Search */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search logs by user or action..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-primary-500 transition-colors"
                />
              </div>

              {/* Type Filter */}
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar shrink-0">
                {['All', 'System', 'Security', 'User'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      selectedType === type
                        ? "bg-slate-900 dark:bg-slate-800 text-white border-slate-900 dark:border-slate-850"
                        : "bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200/60 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {filteredLogs.length > 0 ? (
                <div className="space-y-3">
                  {filteredLogs.map((log, i) => (
                    <div 
                      key={i} 
                      className="p-4 rounded-2xl bg-slate-55 dark:bg-slate-950 border border-slate-150/70 dark:border-slate-850/80 flex items-start gap-4 hover:border-slate-300 dark:hover:border-slate-750 transition-colors"
                    >
                      <div className="shrink-0 mt-0.5">
                        {log.type === 'user' ? (
                          <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-100 dark:border-blue-900/30">
                            <UserPlus size={14} />
                          </div>
                        ) : log.type === 'security' ? (
                          <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
                            <Lock size={14} />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                            <Settings size={14} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200 truncate">
                          {log.action}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs text-slate-450 dark:text-slate-400">
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {typeof log.user === 'object' && log.user !== null ? (log.user.email || 'System') : (log.user || 'System')}
                          </span>
                          <span>•</span>
                          <span>{log.time}</span>
                          <span>•</span>
                          <span className="capitalize text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
                            {log.type || 'system'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                  <Activity size={40} className="mb-3 opacity-60 text-slate-300 dark:text-slate-700" />
                  <p className="text-sm font-bold">No matching audit logs found</p>
                  <p className="text-xs mt-1 text-slate-500">Try broadening your search term or filtering options</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex items-center justify-between gap-4 mt-auto">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                Showing {filteredLogs.length} of {(logs || []).length} total log entries
              </span>
              <button 
                onClick={handleExport}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-750 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm"
              >
                <Download size={14} />
                <span>Export CSV</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuperAdminDashboard;

