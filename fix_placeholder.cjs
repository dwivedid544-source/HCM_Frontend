
const fs = require("fs");
const file = "f:\\HCM\\hcm-frontend\\src\\features\\admin\\components\\UserModal.jsx";
let content = fs.readFileSync(file, "utf8");
content = content.replace(/placeholder="\+1 234 567 890"/g, "placeholder=\"e.g. 9876543210\"");
fs.writeFileSync(file, content, "utf8");
console.log("Fixed placeholder in UserModal");

