# HCM.ai — Product Requirements Document (PRD)

> **Product Name:** HCM.ai — AI-Powered Human Capital Management System  
> **Version:** 1.0  
> **Last Updated:** 2026-07-20  
> **Author:** HCM.ai Product Team  
> **Status:** Production  
> **Deployment:** Live on Railway (Database & Backend)

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Goals](#2-product-vision--goals)
3. [Target Users & Personas](#3-target-users--personas)
4. [Technology Stack](#4-technology-stack)
5. [System Architecture](#5-system-architecture)
6. [Data Model & Database Schema](#6-data-model--database-schema)
7. [Feature Requirements — Public Module](#7-feature-requirements--public-module)
8. [Feature Requirements — Authentication Module](#8-feature-requirements--authentication-module)
9. [Feature Requirements — SuperAdmin Module](#9-feature-requirements--superadmin-module)
10. [Feature Requirements — Admin Module](#10-feature-requirements--admin-module)
11. [Feature Requirements — HR Module](#11-feature-requirements--hr-module)
12. [Feature Requirements — Manager Module](#12-feature-requirements--manager-module)
13. [Feature Requirements — Employee Module](#13-feature-requirements--employee-module)
14. [Feature Requirements — Candidate Module](#14-feature-requirements--candidate-module)
15. [Feature Requirements — Payroll Engine](#15-feature-requirements--payroll-engine)
16. [Feature Requirements — Approval Workflow Engine](#16-feature-requirements--approval-workflow-engine)
17. [Feature Requirements — AI Module](#17-feature-requirements--ai-module)
18. [Feature Requirements — Reporting Engine](#18-feature-requirements--reporting-engine)
19. [Non-Functional Requirements](#19-non-functional-requirements)
20. [Security Requirements](#20-security-requirements)
21. [API Specification Summary](#21-api-specification-summary)
22. [Integrations](#22-integrations)
23. [Glossary](#23-glossary)

---

## 1. Executive Summary

**HCM.ai** is a comprehensive, AI-powered Human Capital Management (HCM) platform designed to manage the full employee lifecycle — from candidate application to employee retirement. The platform supports **multi-tenant architecture** with **6 distinct user roles** (SuperAdmin, Admin, HR, Manager, Employee, Candidate), each with tailored dashboards and workflows.

### Key Differentiators
- **AI-Powered Recruitment**: Resume scoring, candidate matching, automated pipeline tracking
- **Enterprise Payroll Engine**: Component-based salary structures, formula-driven calculations, multi-currency support
- **Complete Lifecycle Management**: Hire → Onboard → Manage → Offboard → Retire
- **Configurable Approval Workflows**: Multi-step, role-based approval chains for any module
- **Role-Based Access Control (RBAC)**: Custom roles with granular module + action-level permissions
- **Multi-Currency & Localization**: Global payroll with currency conversion, date format, and language support

---

## 2. Product Vision & Goals

### 2.1 Vision Statement
> "Empower organizations to manage their human capital with intelligence, automation, and human-centric design — from the moment a candidate applies to the day they retire."

### 2.2 Business Goals
| # | Goal | KPI | Target |
|---|------|-----|--------|
| G1 | Automate HR operations end-to-end | % manual tasks eliminated | 80% |
| G2 | Reduce time-to-hire | Average days from posting to hire | < 21 days |
| G3 | Ensure payroll accuracy | Payroll error rate | < 0.1% |
| G4 | Improve employee engagement | Help desk resolution time | < 24 hours |
| G5 | Compliance adherence | Policy acknowledgment rate | 100% |
| G6 | Support multi-tenant scaling | Organizations supported | Unlimited |

### 2.3 Product Principles
1. **AI-First**: Leverage AI for resume scoring, candidate matching, and analytics
2. **Self-Service**: Employees and managers handle routine operations without HR dependency
3. **Configurable**: Every workflow, component, and policy is configurable per organization
4. **Audit-Ready**: Complete audit trail for every action across the platform
5. **Mobile-Responsive**: All interfaces work on desktop, tablet, and mobile
6. **Multi-Tenant**: Single deployment serving multiple organizations with data isolation

---

## 3. Target Users & Personas

### 3.1 SuperAdmin (Platform Owner)
| Attribute | Detail |
|-----------|--------|
| **Who** | Platform operators, SaaS administrators |
| **Needs** | Manage all organizations, users, pricing, and platform health |
| **Access** | Full platform access across all orgs |
| **Key Pages** | Master Dashboard, Global Analytics, User Control, Pricing Management |
| **Sidebar Items** | 11 items in "Super Admin" group |

### 3.2 Admin (Organization Administrator)
| Attribute | Detail |
|-----------|--------|
| **Who** | Company administrators, IT leads |
| **Needs** | Configure org settings, manage employees, set up payroll & compliance |
| **Access** | Full access within their organization |
| **Key Pages** | Dashboard, Org Setup, Payroll Config, Compliance, Billing |
| **Sidebar Items** | 21 items including Settings, Workflows, Reports |

### 3.3 HR (Human Resources)
| Attribute | Detail |
|-----------|--------|
| **Who** | HR managers, recruiters, talent acquisition |
| **Needs** | Manage recruitment pipeline, onboarding, approvals, reports |
| **Access** | Recruitment + employee management within org |
| **Key Pages** | Dashboard, Job Posts, Candidates, Interviews, Pipeline, Onboarding |
| **Sidebar Items** | 12 items focused on recruitment & people ops |

### 3.4 Manager
| Attribute | Detail |
|-----------|--------|
| **Who** | Team leads, department heads, project managers |
| **Needs** | Manage team, approve leaves, track KPIs, assign tasks |
| **Access** | Team-scoped data only |
| **Key Pages** | Dashboard, Team Members, Attendance Review, Leave Approval, KPI |
| **Sidebar Items** | 10 items focused on team management |

### 3.5 Employee
| Attribute | Detail |
|-----------|--------|
| **Who** | Full-time, part-time, contract employees |
| **Needs** | Clock in/out, apply leave, view payslips, manage profile |
| **Access** | Self-service only (own data) |
| **Key Pages** | Dashboard, Profile, Attendance, Leave, Payroll, Benefits, Help Desk |
| **Sidebar Items** | 11 items for self-service |

### 3.6 Candidate
| Attribute | Detail |
|-----------|--------|
| **Who** | External job seekers, applicants |
| **Needs** | Browse jobs, apply, build resume, track applications |
| **Access** | Public job browsing + own application data |
| **Key Pages** | Dashboard, Browse Jobs, My Applications, Resume Builder, AI Score |
| **Sidebar Items** | 7 items for job-seeking workflow |

---

## 4. Technology Stack

### 4.1 Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 19.2.5 |
| Build Tool | Vite | 6.4.3 |
| Styling | TailwindCSS | 4.2.3 |
| Routing | React Router DOM | 7.14.1 |
| Animations | Framer Motion | 12.38.0 |
| Icons | Lucide React | 1.8.0 |
| HTTP Client | Axios | 1.18.0 |
| PDF Generation | jsPDF + AutoTable | 4.2.1 / 5.0.8 |
| Excel Processing | SheetJS (xlsx) | 0.20.3 |
| Date Utilities | date-fns | 4.4.0 |
| Notifications | react-hot-toast | 2.6.0 |
| CSS Utilities | clsx + tailwind-merge | 2.1.1 / 3.5.0 |

### 4.2 Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | Latest LTS |
| Framework | Express.js | 5.2.1 |
| ORM | Prisma Client | 5.22.0 |
| Database | MySQL (MariaDB) | Via XAMPP |
| Auth | JSON Web Tokens (jsonwebtoken) | 9.0.3 |
| Password Hashing | bcryptjs | 3.0.3 |
| Validation | Zod | 4.4.3 |
| File Upload | Multer | 2.2.0 |
| Email | Nodemailer | 9.0.3 |
| Date Handling | Day.js | 1.11.21 |
| Math Engine | mathjs | 15.2.0 |
| Environment | dotenv | 17.4.2 |
| Dev Server | Nodemon | 3.1.14 |

### 4.3 Infrastructure
| Component | Detail |
|-----------|--------|
| Frontend Hosting | Netlify (human-hcm.netlify.app) |
| Backend Hosting | Express.js on Railway |
| Database | Live MySQL via Railway |
| CORS | Multi-origin (localhost:5173-5175, Netlify) |
| File Storage | Local filesystem (/public/uploads) |
| Body Limit | 50MB (for base64 resume/document uploads) |

---

## 5. System Architecture

### 5.1 High-Level Architecture
```
┌──────────────────────────────────────────────────────┐
│                   FRONTEND (React + Vite)             │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Landing Page │ Auth │ 6 Role-Based Dashboards  │ │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │ │
│  │  │Super │ │Admin │ │  HR  │ │Mgr   │ │Emp   │  │ │
│  │  │Admin │ │      │ │      │ │      │ │      │  │ │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘  │ │
│  │  ┌──────┐                                       │ │
│  │  │Cand. │  + Shared: Benefits, Time Dashboards  │ │
│  │  └──────┘                                       │ │
│  └─────────────────────────────────────────────────┘ │
│          ↕ Axios (JWT Bearer Token)                   │
├──────────────────────────────────────────────────────┤
│                   BACKEND (Express.js)                │
│  ┌─────────────────────────────────────────────────┐ │
│  │  Middleware Chain:                               │ │
│  │  CORS → JSON Parser → Auth (JWT) → Authorize    │ │
│  │                                                  │ │
│  │  16 Route Modules:                               │ │
│  │  auth, employee, manager, hr, admin, superadmin  │ │
│  │  candidate, settings, notifications, public      │ │
│  │  pricing, import, reimbursements, calendars      │ │
│  │  salaryStructures, approvalWorkflows             │ │
│  │                                                  │ │
│  │  22 Controllers │ 7 Services │ 4 Middlewares     │ │
│  └─────────────────────────────────────────────────┘ │
│          ↕ Prisma ORM                                 │
├──────────────────────────────────────────────────────┤
│                   DATABASE (MySQL)                    │
│  ┌─────────────────────────────────────────────────┐ │
│  │  45+ Tables (Models)                             │ │
│  │  Organization, User, EmployeeProfile,            │ │
│  │  Department, JobPost, JobApplication,            │ │
│  │  Interview, AttendanceLog, LeaveRequest,         │ │
│  │  Payslip, BenefitClaim, PerformanceGoal,         │ │
│  │  SalaryComponent, PayrollSnapshot, ...           │ │
│  └─────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

### 5.2 Frontend Architecture
```
src/
├── App.jsx                → Root component with all routes (329 lines)
├── main.jsx               → React DOM entry point
├── index.css              → Global styles
├── App.css                → App-level styles
├── context/               → 8 React Context providers
│   ├── AdminContext.jsx       (53,556 bytes)
│   ├── HRContext.jsx          (23,447 bytes)
│   ├── ManagerContext.jsx     (17,335 bytes)
│   ├── EmployeeContext.jsx    (15,195 bytes)
│   ├── CandidateContext.jsx   (16,073 bytes)
│   ├── SuperAdminContext.jsx  (9,158 bytes)
│   ├── PermissionContext.jsx  (3,151 bytes)
│   └── SettingsContext.jsx    (1,942 bytes)
├── hooks/                 → 5 Custom hooks
│   ├── useAuth.jsx            → JWT authentication
│   ├── useCurrency.jsx        → Multi-currency formatting
│   ├── useDateFormat.jsx      → Date formatting
│   ├── usePermission.js       → Permission checking
│   └── ThemeContext.jsx       → Dark/Light theme
├── features/              → Feature modules
│   ├── auth/         (2 files)   → Login, Signup
│   ├── admin/        (22 files)  → Full admin dashboard
│   ├── hr/           (14 files)  → HR recruitment suite
│   ├── manager/      (12 files)  → Team management
│   ├── employee/     (12 files)  → Employee self-service
│   ├── candidate/    (10 files)  → Job seeking portal
│   ├── superadmin/   (13 files)  → Platform management
│   ├── benefits/     (3 files)   → Benefits module
│   ├── payroll/      (1 file)    → Payroll context
│   ├── time/         (1 file)    → Time tracking
│   ├── attendance/   (2 files)   → Attendance context
│   ├── LandingPage.jsx          → Marketing homepage (70,617 bytes)
│   ├── BookDemo.jsx             → Demo booking wizard (57,160 bytes)
│   └── DynamicPage.jsx          → Dynamic routing helper
├── shared/components/     → Shared UI components
│   ├── layout/       (8 files)   → AppLayout, Sidebar, Navbar, Modals
│   ├── admin/        (30 files)  → Admin-specific modals & dialogs
│   ├── common/       (6 files)   → DatePicker, ConfirmDialog, etc.
│   ├── ui/           (3 files)   → Avatar, PhoneInput, DashboardPage
│   └── import/                   → Excel import components
├── components/            → Page components
│   ├── landing/      (16 files)  → Landing page sections
│   └── settings/     (1 file)    → Settings components
├── data/                  → Configuration data
│   └── sidebarConfig.js          → Role-based sidebar navigation
├── utils/                 → Utility functions
│   ├── apiService.js             → Axios API wrapper (19,698 bytes)
│   ├── permissionUtils.js        → Permission helpers
│   ├── permissionsConfig.js      → Default permission configs
│   ├── currencyHelper.js         → Currency formatting
│   ├── translationHelper.js      → i18n support
│   └── cn.js                     → className merger
└── pages/settings/        → Settings pages
    └── ApprovalWorkflows.jsx     → Workflow configuration
```

### 5.3 Backend Architecture
```
src/
├── config/                → Database & app configuration
├── controllers/    (22 files)
│   ├── authController.js             → Login, Register, GetMe, ChangePassword
│   ├── employeeController.js         → Profile, Attendance, Leave, Payslips, Benefits, Tickets
│   ├── managerController.js          → Team, Leaves, Tasks, Performance, Reviews, Increments
│   ├── hrController.js               → Jobs, Applications, Interviews, Offers, Onboarding, Exits
│   ├── adminController.js            → Org, Departments, Users, Payroll, Policies, Holidays, AI, Billing
│   ├── superAdminController.js       → Platform stats, Organizations, Users, Payroll, Analytics
│   ├── candidateController.js        → Job browsing, Applications, Profile, Offers
│   ├── compensationController.js     → Compensation profiles, Payroll engine, Increments
│   ├── payrollConfigController.js    → Salary components, Deductions, Tax rules
│   ├── salaryStructureController.js  → Salary structure templates & versions
│   ├── shiftController.js            → Shift CRUD
│   ├── overtimePolicyController.js   → Overtime policy CRUD
│   ├── reportsController.js          → Report generation
│   ├── reimbursementController.js    → Final approvals & payment processing
│   ├── notificationController.js     → Notification management
│   ├── settingsController.js         → Global settings
│   ├── publicController.js           → Demo booking, Contact, Career apply
│   ├── pricingController.js          → Pricing plan management
│   ├── importController.js           → Excel import engine
│   ├── calendarController.js         → Work calendar management
│   ├── bonusController.js            → Bonus management
│   └── approvalWorkflow.controller.js → Workflow engine
├── services/       (7 files)
│   ├── payrollEngineService.js       → Payroll calculation engine (16,390 bytes)
│   ├── workflowService.js            → Workflow execution engine (16,600 bytes)
│   ├── importService.js              → Excel import processing (28,990 bytes)
│   ├── approval.service.js           → Approval chain processing
│   ├── approvalWorkflowService.js    → Workflow CRUD operations
│   ├── formulaEngineService.js       → Salary formula evaluation
│   └── workflowValidation.service.js → Workflow validation
├── middlewares/    (4+ files)
│   ├── authMiddleware.js             → JWT verification + role authorization
│   ├── errorHandler.js               → Global error handling
│   ├── permissionMiddleware.js       → Fine-grained permission checks
│   └── approval.middleware.js        → Approver verification
├── routes/         (16 files)
│   └── [Maps to controllers — see API Specification]
├── utils/                → Shared utilities
├── data/                 → Seed data
└── scripts/              → Database maintenance scripts
```

---

## 6. Data Model & Database Schema

### 6.1 Core Models (45+ tables)

#### Authentication & Organization
| Model | Description | Key Fields |
|-------|-------------|------------|
| **Organization** | Multi-tenant organization entity | id, name, legalName, industry, companySize, logoUrl, currency, timezone |
| **User** | Authentication record | id, email, passwordHash, role (enum), isActive, organizationId, customRoleId |
| **CustomRole** | Custom role with permissions | id, name, permissions (JSON), inheritsFrom, status, landingPage |

#### People Management
| Model | Description | Key Fields |
|-------|-------------|------------|
| **EmployeeProfile** | Detailed employee data | id, userId, employeeId, fullName, phone, dob, department, manager, shift, salaryType |
| **CandidateProfile** | External candidate data | id, userId, fullName, resumeUrl, skills, expectedSalary, experience |
| **Department** | Org departments | id, name, code, head, parent, color, status, organizationId |

#### Recruitment Pipeline
| Model | Description | Key Fields |
|-------|-------------|------------|
| **JobPost** | Job listings | id, title, department, description, requirements, salaryRange, location, jobType, status |
| **JobApplication** | Application records | id, jobId, candidateId, status (enum: APPLIED→HIRED), resumeUrl, coverLetter |
| **Interview** | Interview schedule | id, applicationId, interviewerId, dateTime, meetingLink, feedback, rating, round, type |
| **Offer** | Job offers | id, applicationId, candidate, role, salary, joiningDate, status |
| **Onboarding** | Onboarding tasks | id, applicationId, name, email, role, department, progress, status |

#### Attendance & Time
| Model | Description | Key Fields |
|-------|-------------|------------|
| **AttendanceLog** | Daily clock records | id, userId, date, clockIn, clockOut, totalWorkedMin, status, mode, lateMinutes, overtimeMinutes |
| **Shift** | Work shift definitions | id, name, startTime, endTime, breakDurationMin, graceInMin, graceOutMin, isDefault |
| **OvertimePolicy** | OT multiplier rules | id, name, weekdayMultiplier, weekendMultiplier, holidayMultiplier, minOvertimeMin, maxOvertimeMin |
| **AttendancePolicy** | Org attendance rules | id, lateMarkThresholdMin, lateMarksForHalfDay, earlyExitThresholdMin, halfDayWorkMin |

#### Leave Management
| Model | Description | Key Fields |
|-------|-------------|------------|
| **LeavePolicy** | Leave type definitions | id, name, isPaid, yearlyAllowance |
| **LeaveRequest** | Employee leave requests | id, userId, leaveType, startDate, endDate, totalDays, reason, status (PENDING→APPROVED) |

#### Payroll & Compensation
| Model | Description | Key Fields |
|-------|-------------|------------|
| **CompensationProfile** | Employee salary profile | id, employeeId, baseSalary, monthlyCTC, annualCTC, salaryStructureId, salaryBandId |
| **SalaryComponent** | Payroll component definitions | id, name, code, category, calculationType, calculationBase, value, formula, isTaxable |
| **SalaryStructure** | Salary template | id, name, description, country, currency, isDefault |
| **SalaryStructureVersion** | Versioned structure | id, structureId, version, effectiveFrom |
| **SalaryStructureComponent** | Components in structure | id, versionId, componentId, sequence, value |
| **DeductionRule** | Deduction definitions | id, name, code, category, valueType, value, isPreTax |
| **TaxRule** | Tax slab definitions | id, name, country, state, slabs (JSON) |
| **SalaryBand** | Salary grade bands | id, name, minSalary, maxSalary, recommendedSalary |
| **Payslip** | Legacy payslip | id, employeeId, month, basic, hra, allowance, bonus, pf, tax, netPay, status |
| **PayrollSnapshot** | Enterprise payroll record | id, employeeId, month, grossSalary, totalDeductions, netSalary, employerCost, items[] |
| **PayrollItem** | Individual payroll line item | id, snapshotId, name, code, type, amount |
| **Bonus** | Employee bonuses | id, employeeId, amount, reason, type, isTaxable, effectiveMonth |
| **EmployeeSalaryComponent** | Employee-specific component override | id, employeeId, componentId, customValue |
| **EmployeeDeduction** | Employee-specific deduction | id, employeeId, deductionId, customValue |
| **CompensationVersion** | Salary change history | id, employeeId, previousSalary, newSalary, reason, effectiveDate |
| **SalaryIncrementRequest** | Increment workflow | id, employeeId, requestedSalary, reason, effectiveDate, status |
| **PayrollConfiguration** | Org payroll settings | id, masterCurrency, payrollCycle, calculationBase |

#### Benefits
| Model | Description | Key Fields |
|-------|-------------|------------|
| **BenefitPlan** | Benefit plan definitions | id, name, category, provider, contribution, eligibility, autoEnroll |
| **EmployeeBenefit** | Employee plan enrollment | id, employeeId, benefitPlanId, status, enrollmentDate |
| **BenefitClaim** | Reimbursement claims | id, employeeId, title, amount, managerStatus, finalApprovalStatus, paymentStatus, overallStatus |

#### Performance
| Model | Description | Key Fields |
|-------|-------------|------------|
| **PerformanceGoal** | Employee goals | id, employeeId, title, progress, priority, deadline |
| **PerformanceReview** | Manager reviews | id, employeeId, period, reviewer, rating, text |
| **Task** | Assigned tasks | id, employeeId, title, description, status, priority, dueDate |
| **EmployeeSkill** | Skills tracking | id, employeeId, name, level (0-100) |

#### Support & Communication
| Model | Description | Key Fields |
|-------|-------------|------------|
| **SupportTicket** | Help desk tickets | id, userId, subject, category, priority, status (OPEN→RESOLVED) |
| **TicketMessage** | Ticket conversation | id, ticketId, senderId, text, attachmentUrl |
| **Notification** | System notifications | id, userId, title, message, type (INFO/SUCCESS/WARNING/ALERT), isRead |
| **Announcement** | Company announcements | id, title, date, category, priority, content |

#### Compliance & Governance
| Model | Description | Key Fields |
|-------|-------------|------------|
| **Policy** | Compliance policies | id, name, category, owner, effectiveDate, expiryDate, version, requiresSignature, pdfData |
| **PolicyAcknowledgment** | Employee acknowledgments | id, policyId, userId |
| **AuditLog** | System audit trail | id, userId, action, details, ipAddress |

#### Exit Management
| Model | Description | Key Fields |
|-------|-------------|------------|
| **ExitLifecycle** | Resignation/termination | id, employeeId, exitType, status, lastWorkingDay, reason, itClearance, financeClearance, hrClearance |

#### Workflow Engine
| Model | Description | Key Fields |
|-------|-------------|------------|
| **ApprovalWorkflow** | Workflow definition | id, name, module, description, version, isActive |
| **ApprovalStep** | Workflow step | id, workflowId, stepOrder, approverType, approverRole, isRequired, canSkip |
| **ApprovalLog** | Approval action log | id, entityId, entityType, stepOrder, approverId, status, comments |

#### Platform & Commercial
| Model | Description | Key Fields |
|-------|-------------|------------|
| **GlobalSettings** | Platform-wide settings | defaultCurrency, platformMode, globalMFA, basePricePerUser, primaryModel |
| **BillingPlan** | Org billing plan | id, name, price, cycle, users, addons |
| **Invoice** | Billing invoices | id, date, amount, method, status |
| **PricingPlan** | SaaS pricing tiers | id, name, monthlyPrice, yearlyPrice, maxEmployees, features[] |
| **PricingFeature** | Plan features | id, pricingPlanId, feature |
| **DemoBooking** | Demo requests | id, name, email, companySize, requirement, selectedDate, selectedSlot |
| **AiModule** | AI module configs | id, name, desc, status, confidence, settings |
| **AiLog** | AI activity log | id, label, type, timestamp |
| **Integration** | Third-party integrations | id, name, category, status, health, sync |
| **Document** | Employee documents | id, userId, name, category, size, url |

#### Calendar
| Model | Description | Key Fields |
|-------|-------------|------------|
| **WorkCalendar** | Calendar definition | id, name, timezone, isDefaultCompanyCalendar |
| **WorkCalendarVersion** | Calendar version | id, calendarId, versionNumber, effectiveFrom |
| **WorkCalendarWeekend** | Weekend config | id, versionId, dayOfWeek, type (FULL_DAY/HALF_DAY/WORKING_DAY) |
| **WorkCalendarAssignment** | Calendar-entity mapping | id, calendarId, entityType, entityId |
| **Holiday** | Holiday entries | id, calendarId, name, date, type (PUBLIC/COMPANY/REGIONAL/OPTIONAL), region |

### 6.2 Enums
| Enum | Values |
|------|--------|
| **Role** | SUPERADMIN, ADMIN, HR, MANAGER, EMPLOYEE, CANDIDATE |
| **RoleStatus** | ACTIVE, INACTIVE |
| **LeaveStatus** | PENDING, MANAGER_APPROVED, APPROVED, REJECTED |
| **TicketStatus** | OPEN, IN_PROGRESS, RESOLVED |
| **ApplicationStatus** | APPLIED, SCREENING, SHORTLISTED, INTERVIEWING, OFFERED, HIRED, REJECTED, WITHDRAWN |
| **HolidayType** | PUBLIC, COMPANY, REGIONAL, OPTIONAL |
| **WeekendType** | FULL_DAY, HALF_DAY, WORKING_DAY |
| **AssignmentEntityType** | EMPLOYEE, DEPARTMENT, LOCATION, SHIFT, BRANCH |
| **LifecycleStatus** | APPLIED → SHORTLISTED → INTERVIEW → OFFERED → OFFER_ACCEPTED → ONBOARDING → ACTIVE → PROBATION → CONFIRMED → ON_NOTICE → EXIT_CLEARANCE → RESIGNED → TERMINATED |
| **ExitStatus** | INITIATED → PENDING_MANAGER_APPROVAL → PENDING_HR_APPROVAL → APPROVED / REJECTED → CLEARANCE_IN_PROGRESS → COMPLETED → EMPLOYEE_RELIEVED / CANCELLED |
| **ExitType** | RESIGNATION, TERMINATION, RETIREMENT, DEATH |
| **ProbationStatus** | UNDER_PROBATION, EXTENDED, CONFIRMED, REJECTED |
| **PolicyStatus** | Active, Expiring_Soon, Renewing, Archived |
| **NotificationType** | INFO, SUCCESS, WARNING, ALERT |

---

## 7. Feature Requirements — Public Module

### FR-PUB-01: Landing Page
- **Description**: Marketing homepage showcasing platform features
- **Components**: Hero, Stats, Features, Dashboard Preview, Role-Based Section, AI Automation, How It Works, ROI Metrics, Pricing, Security, Integrations, Testimonials, Careers, FAQ, Contact, Footer
- **Priority**: P0 (Critical)
- **API**: GET /api/public/platform-stats, GET /api/pricing

### FR-PUB-02: Book a Demo
- **Description**: Multi-step demo booking wizard
- **Steps**: Company Info → Requirements → Schedule → Confirm
- **Fields**: Name, Email, Phone, Company, Size, Industry, Country, Modules, Date, Time Slot, Message
- **Priority**: P0
- **API**: POST /api/public/demo-booking

### FR-PUB-03: Contact Form
- **Description**: General inquiry contact form
- **Priority**: P1
- **API**: POST /api/public/contact

### FR-PUB-04: Career Applications
- **Description**: Public career application form
- **Priority**: P1
- **API**: POST /api/public/career-apply

### FR-PUB-05: Public Job Board
- **Description**: Browse available jobs without login
- **Priority**: P1
- **API**: GET /api/public/jobs

---

## 8. Feature Requirements — Authentication Module

### FR-AUTH-01: Email/Password Login
- **Fields**: Email, Password
- **Features**: Show/hide password, "Forgot password?" link, "Remember 30 days" checkbox
- **Output**: JWT token + user object → localStorage
- **Priority**: P0

### FR-AUTH-02: Candidate Registration
- **Fields**: Email, Password, Confirm Password
- **Validation**: Password match check, Email uniqueness
- **Auto-role**: CANDIDATE
- **Priority**: P0

### FR-AUTH-03: Session Management
- **Token Storage**: localStorage (hcm_token)
- **User Data**: localStorage (hcm_user)
- **Auto-refresh**: GET /api/auth/me on app load
- **Self-healing**: Clear stale sessions
- **Priority**: P0

### FR-AUTH-04: Role-Based Routing
- **Mapping**: Each role → specific dashboard URL
- **Custom Landing**: customRole.landingPage override
- **Protected Routes**: JWT verification required
- **Priority**: P0

### FR-AUTH-05: Password Change
- **Fields**: Current password, New password
- **Priority**: P1
- **API**: POST /api/auth/change-password

### FR-AUTH-06: Google Workspace SSO
- **Status**: UI placeholder present, not implemented
- **Priority**: P2 (Future)

### FR-AUTH-07: Role Preview (SuperAdmin)
- **Description**: SuperAdmin can preview any role's dashboard
- **Storage**: sessionStorage (hcm_preview_role)
- **UI**: Preview banner at top of page with "Exit Preview" button
- **Priority**: P1

---

## 9. Feature Requirements — SuperAdmin Module

### FR-SA-01: Master Dashboard
- **Stats**: Total Users, Organizations, Active Users, Revenue, Departments, System Health
- **Features**: Quick actions, Role preview, Activity feed, Organization list, Audit modal
- **Priority**: P0

### FR-SA-02: Global Analytics
- **Reports**: Revenue Trend, User Growth, Role Distribution, Department Distribution
- **Features**: Date range filter, Organization filter, Export report
- **Priority**: P1

### FR-SA-03: User Management (Platform-Wide)
- **CRUD**: Create, Read, Update, Delete users across all organizations
- **Actions**: Toggle active, Change role, Reset password
- **Filters**: Role, Status, Organization, Search
- **Priority**: P0

### FR-SA-04: Department Management
- **CRUD**: Create, Read, Update, Delete departments across organizations
- **Priority**: P1

### FR-SA-05: Payroll Management
- **Features**: View payroll history, Generate payroll, Edit/Delete payslips, Bulk approve, Configure payroll settings
- **Priority**: P0

### FR-SA-06: Benefits Management
- **Features**: Manage benefit plans across organizations, Employee enrollment management
- **Priority**: P1

### FR-SA-07: Attendance Management
- **Features**: View all attendance, Manual entry, Attendance policy configuration, Work calendar management
- **Priority**: P1

### FR-SA-08: Pricing Management
- **CRUD**: Create, Read, Update, Delete pricing plans
- **Fields**: Name, Monthly/Yearly price, Max employees, AI credits, Support level, Features list
- **Priority**: P0

### FR-SA-09: Audit Logs
- **Features**: Platform-wide audit log viewer, Filters, Export
- **Priority**: P1

### FR-SA-10: Profile & Settings
- **Features**: Personal info, Security (change password, 2FA), Notification preferences, Theme
- **Priority**: P1

---

## 10. Feature Requirements — Admin Module

### FR-ADM-01: Admin Dashboard
- **Stats**: 6 stat cards (Employees, Active Users, Departments, Roles, Payroll, Compliance)
- **Quick Actions**: Add Employee, Run Payroll, Generate Report, Download CSV
- **Priority**: P0

### FR-ADM-02: Organization Setup
- **CRUD**: Create/Update organization profile
- **Fields**: Company name, Legal name, Website, Industry, Size, Logo, Address, Tax ID, Email, Phone, Timezone, Currency
- **Priority**: P0

### FR-ADM-03: Department Management
- **CRUD**: Full CRUD with color, status, head, parent org support
- **Modal**: DepartmentModal with all fields
- **Priority**: P0

### FR-ADM-04: Employee Management
- **CRUD**: Full employee lifecycle management
- **UserModal**: 4-tab form (Personal, Employment, Compensation, Emergency)
- **Import**: Excel/CSV import with column mapping
- **Actions**: Edit, Change Role, Toggle Active, Delete
- **Priority**: P0

### FR-ADM-05: Roles & Permissions
- **Custom Roles**: Create roles with granular module-level + action-level permissions
- **Permission Matrix**: Module toggles with View/Create/Edit/Delete per module
- **Inheritance**: Custom roles inherit from built-in roles
- **Priority**: P0

### FR-ADM-06: Payroll Configuration (Enterprise)
- **Sub-modules**: Salary Components, Deduction Rules, Tax Rules, Approval Workflows
- **Component Types**: Fixed, Percentage, Formula, Slab, Auto Balance, Manual, Variable
- **Tax Slabs**: Multi-slab tax rule builder
- **Priority**: P0

### FR-ADM-07: Payroll Center
- **Features**: View payroll, Run batch payroll, Mark paid, View breakdown, Export
- **Filters**: Month, Department, Status
- **Priority**: P0

### FR-ADM-08: Shift Management
- **CRUD**: Shift definitions with time, breaks, grace periods
- **Priority**: P1

### FR-ADM-09: Overtime Policies
- **CRUD**: OT multiplier rules for weekday/weekend/holiday
- **Priority**: P1

### FR-ADM-10: Holiday Management
- **Features**: Holiday CRUD, Work Calendar CRUD, Calendar versions with weekend config, Calendar assignments
- **Types**: Public, Company, Regional, Optional
- **Priority**: P0

### FR-ADM-11: Benefits Configuration
- **CRUD**: Benefit plan definitions with provider, contribution, eligibility, auto-enroll
- **Priority**: P1

### FR-ADM-12: AI Center
- **Features**: Module configuration, Status toggle, Confidence threshold, Activity logs, Model training
- **Priority**: P2

### FR-ADM-13: Compliance Center
- **CRUD**: Policy management with PDF upload, versioning, acknowledgment tracking
- **Actions**: Archive, Renew, Send Reminder, Security Scan
- **Priority**: P0

### FR-ADM-14: Integrations
- **CRUD**: Third-party integration management
- **Features**: Connect/Disconnect, Health monitoring, API documentation drawer
- **Priority**: P2

### FR-ADM-15: Billing
- **Features**: Current plan view, Upgrade plan, Invoice management, Payment methods, Export invoices
- **Priority**: P1

### FR-ADM-16: Resignations
- **Features**: View all resignations, Override decisions
- **Priority**: P1

### FR-ADM-17: Reimbursements
- **Features**: Final approval, Payment processing
- **Priority**: P1

### FR-ADM-18: Audit Logs
- **Features**: Full audit trail, Filtering, Export (CSV/JSON/PDF), Archive, Detail drawer
- **Priority**: P0

### FR-ADM-19: Reports
- **Features**: Report Builder wizard, Scheduled reports
- **Priority**: P1

### FR-ADM-20: Settings & Global Settings
- **Features**: General, Security, Notifications, Appearance, Advanced tabs
- **Global**: Platform-wide defaults (currency, MFA, billing, AI)
- **Priority**: P0

### FR-ADM-21: Approval Workflows
- **Features**: Multi-step workflow builder, Module-specific chains, Step management
- **Priority**: P0

---

## 11. Feature Requirements — HR Module

### FR-HR-01: HR Dashboard
- **Stats**: Active Jobs, Candidates, Interviews, Offer Rate
- **Features**: Quick actions, Upcoming interviews, Recent candidates, Pipeline overview
- **Priority**: P0

### FR-HR-02: Job Post Management
- **CRUD**: Create, edit, close, delete job postings
- **Fields**: Title, Department, Description, Requirements, Salary, Location, Type, Experience, Openings
- **Priority**: P0

### FR-HR-03: Candidate Management
- **Features**: Application tracking, Status updates, Profile viewing, Interview scheduling, Bulk actions
- **Statuses**: 8 statuses from APPLIED to WITHDRAWN
- **Priority**: P0

### FR-HR-04: Interview Management
- **Features**: Schedule interviews, Calendar/List views, Feedback submission, Rating, Status tracking
- **Types**: Video Call, In-Person, Phone
- **Rounds**: Technical, HR, Cultural, Final
- **Priority**: P0

### FR-HR-05: Hiring Pipeline
- **Features**: Visual pipeline (Applied → Hired), Stage metrics, Conversion rates
- **Priority**: P1

### FR-HR-06: Offer Management
- **CRUD**: Create, edit, resend, withdraw, delete offers
- **Statuses**: Sent, Accepted, Rejected, Expired, Withdrawn
- **Priority**: P0

### FR-HR-07: Onboarding
- **Features**: Create tasks, Track progress, Remind manager, Send welcome email, Promote to employee
- **Promote Flow**: Creates User + EmployeeProfile from onboarding data
- **Priority**: P0

### FR-HR-08: Offboarding & Exit Clearance
- **Features**: Exit list, Clearance checklist (IT/Finance/HR), Approve resignations, Initiate terminations, Finalize exits
- **Probation**: Confirm/Extend probation
- **Priority**: P0

### FR-HR-09: HR Approvals
- **Tabs**: Leaves, Benefits, Salary Increments, Tickets, Reimbursements
- **Priority**: P0

### FR-HR-10: Payroll Operations
- **Features**: Run payroll, View snapshots, Finalize, Compensation management
- **Priority**: P1

### FR-HR-11: Reports
- **Types**: Recruitment, Demographics, Attendance, Leave, Payroll, Performance
- **Features**: Charts, Tables, Export, Date/Department filters
- **Priority**: P1

### FR-HR-12: Messages
- **Features**: Inbox, Compose, Threads
- **Priority**: P2

---

## 12. Feature Requirements — Manager Module

### FR-MGR-01: Manager Dashboard
- **Stats**: Team Size, Active Today, Pending Approvals, Avg KPI
- **Features**: Quick actions, Leave approvals, Attendance overview, Tasks, Performance chart
- **Export**: PDF/Excel/CSV report generation
- **Priority**: P0

### FR-MGR-02: Team Members
- **Features**: View team, Add members from org, Full profile view, Leave on behalf, Task assignment, Increment requests
- **Priority**: P0

### FR-MGR-03: Attendance Review
- **Features**: Team attendance logs, Manual entry, Status summary
- **Priority**: P0

### FR-MGR-04: Leave Approval
- **Features**: Approve/Reject leaves, Manager comments, Calendar view, History
- **Status Flow**: PENDING → MANAGER_APPROVED / REJECTED
- **Priority**: P0

### FR-MGR-05: KPI Tracking
- **Features**: Team KPI dashboard, Goal management, Trend charts
- **Priority**: P1

### FR-MGR-06: Task Management
- **Features**: Assign tasks to team, Track status, Priority management, Due dates
- **Priority**: P0

### FR-MGR-07: Performance Reviews
- **CRUD**: Create, view, edit reviews with rating and written feedback
- **Priority**: P1

### FR-MGR-08: Resignations
- **Features**: Review team resignations, Approve/Reject with comments
- **Priority**: P1

### FR-MGR-09: Reimbursements
- **Features**: Review team benefit claims, Approve/Reject with comments
- **Priority**: P1

### FR-MGR-10: Reports
- **Types**: Team Attendance, Leave Summary, Performance, Task Completion
- **Features**: Charts, Tables, Export
- **Priority**: P1

---

## 13. Feature Requirements — Employee Module

### FR-EMP-01: Employee Dashboard
- **Features**: Clock In/Out with live timer, Stat cards, Quick actions, Holidays, Announcements, Leave history
- **Interactive**: Multi-step loaders, Modals for leave/holidays/announcements
- **Priority**: P0

### FR-EMP-02: Profile Management
- **Tabs**: Personal (editable), Employment (read-only), Emergency, Skills
- **Features**: Avatar upload, Bio, Compensation overview
- **Priority**: P0

### FR-EMP-03: Attendance
- **Features**: Clock In/Out, Calendar view, Attendance log, Summary stats
- **Priority**: P0

### FR-EMP-04: Leave Management
- **Features**: Balance display, Apply leave, Cancel pending, History, Calendar view
- **Priority**: P0

### FR-EMP-05: Payroll
- **Features**: Current payslip, History, PDF download, Compensation profile, Increment request, Enterprise snapshots
- **Priority**: P0

### FR-EMP-06: Benefits
- **Features**: Plan enrollment/unenrollment, Claim submission, Claim tracking with multi-stage approval
- **Priority**: P1

### FR-EMP-07: Documents
- **CRUD**: Upload, View, Download, Delete personal documents
- **Categories**: ID Proof, Certificates, Tax, Other
- **Priority**: P1

### FR-EMP-08: Performance
- **Features**: Goal tracking with progress, Skills management, Review history, Task view, Trend charts
- **Priority**: P1

### FR-EMP-09: Help Desk
- **Features**: Open tickets, Chat-style messaging, Attachment support, Status tracking
- **Priority**: P1

### FR-EMP-10: Compliance
- **Features**: View active policies, Acknowledge policies (digital signature concept)
- **Priority**: P1

### FR-EMP-11: Resignation
- **Features**: Submit resignation, Track status, View clearance progress, Exit interview
- **Priority**: P1

### FR-EMP-12: Settings
- **Tabs**: General (language/timezone), Security (password/2FA), Notifications, Appearance (theme)
- **Priority**: P1

---

## 14. Feature Requirements — Candidate Module

### FR-CAN-01: Candidate Dashboard
- **Stats**: Applications, Interviews, Offers, Shortlisted, Profile Views, Resume Downloads
- **Features**: Profile completeness, Upcoming interviews, Recent activity, Career analytics
- **Priority**: P0

### FR-CAN-02: Browse Jobs
- **Features**: Search, Multi-filter (type/experience/location/salary), Job detail view, Quick apply
- **Priority**: P0

### FR-CAN-03: Application Form
- **Features**: Resume upload, Cover letter, Skill matching
- **Priority**: P0

### FR-CAN-04: My Applications
- **Features**: Status tracking, Timeline visualization, Withdraw, Offer response (Accept/Decline)
- **Priority**: P0

### FR-CAN-05: Resume Builder
- **Features**: WYSIWYG editor, Sections (summary, experience, education, skills, projects, certs), Live preview, Template selection, PDF download, Auto-save
- **Size**: 65,535 bytes (largest single component)
- **Priority**: P1

### FR-CAN-06: AI Resume Score
- **Features**: Overall score, Category analysis, Strengths/Improvements, Job match, ATS compatibility
- **Priority**: P2

### FR-CAN-07: Interview Schedule
- **Features**: Upcoming/Past interviews, Calendar view, Join call button
- **Priority**: P0

### FR-CAN-08: Notifications
- **Features**: Notification list, Type-based filtering, Mark read, Navigate to linked page
- **Priority**: P1

### FR-CAN-09: Profile & Settings
- **Profile**: Personal info, Resume, LinkedIn, Portfolio, Skills, Documents
- **Settings**: General, Security, Notifications, Appearance
- **Priority**: P1

---

## 15. Feature Requirements — Payroll Engine

### FR-PAY-01: Salary Component Management
- **Categories**: Earning, Deduction, Employer Contribution, Reimbursement, Variable Pay, Benefit
- **Calculation Types**: Fixed, Percentage, Formula, Slab, Auto Balance, Manual, Variable
- **Base Options**: CTC, Basic, Gross, Net, Custom Component Code
- **Features**: Taxable toggle, Auto balance, Rounding rules, Sequence ordering
- **Priority**: P0

### FR-PAY-02: Salary Structure Templates
- **Features**: Named structures with versioning, Component mappings, Country/State/Currency config
- **Versioning**: Multiple versions with effective dates
- **Priority**: P0

### FR-PAY-03: Salary Band/Grade System
- **Features**: Min/Max/Recommended salary per band
- **Priority**: P1

### FR-PAY-04: Payroll Calculation Engine
- **Service**: payrollEngineService.js (16,390 bytes)
- **Inputs**: Employee CTC, Salary structure components, Attendance data, Leave data
- **Process**: Component-wise calculation → Gross → Deductions → Net → Employer Cost
- **Outputs**: PayrollSnapshot + PayrollItems
- **Features**: Formula evaluation (mathjs), Attendance proration, Overtime calculation
- **Priority**: P0

### FR-PAY-05: Payroll Run (Batch)
- **Features**: Select month, Process all employees, Individual or batch run
- **Outputs**: Per-employee snapshots with detailed calculation logs
- **Priority**: P0

### FR-PAY-06: Salary Increment Workflow
- **Submitter**: Employee (request) or Manager (on behalf)
- **Approvers**: Configurable via ApprovalWorkflow
- **Fields**: Requested salary, Reason, Effective date
- **Priority**: P1

---

## 16. Feature Requirements — Approval Workflow Engine

### FR-WF-01: Workflow Configuration
- **Fields**: Name, Module, Description, Steps (ordered), Effective date
- **Supported Modules**: Leave, SalaryIncrement, BenefitEnrollment, Reimbursement
- **Step Types**: ROLE, CUSTOM_ROLE, SPECIFIC_USER, MANAGER
- **Step Options**: Required/Optional, Can Skip
- **Priority**: P0

### FR-WF-02: Workflow Execution
- **Service**: workflowService.js (16,600 bytes)
- **Flow**: Entity submitted → Find workflow → Step 1 → Step 2 → ... → Final approval
- **Features**: Multi-step chains, Optional steps, Skip logic, Rejection at any step
- **Priority**: P0

### FR-WF-03: Approval Actions
- **Actions**: Approve (move to next step), Reject (terminate), Skip (optional steps)
- **Tracking**: ApprovalLog per action with timestamp, comments, approver
- **Priority**: P0

### FR-WF-04: Approval Timeline
- **Features**: Full history of all approval actions, Current pending step indicator
- **Priority**: P1

---

## 17. Feature Requirements — AI Module

### FR-AI-01: AI Module Configuration
- **Features**: Enable/disable modules, Confidence thresholds, Custom settings per module
- **Priority**: P2

### FR-AI-02: Resume Scoring (Candidate-Side)
- **Features**: Format analysis, Keyword matching, Experience relevance, ATS compatibility
- **Implementation**: Client-side scoring algorithm
- **Priority**: P2

### FR-AI-03: Candidate Matching
- **Features**: Job-to-candidate matching score, AI Match % on candidate cards
- **Priority**: P2

### FR-AI-04: Model Training (Admin)
- **Features**: Train/retrain AI models via TrainModelsModal
- **Priority**: P3 (Future)

---

## 18. Feature Requirements — Reporting Engine

### FR-RPT-01: Report Builder Wizard
- **Steps**: Select Type → Choose Columns → Apply Filters → Generate
- **Priority**: P1

### FR-RPT-02: Scheduled Reports
- **Features**: Configure recurring report delivery via ReportSchedulerModal
- **Priority**: P2

### FR-RPT-03: HR Reports
- **Types**: Recruitment Analytics, Employee Demographics, Attendance Summary, Leave Utilization, Payroll Summary, Performance Distribution
- **Priority**: P1

### FR-RPT-04: Manager Reports
- **Types**: Team Attendance, Leave Summary, Performance, Task Completion
- **Priority**: P1

### FR-RPT-05: Export Formats
- **Formats**: CSV, PDF (jsPDF), Excel (xlsx)
- **Priority**: P0

---

## 19. Non-Functional Requirements

### NFR-01: Performance
| Metric | Target |
|--------|--------|
| Page Load (LCP) | < 2 seconds |
| API Response Time (P95) | < 500ms |
| First Contentful Paint | < 1.5 seconds |
| Time to Interactive | < 3 seconds |
| Bundle Size | Optimized via Vite code splitting |

### NFR-02: Scalability
| Metric | Target |
|--------|--------|
| Concurrent Users | 1,000+ |
| Organizations (tenants) | Unlimited |
| Employees per Org | 10,000+ |
| Database Queries | Prisma optimized with indexing |

### NFR-03: Availability
| Metric | Target |
|--------|--------|
| Uptime | 99.9% |
| Deployment | Zero-downtime (Netlify + Express) |

### NFR-04: Usability
| Metric | Target |
|--------|--------|
| Responsive Design | Desktop, Tablet, Mobile |
| Dark/Light Theme | System-preference + manual toggle |
| Accessibility | Semantic HTML, ARIA labels |
| Animations | Framer Motion (smooth 60fps) |

### NFR-05: Internationalization
| Metric | Target |
|--------|--------|
| Currency Support | USD, INR, EUR, GBP, AED, CAD, AUD, JPY, SGD, CHF, SAR, BRL, ZAR, NGN, KES |
| Date Formats | MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MMM-YYYY |
| Language | Translation helper framework (extensible) |

---

## 20. Security Requirements

### SEC-01: Authentication
- JWT tokens with configurable expiry
- bcryptjs password hashing
- Failed login attempt tracking

### SEC-02: Authorization
- Role-based access control (6 built-in roles)
- Custom role permissions (module + action level)
- Route-level middleware enforcement

### SEC-03: Data Protection
- Organization-scoped data isolation (multi-tenant)
- Cascading deletes (Prisma relations)
- Input validation (Zod schemas)

### SEC-04: Audit Trail
- Complete AuditLog for all administrative actions
- IP address tracking
- Timestamps on all records

### SEC-05: Platform Security (Configurable)
- Global MFA toggle
- Audit log retention policy (configurable days)
- Failed login attempt limit (configurable)
- IP whitelisting option
- Session management

---

## 21. API Specification Summary

### Total API Endpoints: 150+

| Module | Route Base | Auth | Methods | Endpoints |
|--------|-----------|------|---------|-----------|
| Auth | /api/auth | Public/Protected | 5 | login, register, me, change-password, my-permissions |
| Employee | /api/employee | Protected (Any) | 25+ | profile, attendance, leaves, payslips, performance, benefits, tickets, documents, resignation, policies |
| Manager | /api/manager | MANAGER+ | 20+ | team, attendance, leaves, tasks, performance, reviews, increments, resignations, reimbursements |
| HR | /api/hr | HR/ADMIN+ | 40+ | jobs, applications, interviews, offers, onboarding, employees, exits, leaves, tickets, payroll, reports |
| Admin | /api/admin | ADMIN+ | 60+ | org, departments, users, payslips, payroll-config, policies, roles, holidays, benefits, AI, integrations, billing, attendance, resignations, shifts, overtime |
| SuperAdmin | /api/superadmin | SUPERADMIN | 25+ | stats, organizations, users, departments, payroll, audit-logs, analytics |
| Candidate | /api/candidate | CANDIDATE | 10 | jobs, applications, profile, settings, offers |
| Public | /api/public | None | 5 | demo-booking, contact, career-apply, jobs, platform-stats |
| Settings | /api/settings | Protected | 2 | GET/PUT global settings |
| Notifications | /api/notifications | Protected | 3+ | CRUD notifications |
| Pricing | /api/pricing | Protected | 5+ | CRUD pricing plans |
| Import | /api/import | Protected | 2+ | Excel import engine |
| Reimbursements | /api/reimbursements | ADMIN+ | 3 | approvals, approve, process-payment |
| Calendars | /api/admin/calendars | ADMIN+ | 4+ | Work calendar CRUD |
| Workflows | /api/approval-workflows | Protected | 10+ | Workflow CRUD + approval actions |
| Salary Structures | /api/admin/salary-structures | ADMIN+ | 5+ | Structure CRUD |

---

## 22. Integrations

### 22.1 Current Integrations (Configurable via Admin)
| Category | Integration | Status |
|----------|-------------|--------|
| Communication | Slack, MS Teams | Configurable |
| HRIS | BambooHR, Workday | Configurable |
| Payroll | ADP, Gusto | Configurable |
| Cloud | Google Workspace, Office 365 | Configurable |
| Security | Okta, Auth0 | Configurable |

### 22.2 Email
- **Provider**: Nodemailer (configurable SMTP)
- **Use Cases**: Welcome emails, Reminders, Notifications

### 22.3 File Storage
- **Current**: Local filesystem (/public/uploads)
- **Upload Limit**: 50MB (base64)

---

## 23. Glossary

| Term | Definition |
|------|-----------|
| **CTC** | Cost to Company — total annual compensation including all employer contributions |
| **Gross Salary** | Total salary before deductions (all earning components) |
| **Net Salary** | Take-home pay after all deductions |
| **Employer Cost** | CTC including employer-side contributions (PF, insurance, etc.) |
| **LOP** | Loss of Pay — salary deduction for unpaid absences |
| **PF** | Provident Fund — retirement savings contribution |
| **HRA** | House Rent Allowance — tax-exempt housing benefit |
| **OT** | Overtime — hours worked beyond scheduled shift |
| **LWD** | Last Working Day — final day of employment |
| **KPI** | Key Performance Indicator — measurable performance metric |
| **RBAC** | Role-Based Access Control — permission system based on user roles |
| **JWT** | JSON Web Token — authentication token standard |
| **ORM** | Object-Relational Mapping — database abstraction layer (Prisma) |
| **Multi-Tenant** | Architecture serving multiple organizations from single deployment |
| **ATS** | Applicant Tracking System — candidate pipeline management |
| **SaaS** | Software as a Service — cloud-based software delivery model |

---

> **END OF PRD**  
> This document defines every feature, requirement, model, and specification for the HCM.ai platform.
