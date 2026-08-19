import React, { useState } from 'react';

const WorkflowBuilder = ({ workflow, onSave, onCancel }) => {
  const [name, setName] = useState(workflow ? workflow.name : '');
  const [module, setModule] = useState(workflow ? workflow.module : 'LeaveRequest');
  const [description, setDescription] = useState(workflow ? workflow.description : '');
  const [steps, setSteps] = useState(workflow && workflow.steps ? workflow.steps : [
    { sequence: 1, approverType: 'ROLE', approverRole: 'MANAGER', isRequired: true, canSkip: false }
  ]);
  const [error, setError] = useState(null);

  const handleAddStep = () => {
    setSteps([...steps, {
      sequence: steps.length + 1,
      approverType: 'ROLE',
      approverRole: '',
      isRequired: true,
      canSkip: false
    }]);
  };

  const handleRemoveStep = (index) => {
    const newSteps = steps.filter((_, i) => i !== index);
    // Re-sequence
    newSteps.forEach((step, i) => step.sequence = i + 1);
    setSteps(newSteps);
  };

  const handleChangeStep = (index, field, value) => {
    const newSteps = [...steps];
    newSteps[index][field] = value;
    setSteps(newSteps);
  };

  const handleSave = () => {
    if (!name || !module) {
      setError('Name and Module are required.');
      return;
    }
    if (steps.length === 0) {
      setError('At least one step is required.');
      return;
    }
    for (const step of steps) {
      if (!step.approverRole) {
        setError(`Step ${step.sequence} is missing the Approver Role.`);
        return;
      }
    }
    setError(null);
    onSave({ name, module, description, steps });
  };

  return (
    <div className="bg-white p-6 rounded shadow max-w-4xl w-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">{workflow ? 'Edit Workflow' : 'Create New Workflow'}</h2>
      {error && <div className="text-red-600 bg-red-100 p-2 rounded mb-4">{error}</div>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Workflow Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g. Standard Leave Approval" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Module</label>
          <select value={module} onChange={e => setModule(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500">
            <option value="LeaveRequest">Leave Request</option>
            {/* Future modules can be added here */}
            <option value="SalaryIncrementRequest">Salary Increment</option>
            <option value="ExitLifecycle">Exit Lifecycle</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea value={description || ''} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" rows="2"></textarea>
        </div>
      </div>

      <h3 className="text-lg font-medium text-gray-800 mb-3 border-b pb-2">Approval Steps</h3>
      
      <div className="space-y-4 mb-6">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 p-4 rounded border">
            <div className="flex flex-col w-full md:w-auto">
              <label className="text-xs text-gray-500">Sequence</label>
              <div className="text-lg font-bold text-gray-700 w-8 text-center">{step.sequence}</div>
            </div>
            
            <div className="flex-1 w-full">
              <label className="text-xs text-gray-500">Approver Type</label>
              <select value={step.approverType} onChange={e => handleChangeStep(index, 'approverType', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm text-sm">
                <option value="ROLE">Role</option>
                <option value="CUSTOM_ROLE">Custom Role</option>
                <option value="MANAGER">Reporting Manager</option>
                <option value="SPECIFIC_USER">Specific User</option>
              </select>
            </div>
            
            <div className="flex-1 w-full">
              <label className="text-xs text-gray-500">Approver Role/ID</label>
              <input type="text" value={step.approverRole} onChange={e => handleChangeStep(index, 'approverRole', e.target.value)} className="block w-full border-gray-300 rounded-md shadow-sm text-sm" placeholder="e.g. HR, MANAGER, user123" />
            </div>

            <div className="flex items-center space-x-4 w-full md:w-auto">
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" checked={step.isRequired} onChange={e => handleChangeStep(index, 'isRequired', e.target.checked)} className="mr-2 rounded text-indigo-600 focus:ring-indigo-500" />
                Required
              </label>
              <label className="flex items-center text-sm text-gray-600">
                <input type="checkbox" checked={step.canSkip} onChange={e => handleChangeStep(index, 'canSkip', e.target.checked)} className="mr-2 rounded text-indigo-600 focus:ring-indigo-500" />
                Can Skip
              </label>
            </div>

            <div className="w-full md:w-auto flex justify-end">
              <button type="button" onClick={() => handleRemoveStep(index)} className="text-red-500 hover:text-red-700 p-2" title="Remove Step">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between">
        <button type="button" onClick={handleAddStep} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          + Add Step
        </button>
        <div className="flex space-x-3">
          <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            Cancel
          </button>
          <button type="button" onClick={handleSave} className="px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
            Save Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowBuilder;
