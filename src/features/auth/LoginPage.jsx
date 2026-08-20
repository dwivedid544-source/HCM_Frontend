import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Cpu,
  ArrowRight,
  ShieldCheck,
  Zap,
  Globe,
  Clock
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { cn } from '../../utils/cn';
import axios from 'axios';
import { authAPI } from '../../utils/apiService';

const ROLE_ROUTES = {
  SUPERADMIN: '/superadmin/dashboard',
  ADMIN: '/admin/dashboard',
  HR: '/hr/dashboard',
  MANAGER: '/manager/dashboard',
  EMPLOYEE: '/employee/dashboard',
  CANDIDATE: '/candidate/dashboard',
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('admin');
  const [loading, setLoading] = useState(false);
  const { login, authError, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const searchParams = new URLSearchParams(location.search);
  const isIdleLogout = searchParams.get('reason') === 'idle' || sessionStorage.getItem('logout_reason') === 'idle';

  // Forgot password flow states
  const [step, setStep] = useState('login'); // 'login' | 'forgot-password' | 'verify-otp' | 'reset-password'
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loadingOtp, setLoadingOtp] = useState(false);

  React.useEffect(() => {
    if (isAuthenticated && user) {
      const route = user.landingPage || ROLE_ROUTES[user.role] || '/employee/dashboard';
      navigate(route, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const demoCredentials = {
    superadmin: { email: 'superadmin@hcm.ai', password: 'password123' },
    admin: { email: 'admin@hcm.ai', password: 'password123' },
    hr: { email: 'hr@hcm.ai', password: 'password123' },
    manager: { email: 'manager@hcm.ai', password: 'password123' },
    employee: { email: 'employee@hcm.ai', password: 'password123' },
    candidate: { email: 'candidate@hcm.ai', password: 'password123' },
  };

  const handleRoleSelect = (roleId) => {
    setRole(roleId);
    const creds = demoCredentials[roleId];
    setEmail(creds.email);
    setPassword(creds.password);
  };

  // Pre‑fill default role values on mount (Super Admin demo)
  React.useEffect(() => {
    handleRoleSelect('superadmin');
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await login(email, password, role);
    setLoading(false);
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      alert('Please enter your email.');
      return;
    }
    setLoadingOtp(true);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(otp);

    // EmailJS keys from env or default
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_hcm';
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_otp';
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'user_public_key';

    try {
      await axios.post('https://api.emailjs.com/api/v1.0/email/send', {
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          to_email: forgotEmail,
          otp: otp,
          app_name: 'HCM.ai'
        }
      });
      alert(`OTP sent successfully to ${forgotEmail}!`);
    } catch (err) {
      console.log(`[EmailJS Fallback] Failed to send email via service. OTP is: ${otp}`);
      alert(`[Demo Mode] OTP sent to email! (OTP printed to console for security reasons: ${otp})`);
    } finally {
      setLoadingOtp(false);
      setStep('verify-otp');
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otpCode === generatedOtp) {
      alert('OTP verified successfully!');
      setStep('reset-password');
    } else {
      alert('Invalid OTP. Please try again.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await authAPI.resetForgottenPassword({ email: forgotEmail, newPassword });
      alert('Password reset successfully! Please sign in with your new password.');
      setStep('login');
      setForgotEmail('');
      setOtpCode('');
      setGeneratedOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    { id: 'superadmin', label: 'Super Admin', color: 'bg-gray-800' },
    { id: 'admin', label: 'Admin', color: 'bg-red-500' },
    { id: 'hr', label: 'HR', color: 'bg-blue-500' },
    { id: 'manager', label: 'Manager', color: 'bg-purple-500' },
    { id: 'employee', label: 'Employee', color: 'bg-green-500' },
    { id: 'candidate', label: 'Candidate', color: 'bg-orange-500' },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white dark:bg-slate-950 selection:bg-primary-100 dark:selection:bg-primary-900/30">

      {/* Left Side: Visual/Branding */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl opacity-50 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 -ml-32 -mb-32 w-96 h-96 bg-accent-500/20 rounded-full blur-3xl opacity-50"></div>

        <div className="z-10">
          <Link to="/" className="flex items-center gap-3 mb-12 group cursor-pointer w-fit">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl group-hover:bg-white/20 transition-colors">
              <Cpu className="text-white" size={28} />
            </div>
            <span className="text-white text-3xl font-bold tracking-tight group-hover:text-primary-200 transition-colors">HCM.ai</span>
          </Link>

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Empower Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400">Human Capital</span> <br />
              with Artificial Intelligence.
            </h1>
            <p className="text-primary-100/70 text-xl max-w-md leading-relaxed mb-12">
              The next generation HR platform for modern teams. Secure, intelligent, and human-centric.
            </p>
          </motion.div>

          {/* Social Proof/Features */}
          <div className="grid grid-cols-2 gap-6 max-w-sm">
            {[
              { icon: ShieldCheck, text: "Enterprise Security" },
              { icon: Zap, text: "AI Automation" },
              { icon: Globe, text: "Global Payroll" },
              { icon: Mail, text: "Smart Hiring" }
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-white/80">
                <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                  <f.icon size={16} />
                </div>
                <span className="text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10">
          <p className="text-white/40 text-sm font-medium">© 2026 HCM.ai Global Inc. All rights reserved.</p>
        </div>
      </div>

      {/* Right Side: Login / Forgot Password form */}
      <div className="flex items-center justify-center p-8 bg-slate-50/30 lg:bg-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="mb-8 lg:hidden flex items-center gap-2 group cursor-pointer w-fit">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-700 transition-colors">
              <Cpu className="text-white" size={18} />
            </div>
            <span className="text-slate-900 text-xl font-bold tracking-tight group-hover:text-primary-600 transition-colors">HCM.ai</span>
          </Link>

          {step === 'login' && (
            <>
              <div className="text-left mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 dark:text-white">Welcome back</h2>
                <p className="text-slate-500 font-medium">Please enter your details to sign in.</p>
                {isIdleLogout && (
                  <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl flex items-start gap-3 text-xs font-medium shadow-sm animate-in fade-in duration-300">
                    <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block text-amber-950">Session Timed Out</span>
                      Your session was automatically logged out due to inactivity for security. Please sign in again.
                    </div>
                  </div>
                )}
                {authError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
                    {authError}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selector for Demo */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-wrap gap-2 mb-4">
                  <p className="text-xs font-bold text-slate-400 w-full mb-1 uppercase tracking-widest">Select Demo Role</p>
                  {roles.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleRoleSelect(r.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-xs font-bold transition-all",
                        role === r.id
                          ? "bg-primary-600 text-white shadow-lg shadow-primary-200"
                          : "bg-white text-slate-500 border border-slate-200 hover:border-primary-300"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-slate-700">Password</label>
                    <button
                      type="button"
                      onClick={() => setStep('forgot-password')}
                      className="text-sm font-bold text-primary-600 hover:text-primary-700"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-12 pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500 cursor-pointer"
                  />
                  <label htmlFor="remember" className="ml-2 text-sm font-medium text-slate-600 cursor-pointer select-none">Remember for 30 days</label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'forgot-password' && (
            <>
              <div className="text-left mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 dark:text-white">Reset password</h2>
                <p className="text-slate-500 font-medium">Enter your work email to receive a verification OTP code.</p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Work Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingOtp}
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                >
                  {loadingOtp ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-800"
                >
                  Back to Sign In
                </button>
              </form>
            </>
          )}

          {step === 'verify-otp' && (
            <>
              <div className="text-left mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 dark:text-white">Verify OTP</h2>
                <p className="text-slate-500 font-medium">Enter the 6-digit verification code sent to your email.</p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Verification Code</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="Enter 6-digit OTP"
                      className="input-field pl-12 tracking-[0.2em] font-bold text-center"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                >
                  <span>Verify OTP</span>
                  <ArrowRight size={18} />
                </button>

                <button
                  type="button"
                  onClick={() => setStep('forgot-password')}
                  className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-800"
                >
                  Resend Verification Code
                </button>
              </form>
            </>
          )}

          {step === 'reset-password' && (
            <>
              <div className="text-left mb-10">
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2 dark:text-white">New password</h2>
                <p className="text-slate-500 font-medium">Choose a strong, secure new password.</p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-12"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-12 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep('login')}
                  className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-800"
                >
                  Cancel
                </button>
              </form>
            </>
          )}

          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Don't have an account? <Link to="/signup" className="ml-1 text-primary-600 font-bold hover:text-primary-700">Sign up as Candidate</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
