import React, { useState, useEffect } from 'react';
import { useSuperAdmin } from '../../context/SuperAdminContext';
import { usePermissionContext } from '../../context/PermissionContext';
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  Search,
  X,
  Key,
  ShieldAlert,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PERMISSION_OPTIONS = [
  // Super Admin / Platform
  { id: 'manage_users', label: 'Manage Users', desc: 'Create, update, and revoke user credentials', category: 'Platform' },
  { id: 'manage_roles', label: 'Manage Security Roles', desc: 'Establish and modify role clearance groups', category: 'Platform' },
  { id: 'manage_departments', label: 'Manage Departments', desc: 'Reorganize company departments and metadata', category: 'Platform' },
  { id: 'view_audit_logs', label: 'View Platform Audit Logs', desc: 'Investigate operational changes and log traces', category: 'Platform' },
  
  // Admin Module
  { id: 'admin_org_setup', label: 'Org Setup', desc: 'Configure core organization settings', category: 'Admin' },
  { id: 'admin_payroll_center', label: 'Payroll Center', desc: 'Manage payroll cycles and config', category: 'Admin' },
  { id: 'admin_holidays', label: 'Holidays', desc: 'Manage holiday calendar', category: 'Admin' },
  { id: 'admin_benefits', label: 'Benefits Config', desc: 'Configure company benefits', category: 'Admin' },
  { id: 'admin_ai', label: 'AI Center', desc: 'Manage AI integrations and configurations', category: 'Admin' },
  { id: 'admin_compliance', label: 'Compliance', desc: 'Monitor regulatory compliance', category: 'Admin' },
  { id: 'admin_integrations', label: 'Integrations', desc: 'Manage third-party integrations', category: 'Admin' },
  { id: 'admin_billing', label: 'Billing', desc: 'Manage subscription and billing', category: 'Admin' },
  { id: 'admin_reports', label: 'Reports', desc: 'View global platform reports', category: 'Admin' },
  { id: 'admin_settings', label: 'Settings', desc: 'Configure platform settings', category: 'Admin' },

  // HR Module
  { id: 'hr_candidates', label: 'Manage Candidates', desc: 'View and process candidate applications', category: 'HR' },
  { id: 'hr_interviews', label: 'Schedule Interviews', desc: 'Manage interview pipelines', category: 'HR' },
  { id: 'hr_onboarding', label: 'Manage Onboarding', desc: 'Run onboarding checklists for new hires', category: 'HR' },
  { id: 'hr_offboarding', label: 'Offboarding', desc: 'Manage offboarding and resignations', category: 'HR' },
  { id: 'hr_payroll', label: 'Payroll Operations', desc: 'Process HR payroll operations', category: 'HR' },
  { id: 'hr_approvals', label: 'Approvals', desc: 'Manage HR approvals', category: 'HR' },

  // Manager Module
  { id: 'mgr_attendance', label: 'Attendance Review', desc: 'Review team attendance logs', category: 'Manager' },
  { id: 'mgr_leave', label: 'Leave Approval', desc: 'Approve or reject team leave requests', category: 'Manager' },
  { id: 'mgr_tasks', label: 'Task Management', desc: 'Assign and evaluate tasks', category: 'Manager' },
  { id: 'mgr_team_resignations', label: 'Team Resignations', desc: 'Handle team member resignations', category: 'Manager' },
  { id: 'mgr_reimbursements', label: 'Reimbursements', desc: 'Review team reimbursements', category: 'Manager' },

  // Employee Module
  { id: 'emp_payroll', label: 'View Payroll', desc: 'Access payslips and salary info', category: 'Employee' },
  { id: 'emp_attendance', label: 'Log Attendance', desc: 'Clock in and clock out', category: 'Employee' },
  { id: 'emp_documents', label: 'View Documents', desc: 'Access employee documents', category: 'Employee' },
  { id: 'emp_compliance', label: 'Compliance', desc: 'View compliance policies', category: 'Employee' },
  { id: 'emp_resignation', label: 'Resignation', desc: 'Submit and view resignation status', category: 'Employee' },

  // Candidate Module
  { id: 'cand_dashboard', label: 'Dashboard', desc: 'Access candidate dashboard', category: 'Candidate' },
  { id: 'cand_browse_jobs', label: 'Browse Jobs', desc: 'Search for open roles', category: 'Candidate' },
  { id: 'cand_applications', label: 'My Applications', desc: 'Track application status', category: 'Candidate' },
  { id: 'cand_resume', label: 'Resume Builder', desc: 'Build and manage resumes', category: 'Candidate' },
  { id: 'cand_ai_score', label: 'AI Resume Score', desc: 'View AI-driven resume scoring', category: 'Candidate' },
  { id: 'cand_interviews', label: 'Interview Schedule', desc: 'View scheduled interviews', category: 'Candidate' },
  { id: 'cand_notifications', label: 'Notifications', desc: 'View candidate notifications', category: 'Candidate' },
  { id: 'cand_offers', label: 'Offers', desc: 'View and accept job offers', category: 'Candidate' },
];

