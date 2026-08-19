import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, X, DollarSign } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { useCurrency } from '../../../hooks/useCurrency';

const PayrollBreakdownModal = ({ isOpen, onClose, employee }) => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const { updatePayrollDetails, showToast, appSettings } = useAdmin();
  const defaultCurrency = appSettings?.general?.defaultCurrency;
  const CurrencyIcon = getIcon(defaultCurrency);
  const currencySymbol = getSymbol(defaultCurrency);
  const [formData, setFormData] = useState({
    basic: 0,
    bonus: 0,
    deductions: 0
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        basic: employee.basic || 0,
        bonus: employee.bonus || 0,
        deductions: employee.deductions || 0
      });
    }
  }, [employee, isOpen]);

  if (!employee) return null;

  const basicVal = parseInt(formData.basic) || 0;
  const bonusVal = parseInt(formData.bonus) || 0;
  const customDeductions = parseInt(formData.deductions) || 0;

  // Dynamic tax breakdowns (statutory placeholders)
  const fedTax = Math.round(basicVal * 0.12);
  const socialSecurity = Math.round(basicVal * 0.062);
  const medicare = Math.round(basicVal * 0.0145);
  const stateTax = Math.round(basicVal * 0.04);
  const totalTax = fedTax + socialSecurity + medicare + stateTax;

  const totalEarnings = basicVal + bonusVal;
  const netPayable = totalEarnings - customDeductions - totalTax;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (employee) {
      updatePayrollDetails(employee.id, {
        basic: basicVal,
        bonus: bonusVal,
        deductions: customDeductions,
        net: netPayable
      });
      if (showToast) {
        showToast(`Salary details saved for ${employee.name}. Take-home Net: ${formatCurrency(netPayable, defaultCurrency)}`);
      }
    }
    onClose();
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
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-6">
                  <Calculator size={22} fill="currentColor" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">
                    Payroll & Tax Calculator
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">
                    {employee.name} • Status: {employee.status}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto flex flex-col">
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto">

                {/* Left Side: Inputs Form */}
                <div className="space-y-6 text-left">
                  <div className="flex items-center gap-4 mb-4">
                    <img src={employee.img} alt={employee.name} className="w-16 h-16 rounded-xl object-cover shadow-sm ring-2 ring-white" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">{employee.name}</h3>
                      <p className="text-xs font-bold text-slate-400">Security Group: {employee.role}</p>
                    </div>
                  </div>

                  <h3 className="text-xs font-bold text-slate-400 font-bold border-b pb-2">Salary Inputs</h3>

                  {/* Basic Salary */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Basic Salary</label>
                    <div className="relative">
                      <CurrencyIcon className="absolute left-4 top-3.5 text-slate-300" size={16} />
                      <input
                        required
                        type="number"
                        value={formData.basic}
                        onChange={(e) => setFormData({ ...formData, basic: e.target.value })}
                        className="input-field h-12 pl-10 bg-slate-50 border-transparent font-bold text-slate-700"
                      />
                    </div>
                  </div>

                  {/* Allowances */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Bonus & Allowances</label>
                    <div className="relative">
                      <CurrencyIcon className="absolute left-4 top-3.5 text-slate-300" size={16} />
                      <input
                        required
                        type="number"
                        value={formData.bonus}
                        onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                        className="input-field h-12 pl-10 bg-slate-50 border-transparent font-bold text-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Pre-Tax Deductions */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Pre-Tax Deductions</label>
                    <div className="relative">
                      <CurrencyIcon className="absolute left-4 top-3.5 text-slate-300" size={16} />
                      <input
                        required
                        type="number"
                        value={formData.deductions}
                        onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                        className="input-field h-12 pl-10 bg-slate-50 border-transparent font-bold text-rose-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Side: Payslip breakdown visualization */}
                <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 text-left">
                  {/* Payslip Header Info */}
                  <div className="flex justify-between items-start border-b border-primary-100 dark:border-slate-800 pb-4 mt-2">
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-wider">HCM.ai Solutions</h2>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold mt-0.5">Enterprise Employee Paystub</p>
                    </div>
                    <div className="text-right mr-2">
                      <span className="text-xs font-bold font-mono text-slate-400">PAYSLIP ID: {employee.id?.slice(0, 8).toUpperCase() || 'DRAFT'}</span>
                      <p className="text-[10px] text-slate-500 mt-1">Month: <strong>{selectedMonth}</strong></p>
                    </div>
                  </div>

                  {/* Employee / Issue details */}
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Employee Details</p>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{employee.name}</p>
                      <p className="text-slate-400 font-mono mt-0.5">{employee.employeeId}</p>
                      <p className="text-slate-500 mt-0.5">{employee.role || 'Employee'} • {employee.department || 'N/A'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">Attendance Summary</p>
                      <p className="text-slate-600 dark:text-slate-400">Working Days: <strong>{employee.totalWorkingDays ?? 0}</strong></p>
                      <p className="text-slate-600 dark:text-slate-400">Days Present: <strong>{employee.presentDays ?? 0}</strong></p>
                      <p className="text-slate-600 dark:text-slate-400">Paid Leaves: <strong>{employee.paidLeaveDays ?? 0}</strong></p>
                      <p className="text-slate-600 dark:text-slate-400">LOP Days: <strong>{employee.unpaidLeaveDays ?? 0}</strong></p>
                    </div>
                  </div>

                  {/* Breakdown Tables (Earnings vs Deductions) */}
                  <div className="grid grid-cols-2 gap-6 pt-2">
                    {/* Earnings */}
                    <div className="space-y-1 text-xs">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase border-b pb-1 border-slate-100 dark:border-slate-800">Earnings</h4>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Basic Salary</span>
                        <span>{formatCurrency(basicVal, defaultCurrency)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Bonus & Allowances</span>
                        <span>{formatCurrency(bonusVal, defaultCurrency)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 font-bold border-t border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 mt-2">
                        <span>Gross Earnings</span>
                        <span>{formatCurrency(totalEarnings, defaultCurrency)}</span>
                      </div>
                    </div>

                    {/* Deductions */}
                    <div className="space-y-1 text-xs">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase border-b pb-1 border-slate-100 dark:border-slate-800">Withholding / Deductions</h4>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Federal Income Tax</span>
                        <span>{formatCurrency(fedTax, defaultCurrency)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Social Security (FICA)</span>
                        <span>{formatCurrency(socialSecurity, defaultCurrency)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Medicare</span>
                        <span>{formatCurrency(medicare, defaultCurrency)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>State Tax</span>
                        <span>{formatCurrency(stateTax, defaultCurrency)}</span>
                      </div>
                      <div className="flex justify-between py-1 text-slate-600 dark:text-slate-300">
                        <span>Custom Deductions</span>
                        <span>{formatCurrency(customDeductions, defaultCurrency)}</span>
                      </div>
                      <div className="flex justify-between py-1.5 font-bold border-t border-slate-100 dark:border-slate-800/80 text-slate-800 dark:text-slate-100 mt-2">
                        <span>Total Withheld</span>
                        <span>{formatCurrency(totalTax + customDeductions, defaultCurrency)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Total Summary */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl flex justify-between items-center border border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">Net Salary Payable</span>
                      <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-0.5">{formatCurrency(netPayable, defaultCurrency)}</h3>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">Draft</span>
                    </div>
                  </div>

                  {/* Footer terms */}
                  <div className="text-center text-[9px] text-slate-400 mt-6 border-t pt-4 border-slate-100 dark:border-slate-800">
                    <p>This is a computer-generated document and does not require a physical signature.</p>
                    <p className="mt-0.5">HCM.ai Payroll Processing Service Platform. Confidential. © 2026</p>
                  </div>
                </div>
              </div>

              <div className="p-8 border-t border-slate-100 bg-slate-50 flex items-center gap-4 shrink-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95 text-sm"
                >
                  Save Salary split
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default PayrollBreakdownModal;
