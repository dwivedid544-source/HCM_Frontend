import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './hooks/ThemeContext';
import { SettingsProvider } from './context/SettingsContext';
import { CurrencyProvider } from './hooks/useCurrency';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { PermissionProvider } from './context/PermissionContext';
import { AdminProvider } from './context/AdminContext';
import { SuperAdminProvider } from './context/SuperAdminContext';
import { ScopeProvider, useScope } from './context/ScopeContext';
import SuperAdminLayout from './shared/components/layout/SuperAdminLayout';
import SuperAdminDashboard from './features/superadmin/SuperAdminDashboard';
import UserManagement from './features/superadmin/UserManagement';
import RoleManagement from './features/superadmin/RoleManagement';
import DepartmentManagement from './features/superadmin/DepartmentManagement';
import GlobalAnalytics from './features/superadmin/GlobalAnalytics';
import SuperAdminPayrollCenter from './features/superadmin/PayrollCenter';
import SuperAdminBenefitsConfig from './features/superadmin/BenefitsConfig';
import SuperAdminProfile from './features/superadmin/SuperAdminProfile';
import SuperAdminSettings from './features/superadmin/SuperAdminSettings';
import SuperAdminAttendanceCenter from './features/superadmin/AttendanceCenter';
import PricingManagement from './features/superadmin/PricingManagement';
import SuperAdminAuditLogs from './features/superadmin/AuditLogs';


import { HRProvider } from './context/HRContext';
import { ManagerProvider } from './context/ManagerContext';
import { EmployeeProvider } from './context/EmployeeContext';
import { CandidateProvider } from './context/CandidateContext';
import BenefitsDashboard from './features/benefits/BenefitsDashboard';
import TimeDashboard from './features/time/TimeDashboard';
import { applyTranslation } from './utils/translationHelper';

// Layout & Auth
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import AppLayout from './shared/components/layout/AppLayout';
import LandingPage from './features/LandingPage';
import BookDemo from './features/BookDemo';
import IdleTimer from './shared/components/common/IdleTimer';

// Candidate Pages
import CandidateDashboard from './features/candidate/CandidateDashboard';
import BrowseJobs from './features/candidate/BrowseJobs';
import ApplicationForm from './features/candidate/ApplicationForm';
import MyApplications from './features/candidate/MyApplications';
import ResumeBuilder from './features/candidate/ResumeBuilder';
import AIResumeScore from './features/candidate/AIResumeScore';
import InterviewSchedule from './features/candidate/InterviewSchedule';
import Notifications from './features/candidate/Notifications';
import CandidateProfile from './features/candidate/CandidateProfile';
import CandidateSettings from './features/candidate/CandidateSettings';
import CandidateOffers from './features/candidate/Offers';

// HR Pages
import HRDashboard from './features/hr/HRDashboard';
import JobPosts from './features/hr/JobPosts';
import Candidates from './features/hr/Candidates';
import InterviewManagement from './features/hr/InterviewManagement';
import HiringPipeline from './features/hr/HiringPipeline';
import OfferManagement from './features/hr/OfferManagement';
import Onboarding from './features/hr/Onboarding';
import ExitClearanceCenter from './features/hr/ExitClearanceCenter';
import HRReports from './features/hr/Reports';
import Messages from './features/hr/Messages';
import HRProfile from './features/hr/HRProfile';
import HRSettings from './features/hr/HRSettings';
import PayrollOperations from './features/hr/PayrollOperations';
import HRApprovals from './features/hr/HRApprovals';

// Employee Pages
import EmployeeDashboard from './features/employee/EmployeeDashboard';
import EmployeeProfile from './features/employee/EmployeeProfile';
import EmployeeAttendance from './features/employee/EmployeeAttendance';
import EmployeeLeave from './features/employee/EmployeeLeave';
import EmployeePayroll from './features/employee/EmployeePayroll';
import EmployeeBenefits from './features/employee/EmployeeBenefits';
import EmployeeDocuments from './features/employee/EmployeeDocuments';
import EmployeePerformance from './features/employee/EmployeePerformance';
import EmployeeHelpDesk from './features/employee/EmployeeHelpDesk';
import EmployeeSettings from './features/employee/EmployeeSettings';
import EmployeeResignation from './features/employee/EmployeeResignation';
import EmployeeCompliance from './features/employee/EmployeeCompliance';

// Manager Pages
import ManagerDashboard from './features/manager/ManagerDashboard';
import TeamMembers from './features/manager/TeamMembers';
import AttendanceReview from './features/manager/AttendanceReview';
import LeaveApproval from './features/manager/LeaveApproval';
import KPITracking from './features/manager/KPITracking';
import Tasks from './features/manager/Tasks';
import Reviews from './features/manager/Reviews';
import ManagerReports from './features/manager/Reports';
import ManagerProfile from './features/manager/ManagerProfile';
import ManagerSettings from './features/manager/ManagerSettings';
import ManagerResignations from './features/manager/ManagerResignations';
import ManagerReimbursements from './features/manager/ManagerReimbursements';

