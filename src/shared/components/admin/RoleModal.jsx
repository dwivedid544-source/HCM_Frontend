import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  MoreVertical, 
  ChevronRight, 
  Search,
  Layout,
  Users,
  Settings,
  ChevronDown,
  Info,
  Layers,
  Copy,
  LayoutDashboard,
  Building2,
  CreditCard,
  CalendarDays,
  Bot,
  Scale,
  Plug,
  Receipt,
  FileSearch,
  BarChart2,
  Briefcase,
  GitMerge,
  UserCheck,
  MessageSquare,
  Clock,
  CheckSquare,
  Target,
  ClipboardList,
  Star,
  User,
  Gift,
  BookOpen,
  Bell,
  Calendar,
  FileText,
  Activity
} from 'lucide-react';
import { useAdmin } from '../../../context/AdminContext';
import { cn } from '../../../utils/cn';

import { ROLE_MODULES, MODULE_ACTIONS, resolveDependencies } from '../../../utils/permissionsConfig';

const getModulesForRole = (roleName) => {
   const normalized = (roleName || '').toUpperCase();
   return ROLE_MODULES[normalized] || ROLE_MODULES.EMPLOYEE;
};

const RoleModal = ({ isOpen, onClose, roleToEdit = null }) => {
  const { roles, addRole, updateRole, users, showToast } = useAdmin();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    inheritsFrom: 'EMPLOYEE',
    landingPage: '',
    permissions: {},
    assignedUsers: []
  });

  const modules = getModulesForRole(formData.inheritsFrom);

  useEffect(() => {
    if (roleToEdit) {
      setFormData({
        ...roleToEdit,
        inheritsFrom: roleToEdit.inheritsFrom || 'EMPLOYEE',
        landingPage: roleToEdit.landingPage || '',
        assignedUsers: users.filter(u => u.customRoleId === roleToEdit.id).map(u => u.id)
      });
    } else {
      setFormData({
        name: '',
        description: '',
        inheritsFrom: 'EMPLOYEE',
        landingPage: '',
        permissions: {},
        assignedUsers: []
      });
      setStep(1);
    }
  }, [roleToEdit, isOpen, users]);

  // Block background interaction and prevent page scroll when modal is open
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const togglePermission = (module, action) => {
    setFormData(prev => {
      let current = prev.permissions[module] || [];
      if (current.includes(action)) {
        current = current.filter(a => a !== action);
        // If view is removed, remove all other dependencies
        if (action === 'view') {
           current = [];
        }
      } else {
        current = [...current, action];
        current = resolveDependencies(current);
      }
      
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: current
        }
      };
    });
  };

  const handleCloneChange = (roleName) => {
     const roleToClone = roles.find(r => r.name === roleName);
     if (roleToClone) {
        setFormData(prev => ({
           ...prev,
           cloneFrom: roleName,
           permissions: { ...roleToClone.permissions }
        }));
        showToast(`Initial permissions cloned from ${roleName}`, 'info');
     }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (step < 3) {
      setStep(step + 1);
      return;
    }

    if (!formData.name.trim()) {
      showToast('Role name is required', 'error');
      setStep(1);
      return;
    }

    if (roleToEdit) {
      updateRole(roleToEdit.id, formData);
    } else {
      addRole(formData);
    }
    onClose();
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6"
            style={{ pointerEvents: 'none' }}
          >
            {/* The clickable backdrop */}
            <div 
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={onClose} 
              style={{ pointerEvents: 'auto' }}
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              style={{ pointerEvents: 'auto' }}
              className="relative w-full max-w-4xl h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
            >
            {/* Header */}
            <div className="py-4 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-lg transform -rotate-3">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">
                    {roleToEdit ? 'Configure Role' : 'Create Custom Role'}
                  </h2>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 relative min-h-0 bg-white">
                <div className="absolute inset-0 overflow-y-auto p-6">
                    {step === 1 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Role Name</label>
                                    <input 
                                        type="text" 
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="e.g. Senior Recruiter" 
                                        className="input-field h-11 bg-slate-50 border-transparent font-bold text-slate-700" 
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Description (Optional)</label>
                                <input 
                                    type="text" 
                                    value={formData.description}
                                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                    placeholder="e.g. Can view payroll but not edit" 
                                    className="input-field h-11 bg-slate-50 border-transparent font-bold text-slate-700" 
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Inherits From (Base Role)</label>
                                <select 
                                    value={formData.inheritsFrom}
                                    onChange={(e) => setFormData(prev => ({ ...prev, inheritsFrom: e.target.value, permissions: {} }))}
                                    className="input-field h-11 bg-slate-50 border-transparent font-bold text-slate-700"
                                >
                                    <option value="ADMIN">Admin</option>
                                    <option value="HR">HR</option>
                                    <option value="MANAGER">Manager</option>
                                    <option value="EMPLOYEE">Employee</option>
                                    <option value="CANDIDATE">Candidate</option>
                                </select>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Landing Page (Optional)</label>
                                <input 
                                    type="text" 
                                    value={formData.landingPage}
                                    onChange={(e) => setFormData(prev => ({ ...prev, landingPage: e.target.value }))}
                                    placeholder="e.g. /hr/payroll" 
                                    className="input-field h-11 bg-slate-50 border-transparent font-bold text-slate-700" 
                                />
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                            <div className="bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden overflow-x-auto w-full">
                                <div className="min-w-[800px]">
                                    <div className="grid grid-cols-12 bg-slate-900 py-3 px-6 text-white text-[10px] font-bold text-center">
                                        <div className="col-span-3 text-left">Module</div>
                                        <div className="col-span-1">View</div>
                                        <div className="col-span-1">Create</div>
                                        <div className="col-span-1">Edit</div>
                                        <div className="col-span-1">Delete</div>
                                        <div className="col-span-2">Approve</div>
                                        <div className="col-span-2">Manage</div>
                                    </div>
                                    <div className="divide-y divide-slate-100">
                                        {modules.map((mod) => {
                                            const availActions = MODULE_ACTIONS[mod.id] || ['view'];
                                            const activePerms = formData.permissions[mod.id] || [];
                                            return (
                                                <div key={mod.id} className="grid grid-cols-12 py-3 px-6 hover:bg-white transition-colors group">
                                                    <div className="col-span-3 flex items-center gap-4">
                                                        <span className="text-sm font-bold text-slate-700 truncate">{mod.label}</span>
                                                    </div>
                                                    {['view', 'create', 'edit', 'delete', 'approve', 'manage'].map((action, idx) => {
                                                        const isAvail = availActions.includes(action);
                                                        const isChecked = activePerms.includes(action);
                                                        const colSpan = action === 'approve' || action === 'manage' ? 'col-span-2' : 'col-span-1';
                                                        return (
                                                            <div key={action} className={`${colSpan} flex items-center justify-center`}>
                                                                {isAvail ? (
                                                                    <label className={cn(
                                                                        "w-6 h-6 rounded-lg cursor-pointer flex items-center justify-center transition-all",
                                                                        isChecked ? "bg-primary-600 border-2 border-primary-600 text-white shadow-sm" : "bg-slate-50 border-2 border-slate-400 text-slate-500 hover:border-primary-400 hover:bg-slate-100"
                                                                    )}>
                                                                        <input 
                                                                            type="checkbox" 
                                                                            className="sr-only"
                                                                            checked={isChecked}
                                                                            onChange={() => togglePermission(mod.id, action)}
                                                                        />
                                                                        {isChecked && <ShieldCheck size={12} fill="currentColor" />}
                                                                    </label>
                                                                ) : <span className="text-slate-200">-</span>}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                             <div className="card p-5 border border-slate-100 bg-slate-50 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 leading-none dark:text-white">Assign Users Directly</h3>
                                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Select users who should immediately inherit this role</p>
                                    </div>
                                    <div className="relative w-64 group">
                                        <Search className="absolute left-3 top-2.5 text-slate-300 group-focus-within:text-primary-400 transition-colors" size={16} />
                                        <input type="text" placeholder="Search users..." className="input-field h-10 pl-10 text-xs bg-white border-slate-200" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {users.filter(u => u.role !== 'Admin').map(user => (
                                        <div 
                                            key={user.id} 
                                            onClick={() => {
                                                const current = formData.assignedUsers;
                                                const updated = current.includes(user.id)
                                                    ? current.filter(u => u !== user.id)
                                                    : [...current, user.id];
                                                setFormData(prev => ({ ...prev, assignedUsers: updated }));
                                            }}
                                            className={cn(
                                                "p-3 rounded-xl border transition-all cursor-pointer flex items-center gap-4",
                                                formData.assignedUsers.includes(user.id)
                                                    ? "bg-primary-50 border-primary-200 ring-1 ring-primary-200"
                                                    : "bg-white border-slate-100 hover:border-slate-200"
                                            )}
                                        >
                                            <img src={user.img} className="w-8 h-8 rounded-lg" alt="" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.05em]">{user.department}</p>
                                            </div>
                                            <div className={cn(
                                                "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                                formData.assignedUsers.includes(user.id)
                                                    ? "bg-primary-600 border-primary-600 text-white"
                                                    : "bg-slate-50 border-slate-200"
                                            )}>
                                                {formData.assignedUsers.includes(user.id) && <ShieldCheck size={10} />}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                             </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="shrink-0 py-4 px-6 border-t border-slate-100 bg-white/95 backdrop-blur-md flex items-center gap-4 relative z-10">
              {step > 1 && (
                <button 
                  type="button"
                  onClick={() => setStep(step - 1)} 
                  className="px-6 py-2.5 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm text-sm"
                >
                  Back
                </button>
              )}
              <button 
                type="button"
                onClick={onClose} 
                className={cn(
                   "py-2.5 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-50 transition-all shadow-sm px-6 text-sm",
                   step > 1 && "hidden"
                )}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSubmit}
                className="flex-1 py-2.5 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95 flex items-center justify-center gap-2 text-sm"
              >
                {step < 3 ? 'Continue' : (roleToEdit ? 'Save Changes' : 'Create Role')}
                <ChevronRight size={18} />
              </button>
            </div>
          </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};

export default RoleModal;
