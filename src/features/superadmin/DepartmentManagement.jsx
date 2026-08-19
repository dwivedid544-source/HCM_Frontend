import React, { useState } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  X, 
  User, 
  Users,
  Grid
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatsCounter from '../../components/StatsCounter';

const DepartmentManagement = () => {
  const { departments, addDept, updateDept, deleteDept, organizations, users } = useSuperAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  
  // Form State
  const [name, setName] = useState('');
  const [head, setHead] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setHead('');
    setSelectedOrgId(organizations[0]?.id || '');
    setIsModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setName(dept.name);
    setHead(dept.head);
    setSelectedOrgId(dept.organizationId || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !selectedOrgId) return;

    let success = false;
    if (editingDept) {
      success = await updateDept(editingDept.id, {
        name,
        head,
        organizationId: selectedOrgId
      });
    } else {
      success = await addDept({
        name,
        head,
        organizationId: selectedOrgId
      });
    }
    if (success) {
      setIsModalOpen(false);
    }
  };

  const filteredDepts = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (dept.organizationName && dept.organizationName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">
            <Building2 className="text-amber-600" size={32} />
            Department Management
          </h1>
          <p className="hcm-page-subtitle">
            Configure company divisions, department heads, and monitor personnel counts.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus size={18} />
          <span>Create Department</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search departments by name or head..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
          Departments: {departments.length} Divisions
        </div>
      </div>

      {/* Departments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredDepts.length > 0 ? (
            filteredDepts.map((dept) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="card flex flex-col justify-between group relative"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
                      <Building2 size={22} />
                    </div>
                    <StatsCounter target={dept.count || 0} label="Staff" suffix="" />
                  </div>

                  <h3 className="hcm-section-heading mb-1 leading-snug">{dept.name}</h3>
                  <div className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-slate-400 mt-2">
                    <User size={14} className="text-slate-400" />
                    <span>Dept. Head: </span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{dept.head}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 dark:text-slate-500 mb-6 mt-1">
                    <Building2 size={12} className="text-slate-400" />
                    <span>Organization: </span>
                    <span className="text-slate-500 dark:text-slate-400 font-bold">{dept.organizationName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                  <button
                    onClick={() => openEditModal(dept)}
                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 rounded-xl transition-all"
                    title="Edit Department"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteDept(dept.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all"
                    title="Delete Department"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 font-medium text-sm">
              No divisions match your search query.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Department Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="hcm-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="hcm-modal"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800/80 flex items-center justify-between">
                <h3 className="hcm-section-heading flex items-center gap-2.5">
                  <Grid className="text-amber-600" size={22} />
                  {editingDept ? 'Edit Division' : 'Create Department'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="form-label">Organization</label>
                  <select
                    value={selectedOrgId}
                    onChange={(e) => {
                      setSelectedOrgId(e.target.value);
                      setHead(''); // Reset head manager choice when switching organizations
                    }}
                    className="input-field font-bold"
                    required
                  >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                      <option key={org.id} value={org.id}>{org.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">Department Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Operations"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Department Head</label>
                  <select
                    value={head}
                    onChange={(e) => setHead(e.target.value)}
                    className="input-field font-semibold"
                    required
                  >
                    <option value="">Select Department Head</option>
                    {users
                      .filter(u => {
                        const targetOrgName = organizations.find(o => o.id === selectedOrgId)?.name;
                        return !selectedOrgId || u.organization?.name === targetOrgName;
                      })
                      .map(u => (
                        <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                      ))
                    }
                  </select>
                </div>

                <div className="pt-4 flex items-center gap-3 border-t border-slate-50 dark:border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex-1"
                  >
                    {editingDept ? 'Save Changes' : 'Create Dept.'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DepartmentManagement;
