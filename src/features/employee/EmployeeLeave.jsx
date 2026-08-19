import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Search, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  FileText, 
  Heart, 
  Sun, 
  Stethoscope, 
  Briefcase, 
  X, 
  ChevronRight,
  ShieldCheck,
  Zap,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useEmployee } from '../../context/EmployeeContext';
import CenterModal from '../../shared/components/layout/CenterModal';
import PhoneInput from '../../shared/components/ui/PhoneInput';
import DatePicker from '../../shared/components/common/DatePicker';

const EmployeeLeave = () => {
  const { leaves, requestLeave, cancelLeave, showToast } = useEmployee();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [leaveAttachment, setLeaveAttachment] = useState(null);
  const leaveFileInputRef = useRef(null);

  const balances = [
    { label: 'Sick Leave', value: leaves.balance.sick, total: 10, icon: Stethoscope, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Annual Leave', value: leaves.balance.annual, total: 15, icon: Briefcase, color: 'text-primary-600', bg: 'bg-primary-50' },
    { label: 'Casual Leave', value: leaves.balance.casual, total: 5, icon: Sun, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Used', value: (10+15+5) - (leaves.balance.sick + leaves.balance.annual + leaves.balance.casual), total: 30, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  const filteredHistory = leaves.requests.filter(item => {
    const matchesSearch = item.type.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' ? true : 
                          filterStatus === 'Pending' ? (item.status === 'Pending' || item.status === 'MANAGER_APPROVED') :
                          item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleExport = () => {
    if (filteredHistory.length === 0) {
      showToast('No leave records to export', 'error');
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,Type,Start Date,End Date,Days,Status,Reason\n";
    filteredHistory.forEach(item => {
      csvContent += `"${item.type}","${item.startDate}","${item.endDate}","${item.days}","${item.status}","${item.reason.replace(/"/g, '""')}"\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Leave_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Leave report exported successfully');
  };

  const handleLeaveFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const kb = file.size / 1024;
        const sizeStr = kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
        setLeaveAttachment({
          name: file.name,
          size: sizeStr,
          fileBase64: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLeaveAttachment = (e) => {
    e.stopPropagation();
    setLeaveAttachment(null);
    if (leaveFileInputRef.current) {
      leaveFileInputRef.current.value = '';
    }
  };

  const handleRequestSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const startDate = new Date(formData.get('startDate'));
    const endDate = new Date(formData.get('endDate'));
    const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    if (days <= 0) {
      showToast('End date must be after start date', 'error');
      return;
    }

    const type = formData.get('type');
    const balanceKey = type.toLowerCase().replace(' leave', '');
    
    if (balanceKey !== 'unpaid' && leaves.balance[balanceKey] !== undefined && leaves.balance[balanceKey] < days) {
      showToast(`Insufficient balance for ${type}`, 'error');
      return;
    }

    requestLeave({
      leaveType: type,
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      reason: formData.get('reason'),
      emergencyContact: formData.get('emergency'),
      totalDays: days,
      attachment: leaveAttachment
    });
    
    setLeaveAttachment(null);
    if (leaveFileInputRef.current) {
      leaveFileInputRef.current.value = '';
    }
    setIsRequestModalOpen(false);
  };

  return (
    <div className="space-y-8 pb-12 animate-fade-in relative max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Time Off Management</h1>
          <p className="text-slate-500 font-bold tracking-tight">Manage your leave balance, history, and requests</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="btn-secondary px-6 py-2.5 font-bold flex items-center gap-2">
            <Download size={18} />
            <span>Report</span>
          </button>
          <button 
            onClick={() => setIsRequestModalOpen(true)}
            className="btn-primary px-8 py-2.5 font-bold flex items-center justify-center gap-2 shadow-xl shadow-primary-200 active:scale-95 transition-all"
          >
             <Plus size={18} />
             <span>Request Time Off</span>
          </button>
        </div>
      </div>

      {/* Leave Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {balances.map((bal, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card p-6 group"
          >
            <div className="flex items-center justify-between mb-6">
               <div className={cn("p-3 rounded-2xl group-hover:scale-110 transition-transform", bal.bg, bal.color)}>
                  <bal.icon size={26} />
               </div>
               <span className="text-[10px] font-bold text-slate-400 font-bold px-3 py-1 bg-slate-50 rounded-lg border border-slate-100">
                  {bal.total} Total
               </span>
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 font-bold leading-none mb-2">{bal.label}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight dark:text-white">{bal.value} <span className="text-sm font-bold text-slate-300">Available</span></h3>
            </div>
            <div className="mt-6 w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-[1px]">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(bal.value / bal.total) * 100}%` }}
                 className={cn("h-full rounded-full transition-all", bal.color.replace('text', 'bg'))} 
               />
            </div>
          </motion.div>
        ))}
      </div>

      {/* History Area */}
      <div className="space-y-8">
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight italic dark:text-white">My Leave History</h3>
            <div className="flex items-center gap-3">
               <div className="relative">
                  <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="Search history..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border border-slate-100 rounded-xl pl-10 pr-4 py-2 text-xs font-bold w-48 focus:ring-2 focus:ring-primary-100 outline-none transition-all" 
                  />
               </div>
               <div className="flex items-center gap-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
                  {['All', 'Approved', 'Pending'].map(status => (
                    <button 
                      key={status} 
                      onClick={() => setFilterStatus(status)} 
                      className={cn(
                        "px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        filterStatus === status ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-600"
                      )}
                    >
                      {status}
                    </button>
                  ))}
               </div>
            </div>
         </div>

         <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
            <table className="w-full text-left">
               <thead>
                  <tr className="bg-slate-50/50">
                     <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em]">Leave Type</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em]">Duration</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Calculated Days</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-center">Status</th>
                     <th className="px-8 py-5 text-[10px] uppercase font-black text-slate-400 tracking-[0.2em] text-right">Reason / Logic</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {filteredHistory.length > 0 ? filteredHistory.map((item, i) => (
                     <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-7">
                           <p className="font-black text-slate-800 text-sm">{item.type}</p>
                           <p className="text-[10px] font-bold text-slate-400 font-bold mt-1.5">UID: #LV-{item.id.toString().slice(-4)}</p>
                        </td>
                        <td className="px-8 py-7">
                           <div className="flex items-center gap-4">
                              <Calendar size={16} className="text-primary-400" />
                              <p className="font-black text-slate-700 text-xs tabular-nums text-left leading-none">
                                {item.startDate} <span className="text-slate-200 mx-2">—</span> {item.endDate}
                              </p>
                           </div>
                        </td>
                        <td className="px-8 py-7 text-center">
                           <span className="font-black text-slate-900 text-lg tabular-nums">{item.days}</span>
                        </td>
                        <td className="px-8 py-7 text-center">
                           <span className={cn(
                              "px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border italic",
                              item.status === 'Approved' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              (item.status === 'Pending' || item.status === 'MANAGER_APPROVED') ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-rose-50 text-rose-500 border-rose-100"
                           )}>
                              {item.status === 'MANAGER_APPROVED' ? 'Pending HR' : item.status}
                           </span>
                        </td>
                        <td className="px-8 py-7 text-right">
                           <div className="space-y-1.5">
                               <p className="text-xs font-black text-slate-500 italic">"{item.reason}"</p>
                               {item.attachment && item.attachment.fileBase64 && (
                                 <div className="flex justify-end mt-1">
                                   <a 
                                     href={item.attachment.fileBase64} 
                                     download={item.attachment.name || 'Leave_Attachment'} 
                                     className="inline-flex items-center gap-1 text-[10px] font-bold text-primary-600 dark:text-primary-400 hover:underline"
                                     title="Download Document"
                                   >
                                     <FileText size={12} />
                                     <span>{item.attachment.name}</span>
                                   </a>
                                 </div>
                               )}
                               <div className="flex items-center justify-end gap-2">
                                 {item.status === 'Pending' && (
                                   <button onClick={async () => { await cancelLeave(item.id); }} className="text-[9px] font-bold text-rose-500 font-bold hover:underline">Cancel</button>
                                 )}
                                 <p className="text-[10px] font-black text-primary-600 font-bold">{item.managerComment ? 'Reviewed' : 'Awaiting Review'}</p>
                              </div>
                           </div>
                        </td>
                     </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="py-20 text-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                           <Calendar size={48} className="animate-pulse" />
                           <p className="text-[10px] font-bold">No leave records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Leave Request Modal */}
      <CenterModal isOpen={isRequestModalOpen} onClose={() => setIsRequestModalOpen(false)} title="New Time Off Request">
         <form onSubmit={handleRequestSubmit} className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Select Leave Type</label>
                  <select name="type" required className="input-field h-14 bg-slate-50 border-transparent font-black">
                     <option value="Sick Leave">Sick Leave (Available: {leaves.balance.sick})</option>
                     <option value="Annual Leave">Annual Leave (Available: {leaves.balance.annual})</option>
                     <option value="Casual Leave">Casual Leave (Available: {leaves.balance.casual})</option>
                     <option value="Unpaid Leave">Unpaid Leave</option>
                  </select>
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Emergency Contact</label>
                  <PhoneInput 
                    name="emergency" 
                    value={emergencyPhone}
                    onChange={e => setEmergencyPhone(e.target.value)}
                    required 
                    className="h-14 font-black bg-slate-50 border-transparent text-slate-900"
                  />
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Start Date</label>
                  <DatePicker name="startDate"  required className="input-field h-14 bg-slate-50 border-transparent font-black" />
               </div>
               <div className="space-y-2 text-left">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">End Date</label>
                  <DatePicker name="endDate"  required className="input-field h-14 bg-slate-50 border-transparent font-black" />
               </div>
            </div>
            <div className="space-y-2 text-left">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reason for Request</label>
               <textarea name="reason" rows="3" required className="input-field py-4 bg-slate-50 border-transparent font-black resize-none" placeholder="Provide context for your manager..."></textarea>
            </div>

            <div className="space-y-2 text-left">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Document Attachment (Optional)</label>
               <input 
                 type="file" 
                 ref={leaveFileInputRef} 
                 onChange={handleLeaveFileChange} 
                 className="hidden" 
                 accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
               />
               <div 
                 onClick={() => leaveFileInputRef.current?.click()} 
                 className="h-14 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-between px-4 text-xs font-bold bg-slate-50 cursor-pointer hover:border-primary-400 transition-colors"
               >
                  {leaveAttachment ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2 truncate">
                        <FileText size={18} className="text-primary-600 shrink-0" />
                        <span className="truncate text-slate-800 font-bold">{leaveAttachment.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">({leaveAttachment.size})</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={handleRemoveLeaveAttachment} 
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 transition-colors"
                        title="Remove File"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full gap-2 text-slate-400 text-[10px] font-bold">
                       <Upload size={18} />
                       <span>Upload Attachment Document</span>
                    </div>
                  )}
               </div>
            </div>
            
            <div className="pt-4 flex gap-4">
               <button type="button" onClick={() => setIsRequestModalOpen(false)} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold">Discard</button>
               <button type="submit" className="flex-2 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 active:scale-95 transition-all">Submit Request</button>
            </div>
         </form>
      </CenterModal>
    </div>
  );
};

export default EmployeeLeave;
