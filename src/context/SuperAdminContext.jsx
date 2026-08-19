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
        name: u.employeeProfile?.fullName || u.email.split('@')[0] || 'System User',
        department: u.organization?.name || 'Platform Level',
        status: u.isActive ? 'active' : 'suspended',
        profileId: u.employeeProfile?.id,
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

  useEffect(() => {
    fetchPlatformStats();
    fetchOrganizations();
    fetchUsers();
    fetchAuditLogs();
    fetchDepartments();
    fetchRoles();
  }, [fetchPlatformStats, fetchOrganizations, fetchUsers, fetchAuditLogs, fetchDepartments, fetchRoles]);

  // ── ACTIONS ──

  const createOrganization = async (data) => {
    try {
      await superAdminAPI.createOrganization(data);
      await fetchOrganizations();
      showToast('Organization created!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed', 'error');
    }
  };

  const deleteOrganization = async (id) => {
    try {
      await superAdminAPI.deleteOrganization(id);
      await fetchOrganizations();
      showToast('Organization deleted!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed', 'error');
    }
  };

  const createAdminForOrg = async (orgId, data) => {
    try {
      await superAdminAPI.createAdminForOrg(orgId, data);
      await fetchUsers();
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
      await fetchUsers();
      showToast('User status updated!');
    } catch {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
      showToast('Status updated (demo)');
    }
  };

  const changeUserRole = async (id, role) => {
    try {
      await superAdminAPI.changeAnyUserRole(id, { role });
      await fetchUsers();
      showToast('Role updated!');
    } catch {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
      showToast('Role updated (demo)');
    }
  };

  const addRole = async (role) => {
    try {
      await adminAPI.createRole(role);
      await fetchRoles();
      showToast('Role created successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to create role', 'error');
    }
  };

  const updateRole = async (id, updates) => {
    try {
      await adminAPI.updateRole(id, updates);
      await fetchRoles();
      showToast('Role updated successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update role', 'error');
    }
  };

  const deleteRole = async (id) => {
    try {
      await adminAPI.deleteRole(id);
      await fetchRoles();
      showToast('Role deleted successfully!');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to delete role', 'error');
    }
  };

  const addDept = async (dept) => {
    try {
      await superAdminAPI.createPlatformDepartment(dept);
      await fetchDepartments();
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
      await fetchDepartments();
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
      await fetchDepartments();
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
      await fetchUsers();
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
      await fetchUsers();
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
      await fetchUsers();
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
    users, addUser, updateUser, deleteUser, toggleUserActive, changeUserRole,
    organizations, createOrganization, deleteOrganization, createAdminForOrg,
    departments, addDept, updateDept, deleteDept,
    roles, addRole, updateRole, deleteRole,
    activityLogs, fetchUserAuditLogs,
    platformStats,
    loading,
    showToast,
    refetch: { fetchPlatformStats, fetchOrganizations, fetchUsers, fetchAuditLogs, fetchDepartments },
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
