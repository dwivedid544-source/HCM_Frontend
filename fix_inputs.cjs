const fs = require('fs');

const filesToFix = [
  "f:\\HCM\\hcm-frontend\\src\\shared\\components\\admin\\UserModal.jsx",
  "f:\\HCM\\hcm-frontend\\src\\pages\\employee\\EmployeeLeave.jsx",
  "f:\\HCM\\hcm-frontend\\src\\pages\\employee\\EmployeeDashboard.jsx",
  "f:\\HCM\\hcm-frontend\\src\\pages\\candidate\\ApplicationForm.jsx",
  "f:\\HCM\\hcm-frontend\\src\\features\\LandingPage.jsx",
  "f:\\HCM\\hcm-frontend\\src\\features\\candidate\\ApplicationForm.jsx",
  "f:\\HCM\\hcm-frontend\\src\\features\\employee\\EmployeeLeave.jsx",
  "f:\\HCM\\hcm-frontend\\src\\features\\candidate\\BrowseJobs.jsx",
  "f:\\HCM\\hcm-frontend\\src\\features\\employee\\EmployeeDashboard.jsx",
  "f:\\HCM\\hcm-frontend\\src\\features\\admin\\components\\UserModal.jsx",
  "f:\\HCM\\hcm-frontend\\src\\context\\AdminContext.jsx"
];

for (const file of filesToFix) {
  if (!fs.existsSync(file)) continue;
  let content = fs.readFileSync(file, 'utf8');

  // Fix AdminContext 555 numbers
  if (file.includes('AdminContext.jsx')) {
    content = content.replace(/'5550101001'/g, "'9876543210'");
    content = content.replace(/'5550101002'/g, "'9876543211'");
    content = content.replace(/'5550101003'/g, "'9876543212'");
    content = content.replace(/'5550101004'/g, "'9876543213'");
    content = content.replace(/'5550101005'/g, "'9876543214'");
  }

  // 1. simple `onChange={e => setFormData({...formData, phone: e.target.value})}` -> add validation and maxLength
  content = content.replace(
    /onChange=\{e\s*=>\s*setFormData\(\{\s*\.\.\.formData,\s*phone:\s*e\.target\.value\s*\}\)\}/g,
    "maxLength={10} onChange={e => setFormData({...formData, phone: e.target.value.replace(/\\D/g, '').slice(0, 10)})}"
  );

  // 2. Add maxLength={10} to <input ... type="tel" or name="phone" or name="emergency"
  // For inputs that use a generic `handleChange` or similar, we inject an onChange or update it.
  // E.g., UserModal uses `onChange={handleChange}` or similar. 
  // Let's do a generic replace:
  content = content.replace(
    /<input([^>]*(?:type="tel"|name="phone"|name="emergency")[^>]*)onChange=\{handleChange\}/g,
    "<input$1maxLength={10} onChange={(e) => { e.target.value = e.target.value.replace(/\\D/g, '').slice(0, 10); handleChange(e); }}"
  );

  // For EmployeeLeave and EmployeeDashboard: name="emergency" doesn't have an onChange, it's inside a form.
  // Add maxLength={10} and an inline onChange
  content = content.replace(
    /<input\s+name="emergency"\s+type="text"\s+required([^>]*)\/>/g,
    "<input name=\"emergency\" type=\"tel\" maxLength={10} required$1 onChange={(e) => e.target.value = e.target.value.replace(/\\D/g, '').slice(0, 10)} />"
  );
  
  // Also LandingPage type="tel"
  // <input type="tel" id="phone" name="phone"
  content = content.replace(
    /type="tel"\s+id="phone"\s+name="phone"\s+required([^>]*)onChange=\{\(e\)\s*=>\s*setDemoForm\(\{([^}]+)phone:\s*e\.target\.value\s*\}\)\}/g,
    "type=\"tel\" id=\"phone\" name=\"phone\" maxLength={10} required$1onChange={(e) => setDemoForm({$2phone: e.target.value.replace(/\\D/g, '').slice(0, 10)})}"
  );

  // features/candidate/BrowseJobs.jsx
  // name="phone" type="tel" onChange={handleFormChange}
  content = content.replace(
    /name="phone"\s*type="tel"\s*required([^>]*)onChange=\{handleFormChange\}/g,
    "name=\"phone\" type=\"tel\" maxLength={10} required$1onChange={(e) => { e.target.value = e.target.value.replace(/\\D/g, '').slice(0, 10); handleFormChange(e); }}"
  );

  fs.writeFileSync(file, content, 'utf8');
  console.log(`Updated: ${file}`);
}
