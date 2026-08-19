# HCM.ai — Complete Application Flow Document

> **Version:** 1.0  
> **Last Updated:** 2026-07-20  
> **Platform:** HCM.ai — AI-Powered Human Capital Management System  
> **Tech Stack:** React 19 + Vite (Frontend) | Express.js + Prisma + MySQL (Backend)

---

## Table of Contents

1. [System Architecture & Entry Points](#1-system-architecture--entry-points)
2. [Authentication Flow](#2-authentication-flow)
3. [Landing Page Flow](#3-landing-page-flow)
4. [SuperAdmin Flow](#4-superadmin-flow)
5. [Admin Flow](#5-admin-flow)
6. [HR Flow](#6-hr-flow)
7. [Manager Flow](#7-manager-flow)
8. [Employee Flow](#8-employee-flow)
9. [Candidate Flow](#9-candidate-flow)
10. [Cross-Module Flows](#10-cross-module-flows)
11. [Approval Workflow Engine](#11-approval-workflow-engine)
12. [Notification Flow](#12-notification-flow)
13. [Permission & RBAC Flow](#13-permission--rbac-flow)
14. [API Data Flow](#14-api-data-flow)

---

## 1. System Architecture & Entry Points

### 1.1 Application Entry
```
User opens browser → LandingPage (/) 
  ├── Click "Login" → /login (LoginPage)
  ├── Click "Sign Up" → /signup (SignupPage — Candidate only)
  ├── Click "Book a Demo" → /book-demo (BookDemo)
  └── Click Logo → / (LandingPage)
```

### 1.2 Provider Hierarchy (Context Wrapping)
```
<Router>
  └── <ThemeProvider>        → Dark/Light mode toggle
      └── <CurrencyProvider>  → Multi-currency support (USD, INR, EUR, GBP, etc.)
          └── <SettingsProvider> → Application settings
              └── <AuthProvider>  → JWT authentication + role routing
                  └── <PermissionProvider> → RBAC permissions
                      └── <AdminProviderWrapper> → Admin context
                          └── <Routes> → All page routes
```

### 1.3 Global Layout Structure
- **AppLayout**: Sidebar + Navbar + Main Content area (used by Candidate, HR, Employee, Manager, Admin)
- **SuperAdminLayout**: Dedicated layout for SuperAdmin with its own sidebar
- **Sidebar**: Collapsible (260px expanded → 80px collapsed), hover-expand, role-based menu items
- **Navbar**: Top bar with search, notifications bell, theme toggle, profile avatar, quick actions
- **ProtectedRoute**: JWT check → redirect to /login if unauthenticated

---

## 2. Authentication Flow

### 2.1 Login Flow (`/login`)
```
LoginPage loads
├── Form Fields:
│   ├── Work Email (with Mail icon, required)
│   ├── Password (with Lock icon, Eye toggle, required)
│   ├── "Forgot password?" link
│   └── "Remember for 30 days" checkbox
├── Buttons:
│   ├── [Sign In →] → POST /api/auth/login → JWT token saved → redirect to role dashboard
│   ├── [Google Workspace] → OAuth (placeholder)
│   └── "Sign up as Candidate" → /signup
├── Error: Red banner with auth error message
└── API: POST /api/auth/login { email, password }
    └── Response: { token, user: { id, email, role, organizationId, landingPage } }
    └── Saves: localStorage → hcm_token, hcm_user
    └── Navigate: ROLE_ROUTES[user.role] or user.landingPage
```

### 2.2 Signup Flow (`/signup`)
```
SignupPage loads (Candidate registration only)
├── Form Fields:
│   ├── Work Email (required)
│   ├── Password (required, Eye toggle)
│   └── Confirm Password (required, Eye toggle)
├── Validation: Passwords must match
├── Button: [Sign Up →] → POST /api/auth/register { email, password, role: 'CANDIDATE' }
├── Success → Navigate to /login
├── Error → Red banner with error message
└── "Already have an account? Sign In" → /login
```

### 2.3 Session Management
```
App loads
├── Check localStorage for hcm_token + hcm_user
├── If found → Restore user state + GET /api/auth/me (refresh)
│   ├── Success → Update user data
│   └── Failure → Logout (clear storage)
├── If NOT found → User stays on public pages
└── Logout:
    ├── Clear localStorage (hcm_token, hcm_user)
    ├── Clear sessionStorage (hcm_preview_role)
    └── Navigate to /login
```

### 2.4 Role Preview Mode (SuperAdmin Only)
```
SuperAdmin Dashboard → Click "Preview" button on any role card
├── sessionStorage saves hcm_preview_role
├── effectiveRole = previewRole
├── Navigate to target role's dashboard
├── RolePreviewBanner appears at top: "Previewing as [Role]"
└── "Exit Preview" button → return to SuperAdmin dashboard
```

---

## 3. Landing Page Flow

### 3.1 Landing Page Sections (`/`)
```
LandingPage (70,617 bytes — feature-rich)
├── HeroSection → Animated hero with CTA buttons
│   ├── [Start Free Trial] → /signup
│   └── [Book a Demo] → /book-demo
├── StatsSection → Live platform statistics counter
├── EnterpriseLogos → Trusted-by brand logos
├── FeaturesSection → Module feature cards
├── DashboardPreview → Interactive dashboard preview
├── RoleBasedSection → Role-specific feature showcase
├── AiAutomationSection → AI capabilities showcase
├── HowItWorksSection → 3-step workflow guide
├── RoiMetrics → ROI statistics with animations
├── PricingSection → Dynamic pricing tiers (from API: /api/pricing)
│   └── [Start Trial] / [Contact Sales] per plan
├── SecurityCompliance → Security & compliance badges
├── Integrations → Third-party integration logos
├── Testimonials → Customer testimonials carousel
├── CareersSection → Open positions listing
│   └── [Apply Now] → POST /api/public/career-apply
├── FaqSection → Accordion FAQ items
├── ContactSection → Contact form
│   └── [Send Message] → POST /api/public/contact
└── Footer → Links, social icons, copyright
```

### 3.2 Book Demo Flow (`/book-demo`)
```
BookDemo page (57,160 bytes — multi-step wizard)
├── Step 1: Company Information
│   ├── Full Name, Work Email, Phone
│   ├── Company Name, Company Size dropdown
│   ├── Industry, Country dropdowns
│   └── [Next →]
├── Step 2: Requirements
│   ├── Select modules (checkboxes): Core HR, Payroll, Recruitment, etc.
│   ├── Additional message textarea
│   └── [Next →]
├── Step 3: Schedule
│   ├── Calendar date picker
│   ├── Available time slots
│   └── [Next →]
├── Step 4: Confirm & Submit
│   ├── Summary review
│   └── [Book Demo] → POST /api/public/demo-booking
└── Success → Confirmation message
```

---

## 4. SuperAdmin Flow

### 4.1 Navigation Sidebar Items
```
Super Admin Console
├── Master Dashboard (/superadmin/dashboard)
├── Global Analytics (/superadmin/analytics)
├── Roles & Permissions (/superadmin/roles)
├── User Control (/superadmin/users)
├── Departments (/superadmin/departments)
├── Payroll Config (/admin/payroll-config) — shared with Admin
├── Payroll Management (/superadmin/payroll)
├── Benefits Management (/superadmin/benefits)
├── Attendance Management (/superadmin/attendance)
├── Pricing Management (/superadmin/pricing)
├── Audit Logs (/superadmin/audit)
├── Profile (/superadmin/profile)
└── Settings (/superadmin/settings)
```

### 4.2 Master Dashboard (`/superadmin/dashboard`)
```
SuperAdminDashboard
├── Stat Cards (auto-fetched from GET /api/superadmin/stats):
│   ├── Total Users (with growth %)
│   ├── Total Organizations
│   ├── Active Users
│   ├── Total Revenue (formatted with master currency)
│   ├── Total Departments
│   └── System Health status
├── Quick Actions Panel:
│   ├── [+ Add User] → Navigate to /superadmin/users
│   ├── [+ New Organization] → Navigate to /superadmin/users
│   ├── [View Analytics] → Navigate to /superadmin/analytics
│   └── [System Settings] → Navigate to /superadmin/settings
├── Role Preview Section:
│   ├── Admin Preview → [Preview] button → enterPreview('admin')
│   ├── HR Preview → [Preview] button → enterPreview('hr')
│   ├── Manager Preview → [Preview] button → enterPreview('manager')
│   └── Employee Preview → [Preview] button → enterPreview('employee')
├── Platform Activity Feed:
│   └── Recent audit logs with timestamps
├── Organization List Table:
│   └── Org name, plan, users count, status
├── Quick Audit Logs Modal:
│   ├── Filterable by action type
│   └── Export capability
├── Buttons:
│   ├── [Download Report] → Export CSV
│   ├── [Refresh Data] → Re-fetch stats
│   └── [View Full Audit] → /superadmin/audit
└── API: GET /api/superadmin/stats, GET /api/superadmin/users
```

### 4.3 Global Analytics (`/superadmin/analytics`)
```
GlobalAnalytics
├── Overview Cards:
│   ├── Total Revenue, Active Users, New Signups, Churn Rate
├── Charts:
│   ├── Revenue Trend (line chart)
│   ├── User Growth (area chart)
│   ├── Role Distribution (pie chart)
│   └── Department Distribution (bar chart)
├── Filters:
│   ├── Date Range selector
│   └── Organization filter
├── Buttons:
│   ├── [Export Report] → GET /api/superadmin/analytics/export
│   └── [Refresh] → Re-fetch analytics
└── API: GET /api/superadmin/analytics
```

### 4.4 User Control (`/superadmin/users`)
```
UserManagement
├── Header: "User Management" + [+ Add User] button
├── Search bar with filter by role/status
├── Users Table:
│   ├── Columns: Name, Email, Role, Organization, Status, Actions
│   └── Row Actions:
│       ├── [Edit] → Edit user modal
│       ├── [Toggle Active/Inactive] → PATCH /api/superadmin/users/:id/toggle-active
│       ├── [Change Role] → PATCH /api/superadmin/users/:id/role
│       ├── [Reset Password] → POST /api/superadmin/users/:id/reset-password
│       └── [Delete] → DELETE /api/superadmin/users/:id (with ConfirmDialog)
├── Add User Modal:
│   ├── Fields: Email, Password, Role (dropdown), Organization (dropdown)
│   └── [Create User] → POST /api/superadmin/users
├── Edit User Modal:
│   ├── Fields: Email, Role, Status, Organization
│   └── [Update] → PUT /api/superadmin/users/:id
└── API: GET/POST/PUT/DELETE /api/superadmin/users
```

### 4.5 Department Management (`/superadmin/departments`)
```
DepartmentManagement
├── [+ Add Department] → Modal with name, code, head, parent fields
├── Department Cards/List:
│   ├── Name, Code, Head, Employee Count
│   ├── [Edit] → Update modal → PUT /api/superadmin/departments/:id
│   └── [Delete] → DELETE /api/superadmin/departments/:id
└── API: GET/POST/PUT/DELETE /api/superadmin/departments
```

### 4.6 Payroll Management (`/superadmin/payroll`)
```
SuperAdmin PayrollCenter (63,419 bytes — full-featured)
├── Summary Cards:
│   ├── Total Payroll Cost, Employees Processed, Average Salary, Pending Payrolls
├── Payroll Settings Section:
│   ├── Master Currency, Payroll Cycle, Calculation Base
│   └── [Save Settings] → PUT /api/superadmin/payroll/settings
├── Generate Payroll Section:
│   ├── Select Month dropdown
│   └── [Generate Payroll] → POST /api/superadmin/payroll/generate
├── Payroll History Table:
│   ├── Columns: Employee, Month, Gross, Deductions, Net, Status
│   ├── Row Actions:
│   │   ├── [View Breakdown] → PayrollBreakdownModal
│   │   ├── [Edit] → Edit payslip modal → PUT /api/superadmin/payroll/:id
│   │   └── [Delete] → DELETE /api/superadmin/payroll/:id
│   └── [Bulk Approve] → PATCH /api/superadmin/payroll/bulk-approve
├── Filters: Month, Status, Search
├── Add Manual Payslip: [+ Add] → POST /api/superadmin/payroll
└── API: Full CRUD on /api/superadmin/payroll
```

### 4.7 Benefits Management (`/superadmin/benefits`)
```
SuperAdmin BenefitsConfig (48,119 bytes)
├── Benefit Plans Table
├── CRUD operations for benefit plans
├── Auto-enroll toggle
├── Employee benefit enrollment management
└── API: via admin benefit plan APIs
```

### 4.8 Attendance Management (`/superadmin/attendance`)
```
SuperAdmin AttendanceCenter (64,692 bytes)
├── Attendance Overview Dashboard Cards
├── Employee Attendance Logs Table
├── Manual Attendance Entry
├── Filters: Date range, Department, Status
├── Attendance Policy Configuration:
│   ├── Late Mark Threshold
│   ├── Late Marks for Half-Day
│   ├── Early Exit Threshold
│   ├── Half Day Working Minutes
│   └── [Save Policy]
├── Work Calendar Management
└── API: via admin attendance APIs
```

### 4.9 Pricing Management (`/superadmin/pricing`)
```
PricingManagement (38,723 bytes)
├── Active Pricing Plans Table:
│   ├── Columns: Name, Monthly Price, Yearly Price, Max Employees, Status
│   ├── [Edit] → Edit plan modal
│   ├── [Delete] → DELETE /api/pricing/:id
│   └── [Toggle Active/Inactive]
├── [+ Add Plan] → Create plan modal:
│   ├── Fields: Name, Description, Monthly Price, Yearly Price, Currency
│   ├── Fields: Max Employees, Max Admins, Storage Limit, AI Credits
│   ├── Fields: Support Level, Trial Days, Button Text, Button Link
│   ├── Is Popular toggle, Display Order
│   └── Features list (add/remove)
├── Feature Management per plan
└── API: GET/POST/PUT/DELETE /api/pricing
```

### 4.10 Audit Logs (`/superadmin/audit`)
```
SuperAdmin AuditLogs (11,321 bytes)
├── Audit Log Table:
│   ├── Columns: Action, User, Details, IP Address, Timestamp
├── Filters: Action type, Date range, User search
├── [Export Logs] → Download CSV
├── Log Detail Drawer → AuditLogDrawer
└── API: GET /api/superadmin/audit-logs
```

### 4.11 SuperAdmin Profile (`/superadmin/profile`)
```
SuperAdminProfile (46,866 bytes)
├── Profile Header with avatar, name, role badge
├── Personal Information Section (editable)
├── Account Security Section:
│   ├── Change Password form
│   └── Two-Factor Authentication toggle
├── Notification Preferences
├── Activity Timeline
└── API: GET/PUT /api/auth/me, POST /api/auth/change-password
```

### 4.12 SuperAdmin Settings (`/superadmin/settings`)
```
SuperAdminSettings (29,178 bytes)
├── Tab-based settings interface:
│   ├── General: Language, Timezone, Date Format
│   ├── Security: MFA, Password policies, IP whitelisting
│   ├── Appearance: Theme, Sidebar behavior
│   ├── Notifications: Email, Push, Summary toggles
│   └── Account: Deactivation, Data export
├── [Save Changes] per tab
└── API: GET/PUT /api/settings
```

---

## 5. Admin Flow

### 5.1 Navigation Sidebar Items
```
Admin Console
├── Dashboard (/admin/dashboard)
├── Org Setup (/admin/org)
├── Departments (/admin/departments)
├── Employees (/admin/users)
├── Roles & Permissions (/admin/roles)
├── Payroll Config (/admin/payroll-config)
├── Payroll Center (/admin/payroll)
├── Shift Management (/admin/shifts)
├── Overtime Rules (/admin/overtime)
├── Holidays (/admin/holidays)
├── Benefits Config (/admin/benefits)
├── AI Center (/admin/ai)
├── Compliance (/admin/compliance)
├── Integrations (/admin/integrations)
├── Billing (/admin/billing)
├── Resignations (/admin/resignations)
├── Reimbursements (/admin/reimbursements)
├── Audit Logs (/admin/audit)
├── Reports (/admin/reports)
├── Settings (/admin/settings)
├── Approval Workflows (/admin/workflows)
├── Global Settings (/admin/global-settings)
└── Profile (/admin/profile)
```

### 5.2 Admin Dashboard (`/admin/dashboard`)
```
AdminDashboard
├── 6 Stat Cards:
│   ├── Total Employees (count, "+3 this week")
│   ├── Active Users (count, "88% activity")
│   ├── Departments (count, "2 archived")
│   ├── Custom Roles (count, "Granular access")
│   ├── Target Payroll (₹ formatted, "Estimated monthly")
│   └── Compliance Alerts (count, "All clear")
├── Quick Actions:
│   ├── [+ Add Employee] → Opens UserModal
│   ├── [Run Payroll] → Processes payroll → Navigate /admin/payroll
│   ├── [Generate Report] → Downloads CSV
│   └── [Download CSV] → Exports user data
├── Recent Activity Section:
│   └── Latest audit logs with user/action/timestamp
├── Department Overview Section:
│   └── Department cards with employee counts
├── Buttons:
│   ├── [View All Users] → /admin/users
│   ├── [View All Departments] → /admin/departments
│   └── [View Audit Logs] → /admin/audit
└── API: GET /api/admin/stats, GET /api/admin/users
```

### 5.3 Organization Setup (`/admin/org`)
```
OrgSetup (23,754 bytes)
├── Organization Profile Form:
│   ├── Company Name, Legal Name
│   ├── Website URL, Industry
│   ├── Company Size dropdown
│   ├── Logo Upload (URL)
│   ├── Address field
│   ├── Tax ID / Registration Number
│   ├── Primary Email, Support Phone
│   ├── Timezone dropdown
│   └── Currency dropdown
├── Buttons:
│   ├── [Save Organization] → PUT /api/admin/organization/:id
│   └── [Create Organization] → POST /api/admin/organization (if none exists)
└── API: GET/POST/PUT /api/admin/organization
```

### 5.4 Departments (`/admin/departments`)
```
Departments (16,512 bytes)
├── Header: "Departments" + [+ Add Department]
├── Search + Filter bar
├── Department Cards Grid:
│   ├── Each card shows: Name, Code, Head, Employee Count, Color, Status
│   ├── [Edit] → DepartmentModal
│   └── [Delete] → ConfirmDialog → DELETE /api/admin/departments/:id
├── DepartmentModal (Add/Edit):
│   ├── Fields: Name, Code, Head (dropdown), Parent Dept
│   ├── Description, Color picker, Status toggle
│   └── [Save] → POST or PUT /api/admin/departments
└── API: GET/POST/PUT/DELETE /api/admin/departments
```

### 5.5 Employees/Users (`/admin/users`)
```
Users (33,244 bytes — full employee management)
├── Header: "Employees" + [+ Add Employee] + [Import Excel]
├── Search bar + Role filter + Status filter
├── Users Table:
│   ├── Columns: Avatar, Name, Employee ID, Email, Department, Role, Status, Actions
│   └── Row Actions (ActionDropdown):
│       ├── [Edit] → UserModal (edit mode)
│       ├── [Change Role] → Role change dropdown → PATCH /api/admin/users/:id/role
│       ├── [Toggle Active] → PATCH /api/admin/users/:id/toggle-active
│       └── [Delete] → ConfirmDialog → DELETE /api/admin/users/:id
├── UserModal (35,741 bytes — comprehensive form):
│   ├── Personal Details Tab:
│   │   ├── Full Name, Employee ID, Email, Phone (PhoneInput with country code)
│   │   ├── Date of Birth (DatePicker), Gender, Blood Group
│   │   └── Address
│   ├── Employment Details Tab:
│   │   ├── Department (dropdown), Manager (dropdown), Role (dropdown)
│   │   ├── Joining Date, Employment Type, Status
│   │   ├── Shift Assignment, Overtime Policy
│   │   └── Salary Type (Monthly/Hourly), Hourly Rate
│   ├── Compensation Tab:
│   │   ├── Salary Structure (dropdown)
│   │   ├── Monthly CTC, Annual CTC
│   │   ├── Salary Band, Currency
│   │   └── Effective Date
│   ├── Emergency Contact Tab:
│   │   ├── Emergency Contact Name
│   │   ├── Emergency Contact Phone
│   │   └── Relationship
│   └── [Save / Create Employee] → POST /api/admin/users
├── Import Excel: ImportExcelModal → POST /api/import/employees
│   ├── Upload .xlsx/.csv file
│   ├── Column mapping step
│   ├── Preview & validation
│   └── Confirm import
└── API: GET/POST/PATCH/DELETE /api/admin/users
```

### 5.6 Roles & Permissions (`/admin/roles`)
```
RolesPermissions (18,763 bytes)
├── Header: "Roles & Permissions" + [+ Create Role]
├── Roles Grid/List:
│   ├── Each role card: Name, Description, User Count, Status Badge
│   ├── Built-in roles (EMPLOYEE, MANAGER, HR, ADMIN) → View-only
│   └── Custom roles → [Edit] / [Delete]
├── RoleModal (20,664 bytes — comprehensive):
│   ├── Basic Info:
│   │   ├── Role Name, Description
│   │   ├── Inherits From (dropdown: EMPLOYEE, MANAGER, HR, ADMIN)
│   │   ├── Landing Page URL
│   │   └── Status toggle (Active/Inactive)
│   ├── Permissions Matrix:
│   │   ├── Module-level toggles (Dashboard, Users, Departments, Payroll, etc.)
│   │   └── Granular permissions per module (View, Create, Edit, Delete)
│   └── [Create Role] / [Update Role] → POST/PUT /api/admin/roles
└── API: GET/POST/PUT/DELETE /api/admin/roles
```

### 5.7 Payroll Config (`/admin/payroll-config`)
```
PayrollConfig (41,303 bytes — enterprise-grade)
├── Tabs:
│   ├── Salary Components Tab:
│   │   ├── Components Table: Name, Code, Category, Calculation Type, Value, Taxable
│   │   ├── [+ Add Component] → SalaryComponentModal:
│   │   │   ├── Name, Code (unique), Category (Earning/Deduction/Employer/Reimbursement/Variable/Benefit)
│   │   │   ├── Calculation Type (Fixed/Percentage/Formula/Slab/Auto Balance/Manual/Variable)
│   │   │   ├── Calculation Base (CTC/Basic/Gross/Net/Component Code)
│   │   │   ├── Value, Formula (if Formula type), Sequence
│   │   │   ├── Taxable toggle, Auto Balance toggle
│   │   │   ├── Employer Contribution toggle, Employee Deduction toggle
│   │   │   ├── Rounding Rule (Nearest/Up/Down/None)
│   │   │   └── [Save] → POST /api/admin/payroll-config/components
│   │   └── Row Actions: [Edit] → PUT, [Delete] → DELETE
│   ├── Deduction Rules Tab:
│   │   ├── Deductions Table: Name, Code, Category, Value Type, Value, Status
│   │   ├── [+ Add Deduction] → Modal:
│   │   │   ├── Name, Code, Category (PF/Tax/Loan/Insurance/Other)
│   │   │   ├── Value Type (Fixed/Percentage/Formula), Value
│   │   │   └── Pre-Tax toggle, Status toggle
│   │   └── [Delete] → DELETE /api/admin/payroll-config/deductions/:id
│   ├── Tax Rules Tab:
│   │   ├── Tax Slabs Table: Name, Country, State, Slabs (JSON)
│   │   ├── [+ Add Tax Rule] → TaxRulesModal:
│   │   │   ├── Name, Country, State
│   │   │   ├── Slabs builder (Min/Max income, Rate %, add/remove rows)
│   │   │   └── [Save] → POST /api/admin/payroll-config/taxes
│   │   └── [Delete] → DELETE /api/admin/payroll-config/taxes/:id
│   └── Approval Workflows Tab:
│       ├── Workflows Table: Name, Module, Steps, Status
│       ├── [+ Create Workflow] → Workflow builder
│       └── API: GET/POST /api/admin/workflows
└── API: /api/admin/payroll-config/*
```

### 5.8 Payroll Center (`/admin/payroll`)
```
PayrollCenter (29,829 bytes)
├── Summary Cards: Total Payroll, Processed, Pending, Average Salary
├── Employee Payroll Table:
│   ├── Columns: Employee, Dept, Basic, HRA, Allowance, PF, Tax, Net Pay, Status
│   ├── [View Breakdown] → PayrollBreakdownModal (detailed component-wise)
│   ├── [Mark Paid] → PATCH /api/admin/payslips/:id/pay
│   └── [Generate Payslip] → POST /api/admin/payslips
├── [Run Payroll] → POST /api/hr/payroll/run-batch (batch process)
├── Filters: Month, Department, Status
├── Export: [Download CSV]
└── API: GET/POST/PATCH /api/admin/payslips
```

### 5.9 Shift Management (`/admin/shifts`)
```
ShiftManagement (14,980 bytes)
├── [+ Add Shift] → Modal:
│   ├── Shift Name, Start Time, End Time
│   ├── Break Duration (min), Working Hours (min)
│   ├── Grace In (min), Grace Out (min)
│   ├── Is Default toggle
│   └── [Save] → POST /api/admin/shifts
├── Shifts Table:
│   ├── Columns: Name, Start, End, Break, Working Hours, Grace, Default, Actions
│   ├── [Edit] → PUT /api/admin/shifts/:id
│   └── [Delete] → DELETE /api/admin/shifts/:id
└── API: GET/POST/PUT/DELETE /api/admin/shifts
```

### 5.10 Overtime Policies (`/admin/overtime`)
```
OvertimePolicies (11,550 bytes)
├── [+ Add Policy] → Modal:
│   ├── Policy Name
│   ├── Weekday Multiplier (e.g., 1.5x)
│   ├── Weekend Multiplier (e.g., 2.0x)
│   ├── Holiday Multiplier (e.g., 2.0x)
│   ├── Min Overtime (minutes), Max Overtime (minutes)
│   ├── Is Default toggle
│   └── [Save] → POST /api/admin/overtime-policies
├── Policies Table with Edit/Delete actions
└── API: GET/POST/PUT/DELETE /api/admin/overtime-policies
```

### 5.11 Holidays (`/admin/holidays`)
```
Holidays (24,334 bytes)
├── Work Calendar Management Section:
│   ├── Calendar List with Name, Timezone, Default toggle, Status
│   ├── [+ Create Calendar] → POST /api/admin/calendars
│   ├── Calendar Versions (with weekend day config)
│   └── Calendar Assignments (assign to Employee/Department/Location/Shift/Branch)
├── Holiday Management Section:
│   ├── [+ Add Holiday] → HolidayModal:
│   │   ├── Name, Date, Type (Public/Company/Regional/Optional)
│   │   ├── Region, Description, Repeat toggle
│   │   ├── Calendar assignment dropdown
│   │   └── [Save] → POST /api/admin/holidays
│   ├── Holidays Table:
│   │   ├── Columns: Name, Date, Type, Region, Status, Actions
│   │   ├── [Edit] → PUT /api/admin/holidays/:id
│   │   └── [Delete] → DELETE /api/admin/holidays/:id
│   └── Filters: Month, Type, Region
└── API: GET/POST/PUT/DELETE /api/admin/holidays, /api/admin/calendars
```

### 5.12 Benefits Config (`/admin/benefits`)
```
BenefitsConfig (14,126 bytes)
├── [+ Add Benefit Plan] → BenefitPlanModal:
│   ├── Name, Category (Health/Insurance/Retirement/Education/Wellness)
│   ├── Provider, Company Contribution, Employee Contribution
│   ├── Eligibility, Description
│   ├── Auto-Enroll toggle, Status toggle
│   └── [Save] → POST /api/admin/benefits
├── Benefit Plans Table:
│   ├── Columns: Name, Category, Provider, Contribution, Status
│   ├── [Edit] → PUT /api/admin/benefits/:id
│   └── [Delete] → DELETE /api/admin/benefits/:id
└── API: GET/POST/PUT/DELETE /api/admin/benefits
```

### 5.13 AI Center (`/admin/ai`)
```
AICenter (10,657 bytes)
├── AI Modules Grid:
│   ├── Each module card: Name, Description, Status (Active/Paused), Confidence %
│   ├── [Configure] → AIModuleModal:
│   │   ├── Module settings (JSON-based)
│   │   ├── Confidence threshold slider
│   │   └── Enable/Disable toggle
│   └── [Toggle Status] → PUT /api/admin/ai/modules/:id
├── AI Activity Logs Table:
│   └── Recent AI actions with timestamps
├── [Train Models] → TrainModelsModal
├── Stats: Total modules, Active count, Avg confidence
└── API: GET/PUT /api/admin/ai/modules, GET/POST /api/admin/ai/logs
```

### 5.14 Compliance Center (`/admin/compliance`)
```
ComplianceCenter (22,034 bytes)
├── Compliance Summary Cards:
│   ├── Total Policies, Active, Expiring Soon, Needs Renewal
├── [+ Add Policy] → ComplianceModal (9,490 bytes):
│   ├── Policy Name, Category, Department
│   ├── Owner, Version, Effective Date, Expiry Date
│   ├── Requires Signature toggle
│   ├── Description (rich text), PDF Upload
│   └── [Save] → POST /api/admin/policies
├── Policies Table:
│   ├── Columns: Name, Category, Owner, Dept, Effective, Expiry, Version, Status
│   ├── Status badges: Active, Expiring Soon, Renewing, Archived
│   ├── [View] → PolicyDrawer (full policy detail sidebar)
│   ├── [Edit] → PUT /api/admin/policies/:id
│   ├── [Archive/Unarchive] → PATCH /api/admin/policies/:id/archive
│   ├── [Renew] → POST /api/admin/policies/:id/renew
│   ├── [Send Reminder] → POST /api/admin/policies/:id/remind
│   └── [Delete] → DELETE /api/admin/policies/:id
├── Filters: Category, Status, Department
├── [Run Security Scan] → SecurityScanModal
└── API: GET/POST/PUT/DELETE/PATCH /api/admin/policies
```

### 5.15 Integrations (`/admin/integrations`)
```
Integrations (11,647 bytes)
├── [+ Add Integration] → IntegrationModal:
│   ├── Name, Category, Status, Health, Sync Mode, Icon
│   └── [Save] → POST /api/admin/integrations
├── Integration Cards Grid:
│   ├── Each card: Icon, Name, Category, Status (Connected/Disconnected), Health, Sync
│   ├── [Configure] → IntegrationModal (edit)
│   └── [Disconnect] / [Connect] toggle
├── Categories: Communication, HRIS, Payroll, Cloud, Security
├── [API Documentation] → APIDocsDrawer
└── API: GET/POST/PUT/DELETE /api/admin/integrations
```

### 5.16 Billing (`/admin/billing`)
```
Billing (16,692 bytes)
├── Current Plan Card:
│   ├── Plan name, Price, Cycle (Monthly/Yearly), Users included
│   ├── [Upgrade Plan] → UpgradePlanModal
│   └── [Manage Add-ons] → ManageAddonsModal
├── Invoice History Table:
│   ├── Columns: Invoice Date, Amount, Payment Method, Status
│   ├── [View Details] → InvoiceDrawer (17,316 bytes — full invoice detail)
│   ├── [Download PDF] → Generate PDF
│   └── Status badges: Paid, Unpaid, Refunded
├── [+ Create Invoice] → POST /api/admin/billing/invoices
├── [Export All Invoices] → GET /api/admin/billing/invoices/export
├── Payment Methods Section:
│   ├── [+ Add Payment Method] → AddPaymentMethodModal (14,139 bytes)
│   └── Card display with last 4 digits
└── API: GET/PUT /api/admin/billing/plan, CRUD /api/admin/billing/invoices
```

### 5.17 Resignations (`/admin/resignations`)
```
AdminResignations (7,985 bytes)
├── Resignations Table:
│   ├── Columns: Employee, Submission Date, Exit Type, Status, Last Working Day
│   └── [Override Decision] → Modal:
│       ├── Override Status dropdown (Approve/Reject/Modify Last Working Day)
│       ├── Admin Comment
│       └── [Submit] → PATCH /api/admin/resignations/:id/override
├── Filters: Status, Exit Type
└── API: GET /api/admin/resignations
```

### 5.18 Reimbursements (`/admin/reimbursements`)
```
AdminReimbursements (20,489 bytes)
├── Pending Final Approvals Table:
│   ├── Columns: Employee, Claim Title, Amount, Manager Status, Final Status
│   └── Actions:
│       ├── [Approve] → PATCH /api/reimbursements/:id/approve { status: 'Approved' }
│       ├── [Reject] → PATCH /api/reimbursements/:id/approve { status: 'Rejected' }
│       └── [Process Payment] → PATCH /api/reimbursements/:id/process-payment
├── Filters: Status, Date
└── API: GET /api/reimbursements/approvals
```

### 5.19 Audit Logs (`/admin/audit`)
```
AdminAuditLogs (11,061 bytes)
├── Audit Log Table:
│   ├── Columns: Timestamp, User, Action, Details, IP Address
├── [View Details] → AuditLogDrawer (full detail sidebar)
├── Filters: AuditFilterModal (action type, date range, user)
├── [Export Logs] → ExportAuditModal (CSV/JSON/PDF)
├── [Archive Old Logs] → AuditArchiveModal
├── [Export History] → ExportHistoryModal
└── API: GET /api/admin/audit-logs
```

### 5.20 Reports (`/admin/reports`)
```
AdminReports (5,406 bytes)
├── Report Builder: [Build Custom Report] → ReportBuilderWizard:
│   ├── Step 1: Select Report Type
│   ├── Step 2: Choose Columns/Fields
│   ├── Step 3: Apply Filters
│   └── Step 4: Generate → Download
├── [Schedule Report] → ReportSchedulerModal
├── Pre-built report templates
└── Quick Download buttons (CSV, PDF, Excel)
```

### 5.21 Settings (`/admin/settings`)
```
Settings (12,985 bytes)
├── Tabs:
│   ├── General: Company name, Logo, Language, Timezone, Date Format
│   ├── Security: Password policy, Session timeout, MFA
│   ├── Notifications: Email templates, Push settings, Weekly summary
│   ├── Appearance: Theme (Light/Dark), Primary color
│   └── Advanced: API keys, Webhooks, Data export
├── [Save Changes] per tab
└── Persisted to localStorage (hcm_admin_settings)
```

### 5.22 Global/Application Settings (`/admin/global-settings`)
```
ApplicationSettings (5,325 bytes)
├── Platform Settings:
│   ├── Default Currency, Phone Country Code, Date Format
│   ├── Platform Mode (Production/Staging/Development)
│   ├── Max Organizations, Default Timezone, Master Currency
├── Security Settings:
│   ├── Global MFA toggle, Audit Log Retention
│   ├── Failed Login Attempts limit, IP Whitelisting toggle
├── Billing Settings:
│   ├── Base Price Per User, Free Trial Days, Grace Period
│   └── Invoice Interval
├── AI Configuration:
│   ├── Primary Model (e.g., Google Gemini 1.5 Pro)
│   ├── Resume Scan Auto-Rank toggle
│   ├── Matching Threshold %, API Rate Limit
├── Reimbursement Settings:
│   ├── Manager Approval Required toggle
│   └── Final Approval Role dropdown (ADMIN/HR/SUPERADMIN)
└── API: GET/PUT /api/settings
```

### 5.23 Approval Workflows (`/admin/workflows`)
```
ApprovalWorkflows (7,267 bytes)
├── [+ Create Workflow] → Modal:
│   ├── Workflow Name, Module (Leave/SalaryIncrement/BenefitEnrollment/Reimbursement)
│   ├── Description, Effective Date
│   ├── Steps Builder:
│   │   ├── Step Order, Approver Type (ROLE/CUSTOM_ROLE/SPECIFIC_USER/MANAGER)
│   │   ├── Approver Role, Is Required toggle, Can Skip toggle
│   │   └── [+ Add Step] / [Remove Step]
│   └── [Save Workflow] → POST /api/approval-workflows
├── Active Workflows Table:
│   ├── Columns: Name, Module, Version, Steps Count, Status
│   ├── [Edit] → PUT /api/approval-workflows/:id
│   ├── [Archive] → DELETE /api/approval-workflows/:id (soft delete)
│   ├── [Unarchive] → PUT /api/approval-workflows/:id/unarchive
│   └── [Hard Delete] → DELETE /api/approval-workflows/:id/hard
└── API: CRUD /api/approval-workflows
```

### 5.24 Admin Profile (`/admin/profile`)
```
AdminProfile (36,483 bytes)
├── Profile Header with avatar upload
├── Tabs:
│   ├── Personal Info: Full name, phone, DOB, gender, address
│   ├── Employment: Department, role, joining date, employee ID
│   ├── Security: Change password, 2FA
│   └── Preferences: Notifications, language, timezone
├── [Save Changes] → PUT /api/employee/profile
└── API: GET/PUT /api/employee/profile
```

---

## 6. HR Flow

### 6.1 Navigation Sidebar Items
```
HR Console
├── Dashboard (/hr/dashboard)
├── Job Posts (/hr/jobs)
├── Candidates (/hr/candidates)
├── Interviews (/hr/interviews)
├── Hiring Pipeline (/hr/pipeline)
├── Offer Management (/hr/offers)
├── Onboarding (/hr/onboarding)
├── Offboarding & Resignations (/hr/offboarding)
├── Payroll Operations (/hr/payroll)
├── Approvals (/hr/approvals)
├── Reports (/hr/reports)
├── Messages (/hr/messages)
├── Profile (/hr/profile)
└── Settings (/hr/settings)
```

### 6.2 HR Dashboard (`/hr/dashboard`)
```
HRDashboard
├── Stat Cards:
│   ├── Active Jobs (count, trend)
│   ├── Total Candidates (count, "New this week")
│   ├── Upcoming Interviews (count)
│   └── Offer Acceptance Rate (%)
├── Quick Actions:
│   ├── [+ Post New Job] → Navigate /hr/jobs
│   ├── [Schedule Interview] → Navigate /hr/interviews
│   └── [Export Report] → Downloads recruitment CSV
├── Upcoming Interviews Panel:
│   └── Interview cards with candidate name, role, date/time, [Join Call] button
├── Recent Candidates Table:
│   └── Name, Applied Role, Stage, AI Match %, Action buttons
├── Pipeline Overview Chart:
│   └── Visual funnel: Applied → Screening → Interview → Offered → Hired
├── Filters: Search bar
└── API: GET /api/hr/jobs, /api/hr/applications, /api/hr/interviews
```

### 6.3 Job Posts (`/hr/jobs`)
```
JobPosts (28,422 bytes)
├── [+ Create Job] → Job creation form:
│   ├── Title, Department, Description (textarea)
│   ├── Requirements (textarea), Salary Range
│   ├── Location, Job Type (Full-time/Part-time/Contract/Internship)
│   ├── Experience Level, Number of Openings
│   └── [Publish] → POST /api/hr/jobs
├── Jobs Table/Cards:
│   ├── Title, Department, Type, Location, Status, Applications count
│   ├── [Edit] → PUT /api/hr/jobs/:id
│   ├── [Close/Reopen] → PUT /api/hr/jobs/:id { status }
│   ├── [View Applications] → Navigate to /hr/candidates (filtered)
│   └── [Delete] → DELETE /api/hr/jobs/:id
├── Filters: Status (Published/Draft/Closed), Department, Type
└── API: GET/POST/PUT/DELETE /api/hr/jobs
```

### 6.4 Candidates (`/hr/candidates`)
```
Candidates (44,411 bytes — comprehensive talent management)
├── [+ Add Candidate] → Modal:
│   ├── Candidate Name, Email, Phone
│   ├── Applied Role, Resume Upload
│   └── [Save] → POST /api/hr/applications
├── Candidate Search + Multi-filter:
│   ├── Search by name/email
│   ├── Filter by Status: Applied, Screening, Shortlisted, Interviewing, Offered, Hired, Rejected
│   └── Filter by Job Post
├── Candidate Cards/Table:
│   ├── Avatar, Name, Applied Role, Status Badge, AI Match Score
│   ├── [View Profile] → Profile detail drawer
│   │   ├── Resume view, Skills, Experience
│   │   └── Application timeline
│   ├── [Change Status] → Dropdown:
│   │   └── PATCH /api/hr/applications/:id/status { status }
│   ├── [Schedule Interview] → Opens interview scheduling
│   ├── [Track Profile View] → PATCH /api/hr/applications/:id/track
│   ├── [Send Offer] → Navigate to /hr/offers
│   └── [Reject] → PATCH /api/hr/applications/:id/status { status: 'REJECTED' }
├── Bulk Actions:
│   └── Select multiple → Bulk status change
└── API: GET/POST/PATCH/DELETE /api/hr/applications
```

### 6.5 Interview Management (`/hr/interviews`)
```
InterviewManagement (43,286 bytes — rich scheduling system)
├── [+ Schedule Interview] → Modal:
│   ├── Select Application (dropdown)
│   ├── Select Interviewer (from employees)
│   ├── Date & Time picker
│   ├── Meeting Link (auto-generate or manual)
│   ├── Round (Technical/HR/Cultural/Final)
│   ├── Type (Video Call/In-Person/Phone)
│   └── [Schedule] → POST /api/hr/interviews
├── Interview Calendar View / List View toggle
├── Interview Cards/Table:
│   ├── Candidate Name, Role, Interviewer, Date/Time, Round, Type, Status
│   ├── Status: Scheduled, In Progress, Completed, Cancelled
│   ├── [Join Call] → Opens meeting link
│   ├── [Edit] → PUT /api/hr/interviews/:id
│   ├── [Update Status] → PATCH /api/hr/interviews/:id/status
│   ├── [Submit Feedback] → PATCH /api/hr/interviews/:id/feedback
│   │   ├── Rating (1-5 stars)
│   │   └── Written feedback textarea
│   ├── [Cancel] → PATCH /api/hr/interviews/:id/status { status: 'Cancelled' }
│   └── [Delete] → DELETE /api/hr/interviews/:id
├── Filters: Status, Round, Interviewer, Date Range
└── API: GET/POST/PUT/PATCH/DELETE /api/hr/interviews
```

### 6.6 Hiring Pipeline (`/hr/pipeline`)
```
HiringPipeline (25,711 bytes)
├── Pipeline Visualization:
│   ├── Applied → Screening → Shortlisted → Interviewing → Offered → Hired
│   └── Each stage shows count and candidate cards
├── Drag-and-drop candidate movement between stages
├── Stage Metrics:
│   ├── Conversion rates between stages
│   └── Average time per stage
├── Quick Actions per candidate in pipeline:
│   ├── [Move to Next Stage]
│   ├── [Schedule Interview]
│   └── [Reject]
└── API: PATCH /api/hr/applications/:id/status
```

### 6.7 Offer Management (`/hr/offers`)
```
OfferManagement (30,125 bytes)
├── [+ Create Offer] → Modal:
│   ├── Select Application/Candidate
│   ├── Role Title, Salary Package
│   ├── Joining Date, Sent Date
│   └── [Send Offer] → POST /api/hr/offers
├── Offers Table:
│   ├── Columns: Candidate, Role, Salary, Joining Date, Status, Sent Date
│   ├── Status: Sent, Accepted, Rejected, Expired, Withdrawn
│   ├── [Edit] → PUT /api/hr/offers/:id
│   ├── [Resend] → PUT /api/hr/offers/:id { status: 'Sent' }
│   ├── [Withdraw] → PUT /api/hr/offers/:id { status: 'Withdrawn' }
│   └── [Delete] → DELETE /api/hr/offers/:id
├── Offer Letter Preview
├── Filters: Status
└── API: GET/POST/PUT/DELETE /api/hr/offers
```

### 6.8 Onboarding (`/hr/onboarding`)
```
Onboarding (29,755 bytes)
├── [+ Add Onboarding] → Modal:
│   ├── Employee Name, Email, Phone
│   ├── Role, Department, Manager
│   ├── Joining Date, Application Link
│   └── [Create] → POST /api/hr/onboarding
├── Onboarding Tasks Table:
│   ├── Columns: Name, Role, Department, Progress %, Status, Joining Date
│   ├── Status: Not Started, In Progress, Completed
│   ├── Progress bar visualization
│   ├── [Edit] → PUT /api/hr/onboarding/:id
│   ├── [Update Progress] → PUT /api/hr/onboarding/:id { progress }
│   ├── [Remind Manager] → POST /api/hr/onboarding/:id/remind-manager
│   ├── [Promote to Employee] → POST /api/hr/onboarding/:id/promote
│   │   └── Creates User + EmployeeProfile from onboarding data
│   └── [Delete] → DELETE /api/hr/onboarding/:id
├── [Send Welcome Email (All)] → POST /api/hr/onboarding/send-welcome
├── Filters: Status, Department
└── API: GET/POST/PUT/DELETE /api/hr/onboarding
```

### 6.9 Exit Clearance Center (`/hr/offboarding`)
```
ExitClearanceCenter (27,858 bytes)
├── Exit Cases Table:
│   ├── Columns: Employee, Exit Type, Status, Submission Date, LWD, Clearance
│   ├── Status: Initiated, Pending Manager, Pending HR, Clearance In Progress, Completed
│   ├── Exit Type: Resignation, Termination, Retirement
│   ├── Clearance Checklist per employee:
│   │   ├── IT Clearance [✓/✗] toggle → PATCH /api/hr/exits/:id/clearance
│   │   ├── Finance Clearance [✓/✗] toggle
│   │   └── HR Clearance [✓/✗] toggle
│   ├── [Approve Resignation] → PATCH /api/hr/resignations/:id/approve
│   ├── [Finalize Exit] → PATCH /api/hr/exits/:id/finalize
│   └── Exit Interview Section:
│       ├── Feedback textarea
│       └── Rating (1-5)
├── [Initiate Termination] → POST /api/hr/terminate
│   ├── Select Employee, Exit Type, Reason
│   ├── Last Working Day
│   └── [Submit]
├── Probation Management Section:
│   ├── [Confirm Probation] → PATCH /api/hr/employees/:id/confirm-probation
│   └── [Extend Probation] → PATCH /api/hr/employees/:id/extend-probation
├── Filters: Status, Exit Type
└── API: GET /api/hr/exits
```

### 6.10 HR Approvals (`/hr/approvals`)
```
HRApprovals (35,722 bytes)
├── Tabs:
│   ├── Leave Requests: Pending leave approvals from all employees
│   │   └── [Approve/Reject] → PATCH /api/admin/leaves/:id
│   ├── Benefit Claims: Pending benefit claim approvals
│   ├── Salary Increments: 
│   │   ├── Pending increment requests
│   │   ├── [Approve] → PATCH /api/hr/payroll/increments/:id/approve
│   │   └── [Reject] → PATCH /api/hr/payroll/increments/:id/reject
│   ├── Support Tickets:
│   │   ├── [Reply] → POST /api/hr/tickets/:id/reply
│   │   └── [Update Status] → PATCH /api/hr/tickets/:id/status
│   └── Reimbursements: Final reimbursement approvals
├── Filters per tab: Status, Date, Department
└── API: Multiple endpoints for each approval type
```

### 6.11 Payroll Operations (`/hr/payroll`)
```
PayrollOperations (5,526 bytes)
├── Links to Admin Payroll Center (shared access)
├── Compensation Profile viewer per employee
├── [Run Payroll] → POST /api/hr/payroll/run
├── [Run Batch Payroll] → POST /api/hr/payroll/run-batch
├── Payroll Snapshots viewer → GET /api/hr/payroll/snapshots
└── [Finalize Payslip] → PATCH /api/hr/payroll/:id/finalize
```

### 6.12 Reports (`/hr/reports`)
```
HRReports (30,304 bytes — comprehensive)
├── Report Categories:
│   ├── Recruitment Analytics
│   ├── Employee Demographics
│   ├── Attendance Summary
│   ├── Leave Utilization
│   ├── Payroll Summary
│   └── Performance Distribution
├── Interactive Charts & Tables for each report type
├── [Export] → CSV/PDF download
├── Date Range filters
├── Department filters
├── [Schedule Report] → ReportSchedulerModal
└── API: GET /api/hr/reports
```

### 6.13 Messages (`/hr/messages`)
```
Messages (12,939 bytes)
├── Inbox/Sent tabs
├── Compose New Message
├── Message Thread View
├── Filters: Read/Unread, Date
└── Support ticket communication channel
```

### 6.14 HR Profile & Settings (`/hr/profile`, `/hr/settings`)
```
HRProfile (26,356 bytes) → Same structure as AdminProfile
HRSettings (25,272 bytes) → Settings tabs: General, Security, Notifications, Appearance
```

---

## 7. Manager Flow

### 7.1 Navigation Sidebar Items
```
Manager Console
├── Dashboard (/manager/dashboard)
├── Team Members (/manager/team)
├── Attendance Review (/manager/attendance)
├── Team Approvals (/manager/approvals)
├── KPI Tracking (/manager/kpi)
├── Tasks (/manager/tasks)
├── Reviews (/manager/reviews)
├── Team Resignations (/manager/resignations)
├── Reimbursements (/manager/reimbursements)
├── Reports (/manager/reports)
├── Profile (/manager/profile)
└── Settings (/manager/settings)
```

### 7.2 Manager Dashboard (`/manager/dashboard`)
```
ManagerDashboard (32,802 bytes)
├── Stat Cards:
│   ├── Team Size, Active Today, Pending Approvals, Average KPI Score
├── Quick Actions:
│   ├── [+ Assign Task] → ShowTaskModal
│   ├── [Download Report] → ShowExportModal
│   │   ├── Format: PDF Report / Excel Spreadsheet / CSV Data
│   │   ├── Date Range: Current Month / Last 30 Days / Last Quarter / YTD
│   │   └── [Download] → Generates and downloads
│   └── [+ Quick Review] → ShowReviewModal
├── Pending Leave Requests Panel:
│   ├── Leave cards with employee name, dates, type, reason
│   ├── [Approve] → PATCH /api/manager/leaves/:id { status: 'APPROVED' }
│   └── [Reject] → PATCH /api/manager/leaves/:id { status: 'REJECTED' }
├── Team Attendance Overview:
│   └── Today's clock-in/out status per member
├── Active Tasks Board:
│   └── Task cards with assignee, status, priority, due date
├── Team Performance Chart:
│   ├── Tab: This Week / This Month / This Quarter
│   └── KPI progress bars per team member
├── Export Modal:
│   ├── PDF: Opens print window with formatted report
│   └── CSV/Excel: Downloads file directly
└── API: GET /api/manager/team, /leaves, /tasks, /performance, /attendance
```

### 7.3 Team Members (`/manager/team`)
```
TeamMembers (52,008 bytes — detailed team management)
├── Header: "Team Members" + [+ Add Team Member]
├── Search + filters
├── Team Members Table:
│   ├── Columns: Avatar, Name, Employee ID, Role, Department, Status, Attendance, Performance
│   ├── [View Full Profile] → Expandable profile panel
│   │   ├── Personal details, Skills, Performance history
│   │   └── Compensation details (if visible)
│   ├── [Add Team Leave] → Submit leave on behalf of team member
│   ├── [Assign Task] → Quick task assignment
│   ├── [Request Increment] → POST /api/manager/increments
│   └── [View Attendance] → Filtered attendance view
├── [+ Add Team Member] → Modal:
│   ├── Search from org employees → GET /api/manager/org-employees
│   └── [Add to Team] → POST /api/manager/team
├── Team Stats Summary:
│   ├── Total members, Active today, On leave, Average rating
└── API: GET /api/manager/team, POST /api/manager/team
```

### 7.4 Attendance Review (`/manager/attendance`)
```
AttendanceReview (23,636 bytes)
├── Team Attendance Table:
│   ├── Columns: Employee, Date, Clock In, Clock Out, Status, Late, OT, Work Mode
│   ├── Status: Present, Absent, Late, Half-Day, On Leave
│   └── Work Mode: Office, Remote, Hybrid
├── [+ Add Manual Attendance] → Modal:
│   ├── Select Employee, Date, Clock In/Out times
│   ├── Status, Mode
│   └── [Save] → POST /api/manager/attendance
├── Filters: Date range, Employee, Status
├── Summary Cards: Present %, Late %, Average Hours
└── API: GET /api/manager/attendance, POST /api/manager/attendance
```

### 7.5 Leave Approval (`/manager/approvals`)
```
LeaveApproval (38,640 bytes)
├── Pending Leaves Table:
│   ├── Columns: Employee, Leave Type, Start-End Date, Days, Reason, Status
│   ├── [View Details] → Expanded view with full reason, emergency contact
│   ├── [Approve] → PATCH /api/manager/leaves/:id { status: 'MANAGER_APPROVED' }
│   ├── [Reject] → PATCH /api/manager/leaves/:id { status: 'REJECTED', comment }
│   └── Manager Comment textarea
├── Leave Calendar View:
│   └── Visual calendar showing team leaves
├── Leave History Tab: Previously reviewed requests
├── Filters: Status, Leave Type, Date Range
├── Stats: Pending count, Approved this month, Rejected
└── API: GET /api/manager/leaves, PATCH /api/manager/leaves/:id
```

### 7.6 KPI Tracking (`/manager/kpi`)
```
KPITracking (25,243 bytes)
├── Team KPI Dashboard:
│   ├── Average Team Score
│   ├── Top Performers
│   └── Needs Improvement list
├── Per-Employee KPI Cards:
│   ├── Employee name, Current KPI score
│   ├── Goals progress list
│   ├── [+ Add Goal] → POST /api/manager/performance
│   │   ├── Goal Title, Priority, Deadline
│   │   └── [Save]
│   └── Progress bar per goal
├── KPI Trend Charts
└── API: GET /api/manager/performance, POST /api/manager/performance
```

### 7.7 Tasks (`/manager/tasks`)
```
Tasks (30,152 bytes)
├── [+ Assign Task] → Modal:
│   ├── Select Employee (dropdown from team)
│   ├── Task Title, Description
│   ├── Priority (Low/Medium/High/Critical)
│   ├── Due Date (DatePicker)
│   └── [Assign] → POST /api/manager/tasks
├── Tasks Board (Kanban-style or Table):
│   ├── Status columns: Pending, In Progress, Completed, Overdue
│   ├── Task Cards: Title, Assignee avatar, Priority badge, Due date
│   ├── [Update Status] → PATCH /api/manager/tasks/:id { status }
│   └── [Edit] → PATCH /api/manager/tasks/:id
├── Filters: Status, Priority, Assignee
├── Stats: Total tasks, Completed %, Overdue count
└── API: GET/POST/PATCH /api/manager/tasks
```

### 7.8 Reviews (`/manager/reviews`)
```
Reviews (27,722 bytes)
├── [+ Create Review] → Modal:
│   ├── Select Employee, Review Period
│   ├── Rating (1-5 or descriptive scale)
│   ├── Written Review (textarea)
│   └── [Submit Review] → POST /api/manager/reviews
├── Reviews Table:
│   ├── Columns: Employee, Period, Rating, Reviewer, Date
│   ├── [View Full Review] → Expandable detail
│   └── [Edit] → PATCH /api/manager/reviews/:id
├── History view per employee
└── API: GET/POST/PATCH /api/manager/reviews
```

### 7.9 Resignations, Reimbursements, Reports (`/manager/resignations`, `/manager/reimbursements`, `/manager/reports`)
```
ManagerResignations (7,617 bytes):
├── Team resignation requests
├── [Approve/Reject] → PATCH /api/manager/resignations/:id
└── Comment field

ManagerReimbursements (14,186 bytes):
├── Team benefit claims pending manager review
├── [Approve] / [Reject] → PATCH /api/manager/reimbursements/:id/review
└── Comment field

ManagerReports (43,360 bytes — comprehensive):
├── Report types: Team Attendance, Leave Summary, Performance, Task Completion
├── Charts + Tables for each type
├── [Export CSV/PDF] per report
├── Date range + employee filters
└── API: Multiple GET endpoints
```

### 7.10 Manager Profile & Settings
```
ManagerProfile (27,701 bytes) → Personal info, employment, security, preferences
ManagerSettings (24,499 bytes) → Settings tabs with save functionality
```

---

## 8. Employee Flow

### 8.1 Navigation Sidebar Items
```
Employee Console
├── Dashboard (/employee/dashboard)
├── Profile (/employee/profile)
├── Attendance (/employee/attendance)
├── Leave (/employee/leave)
├── Payroll (/employee/payroll)
├── Benefits (/employee/benefits)
├── Documents (/employee/documents)
├── Performance (/employee/performance)
├── Help Desk (/employee/help)
├── Compliance (/employee/compliance)
├── Resignation (/employee/resignation)
└── Settings (/employee/settings)
```

### 8.2 Employee Dashboard (`/employee/dashboard`)
```
EmployeeDashboard (41,644 bytes — interactive & feature-rich)
├── Welcome Banner: "Good morning, [Name]!" with date/time
├── Clock In/Out Widget:
│   ├── Live timer showing worked hours:minutes:seconds
│   ├── [Clock In] → POST /api/employee/attendance/clock-in
│   │   └── Shows loader steps: "Verifying identity..." → "Registering clock-in..."
│   ├── [Clock Out] → POST /api/employee/attendance/clock-out
│   └── Status indicator: Clocked In (green) / Clocked Out (red)
├── Stat Cards:
│   ├── Today's Hours (live counter)
│   ├── Leave Balance (remaining days)
│   ├── This Month's Pay (from last payslip)
│   └── Tasks Due (pending task count)
├── Quick Actions:
│   ├── [Apply Leave] → Opens leave modal (LeaveModal)
│   │   ├── Leave Type dropdown (Casual/Sick/Annual/Comp Off/etc.)
│   │   ├── Start Date, End Date (DatePicker)
│   │   ├── Total Days (auto-calculated)
│   │   ├── Reason textarea
│   │   ├── Emergency Contact (PhoneInput)
│   │   └── [Submit Leave] → POST /api/employee/leaves
│   │       └── Steps: "Validating leave balance..." → "Submitting request..."
│   ├── [View Payslip] → Navigate /employee/payroll
│   │   └── Steps: "Fetching payroll data..." → "Rendering payslip..."
│   └── [Open Task Board] → Navigate /employee/performance
├── Upcoming Holidays Section:
│   ├── Holiday cards with name, date, type badge
│   ├── [View All Holidays] → Holiday modal (ShowHolidayModal)
│   ├── [Sync Calendar] → Calendar sync animation
│   └── [Download Holiday PDF] → PDF generation
├── Recent Announcements Section:
│   ├── Announcement cards with title, date, category, priority
│   ├── [View Details] → Announcement detail modal
│   ├── [Download Attachment] → If attachment exists
│   └── [View All] → Full announcements board (ShowDetailBoardModal)
├── Leave Request History (recent)
├── Performance Summary Mini-Widget
│   └── Goals progress bars
└── API: GET /api/employee/profile, /attendance, /leaves, /payslips, /performance, /holidays, /announcements
```

### 8.3 Employee Profile (`/employee/profile`)
```
EmployeeProfile (33,690 bytes)
├── Profile Header:
│   ├── Avatar (editable), Full Name, Employee ID, Role badge
│   └── Department, Manager name
├── Tabs:
│   ├── Personal Information:
│   │   ├── Full Name, Phone (PhoneInput), DOB (DatePicker)
│   │   ├── Gender dropdown, Blood Group, Address
│   │   ├── Bio textarea
│   │   └── [Save] → PUT /api/employee/profile
│   ├── Employment Details (read-only):
│   │   ├── Employee ID, Joining Date, Employment Type
│   │   ├── Department, Manager, Role
│   │   ├── Shift, Overtime Policy
│   │   ├── Lifecycle Status badge
│   │   └── Probation details (if under probation)
│   ├── Emergency Contact:
│   │   ├── Contact Name, Phone, Relationship
│   │   └── [Save] → PUT /api/employee/profile
│   └── Skills:
│       ├── Skill list with proficiency bars
│       ├── [+ Add Skill] → POST /api/employee/performance/skills
│       └── [Delete Skill] → DELETE /api/employee/performance/skills/:id
├── Compensation Overview (read-only):
│   ├── Monthly CTC, Annual CTC, Salary Structure name
│   └── Component breakdown
└── API: GET/PUT /api/employee/profile, /compensation
```

### 8.4 Employee Attendance (`/employee/attendance`)
```
EmployeeAttendance (21,385 bytes)
├── Current Status Widget:
│   ├── Clock In/Out buttons
│   └── Live timer
├── Attendance Calendar:
│   └── Monthly view with color-coded days (Present/Absent/Leave/Holiday)
├── Attendance Log Table:
│   ├── Columns: Date, Clock In, Clock Out, Status, Work Mode, Late Min, OT Min
│   └── No edit capability (view-only for employees)
├── Summary Stats:
│   ├── Present Days, Absent Days, Late Days
│   ├── Average Hours, Total Overtime
│   └── Half-Days count
├── Filters: Month/Year selector
└── API: GET /api/employee/attendance
```

### 8.5 Employee Leave (`/employee/leave`)
```
EmployeeLeave (16,012 bytes)
├── Leave Balance Cards:
│   ├── Casual Leave: Used/Total
│   ├── Sick Leave: Used/Total
│   ├── Annual Leave: Used/Total
│   └── Other types as configured
├── [+ Apply Leave] → Leave form:
│   ├── Leave Type, Start Date, End Date
│   ├── Total Days (auto-calc), Reason
│   ├── Emergency Contact (optional)
│   └── [Submit] → POST /api/employee/leaves
├── My Leave Requests Table:
│   ├── Columns: Type, From-To, Days, Status, Manager Comment
│   ├── Status: Pending, Manager Approved, Approved, Rejected
│   └── [Cancel] → DELETE /api/employee/leaves/:id (only if Pending)
├── Leave Calendar View
└── API: GET/POST/DELETE /api/employee/leaves
```

### 8.6 Employee Payroll (`/employee/payroll`)
```
EmployeePayroll (8,741 bytes)
├── Current Month Payslip Card:
│   ├── Month, Basic, HRA, Allowance, Bonus
│   ├── Deductions: PF, Tax
│   ├── Net Pay (highlighted)
│   ├── Status: Paid/Unpaid
│   └── [Download Payslip PDF] → jsPDF generation
├── Payslip History Table:
│   ├── Columns: Month, Basic, HRA, PF, Tax, Net Pay, Status
│   └── [View Details] → Expanded breakdown
├── Compensation Profile Section:
│   ├── Salary Structure, Monthly CTC, Annual CTC
│   └── Component-wise breakdown
├── [Request Increment] → POST /api/employee/compensation/increment
│   ├── Requested Amount, Reason
│   └── Effective Date
├── Enterprise Payroll Snapshots:
│   ├── Monthly snapshots with gross, deductions, net, employer cost
│   └── Detailed item-by-item breakdown
└── API: GET /api/employee/payslips, /compensation, /payroll/snapshots
```

### 8.7 Employee Benefits (`/employee/benefits`)
```
EmployeeBenefits (25,151 bytes)
├── My Enrolled Plans Section:
│   ├── Enrolled benefit cards with plan name, provider, status
│   ├── [Unenroll] → POST /api/employee/benefits/unenroll
│   └── Status: Pending, Active, Approved
├── Available Plans Section:
│   ├── Available benefit plan cards
│   ├── Plan details: Category, Provider, Contribution, Eligibility
│   └── [Enroll] → POST /api/employee/benefits/enroll { benefitPlanId }
├── Benefit Claims Section:
│   ├── [+ Submit Claim] → Modal:
│   │   ├── Claim Title, Provider, Amount
│   │   └── [Submit] → POST /api/employee/benefits/claims
│   ├── Claims History Table:
│   │   ├── Title, Provider, Amount, Status, Dates
│   │   └── Multi-stage status: Submitted → Manager Review → Final Approval → Payment
│   └── Claim Detail View:
│       ├── Full approval timeline
│       └── Payment tracking
└── API: GET/POST /api/employee/benefits
```

### 8.8 Employee Documents (`/employee/documents`)
```
EmployeeDocuments (13,283 bytes)
├── [+ Upload Document] → Modal:
│   ├── Document Name, Category (ID Proof/Certificates/Tax/Other)
│   ├── File upload (base64)
│   └── [Upload] → POST /api/employee/documents
├── Documents Table:
│   ├── Columns: Name, Category, Size, Upload Date
│   ├── [View] → Opens document
│   ├── [Download] → Downloads file
│   └── [Delete] → DELETE /api/employee/documents/:id
├── Categories Filter
└── API: GET/POST/DELETE /api/employee/documents
```

### 8.9 Employee Performance (`/employee/performance`)
```
EmployeePerformance (31,095 bytes)
├── Performance Summary:
│   ├── Overall Rating, Goals Completion %, Skills Count
├── Goals Section:
│   ├── Goal cards with title, priority badge, progress bar, deadline
│   ├── [Update Progress] → POST /api/employee/performance/goals/:id/progress
│   │   └── Progress slider (0-100%)
│   └── Priority: Low, Medium, High, Critical
├── Skills Section:
│   ├── Skill bars with name and proficiency level (0-100%)
│   ├── [+ Add Skill] → POST /api/employee/performance/skills
│   ├── [Update Skill Level] → POST /api/employee/performance/skills
│   └── [Delete Skill] → DELETE /api/employee/performance/skills/:id
├── Reviews History:
│   ├── Review cards with period, reviewer, rating, feedback text
│   └── Chronological timeline
├── Tasks Section:
│   └── Assigned tasks with status, priority, due date
├── Charts:
│   └── Performance trend over time
└── API: GET /api/employee/performance, /tasks
```

### 8.10 Employee Help Desk (`/employee/help`)
```
EmployeeHelpDesk (23,550 bytes)
├── [+ Open Ticket] → OpenTicketModal (11,261 bytes):
│   ├── Subject, Category (IT Support/HR Query/Payroll/Facilities/Other)
│   ├── Priority (Low/Medium/High/Critical)
│   ├── Initial message textarea
│   ├── Attachment upload
│   └── [Submit] → POST /api/employee/tickets
├── My Tickets Table:
│   ├── Columns: Subject, Category, Priority, Status, Created Date
│   ├── Status: Open, In Progress, Resolved
│   ├── [View Thread] → Opens message thread
│   │   ├── Chat-style message display
│   │   ├── [Reply] → POST /api/employee/tickets/:id/reply
│   │   │   ├── Message textarea + attachment
│   │   │   └── Sender indicator (You / Support)
│   │   └── [Delete Message] → DELETE /api/employee/tickets/:id/messages/:msgId
│   └── Priority badges with color coding
├── Filters: Status, Category, Priority
└── API: GET/POST /api/employee/tickets
```

### 8.11 Employee Compliance (`/employee/compliance`)
```
EmployeeCompliance (11,911 bytes)
├── Active Policies Table:
│   ├── Columns: Policy Name, Category, Version, Status, Acknowledged
│   ├── [View Policy] → Full policy document view
│   ├── [Acknowledge] → POST /api/employee/policies/:id/acknowledge
│   │   └── Marks policy as acknowledged (requires digital signature concept)
│   └── Already acknowledged → "Acknowledged ✓" badge
├── Filters: Category, Acknowledged status
└── API: GET /api/employee/policies, POST /api/employee/policies/:id/acknowledge
```

### 8.12 Employee Resignation (`/employee/resignation`)
```
EmployeeResignation (8,554 bytes)
├── Submit Resignation Form:
│   ├── Reason (textarea)
│   ├── Last Working Day (DatePicker)
│   ├── Exit Type: Resignation (default)
│   ├── Attachment Upload (optional)
│   └── [Submit Resignation] → POST /api/employee/resignation
├── Current Resignation Status (if submitted):
│   ├── Status badge: Initiated, Pending Manager, Pending HR, Approved, etc.
│   ├── Manager decision & comment
│   ├── HR decision & comment
│   ├── Final Last Working Day
│   └── Clearance status: IT / Finance / HR checkmarks
├── Exit Interview Section (if applicable):
│   └── Feedback form
└── API: GET/POST /api/employee/resignation
```

### 8.13 Employee Settings (`/employee/settings`)
```
EmployeeSettings (23,286 bytes)
├── Tabs:
│   ├── General: Language, Timezone, Date Format preferences
│   ├── Security:
│   │   ├── Change Password form (current + new + confirm)
│   │   │   └── [Change Password] → POST /api/auth/change-password
│   │   └── Two-Factor Authentication toggle
│   ├── Notifications:
│   │   ├── Email Notifications toggle
│   │   ├── Push Notifications toggle
│   │   └── Weekly Summary toggle
│   └── Appearance:
│       ├── Theme: Light/Dark toggle (ThemeToggle component)
│       └── Sidebar collapsed default
├── [Save Changes] per tab → PUT /api/employee/profile
└── API: PUT /api/employee/profile
```

---

## 9. Candidate Flow

### 9.1 Navigation Sidebar Items
```
Candidate Console
├── Dashboard (/candidate/dashboard)
├── Browse Jobs (/candidate/jobs)
├── My Applications (/candidate/applications)
├── Resume Builder (/candidate/resume)
├── AI Resume Score (/candidate/ai-score)
├── Interview Schedule (/candidate/interviews)
├── Notifications (/candidate/notifications)
├── Profile (/candidate/profile)
└── Settings (/candidate/settings)
```

### 9.2 Candidate Dashboard (`/candidate/dashboard`)
```
CandidateDashboard (27,298 bytes)
├── Stat Cards:
│   ├── Total Applications (count, "X new this week")
│   ├── Upcoming Interviews (count)
│   ├── Active Offers (count, "X new")
│   ├── Shortlisted (count)
│   ├── Recruiter Views (profile view count)
│   └── Resume Downloads (download count)
├── Profile Completeness Widget:
│   ├── Progress bar (% complete)
│   ├── Checklist: Name ✓, Email ✓, Phone ✓, Location ✓, Resume ✓, Skills ✓
│   └── [Complete Profile] → Navigate /candidate/profile
├── Upcoming Interviews Section:
│   ├── Interview cards: Company, Role, Date/Time, Type (Video/In-Person)
│   ├── [Join Interview] → Opens meeting link
│   └── Status badges: Scheduled, In Progress, Completed
├── Recent Application Activity:
│   ├── Application cards with Job Title, Status, Date
│   ├── [View Details] → Application detail modal
│   ├── [Request Update] → Sends notification
│   └── Status: Applied → Screening → Shortlisted → Interview → Offered → Hired/Rejected
├── Profile Visits Section:
│   └── Who viewed your profile (company, industry, time)
├── Career Analytics Modal (isAnalyticsOpen):
│   ├── Application success rate
│   ├── Most applied-to industries
│   └── Interview conversion rate
├── Quick Actions:
│   ├── [Browse New Jobs] → /candidate/jobs
│   ├── [Build Resume] → /candidate/resume
│   └── [View Analytics] → Opens analytics modal
└── API: GET /api/candidate/applications, /profile, /offers
```

### 9.3 Browse Jobs (`/candidate/jobs`)
```
BrowseJobs (37,015 bytes)
├── Search Bar: Search by title, keyword, company
├── Filters Panel:
│   ├── Job Type: Full-time, Part-time, Contract, Internship
│   ├── Experience Level
│   ├── Location
│   ├── Salary Range
│   └── Department
├── Job Cards/List:
│   ├── Each card: Title, Company, Location, Salary Range, Job Type, Experience
│   ├── Posted date, Number of applicants
│   ├── [View Details] → Expanded job description
│   │   ├── Full description, Requirements list
│   │   ├── Company info, Benefits
│   │   └── [Apply Now] → Navigate to /candidate/jobs/apply?jobId=xxx
│   ├── [Quick Apply] → POST /api/candidate/jobs/:jobId/apply
│   └── [Save Job] → Local bookmark
├── Pagination
└── API: GET /api/candidate/jobs (public endpoint)
```

### 9.4 Application Form (`/candidate/jobs/apply`)
```
ApplicationForm (19,050 bytes)
├── Job Info Header (read-only from query param)
├── Form Fields:
│   ├── Resume Upload or select existing resume
│   ├── Cover Letter textarea
│   ├── Additional information
│   └── Skills matching display
├── [Submit Application] → POST /api/candidate/jobs/:jobId/apply
│   ├── Body: { resumeUrl, coverLetter }
│   └── Redirect to /candidate/applications on success
└── API: POST /api/candidate/jobs/:jobId/apply
```

### 9.5 My Applications (`/candidate/applications`)
```
MyApplications (28,500 bytes)
├── Application Cards:
│   ├── Job Title, Company, Applied Date
│   ├── Status Badge: Applied, Screening, Shortlisted, Interviewing, Offered, Hired, Rejected, Withdrawn
│   ├── Status Timeline visualization
│   ├── [View Details] → Expanded application detail
│   │   ├── Job info, Resume used, Cover letter
│   │   ├── Interview history
│   │   └── Offer details (if offered)
│   └── [Withdraw] → DELETE /api/candidate/applications/:appId
│       └── Confirmation dialog before withdrawing
├── Offer Response Section (if offers exist):
│   ├── [Accept Offer] → PATCH /api/candidate/offers/:id/respond { response: 'accept' }
│   └── [Decline Offer] → PATCH /api/candidate/offers/:id/respond { response: 'decline' }
├── Filters: Status, Date
├── Stats: Total, In Progress, Offered, Rejected
└── API: GET /api/candidate/applications, GET /api/candidate/offers
```

### 9.6 Resume Builder (`/candidate/resume`)
```
ResumeBuilder (65,535 bytes — full-featured builder)
├── Resume Editor (WYSIWYG):
│   ├── Personal Information Section
│   ├── Professional Summary
│   ├── Work Experience (add/remove entries):
│   │   ├── Company, Title, Start/End Date
│   │   └── Description bullets
│   ├── Education (add/remove entries):
│   │   ├── Institution, Degree, Year
│   │   └── GPA/Percentage
│   ├── Skills (tag-style input)
│   ├── Projects (add/remove)
│   ├── Certifications (add/remove)
│   └── Awards & Achievements
├── Live Preview Panel:
│   └── Real-time resume rendering
├── Template Selector:
│   └── Multiple resume templates
├── Buttons:
│   ├── [Save Resume] → PUT /api/candidate/profile { resumeData }
│   ├── [Download PDF] → jsPDF generation from resume data
│   └── [Get AI Score] → Navigate /candidate/ai-score
├── Auto-save functionality
└── API: PUT /api/candidate/profile
```

### 9.7 AI Resume Score (`/candidate/ai-score`)
```
AIResumeScore (28,612 bytes)
├── Upload/Select Resume Section
├── AI Analysis Results:
│   ├── Overall Score (percentage)
│   ├── Category Scores:
│   │   ├── Format & Structure
│   │   ├── Keywords & Skills Match
│   │   ├── Experience Relevance
│   │   ├── Education Match
│   │   └── ATS Compatibility
│   ├── Strengths List
│   ├── Improvement Suggestions
│   └── Industry-specific recommendations
├── Job Match Analysis:
│   └── Compare resume against specific job postings
├── [Improve Resume] → Navigate back to /candidate/resume
├── [Download Report] → PDF of analysis
└── Local AI scoring (no dedicated backend endpoint - client-side analysis)
```

### 9.8 Interview Schedule (`/candidate/interviews`)
```
InterviewSchedule (30,371 bytes)
├── Upcoming Interviews:
│   ├── Interview Cards:
│   │   ├── Company/Job, Interviewer, Date/Time
│   │   ├── Type: Video Call / In-Person / Phone
│   │   ├── Meeting Link
│   │   ├── Round: Technical / HR / Cultural / Final
│   │   ├── [Join Call] → Opens meeting link
│   │   └── Status badge
├── Past Interviews:
│   ├── Result: Passed / Failed / Pending
│   ├── Feedback (if shared)
│   └── Rating
├── Calendar View
├── Filters: Status, Type
└── API: Data from candidate context (via applications)
```

### 9.9 Notifications (`/candidate/notifications`)
```
Notifications (12,720 bytes)
├── Notification List:
│   ├── Each notification: Title, Message, Type badge, Timestamp, Read/Unread
│   ├── Types: INFO, SUCCESS, WARNING, ALERT
│   ├── [Mark as Read] → PATCH
│   └── [View Related] → Navigate to linked page
├── Filters: Type, Read/Unread
├── [Mark All Read]
└── API: GET /api/notifications
```

### 9.10 Candidate Profile & Settings
```
CandidateProfile (25,646 bytes):
├── Personal info: Name, Email, Phone, Location, DOB
├── Resume upload, LinkedIn, Portfolio links
├── Skills list, Expected Salary, Experience
├── Document uploads: ID Proof, Education Proof
├── [Save Profile] → PUT /api/candidate/profile
└── API: GET/PUT /api/candidate/profile

CandidateSettings (22,986 bytes):
├── Settings tabs: General, Security, Notifications, Appearance
├── Change Password
├── Notification preferences
└── API: GET/PUT /api/candidate/settings
```

---

## 10. Cross-Module Flows

### 10.1 Hire-to-Retire Lifecycle
```
Candidate applies (/candidate/jobs)
  → HR reviews application (/hr/candidates)
    → HR schedules interview (/hr/interviews)
      → Interview conducted → Feedback submitted
        → HR moves to "Offered" (/hr/pipeline)
          → HR creates offer (/hr/offers)
            → Candidate accepts offer (/candidate/applications)
              → HR creates onboarding task (/hr/onboarding)
                → HR promotes to Employee (/hr/onboarding → "Promote")
                  → Employee profile created → User with EMPLOYEE role
                    → Employee uses dashboard (/employee/dashboard)
                      → Normal employee operations (attendance, leave, payroll, etc.)
                        → Employee submits resignation (/employee/resignation)
                          → Manager reviews (/manager/resignations)
                            → HR reviews (/hr/offboarding)
                              → Exit clearance (/hr/offboarding)
                                → Employee relieved
```

### 10.2 Payroll Lifecycle
```
Admin creates Salary Components (/admin/payroll-config)
  → Admin creates Salary Structures (/admin/payroll-config)
    → Admin creates/edits Employee with compensation (/admin/users)
      → HR/Admin runs payroll (/admin/payroll or /hr/payroll)
        → Payroll engine calculates: Gross - Deductions = Net
          → Payroll snapshots created per employee
            → Admin reviews & finalizes
              → Employee views payslip (/employee/payroll)
```

### 10.3 Leave Approval Lifecycle
```
Employee applies leave (/employee/leave)
  → POST /api/employee/leaves
    → Status: PENDING
      → Manager sees in approvals (/manager/approvals)
        → Manager Approves → Status: MANAGER_APPROVED
          → HR/Admin sees for final approval (if configured)
            → Final Approve → Status: APPROVED
        → Manager Rejects → Status: REJECTED
      → Employee can cancel if still PENDING
```

### 10.4 Reimbursement/Benefit Claim Lifecycle
```
Employee submits benefit claim (/employee/benefits)
  → Manager reviews (/manager/reimbursements)
    → Manager Approves (managerStatus: Approved)
      → Admin/HR does final approval (/admin/reimbursements)
        → Admin Approves (finalApprovalStatus: Approved)
          → Admin processes payment (paymentStatus: Paid)
    → Manager Rejects (managerStatus: Rejected)
```

### 10.5 Resignation Lifecycle
```
Employee submits resignation (/employee/resignation)
  → POST /api/employee/resignation
    → ExitLifecycle created: status = INITIATED
      → Manager reviews (/manager/resignations)
        → PATCH: status = PENDING_HR_APPROVAL / REJECTED_BY_MANAGER
          → HR reviews (/hr/offboarding)
            → PATCH: status = APPROVED / REJECTED_BY_HR
              → Clearance checklist:
                ├── IT Clearance ✓
                ├── Finance Clearance ✓
                └── HR Clearance ✓
              → All clearances done → Finalize Exit
                → Employee status: RESIGNED / EMPLOYEE_RELIEVED
      → Admin can override at any point (/admin/resignations)
```

---

## 11. Approval Workflow Engine

### 11.1 Workflow Configuration
```
Admin/HR creates workflow (/admin/workflows):
  ├── Name, Module (Leave/SalaryIncrement/BenefitEnrollment/Reimbursement)
  ├── Steps: Ordered sequence of approvers
  │   ├── Step 1: MANAGER (Required)
  │   ├── Step 2: HR (Required)
  │   └── Step 3: ADMIN (Optional, Can Skip)
  └── Active/Inactive toggle
```

### 11.2 Workflow Execution
```
Entity submitted (e.g., Leave Request)
  → System finds active workflow for module "LeaveRequest"
    → Step 1: Send to Manager for approval
      → Manager approves → Move to Step 2
      → Manager rejects → Entity rejected
    → Step 2: Send to HR for approval
      → HR approves → Move to Step 3
      → HR rejects → Entity rejected
    → Step 3 (if can_skip): Send to Admin
      → Admin approves → Entity fully approved
      → Admin skips → Entity approved (skipped optional step)
    → All steps complete → Entity status: APPROVED
```

### 11.3 API Endpoints
```
POST   /api/approvals/:module/:entityId/approve → Approve at current step
POST   /api/approvals/:module/:entityId/reject  → Reject at current step
GET    /api/approvals/:module/:entityId/timeline → Full approval timeline
GET    /api/approvals/:module/:entityId/current-step → Current pending step
```

---

## 12. Notification Flow

### 12.1 Notification Types
```
INFO    → General information (blue)
SUCCESS → Action completed (green)
WARNING → Attention needed (yellow)
ALERT   → Critical/urgent (red)
```

### 12.2 Notification Triggers
```
Leave submitted → Notify manager
Leave approved/rejected → Notify employee
Interview scheduled → Notify candidate + interviewer
Offer sent → Notify candidate
Payslip generated → Notify employee
Task assigned → Notify employee
Resignation submitted → Notify manager + HR
Policy reminder → Notify all employees
Support ticket update → Notify ticket creator
```

### 12.3 Notification Delivery
```
Navbar Bell Icon → Click → GET /api/notifications
  ├── Badge count of unread notifications
  ├── Dropdown list: Title, message preview, timestamp, type icon
  ├── [Mark as Read] per notification
  └── [View All] → Full notifications page
```

---

## 13. Permission & RBAC Flow

### 13.1 Permission Architecture
```
User has:
  ├── Built-in Role (SUPERADMIN, ADMIN, HR, MANAGER, EMPLOYEE, CANDIDATE)
  └── Custom Role (optional, inherits from a built-in role)
      ├── Permission JSON: { module: { view: true, create: false, edit: true, delete: false } }
      └── inheritsFrom: EMPLOYEE/MANAGER/HR/ADMIN
```

### 13.2 Permission Check Flow
```
User logs in → GET /api/auth/my-permissions
  ├── PermissionContext loaded with permissions
  ├── hasModuleAccess(moduleId) → Boolean
  ├── hasPermission(module, action) → Boolean
  └── Sidebar items filtered by permissions
      
Page renders:
  └── <PermissionGate module="users" action="create">
        <button>+ Add User</button>  ← Only visible if permitted
      </PermissionGate>
```

### 13.3 Sidebar Filtering
```
sidebarConfig[role] → Base menu items
  ├── For each item, check hasModuleAccess(item.permission || item.label)
  ├── Items with permission: "always" → Always shown
  ├── Filtered items rendered in sidebar
  └── Groups with 0 visible items → Group hidden
```

---

## 14. API Data Flow

### 14.1 API Architecture
```
Frontend (Vite :5173) ←→ Backend (Express :5000)
                              ↕
                        MySQL (Prisma ORM)
```

### 14.2 Request Flow
```
User Action → Component calls API function (apiService.js)
  → Axios instance with base URL + JWT header
    → Backend route → Middleware chain:
       ├── express.json() → Parse body
       ├── cors() → Validate origin
       ├── protect → Verify JWT token
       ├── authorize(roles...) → Check user role
       └── Controller function → Prisma query → Response
    → Frontend receives response
      → Context state updated
        → UI re-renders
```

### 14.3 Complete API Endpoint Map
```
/api/auth
  ├── POST /login           → Login
  ├── POST /register        → Register (Candidate)
  ├── GET  /me              → Get current user
  ├── POST /change-password → Change password
  └── GET  /my-permissions  → Get role permissions

/api/employee
  ├── GET/PUT /profile         → Profile CRUD
  ├── POST /attendance/clock-in/out → Clock actions
  ├── GET /attendance          → Attendance logs
  ├── GET/POST/DELETE /leaves  → Leave management
  ├── GET /payslips            → Payslips
  ├── GET /compensation        → Compensation profile
  ├── POST /compensation/increment → Request increment
  ├── GET /payroll/snapshots   → Enterprise payroll
  ├── GET /performance         → Performance + goals
  ├── POST /performance/goals/:id/progress → Update goal
  ├── POST/DELETE /performance/skills → Skills CRUD
  ├── GET/POST /benefits       → Benefits & claims
  ├── POST /benefits/enroll/unenroll → Plan management
  ├── GET /tasks               → Assigned tasks
  ├── GET/POST /tickets        → Help desk
  ├── POST /tickets/:id/reply  → Ticket messages
  ├── GET /holidays            → Holidays
  ├── GET /announcements       → Company announcements
  ├── GET/POST/DELETE /documents → Document management
  ├── GET/POST /resignation    → Resignation
  └── GET/POST /policies       → Compliance policies

/api/manager
  ├── GET/POST /team           → Team management
  ├── GET /org-employees       → All org employees
  ├── GET/POST /attendance     → Team attendance
  ├── GET/POST/PATCH /leaves   → Leave approvals
  ├── GET/POST/PATCH /tasks    → Task management
  ├── GET/POST /performance    → Team performance
  ├── GET/POST/PATCH /reviews  → Performance reviews
  ├── POST/GET/PATCH /increments → Salary increments
  ├── GET/PATCH /resignations  → Resignation reviews
  └── GET/PATCH /reimbursements → Reimbursement reviews

/api/hr
  ├── CRUD /jobs               → Job post management
  ├── CRUD /applications       → Application management
  ├── CRUD /interviews         → Interview management
  ├── CRUD /offers             → Offer management
  ├── CRUD /onboarding         → Onboarding tasks
  ├── GET/PATCH /employees     → Employee management
  ├── POST /terminate          → Initiate termination
  ├── GET/PATCH /exits         → Exit management
  ├── GET /leaves              → All leaves
  ├── GET/POST/PATCH /tickets  → Support tickets
  ├── GET/POST/PATCH /payroll  → Payroll operations
  ├── GET/PATCH /payroll/increments → HR increment approvals
  ├── GET /reports             → HR reports
  └── POST /onboarding/:id/promote → Promote to employee

/api/admin
  ├── GET /stats               → Dashboard stats
  ├── CRUD /organization       → Org management
  ├── CRUD /departments        → Department management
  ├── CRUD /users              → User management
  ├── CRUD /payslips           → Payslip management
  ├── CRUD /payroll-config/*   → Components, Deductions, Taxes
  ├── CRUD /policies           → Compliance policies
  ├── CRUD /roles              → Custom roles
  ├── CRUD /holidays           → Holiday management
  ├── CRUD /benefits           → Benefit plans
  ├── CRUD /ai/*               → AI modules & logs
  ├── CRUD /integrations       → System integrations
  ├── CRUD /billing/*          → Billing & invoices
  ├── GET/POST /attendance     → Attendance management
  ├── GET/PATCH /leaves        → Leave approvals
  ├── GET/PATCH /resignations  → Resignation management
  ├── CRUD /shifts             → Shift management
  ├── CRUD /overtime-policies  → Overtime policies
  └── GET /audit-logs          → Audit logs

/api/superadmin
  ├── GET /stats               → Platform stats
  ├── GET /system-health       → System health
  ├── GET /analytics           → Global analytics
  ├── CRUD /organizations      → Multi-tenant management
  ├── CRUD /users              → Platform-wide user management
  ├── CRUD /departments        → All departments
  ├── CRUD /payroll            → Platform payroll
  └── GET /audit-logs          → Platform audit logs

/api/candidate
  ├── GET /jobs                → Browse jobs (public)
  ├── POST /jobs/:jobId/apply  → Apply to job
  ├── GET/DELETE /applications → My applications
  ├── GET/PUT /profile         → Candidate profile
  ├── GET/PUT /settings        → Candidate settings
  └── GET/PATCH /offers        → Offer management

/api/public
  ├── POST /demo-booking       → Book a demo
  ├── POST /contact            → Contact form
  ├── POST /career-apply       → Career application
  ├── GET  /jobs               → Public job listing
  └── GET  /platform-stats     → Public stats

/api/settings          → Global application settings
/api/notifications     → Notification management
/api/pricing           → Pricing plan management
/api/import            → Excel import engine
/api/reimbursements    → Final reimbursement approvals
/api/admin/calendars   → Work calendar management
/api/approval-workflows → Approval workflow engine
/api/admin/salary-structures → Salary structure templates
```

---

> **END OF FLOW DOCUMENT**  
> This document maps every user action, button, modal, navigation, and API call in the HCM.ai system.
