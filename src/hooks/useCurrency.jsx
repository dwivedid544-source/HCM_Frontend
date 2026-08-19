import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { DollarSign, IndianRupee, Euro, PoundSterling } from 'lucide-react';

const CurrencyContext = createContext();

// Default static exchange rates (fallback without live API)
// In a real production app, this would be fetched from a live API (e.g., ExchangeRate-API, Fixer.io)
const DEFAULT_EXCHANGE_RATES = {
  'USD': 1,
  'INR': 83.2,
  'EUR': 0.92,
  'GBP': 0.79,
  'AED': 3.67,
};

// Fallback icon for AED
const AEDIcon = (props) => React.createElement(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props
  },
  React.createElement('path', { d: 'M4 10h12' }),
  React.createElement('path', { d: 'M4 14h9' }),
  React.createElement('path', { d: 'M19 6a7.7 7.7 0 0 0-5.2-2M19 22V6' })
);

const GBPIcon = (props) => React.createElement(
  'svg',
  {
    xmlns: 'http://www.w3.org/2000/svg',
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    ...props
  },
  React.createElement('path', { d: 'M18 7c0-5.333-8-5.333-8 0' }),
  React.createElement('path', { d: 'M10 7v14' }),
  React.createElement('path', { d: 'M6 21h12' }),
  React.createElement('path', { d: 'M6 13h10' })
);

export const CurrencyProvider = ({ children }) => {
  const getStoredCurrencySettings = () => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('hcm_settings');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const inferCurrencyCode = (currencyValue) => {
    if (!currencyValue) return 'USD';
    if (currencyValue.includes('INR') || currencyValue.includes('₹')) return 'INR';
    if (currencyValue.includes('EUR') || currencyValue.includes('€')) return 'EUR';
    if (currencyValue.includes('GBP') || currencyValue.includes('£')) return 'GBP';
    if (currencyValue.includes('AED') || currencyValue.includes('د.إ')) return 'AED';
    return 'USD';
  };

  const storedSettings = getStoredCurrencySettings();
  const [masterCurrency, setMasterCurrency] = useState(storedSettings?.masterCurrency || 'USD ($) - US Dollar');
  const [currencyCode, setCurrencyCode] = useState(inferCurrencyCode(storedSettings?.masterCurrency || storedSettings?.defaultCurrency));
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Master Currency from backend on mount
  const fetchMasterCurrency = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
      const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
      const apiUrl = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;
      const response = await axios.get(`${apiUrl}/settings/master-currency`);
      if (response.data?.success && response.data?.data?.currency) {
        const curr = response.data.data.currency;
        setMasterCurrency(curr);
        setCurrencyCode(inferCurrencyCode(curr));
      } else {
        const fallback = getStoredCurrencySettings();
        if (fallback?.masterCurrency) {
          setMasterCurrency(fallback.masterCurrency);
          setCurrencyCode(inferCurrencyCode(fallback.masterCurrency));
        }
      }
    } catch (error) {
      const fallback = getStoredCurrencySettings();
      if (fallback?.masterCurrency) {
        setMasterCurrency(fallback.masterCurrency);
        setCurrencyCode(inferCurrencyCode(fallback.masterCurrency));
      }
      console.error('Failed to fetch master currency', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMasterCurrency();
  }, []);

  const getSymbol = (currencyStr = masterCurrency) => {
    if (currencyStr.includes('₹') || currencyStr.includes('INR')) return '₹';
    if (currencyStr.includes('€') || currencyStr.includes('EUR')) return '€';
    if (currencyStr.includes('£') || currencyStr.includes('GBP')) return '£';
    if (currencyStr.includes('د.إ') || currencyStr.includes('AED')) return 'د.إ';
    return '$';
  };

  const getIcon = () => {
    if (currencyCode === 'INR') return IndianRupee;
    if (currencyCode === 'EUR') return Euro;
    if (currencyCode === 'GBP') return GBPIcon;
    if (currencyCode === 'AED') return AEDIcon;
    return DollarSign;
  };

  /**
   * Converts a numeric amount from an original currency to the current master currency.
   * If originalCurrency is not provided, assumes it's already in the correct currency.
   */
  const convertAmount = (amount, originalCurrencyCode = null) => {
    if (!amount || isNaN(amount)) return 0;
    
    // If no original currency specified or it's the same, no conversion needed
    if (!originalCurrencyCode || originalCurrencyCode === currencyCode) {
      return Number(amount);
    }

    // Convert from original -> USD -> Target
    const baseRate = DEFAULT_EXCHANGE_RATES[originalCurrencyCode] || 1;
    const targetRate = DEFAULT_EXCHANGE_RATES[currencyCode] || 1;
    
    const amountInUSD = Number(amount) / baseRate;
    const convertedAmount = amountInUSD * targetRate;
    
    return convertedAmount;
  };

  /**
   * Formats a given amount into the master currency string (e.g., ₹85,000 or $1,020.50).
   * @param {number|string} amount - The amount to format
   * @param {string} originalCurrencyCode - Optional original currency code to convert from before formatting
   */
  const formatCurrency = (amount, originalCurrencyCode = null) => {
    if (amount === undefined || amount === null || isNaN(amount)) return '-';
    
    const convertedAmount = convertAmount(amount, originalCurrencyCode);
    const symbol = getSymbol(masterCurrency);
    let formattedVal;
    
    if (currencyCode === 'INR') {
      formattedVal = convertedAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (currencyCode === 'EUR') {
      formattedVal = convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (currencyCode === 'GBP') {
      formattedVal = convertedAmount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else if (currencyCode === 'AED') {
      formattedVal = convertedAmount.toLocaleString('en-AE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } else {
      formattedVal = convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }
    
    return `${symbol}${formattedVal}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        masterCurrency,
        currencyCode,
        getSymbol,
        getIcon,
        convertAmount,
        formatCurrency,
        refreshCurrency: fetchMasterCurrency,
        isLoading
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};
