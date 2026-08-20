// ============================================================
// usePersistedTab.js - Universal Navigation & Tab Persistence Hook
// ============================================================
// Preserves active tabs, sub-sections, and view modes across
// navigation, component unmounting, and page reloads.
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Hook to persist tab/filter/view state across navigation.
 * 
 * @param {string} storageKey - Unique key for this dashboard/feature
 * @param {string} defaultTab - Fallback tab if none is saved
 * @param {string} urlParam - Optional URL search param name (default: 'tab')
 * @returns {[string, (tab: string) => void]} [activeTab, setActiveTab]
 */
export function usePersistedTab(storageKey, defaultTab, urlParam = 'tab') {
  const [searchParams, setSearchParams] = useSearchParams();

  // Get initial value from URL or localStorage or default
  const getInitialTab = useCallback(() => {
    // 1. Check URL query param first
    const fromUrl = searchParams.get(urlParam);
    if (fromUrl) return fromUrl;

    // 2. Check localStorage
    try {
      const fromStorage = localStorage.getItem(`hcm_tab_${storageKey}`);
      if (fromStorage) return fromStorage;
    } catch (e) {
      console.warn('localStorage read error:', e);
    }

    return defaultTab;
  }, [searchParams, urlParam, storageKey, defaultTab]);

  const [activeTab, setActiveTabState] = useState(getInitialTab);

  // Set active tab & persist to both localStorage and URL params
  const setActiveTab = useCallback((tab) => {
    setActiveTabState(tab);

    // 1. Save in localStorage
    try {
      localStorage.setItem(`hcm_tab_${storageKey}`, tab);
    } catch (e) {
      console.warn('localStorage write error:', e);
    }

    // 2. Sync URL search parameter smoothly without full reload
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (tab === defaultTab) {
        next.delete(urlParam);
      } else {
        next.set(urlParam, tab);
      }
      return next;
    }, { replace: true });
  }, [storageKey, defaultTab, urlParam, setSearchParams]);

  // Sync if URL search parameter changes externally (e.g. browser back/forward)
  useEffect(() => {
    const fromUrl = searchParams.get(urlParam);
    if (fromUrl && fromUrl !== activeTab) {
      setActiveTabState(fromUrl);
      try {
        localStorage.setItem(`hcm_tab_${storageKey}`, fromUrl);
      } catch (e) {}
    }
  }, [searchParams, urlParam, storageKey, activeTab]);

  return [activeTab, setActiveTab];
}

export default usePersistedTab;
