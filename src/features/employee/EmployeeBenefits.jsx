import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   Heart, ShieldCheck, Sun, Wallet, Download, MessageSquare, ChevronRight, Plus, ArrowUpRight,
   Activity, Briefcase, Clock, CheckCircle2, FileText, LifeBuoy, Stethoscope, X, DollarSign, Target, AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import { useDateFormat } from '../../hooks/useDateFormat';
import CenterModal from '../../shared/components/layout/CenterModal';
import { useCurrency } from '../../hooks/useCurrency';
import DatePicker from '../../shared/components/common/DatePicker';
import StatCard from '../../shared/components/ui/StatCard';

const EmployeeBenefits = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();
  const { formatDate } = useDateFormat();
  const CurrencyIcon = getIcon();

   const { benefits, addBenefitClaim, enrollInBenefit, unenrollFromBenefit, leaves, showToast, profile, createTicket, loading, error, refetchAll } = useEmployee();
   const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
   const [claimDate, setClaimDate] = useState('');
   const [claimFile, setClaimFile] = useState(null);

   const activeBenefitsCount = (benefits.enrolledPlans || []).length;
   const insurancePlan = (benefits.enrolledPlans || []).find(ep => ep.benefitPlan?.category?.toLowerCase().includes('health') || ep.benefitPlan?.category?.toLowerCase().includes('insurance'));
   const insurancePlanName = insurancePlan ? (insurancePlan.benefitPlan.name.length > 15 ? insurancePlan.benefitPlan.name.substring(0, 15) + '...' : insurancePlan.benefitPlan.name) : 'None';

   const stats = [
      { label: 'Active Benefits', value: activeBenefitsCount, icon: Heart, color: 'text-rose-600', bg: 'bg-rose-50' },
      { label: 'Insurance Plan', value: insurancePlanName, icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Leave Balance', value: leaves.balance.annual + leaves.balance.sick, icon: Sun, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Total Claims', value: benefits.claims.length, icon: Wallet, color: 'text-primary-600', bg: 'bg-primary-50' },
   ];

   const categories = (benefits.availablePlans || []).map((plan) => {
      const isHealth = plan.category?.toLowerCase().includes('health') || plan.category?.toLowerCase().includes('insurance');
      const enrollment = (benefits.enrolledPlans || []).find(ep => ep.benefitPlanId === plan.id);
      
      return {
         id: plan.id,
         isEnrolled: !!enrollment,
         title: plan.name || 'Benefit Plan',
         tag: plan.category || 'Benefit',
         icon: isHealth ? Stethoscope : Target,
         color: isHealth ? 'indigo' : 'emerald',
         items: [
            { label: 'Provider', value: plan.provider || 'Company Provided' },
            { label: 'Status', value: enrollment ? (enrollment.status || 'Active') : 'Not Enrolled' },
            { label: 'Monthly Cost', value: formatCurrency(plan.contribution || 0) },
            { label: 'Emp. Contribution', value: formatCurrency(plan.empContribution || 0) },
            { label: 'Enrolled On', value: enrollment?.createdAt ? formatDate(enrollment.createdAt) : (enrollment ? 'Recently' : '-') }
         ]
      };
   });

   const handleClaimSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      addBenefitClaim({
         type: formData.get('type'),
         amount: formData.get('amount'),
         date: claimDate,
         description: formData.get('description'),
         file: claimFile
      });
      setIsClaimModalOpen(false);
      setClaimDate('');
      setClaimFile(null);
   };

   const handleDownloadPolicy = (policyName) => {
      const textContent = `
HCM.ai Tech Solutions - ${policyName}
=======================================
Employee: ${profile?.fullName || 'Employee'}
Employee ID: ${profile?.employeeId || 'N/A'}
Date Generated: ${formatDate(new Date())}

This document serves as proof of your active enrollment in the ${policyName} program.
For full terms and conditions, please refer to the corporate intranet.
      `;
      const blob = new Blob([textContent], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${policyName.replace(' ', '_')}_${profile?.employeeId || 'ID'}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`${policyName} downloaded successfully`);
   };

   const handleContactHR = () => {
      createTicket({
         subject: 'General HR Inquiry from Benefits Page',
         category: 'HR',
         priority: 'Medium',
         message: 'Hello, I have a question regarding my benefits.'
      });
      showToast('HR Support ticket created! Check your tickets.');
   };

   const handleConnectAdvisor = () => {
      createTicket({
         subject: 'Request for Premium Benefits Advisor',
         category: 'Benefits',
         priority: 'High',
         message: 'I would like to schedule a session with a benefits advisor to discuss my wellness and retirement strategy.'
      });
      showToast('Advisor request submitted! They will contact you shortly.');
   };

   if (error) {
      return (
         <div className="max-w-7xl mx-auto px-4 sm:px-0 min-h-[400px] flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 space-y-4 text-left">
            <AlertCircle className="text-rose-500 w-12 h-12" />
            <h3 className="text-lg font-bold text-slate-950 dark:text-white">Failed to Load Benefits</h3>
            <p className="text-sm text-slate-500 max-w-md">{error}</p>
            <button onClick={refetchAll} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2">
               <span>Try Again</span>
            </button>
         </div>
      );
   }

   if (loading || !benefits) {
      return (
         <div className="space-y-8 pb-12 animate-fade-in max-w-7xl mx-auto px-4 sm:px-0 text-left">
            <div className="text-center py-16">
               <div className="w-16 h-16 border-4 border-t-indigo-600 border-indigo-100 rounded-full animate-spin mx-auto mb-4" />
               <p className="text-sm text-slate-400 dark:text-slate-500">Loading Perks & Benefits...</p>
            </div>
         </div>
      );
   }

   return (
      <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto">
         {/* Header Section */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="hcm-page-title">Benefits & Wellness</h1>
               <p className="text-slate-500 font-bold tracking-tight">Your comprehensive corporate perks, health and retirement plans</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => handleDownloadPolicy('Master Benefits Policy')} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2">
                  <Download size={18} />
                  <span>Policy</span>
               </button>
               <button onClick={handleContactHR} className="btn-primary px-8 py-2.5 font-bold flex items-center gap-2 shadow-xl shadow-primary-200">
                  <MessageSquare size={18} />
                  <span>Contact HR</span>
               </button>
            </div>
         </div>

         {/* Stats Cards Section */}
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => (
               <StatCard
                  key={idx}
                  icon={stat.icon}
                  label={stat.label}
                  value={stat.value}
                  color={stat.color}
                  bg={stat.bg}
               />
            ))}
         </div>

         {categories.length === 0 ? (
            <div className="card p-10 flex flex-col items-center justify-center text-center">
               <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShieldCheck size={32} />
               </div>
               <h3 className="text-xl font-black text-slate-900 dark:text-white">No Active Benefit Plans</h3>
               <p className="text-slate-500 mt-2 text-sm max-w-md">You are currently not enrolled in any active benefit plans. If you believe this is an error, please contact HR.</p>
            </div>
         ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {categories.map((cat, idx) => (
               <div key={idx} className="card p-10  flex flex-col group">
                  <div className="flex items-center justify-between mb-10">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.5rem] bg-slate-900 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                           <cat.icon size={32} />
                        </div>
                        <div className="text-left">
                           <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none italic dark:text-white">{cat.title}</h3>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-2">{cat.tag}</p>
                        </div>
                     </div>
                     {!cat.isEnrolled ? (
                        <button onClick={() => enrollInBenefit(cat.id)} className="px-5 py-2.5 bg-primary-600 text-white rounded-2xl text-[10px] font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200">
                           Enroll
                        </button>
                     ) : (
                        <div className="flex items-center gap-2">
                           <button className="p-3 bg-emerald-50 text-emerald-500 rounded-2xl cursor-default" title="Enrolled">
                              <CheckCircle2 size={20} />
                           </button>
                           <button onClick={() => unenrollFromBenefit(cat.id)} className="px-4 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-2xl text-[10px] font-bold transition-all">
                              Unenroll
                           </button>
                        </div>
                     )}
                  </div>

                  <div className="space-y-6 flex-1 text-left">
                     {cat.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-none group/row">
                           <span className="text-[10px] font-bold text-slate-400 font-bold group-hover/row:text-slate-600 transition-colors">{item.label}</span>
                           <span className="text-sm font-black text-slate-900 italic tabular-nums">{item.value}</span>
                        </div>
                     ))}
                  </div>

                  {cat.isEnrolled && (
                     <div onClick={() => handleDownloadPolicy(cat.title)} className="mt-12 p-5 bg-slate-50 rounded-[2rem] flex items-center justify-between group/dl cursor-pointer hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-slate-100">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm transition-transform group-hover/dl:rotate-12">
                              <FileText size={22} />
                           </div>
                           <div className="text-left">
                              <span className="text-[10px] font-black text-slate-900 font-bold">Download {cat.title} Policy</span>
                              <p className="text-[9px] font-bold text-slate-400 tracking-widest leading-none mt-1">Digital Statement • TXT • 1 KB</p>
                           </div>
                        </div>
                        <Download size={20} className="text-slate-200 group-hover/dl:text-primary-600 transition-colors mr-2" />
                     </div>
                  )}
               </div>
            ))}
         </div>
         )}

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Recent Reimbursements */}
            <div className="lg:col-span-8 flex flex-col gap-8">
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight italic dark:text-white">Reimbursement History</h3>
                  <button onClick={() => setIsClaimModalOpen(true)} className="px-6 py-2.5 bg-slate-900 text-white rounded-2xl text-[10px] font-bold hover:bg-black transition-all shadow-xl active:scale-95 shadow-slate-200 flex items-center gap-2">
                     <Plus size={16} /> New Claim
                  </button>
               </div>
               <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
                  <div className="overflow-x-auto">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50/50">
                              <th className="px-8 py-5 text-[10px] font-bold text-slate-400 font-bold">Claim Logic</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                              <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Payment Registry</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {benefits.claims.map((claim, i) => {
                              let history = [];
                              try { history = claim.approvalHistory ? JSON.parse(claim.approvalHistory) : []; } catch(e) {}
                              const isApproved = claim.overallStatus === 'Completed' || claim.overallStatus === 'Approved';
                              const isRejected = claim.overallStatus.includes('Rejected');
                              
                              return (
                                 <React.Fragment key={i}>
                                    <tr className="group hover:bg-slate-50/30 transition-colors">
                                       <td className="px-8 py-7">
                                          <p className="text-sm font-black text-slate-900 italic tracking-tight">{claim.title}</p>
                                          <p className="text-[10px] font-black text-slate-400 font-bold mt-1.5">{formatDate(claim.claimedAt)} • {claim.provider}</p>
                                       </td>
                                       <td className="px-8 py-7">
                                          <p className="text-base font-black text-slate-900 tabular-nums">{formatCurrency(claim.amount)}</p>
                                       </td>
                                       <td className="px-8 py-7 text-center">
                                          <span className={cn(
                                             "px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border italic",
                                             isApproved ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                             isRejected ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                          )}>
                                             {claim.overallStatus || claim.status}
                                          </span>
                                       </td>
                                       <td className="px-8 py-7 text-right">
                                          <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", claim.paymentStatus === 'Processed' ? "text-emerald-500" : "text-slate-400")}>{claim.paymentStatus === 'Processed' ? 'Settled to Bank' : 'Awaiting Audit'}</p>
                                       </td>
                                    </tr>
                                    {history.length > 0 && (
                                       <tr className="bg-slate-50/30">
                                          <td colSpan={4} className="px-8 py-4">
                                             <div className="flex gap-4 items-center overflow-x-auto pb-2">
                                                {history.map((step, idx) => (
                                                   <div key={idx} className="flex items-center">
                                                      <div className="flex flex-col min-w-[120px] p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                                                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{formatDate(step.date)}</span>
                                                         <span className="text-xs font-black text-slate-800 italic mt-1">{step.action}</span>
                                                         <span className="text-[10px] font-bold text-slate-500 mt-0.5 truncate" title={step.actor}>by {step.actor}</span>
                                                         {step.comment && (
                                                            <span className="text-[10px] text-slate-500 italic mt-1 truncate max-w-[150px]" title={step.comment}>"{step.comment}"</span>
                                                         )}
                                                      </div>
                                                      {idx < history.length - 1 && (
                                                         <div className="w-8 h-[2px] bg-slate-200 mx-2"></div>
                                                      )}
                                                   </div>
                                                ))}
                                             </div>
                                          </td>
                                       </tr>
                                    )}
                                 </React.Fragment>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               </div>
            </div>

            {/* Wellness Section */}
            <div className="lg:col-span-4 space-y-8">
               <div className="card p-10 bg-gradient-to-br from-indigo-600 to-primary-700 text-white border-none shadow-premium relative overflow-hidden group">
                  <div className="absolute -right-10 -top-10 opacity-10 group-hover:scale-125 transition-transform duration-1000">
                     <LifeBuoy size={200} />
                  </div>
                  <h3 className="text-[10px] font-bold text-primary-300 mb-8">Premium Support for {profile?.fullName || 'You'}</h3>
                  <p className="text-base font-black italic italic leading-relaxed mb-10 tracking-tight">Need expert navigation through your benefits ecosystem?</p>
                  <button onClick={handleConnectAdvisor} className="w-full py-5 bg-white text-primary-700 rounded-2xl font-bold text-[10px] shadow-2xl hover:bg-slate-50 transition-all flex items-center justify-center gap-3">
                     Connect with Advisor
                  </button>
               </div>

               <div className="card p-10  text-left">
                  <h3 className="text-xl font-bold text-slate-900 italic tracking-tight mb-8 leading-none dark:text-white">Active Perks</h3>
                  <div className="space-y-4">
                     {[
                        { label: 'Digital Library', icon: Activity },
                        { label: 'Gym Subsidy', icon: Briefcase },
                        { label: 'Mental Care', icon: Heart }
                     ].map((perk, i) => (
                        <div key={i} className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 group cursor-pointer hover:border-primary-100 transition-colors">
                           <div className="flex items-center gap-4">
                              <div className="p-2 bg-white rounded-lg text-slate-300 group-hover:text-primary-500 transition-colors">
                                 <perk.icon size={20} />
                              </div>
                              <span className="text-[10px] font-black text-slate-600 font-bold">{perk.label}</span>
                           </div>
                           <CheckCircle2 size={18} className="text-emerald-500" />
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Claim Modal */}
         < CenterModal isOpen={isClaimModalOpen} onClose={() => setIsClaimModalOpen(false)} title="New Reimbursement Request" >
            <form onSubmit={handleClaimSubmit} className="p-8 space-y-8 text-left">
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 font-bold px-1">Reimbursement Type</label>
                     <select name="type" className="input-field h-14 bg-slate-50 border-transparent font-black">
                        <option>Medical Expense</option>
                        <option>Work Equipment</option>
                        <option>Skill Development</option>
                        <option>Travel Allowance</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Amount ({getSymbol()})</label>
                     <div className="relative">
                        <CurrencyIcon className="absolute left-4 top-5 text-slate-300" size={18} />
                        <input name="amount" type="number" required placeholder="0.00" className="input-field h-14 pl-12 bg-slate-50 border-transparent font-black" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Expense Date</label>
                     <DatePicker name="date" value={claimDate} onChange={(e) => setClaimDate(e.target.value)} required className="input-field h-14 bg-slate-50 border-transparent font-black" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Bill / Receipt</label>
                     <label className="h-14 border-2 border-dashed border-slate-100 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-[9px] font-black uppercase text-slate-300 tracking-widest cursor-pointer hover:border-slate-300 transition-colors relative">
                        {claimFile ? (
                           <span className="text-primary-600 truncate px-2 w-full text-center">
                              {claimFile.name}
                           </span>
                        ) : (
                           <span>Upload Document</span>
                        )}
                        <input 
                           type="file" 
                           className="hidden" 
                           onChange={(e) => {
                              if (e.target.files && e.target.files.length > 0) {
                                 setClaimFile(e.target.files[0]);
                              }
                           }}
                        />
                     </label>
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reason / Description</label>
                  <textarea name="description" rows="3" required className="input-field py-4 bg-slate-50 border-transparent font-black resize-none" placeholder="Provide full context for audit..."></textarea>
               </div>
               <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setIsClaimModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" className="flex-2 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">Submit Claim</button>
               </div>
            </form>
         </CenterModal >
      </div >
   );
};

export default EmployeeBenefits;
