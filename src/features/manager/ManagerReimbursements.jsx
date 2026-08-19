import React, { useState, useEffect, useMemo } from 'react';
import { useCurrency } from '../../hooks/useCurrency';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Clock, Search, MessageSquare, Check, X, Info, FileText } from 'lucide-react';
import { cn } from '../../utils/cn';
import CenterModal from '../../shared/components/common/CenterModal';
import Avatar from '../../shared/components/ui/Avatar';
import { managerAPI } from '../../utils/apiService';
import { useDateFormat } from '../../hooks/useDateFormat';
import toast from 'react-hot-toast';

const ManagerReimbursements = () => {
  const { formatCurrency } = useCurrency();
  const { formatDate } = useDateFormat();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('Pending');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await managerAPI.getManagerReimbursements();
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
      const res = await managerAPI.reviewManagerReimbursement(id, { status, comment });
      if (res.data?.success) {
        toast.success(`Claim ${status.toLowerCase()} successfully`);
        setComment('');
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

  const stats = useMemo(() => {
    return [
      { label: 'Pending Approvals', value: claims.filter(c => c.managerStatus === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
      { label: 'Approved', value: claims.filter(c => c.managerStatus === 'Approved').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Rejected', value: claims.filter(c => c.managerStatus === 'Rejected').length, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
      { label: 'Total Claims', value: claims.length, icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50' },
    ];
  }, [claims]);

  const filteredClaims = useMemo(() => {
    return claims.filter(c => {
      const matchesTab = activeTab === 'All' ? true : c.managerStatus === activeTab;
      const term = searchQuery.toLowerCase();
      const matchesSearch = c.title.toLowerCase().includes(term) || (c.employee?.fullName || '').toLowerCase().includes(term);
      return matchesTab && matchesSearch;
    });
  }, [claims, activeTab, searchQuery]);

  return (
    <div className="space-y-8">
      {/* Header & Stats */}
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight italic dark:text-white">Reimbursement Approvals</h2>
        <p className="text-sm font-black text-slate-400 uppercase tracking-widest mt-2">Manage team reimbursement claims</p>
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
        <div className="flex gap-2">
          {['Pending', 'Approved', 'Rejected', 'All'].map(tab => (
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
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Claim Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Amount</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
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
                    <p className="text-[10px] font-bold text-slate-400 mt-1 max-w-[150px] truncate">{claim.provider}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-slate-900 tabular-nums">{formatCurrency(claim.amount)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-black text-slate-900">{formatDate(claim.claimedAt)}</p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block border",
                      claim.managerStatus === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                      claim.managerStatus === 'Rejected' ? "bg-rose-50 text-rose-600 border-rose-100" :
                      "bg-amber-50 text-amber-600 border-amber-100"
                    )}>
                      {claim.managerStatus}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button
                      onClick={() => setSelectedClaim(claim)}
                      className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-[10px] font-bold hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedClaim && (
          <CenterModal isOpen={true} onClose={() => setSelectedClaim(null)} title="Review Claim">
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
              </div>

              {selectedClaim.managerStatus === 'Pending' ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                      <MessageSquare size={12} /> Add Comment (Optional)
                    </label>
                    <textarea 
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full h-24 p-4 bg-slate-50 border-transparent rounded-2xl text-xs font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-primary-500 transition-all resize-none"
                      placeholder="Add any notes for the employee..."
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
              ) : (
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-start gap-4">
                  <Info className="text-primary-500 mt-1" size={20} />
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-bold">Already Reviewed</p>
                    <p className="text-[10px] font-bold text-slate-500 mt-2">
                      This claim was marked as <span className="font-black italic text-slate-700">{selectedClaim.managerStatus}</span>. 
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CenterModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ManagerReimbursements;
