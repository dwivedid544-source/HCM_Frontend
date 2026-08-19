# HCM.ai — Wireframe Document

> **Version:** 1.0  
> **Last Updated:** 2026-07-20  
> **Platform:** HCM.ai — AI-Powered Human Capital Management System  
> **Document Scope:** Complete wireframe specification for every page, modal, drawer, and component

---

## Table of Contents

1. [Global Layout & Navigation](#1-global-layout--navigation)
2. [Public Pages](#2-public-pages)
3. [Authentication Pages](#3-authentication-pages)
4. [SuperAdmin Pages](#4-superadmin-pages)
5. [Admin Pages](#5-admin-pages)
6. [HR Pages](#6-hr-pages)
7. [Manager Pages](#7-manager-pages)
8. [Employee Pages](#8-employee-pages)
9. [Candidate Pages](#9-candidate-pages)
10. [Shared Modals & Drawers](#10-shared-modals--drawers)
11. [Component Library](#11-component-library)

---

## 1. Global Layout & Navigation

### 1.1 AppLayout (Standard Roles: Candidate, HR, Employee, Manager, Admin)
```
┌──────────────────────────────────────────────────────────────┐
│ ┌────────┐ ┌──────────────────────────────────────────────┐  │
│ │        │ │               NAVBAR (Top Bar)                │  │
│ │        │ │ ┌─────────┐  ┌────────────┐ ┌─┐ ┌─┐ ┌─────┐│  │
│ │        │ │ │ 🔍 Search│  │ Page Title  │ │🔔│ │🌙│ │Avatar│  │
│ │ SIDE   │ │ └─────────┘  └────────────┘ └─┘ └─┘ └─────┘│  │
│ │  BAR   │ ├──────────────────────────────────────────────┤  │
│ │        │ │                                              │  │
│ │ 260px  │ │                                              │  │
│ │  or    │ │              MAIN CONTENT AREA               │  │
│ │ 80px   │ │                                              │  │
│ │(coll.) │ │         (Page Component Renders Here)        │  │
│ │        │ │                                              │  │
│ │        │ │                                              │  │
│ │        │ │                                              │  │
│ │        │ │                                              │  │
│ └────────┘ └──────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 1.2 Sidebar (Expanded: 260px)
```
┌────────────────────────────┐
│  ┌──┐  HCM.ai             │ ← Logo + Brand
│  └──┘                      │
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │ Current Scope          │ │ ← Dynamic scope indicator
│ │ ● [Role] Console       │ │
│ │   [Group] • [Page]     │ │
│ └────────────────────────┘ │
├────────────────────────────┤
│                            │
│ ▼ Group Name               │ ← Collapsible group header
│   ├── 📊 Dashboard         │ ← Active: highlighted bg
│   ├── 👥 Team Members      │
│   ├── 📅 Attendance        │
│   ├── ✅ Approvals         │
│   ├── 🎯 KPI Tracking      │
│   ├── 📋 Tasks             │
│   ├── ⭐ Reviews            │
│   ├── 📈 Reports           │
│   └── ...more items        │
│                            │
├────────────────────────────┤
│ Signed in as               │
│ ┌──────────────────────┐   │
│ │      [ROLE]          │   │ ← Role badge
│ └──────────────────────┘   │
│                   🚪 Logout │
└────────────────────────────┘
     ◀ ← Collapse toggle button (right edge)
```

### 1.3 Sidebar (Collapsed: 80px)
```
┌──────┐
│ ┌──┐ │ ← Logo icon only
│ └──┘ │
├──────┤
│  📊  │ ← Icons only
│  👥  │    Hover: Tooltip with label
│  📅  │    Hover-expand: Full sidebar appears
│  ✅  │
│  🎯  │
│  📋  │
│  ⭐  │
│  📈  │
├──────┤
│  🚪  │ ← Logout icon
└──────┘
```

### 1.4 Navbar (Top Bar)
```
┌──────────────────────────────────────────────────────────────┐
│ ┌────────────────────┐                    ┌─┐ ┌─┐ ┌──────┐ │
│ │ 🔍 Search anything  │  📍 Page Header   │🔔│ │🌙│ │ 👤 ▼ │ │
│ └────────────────────┘  with breadcrumb   └─┘ └─┘ └──────┘ │
│                                            │    │    │       │
│                                            │    │    └─ Profile dropdown:
│                                            │    │       ├── Profile
│                                            │    │       ├── Settings
│                                            │    │       └── Logout
│                                            │    └─ Theme toggle (Light/Dark)
│                                            └─ Notification bell + badge count
│                                               └── Dropdown notification list
└──────────────────────────────────────────────────────────────┘
```

### 1.5 SuperAdminLayout (Dedicated for SuperAdmin)
```
Same as AppLayout but with SuperAdminLayout wrapper
├── SuperAdmin-specific sidebar items
├── No ProtectedRoute wrapper (direct access)
└── SuperAdminProvider context
```

### 1.6 RolePreviewBanner (When SuperAdmin previews another role)
```
┌──────────────────────────────────────────────────────────────┐
│ ⚠️  Previewing as: [ROLE]                    [Exit Preview]  │
└──────────────────────────────────────────────────────────────┘
```

---

## 2. Public Pages

### 2.1 Landing Page (`/`)
```
┌──────────────────────────────────────────────────────────────┐
│                         NAVBAR                                │
│  ┌──┐ HCM.ai    Features | Pricing | About    [Login] [Demo]│
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                   HERO SECTION                           │ │
│  │  "Empower Your Human Capital with AI"                    │ │
│  │  Subtitle: Next-gen HR platform                          │ │
│  │                                                          │ │
│  │  ┌─────────────────┐  ┌─────────────────┐               │ │
│  │  │ Start Free Trial │  │  Book a Demo   │               │ │
│  │  └─────────────────┘  └─────────────────┘               │ │
│  │                                                          │ │
│  │  ┌──────────────────────────────────────────┐            │ │
│  │  │        Dashboard Preview Image           │            │ │
│  │  └──────────────────────────────────────────┘            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  STATS SECTION                                           │ │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │ │
│  │  │ 500+   │ │ 10K+   │ │ 98%    │ │ 50+    │           │ │
│  │  │Companies│ │Employees│ │Uptime  │ │Countries│           │ │
│  │  └────────┘ └────────┘ └────────┘ └────────┘           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ENTERPRISE LOGOS                                        │ │
│  │  [Logo] [Logo] [Logo] [Logo] [Logo] [Logo]              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  FEATURES SECTION                                        │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │ 🧑‍💼 Core  │ │ 💰Payroll│ │ 📋Recruit│ │ 📊Analytics│ │
│  │  │ HR       │ │ Mgmt    │ │ ment     │ │          │   │ │
│  │  │ Feature  │ │ Feature │ │ Feature  │ │ Feature  │   │ │
│  │  │ details  │ │ details │ │ details  │ │ details  │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  DASHBOARD PREVIEW                                       │ │
│  │  Interactive dashboard mockup with animated components    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ROLE-BASED SECTION                                      │ │
│  │  Tab: [Admin] [HR] [Manager] [Employee]                  │ │
│  │  Content changes per tab showing role-specific features   │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  AI AUTOMATION SECTION                                   │ │
│  │  AI capabilities showcase with animated illustrations     │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  HOW IT WORKS                                            │ │
│  │  Step 1: Setup → Step 2: Configure → Step 3: Launch      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  ROI METRICS                                             │ │
│  │  Animated counters showing savings/improvement stats      │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  PRICING SECTION                                         │ │
│  │  Toggle: [Monthly] / [Yearly]                            │ │
│  │  ┌──────────┐ ┌──────────────┐ ┌──────────┐            │ │
│  │  │ Starter  │ │ Professional │ │Enterprise│            │ │
│  │  │ $X/mo    │ │ ★ POPULAR    │ │ Custom   │            │ │
│  │  │          │ │ $X/mo        │ │          │            │ │
│  │  │ ✓ Feat 1 │ │ ✓ Feat 1     │ │ ✓ All    │            │ │
│  │  │ ✓ Feat 2 │ │ ✓ Feat 2     │ │ ✓ Feat   │            │ │
│  │  │ ✓ Feat 3 │ │ ✓ Feat 3     │ │ ✓ Custom │            │ │
│  │  │          │ │ ✓ Feat 4     │ │          │            │ │
│  │  │[Start]   │ │ [Start]      │ │[Contact] │            │ │
│  │  └──────────┘ └──────────────┘ └──────────┘            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  SECURITY & COMPLIANCE                                   │ │
│  │  Security badges and certifications                       │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  INTEGRATIONS                                            │ │
│  │  Third-party integration logo grid                        │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  TESTIMONIALS (Carousel)                                 │ │
│  │  "Quote from customer..." — Name, Title, Company         │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  CAREERS SECTION                                         │ │
│  │  Open positions with [Apply Now] buttons                  │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  FAQ SECTION (Accordion)                                 │ │
│  │  ▶ Question 1                                            │ │
│  │  ▼ Question 2                                            │ │
│  │    Answer text expanded here...                           │ │
│  │  ▶ Question 3                                            │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  CONTACT SECTION                                         │ │
│  │  ┌────────────────────┐  ┌─────────────────────────┐    │ │
│  │  │ Contact Info       │  │ Contact Form            │    │ │
│  │  │ 📧 Email           │  │ Name: [____________]    │    │ │
│  │  │ 📞 Phone           │  │ Email: [____________]   │    │ │
│  │  │ 📍 Address         │  │ Subject: [__________]   │    │ │
│  │  │ 🌐 Social Links    │  │ Message: [__________]   │    │ │
│  │  │                    │  │         [__________]    │    │ │
│  │  │                    │  │ [Send Message]          │    │ │
│  │  └────────────────────┘  └─────────────────────────┘    │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │  FOOTER                                                  │ │
│  │  Product | Company | Resources | Legal | Social Icons    │ │
│  │  © 2026 HCM.ai Global Inc. All rights reserved.         │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Book Demo Page (`/book-demo`)
```
┌──────────────────────────────────────────────────────────────┐
│  Step Indicator: [1 ●] — [2 ○] — [3 ○] — [4 ○]              │
│                                                               │
│  STEP 1: Company Information                                  │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Full Name:      [________________________]               ││
│  │ Work Email:     [________________________]               ││
│  │ Phone:          [+1 ▼] [__________________]              ││
│  │ Company Name:   [________________________]               ││
│  │ Company Size:   [Select... ▼]                            ││
│  │ Industry:       [Select... ▼]                            ││
│  │ Country:        [Select... ▼]                            ││
│  │                                                          ││
│  │                               [Next →]                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  STEP 2: Requirements                                         │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Select Modules:                                          ││
│  │ ☑ Core HR    ☑ Payroll    ☐ Recruitment                  ││
│  │ ☐ Performance ☐ Benefits   ☐ Compliance                  ││
│  │ ☐ AI Module  ☐ Analytics  ☐ Integrations                ││
│  │                                                          ││
│  │ Additional Notes:                                        ││
│  │ [_________________________________________________]      ││
│  │ [_________________________________________________]      ││
│  │                                                          ││
│  │                     [← Back]  [Next →]                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  STEP 3: Schedule                                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ┌────────────────────────┐  ┌─────────────────────────┐ ││
│  │ │  📅 July 2026          │  │ Available Slots:        │ ││
│  │ │  Mo Tu We Th Fr Sa Su  │  │ ○ 09:00 AM - 09:30 AM  │ ││
│  │ │     1  2  3  4  5  6   │  │ ● 10:00 AM - 10:30 AM  │ ││
│  │ │  7  8  9 10 11 12 13   │  │ ○ 11:00 AM - 11:30 AM  │ ││
│  │ │ 14 15 16 17 18 ■  20   │  │ ○ 02:00 PM - 02:30 PM  │ ││
│  │ │ 21 22 23 24 25 26 27   │  │ ○ 03:00 PM - 03:30 PM  │ ││
│  │ │ 28 29 30 31            │  │ ○ 04:00 PM - 04:30 PM  │ ││
│  │ └────────────────────────┘  └─────────────────────────┘ ││
│  │                     [← Back]  [Next →]                   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  STEP 4: Confirm & Submit                                     │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Summary:                                                 ││
│  │ Name: John Doe                                           ││
│  │ Company: Acme Corp (50-100 employees)                    ││
│  │ Modules: Core HR, Payroll, Recruitment                   ││
│  │ Date: July 18, 2026 at 10:00 AM                         ││
│  │                                                          ││
│  │                     [← Back]  [Book Demo ✓]              ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Authentication Pages

### 3.1 Login Page (`/login`)
```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────┐ ┌─────────────────────────────┐│
│ │                          │ │                             ││
│ │  ┌──┐ HCM.ai            │ │  Welcome back               ││
│ │  └──┘                    │ │  Please enter your details  ││
│ │                          │ │                             ││
│ │  Empower Your            │ │                             ││
│ │  Human Capital           │ │                             ││
│ │  with AI.                │ │                             ││
│ │                          │ │                             ││
│ │  Next generation HR      │ │                             ││
│ │  platform for modern     │ │                             ││
│ │  teams.                  │ │                             ││
│ │                          │ │  Work Email                 ││
│ │  ┌──────────────────┐   │ │  ┌─ 📧 ─────────────────┐  ││
│ │  │🛡 Enterprise Sec. │   │ │  │ name@company.com     │  ││
│ │  │⚡ AI Automation   │   │ │  └──────────────────────┘  ││
│ │  │🌐 Global Payroll  │   │ │                             ││
│ │  │📧 Smart Hiring    │   │ │  Password     Forgot?      ││
│ │  └──────────────────┘   │ │  ┌─ 🔒 ──────────── 👁 ─┐  ││
│ │                          │ │  │ ••••••••              │  ││
│ │                          │ │  └──────────────────────┘  ││
│ │                          │ │                             ││
│ │                          │ │  ☐ Remember for 30 days    ││
│ │                          │ │                             ││
│ │                          │ │  ┌──────────────────────┐  ││
│ │                          │ │  │    Sign In →          │  ││
│ │                          │ │  └──────────────────────┘  ││
│ │                          │ │                             ││
│ │                          │ │  ──── Or continue with ─── ││
│ │                          │ │                             ││
│ │                          │ │  ┌──────────────────────┐  ││
│ │                          │ │  │ 🔵 Google Workspace   │  ││
│ │                          │ │  └──────────────────────┘  ││
│ │                          │ │                             ││
│ │  © 2026 HCM.ai          │ │  Don't have an account?    ││
│ │                          │ │  Sign up as Candidate →    ││
│ └──────────────────────────┘ └─────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 3.2 Signup Page (`/signup`)
```
┌──────────────────────────────────────────────────────────────┐
│ ┌──────────────────────────┐ ┌─────────────────────────────┐│
│ │                          │ │                             ││
│ │  ┌──┐ HCM.ai            │ │  Create Account             ││
│ │  └──┘                    │ │  Sign up as a candidate     ││
│ │                          │ │                             ││
│ │  Join the Future         │ │  Work Email                 ││
│ │  of HR                   │ │  ┌─ 📧 ─────────────────┐  ││
│ │                          │ │  │ name@company.com     │  ││
│ │  Create your candidate   │ │  └──────────────────────┘  ││
│ │  account and start       │ │                             ││
│ │  exploring opportunities │ │  Password                  ││
│ │  with AI-powered         │ │  ┌─ 🔒 ──────────── 👁 ─┐  ││
│ │  matching.               │ │  │ ••••••••              │  ││
│ │                          │ │  └──────────────────────┘  ││
│ │                          │ │                             ││
│ │                          │ │  Confirm Password           ││
│ │                          │ │  ┌─ 🔒 ──────────── 👁 ─┐  ││
│ │                          │ │  │ ••••••••              │  ││
│ │                          │ │  └──────────────────────┘  ││
│ │                          │ │                             ││
│ │                          │ │  ┌──────────────────────┐  ││
│ │                          │ │  │    Sign Up →          │  ││
│ │                          │ │  └──────────────────────┘  ││
│ │                          │ │                             ││
│ │  © 2026 HCM.ai          │ │  Already have an account?  ││
│ │                          │ │  Sign In →                 ││
│ └──────────────────────────┘ └─────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 4. SuperAdmin Pages

### 4.1 SuperAdmin Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  SIDEBAR │ Master Dashboard                                   │
│          │                                                    │
│          │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐   │
│          │  │Users │ │Orgs  │ │Active│ │Revenue│ │Depts │   │
│          │  │ 245  │ │  3   │ │ 198  │ │$48.5K│ │  12  │   │
│          │  │+12%↑ │ │+1    │ │81%   │ │+15%↑ │ │      │   │
│          │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘   │
│          │                                                    │
│          │  Quick Actions:                                    │
│          │  [+ Add User] [+ New Org] [Analytics] [Settings]  │
│          │                                                    │
│          │  ┌─────────────────────┐ ┌─────────────────────┐  │
│          │  │  ROLE PREVIEW       │ │  ACTIVITY FEED       │  │
│          │  │ ┌─────┐ ┌─────┐    │ │  • User created     │  │
│          │  │ │Admin│ │  HR │    │ │    2 min ago         │  │
│          │  │ │[👁]  │ │[👁]  │    │ │  • Payroll run      │  │
│          │  │ └─────┘ └─────┘    │ │    15 min ago        │  │
│          │  │ ┌─────┐ ┌─────┐    │ │  • Role updated     │  │
│          │  │ │Mgr  │ │ Emp │    │ │    1 hr ago          │  │
│          │  │ │[👁]  │ │[👁]  │    │ │  • Dept created     │  │
│          │  │ └─────┘ └─────┘    │ │    2 hrs ago         │  │
│          │  └─────────────────────┘ └─────────────────────┘  │
│          │                                                    │
│          │  Organizations Table:                              │
│          │  ┌────────────────────────────────────────────┐    │
│          │  │ Org Name    │ Plan    │ Users │ Status     │    │
│          │  │ Acme Corp   │ Pro     │ 125   │ ● Active   │    │
│          │  │ TechStart   │ Starter │ 32    │ ● Active   │    │
│          │  │ BigCo Inc   │ Enter.  │ 500   │ ● Active   │    │
│          │  └────────────────────────────────────────────┘    │
│          │                                                    │
│          │  [Download Report]  [Refresh Data]  [Full Audit]  │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 User Management (SuperAdmin)
```
┌──────────────────────────────────────────────────────────────┐
│  User Management                              [+ Add User]   │
│                                                               │
│  ┌─ 🔍 Search users... ─┐  [Role ▼]  [Status ▼]  [Org ▼]   │
│  └───────────────────────┘                                    │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 👤 │ Name        │ Email           │ Role   │ Org    │ ⚡ │
│  ├────┼─────────────┼─────────────────┼────────┼────────┼───┤
│  │ 🟢 │ John Admin  │ admin@hcm.ai    │ ADMIN  │ Acme   │ ⋮ │
│  │ 🟢 │ Sarah HR    │ hr@hcm.ai       │ HR     │ Acme   │ ⋮ │
│  │ 🔴 │ Mike Emp    │ mike@test.com   │ EMP    │ Tech   │ ⋮ │
│  │ 🟢 │ Lisa Mgr    │ lisa@hcm.ai     │ MGR    │ Acme   │ ⋮ │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  ⋮ Action Menu:                                              │
│  ├── Edit User                                               │
│  ├── Toggle Active/Inactive                                  │
│  ├── Change Role                                             │
│  ├── Reset Password                                          │
│  └── Delete User                                             │
└──────────────────────────────────────────────────────────────┘
```

### 4.3 Pricing Management
```
┌──────────────────────────────────────────────────────────────┐
│  Pricing Plans                                [+ Add Plan]   │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Name      │ Monthly │ Yearly  │ Max Emp │ Status │ ⚡  │
│  ├───────────┼─────────┼─────────┼─────────┼────────┼────┤
│  │ Starter   │ $8/mo   │ $80/yr  │ 25      │●Active │ ⋮  │
│  │ Pro ★     │ $15/mo  │ $150/yr │ 100     │●Active │ ⋮  │
│  │ Enterprise│ $25/mo  │ $250/yr │ 1000    │●Active │ ⋮  │
│  └────────────────────────────────────────────────────────┘  │
│                                                               │
│  Plan Modal:                                                  │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Name: [____________]  Monthly: [$____]  Yearly: [$__]│    │
│  │ Max Employees: [___]  Max Admins: [__]  Storage: [GB]│    │
│  │ AI Credits: [____]  Support: [Standard ▼]            │    │
│  │ Trial Days: [14]  ☐ Popular  ☑ Active                │    │
│  │ Button Text: [Start Trial]  Link: [/login]           │    │
│  │ Features:                                             │    │
│  │  ✓ Core HR                        [+ Add Feature]    │    │
│  │  ✓ Employee Self-Service                              │    │
│  │  ✓ Basic Reports                                      │    │
│  │                            [Cancel]  [Save Plan]      │    │
│  └──────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

---

## 5. Admin Pages

### 5.1 Admin Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  Dashboard                                                    │
│                                                               │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─────┐│
│  │👥 128 │ │✅ 113 │ │🏢 8   │ │🛡 4   │ │💰₹42L │ │⚠️ 0 ││
│  │Total  │ │Active │ │Depts  │ │Roles  │ │Payroll│ │Alert ││
│  │Emps   │ │Users  │ │       │ │       │ │       │ │      ││
│  │+3/wk  │ │88%    │ │2 arch │ │Gran.  │ │Est/mo │ │Clear ││
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └─────┘│
│                                                               │
│  Quick Actions:                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌───────────┐ ┌──────────┐│
│  │+ Add Employee│ │ Run Payroll │ │Gen Report │ │Download  ││
│  └─────────────┘ └─────────────┘ └───────────┘ └──────────┘│
│                                                               │
│  ┌──────────────────────┐  ┌──────────────────────────────┐  │
│  │ Recent Activity      │  │ Department Overview          │  │
│  │ • Admin added user   │  │ ┌──────┐ ┌──────┐ ┌──────┐ │  │
│  │   2 min ago          │  │ │Engg  │ │Sales │ │HR    │ │  │
│  │ • Payroll processed  │  │ │45 emp│ │22 emp│ │8 emp │ │  │
│  │   30 min ago         │  │ └──────┘ └──────┘ └──────┘ │  │
│  │ • Policy updated     │  │                             │  │
│  │   1 hr ago           │  │                             │  │
│  └──────────────────────┘  └──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

### 5.2 Employees/Users Management
```
┌──────────────────────────────────────────────────────────────┐
│  Employees                     [Import Excel] [+ Add Employee]│
│                                                               │
│  ┌─ 🔍 Search... ─┐   [Role ▼]   [Status ▼]                 │
│  └─────────────────┘                                          │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │👤│ Name       │ Emp ID │ Email        │ Dept  │Role │ ⚡ ││
│  ├──┼────────────┼────────┼──────────────┼───────┼─────┼───┤│
│  │🟢│ Raj Kumar  │ EMP001 │ raj@co.com   │ Engg  │EMP  │ ⋮ ││
│  │🟢│ Priya Sharma│EMP002 │ priya@co.com │ HR    │HR   │ ⋮ ││
│  │🟡│ Amit Singh │ EMP003 │ amit@co.com  │ Sales │MGR  │ ⋮ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  UserModal (Add/Edit):                                        │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Tabs: [Personal] [Employment] [Compensation] [Emergency] ││
│  │                                                           ││
│  │ PERSONAL:                                                 ││
│  │ Full Name: [______________]  Emp ID: [EMP___]             ││
│  │ Email: [__________________]  Phone: [+91▼] [__________]  ││
│  │ DOB: [📅 Select Date]       Gender: [Select ▼]           ││
│  │ Blood Group: [Select ▼]     Address: [______________]    ││
│  │                                                           ││
│  │ EMPLOYMENT:                                               ││
│  │ Department: [Select ▼]      Manager: [Select ▼]          ││
│  │ Role: [EMPLOYEE ▼]         Join Date: [📅]               ││
│  │ Emp Type: [Full-time ▼]    Shift: [Select ▼]            ││
│  │ OT Policy: [Select ▼]     Salary Type: [Monthly ▼]      ││
│  │                                                           ││
│  │ COMPENSATION:                                             ││
│  │ Salary Structure: [Select ▼]  Monthly CTC: [₹_______]   ││
│  │ Annual CTC: [₹________]     Salary Band: [Select ▼]     ││
│  │ Currency: [INR ▼]           Effective: [📅]              ││
│  │                                                           ││
│  │ EMERGENCY:                                                ││
│  │ Contact Name: [__________]  Phone: [+91▼] [__________]  ││
│  │ Relationship: [__________]                                ││
│  │                                                           ││
│  │                               [Cancel]  [Save Employee]   ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 5.3 Payroll Configuration
```
┌──────────────────────────────────────────────────────────────┐
│  Payroll Configuration                                        │
│                                                               │
│  Tabs: [Salary Components] [Deduction Rules] [Tax Rules] [Workflows]
│                                                               │
│  SALARY COMPONENTS:                          [+ Add Component]│
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Name     │ Code │ Category │ Calc Type  │ Value │ Tax │⚡ ││
│  ├──────────┼──────┼──────────┼────────────┼───────┼─────┼──┤│
│  │ Basic    │ BAS  │ Earning  │ Percentage │ 40%   │ ✓   │⋮ ││
│  │ HRA      │ HRA  │ Earning  │ Percentage │ 20%   │ ✓   │⋮ ││
│  │ DA       │ DA   │ Earning  │ Percentage │ 10%   │ ✓   │⋮ ││
│  │ Special  │ SPA  │ Earning  │ AutoBal.   │ -     │ ✓   │⋮ ││
│  │ PF(Emp)  │ EPF  │ Deduct.  │ Percentage │ 12%   │ ✗   │⋮ ││
│  │ PF(Comp) │ CPF  │ Employer │ Percentage │ 12%   │ ✗   │⋮ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Component Modal:                                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Name: [__________]   Code: [____]   Sequence: [0]        ││
│  │ Category: [Earning ▼]    Calc Type: [Percentage ▼]       ││
│  │ Calc Base: [CTC ▼]      Value: [40%]                    ││
│  │ Formula: [_________________________________] (if Formula) ││
│  │ ☑ Taxable  ☐ Auto Balance  ☐ Employer Contrib            ││
│  │ Rounding: [Nearest ▼]    Display Order: [1]              ││
│  │                                [Cancel]  [Save]           ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  TAX RULES:                                    [+ Add Rule]  │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Tax Rule: India Income Tax FY2026                         ││
│  │ ┌──────────────┐                                         ││
│  │ │ Slab Builder: │                                         ││
│  │ │ Min    │ Max     │ Rate │                                ││
│  │ │ 0      │ 250000  │ 0%   │  [✗]                         ││
│  │ │ 250001 │ 500000  │ 5%   │  [✗]                         ││
│  │ │ 500001 │ 1000000 │ 20%  │  [✗]                         ││
│  │ │ 1000001│ ∞       │ 30%  │  [✗]                         ││
│  │ │              [+ Add Slab]                               ││
│  │ └──────────────┘                                         ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 5.4 Roles & Permissions
```
┌──────────────────────────────────────────────────────────────┐
│  Roles & Permissions                         [+ Create Role] │
│                                                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Employee │ │ Manager  │ │   HR     │ │  Admin   │       │
│  │ Built-in │ │ Built-in │ │ Built-in │ │ Built-in │       │
│  │ 45 users │ │ 12 users │ │ 5 users  │ │ 3 users  │       │
│  │ [View]   │ │ [View]   │ │ [View]   │ │ [View]   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                               │
│  ┌──────────┐ ┌──────────┐                                   │
│  │Team Lead │ │ Auditor  │  ← Custom roles                  │
│  │ Custom   │ │ Custom   │                                   │
│  │ 8 users  │ │ 2 users  │                                   │
│  │[Edit][🗑]│ │[Edit][🗑]│                                   │
│  └──────────┘ └──────────┘                                   │
│                                                               │
│  RoleModal:                                                   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Role Name: [____________]  Inherits: [EMPLOYEE ▼]        ││
│  │ Description: [___________________________]               ││
│  │ Landing Page: [/employee/dashboard]  Status: ☑ Active    ││
│  │                                                           ││
│  │ PERMISSIONS MATRIX:                                       ││
│  │ ┌────────────────┬──────┬────────┬──────┬────────┐       ││
│  │ │ Module         │ View │ Create │ Edit │ Delete │       ││
│  │ ├────────────────┼──────┼────────┼──────┼────────┤       ││
│  │ │ Dashboard      │  ☑   │  ☐     │  ☐   │  ☐     │       ││
│  │ │ Users          │  ☑   │  ☐     │  ☐   │  ☐     │       ││
│  │ │ Departments    │  ☑   │  ☐     │  ☐   │  ☐     │       ││
│  │ │ Payroll        │  ☑   │  ☑     │  ☐   │  ☐     │       ││
│  │ │ Reports        │  ☑   │  ☑     │  ☐   │  ☐     │       ││
│  │ │ Settings       │  ☐   │  ☐     │  ☐   │  ☐     │       ││
│  │ └────────────────┴──────┴────────┴──────┴────────┘       ││
│  │                                [Cancel]  [Save Role]      ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 5.5 Compliance Center
```
┌──────────────────────────────────────────────────────────────┐
│  Compliance Center                            [+ Add Policy] │
│                                                               │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                    │
│  │📋 12  │ │✅ 8   │ │⚠️ 2   │ │🔄 1   │                    │
│  │Total  │ │Active │ │Expiring│ │Renewing│                    │
│  └───────┘ └───────┘ └───────┘ └───────┘                    │
│                                                               │
│  [Category ▼]  [Status ▼]  [Department ▼]  [🔒 Security Scan]│
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │Policy Name    │Cat.  │Owner │Dept│EffDate│ExpDate│V. │St ││
│  ├───────────────┼──────┼──────┼────┼───────┼───────┼───┼──┤│
│  │Data Privacy   │Legal │Admin │All │Jan 24 │Jan 25 │2.0│●A││
│  │Code of Conduct│HR    │HR    │All │Mar 24 │Mar 25 │1.0│●A││
│  │Leave Policy   │HR    │Admin │All │Apr 24 │Apr 25 │1.5│⚠E││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Row Actions: [View] [Edit] [Archive] [Renew] [Remind] [🗑]  │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. HR Pages

### 6.1 HR Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  HR Dashboard                                                 │
│                                                               │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                    │
│  │💼 12  │ │👥 156 │ │📅 8   │ │✅ 78% │                    │
│  │Active │ │Total  │ │Upcomg │ │Offer  │                    │
│  │Jobs   │ │Cands  │ │Intrv  │ │Accept%│                    │
│  └───────┘ └───────┘ └───────┘ └───────┘                    │
│                                                               │
│  Quick: [+ Post Job] [Schedule Interview] [Export Report]    │
│                                                               │
│  ┌─────────────────────────┐ ┌───────────────────────────┐   │
│  │ Upcoming Interviews     │ │ Pipeline Overview         │   │
│  │ ┌─────────────────────┐ │ │ Applied:    ████████ 85   │   │
│  │ │ 👤 Priya Sharma     │ │ │ Screening:  █████ 45      │   │
│  │ │ Sr. Developer       │ │ │ Interview:  ███ 28        │   │
│  │ │ 📅 Today, 2:30 PM   │ │ │ Offered:    ██ 15         │   │
│  │ │ [Join Call]          │ │ │ Hired:      █ 8           │   │
│  │ └─────────────────────┘ │ │                           │   │
│  │ ┌─────────────────────┐ │ │                           │   │
│  │ │ 👤 Rahul Verma      │ │ │                           │   │
│  │ │ Product Manager     │ │ │                           │   │
│  │ │ 📅 Tomorrow, 11 AM  │ │ │                           │   │
│  │ │ [Join Call]          │ │ │                           │   │
│  │ └─────────────────────┘ │ │                           │   │
│  └─────────────────────────┘ └───────────────────────────┘   │
│                                                               │
│  Recent Candidates:                                           │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 👤 │ Name        │ Role          │ Stage      │ Match   ││
│  │ ── │ Anita Roy   │ UI Designer   │ Interview  │ 92% ██▓ ││
│  │ ── │ Karan Mehta │ Backend Dev   │ Screening  │ 85% ██▒ ││
│  │ ── │ Sneha Patel │ Data Analyst  │ Applied    │ 78% █▓  ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Interview Management
```
┌──────────────────────────────────────────────────────────────┐
│  Interviews                              [+ Schedule Interview]│
│                                                               │
│  View: [📋 List] [📅 Calendar]   [Status ▼] [Round ▼]       │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │Candidate   │Role        │Interviewer│Date/Time  │Round│St││
│  ├────────────┼────────────┼───────────┼───────────┼─────┼──┤│
│  │Anita Roy   │UI Designer │John Admin │Jul 20 2pm │Tech │🟡││
│  │Karan Mehta │Backend Dev │Sarah HR   │Jul 21 11am│HR   │🟢││
│  │Sneha Patel │Data Analyst│Mike Mgr   │Jul 22 3pm │Final│⚪││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Row Actions: [Join] [Edit] [Feedback] [Cancel] [Delete]     │
│                                                               │
│  Feedback Modal:                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Rating: ⭐⭐⭐⭐☆ (4/5)                                    ││
│  │ Feedback:                                                 ││
│  │ [____________________________________________________]   ││
│  │ [____________________________________________________]   ││
│  │                                [Cancel]  [Submit]         ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 6.3 Onboarding
```
┌──────────────────────────────────────────────────────────────┐
│  Onboarding                 [Send Welcome All] [+ Add New]   │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │Name      │Role        │Dept    │Progress      │Status │⚡││
│  ├──────────┼────────────┼────────┼──────────────┼───────┼──┤│
│  │Priya S.  │Developer   │Engg    │████████░░ 80%│In Prog│⋮ ││
│  │Rahul V.  │PM          │Product │██████░░░░ 60%│In Prog│⋮ ││
│  │Anita R.  │Designer    │Design  │██░░░░░░░░ 20%│Started│⋮ ││
│  │Karan M.  │Backend     │Engg    │░░░░░░░░░░  0%│Not St.│⋮ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  ⋮ Actions:                                                  │
│  ├── Edit                                                    │
│  ├── Update Progress                                         │
│  ├── Remind Manager                                          │
│  ├── ⭐ Promote to Employee ← Creates full User + Profile    │
│  └── Delete                                                  │
└──────────────────────────────────────────────────────────────┘
```

### 6.4 Exit Clearance Center
```
┌──────────────────────────────────────────────────────────────┐
│  Exit & Clearance Center                  [Initiate Termination]
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │Employee │Type       │Status        │LWD     │Clearance  ││
│  ├─────────┼───────────┼──────────────┼────────┼───────────┤│
│  │Amit S.  │Resignation│Pending HR    │Aug 15  │IT:✓ Fin:✗ ││
│  │         │           │              │        │HR: ✗      ││
│  │Suresh K.│Termination│Clearance     │Jul 30  │IT:✓ Fin:✓ ││
│  │         │           │              │        │HR: ✗      ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Clearance Toggles: [IT ☑/☐] [Finance ☑/☐] [HR ☑/☐]       │
│  Actions: [Approve Resignation] [Finalize Exit]              │
│                                                               │
│  Exit Interview:                                              │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Rating: ⭐⭐⭐☆☆                                           ││
│  │ Feedback: [_________________________________________]     ││
│  │                                         [Save Feedback]   ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 7. Manager Pages

### 7.1 Manager Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  Team Dashboard                                               │
│                                                               │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                    │
│  │👥 12  │ │✅ 10  │ │⏳ 5   │ │🎯 87% │                    │
│  │Team   │ │Active │ │Pending│ │Avg KPI│                    │
│  │Size   │ │Today  │ │Apprvl │ │Score  │                    │
│  └───────┘ └───────┘ └───────┘ └───────┘                    │
│                                                               │
│  Quick: [+ Assign Task] [📥 Report ▼] [+ Quick Review]      │
│                                                               │
│  ┌─────────────────────────┐ ┌───────────────────────────┐   │
│  │ Pending Leave Requests  │ │ Team Attendance Today     │   │
│  │ ┌─────────────────────┐ │ │ 🟢 Present: 10          │   │
│  │ │ 👤 Raj Kumar        │ │ │ 🔴 Absent: 1            │   │
│  │ │ Sick Leave: Jul 20-22│ │ │ 🟡 On Leave: 1          │   │
│  │ │ 3 days              │ │ │                          │   │
│  │ │ [Approve] [Reject]  │ │ │ Avg Hours: 7.5h          │   │
│  │ └─────────────────────┘ │ │                          │   │
│  └─────────────────────────┘ └───────────────────────────┘   │
│                                                               │
│  ┌─────────────────────────┐ ┌───────────────────────────┐   │
│  │ Active Tasks            │ │ Team Performance          │   │
│  │ 📋 Fix login bug  [🔴H]│ │ [This Week▼]             │   │
│  │ 📋 Update docs   [🟡M] │ │ Raj: ████████░░ 85%      │   │
│  │ 📋 Test release  [🟢L] │ │ Priya: ██████░░░░ 72%    │   │
│  │                         │ │ Amit: ████████░░ 90%      │   │
│  └─────────────────────────┘ └───────────────────────────┘   │
│                                                               │
│  Export Modal:                                                │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Format: ○ PDF Report  ○ Excel  ● CSV Data               ││
│  │ Range:  ● Current Month  ○ Last 30D  ○ Quarter  ○ YTD   ││
│  │                                [Cancel]  [Download ↓]     ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 7.2 Leave Approval
```
┌──────────────────────────────────────────────────────────────┐
│  Team Approvals                                               │
│                                                               │
│  Tabs: [Pending (5)] [Approved] [Rejected] [All]             │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │Employee │Type    │From      │To        │Days│Reason  │Act││
│  ├─────────┼────────┼──────────┼──────────┼────┼────────┼───┤│
│  │Raj Kumar│Sick    │Jul 20    │Jul 22    │3   │Fever   │⋮  ││
│  │Priya S. │Casual  │Jul 25    │Jul 25    │1   │Personal│⋮  ││
│  │Amit S.  │Annual  │Aug 1     │Aug 5     │5   │Vacation│⋮  ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Detail Panel (expanded):                                     │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 👤 Raj Kumar — Sick Leave: Jul 20-22 (3 days)            ││
│  │ Reason: "Having fever and need rest"                      ││
│  │ Emergency Contact: +91 9876543210                         ││
│  │ Leave Balance: Sick (8/12 remaining)                      ││
│  │                                                           ││
│  │ Manager Comment: [________________________________]       ││
│  │                                                           ││
│  │ ┌────────────────┐  ┌───────────────────┐                ││
│  │ │  ✅ Approve     │  │  ❌ Reject         │                ││
│  │ └────────────────┘  └───────────────────┘                ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 8. Employee Pages

### 8.1 Employee Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  Good morning, Raj! 👋                   Jul 20, 2026        │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  CLOCK WIDGET                                             ││
│  │  ┌────────────────────────┐                               ││
│  │  │   ⏱ 04:32:15          │  Status: 🟢 Clocked In       ││
│  │  │   Hours Worked Today   │  Since: 09:15 AM              ││
│  │  │                        │                               ││
│  │  │  [🔴 Clock Out]        │  (or [🟢 Clock In] if out)   ││
│  │  └────────────────────────┘                               ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐                    │
│  │⏱ 4.5h│ │📅 8   │ │💰₹45K │ │📋 3   │                    │
│  │Today  │ │Leave  │ │This   │ │Tasks  │                    │
│  │Hours  │ │Balance│ │Month  │ │Due    │                    │
│  └───────┘ └───────┘ └───────┘ └───────┘                    │
│                                                               │
│  Quick Actions:                                               │
│  ┌──────────────────┐ ┌──────────────┐ ┌─────────────┐      │
│  │ 📅 Apply Leave    │ │ 💰 Payslip   │ │ 📋 Tasks     │      │
│  └──────────────────┘ └──────────────┘ └─────────────┘      │
│                                                               │
│  ┌─────────────────────────┐ ┌───────────────────────────┐   │
│  │ 📅 Upcoming Holidays    │ │ 📢 Announcements          │   │
│  │ • Independence Day      │ │ • Q3 Goals Published      │   │
│  │   Aug 15, 2026          │ │   Jul 18 — Important      │   │
│  │ • Diwali                │ │ • Office Renovation       │   │
│  │   Nov 1, 2026           │ │   Jul 15 — Info           │   │
│  │ [View All] [Sync Cal]   │ │ [View All]               │   │
│  └─────────────────────────┘ └───────────────────────────┘   │
│                                                               │
│  Leave Modal:                                                 │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Leave Type: [Casual Leave ▼]                              ││
│  │ From: [📅 Jul 25]    To: [📅 Jul 25]    Days: 1         ││
│  │ Reason: [__________________________________________]      ││
│  │ Emergency: [+91 ▼] [_______________]                     ││
│  │                                [Cancel]  [Submit Leave]   ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 8.2 Employee Profile
```
┌──────────────────────────────────────────────────────────────┐
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ┌────┐                                                   ││
│  │  │ 👤 │  Raj Kumar                                        ││
│  │  │    │  EMP001 • Engineering • Employee                  ││
│  │  └────┘  Manager: Amit Singh                              ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Tabs: [Personal] [Employment] [Emergency] [Skills]          │
│                                                               │
│  PERSONAL (editable):                                         │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Full Name: [Raj Kumar_______]  Phone: [+91] [98765___]   ││
│  │ DOB: [📅 Jan 15, 1992]       Gender: [Male ▼]           ││
│  │ Blood Group: [O+ ▼]          Address: [Mumbai, India_]  ││
│  │ Bio: [Senior developer with 5+ years experience_______]  ││
│  │                                                           ││
│  │                                            [Save Changes] ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  SKILLS:                                                      │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ React      ████████░░  85%   [🗑]                        ││
│  │ Node.js    ██████░░░░  72%   [🗑]                        ││
│  │ TypeScript ████████░░  90%   [🗑]                        ││
│  │ Python     ████░░░░░░  55%   [🗑]                        ││
│  │                                                           ││
│  │ [+ Add Skill]                                             ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 8.3 Employee Help Desk
```
┌──────────────────────────────────────────────────────────────┐
│  Help Desk                                  [+ Open Ticket]  │
│                                                               │
│  [Status ▼]  [Category ▼]  [Priority ▼]                     │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │Subject        │Category   │Priority│Status     │Created  ││
│  ├───────────────┼───────────┼────────┼───────────┼─────────┤│
│  │Laptop issue   │IT Support │🔴 High │🟡 In Prog │Jul 18   ││
│  │Salary query   │Payroll    │🟡 Med  │🟢 Resolved│Jul 15   ││
│  │Leave balance  │HR Query   │🟢 Low  │⚪ Open    │Jul 20   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Ticket Thread (expanded):                                    │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 📋 Laptop issue — IT Support — High Priority             ││
│  │                                                           ││
│  │ ┌──────────────────────────────────────────────┐          ││
│  │ │ 👤 You (Jul 18, 10:00 AM):                   │          ││
│  │ │ My laptop screen is flickering since morning  │          ││
│  │ └──────────────────────────────────────────────┘          ││
│  │         ┌──────────────────────────────────────────────┐  ││
│  │         │ 🛠 IT Support (Jul 18, 11:30 AM):            │  ││
│  │         │ Please try restarting. If issue persists,    │  ││
│  │         │ we'll arrange a replacement.                 │  ││
│  │         └──────────────────────────────────────────────┘  ││
│  │                                                           ││
│  │ Reply: [_________________________________________]        ││
│  │ 📎 Attach                              [Send Reply]       ││
│  └──────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Candidate Pages

### 9.1 Candidate Dashboard
```
┌──────────────────────────────────────────────────────────────┐
│  Welcome back, Candidate! 👋                                 │
│                                                               │
│  ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ ┌─────┐│
│  │📋 5   │ │📅 2   │ │📨 1   │ │⭐ 3   │ │👁 12  │ │📥 4  ││
│  │Applied│ │Intrv  │ │Offers │ │Short  │ │Profile│ │Resume││
│  │       │ │Upcomg │ │       │ │listed │ │Views  │ │Dwnlds││
│  └───────┘ └───────┘ └───────┘ └───────┘ └───────┘ └─────┘│
│                                                               │
│  ┌───────────────────────────┐ ┌─────────────────────────┐   │
│  │ 📊 Profile Completeness  │ │ 📅 Upcoming Interviews   │   │
│  │ ████████░░ 83%            │ │ ┌─────────────────────┐ │   │
│  │ ✓ Name  ✓ Email  ✓ Phone │ │ │ Sr. Developer       │ │   │
│  │ ✓ Resume ✗ LinkedIn      │ │ │ TechCorp — Video    │ │   │
│  │ ✓ Skills                  │ │ │ Jul 21, 2:30 PM     │ │   │
│  │ [Complete Profile →]      │ │ │ [Join Interview]    │ │   │
│  └───────────────────────────┘ │ └─────────────────────┘ │   │
│                                 └─────────────────────────┘   │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Recent Applications                                       ││
│  │ ┌──────────────────────────────────────────────────────┐ ││
│  │ │ 💼 Sr. Developer — TechCorp                          │ ││
│  │ │ Status: 🟡 Interviewing    Applied: Jul 15           │ ││
│  │ │ Applied → Screening → ● Interviewing → Offered       │ ││
│  │ │ [View Details]  [Request Update]                     │ ││
│  │ └──────────────────────────────────────────────────────┘ ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Quick: [Browse Jobs] [Build Resume] [Career Analytics]      │
└──────────────────────────────────────────────────────────────┘
```

### 9.2 Browse Jobs
```
┌──────────────────────────────────────────────────────────────┐
│  Browse Jobs                                                  │
│                                                               │
│  ┌─ 🔍 Search jobs, keywords, companies... ──────────────┐  │
│  └───────────────────────────────────────────────────────────┘│
│                                                               │
│  Filters: [Type ▼] [Experience ▼] [Location ▼] [Salary ▼]  │
│                                                               │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ ┌────────────────────────────────────────────────────┐   ││
│  │ │ 💼 Senior React Developer                          │   ││
│  │ │ 🏢 TechCorp • 📍 Mumbai • 💰 ₹15-25 LPA          │   ││
│  │ │ 🕐 Full-time • 📅 3-5 yrs exp • 👥 15 applicants  │   ││
│  │ │                                                     │   ││
│  │ │ React, TypeScript, Node.js, GraphQL                │   ││
│  │ │                                                     │   ││
│  │ │ [View Details]                      [Quick Apply]   │   ││
│  │ └────────────────────────────────────────────────────┘   ││
│  │                                                           ││
│  │ ┌────────────────────────────────────────────────────┐   ││
│  │ │ 💼 Product Manager                                 │   ││
│  │ │ 🏢 FinEdge Corp • 📍 Bangalore • 💰 ₹20-30 LPA   │   ││
│  │ │ 🕐 Full-time • 📅 5-8 yrs exp • 👥 8 applicants   │   ││
│  │ │                                                     │   ││
│  │ │ [View Details]                      [Quick Apply]   │   ││
│  │ └────────────────────────────────────────────────────┘   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                               │
│  Pagination: [← Prev] 1 2 3 ... 10 [Next →]                 │
└──────────────────────────────────────────────────────────────┘
```

### 9.3 Resume Builder
```
┌──────────────────────────────────────────────────────────────┐
│  Resume Builder                    [Save] [Download PDF] [AI]│
│                                                               │
│  ┌────────────────────────────┐ ┌────────────────────────┐   │
│  │  EDITOR                    │ │  LIVE PREVIEW          │   │
│  │                            │ │                        │   │
│  │  📝 Personal Information   │ │  ┌──────────────────┐ │   │
│  │  Name: [______________]    │ │  │ RAJ KUMAR        │ │   │
│  │  Email: [_____________]    │ │  │ Senior Developer │ │   │
│  │  Phone: [_____________]    │ │  │ Mumbai, India    │ │   │
│  │  Location: [__________]    │ │  │                  │ │   │
│  │                            │ │  │ SUMMARY          │ │   │
│  │  📝 Professional Summary   │ │  │ 5+ years...     │ │   │
│  │  [________________________]│ │  │                  │ │   │
│  │  [________________________]│ │  │ EXPERIENCE       │ │   │
│  │                            │ │  │ TechCorp         │ │   │
│  │  📝 Experience [+ Add]     │ │  │ Sr. Dev (2022-)  │ │   │
│  │  ┌──────────────────────┐  │ │  │ • Built React... │ │   │
│  │  │ Company: [TechCorp_] │  │ │  │                  │ │   │
│  │  │ Title: [Sr. Dev____] │  │ │  │ EDUCATION        │ │   │
│  │  │ From: [2022] To: [Now]│  │ │  │ IIT Mumbai      │ │   │
│  │  │ Details:             │  │ │  │ B.Tech CS (2018)│ │   │
│  │  │ • [Built React apps] │  │ │  │                  │ │   │
│  │  │ • [Led team of 5___] │  │ │  │ SKILLS           │ │   │
│  │  │ [+ Add bullet]       │  │ │  │ React • Node.js │ │   │
│  │  └──────────────────────┘  │ │  │ TypeScript      │ │   │
│  │                            │ │  └──────────────────┘ │   │
│  │  📝 Education [+ Add]      │ │                        │   │
│  │  📝 Skills [+ Add tag]     │ │  Templates: [Modern▼]  │   │
│  │  📝 Projects [+ Add]       │ │                        │   │
│  │  📝 Certifications [+ Add] │ │                        │   │
│  └────────────────────────────┘ └────────────────────────┘   │
└──────────────────────────────────────────────────────────────┘
```

---

## 10. Shared Modals & Drawers

### 10.1 CenterModal (Generic)
```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │ ← Dark overlay
│ │  Modal Title              [✕]    │ │
│ │──────────────────────────────────│ │
│ │                                  │ │
│ │  Modal Content Area              │ │
│ │  (forms, tables, info)           │ │
│ │                                  │ │
│ │──────────────────────────────────│ │
│ │              [Cancel]  [Action]  │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### 10.2 ConfirmDialog
```
┌──────────────────────────────────────┐
│ ┌──────────────────────────────────┐ │
│ │  ⚠️ Are you sure?                │ │
│ │                                  │ │
│ │  This action cannot be undone.   │ │
│ │                                  │ │
│ │         [Cancel]  [🗑 Delete]    │ │
│ └──────────────────────────────────┘ │
└──────────────────────────────────────┘
```

### 10.3 Drawer (Side Panel)
```
┌──────────────────────────────────────────────────────────────┐
│                                    ┌────────────────────────┐│
│  Main Content (dimmed)             │ Drawer Title      [✕]  ││
│                                    │─────────────────────── ││
│                                    │                        ││
│                                    │ Detail content here    ││
│                                    │ (Audit logs, Policy    ││
│                                    │  details, Invoice      ││
│                                    │  details, etc.)        ││
│                                    │                        ││
│                                    │                        ││
│                                    │                        ││
│                                    │        [Action Button] ││
│                                    └────────────────────────┘│
└──────────────────────────────────────────────────────────────┘
```

### 10.4 PayrollBreakdownModal
```
┌──────────────────────────────────────┐
│  Payroll Breakdown — Raj Kumar      │
│  Month: July 2026                    │
│                                      │
│  EARNINGS:                           │
│  ├── Basic Salary      ₹ 18,000     │
│  ├── HRA               ₹  9,000     │
│  ├── DA                ₹  4,500     │
│  ├── Special Allowance  ₹  6,500     │
│  ├── Conveyance         ₹  1,600     │
│  └── Total Earnings     ₹ 39,600     │
│                                      │
│  DEDUCTIONS:                         │
│  ├── PF (Employee)      ₹  2,160     │
│  ├── Professional Tax    ₹    200     │
│  ├── Income Tax          ₹  3,800     │
│  └── Total Deductions    ₹  6,160     │
│                                      │
│  EMPLOYER CONTRIBUTIONS:             │
│  ├── PF (Employer)       ₹  2,160     │
│  └── ESI                 ₹    325     │
│                                      │
│  ┌──────────────────────────────┐    │
│  │ NET PAY:        ₹ 33,440    │    │
│  │ EMPLOYER COST:  ₹ 42,085    │    │
│  └──────────────────────────────┘    │
│                                      │
│               [Download PDF] [Close] │
└──────────────────────────────────────┘
```

### 10.5 Toast Notifications
```
┌──────────────────────────────┐
│ ✅ Action completed!         │  ← Success (green)
└──────────────────────────────┘

┌──────────────────────────────┐
│ ❌ Something went wrong      │  ← Error (red)
└──────────────────────────────┘

┌──────────────────────────────┐
│ ℹ️ Processing your request   │  ← Info (blue)
└──────────────────────────────┘

┌──────────────────────────────┐
│ ⚠️ Warning message           │  ← Warning (yellow)
└──────────────────────────────┘
```

---

## 11. Component Library

### 11.1 Stat Card
```
┌───────────────────┐
│ ┌──┐              │
│ │🔵│  Label        │
│ └──┘              │
│                   │
│  VALUE            │  ← Large text
│  Trend text ↑     │  ← Subtle trend indicator
└───────────────────┘
```

### 11.2 Action Dropdown
```
┌─────┐
│  ⋮  │ ← Three-dot menu
└──┬──┘
   │ ┌───────────────┐
   └─│ Edit          │
     │ Change Role   │
     │ Toggle Active │
     │ ──────────────│
     │ 🗑 Delete     │ ← Destructive action (red)
     └───────────────┘
```

### 11.3 Status Badges
```
● Active     → Green dot + "Active" text
● Inactive   → Red dot + "Inactive" text
● Pending    → Yellow dot + "Pending" text
● Draft      → Gray dot + "Draft" text
● Published  → Blue dot + "Published" text
● Closed     → Dark dot + "Closed" text
```

### 11.4 PhoneInput
```
┌──────────────────────────┐
│ [🇮🇳 +91 ▼] [9876543210] │ ← Country selector + number
└──────────────────────────┘
```

### 11.5 DatePicker
```
┌──────────────────────────┐
│ [📅 Jul 20, 2026      ▼] │
└──────────┬───────────────┘
           │ ┌──────────────────────┐
           └─│  ◀  July 2026  ▶     │
             │ Mo Tu We Th Fr Sa Su │
             │     1  2  3  4  5  6 │
             │  7  8  9 10 11 12 13 │
             │ 14 15 16 17 18 19 ■  │ ← Selected: 20
             │ 21 22 23 24 25 26 27 │
             │ 28 29 30 31          │
             └──────────────────────┘
```

### 11.6 Avatar
```
┌────┐        ┌────┐
│ 👤 │  or    │ RK │  ← Initials if no image
│    │        │    │
└────┘        └────┘
```

### 11.7 ThemeToggle
```
Light Mode: [☀️ ──── 🌙]  ← Sun side active
Dark Mode:  [☀️ ──── 🌙]  ← Moon side active
```

### 11.8 PermissionGate
```
// Component-level permission control
<PermissionGate module="users" action="create">
  <button>+ Add User</button>  ← Only renders if user has permission
</PermissionGate>
```

### 11.9 AccessDenied
```
┌──────────────────────────────────────┐
│                                      │
│           🔒 Access Denied            │
│                                      │
│  You don't have permission to        │
│  view this page.                     │
│                                      │
│        [Go to Dashboard]            │
│                                      │
└──────────────────────────────────────┘
```

### 11.10 PageHeader
```
┌──────────────────────────────────────────────────────────────┐
│  📋 Page Title                                 [Action Button]│
│  Optional description text                                    │
└──────────────────────────────────────────────────────────────┘
```

### 11.11 Import Excel Modal
```
┌──────────────────────────────────────┐
│  Import Employees from Excel        │
│                                      │
│  Step 1: Upload File                 │
│  ┌──────────────────────────────┐   │
│  │                              │   │
│  │   📂 Drop .xlsx/.csv here    │   │
│  │   or click to browse         │   │
│  │                              │   │
│  └──────────────────────────────┘   │
│                                      │
│  Step 2: Map Columns                 │
│  File Column → System Field          │
│  "Name"      → [Full Name ▼]        │
│  "Email"     → [Email ▼]            │
│  "Dept"      → [Department ▼]       │
│                                      │
│  Step 3: Preview & Import            │
│  5 records ready to import           │
│  0 errors found                      │
│                                      │
│         [Cancel]  [Import 5 Records] │
└──────────────────────────────────────┘
```

---

## Complete Page Inventory Summary

| Role | Page Count | Total Component Size |
|------|-----------|---------------------|
| **Public** | 3 pages (Landing, BookDemo, DynamicPage) | ~132 KB |
| **Auth** | 2 pages (Login, Signup) | ~19 KB |
| **SuperAdmin** | 13 pages | ~416 KB |
| **Admin** | 22 pages + 30 modal components | ~520 KB |
| **HR** | 14 pages | ~389 KB |
| **Manager** | 12 pages | ~347 KB |
| **Employee** | 12 pages | ~258 KB |
| **Candidate** | 10 pages | ~308 KB |
| **Shared** | 8 layout + 6 common + 3 UI + 16 landing | ~140 KB |
| **TOTAL** | **~96 pages + 30 modals** | **~2.5 MB** |

---

> **END OF WIREFRAME DOCUMENT**  
> This document provides wireframe specifications for every page, modal, drawer, and component in the HCM.ai platform.
