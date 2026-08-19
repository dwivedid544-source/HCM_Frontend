import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
   ShieldCheck,
   Shield,
   Lock,
   Eye,
   Plus,
   Search,
   Filter,
   Save,
   Check,
   X,
   ChevronDown,
   ChevronRight,
   Users,
   Settings,
   FileText,
   Zap,
   Activity,
   Layout,
   LockKeyhole,
   Trash2,
   Clock,
   History,
   Sliders,
   UserCheck,
   UserMinus,
   UserPlus,
   Sparkles,
   RefreshCw,
   AlertCircle,
   CheckCircle2,
   Edit3
} from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { usePermissionContext } from '../../context/PermissionContext';
import { cn } from '../../utils/cn';
import RoleModal from '../../shared/components/admin/RoleModal';
import ConfirmDialog from '../../shared/components/admin/ConfirmDialog';
import CenterModal from '../../shared/components/layout/CenterModal';

import { ROLE_MODULES, MODULE_ACTIONS, resolveDependencies } from '../../utils/permissionsConfig';

import PageHeader from '../../shared/components/ui/PageHeader';
import Button from '../../shared/components/ui/Button';

const getModulesForRole = (roleName) => {
   const normalized = (roleName || '').toUpperCase();
   return ROLE_MODULES[normalized] || ROLE_MODULES.EMPLOYEE;
};

