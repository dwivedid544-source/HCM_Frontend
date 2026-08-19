import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  Building2, 
  Download, 
  Filter, 
  Search, 
  ArrowUpRight, 
  PieChart, 
  Activity, 
  Zap, 
  Star, 
  Target,
  Clock,
  Briefcase,
  FileText,
  Trash2,
  CheckCircle2,
  FileCheck,
  Eye
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAdmin } from '../../context/AdminContext';
import { generateReportPDF } from '../../utils/reportPdfGenerator';
import ReportSchedulerModal from '../../shared/components/admin/ReportSchedulerModal';
import ReportBuilderWizard from '../../shared/components/admin/ReportBuilderWizard';
import ReportPreviewModal from '../../shared/components/admin/ReportPreviewModal';

const AdminReports = () => {
  const adminContext = useAdmin();
  const { 
    customReports = [], 
    deleteCustomReport, 
    showToast,
    users = [],
    departments = [],
    payrollList = [],
    benefits = [],
    shifts = [],
    holidays = [],
    policies = [],
    systemLogs = [],
    aiModules = []
  } = adminContext || {};

  const [searchTerm, setSearchTerm] = useState('');
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [builderCategory, setBuilderCategory] = useState(null);
  const [previewReport, setPreviewReport] = useState(null);

  const reportCategories = [
    { title: 'Workforce Analytics', icon: Users, count: 12, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
    { title: 'Financial Reports', icon: DollarSign, count: 8, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
    { title: 'Hiring Performance', icon: Briefcase, count: 6, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-950/40' },
    { title: 'Compliance Audits', icon: ShieldCheck, count: 4, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/40' },
    { title: 'Leave & Attendance', icon: Clock, count: 10, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/40' },
    { title: 'AI & Productivity', icon: Target, count: 5, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-950/40' },
  ];

  const filteredCategories = reportCategories.filter(cat => cat.title.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleDownloadPDF = (report) => {
    try {
      generateReportPDF(report, {
        users,
        departments,
        payrollList,
        benefits,
        shifts,
        holidays,
        policies,
        systemLogs,
        aiModules
      });
      showToast('PDF report generated and downloaded.');
    } catch (err) {
      console.error('Failed to download PDF:', err);
      showToast('Error generating PDF report', 'error');
    }
  };

  return (
    <div className="space-y-10 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Organization Reports</h1>
          <p className="text-slate-500 font-medium tracking-tight">Generate deep-dive analytics, export historical data and track multi-dept performance</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsSchedulerOpen(true)} className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2">
            <Calendar size={18} />
            <span className="hidden sm:inline">Scheduling</span>
          </button>
          <button onClick={() => setBuilderCategory('custom')} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200">
             <Star size={18} fill="currentColor" />
             <span>Create Custom Report</span>
          </button>
        </div>
      </div>

      {/* Generated Custom Reports Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="text-indigo-600" size={20} />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Generated Custom Reports</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              {customReports.length}
            </span>
          </div>
        </div>

        {customReports.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <FileText className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={36} />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No custom reports compiled yet</p>
            <p className="text-xs text-slate-400 mt-1">Click "Create Custom Report" to compile tailored multi-module intelligence reports</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customReports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                      <FileText size={22} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
                        {report.status || 'Ready'}
                      </span>
                      {deleteCustomReport && (
                        <button
                          onClick={() => deleteCustomReport(report.id)}
                          className="text-slate-300 hover:text-rose-500 p-1 transition-colors"
                          title="Delete Report"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>

                  <h4 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 mb-1" title={report.title}>
                    {report.title}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium mb-4">
                    {new Date(report.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} • {report.size || '128 KB'}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {Array.isArray(report.modules) && report.modules.map((m, idx) => (
                      <span key={idx} className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {m}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 truncate">
                    {report.format || 'Full Analytics'}
                  </span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => setPreviewReport(report)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      title="View Report Details"
                    >
                      <Eye size={14} /> View
                    </button>
                    <button
                      onClick={() => handleDownloadPDF(report)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                      title="Download PDF"
                    >
                      <Download size={14} /> Download PDF
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Categories Grid */}
      <div className="space-y-8">
         <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-slate-400">Library Categories</h3>
            <div className="relative w-80">
               <Search className="absolute left-3 top-2.5 text-slate-300" size={16} />
               <input type="text" placeholder="Search templates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10 h-10 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800 text-xs font-bold w-full rounded-xl" />
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((cat, i) => (
               <motion.div
                 key={i}
                 onClick={() => setBuilderCategory(cat.title)}
                 whileHover={{ y: -5, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                 className="card p-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 shadow-soft group cursor-pointer rounded-3xl"
               >
                  <div className="flex items-start justify-between mb-8">
                     <div className={cn("p-4 rounded-[2rem] transition-all group-hover:rotate-6", cat.bg, cat.color)}>
                        <cat.icon size={28} />
                     </div>
                     <span className="text-[10px] font-bold text-slate-400 font-bold">{cat.count} Templates</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight dark:text-white">{cat.title}</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed tracking-tight mb-8">Comprehensive datasets and visualizations for organization-wide oversight.</p>
                  <div className="pt-6 border-t border-slate-50 dark:border-slate-800/80 flex items-center justify-between">
                     <span className="text-[9px] font-black font-bold text-primary-600 dark:text-primary-400">Explore Suite</span>
                     <div className="w-8 h-8 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary-600 group-hover:text-white transition-all group-hover:scale-110">
                        <ArrowUpRight size={16} />
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>

      <ReportSchedulerModal isOpen={isSchedulerOpen} onClose={() => setIsSchedulerOpen(false)} />
      <ReportBuilderWizard isOpen={!!builderCategory} onClose={() => setBuilderCategory(null)} initialCategory={builderCategory !== 'custom' ? builderCategory : null} />
      <ReportPreviewModal isOpen={!!previewReport} onClose={() => setPreviewReport(null)} report={previewReport} />
    </div>
  );
};

export default AdminReports;
