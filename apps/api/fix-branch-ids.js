const fs = require('fs');
const path = require('path');

// Get all .e2e-spec.ts files
const testDir = './test';
const files = fs.readdirSync(testDir).filter(file => file.endsWith('.e2e-spec.ts'));

files.forEach(filename => {
  const filePath = path.join(testDir, filename);
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Fix branch IDs
  content = content.replace(/\.set\('X-Branch-Id',\s*'branch1'\)/g, ".set('X-Branch-Id', 'dps-main')");
  content = content.replace(/\.set\('X-Branch-Id',\s*'branch2'\)/g, ".set('X-Branch-Id', 'dps-north')");
  
  // Fix expect statements
  content = content.replace(/\.toBe\('branch1'\)/g, ".toBe('dps-main')");
  content = content.replace(/\.toBe\('branch2'\)/g, ".toBe('dps-north')");
  content = content.replace(/toHaveProperty\('branchId',\s*'branch1'\)/g, "toHaveProperty('branchId', 'dps-main')");
  content = content.replace(/toHaveProperty\('branchId',\s*'branch2'\)/g, "toHaveProperty('branchId', 'dps-north')");
  
  // Fix pagination parameter
  content = content.replace(/[?&]perPage=/g, '&pageSize=');
  content = content.replace(/\?perPage=/g, '?pageSize=');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filename}`);
});

console.log('All test files fixed!');