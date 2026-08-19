const fs = require('fs');
const path = require('path');

const srcPath = path.join('f:/HCM/hcm-frontend/src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx') || file.endsWith('.js')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(srcPath);
let modifiedCount = 0;

files.forEach(file => {
  if (file.includes('useCurrency.jsx') || file.includes('currencyHelper.js')) return;

  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('currencyHelper')) {
    let relativePathToHooks = path.relative(path.dirname(file), path.join(srcPath, 'hooks', 'useCurrency'));
    relativePathToHooks = relativePathToHooks.replace(/\\/g, '/');
    if (!relativePathToHooks.startsWith('.')) relativePathToHooks = './' + relativePathToHooks;

    // Remove old import
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+['"].*?currencyHelper['"];?/g, (match, p1) => {
      return `import { useCurrency } from '${relativePathToHooks}';`;
    });

    const hookInject = '\n  const { formatCurrency, getSymbol, getIcon, masterCurrency } = useCurrency();\n';
    
    // Simple heuristic to inject hook at start of component
    content = content.replace(/(const\s+\w+\s*=\s*(?:async\s*)?(?:\([^)]*\)|[^\s=]+)\s*=>\s*\{)/, `$1` + hookInject);
    content = content.replace(/(function\s+\w+\s*\([^)]*\)\s*\{)/, `$1` + hookInject);

    content = content.replace(/getCurrencySymbol/g, 'getSymbol');
    content = content.replace(/getCurrencyIcon/g, 'getIcon');
    
    fs.writeFileSync(file, content, 'utf8');
    modifiedCount++;
  }
});

console.log('Modified ' + modifiedCount + ' files.');
