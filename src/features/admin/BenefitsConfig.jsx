import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Heart, 
  Users, 
  DollarSign, 
  Activity, 
  ShieldCheck, 
  Eye, 
  Edit3, 
  Ban,
  X,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';
import BenefitPlanModal from '../../shared/components/admin/BenefitPlanModal';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import PermissionGate from '../../shared/components/common/PermissionGate';
import { usePermission } from '../../hooks/usePermission';
import { useCurrency } from '../../hooks/useCurrency';

const BenefitsConfig = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const { benefits, deleteBenefit, showToast, updateBenefit } = useAdmin();
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [planToEdit, setPlanToEdit] = useState(null);
  const [planToDelete, setPlanToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredBenefits = benefits.filter(b => {
    const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) || b.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All Categories' || b.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  let dynamicActiveEnrollees = 0;
  let dynamicTotalContribution = 0;

  benefits.forEach(b => {
    if (b.status?.toLowerCase() === 'inactive' || b.status?.toLowerCase() === 'archived') return;

    const activeForPlan = Array.isArray(b.employeeBenefits) 
      ? b.employeeBenefits.filter(eb => eb.status === 'Active' || eb.status === 'Approved' || eb.status === 'Enrolled').length 
      : 0;
    
    dynamicActiveEnrollees += activeForPlan;
    
    let val = 0;
    const str = String(b.contribution || b.employerContribution || '0').toLowerCase();
    const matches = str.match(/[\d.]+/g);
    if (matches && matches.length > 0) {
      val = parseFloat(matches[0]);
      if (str.includes('k')) val *= 1000;
    }
    
    // If active enrollees exist, scale contribution by enrollees; otherwise show the configured benefit plan allocation
    dynamicTotalContribution += (activeForPlan > 0 ? (val * activeForPlan) : val);
  });
  
  const stats = [
    { label: 'Total Benefit Plans', value: benefits.length, icon: Heart, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/30' },
    { label: 'Active Enrollees', value: dynamicActiveEnrollees, icon: Users, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-950/30' },
    { label: 'Total Contribution', value: formatCurrency(dynamicTotalContribution), icon: DollarSign, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  ];

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Benefits Configuration</h1>
          <p className="hcm-page-subtitle">Design, manage and assign multi-tier employee benefit packages</p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate module="benefits_config" action="view">
          <button 
            onClick={() => {
              const csvRows = [
                ['Plan Name', 'Category', 'Provider', 'Eligibility', 'Contribution', 'Status'].join(','),
                ...filteredBenefits.map(b => [
                  `"${b.name}"`, 
                  `"${b.category}"`, 
                  `"${b.provider}"`, 
                  `"${b.eligibility}"`, 
                  `"${b.contribution}"`, 
                  `"${b.status}"`
                ].join(','))
              ];
              const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', 'benefits_audit.csv');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              showToast('Audit exported to CSV');
            }}
            className="btn-secondary flex items-center gap-2"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export Audit</span>
          </button>
          </PermissionGate>
          <PermissionGate module="benefits_config" action="create">
          <button 
            onClick={() => {
              setPlanToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20"
          >
             <Plus size={18} />
             <span className="hidden sm:inline">Create Plan</span>
          </button>
          </PermissionGate>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card"
          >
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="card-title mb-1.5">{stat.label}</p>
                  <h3 className="card-value">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Control & List Area */}
      <div className="space-y-6">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="relative flex-1 w-full text-slate-400 dark:text-slate-500">
               <Search className="absolute left-3 top-3 focus:text-primary-600 transition-colors" size={18} />
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 placeholder="Search by plan name, category or provider..." 
                 className="input-field pl-10 h-11" 
               />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
               <select 
                 value={categoryFilter}
                 onChange={(e) => setCategoryFilter(e.target.value)}
                 className="input-field h-11 pr-10 min-w-[140px] font-bold text-slate-600 dark:text-slate-300"
               >
                  <option>All Categories</option>
                  <option>Insurance</option>
                  <option>Retirement</option>
                  <option>Wellness</option>
                  <option>Allowance</option>
                  <option>Reimbursement</option>
               </select>
               <button 
                 onClick={() => setStatusFilter(prev => prev === 'All' ? 'Active' : prev === 'Active' ? 'Disabled' : 'All')}
                 className={cn("p-2.5 transition-all h-11 px-4 flex items-center justify-center shrink-0 gap-2 font-bold text-sm rounded-xl", 
                   statusFilter !== 'All' 
                     ? "bg-primary-50 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400 border border-primary-200 dark:border-primary-800" 
                     : "text-slate-400 dark:text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
                 )}
               >
                  <Filter size={18} />
                  <span className="hidden sm:inline">{statusFilter !== 'All' ? `Status: ${statusFilter}` : 'Filter Status'}</span>
               </button>
            </div>
         </div>

         <div className="hcm-table-container">
            <table className="hcm-table">
               <thead className="hcm-thead">
                  <tr>
                     <th className="hcm-th">Benefit Plan</th>
                     <th className="hcm-th text-center hidden md:table-cell">Category</th>
                     <th className="hcm-th text-center hidden lg:table-cell">Provider</th>
                     <th className="hcm-th text-center hidden sm:table-cell">Eligibility</th>
                     <th className="hcm-th text-center hidden md:table-cell">Employer Contribution</th>
                     <th className="hcm-th text-center">Status</th>
                     <th className="hcm-th text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredBenefits.length > 0 ? filteredBenefits.map((plan, idx) => (
                     <tr key={plan.id} className="hcm-tr">
                        <td className="hcm-td">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                 <ShieldCheck size={20} />
                              </div>
                              <p className="font-bold text-slate-900 dark:text-white tracking-tight">{plan.name}</p>
                           </div>
                        </td>
                        <td className="hcm-td text-center hidden md:table-cell">
                           <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 font-bold">{plan.category}</span>
                        </td>
                        <td className="hcm-td text-center hidden lg:table-cell">
                           <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{plan.provider}</span>
                        </td>
                        <td className="hcm-td text-center hidden sm:table-cell">
                           <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-850 text-[10px] font-bold text-slate-500 dark:text-slate-400 rounded font-bold">{plan.eligibility}</span>
                        </td>
                        <td className="hcm-td text-center font-bold text-slate-900 dark:text-white hidden md:table-cell">{plan.contribution}</td>
                        <td className="hcm-td text-center">
                           <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border",
                              plan.status === 'Active' ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30" : "bg-slate-50 dark:bg-slate-800 text-slate-450 dark:text-slate-500 border-slate-100 dark:border-slate-800"
                           )}>
                              {plan.status}
                           </span>
                        </td>
                        <td className="hcm-td text-right">
                            <PermissionGate module="benefits_config" action="edit">
                            <div className="flex justify-end items-center gap-1.5">
                              <button
                                onClick={() => { setPlanToEdit(plan); setIsAddModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-primary-650 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                title="Edit Benefit Plan"
                              >
                                <Edit3 size={16} />
                              </button>
                              <ActionDropdown 
                                actions={[
                                  { label: plan.status === 'Active' ? 'Disable Plan' : 'Activate', icon: plan.status === 'Active' ? Ban : CheckCircle2, onClick: () => updateBenefit(plan.id, { status: plan.status === 'Active' ? 'Disabled' : 'Active' }) },
                                  { label: 'Duplicate Plan', icon: Plus, onClick: () => showToast('Plan duplicated') },
                                  { label: 'Delete Plan', icon: Trash2, danger: true, onClick: () => setPlanToDelete(plan) },
                                ]}
                                direction={filteredBenefits.length > 2 && idx >= filteredBenefits.length - 2 ? 'up' : 'down'}
                              />
                            </div>
                            </PermissionGate>
                        </td>
                     </tr>
                  )) : (
                     <tr>
                         <td colSpan="7" className="hcm-td">
                             <div className="hcm-empty-state">
                                 <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700 mb-4">
                                     <Heart size={32} />
                                 </div>
                                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No benefit plans found</h3>
                                 <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Try adjusting your filters or search query</p>
                             </div>
                         </td>
                     </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modals */}
      <BenefitPlanModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
            setIsAddModalOpen(false);
            setPlanToEdit(null);
        }}
        planToEdit={planToEdit}
      />

      <ConfirmDialog 
        isOpen={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        onConfirm={() => deleteBenefit(planToDelete.id)}
        title="Delete Benefit Plan"
        message={`Are you sure you want to delete the ${planToDelete?.name} plan? This action cannot be undone.`}
      />
    </div>
  );
};

export default BenefitsConfig;
