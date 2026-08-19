import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, DollarSign } from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { useCurrency } from '../../../hooks/useCurrency';

const PayrollBreakdownModal = ({ isOpen, onClose, employee, selectedMonth }) => {
  const { formatCurrency, getSymbol, getIcon } = useCurrency();
  const { appSettings } = useAdmin();
  const defaultCurrency = appSettings?.general?.defaultCurrency;
  const currencyIconComp = getIcon(defaultCurrency);

  if (!employee) return null;

  const grossVal = employee.grossSalary || 0;
  const deductionsVal = employee.deductions || 0;
  const employerCost = employee.employerCost || 0;
  const netPayable = employee.net || 0;
  const items = employee.items || [];

  const earnings = items.filter(i => i.type === 'Earning');
  const deductions = items.filter(i => i.type === 'Deduction' || i.type === 'Employee Deduction');
  const employerContribs = items.filter(i => i.type === 'Employer Contribution');

  const renderIcon = () => React.createElement(currencyIconComp, { className: "absolute left-4 top-3.5 text-slate-300", size: 16 });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-3xl max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-6">
                  <Calculator size={22} fill="currentColor" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">
                    Payroll Calculation Breakdown
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">
                    {employee.name} • Status: {employee.status}
                  </p>
                </div>
              </div>

              {/* Attendance Summary */}
              <div className="hidden sm:block text-right pr-6">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Summary</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                  <p className="text-slate-600">Working Days: <strong className="text-slate-900">{employee.totalWorkingDays ?? 0}</strong></p>
                  <p className="text-slate-600">Present: <strong className="text-slate-900">{employee.presentDays ?? 0}</strong></p>
                  <p className="text-slate-600">Paid Leave: <strong className="text-slate-900">{employee.paidLeaveDays ?? 0}</strong></p>
                  <p className="text-slate-600">LOP Days: <strong className="text-rose-600">{employee.unpaidLeaveDays ?? 0}</strong></p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto flex flex-col p-8 space-y-8">
              
              {/* SUMMARY CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                 <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-bold text-blue-400 font-bold mb-1">Gross Salary</p>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(grossVal)}</p>
                 </div>
                 <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                    <p className="text-[10px] font-black text-rose-400 font-bold mb-1">Deductions</p>
                    <p className="text-xl font-bold text-rose-900">-{formatCurrency(deductionsVal)}</p>
                 </div>
                 <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Employer Cost</p>
                    <p className="text-xl font-bold text-indigo-900">{formatCurrency(employerCost)}</p>
                 </div>
                 <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 shadow-sm">
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">Net Pay</p>
                    <p className="text-2xl font-black text-emerald-700">{formatCurrency(netPayable)}</p>
                 </div>
              </div>

              {/* DETAILS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* EARNINGS */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Earnings & Allowances</h3>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    {earnings.length > 0 ? earnings.map((e, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">{e.name}</span>
                        <span className="text-sm font-black text-slate-900">{formatCurrency(e.amount)}</span>
                      </div>
                    )) : (
                      <div className="text-sm text-slate-400 italic text-center py-2">No earnings generated.</div>
                    )}
                    <div className="pt-3 mt-3 border-t border-slate-200/60 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Gross</span>
                      <span className="text-sm font-black text-slate-900">{formatCurrency(grossVal)}</span>
                    </div>
                  </div>
                </div>

                {/* DEDUCTIONS */}
                <div className="space-y-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Deductions & Taxes</h3>
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                    {deductions.length > 0 ? deductions.map((d, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-600">{d.name}</span>
                        <span className="text-sm font-black text-rose-600">-{formatCurrency(d.amount)}</span>
                      </div>
                    )) : (
                      <div className="text-sm text-slate-400 italic text-center py-2">No deductions generated.</div>
                    )}
                    <div className="pt-3 mt-3 border-t border-slate-200/60 flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Deductions</span>
                      <span className="text-sm font-black text-rose-600">-{formatCurrency(deductionsVal)}</span>
                    </div>
                  </div>
                </div>

                {/* EMPLOYER CONTRIBUTIONS */}
                {employerContribs.length > 0 && (
                  <div className="space-y-4 md:col-span-2">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2">Employer Contributions</h3>
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
                      {employerContribs.map((e, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-600">{e.name}</span>
                          <span className="text-sm font-black text-indigo-600">{formatCurrency(e.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-[48px] px-8 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl active:scale-[0.98]"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PayrollBreakdownModal;
