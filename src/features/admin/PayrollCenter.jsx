import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Calendar, Users, DollarSign, Lock, Play, Table, AlertCircle,
  TrendingUp, Zap, Info, X, Check, Edit3, TrendingDown, Eye, Download,
  CheckCircle2, MoreVertical, Calculator, History, User, Loader2, FileText, Printer
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';
import TaxRulesModal from '../../shared/components/admin/TaxRulesModal';
import PayrollBreakdownModal from '../../shared/components/admin/PayrollBreakdownModal';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import { useCurrency } from '../../hooks/useCurrency';
import ImportModal from '../../shared/components/import/ImportModal';
import { Upload } from 'lucide-react';

const PayrollCenter = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency, convertAmount } = useCurrency();

  const {
    payrollList, users, runPayroll, showToast, updatePayrollDetails, appSettings, fetchPayroll,
    salaryComponents, deductionRules, taxRules,
    incrementRequests, approveIncrementRequest, rejectIncrementRequest
  } = useAdmin();
  const [activeTab, setActiveTab] = useState('list');
  const [isRunningPayroll, setIsRunningPayroll] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [employeeToView, setEmployeeToView] = useState(null);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const payslipPrintRef = React.useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  const allMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthIndex = new Date().getMonth();
  const months = allMonths.slice(0, currentMonthIndex + 1);
  const [selectedMonth, setSelectedMonth] = useState(months[months.length - 1]);

  // Confirmation checks & processing state
  const [payrollChecks, setPayrollChecks] = useState([false, false, false, false]);
  const [isSimulatingPayroll, setIsSimulatingPayroll] = useState(false);

  const togglePayrollCheck = (idx) => {
    setPayrollChecks(prev => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  const handleExecutePayroll = async () => {
    setIsSimulatingPayroll(true);
    try {
      await runPayroll(selectedMonth);
      showToast(`Payroll for ${selectedMonth} 2026 successfully simulated and executed!`);
      setIsRunningPayroll(false);
    } catch (err) {
      showToast('Failed to process payroll batch', 'error');
    } finally {
      setIsSimulatingPayroll(false);
    }
  };

  useEffect(() => {
    fetchPayroll(selectedMonth);
  }, [selectedMonth, fetchPayroll]);

  const downloadPayslip = (emp) => {
    setSelectedRecord(emp);
    setShowPayslipModal(true);
    // Give the modal a brief moment to render before calling print
    setTimeout(() => {
      window.print();
    }, 150);
    showToast(`Preparing PDF layout for ${emp.name || emp.employeeName}`);
  };

  const defaultCurrency = appSettings?.general?.defaultCurrency;

  // Combine active non-admin users with their payroll data (if any)
  const combinedPayroll = users
    .filter(u => {
      const roleStr = (u.role || '').toLowerCase().replace(/\s/g, '');
      const isNotAdmin = roleStr !== 'admin' && roleStr !== 'superadmin';
      const isNotCandidate = roleStr !== 'candidate';
      const hasProfile = !!u.profileId;
      const isActive = !['suspended', 'inactive', 'terminated'].includes((u.status || '').toLowerCase());
      return isNotAdmin && isNotCandidate && hasProfile && (isActive || payrollList.some(p => p.userId === u.id || p.employeeId === u.profileId));
    })
    .map(u => {
      const existing = payrollList.find(p => p.userId === u.id || p.employeeId === u.profileId);
      if (existing) {
        return {
          ...existing,
          role: u.role,
          img: existing.img || u.img || '',
          id: u.id // Pass the user ID so the modal knows which user it's for
        };
      }

      return {
        id: u.id,
        employeeId: u.id,
        name: u.name,
        role: u.role,
        basic: u.baseSalary || 0,
        bonus: 0,
        deductions: 0,
        net: u.monthlyCTC || 0,
        status: 'Unprocessed',
        img: u.img || ''
      };
    });

  const filteredPayroll = combinedPayroll.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'list' ? true : activeTab === 'pending' ? p.status === 'Draft' : p.status === 'Processed';
    return matchesSearch && matchesTab;
  });

  const filteredIncrements = (incrementRequests || []).filter(r => {
    const name = r.employee?.fullName || '';
    const reason = r.reason || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           reason.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalEmployees = combinedPayroll.length;
  const totalPayout = combinedPayroll.reduce((acc, p) => acc + convertAmount(p.net || 0, p.currency), 0);

  const stats = [
    { label: 'Payroll Month', value: selectedMonth, icon: Calendar, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Total Payout', value: formatCurrency(totalPayout), icon: getIcon(defaultCurrency), color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/30' },
    { label: 'Employees', value: totalEmployees.toString(), icon: Users, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
    { label: 'Pending Lock', value: 'Finance', icon: Lock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative focus:outline-none w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title text-shadow-sm">Payroll Center</h1>
          <p className="hcm-page-subtitle">Configure salary structures, manage payout cycles and process compliance payments</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest border border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 focus:outline-none shadow-sm cursor-pointer hover:border-slate-350 transition-all"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Import Payslips</span>
          </button>
          <button
            onClick={() => setIsRunningPayroll(true)}
            className="btn-primary flex items-center gap-2 shadow-xl shadow-primary-500/20 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
            <Play size={18} fill="currentColor" />
            <span>Run Payroll</span>
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="flex flex-wrap gap-4">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -3 }}
            className="card !p-4 flex-1 min-w-[200px] max-w-[280px]"
          >
            <div className="flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl", stat.bg, stat.color)}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="card-title text-[11px] mb-0.5">{stat.label}</p>
                <h3 className="card-value text-lg">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Control Panel */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-2 pb-2">
            {[
              { id: 'list', label: 'Employee List', icon: Table },
              { id: 'pending', label: 'Pending Approvals', icon: AlertCircle },
              { id: 'processed', label: 'Payout History', icon: History },
              { id: 'increments', label: 'Salary Increments', icon: TrendingUp },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap flex items-center gap-2",
                  activeTab === tab.id
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xl shadow-slate-200/10"
                    : "bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                )}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
          <div className="relative w-full lg:w-80">
            <Search className="absolute left-3 top-3 text-slate-400 dark:text-slate-500" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search employee..."
              className="input-field pl-10 h-11"
            />
          </div>
        </div>

        <div className="hcm-table-container overflow-hidden w-full">
          {activeTab === 'increments' ? (
            <table className="hcm-table [&_td]:whitespace-normal [&_th]:whitespace-normal w-full min-w-full">
              <thead className="hcm-thead">
                <tr>
                  <th className="hcm-th">Employee</th>
                  <th className="hcm-th text-center">Current Monthly CTC</th>
                  <th className="hcm-th text-center">Requested Monthly CTC</th>
                  <th className="hcm-th text-center">Percentage Raise</th>
                  <th className="hcm-th text-right">Reason</th>
                  <th className="hcm-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredIncrements.length > 0 ? filteredIncrements.map((req) => {
                  const currentCtc = req.employee?.compensationProfile?.monthlyCTC || 0;
                  const requestedCtc = req.requestedSalary || 0;
                  const diff = requestedCtc - currentCtc;
                  const percent = currentCtc > 0 ? (diff / currentCtc) * 100 : 0;
                  return (
                    <tr key={req.id} className="hcm-tr">
                      <td className="hcm-td">
                        <div className="flex items-center gap-4">
                          {req.employee?.avatarUrl ? (
                            <img src={req.employee.avatarUrl} alt={req.employee.fullName} className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white dark:ring-slate-800" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm ring-2 ring-white dark:ring-slate-800">
                              <User size={20} />
                            </div>
                          )}
                          <p className="font-bold text-slate-900 dark:text-white tracking-tight">{req.employee?.fullName || 'Employee'}</p>
                        </div>
                      </td>
                      <td className="hcm-td text-center font-medium">{formatCurrency(currentCtc)}</td>
                      <td className="hcm-td text-center font-bold text-indigo-650 dark:text-indigo-400">{formatCurrency(requestedCtc)}</td>
                      <td className="hcm-td text-center whitespace-nowrap">
                        <span className="text-[10px] font-black text-emerald-650 dark:text-emerald-450 font-bold bg-emerald-50 dark:bg-emerald-950/20 px-2 py-1 rounded border border-emerald-100 dark:border-emerald-900/30">+{percent.toFixed(1)}%</span>
                      </td>
                      <td className="hcm-td text-right max-w-xs">
                        <p className="text-[11px] font-medium text-slate-405 dark:text-slate-495 truncate italic" title={req.reason}>"{req.reason}"</p>
                      </td>
                      <td className="hcm-td text-right">
                        {req.status === 'ManagerApproved' ? (
                          <div className="flex justify-end items-center gap-2">
                            <button 
                              onClick={() => approveIncrementRequest(req.id)}
                              className="px-3 py-1.5 text-[10px] uppercase bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg transition-all shadow-sm font-bold border border-emerald-100 dark:border-emerald-900/30" 
                              title="Approve & Implement"
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
                            req.status === 'Approved' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30" : "bg-rose-50 dark:bg-rose-950/20 text-rose-500 dark:text-rose-455 border-rose-100 dark:border-rose-900/30"
                          )}>
                            {req.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan="6" className="hcm-td text-center py-12 text-slate-400">
                      No pending increment requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          ) : (
            <table className="hcm-table [&_td]:whitespace-normal [&_th]:whitespace-normal w-full min-w-full">
              <thead className="hcm-thead">
                <tr>
                  <th className="hcm-th">Employee</th>
                  <th className="hcm-th text-left">Role</th>
                  <th className="hcm-th text-center">Net Payable</th>
                  <th className="hcm-th text-center">Cost to Company</th>
                  <th className="hcm-th text-center">Status</th>
                  <th className="hcm-th text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredPayroll.length > 0 ? filteredPayroll.map((emp, idx) => (
                  <tr key={emp.id} className="hcm-tr">
                    <td className="hcm-td">
                      <div className="flex items-center gap-4">
                        {emp.img ? (
                          <img src={emp.img} alt={emp.name} className="w-10 h-10 rounded-xl object-cover shadow-sm ring-2 ring-white dark:ring-slate-800" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shadow-sm ring-2 ring-white dark:ring-slate-800">
                            <User size={20} />
                          </div>
                        )}
                        <p className="font-bold text-slate-900 dark:text-white tracking-tight">{emp.name}</p>
                      </div>
                    </td>
                    <td className="hcm-td text-left text-sm font-medium text-slate-500 dark:text-slate-400">
                      {emp.role || 'Employee'}
                    </td>
                    <td className="hcm-td text-center font-black text-slate-900 dark:text-white">{formatCurrency(emp.net, emp.currency)}</td>
                    <td className="hcm-td text-center font-bold text-slate-600 dark:text-slate-300">{formatCurrency(emp.basic + emp.bonus, emp.currency)}</td>
                    <td className="hcm-td text-center">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border",
                        emp.status === 'Draft' ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/30" :
                          emp.status === 'Processed' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30" :
                            "bg-slate-50 dark:bg-slate-800 text-slate-450 dark:text-slate-555 border-slate-100 dark:border-slate-800"
                      )}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="hcm-td text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedRecord(emp);
                            setShowPayslipModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                          title="View Payslip"
                        >
                          <Eye size={16} />
                        </button>
                        {emp.status === 'Draft' ? (
                          <>
                            <button
                              onClick={() => updatePayrollDetails(emp.id, { status: 'Processed' })}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                              title="Process Payroll"
                            >
                              <CheckCircle2 size={16} />
                            </button>
                            <ActionDropdown
                              actions={[
                                { label: 'Download Payslip', icon: Download, onClick: () => downloadPayslip(emp) }
                              ]}
                              direction={filteredPayroll.length > 2 && idx >= filteredPayroll.length - 2 ? 'up' : 'down'}
                            />
                          </>
                        ) : emp.status === 'Processed' ? (
                          <>
                            <div className="flex items-center gap-1.5 px-2.5 py-1 text-emerald-600 dark:text-emerald-450 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg text-xs font-bold border border-emerald-100 dark:border-emerald-900/30">
                              <Check size={14} strokeWidth={3} />
                              <span>Done</span>
                            </div>
                            <button
                              onClick={() => downloadPayslip(emp)}
                              className="flex items-center gap-1.5 px-2.5 py-1 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg text-xs font-bold transition-all border border-blue-100 dark:border-blue-900/30"
                              title="Download Payslip"
                            >
                              <Download size={14} strokeWidth={2.5} />
                              <span>Download</span>
                            </button>
                          </>
                        ) : (
                          <ActionDropdown
                            actions={[
                              { label: 'Download Payslip', icon: Download, onClick: () => downloadPayslip(emp) }
                            ]}
                            direction={filteredPayroll.length > 2 && idx >= filteredPayroll.length - 2 ? 'up' : 'down'}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="9" className="hcm-td">
                      <div className="hcm-empty-state">
                        <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-4">
                          <Table size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No payroll records found</h3>
                        <p className="text-sm font-medium text-slate-405 dark:text-slate-500">Try adjusting your filters or search query</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Run Payroll Modal Drawer */}
      <AnimatePresence>
        {isRunningPayroll && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsRunningPayroll(false)}
              className="hcm-modal-overlay z-[110]"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] md:w-full md:max-w-xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
            >
              <div className="p-6 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                <div className="flex items-center gap-4 md:gap-5">
                  <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg transform rotate-12">
                    <Zap size={22} fill="currentColor" />
                  </div>
                  <div>
                    <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white leading-none">Process Monthly Payroll</h2>
                    <p className="text-[10px] font-bold text-primary-600 dark:text-primary-400 font-bold mt-2 leading-none">Cycle: {selectedMonth} 2026</p>
                  </div>
                </div>
                <button onClick={() => setIsRunningPayroll(false)} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-400 dark:text-slate-500">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 md:space-y-12">
                <div className="card p-6 md:p-10 bg-slate-900 dark:bg-slate-950 text-white border-none shadow-soft relative overflow-hidden group">
                  <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5 group-hover:bg-primary-500 transition-all duration-1000" />
                  <p className="text-[10px] font-bold text-primary-400 mb-6 px-1">Review Configuration</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-10">
                    <div>
                      <p className="text-3xl md:text-4xl font-bold text-white">{formatCurrency(totalPayout)}</p>
                      <p className="text-[10px] font-bold text-slate-500 font-bold mt-2">Total Est. Payout</p>
                    </div>
                    <div className="sm:text-right">
                      <p className="text-3xl md:text-4xl font-black text-white">{totalEmployees}</p>
                      <p className="text-[10px] font-bold text-slate-500 font-bold mt-2">Employee Records</p>
                    </div>
                  </div>
                </div>

                <section className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-550 uppercase tracking-widest">Confirmation Checks</label>
                      <button 
                        type="button"
                        onClick={() => {
                          const allChecked = payrollChecks.every(Boolean);
                          setPayrollChecks([!allChecked, !allChecked, !allChecked, !allChecked]);
                        }} 
                        className="text-[10px] font-bold text-primary-600 dark:text-primary-400 font-bold hover:underline cursor-pointer"
                      >
                        {payrollChecks.every(Boolean) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                    <div className="space-y-3">
                      {[
                        'Calculate attendance & leave deductions',
                        'Apply individual & team-based bonuses',
                        'Audit government & professional tax compliance',
                        'Generate secure digital payslips'
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => togglePayrollCheck(i)}
                          className={cn(
                            "w-full flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer select-none",
                            payrollChecks[i] 
                              ? "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50 text-slate-900 dark:text-white shadow-sm" 
                              : "bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-slate-700 text-slate-500 hover:bg-slate-100/80"
                          )}
                        >
                          <div 
                            className={cn(
                              "w-6 h-6 shrink-0 rounded-lg border-2 flex items-center justify-center transition-all",
                              payrollChecks[i] 
                                ? "bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-500/20 scale-105" 
                                : "border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                            )}
                          >
                            {payrollChecks[i] && <Check size={14} className="stroke-[3] text-white" />}
                          </div>
                          <span className="text-xs md:text-sm font-bold font-bold flex-1 text-left">
                            {item}
                          </span>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md transition-all",
                            payrollChecks[i] 
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300" 
                              : "bg-amber-100/80 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400"
                          )}>
                            {payrollChecks[i] ? 'Confirmed ✓' : 'Pending Check'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-800/30 rounded-3xl md:rounded-[2.5rem] border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-5">
                    <div className="p-3 bg-white dark:bg-slate-900 shrink-0 self-start rounded-2xl text-primary-600 dark:text-primary-400 shadow-sm border border-slate-50 dark:border-slate-800">
                      <Calculator size={24} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">Automated Breakdown</p>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-550 uppercase tracking-widest mt-2">Calculated based on 'Standard Template V2.0'</p>
                    </div>
                    <button className="text-[10px] font-bold text-primary-600 dark:text-primary-400 font-bold border border-primary-100 dark:border-primary-900/50 px-3 py-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-850 transition-all">Preview</button>
                  </div>
                </section>
              </div>

              <div className="p-6 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 flex flex-col-reverse sm:flex-row items-center gap-4 shrink-0">
                <button onClick={() => setIsRunningPayroll(false)} className="w-full sm:flex-1 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm">
                  Cancel
                </button>
                <button
                  onClick={handleExecutePayroll}
                  disabled={isSimulatingPayroll}
                  className="w-full sm:flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 disabled:opacity-50 transition-all shadow-xl shadow-primary-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  {isSimulatingPayroll ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Executing Payroll...</span>
                    </>
                  ) : (
                    <>
                      <Play size={18} fill="currentColor" />
                      <span>Simulate & Execute</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        entity="payroll"
      />

      <TaxRulesModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
      />

      <AnimatePresence>
        {showPayslipModal && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-xl w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowPayslipModal(false)}
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors bg-white/80"
              >
                <X size={18} />
              </button>

              {/* Printable Area Wrapper */}
              <div id="payslip-print-container" ref={payslipPrintRef} className="space-y-6">
                {/* Payslip Header Info */}
                <div className="flex justify-between items-start border-b border-primary-100 dark:border-slate-800 pb-4 mt-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-bold">{appSettings?.general?.companyName || 'GlobalTech Solutions'}</h2>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Enterprise Employee Paystub</p>
                  </div>
                  <div className="text-right mr-6">
                    <span className="text-xs font-bold font-mono text-slate-400">PAYSLIP ID: {selectedRecord.id?.slice(0, 8).toUpperCase()}</span>
                    <p className="text-[10px] text-slate-500 mt-1">Month: <strong>{selectedRecord.month}</strong></p>
                  </div>
                </div>

                {/* Employee / Issue details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employee Details</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.name || selectedRecord.employeeName}</p>
                    <p className="text-slate-400 font-mono mt-0.5">{selectedRecord.employeeId || selectedRecord.displayId}</p>
                    <p className="text-slate-500 mt-0.5">{selectedRecord.designation || selectedRecord.role || 'Employee'} • {selectedRecord.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Summary</p>
                    <p className="text-slate-600 dark:text-slate-400">Working Days: <strong>{selectedRecord.totalWorkingDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Days Present: <strong>{selectedRecord.presentDays ?? selectedRecord.attendancePresent ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Paid Leaves: <strong>{selectedRecord.paidLeaveDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">LOP Days: <strong>{selectedRecord.unpaidLeaveDays ?? selectedRecord.attendanceAbsent ?? 0}</strong></p>
                  </div>
                </div>

                {/* Breakdown Tables (Earnings vs Deductions) */}
                <div className="grid grid-cols-2 gap-6 pt-2">
                  {/* Earnings */}
                  <div className="space-y-1 text-xs">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase border-b pb-1 border-slate-100 dark:border-slate-800">Earnings</h4>
                    {selectedRecord.items && selectedRecord.items.length > 0 ? (
                      selectedRecord.items
                        .filter(item => ['Earning', 'Allowance', 'Variable Pay'].includes(item.type))
                        .map((item, idx) => (
                          <div key={idx} className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                            <span>{item.name}</span>
                            <span>{formatCurrency(item.amount, selectedRecord.currency)}</span>
                          </div>
                        ))
                    ) : (
                      <>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Basic Salary</span>
                          <span>{formatCurrency(selectedRecord.basic, selectedRecord.currency)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Bonus & Allowances</span>
                          <span>{formatCurrency((selectedRecord.allowance || 0) + (selectedRecord.bonus || 0), selectedRecord.currency)}</span>
                        </div>
                      </>
                    )}
                    {selectedRecord.overtimeAmount > 0 && (
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Overtime Pay ({selectedRecord.overtimeHours?.toFixed(1)} hrs)</span>
                        <span>{formatCurrency(selectedRecord.overtimeAmount, selectedRecord.currency)}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 font-bold border-t border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-100">
                      <span>Gross Earnings</span>
                      <span>{formatCurrency(selectedRecord.grossSalary || (selectedRecord.basic + (selectedRecord.allowance || 0) + (selectedRecord.bonus || 0) + (selectedRecord.overtimeAmount || 0)), selectedRecord.currency)}</span>
                    </div>
                  </div>

                  {/* Deductions */}
                  <div className="space-y-1 text-xs">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase border-b pb-1 border-slate-100 dark:border-slate-800">Withholding / Deductions</h4>
                    {selectedRecord.items && selectedRecord.items.length > 0 ? (
                      selectedRecord.items
                        .filter(item => item.type === 'Deduction')
                        .map((item, idx) => (
                          <div key={idx} className={`flex justify-between py-1 ${item.code === 'LOP_DEDUCT' ? 'text-rose-600 font-medium' : 'text-slate-600 dark:text-slate-300'}`}>
                            <span>{item.name}</span>
                            <span>{formatCurrency(item.amount, selectedRecord.currency)}</span>
                          </div>
                        ))
                    ) : (
                      <>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Income Tax</span>
                          <span>{formatCurrency(selectedRecord.tax, selectedRecord.currency)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Provident Fund</span>
                          <span>{formatCurrency(selectedRecord.pf, selectedRecord.currency)}</span>
                        </div>
                        {selectedRecord.lopDeductionAmount > 0 && (
                          <div className="flex justify-between py-1 text-rose-600 dark:text-rose-400 font-medium">
                            <span>Loss of Pay (LOP)</span>
                            <span>{formatCurrency(selectedRecord.lopDeductionAmount, selectedRecord.currency)}</span>
                          </div>
                        )}
                      </>
                    )}
                    <div className="flex justify-between py-1.5 font-bold border-t border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-100">
                      <span>Total Withheld</span>
                      <span>{formatCurrency(selectedRecord.totalDeductions || selectedRecord.deductions, selectedRecord.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Total Summary */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Net Salary Payable</span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{formatCurrency(selectedRecord.net, selectedRecord.currency)}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedRecord.status === 'Paid' || selectedRecord.status === 'Processed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>{selectedRecord.status}</span>
                  </div>
                </div>

                {/* Footer terms */}
                <div className="text-center text-[9px] text-slate-400 mt-6 border-t pt-4 border-slate-100 dark:border-slate-800">
                  <p>This is a computer-generated document and does not require a physical signature.</p>
                  <p className="mt-0.5">{appSettings?.general?.companyName || 'GlobalTech Solutions'} Payroll Processing Service Platform. Confidential. © {new Date().getFullYear()}</p>
                </div>
              </div>

              {/* Action Buttons in Modal footer */}
              <div className="flex gap-2 pt-4 border-t dark:border-slate-850 mt-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} /> Print / PDF
                </button>
                <button
                  onClick={() => downloadPayslip(selectedRecord)}
                  className="flex-1 btn-primary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Download size={13} /> Download PDF
                </button>
                <button
                  onClick={() => setShowPayslipModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs py-2 font-bold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PayrollCenter;
