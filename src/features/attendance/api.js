export const fetchAttendanceLogs = async (employeeId) => {
  const response = await fetch(`/api/attendance/logs?employeeId=${employeeId}`);
  if (!response.ok) throw new Error('Failed to fetch attendance logs');
  return response.json();
};

export const clockIn = async (payload) => {
  const response = await fetch('/api/attendance/clock-in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error('Clock‑in failed');
  return response.json();
};

export const clockOut = async () => {
  const response = await fetch('/api/attendance/clock-out', { method: 'POST' });
  if (!response.ok) throw new Error('Clock‑out failed');
  return response.json();
};
