const fs = require('fs');
const path = require('path');

// Get all .e2e-spec.ts files
const testDir = './test';
const files = fs.readdirSync(testDir).filter(file => file.endsWith('.e2e-spec.ts'));

files.forEach(filename => {
  const filePath = path.join(testDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix regex patterns that were broken
  content = content.replace(/X-Branch-Id\'\.\*\'dps-main/g, "X-Branch-Id', 'dps-main");
  content = content.replace(/X-Branch-Id\'\.\*\'dps-north/g, "X-Branch-Id', 'dps-north");
  content = content.replace(/branchId\'\.\*\'dps-main/g, "branchId', 'dps-main");
  content = content.replace(/branchId\'\.\*\'dps-north/g, "branchId', 'dps-north");
  
  // Fix property assertion patterns
  content = content.replace(/branchId\'\.\*\'dps-main\'/g, "branchId', 'dps-main'");
  content = content.replace(/branchId\'\.\*\'dps-north\'/g, "branchId', 'dps-north'");
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed remaining issues in ${filename}`);
});

console.log('All remaining issues fixed!');