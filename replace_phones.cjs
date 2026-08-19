const fs = require("fs");
const path = require("path");

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith(".js") || dirFile.endsWith(".jsx")) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
};

const files = walkSync("f:\\HCM\\hcm-frontend\\src");

let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, "utf8");
  const originalContent = content;

  // 1. Specific static display values +1 (800) 555-0199 -> 9800000199
  content = content.replace(/\+1\s*\(?800\)?\s*555-0199/g, "9800000199");
  content = content.replace(/tel:\+18005550199/g, "tel:9800000199");

  // 2. Fallbacks: || "+1 555-0123" -> || ""
  content = content.replace(/\|\|\s*['"]\+1\s*\(?555\)?[-\s\.\d\(\)]*['"]/g, "|| ''");

  // 3. Placeholders: placeholder="+1 555-0000" -> placeholder="e.g. 9876543210"
  content = content.replace(/placeholder\s*=\s*['"](e\.g\.\s*)?\+1\s*\(?555\)?[-\s\.\d\(\)]*['"]/gi, 'placeholder="e.g. 9876543210"');

  // 4. Hardcoded seed data: "+1 (555) 234-5678" -> "9876543210"
  content = content.replace(/['"]\+1\s*\(?555\)?[-\s\.\d\(\)]*['"]/g, "'9876543210'");

  // Fix the empty string fallback quotes if they became invalid
  content = content.replace(/\|\|\s*''/g, "|| ''"); 

  if (content !== originalContent) {
    fs.writeFileSync(file, content, "utf8");
    changedFiles++;
    console.log("Updated: " + file);
  }
});

console.log("Total files updated: " + changedFiles);
