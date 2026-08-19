import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, User, Mail, Briefcase, CheckCircle2, ChevronRight, X, Phone, Globe, ChevronLeft } from 'lucide-react';
import { publicAPI } from '../utils/apiService';

const steps = [
  { id: 'org', title: 'Organization', icon: Building2 },
  { id: 'admin', title: 'Administrator', icon: User },
  { id: 'done', title: 'Complete', icon: CheckCircle2 }
];

export default function TenantSignup() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  
  const selectedPlan = searchParams.get('plan') || 'Trial';
  const selectedBilling = searchParams.get('billing') || 'Monthly';

  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const [formData, setFormData] = useState({
    // Org Info
    organizationName: '',
    industry: 'Technology',
    companySize: '1-50',
    country: 'United States',
    // Admin Info
    adminFullName: '',
    adminEmail: '',
    adminPhone: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleNext = () => {
    if (currentStep === 0) {
      if (!formData.organizationName) {
        setError('Organization name is required');
        return;
      }
    }
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.adminFullName || !formData.adminEmail) {
      setError('Admin name and email are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await publicAPI.registerOrganization({
        ...formData,
        plan: selectedPlan,
        billingCycle: selectedBilling
      });

      if (res.data?.success) {
        setSuccessData(res.data.data);
        setCurrentStep(2); // Move to success step
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to register organization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-xl overflow-hidden relative z-10">
        
        {/* Left Panel - Branding & Steps */}
        <div className="md:col-span-4 bg-slate-900 p-8 text-white flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 bg-indigo-500/20 blur-[50px] rounded-full" />
          
          <Link to="/" className="flex items-center gap-3 mb-12 relative z-10 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg font-bold text-lg">
              H
            </div>
            <span className="font-bold text-xl tracking-tight">HCM Platform</span>
          </Link>

          <div className="relative z-10 flex-1">
            <h2 className="text-2xl font-black mb-2">Create Workspace</h2>
            <p className="text-slate-400 text-sm mb-12">Start your {selectedPlan} plan</p>

            <div className="space-y-8">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentStep;
                const isPast = idx < currentStep;

                return (
                  <div key={step.id} className={`flex items-center gap-4 ${isActive ? 'opacity-100' : isPast ? 'opacity-70' : 'opacity-40'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isActive ? 'border-indigo-500 bg-indigo-500/20 text-indigo-400' : 
                        isPast ? 'border-emerald-500 bg-emerald-500 text-white' : 
                        'border-slate-700 bg-slate-800 text-slate-500'}`}>
                      {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-0.5">Step {idx + 1}</p>
                      <p className={`font-semibold ${isActive ? 'text-white' : 'text-slate-300'}`}>{step.title}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative z-10 mt-12 pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-400">
              Already have an account? <Link to="/login" className="text-indigo-400 font-semibold hover:text-indigo-300 underline underline-offset-2">Sign in</Link>
            </p>
          </div>
        </div>

        {/* Right Panel - Forms */}
        <div className="md:col-span-8 p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3 text-rose-600">
              <X className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-slate-900 mb-2">Tell us about your company</h1>
                  <p className="text-slate-500">We'll use this to set up your dedicated workspace.</p>
                </div>

                <div className="space-y-5 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Company Name *</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" name="organizationName" value={formData.organizationName} onChange={handleChange} 
                        placeholder="Acme Inc."
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Industry</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <select name="industry" value={formData.industry} onChange={handleChange} 
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                          <option value="Technology">Technology</option>
                          <option value="Manufacturing">Manufacturing</option>
                          <option value="Healthcare">Healthcare</option>
                          <option value="Retail">Retail</option>
                          <option value="Finance">Finance</option>
                          <option value="Education">Education</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Company Size</label>
                      <select name="companySize" value={formData.companySize} onChange={handleChange} 
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer">
                        <option value="1-50">1-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="500+">500+ employees</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Country</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" name="country" value={formData.country} onChange={handleChange} 
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-12 flex justify-end">
                  <button onClick={handleNext} className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    Continue <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col"
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Admin Profile</h1>
                  <p className="text-slate-500">This will be the primary administrator for {formData.organizationName || 'your company'}.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5 flex-1">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" name="adminFullName" value={formData.adminFullName} onChange={handleChange} required
                        placeholder="John Doe"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Work Email *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} required
                        placeholder="john@acme.com"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">We will send an invitation email to set your password securely.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input 
                        type="text" name="adminPhone" value={formData.adminPhone} onChange={handleChange} 
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow"
                      />
                    </div>
                  </div>

                  <div className="mt-12 flex items-center justify-between">
                    <button type="button" onClick={handleBack} className="flex items-center gap-2 px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors">
                      <ChevronLeft className="w-5 h-5" /> Back
                    </button>
                    <button type="submit" disabled={loading} className="flex items-center gap-2 px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-70">
                      {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        'Create Workspace'
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {currentStep === 2 && successData && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="h-full flex flex-col items-center justify-center text-center py-12"
              >
                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8 relative">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping" />
                  <CheckCircle2 className="w-12 h-12 relative z-10" />
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Workspace Created!</h1>
                <p className="text-lg text-slate-500 mb-8 max-w-md">
                  We've successfully provisioned <strong className="text-slate-800">{successData.organizationName}</strong>. 
                  An invitation has been sent to <strong className="text-slate-800">{successData.adminEmail}</strong>.
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-md text-left mb-8">
                  <h3 className="font-bold text-amber-800 mb-2">Next Steps:</h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-amber-700">
                    <li>Check your email inbox</li>
                    <li>Click the secure setup link</li>
                    <li>Create your password</li>
                    <li>Login to your new dashboard</li>
                  </ol>
                </div>

                <Link to="/" className="text-indigo-600 font-bold hover:text-indigo-700">
                  Return to Home
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
