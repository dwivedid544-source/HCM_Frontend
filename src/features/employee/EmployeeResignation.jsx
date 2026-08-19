import React, { useState, useEffect } from 'react';
import { employeeAPI } from '../../utils/apiService';
import toast from 'react-hot-toast';
import { FileUp, Calendar as CalendarIcon, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const EmployeeResignation = () => {
  const [resignation, setResignation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    lastWorkingDay: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchResignation();
  }, []);

  const fetchResignation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await employeeAPI.getResignation();
      if (res.data.success && res.data.data) {
        setResignation(res.data.data);
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        setError('Failed to load resignation details. Please try again.');
        toast.error('Failed to load resignation status.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.reason || !formData.lastWorkingDay) {
      toast.error('Please fill all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await employeeAPI.submitResignation(formData);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchResignation();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit resignation.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING_MANAGER_APPROVAL':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium flex items-center gap-1"><Clock className="w-4 h-4"/> Pending Manager Approval</span>;
      case 'PENDING_HR_APPROVAL':
        return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium flex items-center gap-1"><Clock className="w-4 h-4"/> Pending HR Approval</span>;
      case 'APPROVED':
        return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Approved</span>;
      case 'REJECTED_BY_MANAGER':
      case 'REJECTED_BY_HR':
        return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium flex items-center gap-1"><XCircle className="w-4 h-4"/> Rejected</span>;
      case 'EMPLOYEE_RELIEVED':
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4"/> Relieved</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">{status.replace(/_/g, ' ')}</span>;
    }
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-[300px] flex flex-col items-center justify-center text-center bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
        <AlertCircle className="text-red-500 w-12 h-12" />
        <h3 className="text-lg font-bold">Failed to Load Resignation Details</h3>
        <p className="text-sm text-gray-500 max-w-md">{error}</p>
        <button onClick={fetchResignation} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium">
          Try Again
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 min-h-[300px] flex justify-center items-center">
        <div className="animate-spin h-8 w-8 border-b-2 border-primary-650 rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resignation</h1>
          <p className="text-gray-500">Manage your resignation request</p>
        </div>
      </div>

      {resignation ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Current Status</h3>
              {getStatusBadge(resignation.status)}
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-500 mb-1">Submitted On</p>
                <p className="font-medium">{format(new Date(resignation.submissionDate), 'dd MMM, yyyy')}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Proposed Last Working Day</p>
                <p className="font-medium">{format(new Date(resignation.lastWorkingDay), 'dd MMM, yyyy')}</p>
              </div>
              {resignation.finalLastWorkingDay && (
                <div>
                  <p className="text-sm text-gray-500 mb-1">Final Last Working Day (Approved)</p>
                  <p className="font-medium text-blue-600">{format(new Date(resignation.finalLastWorkingDay), 'dd MMM, yyyy')}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500 mb-1">Reason for Resignation</p>
                <p className="p-3 bg-gray-50 dark:bg-gray-900 rounded-md border text-sm">{resignation.reason}</p>
              </div>
              
              {resignation.managerComment && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">Manager's Feedback</p>
                  <p className="p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md border border-yellow-200 text-sm">{resignation.managerComment}</p>
                </div>
              )}
              
              {resignation.hrComment && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-500 mb-1">HR's Comments</p>
                  <p className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 rounded-md border border-blue-200 text-sm">{resignation.hrComment}</p>
                </div>
              )}
            </div>
          </div>
          {['REJECTED_BY_MANAGER', 'REJECTED_BY_HR'].includes(resignation.status) && (
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
              <button 
                onClick={() => setResignation(null)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium"
              >
                Submit New Request
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold">Submit Resignation</h3>
          </div>
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="lastWorkingDay" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Proposed Last Working Day *</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                  <input
                    id="lastWorkingDay"
                    name="lastWorkingDay"
                    type="date"
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-700"
                    value={formData.lastWorkingDay}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <p className="text-xs text-gray-500">Note: Notice period will be calculated based on company policy.</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason for Resignation *</label>
                <textarea
                  id="reason"
                  name="reason"
                  placeholder="Please state your reason for resigning..."
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-700"
                  value={formData.reason}
                  onChange={handleInputChange}
                  rows={4}
                  required
                />
              </div>

              <div className="pt-4 border-t dark:border-gray-700 flex justify-end">
                <button type="submit" disabled={submitting} className="px-4 py-2 rounded-lg font-bold bg-red-600 hover:bg-red-700 text-white disabled:opacity-50">
                  {submitting ? 'Submitting...' : 'Submit Resignation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeResignation;
