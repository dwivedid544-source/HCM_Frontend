import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Clock, Plus, Edit3, Trash2, Search, CheckCircle2, XCircle
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import { cn } from '../../utils/cn';

const ShiftModal = ({ isOpen, onClose, shiftToEdit }) => {
  const { createShift, updateShift } = useAdmin();
  const [formData, setFormData] = useState({
    name: shiftToEdit?.name || '',
    startTime: shiftToEdit?.startTime || '09:00',
    endTime: shiftToEdit?.endTime || '18:00',
    breakDurationMin: shiftToEdit?.breakDurationMin || 60,
    workingHoursMin: shiftToEdit?.workingHoursMin || 480,
    graceInMin: shiftToEdit?.graceInMin || 15,
    graceOutMin: shiftToEdit?.graceOutMin || 15,
    isDefault: shiftToEdit?.isDefault || false
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (shiftToEdit) {
      updateShift(shiftToEdit.id, formData);
    } else {
      createShift(formData);
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
            {shiftToEdit ? 'Edit Shift' : 'Add New Shift'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <XCircle size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Shift Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g., General Shift, Night Shift"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Break (Minutes)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.breakDurationMin}
                onChange={(e) => setFormData({ ...formData, breakDurationMin: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Working (Minutes)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.workingHoursMin}
                onChange={(e) => setFormData({ ...formData, workingHoursMin: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grace In (Minutes)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.graceInMin}
                onChange={(e) => setFormData({ ...formData, graceInMin: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Grace Out (Minutes)</label>
              <input
                type="number"
                required
                min="0"
                value={formData.graceOutMin}
                onChange={(e) => setFormData({ ...formData, graceOutMin: parseInt(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500 bg-white"
            />
            <label htmlFor="isDefault" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
              Set as Default Shift
            </label>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-xl font-bold transition-colors">
              {shiftToEdit ? 'Update Shift' : 'Create Shift'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ShiftRow = ({ shift, onEdit, onDelete }) => {
  return (
    <tr className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/30 transition-colors">
      <td className="px-4 sm:px-8 py-4 sm:py-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0">
            <Clock size={20} />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white tracking-tight text-sm flex items-center gap-2">
              {shift.name}
              {shift.isDefault && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">Default</span>
              )}
            </p>
            <p className="text-xs text-slate-500 font-medium">{shift.workingHoursMin / 60}h Working • {shift.breakDurationMin}m Break</p>
          </div>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-center whitespace-nowrap">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{shift.startTime}</span>
          <span className="text-slate-400 text-[10px]">TO</span>
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">{shift.endTime}</span>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-center hidden md:table-cell">
        <div className="flex flex-col items-center justify-center gap-1">
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">In: {shift.graceInMin}m</span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Out: {shift.graceOutMin}m</span>
        </div>
      </td>
      <td className="px-4 sm:px-8 py-4 sm:py-5 text-right">
        <ActionDropdown 
          actions={[
            { label: 'Edit Shift', icon: Edit3, onClick: () => onEdit(shift) },
            { label: 'Delete', icon: Trash2, danger: true, onClick: () => onDelete(shift) },
          ]}
        />
      </td>
    </tr>
  );
};

const ShiftManagement = () => {
  const { shifts, deleteShift } = useAdmin();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shiftToEdit, setShiftToEdit] = useState(null);
  const [shiftToDelete, setShiftToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredShifts = shifts.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Shift Management</h1>
          <p className="text-slate-500 font-medium tracking-tight">Configure working hours, breaks, and grace periods for different employee shifts</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setShiftToEdit(null); setIsModalOpen(true); }}
            className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
            <Plus size={18} />
            <span>Add Shift</span>
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
            placeholder="Search shifts by name..."
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
                <th className="px-4 sm:px-8 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Shift Details</th>
                <th className="px-4 sm:px-8 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center">Timings</th>
                <th className="px-4 sm:px-8 py-4 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center hidden md:table-cell">Grace Periods</th>
                <th className="px-4 sm:px-8 py-4 text-right text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800 text-sm">
              {filteredShifts.length > 0 ? (
                filteredShifts.map(shift => (
                  <ShiftRow
                    key={shift.id}
                    shift={shift}
                    onEdit={(s) => { setShiftToEdit(s); setIsModalOpen(true); }}
                    onDelete={setShiftToDelete}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-4 py-20 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-200 dark:text-slate-700">
                        <Clock size={32} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">No shifts configured</p>
                        <p className="text-sm font-medium text-slate-400">Click "Add Shift" to create your first shift schedule.</p>
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
        <ShiftModal
          isOpen={isModalOpen}
          onClose={() => { setIsModalOpen(false); setShiftToEdit(null); }}
          shiftToEdit={shiftToEdit}
        />
      )}

      <ConfirmDialog
        isOpen={!!shiftToDelete}
        onClose={() => setShiftToDelete(null)}
        onConfirm={() => {
          deleteShift(shiftToDelete.id);
          setShiftToDelete(null);
        }}
        title="Delete Shift"
        message={`Are you sure you want to delete ${shiftToDelete?.name}? Employees assigned to this shift may be affected.`}
      />
    </div>
  );
};

export default ShiftManagement;
