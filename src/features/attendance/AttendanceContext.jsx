// @refresh reset
import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchAttendanceLogs, clockIn as apiClockIn, clockOut as apiClockOut } from './api';

const AttendanceContext = createContext();

export const AttendanceProvider = ({ children }) => {
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  // Load logs for the current user (mocked employee id)
  useEffect(() => {
    const employeeId = 'EMP-2024-001'; // placeholder, replace with real ID from auth
    fetchAttendanceLogs(employeeId)
      .then((logs) => {
        if (logs.length === 0) {
          setAttendanceLogs([]);
        } else {
          setAttendanceLogs(logs);
        }
      })
      .catch(() => setAttendanceLogs([]));
  }, []);

  const clockIn = async (mode = 'Office') => {
    const result = await apiClockIn({ employeeId: 'EMP-2024-001', mode });
    setCurrentSession(result);
    // prepend to logs
    setAttendanceLogs((prev) => [result, ...prev]);
    return result;
  };

  const clockOut = async () => {
    const result = await apiClockOut();
    setCurrentSession(null);
    // update last log entry with clockOut info if needed
    setAttendanceLogs((prev) => {
      if (prev.length === 0) return prev;
      const updated = { ...prev[0], ...result };
      return [updated, ...prev.slice(1)];
    });
    return result;
  };

  return (
    <AttendanceContext.Provider value={{ attendanceLogs, currentSession, clockIn, clockOut }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => useContext(AttendanceContext);
