import React, { useState, useEffect } from 'react';
import API from '../../utils/apiService';
import WorkflowBuilder from '../../components/settings/WorkflowBuilder';

const ApprovalWorkflows = () => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: null, id: null });

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const res = await API.get('/approval-workflows');
      if (res.data.success) {
        setWorkflows(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setCurrentWorkflow(null);
    setIsEditing(true);
  };

  const handleEdit = (workflow) => {
    setCurrentWorkflow(workflow);
    setIsEditing(true);
  };

  const handleSave = async (workflowData) => {
    try {
      if (currentWorkflow) {
        await API.put(`/approval-workflows/${currentWorkflow.id}`, workflowData);
      } else {
        await API.post('/approval-workflows', workflowData);
      }
      setIsEditing(false);
      fetchWorkflows();
    } catch (err) {
      console.error('Save failed:', err);
      alert('Failed to save workflow. ' + (err.response?.data?.error?.message || err.message));
    }
  };

  const handleArchive = (id) => setConfirmModal({ isOpen: true, type: 'archive', id });
  const handleDelete = (id) => setConfirmModal({ isOpen: true, type: 'delete', id });
  const handleUnarchive = (id) => setConfirmModal({ isOpen: true, type: 'unarchive', id });

  const confirmAction = async () => {
    const { type, id } = confirmModal;
    setConfirmModal({ isOpen: false, type: null, id: null });
    try {
      if (type === 'archive') {
        await API.delete(`/approval-workflows/${id}`);
      } else if (type === 'delete') {
        await API.delete(`/approval-workflows/${id}/hard`);
      } else if (type === 'unarchive') {
        await API.put(`/approval-workflows/${id}/unarchive`);
      }
      fetchWorkflows();
    } catch (err) {
      console.error(`${type} failed:`, err);
      alert(`Failed to ${type} workflow.`);
    }
  };

  if (loading) return <div className="p-6">Loading workflows...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Approval Workflows</h1>
          <p className="text-sm text-gray-500 mt-1">Configure generic multi-step approval engines for various modules.</p>
        </div>
        {!isEditing && (
          <button onClick={handleCreateNew} className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700">
            Create Workflow
          </button>
        )}
      </div>

      {isEditing ? (
        <WorkflowBuilder 
          workflow={currentWorkflow} 
          onSave={handleSave} 
          onCancel={() => setIsEditing(false)} 
        />
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 font-bold">Workflow Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Module</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Version</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {workflows.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">No workflows configured.</td>
                </tr>
              ) : (
                workflows.map((wf) => (
                  <tr key={wf.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{wf.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{wf.module}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">v{wf.version}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${wf.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {wf.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button onClick={() => handleEdit(wf)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                      {wf.isActive ? (
                        <button onClick={() => handleArchive(wf.id)} className="text-yellow-600 hover:text-yellow-900 mr-4">Archive</button>
                      ) : (
                        <button onClick={() => handleUnarchive(wf.id)} className="text-green-600 hover:text-green-900 mr-4">Unarchive</button>
                      )}
                      <button onClick={() => handleDelete(wf.id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Action</h3>
            <p className="text-sm text-gray-500 mb-6">
              {confirmModal.type === 'delete'
                ? 'Are you sure you want to permanently delete this workflow?'
                : confirmModal.type === 'archive'
                ? 'Are you sure you want to archive this workflow?'
                : 'Are you sure you want to unarchive this workflow?'}
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setConfirmModal({ isOpen: false, type: null, id: null })} className="px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Cancel</button>
              <button onClick={confirmAction} className="px-4 py-2 border border-transparent rounded text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalWorkflows;
