import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { usePermissionContext } from '../../../context/PermissionContext';
import { getFirstAccessibleRoute, PATH_TO_MODULE } from '../../../utils/permissionUtils';
import AccessDenied from '../common/AccessDenied';
import { Loader2 } from 'lucide-react';
import { useScope } from '../../../context/ScopeContext';

/**
 * Route guard that ensures the user has permission to view the module associated with this route.
 */
const ProtectedRoute = ({ children, customModule = null }) => {
  const { permissions, loading, isSuperAdmin, roleKey, hasModuleAccess } = usePermissionContext();
  const { currentScope, switchScope, allowedScopes, baseFunctionalScope } = useScope();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // --- Scope Guard ---
  // Ensure the user does not manually visit a URL outside their currently selected Scope.
  const segments = location.pathname.split('/').filter(Boolean);
  const pathScope = segments[0]?.toLowerCase();
  const validScopes = ['superadmin', 'admin', 'hr', 'manager', 'employee', 'candidate'];

  if (permissions && validScopes.includes(pathScope) && pathScope !== currentScope) {
    if (allowedScopes && allowedScopes.includes(pathScope)) {
      switchScope(pathScope);
    } else {
      const targetScope = (allowedScopes && allowedScopes.includes(currentScope)) ? currentScope : baseFunctionalScope;
      return <Navigate to={`/${targetScope}/dashboard`} replace />;
    }
  }

  // Determine which module this path requires
  // If customModule is provided, use it. Otherwise try to infer from path.
  let moduleToCheck = customModule;
  if (!moduleToCheck) {
    // Try to match the exact path
    moduleToCheck = PATH_TO_MODULE[location.pathname];
  }
  
  if (!moduleToCheck) {
    // Try to match base path (e.g. /admin/users/123 -> /admin/users)
    const segments = location.pathname.split('/').filter(Boolean);
    if (segments.length >= 2) {
      const basePath = `/${segments[0]}/${segments[1]}`;
      moduleToCheck = PATH_TO_MODULE[basePath];
    }
  }

  // If we couldn't infer the module, allow access (or we could deny by default, but allow is safer for unmapped simple routes)
  if (!moduleToCheck) {
    return <>{children}</>;
  }

  // Check access
  if (hasModuleAccess(moduleToCheck, currentScope)) {
    return <>{children}</>;
  }

  // Access Denied handling:
  
  // If they are on a landing page (like /admin/dashboard) and don't have access,
  // we should try to intelligently redirect them to their first accessible page
  // rather than showing a dead end.
  const isDashboard = location.pathname.endsWith('/dashboard');
  
  if (isDashboard) {
    const firstRoute = getFirstAccessibleRoute(roleKey, permissions, isSuperAdmin);
    if (firstRoute && firstRoute !== location.pathname) {
      return <Navigate to={firstRoute} replace />;
    }
  }

  // Otherwise, render 403 page
  return <AccessDenied />;
};

export default ProtectedRoute;
