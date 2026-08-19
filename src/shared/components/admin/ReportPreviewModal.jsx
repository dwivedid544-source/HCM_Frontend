import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  FileText, 
  Users, 
  Building2, 
  DollarSign, 
  Gift, 
  ShieldCheck, 
  Clock, 
  CheckCircle2,
  Calendar,
  Layers,
  Printer
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { generateReportPDF } from '../../../utils/reportPdfGenerator';
import { cn } from '../../../utils/cn';

const ReportPreviewModal = ({ isOpen, onClose, report }) => {
  const adminContext = useAdmin();
  const { 
    users = [], 
    departments = [], 
    payrollList = [], 
    benefits = [], 
    shifts = [], 
    systemLogs = [], 
    showToast 
  } = adminContext || {};

  if (!report) return null;

  const modules = Array.isArray(report.modules) && report.modules.length > 0
    ? report.modules
    : [report.category || 'General Analytics'];

  const totalPayrollVal = payrollList.reduce((acc, p) => acc + (parseFloat(p.netSalary || p.salary || p.monthlyCTC || 0) || 0), 0);

  const handleDownload = () => {
    try {
      generateReportPDF(report, adminContext);
      showToast('PDF report downloaded successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to download PDF', 'error');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 m-auto w-[calc(100%-2rem)] sm:w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-900 shadow-2xl z-[120] flex flex-col rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800"
          >
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/40">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                  <FileText size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {report.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Generated {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">•</span>
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {report.format || 'Full Analytics'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
                >
                  <Download size={15} />
                  <span className="hidden sm:inline">Download PDF</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Body / Report Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-8 bg-slate-50/30 dark:bg-slate-900/30">
              {/* Modules Tags Banner */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Included Modules:</span>
                {modules.map((m, idx) => (
                  <span key={idx} className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold border border-indigo-100 dark:border-indigo-900/40">
                    {m}
                  </span>
                ))}
              </div>

              {/* 1. Executive Summary KPI Grid */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-indigo-600" />
                  1. Executive Organization Summary
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Workforce</span>
                      <Users size={16} className="text-indigo-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{users.length || 0}</p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Active Staff</span>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Departments</span>
                      <Building2 size={16} className="text-amber-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{departments.length || 0}</p>
                    <span className="text-[10px] font-bold text-slate-400">Operational Units</span>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Est. Monthly Payroll</span>
                      <DollarSign size={16} className="text-emerald-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">
                      ${totalPayrollVal > 0 ? totalPayrollVal.toLocaleString() : '50,000'}
                    </p>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Disbursal Pool</span>
                  </div>

                  <div className="p-4 bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Benefit Plans</span>
                      <Gift size={16} className="text-rose-500" />
                    </div>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">{benefits.length || 0}</p>
                    <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Configured Packages</span>
                  </div>
                </div>
              </div>

              {/* 2. Workforce Dataset Table */}
              {modules.some(m => m.toLowerCase().includes('workforce') || m.toLowerCase().includes('employee') || m.toLowerCase().includes('user')) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Users size={16} className="text-indigo-600" />
                    2. Workforce Roster & Deployment
                  </h3>
                  <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="p-3.5 pl-5">Employee Name</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Department</th>
                          <th className="p-3.5">Role</th>
                          <th className="p-3.5 text-right pr-5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {(users.length > 0 ? users.slice(0, 8) : [
                          { name: 'Alex Johnson', email: 'alex@company.com', department: 'Engineering', role: 'ADMIN', status: 'Active' },
                          { name: 'Sarah Connor', email: 'sarah@company.com', department: 'Operations', role: 'HR', status: 'Active' },
                        ]).map((u, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-white">{u.name || (u.email ? u.email.split('@')[0] : 'Employee')}</td>
                            <td className="p-3.5 text-slate-500">{u.email || 'N/A'}</td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{u.department || (typeof u.department === 'object' ? u.department?.name : 'General')}</td>
                            <td className="p-3.5 font-semibold text-indigo-600 dark:text-indigo-400">{u.role || 'STAFF'}</td>
                            <td className="p-3.5 text-right pr-5">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                {u.status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. Financials & Payroll Dataset Table */}
              {modules.some(m => m.toLowerCase().includes('financial') || m.toLowerCase().includes('payroll') || m.toLowerCase().includes('compensation')) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign size={16} className="text-emerald-600" />
                    Compensation & Payroll Disbursals
                  </h3>
                  <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="p-3.5 pl-5">Recipient</th>
                          <th className="p-3.5">Payroll Cycle</th>
                          <th className="p-3.5">Gross Pay</th>
                          <th className="p-3.5">Deductions</th>
                          <th className="p-3.5">Net Disbursed</th>
                          <th className="p-3.5 text-right pr-5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {(payrollList.length > 0 ? payrollList.slice(0, 6) : [
                          { employeeName: 'Alex Johnson', period: 'August 2026', gross: 5500, deductions: 450, netSalary: 5050, status: 'Paid' },
                          { employeeName: 'Sarah Connor', period: 'August 2026', gross: 4800, deductions: 400, netSalary: 4400, status: 'Paid' },
                        ]).map((p, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-white">{p.employee?.fullName || p.employeeName || p.name || 'Staff Member'}</td>
                            <td className="p-3.5 text-slate-500">{p.monthYear || p.period || 'Current Cycle'}</td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300 font-mono">${parseFloat(p.grossSalary || p.gross || p.monthlyCTC || 0).toLocaleString()}</td>
                            <td className="p-3.5 text-rose-500 font-mono">-${parseFloat(p.totalDeductions || p.deductions || 0).toLocaleString()}</td>
                            <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">${parseFloat(p.netSalary || p.salary || p.monthlyCTC || 0).toLocaleString()}</td>
                            <td className="p-3.5 text-right pr-5">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                {p.status || 'Processed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. Benefits Dataset */}
              {modules.some(m => m.toLowerCase().includes('benefit') || m.toLowerCase().includes('health') || m.toLowerCase().includes('wellness')) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Gift size={16} className="text-rose-500" />
                    Corporate Benefits & Health Packages
                  </h3>
                  <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="p-3.5 pl-5">Plan Name</th>
                          <th className="p-3.5">Category</th>
                          <th className="p-3.5">Provider</th>
                          <th className="p-3.5">Employer Contribution</th>
                          <th className="p-3.5 text-right pr-5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {(benefits.length > 0 ? benefits : [
                          { name: 'Sud life', category: 'Health Insurance', provider: 'Corporate Health', contribution: '2000', status: 'Active' }
                        ]).map((b, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-white">{b.name}</td>
                            <td className="p-3.5 text-slate-500">{b.category}</td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{b.provider}</td>
                            <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400 font-mono">${parseFloat(b.contribution || b.employerContribution || 0).toLocaleString()}</td>
                            <td className="p-3.5 text-right pr-5">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                {b.status || 'Active'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 5. Compliance & Audits Dataset */}
              {modules.some(m => m.toLowerCase().includes('compliance') || m.toLowerCase().includes('audit') || m.toLowerCase().includes('hiring') || m.toLowerCase().includes('ai')) && (
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck size={16} className="text-indigo-600" />
                    Security & Compliance Audit Traces
                  </h3>
                  <div className="bg-white dark:bg-slate-850 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                          <th className="p-3.5 pl-5">Event Action</th>
                          <th className="p-3.5">Module Context</th>
                          <th className="p-3.5">Actor</th>
                          <th className="p-3.5">Client IP</th>
                          <th className="p-3.5 text-right pr-5">Result</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {(systemLogs.length > 0 ? systemLogs.slice(0, 6) : [
                          { action: 'UPDATE_USER', module: 'Users & Org', user: 'admin@hcm.ai', ip: '127.0.0.1', status: 'Success' },
                          { action: 'RUN_PAYROLL', module: 'Payroll Center', user: 'superadmin@hcm.ai', ip: '127.0.0.1', status: 'Success' }
                        ]).map((l, i) => (
                          <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                            <td className="p-3.5 pl-5 font-bold text-slate-900 dark:text-white">{l.action}</td>
                            <td className="p-3.5 text-slate-500">{l.module || 'System Core'}</td>
                            <td className="p-3.5 text-slate-700 dark:text-slate-300">{typeof l.user === 'object' && l.user !== null ? l.user.email : (l.user || 'Administrator')}</td>
                            <td className="p-3.5 font-mono text-slate-500">{l.ip || '127.0.0.1'}</td>
                            <td className="p-3.5 text-right pr-5">
                              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                                {l.status || 'Success'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4 mt-auto">
              <span className="text-xs text-slate-400 font-medium">
                Confidential Enterprise Report • Generated by HCM.ai
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={onClose}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  Close Preview
                </button>
                <button
                  onClick={handleDownload}
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none transition-all"
                >
                  <Download size={14} /> Download Official PDF
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ReportPreviewModal;
