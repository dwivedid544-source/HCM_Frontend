import React, { useState, useEffect } from 'react';
import api from '../../utils/apiService';
import CenterModal from '../../shared/components/layout/CenterModal';

const PayrollConfig = () => {
  const [activeTab, setActiveTab] = useState('structures');
  const [structures, setStructures] = useState([]);
  const [components, setComponents] = useState([]);
  const [deductions, setDeductions] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modal Open States
  const [showStructureModal, setShowStructureModal] = useState(false);
  const [showComponentModal, setShowComponentModal] = useState(false);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [showTaxModal, setShowTaxModal] = useState(false);

  // Form States
  const [structureForm, setStructureForm] = useState({
    name: '', description: '', currency: 'USD', isDefault: false, components: []
  });

  const [componentForm, setComponentForm] = useState({
    name: '', code: '', category: 'Earning', calculationBase: 'Basic', calculationType: 'Percentage', value: '',
    isTaxable: true, isAutoBalance: false, isEmployerContribution: false, isEmployeeDeduction: false,
    formula: '', roundingRule: 'Nearest', displayOrder: 0
  });

  const [deductionForm, setDeductionForm] = useState({
    name: '', code: '', category: 'PF', valueType: 'Fixed', value: '', isPreTax: false
  });

  const [taxForm, setTaxForm] = useState({
    name: '', country: '', state: '', slabs: '[]'
  });

  const fetchConfig = async () => {
    setLoading(true);
    try {
      if (activeTab === 'structures') {
        const res = await api.get('/admin/salary-structures');
        setStructures(res.data);
        const compRes = await api.get('/admin/payroll-config/components');
        setComponents(compRes.data); // Needed for building structures
      } else if (activeTab === 'components') {
        const res = await api.get('/admin/payroll-config/components');
        setComponents(res.data);
      } else if (activeTab === 'deductions') {
        const res = await api.get('/admin/payroll-config/deductions');
        setDeductions(res.data);
      } else if (activeTab === 'taxes') {
        const res = await api.get('/admin/payroll-config/taxes');
        setTaxes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, [activeTab]);

  // Form Handlers
  const handleAddStructure = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/admin/salary-structures', structureForm);
      alert('Salary structure added successfully!');
      setShowStructureModal(false);
      setStructureForm({ name: '', description: '', currency: 'USD', isDefault: false, components: [] });
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding structure');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComponent = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/admin/payroll-config/components', {
        ...componentForm,
        displayOrder: Number(componentForm.displayOrder)
      });
      alert('Salary component added successfully!');
      setShowComponentModal(false);
      setComponentForm({ name: '', code: '', category: 'Earning', calculationBase: 'Basic', calculationType: 'Percentage', value: '', isTaxable: true, isAutoBalance: false, isEmployerContribution: false, isEmployeeDeduction: false, formula: '', roundingRule: 'Nearest', displayOrder: 0 });
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding component');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDeduction = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/admin/payroll-config/deductions', deductionForm);
      alert('Deduction rule added successfully!');
      setShowDeductionModal(false);
      setDeductionForm({ name: '', code: '', category: 'PF', valueType: 'Fixed', value: '', isPreTax: false });
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding deduction rule');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTax = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      JSON.parse(taxForm.slabs);
      await api.post('/admin/payroll-config/taxes', taxForm);
      alert('Tax regime added successfully!');
      setShowTaxModal(false);
      setTaxForm({ name: '', country: '', state: '', slabs: '[]' });
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding tax regime (invalid JSON?)');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStructure = async (id) => {
    if (!window.confirm('Delete this structure?')) return;
    try {
      await api.delete(`/admin/salary-structures/${id}`);
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting structure');
    }
  };

  const handleSetDefaultStructure = async (s) => {
    try {
      await api.put(`/admin/salary-structures/${s.id}`, {
        name: s.name,
        description: s.description,
        status: s.status,
        isDefault: true
      });
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error setting default structure');
    }
  };

  const handleDeleteComponent = async (id) => {
    if (!window.confirm('Delete this component?')) return;
    try {
      await api.delete(`/admin/payroll-config/components/${id}`);
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting component');
    }
  };

  const handleDeleteDeduction = async (id) => {
    if (!window.confirm('Delete this deduction rule?')) return;
    try {
      await api.delete(`/admin/payroll-config/deductions/${id}`);
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting deduction');
    }
  };

  const handleDeleteTax = async (id) => {
    if (!window.confirm('Delete this tax regime?')) return;
    try {
      await api.delete(`/admin/payroll-config/taxes/${id}`);
      fetchConfig();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting tax regime');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Enterprise Payroll Configuration</h1>
        <p className="text-gray-500 mt-2">Manage your organization's CTC Salary Structures, Components, and Tax algorithms.</p>
      </div>

      <div className="flex border-b mb-6 border-gray-200 dark:border-gray-700">
        <button
          className={`py-3 px-6 font-semibold transition-colors duration-200 ${activeTab === 'structures' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          onClick={() => setActiveTab('structures')}
        >
          Salary Structures
        </button>
        <button
          className={`py-3 px-6 font-semibold transition-colors duration-200 ${activeTab === 'components' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          onClick={() => setActiveTab('components')}
        >
          Salary Components
        </button>
        <button
          className={`py-3 px-6 font-semibold transition-colors duration-200 ${activeTab === 'deductions' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          onClick={() => setActiveTab('deductions')}
        >
          Deductions & Benefits
        </button>
        <button
          className={`py-3 px-6 font-semibold transition-colors duration-200 ${activeTab === 'taxes' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}
          onClick={() => setActiveTab('taxes')}
        >
          Tax Rules Engine
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl p-6 border border-gray-100 dark:border-gray-700 transition-all">

          {/* TAB 0: Structures */}
          {activeTab === 'structures' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Salary Structures (Templates)</h2>
                  <p className="text-sm text-gray-500 mt-1">Define Monthly CTC breakdown templates assigned to employees.</p>
                </div>
                <button
                  onClick={() => setShowStructureModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all"
                >
                  + Add Structure
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 font-bold dark:text-gray-300">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Version</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Default</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {structures.length > 0 ? structures.map(s => (
                      <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{s.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">v{s.versions?.[0]?.version || 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {s.isDefault ? <span className="text-green-600 font-medium">Yes</span> : <span>No</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right flex justify-end items-center gap-3">
                          {!s.isDefault && (
                            <button onClick={() => handleSetDefaultStructure(s)} className="text-indigo-600 hover:text-indigo-900">Set Default</button>
                          )}
                          <button onClick={() => handleDeleteStructure(s.id)} className="text-red-600 hover:text-red-900">Remove</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                          No structures configured yet. Click 'Add Structure' to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 1: Components */}
          {activeTab === 'components' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Master Salary Components</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure individual components like Basic, HRA, PF using the Formula Engine.</p>
                </div>
                <button
                  onClick={() => setShowComponentModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all"
                >
                  + Add Component
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 font-bold dark:text-gray-300">Name & Code</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Category</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Calc Logic</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {components.length > 0 ? components.map(c => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</div>
                          <code className="text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-1 rounded">{c.code}</code>
                          {c.isAutoBalance && <span className="ml-2 text-xs text-orange-600 font-bold">(Auto Balance)</span>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{c.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 bg-blue-100 text-blue-800`}>
                            {c.calculationType}
                          </span>
                          <span className="font-mono text-xs">{c.calculationType === 'Formula' ? c.formula : c.value}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                          <button onClick={() => handleDeleteComponent(c.id)} className="text-red-600 hover:text-red-900">Remove</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                          No components configured yet. Click 'Add Component' to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2 & 3: Keep existing UI for deductions and taxes for brevity or just render simple lists */}
          {activeTab === 'deductions' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Deduction Rules (Legacy or Global)</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure legacy or global deduction rules.</p>
                </div>
                <button
                  onClick={() => setShowDeductionModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all"
                >
                  + Add Deduction Rule
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 font-bold dark:text-gray-300">Name</th>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Value</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {deductions.length > 0 ? deductions.map(d => (
                      <tr key={d.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{d.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-2 bg-blue-100 text-blue-800`}>
                            {d.valueType}
                          </span>
                          <span className="font-mono text-xs">{d.value}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                          <button onClick={() => handleDeleteDeduction(d.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                          No deduction rules configured yet. Click 'Add Deduction Rule' to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'taxes' && (
            <div className="animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tax Regimes</h2>
                  <p className="text-sm text-gray-500 mt-1">Configure income tax brackets and rules by country.</p>
                </div>
                <button
                  onClick={() => setShowTaxModal(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md transition-all"
                >
                  + Add Tax Rule
                </button>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 font-bold dark:text-gray-300">Name & Country</th>
                      <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider dark:text-gray-300">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
                    {taxes.length > 0 ? taxes.map(t => (
                      <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {t.name}
                          <span className="ml-2 text-xs text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded">{t.country}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                          <button onClick={() => handleDeleteTax(t.id)} className="text-red-600 hover:text-red-900">Delete</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="2" className="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                          No tax regimes configured yet. Click 'Add Tax Rule' to start.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* MODALS */}
      {showStructureModal && (
        <CenterModal isOpen={true} title="Add Salary Structure Template" onClose={() => setShowStructureModal(false)}>
          <form onSubmit={handleAddStructure} className="px-6 pb-6 md:px-8 md:pb-8 pt-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">Structure Name</label>
              <input type="text" required value={structureForm.name} onChange={(e) => setStructureForm({ ...structureForm, name: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Description</label>
              <input type="text" value={structureForm.description} onChange={(e) => setStructureForm({ ...structureForm, description: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="isDefault" checked={structureForm.isDefault} onChange={(e) => setStructureForm({ ...structureForm, isDefault: e.target.checked })} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800" />
              <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Set as Default Structure</label>
            </div>

            <div className="pt-4 border-t border-gray-250 dark:border-gray-700">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Select Components to include:</p>
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
                {components.map((c, i) => (
                  <div key={c.id} className="flex items-center justify-between bg-gray-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-slate-800">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`comp-${c.id}`}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          if (checked) {
                            setStructureForm(prev => ({ ...prev, components: [...prev.components, { componentId: c.id, sequence: prev.components.length + 1 }] }));
                          } else {
                            setStructureForm(prev => ({ ...prev, components: prev.components.filter(x => x.componentId !== c.id) }));
                          }
                        }}
                        className="mr-3 h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800"
                      />
                      <label htmlFor={`comp-${c.id}`} className="text-sm font-bold text-gray-950 dark:text-slate-200 cursor-pointer">{c.name}</label>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2">Note: Sequence of execution follows selection order.</p>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Structure'}
              </button>
            </div>
          </form>
        </CenterModal>
      )}

      {showComponentModal && (
        <CenterModal isOpen={true} title="Add Master Salary Component" onClose={() => setShowComponentModal(false)}>
          <form onSubmit={handleAddComponent} className="px-6 pb-6 md:px-8 md:pb-8 pt-2 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">Name</label>
                <input type="text" required value={componentForm.name} onChange={(e) => setComponentForm({ ...componentForm, name: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code (Unique)</label>
                <input type="text" required value={componentForm.code} onChange={(e) => setComponentForm({ ...componentForm, code: e.target.value.toUpperCase() })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
                <select value={componentForm.category} onChange={(e) => setComponentForm({ ...componentForm, category: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm">
                  <option value="Earning">Earning</option>
                  <option value="Deduction">Deduction</option>
                  <option value="Employer Contribution">Employer Contribution</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Calculation Base</label>
                <select value={componentForm.calculationBase} onChange={(e) => setComponentForm({ ...componentForm, calculationBase: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm">
                  <option value="CTC">Monthly CTC</option>
                  <option value="Basic">Basic Salary</option>
                  <option value="Gross">Gross Salary</option>
                  <option value="Net">Net Salary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Calculation Type</label>
                <select value={componentForm.calculationType} onChange={(e) => setComponentForm({ ...componentForm, calculationType: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm">
                  <option value="Fixed">Fixed Amount</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Formula">Custom Formula</option>
                  <option value="Manual">Manual Entry</option>
                  <option value="Auto Balance">Auto Balance</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {componentForm.calculationType === 'Percentage' ? 'Percentage Value' : 'Value'}
                </label>
                <input type="text" required value={componentForm.value} onChange={(e) => setComponentForm({ ...componentForm, value: e.target.value })} placeholder={componentForm.calculationType === 'Percentage' ? 'e.g. 40 (for 40%)' : 'Value'} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
              </div>
            </div>

            {componentForm.calculationType === 'Formula' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Formula Expression</label>
                <input type="text" value={componentForm.formula} onChange={(e) => setComponentForm({ ...componentForm, formula: e.target.value })} placeholder="e.g. max([Basic] * 0.1, 1000)" className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-mono focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
              </div>
            )}

            <div className="space-y-2 pt-2 border-t border-gray-150 dark:border-gray-700">
              <div className="flex items-center">
                <input type="checkbox" id="isAutoBalance" checked={componentForm.isAutoBalance} onChange={(e) => setComponentForm({ ...componentForm, isAutoBalance: e.target.checked })} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800" />
                <label htmlFor="isAutoBalance" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 font-medium">Is Auto Balance? (e.g. Special Allowance)</label>
              </div>
              <div className="flex items-center">
                <input type="checkbox" id="isTaxable" checked={componentForm.isTaxable} onChange={(e) => setComponentForm({ ...componentForm, isTaxable: e.target.checked })} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800" />
                <label htmlFor="isTaxable" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Is Taxable?</label>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Component'}
              </button>
            </div>
          </form>
        </CenterModal>
      )}

      {showDeductionModal && (
        <CenterModal isOpen={true} title="Add Deduction Rule" onClose={() => setShowDeductionModal(false)}>
          <form onSubmit={handleAddDeduction} className="px-6 pb-6 md:px-8 md:pb-8 pt-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">Deduction Name</label>
              <input type="text" required value={deductionForm.name} onChange={(e) => setDeductionForm({ ...deductionForm, name: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Code (Unique)</label>
              <input type="text" required value={deductionForm.code} onChange={(e) => setDeductionForm({ ...deductionForm, code: e.target.value.toUpperCase() })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Category</label>
              <select value={deductionForm.category} onChange={(e) => setDeductionForm({ ...deductionForm, category: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm">
                <option value="PF">Provident Fund (PF)</option>
                <option value="ESI">Employee State Insurance (ESI)</option>
                <option value="Professional Tax">Professional Tax</option>
                <option value="Other">Other Deduction</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value Type</label>
              <select value={deductionForm.valueType} onChange={(e) => setDeductionForm({ ...deductionForm, valueType: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm">
                <option value="Fixed">Fixed Amount</option>
                <option value="Percentage">Percentage of Basic</option>
                <option value="Formula">Formula Expression</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Value / Formula</label>
              <input type="text" required value={deductionForm.value} onChange={(e) => setDeductionForm({ ...deductionForm, value: e.target.value })} placeholder={deductionForm.valueType === 'Formula' ? 'e.g. Base_Salary * 0.12' : 'Value'} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
            </div>
            <div className="flex items-center">
              <input type="checkbox" id="isPreTax" checked={deductionForm.isPreTax} onChange={(e) => setDeductionForm({ ...deductionForm, isPreTax: e.target.checked })} className="h-4 w-4 text-indigo-600 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-800" />
              <label htmlFor="isPreTax" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">Is Pre-Tax Deduction?</label>
            </div>
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Deduction'}
              </button>
            </div>
          </form>
        </CenterModal>
      )}

      {showTaxModal && (
        <CenterModal isOpen={true} title="Add Tax Rule" onClose={() => setShowTaxModal(false)}>
          <form onSubmit={handleAddTax} className="px-6 pb-6 md:px-8 md:pb-8 pt-2 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 font-bold">Regime Name</label>
              <input type="text" required value={taxForm.name} onChange={(e) => setTaxForm({ ...taxForm, name: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Country</label>
                <input type="text" required value={taxForm.country} onChange={(e) => setTaxForm({ ...taxForm, country: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">State / Region (Optional)</label>
                <input type="text" value={taxForm.state} onChange={(e) => setTaxForm({ ...taxForm, state: e.target.value })} className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Slabs (JSON Array)</label>
              <textarea required rows={4} value={taxForm.slabs} onChange={(e) => setTaxForm({ ...taxForm, slabs: e.target.value })} placeholder='e.g. [{"min": 0, "max": 10000, "rate": 10}, {"min": 10000, "max": null, "rate": 20}]' className="mt-1.5 block w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm font-mono focus:border-indigo-500 focus:ring-indigo-500 focus:ring-1 transition-all p-2.5 text-sm" />
            </div>
            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isSaving} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white px-6 py-2.5 rounded-xl font-medium shadow-md transition-all disabled:opacity-50">
                {isSaving ? 'Saving...' : 'Save Tax Regime'}
              </button>
            </div>
          </form>
        </CenterModal>
      )}
    </div>
  );
};

export default PayrollConfig;
