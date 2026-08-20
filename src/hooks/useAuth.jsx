// ============================================================
// useAuth.jsx - Real JWT Authentication Hook
// ============================================================
// PEHLE: Mock login - localStorage mein fake user save karta tha
// AB:    Real login - Backend API call karta hai, JWT token save karta hai

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../utils/apiService';

const AuthContext = createContext();

// Role → Dashboard URL mapping
const ROLE_ROUTES = {
  SUPERADMIN: '/superadmin/dashboard',
  ADMIN: '/admin/dashboard',
  HR: '/hr/dashboard',
  MANAGER: '/manager/dashboard',
  EMPLOYEE: '/employee/dashboard',
  CANDIDATE: '/candidate/dashboard',
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [previewRole, setPreviewRole] = useState(null);
  const navigate = useNavigate();

  // ── Token refresh - /auth/me se fresh data lo ──
  const refreshUser = async () => {
    try {
      const response = await authAPI.getMe();
      const freshUser = response.data.data;
      setUser(prev => ({ ...prev, ...freshUser }));
      sessionStorage.setItem('hcm_user', JSON.stringify({ ...user, ...freshUser }));
    } catch (err) {
      // Token invalid hai - logout this tab
      logout();
    }
  };

  // ── App load hone par check karo ki is tab mein session saved hai ya nahi ──
  useEffect(() => {
    // Each tab maintains its independent session in sessionStorage
    const token = sessionStorage.getItem('hcm_token');
    const savedUser = sessionStorage.getItem('hcm_user');

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        refreshUser();
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }

    const storedPreview = sessionStorage.getItem('hcm_preview_role');
    if (storedPreview) setPreviewRole(storedPreview);

    setLoading(false);
  }, []);

  // ── REAL LOGIN: Backend API call ──
  const login = async (email, password) => {
    try {
      setAuthError(null);

      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data.data;

      // Clear stale session data for this tab
      sessionStorage.removeItem('hcm_preview_role');
      sessionStorage.removeItem('hcm_current_scope');
      sessionStorage.removeItem('logout_reason');

      // Save to this tab's sessionStorage and localStorage for seamless sync
      sessionStorage.setItem('hcm_token', token);
      sessionStorage.setItem('hcm_user', JSON.stringify(userData));
      localStorage.setItem('hcm_token', token);
      localStorage.setItem('hcm_user', JSON.stringify(userData));
      setUser(userData);

      // Role ke hisaab se navigate karo
      const route = userData.landingPage || ROLE_ROUTES[userData.role] || '/employee/dashboard';
      navigate(route);

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || err.response?.data?.message || 'Login failed. Please try again.';
      setAuthError(message);
      return { success: false, message };
    }
  };

  // ── LOGOUT ──
  const logout = (reason = null) => {
    setUser(null);
    setPreviewRole(null);
    // Clear this tab's session and localStorage
    sessionStorage.removeItem('hcm_token');
    sessionStorage.removeItem('hcm_user');
    sessionStorage.removeItem('hcm_preview_role');
    sessionStorage.removeItem('hcm_current_scope');
    localStorage.removeItem('hcm_token');
    localStorage.removeItem('hcm_user');
    sessionStorage.setItem('logged_out', 'true');
    if (reason) {
      sessionStorage.setItem('logout_reason', reason);
      navigate(`/login?reason=${reason}`);
    } else {
      sessionStorage.removeItem('logout_reason');
      navigate('/login');
    }
  };

  // ── PREVIEW MODE (SuperAdmin kisi aur role ka dashboard preview kare) ──
  const enterPreview = (role) => {
    setPreviewRole(role);
    sessionStorage.setItem('hcm_preview_role', role);
    navigate(ROLE_ROUTES[role.toUpperCase()] || '/employee/dashboard');
  };

  const exitPreview = () => {
    setPreviewRole(null);
    sessionStorage.removeItem('hcm_preview_role');
    const route = user?.role ? ROLE_ROUTES[user.role] : '/login';
    navigate(route || '/login');
  };

  const effectiveRole = previewRole?.toUpperCase() || user?.role;

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      authError,
      setAuthError,
      previewRole,
      effectiveRole,
      login,
      logout,
      enterPreview,
      exitPreview,
      refreshUser,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
