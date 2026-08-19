import React, { useState, useEffect } from 'react';
import { managerAPI } from '../../utils/apiService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';

const ManagerResignations = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchResignations();
  }, []);

  const fetchResignations = async () => {
    try {
      const res = await managerAPI.getResignations();
      if (res.data.success) {
        setResignations(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load team resignations.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id, status) => {
    if (!comment) {
      toast.error('Please provide a comment before making a decision.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await managerAPI.reviewResignation(id, { status, managerComment: comment });
      if (res.data.success) {
        toast.success(`Resignation ${status === 'PENDING_HR_APPROVAL' ? 'Approved' : 'Rejected'} successfully.`);
        setReviewingId(null);
        setComment('');
        fetchResignations();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to review resignation.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Resignations</h1>
          <p className="text-gray-500">Review and manage resignation requests from your team</p>
        </div>
      </div>

      {resignations.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-8 text-center text-gray-500">
            No resignation requests found in your team.
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {resignations.map(req => (
            <div key={req.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex items-start gap-4 md:w-1/3">
                    <div className="h-12 w-12 rounded-full border bg-gray-100 flex items-center justify-center font-bold text-gray-500 overflow-hidden shrink-0">
                      {req.employee.avatarUrl ? (
                        <img src={req.employee.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                      ) : (
                        req.employee.fullName.charAt(0)
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{req.employee.fullName}</h3>
                      <p className="text-sm text-gray-500">{req.employee.employeeId} • {req.employee.department?.name}</p>
                      <span className={`inline-block mt-2 px-2.5 py-1 text-xs font-semibold rounded-full border ${req.status === 'PENDING_MANAGER_APPROVAL' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Submitted On</p>
                      <p className="font-medium">{format(new Date(req.submissionDate), 'dd MMM, yyyy')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Proposed LWD</p>
                      <p className="font-medium">{format(new Date(req.lastWorkingDay), 'dd MMM, yyyy')}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500">Reason</p>
                      <p className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md mt-1 border border-gray-100 dark:border-gray-800">{req.reason}</p>
                    </div>
                  </div>

                  <div className="md:w-1/4 flex flex-col justify-center gap-2 border-t border-gray-100 dark:border-gray-800 md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-6">
                    {req.canApprove ? (
                      reviewingId === req.id ? (
                        <div className="space-y-3">
                          <textarea 
                            placeholder="Add your comments here..." 
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="w-full text-sm px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-700"
                            rows={3}
                          />
                          <div className="flex gap-2">
                            <button 
                              className="flex-1 px-3 py-1.5 text-sm font-bold rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-all"
                              onClick={() => handleReview(req.id, 'REJECTED_BY_MANAGER')}
                              disabled={actionLoading}
                            >
                              Reject
                            </button>
                            <button 
                              className="flex-1 px-3 py-1.5 text-sm font-bold rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition-all"
                              onClick={() => handleReview(req.id, 'PENDING_HR_APPROVAL')}
                              disabled={actionLoading}
                            >
                              Approve
                            </button>
                          </div>
                          <button onClick={() => setReviewingId(null)} className="w-full text-sm font-bold text-gray-500 hover:text-gray-700">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setReviewingId(req.id)} className="w-full px-4 py-2 font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-all">
                          Review Request
                        </button>
                      )
                    ) : (
                      <div className="text-sm space-y-2">
                        <p className="text-gray-500 font-medium">Your Review</p>
                        <p className="italic text-gray-600 dark:text-gray-400">"{req.managerComment}"</p>
                        <p className="text-xs text-gray-400">{req.managerDecisionDate && format(new Date(req.managerDecisionDate), 'dd MMM, yyyy')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManagerResignations;
