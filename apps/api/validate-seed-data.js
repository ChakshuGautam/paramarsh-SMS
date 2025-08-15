#!/usr/bin/env node

const BASE_URL = 'http://localhost:8080/api/v1';
const BRANCH_ID = 'branch1';

const headers = {
  'Content-Type': 'application/json',
  'X-Branch-Id': BRANCH_ID
};

async function makeRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers,
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error.message);
    return null;
  }
}

async function validateSeedData() {
  console.log('🌱 Validating Seed Data for Paramarsh SMS API');
  console.log('='.repeat(50));
  
  const results = {
    success: [],
    warnings: [],
    errors: []
  };

  // Core Academic Entities
  console.log('\n📚 Core Academic Entities:');
  const endpoints = [
    { name: 'Classes', endpoint: '/classes', expectedMin: 10 },
    { name: 'Sections', endpoint: '/sections', expectedMin: 20 },
    { name: 'Students', endpoint: '/students', expectedMin: 50 },
    { name: 'Guardians', endpoint: '/guardians', expectedMin: 10 },
  ];

  for (const { name, endpoint, expectedMin } of endpoints) {
    const data = await makeRequest(endpoint);
    if (data) {
      const count = data.data?.length || data.length || 0;
      const total = data.total || count;
      
      if (count >= expectedMin) {
        console.log(`  ✅ ${name}: ${count} records (Total: ${total})`);
        results.success.push(`${name}: ${count} records`);
      } else {
        console.log(`  ⚠️  ${name}: ${count} records (Expected: ≥${expectedMin})`);
        results.warnings.push(`${name}: Only ${count} records, expected ≥${expectedMin}`);
      }
    } else {
      console.log(`  ❌ ${name}: Failed to fetch`);
      results.errors.push(`${name}: API request failed`);
    }
  }

  // Staff and HR
  console.log('\n👨‍💼 Staff and HR:');
  const hrEndpoints = [
    { name: 'Teachers', endpoint: '/hr/teachers', expectedMin: 5 },
    { name: 'Staff', endpoint: '/hr/staff', expectedMin: 5 },
  ];

  for (const { name, endpoint, expectedMin } of hrEndpoints) {
    const data = await makeRequest(endpoint);
    if (data) {
      const count = data.data?.length || data.length || 0;
      
      if (count >= expectedMin) {
        console.log(`  ✅ ${name}: ${count} records`);
        results.success.push(`${name}: ${count} records`);
      } else {
        console.log(`  ⚠️  ${name}: ${count} records (Expected: ≥${expectedMin})`);
        results.warnings.push(`${name}: Only ${count} records, expected ≥${expectedMin}`);
      }
    } else {
      console.log(`  ❌ ${name}: Failed to fetch`);
      results.errors.push(`${name}: API request failed`);
    }
  }

  // Academic Operations
  console.log('\n📅 Academic Operations:');
  const academicEndpoints = [
    { name: 'Attendance Records', endpoint: '/attendance/records' },
    { name: 'Enrollments', endpoint: '/enrollments' },
    { name: 'Exams', endpoint: '/exams' },
    { name: 'Marks', endpoint: '/marks' },
  ];

  for (const { name, endpoint } of academicEndpoints) {
    const data = await makeRequest(endpoint);
    if (data) {
      const count = data.data?.length || data.length || 0;
      console.log(`  ✅ ${name}: ${count} records`);
      results.success.push(`${name}: ${count} records`);
    } else {
      console.log(`  ❌ ${name}: Failed to fetch`);
      results.errors.push(`${name}: API request failed`);
    }
  }

  // Financial
  console.log('\n💰 Financial:');
  const financeEndpoints = [
    { name: 'Fee Structures', endpoint: '/fees/structures' },
    { name: 'Fee Schedules', endpoint: '/fees/schedules' },
    { name: 'Invoices', endpoint: '/fees/invoices' },
    { name: 'Payments', endpoint: '/fees/payments' },
  ];

  for (const { name, endpoint } of financeEndpoints) {
    const data = await makeRequest(endpoint);
    if (data) {
      const count = data.data?.length || data.length || 0;
      console.log(`  ✅ ${name}: ${count} records`);
      results.success.push(`${name}: ${count} records`);
    } else {
      console.log(`  ❌ ${name}: Failed to fetch`);
      results.errors.push(`${name}: API request failed`);
    }
  }

  // Communications
  console.log('\n📧 Communications:');
  const commEndpoints = [
    { name: 'Templates', endpoint: '/comms/templates' },
    { name: 'Campaigns', endpoint: '/comms/campaigns' },
    { name: 'Messages', endpoint: '/comms/messages' },
    { name: 'Support Tickets', endpoint: '/helpdesk/tickets' },
  ];

  for (const { name, endpoint } of commEndpoints) {
    const data = await makeRequest(endpoint);
    if (data) {
      const count = data.data?.length || data.length || 0;
      console.log(`  ✅ ${name}: ${count} records`);
      results.success.push(`${name}: ${count} records`);
    } else {
      console.log(`  ❌ ${name}: Failed to fetch`);
      results.errors.push(`${name}: API request failed`);
    }
  }

  // Test Timetable Functionality
  console.log('\n🗓️  Timetable Operations:');
  const sections = await makeRequest('/sections');
  if (sections && sections.data && sections.data.length > 0) {
    const sectionId = sections.data[0].id;
    const gridData = await makeRequest(`/timetable/grid/${sectionId}`);
    
    if (gridData && gridData.section) {
      console.log(`  ✅ Timetable Grid: Working for section "${gridData.section.className}-${gridData.section.name}"`);
      results.success.push('Timetable Grid: Functional');
      
      // Test conflict detection
      const teachers = await makeRequest('/hr/teachers');
      if (teachers && teachers.data && teachers.data.length > 0) {
        const teacherId = teachers.data[0].id;
        const conflictCheck = await makeRequest('/timetable/check-conflicts', 'POST', {
          teacherId: teacherId,
          timeSlotId: 'test-slot-id'
        });
        
        if (conflictCheck) {
          console.log(`  ✅ Conflict Detection: Working`);
          results.success.push('Conflict Detection: Functional');
        }
      }
    } else {
      console.log(`  ❌ Timetable Grid: Failed to load`);
      results.errors.push('Timetable Grid: API failed');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 SUMMARY:');
  console.log(`✅ Successful: ${results.success.length}`);
  console.log(`⚠️  Warnings: ${results.warnings.length}`);
  console.log(`❌ Errors: ${results.errors.length}`);

  if (results.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    results.warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  if (results.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  console.log('\n🎯 RECOMMENDATIONS:');
  if (results.warnings.length > 0 || results.errors.length > 0) {
    console.log('  - Run seed data generation to ensure complete test dataset');
    console.log('  - Check API endpoints that are failing');
    console.log('  - Verify database connections and permissions');
  } else {
    console.log('  - Seed data validation successful!');
    console.log('  - All core APIs are functional and contain data');
    console.log('  - System ready for e2e testing and development');
  }

  return results.errors.length === 0 && results.warnings.length < 3;
}

// Export for use in tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateSeedData };
}

// Run if called directly
if (require.main === module) {
  validateSeedData()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(error => {
      console.error('Validation failed:', error);
      process.exit(1);
    });
}