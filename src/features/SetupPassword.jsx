import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { publicAPI } from '../utils/apiService';
import { KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function SetupPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const [invitationInfo, setInvitationInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid setup link. The token is missing.');
      setLoading(false);
      return;
    }

    const validateToken = async () => {
      try {
        const res = await publicAPI.validateInvitation({ token });
        if (res.data?.success) {
          setInvitationInfo(res.data.data);
        }
      } catch (err) {
        setError(err.response?.data?.error?.message || 'Invalid or expired setup link.');
      } finally {
        setLoading(false);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (password.length < 8) {
      setValidationError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await publicAPI.setupPassword({ token, password });
      if (res.data?.success) {
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
      }
    } catch (err) {
      setValidationError(err.response?.data?.error?.message || 'Failed to set password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="p-8 text-center bg-slate-900 text-white relative">
          <div className="absolute top-0 right-0 p-12 bg-indigo-500/20 blur-[30px] rounded-full" />
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg mb-6 relative z-10">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black relative z-10">Secure Your Account</h2>
          <p className="text-slate-400 mt-2 relative z-10">Complete your administrator setup</p>
        </div>

        <div className="p-8">
          {error ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Link Expired or Invalid</h3>
              <p className="text-slate-500 mb-6">{error}</p>
              <Link to="/contact" className="text-indigo-600 font-bold hover:text-indigo-700">
                Contact Support
              </Link>
            </div>
          ) : success ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Account Ready!</h3>
              <p className="text-slate-500 mb-6">Your password has been set successfully. Redirecting to login...</p>
              <button onClick={() => navigate('/login')} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold">
                Go to Login
              </button>
            </div>
          ) : (
            <>
              {invitationInfo && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1">Organization</p>
                  <p className="font-bold text-slate-900">{invitationInfo.organizationName}</p>
                  <p className="text-sm text-slate-500 mt-3 mb-1">Admin Account</p>
                  <p className="font-bold text-slate-900">{invitationInfo.email}</p>
                </div>
              )}

              {validationError && (
                <div className="mb-6 p-3 bg-rose-50 text-rose-600 text-sm font-medium rounded-xl border border-rose-100">
                  {validationError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Create Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Confirm Password</label>
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 mt-4 flex justify-center items-center h-[52px]"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set Password & Activate'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
