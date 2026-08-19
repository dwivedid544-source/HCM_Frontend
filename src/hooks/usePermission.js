import { usePermissionContext } from '../context/PermissionContext';

/**
 * A convenience hook for checking permissions inside components.
 * 
 * @param {string} module - The module ID to scope this hook to (e.g. 'users', 'payroll')
 * @returns {object} Utility functions bound to the current user's permissions
 */
export const usePermission = (module) => {
  const { hasPermission, hasModuleAccess, isSuperAdmin, loading } = usePermissionContext();

  return {
    isSuperAdmin,
    loading,
    
    // Module level access
    hasModuleAccess: () => hasModuleAccess(module),
    
    // Action level access
    canView: () => hasPermission(module, 'view'),
    canCreate: () => hasPermission(module, 'create'),
    canEdit: () => hasPermission(module, 'edit'),
    canDelete: () => hasPermission(module, 'delete'),
    canApprove: () => hasPermission(module, 'approve'),
    canManage: () => hasPermission(module, 'manage'),
    
    // Raw checker if needed
    check: (action) => hasPermission(module, action),
  };
};
