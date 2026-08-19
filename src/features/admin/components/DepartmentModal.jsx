import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Building2, 
  Terminal, 
  UserCircle, 
  ChevronRight, 
  Grid,
  Info,
  Type,
  LayoutGrid,
  Palette
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';

const DepartmentModal = ({ isOpen, onClose, deptToEdit = null }) => {
  const { users, departments, addDepartment, updateDepartment } = useAdmin();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    head: '',
    parent: 'Corporate',
    description: '',
    color: '#4f46e5',
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (deptToEdit) {
      setFormData(deptToEdit);
    } else {
      setFormData({
        name: '',
        code: '',
        head: '',
        parent: 'Corporate',
        description: '',
        color: '#4f46e5',
        status: 'Active'
      });
    }
  }, [deptToEdit, isOpen]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Department name is required';
    if (!formData.code.trim()) newErrors.code = 'Department code is required';
    
    // Check for unique code if adding new
    if (!deptToEdit && departments.some(d => d.code.toLowerCase() === formData.code.toLowerCase())) {
      newErrors.code = 'Department code must be unique';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (deptToEdit) {
      updateDepartment(deptToEdit.id, formData);
    } else {
      addDepartment(formData);
    }
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }

    // Auto-generate code from name
    if (name === 'name' && !deptToEdit && !formData.code) {
       const autoCode = value.slice(0, 3).toUpperCase();
       setFormData(prev => ({ ...prev, name: value, code: autoCode }));
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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl max-h-[90vh] bg-white shadow-2xl z-[120] flex flex-col rounded-3xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg transform rotate-6">
                  <Grid size={22} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-extrabold text-slate-900 leading-none dark:text-white">
                    {deptToEdit ? 'Update Department' : 'Create New Department'}
                  </h2>
                  <p className="text-[10px] font-bold text-primary-600 uppercase tracking-[0.2em] mt-2 leading-none">
                    Architecture for Organization
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose} 
                className="p-2.5 hover:bg-slate-100 rounded-xl transition-all text-slate-400"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="p-4 py-2.5">
                <div className="space-y-6">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Department Name</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-4 text-slate-300" size={18} />
                      <input 
                        type="text" 
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. Data Science" 
                        className={cn(
                          "input-field h-14 pl-12 bg-slate-50 border-transparent font-bold text-slate-700",
                          errors.name && "border-rose-300 bg-rose-50/50"
                        )}
                      />
                    </div>
                    {errors.name && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Department Code</label>
                      <div className="relative">
                        <Terminal className="absolute left-4 top-4 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          name="code"
                          value={formData.code}
                          onChange={handleChange}
                          placeholder="DS" 
                          className={cn(
                            "input-field h-14 pl-12 bg-slate-50 border-transparent font-bold text-slate-700 uppercase",
                            errors.code && "border-rose-300 bg-rose-50/50"
                          )}
                        />
                      </div>
                      {errors.code && <p className="text-[10px] font-bold text-rose-500 mt-1 px-1">{errors.code}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Head of Dept.</label>
                        <div className="relative">
                          <UserCircle className="absolute left-4 top-4 text-slate-300" size={18} />
                          <select 
                            name="head"
                            value={formData.head}
                            onChange={handleChange}
                            className="input-field h-14 pl-12 bg-slate-50 border-transparent font-bold text-slate-700 appearance-none"
                          >
                            <option value="">Select Manager</option>
                            {users.filter(u => u.role === 'Admin' || u.role === 'Manager' || u.role === 'HR').map(u => (
                              <option key={u.id} value={u.name}>{u.name}</option>
                            ))}
                          </select>
                        </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Parent Entity</label>
                        <select 
                            name="parent"
                            value={formData.parent}
                            onChange={handleChange}
                            className="input-field h-11 bg-slate-50 border-transparent font-bold text-slate-700"
                        >
                            <option>Corporate</option>
                            {departments.filter(d => d.id !== deptToEdit?.id).map(d => (
                                <option key={d.id} value={d.name}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Brand Color</label>
                        <div className="relative">
                            <Palette className="absolute left-4 top-4 text-slate-300" size={18} />
                            <div className="flex items-center gap-3 input-field h-14 pl-12 bg-slate-50 border-transparent">
                                <input 
                                    type="color" 
                                    name="color"
                                    value={formData.color}
                                    onChange={handleChange}
                                    className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-none"
                                />
                                <span className="font-bold text-slate-700 uppercase">{formData.color}</span>
                            </div>
                        </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest px-1">Status</label>
                    <div className="flex gap-4">
                        {['Active', 'Inactive', 'Archived'].map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, status: s }))}
                                className={cn(
                                    "flex-1 py-3 px-4 rounded-xl font-bold text-xs transition-all border",
                                    formData.status === s 
                                        ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-100" 
                                        : "bg-white text-slate-500 border-slate-100 hover:bg-slate-50"
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Department Scope</label>
                    <textarea 
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="input-field min-h-[90px] py-4 bg-slate-50 border-transparent resize-none text-sm font-medium" 
                      placeholder="Describe the core focus and responsibilities of this department..."
                    ></textarea>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 border-dashed space-y-4 flex flex-col items-center justify-center gap-4 group cursor-pointer hover:bg-white transition-all duration-300">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-300 shadow-sm group-hover:scale-110 transition-transform">
                        <LayoutGrid size={24} />
                    </div>
                    <div className="text-center">
                        <p className="text-[10px] font-extrabold text-slate-400 font-bold">Team Composition</p>
                        <p className="text-xs font-bold text-slate-400 mt-1">Configure default sub-teams and projects</p>
                    </div>
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="sticky bottom-0 p-8 border-t border-slate-100 bg-white flex items-center gap-4">
                <button 
                  type="button"
                  onClick={onClose} 
                  className="flex-1 py-4 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 bg-primary-600 text-white rounded-2xl font-bold hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 active:scale-95 flex items-center justify-center gap-2"
                >
                  {deptToEdit ? 'Save Changes' : 'Publish Department'}
                  <ChevronRight size={18} />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DepartmentModal;
