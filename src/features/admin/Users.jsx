import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users as UsersIcon, 
  Search, 
  Plus, 
  Download, 
  Filter, 
  Mail, 
  ShieldCheck, 
  X, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  UserPlus, 
  Send, 
  Ban, 
  CheckCircle2, 
  Briefcase, 
  Phone, 
  Calendar,
  Lock,
  RotateCcw,
  Zap,
  MapPin,
  ChevronRight,
  UserCircle,
  Eye,
  FileText,
  Activity,
  Upload
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { cn } from '../../utils/cn';
import UserModal from '../../shared/components/admin/UserModal';
import ImportModal from '../../shared/components/import/ImportModal';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import ActionDropdown from '../../shared/components/admin/ActionDropdown';
import PermissionGate from '../../shared/components/common/PermissionGate';
import { usePermission } from '../../hooks/usePermission';

const Users = () => {
  const { 
    users, 
    departments, 
    roles, 
    deleteUser, 
    updateUser, 
    bulkUpdateUsersStatus, 
    bulkDeleteUsers,
    showToast 
  } = useAdmin();
  const { check: hasPermission } = usePermission('users');
  const navigate = useNavigate();

  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All Roles');
  const [deptFilter, setDeptFilter] = useState('All Depts');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [sortBy, setSortBy] = useState('name');
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToView, setUserToView] = useState(null);
  const [showFilterMenu, setShowFilterMenu] = useState(false);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Derived Data
  const stats = [
    { label: 'Total Employees', value: users.length, icon: UsersIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Active Now', value: users.filter(u => u.status === 'Active').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Invites', value: users.filter(u => u.status === 'Pending').length, icon: Send, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  const filteredUsers = useMemo(() => {
    return users
      .filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
                             u.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                             u.empId.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter;
        const matchesDept = deptFilter === 'All Depts' || u.department === deptFilter;
        const matchesStatus = statusFilter === 'All Status' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesDept && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'role') return a.role.localeCompare(b.role);
        if (sortBy === 'status') return a.status.localeCompare(b.status);
        return 0;
      });
  }, [users, debouncedSearchTerm, roleFilter, deptFilter, statusFilter, sortBy]);

  // Handlers
  const handleExport = () => {
    if (filteredUsers.length === 0) {
      showToast('No user records found to export', 'error');
      return;
    }
    // Generate CSV content
    const headers = ['Employee Name', 'Email', 'Role', 'Department', 'Employee ID', 'Joining Date', 'Status', 'Employment Type', 'Manager'];
    const rows = filteredUsers.map(u => [
      `"${u.name.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      `"${u.role.replace(/"/g, '""')}"`,
      `"${u.department.replace(/"/g, '""')}"`,
      `"${u.empId.replace(/"/g, '""')}"`,
      `"${u.joinDate}"`,
      `"${u.status}"`,
      `"${u.empType}"`,
      `"${u.manager}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `employees_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Employees list exported to CSV successfully!', 'success');
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(filteredUsers.map(u => u.id));
    } else {
      setSelectedUsers([]);
    }
  };

  const handleSelectUser = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} employees?`)) {
        bulkDeleteUsers(selectedUsers);
        setSelectedUsers([]);
      }
    } else if (action === 'activate') {
      bulkUpdateUsersStatus(selectedUsers, 'Active');
      setSelectedUsers([]);
    } else if (action === 'deactivate') {
      bulkUpdateUsersStatus(selectedUsers, 'Inactive');
      setSelectedUsers([]);
    }
  };

  const UserAvatar = ({ user, className = 'w-10 h-10 rounded-xl', iconSize = 20 }) => (
    <div className={cn(
      "bg-slate-100 text-slate-400 ring-2 ring-white shadow-sm flex items-center justify-center overflow-hidden shrink-0",
      className
    )}>
      {user?.img ? (
        <img src={user.img} alt={user.name || 'User'} className="w-full h-full object-cover" />
      ) : (
        <UserCircle size={iconSize} className="stroke-[1.8]" />
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-32 animate-fade-in focus:outline-none text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Employee Management</h1>
          <p className="hcm-page-subtitle">Oversee platform access, assign roles and configure workforce identities</p>
        </div>
        <div className="flex items-center gap-3">
          <PermissionGate module="users" action="create">
          <button 
            onClick={() => setIsImportModalOpen(true)}
            className="btn-secondary px-5 py-2.5 flex items-center gap-2 cursor-pointer"
          >
            <Upload size={18} />
            <span className="hidden sm:inline">Import</span>
          </button>
          </PermissionGate>
          <PermissionGate module="users" action="view">
          <button 
            onClick={handleExport}
            className="btn-secondary px-5 py-2.5 flex items-center gap-2 cursor-pointer"
          >
            <Download size={18} />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
          </PermissionGate>
          <PermissionGate module="users" action="create">
          <button 
            onClick={() => {
              setUserToEdit(null);
              setIsAddUserOpen(true);
            }}
            className="btn-primary px-6 py-2.5 flex items-center gap-2"
          >
             <UserPlus size={18} />
             <span>Add Employee</span>
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
            className="card"
          >
            <div className="flex items-center gap-4">
               <div className={cn("p-3 rounded-2xl", stat.bg, stat.color)}>
                  <stat.icon size={26} />
               </div>
               <div>
                  <p className="card-title">{stat.label}</p>
                  <h3 className="card-value">{stat.value}</h3>
               </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="card space-y-6">
         <div className="flex flex-col lg:flex-row items-center gap-4">
            <div className="relative flex-1 w-full text-slate-400">
                <Search className="absolute left-3 top-3" size={18} />
                <input 
                    type="text" 
                    placeholder="Search by name, email or employee ID..." 
                    className="input-field pl-10 h-11" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide relative">
              {/* Role, Dept, Status selects (visible on large screens) */}
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input-field h-11 pr-10 min-w-[140px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm hidden lg:block"
              >
                <option>All Roles</option>
                {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="input-field h-11 pr-10 min-w-[140px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm hidden lg:block"
              >
                <option>All Depts</option>
                {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field h-11 pr-10 min-w-[140px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 shadow-sm hidden lg:block"
              >
                <option>All Status</option>
                <option>Active</option>
                <option>Inactive</option>
                <option>Pending</option>
                <option>Resigned</option>
                <option>Terminated</option>
              </select>
              {/* Filter button for mobile */}
              <button
                onClick={() => setShowFilterMenu(prev => !prev)}
                className="p-2.5 text-slate-400 hover:text-primary-600 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all h-11 w-11 flex items-center justify-center shrink-0 lg:hidden"
                title="Filter"
              >
                <Filter size={18} />
              </button>
              {/* Mobile dropdown */}
              {showFilterMenu && (
                <div className="absolute top-12 left-0 bg-white shadow-lg rounded-xl border border-slate-200 z-10 w-full lg:w-auto">
                  <select
                    value={roleFilter}
                    onChange={(e) => { setRoleFilter(e.target.value); setShowFilterMenu(false); }}
                    className="input-field w-full h-11 px-4"
                  >
                    <option>All Roles</option>
                    {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                  </select>
                  <select
                    value={deptFilter}
                    onChange={(e) => { setDeptFilter(e.target.value); setShowFilterMenu(false); }}
                    className="input-field w-full h-11 px-4"
                  >
                    <option>All Depts</option>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setShowFilterMenu(false); }}
                    className="input-field w-full h-11 px-4"
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Pending</option>
                    <option>Resigned</option>
                    <option>Terminated</option>
                  </select>
                </div>
              )}
            </div>
         </div>

         {/* Bulk Actions Bar */}
         {selectedUsers.length > 0 && (
            <motion.div 
               initial={{ opacity: 0, y: -10 }}
               animate={{ opacity: 1, y: 0 }}
               className="p-4 bg-primary-50 dark:bg-primary-950/20 rounded-2xl border border-primary-100 dark:border-primary-900/30 flex items-center justify-between"
            >
               <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-primary-600 dark:text-primary-400 font-bold">{selectedUsers.length} Selected</span>
                  <div className="h-4 w-px bg-primary-200 dark:bg-primary-800"></div>
                  <div className="flex items-center gap-2">
                     <PermissionGate module="users" action="edit">
                     <button onClick={() => handleBulkAction('activate')} className="p-2 text-primary-600 dark:text-primary-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-[10px] font-bold">Bulk Activate</button>
                     <button onClick={() => handleBulkAction('deactivate')} className="p-2 text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-[10px] font-bold">Bulk Deactivate</button>
                     </PermissionGate>
                     <PermissionGate module="users" action="delete">
                     <button onClick={() => handleBulkAction('delete')} className="p-2 text-rose-600 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-all text-[10px] font-bold">Bulk Delete</button>
                     </PermissionGate>
                  </div>
               </div>
               <button onClick={() => setSelectedUsers([])} className="text-primary-400 hover:text-primary-600"><X size={18} /></button>
            </motion.div>
         )}
      </div>

      {/* User Table */}
      <div className="hcm-table-container">
         <div className="hidden sm:block overflow-x-auto">
            <table className="hcm-table">
               <thead className="hcm-thead">
                  <tr className="hcm-tr bg-slate-50/50 dark:bg-slate-950/40">
                     <th className="hcm-th px-8 py-5">
                          <input 
                             type="checkbox" 
                             className="w-4 h-4 rounded-md accent-primary-600 cursor-pointer"
                             checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                             onChange={handleSelectAll}
                          />
                     </th>
                     <th className="hcm-th px-8 py-5">Employee Info</th>
                     <th className="hcm-th px-8 py-5">Role / Dept</th>
                     <th className="hcm-th px-8 py-5">Allocated Salary</th>
                     <th className="hcm-th px-8 py-5 text-center">Last Login</th>
                     <th className="hcm-th px-8 py-5 text-center">Status</th>
                     <th className="hcm-th px-8 py-5 text-right">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 text-sm">
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                     <tr key={user.id} className={cn("hcm-tr", selectedUsers.includes(user.id) && "bg-slate-50/50 dark:bg-slate-800/40")}>
                        <td className="hcm-td px-8 py-6">
                            <input 
                                type="checkbox" 
                                className="w-4 h-4 rounded-md accent-primary-600 cursor-pointer"
                                checked={selectedUsers.includes(user.id)}
                                onChange={() => handleSelectUser(user.id)}
                            />
                        </td>
                        <td className="hcm-td px-8 py-6">
                           <div className="flex items-center gap-4">
                              <UserAvatar user={user} />
                              <div>
                                 <p className="font-bold text-slate-900 dark:text-white leading-none">{user.name}</p>
                                 <p className="text-[10px] font-bold text-slate-400 mt-2 font-bold">{user.email}</p>
                              </div>
                           </div>
                        </td>
                        <td className="hcm-td px-8 py-6">
                           <p className="font-bold text-slate-700 dark:text-slate-200 leading-none">{user.role}</p>
                           <p className="text-[10px] font-bold text-slate-400 mt-2 font-bold leading-none">{user.department}</p>
                        </td>
                        <td className="hcm-td px-8 py-6">
                           {(user.baseSalary || user.monthlyCTC) ? (
                             <span className="inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                               ${Number(user.baseSalary || user.monthlyCTC).toLocaleString()}/mo
                             </span>
                           ) : (
                             <span className="text-xs text-slate-400 font-medium italic">
                               Not Allocated
                             </span>
                           )}
                        </td>
                        <td className="hcm-td px-8 py-6 text-center text-xs font-bold text-slate-600 dark:text-slate-400">
                           {user.lastLogin}
                        </td>
                        <td className="hcm-td px-8 py-6 text-center">
                           <span className={cn(
                              "px-2.5 py-1 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border",
                              user.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              user.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                              user.status === 'Resigned' ? "bg-orange-50 text-orange-600 border-orange-100" :
                              user.status === 'Terminated' ? "bg-rose-50 text-rose-600 border-rose-100" :
                              "bg-slate-100 text-slate-400 border-slate-200"
                           )}>
                              {user.status}
                           </span>
                        </td>
                        <td className="hcm-td px-8 py-6 text-right">
                           <div className="flex justify-end items-center gap-1.5">
                               <button 
                                 onClick={() => navigate(`/admin/roles?role=${encodeURIComponent(user.role)}&user=${user.id}`)}
                                 className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                                 title="Permissions Matrix"
                               >
                                 <ShieldCheck size={18} />
                               </button>
                               <button 
                                 onClick={() => setUserToView(user)}
                                 className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                                 title="View Profile"
                               >
                                 <Eye size={18} />
                               </button>
                               <PermissionGate module="users" action="edit">
                               <button 
                                 onClick={() => {
                                    setUserToEdit(user);
                                    setIsAddUserOpen(true);
                                 }}
                                 className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" 
                                 title="Edit"
                               >
                                 <Edit3 size={18} />
                               </button>
                               </PermissionGate>
                               <ActionDropdown
                                 actions={[
                                   hasPermission('edit') ? {
                                     label: user.status === 'Active' ? 'Deactivate' : 'Activate',
                                     icon: user.status === 'Active' ? Ban : CheckCircle2,
                                     onClick: () => {
                                       updateUser(user.id, { status: user.status === 'Active' ? 'Inactive' : 'Active' });
                                     }
                                   } : null,
                                   hasPermission('delete') ? {
                                     label: 'Delete',
                                     icon: Trash2,
                                     danger: true,
                                     onClick: () => setUserToDelete(user)
                                   } : null
                                 ].filter(Boolean)}
                               />
                           </div>
                        </td>
                     </tr>
                  )) : (
                    <tr>
                        <td colSpan="6" className="px-8 py-20 text-center">
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-200">
                                    <UsersIcon size={32} />
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-slate-900">No employees found</p>
                                    <p className="text-sm font-medium text-slate-400">Try adjusting your filters or search query</p>
                                </div>
                            </div>
                        </td>
                    </tr>
                  )}
               </tbody>
            </table>
         </div>

         {/* Mobile Responsive Cards */}
         <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
               <div key={user.id} className={cn("p-4 space-y-3 transition-colors", selectedUsers.includes(user.id) && "bg-slate-50/50 dark:bg-slate-800/40")}>
                  <div className="flex items-start justify-between gap-3">
                     <div className="flex items-center gap-3">
                        <input 
                           type="checkbox" 
                           className="w-4 h-4 rounded-md accent-primary-600 cursor-pointer"
                           checked={selectedUsers.includes(user.id)}
                           onChange={() => handleSelectUser(user.id)}
                        />
                        <UserAvatar user={user} />
                        <div className="min-w-0 flex-1">
                           <p className="font-bold text-slate-900 dark:text-white leading-none truncate">{user.name}</p>
                           <p className="text-[10px] font-bold text-slate-400 mt-1 font-bold truncate">{user.email}</p>
                        </div>
                     </div>
                     <span className={cn(
                        "px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-widest border shrink-0",
                        user.status === 'Active' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                        user.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100" :
                        user.status === 'Resigned' ? "bg-orange-50 text-orange-600 border-orange-100" :
                        user.status === 'Terminated' ? "bg-rose-50 text-rose-600 border-rose-100" :
                        "bg-slate-100 text-slate-400 border-slate-200"
                     )}>
                        {user.status}
                     </span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                     <span className="font-bold text-slate-700 dark:text-slate-200">{user.role}</span>
                     <span className="text-slate-300">•</span>
                     <span>{user.department}</span>
                     <span className="text-slate-300">•</span>
                     <span className="text-slate-400">Login: {user.lastLogin}</span>
                  </div>
                  <div className="flex items-center justify-end gap-1 border-t border-slate-50 dark:border-slate-800/80 pt-2">
                     <button 
                       onClick={() => setUserToView(user)}
                       className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" 
                       title="View Profile"
                     >
                       <Eye size={18} />
                     </button>
                     <button 
                       onClick={() => {
                          setUserToEdit(user);
                          setIsAddUserOpen(true);
                       }}
                       className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" 
                       title="Edit"
                     >
                       <Edit3 size={18} />
                     </button>
                     <button 
                       onClick={() => {
                           if (user.status === 'Active') {
                               updateUser(user.id, { status: 'Inactive' });
                           } else {
                               updateUser(user.id, { status: 'Active' });
                           }
                       }}
                       className={cn(
                           "p-2 rounded-lg transition-all",
                           user.status === 'Active' ? "text-rose-500 hover:bg-rose-50" : "text-emerald-500 hover:bg-emerald-50"
                       )}
                       title={user.status === 'Active' ? "Deactivate" : "Activate"}
                     >
                       {user.status === 'Active' ? <Ban size={18} /> : <CheckCircle2 size={18} />}
                     </button>
                     <button 
                       onClick={() => setUserToDelete(user)}
                       className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" 
                       title="Delete"
                     >
                       <Trash2 size={18} />
                     </button>
                  </div>
               </div>
            )) : (
               <div className="p-12 text-center text-slate-450 font-medium text-sm">
                  No employees found.
               </div>
            )}
         </div>
      </div>

      {/* Profile Viewer Drawer */}
      <AnimatePresence>
        {userToView && (
          <div className="hcm-modal-overlay">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="hcm-modal max-h-[90vh] flex flex-col overflow-hidden"
            >
               <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="hcm-section-heading">User Profile</h3>
                  <button onClick={() => setUserToView(null)} className="p-2 hover:bg-slate-100 rounded-xl transition-all text-slate-400"><X size={24} /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-6 space-y-8">
                  <div className="flex flex-col items-center text-center">
                     <UserAvatar user={userToView} className="w-24 h-24 rounded-[2rem] ring-8 ring-slate-50 dark:ring-slate-800 shadow-xl" iconSize={48} />
                     <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-4">{userToView.name}</h2>
                     <p className="text-xs font-bold text-primary-600 font-bold mt-1">{userToView.role}</p>
                     
                     <div className="flex flex-wrap justify-center gap-3 mt-6">
                         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-2 border border-slate-100 dark:border-slate-800">
                             <Mail size={14} className="text-slate-400" />
                             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{userToView.email}</span>
                         </div>
                         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl flex items-center gap-2 border border-slate-100 dark:border-slate-800">
                             <Phone size={14} className="text-slate-400" />
                             <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{userToView.phone}</span>
                         </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     {[
                        { label: 'Employee ID', val: userToView.empId, icon: FileText },
                        { label: 'Department', val: userToView.department, icon: Briefcase },
                        { label: 'Joining Date', val: userToView.joinDate, icon: Calendar },
                        { label: 'Employment', val: userToView.empType, icon: UserCircle },
                        { label: 'Manager', val: userToView.manager, icon: UsersIcon },
                        { label: 'Last Login', val: userToView.lastLogin, icon: Activity },
                     ].map((item, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-left">
                           <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 font-bold mb-2">
                              <item.icon size={12} />
                              {item.label}
                           </div>
                           <p className="text-sm font-bold text-slate-850 dark:text-slate-200">{item.val}</p>
                        </div>
                     ))}
                  </div>

                  <div className="space-y-4">
                     <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2 text-left">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                        Recent Activity Timeline
                     </h4>
                     <div className="space-y-6 pl-2 border-l border-slate-100 dark:border-slate-800 ml-1 text-left">
                        {[
                           { text: 'Profile updated by Admin', time: '2h ago' },
                           { text: 'Logged in from New Device (San Jose, CA)', time: 'Yesterday, 10:45 AM' },
                           { text: 'Department assigned: Engineering', time: 'Oct 12, 2024' },
                        ].map((act, i) => (
                           <div key={i} className="relative pl-6">
                              <div className="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 ring-4 ring-white dark:ring-slate-900"></div>
                              <p className="text-sm font-bold text-slate-755 dark:text-slate-300">{act.text}</p>
                              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">{act.time}</p>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
               
               <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex gap-3">
                  <button 
                    onClick={() => {
                        setUserToEdit(userToView);
                        setUserToView(null);
                        setIsAddUserOpen(true);
                    }}
                    className="flex-1 btn-primary py-3"
                  >
                    Edit Profile
                  </button>
                  <button className="btn-secondary px-6 py-3"><MoreVertical size={20} /></button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <ImportModal 
        isOpen={isImportModalOpen} 
        onClose={() => setIsImportModalOpen(false)}
        entity="employees"
      />
      <UserModal 
        isOpen={isAddUserOpen} 
        onClose={() => {
            setIsAddUserOpen(false);
            setUserToEdit(null);
        }}
        userToEdit={userToEdit}
      />

      <ConfirmDialog 
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={() => deleteUser(userToDelete.id)}
        title="Delete Employee"
        message={`Are you sure you want to remove ${userToDelete?.name}? This action cannot be undone and will revoke all access instantly.`}
      />
    </div>
  );
};

export default Users;
