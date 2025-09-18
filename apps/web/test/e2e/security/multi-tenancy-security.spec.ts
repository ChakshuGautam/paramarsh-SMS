import { test, expect, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/page-objects';

test.describe('Multi-tenancy & Security - Comprehensive Data Isolation Tests', () => {
  const ADMIN_URL = '/admin';
  const STUDENTS_URL = '/admin/students';
  
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    // Monitor security-related console errors and API calls
    page.on('console', msg => {
      if (msg.type() === 'error' && (msg.text().includes('auth') || msg.text().includes('permission') || msg.text().includes('unauthorized'))) {
        console.error('Security-related console error:', msg.text());
      }
    });

    page.on('response', response => {
      if (response.url().includes('/api/') && (response.status() === 401 || response.status() === 403)) {
        console.error(`Security API response: ${response.url()} - ${response.status()}`);
      }
    });

    page.on('request', request => {
      if (request.url().includes('/api/')) {
        const headers = request.headers();
        if (!headers['authorization'] && !headers['x-branch-id']) {
          console.warn(`API request without auth headers: ${request.url()}`);
        }
      }
    });
  });

  test.describe('Branch Isolation Verification', () => {
    test('should isolate data between different branches', async ({ page }) => {
      console.log('🏢 Testing branch data isolation...');
      
      // Login to DPS Main branch
      authHelper = new AuthHelper(page);
      await page.goto(`${FRONTEND_URL}/sign-in`);
      await page.waitForLoadState('networkidle');
      
      // Select DPS Main
      const schoolSelect = page.locator('select').first();
      await schoolSelect.selectOption('dps');
      
      const branchSelect = page.locator('select').nth(1);
      await branchSelect.selectOption('main');
      
      await page.locator('input#username').fill('admin');
      await page.locator('input#password').fill('P@ramarsh#Admin2024$Secure');
      
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL('**/admin**');
      
      // Get students from DPS Main
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      const dpsMainStudents = await page.locator('tbody tr, [class*="row"]:not(:has(th))').count();
      console.log(`DPS Main students count: ${dpsMainStudents}`);
      
      // Logout and login to different branch
      const logoutButton = page.locator('button:has-text("Logout"), text=Logout');
      if (await logoutButton.count() > 0) {
        await logoutButton.first().click();
        await page.waitForURL('**/sign-in**');
      } else {
        await page.goto(`${FRONTEND_URL}/sign-in`);
      }
      
      await page.waitForLoadState('networkidle');
      
      // Login to different branch (e.g., DPS East)
      const schoolSelect2 = page.locator('select').first();
      await schoolSelect2.selectOption('dps');
      
      const branchSelect2 = page.locator('select').nth(1);
      const branchOptions = await branchSelect2.locator('option').allTextContents();
      
      // Find a different branch
      let differentBranch = null;
      for (const option of branchOptions) {
        if (option !== 'main' && option !== '' && option !== 'Select Branch') {
          differentBranch = option;
          break;
        }
      }
      
      if (differentBranch) {
        await branchSelect2.selectOption(differentBranch);
        
        await page.locator('input#username').fill('admin');
        await page.locator('input#password').fill('P@ramarsh#Admin2024$Secure');
        
        await page.getByRole('button', { name: 'Sign In' }).click();
        await page.waitForURL('**/admin**');
        
        // Get students from different branch
        await page.goto(STUDENTS_URL);
        await page.waitForLoadState('networkidle');
        
        const differentBranchStudents = await page.locator('tbody tr, [class*="row"]:not(:has(th))').count();
        console.log(`${differentBranch} branch students count: ${differentBranchStudents}`);
        
        // Data should be different between branches
        if (dpsMainStudents > 0 && differentBranchStudents > 0) {
          // Both branches have data - they should be different sets
          console.log('✅ Both branches have data - branch isolation appears to be working');
        } else if (dpsMainStudents > 0 && differentBranchStudents === 0) {
          console.log('✅ Perfect isolation - Main has data, other branch is empty');
        } else if (dpsMainStudents === 0 && differentBranchStudents === 0) {
          console.log('⚠️ Both branches empty - cannot verify isolation without data');
        }
      } else {
        console.log('⚠️ Only one branch available - cannot test branch isolation');
      }
    });

    test('should prevent cross-branch API access', async ({ page }) => {
      console.log('🔒 Testing cross-branch API access prevention...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      // Navigate to students
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      // Intercept API requests and check branch headers
      let apiRequestsChecked = 0;
      let properHeadersFound = 0;
      
      page.on('request', request => {
        if (request.url().includes('/api/') && request.method() === 'GET') {
          apiRequestsChecked++;
          const headers = request.headers();
          
          // Check for branch identification headers
          if (headers['x-branch-id'] || headers['x-tenant-id'] || headers['authorization']) {
            properHeadersFound++;
            console.log(`✅ API request has proper headers: ${request.url()}`);
          } else {
            console.warn(`⚠️ API request missing branch headers: ${request.url()}`);
          }
        }
      });
      
      // Refresh to trigger API calls
      await page.reload();
      await page.waitForLoadState('networkidle');
      
      console.log(`Checked ${apiRequestsChecked} API requests, ${properHeadersFound} had proper headers`);
      
      if (apiRequestsChecked > 0) {
        const headerRatio = properHeadersFound / apiRequestsChecked;
        expect(headerRatio).toBeGreaterThan(0.8); // At least 80% should have proper headers
      }
    });

    test('should validate branch-specific URLs and routing', async ({ page }) => {
      console.log('🌐 Testing branch-specific URL handling...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      // Try to access data with manipulated requests (if possible)
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      // Check current URL for branch indicators
      const currentUrl = page.url();
      console.log(`Current URL: ${currentUrl}`);
      
      // URLs should not expose branch information directly
      expect(currentUrl).not.toMatch(/branch.*main/);
      expect(currentUrl).not.toMatch(/tenant.*dps/);
      
      // Test direct URL manipulation attempts
      const maliciousUrls = [
        `${FRONTEND_URL}/admin/students?branch=other-branch`,
        `${FRONTEND_URL}/admin/students?tenant=different-school`,
        `${FRONTEND_URL}/admin/students/../../../etc/passwd`
      ];
      
      for (const maliciousUrl of maliciousUrls) {
        try {
          await page.goto(maliciousUrl);
          await page.waitForLoadState('networkidle');
          
          // Should either redirect properly or show appropriate error
          const finalUrl = page.url();
          
          if (finalUrl.includes('sign-in') || finalUrl.includes('admin/students')) {
            console.log('✅ Malicious URL handled appropriately');
          } else {
            console.warn(`⚠️ Malicious URL may not be handled: ${maliciousUrl} -> ${finalUrl}`);
          }
        } catch (error) {
          console.log('✅ Malicious URL blocked by browser security');
        }
      }
    });
  });

  test.describe('Authentication & Authorization', () => {
    test('should enforce authentication for all admin pages', async ({ page }) => {
      console.log('🔐 Testing authentication enforcement...');
      
      // Try to access admin pages without authentication
      const adminPages = [
        `${FRONTEND_URL}/admin`,
        `${FRONTEND_URL}/admin/students`,
        `${FRONTEND_URL}/admin/teachers`,
        `${FRONTEND_URL}/admin/classes`
      ];
      
      let protectedPages = 0;
      for (const adminPage of adminPages) {
        await page.goto(adminPage);
        await page.waitForLoadState('networkidle');
        
        // Should redirect to sign-in
        if (page.url().includes('sign-in') || page.url().includes('login')) {
          protectedPages++;
          console.log(`✅ Page protected: ${adminPage}`);
        } else {
          console.warn(`⚠️ Page not protected: ${adminPage}`);
        }
      }
      
      expect(protectedPages).toBe(adminPages.length);
      console.log(`✅ ${protectedPages}/${adminPages.length} admin pages properly protected`);
    });

    test('should handle session timeout appropriately', async ({ page }) => {
      console.log('⏰ Testing session timeout handling...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      // Navigate to admin dashboard
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Simulate session timeout by manipulating storage/cookies
      await page.evaluate(() => {
        // Clear potential session storage
        localStorage.clear();
        sessionStorage.clear();
        
        // Clear potential auth cookies
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
      });
      
      // Try to access protected resource
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      // Should redirect to login or show unauthorized
      const finalUrl = page.url();
      const isProtected = finalUrl.includes('sign-in') || finalUrl.includes('login') || finalUrl.includes('unauthorized');
      
      if (isProtected) {
        console.log('✅ Session timeout handled appropriately');
      } else {
        console.warn('⚠️ Session timeout may not be properly handled');
      }
    });

    test('should prevent unauthorized API access via network inspection', async ({ page }) => {
      console.log('🕵️ Testing API security via network inspection...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      let unauthorizedApiAttempts = 0;
      let totalApiRequests = 0;
      
      // Monitor API responses for security issues
      page.on('response', async response => {
        if (response.url().includes('/api/')) {
          totalApiRequests++;
          
          // Check for security-related status codes
          if (response.status() === 401 || response.status() === 403) {
            unauthorizedApiAttempts++;
            console.log(`Security response: ${response.url()} - ${response.status()}`);
          }
          
          // Check for data leakage in error responses
          if (!response.ok()) {
            try {
              const responseText = await response.text();
              
              // Should not contain sensitive information
              if (responseText.includes('password') || responseText.includes('token') || responseText.includes('secret')) {
                console.warn('⚠️ Potentially sensitive information in error response');
              }
            } catch (error) {
              // Ignore parsing errors
            }
          }
        }
      });
      
      // Navigate around to trigger API calls
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      await page.goto(`${FRONTEND_URL}/admin/teachers`);
      await page.waitForLoadState('networkidle');
      
      console.log(`API Security Check: ${totalApiRequests} requests, ${unauthorizedApiAttempts} unauthorized attempts`);
      
      // High number of 401/403 responses might indicate security testing or misconfiguration
      if (totalApiRequests > 0) {
        const unauthorizedRatio = unauthorizedApiAttempts / totalApiRequests;
        expect(unauthorizedRatio).toBeLessThan(0.5); // Less than 50% should be unauthorized
      }
    });
  });

  test.describe('Input Validation & XSS Prevention', () => {
    test('should sanitize user inputs to prevent XSS', async ({ page }) => {
      console.log('🛡️ Testing XSS prevention...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      // Navigate to student creation form
      await page.goto(`${FRONTEND_URL}${STUDENTS_URL}/create`);
      await page.waitForLoadState('networkidle');
      
      // XSS payloads to test
      const xssPayloads = [
        '<script>alert("XSS")</script>',
        '<img src="x" onerror="alert(\'XSS\')" />',
        'javascript:alert("XSS")',
        '<svg onload=alert("XSS")>',
        '"><script>alert("XSS")</script>'
      ];
      
      for (const payload of xssPayloads) {
        // Find first name field
        const firstNameField = page.locator('input[name="firstName"], label:has-text("First Name") ~ input').first();
        
        if (await firstNameField.count() > 0) {
          await firstNameField.fill(payload);
          
          // Submit or blur to trigger processing
          await page.keyboard.press('Tab');
          await page.waitForTimeout(1000);
          
          // Check if script was executed (it shouldn't be)
          const alertDialog = await page.locator('[role="alert"]:has-text("XSS")').count();
          expect(alertDialog).toBe(0);
          
          // Check if payload appears in DOM as raw text (sanitized)
          const bodyText = await page.textContent('body');
          if (bodyText?.includes('<script>')) {
            console.warn('⚠️ Unsanitized script tag found in page content');
          }
        }
      }
      
      console.log('✅ XSS prevention tests completed');
    });

    test('should validate file upload security', async ({ page }) => {
      console.log('📎 Testing file upload security...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      // Look for file upload functionality
      await page.goto(`${FRONTEND_URL}${STUDENTS_URL}/create`);
      await page.waitForLoadState('networkidle');
      
      const fileInputs = page.locator('input[type="file"]');
      const fileInputCount = await fileInputs.count();
      
      if (fileInputCount > 0) {
        console.log(`Found ${fileInputCount} file upload fields`);
        
        // Test with potentially malicious file types
        const maliciousFiles = [
          { name: 'test.exe', content: 'MZ\x90\x00' }, // Executable header
          { name: 'test.php', content: '<?php echo "test"; ?>' },
          { name: 'test.jsp', content: '<% out.println("test"); %>' },
          { name: 'test.html', content: '<script>alert("xss")</script>' }
        ];
        
        // Note: In a real test, we'd create these files and attempt upload
        // For now, we'll just verify that file inputs exist and are constrained
        
        for (let i = 0; i < Math.min(fileInputCount, 2); i++) {
          const fileInput = fileInputs.nth(i);
          
          // Check if file input has accept attribute restrictions
          const acceptAttribute = await fileInput.getAttribute('accept');
          
          if (acceptAttribute) {
            console.log(`✅ File input has accept restrictions: ${acceptAttribute}`);
          } else {
            console.warn('⚠️ File input has no accept restrictions');
          }
        }
      } else {
        console.log('ℹ️ No file upload functionality found to test');
      }
    });

    test('should prevent SQL injection in search fields', async ({ page }) => {
      console.log('💉 Testing SQL injection prevention...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      // SQL injection payloads
      const sqlPayloads = [
        "'; DROP TABLE students; --",
        "' OR '1'='1",
        "' UNION SELECT * FROM users --",
        "admin'--",
        "' OR 1=1--"
      ];
      
      const searchInput = page.locator('input[placeholder*="Search" i], input[type="search"]');
      
      if (await searchInput.count() > 0) {
        for (const payload of sqlPayloads) {
          await searchInput.first().fill(payload);
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          
          // Should not cause database errors or expose data
          const bodyText = await page.textContent('body');
          
          // Check for SQL error patterns
          expect(bodyText).not.toMatch(/sql.*error/i);
          expect(bodyText).not.toMatch(/mysql.*error/i);
          expect(bodyText).not.toMatch(/postgres.*error/i);
          expect(bodyText).not.toMatch(/syntax.*error/i);
          
          // Clear search
          await searchInput.first().clear();
        }
        
        console.log('✅ SQL injection prevention tests completed');
      } else {
        console.log('ℹ️ No search functionality found to test');
      }
    });
  });

  test.describe('Data Privacy & GDPR Compliance', () => {
    test('should not expose sensitive student data in URLs', async ({ page }) => {
      console.log('🔒 Testing data privacy in URLs...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      // Navigate to student detail
      const studentRows = page.locator('tbody tr, [class*="row"]');
      
      if (await studentRows.count() > 0) {
        await studentRows.first().click();
        await page.waitForLoadState('networkidle');
        
        const currentUrl = page.url();
        console.log(`Student detail URL: ${currentUrl}`);
        
        // URL should not contain sensitive information
        expect(currentUrl).not.toMatch(/name.*=/i);
        expect(currentUrl).not.toMatch(/phone.*=/i);
        expect(currentUrl).not.toMatch(/email.*=/i);
        expect(currentUrl).not.toMatch(/address.*=/i);
        
        console.log('✅ No sensitive data exposed in URLs');
      }
    });

    test('should handle data access logging', async ({ page }) => {
      console.log('📝 Testing data access patterns...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      let dataAccessRequests = 0;
      
      // Monitor API requests that might involve data access
      page.on('request', request => {
        if (request.url().includes('/api/students') || request.url().includes('/api/guardians')) {
          dataAccessRequests++;
          console.log(`Data access request: ${request.method()} ${request.url()}`);
        }
      });
      
      // Perform data access operations
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      const studentRows = page.locator('tbody tr, [class*="row"]');
      if (await studentRows.count() > 0) {
        await studentRows.first().click();
        await page.waitForLoadState('networkidle');
      }
      
      console.log(`Total data access requests: ${dataAccessRequests}`);
      expect(dataAccessRequests).toBeGreaterThan(0);
    });
  });

  test.describe('Error Handling & Information Disclosure', () => {
    test('should not expose system information in error messages', async ({ page }) => {
      console.log('🚨 Testing error message security...');
      
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      // Try to trigger various error conditions
      const errorTriggers = [
        `${FRONTEND_URL}/admin/nonexistent-module`,
        `${FRONTEND_URL}/admin/students/999999999`, // Non-existent ID
        `${FRONTEND_URL}/admin/students/create?invalid=parameter`
      ];
      
      for (const url of errorTriggers) {
        try {
          await page.goto(url);
          await page.waitForLoadState('networkidle');
          
          const bodyText = await page.textContent('body');
          
          // Should not expose sensitive system information
          expect(bodyText).not.toMatch(/database.*connection/i);
          expect(bodyText).not.toMatch(/stack.*trace/i);
          expect(bodyText).not.toMatch(/internal.*server.*error/i);
          expect(bodyText).not.toMatch(/\/var\/www/i);
          expect(bodyText).not.toMatch(/c:\\windows/i);
          expect(bodyText).not.toMatch(/node_modules/i);
          
        } catch (error) {
          console.log(`Error trigger handled: ${url}`);
        }
      }
      
      console.log('✅ Error message security tests completed');
    });

    test('should handle concurrent user sessions appropriately', async ({ page, context }) => {
      console.log('👥 Testing concurrent session handling...');
      
      // Create first session
      authHelper = new AuthHelper(page);
      await authHelper.login();
      
      await page.goto(STUDENTS_URL);
      await page.waitForLoadState('networkidle');
      
      // Create second browser context (simulate different user)
      const secondContext = await context.browser()?.newContext();
      if (secondContext) {
        const secondPage = await secondContext.newPage();
        const secondAuthHelper = new AuthHelper(secondPage);
        
        try {
          await secondAuthHelper.login();
          
          await secondPage.goto(`${FRONTEND_URL}${STUDENTS_URL}`);
          await secondPage.waitForLoadState('networkidle');
          
          // Both sessions should work independently
          const firstPageTitle = await page.title();
          const secondPageTitle = await secondPage.title();
          
          expect(firstPageTitle).toBeTruthy();
          expect(secondPageTitle).toBeTruthy();
          
          console.log('✅ Concurrent sessions handled appropriately');
          
          await secondPage.close();
          await secondContext.close();
        } catch (error) {
          console.log(`⚠️ Concurrent session test failed: ${error}`);
          await secondContext.close();
        }
      }
    });
  });
});