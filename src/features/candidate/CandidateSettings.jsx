import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ShieldCheck, Bell, Settings2, Lock,
  Smartphone, Monitor, Key, Globe, Save, RotateCcw, LogOut,
  Eye, EyeOff, Loader2, AlertCircle
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useCandidate } from '../../context/CandidateContext';
import { candidateAPI } from '../../utils/apiService';
import { useNavigate } from 'react-router-dom';
import CenterModal from '../../shared/components/layout/CenterModal';
import PhoneInput from '../../shared/components/ui/PhoneInput';

const CandidateSettings = () => {
  const { profile, showToast } = useCandidate();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('account');
  const [isSaving, setIsSaving] = useState(false);
  const [isSignoutModalOpen, setIsSignoutModalOpen] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState('');

  const defaultSettings = {
    account: {
      name: profile.fullName || '',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactor: false,
      activeSessions: [
        { id: 1, device: 'Current Browser', location: 'Active Now', ip: '—', status: 'Active' },
      ],
    },
    notifications: {
      emailAlerts: true,
      interviewAlerts: true,
      offerAlerts: true,
      jobRecommendations: true,
      pushNotifications: false,
    },
    preferences: {
      theme: 'Light Mode',
      language: 'English',
      timezone: 'UTC -5 (Eastern)',
      defaultDashboard: 'Overview',
    },
  };

  const [formData, setFormData] = useState(defaultSettings);
  const [savedSnapshot, setSavedSnapshot] = useState(defaultSettings);

  // Load settings from backend on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await candidateAPI.getSettings();
        if (res.data?.success && res.data.data) {
          const data = res.data.data;
          const merged = {
            ...defaultSettings,
            account: {
              name: data.account?.name || profile.fullName || '',
              email: data.account?.email || profile.email || '',
              phone: data.account?.phone || profile.phone || '',
              location: data.account?.location || profile.location || '',
            },
          };
          setFormData(merged);
          setSavedSnapshot(merged);
        }
      } catch {
        // Fall back to profile data
        const merged = {
          ...defaultSettings,
          account: {
            name: profile.fullName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            location: profile.location || '',
          },
        };
        setFormData(merged);
        setSavedSnapshot(merged);
      }
    };
    loadSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: ShieldCheck },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: Settings2 },
  ];

  const handleSave = async () => {
    setError('');
    // Validate password fields if filled
    if (activeTab === 'security') {
      if (formData.security.newPassword && formData.security.newPassword !== formData.security.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      if (formData.security.newPassword && formData.security.newPassword.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    }

    setIsSaving(true);
    try {
      const payload = {
        account: formData.account,
        notifications: formData.notifications,
        preferences: formData.preferences,
      };
      // Only include security if user is trying to change password
      if (formData.security.newPassword && formData.security.currentPassword) {
        payload.security = {
          currentPassword: formData.security.currentPassword,
          newPassword: formData.security.newPassword,
        };
      }
      await candidateAPI.updateSettings(payload);
      // Clear password fields after save
      setFormData(prev => ({
        ...prev,
        security: { ...prev.security, currentPassword: '', newPassword: '', confirmPassword: '' },
      }));
      setSavedSnapshot(formData);
      showToast('Settings saved successfully');
    } catch (err) {
      const msg = err.response?.data?.error?.message || 'Failed to save settings.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(savedSnapshot);
    setError('');
    showToast('Settings reverted to last saved state');
  };

  const handleSignOut = () => {
    localStorage.removeItem('hcm_token');
    localStorage.removeItem('hcm_user');
    showToast('Signed out successfully');
    setTimeout(() => navigate('/login'), 800);
  };

  const updateAccount = (key, value) =>
    setFormData(prev => ({ ...prev, account: { ...prev.account, [key]: value } }));

  const updateSecurity = (key, value) =>
    setFormData(prev => ({ ...prev, security: { ...prev.security, [key]: value } }));

  const updateNotification = (key) =>
    setFormData(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [key]: !prev.notifications[key] },
    }));

  const updatePreference = (key, value) =>
    setFormData(prev => ({ ...prev, preferences: { ...prev.preferences, [key]: value } }));

  return (
    <div className="space-y-10 pb-12 animate-fade-in max-w-7xl mx-auto text-left">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-soft">
        <div>
          <h1 className="hcm-page-title uppercase leading-none mb-2">SETTINGS</h1>
          <p className="text-slate-600 font-medium text-sm">Manage your account, security and preferences</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleReset}
            title="Revert unsaved changes"
            className="w-14 h-14 bg-white text-slate-600 border border-slate-200 hover:text-slate-900 rounded-xl flex items-center justify-center transition-all shadow-sm group"
          >
            <RotateCcw size={22} className="group-hover:rotate-[-45deg] transition-transform" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn-primary h-14 px-10 shadow-xl shadow-primary-200 flex items-center gap-3 transition-all disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            {isSaving ? 'Saving...' : 'Sync System'}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-700 text-sm font-medium">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Navigation */}
        <div className="lg:col-span-3 space-y-8">
          <div className="card border-none bg-white p-4 shadow-soft rounded-[2.5rem] space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); }}
                className={cn(
                  'w-full flex items-center gap-5 p-5 rounded-[1.75rem] transition-all',
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-premium scale-105'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className={cn('p-2 rounded-xl transition-all duration-700', activeTab === tab.id ? 'bg-white/20 rotate-12' : 'bg-slate-100')}>
                  <tab.icon size={20} className={cn(activeTab === tab.id ? 'text-white' : 'text-slate-500')} />
                </div>
                <span className="text-sm font-bold">{tab.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsSignoutModalOpen(true)}
            className="w-full flex items-center justify-center gap-4 p-6 bg-white border border-slate-100 rounded-[2.5rem] text-sm font-bold text-slate-600 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-soft group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" /> Sign Out
          </button>
        </div>

        {/* Configuration Viewport */}
        <div className="lg:col-span-9">
          <div className="card min-h-[600px] border-none bg-white p-10 md:p-12 rounded-[4rem] shadow-soft relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {/* ── ACCOUNT TAB ── */}
                {activeTab === 'account' && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                      <User className="text-primary-600" size={24} />
                      <h3 className="text-xl font-bold text-slate-900">Account Details</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Your full name' },
                        { label: 'Email Address', key: 'email', type: 'email', placeholder: 'you@example.com' },
                        { label: 'Phone Number', key: 'phone', type: 'tel', placeholder: '9876543210' },
                        { label: 'Location', key: 'location', type: 'text', placeholder: 'City, Country' },
                      ].map(field => (
                        <div key={field.key} className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 ml-1 font-bold">{field.label}</label>
                          {field.type === 'tel' ? (
                            <PhoneInput
                              name={field.key}
                              value={formData.account[field.key]}
                              onChange={(e) => updateAccount(field.key, e.target.value)}
                              className="bg-slate-50 border-slate-200 font-medium text-slate-900"
                            />
                          ) : (
                            <input
                              type={field.type}
                              value={formData.account[field.key]}
                              placeholder={field.placeholder}
                              onChange={(e) => updateAccount(field.key, e.target.value)}
                              className="input-field h-14 bg-slate-50 border-slate-200 font-medium text-slate-900"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── SECURITY TAB ── */}
                {activeTab === 'security' && (
                  <div className="space-y-10">
                    {/* Change Password */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                        <Key className="text-primary-600" size={24} />
                        <h3 className="text-xl font-bold text-slate-900">Update Password</h3>
                      </div>
                      <p className="text-sm text-slate-600">Leave blank if you don't want to change your password.</p>
                      <div className="grid grid-cols-1 gap-6">
                        {[
                          { label: 'Current Password', key: 'currentPassword' },
                          { label: 'New Password', key: 'newPassword' },
                          { label: 'Confirm New Password', key: 'confirmPassword' },
                        ].map(f => (
                          <div key={f.key} className="space-y-2">
                            <label className="text-xs font-bold text-slate-700 ml-1 uppercase tracking-wider">{f.label}</label>
                            <div className="relative">
                              <input
                                type={showPasswords ? 'text' : 'password'}
                                placeholder="••••••••••••"
                                value={formData.security[f.key]}
                                onChange={(e) => updateSecurity(f.key, e.target.value)}
                                className="input-field h-14 bg-slate-50 border-slate-200 font-medium text-slate-900 pr-14"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(!showPasswords)}
                                className="absolute right-4 top-4 text-slate-500 hover:text-slate-800 transition-colors"
                              >
                                {showPasswords ? <EyeOff size={20} /> : <Eye size={20} />}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* 2FA */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                        <ShieldCheck className="text-primary-600" size={24} />
                        <h3 className="text-xl font-bold text-slate-900">Two-Factor Authentication</h3>
                      </div>
                      <div className="flex items-center justify-between p-8 bg-slate-50 border border-slate-100 rounded-2xl group hover:bg-white hover:shadow-xl transition-all">
                        <div>
                          <p className="text-sm font-bold text-slate-900">Multi-Factor Authentication</p>
                          <p className="text-xs font-medium text-slate-600 mt-1">Add an extra layer of security to your account</p>
                        </div>
                        <button
                          onClick={() => updateSecurity('twoFactor', !formData.security.twoFactor)}
                          className={cn('w-14 h-8 rounded-full p-1 transition-all', formData.security.twoFactor ? 'bg-primary-600' : 'bg-slate-200')}
                        >
                          <div className={cn('w-6 h-6 rounded-full bg-white shadow-xl transition-all', formData.security.twoFactor ? 'translate-x-6' : 'translate-x-0')} />
                        </button>
                      </div>
                    </section>

                    {/* Active Sessions */}
                    <section className="space-y-6">
                      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                        <Smartphone className="text-primary-600" size={24} />
                        <h3 className="text-xl font-bold text-slate-900">Active Sessions</h3>
                      </div>
                      <div className="space-y-4">
                        {formData.security.activeSessions.map((session) => (
                          <div key={session.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                            <div className="flex items-center gap-6">
                              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-500 shadow-inner">
                                <Monitor size={20} />
                              </div>
                              <div className="text-left">
                                <p className="text-sm font-bold text-slate-900">{session.device}</p>
                                <p className="text-xs font-medium text-slate-600 mt-1">{session.location} • {session.ip}</p>
                              </div>
                            </div>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">{session.status}</span>
                          </div>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {/* ── NOTIFICATIONS TAB ── */}
                {activeTab === 'notifications' && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                      <Bell className="text-primary-600" size={24} />
                      <h3 className="text-xl font-bold text-slate-900">Notification Preferences</h3>
                    </div>
                    <div className="space-y-4">
                      {[
                        { label: 'Email Notifications', key: 'emailAlerts', sub: 'Receive job updates and alerts via email' },
                        { label: 'Interview Reminders', key: 'interviewAlerts', sub: 'Get notified about upcoming interviews' },
                        { label: 'Offer Alerts', key: 'offerAlerts', sub: 'Be notified when you receive job offers' },
                        { label: 'Job Recommendations', key: 'jobRecommendations', sub: 'AI-curated job opportunities matching your profile' },
                        { label: 'Push Notifications', key: 'pushNotifications', sub: 'Real-time alerts on your device' },
                      ].map(notif => (
                        <div
                          key={notif.key}
                          className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-white hover:shadow-md transition-all group"
                        >
                          <div className="text-left">
                            <p className="text-sm font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{notif.label}</p>
                            <p className="text-xs font-medium text-slate-600 mt-1">{notif.sub}</p>
                          </div>
                          <button
                            onClick={() => updateNotification(notif.key)}
                            className={cn('w-14 h-8 rounded-full p-1 transition-all shrink-0', formData.notifications[notif.key] ? 'bg-slate-900' : 'bg-slate-200')}
                          >
                            <div className={cn('w-6 h-6 rounded-full bg-white shadow-xl transition-all', formData.notifications[notif.key] ? 'translate-x-6' : 'translate-x-0')} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── PREFERENCES TAB ── */}
                {activeTab === 'preferences' && (
                  <div className="space-y-10">
                    <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                      <Settings2 className="text-primary-600" size={24} />
                      <h3 className="text-xl font-bold text-slate-900">Preferences</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {[
                        { label: 'Language', key: 'language', options: ['English', 'Spanish', 'French', 'German', 'Arabic'] },
                        { label: 'Timezone', key: 'timezone', options: ['UTC -8 (Pacific)', 'UTC -5 (Eastern)', 'UTC +0 (GMT)', 'UTC +5:30 (IST)', 'UTC +8 (CST)'] },
                        { label: 'Default Dashboard View', key: 'defaultDashboard', options: ['Overview', 'List View', 'Compact', 'Detailed'] },
                      ].map(pref => (
                        <div key={pref.key} className="space-y-2">
                          <label className="text-xs font-bold text-slate-700 ml-1 font-bold">{pref.label}</label>
                          <select
                            value={formData.preferences[pref.key]}
                            onChange={(e) => updatePreference(pref.key, e.target.value)}
                            className="input-field h-14 px-4 bg-slate-50 border-slate-200 font-medium text-slate-900 appearance-none cursor-pointer"
                          >
                            {pref.options.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Sign Out Modal */}
      <CenterModal isOpen={isSignoutModalOpen} onClose={() => setIsSignoutModalOpen(false)} title="Sign Out">
        <div className="p-12 text-center space-y-10">
          <div className="w-24 h-24 bg-slate-50 rounded-[3rem] flex items-center justify-center mx-auto text-slate-900 shadow-2xl border border-slate-100 font-bold text-3xl">
            HCM
          </div>
          <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Sign Out?</h3>
            <p className="text-sm font-medium text-slate-600 leading-relaxed max-w-sm mx-auto">
              You'll be redirected to the login page. Any unsaved settings will be lost.
            </p>
          </div>
          <div className="flex gap-4 pt-4">
            <button onClick={() => setIsSignoutModalOpen(false)} className="btn-secondary flex-1 py-5">Stay</button>
            <button onClick={handleSignOut} className="btn-primary flex-1 py-5 shadow-xl shadow-primary-200">Sign Out</button>
          </div>
        </div>
      </CenterModal>
    </div>
  );
};

export default CandidateSettings;
