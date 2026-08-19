import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../utils/apiService';
import { isPermitted, getFirstAccessibleRoute } from '../utils/permissionUtils';
import { useAuth } from '../hooks/useAuth';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const { user, isAuthenticated, loading: authLoading, previewRole } = useAuth();
  
  const [permissions, setPermissions] = useState(null);
  const [employeePermissions, setEmployeePermissions] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [roleKey, setRoleKey] = useState(null);
  const [roleName, setRoleName] = useState(null);
  const [isCustomOverride, setIsCustomOverride] = useState(false);
  const [landingPage, setLandingPage] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = useCallback(async () => {
    if (!isAuthenticated) {
      setPermissions(null);
      setEmployeePermissions(null);
      setIsSuperAdmin(false);
      setRoleKey(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await authAPI.getMyPermissions();
      const { 
        isSuperAdmin: isSa, 
        permissions: perms, 
        employeePermissions: empPerms,
        role, 
        roleName: rName, 
        isCustomOverride: isCust, 
        landingPage: lPage 
      } = response.data.data;
      
      setIsSuperAdmin(isSa);
      setPermissions(isSa ? 'FULL_ACCESS' : perms);
      setEmployeePermissions(isSa ? 'FULL_ACCESS' : empPerms);
      setRoleKey(role ? role.toLowerCase() : null);
      setRoleName(rName || null);
      setIsCustomOverride(isCust || false);
      setLandingPage(lPage || null);
    } catch (err) {
      console.error("Failed to fetch permissions", err);
      setPermissions([]);
      setEmployeePermissions([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!authLoading) {
      fetchPermissions();
    }
  }, [authLoading, isAuthenticated, fetchPermissions]);

  // Expose the same helpers as permissionUtils but bound to current state
  const hasPermission = useCallback((module, action = 'view', scope = null) => {
    if (previewRole) return true; // Bypass checks during preview runs
    if (scope === 'employee' && employeePermissions) {
      return isPermitted(employeePermissions, module, action);
    }
    return isPermitted(permissions, module, action);
  }, [permissions, employeePermissions, previewRole]);

  const hasModuleAccess = useCallback((module, scope = null) => {
    if (previewRole) return true; // Bypass checks during preview runs
    if (scope === 'employee' && employeePermissions) {
      return isPermitted(employeePermissions, module, 'view');
    }
    return isPermitted(permissions, module, 'view');
  }, [permissions, employeePermissions, previewRole]);

  // Dynamic overrides for preview mode
  const activeIsSuperAdmin = previewRole ? (previewRole.toLowerCase() === 'superadmin') : isSuperAdmin;
  const activeRoleKey = previewRole ? previewRole.toLowerCase() : roleKey;
  const activePermissions = previewRole ? 'FULL_ACCESS' : permissions;
  const activeEmployeePermissions = previewRole ? 'FULL_ACCESS' : employeePermissions;
  const activeRoleName = previewRole ? `${previewRole.charAt(0).toUpperCase()}${previewRole.slice(1)} (Preview)` : roleName;

  return (
    <PermissionContext.Provider value={{ 
      permissions: activePermissions, 
      employeePermissions: activeEmployeePermissions,
      loading: loading || authLoading, 
      isSuperAdmin: activeIsSuperAdmin, 
      roleKey: activeRoleKey,
      roleName: activeRoleName,
      isCustomOverride,
      landingPage,
      hasPermission,
      hasModuleAccess,
      refreshPermissions: fetchPermissions
    }}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissionContext = () => useContext(PermissionContext);
