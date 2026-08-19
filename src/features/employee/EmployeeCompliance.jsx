import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scale, CheckCircle2, AlertCircle, FileText, Download, X, Eye, ShieldCheck, CheckSquare, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';
import { employeeAPI } from '../../utils/apiService';
import CenterModal from '../../shared/components/layout/CenterModal';
import { toast } from 'react-hot-toast';

const EmployeeCompliance = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPolicy, setSelectedPolicy] = useState(null);
  const [isReadingModalOpen, setIsReadingModalOpen] = useState(false);
  const [isAcknowledging, setIsAcknowledging] = useState(false);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await employeeAPI.getPolicies();
      setPolicies(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch policies:', err);
      toast.error('Failed to load compliance policies');
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledge = async (id) => {
    setIsAcknowledging(true);
    try {
      await employeeAPI.acknowledgePolicy(id);
      toast.success('Policy acknowledged successfully');
      setIsReadingModalOpen(false);
      fetchPolicies();
    } catch (err) {
      console.error('Acknowledgment failed:', err);
      toast.error(err.response?.data?.message || 'Failed to acknowledge policy');
    } finally {
      setIsAcknowledging(false);
    }
  };

  const handleDownloadPdf = (pdfName, pdfData) => {
    if (!pdfData) {
      toast.error('No PDF data available for this policy');
      return;
    }

    try {
      // Decode the Base64 string
      const byteCharacters = atob(pdfData.split(',')[1] || pdfData);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pdfName || 'policy.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${pdfName}`);
    } catch (err) {
      console.error('Failed to download PDF:', err);
      toast.error('Failed to download PDF file');
    }
  };

  const openPolicy = (policy) => {
    setSelectedPolicy(policy);
    setIsReadingModalOpen(true);
  };

  const pendingCount = policies.filter(p => !p.hasAcknowledged).length;
  const acknowledgedCount = policies.filter(p => p.hasAcknowledged).length;

  const stats = [
    { label: 'Pending Acknowledgment', value: pendingCount, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Acknowledged Policies', value: acknowledgedCount, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Policies', value: policies.length, icon: FileText, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="hcm-page-title">Compliance & Policies</h1>
          <p className="text-slate-500 font-medium tracking-tight text-sm sm:text-base">
            Review and acknowledge company policies and compliance documents
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, idx) => (
          <motion.div key={idx} whileHover={{ y: -5 }} className="card p-4 sm:p-6 min-w-0">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className={cn("p-2.5 sm:p-3 rounded-2xl shrink-0", stat.bg, stat.color)}>
                <stat.icon size={22} className="sm:w-[26px] sm:h-[26px]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 sm:mb-1.5 truncate">{stat.label}</p>
                <h3 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight dark:text-white truncate">{stat.value}</h3>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Policies List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {policies.length > 0 ? policies.map(policy => (
          <div key={policy.id} className={cn("card p-6 border flex flex-col justify-between transition-shadow hover:shadow-lg", policy.hasAcknowledged ? "border-emerald-100" : "border-amber-100")}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-primary-600 border border-slate-100">
                  <ShieldCheck size={24} />
                </div>
                {policy.hasAcknowledged ? (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-emerald-100">
                    <CheckCircle2 size={14} /> Accepted
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-amber-50 text-amber-600 text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1.5 border border-amber-100">
                    <Clock size={14} /> Pending
                  </span>
                )}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1">{policy.name}</h3>
              <p className="text-sm font-medium text-slate-500 mb-4">{policy.category} • Ver {policy.version}</p>
              
              <p className="text-sm text-slate-600 line-clamp-2 mb-6">
                {policy.description || 'No description provided.'}
              </p>

              {policy.pdfName && (
                <div className="flex items-center gap-2 mb-4 text-xs font-bold text-slate-500">
                  <FileText size={14} className="text-red-500" />
                  <span className="truncate">{policy.pdfName}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => openPolicy(policy)}
                className="flex-1 btn-secondary py-2.5 font-bold flex items-center justify-center gap-2"
              >
                <Eye size={16} /> Read Policy
              </button>
              
              {!policy.hasAcknowledged && (
                <button 
                  onClick={() => openPolicy(policy)}
                  className="flex-1 btn-primary py-2.5 font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-200"
                >
                  <CheckSquare size={16} /> Accept
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center text-slate-500 bg-white rounded-3xl border border-slate-100 border-dashed">
            <Scale size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">No Policies Found</h3>
            <p>There are no compliance policies available at this time.</p>
          </div>
        )}
      </div>

      {/* Policy Reading Modal */}
      <AnimatePresence>
        {isReadingModalOpen && selectedPolicy && (
          <CenterModal isOpen={isReadingModalOpen} onClose={() => setIsReadingModalOpen(false)}>
            <div className="p-6 md:p-8 max-w-2xl w-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{selectedPolicy.name}</h2>
                  <p className="text-sm font-medium text-slate-500 mt-1">Version {selectedPolicy.version} • Published {selectedPolicy.effectiveDate || selectedPolicy.createdAt?.split('T')[0]}</p>
                </div>
                <button onClick={() => setIsReadingModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 max-h-[50vh] overflow-y-auto mb-8 prose prose-sm prose-slate max-w-none">
                <p className="whitespace-pre-wrap">{selectedPolicy.description || 'This document contains the standard operating procedures and compliance rules. By acknowledging this document, you agree to adhere to the policies stated within.'}</p>
                
                {selectedPolicy.pdfName && (
                  <div className="mt-8 p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-12 h-12 rounded-lg bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                        <FileText size={24} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 text-sm truncate">{selectedPolicy.pdfName}</p>
                        <p className="text-xs font-medium text-slate-500">PDF Document</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDownloadPdf(selectedPolicy.pdfName, selectedPolicy.pdfData)}
                      className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors shrink-0 border border-transparent hover:border-primary-100"
                      title="Download PDF"
                    >
                      <Download size={20} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setIsReadingModalOpen(false)} 
                  className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
                >
                  Close
                </button>
                {!selectedPolicy.hasAcknowledged && (
                  <button 
                    onClick={() => handleAcknowledge(selectedPolicy.id)}
                    disabled={isAcknowledging}
                    className="flex-1 py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
                  >
                    {isAcknowledging ? 'Acknowledging...' : (
                      <>
                        <CheckSquare size={18} /> I Agree & Acknowledge
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </CenterModal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeCompliance;
