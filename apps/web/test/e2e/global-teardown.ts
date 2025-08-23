import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('🧹 Starting E2E test teardown...');

  try {
    // Clean up any test data if needed
    console.log('🗑️ Cleaning up test data...');
    
    // You could add cleanup logic here, such as:
    // - Resetting test database
    // - Clearing uploaded files
    // - Cleaning up temporary data
    
    console.log('✅ E2E test teardown completed successfully');
    
  } catch (error) {
    console.error('❌ E2E test teardown failed:', error);
    // Don't throw here - we don't want teardown failures to fail the tests
  }
}

export default globalTeardown;