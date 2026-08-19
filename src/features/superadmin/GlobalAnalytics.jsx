import React, { useState, useEffect, useRef } from 'react';
import { superAdminAPI } from '../../utils/apiService';
import {
  BarChart2,
  TrendingUp,
  Activity,
  Cpu,
  Database,
  Globe,
  RefreshCw,
  Download,
  Calendar,
  Zap,
  Users,
  ShieldAlert,
  Server,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  Loader2,
  XCircle,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../shared/components/layout/PageHeader';
import { StatCard } from './StatCard';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// ── Dynamic SVG Chart Component ──────────────────────────────────────────
const DynamicAnalyticsChart = ({ chartData }) => {
  if (!chartData || !chartData.labels || chartData.labels.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs font-semibold">
        No chart metrics available for this query.
      </div>
    );
  }

  const { type = 'bar', labels = [], datasets = [] } = chartData;
  const mainDataset = datasets[0] || { label: 'Data', data: [] };
  const rawValues = mainDataset.data || [];
  const maxVal = Math.max(...rawValues, 10);

  // SVG Colors
  const colors = ['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

  if (type === 'pie') {
    const total = rawValues.reduce((acc, v) => acc + (Number(v) || 0), 0) || 1;
    let accumulatedAngle = 0;

    return (
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 py-4">
        <svg viewBox="0 0 100 100" className="w-48 h-48 drop-shadow-md shrink-0">
          {rawValues.map((val, idx) => {
            const num = Number(val) || 0;
            const sliceAngle = (num / total) * 360;
            const startAngle = accumulatedAngle;
            accumulatedAngle += sliceAngle;

            const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
            const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
            const x2 = 50 + 40 * Math.cos((Math.PI * (startAngle + sliceAngle)) / 180);
            const y2 = 50 + 40 * Math.sin((Math.PI * (startAngle + sliceAngle)) / 180);

            const largeArc = sliceAngle > 180 ? 1 : 0;
            const pathData = `M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`;

            return (
              <path
                key={idx}
                d={pathData}
                fill={colors[idx % colors.length]}
                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
              />
            );
          })}
          <circle cx="50" cy="50" r="22" className="fill-slate-900" />
        </svg>

        <div className="flex flex-wrap md:flex-col gap-2.5 text-xs">
          {labels.map((lbl, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[idx % colors.length] }} />
              <span className="font-bold text-slate-300">{lbl}:</span>
              <span className="font-mono text-white font-bold">{rawValues[idx] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'line') {
    const points = rawValues.map((v, i) => {
      const x = (i / Math.max(labels.length - 1, 1)) * 260 + 20;
      const y = 100 - ((Number(v) || 0) / maxVal) * 80;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div className="space-y-4 py-2">
        <svg viewBox="0 0 300 120" className="w-full h-44 overflow-visible">
          {/* Grid lines */}
          {[20, 60, 100].map((y, idx) => (
            <line key={idx} x1="10" y1={y} x2="290" y2={y} stroke="#334155" strokeDasharray="3 3" strokeWidth="0.5" />
          ))}
          {/* Line Path */}
          <polyline fill="none" stroke="#6366f1" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
          {/* Data Nodes */}
          {rawValues.map((v, i) => {
            const x = (i / Math.max(labels.length - 1, 1)) * 260 + 20;
            const y = 100 - ((Number(v) || 0) / maxVal) * 80;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="4" fill="#818cf8" stroke="#1e1b4b" strokeWidth="2" />
                <text x={x} y={y - 8} fill="#cbd5e1" fontSize="7" textAnchor="middle" fontWeight="bold">
                  {v}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="flex justify-between text-[10px] font-bold text-slate-400 px-2">
          {labels.map((lbl, idx) => (
            <span key={idx}>{lbl}</span>
          ))}
        </div>
      </div>
    );
  }

  // Default: Bar Chart
  return (
    <div className="space-y-3 py-2">
      {labels.map((lbl, idx) => {
        const val = Number(rawValues[idx]) || 0;
        const pct = Math.min(Math.round((val / maxVal) * 100), 100);
        return (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-bold text-slate-300">
              <span>{lbl}</span>
              <span className="font-mono text-indigo-400">{val}</span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

const GlobalAnalytics = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState(null);
  const [error, setError] = useState(null);

  // ── AI Analytics State ──────────────────────────────────────────
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStageText, setAiStageText] = useState('Analyzing workforce metrics...');
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState(null);
  const abortControllerRef = useRef(null);

  const suggestedPrompts = [
    { label: "📊 Attendance trends", query: "Show attendance trends for the last 30 days" },
    { label: "📈 Employee growth", query: "Show employee headcount growth over time" },
    { label: "🏢 Department comparison", query: "Compare attendance and productivity across departments" },
    { label: "🌴 Leave analysis", query: "Which department has the highest leave requests?" },
    { label: "💰 Payroll overview", query: "Show total payroll and compensation breakdown" },
    { label: "📌 Executive summary", query: "Give me an executive summary of company performance" }
  ];

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true);
        const response = await superAdminAPI.getAnalytics(timeRange);
        if (response?.data?.success) {
          setStatsData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to fetch analytics');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [timeRange]);

  const triggerExport = async () => {
    setToastMessage('Compiling and downloading CSV report...');
    setShowToast(true);
    try {
      const response = await superAdminAPI.exportAnalytics(timeRange);
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `analytics_export_${timeRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to export:', err);
    }
    setTimeout(() => setShowToast(false), 3000);
  };

  // ── AI Natural Language Analytics Handler ─────────────────────
  const handleRunAiAnalytics = async (customQuery) => {
    const queryToSubmit = (customQuery || aiQuery).trim();
    if (!queryToSubmit || aiLoading) return;

    // Abort previous in-flight request if present
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setAiError(null);
    setAiLoading(true);
    setAiStageText('Analyzing workforce metrics...');

    const stageTimer1 = setTimeout(() => setAiStageText('Generating AI insights...'), 1200);
    const stageTimer2 = setTimeout(() => setAiStageText('Preparing chart & recommendations...'), 2500);

    try {
      const response = await superAdminAPI.aiAnalytics(
        queryToSubmit,
        { timeRange },
        { signal: controller.signal }
      );

      if (response && response.data && response.data.success) {
        const payload = response.data.data;
        setAiResult(payload);
        setToastMessage('AI Analytics compiled successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
      } else {
        throw new Error(response?.data?.error?.message || 'Failed to generate AI analytics.');
      }
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') return;
      console.error("[AI Analytics] Query failed:", err.message);
      setAiError(err.response?.data?.error?.message || err.message || 'Unable to generate analytics right now.');
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setAiLoading(false);
      abortControllerRef.current = null;
    }
  };

  // ── Download PDF Report Handler ──────────────────────────────
  const handleDownloadPdfReport = () => {
    if (!aiResult) return;
    try {
      const doc = new jsPDF();
      const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
      
      // Title Header
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 32, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('HCM.ai — Executive AI Analytics Report', 14, 18);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on ${dateStr} • Query: "${aiResult.query || 'Workforce Analytics'}"`, 14, 26);

      // Executive Summary Section
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('1. Executive Summary', 14, 42);
      doc.setFontSize(9.5);
      doc.setFont('helvetica', 'normal');
      const splitSummary = doc.splitTextToSize(aiResult.summary || 'N/A', 180);
      doc.text(splitSummary, 14, 49);

      let currentY = 52 + (splitSummary.length * 5);

      // Key Metrics Table
      if (aiResult.metrics && aiResult.metrics.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Key Performance Metrics', 14, currentY);
        currentY += 4;

        const metricsData = aiResult.metrics.map(m => [m.label || '', m.value || '', m.change || '']);
        autoTable(doc, {
          startY: currentY,
          head: [['Metric', 'Value', 'Trend / Status']],
          body: metricsData,
          theme: 'grid',
          headStyles: { fillColor: [79, 70, 229] },
          styles: { fontSize: 8.5 }
        });
        currentY = doc.lastAutoTable.finalY + 10;
      }

      // AI Insights Table
      if (aiResult.insights && aiResult.insights.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('3. Strategic AI Insights', 14, currentY);
        currentY += 4;

        const insightsData = aiResult.insights.map(i => [i.title || '', i.description || '', i.type || 'info']);
        autoTable(doc, {
          startY: currentY,
          head: [['Insight Title', 'Observation', 'Classification']],
          body: insightsData,
          theme: 'striped',
          headStyles: { fillColor: [30, 41, 59] },
          styles: { fontSize: 8.5 }
        });
        currentY = doc.lastAutoTable.finalY + 10;
      }

      // Recommendations
      if (aiResult.recommendations && aiResult.recommendations.length > 0) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('4. Strategic Action Recommendations', 14, currentY);
        currentY += 6;
        doc.setFontSize(9.5);
        doc.setFont('helvetica', 'normal');
        aiResult.recommendations.forEach((rec) => {
          doc.text(`• ${rec}`, 18, currentY);
          currentY += 5.5;
        });
      }

      doc.save(`AI_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
      setToastMessage('PDF Report downloaded!');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
    } catch (pdfErr) {
      console.error("PDF generation failed:", pdfErr);
    }
  };

  // Real database analytics stats
  const analyticsStats = [
    {
      label: 'New Platform Users',
      value: statsData?.newUsers || 0,
      sub: 'Joined in this period',
      icon: Users,
      color: 'from-violet-500 to-indigo-600',
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      text: 'text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-900/30'
    },
    {
      label: 'New Organizations',
      value: statsData?.newOrganizations || 0,
      sub: 'Tenant signups',
      icon: Globe,
      color: 'from-emerald-500 to-teal-600',
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-900/30'
    },
    {
      label: 'Ecosystem Jobs',
      value: statsData?.newJobs || 0,
      sub: 'Job posts created',
      icon: Activity,
      color: 'from-blue-500 to-cyan-600',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-900/30'
    },
    {
      label: 'Support Tickets',
      value: statsData?.newTickets || 0,
      sub: 'Helpdesk requests',
      icon: ShieldAlert,
      color: 'from-amber-500 to-orange-600',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-100 dark:border-amber-900/30'
    }
  ];

  return (
    <motion.div
      className="space-y-8 w-full text-left"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl shadow-2xl border border-slate-800 dark:border-slate-100 text-sm font-bold"
          >
            <Download className="text-amber-400" size={16} />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <PageHeader
        icon={BarChart2}
        title="Global Analytics Suite"
        subtitle="Platform-wide server loads, API telemetry, database efficiency, and ecosystem performance logs."
      >
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          {['7d', '30d', '12m'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold uppercase transition-all ${timeRange === range
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
            >
              {range}
            </button>
          ))}
        </div>
        <button
          onClick={triggerExport}
          className="btn-primary flex items-center justify-center gap-2 shadow-lg shadow-primary-200 dark:shadow-none"
        >
          <Download size={16} />
          <span>Export Analytics</span>
        </button>
      </PageHeader>

      {/* Analytics KPI Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsStats.map((stat, idx) => (
          <StatCard
            key={idx}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
            sub={stat.sub}
            style={stat}
            isLoading={isLoading}
          />
        ))}
      </div>

      {/* ── ✨ AI NATURAL LANGUAGE ANALYTICS ASSISTANT ─────────────────── */}
      <motion.div variants={cardVariants} className="bg-slate-900 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden space-y-6">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-600 rounded-full blur-[90px] opacity-25"></div>
        
        {/* Title & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles size={22} className="text-amber-400 animate-pulse" />
              <h3 className="text-xl font-black text-white tracking-tight">AI Natural Language Analytics</h3>
              <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-[10px] font-bold rounded-full uppercase tracking-wider">
                NL Query Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Ask questions about your workforce using natural language. Query real aggregated database context instantly.
            </p>
          </div>
        </div>

        {/* Input & Action Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleRunAiAnalytics();
          }}
          className="flex flex-col sm:flex-row items-center gap-3 relative z-10"
        >
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-3.5 text-slate-500" size={18} />
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Ask about employees, attendance trends, leave rates, department comparison..."
              className="w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl pl-12 pr-4 h-13 text-xs font-semibold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-800 transition-all shadow-inner"
            />
          </div>

          <button
            type="submit"
            disabled={!aiQuery.trim() || aiLoading}
            className="w-full sm:w-auto h-13 px-7 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-2xl text-xs shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {aiLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{aiStageText}</span>
              </>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Generate Analytics</span>
              </>
            )}
          </button>
        </form>

        {/* Suggested Prompts Chips */}
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1">Suggested Prompts</span>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setAiQuery(p.query);
                  handleRunAiAnalytics(p.query);
                }}
                className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700/70 hover:border-indigo-400 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-all shadow-2xs hover:scale-102"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error State */}
        {aiError && (
          <div className="p-4 bg-rose-950/40 border border-rose-800/60 rounded-2xl flex items-center justify-between gap-3 text-xs text-rose-300 relative z-10">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-rose-400 shrink-0" />
              <span>{aiError}</span>
            </div>
            <button
              onClick={() => handleRunAiAnalytics()}
              className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 text-white font-bold rounded-xl text-[11px] transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State (Before first query) */}
        {!aiResult && !aiLoading && !aiError && (
          <div className="p-8 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-center space-y-3 relative z-10">
            <Sparkles size={36} className="mx-auto text-indigo-400 animate-pulse" />
            <h4 className="text-sm font-bold text-slate-200">✨ Ask AI About Your Workforce & Organization</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Query real attendance metrics, leave trends, headcount growth, or department comparisons using natural language.
            </p>
          </div>
        )}

        {/* ── AI ANALYTICS RESULTS DASHBOARD ───────────────────────────── */}
        {aiResult && !aiLoading && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-4 border-t border-slate-800 relative z-10">
            
            {/* Header & Export Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Query Result</span>
                <h4 className="text-base font-black text-white tracking-tight mt-0.5">"{aiResult.query}"</h4>
              </div>

              <button
                onClick={handleDownloadPdfReport}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-lg transition-colors flex items-center justify-center gap-2"
              >
                <Download size={14} />
                <span>Generate PDF Report</span>
              </button>
            </div>

            {/* Executive Summary Card */}
            <div className="p-5 bg-gradient-to-r from-indigo-950/80 via-slate-800 to-indigo-950/80 border border-indigo-500/30 rounded-2xl space-y-2">
              <h5 className="text-[10px] uppercase font-bold text-indigo-300 tracking-widest flex items-center gap-1.5">
                <Sparkles size={13} className="text-amber-400" />
                Executive Summary
              </h5>
              <p className="text-xs font-medium text-slate-200 leading-relaxed">{aiResult.summary}</p>
            </div>

            {/* Key Metrics Grid */}
            {aiResult.metrics && aiResult.metrics.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Key Performance Metrics</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {aiResult.metrics.map((m, i) => (
                    <div key={i} className="p-4 bg-slate-800/80 border border-slate-700/60 rounded-2xl space-y-1">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate">{m.label}</p>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-lg font-black text-white">{m.value}</span>
                        {m.change && (
                          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800/50">
                            {m.change}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Insights & Dynamic Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Dynamic SVG Chart */}
              <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                    {aiResult.chart?.type === 'pie' ? <PieChart size={14} className="text-indigo-400" /> : aiResult.chart?.type === 'line' ? <LineChart size={14} className="text-indigo-400" /> : <BarChart size={14} className="text-indigo-400" />}
                    <span>Visual Trend Visualization ({aiResult.chart?.type || 'bar'} mode)</span>
                  </h5>
                </div>
                <DynamicAnalyticsChart chartData={aiResult.chart} />
              </div>

              {/* AI Insights Cards */}
              <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-3">
                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strategic Workforce Insights</h5>
                <div className="space-y-2.5">
                  {aiResult.insights?.map((insight, idx) => (
                    <div key={idx} className="p-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{insight.title}</span>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                          insight.type === 'positive' ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50' :
                          insight.type === 'warning' ? 'bg-amber-950/60 text-amber-400 border-amber-800/50' :
                          insight.type === 'negative' ? 'bg-rose-950/60 text-rose-400 border-rose-800/50' :
                          'bg-indigo-950/60 text-indigo-400 border-indigo-800/50'
                        }`}>
                          {insight.type || 'info'}
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-slate-300 leading-relaxed">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Strategic Recommendations */}
            {aiResult.recommendations && aiResult.recommendations.length > 0 && (
              <div className="p-5 bg-slate-800/60 border border-slate-700/60 rounded-2xl space-y-2.5">
                <h5 className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Strategic Management Recommendations</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {aiResult.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs text-slate-200 font-semibold p-2.5 bg-slate-900/40 rounded-xl border border-slate-800">
                      <CheckCircle2 size={15} className="text-indigo-400 shrink-0 mt-0.5" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Module Utilization Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Module Popularity */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="hcm-section-heading flex items-center gap-2">
              <Activity size={18} className="text-indigo-600" />
              Ecosystem Module Utilization
            </h3>
            <span className="text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">
              Monthly Active Use
            </span>
          </div>

          <div className="space-y-4">
            {[
              { module: 'Payroll Center & Billing', pct: `${statsData?.moduleUtilization?.payroll || 0}%`, width: `${statsData?.moduleUtilization?.payroll || 0}%`, color: 'bg-violet-500' },
              { module: 'Time & Attendance Tracker', pct: `${statsData?.moduleUtilization?.attendance || 0}%`, width: `${statsData?.moduleUtilization?.attendance || 0}%`, color: 'bg-emerald-500' },
              { module: 'AI Recruiter & Resume AI', pct: `${statsData?.moduleUtilization?.ai || 0}%`, width: `${statsData?.moduleUtilization?.ai || 0}%`, color: 'bg-blue-500' },
              { module: 'Benefits & Health HCM', pct: `${statsData?.moduleUtilization?.benefits || 0}%`, width: `${statsData?.moduleUtilization?.benefits || 0}%`, color: 'bg-amber-500' },
              { module: 'Compliance & Audits Center', pct: `${statsData?.moduleUtilization?.compliance || 0}%`, width: `${statsData?.moduleUtilization?.compliance || 0}%`, color: 'bg-rose-500' }
            ].map((mod, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                  <span>{mod.module}</span>
                  <span>{mod.pct}</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${mod.color} transition-all duration-1000`} style={{ width: mod.width }} />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Security & Access Token Logs */}
        <motion.div
          variants={cardVariants}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800/60 p-6 shadow-soft"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="hcm-section-heading flex items-center gap-2">
              <Users size={18} className="text-emerald-500" />
              System Audits
            </h3>
            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
              <Zap size={10} className="animate-pulse" /> Live Logs
            </span>
          </div>

          <div className="space-y-3">
            {statsData?.recentAudits?.map((audit, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs font-bold"
              >
                <div>
                  <p className="text-slate-700 dark:text-slate-200">{audit.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[200px]" title={audit.details}>Role: {audit.user?.role || 'SYSTEM'} • {audit.details}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium shrink-0">
                  {new Date(audit.createdAt).toLocaleDateString()}
                </span>
              </div>
            )) || <p className="text-sm text-slate-500">No recent audits found.</p>}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GlobalAnalytics;
