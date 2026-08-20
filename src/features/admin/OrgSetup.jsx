import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import {
   Building2,
   Upload,
   Globe,
   MapPin,
   Mail,
   Phone,
   CreditCard,
   Clock,
   Globe2,
   Hash,
   Save,
   RotateCcw,
   CheckCircle2,
   Trash2
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useAdmin } from '../../context/AdminContext';
import { adminAPI, uploadAPI } from '../../utils/apiService';
import PhoneInput from '../../shared/components/ui/PhoneInput';

const ORG_STORAGE_KEY = 'hcm_org_config';

const defaultOrgData = {
   companyName: '',
   legalName: '',
   websiteUrl: '',
   industry: '',
   companySize: '',
   taxId: '',
   primaryEmail: '',
   supportPhone: '',
   timezone: '',
   currency: '',
   hqAddress: '',
   logo: ''
};

const fieldExamples = {
   companyName: 'Your Company Name',
   legalName: 'Registered Legal Entity Name',
   websiteUrl: 'https://www.example.com',
   industry: 'Select your industry',
   companySize: 'Select company size',
   taxId: 'XX0000000',
   primaryEmail: 'contact@example.com',
   supportPhone: '+1 (000) 000-0000',
   timezone: 'Select your timezone',
   currency: 'Select your currency',
   hqAddress: 'Street, City, State, ZIP, Country',
};

const examplePlaceholder = (field) => `e.g. ${fieldExamples[field]}`;

const PLACEHOLDER_LOGO_PATTERN = /images\.unsplash\.com/i;

const sanitizeLogo = (logo) => {
   if (!logo || typeof logo !== 'string') return '';
   return PLACEHOLDER_LOGO_PATTERN.test(logo) ? '' : logo;
};

const mapOrgFromApi = (org) => ({
   companyName: org.name || '',
   legalName: org.legalName || '',
   websiteUrl: org.websiteUrl || '',
   industry: org.industry || '',
   companySize: org.companySize || '',
   taxId: org.taxId || '',
   primaryEmail: org.primaryEmail || '',
   supportPhone: org.supportPhone || '',
   timezone: org.timezone || '',
   currency: org.currency || '',
   hqAddress: org.address || '',
   logo: sanitizeLogo(org.logoUrl),
});

const mapOrgToApi = (data) => {
   const logo = sanitizeLogo(data.logo);
   return {
      name: data.companyName?.trim() || undefined,
      legalName: data.legalName?.trim() || undefined,
      websiteUrl: data.websiteUrl?.trim() || undefined,
      industry: data.industry?.trim() || undefined,
      companySize: data.companySize?.trim() || undefined,
      taxId: data.taxId?.trim() || undefined,
      primaryEmail: data.primaryEmail?.trim() || undefined,
      supportPhone: data.supportPhone?.trim() || undefined,
      timezone: data.timezone?.trim() || undefined,
      currency: data.currency?.trim() || undefined,
      address: data.hqAddress?.trim() || undefined,
      logoUrl: logo || null,
   };
};

const isOrgDataEmpty = (data) =>
   Object.entries(data).every(([key, value]) => {
      if (key === 'logo') {
         return !value || (typeof value === 'string' && value.trim() === '');
      }
      if (value == null) return true;
      if (typeof value === 'string') return value.trim() === '';
      return false;
   });

