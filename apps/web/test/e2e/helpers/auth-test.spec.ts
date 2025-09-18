import { test, expect } from '@playwright/test';
import { AuthHelper } from './page-objects';

/**
 * Authentication Debug Test
 * This test helps identify why authentication keeps failing
 */
test.describe('Authentication Debug', () => {
  test('verify authentication process step by step', async ({ page }) => {
    console.log('🔍 Starting authentication debug test...');
    
    // Step 1: Check frontend is accessible
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    console.log(`📍 Frontend URL: ${frontendUrl}`);
    
    const response = await page.goto(frontendUrl);
    expect(response?.status()).toBeLessThan(400);
    console.log('✅ Frontend is accessible');
    
    // Step 2: Navigate to sign-in
    await page.goto(`${frontendUrl}/sign-in`);
    await page.waitForLoadState('networkidle');
    console.log('✅ Sign-in page loaded');
    
    // Step 3: Check if form exists
    const formExists = await page.locator('form').isVisible();
    expect(formExists).toBeTruthy();
    console.log('✅ Sign-in form found');
    
    // Step 4: Check for Clerk iframe
    const clerkFrame = page.frameLocator('iframe[title*="Clerk"]');
    const hasClerkFrame = await clerkFrame.locator('body').count() > 0;
    console.log(`📊 Clerk iframe present: ${hasClerkFrame}`);
    
    // Step 5: Try authentication with AuthHelper
    console.log('🔐 Attempting login with AuthHelper...');
    const authHelper = new AuthHelper(page);
    
    try {
      await authHelper.login('admin', 'P@ramarsh#Admin2024$Secure');
      console.log('✅ AuthHelper login succeeded');
      
      // Verify we're in admin
      await page.waitForURL('**/admin**', { timeout: 10000 });
      console.log('✅ Successfully navigated to admin dashboard');
      
    } catch (error) {
      console.error('❌ AuthHelper login failed:', error);
      
      // Take screenshot for debugging
      await page.screenshot({ path: 'auth-debug-failure.png' });
      console.log('📸 Screenshot saved to auth-debug-failure.png');
      
      // Log current URL
      console.log(`📍 Current URL: ${page.url()}`);
      
      // Check for error messages
      const errorMessages = await page.locator('.cl-formFieldError, [role="alert"]').allTextContents();
      if (errorMessages.length > 0) {
        console.log('⚠️ Error messages found:', errorMessages);
      }
      
      throw error;
    }
  });
  
  test('verify credentials directly', async ({ page }) => {
    console.log('🔑 Testing credentials directly...');
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    await page.goto(`${frontendUrl}/sign-in`);
    
    // Wait for form
    await page.waitForSelector('form', { timeout: 10000 });
    
    // Fill username
    await page.fill('input[name="username"]', 'admin');
    console.log('✅ Username filled');
    
    // Fill password
    await page.fill('input[name="password"]', 'P@ramarsh#Admin2024$Secure');
    console.log('✅ Password filled');
    
    // Submit form
    await page.click('button[type="submit"]');
    console.log('✅ Form submitted');
    
    // Wait for navigation
    try {
      await page.waitForURL('**/admin**', { timeout: 15000 });
      console.log('✅ Successfully logged in!');
    } catch (error) {
      console.error('❌ Login failed');
      console.log(`📍 Current URL: ${page.url()}`);
      
      // Check for errors
      const errors = await page.locator('[role="alert"], .error').allTextContents();
      console.log('⚠️ Errors:', errors);
      
      throw error;
    }
  });
});