// Admin Pages
import AdminDashboard from './features/admin/AdminDashboard';
import OrgSetup from './features/admin/OrgSetup';
import Departments from './features/admin/Departments';
import Users from './features/admin/Users';
import RolesPermissions from './features/admin/RolesPermissions';
import PayrollCenter from './features/admin/PayrollCenter';
import PayrollConfig from './features/admin/PayrollConfig';
import Holidays from './features/admin/Holidays';
import BenefitsConfig from './features/admin/BenefitsConfig';
import ComplianceCenter from './features/admin/ComplianceCenter';
import Integrations from './features/admin/Integrations';
import Billing from './features/admin/Billing';
import AdminAuditLogs from './features/admin/AuditLogs';
import ShiftManagement from './features/admin/ShiftManagement';
import OvertimePolicies from './features/admin/OvertimePolicies';
import AdminResignations from './features/admin/AdminResignations';
import AdminReimbursements from './features/admin/AdminReimbursements';
import AdminReports from './features/admin/AdminReports';
import Settings from './features/admin/Settings';
import AdminProfile from './features/admin/AdminProfile';
import OrgChart from './features/admin/OrgChart';
import ApplicationSettings from './features/admin/ApplicationSettings';
import ApprovalWorkflows from './pages/settings/ApprovalWorkflows';

import ProtectedRoute from './shared/components/layout/ProtectedRoute';

const RoleDashboardRedirect = ({ children }) => {
  const { currentScope } = useScope();
  const location = useLocation();
  
  // If the user's current scope is different from the path they are trying to access,
  // ProtectedRoute will handle the guard. We only redirect here if they are on a generic /dashboard route
  // or if we need to enforce the active scope's dashboard.
  const target = `/${currentScope}/dashboard`;
  
  // Prevent infinite loop if already on the target dashboard
  if (location.pathname !== target && location.pathname !== `${target}/`) {
    // Only redirect if the path is literally just /dashboard (though routes are nested)
    // Actually, ProtectedRoute covers scope guarding now.
    // Just return children to avoid infinite loops, but keep the wrapper for backward compatibility
  }
  
  return children;
};

// Phase 5 & 3: SaaS Onboarding
import TenantSignup from './features/TenantSignup';
import SetupPassword from './features/SetupPassword';

const AdminProviderWrapper = ({ children }) => {
  const auth = useAuth() || {};
  return <AdminProvider user={auth.user}>{children}</AdminProvider>;
};

