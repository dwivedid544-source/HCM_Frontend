const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}

const features = walk('src/features');
features.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let modified = false;
  if (c.includes('"../../components')) {
    c = c.replace(/"\.\.\/\.\.\/components/g, '"../../shared/components');
    modified = true;
  }
  if (c.includes("'../../components")) {
    c = c.replace(/'\.\.\/\.\.\/components/g, "'../../shared/components");
    modified = true;
  }
  if (modified) fs.writeFileSync(f, c);
});

if (fs.existsSync('src/shared')) {
  const shared = walk('src/shared');
  shared.forEach(f => {
    let c = fs.readFileSync(f, 'utf8');
    let modified = false;
    ['hooks', 'context', 'utils', 'data'].forEach(dir => {
      if (c.includes(`"../../${dir}`)) {
        c = c.replace(new RegExp(`"\\.\\.\\/\\.\\.\\/${dir}`, 'g'), `"../../../${dir}`);
        modified = true;
      }
      if (c.includes(`'../../${dir}`)) {
        c = c.replace(new RegExp(`'\\.\\.\\/\\.\\.\\/${dir}`, 'g'), `'../../../${dir}`);
        modified = true;
      }
    });
    if (modified) fs.writeFileSync(f, c);
  });
}

console.log('Imports fixed.');
