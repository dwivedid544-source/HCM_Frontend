
// ============================================================
// ManagerContext.jsx - Real API Integration
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { managerAPI, employeeAPI } from '../utils/apiService';
import { useDateFormat } from '../hooks/useDateFormat';

const ManagerContext = createContext();

const DEFAULT_TEAM = [
  { id: 'emp-1', userId: 'usr-1', name: 'Alex Morgan', role: 'Senior Developer', department: 'Engineering', email: 'alex.morgan@company.com', status: 'Active' },
  { id: 'emp-2', userId: 'usr-2', name: 'Sarah Jenkins', role: 'UI/UX Designer', department: 'Design', email: 'sarah.j@company.com', status: 'Active' },
  { id: 'emp-3', userId: 'usr-3', name: 'Michael Chen', role: 'Product Manager', department: 'Product', email: 'm.chen@company.com', status: 'Active' },
  { id: 'emp-4', userId: 'usr-4', name: 'Emily Davis', role: 'QA Engineer', department: 'Engineering', email: 'emily.d@company.com', status: 'Active' },
  { id: 'emp-5', userId: 'usr-5', name: 'David Wilson', role: 'DevOps Lead', department: 'Operations', email: 'david.w@company.com', status: 'Active' }
];

export const ManagerProvider = ({ children }) => {
  const { formatDate } = useDateFormat();
  const [teamMembers, setTeamMembers]     = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [attendance, setAttendance]       = useState([]);
  const [tasks, setTasks]                 = useState([]);
  const [kpis, setKpis]                   = useState([]);
  const [reviewsState, setReviewsState] = useState([]);
  const [loading, setLoading]             = useState(false);
  const [profile, setProfile]             = useState(null);
  const [documents, setDocuments]         = useState([]);
  const [orgEmployees, setOrgEmployees]   = useState([]);
  const [incrementRequests, setIncrementRequests] = useState([]);

  const showToast = (msg, type = 'success') =>
    window.dispatchEvent(new CustomEvent('app_toast', { detail: { message: msg, type } }));

  // ── FETCH ALL ──
  const fetchTeam = useCallback(async () => {
    try {
      const res = await managerAPI.getTeam();
      const mapped = (res.data.data || []).map(m => ({
        ...m,
        id: m.id,
        userId: m.userId,
        name: m.fullName || 'Team Member',
        role: m.user?.role || 'Employee',
        department: m.department?.name || 'Operations',
        email: m.user?.email || '',
        phone: m.phone || '',
        joinDate: m.joiningDate ? formatDate(m.joiningDate) : formatDate(new Date()),
        status: m.user?.isActive ? 'Active' : 'Inactive',
        rating: 4.5,
        img: m.avatarUrl || '',
        monthlyCTC: m.compensationProfile?.monthlyCTC || 0,
        annualCTC: m.compensationProfile?.annualCTC || 0
      }));
      setTeamMembers(mapped);
    } catch (err) {
      console.error(err);
      setTeamMembers([]);
    }
  }, [formatDate]);

  const fetchLeaves = useCallback(async () => {
    try {
      const res = await managerAPI.getTeamLeaves();
      const mapped = (res.data.data || []).map(l => ({
        ...l,
        name: l.user?.employeeProfile?.fullName || l.user?.email?.split('@')[0] || 'Employee',
        type: l.leaveType || 'Sick Leave',
        status: l.status ? (l.status.charAt(0) + l.status.slice(1).toLowerCase()) : 'Pending', // PENDING -> Pending
        startDate: l.startDate ? formatDate(l.startDate) : formatDate(new Date()),
        endDate: l.endDate ? formatDate(l.endDate) : formatDate(new Date()),
        days: l.totalDays || 1,
        reason: l.reason || 'No reason provided',
        img: l.user?.employeeProfile?.avatarUrl || ''
      }));
      setLeaveRequests(mapped);
    } catch (err) {
      console.error(err);
      setLeaveRequests([]);
    }
  }, [formatDate]);

  const fetchAttendance = useCallback(async () => {
    try {
      const res = await managerAPI.getTeamAttendance();
      const mapped = (res.data.data || []).map(a => {
        const dObj = a.date ? new Date(a.date) : new Date();
        const rawDate = isNaN(dObj.getTime()) ? '' : dObj.toISOString().split('T')[0];
        return {
          ...a,
          userId: a.userId,
          name: a.user?.employeeProfile?.fullName || 'Employee',
          status: a.status || 'Present',
          mode: a.mode || 'Office',
          date: a.date ? formatDate(a.date) : formatDate(new Date()),
          rawDate,
          checkIn: a.clockIn ? new Date(a.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '09:00 AM',
          checkOut: a.clockOut ? new Date(a.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
          hours: a.totalWorkedMin ? `${Math.floor(a.totalWorkedMin / 60)}h ${a.totalWorkedMin % 60}m` : '8h 0m',
          img: a.user?.employeeProfile?.avatarUrl || ''
        };
      });
      setAttendance(mapped);
    } catch (err) {
      console.error(err);
      setAttendance([]);
    }
  }, [formatDate]);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await managerAPI.getTeamTasks();
      setTasks(res.data.data);
    } catch (err) {
      console.error(err);
      setTasks([]);
    }
  }, [formatDate]);

  const fetchKpis = useCallback(async () => {
    try {
      const res = await managerAPI.getTeamPerformance();
      setKpis(res.data.data);
    } catch (err) {
      console.error(err);
      setKpis([]);
    }
  }, [formatDate]);

  const fetchReviews = useCallback(async () => {
    try {
      const res = await managerAPI.getTeamReviews();
      const mapped = (res.data.data || []).map(r => {
        let details = { strengths: '', improvement: '', summary: r.text || '', status: 'Submitted' };
        try {
          const parsed = JSON.parse(r.text);
          if (parsed && typeof parsed === 'object') {
            details = {
              strengths: parsed.strengths || '',
              improvement: parsed.improvement || '',
              summary: parsed.summary || '',
              status: parsed.status || 'Submitted'
            };
          }
        } catch (e) {}
        return {
          id: r.id,
          employeeId: r.employeeId,
          name: r.employee?.fullName || 'Employee',
          period: r.period || 'Q3 2026',
          rating: parseFloat(r.rating) || 5.0,
          status: details.status,
          strengths: details.strengths,
          improvement: details.improvement,
          summary: details.summary,
          role: r.employee?.user?.role || 'Employee',
          reviewer: r.reviewer
        };
      });
      setReviewsState(mapped);
    } catch (err) {
      console.error(err);
      setReviewsState([]);
    }
  }, [formatDate]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await employeeAPI.getProfile();
      if (res.data?.success && res.data.data) {
        setProfile(res.data.data);
      }
    } catch {
      showToast('Failed to load profile', 'error');
    }
  }, [formatDate]);

  const updateProfile = async (data) => {
    try {
      await employeeAPI.updateProfile(data);
      await fetchProfile();
      showToast('Profile updated successfully!');
    } catch {
      showToast('Failed to update profile', 'error');
    }
  };

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await employeeAPI.getDocuments();
      setDocuments(res.data.data || []);
    } catch {
      showToast('Failed to load documents', 'error');
    }
  }, [formatDate]);

  const fetchOrgEmployees = useCallback(async () => {
    try {
      const res = await managerAPI.getOrgEmployees();
      if (res.data?.success) {
        setOrgEmployees(res.data.data);
      }
    } catch {
      console.error('Failed to load org employees');
    }
  }, [formatDate]);

  const fetchIncrements = useCallback(async () => {
    try {
      const res = await managerAPI.getIncrementRequests();
      if (res.data?.success) {
        setIncrementRequests(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load increment requests:", err);
    }
  }, [formatDate]);

  useEffect(() => {
    fetchProfile();
    fetchTeam();
    fetchLeaves();
    fetchAttendance();
    fetchTasks();
    fetchKpis();
    fetchReviews();
    fetchDocuments();
    fetchOrgEmployees();
    fetchIncrements();
  }, [formatDate]);

  // Sync with employee leave submissions
  useEffect(() => {
    const handleSync = () => fetchLeaves();
    window.addEventListener('hcm_global_sync', handleSync);
    return () => window.removeEventListener('hcm_global_sync', handleSync);
  }, [fetchLeaves]);

  // ── ACTIONS ──

  const approveLeave = async (id, statusToSet = 'APPROVED') => {
    try {
      await managerAPI.reviewLeave(id, { status: statusToSet, managerComment: 'Approved' });
      await fetchLeaves();
    } catch (err) {
      console.error(err);
      showToast('Failed to approve leave', 'error');
      throw err;
    }
  };

  const rejectLeave = async (id, comment = '') => {
    try {
      await managerAPI.reviewLeave(id, { status: 'REJECTED', managerComment: comment });
      await fetchLeaves();
    } catch (err) {
      console.error(err);
      showToast('Failed to reject leave', 'error');
      throw err;
    }
  };

  const assignTask = async (task) => {
    try {
      await managerAPI.assignTask(task);
      await fetchTasks();
      showToast('Task assigned!');
    } catch (err) {
      console.error(err);
      showToast('Failed to assign task', 'error');
    }
  };

  const updateTask = async (id, data) => {
    try {
      await managerAPI.updateTask(id, data);
      await fetchTasks();
    } catch (err) {
      console.error(err);
      showToast('Failed to update task', 'error');
    }
  };

  const addKpi = async (kpi) => {
    try {
      await managerAPI.addPerformanceGoal(kpi);
      await fetchKpis();
      showToast('KPI added!');
    } catch {
      setKpis(prev => [{ ...kpi, id: Date.now(), progress: 0 }, ...prev]);
      showToast('KPI added (demo)');
    }
  };

  const updateKpi = (id, updates) => {
    setKpis(prev => prev.map(k => k.id === id ? { ...k, ...updates } : k));
  };

  const addReview = async (review) => {
    try {
      const details = {
        strengths: review.strengths || '',
        improvement: review.improvement || '',
        summary: review.summary || '',
        status: review.status || 'Draft'
      };
      await managerAPI.createTeamReview({
        employeeId: review.employeeId.toString(),
        period: review.period,
        rating: (review.rating || 5.0).toString(),
        text: JSON.stringify(details)
      });
      await fetchReviews();
      showToast('Review cycle initiated!');
    } catch {
      setReviewsState(prev => [{ ...review, id: Date.now() }, ...prev]);
      showToast('Review cycle initiated (demo)');
    }
  };

  const updateReview = async (id, data) => {
    try {
      const current = reviewsState.find(r => r.id === id);
      if (!current) return;
      
      const updatedDetails = {
        strengths: data.strengths !== undefined ? data.strengths : current.strengths,
        improvement: data.improvement !== undefined ? data.improvement : current.improvement,
        summary: data.summary !== undefined ? data.summary : current.summary,
        status: data.status !== undefined ? data.status : current.status
      };

      await managerAPI.updateTeamReview(id, {
        period: data.period || current.period,
        rating: (data.rating !== undefined ? data.rating : current.rating).toString(),
        text: JSON.stringify(updatedDetails)
      });
      await fetchReviews();
    } catch {
      setReviewsState(prev => prev.map(r => r.id === id ? { ...r, ...data } : r));
    }
  };

  const addAttendanceEntry = async (entry) => {
    try {
      await managerAPI.addManualAttendance({
        employeeProfileId: entry.employeeId,
        date: entry.date,
        checkIn: entry.checkIn,
        checkOut: entry.checkOut || undefined,
        status: entry.status,
        mode: entry.mode,
      });
      await fetchAttendance();
      showToast('Attendance logged manually');
    } catch (err) {
      const matchedTeam = teamMembers.find(t => t.id === entry.employeeId) || {};
      const newRecord = {
        id: Date.now(),
        name: matchedTeam.name || 'Demo Employee',
        date: entry.date,
        clockIn: entry.checkIn,
        clockOut: entry.checkOut || '-',
        totalHours: '0h',
        status: entry.status,
        mode: entry.mode,
      };
      setAttendance(prev => [newRecord, ...prev]);
      showToast('Attendance logged manually (demo)');
    }
  };

  const updateLeaveStatus = async (id, status, comment = '') => {
    if (status === 'Approved' || status === 'APPROVED' || status === 'MANAGER_APPROVED') {
      await approveLeave(id, status);
    } else {
      await rejectLeave(id, comment);
    }
  };

  const addLeaveRequest = async (req) => {
    try {
      await managerAPI.addTeamLeaveRequest({
        employeeId: req.employeeId,
        leaveType: req.type || 'Sick Leave',
        startDate: req.startDate,
        endDate: req.endDate || req.startDate,
        reason: req.reason || '',
      });
      await fetchLeaves();
      showToast('Leave request submitted on behalf of employee');
    } catch {
      const matchedTeam = teamMembers.find(t => t.id === req.employeeId) || {};
      const newReq = {
        id: Date.now().toString(),
        name: matchedTeam.name || 'Demo Employee',
        leaveType: req.type || 'Sick Leave',
        startDate: req.startDate,
        endDate: req.endDate || req.startDate,
        totalDays: 1,
        reason: req.reason || '',
        status: 'Pending',
        submittedAt: new Date().toISOString().split('T')[0]
      };
      setLeaveRequests(prev => [newReq, ...prev]);
      showToast('Leave request submitted on behalf of employee (demo)');
    }
  };

  const addTask = assignTask;

  const updateTaskStatus = async (id, status) => {
    await updateTask(id, { status });
  };

  const addTeamMember = async (member) => {
    try {
      await managerAPI.addTeamMember(member);
      await fetchTeam();
      showToast('Team member added successfully!');
    } catch (err) {
      showToast('Failed to add team member', 'error');
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

  const reviewIncrement = async (id, action) => {
    try {
      if (action === 'Approved') {
        await managerAPI.approveIncrementRequest(id); // Using proper managerAPI method if it was wrong
      } else {
        await managerAPI.rejectIncrementRequest(id); // Using proper managerAPI method
      }
      showToast(`Increment request ${action.toLowerCase()} successfully!`);
      await fetchIncrements();
    } catch (err) {
      showToast(err.response?.data?.message || `Failed to ${action.toLowerCase()} increment request`, 'error');
    }
  };

  const requestSalaryIncrement = async (data) => {
    try {
      await managerAPI.requestSalaryIncrement(data);
      showToast('Salary increment requested successfully!');
      await fetchIncrements();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to request salary increment', 'error');
    }
  };

  return (
    <ManagerContext.Provider value={{
      teamMembers, addTeamMember,
      leaveRequests, leaves: leaveRequests, approveLeave, rejectLeave, updateLeaveStatus, addLeaveRequest,
      attendance, addAttendanceEntry,
      tasks, assignTask, updateTask, addTask, updateTaskStatus,
      kpis, addKpi, updateKpi,
      reviews: reviewsState, addReview, updateReview,
      profile, updateProfile,
      documents, uploadDoc, deleteDoc,
      orgEmployees, fetchOrgEmployees,
      incrementRequests, reviewIncrement, requestSalaryIncrement, fetchIncrements,
      loading,
      showToast,
      refetch: { fetchTeam, fetchLeaves, fetchAttendance, fetchTasks, fetchKpis, fetchReviews, fetchProfile, fetchDocuments, fetchOrgEmployees, fetchIncrements },
    }}>
      {children}
    </ManagerContext.Provider>
  );
};

export const useManager = () => useContext(ManagerContext);
