import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminAPI } from '../../utils/apiService';
import { useAuth } from '../../hooks/useAuth';
import { 
  Building2, Users, FileText, Calendar as CalendarIcon, 
  CheckCircle2, ChevronRight, Loader2, Sparkles, Send, SkipForward
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const steps = [
  { id: 'welcome', icon: Sparkles, title: 'Welcome to HCM' },
  { id: 'review', icon: Building2, title: 'Review Settings' },
  { id: 'invite', icon: Users, title: 'Invite Team' }
];

export default function OrgSetupWizard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [invites, setInvites] = useState([{ email: '', role: 'EMPLOYEE' }]);

  const handleInviteChange = (index, field, value) => {
    const newInvites = [...invites];
    newInvites[index][field] = value;
    setInvites(newInvites);
  };

  const addInvite = () => {
    setInvites([...invites, { email: '', role: 'EMPLOYEE' }]);
  };

  const removeInvite = (index) => {
    const newInvites = [...invites];
    newInvites.splice(index, 1);
    setInvites(newInvites);
  };

  const completeSetup = async () => {
    setLoading(true);
    try {
      // Send invites if any
      const validInvites = invites.filter(i => i.email.trim() !== '');
      if (validInvites.length > 0) {
        // Mocking invite API since we don't have bulk invite in this PR yet
        // In real app, call adminAPI.bulkInvite(validInvites)
      }
      
      // Update org setup status to complete
      await adminAPI.completeOrgSetup(user.organizationId);
      
      // Navigate to dashboard
      window.location.href = '/admin/dashboard';
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[80vh] bg-slate-900 flex items-center justify-center relative rounded-3xl overflow-hidden p-4">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden relative z-10 flex flex-col md:flex-row h-[600px]"
      >
        {/* Left Sidebar */}
        <div className="w-full md:w-1/3 bg-slate-50 border-r border-slate-100 p-8 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-8 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">Workspace Setup</h2>
            <p className="text-sm text-slate-500 mb-8">Let's get your organization ready for your team.</p>

            <div className="space-y-6">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isActive = idx === currentStep;
                const isPast = idx < currentStep;

                return (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                      ${isActive ? 'border-indigo-500 bg-indigo-50 text-indigo-600' : 
                        isPast ? 'border-emerald-500 bg-emerald-500 text-white' : 
                        'border-slate-200 bg-slate-100 text-slate-400'}`}>
                      {isPast ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className={`font-bold text-sm ${isActive ? 'text-slate-900' : isPast ? 'text-slate-700' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="w-full md:w-2/3 p-8 md:p-12 flex flex-col">
          <AnimatePresence mode="wait">
            {currentStep === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center">
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 mb-4">Workspace Provisioned Successfully!</h1>
                <p className="text-lg text-slate-500 leading-relaxed mb-8">
                  We've automatically seeded your workspace with industry-standard defaults, including departments, shifts, payroll configurations, and leave policies.
                </p>
                
                <div className="grid grid-cols-2 gap-4 mb-12">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span className="font-medium text-slate-700">Departments Setup</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span className="font-medium text-slate-700">Leave Policies</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span className="font-medium text-slate-700">Payroll Cycles</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" /> <span className="font-medium text-slate-700">Approval Workflows</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={() => setCurrentStep(1)} className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2">
                    Review Settings <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col justify-center">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Review Default Settings</h1>
                <p className="text-slate-500 mb-8">You can always customize these later in your Admin Settings.</p>
                
                <div className="space-y-4 flex-1 overflow-y-auto pr-2">
                  <div className="p-5 border border-slate-200 rounded-2xl flex items-start gap-4 bg-white hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <CalendarIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Work Calendar</h3>
                      <p className="text-sm text-slate-500">Standard 5-day work week (Mon-Fri) with Saturday & Sunday marked as full days off.</p>
                    </div>
                  </div>
                  <div className="p-5 border border-slate-200 rounded-2xl flex items-start gap-4 bg-white hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Standard Leave Policy</h3>
                      <p className="text-sm text-slate-500">21 days Annual Paid Leave, 12 days Sick Leave, 6 days Casual Leave.</p>
                    </div>
                  </div>
                  <div className="p-5 border border-slate-200 rounded-2xl flex items-start gap-4 bg-white hover:border-indigo-200 hover:shadow-md transition-all">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 mb-1">Approval Workflows</h3>
                      <p className="text-sm text-slate-500">Leave requests automatically route to Manager, then HR for final approval.</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button onClick={() => setCurrentStep(2)} className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2">
                    Looks Good <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex-1 flex flex-col h-full">
                <div className="mb-6">
                  <h1 className="text-2xl font-bold text-slate-900 mb-2">Invite Your Team</h1>
                  <p className="text-slate-500">Send invitations to your managers and employees so they can access the workspace.</p>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {invites.map((invite, index) => (
                    <div key={index} className="flex gap-3 items-start">
                      <input 
                        type="email" 
                        value={invite.email} 
                        onChange={(e) => handleInviteChange(index, 'email', e.target.value)}
                        placeholder="colleague@company.com"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      />
                      <select 
                        value={invite.role}
                        onChange={(e) => handleInviteChange(index, 'role', e.target.value)}
                        className="w-40 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      >
                        <option value="MANAGER">Manager</option>
                        <option value="HR">HR</option>
                        <option value="EMPLOYEE">Employee</option>
                      </select>
                      {invites.length > 1 && (
                        <button onClick={() => removeInvite(index)} className="p-3 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
                          <CheckCircle2 className="w-5 h-5 rotate-45" /> {/* Use as X */}
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button onClick={addInvite} className="text-sm font-bold text-indigo-600 hover:text-indigo-800 py-2">
                    + Add another invite
                  </button>
                </div>

                <div className="mt-8 flex justify-between items-center pt-6 border-t border-slate-100">
                  <button onClick={completeSetup} disabled={loading} className="text-slate-500 font-bold hover:text-slate-700 flex items-center gap-2">
                    <SkipForward className="w-5 h-5" /> Skip for now
                  </button>
                  <button onClick={completeSetup} disabled={loading} className="px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-200 flex items-center gap-2">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-5 h-5" /> Send Invites & Finish</>}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
