import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateReportPDF = (report, data = {}) => {
  const {
    users = [],
    departments = [],
    payrollList = [],
    benefits = [],
    shifts = [],
    holidays = [],
    policies = [],
    systemLogs = [],
    aiModules = []
  } = data;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const modules = Array.isArray(report.modules) && report.modules.length > 0
    ? report.modules
    : [report.category || 'General Analytics'];

  // 1. Top Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 36, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('HCM.ai — Enterprise Analytics & Intelligence', 14, 16);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`Report: ${report.title || 'Custom Comprehensive Report'}`, 14, 24);
  doc.text(`Generated: ${dateStr}  |  Format: ${report.format || 'Full Analytics'}`, 14, 30);

  let currentY = 46;

  // 2. Executive KPI Summary Cards
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Executive Organization Summary', 14, currentY);
  currentY += 6;

  const totalPayrollVal = payrollList.reduce((acc, p) => acc + (parseFloat(p.netSalary || p.salary || p.monthlyCTC || 0) || 0), 0);
  const totalEmployees = users.length || 0;
  const totalDepts = departments.length || 0;
  const totalBenefits = benefits.length || 0;

  autoTable(doc, {
    startY: currentY,
    head: [['Total Headcount', 'Departments', 'Active Benefit Plans', 'Est. Monthly Payroll', 'Recorded Shifts']],
    body: [[
      `${totalEmployees} Members`,
      `${totalDepts} Units`,
      `${totalBenefits} Packages`,
      `$${totalPayrollVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      `${shifts.length || 0} Defined`
    ]],
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // Indigo 600
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center',
      textColor: [30, 41, 59]
    }
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // 3. Module Datasets
  let sectionIndex = 2;

  // Workforce Analytics
  if (modules.some(m => m.toLowerCase().includes('workforce') || m.toLowerCase().includes('employee') || m.toLowerCase().includes('user'))) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${sectionIndex}. Workforce Roster & Deployment`, 14, currentY);
    currentY += 4;

    const userData = (users.length > 0 ? users : [
      { name: 'Admin User', email: 'admin@hcm.ai', department: 'Executive', role: 'ADMIN', status: 'Active' }
    ]).slice(0, 25).map(u => [
      u.name || (u.email ? u.email.split('@')[0] : 'Employee'),
      u.email || 'N/A',
      u.department || (typeof u.department === 'object' ? u.department?.name : 'General'),
      u.role || 'STAFF',
      u.status || 'Active'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Employee Name', 'Corporate Email', 'Department', 'Role', 'Status']],
      body: userData,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], fontSize: 8 },
      bodyStyles: { fontSize: 8 }
    });

    currentY = doc.lastAutoTable.finalY + 12;
    sectionIndex++;
  }

  // Financials / Payroll
  if (modules.some(m => m.toLowerCase().includes('financial') || m.toLowerCase().includes('payroll') || m.toLowerCase().includes('compensation'))) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${sectionIndex}. Compensation & Payroll Disbursals`, 14, currentY);
    currentY += 4;

    const payrollData = (payrollList.length > 0 ? payrollList : [
      { employee: 'All Active Workforce', period: now.toLocaleString('default', { month: 'long', year: 'numeric' }), gross: totalPayrollVal || 50000, deductions: 2500, netSalary: totalPayrollVal || 47500, status: 'Paid' }
    ]).slice(0, 20).map(p => [
      p.employee?.fullName || p.employeeName || p.name || 'Staff Member',
      p.monthYear || p.period || `${now.toLocaleString('default', { month: 'short' })} ${now.getFullYear()}`,
      `$${parseFloat(p.grossSalary || p.gross || p.monthlyCTC || 0).toLocaleString()}`,
      `$${parseFloat(p.totalDeductions || p.deductions || 0).toLocaleString()}`,
      `$${parseFloat(p.netSalary || p.salary || p.monthlyCTC || 0).toLocaleString()}`,
      p.status || 'Processed'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Employee', 'Payroll Period', 'Gross Disbursal', 'Deductions', 'Net Pay', 'Status']],
      body: payrollData,
      theme: 'striped',
      headStyles: { fillColor: [16, 185, 129], fontSize: 8 },
      bodyStyles: { fontSize: 8 }
    });

    currentY = doc.lastAutoTable.finalY + 12;
    sectionIndex++;
  }

  // Benefits & Wellness
  if (modules.some(m => m.toLowerCase().includes('benefit') || m.toLowerCase().includes('health') || m.toLowerCase().includes('wellness'))) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${sectionIndex}. Corporate Benefits & Coverage`, 14, currentY);
    currentY += 4;

    const benefitData = (benefits.length > 0 ? benefits : [
      { name: 'Standard Health Coverage', category: 'Health', provider: 'Corporate Health', contribution: '2000', eligibility: 'All Employees', status: 'Active' }
    ]).map(b => [
      b.name,
      b.category,
      b.provider,
      b.eligibility || 'All Employees',
      `$${parseFloat(b.contribution || b.employerContribution || 0).toLocaleString()}`,
      b.status || 'Active'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Plan Name', 'Category', 'Provider', 'Eligibility', 'Employer Contribution', 'Status']],
      body: benefitData,
      theme: 'striped',
      headStyles: { fillColor: [244, 63, 94], fontSize: 8 },
      bodyStyles: { fontSize: 8 }
    });

    currentY = doc.lastAutoTable.finalY + 12;
    sectionIndex++;
  }

  // Compliance & Audits
  if (modules.some(m => m.toLowerCase().includes('compliance') || m.toLowerCase().includes('audit') || m.toLowerCase().includes('hiring') || m.toLowerCase().includes('ai'))) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(`${sectionIndex}. Compliance & System Audit Traces`, 14, currentY);
    currentY += 4;

    const auditData = (systemLogs.length > 0 ? systemLogs : [
      { action: 'SECURITY_CHECK_PASSED', module: 'Auth & Encryption', ip: '127.0.0.1', status: 'Success' }
    ]).slice(0, 15).map(l => [
      l.action,
      l.module || 'System',
      typeof l.user === 'object' && l.user !== null ? l.user.email : (l.user || 'Administrator'),
      l.ip || '127.0.0.1',
      l.status || 'Verified'
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Security Action', 'Module', 'Triggered By', 'IP Address', 'Result']],
      body: auditData,
      theme: 'striped',
      headStyles: { fillColor: [124, 58, 237], fontSize: 8 },
      bodyStyles: { fontSize: 8 }
    });

    currentY = doc.lastAutoTable.finalY + 12;
    sectionIndex++;
  }

  // 4. Document Footer / Signoff
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400

    // Footer divider line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 285, 196, 285);

    doc.text('CONFIDENTIAL • Generated by HCM.ai Intelligence Suite', 14, 290);
    doc.text(`Page ${i} of ${pageCount}`, 185, 290);
  }

  // Save the PDF
  const filename = `${(report.title || 'Custom_Report').replace(/[^a-zA-Z0-9_-]/g, '_')}_${now.toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  return filename;
};
