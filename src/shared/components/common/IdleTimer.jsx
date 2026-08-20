import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

/**
 * Converts human readable timeout string to milliseconds.
 */
const parseTimeoutToMs = (timeoutStr) => {
  if (!timeoutStr) return 15 * 60 * 1000; // default 15 min

  const str = String(timeoutStr).toLowerCase().trim();
  if (str.includes('1 min') || str === '1' || str === '1m') return 60 * 1000; // 1 min (demo / test only)
  if (str.includes('5 min') || str === '5') return 5 * 60 * 1000;
  if (str.includes('15 min') || str === '15') return 15 * 60 * 1000;
  if (str.includes('30 min') || str === '30') return 30 * 60 * 1000;
  if (str.includes('1 hour') || str.includes('60 min') || str === '60') return 60 * 60 * 1000;
  if (str.includes('2 hour') || str.includes('120 min') || str === '120') return 120 * 60 * 1000;

  const num = parseInt(timeoutStr, 10);
  if (!isNaN(num) && num > 0) return num * 60 * 1000;

  return 15 * 60 * 1000;
};

const getWarningDurationMs = (timeoutMs) => {
  if (timeoutMs <= 60 * 1000) return 20 * 1000; // 20s warning for 1m timeout
  if (timeoutMs <= 5 * 60 * 1000) return 45 * 1000; // 45s warning for 5m timeout
  return 60 * 1000; // 60s warning for 15m and longer timeouts
};

const IdleTimer = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [totalTimeoutMs, setTotalTimeoutMs] = useState(15 * 60 * 1000);

  const lastActivityRef = useRef(Date.now());
  const timerIntervalRef = useRef(null);
  const isLoggingOutRef = useRef(false);

  // Read configured timeout duration from settings / localStorage (Default: 15 Minutes)
  const getSessionTimeoutMs = useCallback(() => {
    try {
      const explicit = localStorage.getItem('hcm_session_timeout');
      if (explicit) return parseTimeoutToMs(explicit);

      const savedSettings = localStorage.getItem('hcm_admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed?.security?.sessionTimeout) {
          return parseTimeoutToMs(parsed.security.sessionTimeout);
        }
      }
    } catch (e) {
      console.warn('Error reading session timeout:', e);
    }
    // Strict 15 Minutes Default
    return 15 * 60 * 1000;
  }, []);

  const resetActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      sessionStorage.setItem('hcm_tab_last_activity', String(now));
    } catch (e) {}
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

  // Listen for global timeout setting changes across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'hcm_session_timeout' && e.newValue) {
        setTotalTimeoutMs(parseTimeoutToMs(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Track user activity in THIS tab
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    let throttleTimer = null;
    const handleUserInteraction = () => {
      if (showWarning) return; // Don't auto-reset without clicking if warning is visible

      const now = Date.now();
      if (!throttleTimer || now - lastActivityRef.current > 2000) {
        lastActivityRef.current = now;
        try {
          sessionStorage.setItem('hcm_tab_last_activity', String(now));
        } catch (e) {}
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
        }, 1000);
      }
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach(evt => {
      window.addEventListener(evt, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(evt => {
        window.removeEventListener(evt, handleUserInteraction);
      });
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [isAuthenticated, user, showWarning]);

  // Main timer loop (per-tab)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (showWarning) setShowWarning(false);
      return;
    }

    const currentTimeoutMs = getSessionTimeoutMs();
    setTotalTimeoutMs(currentTimeoutMs);
    const warningDurationMs = getWarningDurationMs(currentTimeoutMs);

    // Initialize activity timestamp for this tab
    const now = Date.now();
    lastActivityRef.current = now;
    try {
      sessionStorage.setItem('hcm_tab_last_activity', String(now));
    } catch (e) {}
    isLoggingOutRef.current = false;

    timerIntervalRef.current = setInterval(() => {
      if (isLoggingOutRef.current) return;

      const dynamicTimeoutMs = getSessionTimeoutMs();
      const dynamicWarningMs = getWarningDurationMs(dynamicTimeoutMs);
      const currentTime = Date.now();

      const lastActive = lastActivityRef.current;
      const idleDuration = currentTime - lastActive;
      const timeRemainingMs = dynamicTimeoutMs - idleDuration;

      if (timeRemainingMs <= 0) {
        // Timeout expired: perform auto-logout for this tab
        isLoggingOutRef.current = true;
        clearInterval(timerIntervalRef.current);
        setShowWarning(false);
        logout('idle');
      } else if (timeRemainingMs <= dynamicWarningMs) {
        // Warning threshold reached
        setShowWarning(true);
        setSecondsRemaining(Math.max(1, Math.ceil(timeRemainingMs / 1000)));
      } else {
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isAuthenticated, user, getSessionTimeoutMs, logout]);

  if (!isAuthenticated || !user || !showWarning) {
    return null;
  }

  const warningMs = getWarningDurationMs(totalTimeoutMs);
  const totalWarningSeconds = Math.max(10, Math.ceil(warningMs / 1000));
  const progressPercent = Math.min(100, Math.max(0, (secondsRemaining / totalWarningSeconds) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          onClick={resetActivity}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-200/50 dark:border-amber-900/40 p-6 md:p-8 overflow-hidden z-10"
        >
          {/* Top glowing ambient gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-amber-400 animate-pulse" />

          <div className="flex flex-col items-center text-center space-y-4">
            {/* Pulsing Icon Badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-inner">
                <Clock size={32} className="animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] font-bold text-white items-center justify-center">!</span>
              </span>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Session Inactivity Warning
              </h3>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                You've been inactive for a while. For data security, your session will automatically terminate in:
              </p>
            </div>

            {/* Big Countdown Timer */}
            <div className="w-full bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-wider">
                {secondsRemaining}s
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                  transition={{ ease: 'linear', duration: 1 }}
                />
              </div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Automatic Sign-out Imminent
              </p>
            </div>

            {/* Action Buttons */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={resetActivity}
                className="w-full py-3 px-4 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-700 hover:to-indigo-700 text-white rounded-xl font-black text-xs shadow-lg shadow-primary-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <RefreshCw size={14} className="animate-spin-slow" />
                <span>I'm Still Here</span>
              </button>

              <button
                type="button"
                onClick={() => logout('manual')}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl font-bold text-xs border border-slate-200 dark:border-slate-700 hover:border-rose-200 transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={14} />
                <span>Log Out Now</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IdleTimer;
