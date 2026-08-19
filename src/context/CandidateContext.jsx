// ============================================================
// CandidateContext.jsx - Real API Integration & Demo Fallback
// ============================================================
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { candidateAPI, notificationAPI } from '../utils/apiService';
import { useCurrency } from '../hooks/useCurrency';
import { useDateFormat } from '../hooks/useDateFormat';

export const CandidateContext = createContext();

export const useCandidate = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const context = useContext(CandidateContext);
  if (!context) throw new Error('useCandidate must be used within a CandidateProvider');
  return context;
};

export const CandidateProvider = ({ children }) => {
  const { getSymbol } = useCurrency();
  const { formatDate } = useDateFormat();
  const [candidate, setCandidate] = useState({});
  const [offers, setOffers] = useState([]);

  const [notifications, setNotifications] = useState(candidate.notifications || []);

  const showToast = (message, type = 'success') => {
    window.dispatchEvent(new CustomEvent('app_toast', { detail: { message, type } }));
  };

  // --- FETCH FUNCTIONS ---
  const fetchProfile = useCallback(async () => {
    try {
      const res = await candidateAPI.getCandidateProfile();
      if (res.data?.success && res.data.data) {
        setCandidate(prev => {
          const profile = prev.profile || {};
          const profileData = res.data.data;
          const email = profileData.user?.email || profile.email || '';
          const fullName = profileData.fullName || email.split('@')[0] || profile.fullName || 'Alex Rivera';

          // Parse skills from database comma-separated string to array
          const skills = profileData.skills
            ? profileData.skills.split(',').map(s => s.trim()).filter(Boolean)
            : (Array.isArray(profile.skills) ? profile.skills : []);

          // Build documents array from DB URLs
          const documents = [];
          if (profileData.identityProofUrl) {
            documents.push({ id: 'doc-identity', name: 'Identity Proof', type: 'Identification', url: profileData.identityProofUrl, date: formatDate(new Date()) });
          }
          if (profileData.educationProofUrl) {
            documents.push({ id: 'doc-education', name: 'Education Proof', type: 'Education', url: profileData.educationProofUrl, date: formatDate(new Date()) });
          }

          // Safely parse resumeData if it exists
          let fetchedResume = prev.resume;
          if (profileData.resumeData) {
            try {
              fetchedResume = JSON.parse(profileData.resumeData);
            } catch (e) {
              console.warn("Failed to parse resumeData from DB", e);
            }
          }

          return {
            ...prev,
            profile: {
              ...profile,
              ...profileData,
              fullName,
              email,
              skills,
              avatar: profileData.avatarUrl || profile.avatar,
              resumeUrl: profileData.resumeUrl || profile.resumeUrl,
              documents: documents.length > 0 ? documents : (profile.documents || []),
            },
            resume: fetchedResume
          };
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [formatDate]);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await candidateAPI.getAvailableJobs();
      const rawJobs = res.data.data || [];
      const mapped = rawJobs.map(job => {
        const diffMs = new Date() - new Date(job.createdAt);
        const diffDays = Math.floor(diffMs / 86400000);
        const posted = diffDays <= 0 ? 'Today' : diffDays === 1 ? 'Yesterday' : `${diffDays}d ago`;

        // Parse requirements: if short/comma-separated treat as list, otherwise as single block
        let requirements = [];
        if (job.requirements && job.requirements.trim()) {
          const raw = job.requirements.trim();
          // If it has commas and is short (likely a list), split by comma
          if (raw.includes(',') && raw.length < 300) {
            requirements = raw.split(',').map(r => r.trim()).filter(Boolean);
          } else if (raw.includes('\n')) {
            // Split by newlines for bullet-point style
            requirements = raw.split('\n').map(r => r.replace(/^[•\-*\d.]+\s*/, '').trim()).filter(Boolean);
          } else {
            // Long paragraph - show as single item
            requirements = [raw];
          }
        }

        return {
          id: job.id,
          title: job.title || 'Job Position',
          company: job.department ? `${job.department} Dept` : 'Open Position',
          posted,
          location: job.location || 'Remote',
          salary: job.salaryRange || 'Competitive',
          type: job.jobType || 'Full-time',
          experience: job.experience || '',
          department: job.department || (job.title.toLowerCase().includes('design') ? 'Design' : job.title.toLowerCase().includes('manager') ? 'Product' : 'Engineering'),
          desc: job.description || 'Exciting opportunity to join our growing team.',
          requirements,
          benefits: []
        };
      });
      setCandidate(prev => ({ ...prev, jobs: { ...prev.jobs, allJobs: mapped } }));
    } catch (err) {
      console.error(err);
    }
  }, [formatDate]);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await candidateAPI.getMyApplications();
      if (res.data?.success && res.data.data) {
        const allInterviews = [];
        const mapped = res.data.data.map(app => {
          const appDate = app.submittedAt ? formatDate(app.submittedAt) : formatDate(new Date());

          const displayStatus = app.status === 'APPLIED' ? 'Applied' :
            app.status === 'SCREENING' ? 'Under Review' :
              app.status === 'SHORTLISTED' ? 'Shortlisted' :
                app.status === 'INTERVIEWING' ? 'Interview' :
                  app.status === 'OFFERED' ? 'Offer' : 
                    app.status === 'HIRED' ? 'Offer Accepted' : 'Rejected';

          // Map backend interviews if present
          if (app.interviews && app.interviews.length > 0) {
            app.interviews.forEach((iv, index) => {
              const ivDate = new Date(iv.dateTime);

              let interviewStatus = 'Scheduled';
              if (displayStatus === 'Rejected') {
                interviewStatus = 'Cancelled';
              } else if (ivDate < new Date()) {
                interviewStatus = 'Completed';
              }

              allInterviews.push({
                id: iv.id || `${app.id}-iv-${index}`,
                appId: app.id,
                appStatus: displayStatus,
                rawDateTime: iv.dateTime,
                role: app.jobPost?.title || 'Unknown Role',
                company: 'GlobalTech Solutions',
                round: iv.round || `Interview Round ${index + 1}`,
                date: formatDate(ivDate),
                time: ivDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                timezone: 'PST',
                interviewer: iv.interviewer?.fullName || 'HR Team',
                interviewerRole: 'Recruiting Panel',
                link: iv.meetingLink || 'https://meet.google.com',
                status: interviewStatus,
                type: iv.type || 'Video Call'
              });
            });
          }

          const timelineOrder = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Offer'];
          const currentIndex = timelineOrder.indexOf(displayStatus === 'Rejected' ? 'Applied' : (displayStatus === 'Offer Accepted' ? 'Offer' : displayStatus));

          const generatedTimeline = [];
          for (let i = 0; i <= currentIndex; i++) {
            let stepDate = appDate;
            if (timelineOrder[i] === 'Interview' && app.interviews && app.interviews.length > 0) {
              stepDate = formatDate(new Date(app.interviews[0].dateTime));
            }
            generatedTimeline.push({ status: timelineOrder[i], date: stepDate });
          }

          return {
            id: app.id,
            jobId: app.jobId,
            date: appDate,
            status: displayStatus,
            company: 'GlobalTech Solutions',
            role: app.jobPost?.title || 'Unknown Role',
            timeline: generatedTimeline
          };
        });

        setCandidate(prev => ({
          ...prev,
          applications: mapped,
          interviews: allInterviews
        }));
      }
    } catch (err) {
      console.error(err);
    }
  }, [formatDate]);



  const updateProfile = async (newData) => {
    try {
      // Format skills as comma-separated string for database
      const payload = {
        ...newData,
        skills: Array.isArray(newData.skills) ? newData.skills.join(', ') : newData.skills
      };
      const res = await candidateAPI.updateCandidateProfile(payload);

      // Parse returned database profile skills string back into array
      const returnedData = res.data.data;
      const skills = returnedData.skills
        ? returnedData.skills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      await fetchProfile(); // Refresh to get the latest DB documents array & URLs mapped
      showToast('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile', 'error');
    }
  };

  const updateResumeStep = (step, data) => {
    setCandidate(prev => ({
      ...prev,
      resume: { ...prev.resume, [step]: data }
    }));
  };

  const syncResumeToBackend = async (fullResumeData) => {
    try {
      await candidateAPI.updateCandidateProfile({
        resumeData: fullResumeData
      });
      showToast('Resume securely synced to database!');
    } catch (err) {
      console.error(err);
      showToast('Failed to sync resume', 'error');
    }
  };

  const applyForJob = async (jobId, details) => {
    try {
      await candidateAPI.applyToJob(jobId, details);
      await fetchApplications();
      await fetchProfile();
      showToast('Application successfully dispatched!');
    } catch (err) {
      console.error(err);
      showToast('Failed to submit application', 'error');
    }
  };

  const saveJob = (jobId) => {
    setCandidate(prev => {
      const currentSaved = prev.jobs?.savedIndices || [];
      const saved = currentSaved.includes(jobId)
        ? currentSaved.filter(id => id !== jobId)
        : [...currentSaved, jobId];
      return { ...prev, jobs: { ...(prev.jobs || {}), savedIndices: saved } };
    });
  };

  const withdrawApplication = async (appId) => {
    try {
      await candidateAPI.withdrawApplication(appId);
      await fetchApplications();
      showToast('Application successfully withdrawn');
    } catch (err) {
      console.error(err);
      showToast('Failed to withdraw application', 'error');
    }
  };

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await notificationAPI.getNotifications();
      if (res.data?.success) {
        const mapped = res.data.data.map(n => {
          let category = 'system';
          const linkLower = n.link ? n.link.toLowerCase() : '';
          const titleLower = n.title.toLowerCase();
          if (linkLower.includes('job') || linkLower.includes('application')) {
            category = 'jobs';
          } else if (linkLower.includes('interview')) {
            category = 'interviews';
          } else if (linkLower.includes('offer') || titleLower.includes('offer')) {
            category = 'offers';
          }

          let timeDisplay = formatDate(n.createdAt);
          try {
            const diffMs = new Date() - new Date(n.createdAt);
            const diffMins = Math.floor(diffMs / 60000);
            const diffHours = Math.floor(diffMs / 3600000);
            const diffDays = Math.floor(diffMs / 86400000);
            if (diffMins < 1) timeDisplay = 'Just now';
            else if (diffMins < 60) timeDisplay = `${diffMins}m ago`;
            else if (diffHours < 24) timeDisplay = `${diffHours}h ago`;
            else timeDisplay = `${diffDays}d ago`;
          } catch (e) { }

          return {
            id: n.id,
            type: category,
            title: n.title,
            message: n.message,
            time: timeDisplay,
            createdAt: n.createdAt,
            isUnread: !n.isRead,
            action: n.link ? 'View Details' : null
          };
        });
        setNotifications(mapped);
      }
    } catch (err) {
      console.error(err);
    }
  }, [formatDate]);

  const markAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationAPI.deleteNotification(id);
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const clearAllNotifications = async () => {
    try {
      await notificationAPI.clearAllNotifications();
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const addDocument = (doc) => {
    setCandidate(prev => ({
      ...prev,
      documents: [{ id: Date.now(), ...doc }, ...prev.documents]
    }));
  };

  const deleteDocument = (id) => {
    setCandidate(prev => ({
      ...prev,
      documents: prev.documents.filter(d => d.id !== id)
    }));
  };

  const fetchOffers = useCallback(async () => {
    try {
      const res = await candidateAPI.getOffers();
      if (res.data?.success && res.data.data) {
        setOffers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch candidate offers:', err);
    }
  }, []);

  const respondToOffer = async (id, status) => {
    try {
      const res = await candidateAPI.respondToOffer(id, { status });
      if (res.data?.success) {
        showToast(`Offer successfully ${status.toLowerCase()}ed!`);
        await fetchOffers();
        await fetchApplications();
      }
    } catch (err) {
      console.error('Failed to respond to offer:', err);
      showToast(err.response?.data?.error?.message || 'Failed to update offer status', 'error');
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchJobs();
    fetchApplications();
    fetchNotifications();
    fetchOffers();
  }, [fetchProfile, fetchJobs, fetchApplications, fetchNotifications, fetchOffers]);

  // No localStorage sync needed anymore

  const value = {
    profile: candidate.profile || {},
    resume: candidate.resume || {},
    jobs: candidate.jobs || { savedIndices: [], allJobs: [] },
    applications: candidate.applications || [],
    interviews: candidate.interviews || [],
    notifications: notifications || [],
    offers,
    respondToOffer,
    updateProfile,
    updateResumeStep,
    syncResumeToBackend,
    applyForJob,
    saveJob,
    withdrawApplication,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    addDocument,
    deleteDocument,
    showToast,
    refetch: { fetchProfile, fetchJobs, fetchApplications, fetchOffers }
  };

  return (
    <CandidateContext.Provider value={value}>
      {children}
    </CandidateContext.Provider>
  );
};
