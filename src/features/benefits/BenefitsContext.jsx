// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../../utils/apiService';

const BenefitsContext = createContext();

export const BenefitsProvider = ({ children }) => {
  const [benefitPlans, setBenefitPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getBenefits();
      if (res.data?.success) {
        const mapped = (res.data.data || []).map(p => ({
          ...p,
          monthlyCost: parseFloat(p.contribution) || 0,
          coverage: p.empContribution || 'Individual',
          enrolledCount: 0 // Cannot easily calculate enrolledCount without claims schema extension
        }));
        setBenefitPlans(mapped);
      }
    } catch (err) {
      console.error('Failed to load benefit plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const mapToDbPayload = (planData) => ({
    name: planData.name,
    category: planData.category || 'Health Insurance',
    provider: planData.provider || 'Internal',
    contribution: (planData.monthlyCost || 0).toString(),
    empContribution: planData.coverage || 'Individual',
    eligibility: planData.eligibility || 'All Employees',
    status: planData.status || 'Active',
    description: planData.description || ''
  });

  const addBenefitPlan = async (planData) => {
    try {
      const res = await adminAPI.createBenefit(mapToDbPayload(planData));
      if (res.data?.success) {
        const p = res.data.data;
        const newPlan = { ...p, monthlyCost: parseFloat(p.contribution) || 0, coverage: p.empContribution || 'Individual', enrolledCount: 0 };
        setBenefitPlans((prev) => [...prev, newPlan]);
        return newPlan;
      }
      return null;
    } catch (err) {
      console.error('Failed to create benefit plan:', err);
      return null;
    }
  };

  const saveBenefitPlan = async (planId, updates) => {
    try {
      const existing = benefitPlans.find(p => p.id === planId) || {};
      const merged = { ...existing, ...updates };
      const res = await adminAPI.updateBenefit(planId, mapToDbPayload(merged));
      if (res.data?.success) {
        const p = res.data.data;
        const updatedPlan = { ...p, monthlyCost: parseFloat(p.contribution) || 0, coverage: p.empContribution || 'Individual', enrolledCount: merged.enrolledCount || 0 };
        setBenefitPlans((prev) => prev.map((item) => (item.id === planId ? updatedPlan : item)));
        return updatedPlan;
      }
      return null;
    } catch (err) {
      console.error('Failed to update benefit plan:', err);
      return null;
    }
  };

  const removeBenefitPlan = async (planId) => {
    try {
      const res = await adminAPI.deleteBenefit(planId);
      if (res.data?.success) {
        setBenefitPlans((prev) => prev.filter((p) => p.id !== planId));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to delete benefit plan:', err);
      return false;
    }
  };

  return (
    <BenefitsContext.Provider
      value={{
        benefitPlans,
        setBenefitPlans,
        loading,
        loadPlans,
        addBenefitPlan,
        saveBenefitPlan,
        removeBenefitPlan,
      }}
    >
      {children}
    </BenefitsContext.Provider>
  );
};

export const useBenefits = () => useContext(BenefitsContext);
