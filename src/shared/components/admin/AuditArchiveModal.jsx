import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, X, Download, Loader2, FileText, FileBadge } from 'lucide-react';
import { useDateFormat } from '../../../hooks/useDateFormat';
import { useAdmin } from '../../../context/AdminContext';

const AuditArchiveModal = ({ isOpen, onClose }) => {
  const { formatDate } = useDateFormat();
  const { policies, showToast } = useAdmin();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    dateRange: 'This Year',
    policyType: 'All',
    format: 'CSV',
    includeAttachments: false
  });

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a backend job delay
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      const filteredPolicies = formData.policyType === 'All'
        ? policies
        : policies.filter(p => p.category === formData.policyType);

      if (!filteredPolicies.length) {
        showToast('No policies found for the selected criteria', 'error');
        setLoading(false);
        return;
      }

      if (formData.format === 'CSV') {
        // Generate CSV
        const headers = ['Policy Name', 'Category', 'Owner', 'Effective Date', 'Status', 'Acknowledgments', 'Date Range'];
        const rows = filteredPolicies.map(p => [
          `"${p.name}"`, `"${p.category}"`, `"${p.owner}"`,
          `"${p.effectiveDate || p.date || 'TBD'}"`, `"${p.status}"`,
          `"${p.acknowledgments || '0'}"`, `"${formData.dateRange}"`
        ]);
        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit_archive_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast('Audit Archive downloaded as CSV', 'success');
      } else {
        // Generate printable PDF
        const printContent = `
          <html><head><title>Audit Archive – ${formData.dateRange}</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding: 40px; color: #1e293b; }
            h1 { font-size: 24px; margin-bottom: 4px; }
            .subtitle { color: #64748b; font-size: 13px; margin-bottom: 28px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; }
            th, td { border: 1px solid #e2e8f0; padding: 10px 14px; text-align: left; }
            th { background: #f1f5f9; font-weight: 700; text-transform: uppercase; font-size: 10px; letter-spacing: 0.08em; }
            .badge { display: inline-block; padding: 3px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }
            .active { background: #ecfdf5; color: #059669; }
            .expiring { background: #fffbeb; color: #d97706; }
            .archived { background: #f1f5f9; color: #64748b; }
            .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
          </style></head><body>
          <h1>Compliance Audit Archive</h1>
          <p class="subtitle">Date Range: ${formData.dateRange} • Generated: ${formatDate(new Date())} • Policies: ${filteredPolicies.length}</p>
          <table>
            <thead><tr><th>Policy Name</th><th>Category</th><th>Owner</th><th>Effective Date</th><th>Status</th><th>Acknowledgments</th></tr></thead>
            <tbody>${filteredPolicies.map(p => {
              const statusClass = p.status === 'Active' ? 'active' : (p.status === 'Renewing' || p.status === 'Expiring Soon') ? 'expiring' : 'archived';
              return `<tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
                <td>${p.owner}</td>
                <td>${p.effectiveDate || p.date || 'TBD'}</td>
                <td><span class="badge ${statusClass}">${p.status}</span></td>
                <td>${p.acknowledgments || '—'}</td>
              </tr>`;
            }).join('')}</tbody>
          </table>
          <div class="footer">
            This report was generated automatically by HCM Compliance Center. 
            ${formData.includeAttachments ? 'Note: Signed PDF attachments were included in the archive.' : ''}
          </div>
          </body></html>`;
        const w = window.open('', '_blank');
        if (w) {
          w.document.write(printContent);
          w.document.close();
          w.print();
        }
        showToast('Audit Archive PDF opened for download', 'success');
      }

      onClose();
    } catch (err) {
      showToast('Failed to generate audit archive', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-lg bg-white rounded-3xl shadow-2xl z-[120] overflow-hidden"
          >
            <div className="p-6 sm:p-8 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-primary-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary-200">
                  <History size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">Audit Archive</h2>
                  <p className="text-xs font-medium text-slate-500">Generate compliance activity reports</p>
                </div>
              </div>
              <button type="button" onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-50 rounded-xl transition-all">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="p-6 sm:p-8 space-y-6 flex flex-col">
              <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600">Date Range</label>
                    <select value={formData.dateRange} onChange={e => setFormData({...formData, dateRange: e.target.value})} className="input-field h-12 w-full bg-slate-50 text-sm font-bold text-slate-700 border-none">
                        <option>This Month</option>
                        <option>Last Quarter</option>
                        <option>This Year</option>
                        <option>All Time</option>
                    </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Policy Type</label>
                        <select value={formData.policyType} onChange={e => setFormData({...formData, policyType: e.target.value})} className="input-field h-12 w-full bg-slate-50 text-sm font-bold border-none">
                            <option value="All">All Types</option>
                            <option value="HR">HR</option>
                            <option value="Legal">Legal</option>
                            <option value="Security">Security</option>
                            <option value="Compliance">Compliance</option>
                            <option value="Ethics">Ethics</option>
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-600">Export Format</label>
                        <select value={formData.format} onChange={e => setFormData({...formData, format: e.target.value})} className="input-field h-12 w-full bg-slate-50 text-sm font-bold border-none">
                            <option value="CSV">CSV Document</option>
                            <option value="PDF">PDF Document</option>
                        </select>
                    </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                   <input type="checkbox" id="attachments" checked={formData.includeAttachments} onChange={e => setFormData({...formData, includeAttachments: e.target.checked})} className="w-5 h-5 rounded cursor-pointer accent-primary-600" />
                   <label htmlFor="attachments" className="text-sm font-bold text-slate-600 cursor-pointer">Include signed PDF attachments</label>
                </div>
              </div>

              <div className="flex gap-4 pt-4 sm:pt-6 mt-auto">
                <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-50 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all">Cancel</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg flex justify-center items-center gap-2 disabled:opacity-60 transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Download size={16} /> Generate Archive
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuditArchiveModal;
