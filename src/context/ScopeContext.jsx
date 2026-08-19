import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePermissionContext } from './PermissionContext';

const ScopeContext = createContext();

const ROLE_ALLOWED_SCOPES = {
  superadmin: ['superadmin', 'admin', 'hr', 'manager', 'employee', 'candidate'],
  admin: ['admin', 'employee'],
  hr: ['hr', 'employee'],
  manager: ['manager', 'employee'],
  employee: ['employee'],
  candidate: ['candidate'],
};

export const ScopeProvider = ({ children }) => {
  const { isAuthenticated, effectiveRole } = useAuth();
  const { roleKey, isSuperAdmin, loading: permLoading } = usePermissionContext();
  
  const [currentScope, setCurrentScope] = useState(null);
  
  // Resolve base functional scope from permission or auth
  const resolvedRoleKey = isSuperAdmin ? 'superadmin' : (roleKey || effectiveRole?.toLowerCase() || 'employee');
  
  const allowedScopes = useMemo(() => {
    return ROLE_ALLOWED_SCOPES[resolvedRoleKey] || [resolvedRoleKey];
  }, [resolvedRoleKey]);

  useEffect(() => {
    if (!isAuthenticated || permLoading) return;
    
    // Check if session has saved scope
    const savedScope = sessionStorage.getItem('hcm_current_scope');
    
    // If we have a saved scope and it is allowed for current role, use it; otherwise default to functional scope
    if (savedScope && allowedScopes.includes(savedScope)) {
      setCurrentScope(savedScope);
    } else {
      setCurrentScope(resolvedRoleKey);
      sessionStorage.setItem('hcm_current_scope', resolvedRoleKey);
    }
  }, [isAuthenticated, permLoading, resolvedRoleKey, allowedScopes]);
  
  const switchScope = (newScope) => {
    if (allowedScopes.includes(newScope)) {
      setCurrentScope(newScope);
      sessionStorage.setItem('hcm_current_scope', newScope);
    }
  };
  
  const canSwitchScope = allowedScopes.length > 1;

  const activeScope = (currentScope && allowedScopes.includes(currentScope)) 
    ? currentScope 
    : resolvedRoleKey;

  return (
    <ScopeContext.Provider value={{ 
      currentScope: activeScope, 
      switchScope,
      baseFunctionalScope: resolvedRoleKey,
      canSwitchScope,
      allowedScopes
    }}>
      {children}
    </ScopeContext.Provider>
  );
};

export const useScope = () => useContext(ScopeContext);
