import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  UserPlus, 
  Mail, 
  ShieldCheck, 
  Briefcase, 
  Phone, 
  Calendar, 
  Camera, 
  ChevronRight, 
  User,
  Plus,
  Trash2,
  Lock,
  Loader2,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';
import DatePicker from '../../../shared/components/common/DatePicker';

const UserModal = ({ isOpen, onClose, userToEdit = null }) => {
  const { departments, roles, addUser, updateUser, users } = useAdmin();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    role: 'Employee',
    department: 'Engineering',
    manager: 'None',
    joinDate: new Date().toISOString().split('T')[0],
    empType: 'Full-time',
    status: 'Active',
    address: '',
    notes: '',
    sendInvite: true,
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // TAB 4 Custom Permission States
  const [permissions, setPermissions] = useState({
    adminSettings: false,
    payrollAccess: false,
    employeeManagement: true,
    reportingAccess: false
  });

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        ...userToEdit,
        sendInvite: false
      });
      // Set realistic permissions based on role
      setPermissions({
        adminSettings: userToEdit.role === 'Super Admin' || userToEdit.role === 'Admin',
        payrollAccess: userToEdit.role === 'Super Admin' || userToEdit.role === 'HR Manager',
        employeeManagement: userToEdit.role !== 'Employee' && userToEdit.role !== 'Candidate',
        reportingAccess: userToEdit.role === 'Super Admin' || userToEdit.role === 'Admin' || userToEdit.role === 'HR Manager'
      });
    } else {
      // Auto-generate Employee ID
      const nextId = users.length + 1;
      setFormData(prev => ({
        ...prev,
        empId: `EMP-${String(nextId).padStart(3, '0')}`,
        name: '',
        email: '',
        phone: '',
        role: 'Employee',
        department: 'Engineering',
        manager: 'None',
        joinDate: new Date().toISOString().split('T')[0],
        empType: 'Full-time',
        status: 'Active',
        address: '',
        notes: '',
        sendInvite: true
      }));
      setPermissions({
        adminSettings: false,
        payrollAccess: false,
        employeeManagement: true,
        reportingAccess: false
      });
    }
    setActiveTab('basic');
    setIsDirty(false);
    setIsSuccess(false);
    setIsSaving(false);
    setErrors({});
  }, [userToEdit, isOpen, users.length]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email is required';
    }
    
    // Check for unique email if adding new user
    if (!userToEdit && users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      newErrors.email = 'Email already exists';
    }

    if (!formData.empId.trim()) newErrors.empId = 'Employee ID is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    setTimeout(() => {
      if (userToEdit) {
        updateUser(userToEdit.id, formData);
      } else {
        addUser(formData);
      }
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsDirty(false);
        onClose();
      }, 800);
    }, 1200);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setIsDirty(true);
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    setIsDirty(true);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'employment', label: 'Employment Details' },
    { id: 'additional', label: 'Additional Details' },
    { id: 'permissions', label: 'Permissions' },
    { id: 'activity', label: 'Activity Log' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Modal Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[110]"
          />
          
          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 15 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[95%] max-w-[950px] h-[82vh] max-h-[780px] bg-white shadow-2xl z-[120] flex flex-col rounded-[2.5rem] overflow-hidden border border-slate-100"
          >
            {/* Header Profile Area */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shrink-0 relative">
              <div className="flex items-center gap-5">
                {/* Profile Image with Online Indicator */}
                <div className="relative group shrink-0">
                  <div className="w-16 h-16 rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-200/80 group-hover:border-primary-400 group-hover:bg-primary-50 transition-all overflow-hidden shadow-inner">
                    {formData.img ? (
                      <img src={formData.img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </div>
                  {/* Status Indicator */}
                  <span className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors",
                    formData.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                  )} />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none dark:text-white">
                      {userToEdit ? 'Edit User Profile' : 'Add Workspace User'}
                    </h2>
                    <span className="text-[10px] font-bold bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full border border-primary-100 uppercase tracking-wider hidden xs:inline-block">
                      {formData.role}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-1.5 leading-none">
                    Update profile info, onboarding status and system privileges.
                  </p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <button type="button" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 font-bold">
                      Upload photo
                    </button>
                    <span className="text-slate-200 text-[10px] font-bold">|</span>
                    <button type="button" className="text-[10px] font-bold text-slate-400 hover:text-rose-500 font-bold">
                      Remove
                    </button>
                  </div>
                </div>
              </div>

              {/* Employee Summary Card */}
              <div className="bg-gradient-to-br from-primary-50/80 to-indigo-50/50 backdrop-blur-md rounded-2xl p-3.5 border border-primary-100/50 shadow-soft text-left grid grid-cols-2 gap-x-5 gap-y-1.5 shrink-0 min-w-[280px]">
                <div>
                  <p className="text-[9px] font-black text-slate-400 font-bold leading-none">Employee ID</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-1 leading-none uppercase">{formData.empId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Status</p>
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase mt-1 leading-none",
                    formData.status === 'Active' ? 'hcm-badge hcm-badge-approved border border-emerald-200' :
                    formData.status === 'Pending' ? 'hcm-badge hcm-badge-pending border border-amber-200' : 'bg-slate-100 text-slate-600'
                  )}>
                    {formData.status}
                  </span>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Role</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-1 leading-none truncate max-w-[100px]">{formData.role || 'Employee'}</p>
                </div>
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Department</p>
                  <p className="text-xs font-extrabold text-slate-800 mt-1 leading-none truncate max-w-[100px]">{formData.department || 'N/A'}</p>
                </div>
              </div>

              {/* Close Button */}
              <button 
                onClick={onClose} 
                className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={20} />
              </button>
            </div>

            {/* Navigation Tabs Selector */}
            <div className="flex border-b border-slate-100 overflow-x-auto scrollbar-none px-6 py-1 gap-1.5 bg-slate-50/20 shrink-0">
              {tabs.map(t => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id)}
                  className={cn(
                    "px-4 py-3.5 text-xs font-black uppercase tracking-wider transition-all border-b-2 whitespace-nowrap",
                    activeTab === t.id
                      ? "border-primary-600 text-primary-600 font-extrabold"
                      : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-200"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab Contents Frame */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto min-h-0 flex flex-col">
              <div className="p-8 flex-1">
                
                {/* TAB 1: Basic Information */}
                {activeTab === 'basic' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 font-bold px-1">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Doe" 
                        className={cn(
                          "w-full h-[48px] px-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 hover:border-slate-300 transition-all",
                          errors.name && "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                        )} 
                      />
                      {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 font-bold px-1">Employee ID</label>
                      <input 
                        type="text" 
                        name="empId"
                        value={formData.empId}
                        onChange={handleChange}
                        placeholder="EMP-000" 
                        className={cn(
                          "w-full h-[48px] px-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 uppercase focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 hover:border-slate-355 transition-all",
                          errors.empId && "border-rose-400 bg-rose-50/50"
                        )}
                      />
                      {errors.empId && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.empId}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email Address</label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          type="email" 
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="john.doe@org.com" 
                          className={cn(
                            "w-full h-[48px] pl-12 pr-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 hover:border-slate-300 transition-all",
                            errors.email && "border-rose-400 bg-rose-50/50 focus:border-rose-500"
                          )}
                        />
                      </div>
                      {errors.email && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Phone Number</label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <input 
                          type="text" 
                          name="phone"
                          value={formData.phone}
                          maxLength={10} onChange={(e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); handleChange(e); }}
                          placeholder="e.g. 9876543210" 
                          className="w-full h-[48px] pl-12 pr-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 hover:border-slate-300 transition-all" 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 2: Employment Details */}
                {activeTab === 'employment' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Organization Role</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <select 
                          name="role"
                          value={formData.role}
                          onChange={handleChange}
                          className="w-full h-[48px] pl-12 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.name}>{role.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <select 
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full h-[48px] pl-12 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer"
                        >
                          <option value="None">None</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reporting Manager</label>
                      <div className="relative">
                        <select 
                          name="manager"
                          value={formData.manager}
                          onChange={handleChange}
                          className="w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer"
                        >
                          <option value="None">Direct Reporting (None)</option>
                          {users.filter(u => u.role !== 'Candidate' && u.id !== userToEdit?.id).map(u => (
                            <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employment Type</label>
                      <div className="relative">
                        <select 
                          name="empType"
                          value={formData.empType}
                          onChange={handleChange}
                          className="w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer"
                        >
                          <option>Full-time</option>
                          <option>Part-time</option>
                          <option>Contract</option>
                          <option>Intern</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Joining Date</label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-3.5 text-slate-400 pointer-events-none" size={18} />
                        <DatePicker  
                          name="joinDate"
                          value={formData.joinDate}
                          onChange={handleChange}
                          className="w-full h-[48px] pl-12 pr-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all" 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                      <div className="relative">
                        <select 
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer"
                        >
                          <option>Active</option>
                          <option>Inactive</option>
                          <option>Pending</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* TAB 3: Additional Details */}
                {activeTab === 'additional' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                  >
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Residential Address</label>
                      <textarea 
                        name="address"
                        value={formData.address || ''}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all resize-none" 
                        placeholder="Street, City, Zip Code..."
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Private Notes</label>
                      <textarea 
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 bg-slate-50/30 border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all resize-none" 
                        placeholder="Background checks, internal feedback..."
                      />
                    </div>

                    {/* Invitation Tool - Only visible for new users */}
                    {!userToEdit && (
                      <div className="col-span-1 md:col-span-2 p-5 bg-indigo-50/40 rounded-2xl border border-indigo-100/50 border-dashed space-y-4">
                        <div className="flex items-center justify-between gap-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm border border-slate-100">
                              <UserPlus size={18} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none">Onboarding Invitation</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Send login credentials & welcome email</p>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              name="sendInvite"
                              checked={formData.sendInvite}
                              onChange={handleChange}
                              className="sr-only peer" 
                            />
                            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* TAB 4: Permissions */}
                {activeTab === 'permissions' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left"
                  >
                    {[
                      { key: 'adminSettings', title: 'System Administration', desc: 'Allows full workspace configuration, backend settings access and department management.' },
                      { key: 'payrollAccess', title: 'Payroll & Financials', desc: 'Grants access to employee compensation, tax documents, bank details, and monthly pay runs.' },
                      { key: 'employeeManagement', title: 'Employee Directory Management', desc: 'Allows creating, editing, suspending and terminating workspace user profiles.' },
                      { key: 'reportingAccess', title: 'Confidential Workforce Reports', desc: 'Grants viewing access to predictive turnover models, headcount charts, and salary statistics.' }
                    ].map(p => (
                      <div key={p.key} className="p-4 bg-slate-50/50 hover:bg-slate-50 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-900">{p.title}</p>
                          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{p.desc}</p>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-slate-100/50">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {permissions[p.key] ? 'Authorized' : 'Restricted'}
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={permissions[p.key]}
                              onChange={() => togglePermission(p.key)}
                              className="sr-only peer" 
                            />
                            <div className="w-10 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                          </label>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}

                {/* TAB 5: Activity Log */}
                {activeTab === 'activity' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-left"
                  >
                    {userToEdit ? (
                      <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-5">
                        {[
                          { action: 'Updated compensation structure', info: 'Modified base salary & direct deposit settings', time: '12 minutes ago', icon: Briefcase },
                          { action: 'Onboarding verification completed', info: 'Address and legal documents reviewed successfully', time: '2 days ago', icon: ShieldCheck },
                          { action: 'Signed in via Google Workspace Workspace', info: 'Logged in from Seattle, WA (IP: 192.168.1.1)', time: '3 days ago', icon: Clock }
                        ].map((log, index) => (
                          <div key={index} className="relative">
                            <span className="absolute -left-[33px] top-0 w-5 h-5 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center text-slate-400">
                              <log.icon size={10} />
                            </span>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none">{log.action}</p>
                              <p className="text-[10px] text-slate-400 font-semibold mt-1 leading-none">{log.info}</p>
                              <span className="text-[9px] font-black text-primary-600 uppercase tracking-wider mt-2.5 inline-block">{log.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-3">
                        <Clock size={32} className="stroke-[1.5]" />
                        <div>
                          <p className="text-sm font-bold text-slate-800">No logs available</p>
                          <p className="text-xs text-slate-400 mt-1">Activity logs will start tracking once this profile is initialized.</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

              </div>

              {/* Action Sticky Footer */}
              <div className="sticky bottom-0 h-[68px] px-8 border-t border-slate-100 bg-white/95 backdrop-blur-md flex items-center justify-between gap-4 shrink-0">
                {/* Unsaved changes indicator */}
                <div className="flex items-center gap-2">
                  {isDirty && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 text-amber-500"
                    >
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Unsaved Changes</span>
                    </motion.div>
                  )}
                  {isSuccess && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 text-emerald-500"
                    >
                      <CheckCircle2 size={14} className="stroke-[2.5]" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Changes Saved!</span>
                    </motion.div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={onClose} 
                    className="px-6 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-550 border border-slate-200 rounded-xl text-xs font-bold transition-all shadow-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isSaving || isSuccess}
                    className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-xs font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 active:scale-95 flex items-center justify-center gap-2 min-w-[140px] disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : isSuccess ? (
                      <span>Saved!</span>
                    ) : (
                      <>
                        <span>Save Changes</span>
                        <ChevronRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UserModal;
