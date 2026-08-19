import { DollarSign, IndianRupee, Euro, PoundSterling } from 'lucide-react';
// Note: PoundSterling might not exist in older lucide-react versions, if it doesn't we fallback or use text. But lucide-react has PoundSterling and JapaneseYen. We will just use strings or basic icons.
// Actually, let's stick to the generic DollarSign or specific ones if available.
import React from 'react';

// Custom AED icon component since lucide-react doesn't have it natively
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

export const getCurrencySymbol = (defaultCurrency = null) => {
  if (!defaultCurrency) {
    try {
      const stored = localStorage.getItem('hcm_settings');
      if (stored) {
        defaultCurrency = JSON.parse(stored).defaultCurrency || 'USD';
      } else {
        defaultCurrency = 'USD';
      }
    } catch (e) {
      defaultCurrency = 'USD';
    }
  }

  if (defaultCurrency.includes('₹') || defaultCurrency.includes('INR')) return '₹';
  if (defaultCurrency.includes('€') || defaultCurrency.includes('EUR')) return '€';
  if (defaultCurrency.includes('£') || defaultCurrency.includes('GBP')) return '£';
  if (defaultCurrency.includes('د.إ') || defaultCurrency.includes('AED')) return 'د.إ';
  return '$';
};

export const formatCurrency = (amount, defaultCurrency = null) => {
  const symbol = getCurrencySymbol(defaultCurrency);
  if (amount === undefined || amount === null || isNaN(amount)) return '-';
  
  let formattedVal;
  const numAmount = Number(amount);
  
  if (symbol === '₹') {
    formattedVal = numAmount.toLocaleString('en-IN');
  } else if (symbol === '€') {
    formattedVal = numAmount.toLocaleString('de-DE');
  } else if (symbol === '£') {
    formattedVal = numAmount.toLocaleString('en-GB');
  } else if (symbol === 'د.إ') {
    formattedVal = numAmount.toLocaleString('en-AE');
  } else {
    formattedVal = numAmount.toLocaleString('en-US');
  }
  
  return `${symbol}${formattedVal}`;
};

export const getCurrencyIcon = (defaultCurrency = null) => {
  if (!defaultCurrency) {
    try {
      const stored = localStorage.getItem('hcm_settings');
      if (stored) {
        defaultCurrency = JSON.parse(stored).defaultCurrency || 'USD';
      } else {
        defaultCurrency = 'USD';
      }
    } catch (e) {
      defaultCurrency = 'USD';
    }
  }

  if (defaultCurrency.includes('₹') || defaultCurrency.includes('INR')) return IndianRupee;
  if (defaultCurrency.includes('€') || defaultCurrency.includes('EUR')) return Euro;
  if (defaultCurrency.includes('£') || defaultCurrency.includes('GBP')) return GBPIcon;
  if (defaultCurrency.includes('د.إ') || defaultCurrency.includes('AED')) return AEDIcon;
  return DollarSign;
};
