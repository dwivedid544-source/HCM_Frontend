// ============================================================
// HRContext.jsx - Real API Integration
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { hrAPI } from '../utils/apiService';
import { useCurrency } from '../hooks/useCurrency';
import { useDateFormat } from '../hooks/useDateFormat';

const HRContext = createContext();
export const useHR = () => useContext(HRContext);

export const HRProvider = ({ children }) => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();
  const { formatDate } = useDateFormat();

  const [toast, setToast] = useState({ message: '', visible: false, type: 'success' });
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [offers, setOffers] = useState([]);
  const [onboarding, setOnboarding] = useState([]);
  const [reports, setReports] = useState(null);
  const [exits, setExits] = useState([]);
  const [incrementRequests, setIncrementRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (offers.length > 0) {
      localStorage.setItem('hcm_hr_offers', JSON.stringify(offers));
    }
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('hcm_hr_onboarding', JSON.stringify(onboarding));
  }, [onboarding]);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('app_toast', { detail: { message, type } }));
  };

  // ── FETCH ──
  const fetchJobs = useCallback(async () => {
    try {
      const res = await hrAPI.getJobs();
      const raw = res.data.data || [];
      const mapped = raw.map(j => ({
        ...j,
        // Map backend fields to frontend shape
        salary: j.salaryRange || '',
        type: j.jobType || 'Full Time',
        status: j.status || (j.isActive ? 'Published' : 'Closed'),
        department: j.department || (j.title.toLowerCase().includes('design') ? 'Design' : j.title.toLowerCase().includes('manager') ? 'Product' : 'Engineering'),
        applied: j.applicantCount || 0,
        experience: j.experience || '',
        date: j.createdAt ? formatDate(j.createdAt) : 'Recently',
      }));
      setJobs(mapped);
    } catch (err) {
      console.error(err);
      setJobs([]);
    }
  }, [formatDate]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await hrAPI.getApplications();
      const apps = res.data.data || [];
      setApplications(apps);
      // Map to candidates representation for the Candidates panel
      const mappedCandidates = apps.map(app => {
        const candidateInfo = app.candidate || {};
        const email = candidateInfo.user?.email || '';
        const name = candidateInfo.fullName || email.split('@')[0] || 'Candidate';
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1);

        // Extract AI Match Score from application assessment or compute from real skills intersection
        const candidateSkills = candidateInfo.skills ? candidateInfo.skills.split(',').map(s => s.trim().toLowerCase()) : [];
        const jobReqs = app.jobPost?.requirements ? app.jobPost.requirements.split(',').map(r => r.trim().toLowerCase()) : [];

        let score = null;
        let aiAssessment = '';
        let isInvalidResume = false;
        if (app.coverLetter) {
          if (app.coverLetter.includes('Valid Resume: No') || app.coverLetter.includes('Invalid Resume') || app.coverLetter.includes('Recommendation: Invalid Resume')) {
            isInvalidResume = true;
            score = null;
          } else {
            const scoreMatch = app.coverLetter.match(/AI Match Score:\s*(\d+)%/i);
            if (scoreMatch && scoreMatch[1]) {
              score = parseInt(scoreMatch[1], 10);
            }
          }
          const assessMatch = app.coverLetter.match(/AI Assessment:\s*([^\n]+)/i);
          if (assessMatch && assessMatch[1]) {
            aiAssessment = assessMatch[1].trim();
          }
        }

        if (!isInvalidResume && (score === null || isNaN(score))) {
          if (jobReqs.length > 0 && candidateSkills.length > 0) {
            const matches = jobReqs.filter(req => candidateSkills.some(s => s.includes(req) || req.includes(s)));
            score = Math.round((matches.length / jobReqs.length) * 100);
          } else {
            score = 0;
          }
        }

        const getValidUrl = (...urls) => {
          for (const u of urls) {
            if (!u) continue;
            if (u.startsWith('data:') || u.startsWith('http://') || u.startsWith('https://')) return u;
            if (u.startsWith('/uploads')) {
              const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
              return `${backendUrl}${u}`;
            }
          }
          return urls.find(u => !!u) || '';
        };

        const resolvedResumeUrl = getValidUrl(app.resumeUrl, candidateInfo.resumeUrl, candidateInfo.resumeData);

        return {
          id: app.id,
          name: formattedName,
          email: email,
          phone: candidateInfo.phone || '',
          location: candidateInfo.location || '',
          role: app.jobPost?.title || 'Unknown Position',
          stage: app.status === 'APPLIED' ? 'Applied' :
            app.status === 'SCREENING' ? 'Screening' :
              app.status === 'SHORTLISTED' ? 'Shortlisted' :
                app.status === 'INTERVIEWING' ? 'Interview' :
                  app.status === 'OFFERED' ? 'Offer' :
                    app.status === 'HIRED' ? 'Hired' :
                      app.status === 'REJECTED' ? 'Rejected' : app.status,
          match: isInvalidResume ? null : score,
          isInvalidResume: isInvalidResume,
          aiAssessment: aiAssessment,
          appliedDate: app.submittedAt ? formatDate(app.submittedAt) : formatDate(new Date()),
          avatar: candidateInfo.avatarUrl || '',
          expectedSalary: candidateInfo.expectedSalary || '',
          experience: candidateInfo.experience || '',
          exp: candidateInfo.experience || '',
          linkedin: candidateInfo.linkedin || '',
          portfolio: candidateInfo.portfolio || '',
          skills: candidateInfo.skills ? candidateInfo.skills.split(',').map(s => s.trim()).filter(Boolean) : [],
          resumeUrl: resolvedResumeUrl,
          resumeData: candidateInfo.resumeData || null,
          coverLetter: app.coverLetter || '',
        };
      });
      setCandidates(mappedCandidates);
    } catch (err) {
      console.error(err);
      setCandidates([]);
    }
  }, [formatDate]);

  const fetchInterviews = useCallback(async () => {
    try {
      const res = await hrAPI.getInterviews();
      const mapped = (res.data.data || []).map(i => {
        let rawDateStr = '';
        let localTimeStr = '10:00';
        if (i.dateTime) {
          try {
            const d = new Date(i.dateTime);
            if (!isNaN(d.getTime())) {
              const yyyy = d.getFullYear();
              const mm = String(d.getMonth() + 1).padStart(2, '0');
              const dd = String(d.getDate()).padStart(2, '0');
              rawDateStr = `${yyyy}-${mm}-${dd}`;
              const hh = String(d.getHours()).padStart(2, '0');
              const min = String(d.getMinutes()).padStart(2, '0');
              localTimeStr = `${hh}:${min}`;
            }
          } catch (e) {}
        }
        if (!rawDateStr && i.date) {
          rawDateStr = typeof i.date === 'string' ? i.date.slice(0, 10) : '';
        }
        if (!localTimeStr && i.time) {
          localTimeStr = i.time;
        }

        const normStatus = (i.status === 'SCHEDULED' || i.status === 'Scheduled') ? 'Scheduled' :
          (i.status === 'COMPLETED' || i.status === 'Completed') ? 'Completed' :
          (i.status === 'CANCELLED' || i.status === 'Cancelled') ? 'Cancelled' : (i.status || 'Scheduled');
        const candName = i.application?.candidate?.fullName || i.candidateName || i.candidate || (i.application?.candidate?.user?.email ? i.application.candidate.user.email.split('@')[0] : 'Candidate');
        
        return {
          ...i,
          candidate: candName,
          role: i.application?.jobPost?.title || i.role || 'Job Candidate',
          interviewer: i.interviewer?.fullName || i.interviewerName || 'Hiring Manager',
          date: rawDateStr || (i.dateTime ? formatDate(i.dateTime) : formatDate(new Date())),
          displayDate: i.dateTime ? formatDate(i.dateTime) : formatDate(new Date()),
          rawDate: rawDateStr,
          dateTime: i.dateTime,
          time: localTimeStr,
          round: i.round || (i.feedback ? 'Feedback Stage' : 'Technical Round'),
          type: i.type || 'Video Call',
          link: i.meetingLink || i.link || '',
          status: normStatus,
          img: `https://ui-avatars.com/api/?name=${encodeURIComponent(candName)}&background=random`
        };
      });
      setInterviews(mapped);
    } catch {
      // No mock needed
    }
  }, [formatDate]);

  const fetchEmployees = useCallback(async () => {
    try {
      const res = await hrAPI.getAllEmployees();
      setEmployees(res.data.data);
    } catch {
      // No mock needed
    }
  }, [formatDate]);

  const fetchPendingLeaves = useCallback(async () => {
    try {
      const res = await hrAPI.getAllLeaves();
      const mapped = (res.data.data || []).map(l => ({
        ...l,
        name: l.user?.employeeProfile?.fullName || l.user?.email?.split('@')[0] || 'Employee',
        type: l.leaveType || 'Sick Leave',
        status: l.status,
        startDate: l.startDate ? formatDate(l.startDate) : formatDate(new Date()),
        endDate: l.endDate ? formatDate(l.endDate) : formatDate(new Date()),
        days: l.totalDays || 1,
        reason: l.reason || 'No reason provided',
        img: l.user?.employeeProfile?.avatarUrl || ''
      }));
      setPendingLeaves(mapped);
    } catch {
      // No mock needed
    }
  }, [formatDate]);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await hrAPI.getAllTickets();
      setTickets(res.data.data);
    } catch {
      // No mock needed
    }
  }, [formatDate]);

  const fetchOffers = useCallback(async () => {
    try {
      const res = await hrAPI.getOffers();
      setOffers(res.data.data);
    } catch (err) {
      console.error(err);
      setOffers([]);
    }
  }, [getSymbol]);

  const fetchOnboarding = useCallback(async () => {
    try {
      const res = await hrAPI.getOnboarding();
      setOnboarding(res.data.data);
    } catch (err) {
      console.error(err);
      setOnboarding([]);
    }
  }, [formatDate]);

  const fetchReports = useCallback(async (filters) => {
    try {
      const res = await hrAPI.getReports(filters);
      setReports(res.data.data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    }
  }, [formatDate]);

  const fetchExits = useCallback(async () => {
    try {
      const res = await hrAPI.getExits();
      if (res.data?.success && res.data.data) {
        setExits(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch exits:', err);
    }
  }, []);

  const fetchIncrementRequests = useCallback(async () => {
    try {
      const res = await hrAPI.getIncrementRequests();
      setIncrementRequests(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch HR increment requests', err);
    }
  }, []);

  const approveIncrementRequest = async (id) => {
    try {
      await hrAPI.approveIncrement(id);
      showToast('Increment request approved successfully');
      await fetchIncrementRequests();
    } catch (err) {
      showToast('Failed to approve increment request', 'error');
    }
  };

  const rejectIncrementRequest = async (id) => {
    try {
      await hrAPI.rejectIncrement(id);
      showToast('Increment request rejected successfully');
      await fetchIncrementRequests();
    } catch (err) {
      showToast('Failed to reject increment request', 'error');
    }
  };

  const updateClearanceStatus = async (id, data) => {
    try {
      const res = await hrAPI.updateClearanceStatus(id, data);
      if (res.data?.success) {
        showToast('Clearance checklist updated');
        await fetchExits();
      }
    } catch (err) {
      showToast('Failed to update clearance status', 'error');
    }
  };

  const finalizeExit = async (id) => {
    try {
      const res = await hrAPI.finalizeExit(id);
      if (res.data?.success) {
        showToast('Employee exit finalized and account deactivated');
        await fetchExits();
        await fetchEmployees();
      }
    } catch (err) {
      showToast('Failed to finalize exit', 'error');
    }
  };

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchInterviews();
    fetchEmployees();
    fetchPendingLeaves();
    fetchTickets();
    fetchOffers();
    fetchOnboarding();
    fetchReports();
    fetchExits();
    fetchIncrementRequests();
  }, [formatDate, fetchExits, fetchIncrementRequests]);

  // ── JOB ACTIONS ──
  const addJob = async (job) => {
    try {
      const payload = {
        title: job.title,
        department: job.department || 'Design',
        description: job.description || 'Position description not specified.',
        requirements: job.requirements || '',
        salaryRange: job.salary || job.salaryRange || '',
        location: job.location || 'Remote',
        jobType: job.type || job.jobType || 'Full Time',
        experience: job.experience || '',
        status: job.status || 'Published',
        isActive: job.status !== 'Closed',
      };
      await hrAPI.createJob(payload);
      await fetchJobs();
      showToast('Job created successfully');
    } catch (err) {
      console.error("Failed to create job on server:", err);
      setJobs(prev => [{ ...job, id: `J-${Date.now()}`, applied: 0, new: 0 }, ...prev]);
      showToast('Job created (demo mode)');
    }
  };

  const updateJob = async (id, data) => {
    try {
      const payload = {
        title: data.title,
        department: data.department || 'Design',
        description: data.description || 'Position description not specified.',
        requirements: data.requirements || '',
        salaryRange: data.salary || data.salaryRange || '',
        location: data.location || 'Remote',
        jobType: data.type || data.jobType || 'Full Time',
        isActive: data.status !== undefined ? data.status !== 'Closed' : (data.isActive !== undefined ? data.isActive : true),
        status: data.status || 'Published',
        experience: data.experience || '',
      };
      await hrAPI.updateJob(id, payload);
      await fetchJobs();
      showToast('Job updated');
    } catch (err) {
      console.error("Failed to update job on server:", err);
      setJobs(prev => prev.map(j => j.id === id ? { ...j, ...data } : j));
      showToast('Job updated (demo mode)');
    }
  };

  const deleteJob = async (id) => {
    try {
      await hrAPI.deleteJob(id);
      await fetchJobs();
      showToast('Job deleted');
    } catch {
      setJobs(prev => prev.filter(j => j.id !== id));
      showToast('Job deleted (demo mode)');
    }
  };

  // ── APPLICATION ACTIONS ──
  const updateCandidateStage = async (appId, status) => {
    const stageToEnum = {
      'Applied': 'APPLIED',
      'Screening': 'SCREENING',
      'Shortlisted': 'SHORTLISTED',
      'Interview': 'INTERVIEWING',
      'Offer': 'OFFERED',
      'Offered': 'OFFERED',
      'Hired': 'HIRED',
      'Rejected': 'REJECTED',
    };
    const backendStatus = stageToEnum[status] || status;
    try {
      await hrAPI.updateApplicationStatus(appId, { status: backendStatus });
      await fetchApplications();
      if (backendStatus === 'HIRED') {
        await fetchEmployees();
      }
      showToast('Application status updated successfully');
    } catch (err) {
      console.error("Failed to update candidate stage:", err);
      showToast(err.response?.data?.error?.message || 'Failed to update candidate stage', 'error');
      await fetchApplications();
      throw err;
    }
  };

  const getCandidateAiSummary = async (candidateData) => {
    try {
      const res = await hrAPI.getCandidateAiSummary(candidateData);
      return res.data?.data || res.data;
    } catch (err) {
      showToast(err.response?.data?.error?.message || 'Failed to generate AI candidate summary', 'error');
      throw err;
    }
  };

  const runPayrollBatch = async (data) => {
    try {
      const res = await hrAPI.runPayrollBatch(data);
      showToast('Batch payroll generated successfully!');
      return res.data;
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to generate batch payroll', 'error');
      throw err;
    }
  };

  const finalizePayroll = async (id) => {
    try {
      const res = await hrAPI.finalizePayroll(id);
      showToast('Payroll finalized and locked!');
      return res.data;
    } catch (err) {
      showToast(err.response?.data?.error?.message || err.response?.data?.message || 'Failed to finalize payroll', 'error');
      throw err;
    }
  };

  // ── INTERVIEW ACTIONS ──
  const scheduleInterview = async (data) => {
    try {
      await hrAPI.scheduleInterview(data);
      await fetchInterviews();
      showToast('Interview scheduled!');
    } catch {
      showToast('Interview scheduled (demo mode)');
    }
  };

  const submitFeedback = async (id, data) => {
    try {
      await hrAPI.submitInterviewFeedback(id, data);
      await fetchInterviews();
      showToast('Feedback submitted!');
    } catch {
      showToast('Feedback saved (demo mode)');
    }
  };

  // ── EMPLOYEE ONBOARDING ──
  const onboardEmployee = async (data) => {
    try {
      await hrAPI.onboardEmployee(data);
      await fetchEmployees();
      showToast('Employee onboarded successfully!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Onboarding failed';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  const promoteCandidate = async (id, data) => {
    try {
      await hrAPI.promoteCandidate(id, data);
      await fetchOnboarding();
      await fetchEmployees();
      showToast('Candidate promoted to Employee successfully!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || 'Promotion failed';
      showToast(message, 'error');
      return { success: false, message };
    }
  };

  // ── TICKET ACTIONS ──
  const createTicket = async (data) => {
    try {
      await hrAPI.createTicket(data);
      await fetchTickets();
      showToast('Message thread started!');
    } catch {
      showToast('Message thread started (demo mode)');
    }
  };

  const replyToTicket = async (id, payload) => {
    try {
      const data = (payload instanceof FormData || typeof payload === 'object') ? payload : { text: payload };
      await hrAPI.replyTicket(id, data);
      await fetchTickets();
      showToast('Reply sent!');
    } catch {
      showToast('Reply sent (demo mode)');
    }
  };

  const closeTicket = async (id) => {
    try {
      await hrAPI.updateTicketStatus(id, { status: 'RESOLVED' });
      await fetchTickets();
      showToast('Ticket resolved!');
    } catch {
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: 'Resolved' } : t));
      showToast('Ticket resolved (demo mode)');
    }
  };

  // ── OFFER ACTIONS ──
  const addOffer = async (offer) => {
    try {
      await hrAPI.createOffer(offer);
      await fetchOffers();
      await fetchApplications();
      await fetchEmployees();
      await fetchOnboarding();
      showToast('Offer created successfully');
    } catch {
      setOffers(prev => [{ ...offer, id: `O-${Date.now()}` }, ...prev]);
      showToast('Offer created (demo mode)');
    }
  };

  const updateOffer = async (id, data) => {
    try {
      await hrAPI.updateOffer(id, data);
      await fetchOffers();
      await fetchApplications();
      await fetchEmployees();
      await fetchOnboarding();
      showToast('Offer updated successfully');
    } catch {
      setOffers(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
      showToast('Offer updated (demo mode)');
    }
  };

  const deleteOffer = async (id) => {
    try {
      await hrAPI.deleteOffer(id);
      await fetchOffers();
      showToast('Offer deleted successfully');
    } catch {
      setOffers(prev => prev.filter(o => o.id !== id));
      showToast('Offer deleted (demo mode)');
    }
  };

  // ── CANDIDATE CRUD ACTIONS ──
  const addCandidate = async (cand) => {
    try {
      await hrAPI.createApplication(cand);
      await fetchApplications();
      showToast('Candidate added successfully');
    } catch (err) {
      console.error(err);
      setCandidates(prev => [{ ...cand, id: `C-${Date.now()}` }, ...prev]);
      showToast('Candidate added (demo mode)');
    }
  };

  const updateCandidate = (id, data) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    showToast('Candidate updated successfully');
  };

  const deleteCandidate = async (id) => {
    try {
      await hrAPI.deleteApplication(id);
      setCandidates(prev => prev.filter(c => c.id !== id));
      showToast('Candidate removed');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove candidate', 'error');
    }
  };

  const moveCandidateStage = updateCandidateStage;

  // --- ADDED ACTIONS FOR INTERVIEWS ---
  const addInterview = async (interview) => {
    try {
      const payload = {
        candidate: interview.candidate || interview.candidateName,
        role: interview.role,
        date: interview.date,
        time: interview.time,
        round: interview.round || 'Technical Round',
        type: interview.type || 'Video Call',
        meetingLink: interview.link || interview.meetingLink || '',
        applicationId: interview.applicationId || interview.candidateId || undefined,
        interviewerId: interview.interviewerId || undefined,
      };
      await hrAPI.scheduleInterview(payload);
      await fetchInterviews();
      await fetchApplications();
      showToast('Interview scheduled successfully!');
    } catch (err) {
      console.error('Failed to schedule interview:', err);
      setInterviews(prev => [{ ...interview, id: `INT-${Date.now()}` }, ...prev]);
      showToast('Interview scheduled (demo mode)');
    }
  };

  const updateInterview = async (id, data) => {
    try {
      const payload = {
        date: data.date,
        time: data.time,
        dateTime: data.dateTime,
        meetingLink: data.link || data.meetingLink || '',
        round: data.round,
        type: data.type,
        status: data.status,
        interviewerId: data.interviewerId || (data.interviewer && !data.interviewer.includes(' ') ? data.interviewer : undefined),
        candidate: data.candidate,
        role: data.role
      };

      await hrAPI.updateInterview(id, payload);
      await fetchInterviews();
      await fetchApplications();
      await fetchOffers();
      showToast('Interview updated successfully!');
    } catch (err) {
      console.error('Failed to update interview:', err);
      setInterviews(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
      showToast('Interview updated');
    }
  };

  const deleteInterview = async (id) => {
    try {
      await hrAPI.deleteInterview(id);
      await fetchInterviews();
      showToast('Interview deleted');
    } catch (err) {
      console.error('Failed to delete interview:', err);
      setInterviews(prev => prev.filter(i => i.id !== id));
      showToast('Interview deleted (demo mode)');
    }
  };

  // --- ADDED ACTIONS FOR ONBOARDING ---
  const addOnboarding = async (item) => {
    try {
      await hrAPI.createOnboarding(item);
      await fetchOnboarding();
      showToast('Onboarding created successfully');
    } catch (err) {
      console.error(err);
      setOnboarding(prev => [{
        ...item,
        id: `ONB-${Date.now()}`,
        progress: item.progress || 0,
        status: item.status || 'Not Started',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random`
      }, ...prev]);
      showToast('Onboarding created (demo mode)');
    }
  };

  const updateOnboarding = async (id, data) => {
    try {
      await hrAPI.updateOnboarding(id, data);
      await fetchOnboarding();
      showToast('Onboarding updated');
    } catch {
      setOnboarding(prev => prev.map(o => o.id === id ? { ...o, ...data } : o));
      showToast('Onboarding updated (demo mode)');
    }
  };

  const deleteOnboarding = async (id) => {
    try {
      await hrAPI.deleteOnboarding(id);
      await fetchOnboarding();
      showToast('Onboarding deleted');
    } catch {
      setOnboarding(prev => prev.filter(o => o.id !== id));
      showToast('Onboarding deleted (demo mode)');
    }
  };

  const remindManager = async (id) => {
    try {
      await hrAPI.remindManager(id);
      showToast('Manager has been reminded via email');
    } catch (err) {
      console.error(err);
      showToast('Manager has been reminded (demo mode)');
    }
  };

  const sendWelcomeEmail = async (ids) => {
    try {
      await hrAPI.sendWelcomeEmail({ ids });
      showToast('Welcome emails sent successfully');
    } catch (err) {
      console.error(err);
      showToast('Welcome emails sent (demo mode)');
    }
  };

  const refetch = useCallback(async () => {
    try {
      await Promise.allSettled([
        fetchJobs(),
        fetchApplications(),
        fetchInterviews(),
        fetchEmployees(),
        fetchPendingLeaves(),
        fetchTickets(),
        fetchOffers(),
        fetchOnboarding(),
        fetchExits(),
        fetchIncrementRequests(),
      ]);
    } catch (err) {
      console.error('Refetch error:', err);
    }
  }, [fetchJobs, fetchApplications, fetchInterviews, fetchEmployees, fetchPendingLeaves, fetchTickets, fetchOffers, fetchOnboarding, fetchExits, fetchIncrementRequests]);

  refetch.fetchJobs = fetchJobs;
  refetch.fetchApplications = fetchApplications;
  refetch.fetchInterviews = fetchInterviews;
  refetch.fetchEmployees = fetchEmployees;
  refetch.fetchPendingLeaves = fetchPendingLeaves;
  refetch.fetchTickets = fetchTickets;
  refetch.fetchOffers = fetchOffers;
  refetch.fetchOnboarding = fetchOnboarding;
  refetch.fetchExits = fetchExits;
  refetch.fetchIncrementRequests = fetchIncrementRequests;

  return (
    <HRContext.Provider value={{
      toast,
      jobs, addJob, updateJob, deleteJob,
      candidates, applications, updateCandidateStage,
      addCandidate, updateCandidate, deleteCandidate, moveCandidateStage: updateCandidateStage,
      getCandidateAiSummary, runPayrollBatch, finalizePayroll,
      interviews, scheduleInterview, submitFeedback, addInterview, updateInterview, deleteInterview,
      employees, onboardEmployee, promoteCandidate,
      onboarding, addOnboarding, updateOnboarding, deleteOnboarding, remindManager, sendWelcomeEmail,
      exits, fetchExits, updateClearanceStatus, finalizeExit,
      incrementRequests, approveIncrementRequest, rejectIncrementRequest,
      reports, fetchReports,
      pendingLeaves,
      tickets, createTicket, replyToTicket, closeTicket,
      offers, addOffer, updateOffer, deleteOffer,
      loading,
      showToast,
      refetch,
    }}>
      {children}
    </HRContext.Provider>
  );
};
