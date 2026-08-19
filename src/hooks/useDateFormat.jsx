import { useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';

export const useDateFormat = () => {
  // Read dateFormat from SettingsContext (global — available to ALL roles)
  // This is fetched from the backend GlobalSettings table on app load.
  let dateFormatSetting = 'DD/MM/YYYY';
  try {
    const { settings } = useSettings();
    if (settings?.dateFormat) {
      dateFormatSetting = settings.dateFormat;
    }
  } catch {
    // Fallback: if SettingsContext is not available, try localStorage
    try {
      const stored = localStorage.getItem('hcm_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.dateFormat) dateFormatSetting = parsed.dateFormat;
      }
    } catch { /* ignore */ }
  }

  const formatDate = useCallback((dateInput) => {
    if (!dateInput) return '';
    
    const date = new Date(dateInput);
    // Check for invalid date
    if (isNaN(date.getTime())) return dateInput;

    const format = dateFormatSetting;

    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();

    switch (format) {
      case 'DD/MM/YYYY':
        return `${dd}/${mm}/${yyyy}`;
      case 'YYYY-MM-DD':
        return `${yyyy}-${mm}-${dd}`;
      case 'MM/DD/YYYY':
      default:
        return `${mm}/${dd}/${yyyy}`;
    }
  }, [dateFormatSetting]);

  return { formatDate };
};
