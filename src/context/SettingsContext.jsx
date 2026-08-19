import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../utils/apiService';
import toast, { Toaster } from 'react-hot-toast';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const getStoredSettings = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('hcm_settings');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const [settings, setSettings] = useState(() => {
    const stored = getStoredSettings();
    return stored || {
      defaultCurrency: 'USD',
      defaultPhoneCountry: '+91',
      dateFormat: 'DD/MM/YYYY',
      defaultTimezone: 'UTC+00:00 (London)',
      masterCurrency: 'USD ($) - US Dollar'
    };
  });
  const [loadingSettings, setLoadingSettings] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const { data } = await settingsAPI.getSettings();
      if (data?.data) {
        const nextSettings = { ...settings, ...data.data };
        setSettings(nextSettings);
        localStorage.setItem('hcm_settings', JSON.stringify(nextSettings));
      }
    } catch (error) {
      const fallback = getStoredSettings();
      if (fallback) {
        setSettings(fallback);
      }
      console.error('Failed to fetch global settings:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const updateSettings = async (newSettings) => {
    const merged = { ...settings, ...(newSettings || {}) };
    setSettings(merged);
    localStorage.setItem('hcm_settings', JSON.stringify(merged));

    try {
      const { data } = await settingsAPI.updateSettings(newSettings);
      if (data?.data) {
        const nextSettings = { ...merged, ...data.data };
        setSettings(nextSettings);
        localStorage.setItem('hcm_settings', JSON.stringify(nextSettings));
        toast.success(data.message || 'Settings updated globally!');
      } else {
        toast.success('Settings saved locally.');
      }
    } catch (error) {
      toast.success('Settings saved locally.');
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loadingSettings }}>
      <Toaster position="bottom-right" toastOptions={{ duration: 4000, style: { background: `#1e293b`, color: `#fff`, borderRadius: `1rem` } }} />
      {children}
    </SettingsContext.Provider>
  );
};
