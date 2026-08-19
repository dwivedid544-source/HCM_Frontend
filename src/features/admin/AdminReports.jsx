import React from 'react';
import { motion } from 'framer-motion';
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
  Briefcase
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useState } from 'react';
import ReportSchedulerModal from '../../shared/components/admin/ReportSchedulerModal';
import ReportBuilderWizard from '../../shared/components/admin/ReportBuilderWizard';

const AdminReports = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [builderCategory, setBuilderCategory] = useState(null);
  const reportCategories = [
    { title: 'Workforce Analytics', icon: Users, count: 12, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Financial Reports', icon: DollarSign, count: 8, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Hiring Performance', icon: Briefcase, count: 6, color: 'text-primary-600', bg: 'bg-primary-50' },
    { title: 'Compliance Audits', icon: ShieldCheck, count: 4, color: 'text-rose-600', bg: 'bg-rose-50' },
    { title: 'Leave & Attendance', icon: Clock, count: 10, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'AI & Productivity', icon: Target, count: 5, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const filteredCategories = reportCategories.filter(cat => cat.title.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
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


      {/* Categories Grid */}
      <div className="space-y-8">
         <div className="flex items-center justify-between border-b border-slate-50 pb-4">
            <h3 className="text-sm font-bold text-slate-400">Library Categories</h3>
            <div className="relative w-80">
               <Search className="absolute left-3 top-2.5 text-slate-300" size={16} />
               <input type="text" placeholder="Search templates..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10 h-10 bg-white shadow-sm border-none text-xs font-bold" />
            </div>
         </div>

         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCategories.map((cat, i) => (
               <motion.div
                 key={i}
                 onClick={() => setBuilderCategory(cat.title)}
                 whileHover={{ y: -5, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                 className="card p-8 bg-white border border-slate-50 shadow-soft group cursor-pointer"
               >
                  <div className="flex items-start justify-between mb-8">
                     <div className={cn("p-4 rounded-[2rem] transition-all group-hover:rotate-6", cat.bg, cat.color)}>
                        <cat.icon size={28} />
                     </div>
                     <span className="text-[10px] font-bold text-slate-300 font-bold">{cat.count} Templates</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 mb-2 tracking-tight dark:text-white">{cat.title}</h4>
                  <p className="text-xs font-medium text-slate-400 leading-relaxed tracking-tight mb-8">Comprehensive datasets and visualizations for organization-wide oversight.</p>
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                     <span className="text-[9px] font-black font-bold text-primary-600">Explore Suite</span>
                     <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:bg-primary-600 group-hover:text-white transition-all group-hover:scale-110">
                        <ArrowUpRight size={16} />
                     </div>
                  </div>
               </motion.div>
            ))}
         </div>
      </div>


      <ReportSchedulerModal isOpen={isSchedulerOpen} onClose={() => setIsSchedulerOpen(false)} />
      <ReportBuilderWizard isOpen={!!builderCategory} onClose={() => setBuilderCategory(null)} initialCategory={builderCategory !== 'custom' ? builderCategory : null} />
    </div>
  );
};

export default AdminReports;
