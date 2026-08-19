import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  Users,
  Calendar,
  CheckCircle2,
  Lock,
  Play,
  Sparkles,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  RefreshCw,
  Clock
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import PageHeader from '../../shared/components/ui/PageHeader';
import StatCard from '../../shared/components/ui/StatCard';
import EmptyState from '../../shared/components/ui/EmptyState';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import api from '../../utils/apiService';

const PayrollOperations = () => {
  const { employees = [], getPayrollSnapshots, runPayrollBatch, finalizePayroll, showToast } = useHR();
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Run Payroll State
  const [runMonth, setRunMonth] = useState(() => new Date().toISOString().slice(0, 7));
  const [selectedEmpId, setSelectedEmpId] = useState('');
  const [isRunning, setIsRunning] = useState(false);

  // Finalize Confirm Modal State
  const [snapshotToFinalize, setSnapshotToFinalize] = useState(null);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const fetchSnapshots = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/hr/payroll/snapshots');
      setSnapshots(res.data?.data || res.data || []);
    } catch (err) {
      console.error('Failed to load payroll snapshots:', err);
      setError(err.response?.data?.message || 'Failed to load payroll snapshots. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const totalDisbursed = snapshots.reduce((acc, s) => acc + (s.netSalary || s.netPay || 0), 0);
    const draftCount = snapshots.filter(s => s.status === 'Draft' || s.status === 'Pending').length;
    const finalizedCount = snapshots.filter(s => s.status === 'Paid' || s.status === 'Finalized').length;

    return [
      { label: 'Total Snapshots', value: snapshots.length.toString(), icon: FileSpreadsheet, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-950/20' },
      { label: 'Draft Snapshots', value: draftCount.toString(), icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/20' },
      { label: 'Finalized & Locked', value: finalizedCount.toString(), icon: Lock, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
      { label: 'Total Disbursed', value: formatCurrency(totalDisbursed), icon: DollarSign, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/20' },
    ];
  }, [snapshots, formatCurrency]);

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    if (!runMonth) {
      showToast('Please select a valid payroll month (YYYY-MM).', 'error');
      return;
    }

    setIsRunning(true);
    try {
      let targetEmpIds = [];
      if (selectedEmpId) {
        targetEmpIds = [selectedEmpId];
      } else {
        targetEmpIds = employees.map(emp => emp.id);
      }

      if (targetEmpIds.length === 0) {
        showToast('No active employees found to generate payroll.', 'error');
        setIsRunning(false);
        return;
      }

      await runPayrollBatch({ employeeIds: targetEmpIds, month: runMonth });
      await fetchSnapshots();
      showToast(`Payroll generated for ${targetEmpIds.length} employee(s) for period ${runMonth}!`, 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleConfirmFinalize = async () => {
    if (!snapshotToFinalize) return;
    setIsFinalizing(true);
    try {
      await finalizePayroll(snapshotToFinalize.id);
      setSnapshotToFinalize(null);
      await fetchSnapshots();
    } catch (err) {
      console.error(err);
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">HR Payroll Operations</h1>
          <p className="hcm-page-subtitle">Calculate monthly compensation, review salary breakdowns, and finalize locked payslips</p>
        </div>
        <button
          onClick={fetchSnapshots}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Stats Section */}
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

      {/* Error Retry Banner */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-bold">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
          <button onClick={fetchSnapshots} className="px-3 py-1 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors">
            Retry
          </button>
        </div>
      )}

      {/* Main Grid: Form + Snapshots List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Run Payroll Form Card */}
        <div className="lg:col-span-4 card p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 space-y-6">
          <div>
            <h3 className="hcm-section-heading flex items-center gap-2">
              <Play size={18} className="text-primary-600" />
              Generate Payroll Batch
            </h3>
            <p className="hcm-muted-text mt-1">Run automated backend CTC formulas and deduction rules</p>
          </div>

          <form onSubmit={handleRunPayroll} className="space-y-4">
            <div>
              <label className="form-label">Payroll Period (Month)</label>
              <input
                type="month"
                required
                className="input-field h-11"
                value={runMonth}
                onChange={e => setRunMonth(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Target Employee (Optional)</label>
              <select
                className="input-field h-11 dark:bg-slate-900"
                value={selectedEmpId}
                onChange={e => setSelectedEmpId(e.target.value)}
              >
                <option value="">All Direct & Org Employees ({employees.length})</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.fullName || emp.name} ({emp.employeeId || 'EMP'})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={isRunning}
              className="w-full btn-primary py-3 flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary-500/20 active:scale-95"
            >
              {isRunning ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Processing Calculations...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>{selectedEmpId ? 'Generate Employee Payroll' : 'Run Org-Wide Payroll Batch'}</span>
                </>
              )}
            </button>
          </form>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
            <p className="font-bold text-slate-700 dark:text-slate-200">System Payroll Safeguards:</p>
            <p>• Duplicate payroll runs for identical periods are automatically blocked.</p>
            <p>• All net pay, taxes, and contributions are calculated on the secure backend server.</p>
            <p>• Finalizing locks the payroll record and generates permanent payslip records.</p>
          </div>
        </div>

        {/* Snapshots Table Card */}
        <div className="lg:col-span-8 card p-0 border-none bg-white dark:bg-slate-900 shadow-soft overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <h3 className="hcm-section-heading">Recent Payroll Snapshots</h3>
            <span className="text-xs font-bold text-slate-400">{snapshots.length} total records</span>
          </div>

          {loading ? (
            <div className="p-16 flex flex-col items-center justify-center text-slate-400">
              <Loader2 size={32} className="animate-spin mb-3 text-primary-600" />
              <p className="text-xs font-bold">Loading payroll snapshots...</p>
            </div>
          ) : snapshots.length === 0 ? (
            <EmptyState
              icon={FileSpreadsheet}
              title="No Payroll Snapshots Generated"
              description="Use the Generate Payroll batch tool to execute monthly salary calculations for your organization."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Employee</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Period</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Salary</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Net Pay</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {snapshots.map(s => {
                    const isFinalized = s.status === 'Paid' || s.status === 'Finalized';
                    const empName = s.employee?.fullName || 'Employee';
                    const empCode = s.employee?.employeeId || s.employeeId || 'EMP';
                    const gross = s.grossSalary || s.grossPay || 0;
                    const net = s.netSalary || s.netPay || 0;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{empName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{empCode}</p>
                        </td>
                        <td className="px-6 py-4 text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          {s.month}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {formatCurrency(gross)}
                        </td>
                        <td className="px-6 py-4 text-xs font-black text-indigo-600 dark:text-indigo-400">
                          {formatCurrency(net)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border inline-flex items-center gap-1",
                              isFinalized
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800"
                            )}
                          >
                            {isFinalized ? <Lock size={10} /> : <Clock size={10} />}
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {isFinalized ? (
                            <span className="text-[10px] font-bold text-slate-400 italic flex items-center justify-end gap-1">
                              <Lock size={12} /> Locked
                            </span>
                          ) : (
                            <button
                              onClick={() => setSnapshotToFinalize(s)}
                              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-1 ml-auto"
                            >
                              <CheckCircle2 size={13} />
                              <span>Finalize</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog for Finalizing Payroll */}
      <ConfirmDialog
        isOpen={!!snapshotToFinalize}
        onClose={() => setSnapshotToFinalize(null)}
        onConfirm={handleConfirmFinalize}
        title="Finalize & Lock Payroll Snapshot?"
        message={`Are you sure you want to finalize payroll for ${snapshotToFinalize?.employee?.fullName || 'Employee'} for period ${snapshotToFinalize?.month}? Once finalized, financial values are locked and payslips become accessible.`}
      />
    </div>
  );
};

export default PayrollOperations;
