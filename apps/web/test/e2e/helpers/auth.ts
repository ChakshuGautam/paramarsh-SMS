import { Page } from '@playwright/test';

/**
 * Simple authentication helper with hardcoded credentials
 * Just fills the form and clicks submit - one button click
 */
export async function loginAsAdmin(page: Page) {
  // Always go to sign-in page first to ensure clean state
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
  await page.goto(`${baseUrl}/sign-in`);
  
  // Wait for the form to be ready
  await page.waitForSelector('form', { timeout: 10000 });

  // Hardcoded admin credentials from the login page
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'P@ramarsh#Admin2024$Secure';

  // The form pre-fills school and branch in dev mode, but let's make sure they're selected
  // Select DPS school if not already selected
  const schoolSelect = page.locator('button[role="combobox"]').first();
  const schoolValue = await schoolSelect.textContent();
  if (!schoolValue?.includes('Delhi Public School')) {
    await schoolSelect.click();
    await page.locator('text="Delhi Public School"').click();
    await page.waitForTimeout(500);
  }

  // Select Main Campus branch if not already selected
  const branchSelect = page.locator('button[role="combobox"]').nth(1);
  const branchValue = await branchSelect.textContent();
  if (!branchValue?.includes('Main Campus')) {
    await branchSelect.click();
    await page.locator('text="Main Campus"').click();
    await page.waitForTimeout(500);
  }

  // Fill the username field
  const usernameInput = page.locator('input#username, input[placeholder*="username" i]').first();
  await usernameInput.fill(ADMIN_USERNAME);

  // Fill the password field
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password" i], input[placeholder*="Password" i]').first();
  await passwordInput.fill(ADMIN_PASSWORD);

  // Click the submit button
  const submitButton = page.locator('button[type="submit"], button:has-text("Sign in"), button:has-text("Sign In"), button:has-text("Login")').first();
  await submitButton.click();

  // Wait for navigation to admin
  await page.waitForURL('**/admin**', { timeout: 10000 });
  
  // Wait a bit for the page to stabilize
  await page.waitForTimeout(2000);
}

/**
 * Quick check if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  return currentUrl.includes('/admin') && !currentUrl.includes('sign-in');
}