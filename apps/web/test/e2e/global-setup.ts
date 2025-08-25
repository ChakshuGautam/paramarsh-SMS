import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting E2E test setup...');

  // Wait for servers to be ready
  await new Promise(resolve => setTimeout(resolve, 5000));

  // Create a browser instance for setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Test that backend API is accessible
    console.log('🔍 Checking API health...');
    const apiResponse = await page.request.get('http://localhost:8080/health');
    
    if (!apiResponse.ok()) {
      throw new Error(`API health check failed: ${apiResponse.status()}`);
    }
    
    console.log('✅ API is healthy');

    // Test that frontend is accessible
    console.log('🔍 Checking frontend...');
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForSelector('body', { timeout: 10000 });
    
    console.log('✅ Frontend is accessible');

    // Check if we need to seed test data
    console.log('🌱 Checking for test data...');
    
    try {
      const studentsResponse = await page.request.get('http://localhost:8080/api/students', {
        headers: {
          'X-Branch-Id': 'branch1'
        }
      });
      
      if (studentsResponse.ok()) {
        const studentsData = await studentsResponse.json();
        console.log(`📊 Found ${studentsData.total || studentsData.data?.length || 0} students in test database`);
        
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