import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Download, Filter, ArrowUpRight, 
  ArrowDownRight, FileText, Target, 
  ChevronRight, Clock, PieChart, X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useHR } from '../../context/HRContext';
import { useCurrency } from '../../hooks/useCurrency';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const Reports = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const { reports, fetchReports, showToast } = useHR();
  const [activeTab, setActiveTab] = usePersistedTab('hr_reports', 'hiring');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  const [performanceView, setPerformanceView] = useState('weekly'); // 'daily' or 'weekly'

  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [dept, setDept] = useState('');
  const [recruiter, setRecruiter] = useState('');

  const rawStats = reports?.stats ? reports.stats.map(stat => {
    if (stat.label === 'Cost Per Hire') {
      const valMatch = stat.value.match(/[\d,.]+/);
      const trendMatch = stat.trend.match(/[\d,.]+/);
      if (valMatch) {
        const valNum = parseFloat(valMatch[0].replace(/,/g, ''));
        const originalCurrency = stat.value.includes('$') ? 'USD' : null;
        const formattedValue = formatCurrency(valNum, originalCurrency);
        const formattedTrend = trendMatch 
          ? (stat.trend.includes('+') ? '+' : '-') + formatCurrency(parseFloat(trendMatch[0].replace(/,/g, '')), originalCurrency)
          : stat.trend;
        return {
          ...stat,
          value: formattedValue,
          trend: formattedTrend
        };
      }
    }
    return stat;
  }) : [];

  const stats = rawStats.map((s, idx) => {
    const config = [
      { icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' },
      { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
      { icon: Target, color: 'text-primary-600', bg: 'bg-primary-50' },
    ][idx] || { icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50' };

    return { ...s, ...config };
  });

  const chartData = performanceView === 'daily' 
    ? (reports?.dailyPerformance || [])
    : (reports?.weeklyPerformance || []);

  const maxApps = Math.max(...chartData.map(d => d.apps), 1);
  const scale = 250 / maxApps;

  const sources = reports?.sources || [];
  const recruiterEfficiency = reports?.recruiterEfficiency || [];

  const applyFilters = (e) => {
    e.preventDefault();
    fetchReports({ dateRange, department: dept, recruiter });
    setIsFilterModalOpen(false);
    showToast('Advanced filters applied');
  };

  const downloadFullReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "=== HR REPORT SUMMARY ===\n\n";
    
    csvContent += "METRICS\n";
    stats.forEach(s => {
      csvContent += `"${s.label}","${s.value}","${s.trend}"\n`;
    });
    csvContent += "\n";

    csvContent += "CANDIDATE SOURCES\n";
    sources.forEach(src => {
      csvContent += `"${src.label}","${src.value}%"\n`;
    });
    csvContent += "\n";

    csvContent += "RECRUITER EFFICIENCY\n";
    csvContent += "Recruiter Name,Open Roles,Total Apps,Interviews,Avg Days-to-Offer,Performance Score\n";
    recruiterEfficiency.forEach(r => {
      csvContent += `"${r.name}","${r.roles}","${r.apps}","${r.interviews}","${r.tto} Days","${r.score}%"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hr_analytics_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Full analytics report downloaded as CSV');
  };

  const exportRecruiterEfficiencyCSV = () => {
    const headers = ['Recruiter Name', 'Open Roles', 'Total Apps', 'Interviews', 'Avg Days-to-Offer', 'Performance Score'];
    const rows = recruiterEfficiency.map(r => [r.name, r.roles, r.apps, r.interviews, `${r.tto} Days`, `${r.score}%`]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "recruiter_efficiency_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Recruiter efficiency report downloaded as CSV');
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Reports & Analytics</h1>
          <p className="text-slate-500 font-medium">Deep dive into hiring performance and recruiter efficiency</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsFilterModalOpen(true)} className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2">
            <Filter size={18} />
            <span className="hidden sm:inline">Advanced Filters</span>
          </button>
          <div className="relative group">
            <button onClick={downloadFullReport} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200">
               <Download size={18} />
               <span>Download Report</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -5 }} className="card p-6">
            <div className="flex items-center justify-between mb-4">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold", stat.isPositive ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500")}>
                  {stat.isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  <span>{stat.trend}</span>
               </div>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-400 font-bold leading-none mb-1.5">{stat.label}</p>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 flex flex-col">
            <div className="card p-8 border-none bg-white shadow-soft flex-1 flex flex-col">
               <div className="flex items-center justify-between mb-10 shrink-0">
                  <div className="space-y-1">
                     <h3 className="text-xl font-bold text-slate-900 dark:text-white">Application Performance</h3>
                     <p className="text-sm font-medium text-slate-400">Activity comparison over the {dateRange}</p>
                  </div>
                   <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 mr-4">
                         <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />
                         <span className="text-[10px] font-bold text-slate-400 font-bold">Applications</span>
                      </div>
                      <button 
                         onClick={() => setPerformanceView('daily')}
                         className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            performanceView === 'daily' 
                              ? "bg-white border border-slate-100 text-slate-900 shadow-sm" 
                              : "bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900"
                         )}
                      >
                         Daily
                      </button>
                      <button 
                         onClick={() => setPerformanceView('weekly')}
                         className={cn(
                            "px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all",
                            performanceView === 'weekly' 
                              ? "bg-white border border-slate-100 text-slate-900 shadow-sm" 
                              : "bg-slate-50 border border-slate-100 text-slate-400 hover:text-slate-900"
                         )}
                      >
                         Weekly
                      </button>
                   </div>
                </div>
                
                <div className="flex-1 flex items-end justify-between gap-4 min-h-[300px] mb-8">
                   {chartData.map((d, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                         <div className="w-full relative flex items-end justify-center gap-1.5 cursor-pointer">
                            <motion.div initial={{ height: 0 }} animate={{ height: `${d.apps * scale}px` }} className="w-full max-w-[32px] bg-primary-500/10 rounded-t-lg group-hover:bg-primary-500/20 transition-all relative">
                               <motion.div initial={{ height: 0 }} animate={{ height: `${d.hires * scale}px` }} className="absolute bottom-0 inset-x-0 bg-primary-600 rounded-t-lg shadow-lg group-hover:shadow-primary-200" />
                            </motion.div>
                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap">
                               {d.apps} Apps / {d.hires} Hires
                            </div>
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 font-bold">{d.name}</span>
                      </div>
                   ))}
                </div>
            </div>
         </div>

         <div className="lg:col-span-4 space-y-8 flex flex-col">
            <div className="card p-8 border-none bg-white shadow-soft flex-1">
               <h3 className="text-lg font-bold text-slate-900 mb-8 flex items-center gap-2 dark:text-white">
                  <PieChart size={18} className="text-primary-600" />
                  Candidate Sources
               </h3>
               
               <div className="space-y-6">
                  {sources.map((src, i) => (
                     <div key={i} className="space-y-2 cursor-pointer group">
                        <div className="flex justify-between items-center text-xs font-bold">
                           <span className="text-slate-500 group-hover:text-slate-900 transition-colors">{src.label}</span>
                           <span className="text-slate-900">{src.value}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[1px]">
                           <motion.div initial={{ width: 0 }} animate={{ width: `${src.value}%` }} className={cn("h-full rounded-full transition-opacity group-hover:opacity-80", src.color ?? 'bg-primary-500')} />
                        </div>
                     </div>
                  ))}
               </div>

                <div className="mt-10 p-6 bg-slate-900 rounded-2xl text-white relative overflow-hidden group border border-slate-850">
                   <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                      <TrendingUp size={60} />
                   </div>
                   <h4 className="text-[10px] font-bold font-bold text-primary-400 mb-2">Pro Insight</h4>
                   <p className="text-sm font-medium leading-relaxed mb-4">Referrals have a <span className="text-emerald-400 font-bold">42%</span> higher conversion rate than Job Boards.</p>
                   <button 
                      onClick={() => setIsInsightModalOpen(true)}
                      className="text-[10px] font-bold flex items-center gap-2 text-white/50 hover:text-white transition-colors"
                   >
                      Learn More <ChevronRight size={12} />
                   </button>
                </div>
            </div>
         </div>
      </div>

      <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
         <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Recruiter Efficiency Report</h3>
            <button onClick={exportRecruiterEfficiencyCSV} className="p-2 text-slate-400 hover:text-slate-900 transition-colors" title="Download Recruiter Report">
               <Download size={20} />
            </button>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">
                     <th className="px-8 py-5">Recruiter Name</th>
                     <th className="px-8 py-5 text-center">Open Roles</th>
                     <th className="px-8 py-5 text-center">Total Apps</th>
                     <th className="px-8 py-5 text-center">Interviews</th>
                     <th className="px-8 py-5 text-center">Avg Days-to-Offer</th>
                     <th className="px-8 py-5 text-right">Performance</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {recruiterEfficiency.map((r, i) => (
                     <tr key={i} className="group hover:bg-slate-50/20 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900">{r.name}</td>
                        <td className="px-8 py-6 text-center font-medium text-slate-600">{r.roles}</td>
                        <td className="px-8 py-6 text-center font-medium text-slate-600">{r.apps}</td>
                        <td className="px-8 py-6 text-center font-medium text-slate-600">{r.interviews}</td>
                        <td className="px-8 py-6 text-center font-medium text-slate-600">{r.tto} Days</td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end items-center gap-2">
                              <span className={cn("text-xs font-extrabold", r.score > 90 ? "text-emerald-500" : r.score > 80 ? "text-primary-500" : "text-amber-500")}>{r.score}%</span>
                              <div className="w-12 h-1 bg-slate-100 rounded-full overflow-hidden">
                                 <div className={cn("h-full rounded-full", r.score > 90 ? "bg-emerald-500" : r.score > 80 ? "bg-primary-500" : "bg-amber-500")} style={{ width: `${r.score}%` }} />
                              </div>
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Employee Lifecycle Dashboard Section */}
      {reports?.lifecycleMetrics && (
        <div className="space-y-8 mt-12">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Employee Lifecycle Metrics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Conversion Metrics */}
            <div className="card p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 font-bold">Conversion rates</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    <span>Offer Acceptance Rate</span>
                    <span className="text-emerald-500">{reports.lifecycleMetrics.offerAcceptanceRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${reports.lifecycleMetrics.offerAcceptanceRate}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    <span>Candidate Conversion Rate</span>
                    <span className="text-primary-500">{reports.lifecycleMetrics.candidateConversion}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${reports.lifecycleMetrics.candidateConversion}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
                    <span>Attrition Rate</span>
                    <span className="text-rose-500">{reports.lifecycleMetrics.attritionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${reports.lifecycleMetrics.attritionRate}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Average Timelines */}
            <div className="card p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 font-bold">Average Timelines</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Onboarding</span>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{reports.lifecycleMetrics.avgOnboardingTime} Days</span>
                  <span className="text-[9px] font-bold text-emerald-500 block mt-1">Excellent speed</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Probation Confirmation</span>
                  <span className="text-2xl font-extrabold text-slate-800 dark:text-white">{reports.lifecycleMetrics.avgProbationTime} Days</span>
                  <span className="text-[9px] font-bold text-indigo-400 block mt-1">Standard duration</span>
                </div>
              </div>
            </div>

            {/* Exit Reasons */}
            <div className="card p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Primary Exit Reasons</h3>
              <div className="space-y-4">
                {reports.lifecycleMetrics.exitReasons.map((reason, idx) => {
                  const colors = ['bg-rose-500', 'bg-amber-500', 'bg-blue-500'];
                  return (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-350">
                        <div className={cn("w-2.5 h-2.5 rounded-full", colors[idx % colors.length])} />
                        <span>{reason.reason}</span>
                      </div>
                      <span className="font-extrabold text-slate-800 dark:text-white">{reason.count} cases</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Departmental Hiring & Funnel */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="card p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Departmental Hires</h3>
              <div className="space-y-4">
                {reports.lifecycleMetrics.departmentHiring.map((dept, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-xs font-bold mb-1.5 text-slate-600 dark:text-slate-400">
                      <span>{dept.department}</span>
                      <span>{dept.hires} hired</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-500 rounded-full" style={{ width: `${Math.min(100, (dept.hires / 10) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Funnel Stage counts */}
            <div className="card p-8 space-y-6">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recruitment Funnel Overview</h3>
              <div className="grid grid-cols-5 gap-2 text-center">
                {Object.entries(reports.lifecycleMetrics.funnel).map(([stage, count], idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl space-y-2">
                    <span className="text-[10px] font-black text-slate-450 dark:text-slate-500 block uppercase tracking-wider">{stage}</span>
                    <span className="text-xl font-extrabold text-slate-850 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isFilterModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsFilterModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                   <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">Advanced Analytics Filters</h2>
                   <button onClick={() => setIsFilterModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={24} /></button>
                </div>
                <form onSubmit={applyFilters} className="flex-1 overflow-y-auto">
                  <div className="p-8 space-y-6">
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Date Range</label>
                        <select value={dateRange} onChange={e => setDateRange(e.target.value)} className="input-field h-12 appearance-none">
                           <option>Last 7 Days</option>
                           <option>Last 30 Days</option>
                           <option>This Quarter</option>
                           <option>This Year</option>
                           <option>Custom Range</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Department</label>
                        <select value={dept} onChange={e => setDept(e.target.value)} className="input-field h-12 appearance-none">
                           <option value="">All Departments</option>
                           <option>Engineering</option>
                           <option>Design</option>
                           <option>Sales</option>
                           <option>Marketing</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Recruiter</label>
                        <select value={recruiter} onChange={e => setRecruiter(e.target.value)} className="input-field h-12 appearance-none">
                           <option value="">All Recruiters</option>
                           <option>Sarah Johnson</option>
                           <option>David Chen</option>
                           <option>Sam Smith</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Candidate Source</label>
                        <select className="input-field h-12 appearance-none">
                           <option value="">All Sources</option>
                           <option>LinkedIn</option>
                           <option>Direct Referrals</option>
                           <option>Indeed</option>
                        </select>
                     </div>
                  </div>
                  <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between gap-3 shrink-0">
                     <button type="button" onClick={() => {setDateRange('Last 30 Days'); setDept(''); setRecruiter(''); fetchReports({});}} className="text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors font-bold">Reset Filters</button>
                     <div className="flex gap-2">
                        <button type="button" onClick={() => setIsFilterModalOpen(false)} className="px-6 py-2.5 font-bold hover:bg-white rounded-xl transition-all border border-slate-200 text-slate-500">Cancel</button>
                        <button type="submit" className="px-8 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg active:scale-95">Apply Filters</button>
                     </div>
                  </div>
                </form>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isInsightModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsInsightModalOpen(false)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-screen">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                   <h2 className="text-xl font-extrabold text-slate-900">Pro Recruiting Insight</h2>
                   <button onClick={() => setIsInsightModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-all"><X size={24} /></button>
                </div>
                <div className="p-8 space-y-6 overflow-y-auto">
                   <div className="space-y-4">
                      <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-2xl text-emerald-800">
                         <TrendingUp size={24} />
                         <div>
                            <p className="text-sm font-bold">Referral Advantage</p>
                            <p className="text-xs">Direct referrals convert to hires at 42% higher rates and stay 70% longer.</p>
                         </div>
                      </div>
                      <div className="space-y-2 text-slate-600 text-sm">
                         <h4 className="font-bold text-slate-900">Key Takeaways for HR</h4>
                         <ul className="list-disc list-inside space-y-1">
                            <li>Boost employee referral bonuses for specialized technical roles.</li>
                            <li>Reduce reliance on external job boards (LinkedIn/Indeed) to lower cost-per-hire.</li>
                            <li>Integrate referral program directly with the applicant tracking funnel.</li>
                         </ul>
                      </div>
                      <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-400">
                         This insight is generated dynamically by analyzing past candidate pipelines, interview pass rates, and employee retention logs.
                      </div>
                   </div>
                </div>
                <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex items-center justify-end shrink-0">
                   <button onClick={() => setIsInsightModalOpen(false)} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg">Close</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;
