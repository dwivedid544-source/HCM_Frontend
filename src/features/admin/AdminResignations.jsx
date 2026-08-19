import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/apiService';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Search } from 'lucide-react';

const AdminResignations = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Admin Override States
  const [overrideId, setOverrideId] = useState(null);
  const [overrideStatus, setOverrideStatus] = useState('');
  const [overrideComment, setOverrideComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchResignations();
  }, []);

  const fetchResignations = async () => {
    try {
      const res = await adminAPI.getResignations();
      if (res.data.success) {
        setResignations(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load resignations for Admin.');
    } finally {
      setLoading(false);
    }
  };

  const filteredResignations = resignations.filter(req => 
    req.employee?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.employee?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOverride = async (id) => {
    if (!overrideStatus || !overrideComment) {
      toast.error('Please provide a status and comment for the override.');
      return;
    }
    setActionLoading(true);
    try {
      const res = await adminAPI.overrideResignation(id, { 
        status: overrideStatus, 
        adminComment: overrideComment 
      });
      if (res.data.success) {
        toast.success(`Resignation overridden successfully.`);
        setOverrideId(null);
        setOverrideStatus('');
        setOverrideComment('');
        fetchResignations();
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to override resignation.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Resignations Oversight</h1>
          <p className="text-gray-500">Monitor and optionally override resignation workflow statuses</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Search employee..." 
            className="w-full pl-9 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-gray-800 dark:border-gray-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold uppercase text-gray-500">
                <th className="p-4">Employee</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-sm">
              {filteredResignations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-500">No resignations found.</td>
                </tr>
              ) : (
                filteredResignations.map(req => (
                  <tr key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50">
                    <td className="p-4">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{req.employee?.fullName}</p>
                      <p className="text-xs text-gray-500">{req.employee?.employeeId} • {req.employee?.department?.name}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-gray-900 dark:text-gray-200">Submitted: {format(new Date(req.submissionDate), 'dd MMM, yy')}</p>
                      <p className="text-gray-500 text-xs">LWD: {format(new Date(req.lastWorkingDay), 'dd MMM, yy')}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded-full border bg-gray-100 text-gray-800 border-gray-200">
                        {req.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4">
                      {overrideId === req.id ? (
                        <div className="space-y-2 min-w-[250px]">
                          <select 
                            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-700"
                            value={overrideStatus}
                            onChange={(e) => setOverrideStatus(e.target.value)}
                          >
                            <option value="">Select Target Status</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED_BY_MANAGER">REJECTED BY MANAGER</option>
                            <option value="REJECTED_BY_HR">REJECTED BY HR</option>
                          </select>
                          <textarea 
                            placeholder="Reason for override..."
                            value={overrideComment}
                            onChange={(e) => setOverrideComment(e.target.value)}
                            className="w-full p-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900 dark:border-gray-700"
                            rows={2}
                          />
                          <div className="flex gap-2">
                            <button 
                              className="flex-1 px-3 py-1.5 text-sm font-bold rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 transition-all"
                              onClick={() => handleOverride(req.id)} 
                              disabled={actionLoading}
                            >
                              Confirm
                            </button>
                            <button 
                              className="flex-1 px-3 py-1.5 text-sm font-bold rounded-md border border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                              onClick={() => setOverrideId(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button 
                          className="px-3 py-1.5 text-sm font-bold rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 transition-all"
                          onClick={() => setOverrideId(req.id)}
                        >
                          Override
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminResignations;
