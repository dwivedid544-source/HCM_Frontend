// ============================================================
// SuperAdminContext.jsx - Real API Integration
// ============================================================
// @refresh reset
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { PayrollProvider } from '../features/payroll/PayrollContext';
import { BenefitsProvider } from '../features/benefits/BenefitsContext';
import { AttendanceProvider } from '../features/attendance/AttendanceContext';
import { superAdminAPI, adminAPI } from '../utils/apiService';

const SuperAdminContext = createContext();

export const SuperAdminProvider = ({ children }) => {
  const [users, setUsers]               = useState([]);
  const [organizations, setOrganizations] = useState([]);
  const [departments, setDepartments]   = useState([]);
  const [roles, setRoles]               = useState([]);
  const [roleHistory, setRoleHistory]   = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [platformStats, setPlatformStats] = useState(null);
  const [loading, setLoading]           = useState(false);

  const showToast = (msg, type = 'success') =>
    window.dispatchEvent(new CustomEvent('app_toast', { detail: { message: msg, type } }));

  // ── FETCH ──
  const fetchPlatformStats = useCallback(async () => {
    try {
      const res = await superAdminAPI.getPlatformStats();
      setPlatformStats(res.data.data);
    } catch (err) { 
      console.error(err);
    }
  }, []);

  const fetchOrganizations = useCallback(async () => {
    try {
      const res = await superAdminAPI.getAllOrganizations();
      setOrganizations(res.data.data);
    } catch (err) { 
      console.error(err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await superAdminAPI.getAllPlatformUsers();
      const mapped = (res.data.data || []).map(u => ({
        ...u,
        name: u.employeeProfile?.fullName || u.candidateProfile?.fullName || u.email.split('@')[0] || 'System User',
        department: u.organization?.name || (u.role === 'CANDIDATE' ? 'Candidate Network' : 'Platform Level'),
        status: u.isActive ? 'active' : 'suspended',
        profileId: u.employeeProfile?.id || u.candidateProfile?.id,
        baseSalary: u.employeeProfile?.compensationProfile?.baseSalary || 0,
        monthlyCTC: u.employeeProfile?.compensationProfile?.monthlyCTC || 0
      }));
      setUsers(mapped);
    } catch (err) {
      console.error(err);
      setUsers([]);
      showToast('Failed to load users from server', 'error');
    }
  }, []);

  const fetchAuditLogs = useCallback(async () => {
    try {
      const res = await superAdminAPI.getPlatformAuditLogs();
      setActivityLogs(res.data.data || []);
    } catch (err) {
      console.error(err);
      setActivityLogs([]);
      showToast('Failed to load audit logs', 'error');
    }
  }, []);

  const fetchRoleHistory = useCallback(async () => {
    try {
      const res = await adminAPI.getRoleHistory();
      setRoleHistory(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load role history:', err);
      setRoleHistory([]);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await superAdminAPI.getAllPlatformDepartments();
      setDepartments(res.data.data);
    } catch (err) {
      setDepartments([]);
    }
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await adminAPI.getRoles();
      setRoles(res.data.data || []);
    } catch (err) {
      console.error(err);
      setRoles([]);
      showToast('Failed to load roles', 'error');
    }
  }, []);

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchPlatformStats(),
      fetchOrganizations(),
      fetchUsers(),
      fetchAuditLogs(),
      fetchDepartments(),
      fetchRoles(),
      fetchRoleHistory()
    ]);
  }, [fetchPlatformStats, fetchOrganizations, fetchUsers, fetchAuditLogs, fetchDepartments, fetchRoles, fetchRoleHistory]);

  useEffect(() => {
    refreshAll();

    // Auto-refresh when tab gains focus or becomes visible
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    };

    const handleDataUpdate = () => {
      refreshAll();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('permissions_updated', handleDataUpdate);
    window.addEventListener('department_updated', handleDataUpdate);
    window.addEventListener('user_updated', handleDataUpdate);

    // 15-second gentle polling interval while tab is active
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        refreshAll();
      }
    }, 15000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('permissions_updated', handleDataUpdate);
      window.removeEventListener('department_updated', handleDataUpdate);
      window.removeEventListener('user_updated', handleDataUpdate);
      clearInterval(interval);
    };
  }, [refreshAll]);

  // ── ACTIONS ──

  const createOrganization = async (data) => {
    try {
      await superAdminAPI.createOrganization(data);
      await Promise.all([fetchOrganizations(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('data_updated'));
      showToast('Organization created!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed', 'error');
    }
  };

  const deleteOrganization = async (id) => {
    try {
      await superAdminAPI.deleteOrganization(id);
      await Promise.all([fetchOrganizations(), fetchDepartments(), fetchUsers(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('data_updated'));
      showToast('Organization deleted!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed', 'error');
    }
  };

  const createAdminForOrg = async (orgId, data) => {
    try {
      await superAdminAPI.createAdminForOrg(orgId, data);
      await Promise.all([fetchUsers(), fetchOrganizations(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('user_updated'));
      showToast('Admin created and linked!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const toggleUserActive = async (id) => {
    try {
      await superAdminAPI.toggleAnyUserActive(id);
      await Promise.all([fetchUsers(), fetchDepartments(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('user_updated'));
      showToast('User status updated!');
    } catch {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
      showToast('Status updated (demo)');
    }
  };

  const changeUserRole = async (id, roleData) => {
    try {
      const payload = typeof roleData === 'string' ? { role: roleData } : roleData;
      await superAdminAPI.changeAnyUserRole(id, payload);
      await Promise.all([fetchUsers(), fetchDepartments(), fetchRoles(), fetchRoleHistory(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('permissions_updated'));
      showToast('Role updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update role', 'error');
    }
  };

  const revokeUserRole = async (id) => {
    try {
      const res = await superAdminAPI.revokeAnyUserRole(id);
      await Promise.all([fetchUsers(), fetchDepartments(), fetchRoles(), fetchRoleHistory(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('permissions_updated'));
      showToast(res.data?.message || 'Role revoked successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to revoke role', 'error');
    }
  };

  const addRole = async (role) => {
    try {
      await adminAPI.createRole(role);
      await Promise.all([fetchRoles(), fetchRoleHistory()]);
      window.dispatchEvent(new CustomEvent('permissions_updated'));
      showToast('Role created successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to create role', 'error');
    }
  };

  const updateRole = async (id, updates) => {
    try {
      await adminAPI.updateRole(id, updates);
      await Promise.all([fetchRoles(), fetchUsers(), fetchRoleHistory()]);
      window.dispatchEvent(new CustomEvent('permissions_updated'));
      showToast('Role updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update role', 'error');
    }
  };

  const deleteRole = async (id) => {
    try {
      await adminAPI.deleteRole(id);
      await Promise.all([fetchRoles(), fetchRoleHistory()]);
      window.dispatchEvent(new CustomEvent('permissions_updated'));
      showToast('Role deleted successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete role', 'error');
    }
  };

  const addDept = async (dept) => {
    try {
      await superAdminAPI.createPlatformDepartment(dept);
      await Promise.all([fetchDepartments(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('department_updated'));
      showToast('Department created successfully!');
      return true;
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to create department', 'error');
      return false;
    }
  };

  const updateDept = async (id, updates) => {
    try {
      await superAdminAPI.updatePlatformDepartment(id, updates);
      await Promise.all([fetchDepartments(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('department_updated'));
      showToast('Department updated successfully!');
      return true;
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update department', 'error');
      return false;
    }
  };

  const deleteDept = async (id) => {
    try {
      await superAdminAPI.deletePlatformDepartment(id);
      await Promise.all([fetchDepartments(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('department_updated'));
      showToast('Department deleted successfully!');
      return true;
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete department', 'error');
      return false;
    }
  };

  const addUser = async (user) => {
    try {
      await superAdminAPI.createUser(user);
      await Promise.all([fetchUsers(), fetchDepartments(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('user_updated'));
      showToast('User created successfully!');
      return true;
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to create user', 'error');
      return false;
    }
  };

  const updateUser = async (id, updates) => {
    try {
      await superAdminAPI.updateUser(id, updates);
      await Promise.all([fetchUsers(), fetchDepartments(), fetchPlatformStats()]);
      window.dispatchEvent(new CustomEvent('user_updated'));
      showToast('User updated successfully!');
      return true;
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update user', 'error');
      return false;
    }
  };

  const deleteUser = async (id) => {
    try {
      await superAdminAPI.deleteUser(id);
      await Promise.all([
        fetchUsers(),
        fetchDepartments(),
        fetchPlatformStats(),
        fetchRoleHistory(),
        fetchAuditLogs()
      ]);
      window.dispatchEvent(new CustomEvent('user_updated'));
      window.dispatchEvent(new CustomEvent('department_updated'));
      window.dispatchEvent(new CustomEvent('permissions_updated'));
      showToast('User deleted successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete user', 'error');
    }
  };

  const fetchUserAuditLogs = async (userId) => {
    try {
      const res = await superAdminAPI.getPlatformAuditLogs({ userId });
      return res.data.data || [];
    } catch (err) {
      console.error("Failed to fetch user audit logs:", err);
      return [];
    }
  };

  const value = {
    users, addUser, updateUser, deleteUser, toggleUserActive, changeUserRole, revokeUserRole,
    organizations, createOrganization, deleteOrganization, createAdminForOrg,
    departments, addDept, updateDept, deleteDept,
    roles, addRole, updateRole, deleteRole,
    roleHistory, fetchRoleHistory,
    activityLogs, fetchUserAuditLogs,
    platformStats,
    loading,
    showToast,
    refreshAll,
    refetch: { fetchPlatformStats, fetchOrganizations, fetchUsers, fetchAuditLogs, fetchDepartments, fetchRoles, fetchRoleHistory, refreshAll },
  };

  return (
    <SuperAdminContext.Provider value={value}>
      <PayrollProvider>
        <BenefitsProvider>
          <AttendanceProvider>
            {children}
          </AttendanceProvider>
        </BenefitsProvider>
      </PayrollProvider>
    </SuperAdminContext.Provider>
  );
};

export const useSuperAdmin = () => useContext(SuperAdminContext);
