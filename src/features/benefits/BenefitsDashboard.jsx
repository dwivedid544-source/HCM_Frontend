import React, { useState, useEffect } from 'react';
import { 
  Gift, 
  ShieldCheck, 
  HeartPulse, 
  PieChart, 
  Plus, 
  Check, 
  X, 
  Search, 
  Save, 
  FileText, 
  Activity, 
  Award, 
  TrendingUp,
  DollarSign,
  Users,
  Compass,
  Edit2
} from 'lucide-react';
import PageHeader from '../../shared/components/layout/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../../shared/components/ui/Avatar';
import { useCurrency } from '../../hooks/useCurrency';

const BenefitsDashboard = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  // --- Data States ---
  const [globalBenefits, setGlobalBenefits] = useState([]);
  const [globalClaims, setGlobalClaims] = useState([]);
  
  // --- UI States ---
  const [activeTab, setActiveTab] = useState('catalog'); // catalog, claims, wellness
  const [benefitSearch, setBenefitSearch] = useState('');
  const [claimSearch, setClaimSearch] = useState('');
  const [claimFilter, setClaimFilter] = useState('All');
  
  // Modals / Creators
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [showWellnessModal, setShowWellnessModal] = useState(false);
  const [newPlan, setNewPlan] = useState({
    name: '',
    category: 'Insurance',
    provider: '',
    contribution: `${getSymbol()}100/m`,
    eligibility: 'All Employees',
    status: 'Active'
  });
  
  const [wellnessCampaigns, setWellnessCampaigns] = useState(() => {
    const saved = localStorage.getItem('hcm_wellness_campaigns');
    return saved ? JSON.parse(saved) : [
      { id: 1, title: 'Summer Wellness Challenge', description: 'Run or walk 50k this month to earn health premiums deduction.', participants: 84, target: 100, budget: formatCurrency(4500, 'INR') },
      { id: 2, title: 'Mindfulness & Meditation', description: 'Access to premium Headspace subscriptions for mental wellness.', participants: 120, target: 150, budget: formatCurrency(2400, 'INR') },
      { id: 3, title: 'Smart Eating Subsidies', description: '50% off gym cafe salads and nutritional meals.', participants: 42, target: 60, budget: formatCurrency(1800, 'INR') }
    ];
  });

  const [newWellness, setNewWellness] = useState({
    title: '',
    description: '',
    participants: 0,
    target: 100,
    budget: formatCurrency(1000, 'INR')
  });

  const [toast, setToast] = useState(null);

  // --- Load Global Sync ---
  const loadGlobalData = () => {
    // 1. Sync Benefits
    const ben = localStorage.getItem('hcm_global_benefits');
    if (ben) {
      setGlobalBenefits(JSON.parse(ben));
    } else {
      const defaults = [
        { id: 1, name: 'Platinum Health Plus', category: 'Insurance', provider: 'Global Health Inc.', contribution: `${formatCurrency(450, 'INR')}/m`, eligibility: 'Full-time Only', status: 'Active' },
        { id: 2, name: 'Mental Wellness Sub', category: 'Wellness', provider: 'MindScale', contribution: `${formatCurrency(25, 'INR')}/m`, eligibility: 'All Employees', status: 'Active' },
        { id: 3, name: 'Learning & Dev Fund', category: 'Reimbursement', provider: 'Self-Funded', contribution: `Up to ${formatCurrency(2000, 'INR')}/y`, eligibility: 'Full-time Only', status: 'Active' },
        { id: 4, name: '401(k) Match (Tier 1)', category: 'Retirement', provider: 'WealthGuard', contribution: '5% Match', eligibility: 'Senior Management', status: 'Active' },
      ];
      localStorage.setItem('hcm_global_benefits', JSON.stringify(defaults));
      setGlobalBenefits(defaults);
    }

    // 2. Sync Claims
    const clms = localStorage.getItem('hcm_global_benefit_claims');
    if (clms) {
      setGlobalClaims(JSON.parse(clms));
    } else {
      const defaults = [
        { id: 'CLM-01', name: 'John Doe', type: 'Medical Expense', amount: '120', date: '2026-03-15', status: 'Approved', description: 'Monthly checkup' },
        { id: 'CLM-02', name: 'John Doe', type: 'Skill Development', amount: '50', date: '2026-04-05', status: 'Pending', description: 'Gym membership' }
      ];
      localStorage.setItem('hcm_global_benefit_claims', JSON.stringify(defaults));
      setGlobalClaims(defaults);
    }
  };

  useEffect(() => {
    loadGlobalData();
    window.addEventListener('hcm_global_sync', loadGlobalData);
    window.addEventListener('storage', loadGlobalData);
    return () => {
      window.removeEventListener('hcm_global_sync', loadGlobalData);
      window.removeEventListener('storage', loadGlobalData);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('hcm_wellness_campaigns', JSON.stringify(wellnessCampaigns));
  }, [wellnessCampaigns]);

  const triggerSync = () => {
    window.dispatchEvent(new CustomEvent('hcm_global_sync'));
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // --- Actions ---
  const handleAddPlanSubmit = (e) => {
    e.preventDefault();
    if (!newPlan.name || !newPlan.provider) {
      showToast('Please fill out all plan fields', 'error');
      return;
    }
    const updatedBen = [...globalBenefits, { ...newPlan, id: Date.now() }];
    localStorage.setItem('hcm_global_benefits', JSON.stringify(updatedBen));
    setGlobalBenefits(updatedBen);
    triggerSync();
    showToast(`Benefit plan ${newPlan.name} created successfully`);
    setShowAddPlan(false);
    setNewPlan({
      name: '',
      category: 'Insurance',
      provider: '',
      contribution: `${formatCurrency(100, 'INR')}/m`,
      eligibility: 'All Employees',
      status: 'Active'
    });
  };

  const handleClaimStatus = (id, status) => {
    const updatedClaims = globalClaims.map(c => 
      c.id === id ? { ...c, status } : c
    );
    localStorage.setItem('hcm_global_benefit_claims', JSON.stringify(updatedClaims));
    setGlobalClaims(updatedClaims);
    triggerSync();
    showToast(`Claim has been ${status.toLowerCase()}`);
  };

  const handleWellnessSubmit = (e) => {
    e.preventDefault();
    if (!newWellness.title || !newWellness.description) {
      showToast('Please fill out campaign fields', 'error');
      return;
    }
    setWellnessCampaigns([...wellnessCampaigns, { ...newWellness, id: Date.now() }]);
    showToast('New corporate wellness initiative launched');
    setShowWellnessModal(false);
    setNewWellness({
      title: '',
      description: '',
      participants: 0,
      target: 100,
      budget: formatCurrency(1000, 'INR')
    });
  };

  // Stats Calculations
  const activeEnrollmentsRate = '86%';
  const healthInsuranceCount = globalBenefits.filter(b => b.category === 'Insurance').length * 105;
  const wellnessParticipation = wellnessCampaigns.reduce((acc, curr) => acc + curr.participants, 0);
  const totalContributions = formatCurrency(4600000, 'INR');

  const stats = [
    { label: 'Enrollment Rate', value: activeEnrollmentsRate, icon: Gift, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/20' },
    { label: 'Covered Lives', value: healthInsuranceCount || 412, icon: ShieldCheck, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/20' },
    { label: 'Wellness Members', value: wellnessParticipation || 128, icon: HeartPulse, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/20' },
    { label: 'Contributions', value: totalContributions, icon: PieChart, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-950/20' },
  ];

  // Filters
  const filteredBenefits = globalBenefits.filter(b => 
    b.name.toLowerCase().includes(benefitSearch.toLowerCase()) ||
    b.provider.toLowerCase().includes(benefitSearch.toLowerCase())
  );

  const filteredClaims = globalClaims.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(claimSearch.toLowerCase()) || 
                          c.type.toLowerCase().includes(claimSearch.toLowerCase());
    const matchesFilter = claimFilter === 'All' || c.status === claimFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full space-y-8 pb-16 animate-fade-in relative text-left">
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl border text-sm font-black uppercase tracking-wider ${
              toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-rose-50 text-rose-800 border-rose-100'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-ping" />
            <span>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <PageHeader
        icon={Gift}
        title="Benefits HCM Platform"
        subtitle="Manage corporate benefits, enrollment programs, employee wellness, and audits."
      />

      {/* Stats Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5"
          >
            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={26} />
            </div>
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1.5">{stat.label}</span>
              <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-tight leading-none mb-1">{stat.value}</h3>
              <span className="text-[10px] font-medium text-slate-400">Enterprise Scale</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 gap-6">
        {[
          { id: 'catalog', label: 'Benefit Catalog', icon: Compass },
          { id: 'claims', label: 'Claim Audit Board', icon: FileText, badge: globalClaims.filter(c => c.status === 'Pending').length },
          { id: 'wellness', label: 'Wellness Initiatives', icon: HeartPulse },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-2 font-black uppercase tracking-widest text-xs flex items-center gap-2 border-b-2 transition-all relative ${
              activeTab === tab.id 
                ? 'border-primary-600 text-primary-600' 
                : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
            }`}
          >
            <tab.icon size={16} />
            <span>{tab.label}</span>
            {tab.badge > 0 && (
              <span className="w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center text-[9px] font-bold">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Main Grid Card */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/60 p-8 shadow-soft min-h-[400px]">
        {activeTab === 'catalog' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">Enterprise Perks & Insurance</h3>
                <p className="text-xs text-slate-400 font-medium">Design and configure employee contribution rates and plans</p>
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search size={14} className="absolute left-3 top-3 text-slate-450" />
                  <input 
                    type="text" 
                    value={benefitSearch}
                    onChange={(e) => setBenefitSearch(e.target.value)}
                    placeholder="Search plans..." 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-950/30 transition-all text-slate-700 dark:text-slate-200" 
                  />
                </div>
                <button 
                  onClick={() => setShowAddPlan(true)}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold font-bold flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Plus size={16} /> Add Plan
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 font-bold">Plan Name</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Category</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Provider</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Eligibility</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Contribution</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-xs">
                  {filteredBenefits.map((plan) => (
                    <tr key={plan.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-violet-50 dark:bg-violet-950/20 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                            <ShieldCheck size={18} />
                          </div>
                          <p className="font-black text-slate-850 dark:text-slate-100 text-sm leading-none">{plan.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-100 dark:border-slate-800">{plan.category}</span>
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-slate-600 dark:text-slate-300">{plan.provider}</td>
                      <td className="px-6 py-5 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-slate-55 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded uppercase tracking-tighter">{plan.eligibility}</span>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-slate-800 dark:text-slate-200">{plan.contribution}</td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => {
                            const filtered = globalBenefits.filter(b => b.id !== plan.id);
                            localStorage.setItem('hcm_global_benefits', JSON.stringify(filtered));
                            setGlobalBenefits(filtered);
                            triggerSync();
                            showToast('Benefit plan removed catalog-wide');
                          }}
                          className="text-rose-500 hover:text-rose-700 font-bold uppercase text-[9px] tracking-wider transition-colors"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'claims' && (
          <div className="space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Pending Audits</h3>
                <p className="text-xs text-slate-400 font-medium">Verify employee reimbursement claims and receipts</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-800 p-1 rounded-xl">
                  {['All', 'Pending', 'Approved', 'Rejected'].map(st => (
                    <button 
                      key={st} 
                      onClick={() => setClaimFilter(st)}
                      className={`px-3 py-1.5 text-[9px] font-black uppercase tracking-wider rounded-lg transition-all ${
                        claimFilter === st 
                          ? 'bg-slate-900 text-white' 
                          : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
                <div className="relative w-full sm:w-56">
                  <Search size={14} className="absolute left-3 top-3 text-slate-450" />
                  <input 
                    type="text" 
                    value={claimSearch}
                    onChange={(e) => setClaimSearch(e.target.value)}
                    placeholder="Search employee or type..." 
                    className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-950/30 transition-all text-slate-700 dark:text-slate-200" 
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                    <th className="px-6 py-4 text-[9px] font-bold text-slate-400 font-bold">Employee</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 font-bold">Expense Type</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Amount</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Date</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                    <th className="px-6 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50 text-xs">
                  {filteredClaims.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <Avatar src={c.img || ''} alt={c.name} className="w-9 h-9 rounded-xl object-cover" />
                          <div>
                            <p className="font-black text-slate-850 dark:text-slate-100 text-sm leading-none mb-1">{c.name}</p>
                            <span className="text-[9px] font-medium text-slate-400 block italic">"{c.description}"</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500 rounded uppercase tracking-wider">{c.type}</span>
                      </td>
                      <td className="px-6 py-5 text-center font-black text-slate-800 dark:text-slate-200 tabular-nums">
                        {formatCurrency(c.amount, 'INR')}
                      </td>
                      <td className="px-6 py-5 text-center font-bold text-slate-600 dark:text-slate-400 tabular-nums">
                        {c.date}
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          c.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' :
                          c.status === 'Pending' ? 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30' :
                          'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                        }`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        {c.status === 'Pending' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleClaimStatus(c.id, 'Approved')}
                              className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm"
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              onClick={() => handleClaimStatus(c.id, 'Rejected')}
                              className="w-8 h-8 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center shadow-sm"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400">Audited</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredClaims.length === 0 && (
                    <tr>
                      <td colSpan="6" className="py-16 text-center text-slate-300 dark:text-slate-700">
                        <FileText size={40} className="mx-auto mb-3" />
                        <p className="text-[10px] font-bold">No reimbursement claims found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'wellness' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">Active Wellness Campaigns</h3>
                <p className="text-xs text-slate-400 font-medium">Build healthy behaviors and launch physical/mental health campaigns</p>
              </div>
              <button 
                onClick={() => setShowWellnessModal(true)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-bold font-bold flex items-center gap-2 shadow-sm shrink-0"
              >
                <Plus size={16} /> New Campaign
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
              {wellnessCampaigns.map((camp) => (
                <div key={camp.id} className="card p-6 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl flex flex-col justify-between min-h-[220px]">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-base font-black text-slate-805 dark:text-slate-100 italic tracking-tight">{camp.title}</h4>
                      <span className="text-[10px] font-black text-indigo-650 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded uppercase">{camp.budget}</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-450 leading-relaxed font-medium mb-6">{camp.description}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-400 mb-2 uppercase tracking-wide">
                      <span>Enrollment</span>
                      <span>{camp.participants} / {camp.target} Employees</span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary-600 rounded-full" 
                        style={{ width: `${Math.min(100, (camp.participants / camp.target) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Plan Modal */}
      <AnimatePresence>
        {showAddPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowAddPlan(false)} 
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight italic mb-2">Create Benefit Plan</h3>
              <p className="text-xs text-slate-400 mb-8 font-medium">Define coverage rules, category limits, and providers globally</p>

              <form onSubmit={handleAddPlanSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold block">Plan Title</label>
                  <input 
                    type="text" 
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({...newPlan, name: e.target.value})}
                    placeholder="e.g. Gold Dental Care Plus" 
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 font-bold block">Category</label>
                    <select 
                      value={newPlan.category}
                      onChange={(e) => setNewPlan({...newPlan, category: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-755 dark:text-slate-200"
                    >
                      <option>Insurance</option>
                      <option>Retirement</option>
                      <option>Wellness</option>
                      <option>Reimbursement</option>
                      <option>Allowance</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Employer Contribution</label>
                    <input 
                      type="text" 
                      value={newPlan.contribution}
                      onChange={(e) => setNewPlan({...newPlan, contribution: e.target.value})}
                      placeholder={`e.g. ${getSymbol()}200/m`} 
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Provider</label>
                    <input 
                      type="text" 
                      value={newPlan.provider}
                      onChange={(e) => setNewPlan({...newPlan, provider: e.target.value})}
                      placeholder="MetLife" 
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Eligibility Group</label>
                    <select 
                      value={newPlan.eligibility}
                      onChange={(e) => setNewPlan({...newPlan, eligibility: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-755 dark:text-slate-200"
                    >
                      <option>All Employees</option>
                      <option>Full-time Only</option>
                      <option>Senior Management</option>
                      <option>Contractors</option>
                    </select>
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  <span>Publish Plan</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Wellness Campaign Modal */}
      <AnimatePresence>
        {showWellnessModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 max-w-lg w-full border border-slate-100 dark:border-slate-800 shadow-2xl relative text-left"
            >
              <button 
                onClick={() => setShowWellnessModal(false)} 
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={20} />
              </button>
              <h3 className="text-2xl font-bold text-slate-850 dark:text-slate-100 tracking-tight italic mb-2">Launch Wellness Campaign</h3>
              <p className="text-xs text-slate-400 mb-8 font-medium">Create custom challenges and program parameters to build a healthy workplace</p>

              <form onSubmit={handleWellnessSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold block">Campaign Title</label>
                  <input 
                    type="text" 
                    value={newWellness.title}
                    onChange={(e) => setNewWellness({...newWellness, title: e.target.value})}
                    placeholder="e.g. 10,000 Steps Daily Challenge" 
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold block">Campaign Description</label>
                  <textarea 
                    value={newWellness.description}
                    onChange={(e) => setNewWellness({...newWellness, description: e.target.value})}
                    placeholder="Describe program goals, rules, and rewards..." 
                    className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200 min-h-[100px] resize-none" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Allocated Budget</label>
                    <input 
                      type="text" 
                      value={newWellness.budget}
                      onChange={(e) => setNewWellness({...newWellness, budget: e.target.value})}
                      placeholder={`e.g. ${getSymbol()}2,500`} 
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Target Enrollment</label>
                    <input 
                      type="number" 
                      value={newWellness.target}
                      onChange={(e) => setNewWellness({...newWellness, target: e.target.value})}
                      placeholder="100" 
                      className="w-full bg-slate-50 dark:bg-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold border-none outline-none focus:ring-2 focus:ring-primary-100 text-slate-750 dark:text-slate-200" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-bold text-xs shadow-xl active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                >
                  <Award size={16} />
                  <span>Launch Campaign</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BenefitsDashboard;