const RoleManagement = () => {
  const { roles, addRole, updateRole, deleteRole } = useSuperAdmin();
  const { refreshPermissions } = usePermissionContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  // Block background interaction and prevent page scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = '';
      document.body.classList.remove('modal-open');
    };
  }, [isModalOpen]);

  const PERM_TO_MODULE_ACTION = {
    manage_users: { module: 'users', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    manage_roles: { module: 'roles_permissions', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    manage_departments: { module: 'departments', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    view_audit_logs: { module: 'audit_logs', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    
    // Admin Module
    admin_org_setup: { module: 'org_setup', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_payroll_center: { module: 'payroll_center', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_holidays: { module: 'holidays', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_benefits: { module: 'benefits_config', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_ai: { module: 'ai_center', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_compliance: { module: 'compliance', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_integrations: { module: 'integrations', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_billing: { module: 'billing', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_reports: { module: 'reports', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    admin_settings: { module: 'settings', actions: ['view', 'create', 'edit', 'delete', 'manage'] },
    
    hr_candidates: { module: 'candidates', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    hr_interviews: { module: 'interviews', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    hr_onboarding: { module: 'onboarding', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    hr_offboarding: { module: 'offboarding_resignations', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    hr_payroll: { module: 'payroll_operations', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    hr_approvals: { module: 'approvals', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },

    mgr_attendance: { module: 'attendance_review', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    mgr_leave: { module: 'leave_approval', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    mgr_tasks: { module: 'tasks', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    mgr_team_resignations: { module: 'team_resignations', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },
    mgr_reimbursements: { module: 'reimbursements', actions: ['view', 'create', 'edit', 'delete', 'approve', 'manage'] },

    emp_payroll: { module: 'payroll', actions: ['view'] },
    emp_attendance: { module: 'attendance', actions: ['view', 'create'] },
    emp_documents: { module: 'documents', actions: ['view', 'create', 'edit', 'delete'] },
    emp_compliance: { module: 'compliance', actions: ['view'] },
    emp_resignation: { module: 'resignation', actions: ['view', 'create'] },

    cand_dashboard: { module: 'dashboard', actions: ['view'] },
    cand_browse_jobs: { module: 'browse_jobs', actions: ['view', 'create', 'edit'] },
    cand_applications: { module: 'my_applications', actions: ['view', 'create', 'edit', 'delete'] },
    cand_resume: { module: 'resume_builder', actions: ['view', 'create', 'edit', 'delete'] },
    cand_ai_score: { module: 'ai_score', actions: ['view'] },
    cand_interviews: { module: 'interview_schedule', actions: ['view'] },
    cand_notifications: { module: 'notifications', actions: ['view'] },
    cand_offers: { module: 'offers', actions: ['view'] },
  };

  const getFlatPermissionsFromObject = (permissionsObj) => {
    if (!permissionsObj || typeof permissionsObj !== 'object') return [];
    const flat = [];
    Object.entries(PERM_TO_MODULE_ACTION).forEach(([permId, target]) => {
      const activeActions = permissionsObj[target.module] || [];
      const hasAll = target.actions.every(act => activeActions.includes(act));
      if (hasAll) {
        flat.push(permId);
      }
    });
    return flat;
  };

  const getRolePermissions = (role) => {
    if (role.permissions) {
      if (typeof role.permissions === 'object' && !Array.isArray(role.permissions)) {
        return getFlatPermissionsFromObject(role.permissions);
      }
      return role.permissions;
    }
    return [];
  };

  const openAddModal = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setSelectedPermissions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (role) => {
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description);
    setSelectedPermissions(getRolePermissions(role));
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name) return;

    // Convert selected flat permissions back to module-action object
    const permissionsObj = {};
    selectedPermissions.forEach(permId => {
      const target = PERM_TO_MODULE_ACTION[permId];
      if (target) {
        permissionsObj[target.module] = target.actions;
      }
    });

    const payload = {
      name,
      description: description || '',
      permissions: permissionsObj,
      permissionsCount: Object.keys(permissionsObj).length
    };

    if (editingRole) {
      updateRole(editingRole.id, payload).then(refreshPermissions);
    } else {
      addRole({
        id: Date.now().toString(),
        ...payload
      }).then(refreshPermissions);
    }
    setIsModalOpen(false);
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="hcm-page-title">
            <Shield className="text-emerald-600" size={32} />
            Roles & Permissions
          </h1>
          <p className="hcm-page-subtitle">
            Define enterprise access permissions, security profiles, and system access levels.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary flex items-center justify-center gap-2 self-start md:self-auto"
        >
          <Plus size={18} />
          <span>Add Custom Role</span>
        </button>
      </div>

      {/* Control Bar */}
      <div className="card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search roles by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="text-xs font-bold text-slate-400 font-bold bg-slate-50 dark:bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
          Total Roles: {roles.length} Profiles
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {filteredRoles.length > 0 ? (
            filteredRoles.map((role) => {
              const activePerms = getRolePermissions(role);
              return (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 12 }}
                  className="card flex flex-col justify-between group relative text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                        <Key size={22} />
                      </div>
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 font-bold">
                        {activePerms.length} PERMISSIONS
                      </span>
                    </div>

                    <h3 className="hcm-section-heading mb-1 leading-snug">{role.name}</h3>
                    <p className="hcm-body-text mb-4">
                      {role.description || "No description provided."}
                    </p>

                    {/* Permissions list chips */}
                    <div className="flex flex-wrap gap-1.5 mb-6">
                      {activePerms.map(pId => {
                        const opt = PERMISSION_OPTIONS.find(o => o.id === pId);
                        if (!opt) return null;
                        return (
                          <span key={pId} className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                            {opt.label}
                          </span>
                        );
                      })}
                      {activePerms.length === 0 && (
                        <span className="text-[11px] text-slate-400 italic">No granular permissions assigned.</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
                      title="Edit Role"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
                      title="Delete Role"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 font-medium text-sm">
              No security profiles match your query.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Role Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="hcm-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="hcm-modal flex flex-col"
            >
              <div className="p-6 border-b border-slate-50 dark:border-slate-800/80 flex items-center justify-between">
                <h3 className="hcm-section-heading flex items-center gap-2.5">
                  <ShieldAlert className="text-emerald-600" size={22} />
                  {editingRole ? 'Edit Security Role' : 'Create Custom Role'}
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
                  <label className="form-label">Role Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Talent Acquisition"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="form-label">Granular System Permissions</label>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2 border border-slate-100 dark:border-slate-800 p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                    {Array.from(new Set(PERMISSION_OPTIONS.map(p => p.category))).map(category => (
                      <div key={category} className="space-y-2.5">
                        <h4 className="text-[10px] font-bold text-emerald-600 border-b border-slate-200 dark:border-slate-800 pb-1">{category} Modules</h4>
                        {PERMISSION_OPTIONS.filter(p => p.category === category).map((perm) => {
                          const isChecked = selectedPermissions.includes(perm.id);
                          return (
                            <label key={perm.id} className="flex items-start gap-3 cursor-pointer group text-left">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedPermissions(prev =>
                                    isChecked ? prev.filter(p => p !== perm.id) : [...prev, perm.id]
                                  );
                                }}
                                className="mt-1 h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 transition-colors"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                  {perm.label}
                                </p>
                                <p className="text-[10px] text-slate-400 leading-normal">
                                  {perm.desc}
                                </p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="modal-actions flex items-center gap-3">
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
                    {editingRole ? 'Save Changes' : 'Create Role'}
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

export default RoleManagement;
