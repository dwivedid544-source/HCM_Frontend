// ============================================================
// EmployeeContext.jsx - Real API Integration
// ============================================================
// PEHLE: localStorage se mock data
// AB:    Backend API calls with real data
// Note:  Mock data fallback rakha hai jab tak backend pe user create na ho

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  employeeAPI,
} from '../utils/apiService';
import { useDateFormat } from '../hooks/useDateFormat';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
  const { formatDate } = useDateFormat();
  // ── State ──
  const [profile, setProfile] = useState(null);
  const [attendance, setAttendance] = useState({ isClockedIn: false, clockInTime: null, history: [] });
  const [leaves, setLeaves] = useState({ balance: { sick: 0, annual: 0, casual: 0, unpaid: 0 }, requests: [] });
  const [payroll, setPayroll] = useState({ history: [] });
  const [benefits, setBenefits] = useState({ claims: [], insurance: { provider: 'Global Health Inc.' }, dependents: [] });
  const [performance, setPerformance] = useState({ goals: [], skills: [], reviews: [] });
  const [tickets, setTickets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Toast helper ──
  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('app_toast', { detail: { message, type } }));
  };

  // ── FETCH PROFILE ──
  const fetchProfile = useCallback(async () => {
    try {
      const res = await employeeAPI.getProfile();
      if (res.data?.success && res.data.data) {
        const p = res.data.data;
        const localOverrides = JSON.parse(localStorage.getItem('hcm_employee_profile_overrides') || '{}');
        const mergedData = { ...p, ...localOverrides };
        const mapped = {
          ...mergedData,
          fullName: mergedData.fullName || '',
          department: mergedData.department?.name || mergedData.department || '',
          role: mergedData.user?.role || mergedData.role || '',
          email: mergedData.user?.email || mergedData.email || '',
          address: mergedData.address || 'Not Provided',
          avatar: mergedData.avatarUrl || mergedData.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(mergedData.fullName || 'Employee')}&background=4f46e5&color=fff`,
          dob: mergedData.dob ? formatDate(mergedData.dob) : '',
          bloodGroup: mergedData.bloodGroup || '',
          gender: mergedData.gender || '',
          phone: mergedData.phone || '',
          emergencyName: mergedData.emergencyName || mergedData.emergencyContact?.name || '',
          emergencyPhone: mergedData.emergencyPhone || mergedData.emergencyContact?.phone || '',
          emergencyRelation: mergedData.emergencyRelation || mergedData.emergencyContact?.relation || '',
          emergencyContact: {
            name: mergedData.emergencyName || mergedData.emergencyContact?.name || '',
            relation: mergedData.emergencyRelation || mergedData.emergencyContact?.relation || '',
            phone: mergedData.emergencyPhone || mergedData.emergencyContact?.phone || ''
          },
          shift: mergedData.shift || null,
          baseSalary: mergedData.compensationProfile?.baseSalary || mergedData.baseSalary || 0,
          monthlyCTC: mergedData.compensationProfile?.monthlyCTC || mergedData.monthlyCTC || 0,
          annualCTC: mergedData.compensationProfile?.annualCTC || (mergedData.compensationProfile?.monthlyCTC ? mergedData.compensationProfile.monthlyCTC * 12 : 0)
        };
        setProfile(mapped);
      } else {
        throw new Error('Profile details empty');
      }
    } catch (err) {
      showToast('Failed to load profile', 'error');
      throw err;
    }
  }, []);

  // ── FETCH ATTENDANCE ──
  const fetchAttendance = useCallback(async () => {
    try {
      const res = await employeeAPI.getAttendance();
      const history = res.data.data || [];
      const activeLog = history.find(h => !h.clockOut);

      const mappedHistory = history.map(h => {
        const inTime = h.clockIn ? new Date(h.clockIn) : null;
        const outTime = h.clockOut ? new Date(h.clockOut) : null;

        let totalHours = '-';
        if (h.totalWorkedMin !== undefined && h.totalWorkedMin > 0) {
          const hours = Math.floor(h.totalWorkedMin / 60);
          const mins = h.totalWorkedMin % 60;
          totalHours = `${hours}h ${mins}m`;
        } else if (inTime && outTime) {
          let diffMs = outTime - inTime;
            
          // Fallback if backend hasn't calculated it
          const breakMin = h.breakMinutes || 0;
          diffMs = Math.max(0, diffMs - (breakMin * 60000));
            
          const hours = Math.floor(diffMs / 3600000);
          const mins = Math.floor((diffMs % 3600000) / 60000);
          totalHours = `${hours}h ${mins}m`;
        }

        return {
          id: h.id,
          date: inTime ? formatDate(inTime) : (h.date ? formatDate(h.date) : '-'),
          rawDate: h.date || h.clockIn, // Add raw ISO date for reliable filtering
          mode: h.mode || 'Office',
          clockIn: inTime ? inTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
          clockOut: outTime ? outTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-',
          status: h.status || 'Present',
          isHalfDay: !!h.isHalfDay,
          totalHours
        };
      });

      setAttendance({
        isClockedIn: !!activeLog,
        clockInTime: activeLog?.clockIn || null,
        history: mappedHistory,
      });
    } catch {
      // Silently fail in demo mode
    }
  }, []);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await employeeAPI.getLeaves();
      const rawRequests = res.data.data || [];
      const requests = rawRequests.map(l => ({
        ...l,
        type: l.leaveType || 'Annual Leave',
        reason: l.reason || '',
        status: l.status === 'APPROVED' ? 'Approved' :
          l.status === 'PENDING' ? 'Pending' :
          l.status === 'MANAGER_APPROVED' ? 'MANAGER_APPROVED' : 'Rejected',
        days: l.totalDays || 0,
        startDate: l.startDate ? formatDate(l.startDate) : '',
        endDate: l.endDate ? formatDate(l.endDate) : '',
        rawStartDate: l.startDate,
        rawEndDate: l.endDate
      }));
      const approved = requests.filter(l => l.status === 'Approved');
      setLeaves({
        balance: {
          sick: Math.max(0, 10 - approved.filter(l => l.type === 'Sick Leave').reduce((a, c) => a + c.days, 0)),
          annual: Math.max(0, 15 - approved.filter(l => l.type === 'Annual Leave').reduce((a, c) => a + c.days, 0)),
          casual: Math.max(0, 5 - approved.filter(l => l.type === 'Casual Leave').reduce((a, c) => a + c.days, 0)),
          unpaid: approved.filter(l => l.type === 'Unpaid Leave').reduce((a, c) => a + c.days, 0),
        },
        requests,
      });
    } catch {
      showToast('Failed to load leaves', 'error');
    }
  }, []);

  const fetchPayslips = useCallback(async () => {
    try {
      const res = await employeeAPI.getPayslips();
      const raw = res.data.data || [];
      const mapped = raw.map(p => ({
        ...p,
        net: p.netPay,
        date: p.paymentDate ? formatDate(p.paymentDate) : formatDate(p.createdAt)
      }));
      setPayroll({ history: mapped });
    } catch {
      showToast('Failed to load payslips', 'error');
    }
  }, []);

  const fetchPerformance = useCallback(async () => {
    try {
      const res = await employeeAPI.getPerformance();
      const localGoals = JSON.parse(localStorage.getItem('hcm_employee_custom_goals') || '[]');
      const backendGoals = res.data.data?.goals || [];
      const allGoals = [...backendGoals, ...localGoals.filter(lg => !backendGoals.some(bg => bg.id === lg.id))];

      setPerformance({
        goals: allGoals,
        skills: res.data.data?.skills || [],
        reviews: res.data.data?.reviews || []
      });
    } catch {
      const localGoals = JSON.parse(localStorage.getItem('hcm_employee_custom_goals') || '[]');
      setPerformance(prev => ({
        ...prev,
        goals: prev.goals?.length ? prev.goals : localGoals
      }));
    }
  }, []);

  // ── FETCH BENEFITS ──
  const fetchBenefits = useCallback(async () => {
    try {
      const res = await employeeAPI.getBenefits();
      const data = res.data.data;
      
      // Handle backward compatibility: backend used to just return claims array
      const claims = Array.isArray(data) ? data : (data?.claims || []);
      const enrolledPlans = Array.isArray(data) ? [] : (data?.enrolledPlans || []);
      const availablePlans = Array.isArray(data) ? [] : (data?.availablePlans || []);

      setBenefits(prev => ({
        ...prev,
        claims,
        enrolledPlans,
        availablePlans,
        insurance: prev.insurance || { provider: 'Global Health Inc.' },
        dependents: prev.dependents || []
      }));
    } catch {
      // Silently fail
    }
  }, []);

  // ── FETCH TASKS ──
  const fetchTasks = useCallback(async () => {
    try {
      const res = await employeeAPI.getTasks();
      setTasks(res.data.data);
    } catch {
      // Silently fail
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await employeeAPI.getTickets();
      setTickets(res.data.data);
    } catch {
      showToast('Failed to load tickets', 'error');
    }
  }, []);

  const fetchAnnouncements = useCallback(async () => {
    try {
      const res = await employeeAPI.getAnnouncements();
      setAnnouncements(res.data.data || []);
    } catch {
      showToast('Failed to load announcements', 'error');
    }
  }, []);

  const fetchHolidays = useCallback(async () => {
    try {
      const res = await employeeAPI.getHolidays();
      setHolidays(res.data.data || []);
    } catch {
      showToast('Failed to load holidays', 'error');
    }
  }, []);

  const [documents, setDocuments] = useState([]);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await employeeAPI.getDocuments();
      setDocuments(res.data.data || []);
    } catch {
      showToast('Failed to load documents', 'error');
    }
  }, []);

  const initializePortal = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await fetchProfile();
      await Promise.all([
        fetchAttendance().catch(() => {}),
        fetchLeaves().catch(() => {}),
        fetchPayslips().catch(() => {}),
        fetchPerformance().catch(() => {}),
        fetchBenefits().catch(() => {}),
        fetchTasks().catch(() => {}),
        fetchTickets().catch(() => {}),
        fetchAnnouncements().catch(() => {}),
        fetchHolidays().catch(() => {}),
        fetchDocuments().catch(() => {})
      ]);
    } catch (err) {
      console.error("Employee Portal Initialization Error:", err);
      setError("Failed to load employee profile data. Please verify your connection.");
    } finally {
      setLoading(false);
    }
  }, [fetchProfile, fetchAttendance, fetchLeaves, fetchPayslips, fetchPerformance, fetchBenefits, fetchTasks, fetchTickets, fetchAnnouncements, fetchHolidays, fetchDocuments]);

  // ── Initial Load ──
  useEffect(() => {
    initializePortal();
  }, [initializePortal]);

  // ── ACTIONS ──

  const updateProfileAction = async (data) => {
    try {
      const currentOverrides = JSON.parse(localStorage.getItem('hcm_employee_profile_overrides') || '{}');
      const updatedOverrides = { ...currentOverrides, ...data };
      localStorage.setItem('hcm_employee_profile_overrides', JSON.stringify(updatedOverrides));

      await employeeAPI.updateProfile(data);
      await fetchProfile();
      showToast('Profile updated successfully!');
    } catch (err) {
      const currentOverrides = JSON.parse(localStorage.getItem('hcm_employee_profile_overrides') || '{}');
      const updatedOverrides = { ...currentOverrides, ...data };
      localStorage.setItem('hcm_employee_profile_overrides', JSON.stringify(updatedOverrides));
      await fetchProfile();
      showToast('Profile updated successfully!');
    }
  };

  const clockIn = async (mode = 'Office') => {
    try {
      await employeeAPI.clockIn({ mode });
      await fetchAttendance();
      showToast('Clocked in successfully!');
    } catch (err) {
      throw err;
    }
  };

  const clockOut = async () => {
    try {
      await employeeAPI.clockOut();
      await fetchAttendance();
      showToast('Clocked out successfully!');
    } catch (err) {
      throw err;
    }
  };

  const requestLeave = async (req) => {
    try {
      await employeeAPI.applyLeave(req);
      await fetchLeaves();
      showToast('Leave request submitted!');
    } catch (err) {
      throw err;
    }
  };

  const cancelLeave = async (id) => {
    try {
      await employeeAPI.cancelLeave(id);
      await fetchLeaves();
      showToast('Leave cancelled');
    } catch (err) {
      showToast('Failed to cancel leave', 'error');
      throw err;
    }
  };

  const addBenefitClaim = async (claim) => {
    try {
      await employeeAPI.submitBenefitClaim(claim);
      showToast('Benefit claim submitted!');
      await fetchBenefits();
    } catch {
      showToast('Failed to submit benefit claim', 'error');
    }
  };

  const enrollInBenefit = async (benefitPlanId) => {
    try {
      await employeeAPI.enrollBenefitPlan({ benefitPlanId });
      showToast('Enrolled in benefit plan successfully!');
      await fetchBenefits();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to enroll in benefit plan', 'error');
    }
  };

  const unenrollFromBenefit = async (benefitPlanId) => {
    try {
      await employeeAPI.unenrollBenefitPlan({ benefitPlanId });
      showToast('Unenrolled from benefit plan successfully!');
      await fetchBenefits();
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to unenroll from benefit plan', 'error');
    }
  };

  const createTicket = async (ticket) => {
    try {
      await employeeAPI.createTicket(ticket);
      await fetchTickets();
      showToast('Support ticket created!');
    } catch {
      showToast('Failed to create ticket', 'error');
    }
  };

  const replyTicket = async (id, text, attachmentBase64 = null) => {
    try {
      await employeeAPI.replyTicket(id, text, attachmentBase64);
      await fetchTickets();
    } catch {
      showToast('Failed to send reply', 'error');
    }
  };

  const deleteTicketMessage = async (id, msgId) => {
    try {
      await employeeAPI.deleteTicketMessage(id, msgId);
      await fetchTickets();
      showToast('Message deleted successfully');
    } catch {
      showToast('Failed to delete message', 'error');
    }
  };

  const updateGoalProgress = async (id, progress) => {
    try {
      if (id && !String(id).startsWith('custom-goal-')) {
        await employeeAPI.updateGoalProgress(id, progress);
      }
      // Update local storage fallback if needed
      const localGoals = JSON.parse(localStorage.getItem('hcm_employee_custom_goals') || '[]');
      const updatedLocal = localGoals.map(g => g.id === id ? { ...g, progress } : g);
      localStorage.setItem('hcm_employee_custom_goals', JSON.stringify(updatedLocal));

      await fetchPerformance();
      showToast('Goal progress updated successfully');
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to update goal progress', 'error');
      throw err;
    }
  };

  const addGoal = async (newGoal) => {
    try {
      try {
        await employeeAPI.createGoal(newGoal);
      } catch (apiErr) {
        console.warn('Backend createGoal failed or not available, using local fallback:', apiErr.message);
        const goalObj = {
          id: `custom-goal-${Date.now()}`,
          title: newGoal.title,
          priority: newGoal.priority || 'Medium',
          deadline: newGoal.deadline || 'Q4 2026',
          progress: parseInt(newGoal.progress || 0),
          category: newGoal.category || 'Strategic',
          description: newGoal.description || ''
        };
        const localGoals = JSON.parse(localStorage.getItem('hcm_employee_custom_goals') || '[]');
        localStorage.setItem('hcm_employee_custom_goals', JSON.stringify([goalObj, ...localGoals]));
      }

      await fetchPerformance();
      showToast('New Strategic Goal added successfully!');
    } catch (err) {
      showToast('Failed to add goal', 'error');
      throw err;
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      if (goalId && !String(goalId).startsWith('custom-goal-')) {
        await employeeAPI.deleteGoal(goalId);
      }
      const localGoals = JSON.parse(localStorage.getItem('hcm_employee_custom_goals') || '[]');
      const updatedLocal = localGoals.filter(g => g.id !== goalId);
      localStorage.setItem('hcm_employee_custom_goals', JSON.stringify(updatedLocal));

      await fetchPerformance();
      showToast('Strategic goal removed');
    } catch (err) {
      showToast('Failed to remove goal', 'error');
      throw err;
    }
  };

  const upsertSkill = async (skillData) => {
    try {
      await employeeAPI.upsertSkill(skillData);
      await fetchPerformance();
      showToast('Skill updated successfully');
    } catch {
      showToast('Failed to update skill', 'error');
    }
  };

  const deleteSkill = async (id) => {
    try {
      await employeeAPI.deleteSkill(id);
      await fetchPerformance();
      showToast('Skill deleted successfully');
    } catch {
      showToast('Failed to delete skill', 'error');
    }
  };

  const uploadDoc = async (doc) => {
    try {
      await employeeAPI.uploadDocument(doc);
      await fetchDocuments();
      showToast('Document uploaded successfully');
    } catch {
      showToast('Failed to upload document', 'error');
    }
  };

  const deleteDoc = async (id) => {
    try {
      await employeeAPI.deleteDocument(id);
      await fetchDocuments();
      showToast('Document deleted successfully');
    } catch {
      showToast('Failed to delete document', 'error');
    }
  };

  const submitResignation = async (data) => {
    try {
      await employeeAPI.submitResignation(data);
      showToast('Resignation request submitted successfully');
      await fetchProfile();
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Failed to submit resignation';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // Cross-role sync listener (demo mode ke liye)
  useEffect(() => {
    const handleSync = () => {
      fetchAttendance();
      fetchLeaves();
    };
    window.addEventListener('hcm_global_sync', handleSync);
    window.addEventListener('manager_leave_updated', handleSync);
    return () => {
      window.removeEventListener('hcm_global_sync', handleSync);
      window.removeEventListener('manager_leave_updated', handleSync);
    };
  }, [fetchAttendance, fetchLeaves]);

  return (
    <EmployeeContext.Provider value={{
      profile, setProfile: updateProfileAction,
      attendance, clockIn, clockOut,
      leaves, requestLeave, cancelLeave,
      payroll,
      benefits, addBenefitClaim, enrollInBenefit, unenrollFromBenefit,
      documents, uploadDoc, deleteDoc,
      performance, updateGoalProgress, addGoal, deleteGoal, upsertSkill, deleteSkill,
      tickets, createTicket, replyTicket, deleteTicketMessage,
      tasks,
      announcements,
      holidays,
      loading, error,
      showToast,
      submitResignation,
      refetch: { fetchProfile, fetchAttendance, fetchLeaves, fetchPayslips, fetchPerformance, fetchBenefits, fetchTasks, fetchTickets, fetchAnnouncements, fetchHolidays, fetchDocuments },
      refetchAll: initializePortal,
    }}>
      {children}
    </EmployeeContext.Provider>
  );
};

export const useEmployee = () => {
  const context = useContext(EmployeeContext);
  if (!context) throw new Error('useEmployee must be used within an EmployeeProvider');
  return context;
};
