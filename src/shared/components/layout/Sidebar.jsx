import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
  Cpu,
  ChevronDown,
  Home,
  Users,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissionContext } from '../../../context/PermissionContext';
import { useScope } from '../../../context/ScopeContext';
import { sidebarConfig } from '../../../data/sidebarConfig';
import { cn } from '../../../utils/cn';

const Sidebar = ({ collapsed, setCollapsed, allRoles, onItemClick }) => {
  const { logout, effectiveRole } = useAuth();
  const { hasModuleAccess, roleName } = usePermissionContext();
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);
  const isExpanded = !collapsed;

  const navContainerRef = useRef(null);
  const activeItemRef = useRef(null);

  const isSuperAdmin = effectiveRole?.toLowerCase() === 'superadmin' || effectiveRole?.toLowerCase() === 'superadmin';

  const { currentScope, switchScope, canSwitchScope, baseFunctionalScope } = useScope();
  const baseItems = sidebarConfig[currentScope] || sidebarConfig.employee || [];

  const [expandedGroups, setExpandedGroups] = useState({
    'Super Admin': true,
    'Admin Modules': false,
    'HR Modules': false,
    'Manager Modules': false,
    'Employee Modules': false,
    'Candidate Modules': false,
    'Additional Modules': true,
  });

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  let roleItems = baseItems;

  // Always filter sidebar items by permissions, except for SuperAdmin.
  // Items with permission='always' always show (for SuperAdmin panels).
  if (!isSuperAdmin) {
    roleItems = baseItems.map(item => {
      if (item.group && item.items) {
        const filteredSubItems = item.items.filter(sub => {
          const permKey = sub.permission;
          if (!permKey || permKey === 'always') return true;
          return hasModuleAccess(permKey, currentScope);
        });
        return { ...item, items: filteredSubItems };
      } else {
        const permKey = item.permission;
        if (!permKey || permKey === 'always') return item;
        return hasModuleAccess(permKey, currentScope) ? item : null;
      }
    }).filter(item => {
      if (!item) return false;
      if (item.group && item.items && item.items.length === 0) return false;
      return true;
    });
  }

  // Auto-expand group of current active path
  useEffect(() => {
    const currentPath = location.pathname;
    let activeGroup = null;
    roleItems.forEach(item => {
      if (item.group && item.items) {
        const hasActiveChild = item.items.some(subItem => {
          return currentPath === subItem.path || currentPath.startsWith(subItem.path + '/');
        });
        if (hasActiveChild) {
          activeGroup = item.group;
        }
      }
    });

    if (activeGroup) {
      setExpandedGroups(prev => ({
        ...prev,
        [activeGroup]: true
      }));
    }
  }, [location.pathname, roleItems]);

  // Preserve sidebar scroll position across route changes and re-renders
  const savedScrollRef = useRef(
    parseInt(sessionStorage.getItem('hcm_sidebar_scroll') || '0', 10)
  );

  // Capture sidebar scroll position on every scroll event
  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;

    if (savedScrollRef.current > 0) {
      container.scrollTop = savedScrollRef.current;
    }

    const handleScroll = () => {
      if (container) {
        savedScrollRef.current = container.scrollTop;
        sessionStorage.setItem('hcm_sidebar_scroll', String(container.scrollTop));
      }
    };
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // After route change or group toggle, ensure active item is naturally visible without extra gap
  useEffect(() => {
    const container = navContainerRef.current;
    if (!container) return;

    const scrollActiveIntoView = () => {
      const activeEl = activeItemRef.current || container.querySelector('.sidebar-item-active');
      if (!activeEl) return;

      const containerRect = container.getBoundingClientRect();
      const activeRect = activeEl.getBoundingClientRect();

      // Only scroll if item is out of view
      const isTooHigh = activeRect.top < containerRect.top;
      const isTooLow = activeRect.bottom > containerRect.bottom;

      if (isTooHigh || isTooLow) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest'
        });
      }
    };

    const timer = setTimeout(scrollActiveIntoView, 100);
    return () => clearTimeout(timer);
  }, [location.pathname, roleItems, expandedGroups]);

  // Compute active item information for Scope Indicator
  const getActiveItemInfo = () => {
    let activeLabel = '';
    let activeGroupLabel = '';

    roleItems.forEach(item => {
      if (item.group && item.items) {
        item.items.forEach(subItem => {
          if (location.pathname === subItem.path || location.pathname.startsWith(subItem.path + '/')) {
            activeLabel = subItem.label;
            activeGroupLabel = item.group;
          }
        });
      } else if (location.pathname === item.path || location.pathname.startsWith(item.path + '/')) {
        activeLabel = item.label;
      }
    });

    return { activeLabel, activeGroupLabel };
  };

  const { activeLabel, activeGroupLabel } = getActiveItemInfo();

  const MenuItem = ({ item }) => {
    const Icon = item.icon;
    const isCurrentActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/'));

    return (
      <NavLink
        to={item.path}
        ref={isCurrentActive ? activeItemRef : null}
        onClick={(e) => {
          if (navContainerRef.current) {
            savedScrollRef.current = navContainerRef.current.scrollTop;
            sessionStorage.setItem('hcm_sidebar_scroll', String(navContainerRef.current.scrollTop));
          }
          if (onItemClick) onItemClick(e);
        }}
        className={({ isActive }) =>
          cn(
            "sidebar-item group relative",
            (isActive || isCurrentActive) && "sidebar-item-active",
            !isExpanded && "justify-center px-2"
          )
        }
      >
        <Icon size={20} className={cn("shrink-0", isExpanded && "mr-1")} />
        {isExpanded && <span className="truncate">{item.label}</span>}

        {!isExpanded && (
          <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
            {item.label}
          </div>
        )}
      </NavLink>
    );
  };

  const GroupTitle = ({ title }) => {
    if (!isExpanded) return <div className="h-px bg-slate-200 dark:bg-slate-800 my-4 mx-2" />;
    return (
      <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
        {title}
      </h3>
    );
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed left-0 top-0 h-screen bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-[60] shadow-sm transition-all duration-200 ease-in-out",
        isExpanded ? "w-[260px]" : "w-20"
      )}
    >
      {/* Logo Section */}
      <div className={cn("p-6 flex items-center gap-3", !isExpanded ? "justify-center" : "justify-start")}>
        <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0 shadow-lg shadow-primary-200">
          <Cpu className="text-white" size={20} />
        </div>
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-bold text-xl tracking-tight text-slate-800 dark:text-white"
          >
            HCM<span className="text-primary-600">.ai</span>
          </motion.span>
        )}
      </div>

      {/* Dynamic Scope & Module Indicator */}
      {isExpanded && (
        <div className="mx-4 my-2 p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-850 rounded-2xl text-left">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 block mb-1">Current Scope</span>

          <div className="flex items-center gap-2 mt-1">
             <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse shrink-0" />
             <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 capitalize truncate">
                {currentScope === baseFunctionalScope ? (roleName || currentScope) : currentScope} Console
             </h4>
          </div>
          {activeLabel && (
            <p className="text-[9px] font-bold text-slate-500 mt-1 truncate">
              {activeGroupLabel && `${activeGroupLabel} • `}{activeLabel}
            </p>
          )}
        </div>
      )}

      {/* Navigation Links */}
      <div ref={navContainerRef} className="flex-1 overflow-y-auto px-3 space-y-1 py-3">
        {roleItems.map((item, index) => {
          if (item.group) {
            const isGroupExpanded = expandedGroups[item.group] ?? true;
            return (
              <div key={index} className="space-y-1">
                <div
                  onClick={() => isExpanded && toggleGroup(item.group)}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer select-none group/title transition-all duration-150 mt-4 first:mt-0",
                    !isExpanded ? "hidden" : "cursor-default hover:bg-transparent"
                  )}
                >
                  <GroupTitle title={item.group} />
                  {isExpanded && (
                    <ChevronDown
                      size={14}
                      className={cn(
                        "text-slate-400 group-hover/title:text-slate-600 dark:group-hover/title:text-slate-300 transition-transform duration-200",
                        isGroupExpanded ? "transform rotate-0" : "transform -rotate-90"
                      )}
                    />
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {(isGroupExpanded || !isExpanded) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="space-y-1 overflow-hidden"
                    >
                      {item.items.map((subItem, idx) => (
                        <MenuItem key={idx} item={subItem} />
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          }
          return <MenuItem key={index} item={item} />;
        })}
      </div>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800">
        <div className={cn(
          "flex items-center gap-3 p-2",
          !isExpanded ? "justify-center" : "justify-start"
        )}>
          {isExpanded && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Signed in as</p>
              <div className="px-2 py-1 rounded-md bg-primary-50 dark:bg-primary-950/30 text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase truncate">
                {effectiveRole}
              </div>
            </div>
          )}
          <button
            onClick={logout}
            className={cn(
              "p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors group relative",
              isExpanded && "flex items-center gap-2 w-fit px-3"
            )}
          >
            <LogOut size={20} />
            {isExpanded && <span className="font-medium">Logout</span>}
            {!isExpanded && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Logout
              </div>
            )}
          </button>
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 shadow-sm transition-colors z-50"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
