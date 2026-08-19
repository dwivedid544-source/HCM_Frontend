import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Users, 
  UserCircle, 
  ChevronRight, 
  MoreVertical, 
  X, 
  CheckCircle2, 
  Archive, 
  Edit3, 
  Trash2,
  Briefcase,
  Terminal,
  Grid,
  Info
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';
import DepartmentModal from '../../shared/components/admin/DepartmentModal';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import PermissionGate from '../../shared/components/common/PermissionGate';
import ImportModal from '../../shared/components/import/ImportModal';
import { Upload } from 'lucide-react';

const Departments = () => {
  const { departments, users, deleteDepartment, updateDepartment, showToast } = useAdmin();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [deptToDelete, setDeptToDelete] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  const handleExport = () => {
    if (filteredDepts.length === 0) {
      showToast('No department records found to export', 'error');
      return;
    }
    // Generate CSV content
    const headers = ['Department Name', 'Dept. Code', 'H.O.D (Head)', 'Employees', 'Status', 'Parent Department'];
    const rows = filteredDepts.map(d => [
      `"${d.name.replace(/"/g, '""')}"`,
      `"${(d.code || '').replace(/"/g, '""')}"`,
      `"${(d.head || 'Not Assigned').replace(/"/g, '""')}"`,
      d.employees,
      `"${d.status}"`,
      `"${(d.parent || 'Corporate').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `departments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Departments list exported to CSV successfully!', 'success');
  };

  const stats = [
    { label: 'Total Depts', value: departments.length, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Employees', value: users.length, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Heads Assigned', value: departments.filter(d => d.head).length + '/' + departments.length, icon: UserCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const filteredDepts = useMemo(() => {
    return departments.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           (d.code || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || d.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departments, searchTerm, statusFilter]);

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Departments</h1>
          <p className="text-slate-500 font-medium tracking-tight">Manage your company structure, team categories and leadership</p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate module="departments" action="create">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer animate-press mr-2"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Import</span>
          </button>
          </PermissionGate>
          <PermissionGate module="departments" action="view">
          <button 
            onClick={handleExport}
            className="btn-secondary px-5 py-2.5 font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer animate-press"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export List</span>
          </button>
          </PermissionGate>
          <PermissionGate module="departments" action="create">
          <button 
            onClick={() => {
              setDeptToEdit(null);
              setIsAddModalOpen(true);
            }}
            className="btn-primary px-6 py-2.5 font-bold flex items-center gap-2 shadow-lg shadow-primary-200"
          >
             <Plus size={18} />
             <span>Add Department</span>
          </button>
          </PermissionGate>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="card p-6"
          >
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="text-sm font-bold text-slate-400 font-bold leading-none mb-1.5">{stat.label}</p>
                  <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight dark:text-white">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter & List Area */}
      <div className="space-y-6">
         <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="relative flex-1 w-full text-slate-400">
               <Search className="absolute left-3 top-3" size={18} />
               <input 
                  type="text" 
                  placeholder="Search by department name or code..." 
                  className="input-field pl-10 h-11" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide relative">
            {/* Status Select (always visible on larger screens) */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field h-11 pr-10 min-w-[140px] font-bold text-slate-600 bg-white shadow-sm border-none hidden lg:block"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Archived</option>
            </select>
            {/* Filter button for mobile – toggles the dropdown */}
            <button
              onClick={() => setShowFilterMenu((prev) => !prev)}
              className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all h-11 w-11 flex items-center justify-center shrink-0 lg:hidden"
              title="Filter"
            >
              <Filter size={18} />
            </button>
            {/* Dropdown shown on mobile when filter button is active */}
            {showFilterMenu && (
              <div className="absolute top-12 left-0 bg-white shadow-lg rounded-xl border border-slate-200 z-10 w-full">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setShowFilterMenu(false);
                  }}
                  className="input-field w-full h-11 px-4"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Archived</option>
                </select>
              </div>
            )}
          </div>
         </div>

         <div className="card p-0 border-none bg-white shadow-soft overflow-hidden">
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead>
                     <tr className="bg-slate-50/50">
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Department Name</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center">Dept. Code</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center">H.O.D (Head)</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center">Employees</th>
                        <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em] text-center">Status</th>
                        <th className="px-8 py-5 text-right text-[10px] uppercase font-bold text-slate-400 tracking-[0.15em]">Action</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-sm">
                     {filteredDepts.length > 0 ? filteredDepts.map((dept) => (
                        <tr key={dept.id} className="group hover:bg-slate-50/20 transition-colors">
                           <td className="px-8 py-6">
                              <div className="flex items-center gap-4">
                                 <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: dept.color || '#4f46e5' }}>
                                    <Building2 size={20} />
                                 </div>
                                 <div>
                                    <p className="font-bold text-slate-900 tracking-tight">{dept.name}</p>
                                    <p className="text-[10px] font-bold text-slate-400 font-bold mt-1">{dept.parent || 'Corporate'}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <code className="px-2.5 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded-lg font-bold">{dept.code}</code>
                           </td>
                           <td className="px-8 py-6 text-center">
                              {dept.head ? (
                                <div className="flex items-center justify-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center text-[10px] text-white font-bold">
                                        {(dept.head || ' ')[0]}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{dept.head}</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Not Assigned</span>
                              )}
                           </td>
                           <td className="px-8 py-6 text-center">
                              <p className="font-extrabold text-slate-900 tracking-tight">{dept.employees}</p>
                           </td>
                           <td className="px-8 py-6 text-center">
                              <span className={cn(
                                 "px-3 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest border",
                                 dept.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : 
                                 dept.status === 'Archived' ? "bg-amber-50 text-amber-600 border-amber-100" :
                                 "bg-slate-100 text-slate-400 border-slate-200"
                              )}>
                                 {dept.status}
                              </span>
                           </td>
                           <td className="px-8 py-6 text-right">
                              <div className="flex justify-end items-center gap-1.5">
                                 <PermissionGate module="departments" action="edit">
                                 <button 
                                    onClick={() => {
                                        setDeptToEdit(dept);
                                        setIsAddModalOpen(true);
                                    }}
                                    className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" 
                                    title="Edit"
                                 >
                                    <Edit3 size={18} />
                                 </button>
                                 <button 
                                    onClick={() => updateDepartment(dept.id, { status: dept.status === 'Archived' ? 'Active' : 'Archived' })}
                                    className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all" 
                                    title={dept.status === 'Archived' ? "Restore" : "Archive"}
                                 >
                                    <Archive size={18} />
                                 </button>
                                 </PermissionGate>
                                 <PermissionGate module="departments" action="delete">
                                 <button 
                                    onClick={() => setDeptToDelete(dept)}
                                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all" 
                                    title="Delete"
                                 >
                                    <Trash2 size={18} />
                                 </button>
                                 </PermissionGate>
                              </div>
                           </td>
                        </tr>
                     )) : (
                        <tr>
                            <td colSpan="6" className="px-8 py-20 text-center">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                        <Building2 size={32} />
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-slate-900">No departments found</p>
                                        <p className="text-sm font-medium text-slate-400">Try adjusting your filters or search query</p>
                                    </div>
                                </div>
                            </td>
                        </tr>
                     )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        entity="departments"
      />

      <DepartmentModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
            setIsAddModalOpen(false);
            setDeptToEdit(null);
        }}
        deptToEdit={deptToEdit}
      />

      <ConfirmDialog 
        isOpen={!!deptToDelete}
        onClose={() => setDeptToDelete(null)}
        onConfirm={() => deleteDepartment(deptToDelete.id)}
        title="Delete Department"
        message={`Are you sure you want to delete the ${deptToDelete?.name} department? This will NOT delete users, but they will become unassigned.`}
      />
    </div>
  );
};

export default Departments;
