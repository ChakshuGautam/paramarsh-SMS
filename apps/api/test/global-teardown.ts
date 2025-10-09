/**
 * Global teardown for E2E tests
 * Stops the PostgreSQL testcontainer
 */

export default async function globalTeardown() {
  console.log('🧹 Cleaning up E2E test environment...');

  try {
    const containerInfo = (global as any).__TESTCONTAINER__;

    if (containerInfo && containerInfo.container) {
      await containerInfo.container.stop();
      console.log('✅ PostgreSQL testcontainer stopped');
    }
  } catch (error) {
    console.error('⚠️ Error during E2E cleanup:', error);
    // Don't throw - cleanup errors shouldn't fail tests
  }
}
