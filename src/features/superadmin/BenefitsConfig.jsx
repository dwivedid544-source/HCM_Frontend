import React, { useMemo, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift,
  ShieldCheck,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ChevronUp,
  ChevronDown,
  Plus,
  Download,
  UserPlus,
  Eye,
  Edit2,
  Archive,
  ArchiveRestore,
  X,
  Save,
  Search,
  Check,
  AlertCircle,
  Upload,
  Settings,
  HeartPulse,
  Smile,
  Plane,
  Umbrella,
  PiggyBank,
  Stethoscope,
  EyeIcon,
  Building2,
  BarChart2,
  Filter,
  ChevronRight,
  Trash2,
} from 'lucide-react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { useBenefits } from '../../features/benefits/BenefitsContext';
import { useCurrency } from '../../hooks/useCurrency';
import { PageHeader } from '../../shared/components/layout/PageHeader';
import ImportModal from '../../shared/components/import/ImportModal';

// ─── Animation variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── Toast helper ─────────────────────────────────────────────────────────────
const toast = (msg, type = 'success') =>
  window.dispatchEvent(new CustomEvent('app_toast', { detail: { message: msg, type } }));

// ─── Status badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    Active:   'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400',
    Inactive: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400',
    Archived: 'bg-rose-100 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400',
    Enrolled: 'bg-blue-100 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400',
    Pending:  'bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${map[status] || map.Inactive}`}>
      {status}
    </span>
  );
};

// ─── Compact KPI card ─────────────────────────────────────────────────────────
const KPICard = ({ icon: Icon, label, value, sub, trend, trendVal, colorClass, borderClass, bgClass }) => {
  const TIcon = trend === 'up' ? ChevronUp : trend === 'down' ? ChevronDown : null;
  const tColor = trend === 'up' ? 'text-emerald-500' : 'text-rose-500';
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -3 }}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border ${borderClass} shadow-sm hover:shadow-md transition-all overflow-hidden p-4`}
    >
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${colorClass}`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`w-9 h-9 rounded-xl ${bgClass} flex items-center justify-center shrink-0`}>
          <Icon size={17} className={`bg-gradient-to-r ${colorClass}`.replace('from-', 'text-').split(' ')[0]} />
        </div>
        {TIcon && (
          <div className={`flex items-center gap-0.5 ${tColor}`}>
            <TIcon size={11} />
            <span className="text-[10px] font-bold">{trendVal}</span>
          </div>
        )}
      </div>
      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">{value}</h3>
      <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>
      <div className="mt-2.5 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, parseFloat(trendVal) || 60)}%` }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    </motion.div>
  );
};

