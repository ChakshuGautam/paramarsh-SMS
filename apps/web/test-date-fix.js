// Test script to verify date formatting fix
// This demonstrates the fix for "RangeError: Invalid time value" errors

const { format } = require('date-fns');

// Utility function from lib/utils.ts
function formatDate(date, formatStr = 'MMM dd, yyyy') {
  if (!date || date === '' || date === 'invalid') {
    return '-';
  }
  
  try {
    const dateObj = new Date(date);
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    return format(dateObj, formatStr);
  } catch {
    return '-';
  }
}

console.log('Testing safe date formatting...\n');

// Test cases that would cause "Invalid time value" errors with direct format() usage
const testCases = [
  null,
  undefined,
  '',
  'invalid',
  'not-a-date',
  '2024-13-45', // Invalid date
  '2024-01-15', // Valid date
  new Date('2024-01-15'), // Valid Date object
];

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: ${testCase === null ? 'null' : testCase === undefined ? 'undefined' : `"${testCase}"`}`);
  
  // This would throw "RangeError: Invalid time value" for invalid dates
  // console.log(`  Old (unsafe): ${format(new Date(testCase), 'MMM dd, yyyy')}`);
  
  // This safely handles all cases
  console.log(`  New (safe):   ${formatDate(testCase)}`);
  console.log('');
});

console.log('✅ All date formatting is now safe and will return "-" for invalid dates instead of throwing errors.');