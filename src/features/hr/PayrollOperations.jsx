import React, { useState, useEffect } from 'react';
import api from '../../utils/apiService';

const PayrollOperations = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [runData, setRunData] = useState({ employeeId: '', month: '2024-10' });

  const fetchSnapshots = async () => {
    setLoading(true);
    try {
      const res = await api.get('/hr/payroll/snapshots');
      setSnapshots(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSnapshots();
  }, []);

  const handleRunPayroll = async (e) => {
    e.preventDefault();
    setRunning(true);
    try {
      await api.post('/hr/payroll/run', runData);
      alert('Payroll generated successfully!');
      fetchSnapshots();
    } catch (err) {
      alert(err.response?.data?.message || 'Error running payroll');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">HR Payroll Operations</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Run Payroll</h2>
          <form onSubmit={handleRunPayroll} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Employee ID</label>
              <input 
                type="text" 
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={runData.employeeId}
                onChange={e => setRunData({...runData, employeeId: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Month (YYYY-MM)</label>
              <input 
                type="text" 
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={runData.month}
                onChange={e => setRunData({...runData, month: e.target.value})}
              />
            </div>
            <button 
              type="submit" 
              disabled={running}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              {running ? 'Running...' : 'Generate Payroll'}
            </button>
          </form>
        </div>

        <div className="md:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow border border-gray-100 dark:border-gray-700">
          <h2 className="text-lg font-bold mb-4 dark:text-white">Recent Payroll Snapshots</h2>
          {loading ? (
            <p className="text-gray-500">Loading snapshots...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Employee</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Month</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Gross</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Net Pay</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {snapshots.map(s => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                      <td className="px-4 py-3 text-sm dark:text-gray-300">{s.employee?.fullName} ({s.employee?.employeeId})</td>
                      <td className="px-4 py-3 text-sm dark:text-gray-300 font-medium">{s.month}</td>
                      <td className="px-4 py-3 text-sm text-green-600 font-mono">${s.grossSalary.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-indigo-600 font-mono font-bold">${s.netSalary.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {s.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {snapshots.length === 0 && (
                    <tr><td colSpan="5" className="text-center py-4 text-gray-500">No payroll snapshots found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PayrollOperations;
