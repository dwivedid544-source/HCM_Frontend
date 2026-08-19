// ============================================================
// permissionUtils.js — Pure Permission Utility Functions
// No React dependency. Safe to import anywhere.
// ============================================================

// ── Role → CustomRole name mapping (mirrors backend roleSeeder.js) ──
export const ROLE_TO_CUSTOM_ROLE_NAME = {
  ADMIN:     'Admin',
  HR:        'HR Manager',
  MANAGER:   'Manager',
  EMPLOYEE:  'Employee',
  CANDIDATE: 'Candidate',
};

// ── Ordered accessible routes per role (used for smart post-login redirect) ──
export const ROLE_ORDERED_ROUTES = {
  superadmin: [
    { module: null, path: '/superadmin/dashboard' }, // SuperAdmin always goes here
  ],
  admin: [
    { module: 'dashboard',        path: '/admin/dashboard'   },
    { module: 'users',            path: '/admin/users'       },
    { module: 'departments',      path: '/admin/departments' },
    { module: 'payroll_center',   path: '/admin/payroll'     },
    { module: 'roles_permissions',path: '/admin/roles'       },
    { module: 'holidays',         path: '/admin/holidays'    },
    { module: 'benefits_config',  path: '/admin/benefits'    },
    { module: 'compliance',       path: '/admin/compliance'  },
    { module: 'integrations',     path: '/admin/integrations'},
    { module: 'billing',          path: '/admin/billing'     },
    { module: 'shift_management', path: '/admin/shifts'      },
    { module: 'overtime_rules',   path: '/admin/overtime'    },
    { module: 'resignations',     path: '/admin/resignations'},
    { module: 'reimbursements',   path: '/admin/reimbursements'},
    { module: 'approval_workflows',path: '/admin/workflows'  },
    { module: 'audit_logs',       path: '/admin/audit'       },
    { module: 'reports',          path: '/admin/reports'     },
    { module: 'settings',         path: '/admin/settings'    },
    { module: 'org_setup',        path: '/admin/org'         },
  ],
  hr: [
    { module: 'dashboard',              path: '/hr/dashboard'  },
    { module: 'candidates',             path: '/hr/candidates' },
    { module: 'job_posts',              path: '/hr/jobs'       },
    { module: 'interviews',             path: '/hr/interviews' },
    { module: 'hiring_pipeline',        path: '/hr/pipeline'   },
    { module: 'offer_management',       path: '/hr/offers'     },
    { module: 'onboarding',             path: '/hr/onboarding' },
    { module: 'offboarding_resignations', path: '/hr/offboarding' },
    { module: 'payroll_operations',     path: '/hr/payroll'    },
    { module: 'approvals',              path: '/hr/approvals'  },
    { module: 'reports',                path: '/hr/reports'    },
    { module: 'messages',               path: '/hr/messages'   },
  ],
  manager: [
    { module: 'dashboard',          path: '/manager/dashboard'  },
    { module: 'team_members',       path: '/manager/team'       },
    { module: 'attendance_review',  path: '/manager/attendance' },
    { module: 'leave_approval',     path: '/manager/approvals'  },
    { module: 'kpi_tracking',       path: '/manager/kpi'        },
    { module: 'tasks',              path: '/manager/tasks'      },
    { module: 'reviews',            path: '/manager/reviews'    },
    { module: 'team_resignations',  path: '/manager/resignations'},
    { module: 'reimbursements',     path: '/manager/reimbursements'},
    { module: 'reports',            path: '/manager/reports'    },
  ],
  employee: [
    { module: 'dashboard',    path: '/employee/dashboard'    },
    { module: 'profile',      path: '/employee/profile'      },
    { module: 'attendance',   path: '/employee/attendance'   },
    { module: 'leave',        path: '/employee/leave'        },
    { module: 'payroll',      path: '/employee/payroll'      },
    { module: 'benefits',     path: '/employee/benefits'     },
    { module: 'documents',    path: '/employee/documents'    },
    { module: 'performance',  path: '/employee/performance'  },
    { module: 'help_desk',    path: '/employee/help'         },
    { module: 'compliance',   path: '/employee/compliance'   },
    { module: 'resignation',  path: '/employee/resignation'  },
  ],
  candidate: [
    { module: 'dashboard',          path: '/candidate/dashboard'     },
    { module: 'browse_jobs',        path: '/candidate/jobs'          },
    { module: 'my_applications',    path: '/candidate/applications'  },
    { module: 'resume_builder',     path: '/candidate/resume'        },
    { module: 'ai_score',           path: '/candidate/ai-score'      },
    { module: 'interview_schedule', path: '/candidate/interviews'    },
    { module: 'notifications',      path: '/candidate/notifications' },
    { module: 'offers',             path: '/candidate/offers'        },
  ],
};