function App() {
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('hcm_admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        const language = parsed?.general?.language;
        if (language) {
          applyTranslation(language);
        }
      }
    } catch (err) {
      console.error('Translation initialization failed:', err);
    }
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <CurrencyProvider>
          <SettingsProvider>
          <AuthProvider>
            <IdleTimer />
            <PermissionProvider>
            <ScopeProvider>
            <AdminProviderWrapper>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/register-organization" element={<TenantSignup />} />
            <Route path="/setup-password" element={<SetupPassword />} />
            
            {/* Candidate Routes */}
            <Route path="/candidate" element={
              <ProtectedRoute>
                <CandidateProvider>
                  <AppLayout />
                </CandidateProvider>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/candidate/dashboard" replace />} />
              <Route path="dashboard" element={<RoleDashboardRedirect><CandidateDashboard /></RoleDashboardRedirect>} />
              <Route path="jobs" element={<BrowseJobs />} />
              <Route path="jobs/apply" element={<ApplicationForm />} />
              <Route path="applications" element={<MyApplications />} />
              <Route path="resume" element={<ResumeBuilder />} />
              <Route path="ai-score" element={<AIResumeScore />} />
              <Route path="interviews" element={<InterviewSchedule />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="profile" element={<CandidateProfile />} />
              <Route path="settings" element={<CandidateSettings />} />
              <Route path="offers" element={<CandidateOffers />} />
            </Route>

            {/* HR Routes */}
            <Route path="/hr" element={
              <ProtectedRoute>
                <HRProvider>
                  <AppLayout />
                </HRProvider>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/hr/dashboard" replace />} />
              <Route path="dashboard" element={<RoleDashboardRedirect><HRDashboard /></RoleDashboardRedirect>} />
              <Route path="jobs" element={<JobPosts />} />
              <Route path="candidates" element={<Candidates />} />
              <Route path="interviews" element={<InterviewManagement />} />
              <Route path="pipeline" element={<HiringPipeline />} />
              <Route path="offers" element={<OfferManagement />} />
              <Route path="onboarding" element={<Onboarding />} />
              <Route path="offboarding" element={<ExitClearanceCenter />} />
              <Route path="payroll" element={<AdminProviderWrapper><PayrollCenter /></AdminProviderWrapper>} />
              <Route path="approvals" element={<HRApprovals />} />
              <Route path="reports" element={<HRReports />} />
              <Route path="messages" element={<Messages />} />
              <Route path="profile" element={<HRProfile />} />
              <Route path="settings" element={<HRSettings />} />
            </Route>

            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute>
                <EmployeeProvider>
                  <AppLayout />
                </EmployeeProvider>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/employee/dashboard" replace />} />
              <Route path="dashboard" element={<RoleDashboardRedirect><EmployeeDashboard /></RoleDashboardRedirect>} />
              <Route path="profile" element={<EmployeeProfile />} />
              <Route path="attendance" element={<EmployeeAttendance />} />
              <Route path="leave" element={<EmployeeLeave />} />
              <Route path="payroll" element={<EmployeePayroll />} />
              <Route path="benefits" element={<EmployeeBenefits />} />
              <Route path="documents" element={<EmployeeDocuments />} />
              <Route path="performance" element={<EmployeePerformance />} />
              <Route path="help" element={<EmployeeHelpDesk />} />
              <Route path="settings" element={<EmployeeSettings />} />
              <Route path="resignation" element={<EmployeeResignation />} />
              <Route path="compliance" element={<EmployeeCompliance />} />
            </Route>

            {/* Manager Routes */}
            <Route path="/manager" element={
              <ProtectedRoute>
                <ManagerProvider>
                  <AppLayout />
                </ManagerProvider>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/manager/dashboard" replace />} />
              <Route path="dashboard" element={<RoleDashboardRedirect><ManagerDashboard /></RoleDashboardRedirect>} />
              <Route path="team" element={<TeamMembers />} />
              <Route path="attendance" element={<AttendanceReview />} />
              <Route path="approvals" element={<LeaveApproval />} />
              <Route path="kpi" element={<KPITracking />} />
              <Route path="tasks" element={<Tasks />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="reports" element={<ManagerReports />} />
              <Route path="profile" element={<ManagerProfile />} />
              <Route path="settings" element={<ManagerSettings />} />
              <Route path="resignations" element={<ManagerResignations />} />
              <Route path="reimbursements" element={<ManagerReimbursements />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/superadmin" element={<SuperAdminProvider><SuperAdminLayout /></SuperAdminProvider>}> 
              <Route index element={<SuperAdminDashboard />} />
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="analytics" element={<GlobalAnalytics />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="roles" element={<RolesPermissions />} />
              <Route path="departments" element={<DepartmentManagement />} />
              <Route path="payroll-config" element={<PayrollConfig />} />
              <Route path="payroll" element={<SuperAdminPayrollCenter />} />
              <Route path="benefits" element={<SuperAdminBenefitsConfig />} />
              <Route path="attendance" element={<SuperAdminAttendanceCenter />} />
              <Route path="profile" element={<SuperAdminProfile />} />
              <Route path="settings" element={<SuperAdminSettings />} />
              <Route path="global-settings" element={<ApplicationSettings />} />
              <Route path="pricing" element={<PricingManagement />} />
              <Route path="audit" element={<SuperAdminAuditLogs />} />
            </Route>
            <Route path="/SUPERADMIN/*" element={<Navigate to="/superadmin" replace />} />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminProviderWrapper>
                  <AppLayout />
                </AdminProviderWrapper>
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<RoleDashboardRedirect><AdminDashboard /></RoleDashboardRedirect>} />
              <Route path="org" element={<OrgSetup />} />
              <Route path="departments" element={<Departments />} />
              <Route path="org-chart" element={<OrgChart />} />
              <Route path="users" element={<Users />} />
              <Route path="roles" element={<RolesPermissions />} />
              <Route path="payroll-config" element={<PayrollConfig />} />
              <Route path="payroll" element={<PayrollCenter />} />
              <Route path="shifts" element={<ShiftManagement />} />
              <Route path="overtime" element={<OvertimePolicies />} />
              <Route path="holidays" element={<Holidays />} />
              <Route path="benefits" element={<BenefitsConfig />} />
              <Route path="compliance" element={<ComplianceCenter />} />
              <Route path="integrations" element={<Integrations />} />
              <Route path="billing" element={<Billing />} />
              <Route path="audit" element={<AdminAuditLogs />} />
              <Route path="resignations" element={<AdminResignations />} />
              <Route path="reimbursements" element={<AdminReimbursements />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="settings" element={<Settings />} />
              <Route path="global-settings" element={<ApplicationSettings />} />
              <Route path="profile" element={<AdminProfile />} />
              <Route path="workflows" element={<ApprovalWorkflows />} />
            </Route>

            {/* Additional Modules */}
            <Route path="/benefits" element={<AppLayout />}>
              <Route index element={<BenefitsDashboard />} />
            </Route>
            <Route path="/time" element={<AppLayout />}>
              <Route index element={<TimeDashboard />} />
            </Route>

            <Route path="/book-demo" element={<BookDemo />} />
            <Route path="/" element={<LandingPage />} />
              </Routes>
            </AdminProviderWrapper>
            </ScopeProvider>
            </PermissionProvider>
          </AuthProvider>
          </SettingsProvider>
        </CurrencyProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
