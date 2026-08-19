import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../../utils/cn';
import RolePreviewBanner from './RolePreviewBanner';
import Toast from '../admin/Toast';
import ProtectedRoute from './ProtectedRoute';
import AICopilot from './AICopilot';

const AppLayout = () => {
  const { user, loading } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const mainContentRef = React.useRef(null);

  // Scroll only the main content area to top on route change
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo(0, 0);
    }
  }, [location.pathname]);

  if (loading) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
    </div>
  );

  if (!user) return <Navigate to="/login" replace />;



  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300">
      <RolePreviewBanner />
      {/* Toast Notifications */}
      <Toast />

      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      </div>

      {/* Sidebar - Mobile Drawer */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1000] lg:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-white z-[1010] lg:hidden"
            >
              <Sidebar collapsed={false} setCollapsed={() => {}} onItemClick={() => setMobileSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        ref={mainContentRef}
        className={cn(
          "flex-1 flex flex-col transition-all duration-200 h-screen overflow-y-auto",
          sidebarCollapsed ? "lg:ml-20" : "lg:ml-[260px]"
        )}>
        <Navbar toggleMobileSidebar={() => setMobileSidebarOpen(true)} />
        
        <main className="flex-1 p-4 lg:p-8">


          {/* Page Outlet */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <ProtectedRoute>
              <Outlet />
            </ProtectedRoute>
          </motion.div>
        </main>
      </div>
      <AICopilot />
    </div>
  );
};

export default AppLayout;
