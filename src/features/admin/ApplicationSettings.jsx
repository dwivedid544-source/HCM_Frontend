import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Globe, Phone, Save, RotateCcw } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

const ApplicationSettings = () => {
  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();

  const { settings, updateSettings, loadingSettings } = useSettings();
  const [formData, setFormData] = useState({
    defaultCurrency: 'USD',
    defaultPhoneCountry: '+91'
  });

  useEffect(() => {
    if (settings) {
      setFormData({
        defaultCurrency: settings.defaultCurrency || 'USD',
        defaultPhoneCountry: settings.defaultPhoneCountry || '+91'
      });
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings(formData);
  };

  const handleReset = () => {
    if (settings) {
      setFormData({
        defaultCurrency: settings.defaultCurrency || 'USD',
        defaultPhoneCountry: settings.defaultPhoneCountry || '+91'
      });
    }
  };

  if (loadingSettings) {
    return <div className="p-8 text-center text-slate-500 font-bold">Loading Settings...</div>;
  }

  return (
    <div className="space-y-8 pb-12 animate-fade-in focus:outline-none h-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="hcm-page-title">Global Application Settings</h1>
          <p className="text-slate-500 font-medium tracking-tight">Configure default currency and phone formats across the entire platform.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
            <RotateCcw size={18} />
            <span>Reset</span>
          </button>
          <button onClick={handleSave} className="btn-primary px-8 py-3 font-bold flex items-center gap-2 shadow-xl shadow-primary-200 active:scale-95 transition-transform">
             <Save size={18} />
             <span>Save Settings</span>
          </button>
        </div>
      </div>

      <div className="card p-10 space-y-10 max-w-4xl">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-50">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
             <Globe size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Global Formats</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-2">
             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Default Currency</label>
             <select 
               value={formData.defaultCurrency} 
               onChange={e => setFormData({...formData, defaultCurrency: e.target.value})} 
               className="input-field h-14 bg-slate-50 border-transparent font-bold text-slate-700 notranslate"
             >
                <option value="INR">Indian Rupee (INR ₹)</option>
                <option value="USD">US Dollar (USD $)</option>
                <option value="EUR">Euro (EUR €)</option>
                <option value="GBP">British Pound (GBP £)</option>
                <option value="AED">UAE Dirham (AED د.إ)</option>
             </select>
          </div>
          <div className="space-y-2">
             <label className="text-[10px] font-extrabold text-slate-400 font-bold px-1">Default Phone Country</label>
             <div className="relative">
                <Phone className="absolute left-4 top-4 text-slate-300" size={18} />
                <select 
                  value={formData.defaultPhoneCountry} 
                  onChange={e => setFormData({...formData, defaultPhoneCountry: e.target.value})} 
                  className="input-field h-14 pl-12 bg-slate-50 border-transparent font-bold text-slate-700 notranslate"
                >
                   <option value="+91">India (+91)</option>
                   <option value="+1">United States (+1)</option>
                   <option value="+44">United Kingdom (+44)</option>
                   <option value="+971">United Arab Emirates (+971)</option>
                   <option value="+49">Germany (+49)</option>
                </select>
             </div>
          </div>
        </div>
      </div>
      
      <div className="bg-blue-50 text-blue-800 p-6 rounded-2xl border border-blue-100 mt-8 max-w-4xl">
        <h4 className="font-bold mb-2">How to add more countries/currencies in the future?</h4>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li><strong>Currencies:</strong> Update the select options above. Then go to <code>src/utils/currencyHelper.js</code> and add the new symbol/code to the <code>getSymbol</code>, <code>formatCurrency</code>, and <code>getIcon</code> functions.</li>
          <li><strong>Phone Codes:</strong> Simply add the new country code to the select options above. The <code>PhoneInput.jsx</code> component automatically uses whatever code is saved here.</li>
        </ul>
      </div>

    </div>
  );
};

export default ApplicationSettings;
