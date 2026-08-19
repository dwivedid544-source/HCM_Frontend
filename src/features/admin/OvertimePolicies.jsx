import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Plus, Edit3, Trash2, Search, XCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';

const OvertimePolicyModal = ({ isOpen, onClose, policyToEdit }) => {
  const { createOvertimePolicy, updateOvertimePolicy } = useAdmin();
  const [formData, setFormData] = useState({
    name: policyToEdit?.name || '',
    minMinutesForOT: policyToEdit?.minMinutesForOT || 0,
    rateMultiplier: policyToEdit?.rateMultiplier || 1.5,
    isDefault: policyToEdit?.isDefault || false
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (policyToEdit) {
      updateOvertimePolicy(policyToEdit.id, formData);
    } else {
      createOvertimePolicy(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {policyToEdit ? 'Edit Overtime Policy' : 'Add Overtime Policy'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Policy Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., Standard 1.5x OT"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Min Minutes for OT</label>
              <input
                type="number"
                required
                min="0"
                value={formData.minMinutesForOT}
                onChange={(e) => setFormData({ ...formData, minMinutesForOT: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g., 30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rate Multiplier</label>
              <input
                type="number"
                required
                step="0.1"
                min="1.0"
                value={formData.rateMultiplier}
                onChange={(e) => setFormData({ ...formData, rateMultiplier: parseFloat(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g., 1.5"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <input
              type="checkbox"
              id="isDefaultOT"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 bg-white"
            />
            <label htmlFor="isDefaultOT" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Set as Default Overtime Policy
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
              {policyToEdit ? 'Update Policy' : 'Create Policy'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const OvertimePolicyRow = ({ policy, onEdit, onDelete }) => {
  return (
    <tr className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
      <td className="px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white tracking-tight text-sm flex items-center gap-2">
              {policy.name}
              {policy.isDefault && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Default</span>
              )}
            </p>
            <p className="text-xs text-slate-500 font-medium">After {policy.minMinutesForOT} minutes of extra work</p>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-center">
        <span className="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-bold text-sm border border-emerald-100 dark:border-emerald-800">
          {policy.rateMultiplier}x Rate
        </span>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-right">
        <ActionDropdown 
          actions={[
            { label: 'Edit Policy', icon: Edit3, onClick: () => onEdit(policy) },
            { label: 'Delete', icon: Trash2, danger: true, onClick: () => onDelete(policy) },
          ]}
        />
      </td>
    </tr>
  );
};

const OvertimePolicies = () => {
  const { overtimePolicies, deleteOvertimePolicy } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [policyToEdit, setPolicyToEdit] = useState(null);
  const [policyToDelete, setPolicyToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPolicies = overtimePolicies.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Overtime Rules</h1>
          <p className="text-slate-500 font-medium tracking-tight">Configure overtime calculation policies and multipliers</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setPolicyToEdit(null); setIsModalOpen(true); }}
            className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={18} />
            <span>Add Policy</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative flex-1 w-full text-slate-400 max-w-md">
          <Search className="absolute left-3 top-3" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search policies by name..."
            className="input-field pl-10 h-11 bg-white dark:bg-slate-900 border-transparent shadow-sm w-full"
          />
        </div>
      </div>

      {/* Table Card */}
      <div className="card p-0 border-none bg-white dark:bg-slate-900 shadow-soft overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-4 sm:px-8 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Policy Details</th>
                <th className="px-4 sm:px-8 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center">Multiplier</th>
                <th className="px-4 sm:px-8 py-4 text-right text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map(policy => (
                  <OvertimePolicyRow
                    key={policy.id}
                    policy={policy}
                    onEdit={(p) => { setPolicyToEdit(p); setIsModalOpen(true); }}
                    onDelete={setPolicyToDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700">
                        <Clock size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">No overtime policies configured</p>
                        <p className="text-sm font-medium text-slate-400">Click "Add Policy" to create your first overtime rule.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <OvertimePolicyModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setPolicyToEdit(null); }}
          policyToEdit={policyToEdit}
        />
      )}

      <ConfirmDialog
        isOpen={!!policyToDelete}
        onClose={() => setPolicyToDelete(null)}
        onConfirm={() => {
          deleteOvertimePolicy(policyToDelete.id);
          setPolicyToDelete(null);
        }}
        title="Delete Overtime Policy"
        message={`Are you sure you want to delete ${policyToDelete?.name}?`}
      />
    </div>
  );
};

export default OvertimePolicies;