// ── Maps a URL path prefix → permission module ID ──
export const PATH_TO_MODULE = {
  // Admin
  '/admin/dashboard':    'dashboard',
  '/admin/org':          'org_setup',
  '/admin/departments':  'departments',
  '/admin/users':        'users',
  '/admin/roles':        'roles_permissions',
  '/admin/payroll':      'payroll_center',
  '/admin/payroll-config': 'payroll_center',
  '/admin/holidays':     'holidays',
  '/admin/benefits':     'benefits_config',
  '/admin/compliance':   'compliance',
  '/admin/integrations': 'integrations',
  '/admin/billing':      'billing',
  '/admin/shifts':       'shift_management',
  '/admin/overtime':     'overtime_rules',
  '/admin/resignations': 'resignations',
  '/admin/reimbursements':'reimbursements',
  '/admin/workflows':    'approval_workflows',
  '/admin/audit':        'audit_logs',
  '/admin/reports':      'reports',
  '/admin/settings':     'settings',
  // HR
  '/hr/dashboard':  'dashboard',
  '/hr/jobs':       'job_posts',
  '/hr/candidates': 'candidates',
  '/hr/interviews': 'interviews',
  '/hr/pipeline':   'hiring_pipeline',
  '/hr/offers':     'offer_management',
  '/hr/onboarding': 'onboarding',
  '/hr/offboarding':'offboarding_resignations',
  '/hr/payroll':    'payroll_operations',
  '/hr/approvals':  'approvals',
  '/hr/reports':    'reports',
  '/hr/messages':   'messages',
  // Manager
  '/manager/dashboard':     'dashboard',
  '/manager/team':          'team_members',
  '/manager/attendance':    'attendance_review',
  '/manager/approvals':     'leave_approval',
  '/manager/kpi':           'kpi_tracking',
  '/manager/tasks':         'tasks',
  '/manager/reviews':       'reviews',
  '/manager/resignations':  'team_resignations',
  '/manager/reimbursements':'reimbursements',
  '/manager/reports':       'reports',
  '/manager/profile':       'profile',
  '/manager/settings':      'settings',
  // Employee
  '/employee/dashboard':   'dashboard',
  '/employee/profile':     'profile',
  '/employee/attendance':  'attendance',
  '/employee/leave':       'leave',
  '/employee/payroll':     'payroll',
  '/employee/benefits':    'benefits',
  '/employee/documents':   'documents',
  '/employee/performance': 'performance',
  '/employee/help':        'help_desk',
  '/employee/compliance':  'compliance',
  '/employee/resignation': 'resignation',
  // Candidate
  '/candidate/dashboard':    'dashboard',
  '/candidate/jobs':         'browse_jobs',
  '/candidate/applications': 'my_applications',
  '/candidate/resume':       'resume_builder',
  '/candidate/ai-score':     'ai_score',
  '/candidate/interviews':   'interview_schedule',
  '/candidate/notifications':'notifications',
  '/candidate/offers':       'offers',
};

/**
 * Check if a specific action is permitted for a module.
 * @param {object|string} permissions - The role's permissions object, or 'FULL_ACCESS'
 * @param {string} module - Module ID (e.g. 'users', 'payroll_center')
 * @param {string} action - Action (e.g. 'view', 'create', 'edit', 'delete')
 * @returns {boolean}
 */
export const isPermitted = (permissions, module, action = 'view') => {
  if (!module) return true; // no module constraint = open
  if (['dashboard', 'profile', 'settings'].includes(module)) return true; // core landing screens always permitted
  if (!permissions) return false;
  if (permissions === 'FULL_ACCESS') return true;
  const modulePerms = permissions[module];
  if (!Array.isArray(modulePerms) || modulePerms.length === 0) return false;
  if (action === 'view') return true; // any non-empty array grants view
  return modulePerms.includes(action);
};

/**
 * Get the first accessible path for a given role and permissions.
 * Used for intelligent post-login redirect.
 * @param {string} roleKey - lowercase role key ('admin', 'hr', 'manager', etc.)
 * @param {object|string} permissions
 * @param {boolean} isSuperAdmin
 * @returns {string|null} - path to redirect to
 */
export const getFirstAccessibleRoute = (roleKey, permissions, isSuperAdmin = false) => {
  if (isSuperAdmin) return '/superadmin/dashboard';
  const routes = ROLE_ORDERED_ROUTES[roleKey] || [];
  if (!routes.length) return null;
  // If FULL_ACCESS, return the first route
  if (permissions === 'FULL_ACCESS') return routes[0]?.path || null;
  const accessible = routes.find(r => isPermitted(permissions, r.module, 'view'));
  return accessible?.path || null;
};
