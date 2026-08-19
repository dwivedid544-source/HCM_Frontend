const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const filesToProcess = [
  'features/superadmin/SuperAdminProfile.jsx',
  'features/admin/AdminProfile.jsx',
  'features/hr/HRProfile.jsx',
  'features/manager/ManagerProfile.jsx',
  'shared/components/admin/UserModal.jsx',
  'shared/components/admin/TaxRulesModal.jsx',
  'shared/components/admin/HolidayModal.jsx',
  'shared/components/admin/ComplianceModal.jsx',
  'features/admin/components/UserModal.jsx',
  'features/admin/components/TaxRulesModal.jsx',
  'features/admin/components/HolidayModal.jsx',
  'features/admin/components/ComplianceModal.jsx',
  'features/manager/TeamMembers.jsx',
  'features/manager/Tasks.jsx',
  'features/manager/LeaveApproval.jsx',
  'features/manager/KPITracking.jsx',
  'features/manager/AttendanceReview.jsx',
  'features/manager/ManagerDashboard.jsx',
  'features/hr/Onboarding.jsx',
  'features/hr/OfferManagement.jsx',
  'features/hr/InterviewManagement.jsx',
  'features/employee/EmployeePayroll.jsx',
  'features/employee/EmployeeLeave.jsx',
  'features/employee/EmployeeDashboard.jsx',
  'features/employee/EmployeeBenefits.jsx',
  'features/BookDemo.jsx',
  'features/superadmin/AttendanceCenter.jsx'
];

filesToProcess.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipped (not found): ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Replace <input type="date" with <DatePicker
  // Make sure we only do it if the file actually has <input type="date"
  if (content.includes('type="date"')) {
    content = content.replace(/<input\s+([^>]*?)type="date"/g, '<DatePicker $1');
    content = content.replace(/<input\s+type="date"\s+/g, '<DatePicker ');
    
    // Some inputs might have `type="date"` at the end, let's just do a generic replace
    // Better regex:
    content = content.replace(/<input([^>]+)type="date"([^>]*)>/g, '<DatePicker$1$2/>');
    
    // Add import if not present
    if (!content.includes('DatePicker')) {
       // but we just added DatePicker tags! So it will include it.
       // Let's check if the import exists.
    }
    if (!content.includes('import DatePicker')) {
      // Find relative depth to 'src'
      const depth = file.split('/').length - 1;
      const relativePath = depth === 0 ? './' : '../'.repeat(depth);
      const importStmt = `import DatePicker from '${relativePath}shared/components/common/DatePicker';\n`;
      
      // Insert after the last import
      const lastImportIndex = content.lastIndexOf('import ');
      if (lastImportIndex !== -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.slice(0, endOfLine + 1) + importStmt + content.slice(endOfLine + 1);
      } else {
        content = importStmt + content;
      }
    }
    
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${file}`);
  }
});
