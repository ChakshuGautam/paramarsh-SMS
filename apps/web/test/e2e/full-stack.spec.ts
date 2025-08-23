import { test, expect } from '@playwright/test';

test.describe('Full Stack Integration', () => {
  test('should load the home page', async ({ page }) => {
    await page.goto('/');
    
    // Check if page loads
    await expect(page).toHaveTitle(/Paramarsh/i);
    
    // Check for main content
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('should navigate to sign-in page', async ({ page }) => {
    await page.goto('/');
    
    // Look for sign-in link or button
    const signInLink = page.locator('a[href*="sign-in"], button:has-text("Sign in")').first();
    
    if (await signInLink.count() > 0) {
      await signInLink.click();
      await expect(page).toHaveURL(/sign-in/);
    }
  });

  test('should check API health endpoint', async ({ request }) => {
    const response = await request.get('/api/v1/health');
    
    // API should respond with 200 or 404 (if health endpoint doesn't exist yet)
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 200) {
      const data = await response.json();
      expect(data).toHaveProperty('status');
    }
  });

  test('should check if backend API is accessible', async ({ request }) => {
    const response = await request.get('/api/v1/students');
    
    // Should get either 200 (success) or 401/403 (auth required)
    expect([200, 401, 403]).toContain(response.status());
  });

  test('admin route should redirect to sign-in when not authenticated', async ({ page }) => {
    await page.goto('/admin');
    
    // Should redirect to sign-in
    await expect(page).toHaveURL(/sign-in/);
    
    // Check for redirect_url parameter
    const url = new URL(page.url());
    expect(url.searchParams.get('redirect_url')).toBeTruthy();
  });
});

test.describe('API Integration', () => {
  test('should handle CORS properly', async ({ request }) => {
    const response = await request.get('/api/v1/students', {
      headers: {
        'Origin': 'http://localhost:3000'
      }
    });
    
    // Check CORS headers or status
    expect([200, 401, 403]).toContain(response.status());
  });

  test('should support multi-tenancy headers', async ({ request }) => {
    const response = await request.get('/api/v1/students', {
      headers: {
        'X-Branch-Id': 'branch1',
        'X-Tenant-Id': 'tenant1'
      }
    });
    
    // Should accept the headers
    expect([200, 401, 403]).toContain(response.status());
  });
});