import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { usePayroll } from '../../features/payroll/PayrollContext';
import { useCurrency } from '../../hooks/useCurrency';
import { PageHeader } from '../../shared/components/layout/PageHeader';
import {
  CreditCard,
  BarChart2,
  TrendingUp,
  TrendingDown,
  Download,
  Search,
  Plus,
  Trash2,
  Edit2,
  Eye,
  Check,
  X,
  Settings,
  DollarSign,
  AlertCircle,
  Calendar,
  Users,
  Printer,
  Mail,
  FileText,
  CheckCircle,
  XCircle,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';

// --- Toast helper ---
const toast = (message, type = 'success') =>
  window.dispatchEvent(new CustomEvent('app_toast', { detail: { message, type } }));

// --- Page layout animation variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

const PayrollCenter = () => {
  const { users, departments } = useSuperAdmin();
  const { formatCurrency, getSymbol, convertAmount } = useCurrency();
  const {
    payrollHistory,
    payrollSettings,
    updatePayrollSettings,
    addPayrollRecord,
    updatePayrollRecord,
    deletePayrollRecord,
    bulkApprovePayroll
  } = usePayroll();

  // --- Search & Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);

  // --- Pagination & Sorting ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [sortField, setSortField] = useState('month');
  const [sortDirection, setSortDirection] = useState('desc');

  // --- Modal & Drawer States ---
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [generateMonth, setGenerateMonth] = useState(() => new Date().toLocaleString('default', { month: 'long' }));
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);

  // Print reference for payslip print action
  const payslipPrintRef = useRef();

  // --- Policy/Settings form state ---
  const [settingsForm, setSettingsForm] = useState({
    taxRate: 10,
    pfRate: 12,
    baseSalaries: { superuser: 8000, admin: 6500, hr: 5500, manager: 6000, employee: 5000 },
    allowances: { superuser: 2000, admin: 1500, hr: 1200, manager: 1300, employee: 1000 }
  });

  useEffect(() => {
    if (payrollSettings) {
      setSettingsForm(payrollSettings);
    }
  }, [payrollSettings]);

  // --- Get unique months for filter ---
  const uniqueMonths = useMemo(() => {
    const months = new Set(payrollHistory.map(p => p.month));
    // Ensure current month is selectable
    months.add(new Date().toLocaleString('default', { month: 'long' }));
    return Array.from(months).sort().reverse();
  }, [payrollHistory]);

  // --- Filtered and sorted payroll records ---
  const combinedPayroll = useMemo(() => {
    const existing = [...payrollHistory];
    const currentMonth = monthFilter === 'all' ? new Date().toLocaleString('default', { month: 'long' }) : monthFilter;

    const ungeneratedUsers = (users || []).filter(u => {
      const roleStr = (u.role || '').toLowerCase();
      if (roleStr === 'superadmin' || roleStr === 'candidate') return false;
      if (!u.profileId) return false;
      return !payrollHistory.some(p => p.employeeId === u.profileId && p.month === currentMonth);
    });

    const ungeneratedPayslips = ungeneratedUsers.map(u => {
      const roleStr = (u.role || 'employee').toLowerCase();
      const basic = u.baseSalary || payrollSettings?.baseSalaries?.[roleStr] || 5000;
      const allowance = payrollSettings?.allowances?.[roleStr] || 1000;
      const taxRate = payrollSettings?.taxRate || 10;
      const pfRate = payrollSettings?.pfRate || 12;
      const tax = Math.round((basic * taxRate) / 100);
      const pf = Math.round((basic * pfRate) / 100);
      const deductions = tax + pf;
      
      return {
        id: `unprocessed-${u.id}`,
        employeeId: u.profileId,
        employeeName: u.name,
        department: typeof u.department === 'string' ? u.department : (u.department?.name || 'N/A'),
        designation: u.role,
        basic,
        allowance,
        bonus: 0,
        pf,
        tax,
        deductions,
        net: (basic + allowance) - deductions,
        month: currentMonth,
        status: 'Unprocessed'
      };
    });

    return [...existing, ...ungeneratedPayslips];
  }, [payrollHistory, users, monthFilter]);

  const filteredRecords = useMemo(() => {
    return combinedPayroll
      .filter(p => {
        const matchesSearch =
          p.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.designation || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesMonth = monthFilter === 'all' || p.month === monthFilter;
        const matchesDept = deptFilter === 'all' || p.department === deptFilter;
        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        return matchesSearch && matchesMonth && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];
        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? valA.localeCompare(valB)
            : valB.localeCompare(valA);
        }
        return sortDirection === 'asc' ? valA - valB : valB - valA;
      });
  }, [combinedPayroll, searchTerm, monthFilter, deptFilter, statusFilter, sortField, sortDirection]);

  // --- Pagination logic ---
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(start, start + itemsPerPage);
  }, [filteredRecords, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, monthFilter, deptFilter, statusFilter]);

  // --- 6 Compact KPI Card metrics derived from filtered records ---
  const kpis = useMemo(() => {
    const totalPayroll = filteredRecords.reduce((sum, p) => sum + convertAmount(p.net || 0, p.currency), 0);
    const employeesPaid = filteredRecords.filter(p => p.status === 'Paid').length;
    const pendingPayroll = filteredRecords.filter(p => ['Draft', 'Pending', 'Processing', 'Approved'].includes(p.status)).length;
    const avgSalary = filteredRecords.length ? totalPayroll / filteredRecords.length : 0;

    // Total deductions = tax
    const totalDeductions = filteredRecords.reduce((sum, p) => sum + convertAmount(p.tax || 0, p.currency), 0);
    const grossPayroll = filteredRecords.reduce((sum, p) => sum + convertAmount((p.basic || 0) + (p.allowance || 0) + (p.bonus || 0), p.currency), 0);

    return {
      totalPayroll,
      employeesPaid,
      pendingPayroll,
      avgSalary,
      totalDeductions,
      grossPayroll
    };
  }, [filteredRecords]);

  // --- Dynamic calculation handler (when generating payroll) ---
  const handleProceedGenerate = async () => {
    const res = await generatePayroll(generateMonth);
    
    if (res) {
      if (res.newlyGenerated > 0) {
        toast(`Generated payroll for ${res.newlyGenerated} employees for ${generateMonth}`, 'success');
      }
      if (res.skipped > 0) {
        toast(`Skipped ${res.skipped} employees who already had payroll generated.`, 'info');
      }
      if (res.newlyGenerated === 0 && res.skipped === 0) {
        toast('No employees found to generate payroll.', 'warning');
      }
    } else {
      toast('Failed to generate payroll.', 'error');
    }
    setShowGenerateModal(false);
  };

  // --- Bulk approval ---
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) {
      toast('Please select at least one payroll record', 'warning');
      return;
    }
    const success = await bulkApprovePayroll(selectedIds);
    if (success) {
      toast(`Successfully approved ${selectedIds.length} payroll records`, 'success');
      setSelectedIds([]);
    } else {
      toast('Failed to approve payroll records', 'error');
    }
  };

  // --- Single record actions ---
  const handleQuickStatusChange = async (id, newStatus) => {
    const success = await updatePayrollRecord(id, { status: newStatus });
    if (success) {
      toast(`Record status updated to ${newStatus}`, 'success');
    } else {
      toast('Failed to update status', 'error');
    }
  };

  const handleEditRecord = (record) => {
    setEditingRecord({ ...record });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const basic = parseFloat(editingRecord.basic) || 0;
    const allowance = parseFloat(editingRecord.allowance) || 0;
    const bonus = parseFloat(editingRecord.bonus) || 0;

    const deductions = parseFloat(editingRecord.deductions) || 0;
 
    const pf = Math.round(deductions * 0.4);
    const tax = Math.round(deductions * 0.6) + Math.round(basic * 0.12);
    const net = Math.max(0, basic + allowance + bonus - pf - tax);
 
    const success = await updatePayrollRecord(editingRecord.id, {
      basic,
      allowance,
      bonus,
      pf,
      tax,
      netPay: net, // use netPay for backend
      status: editingRecord.status
    });

    if (success) {
      toast('Payroll record updated successfully', 'success');
      setShowEditModal(false);
      setEditingRecord(null);
    } else {
      toast('Failed to update payroll record', 'error');
    }
  };

  const handleDeleteRecord = async (record) => {
    if (record.status === 'Unprocessed') {
      toast('Cannot delete an unprocessed payroll record.', 'warning');
      return;
    }
    setRecordToDelete(record);
  };

  const handleConfirmDelete = async () => {
    if (recordToDelete) {
      const success = await deletePayrollRecord(recordToDelete.id);
      if (success) {
        toast('Payroll record deleted', 'success');
      } else {
        toast('Failed to delete payroll record', 'error');
      }
      setRecordToDelete(null);
    }
  };

  // --- Save settings/policy handler ---
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const success = await updatePayrollSettings(settingsForm);
    if (success) {
      toast('Payroll policies updated successfully', 'success');
      setShowSettingsModal(false);
    } else {
      toast('Failed to update payroll policies', 'error');
    }
  };

  // --- CSV Export ---
  const handleExport = () => {
    const headers = ['Employee ID', 'Employee Name', 'Department', 'Designation', 'Basic Salary', 'Allowances', 'Bonus', 'PF', 'Tax', 'Unpaid Deductions', 'Net Salary', 'Month', 'Status'].join(',');
    const rows = filteredRecords.map(p => [
      `"${p.employeeId}"`,
      `"${p.employeeName}"`,
      `"${p.department}"`,
      `"${p.designation}"`,
      `"${p.basic}"`,
      `"${p.allowance}"`,
      `"${p.bonus}"`,
      `"${p.pf}"`,
      `"${p.tax}"`,
      `"${p.deductions}"`,
      `"${p.net}"`,
      `"${p.month}"`,
      `"${p.status}"`
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `hcm_payroll_report_${monthFilter === 'all' ? 'all' : monthFilter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Payroll data exported successfully');
  };

  // --- Print Payslip stub ---
  const handlePrintPayslip = () => {
    window.print();
  };

  const handleEmailPayslip = () => {
    toast(`Payslip emailed successfully to ${selectedRecord?.employeeName.toLowerCase().replace(' ', '')}@hcm.ai`, 'success');
  };

  // --- Toggle select all checkbox ---
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(paginatedRecords.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // --- SVG Analytics calculations ---
  const analyticsData = useMemo(() => {
    // 1. Monthly trend (last 5 months in uniqueMonths)
    const sortedMonths = [...uniqueMonths].reverse().slice(-5);
    const monthlyTotals = sortedMonths.map(m => {
      const total = payrollHistory.filter(p => p.month === m).reduce((sum, p) => sum + p.net, 0);
      return { month: m, total };
    });

    // 2. Department Cost
    const deptMap = {};
    payrollHistory.forEach(p => {
      if (monthFilter === 'all' || p.month === monthFilter) {
        deptMap[p.department] = (deptMap[p.department] || 0) + p.net;
      }
    });
    const deptCosts = Object.entries(deptMap).map(([name, cost]) => ({ name, cost }));

    // 3. Paid vs Pending
    const paid = payrollHistory.filter(p => (monthFilter === 'all' || p.month === monthFilter) && p.status === 'Paid').reduce((sum, p) => sum + p.net, 0);
    const pending = payrollHistory.filter(p => (monthFilter === 'all' || p.month === monthFilter) && p.status !== 'Paid').reduce((sum, p) => sum + p.net, 0);

    return {
      monthlyTotals,
      deptCosts,
      paid,
      pending
    };
  }, [payrollHistory, uniqueMonths, monthFilter]);

  return (
    <motion.div
      className="space-y-6 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Page Header ── */}
      <motion.div variants={itemVariants}>
        <PageHeader
          icon={CreditCard}
          title="Payroll Management"
          subtitle={`Platform Enterprise Payroll Console • Selected Month: ${monthFilter === 'all' ? 'All Months' : monthFilter}`}
        />
      </motion.div>

      {/* ── KPI Row Section ── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"
      >
        {[
          { label: 'Payroll cost', value: formatCurrency(kpis.totalPayroll), sub: 'Approved/Paid net', icon: DollarSign, color: 'from-primary-500 to-indigo-600', text: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-950/20', border: 'border-primary-100 dark:border-primary-900/30' },
          { label: 'Employees Paid', value: kpis.employeesPaid, sub: 'Marked as Paid', icon: Users, color: 'from-emerald-500 to-teal-600', text: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-100 dark:border-emerald-900/30' },
          { label: 'Pending Runs', value: kpis.pendingPayroll, sub: 'Needs approval/payout', icon: AlertCircle, color: 'from-amber-500 to-orange-600', text: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-100 dark:border-amber-900/30' },
          { label: 'Average Salary', value: formatCurrency(Math.round(kpis.avgSalary)), sub: 'Per employee', icon: TrendingUp, color: 'from-violet-500 to-purple-600', text: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/20', border: 'border-purple-100 dark:border-purple-900/30' },
          { label: 'Total Deductions', value: formatCurrency(kpis.totalDeductions), sub: 'Tax + PF withheld', icon: TrendingDown, color: 'from-rose-500 to-pink-650', text: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-100 dark:border-rose-900/30' },
          { label: 'Gross Payroll', value: formatCurrency(kpis.grossPayroll), sub: 'Before withholding', icon: DollarSign, color: 'from-sky-500 to-blue-600', text: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-100 dark:border-sky-900/30' }
        ].map((k, idx) => {
          const IconComp = k.icon;
          return (
            <div
              key={idx}
              className={`bg-white dark:bg-slate-900 rounded-xl border ${k.border} shadow-sm overflow-hidden p-3.5 flex flex-col justify-between h-28 relative group`}
            >
              <div className="flex justify-between items-start">
                <div className={`w-8 h-8 rounded-lg ${k.bg} flex items-center justify-center shrink-0`}>
                  <IconComp size={15} className={k.text} />
                </div>
                <span className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{k.label}</span>
              </div>
              <div className="mt-2 text-left">
                <h3 className="text-xl font-black text-slate-800 dark:text-white leading-none tracking-tight">{k.value}</h3>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 truncate">{k.sub}</p>
              </div>
              <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${k.color} opacity-0 group-hover:opacity-100 transition-opacity`} />
            </div>
          );
        })}
      </motion.div>

      {/* ── Filters & Actions Toolbar ── */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          {/* Month Filter */}
          <div>
            <select
              value={monthFilter}
              onChange={e => setMonthFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Months</option>
              {uniqueMonths.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Department Filter */}
          <div>
            <select
              value={deptFilter}
              onChange={e => setDeptFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Depts</option>
              {departments.map(d => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500 text-slate-700 dark:text-slate-300"
            >
              <option value="all">All Statuses</option>
              {['Draft', 'Pending', 'Processing', 'Approved', 'Paid', 'Rejected'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search employee…"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-8 pr-2.5 py-2 w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold focus:outline-none focus:border-primary-500 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex gap-2 w-full md:w-auto justify-end">
          <button
            onClick={handleBulkApprove}
            disabled={selectedIds.length === 0}
            className="btn-primary text-xs px-3 py-2 flex items-center gap-1 disabled:opacity-50 disabled:pointer-events-none"
          >
            <Check size={14} /> Bulk Approve ({selectedIds.length})
          </button>
          <button
            onClick={handleExport}
            className="btn-secondary text-xs px-3 py-2 flex items-center gap-1"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </motion.div>

      {/* ── Table & Analytics Layout ── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 xl:grid-cols-4 gap-6"
      >
        {/* Payroll list (takes 3 cols on desktop) */}
        <div className="xl:col-span-3 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/60 shadow-soft overflow-hidden">
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 font-bold">
                    <th className="p-3 pl-4 w-10">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        onChange={handleSelectAll}
                        checked={paginatedRecords.length > 0 && selectedIds.length === paginatedRecords.length}
                      />
                    </th>
                    <th className="p-3 cursor-pointer" onClick={() => { setSortField('employeeId'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>ID</th>
                    <th className="p-3 cursor-pointer" onClick={() => { setSortField('employeeName'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>Name</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Basic</th>
                    <th className="p-3">Allowances</th>
                    <th className="p-3">Deductions</th>
                    <th className="p-3 cursor-pointer" onClick={() => { setSortField('net'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>Net Salary</th>
                    <th className="p-3">Month</th>
                    <th className="p-3 cursor-pointer" onClick={() => { setSortField('status'); setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc'); }}>Status</th>
                    <th className="p-3 text-right pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {paginatedRecords.length > 0 ? (
                    paginatedRecords.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors text-xs">
                        <td className="p-3 pl-4">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                            checked={selectedIds.includes(p.id)}
                            onChange={() => handleSelectOne(p.id)}
                          />
                        </td>
                        <td className="p-3 font-mono text-slate-400">{p.displayId || p.employeeId}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-slate-200">{p.employeeName}</td>
                        <td className="p-3 text-slate-500">{p.department}</td>
                        <td className="p-3 font-medium">{formatCurrency(p.basic, p.currency)}</td>
                        <td className="p-3 text-slate-500">{formatCurrency(p.allowance + p.bonus, p.currency)}</td>
                        <td className="p-3 text-rose-500">{formatCurrency(p.deductions || 0, p.currency)}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-white">{formatCurrency(p.net, p.currency)}</td>
                        <td className="p-3 text-slate-400 font-medium">{p.month}</td>
                        <td className="p-3">
                          <select
                            value={p.status}
                            onChange={(e) => handleQuickStatusChange(p.id, e.target.value)}
                            className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider outline-none border border-transparent ${p.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/30' :
                                p.status === 'Approved' ? 'bg-primary-50 dark:bg-primary-950/20 text-primary-600 border-primary-100 dark:border-primary-900/30' :
                                  p.status === 'Processing' ? 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 border-indigo-100 dark:border-indigo-900/30' :
                                    p.status === 'Pending' ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-100 dark:border-amber-900/30' :
                                      p.status === 'Rejected' ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border-rose-100 dark:border-rose-900/30' :
                                        'bg-slate-50 dark:bg-slate-850 text-slate-500 border-slate-200 dark:border-slate-700'
                              }`}
                          >
                            {['Draft', 'Pending', 'Processing', 'Approved', 'Paid', 'Rejected'].map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-3 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedRecord(p); setShowPayslipModal(true); }}
                              className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 rounded transition-colors"
                              title="View Payslip"
                            >
                              <Eye size={14} />
                            </button>
                            {p.status !== 'Paid' && (
                              <button
                                onClick={() => handleQuickStatusChange(p.id, 'Paid')}
                                className="p-1 text-slate-400 hover:text-emerald-500 rounded transition-colors"
                                title="Mark Paid"
                              >
                                <Check size={14} />
                              </button>
                            )}
                            <ActionDropdown
                              actions={[
                                { label: 'Edit Record', icon: Edit2, onClick: () => handleEditRecord(p) },
                                { label: 'Delete Record', icon: Trash2, danger: true, onClick: () => handleDeleteRecord(p) }
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="p-8 text-center text-slate-400 font-medium text-xs">
                        No payroll records matching your filters found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Grid View (screens < 768px) */}
            <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map(p => (
                  <div key={p.id} className="p-4 space-y-3 text-xs text-left">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">{p.employeeName}</h4>
                        <span className="text-[10px] text-slate-400 font-mono">{p.displayId || p.employeeId} • {p.department}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${p.status === 'Paid' ? 'bg-emerald-100 dark:bg-emerald-950/20 text-emerald-700' :
                          p.status === 'Approved' ? 'bg-primary-100 dark:bg-primary-950/20 text-primary-700' :
                            p.status === 'Pending' ? 'bg-amber-100 dark:bg-amber-950/20 text-amber-700' :
                              'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>{p.status}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-y border-slate-50 dark:border-slate-800/60 py-2 text-[11px]">
                      <div>Basic: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(p.basic, p.currency)}</strong></div>
                      <div>Allow: <strong className="text-slate-700 dark:text-slate-300">{formatCurrency(p.allowance + p.bonus, p.currency)}</strong></div>
                      <div>Net: <strong className="text-slate-900 dark:text-white font-bold">{formatCurrency(p.net, p.currency)}</strong></div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] text-slate-400 font-bold font-bold">{p.month}</span>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => { setSelectedRecord(p); setShowPayslipModal(true); }}
                          className="px-2.5 py-1 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-lg font-bold text-[10px]"
                        >
                          Payslip
                        </button>
                        <ActionDropdown
                          actions={[
                            { label: 'Edit Record', icon: Edit2, onClick: () => handleEditRecord(p) },
                            { label: 'Delete Record', icon: Trash2, danger: true, onClick: () => handleDeleteRecord(p) }
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-400 font-medium">
                  No records found.
                </div>
              )}
            </div>
          </div>

          {/* Table pagination navigation */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Page {currentPage} of {totalPages}</span>
              <div className="flex gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Prev
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Analytics & Cost breakdown widgets (takes 1 col on desktop) */}
        <div className="space-y-4 text-left">
          {/* Monthly Trend SVG sparkline */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <BarChart2 size={13} className="text-primary-600" />
              Payroll Trend
            </h3>
            <div className="h-24 w-full flex items-end justify-center mb-2">
              <svg viewBox="0 0 200 80" className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* SVG sparkline path */}
                {analyticsData.monthlyTotals.length > 1 && (
                  <>
                    <path
                      d={`M ${analyticsData.monthlyTotals.map((t, i) => {
                        const maxVal = Math.max(...analyticsData.monthlyTotals.map(x => x.total), 1);
                        const x = (i / (analyticsData.monthlyTotals.length - 1)) * 180 + 10;
                        const y = 70 - (t.total / maxVal) * 50;
                        return `${x} ${y}`;
                      }).join(' L ')}`}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M 10 70 L ${analyticsData.monthlyTotals.map((t, i) => {
                        const maxVal = Math.max(...analyticsData.monthlyTotals.map(x => x.total), 1);
                        const x = (i / (analyticsData.monthlyTotals.length - 1)) * 180 + 10;
                        const y = 70 - (t.total / maxVal) * 50;
                        return `${x} ${y}`;
                      }).join(' L ')} L 190 70 Z`}
                      fill="url(#trendGrad)"
                    />
                    {analyticsData.monthlyTotals.map((t, i) => {
                      const maxVal = Math.max(...analyticsData.monthlyTotals.map(x => x.total), 1);
                      const x = (i / (analyticsData.monthlyTotals.length - 1)) * 180 + 10;
                      const y = 70 - (t.total / maxVal) * 50;
                      return (
                        <g key={i} className="group cursor-pointer">
                          <circle cx={x} cy={y} r="3" fill="#4f46e5" className="hover:r-5 transition-all" />
                        </g>
                      );
                    })}
                  </>
                )}
              </svg>
            </div>
            <div className="flex justify-between text-[8px] font-bold text-slate-400 font-bold">
              {analyticsData.monthlyTotals.map((t, i) => (
                <span key={i}>{t.month}</span>
              ))}
            </div>
          </div>

          {/* Department cost distribution */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <Users size={13} className="text-emerald-500" />
              Dept Cost Share
            </h3>
            <div className="space-y-3">
              {analyticsData.deptCosts.length > 0 ? (
                analyticsData.deptCosts.slice(0, 4).map((d, i) => {
                  const maxCost = Math.max(...analyticsData.deptCosts.map(x => x.cost), 1);
                  const pct = Math.round((d.cost / maxCost) * 100);
                  const colors = ['bg-primary-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500'];
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        <span className="truncate">{d.name}</span>
                        <span>{getSymbol()}{d.cost.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${colors[i % 4]} rounded-full`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-[10px] text-slate-400 text-center py-2">No payroll cost records found.</p>
              )}
            </div>
          </div>

          {/* Paid vs Pending distribution segment */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800/60 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-1.5">
              <AlertCircle size={13} className="text-purple-500" />
              Paid vs Pending
            </h3>
            <div className="flex gap-2 items-center mb-3">
              <div className="flex-1 text-center">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Paid</span>
                <span className="text-sm font-bold text-emerald-600">{getSymbol()}{analyticsData.paid.toLocaleString()}</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div className="flex-1 text-center">
                <span className="text-[9px] font-bold text-slate-400 block uppercase">Pending</span>
                <span className="text-sm font-black text-amber-500">{getSymbol()}{analyticsData.pending.toLocaleString()}</span>
              </div>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full flex overflow-hidden">
              {analyticsData.paid + analyticsData.pending > 0 ? (
                <>
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(analyticsData.paid / (analyticsData.paid + analyticsData.pending)) * 100}%` }}
                    title="Paid"
                  />
                  <div
                    className="h-full bg-amber-400"
                    style={{ width: `${(analyticsData.pending / (analyticsData.paid + analyticsData.pending)) * 100}%` }}
                    title="Pending"
                  />
                </>
              ) : (
                <div className="h-full bg-slate-300 dark:bg-slate-700 w-full" />
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Generate Monthly Payroll Modal ── */}
      <AnimatePresence>
        {showGenerateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left"
            >
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100 mb-2">Run Monthly Payroll Engine</h3>
              <p className="text-xs text-slate-400 mb-4">Select the calendar month to generate payroll records. The calculations will automatically query active employees, leaves, attendance entries, and active benefit configurations.</p>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Target Month</label>
                  <input
                    type="month"
                    value={generateMonth}
                    onChange={e => setGenerateMonth(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-200"
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    onClick={() => setShowGenerateModal(false)}
                    className="flex-1 btn-secondary py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProceedGenerate}
                    className="flex-1 btn-primary py-2 text-xs flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle size={14} /> Proceed
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── SuperAdmin Policy/Settings Modal ── */}
      <AnimatePresence>
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left"
            >
              <button
                onClick={() => setShowSettingsModal(false)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>

              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Payroll Configurations</h3>
              <p className="text-xs text-slate-400 mb-5">Manage taxes, retirement funds (PF) withholding rates, and base salary slabs per role.</p>

              <form onSubmit={handleSaveSettings} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 font-bold block mb-1">Income Tax Rate (%)</label>
                    <input
                      type="number"
                      required
                      value={settingsForm.taxRate}
                      onChange={e => setSettingsForm({ ...settingsForm, taxRate: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-bold border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">PF Withholding (%)</label>
                    <input
                      type="number"
                      required
                      value={settingsForm.pfRate}
                      onChange={e => setSettingsForm({ ...settingsForm, pfRate: parseInt(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 border-b pb-1">Base Salaries per Role</h4>
                  <div className="grid grid-cols-2 gap-3 max-h-36 overflow-y-auto pr-1">
                    {Object.keys(settingsForm.baseSalaries).map(role => (
                      <div key={role} className="flex flex-col gap-1">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">{role}</span>
                        <input
                          type="number"
                          value={settingsForm.baseSalaries[role]}
                          onChange={e => {
                            const salaries = { ...settingsForm.baseSalaries, [role]: parseInt(e.target.value) || 0 };
                            setSettingsForm({ ...settingsForm, baseSalaries: salaries });
                          }}
                          className="bg-slate-50 dark:bg-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-medium border border-slate-200 dark:border-slate-700 outline-none text-slate-700 dark:text-slate-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-3 border-t dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowSettingsModal(false)}
                    className="flex-1 btn-secondary py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-2 text-xs"
                  >
                    Save Policies
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Edit single record details Modal ── */}
      <AnimatePresence>
        {showEditModal && editingRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left"
            >
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-1">Edit Payroll: {editingRecord.employeeName}</h3>
              <p className="text-xs text-slate-400 mb-4">Edit basic salary, allowances, custom deductions, or status.</p>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 font-bold block mb-1">Basic Salary ({getSymbol()})</label>
                    <input
                      type="number"
                      required
                      value={editingRecord.basic}
                      onChange={e => setEditingRecord({ ...editingRecord, basic: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-bold border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Allowances ({getSymbol()})</label>
                    <input
                      type="number"
                      value={editingRecord.allowance}
                      onChange={e => setEditingRecord({ ...editingRecord, allowance: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Bonus ({getSymbol()})</label>
                    <input
                      type="number"
                      value={editingRecord.bonus}
                      onChange={e => setEditingRecord({ ...editingRecord, bonus: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Unpaid Deductions ({getSymbol()})</label>
                    <input
                      type="number"
                      value={editingRecord.deductions}
                      onChange={e => setEditingRecord({ ...editingRecord, deductions: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 outline-none text-slate-800 dark:text-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Payroll Status</label>
                  <select
                    value={editingRecord.status}
                    onChange={e => setEditingRecord({ ...editingRecord, status: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3 py-2 text-xs font-semibold border border-slate-200 dark:border-slate-700 outline-none text-slate-850 dark:text-slate-200"
                  >
                    {['Draft', 'Pending', 'Processing', 'Approved', 'Paid', 'Rejected'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 btn-secondary py-2 text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-2 text-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Payslip Management Modal (View Details, Print, Email) ── */}
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
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white font-bold">GlobalTech Solutions</h2>
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
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.name}</p>
                    <p className="text-slate-400 font-mono mt-0.5">{selectedRecord.employeeId}</p>
                    <p className="text-slate-500 mt-0.5">{selectedRecord.designation || 'Employee'} • {selectedRecord.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Summary</p>
                    <p className="text-slate-600 dark:text-slate-400">Working Days: <strong>{selectedRecord.totalWorkingDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Days Present: <strong>{selectedRecord.presentDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Paid Leaves: <strong>{selectedRecord.paidLeaveDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">LOP Days: <strong>{selectedRecord.unpaidLeaveDays ?? 0}</strong></p>
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
                          <span>{formatCurrency(selectedRecord.allowance || 0 + selectedRecord.bonus || 0, selectedRecord.currency)}</span>
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
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${selectedRecord.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>{selectedRecord.status}</span>
                  </div>
                </div>

                {/* Footer terms */}
                <div className="text-center text-[9px] text-slate-400 mt-6 border-t pt-4 border-slate-100 dark:border-slate-800">
                  <p>This is a computer-generated document and does not require a physical signature.</p>
                  <p className="mt-0.5">GlobalTech Solutions Payroll Processing Service Platform. Confidential. © {new Date().getFullYear()}</p>
                </div>
              </div>

              {/* Action Buttons in Modal footer */}
              <div className="flex gap-2 pt-4 border-t dark:border-slate-850 mt-4">
                <button
                  onClick={handlePrintPayslip}
                  className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Printer size={13} /> Print / PDF
                </button>
                <button
                  onClick={handleEmailPayslip}
                  className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Mail size={13} /> Email Payslip
                </button>
                <button
                  onClick={() => setShowPayslipModal(false)}
                  className="px-6 btn-primary text-xs py-2"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        isOpen={!!recordToDelete}
        onClose={() => setRecordToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Payroll Record"
        message={`Are you sure you want to delete the payroll record for ${recordToDelete?.employeeName}? This action cannot be undone.`}
      />
    </motion.div>
  );
};

export default PayrollCenter;
