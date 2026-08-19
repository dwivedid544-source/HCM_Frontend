import React, { useState, useEffect, useRef } from 'react';
import api, { employeeAPI } from '../../utils/apiService';
import { DollarSign, TrendingUp, Calendar, Download, FileText, CheckCircle, Printer, X, Brain, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import { useEmployee } from '../../context/EmployeeContext';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const EmployeePayroll = () => {
  const [compensation, setCompensation] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const payslipPrintRef = useRef();

  const [showInsightsModal, setShowInsightsModal] = useState(false);
  const [insightsContent, setInsightsContent] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [exportingPDF, setExportingPDF] = useState(false);

  const { formatCurrency, currencyCode } = useCurrency();
  const { formatDate } = useDateFormat();
  const { showToast } = useEmployee();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, snapRes] = await Promise.all([
        api.get('/employee/compensation').catch(() => ({ data: null })),
        api.get('/employee/payroll/snapshots')
      ]);
      setCompensation(compRes.data);
      setSnapshots(snapRes.data || []);
    } catch (err) {
      console.error('Error fetching payroll data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPayslipModal = (s) => {
    const emp = compensation?.employee || {};
    const record = {
      ...s,
      name: emp.fullName || 'Employee',
      employeeId: emp.employeeId || '-',
      designation: emp.designation || emp.jobTitle || 'Employee',
      department: emp.department?.name || emp.department || 'General',
      currency: currencyCode,
      net: s.netSalary,
    };
    setSelectedRecord(record);
    setShowPayslipModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!selectedRecord || exportingPDF) return;
    setExportingPDF(true);
    try {
      const element = document.getElementById('payslip-print-container');
      if (!element) {
        showToast('Could not find payslip content', 'error');
        return;
      }
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${selectedRecord.month?.replace(/\s/g, '_')}_${selectedRecord.id?.slice(0, 8).toUpperCase()}.pdf`);
      showToast('PDF downloaded successfully!', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export PDF', 'error');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleAIInsights = async () => {
    if (analyzing) return;
    setAnalyzing(true);
    showToast('Analyzing payroll with AI...', 'info');
    try {
      // Backend ignores body params — reads identity from JWT.
      // res.data = { success: true, data: { summary, earnings, deductions, netPay, insights, recommendations } }
      const res = await employeeAPI.aiPayrollInsights();
      const payload = res?.data?.data || res?.data || null;
      if (payload) {
        setInsightsContent(payload);
        setShowInsightsModal(true);
        showToast('AI Insights generated!', 'success');
      } else {
        showToast('AI returned no data', 'error');
      }
    } catch (err) {
      console.error('AI Insights error:', err);
      showToast(err?.response?.data?.error || 'Failed to load AI Insights', 'error');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[200px]">
        <div className="animate-spin h-10 w-10 border-b-2 border-indigo-600 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 animate-fade-in">

      {/* ── Header ── */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Compensation &amp; Payroll</h1>
          <p className="text-gray-500 mt-1">View your salary structure and payslips.</p>
        </div>
        <button
          onClick={handleAIInsights}
          disabled={analyzing}
          className="btn-primary flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg px-4 py-2 rounded-xl disabled:opacity-60"
        >
          {analyzing ? (
            <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full inline-block" />
          ) : (
            <Brain size={16} />
          )}
          <span className="hidden sm:inline">
            {analyzing ? 'Analyzing...' : '✨ AI Payroll Insights'}
          </span>
        </button>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full text-green-600">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Salary Structure</p>
              <h3
                className="text-xl font-bold dark:text-white truncate max-w-[200px]"
                title={compensation?.salaryStructure?.name || 'Not assigned'}
              >
                {compensation?.salaryStructure?.name || 'Not assigned'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {compensation?.salaryBand ? `Salary Band: ${compensation.salaryBand.name}` : 'Active Compensation Plan'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Monthly CTC</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {compensation ? formatCurrency(compensation.monthlyCTC) : '-'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500">Cost to Company per month</p>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full text-purple-600">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">Annual CTC</p>
              <h3 className="text-2xl font-bold dark:text-white">
                {compensation ? formatCurrency(compensation.annualCTC) : '-'}
              </h3>
            </div>
          </div>
          <p className="text-sm text-gray-500">Cost to Company per annum</p>
        </div>
      </div>

      {/* ── Payslips Table ── */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payslips (Payroll Snapshots)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Month</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Gross Salary</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Deductions</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Net Pay</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
              {snapshots.map(s => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium dark:text-white">{s.month}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatCurrency(s.grossSalary)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">-{formatCurrency(s.totalDeductions)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">{formatCurrency(s.netSalary)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${s.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => openPayslipModal(s)}
                      className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end gap-1 text-sm font-medium ml-auto"
                    >
                      <FileText className="w-4 h-4" /> View Payslip
                    </button>
                  </td>
                </tr>
              ))}
              {snapshots.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">No payslips found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Payslip Modal ── */}
      <AnimatePresence>
        {showPayslipModal && selectedRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-3xl shadow-2xl relative my-8"
            >
              {/* Close button */}
              <button
                onClick={() => setShowPayslipModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              {/* Printable Area */}
              <div id="payslip-print-container" ref={payslipPrintRef} className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-start border-b border-slate-100 dark:border-slate-800 pb-4 mt-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">GlobalTech Solutions</h2>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Enterprise Employee Paystub</p>
                  </div>
                  <div className="text-right mr-6">
                    <span className="text-xs font-bold font-mono text-slate-400">PAYSLIP ID: {selectedRecord.id?.slice(0, 8).toUpperCase()}</span>
                    <p className="text-[10px] text-slate-500 mt-1">Month: <strong>{selectedRecord.month}</strong></p>
                  </div>
                </div>

                {/* Employee & Attendance */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employee Details</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedRecord.name}</p>
                    <p className="text-slate-400 font-mono mt-0.5">{selectedRecord.employeeId}</p>
                    <p className="text-slate-500 mt-0.5">{selectedRecord.designation} • {selectedRecord.department}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Summary</p>
                    <p className="text-slate-600 dark:text-slate-400">Working Days: <strong>{selectedRecord.totalWorkingDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Days Present: <strong>{selectedRecord.presentDays ?? selectedRecord.attendancePresent ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Paid Leaves: <strong>{selectedRecord.paidLeaveDays ?? 0}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">LOP Days: <strong>{selectedRecord.unpaidLeaveDays ?? selectedRecord.attendanceAbsent ?? 0}</strong></p>
                  </div>
                </div>

                {/* Earnings & Deductions */}
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
                          <span>{formatCurrency(selectedRecord.basic || 0, selectedRecord.currency)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Bonus &amp; Allowances</span>
                          <span>{formatCurrency((selectedRecord.allowance || 0) + (selectedRecord.bonus || 0), selectedRecord.currency)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between py-1.5 font-bold border-t border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-100">
                      <span>Gross Earnings</span>
                      <span>{formatCurrency(selectedRecord.grossSalary, selectedRecord.currency)}</span>
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
                          <span>{formatCurrency(selectedRecord.tax || 0, selectedRecord.currency)}</span>
                        </div>
                        <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                          <span>Provident Fund</span>
                          <span>{formatCurrency(selectedRecord.pf || 0, selectedRecord.currency)}</span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between py-1.5 font-bold border-t border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-100">
                      <span>Total Withheld</span>
                      <span>{formatCurrency(selectedRecord.totalDeductions, selectedRecord.currency)}</span>
                    </div>
                  </div>
                </div>

                {/* Net Total */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Net Salary Payable</span>
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">
                      {formatCurrency(selectedRecord.net, selectedRecord.currency)}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedRecord.status === 'Paid' || selectedRecord.status === 'Processed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {selectedRecord.status}
                    </span>
                  </div>
                </div>

                {/* Footer terms (inside printable area) */}
                <div className="text-center text-[9px] text-slate-400 border-t pt-4 border-slate-100 dark:border-slate-800">
                  <p>This is a computer-generated document and does not require a physical signature.</p>
                  <p className="mt-0.5">GlobalTech Solutions Payroll Processing Service Platform. Confidential. © {new Date().getFullYear()}</p>
                </div>
              </div>

              {/* Action Buttons (outside printable area) */}
              <div className="flex gap-3 pt-4 border-t dark:border-slate-800 mt-4">
                <button
                  onClick={handlePrint}
                  className="flex-1 flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-xl text-sm py-2.5 font-semibold transition-all"
                >
                  <Printer size={15} /> Print
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={exportingPDF}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm py-2.5 font-semibold transition-all disabled:opacity-60"
                >
                  {exportingPDF
                    ? <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full inline-block" />
                    : <Download size={15} />
                  }
                  {exportingPDF ? 'Exporting...' : 'Download PDF'}
                </button>
                <button
                  onClick={() => setShowPayslipModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm py-2.5 font-semibold transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── AI Insights Modal ── */}
      <AnimatePresence>
        {showInsightsModal && insightsContent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-2xl shadow-2xl relative my-8"
            >
              {/* Close */}
              <button
                onClick={() => setShowInsightsModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all"
              >
                <X size={18} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 dark:bg-indigo-900/30 p-3 rounded-full text-indigo-600">
                  <Brain size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">AI Payroll Insights</h2>
                  <p className="text-xs text-slate-500">Powered by HCM.ai — personalized analysis of your payroll data</p>
                </div>
              </div>

              <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">

                {/* Summary */}
                {insightsContent.summary && (
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 border border-indigo-100 dark:border-indigo-800">
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-wider mb-2">📊 Summary</p>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{insightsContent.summary}</p>
                  </div>
                )}

                {/* Earnings */}
                {insightsContent.earnings && insightsContent.earnings.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">💰 Earnings Breakdown</p>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                      {insightsContent.earnings.map((e, i) => (
                        <div key={i} className={`flex justify-between items-center px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}`}>
                          <span className="text-slate-700 dark:text-slate-300">{e.label || e.name}</span>
                          <span className="font-semibold text-emerald-600">{formatCurrency(e.amount || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Deductions */}
                {insightsContent.deductions && insightsContent.deductions.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2">📉 Deductions Breakdown</p>
                    <div className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                      {insightsContent.deductions.map((d, i) => (
                        <div key={i} className={`px-4 py-2.5 text-sm ${i % 2 === 0 ? 'bg-slate-50 dark:bg-slate-800/50' : 'bg-white dark:bg-slate-900'}`}>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-700 dark:text-slate-300">{d.label || d.name}</span>
                            <span className="font-semibold text-rose-500">-{formatCurrency(d.amount || 0)}</span>
                          </div>
                          {d.explanation && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{d.explanation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Net Pay */}
                {insightsContent.netPay != null && (
                  <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 border border-emerald-100 dark:border-emerald-800 flex justify-between items-center">
                    <div>
                      <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Net Pay</p>
                      <p className="text-2xl font-black text-emerald-700 dark:text-emerald-400 mt-0.5">
                        {formatCurrency(insightsContent.netPay)}
                      </p>
                    </div>
                    <div className="bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-300 text-xs font-bold px-3 py-1 rounded-full">
                      AI Calculated
                    </div>
                  </div>
                )}

                {/* Empty state when no actual payroll data */}
                {!insightsContent.earnings?.length && !insightsContent.deductions?.length && !insightsContent.netPay && (
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-100 dark:border-amber-800 flex items-start gap-3">
                    <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-amber-700 dark:text-amber-300">
                      No active payroll records found. Please contact HR to ensure your compensation profile and payslips are set up.
                    </p>
                  </div>
                )}

                {/* Key Insights */}
                {insightsContent.insights && insightsContent.insights.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">🔍 Key Insights</p>
                    <ul className="space-y-2">
                      {insightsContent.insights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg px-3 py-2">
                          <span className="text-indigo-500 mt-0.5 shrink-0">•</span>
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Recommendations */}
                {insightsContent.recommendations && insightsContent.recommendations.length > 0 && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-2">✅ Recommendations</p>
                    <ul className="space-y-2">
                      {insightsContent.recommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                          <span className="text-blue-500 mt-0.5 shrink-0">{i + 1}.</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-6 pt-4 border-t dark:border-slate-800 flex gap-3">
                <button
                  onClick={handleAIInsights}
                  disabled={analyzing}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/20 dark:hover:bg-indigo-900/40 text-indigo-600 rounded-xl text-sm py-2.5 font-semibold transition-all disabled:opacity-60"
                >
                  {analyzing
                    ? <span className="animate-spin h-4 w-4 border-b-2 border-indigo-500 rounded-full inline-block" />
                    : <Brain size={14} />
                  }
                  {analyzing ? 'Re-analyzing...' : 'Refresh'}
                </button>
                <button
                  onClick={() => setShowInsightsModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm py-2.5 font-semibold transition-all"
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

export default EmployeePayroll;
