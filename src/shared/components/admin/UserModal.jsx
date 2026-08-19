import React, { useRef, useState, useEffect } from 'react';
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
import { useAdmin } from '../../../context/AdminContext';
import { cn } from '../../../utils/cn';
import PhoneInput from '../ui/PhoneInput';
import api from '../../../utils/apiService';
import DatePicker from '../../../shared/components/common/DatePicker';

const UserModal = ({ isOpen, onClose, userToEdit = null }) => {
  const { departments, roles, addUser, updateUser, users, fetchUsers, shifts, overtimePolicies } = useAdmin();
  const fileInputRef = useRef(null);

  const getNextEmployeeId = () => {
    const used = new Set(users.map(u => String(u.empId || '').toUpperCase()));
    let next = users.length + 1;
    let candidate = `EMP-${String(next).padStart(3, '0')}`;
    while (used.has(candidate)) {
      next += 1;
      candidate = `EMP-${String(next).padStart(3, '0')}`;
    }
    return candidate;
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    empId: '',
    role: '',
    customRoleId: '',
    department: '',
    manager: '',
    joinDate: '',
    empType: '',
    status: '',
    address: '',
    notes: '',
    img: '',
    sendInvite: true,
    shiftId: '',
    overtimePolicyId: '',
    salaryType: 'Monthly',
    hourlyRate: '',
  });

  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState('basic');
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [structures, setStructures] = useState([]);
  const [compData, setCompData] = useState({
    baseSalary: '',
    monthlyCTC: '',
    annualCTC: '',
    effectiveDate: '',
    reason: '',
    salaryStructureId: '',
    salaryVersionId: ''
  });

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
      setCompData({
        baseSalary: userToEdit.baseSalary || userToEdit.monthlyCTC || '',
        monthlyCTC: userToEdit.monthlyCTC || userToEdit.baseSalary || '',
        annualCTC: ((userToEdit.monthlyCTC || userToEdit.baseSalary || 0) * 12) || '',
        effectiveDate: userToEdit.joinDate || '',
        reason: 'Profile Update',
        salaryStructureId: '',
        salaryVersionId: ''
      });
      // Set realistic permissions based on role
      setPermissions({
        adminSettings: userToEdit.role === 'Super Admin' || userToEdit.role === 'Admin',
        payrollAccess: userToEdit.role === 'Super Admin' || userToEdit.role === 'HR Manager',
        employeeManagement: userToEdit.role !== 'Employee' && userToEdit.role !== 'Candidate',
        reportingAccess: userToEdit.role === 'Super Admin' || userToEdit.role === 'Admin' || userToEdit.role === 'HR Manager'
      });
    } else {
      setFormData(prev => ({
        ...prev,
        empId: getNextEmployeeId(),
        name: '',
        email: '',
        phone: '',
        role: '',
        customRoleId: '',
        department: '',
        manager: '',
        joinDate: '',
        empType: '',
        status: '',
        address: '',
        notes: '',
        img: '',
        sendInvite: true,
        shiftId: '',
        overtimePolicyId: '',
        salaryType: 'Monthly',
        hourlyRate: '',
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

  useEffect(() => {
    if (activeTab === 'compensation') {
      if (userToEdit?.profileId) {
        api.get(`/hr/compensation/${userToEdit.profileId}`)
          .then(res => {
            if (res.data) {
              setCompData({
                baseSalary: res.data.baseSalary || '',
                monthlyCTC: res.data.monthlyCTC || '',
                annualCTC: res.data.annualCTC || '',
                effectiveDate: res.data.effectiveDate?.split('T')[0] || '',
                reason: '',
                salaryStructureId: res.data.salaryStructureId || '',
                salaryVersionId: res.data.salaryVersionId || ''
              });
            }
          })
          .catch(err => {
            setCompData({
              baseSalary: '',
              monthlyCTC: '',
              annualCTC: '',
              effectiveDate: new Date().toISOString().split('T')[0],
              reason: 'Initial Setup',
              salaryStructureId: '',
              salaryVersionId: ''
            });
          });
      } else {
        setCompData(prev => ({
          baseSalary: prev.baseSalary || '',
          monthlyCTC: prev.monthlyCTC || '',
          annualCTC: prev.annualCTC || '',
          effectiveDate: prev.effectiveDate || new Date().toISOString().split('T')[0],
          reason: prev.reason || 'Initial Setup',
          salaryStructureId: prev.salaryStructureId || '',
          salaryVersionId: prev.salaryVersionId || ''
        }));
      }

      // Fetch structures
      api.get('/admin/salary-structures').then(res => setStructures(res.data)).catch(() => {});
    }
  }, [activeTab, userToEdit]);

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
    if (users.some(u => u.id !== userToEdit?.id && String(u.empId).toLowerCase() === formData.empId.toLowerCase())) {
      newErrors.empId = 'Employee ID already exists';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be exactly 10 digits';
    }
    if (!formData.role) newErrors.role = 'Organization role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.manager) newErrors.manager = 'Reporting manager is required';
    if (!formData.empType) newErrors.empType = 'Employment type is required';
    if (!formData.joinDate) newErrors.joinDate = 'Joining date is required';
    if (!formData.status) newErrors.status = 'Status is required';
    if (!formData.address.trim()) newErrors.address = 'Residential address is required';

    setErrors(newErrors);
    if (newErrors.name || newErrors.empId || newErrors.email || newErrors.phone) {
      setActiveTab('basic');
    } else if (newErrors.role || newErrors.department || newErrors.manager || newErrors.empType || newErrors.joinDate || newErrors.status) {
      setActiveTab('employment');
    } else if (newErrors.address) {
      setActiveTab('additional');
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (activeTab === 'compensation' && userToEdit) {
      await handleSaveCompensation();
      return;
    }
    if (!validate()) return;

    setIsSaving(true);
    try {
      if (userToEdit) {
        const payload = {
          ...formData,
          salary: compData.monthlyCTC || compData.baseSalary ? Number(compData.monthlyCTC || compData.baseSalary) : undefined,
          baseSalary: compData.baseSalary ? Number(compData.baseSalary) : undefined,
          monthlyCTC: compData.monthlyCTC ? Number(compData.monthlyCTC) : undefined,
        };
        await updateUser(userToEdit.id, payload);
      } else {
        const payload = {
          ...formData,
          monthlyCTC: compData.monthlyCTC ? Number(compData.monthlyCTC) : undefined,
          salaryStructureId: compData.salaryStructureId || undefined,
          salaryVersionId: compData.salaryVersionId || undefined,
          effectiveDate: compData.effectiveDate || undefined,
          customRoleId: formData.customRoleId || undefined,
          shiftId: formData.shiftId || undefined,
          overtimePolicyId: formData.overtimePolicyId || undefined,
          salaryType: formData.salaryType || 'Monthly',
          hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : null,
        };
        await addUser(payload);
      }
      setIsSaving(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsDirty(false);
        onClose();
      }, 800);
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Unable to save user';
      setErrors(prev => ({ ...prev, form: message }));
      setIsSaving(false);
    }
  };

  const handleSaveCompensation = async () => {
    setIsSaving(true);
    try {
      await api.put(`/hr/compensation/${userToEdit.profileId}`, {
        baseSalary: Number(compData.baseSalary),
        monthlyCTC: Number(compData.monthlyCTC),
        annualCTC: Number(compData.monthlyCTC) * 12,
        effectiveDate: new Date(compData.effectiveDate),
        reason: compData.reason || "Updated via Admin Panel",
        salaryStructureId: compData.salaryStructureId,
        salaryVersionId: compData.salaryVersionId
      });
      await fetchUsers();
      setIsSaving(false);
      setIsSuccess(true);
      setIsDirty(false);
      setTimeout(() => {
        setIsSuccess(false);
      }, 1000);
    } catch (err) {
      const message = err.response?.data?.message || 'Unable to save compensation';
      setErrors(prev => ({ ...prev, form: message }));
      setIsSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, type, checked } = e.target;
    const value = name === 'phone' ? e.target.value.replace(/\D/g, '').slice(0, 10) : e.target.value;
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

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, img: 'Please upload an image file' }));
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, img: 'Photo must be 2 MB or smaller' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, img: reader.result }));
      setErrors(prev => ({ ...prev, img: null }));
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setFormData(prev => ({ ...prev, img: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setIsDirty(true);
  };

  const togglePermission = (key) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    setIsDirty(true);
  };

  const tabs = [
    { id: 'basic', label: 'Basic Information' },
    { id: 'employment', label: 'Employment Details' },
    { id: 'compensation', label: 'Compensation & CTC' },
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full sm:w-[95%] max-w-[950px] h-full sm:h-[82vh] sm:max-h-[780px] bg-white shadow-2xl z-[120] flex flex-col rounded-none sm:rounded-[2.5rem] overflow-hidden border border-slate-100"
          >
            {/* Header Profile Area */}
            <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shrink-0 relative">
              <div className="flex items-center gap-5">
                {/* Profile Image with Online Indicator */}
                <div className="relative group shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-16 h-16 rounded-[1.25rem] bg-slate-100 flex items-center justify-center text-slate-400 border-2 border-slate-200/80 group-hover:border-primary-400 group-hover:bg-primary-50 transition-all overflow-hidden shadow-inner cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-600"
                    title="Upload profile photo"
                  >
                    {formData.img ? (
                      <img src={formData.img} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={24} />
                    )}
                  </button>
                  {/* Status Indicator */}
                  <span className={cn(
                    "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm transition-colors",
                    formData.status === 'Active' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'
                  )} />
                </div>

                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-none dark:text-white">
                      {userToEdit ? 'Edit User Profile' : 'Add Workspace User'}
                    </h2>
                    <span className="text-[10px] font-bold bg-primary-50 text-primary-700 px-2.5 py-0.5 rounded-full border border-primary-100 font-bold hidden xs:inline-block">
                      {formData.role || 'New User'}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-slate-500 mt-1.5 leading-none">
                    Update profile info, onboarding status and system privileges.
                  </p>
                  <div className="flex items-center gap-3 mt-2.5">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-bold text-primary-600 hover:text-primary-700 font-bold inline-flex items-center gap-1"
                    >
                      <Camera size={12} />
                      Upload photo
                    </button>
                    <span className="text-slate-200 text-[10px] font-bold">|</span>
                    <button type="button" onClick={removePhoto} className="text-[10px] font-bold text-slate-400 hover:text-rose-500 font-bold">
                      Remove
                    </button>
                  </div>
                  {errors.img && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.img}</p>}
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
                  <p className="text-xs font-extrabold text-slate-800 mt-1 leading-none truncate max-w-[100px]">{formData.role || 'N/A'}</p>
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
                        readOnly
                        placeholder="EMP-000"
                        className={cn(
                          "w-full h-[48px] px-4 bg-slate-100/70 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 uppercase focus:outline-none cursor-not-allowed",
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
                      <PhoneInput
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="10 digit phone number"
                        className={errors.phone ? "border-rose-400 bg-rose-50/50 focus:border-rose-500" : ""}
                      />
                      {errors.phone && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.phone}</p>}
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
                          className={cn(
                            "w-full h-[48px] pl-12 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer",
                            errors.role && "border-rose-400 bg-rose-50/50"
                          )}
                        >
                          <option value="">Select organization role</option>
                          <option value="Admin">Admin</option>
                          <option value="HR">HR</option>
                          <option value="Manager">Manager</option>
                          <option value="Employee">Employee</option>
                          <option value="Candidate">Candidate</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                      {errors.role && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.role}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Custom Role Override (Optional)</label>
                      <div className="relative">
                        <ShieldCheck className="absolute left-4 top-3.5 text-primary-400" size={18} />
                        <select
                          name="customRoleId"
                          value={formData.customRoleId || ''}
                          onChange={handleChange}
                          className={cn(
                            "w-full h-[48px] pl-12 pr-10 bg-primary-50/30 border border-primary-100 rounded-xl font-bold text-sm text-primary-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-primary-50/60 transition-all cursor-pointer"
                          )}
                        >
                          <option value="">None (Use Base Role)</option>
                          {roles.filter(r => r.isCustom && r.status === 'ACTIVE').map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                      {errors.role && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.role}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Department</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-3.5 text-slate-400" size={18} />
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className={cn(
                            "w-full h-[48px] pl-12 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer",
                            errors.department && "border-rose-400 bg-rose-50/50"
                          )}
                        >
                          <option value="">Select department</option>
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.name}>{dept.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                      {errors.department && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.department}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reporting Manager</label>
                      <div className="relative">
                        <select
                          name="manager"
                          value={formData.manager}
                          onChange={handleChange}
                          className={cn(
                            "w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer",
                            errors.manager && "border-rose-400 bg-rose-50/50"
                          )}
                        >
                          <option value="">Select reporting manager</option>
                          <option value="None">Direct Reporting (None)</option>
                          {users.filter(u => u.role !== 'Candidate' && u.id !== userToEdit?.id).map(u => (
                            <option key={u.id} value={u.name}>{u.name} ({u.role})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                      {errors.manager && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.manager}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Employment Type</label>
                      <div className="relative">
                        <select
                          name="empType"
                          value={formData.empType}
                          onChange={handleChange}
                          className={cn(
                            "w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer",
                            errors.empType && "border-rose-400 bg-rose-50/50"
                          )}
                        >
                          <option value="">Select employment type</option>
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                      {errors.empType && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.empType}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Salary Type</label>
                      <div className="relative">
                        <select
                          name="salaryType"
                          value={formData.salaryType}
                          onChange={handleChange}
                          className={cn(
                            "w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer"
                          )}
                        >
                          <option value="Monthly">Monthly Salary</option>
                          <option value="Hourly">Hourly Wage</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    {formData.salaryType === 'Hourly' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Hourly Rate</label>
                        <input
                          type="number"
                          name="hourlyRate"
                          value={formData.hourlyRate}
                          onChange={handleChange}
                          placeholder="e.g., 25"
                          className="w-full h-[48px] px-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Assigned Shift</label>
                      <div className="relative">
                        <select
                          name="shiftId"
                          value={formData.shiftId}
                          onChange={handleChange}
                          className="w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer"
                        >
                          <option value="">Default Shift</option>
                          {shifts && shifts.map(shift => (
                            <option key={shift.id} value={shift.id}>{shift.name} ({shift.startTime} - {shift.endTime})</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Overtime Policy</label>
                      <div className="relative">
                        <select
                          name="overtimePolicyId"
                          value={formData.overtimePolicyId}
                          onChange={handleChange}
                          className="w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer"
                        >
                          <option value="">Default Policy</option>
                          {overtimePolicies && overtimePolicies.map(policy => (
                            <option key={policy.id} value={policy.id}>{policy.name} ({policy.weekdayMultiplier}x)</option>
                          ))}
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
                          className={cn(
                            "w-full h-[48px] pl-12 pr-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all",
                            errors.joinDate && "border-rose-400 bg-rose-50/50"
                          )}
                        />
                      </div>
                      {errors.joinDate && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.joinDate}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Status</label>
                      <div className="relative">
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className={cn(
                            "w-full h-[48px] px-4 pr-10 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all cursor-pointer",
                            errors.status && "border-rose-400 bg-rose-50/50"
                          )}
                        >
                          <option value="">Select status</option>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                          <option value="Pending">Pending</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={16} />
                      </div>
                      {errors.status && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.status}</p>}
                    </div>
                  </motion.div>
                )}

                {/* TAB: Compensation & CTC */}
                {activeTab === 'compensation' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left"
                  >

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Salary Structure</label>
                      <select
                        name="salaryStructureId"
                        value={compData.salaryStructureId}
                        onChange={e => {
                          const struct = structures.find(s => s.id === e.target.value);
                          const versionId = struct?.versions?.[0]?.id || '';
                          setCompData({ ...compData, salaryStructureId: e.target.value, salaryVersionId: versionId });
                          setIsDirty(true);
                        }}
                        className="w-full h-[48px] px-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all"
                      >
                        <option value="">Select Structure</option>
                        {structures.map(s => (
                          <option key={s.id} value={s.id}>{s.name} (v{s.currentVersion?.version || s.versions?.[0]?.version || 1})</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly CTC</label>
                      <input
                        type="number"
                        name="monthlyCTC"
                        value={compData.monthlyCTC}
                        onChange={e => {
                          setCompData({ ...compData, monthlyCTC: e.target.value });
                          setIsDirty(true);
                        }}
                        placeholder="e.g. 6000"
                        className="w-full h-[48px] px-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Effective Date</label>
                      <DatePicker 
                        name="effectiveDate"
                        value={compData.effectiveDate}
                        onChange={e => {
                          setCompData({ ...compData, effectiveDate: e.target.value });
                          setIsDirty(true);
                        }}
                        className="w-full h-[48px] px-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all"
                      />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Reason / Notes for Salary update</label>
                      <input
                        type="text"
                        name="reason"
                        value={compData.reason}
                        onChange={e => {
                          setCompData({ ...compData, reason: e.target.value });
                          setIsDirty(true);
                        }}
                        placeholder="e.g. Performance appraisal, promotion..."
                        className="w-full h-[48px] px-4 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all"
                      />
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
                        className={cn(
                          "w-full px-4 py-3 bg-slate-50/30 border border-slate-200 rounded-xl font-semibold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all resize-none",
                          errors.address && "border-rose-400 bg-rose-50/50"
                        )}
                        placeholder="Street, City, Zip Code..."
                      />
                      {errors.address && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.address}</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Private Notes</label>
                      <textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        rows="4"
                        className="w-full px-4 py-3 bg-slate-50/30 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-600 hover:bg-slate-50/60 transition-all resize-none"
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
                  {errors.form && (
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-500">{errors.form}</p>
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
