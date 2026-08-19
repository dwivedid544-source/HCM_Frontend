import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserMinus, UserCheck, ShieldAlert, CheckCircle2, Clock,
  AlertTriangle, Search, Plus, X, Shield, RefreshCw, Trash2
} from 'lucide-react';
import { useHR } from '../../context/HRContext';
import { cn } from '../../utils/cn';
import { hrAPI } from '../../utils/apiService';
import { useDateFormat } from '../../hooks/useDateFormat';

const ExitClearanceCenter = () => {
  const {
    exits = [],
    employees = [],
    updateClearanceStatus,
    finalizeExit,
    showToast,
    refetch
  } = useHR();

  const { formatDate } = useDateFormat();

  const [activeSubTab, setActiveSubTab] = useState('clearances'); // clearances | probation
  const [searchTerm, setSearchTerm] = useState('');

  // Initiation modal states
  const [isTerminateModalOpen, setIsTerminateModalOpen] = useState(false);
  const [terminateData, setTerminateData] = useState({
    employeeId: '',
    reason: '',
    lastWorkingDay: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  });

  // Probation extension modal states
  const [extendingEmpId, setExtendingEmpId] = useState(null);
  const [extensionMonths, setExtensionMonths] = useState(3);

  // Filters
  const filteredExits = exits.filter(ex =>
    (ex.employee?.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (ex.employee?.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const probationEmployees = employees.filter(emp =>
    emp.probationStatus === 'UNDER_PROBATION' || emp.probationStatus === 'EXTENDED'
  ).filter(emp =>
    (emp.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (emp.employeeId?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  const offboardingExits = filteredExits.filter(ex => !['PENDING_MANAGER_APPROVAL', 'PENDING_HR_APPROVAL', 'REJECTED_BY_MANAGER', 'REJECTED_BY_HR'].includes(ex.status));
  const resignationsList = filteredExits.filter(ex => ex.exitType === 'RESIGNATION');

  const handleReviewResignation = async (exitId, status) => {
    try {
      const res = await hrAPI.reviewResignationHr(exitId, { status });
      if (res.data?.success) {
        showToast(`Resignation ${status === 'APPROVED' ? 'Approved' : 'Rejected'}`);
        if (refetch.fetchExits) await refetch.fetchExits();
      }
    } catch (err) {
      showToast('Failed to review resignation', 'error');
    }
  };

  const handleInitiateTermination = async (e) => {
    e.preventDefault();
    if (!terminateData.employeeId || !terminateData.lastWorkingDay) {
      showToast('All fields are required', 'error');
      return;
    }
    try {
      const res = await hrAPI.initiateTermination(terminateData);
      if (res.data?.success) {
        showToast('Exit clearance initiated successfully!');
        setIsTerminateModalOpen(false);
        setTerminateData({ employeeId: '', reason: '', lastWorkingDay: '' });
        if (refetch.fetchExits) await refetch.fetchExits();
        if (refetch.fetchEmployees) await refetch.fetchEmployees();
      }
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to initiate termination', 'error');
    }
  };

  const handleConfirmProbation = async (empId) => {
    try {
      const res = await hrAPI.confirmProbation(empId);
      if (res.data?.success) {
        showToast('Probation status updated successfully!');
        if (refetch.fetchEmployees) await refetch.fetchEmployees();
      }
    } catch (err) {
      showToast('Failed to confirm probation', 'error');
    }
  };

  const handleExtendProbation = async (e) => {
    e.preventDefault();
    try {
      const res = await hrAPI.extendProbation(extendingEmpId, { months: extensionMonths });
      if (res.data?.success) {
        showToast(`Probation successfully extended by ${extensionMonths} months`);
        setExtendingEmpId(null);
        if (refetch.fetchEmployees) await refetch.fetchEmployees();
      }
    } catch (err) {
      showToast('Failed to extend probation', 'error');
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Employee Lifecycle Management</h1>
          <p className="text-slate-500 font-medium tracking-tight mt-1">Manage employee probation, clearance checkpoints, and offboarding lifecycles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsTerminateModalOpen(true)}
            className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <UserMinus size={18} />
            <span>Initiate Offboarding</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800">
        <button
          onClick={() => { setActiveSubTab('clearances'); setSearchTerm(''); }}
          className={cn(
            "pb-4 px-6 text-sm font-extrabold transition-all relative",
            activeSubTab === 'clearances' ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Offboarding & Clearances ({offboardingExits.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('probation'); setSearchTerm(''); }}
          className={cn(
            "pb-4 px-6 text-sm font-extrabold transition-all relative",
            activeSubTab === 'probation' ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Probation Review ({probationEmployees.length})
        </button>
        <button
          onClick={() => { setActiveSubTab('resignations'); setSearchTerm(''); }}
          className={cn(
            "pb-4 px-6 text-sm font-extrabold transition-all relative",
            activeSubTab === 'resignations' ? "text-primary-600 dark:text-primary-400 border-b-2 border-primary-500" : "text-slate-400 hover:text-slate-600"
          )}
        >
          Resignations ({resignationsList.length})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="input-field pl-12 h-11 text-sm bg-slate-50 border-slate-200"
          />
        </div>
      </div>

      {/* Clearances Content */}
      {activeSubTab === 'clearances' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-bold font-bold border-b border-slate-150 dark:border-slate-800">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">LWD</th>
                  <th className="py-4 px-6">IT Clearance</th>
                  <th className="py-4 px-6">Finance Clearance</th>
                  <th className="py-4 px-6">HR Clearance</th>
                  <th className="py-4 px-6">Workflow Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {offboardingExits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-bold text-sm">
                      No active offboarding lifecycles found.
                    </td>
                  </tr>
                ) : (
                  offboardingExits.map((ex) => {
                    const allCleared = ex.itClearance && ex.financeClearance && ex.hrClearance;
                    return (
                      <tr key={ex.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                        <td className="py-5 px-6">
                          <div className="font-extrabold text-slate-800 dark:text-slate-200">
                            {ex.employee?.fullName || 'Unknown'}
                          </div>
                          <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                            {ex.employee?.employeeId || 'NO ID'} • {ex.employee?.department?.name || 'General'}
                          </div>
                        </td>
                        <td className="py-5 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                          {formatDate(ex.lastWorkingDay)}
                        </td>
                        <td className="py-5 px-6">
                          <button
                            onClick={() => updateClearanceStatus(ex.id, { itClearance: !ex.itClearance })}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all",
                              ex.itClearance
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            )}
                          >
                            {ex.itClearance ? "Cleared" : "Mark Cleared"}
                          </button>
                        </td>
                        <td className="py-5 px-6">
                          <button
                            onClick={() => updateClearanceStatus(ex.id, { financeClearance: !ex.financeClearance })}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all",
                              ex.financeClearance
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            )}
                          >
                            {ex.financeClearance ? "Cleared" : "Mark Cleared"}
                          </button>
                        </td>
                        <td className="py-5 px-6">
                          <button
                            onClick={() => updateClearanceStatus(ex.id, { hrClearance: !ex.hrClearance })}
                            className={cn(
                              "px-3 py-1.5 rounded-xl text-xs font-extrabold border transition-all",
                              ex.hrClearance
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-50 text-slate-400 border-slate-200"
                            )}
                          >
                            {ex.hrClearance ? "Cleared" : "Mark Cleared"}
                          </button>
                        </td>
                        <td className="py-5 px-6">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            ex.status === 'COMPLETED'
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                              : allCleared
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-amber-50 text-amber-500"
                          )}>
                            {ex.status === 'COMPLETED' ? 'Completed' : allCleared ? 'Cleared' : 'Pending Clearances'}
                          </span>
                        </td>
                        <td className="py-5 px-6 text-right">
                          {ex.status !== 'COMPLETED' && ex.status !== 'EMPLOYEE_RELIEVED' ? (
                            <button
                              onClick={() => finalizeExit(ex.id)}
                              disabled={!allCleared}
                              className={cn(
                                "px-4 py-2 rounded-xl text-xs font-extrabold transition-all",
                                allCleared
                                  ? "bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-200"
                                  : "bg-slate-100 text-slate-400 cursor-not-allowed"
                              )}
                            >
                              Finalize Exit
                            </button>
                          ) : (
                            <span className="text-xs font-bold text-slate-500">Finalized</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resignations Content */}
      {activeSubTab === 'resignations' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-450 dark:text-slate-500 text-[10px] font-bold font-bold border-b border-slate-150 dark:border-slate-800">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Submitted</th>
                  <th className="py-4 px-6">Proposed LWD</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {resignationsList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-bold text-sm">
                      No resignation requests found.
                    </td>
                  </tr>
                ) : (
                  resignationsList.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="py-5 px-6">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">
                          {req.employee?.fullName || 'Unknown'}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 mt-0.5 uppercase tracking-wider">
                          {req.employee?.employeeId || 'NO ID'} • {req.employee?.department?.name || 'General'}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {formatDate(req.submissionDate)}
                      </td>
                      <td className="py-5 px-6 text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {formatDate(req.lastWorkingDay)}
                      </td>
                      <td className="py-5 px-6">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {req.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right space-x-2">
                        {req.status === 'PENDING_HR_APPROVAL' ? (
                          <>
                            <button
                              onClick={() => handleReviewResignation(req.id, 'APPROVED')}
                              className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewResignation(req.id, 'REJECTED_BY_HR')}
                              className="px-4 py-2 rounded-xl text-xs font-extrabold transition-all bg-red-50 hover:bg-red-100 text-red-600 border border-red-200"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-slate-400">Reviewed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}



      {/* Probation Content */}
      {activeSubTab === 'probation' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-850 text-slate-450 dark:text-slate-550 text-[10px] font-bold font-bold border-b border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-6">Employee</th>
                  <th className="py-4 px-6">Probation Start</th>
                  <th className="py-4 px-6">Probation End</th>
                  <th className="py-4 px-6">Review Date</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {probationEmployees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-sm">
                      No employees currently under probation review.
                    </td>
                  </tr>
                ) : (
                  probationEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="py-5 px-6">
                        <div className="font-extrabold text-slate-800 dark:text-slate-200">
                          {emp.fullName}
                        </div>
                        <div className="text-[10px] font-bold text-slate-450 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                          {emp.employeeId || 'NO ID'} • {emp.department?.name || 'General'}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-sm font-semibold text-slate-650 dark:text-slate-400">
                        {emp.probationStart ? formatDate(emp.probationStart) : '-'}
                      </td>
                      <td className="py-5 px-6 text-sm font-semibold text-slate-650 dark:text-slate-400">
                        {emp.probationEnd ? formatDate(emp.probationEnd) : '-'}
                      </td>
                      <td className="py-5 px-6 text-sm font-semibold text-slate-650 dark:text-slate-400">
                        {emp.probationReviewDate ? formatDate(emp.probationReviewDate) : '-'}
                      </td>
                      <td className="py-5 px-6">
                        <span className={cn(
                          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                          emp.probationStatus === 'EXTENDED' ? "bg-amber-50 text-amber-500" : "bg-blue-50 text-blue-500"
                        )}>
                          {emp.probationStatus === 'EXTENDED' ? 'Extended' : 'Active'}
                        </span>
                      </td>
                      <td className="py-5 px-6 text-right flex justify-end gap-2">
                        <button
                          onClick={() => setExtendingEmpId(emp.id)}
                          className="px-3 py-1.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold transition-all hover:bg-slate-50"
                        >
                          Extend
                        </button>
                        <button
                          onClick={() => handleConfirmProbation(emp.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-500/10"
                        >
                          Confirm
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Initiate Offboarding Modal */}
      <AnimatePresence>
        {isTerminateModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTerminateModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Initiate Employee Offboarding</h3>
                <button onClick={() => setIsTerminateModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleInitiateTermination} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-450 dark:text-slate-500 font-bold">Select Employee *</label>
                  <select
                    required
                    value={terminateData.employeeId}
                    onChange={e => setTerminateData({ ...terminateData, employeeId: e.target.value })}
                    className="input-field h-11 appearance-none text-sm font-bold"
                  >
                    <option value="">Choose employee...</option>
                    {employees.filter(emp => !['TERMINATED', 'ON_NOTICE'].includes(emp.lifecycleStatus)).map(emp => (
                      <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeId || 'No ID'})</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Last Working Day *</label>
                  <input
                    type="date"
                    required
                    value={terminateData.lastWorkingDay}
                    onChange={e => setTerminateData({ ...terminateData, lastWorkingDay: e.target.value })}
                    className="input-field h-11 text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">Reason *</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide reason for termination/offboarding..."
                    value={terminateData.reason}
                    onChange={e => setTerminateData({ ...terminateData, reason: e.target.value })}
                    className="input-field p-3 text-sm font-semibold"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button type="button" onClick={() => setIsTerminateModalOpen(false)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/10">Initiate</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Probation Extension Modal */}
      <AnimatePresence>
        {extendingEmpId && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setExtendingEmpId(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-2xl p-8 space-y-6 text-left">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Extend Probation Period</h3>
                <button onClick={() => setExtendingEmpId(null)} className="p-1 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
              </div>
              <form onSubmit={handleExtendProbation} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-450 dark:text-slate-500 font-bold">Extension Duration *</label>
                  <select
                    required
                    value={extensionMonths}
                    onChange={e => setExtensionMonths(parseInt(e.target.value))}
                    className="input-field h-11 appearance-none text-sm font-bold"
                  >
                    <option value="1">1 Month Extension</option>
                    <option value="2">2 Months Extension</option>
                    <option value="3">3 Months Extension (Recommended)</option>
                    <option value="6">6 Months Extension</option>
                  </select>
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <button type="button" onClick={() => setExtendingEmpId(null)} className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-500">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold shadow-md shadow-primary-200">Confirm Extension</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExitClearanceCenter;
