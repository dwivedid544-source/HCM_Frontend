import React from 'react';
import { 
  Plus, 
  Filter, 
  Download, 
  MoreVertical, 
  TrendingUp, 
  Users, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../../utils/cn';

const DashboardPage = ({ title, subtitle, stats, tableData, actionLabel = "Add New" }) => {
  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary h-11 flex items-center justify-center gap-2">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button className="btn-primary h-11 flex items-center justify-center gap-2">
            <Plus size={18} />
            <span>{actionLabel}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {(stats || [
          { label: 'Total Members', value: '1,284', trend: '+12%', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Active Tasks', value: '42', trend: '+5%', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', value: '852', trend: '+18%', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending Items', value: '12', trend: '-2%', icon: AlertCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ]).map((stat, idx) => (
          <motion.div 
            key={idx}
            whileHover={{ y: -5 }}
            className="card group hover:border-primary-200 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className={cn("p-2.5 rounded-xl transition-colors bg-opacity-100 dark:bg-opacity-10", stat.bg)}>
                <stat.icon size={22} className={stat.color} />
              </div>
              <div className={cn(
                "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                stat.trend.startsWith('+') ? "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30" : "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/30"
              )}>
                <TrendingUp size={12} className={cn(stat.trend.startsWith('-') && "rotate-180")} />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 font-bold">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1 tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Table Section */}
      <div className="card border-none overflow-hidden sm:border sm:border-slate-100 dark:sm:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 border-b border-slate-50 dark:border-slate-800">
          <div className="relative w-full sm:w-80 group">
            <Search size={18} className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search records..." 
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl text-sm focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none text-slate-900 dark:text-slate-100"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl transition-colors">
              <Filter size={18} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl transition-all">
              <span>Status: All</span>
              <ChevronDown size={16} />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-950/40">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">User / Member</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Role / Dept</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Activity</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {(tableData || [
                { id: 1, name: 'Alex Johnson', email: 'alex.j@company.com', status: 'Active', role: 'Full Stack Dev', dept: 'Engineering', activity: 'High', date: '2 mins ago' },
                { id: 2, name: 'Sarah Miller', email: 's.miller@company.com', status: 'Pending', role: 'Product Design', dept: 'Creative', activity: 'Medium', date: '1 hour ago' },
                { id: 3, name: 'Michael Chen', email: 'm.chen@company.com', status: 'Active', role: 'Data Scientist', dept: 'AI Lab', activity: 'Low', date: 'Yesterday' },
                { id: 4, name: 'Jessica Taylor', email: 'j.taylor@company.com', status: 'Inactive', role: 'HR manager', dept: 'HR Dept', activity: 'None', date: '3 days ago' },
                { id: 5, name: 'David Wilson', email: 'd.wilson@company.com', status: 'Active', role: 'Solution Architect', dept: 'Engineering', activity: 'High', date: 'Oct 24' },
              ]).map((row, idx) => (
                <tr key={idx} className="group hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-950/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-xs ring-4 ring-white dark:ring-slate-900">
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{row.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{row.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase",
                      row.status === 'Active' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400" : 
                      row.status === 'Pending' ? "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                    )}>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        row.status === 'Active' ? "bg-emerald-500" : 
                        row.status === 'Pending' ? "bg-amber-500" : "bg-slate-400"
                      )} />
                      {row.status}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-none">{row.role}</p>
                    <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mt-1 tracking-wider">{row.dept}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={cn("h-full transition-all duration-1000", 
                          row.activity === 'High' ? "w-full bg-primary-500" : 
                          row.activity === 'Medium' ? "w-2/3 bg-amber-500" : 
                          row.activity === 'Low' ? "w-1/3 bg-blue-500" : "w-0"
                        )} 
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-500 dark:text-slate-400">{row.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-50 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 font-bold">Showing 5 of 24 results</p>
          <div className="flex items-center gap-1">
            <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg disabled:opacity-30" disabled>
              <ChevronLeft size={18} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-primary-600 text-white text-xs font-bold shadow-soft">1</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">2</button>
            <button className="w-8 h-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold">3</button>
            <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-components used in DashboardPage
const ChevronLeft = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
);

const ChevronRight = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
);

const ChevronDown = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
);

export default DashboardPage;