const RolesPermissions = () => {
   const {
      roles,
      users,
      deleteRole,
      updateRole,
      changeUserRole,
      revokeUserRole,
      roleHistory,
      fetchRoleHistory,
      fetchRoles,
      fetchUsers,
      showToast
   } = useAdmin();

   const { refreshPermissions } = usePermissionContext();
   const { pathname } = useLocation();
   const [searchParams, setSearchParams] = useSearchParams();

   const isAdminPanel = pathname.startsWith('/admin');
   const isSuperAdminPanel = pathname.startsWith('/superadmin');

   const displayRoles = useMemo(() => {
      return roles.filter(r => {
         const isSuperAdminRole = r.name === 'Super Admin' || r.name === 'SUPERADMIN';
         const isAdminRole = r.name === 'Admin' || r.name === 'ADMIN';

         if (isAdminPanel) {
            return !isSuperAdminRole && !isAdminRole;
         } else {
            return !isSuperAdminRole;
         }
      });
   }, [roles, isAdminPanel]);

   // State with URL and localStorage persistence
   const initialRole = searchParams.get('role') || localStorage.getItem('hcm_active_matrix_role') || (isAdminPanel ? 'HR Manager' : 'Admin');
   const initialSection = searchParams.get('section') || localStorage.getItem('hcm_active_matrix_section') || 'matrix';
   const initialUserId = searchParams.get('user') || localStorage.getItem('hcm_active_matrix_user') || '';

   const [searchTerm, setSearchTerm] = useState('');
   const [selectedRoleName, setSelectedRoleName] = useState(initialRole);
   const [activeSection, setActiveSection] = useState(initialSection); // 'matrix' | 'members' | 'history'
   const [selectedUserId, setSelectedUserId] = useState(initialUserId);

   const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
   const [roleToEdit, setRoleToEdit] = useState(null);
   const [roleToDelete, setRoleToDelete] = useState(null);

   const [isSavingMatrix, setIsSavingMatrix] = useState(false);
   const [matrixPermissions, setMatrixPermissions] = useState({});

   // Assign Role Modal state
   const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
   const [assignTargetUserId, setAssignTargetUserId] = useState('');
   const [isAssigning, setIsAssigning] = useState(false);
   const [userSearchTerm, setUserSearchTerm] = useState('');

   // Revoke Role Dialog state
   const [userToRevoke, setUserToRevoke] = useState(null);
   const [isRevoking, setIsRevoking] = useState(false);

   // Sync URL search params and localStorage on change
   const handleSelectRole = (roleName) => {
      setSelectedRoleName(roleName);
      localStorage.setItem('hcm_active_matrix_role', roleName);
      setSearchParams(prev => {
         const updated = new URLSearchParams(prev);
         updated.set('role', roleName);
         return updated;
      }, { replace: true });
   };

   const handleSelectSection = (section) => {
      setActiveSection(section);
      localStorage.setItem('hcm_active_matrix_section', section);
      setSearchParams(prev => {
         const updated = new URLSearchParams(prev);
         updated.set('section', section);
         return updated;
      }, { replace: true });
   };

   // Keep state in sync with URL search params
   useEffect(() => {
      const urlRole = searchParams.get('role');
      const urlSection = searchParams.get('section');
      const urlUser = searchParams.get('user');

      if (urlRole && urlRole.toLowerCase() !== selectedRoleName.toLowerCase()) {
         setSelectedRoleName(urlRole);
         localStorage.setItem('hcm_active_matrix_role', urlRole);
      }
      if (urlSection && urlSection !== activeSection) {
         setActiveSection(urlSection);
         localStorage.setItem('hcm_active_matrix_section', urlSection);
      }
      if (urlUser && urlUser !== selectedUserId) {
         setSelectedUserId(urlUser);
         localStorage.setItem('hcm_active_matrix_user', urlUser);
      }
   }, [searchParams]);

   // Derived current role
   const filteredRoles = useMemo(() => {
      return displayRoles.filter(r =>
         (r.name || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
   }, [displayRoles, searchTerm]);

   const currentRole = useMemo(() => {
      if (displayRoles.length === 0) return null;
      const found = displayRoles.find(r => (r.name || '').toLowerCase() === (selectedRoleName || '').toLowerCase()) ||
                    displayRoles.find(r => (r.name || '').toLowerCase().includes((selectedRoleName || '').toLowerCase())) ||
                    displayRoles[0];
      return found;
   }, [displayRoles, selectedRoleName]);

   const modules = useMemo(() => {
      if (!currentRole) return [];
      return getModulesForRole(currentRole.inheritsFrom || currentRole.name);
   }, [currentRole]);

   useEffect(() => {
      if (currentRole) {
         setMatrixPermissions(currentRole.permissions || {});
      }
   }, [currentRole]);

   // Compute assigned members for the current role
   const assignedUsers = useMemo(() => {
      if (!currentRole) return [];
      return users.filter(u => {
         if (currentRole.isCustom) {
            return u.customRoleId === currentRole.id || u.customRole?.id === currentRole.id;
         }
         const uRole = (u.role || '').toLowerCase();
         const cRole = (currentRole.name || '').toLowerCase();
         const isMatch = uRole === cRole || (cRole === 'hr manager' && uRole === 'hr') || (cRole === 'candidate' && uRole === 'candidate');
         return isMatch && (!u.customRoleId || u.customRole?.name === currentRole.name);
      });
   }, [users, currentRole]);

   // Handle Matrix Update
   const handleUpdatePermissions = async () => {
      if (!currentRole) return;
      setIsSavingMatrix(true);
      try {
         await updateRole(currentRole.id, {
            ...currentRole,
            permissions: matrixPermissions
         });
         await refreshPermissions();
         window.dispatchEvent(new CustomEvent('permissions_updated'));
         showToast(`${currentRole.name} permissions matrix updated and synced company-wide!`, 'success');
      } catch (err) {
         console.error(err);
         showToast('Failed to update permissions.', 'error');
      } finally {
         setIsSavingMatrix(false);
      }
   };

   // Handle Role Assignment
   const handleAssignRoleSubmit = async (e) => {
      e.preventDefault();
      if (!assignTargetUserId || !currentRole) {
         showToast('Please select a user to assign.', 'error');
         return;
      }
      setIsAssigning(true);
      try {
         let targetBaseRole = currentRole.inheritsFrom || 'EMPLOYEE';
         const normalizedName = currentRole.name.toUpperCase();
         if (['ADMIN', 'HR', 'MANAGER', 'EMPLOYEE', 'CANDIDATE'].includes(normalizedName)) {
            targetBaseRole = normalizedName;
         } else if (currentRole.name === 'HR Manager') {
            targetBaseRole = 'HR';
         }

         const payload = {
            role: targetBaseRole,
            customRoleId: currentRole.isCustom ? currentRole.id : null
         };

         await changeUserRole(assignTargetUserId, payload);
         await refreshPermissions();
         window.dispatchEvent(new CustomEvent('permissions_updated'));
         showToast(`Role assigned successfully to user!`, 'success');
         setIsAssignModalOpen(false);
         setAssignTargetUserId('');
      } catch (err) {
         console.error(err);
         showToast('Failed to assign role.', 'error');
      } finally {
         setIsAssigning(false);
      }
   };

   // Handle Role Revocation
   const handleConfirmRevoke = async () => {
      if (!userToRevoke) return;
      setIsRevoking(true);
      try {
         await revokeUserRole(userToRevoke.id);
         await refreshPermissions();
         window.dispatchEvent(new CustomEvent('permissions_updated'));
         showToast(`Role successfully removed/revoked for ${userToRevoke.name}!`, 'success');
         setUserToRevoke(null);
      } catch (err) {
         console.error(err);
         showToast('Failed to revoke role.', 'error');
      } finally {
         setIsRevoking(false);
      }
   };

   // Active user count helper
   const activeCount = (role) => {
      if (role.isCustom) {
         return users.filter(u => u.customRoleId === role.id && u.status === 'Active').length;
      }
      const rName = (role.name || '').toLowerCase();
      return users.filter(u => {
         const uRole = (u.role || '').toLowerCase();
         const matches = uRole === rName || (rName === 'hr manager' && uRole === 'hr');
         return matches && u.status === 'Active' && !u.customRoleId;
      }).length;
   };

   // Filter candidates/users available for assignment
   const assignableUsers = useMemo(() => {
      return users.filter(u => {
         const matchesSearch = (u.name || '').toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                               (u.email || '').toLowerCase().includes(userSearchTerm.toLowerCase());
         const isAlreadyAssigned = currentRole?.isCustom
            ? u.customRoleId === currentRole?.id
            : ((u.role || '').toLowerCase() === (currentRole?.name || '').toLowerCase() && !u.customRoleId);
         return matchesSearch && !isAlreadyAssigned;
      });
   }, [users, userSearchTerm, currentRole]);

   return (
      <div className="space-y-8 pb-12 animate-fade-in relative focus:outline-none text-left">
         {/* Header */}
         <PageHeader
            title="Roles &amp; Permissions"
            subtitle="Granular access control, live permission matrix enforcement, and role assignment history"
         >
            {(isAdminPanel || isSuperAdminPanel) && (
               <Button
                  variant="primary"
                  leftIcon={Plus}
                  onClick={() => { setRoleToEdit(null); setIsRoleModalOpen(true); }}
               >
                  Create Custom Role
               </Button>
            )}
         </PageHeader>

         {/* Search Filter */}
         <div className="flex items-center gap-3">
            <div className="relative flex-1 text-slate-400">
               <Search className="absolute left-3 top-3" size={18} />
               <input
                  type="text"
                  placeholder="Search roles..."
                  className="input-field pl-10 h-11 w-full"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* Platform Roles Selection Grid */}
         <div className="flex flex-col gap-8 items-start w-full">
            <div className="w-full space-y-4">
               <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Platform Roles</h3>
                  <span className="text-[11px] font-bold text-slate-400">Active Role: <span className="text-primary-600 dark:text-primary-400 font-black">{currentRole?.name || 'Loading...'}</span></span>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
                  {filteredRoles.map((role) => {
                     const isSelected = (currentRole?.name || '').toLowerCase() === (role.name || '').toLowerCase();
                     return (
                        <div key={role.id} className="relative group/role w-full">
                           <button
                              onClick={() => handleSelectRole(role.name)}
                              className={cn(
                                 'w-full p-5 rounded-3xl text-left transition-all border group flex items-center justify-between cursor-pointer min-h-[90px]',
                                 isSelected
                                    ? 'bg-slate-900 dark:bg-slate-800 border-slate-900 dark:border-slate-700 text-white shadow-xl shadow-slate-200 dark:shadow-none ring-2 ring-primary-500/20'
                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm',
                                 role.isCustom && 'pr-20'
                              )}
                           >
                              <div className="flex-1 min-w-0 pr-2">
                                 <div className="flex items-center gap-2 mb-1">
                                    <ShieldCheck
                                       size={18}
                                       className={cn(isSelected ? 'text-primary-400' : 'text-slate-350 dark:text-slate-750')}
                                    />
                                    <span className="text-sm font-bold tracking-tight truncate">{role.name}</span>
                                    {role.isCustom && (
                                       <span className="text-[8px] font-black bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded ml-2 shrink-0">Custom</span>
                                    )}
                                 </div>
                                 <p className={cn('text-[10px] font-bold uppercase tracking-wider mt-1.5', isSelected ? 'text-white/60' : 'text-slate-400')}>
                                    {role.isCustom && role.inheritsFrom ? `Inherits: ${role.inheritsFrom} | ` : ''}{role.assignedUsersCount || activeCount(role)} Active Users
                                 </p>
                              </div>
                           </button>

                           {/* Custom role edit/delete */}
                           {role.isCustom && (
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 z-10">
                                 <button
                                    onClick={(e) => { e.stopPropagation(); setRoleToEdit(role); setIsRoleModalOpen(true); }}
                                    className={cn(
                                       'p-1.5 rounded-lg border transition-all shadow-sm cursor-pointer',
                                       isSelected
                                          ? 'bg-slate-850 dark:bg-slate-700 border-slate-700 dark:border-slate-600 text-white/80 hover:text-white hover:bg-slate-700'
                                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-primary-600 hover:bg-white'
                                    )}
                                    title="Edit Custom Role"
                                 >
                                    <Edit3 size={13} />
                                 </button>
                                 <button
                                    onClick={(e) => { e.stopPropagation(); setRoleToDelete(role); }}
                                    className={cn(
                                       'p-1.5 rounded-lg border transition-all shadow-sm cursor-pointer',
                                       isSelected
                                          ? 'bg-slate-850 dark:bg-slate-700 border-slate-700 dark:border-slate-600 text-rose-450 hover:text-rose-350 hover:bg-rose-950/30'
                                          : 'bg-slate-50 border-slate-100 text-slate-400 hover:text-rose-600 hover:bg-white'
                                    )}
                                    title="Delete Custom Role"
                                 >
                                    <Trash2 size={13} />
                                 </button>
                              </div>
                           )}
                        </div>
                     );
                  })}
               </div>
            </div>

            {/* Navigation Tabs between Permissions Matrix and Assigned Members & History */}
            <div className="w-full flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-2">
               <button
                  onClick={() => handleSelectSection('matrix')}
                  className={cn(
                     'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer',
                     activeSection === 'matrix'
                        ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md'
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
               >
                  <Sliders size={16} />
                  <span>Permissions Matrix</span>
               </button>

               <button
                  onClick={() => handleSelectSection('members')}
                  className={cn(
                     'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer relative',
                     activeSection === 'members'
                        ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md'
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
               >
                  <Users size={16} />
                  <span>Assigned Members ({assignedUsers.length})</span>
               </button>

               <button
                  onClick={() => handleSelectSection('history')}
                  className={cn(
                     'flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer',
                     activeSection === 'history'
                        ? 'bg-slate-900 dark:bg-slate-800 text-white shadow-md'
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  )}
               >
                  <History size={16} />
                  <span>Role &amp; Permission History</span>
               </button>
            </div>

            {/* SECTION 1: Permissions Matrix */}
            {activeSection === 'matrix' && (
               <div className="w-full space-y-6">
                  <div className="card p-0 bg-white dark:bg-slate-900 border-none shadow-soft overflow-hidden">
                     <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/10 dark:bg-slate-800/10">
                        <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center shadow-lg transform -rotate-3">
                              <LockKeyhole size={22} />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{currentRole?.name} Permissions Matrix</h3>
                              <p className="text-[10px] font-bold text-primary-600 font-bold mt-1">Configure live module capabilities for all {currentRole?.name} accounts</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <button
                              onClick={() => handleSelectSection('members')}
                              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                           >
                              <UserPlus size={15} />
                              <span>Assign User</span>
                           </button>
                           <button
                              onClick={handleUpdatePermissions}
                              disabled={isSavingMatrix}
                              className={cn(
                                 'flex items-center gap-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 cursor-pointer',
                                 isSavingMatrix && 'opacity-80 cursor-not-allowed scale-95'
                              )}
                           >
                              {isSavingMatrix
                                 ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                 : <Save size={18} />
                              }
                              <span>{isSavingMatrix ? 'Updating...' : 'Update Matrix'}</span>
                           </button>
                        </div>
                     </div>

                     <div className="p-0 overflow-x-auto no-scrollbar">
                        <table className="w-full text-left min-w-[800px]">
                           <thead>
                              <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                                 <th className="px-8 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] w-[30%]">Module</th>
                                 <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[10%]">View</th>
                                 <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[10%]">Create</th>
                                 <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[10%]">Edit</th>
                                 <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[10%]">Delete</th>
                                 <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[15%]">Approve</th>
                                 <th className="px-4 py-5 text-[10px] uppercase font-bold text-slate-400 tracking-[0.2em] text-center w-[15%]">Manage</th>
                              </tr>
                           </thead>
                           <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                              {modules.map((mod) => {
                                 const availActions = MODULE_ACTIONS[mod.id] || ['view'];
                                 const activePerms = matrixPermissions[mod.id] || [];
                                 return (
                                    <tr key={mod.id} className="group hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                                       <td className="px-8 py-6">
                                          <div className="flex items-center gap-3">
                                             <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tracking-tight">{mod.label}</span>
                                          </div>
                                       </td>
                                       {['view', 'create', 'edit', 'delete', 'approve', 'manage'].map((action) => {
                                          const isAvail = availActions.includes(action);
                                          const isChecked = activePerms.includes(action);
                                          return (
                                             <td key={action} className="px-4 py-6 text-center">
                                                <div className="flex items-center justify-center">
                                                   {isAvail ? (
                                                      <button
                                                         onClick={() => {
                                                            if (!currentRole) return;
                                                            let updatedPerms = [...activePerms];
                                                            if (updatedPerms.includes(action)) {
                                                               updatedPerms = updatedPerms.filter(a => a !== action);
                                                               if (action === 'view') updatedPerms = [];
                                                            } else {
                                                               updatedPerms.push(action);
                                                               updatedPerms = resolveDependencies(updatedPerms);
                                                            }
                                                            setMatrixPermissions(prev => ({
                                                               ...prev,
                                                               [mod.id]: updatedPerms
                                                            }));
                                                         }}
                                                         className={cn(
                                                            'w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all active:scale-95 cursor-pointer',
                                                            isChecked
                                                               ? 'bg-primary-600 border-primary-600 shadow-lg shadow-primary-200 text-white'
                                                               : 'border-slate-400 bg-slate-50 dark:border-slate-600 dark:bg-slate-800 hover:border-primary-400 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500'
                                                         )}
                                                      >
                                                         {isChecked && <Check size={14} strokeWidth={3} />}
                                                      </button>
                                                   ) : <span className="text-slate-200 dark:text-slate-800">-</span>}
                                                </div>
                                             </td>
                                          );
                                       })}
                                    </tr>
                                 );
                              })}
                           </tbody>
                        </table>
                     </div>
                  </div>
               </div>
            )}

            {/* SECTION 2: Assigned Members & Management */}
            {activeSection === 'members' && (
               <div className="w-full space-y-6">
                  <div className="card p-6 bg-white dark:bg-slate-900 border-none shadow-soft">
                     <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                              Members Assigned to {currentRole?.name}
                           </h3>
                           <p className="text-xs text-slate-400 mt-1">
                              View all active accounts holding this role, assign new candidates/employees, or revoke roles.
                           </p>
                        </div>
                        <Button
                           variant="primary"
                           leftIcon={UserPlus}
                           onClick={() => setIsAssignModalOpen(true)}
                        >
                           Assign Member to {currentRole?.name}
                        </Button>
                     </div>

                     {assignedUsers.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {assignedUsers.map((member) => (
                              <div
                                 key={member.id}
                                 className={cn(
                                    'p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 relative bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:shadow-md',
                                    selectedUserId === member.id && 'ring-2 ring-primary-500 bg-primary-50/10'
                                 )}
                              >
                                 <div className="flex items-start gap-3.5">
                                    <img
                                       src={member.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || member.email)}&background=random`}
                                       alt={member.name}
                                       className="w-12 h-12 rounded-xl object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm shrink-0"
                                    />
                                    <div className="flex-1 min-w-0">
                                       <div className="flex items-center gap-2">
                                          <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</h4>
                                          <span className={cn(
                                             "text-[9px] font-black px-2 py-0.5 rounded-full uppercase",
                                             member.status === 'Active' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-slate-200 text-slate-600"
                                          )}>
                                             {member.status}
                                          </span>
                                       </div>
                                       <p className="text-xs text-slate-400 truncate mt-0.5">{member.email}</p>
                                       <p className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-wider">
                                          {member.department || 'General'} • {member.empId || member.id.slice(0, 8)}
                                       </p>
                                    </div>
                                 </div>

                                 <div className="pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400">
                                       {currentRole?.isCustom ? 'Custom Override' : 'Primary Role'}
                                    </span>
                                    <button
                                       onClick={() => setUserToRevoke(member)}
                                       className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl text-xs font-bold transition-all cursor-pointer"
                                       title="Revoke Role"
                                    >
                                       <UserMinus size={14} />
                                       <span>Revoke Role</span>
                                    </button>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="py-16 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl">
                           <Users size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                           <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No members currently assigned to {currentRole?.name}</h4>
                           <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                              Click the button below to assign candidates or employees to this role.
                           </p>
                           <button
                              onClick={() => setIsAssignModalOpen(true)}
                              className="mt-4 px-5 py-2.5 bg-primary-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all cursor-pointer"
                           >
                              Assign First Member
                           </button>
                        </div>
                     )}
                  </div>
               </div>
            )}

            {/* SECTION 3: Role & Permission Audit History */}
            {activeSection === 'history' && (
               <div className="w-full space-y-6">
                  <div className="card p-6 bg-white dark:bg-slate-900 border-none shadow-soft">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                              <History size={20} className="text-primary-600" />
                              <span>Role &amp; Permission Audit History</span>
                           </h3>
                           <p className="text-xs text-slate-400 mt-1">
                              Chronological record of all role assignments, role revocations, and matrix permission modifications.
                           </p>
                        </div>
                        <button
                           onClick={() => fetchRoleHistory()}
                           className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
                        >
                           <RefreshCw size={14} />
                           <span>Refresh Log</span>
                        </button>
                     </div>

                     {roleHistory.length > 0 ? (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                           {roleHistory.map((item) => {
                              const isRevoke = item.action.includes('REVOKE');
                              const isAssign = item.action.includes('ASSIGN') || item.action.includes('UPDATE_USER_ROLE') || item.action.includes('CHANGE_USER_ROLE');
                              const isMatrix = item.action.includes('UPDATE_ROLE');
                              return (
                                 <div key={item.id} className="py-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/40 dark:hover:bg-slate-800/20 px-3 rounded-2xl transition-colors">
                                    <div className="flex items-start gap-3.5">
                                       <div className={cn(
                                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                                          isRevoke ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400" :
                                          isAssign ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400" :
                                          "bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400"
                                       )}>
                                          {isRevoke ? <UserMinus size={18} /> : isAssign ? <UserCheck size={18} /> : <Sliders size={18} />}
                                       </div>
                                       <div>
                                          <div className="flex items-center gap-2">
                                             <span className={cn(
                                                "text-[9px] font-black uppercase px-2 py-0.5 rounded-md",
                                                isRevoke ? "bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" :
                                                isAssign ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" :
                                                "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300"
                                             )}>
                                                {item.action.replace(/_/g, ' ')}
                                             </span>
                                             <span className="text-[11px] text-slate-400">by <span className="font-bold text-slate-700 dark:text-slate-200">{item.actor}</span> ({item.actorEmail})</span>
                                          </div>
                                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 mt-1">
                                             {item.details}
                                          </p>
                                       </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                       <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1 sm:justify-end">
                                          <Clock size={12} />
                                          {new Date(item.createdAt).toLocaleString()}
                                       </p>
                                    </div>
                                 </div>
                              );
                           })}
                        </div>
                     ) : (
                        <div className="py-16 text-center text-slate-400">
                           <History size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                           <p className="text-xs font-bold">No role changes recorded yet.</p>
                        </div>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Assign User / Candidate Modal */}
         <CenterModal
            isOpen={isAssignModalOpen}
            onClose={() => { setIsAssignModalOpen(false); setAssignTargetUserId(''); }}
            title={`Assign Member to ${currentRole?.name}`}
         >
            <form onSubmit={handleAssignRoleSubmit} className="p-6 space-y-6 text-left">
               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Search Candidate or Employee</label>
                  <div className="relative">
                     <Search className="absolute left-3.5 top-3 text-slate-400" size={16} />
                     <input
                        type="text"
                        placeholder="Search by name, email, or department..."
                        value={userSearchTerm}
                        onChange={(e) => setUserSearchTerm(e.target.value)}
                        className="input-field pl-10 h-11 w-full"
                     />
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-wider">Select Account to Assign</label>
                  <div className="max-h-60 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                     {assignableUsers.length > 0 ? (
                        assignableUsers.map((user) => (
                           <div
                              key={user.id}
                              onClick={() => setAssignTargetUserId(user.id)}
                              className={cn(
                                 "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between",
                                 assignTargetUserId === user.id
                                    ? "bg-primary-50 dark:bg-primary-950/40 border-primary-500 ring-2 ring-primary-500/20"
                                    : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-700 hover:border-slate-300"
                              )}
                           >
                              <div className="flex items-center gap-3">
                                 <img
                                    src={user.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || user.email)}`}
                                    alt={user.name}
                                    className="w-9 h-9 rounded-lg object-cover"
                                 />
                                 <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                                    <p className="text-[10px] text-slate-400">{user.email} • Current: <span className="font-bold">{user.role}</span></p>
                                 </div>
                              </div>
                              <div className={cn(
                                 "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                 assignTargetUserId === user.id
                                    ? "bg-primary-600 border-primary-600 text-white"
                                    : "border-slate-300 bg-white"
                              )}>
                                 {assignTargetUserId === user.id && <Check size={12} strokeWidth={3} />}
                              </div>
                           </div>
                        ))
                     ) : (
                        <p className="text-xs text-slate-400 py-6 text-center">No matching unassigned members found.</p>
                     )}
                  </div>
               </div>

               <div className="pt-4 flex items-center gap-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                     type="button"
                     onClick={() => { setIsAssignModalOpen(false); setAssignTargetUserId(''); }}
                     className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all"
                  >
                     Cancel
                  </button>
                  <button
                     type="submit"
                     disabled={!assignTargetUserId || isAssigning}
                     className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-primary-200 hover:bg-primary-700 transition-all disabled:opacity-50"
                  >
                     {isAssigning ? 'Assigning...' : `Confirm Assignment to ${currentRole?.name}`}
                  </button>
               </div>
            </form>
         </CenterModal>

         {/* Revoke Role Confirmation Dialog */}
         <ConfirmDialog
            isOpen={!!userToRevoke}
            onClose={() => setUserToRevoke(null)}
            onConfirm={handleConfirmRevoke}
            title="Revoke Assigned Role"
            message={`Are you sure you want to remove the "${currentRole?.name}" role from ${userToRevoke?.name}? The user will revert to default permissions.`}
         />

         {/* Create / Edit Custom Role Modal */}
         <RoleModal
            isOpen={isRoleModalOpen}
            onClose={() => { setIsRoleModalOpen(false); setRoleToEdit(null); }}
            roleToEdit={roleToEdit}
         />

         {/* Delete Custom Role Dialog */}
         <ConfirmDialog
            isOpen={!!roleToDelete}
            onClose={() => setRoleToDelete(null)}
            onConfirm={() => deleteRole(roleToDelete.id)}
            title="Delete Custom Role"
            message={`Are you sure you want to delete the ${roleToDelete?.name} role? This will affect all assigned users and may result in loss of access.`}
         />
      </div>
   );
};

export default RolesPermissions;