const OrgSetup = () => {
   const { showToast } = useAdmin();

   const [orgData, setOrgData] = useState(defaultOrgData);
   const [orgId, setOrgId] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [isSaving, setIsSaving] = useState(false);
   const fileInputRef = useRef(null);

   const triggerFileInput = () => {
      fileInputRef.current?.click();
   };

   const isFormEmpty = useMemo(() => isOrgDataEmpty(orgData), [orgData]);

   useEffect(() => {
      const loadOrganization = async () => {
         try {
            const response = await adminAPI.getOrganization();
            const org = response.data?.data;

            if (org?.id) {
               setOrgId(org.id);
               setOrgData(mapOrgFromApi(org));
            }
         } catch (err) {
            console.error('Failed to load organization from database:', err);
         } finally {
            setIsLoading(false);
         }
      };

      loadOrganization();
   }, []);

   const handleChange = (e) => {
      const { name, value } = e.target;
      setOrgData(prev => ({
         ...prev,
         [name]: value
      }));
   };

   const handleReset = (e) => {
      e.preventDefault();
      const resetData = { ...defaultOrgData };
      setOrgData(resetData);
      localStorage.removeItem(ORG_STORAGE_KEY);
      window.dispatchEvent(new CustomEvent('hcm_global_sync'));
      showToast('All fields cleared', 'success');
   };

   const handleSave = async (e) => {
      e.preventDefault();

      if (isOrgDataEmpty(orgData)) {
         window.alert('Please fill in at least one field before saving.');
         showToast('Please fill in at least one field before saving.', 'error');
         return;
      }

      setIsSaving(true);
      try {
         let existingOrgId = orgId;
         if (!existingOrgId) {
            const existing = await adminAPI.getOrganization();
            existingOrgId = existing.data?.data?.id || null;
            if (existingOrgId) setOrgId(existingOrgId);
         }

         const payload = mapOrgToApi(orgData);
         const response = existingOrgId
            ? await adminAPI.updateOrganization(existingOrgId, payload)
            : await adminAPI.createOrganization(payload);

         const savedOrg = response.data?.data;
         if (savedOrg?.id) {
            setOrgId(savedOrg.id);
            const syncedData = mapOrgFromApi(savedOrg);
            setOrgData(syncedData);
            localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(syncedData));
         } else {
            localStorage.setItem(ORG_STORAGE_KEY, JSON.stringify(orgData));
         }

         showToast('Organization configuration saved successfully!', 'success');
         window.dispatchEvent(new CustomEvent('hcm_global_sync'));
      } catch (err) {
         console.error('Failed to save organization:', err);
         const message = err.response?.data?.error?.message
            || (err.code === 'ERR_NETWORK' ? 'Cannot connect to server. Please ensure the backend is running on port 5000.' : null)
            || 'Failed to save organization configuration to database.';
         window.alert(message);
         showToast(message, 'error');
      } finally {
         setIsSaving(false);
      }
   };

   const handleLogoUpload = async (e) => {
      const file = e.target.files[0];
      if (file) {
         if (file.size > 5 * 1024 * 1024) {
            showToast('Logo file size must be less than 5MB', 'error');
            return;
         }

         try {
            // Upload to cloud (Cloudinary) via backend API
            const response = await uploadAPI.uploadImage(file, 'hcm/logos');
            const cloudUrl = response.data?.data?.url;

            if (cloudUrl) {
               setOrgData(prev => ({
                  ...prev,
                  logo: cloudUrl
               }));
               showToast(`Logo uploaded to ${response.data?.data?.provider || 'cloud'} successfully!`, 'success');
            } else {
               throw new Error('No URL returned');
            }
         } catch (err) {
            console.error('Cloud upload failed, using base64 fallback:', err);
            // Fallback: read as base64 (backend will handle the upload)
            const reader = new FileReader();
            reader.onload = (uploadEvent) => {
               setOrgData(prev => ({
                  ...prev,
                  logo: uploadEvent.target.result
               }));
               showToast('Logo uploaded (will be processed on save)', 'success');
            };
            reader.readAsDataURL(file);
         }
      }
   };

   const handleRemoveLogo = () => {
      setOrgData(prev => ({
         ...prev,
         logo: null
      }));
      showToast('Company logo removed', 'info');
   };

   return (
      <div className="space-y-8 pb-12 animate-fade-in relative text-left">
         {/* Header */}
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
               <h1 className="hcm-page-title">Organization Setup</h1>
               <p className="hcm-page-subtitle">Configure core company information and regional preferences</p>
            </div>
            <div className="flex items-center gap-3">
               <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary flex items-center gap-2"
               >
                  <RotateCcw size={18} />
                  <span>Reset</span>
               </button>
               <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || isLoading || isFormEmpty}
                  className={cn(
                     "btn-primary flex items-center gap-2 shadow-xl shadow-primary-500/20 transition-all",
                     (isSaving || isLoading || isFormEmpty) && "opacity-50 cursor-not-allowed"
                  )}
               >
                  {isSaving ? (
                     <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                     <Save size={18} />
                  )}
                  <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
               </button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Form Area */}
            <div className="lg:col-span-8 space-y-4">
               <div className="card">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                     <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Building2 size={20} />
                     </div>
                     <h3 className="hcm-section-heading">General Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] font-bold mb-1.5 block">Company Name</label>
                        <div className="relative group">
                           <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 group-focus-within:text-primary-600 transition-colors" size={18} />
                           <input
                              type="text"
                              name="companyName"
                              value={orgData.companyName}
                              onChange={handleChange}
                              placeholder={examplePlaceholder('companyName')}
                              className="input-field h-11 pl-12 font-bold"
                           />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] font-bold mb-1.5 block">Legal Name</label>
                        <input
                           type="text"
                           name="legalName"
                           value={orgData.legalName}
                           onChange={handleChange}
                           placeholder={examplePlaceholder('legalName')}
                           className="input-field h-11 font-bold"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Website URL</label>
                        <div className="relative group">
                           <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors" size={18} />
                           <input
                              type="text"
                              name="websiteUrl"
                              value={orgData.websiteUrl}
                              onChange={handleChange}
                              placeholder={examplePlaceholder('websiteUrl')}
                              className="input-field h-11 pl-12 font-bold"
                           />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Industry</label>
                        <select
                           name="industry"
                           value={orgData.industry}
                           onChange={handleChange}
                           className="input-field h-11 font-bold text-slate-700 dark:text-slate-300"
                        >
                           <option value="">{examplePlaceholder('industry')}</option>
                           <option value="Information Technology">Information Technology</option>
                           <option value="Financial Services">Financial Services</option>
                           <option value="Healthcare">Healthcare</option>
                           <option value="Retail">Retail</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Company Size</label>
                        <select
                           name="companySize"
                           value={orgData.companySize}
                           onChange={handleChange}
                           className="input-field h-11 font-bold text-slate-700 dark:text-slate-300"
                        >
                           <option value="">{examplePlaceholder('companySize')}</option>
                           <option value="1-50 Employees">1-50 Employees</option>
                           <option value="51-200 Employees">51-200 Employees</option>
                           <option value="201-1000 Employees">201-1000 Employees</option>
                           <option value="1000+ Employees">1000+ Employees</option>
                        </select>
                     </div>
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Tax ID / GSTIN</label>
                        <div className="relative group">
                           <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 transition-colors" size={18} />
                           <input
                              type="text"
                              name="taxId"
                              value={orgData.taxId}
                              onChange={handleChange}
                              placeholder={examplePlaceholder('taxId')}
                              className="input-field h-11 pl-12 font-bold"
                           />
                        </div>
                     </div>
                  </div>
               </div>

               {/* Regional & Contact Settings */}
               <div className="card">
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                     <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 rounded-xl">
                        <Globe2 size={20} />
                     </div>
                     <h3 className="hcm-section-heading">Regional & Contact Preferences</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Primary Email</label>
                        <div className="relative group">
                           <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                           <input
                              type="email"
                              name="primaryEmail"
                              value={orgData.primaryEmail}
                              onChange={handleChange}
                              placeholder={examplePlaceholder('primaryEmail')}
                              className="input-field h-11 pl-12 font-bold"
                           />
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Support Phone</label>
                        <PhoneInput
                           name="supportPhone"
                           value={orgData.supportPhone}
                           onChange={handleChange}
                           className="h-11 font-bold"
                        />
                     </div>
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Default Timezone</label>
                        <div className="relative group">
                           <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                           <select
                              name="timezone"
                              value={orgData.timezone}
                              onChange={handleChange}
                              className="input-field h-11 pl-12 font-bold text-slate-700 dark:text-slate-300"
                           >
                              <option value="">{examplePlaceholder('timezone')}</option>
                              <option value="UTC-08:00 (Pacific Time)">UTC-08:00 (Pacific Time)</option>
                              <option value="UTC+00:00 (GMT)">UTC+00:00 (GMT)</option>
                              <option value="UTC+05:30 (India Standard Time)">UTC+05:30 (India Standard Time)</option>
                           </select>
                        </div>
                     </div>
                     <div className="space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Currency</label>
                        <div className="relative group">
                           <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={18} />
                           <select
                              name="currency"
                              value={orgData.currency}
                              onChange={handleChange}
                              className="input-field h-11 pl-12 font-bold text-slate-700 dark:text-slate-300"
                           >
                              <option value="">{examplePlaceholder('currency')}</option>
                              <option value="USD ($)">USD ($)</option>
                              <option value="EUR (€)">EUR (€)</option>
                              <option value="INR (₹)">INR (₹)</option>
                           </select>
                        </div>
                     </div>
                     <div className="md:col-span-2 space-y-1.5">
                        <label className="form-label text-[10px] uppercase tracking-widest mb-1.5 block">Headquarters Address</label>
                        <div className="relative group">
                           <MapPin className="absolute left-4 top-4 text-slate-400 dark:text-slate-500" size={18} />
                           <textarea
                              name="hqAddress"
                              value={orgData.hqAddress}
                              onChange={handleChange}
                              className="input-field min-h-[80px] pl-12 py-3 font-bold resize-none"
                              placeholder={examplePlaceholder('hqAddress')}
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Sidebar / Upload */}
            <div className="lg:col-span-4 space-y-4">
               <div className="card flex flex-col items-center">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 w-full">Company Logo</h3>

                  <input 
                     type="file" 
                     ref={fileInputRef} 
                     accept="image/*" 
                     onChange={handleLogoUpload} 
                     className="hidden" 
                  />

                  {orgData.logo ? (
                     <div className="flex flex-col items-center gap-4 w-full">
                        <div 
                           onClick={triggerFileInput}
                           className="relative w-32 h-32 rounded-[2rem] overflow-hidden group cursor-pointer border border-slate-100 dark:border-slate-800 shadow-md"
                        >
                           <img 
                              src={orgData.logo} 
                              alt="Company Logo" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                           />
                           <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-all duration-300 text-white">
                              <Upload size={20} className="animate-bounce" />
                              <span className="text-[9px] font-black uppercase tracking-wider">Change Logo</span>
                           </div>
                        </div>
                        <button
                           onClick={handleRemoveLogo}
                           className="btn-danger text-xs flex items-center gap-2 py-2 px-4 hover:scale-95 transition-all"
                        >
                           <Trash2 size={14} />
                           <span>Remove Logo</span>
                        </button>
                     </div>
                  ) : (
                     <div 
                        onClick={triggerFileInput}
                        className="w-32 h-32 bg-slate-50 dark:bg-slate-800 rounded-[2rem] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-4 group cursor-pointer hover:border-primary-500 dark:hover:border-primary-600 hover:bg-primary-50/20 dark:hover:bg-primary-950/10 transition-all relative"
                     >
                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-slate-350 dark:text-slate-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-all duration-300">
                           <Upload size={24} />
                        </div>
                        <span className="text-[9px] font-extrabold text-slate-450 dark:text-slate-550 font-bold mt-4 text-center">Click to Upload</span>
                     </div>
                  )}

                  <p className="text-[10px] font-medium text-slate-450 dark:text-slate-500 mt-4 text-center px-4 leading-relaxed tracking-tight italic">Preferred format: PNG or SVG (Max 5MB). Logo will be used in payslips and invoices.</p>
               </div>

               <div className="card bg-indigo-600 dark:bg-indigo-950/30 text-white dark:text-indigo-200 border-none shadow-soft relative overflow-hidden group">
                  <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none group-hover:scale-110 transition-transform">
                     <CheckCircle2 size={140} />
                  </div>
                  <h3 className="text-xs font-extrabold font-bold text-indigo-300 dark:text-indigo-400 mb-4">Setup Progress</h3>
                  <div className="space-y-4 relative z-10">
                     {[
                        { label: 'Organization Profile', done: !!(orgData.companyName && orgData.legalName) },
                        { label: 'Branding & Identity', done: !!orgData.logo },
                        { label: 'Regional Preferences', done: !!(orgData.timezone && orgData.currency) },
                        { label: 'Billing Setup', done: false },
                     ].map((step, i) => (
                        <div key={i} className="flex items-center gap-3 group/step">
                           <div className={cn("w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all group-hover/step:scale-110 text-[10px]", step.done ? "bg-white dark:bg-slate-900 border-white dark:border-slate-800 text-indigo-600 dark:text-indigo-400 shadow-lg" : "border-white/20 dark:border-indigo-850 text-white/40 dark:text-indigo-800")}>
                              {step.done ? <CheckCircle2 size={12} /> : i + 1}
                           </div>
                           <span className={cn("text-xs font-bold transition-opacity", step.done ? "text-white dark:text-white" : "text-white/40 dark:text-slate-600")}>{step.label}</span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default OrgSetup;
