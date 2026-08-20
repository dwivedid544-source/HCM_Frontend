import React, { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '../../hooks/useCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Search, MessageSquare, Check, X, Info, FileText, DollarSign, Wallet } from 'lucide-react';
import { cn } from '../../utils/cn';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import { reimbursementAPI } from '../../utils/apiService';
import DatePicker from '../../shared/components/common/DatePicker';
import { useDateFormat } from '../../hooks/useDateFormat';
import toast from 'react-hot-toast';
import { usePersistedTab } from '../../hooks/usePersistedTab';

const AdminReimbursements = () => {
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = usePersistedTab('admin_reimbursements', 'Pending Approval');
  
  // Modals
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Form states
  const [comment, setComment] = useState('');
  const [paymentData, setPaymentData] = useState({
    paymentMethod: 'Bank Transfer',
    paymentReference: '',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await reimbursementAPI.getFinalApprovals();
      if (res.data?.success) {
        setClaims(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    try {
      const res = await reimbursementAPI.reviewFinalApproval(id, { status, comment });
      if (res.data?.success) {
        toast.success(`Claim ${status.toLowerCase()} successfully`);
        setComment('');
        setIsReviewModalOpen(false);
        setSelectedClaim(null);
        fetchClaims();
      } else {
        toast.error(res.data?.error?.message || 'Failed to update claim');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Something went wrong');
    }
  };

  const handleProcessPayment = async (e) => {
    e.preventDefault();
    try {
      const res = await reimbursementAPI.processPayment(selectedClaim.id, paymentData);
      if (res.data?.success) {
        toast.success('Payment processed successfully');
        setPaymentData({
          paymentMethod: 'Bank Transfer',
          paymentReference: '',
          paymentDate: new Date().toISOString().split('T')[0],
          notes: ''
        });
        setIsPaymentModalOpen(false);
        setSelectedClaim(null);
        fetchClaims();
      } else {
        toast.error(res.data?.error?.message || 'Failed to process payment');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error?.message || 'Something went wrong');
    }
  };

  const stats = useMemo(() => {
    return [
      { label: 'Pending Approvals', value: claims.filter(c => c.finalApprovalStatus === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Pending Payment', value: claims.filter(c => c.finalApprovalStatus === 'Approved' && c.paymentStatus === 'Pending').length, icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Completed', value: claims.filter(c => c.paymentStatus === 'Processed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Total Claims', value: claims.length, icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50' },
    ];
  }, [claims]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      let matchesTab = false;
      if (activeTab === 'All') matchesTab = true;
      else if (activeTab === 'Pending Approval') matchesTab = c.finalApprovalStatus === 'Pending';
      else if (activeTab === 'Pending Payment') matchesTab = c.finalApprovalStatus === 'Approved' && c.paymentStatus === 'Pending';
      else if (activeTab === 'Completed') matchesTab = c.paymentStatus === 'Processed' || c.finalApprovalStatus === 'Rejected';

      const term = searchQuery.toLowerCase();
      const matchesSearch = c.title.toLowerCase().includes(term) || (c.employee?.fullName || '').toLowerCase().includes(term);
      
      return matchesTab && matchesSearch;
    });
  }, [claims, activeTab, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic dark:text-white">Final Reimbursements</h2>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-2">Approve and process payments for employee claims</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="p-6 bg-white rounded-3xl shadow-soft border border-slate-100 flex items-center gap-5">
            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0", stat.bg, stat.color)}>
              <stat.icon size={24} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <p className="text-2xl font-black text-slate-900 tabular-nums">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex gap-2 flex-wrap">
          {['Pending Approval', 'Pending Payment', 'Completed', 'All'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                activeTab === tab 
                  ? "bg-slate-900 text-white shadow-md" 
                  : "bg-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            placeholder="Search claims..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-12 pr-4 bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-300 placeholder:font-bold"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-3xl shadow-soft border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 font-bold text-xs">Loading...</div>
        ) : filteredClaims.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 size={32} className="text-slate-300" />
            </div>
            <p className="text-sm font-bold text-slate-400 font-bold">No claims found</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 font-bold">Employee</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredClaims.map((claim) => (
                <tr key={claim.id} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <Avatar name={claim.employee?.fullName} src={claim.employee?.avatar} size="md" />
                      <div>
                        <p className="text-sm font-black text-slate-900">{claim.employee?.fullName}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{claim.employee?.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-900 italic">{claim.title}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-[150px] truncate">Mgr: {claim.managerStatus}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(claim.amount)}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{formatDate(claim.claimedAt)}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block border",
                      claim.overallStatus === 'Completed' || claim.overallStatus === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      claim.overallStatus.includes('Rejected') ? "bg-rose-50 text-rose-600 border-rose-100" :
                      "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {claim.overallStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right space-x-2">
                    {claim.finalApprovalStatus === 'Pending' && (
                      <button
                        onClick={() => { setSelectedClaim(claim); setIsReviewModalOpen(true); }}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                      >
                        Review
                      </button>
                    )}
                    {claim.finalApprovalStatus === 'Approved' && claim.paymentStatus === 'Pending' && (
                      <button
                        onClick={() => { setSelectedClaim(claim); setIsPaymentModalOpen(true); }}
                        className="px-4 py-2 bg-slate-900 border-transparent text-white rounded-xl text-[10px] font-bold hover:bg-black transition-all shadow-sm"
                      >
                        Process Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && selectedClaim && (
          <CenterModal isOpen={true} onClose={() => { setIsReviewModalOpen(false); setSelectedClaim(null); }} title="Final Review">
            <div className="p-8 space-y-8">
              <div className="flex items-center gap-4 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <Avatar name={selectedClaim.employee?.fullName} src={selectedClaim.employee?.avatar} size="lg" />
                <div>
                  <h4 className="text-lg font-bold text-slate-900">{selectedClaim.employee?.fullName}</h4>
                  <p className="text-xs font-bold text-slate-400 font-bold mt-1">
                    {selectedClaim.employee?.department?.name || 'Department'} • {selectedClaim.employee?.employeeId}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 bg-slate-50/50 p-6 rounded-2xl border border-slate-50">
                <div>
                  <p className="text-[10px] font-black text-slate-400 font-bold mb-1">Claim Type</p>
                  <p className="text-sm font-black text-slate-900 italic">{selectedClaim.title}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount</p>
                  <p className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(selectedClaim.amount)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Description</p>
                  <p className="text-xs font-bold text-slate-600 bg-white p-4 rounded-xl border border-slate-100 mt-2">{selectedClaim.provider || 'No description provided.'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Manager Status</p>
                  <p className={cn("text-xs font-bold italic mt-1", selectedClaim.managerStatus === 'Approved' ? "text-emerald-600" : "text-amber-600")}>
                    {selectedClaim.managerStatus} 
                    {selectedClaim.managerComment && ` - "${selectedClaim.managerComment}"`}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <MessageSquare size={12} /> Final Comment (Optional)
                  </label>
                  <textarea 
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full h-24 p-4 bg-slate-50 border-transparent rounded-2xl text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                    placeholder="Add final approval notes..."
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button 
                    onClick={() => handleReview(selectedClaim.id, 'Rejected')}
                    className="flex-1 py-4 bg-white border-2 border-rose-100 text-rose-500 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-50 hover:border-rose-200 transition-all"
                  >
                    <X size={18} strokeWidth={3} /> Reject
                  </button>
                  <button 
                    onClick={() => handleReview(selectedClaim.id, 'Approved')}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black shadow-xl shadow-slate-200 transition-all"
                  >
                    <Check size={18} strokeWidth={3} /> Approve
                  </button>
                </div>
              </div>
            </div>
          </CenterModal>
        )}
      </AnimatePresence>

      {/* Process Payment Modal */}
      <AnimatePresence>
        {isPaymentModalOpen && selectedClaim && (
          <CenterModal isOpen={true} onClose={() => { setIsPaymentModalOpen(false); setSelectedClaim(null); }} title="Process Payment">
            <form onSubmit={handleProcessPayment} className="p-8 space-y-8 text-left">
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 font-bold">Amount to Pay</p>
                  <p className="text-2xl font-black text-slate-900 tabular-nums">{formatCurrency(selectedClaim.amount)}</p>
                </div>
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-500">
                  <DollarSign size={24} strokeWidth={2.5} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 font-bold px-1">Payment Method</label>
                  <select 
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                    className="input-field h-14 bg-slate-50 border-transparent font-black"
                  >
                    <option>Bank Transfer</option>
                    <option>Cash</option>
                    <option>Cheque</option>
                    <option>Payroll Addition</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Payment Date</label>
                  <DatePicker 
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                    className="input-field h-14 bg-slate-50 border-transparent font-black"
                    required
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reference Number</label>
                  <input 
                    type="text"
                    value={paymentData.paymentReference}
                    onChange={(e) => setPaymentData({...paymentData, paymentReference: e.target.value})}
                    className="input-field h-14 bg-slate-50 border-transparent font-black"
                    placeholder="e.g. TRN-12345678"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                    <MessageSquare size={12} /> Notes
                  </label>
                  <textarea 
                    value={paymentData.notes}
                    onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                    className="w-full h-24 p-4 bg-slate-50 border-transparent rounded-2xl text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                    placeholder="Add any payment notes..."
                  />
                </div>
              </div>
              
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={() => { setIsPaymentModalOpen(false); setSelectedClaim(null); }} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Cancel</button>
                <button type="submit" className="flex-2 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200">Record Payment</button>
              </div>
            </form>
          </CenterModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReimbursements;
