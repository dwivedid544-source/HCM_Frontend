export const fetchBenefitPlans = async () => {
  const response = await fetch('/api/benefits/plans');
  if (!response.ok) throw new Error('Failed to fetch benefit plans');
  return response.json();
};

export const updateBenefitPlan = async (planId, updates) => {
  const response = await fetch(`/api/benefits/plans/${planId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  if (!response.ok) throw new Error('Failed to update benefit plan');
  return response.json();
};
