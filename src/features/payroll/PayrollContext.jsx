import React, { createContext, useContext, useState, useEffect } from 'react';
import { superAdminAPI } from '../../utils/apiService';

const PayrollContext = createContext();

export const PayrollProvider = ({ children }) => {
  const [payrollHistory, setPayrollHistory] = useState([]);
  const [payrollSettings, setPayrollSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPayrollData = async () => {
    try {
      setLoading(true);
      const [historyRes, settingsRes] = await Promise.all([
        superAdminAPI.getPayrollHistory(),
        superAdminAPI.getPayrollSettings()
      ]);
      if (historyRes.data?.success) {
        setPayrollHistory(historyRes.data.data);
      }
      if (settingsRes.data?.success) {
        setPayrollSettings(settingsRes.data.data);
      }
    } catch (err) {
      console.error('Error fetching payroll data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollData();
  }, []);

  const addPayrollRecord = async (record) => {
    try {
      const res = await superAdminAPI.createPayslip(record);
      if (res.data?.success) {
        await fetchPayrollData();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error adding payroll record:', err);
      return false;
    }
  };

  const updatePayrollRecord = async (id, updates) => {
    try {
      const res = await superAdminAPI.updatePayslip(id, updates);
      if (res.data?.success) {
        setPayrollHistory((prev) =>
          prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating payroll record:', err);
      return false;
    }
  };

  const deletePayrollRecord = async (id) => {
    try {
      const res = await superAdminAPI.deletePayslip(id);
      if (res.data?.success) {
        setPayrollHistory((prev) => prev.filter((item) => item.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting payroll record:', err);
      return false;
    }
  };

  const bulkApprovePayroll = async (ids) => {
    try {
      const res = await superAdminAPI.bulkApprovePayslips(ids);
      if (res.data?.success) {
        setPayrollHistory((prev) =>
          prev.map((item) => (ids.includes(item.id) ? { ...item, status: 'Approved' } : item))
        );
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error bulk approving payroll:', err);
      return false;
    }
  };

  const generatePayroll = async (generateMonth) => {
    try {
      const res = await superAdminAPI.generatePayroll({ generateMonth });
      if (res.data?.success) {
        await fetchPayrollData();
        return res.data;
      }
      return null;
    } catch (err) {
      console.error('Error generating payroll:', err);
      return null;
    }
  };

  const updatePayrollSettings = async (settings) => {
    try {
      const res = await superAdminAPI.updatePayrollSettings(settings);
      if (res.data?.success) {
        setPayrollSettings(settings);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error updating payroll settings:', err);
      return false;
    }
  };

  return (
    <PayrollContext.Provider
      value={{
        payrollHistory,
        setPayrollHistory,
        payrollSettings,
        loading,
        updatePayrollSettings,
        generatePayroll,
        addPayrollRecord,
        updatePayrollRecord,
        deletePayrollRecord,
        bulkApprovePayroll,
        refreshData: fetchPayrollData
      }}
    >
      {children}
    </PayrollContext.Provider>
  );
};

export const usePayroll = () => useContext(PayrollContext);