// ─── Create Plan Modal ────────────────────────────────────────────────────────
const CreatePlanModal = ({ onClose, onSave, initialData }) => {
  const { getSymbol } = useCurrency();
  const [form, setForm] = useState(initialData || {
    name: '', category: 'Health Insurance', coverage: 'Individual',
    monthlyCost: '', enrolledCount: 0, status: 'Active', provider: '', eligibility: 'All Employees',
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.monthlyCost) { toast('Please fill in all required fields', 'error'); return; }
    const success = await onSave({ ...form, monthlyCost: parseFloat(form.monthlyCost) || 0 });
    if (success) {
      toast(`Benefit plan "${form.name}" ${initialData ? 'updated' : 'created'} successfully`);
      onClose();
    } else {
      toast(`Failed to ${initialData ? 'update' : 'create'} benefit plan`, 'error');
    }
  };
  const field = 'w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-3.5 py-2.5 text-sm font-medium border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-800 dark:text-slate-200 transition-all';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left"
      >
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 rounded-xl flex items-center justify-center">
            {initialData ? <Edit2 size={18} className="text-primary-600" /> : <Gift size={18} className="text-primary-600" />}
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">{initialData ? 'Edit Benefit Plan' : 'Create Benefit Plan'}</h3>
            <p className="text-xs text-slate-400">Configure coverage, cost, and eligibility</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 font-bold block mb-1">Plan Name *</label>
            <input className={field} placeholder="e.g. Gold Health Plus" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Category *</label>
              <select className={field} value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                {['Health Insurance','Medical Insurance','Dental Insurance','Vision Insurance','Retirement Plans','Wellness Programs','Travel Benefits','Life Insurance'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Coverage Type</label>
              <select className={field} value={form.coverage} onChange={e => setForm({...form, coverage: e.target.value})}>
                {['Individual','Family','Employee + Spouse','Employee + Dependents'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Monthly Cost ({getSymbol()}/employee) *</label>
              <input className={field} type="number" placeholder="200" value={form.monthlyCost} onChange={e => setForm({...form, monthlyCost: e.target.value})} />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Provider</label>
              <input className={field} placeholder="e.g. MetLife" value={form.provider} onChange={e => setForm({...form, provider: e.target.value})} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Eligibility</label>
              <select className={field} value={form.eligibility} onChange={e => setForm({...form, eligibility: e.target.value})}>
                {['All Employees','Full-time Only','Senior Management','Contractors'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Status</label>
              <select className={field} value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                <option>Active</option><option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-xs py-2.5">Cancel</button>
            <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2 text-xs py-2.5">
              <Save size={14} /> Create Plan
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── Configure Benefits Modal ────────────────────────────────────────────────
const ConfigureBenefitsModal = ({ onClose }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('hcm_benefit_config');
    return saved ? JSON.parse(saved) : { autoEnroll: true, allowOptOut: true, match401k: false };
  });

  const handleSave = (e) => {
    e.preventDefault();
    localStorage.setItem('hcm_benefit_config', JSON.stringify(settings));
    toast('Benefits configuration saved successfully', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left">
        <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors">
          <X size={18} />
        </button>
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 bg-primary-50 dark:bg-primary-950/20 rounded-xl flex items-center justify-center">
            <Settings size={18} className="text-primary-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">Configure Benefits</h3>
            <p className="text-xs text-slate-400">Global enrollment settings</p>
          </div>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <input type="checkbox" checked={settings.autoEnroll} onChange={e => setSettings({...settings, autoEnroll: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Auto-enroll Employees</p>
              <p className="text-[10px] text-slate-400">Automatically enroll new hires into default plans</p>
            </div>
          </label>
          <label className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <input type="checkbox" checked={settings.allowOptOut} onChange={e => setSettings({...settings, allowOptOut: e.target.checked})} className="rounded text-primary-600 focus:ring-primary-500" />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Allow Opt-out</p>
              <p className="text-[10px] text-slate-400">Allow employees to decline auto-enrolled plans</p>
            </div>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 btn-secondary text-xs py-2.5">Cancel</button>
            <button type="submit" className="flex-1 btn-primary flex items-center justify-center gap-2 text-xs py-2.5">
              <Save size={14} /> Save Configuration
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

// ─── CATEGORY CONFIG ──────────────────────────────────────────────────────────
const CATEGORY_CONFIG = [
  { name: 'Health Insurance',    icon: HeartPulse, color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-950/20',     border: 'border-rose-100 dark:border-rose-900/30' },
  { name: 'Medical Insurance',   icon: Stethoscope,color: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-950/20',       border: 'border-red-100 dark:border-red-900/30' },
  { name: 'Dental Insurance',    icon: Smile,      color: 'text-sky-500',     bg: 'bg-sky-50 dark:bg-sky-950/20',       border: 'border-sky-100 dark:border-sky-900/30' },
  { name: 'Vision Insurance',    icon: EyeIcon,    color: 'text-violet-500',  bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-100 dark:border-violet-900/30' },
  { name: 'Retirement Plans',    icon: PiggyBank,  color: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-950/20',   border: 'border-amber-100 dark:border-amber-900/30' },
  { name: 'Wellness Programs',   icon: HeartPulse, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950/20',border: 'border-emerald-100 dark:border-emerald-900/30' },
  { name: 'Travel Benefits',     icon: Plane,      color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-950/20',     border: 'border-blue-100 dark:border-blue-900/30' },
  { name: 'Life Insurance',      icon: Umbrella,   color: 'text-slate-500',   bg: 'bg-slate-50 dark:bg-slate-800/40',   border: 'border-slate-200 dark:border-slate-700' },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const BenefitsConfig = () => {
  const { users, departments } = useSuperAdmin();
  const { benefitPlans, addBenefitPlan, saveBenefitPlan, removeBenefitPlan, loadPlans } = useBenefits();
  const { getSymbol, getIcon, formatCurrency } = useCurrency();
  const CurrencyIcon = getIcon();

  const [activeTab, setActiveTab] = useState('plans');
  const [showCreate, setShowCreate] = useState(false);
  const [showConfigure, setShowConfigure] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [planSearch, setPlanSearch]     = useState('');
  const [empSearch, setEmpSearch]       = useState('');
  const [editingPlan, setEditingPlan]   = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (loadPlans) {
      loadPlans();
    }
  }, []);

  // ── Enrich benefitPlans with extra fields if they don't have them ───────────
  const plans = useMemo(() => {
    const base = benefitPlans.length > 0 ? benefitPlans : [];
    if (base.length > 0 && !base[0].category) {
      return base.map((p, i) => ({
        ...p,
        category:   ['Health Insurance', 'Retirement Plans', 'Dental Insurance', 'Vision Insurance'][i % 4],
        coverage:   ['Individual', 'Family', 'Employee + Spouse'][i % 3],
        status:     'Active',
        provider:   ['MetLife', 'WealthGuard', 'DeltaDental', 'EyeMed'][i % 4],
        eligibility:'All Employees',
      }));
    }
    return base;
  }, [benefitPlans]);

  // ── KPI Metrics ────────────────────────────────────────────────────────────
  const employees = useMemo(() => users.filter(u => ['employee','manager','hr'].includes(u.role)), [users]);
  const totalEmp  = employees.length || 5;

  const metrics = useMemo(() => {
    const activePlans   = plans.filter(p => p.status !== 'Archived').length;
    const totalEnrolled = plans.reduce((s, p) => s + (p.enrolledCount || 0), 0);
    const utilizationPct = totalEmp > 0 ? Math.min(100, Math.round((totalEnrolled / (totalEmp * Math.max(activePlans, 1))) * 100)) : 0;
    const monthlyCost   = plans.reduce((s, p) => s + ((p.monthlyCost || 0) * (p.enrolledCount || 0)), 0);
    return { activePlans, totalEnrolled, utilizationPct, monthlyCost };
  }, [plans, totalEmp]);

  // ── Employee enrollment data (derived from users + plans) ──────────────────
  const enrollments = useMemo(() => {
    const planNames = plans.map(p => p.name);
    return employees.map((emp, i) => ({
      id: emp.id,
      empId: `EMP-${String(i + 1).padStart(3,'0')}`,
      name: emp.name,
      department: emp.department || departments[i % departments.length]?.name || 'General',
      plan: planNames[i % Math.max(planNames.length, 1)] || 'Health Insurance',
      enrollDate: `2026-0${(i % 9) + 1}-${String((i * 3 % 28) + 1).padStart(2,'0')}`,
      status: i % 5 === 3 ? 'Pending' : 'Enrolled',
    }));
  }, [employees, plans, departments]);

  // ── Category breakdown ─────────────────────────────────────────────────────
  const categoryStats = useMemo(() => {
    return CATEGORY_CONFIG.map(cat => {
      const catPlans = plans.filter(p => p.category === cat.name);
      const enrolled = catPlans.reduce((s, p) => s + (p.enrolledCount || 0), 0);
      return { ...cat, totalPlans: catPlans.length, enrolled };
    });
  }, [plans]);

  // ── Department analytics ───────────────────────────────────────────────────
  const deptAnalytics = useMemo(() => {
    return departments.slice(0, 5).map((dept, i) => {
      const deptEmps = employees.filter(e => e.department === dept.name).length || dept.count || 3;
      const covered  = Math.ceil(deptEmps * (0.7 + i * 0.05));
      const pct      = Math.round((covered / deptEmps) * 100);
      const cost     = covered * (metrics.monthlyCost / Math.max(metrics.totalEnrolled, 1) || 200);
      return { name: dept.name, total: deptEmps, covered, pct, cost: Math.round(cost) };
    });
  }, [departments, employees, metrics]);

  // ── Plan actions ───────────────────────────────────────────────────────────
  const handleCreatePlan = async (newPlan) => {
    const created = await addBenefitPlan(newPlan);
    return !!created;
  };

  const handleUpdatePlan = async (updates) => {
    const success = await saveBenefitPlan(editingPlan.id, updates);
    return !!success;
  };

  const handleToggleArchive = async (plan) => {
    const isArchived = plan.status === 'Archived';
    const newStatus = isArchived ? 'Active' : 'Archived';
    const success = await saveBenefitPlan(plan.id, { status: newStatus });
    if (success) toast(`Plan ${isArchived ? 'unarchived' : 'archived'} successfully`);
    else toast(`Failed to ${isArchived ? 'unarchive' : 'archive'} plan`, 'error');
  };

  const handleDelete = async (id) => {
    const success = await removeBenefitPlan(id);
    if (success) toast('Plan deleted successfully');
    else toast('Failed to delete plan', 'error');
  };

  const handleExport = () => {
    const headers = ['Plan Name', 'Category', 'Coverage', 'Monthly Cost', 'EnrolledCount', 'Provider', 'Eligibility', 'Status'].join(',');
    const rows = plans.map(p => [
      `"${p.name || ''}"`,
      `"${p.category || ''}"`,
      `"${p.coverage || ''}"`,
      `"${p.monthlyCost || 0}"`,
      `"${p.enrolledCount || 0}"`,
      `"${p.provider || ''}"`,
      `"${p.eligibility || ''}"`,
      `"${p.status || ''}"`
    ].join(','));
    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `benefit_plans_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Benefit plans exported successfully', 'success');
  };

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target.result;
        const rows = text.split('\n').filter(r => r.trim());
        let count = 0;
        for (let i = 1; i < rows.length; i++) {
           const values = rows[i].split(',').map(v => v.trim().replace(/"/g, ''));
           const name = values[0];
           if(name) {
              await addBenefitPlan({
                name,
                category: values[1] || 'Health Insurance',
                coverage: values[2] || 'Individual',
                monthlyCost: parseFloat(values[3]) || 0,
                provider: values[5] || '',
                eligibility: values[6] || 'All Employees',
                status: values[7] || 'Active'
              });
              count++;
           }
        }
        toast(`Successfully imported ${count} benefit plans`, 'success');
        e.target.value = '';
      } catch (err) {
        toast('Failed to import plans', 'error');
      }
    };
    reader.readAsText(file);
  };

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredPlans = plans.filter(p =>
    p.name?.toLowerCase().includes(planSearch.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(planSearch.toLowerCase())
  );
  const filteredEnrollments = enrollments.filter(e =>
    e.name.toLowerCase().includes(empSearch.toLowerCase()) ||
    e.department.toLowerCase().includes(empSearch.toLowerCase())
  );

  const hasPlans = plans.length > 0;

  const tabs = [
    { id: 'plans',       label: 'Benefit Plans'  },
    { id: 'enrollment',  label: 'Employee Enrollment' },
    { id: 'categories',  label: 'Categories'     },
    { id: 'departments', label: 'Dept Analytics' },
  ];

  return (
    <motion.div
      className="space-y-5 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants}>
        <PageHeader
          icon={Gift}
          title="Benefits Configuration"
          subtitle="Manage organization-wide benefit plans and enrollments"
        >
          <button className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2" onClick={() => setIsImportModalOpen(true)}>
            <Upload size={14} /> Import Plans
          </button>
          <button className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-2" onClick={handleExport}>
            <Download size={14} /> Export Plans
          </button>
          <button className="btn-primary flex items-center gap-1.5 text-xs px-3 py-2" onClick={() => setShowCreate(true)}>
            <Plus size={14} /> Create Plan
          </button>
        </PageHeader>
      </motion.div>

      {/* ── 4 KPI Cards ── */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPICard
          icon={Gift} label="Active Benefit Plans" value={metrics.activePlans}
          sub="Total active plans" trend="up" trendVal="75"
          colorClass="from-pink-400 to-rose-500"
          borderClass="border-pink-100 dark:border-pink-900/30"
          bgClass="bg-pink-50 dark:bg-pink-950/20"
        />
        <KPICard
          icon={Users} label="Total Enrolled Employees" value={metrics.totalEnrolled}
          sub={`Out of ${totalEmp} employees`} trend="up" trendVal="82"
          colorClass="from-emerald-400 to-emerald-600"
          borderClass="border-emerald-100 dark:border-emerald-900/30"
          bgClass="bg-emerald-50 dark:bg-emerald-950/20"
        />
        <KPICard
          icon={ShieldCheck} label="Benefits Utilization Rate" value={`${metrics.utilizationPct}%`}
          sub="Across all active plans" trend="up" trendVal={String(metrics.utilizationPct)}
          colorClass="from-blue-400 to-blue-600"
          borderClass="border-blue-100 dark:border-blue-900/30"
          bgClass="bg-blue-50 dark:bg-blue-950/20"
        />
        <KPICard
          icon={CurrencyIcon} label="Monthly Benefits Cost" value={formatCurrency(metrics.monthlyCost)}
          sub="Employer contribution" trend="up" trendVal="65"
          colorClass="from-amber-400 to-amber-600"
          borderClass="border-amber-100 dark:border-amber-900/30"
          bgClass="bg-amber-50 dark:bg-amber-950/20"
        />
      </motion.div>

      {/* ── Empty state ── */}
      {!hasPlans && (
        <motion.div variants={itemVariants} className="text-center py-16 px-4 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm mt-4">
          <div className="w-20 h-20 bg-primary-50 dark:bg-primary-950/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Gift size={32} className="text-primary-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">No Benefit Plans Found</h3>
          <p className="text-sm text-slate-400 mb-6">Start by creating your first benefit plan or importing existing plans</p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="btn-primary flex items-center gap-2 text-xs" onClick={() => setShowCreate(true)}><Plus size={14}/>Create Benefit Plan</button>
            <button className="btn-secondary flex items-center gap-2 text-xs" onClick={() => setIsImportModalOpen(true)}><Upload size={14}/>Import Plans</button>
            <button className="btn-secondary flex items-center gap-2 text-xs" onClick={() => setShowConfigure(true)}><Settings size={14}/>Configure Benefits</button>
          </div>
        </motion.div>
      )}

      {/* ── Tabbed Content ── */}
      {hasPlans && (
        <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-slate-100 dark:border-slate-800 px-4 gap-1 scrollbar-none">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {/* ═══════════════════ PLANS TAB ═══════════════════ */}
            {activeTab === 'plans' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text" placeholder="Search plans…" value={planSearch}
                      onChange={e => setPlanSearch(e.target.value)}
                      className="pl-8 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary-400 text-slate-700 dark:text-slate-300 w-52"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{filteredPlans.length} plans</span>
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        {['Plan Name','Category','Coverage','Monthly Cost','Enrolled','Status','Actions'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 font-bold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                      {filteredPlans.map((plan, idx) => (
                        <motion.tr
                          key={plan.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center shrink-0">
                                <Gift size={13} className="text-primary-600" />
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{plan.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md whitespace-nowrap">{plan.category || 'Health Insurance'}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{plan.coverage || 'Individual'}</td>
                          <td className="px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-300">{formatCurrency(plan.monthlyCost || 0)}</td>
                          <td className="px-4 py-3 text-xs font-medium text-slate-600 dark:text-slate-400">{plan.enrolledCount || 0}</td>
                          <td className="px-4 py-3"><StatusBadge status={plan.status || 'Active'} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setEditingPlan(plan); }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-600 transition-colors" title="Edit">
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => handleToggleArchive(plan)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-colors" title={plan.status === 'Archived' ? 'Unarchive' : 'Archive'}>
                                {plan.status === 'Archived' ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                              </button>
                              <button onClick={() => handleDelete(plan.id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-600 transition-colors" title="Delete">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="block sm:hidden space-y-3">
                  {filteredPlans.map(plan => (
                    <div key={plan.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{plan.name}</p>
                          <p className="text-[10px] text-slate-400">{plan.category || 'Health Insurance'}</p>
                        </div>
                        <StatusBadge status={plan.status || 'Active'} />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mt-3">
                        <div>Cost: <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(plan.monthlyCost || 0)}/mo</span></div>
                        <div>Enrolled: <span className="font-bold text-slate-700 dark:text-slate-300">{plan.enrolledCount || 0}</span></div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => { setEditingPlan(plan); }} className="flex-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/20 py-1.5 rounded-lg">Edit</button>
                        <button onClick={() => handleToggleArchive(plan)} className="flex-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 py-1.5 rounded-lg">{plan.status === 'Archived' ? 'Unarchive' : 'Archive'}</button>
                        <button onClick={() => handleDelete(plan.id)} className="flex-1 text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/20 py-1.5 rounded-lg">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════ ENROLLMENT TAB ═══════════════════ */}
            {activeTab === 'enrollment' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text" placeholder="Search employee or dept…" value={empSearch}
                      onChange={e => setEmpSearch(e.target.value)}
                      className="pl-8 pr-4 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-1 focus:ring-primary-400 text-slate-700 dark:text-slate-300 w-52"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">{filteredEnrollments.length} employees</span>
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="min-w-full">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/50">
                        {['Employee','Employee ID','Department','Benefit Plan','Enroll Date','Status','Actions'].map(h => (
                          <th key={h} className="px-4 py-2.5 text-left text-[10px] font-bold text-slate-400 font-bold whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
                      {filteredEnrollments.map((e, idx) => (
                        <motion.tr
                          key={e.id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                          className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                                {e.name.charAt(0)}
                              </div>
                              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap">{e.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono text-slate-500">{e.empId}</td>
                          <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">{e.department}</td>
                          <td className="px-4 py-3 text-xs font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{e.plan}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">{e.enrollDate}</td>
                          <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button onClick={() => toast(`Viewing ${e.name}'s enrollment`, 'info')} className="text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors">View</button>
                              <span className="text-slate-200 dark:text-slate-700">|</span>
                              <button onClick={() => toast(`Modifying ${e.name}'s enrollment`, 'info')} className="text-[10px] font-bold text-amber-600 hover:text-amber-700 transition-colors">Modify</button>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="block sm:hidden space-y-3">
                  {filteredEnrollments.map(e => (
                    <div key={e.id} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-[10px] font-bold">{e.name.charAt(0)}</div>
                          <div>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{e.name}</p>
                            <p className="text-[10px] text-slate-400">{e.department} • {e.empId}</p>
                          </div>
                        </div>
                        <StatusBadge status={e.status} />
                      </div>
                      <p className="text-[11px] text-slate-500">Plan: <span className="font-bold text-slate-700 dark:text-slate-300">{e.plan}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ═══════════════════ CATEGORIES TAB ═══════════════════ */}
            {activeTab === 'categories' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {categoryStats.map(cat => {
                  const CatIcon = cat.icon;
                  return (
                    <motion.div
                      key={cat.name}
                      whileHover={{ y: -2 }}
                      className={`p-4 rounded-xl border ${cat.border} ${cat.bg} transition-all cursor-pointer`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className={`w-9 h-9 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-sm`}>
                          <CatIcon size={17} className={cat.color} />
                        </div>
                        <ChevronRight size={14} className="text-slate-300 dark:text-slate-600" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 leading-tight">{cat.name}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 font-bold">Plans</p>
                          <p className="text-lg font-black text-slate-800 dark:text-slate-100">{cat.totalPlans}</p>
                        </div>
                        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700" />
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Enrolled</p>
                          <p className="text-lg font-black text-slate-800 dark:text-slate-100">{cat.enrolled}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* ═══════════════════ DEPARTMENTS TAB ═══════════════════ */}
            {activeTab === 'departments' && (
              <div className="space-y-3">
                <div className="hidden sm:grid grid-cols-5 gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-4 mb-1">
                  <span>Department</span><span>Employees</span><span>Covered</span><span className="col-span-2">Coverage & Monthly Cost</span>
                </div>
                {deptAnalytics.map((dept, i) => (
                  <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-primary-200 dark:hover:border-primary-800 transition-colors">
                     <div className="hidden sm:grid grid-cols-5 gap-3 items-center">
                       <div className="flex items-center gap-2">
                         <div className="w-7 h-7 bg-primary-50 dark:bg-primary-950/20 rounded-lg flex items-center justify-center">
                           <Building2 size={13} className="text-primary-600" />
                         </div>
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{dept.name}</span>
                       </div>
                       <span className="text-xs font-medium text-slate-500">{dept.total}</span>
                       <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dept.covered}</span>
                       <div className="col-span-2">
                         <div className="flex items-center gap-2 mb-1">
                           <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                             <motion.div
                               className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600"
                               initial={{ width: 0 }}
                               animate={{ width: `${dept.pct}%` }}
                               transition={{ duration: 0.7 }}
                             />
                           </div>
                           <span className="text-[10px] font-bold text-primary-600 w-10 text-right">{dept.pct}%</span>
                           <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">{formatCurrency(dept.cost)}/mo</span>
                         </div>
                       </div>
                     </div>
                     {/* Mobile */}
                     <div className="block sm:hidden">
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{dept.name}</span>
                         <span className="text-[10px] font-bold text-primary-600">{dept.pct}% covered</span>
                       </div>
                       <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mb-2">
                         <div className="h-full rounded-full bg-gradient-to-r from-primary-400 to-primary-600" style={{ width: `${dept.pct}%` }} />
                       </div>
                       <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-400">
                         <span>Total: <strong className="text-slate-600 dark:text-slate-300">{dept.total}</strong></span>
                         <span>Covered: <strong className="text-slate-600 dark:text-slate-300">{dept.covered}</strong></span>
                         <span>Cost: <strong className="text-slate-600 dark:text-slate-300">{formatCurrency(dept.cost)}/mo</strong></span>
                       </div>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* ── Create Plan Modal ── */}
      <AnimatePresence>
        {showCreate && <CreatePlanModal onClose={() => setShowCreate(false)} onSave={handleCreatePlan} />}
        {editingPlan && <CreatePlanModal onClose={() => setEditingPlan(null)} onSave={handleUpdatePlan} initialData={editingPlan} />}
        {showConfigure && <ConfigureBenefitsModal onClose={() => setShowConfigure(false)} />}
      </AnimatePresence>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        entity="benefits"
        onImportSuccess={loadPlans}
      />
    </motion.div>
  );
};

export default BenefitsConfig;
