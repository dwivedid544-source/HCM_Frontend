import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
   CreditCard,
   Download,
   CheckCircle2,
   Plus,
   Search,
   History,
   FileText,
   ShieldCheck,
   Zap,
   Calendar,
   ArrowUpRight,
   MoreVertical,
   Filter,
   Info,
   DollarSign,
   PieChart,
   BarChart3,
   Star,
   Mail,
   RefreshCw,
   Eye,
   CornerDownLeft
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAdmin } from '../../context/AdminContext';
import { useCurrency } from '../../hooks/useCurrency';
import { useDateFormat } from '../../hooks/useDateFormat';
import UpgradePlanModal from '../../shared/components/admin/UpgradePlanModal';
import ExportHistoryModal from '../../shared/components/admin/ExportHistoryModal';
import ManageAddonsModal from '../../shared/components/admin/ManageAddonsModal';
import InvoiceDrawer from '../../shared/components/admin/InvoiceDrawer';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import AddPaymentMethodModal from '../../shared/components/admin/AddPaymentMethodModal';
import OpenTicketModal from '../../shared/components/admin/OpenTicketModal';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';

const Billing = () => {
   const { billingPlan, invoices, updateInvoice, showToast } = useAdmin();
   const { formatCurrency } = useCurrency();
   const { formatDate } = useDateFormat();
   const [searchTerm, setSearchTerm] = useState('');

   const cleanAmount = (amt) => {
      if (!amt) return 0;
      const num = parseFloat(String(amt).replace(/[^0-9.-]/g, ''));
      return isNaN(num) ? 0 : num;
   };

   const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
   const [isExportOpen, setIsExportOpen] = useState(false);
   const [isAddonsOpen, setIsAddonsOpen] = useState(false);
   const [invoiceToView, setInvoiceToView] = useState(null);
   const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false);
   const [isTicketOpen, setIsTicketOpen] = useState(false);
   const [invoiceToRefund, setInvoiceToRefund] = useState(null);

   const [paymentMethod, setPaymentMethod] = useState({
      type: 'Visa',
      last4: '4242',
      expiry: '12/28',
      cardholder: 'Enterprise Client'
   });

   const filteredInvoices = (invoices || []).filter(inv => 
      (inv.id || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (inv.status || '').toLowerCase().includes(searchTerm.toLowerCase())
   );

   return (
      <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="hcm-page-title">Billing & Subscriptions</h1>
               <p className="text-slate-500 font-medium tracking-tight">Manage your enterprise plan, payment methods and historical tax invoices</p>
            </div>
            <div className="flex items-center gap-3">
               <button onClick={() => setIsExportOpen(true)} className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2">
                  <Download size={18} />
                  <span className="hidden sm:inline">Export History</span>
               </button>
               <button onClick={() => setIsUpgradeOpen(true)} className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200">
                  <Star size={18} fill="currentColor" />
                  <span>Upgrade Plan</span>
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Plan Status & Payment Method */}
            <div className="lg:col-span-4 space-y-8 h-full flex flex-col">
               <div className="card p-8 bg-slate-900 text-white border-none shadow-soft relative overflow-hidden group flex-1">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                     <Star size={120} />
                  </div>
                  <div className="mb-10">
                     <span className="px-2.5 py-1 bg-primary-600 rounded-lg text-[10px] font-bold shadow-lg shadow-primary-900/20">{billingPlan?.name || 'Professional'}</span>
                     <div className="mt-8">
                        <p className="text-[10px] font-bold text-slate-500 font-bold mb-2">{billingPlan?.cycle || 'Monthly'} Commitment</p>
                        <h3 className="text-5xl font-bold tracking-tighter">{formatCurrency(billingPlan?.price || 0, 'USD')}<span className="text-xl text-slate-500 font-medium ml-1">/{billingPlan?.cycle === 'Monthly' ? 'mo' : 'yr'}</span></h3>
                     </div>
                  </div>
                  <div className="space-y-6 pt-10 border-t border-white/5 relative z-10">
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 font-bold">
                        <span>License Limit</span>
                        <span className="text-white">Up to {billingPlan?.users || 0} Users</span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Renewal Date</span>
                        <span className="text-white">Nov 01, 2026</span>
                     </div>
                     <div className="flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        <span>Add-ons Active</span>
                        <span className="text-primary-400 truncate max-w-[140px] text-right" title={billingPlan?.addons?.join(', ') || 'None'}>{billingPlan?.addons?.length ? billingPlan.addons.join(', ') : 'None'}</span>
                     </div>
                  </div>
                  <div className="mt-12">
                     <button onClick={() => setIsAddonsOpen(true)} className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-bold hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                        Manage Add-ons <ArrowUpRight size={14} />
                     </button>
                  </div>
               </div>

               <div className="card p-8">
                  <div className="flex items-center justify-between mb-8">
                     <h3 className="text-lg font-bold text-slate-900 tracking-tight dark:text-white">Payment Method</h3>
                     <button onClick={() => setIsAddPaymentOpen(true)} className="p-2 text-primary-600 hover:bg-primary-50 active:scale-[0.9] rounded-xl transition-all"><Plus size={20} /></button>
                  </div>
                  <div className="p-6 bg-slate-900/5 border border-slate-100 rounded-3xl flex items-center gap-5">
                     <div className="w-14 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold italic shadow-inner font-bold text-[10px]">
                        {paymentMethod.type}
                     </div>
                     <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900 leading-none mb-2 tracking-tight truncate">
                           {paymentMethod.type} Ending in {paymentMethod.last4}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 font-bold leading-none">
                           Expires {paymentMethod.expiry} • Default
                        </p>
                     </div>
                     <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  </div>
               </div>
            </div>

            {/* Invoice Registry */}
            <div className="lg:col-span-8 space-y-6">
               <div className="card p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-10">
                     <div>
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight dark:text-white">Billing History</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Transaction record for tax compliance</p>
                     </div>
                     <div className="relative w-full lg:w-72">
                        <Search className="absolute left-3 top-3 text-slate-300" size={18} />
                        <input type="text" placeholder="Search invoices..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="input-field pl-10 h-11 bg-slate-50 border-transparent shadow-sm text-xs font-bold w-full" />
                     </div>
                  </div>

                  <div className="p-0 overflow-x-auto min-h-[400px]">
                     <table className="w-full text-left">
                        <thead>
                           <tr className="bg-slate-50/50">
                              <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Invoice ID</th>
                              <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Date</th>
                              <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Amount</th>
                              <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Method</th>
                              <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center">Status</th>
                              <th className="px-8 py-5 text-right text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                           {filteredInvoices.map((inv) => (
                              <tr key={inv.id} className="group hover:bg-slate-50/20 transition-colors">
                                 <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                       <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:text-primary-600 transition-colors cursor-pointer" onClick={() => setInvoiceToView(inv)}>
                                          <FileText size={18} />
                                       </div>
                                       <span className="text-sm font-bold text-slate-900 tracking-tight cursor-pointer" onClick={() => setInvoiceToView(inv)}>{inv.id}</span>
                                    </div>
                                 </td>
                                 <td className="px-8 py-6 text-center whitespace-nowrap text-xs font-bold text-slate-600">{formatDate(inv.date)}</td>
                                 <td className="px-8 py-6 text-center font-black text-slate-900 tracking-tight">{formatCurrency(cleanAmount(inv.amount), 'USD')}</td>
                                 <td className="px-8 py-6 text-center text-[10px] font-bold text-slate-500 uppercase tracking-widest">{inv.method}</td>
                                 <td className="px-8 py-6 text-center">
                                    <span className={cn(
                                       "px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border",
                                       inv.status === 'Paid' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                          inv.status === 'Refunded' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                             "bg-rose-50 text-rose-600 border-rose-100"
                                    )}>
                                       {inv.status}
                                    </span>
                                 </td>
                                 <td className="px-8 py-6 text-right">
                                     <div className="flex justify-end items-center gap-1.5">
                                        <button
                                           onClick={() => setInvoiceToView(inv)}
                                           className="p-1.5 text-slate-400 hover:text-indigo-650 hover:bg-slate-50 rounded-lg transition-all"
                                           title="View Invoice"
                                        >
                                           <Eye size={16} />
                                        </button>
                                        <button
                                           onClick={() => showToast(`Invoice ${inv.id} downloaded successfully.`)}
                                           className="p-1.5 text-slate-400 hover:text-primary-655 hover:bg-slate-50 rounded-lg transition-all"
                                           title="Download Invoice"
                                        >
                                           <Download size={16} />
                                        </button>
                                        <ActionDropdown
                                           actions={[
                                              { label: 'Resend Email', icon: Mail, onClick: () => showToast(`Invoice ${inv.id} resent via email.`) },
                                              ... (inv.status === 'Refunded' ? [] : [{ label: 'Refund Invoice', icon: CornerDownLeft, danger: true, onClick: () => setInvoiceToRefund(inv) }])
                                           ]}
                                        />
                                     </div>
                                  </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
               </div>

               <div className="p-8 bg-indigo-50/50 rounded-[2.5rem] border border-indigo-100 border-dashed flex items-center justify-between">
                  <div className="flex items-center gap-5">
                     <div className="p-4 bg-white rounded-2xl shadow-sm text-indigo-600">
                        <Info size={24} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-slate-900 font-bold mb-1 dark:text-white">Billing Support</h4>
                        <p className="text-xs font-medium text-slate-500 tracking-tight">Need a custom PO or tax-exemption? Contact our billing desk.</p>
                     </div>
                  </div>
                  <button onClick={() => setIsTicketOpen(true)} className="px-5 py-2 text-[10px] font-bold text-white bg-indigo-600 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 active:scale-[0.95]">Open Ticket</button>
               </div>
            </div>
         </div>

         <UpgradePlanModal isOpen={isUpgradeOpen} onClose={() => setIsUpgradeOpen(false)} />
         <ExportHistoryModal isOpen={isExportOpen} onClose={() => setIsExportOpen(false)} />
         <ManageAddonsModal isOpen={isAddonsOpen} onClose={() => setIsAddonsOpen(false)} />
         <InvoiceDrawer isOpen={!!invoiceToView} onClose={() => setInvoiceToView(null)} invoice={invoiceToView} />
         <AddPaymentMethodModal isOpen={isAddPaymentOpen} onClose={() => setIsAddPaymentOpen(false)} onSuccess={(newMethod) => setPaymentMethod(newMethod)} />
         <OpenTicketModal isOpen={isTicketOpen} onClose={() => setIsTicketOpen(false)} />

         <ConfirmDialog
             isOpen={!!invoiceToRefund}
             title="Refund Invoice"
             message={`Are you sure you want to refund invoice ${invoiceToRefund?.id}? The transaction amount of ${formatCurrency(cleanAmount(invoiceToRefund?.amount), 'USD')} will be returned.`}
             confirmText="Refund Invoice"
             onConfirm={() => {
                updateInvoice(invoiceToRefund.id, { status: 'Refunded' });
                showToast(`Refund initiated for ${invoiceToRefund.id}`);
                setInvoiceToRefund(null);
             }}
             onCancel={() => setInvoiceToRefund(null)}
          />
      </div>
   );
};

export default Billing;
