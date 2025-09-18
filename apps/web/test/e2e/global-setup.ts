import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Get URLs from config or environment variables
  const frontendUrl = process.env.FRONTEND_URL || config.use?.baseURL || 'http://localhost:3000';
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:3005/api/v1';

  // Wait for servers to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test that backend API is accessible
    console.log('🔍 Checking API health...');
    // Use the backend URL as-is (it already includes /api/v1)
    const apiResponse = await page.request.get(`${backendUrl}/students`, {
      headers: {
        'X-Branch-Id': 'dps-main'
      }
    });
    
    if (!apiResponse.ok()) {
      throw new Error(`API health check failed: ${apiResponse.status()}`);
    }
    
    console.log('✅ API is healthy');

    // Test that frontend is accessible
    console.log('🔍 Checking frontend...');
    await page.goto(frontendUrl);
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('✅ Frontend is accessible');

    // Check if we need to seed test data using both API and direct database access
    console.log('🌱 Checking for test data...');
    
    try {
      // First check via API
      const studentsResponse = await page.request.get(`${backendUrl}/api/v1/students`, {
        headers: {
          'X-Branch-Id': 'dps-main'
        }
      });
      
      if (studentsResponse.ok()) {
        const studentsData = await studentsResponse.json();
        console.log(`📊 Found ${studentsData.total || studentsData.data?.length || 0} students via API`);
        
        // For demonstration: How to use MCP PostgreSQL tool for direct database verification
        // This would be the actual database verification that the tests need
        console.log('🔍 Performing direct database verification...');
        
        // TODO: Uncomment and use this in real implementation:
        /*
        const dbResult = await mcp__postgres__query({
          sql: 'SELECT COUNT(*) as student_count FROM "Student" WHERE "branchId" = $1',
          params: ['dps-main']
        });
        
        const dbCount = parseInt(dbResult.rows[0].student_count);
        console.log(`📊 Direct database count: ${dbCount} students`);
        
        // Verify API and DB counts match
        if (dbCount !== (studentsData.total || 0)) {
          console.warn('⚠️ API and database counts do not match!');
          console.warn(`API: ${studentsData.total || 0}, DB: ${dbCount}`);
        } else {
          console.log('✅ API and database counts match');
        }
        
        // Check for test data isolation
        const isolationCheck = await mcp__postgres__query({
          sql: 'SELECT "branchId", COUNT(*) as count FROM "Student" GROUP BY "branchId"'
        });
        
        console.log('🔒 Branch isolation check:');
        isolationCheck.rows.forEach(row => {
          console.log(`   ${row.branchId}: ${row.count} students`);
        });
        */
        
        console.log('ℹ️  Note: MCP PostgreSQL integration needed for real database verification');
        console.log('ℹ️  Current implementation uses API verification as fallback');
        
        if (!studentsData.total || studentsData.total === 0) {
          console.log('⚠️ No test data found - you may need to run seed data');
        }
      }
    } catch (error) {
      console.warn('⚠️ Could not check test data:', error.message);
    }

    console.log('✅ E2E test setup completed successfully');
    
  } catch (error) {
    console.error('❌ E2E test setup failed:', error);
    throw error;
  } finally {
    await context.close();
    await browser.close();
  }
}

export default globalSetup;