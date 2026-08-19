const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function getAllFiles(dirPath, arrayOfFiles) {
  files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

const allFiles = getAllFiles(srcDir);

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  // Replace pages/ with features/ in import paths
  const newContent1 = content.replace(/(['"])((\.\.\/)+|\.\/)pages\//g, '$1$2features/');
  if (newContent1 !== content) { content = newContent1; changed = true; }

  // Replace components/admin/ with features/admin/components/
  const newContent2 = content.replace(/(['"])((\.\.\/)+|\.\/)components\/admin\//g, '$1$2features/admin/components/');
  if (newContent2 !== content) { content = newContent2; changed = true; }

  // Replace components/layout/ with shared/components/layout/
  const newContent3 = content.replace(/(['"])((\.\.\/)+|\.\/)components\/layout\//g, '$1$2shared/components/layout/');
  if (newContent3 !== content) { content = newContent3; changed = true; }

  // Replace components/ui/ with shared/components/ui/
  const newContent4 = content.replace(/(['"])((\.\.\/)+|\.\/)components\/ui\//g, '$1$2shared/components/ui/');
  if (newContent4 !== content) { content = newContent4; changed = true; }

  // Replace components/common/ with shared/components/common/
  const newContent5 = content.replace(/(['"])((\.\.\/)+|\.\/)components\/common\//g, '$1$2shared/components/common/');
  if (newContent5 !== content) { content = newContent5; changed = true; }

  // Specific fix for App.jsx routes which do absolute-style or ./pages
  if (file.endsWith('App.jsx')) {
    const appContent = content.replace(/from\s+['"]\.\/pages\//g, 'from \'./features/');
    if (appContent !== content) { content = appContent; changed = true; }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated imports in ${file.replace(__dirname, '')}`);
  }
});
console.log('Import migration complete.');
