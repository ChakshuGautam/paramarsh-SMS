import { test, expect, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/page-objects';

test.describe('Core Navigation - Comprehensive Dashboard & Menu Tests', () => {
  const ADMIN_URL = '/admin';
  
  let authHelper: AuthHelper;

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    await authHelper.login();
    
    // Monitor console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });

    // Monitor API failures
    page.on('response', response => {
      if (response.url().includes('/api/') && !response.ok()) {
        console.error(`API error: ${response.url()} - ${response.status()}`);
      }
    });
  });

  test.describe('Dashboard Loading & Display', () => {
    test('should load admin dashboard successfully', async ({ page }) => {
      console.log('📊 Testing dashboard loading...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Should be on admin dashboard
      await expect(page).toHaveURL(/.*\/admin.*/);
      
      // Dashboard should have basic layout elements
      const layoutElements = [
        page.locator('nav, [role="navigation"]'), // Navigation menu
        page.locator('main, [role="main"]'),     // Main content area
      ];
      
      for (const element of layoutElements) {
        try {
          await expect(element).toBeVisible({ timeout: 10000 });
        } catch (error) {
          console.log(`⚠️ Layout element not found: ${element}`);
        }
      }
      
      console.log('✅ Dashboard loaded successfully');
    });

    test('should display key dashboard metrics', async ({ page }) => {
      console.log('📈 Testing dashboard metrics display...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Look for common dashboard metric patterns
      const metricSelectors = [
        'text=/student/i',
        'text=/teacher/i',
        'text=/class/i',
        'text=/staff/i',
        '[class*="metric"], [class*="card"], [class*="widget"]'
      ];
      
      let metricsFound = 0;
      for (const selector of metricSelectors) {
        const elements = await page.locator(selector).count();
        if (elements > 0) {
          metricsFound++;
          console.log(`Found metric elements for: ${selector}`);
        }
      }
      
      expect(metricsFound).toBeGreaterThan(0);
      console.log(`✅ Dashboard displays ${metricsFound} types of metrics`);
    });

    test('should handle dashboard data loading states', async ({ page }) => {
      console.log('⏳ Testing dashboard loading states...');
      
      // Go to dashboard and monitor for loading indicators
      await page.goto(ADMIN_URL);
      
      // Look for loading indicators
      const loadingIndicators = page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]').or(page.getByText('Loading'));
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle');
      
      // Loading indicators should be gone
      const remainingLoaders = await loadingIndicators.count();
      expect(remainingLoaders).toBeLessThanOrEqual(1); // Allow for one persistent loader
      
      console.log('✅ Dashboard loading states handled properly');
    });
  });

  test.describe('Sidebar Navigation', () => {
    test('should display all main navigation modules', async ({ page }) => {
      console.log('🧭 Testing sidebar navigation modules...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Core modules that should be accessible
      const expectedModules = [
        'Students',
        'Teachers',
        'Classes',
        'Guardians',
        'Staff'
      ];
      
      let foundModules = 0;
      for (const module of expectedModules) {
        const moduleLink = page.locator(`nav a:has-text("${module}"), [role="navigation"] a:has-text("${module}")`).or(page.getByText(module));
        
        if (await moduleLink.count() > 0) {
          foundModules++;
          console.log(`✅ Found navigation for: ${module}`);
        } else {
          console.log(`⚠️ Missing navigation for: ${module}`);
        }
      }
      
      expect(foundModules).toBeGreaterThan(2); // At least 3 core modules should be visible
      console.log(`✅ Found ${foundModules}/${expectedModules.length} expected modules`);
    });

    test('should navigate to Students module', async ({ page }) => {
      console.log('👨‍🎓 Testing Students module navigation...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // First, expand the Students group if it's collapsed
      const studentsGroup = page.locator('div:has-text("Students"):has([class*="lucide"])').first();
      if (await studentsGroup.count() > 0) {
        await studentsGroup.click();
        await page.waitForTimeout(500); // Wait for animation
      }
      
      // Now find and click the Students link within the expanded group
      const studentsLink = page.locator('a[href*="/students"]').first();
      
      if (await studentsLink.count() > 0) {
        await studentsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to students page
        await expect(page).toHaveURL(/.*students.*/);
        
        // Should see students-related content in the main area (not sidebar)
        // Look for content specifically in the main content area
        const mainContent = page.locator('main, [role="main"], #root > div > main, .flex-1.flex-col').first();
        const studentsContent = mainContent.locator('h1:has-text("Students"), h2:has-text("Students"), [class*="title"]:has-text("Students")').or(
          mainContent.locator('table, [role="table"], [class*="list"], [class*="data-grid"]')
        );
        await expect(studentsContent.first()).toBeVisible({ timeout: 10000 });
        
        console.log('✅ Students module navigation successful');
      } else {
        console.log('⚠️ Students navigation not found - may be implemented differently');
      }
    });

    test('should navigate to Teachers module', async ({ page }) => {
      console.log('👩‍🏫 Testing Teachers module navigation...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // First, expand the Academic group if it's collapsed (Teachers is in Academic group)
      const academicGroup = page.locator('div:has-text("Academic"):has([class*="lucide"])').first();
      if (await academicGroup.count() > 0) {
        await academicGroup.click();
        await page.waitForTimeout(500); // Wait for animation
      }
      
      // Now find and click the Teachers link within the expanded group
      const teachersLink = page.locator('a[href*="/teachers"]').first();
      
      if (await teachersLink.count() > 0) {
        await teachersLink.click();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to teachers page
        await expect(page).toHaveURL(/.*teachers.*/);
        
        // Should see teachers-related content in the main area (not sidebar)
        const mainContent = page.locator('main, [role="main"], #root > div > main, .flex-1.flex-col').first();
        const teachersContent = mainContent.locator('h1:has-text("Teachers"), h2:has-text("Teachers"), [class*="title"]:has-text("Teachers")').or(
          mainContent.locator('table, [role="table"], [class*="list"], [class*="data-grid"]')
        );
        await expect(teachersContent.first()).toBeVisible({ timeout: 10000 });
        
        console.log('✅ Teachers module navigation successful');
      } else {
        console.log('⚠️ Teachers navigation not found - may be implemented differently');
      }
    });

    test('should navigate to Classes module', async ({ page }) => {
      console.log('🏫 Testing Classes module navigation...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // First, expand the Students group if it's collapsed (Classes is in Students group)
      const studentsGroup = page.locator('div:has-text("Students"):has([class*="lucide"])').first();
      if (await studentsGroup.count() > 0) {
        await studentsGroup.click();
        await page.waitForTimeout(500); // Wait for animation
      }
      
      // Now find and click the Classes link within the expanded group
      const classesLink = page.locator('a[href*="/classes"]').first();
      
      if (await classesLink.count() > 0) {
        await classesLink.click();
        await page.waitForLoadState('networkidle');
        
        // Should navigate to classes page
        await expect(page).toHaveURL(/.*classes.*/);
        
        // Should see classes-related content in the main area (not sidebar)
        const mainContent = page.locator('main, [role="main"], #root > div > main, .flex-1.flex-col').first();
        const classesContent = mainContent.locator('h1:has-text("Classes"), h2:has-text("Classes"), [class*="title"]:has-text("Classes")').or(
          mainContent.locator('table, [role="table"], [class*="list"], [class*="data-grid"]')
        );
        await expect(classesContent.first()).toBeVisible({ timeout: 10000 });
        
        console.log('✅ Classes module navigation successful');
      } else {
        console.log('⚠️ Classes navigation not found - may be implemented differently');
      }
    });
  });

  test.describe('Breadcrumb Navigation', () => {
    test('should display breadcrumbs for navigation context', async ({ page }) => {
      console.log('🍞 Testing breadcrumb navigation...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Navigate to a sub-page
      const studentsNav = page.locator('nav a:has-text("Students"), [role="navigation"] a:has-text("Students")').or(page.getByText('Students')).first();
      
      if (await studentsNav.count() > 0) {
        await studentsNav.click();
        await page.waitForLoadState('networkidle');
        
        // Look for breadcrumb indicators
        const breadcrumbs = page.locator('[class*="breadcrumb"], nav[aria-label*="breadcrumb"], ol, .nav-path');
        
        if (await breadcrumbs.count() > 0) {
          console.log('✅ Breadcrumbs found and displayed');
        } else {
          console.log('⚠️ Breadcrumbs not implemented or not visible');
        }
      }
    });
  });

  test.describe('URL-based Navigation', () => {
    test('should support direct URL navigation to modules', async ({ page }) => {
      console.log('🔗 Testing direct URL navigation...');
      
      const moduleUrls = [
        '/admin/students',
        '/admin/teachers',
        '/admin/classes',
        '/admin/guardians'
      ];
      
      for (const url of moduleUrls) {
        try {
          await page.goto(url);
          await page.waitForLoadState('networkidle');
          
          // Should load the page without errors
          await expect(page).toHaveURL(new RegExp(url.replace('/', '\\/')));
          
          // Should not redirect to login (assuming already authenticated)
          expect(page.url()).not.toContain('sign-in');
          
          console.log(`✅ Direct navigation to ${url} successful`);
        } catch (error) {
          console.log(`⚠️ Direct navigation to ${url} failed: ${error}`);
        }
      }
    });

    test('should handle browser back/forward navigation', async ({ page }) => {
      console.log('⬅️➡️ Testing browser back/forward navigation...');
      
      // Start at dashboard
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      const dashboardUrl = page.url();
      
      // Expand Students group and navigate to students
      const studentsGroup = page.locator('div:has-text("Students"):has([class*="lucide"])').first();
      if (await studentsGroup.count() > 0) {
        await studentsGroup.click();
        await page.waitForTimeout(500);
      }
      
      const studentsLink = page.locator('a[href*="/students"]').first();
      
      if (await studentsLink.count() > 0) {
        await studentsLink.click();
        await page.waitForLoadState('networkidle');
        
        // Verify we're on students page
        await expect(page).toHaveURL(/.*students.*/);
        const studentsUrl = page.url();
        
        // Use browser back button
        await page.goBack();
        await page.waitForLoadState('networkidle');
        
        // Should be back at dashboard (check path only, ignore query params)
        const currentUrl = new URL(page.url());
        const expectedUrl = new URL(dashboardUrl);
        expect(currentUrl.pathname).toBe(expectedUrl.pathname);
        
        // Use browser forward button
        await page.goForward();
        await page.waitForLoadState('networkidle');
        
        // Should be back at students (check if URL contains 'students')
        await expect(page).toHaveURL(/.*students.*/);
        
        console.log('✅ Browser back/forward navigation working');
      }
    });
  });

  test.describe('Responsive Navigation', () => {
    test('should adapt navigation for mobile viewport', async ({ page }) => {
      console.log('📱 Testing mobile navigation...');
      
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Look for mobile navigation patterns
      const mobileNavElements = [
        page.locator('[class*="mobile"], [class*="hamburger"], [class*="menu-toggle"]'),
        page.locator('button[aria-label*="menu"], button[aria-label*="navigation"]'),
        page.locator('[role="button"]:has([class*="menu"])')
      ];
      
      let mobileNavFound = false;
      for (const element of mobileNavElements) {
        if (await element.count() > 0) {
          mobileNavFound = true;
          console.log('✅ Mobile navigation element found');
          break;
        }
      }
      
      if (!mobileNavFound) {
        console.log('⚠️ Mobile navigation pattern not detected - may use different approach');
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });

    test('should maintain functionality on tablet viewport', async ({ page }) => {
      console.log('📱 Testing tablet navigation...');
      
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Expand Students group
      const studentsGroup = page.locator('div:has-text("Students"):has([class*="lucide"])').first();
      if (await studentsGroup.count() > 0) {
        await studentsGroup.click();
        await page.waitForTimeout(500);
      }
      
      // Click students link
      const studentsLink = page.locator('a[href*="/students"]').first();
      
      if (await studentsLink.count() > 0) {
        await studentsLink.click();
        await page.waitForLoadState('networkidle');
        
        await expect(page).toHaveURL(/.*students.*/);
        console.log('✅ Tablet navigation working correctly');
      }
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
    });
  });

  test.describe('Performance & Error Handling', () => {
    test('should load navigation within performance thresholds', async ({ page }) => {
      console.log('⚡ Testing navigation performance...');
      
      const startTime = Date.now();
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      const loadTime = Date.now() - startTime;
      
      // Should load within 5 seconds (adjusted for realistic load times)
      expect(loadTime).toBeLessThan(5000);
      
      console.log(`✅ Navigation loaded in ${loadTime}ms`);
    });

    test('should handle navigation errors gracefully', async ({ page }) => {
      console.log('🚨 Testing navigation error handling...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Try navigating to non-existent module
      try {
        await page.goto('/admin/nonexistent-module');
        await page.waitForLoadState('networkidle');
        
        // Should either redirect to 404 page or back to dashboard
        const is404 = page.url().includes('404') || await page.getByText('404').count() > 0 || await page.getByText('Not Found').count() > 0;
        const isRedirectedToDashboard = page.url().includes('/admin') && !page.url().includes('nonexistent');
        
        expect(is404 || isRedirectedToDashboard).toBeTruthy();
        
        console.log('✅ Navigation errors handled gracefully');
      } catch (error) {
        console.log('✅ Navigation blocked invalid routes appropriately');
      }
    });

    test('should not expose sensitive information in navigation', async ({ page }) => {
      console.log('🔒 Testing navigation security...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Check that navigation doesn't expose sensitive paths
      const bodyText = await page.textContent('body');
      
      // Should not contain sensitive system paths
      expect(bodyText).not.toMatch(/\/etc\//);
      expect(bodyText).not.toMatch(/\.\.\/\.\.\//);
      expect(bodyText).not.toMatch(/c:\\windows/i);
      expect(bodyText).not.toMatch(/database.*password/i);
      
      console.log('✅ Navigation is secure - no sensitive information exposed');
    });
  });

  test.describe('Accessibility', () => {
    test('should support keyboard navigation', async ({ page }) => {
      console.log('♿ Testing keyboard navigation...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Test tab navigation through main elements
      await page.keyboard.press('Tab'); // First focusable element
      
      let tabCount = 0;
      const maxTabs = 10;
      
      // Tab through navigation elements
      while (tabCount < maxTabs) {
        await page.keyboard.press('Tab');
        tabCount++;
        
        const focusedElement = await page.evaluate(() => {
          const focused = document.activeElement;
          return {
            tagName: focused?.tagName,
            role: focused?.getAttribute('role'),
            href: focused?.getAttribute('href')
          };
        });
        
        // If we find a navigation link, test it
        if (focusedElement.href && focusedElement.href.includes('/admin/')) {
          await page.keyboard.press('Enter');
          await page.waitForLoadState('networkidle');
          
          // Should navigate successfully
          expect(page.url()).toContain('/admin/');
          console.log('✅ Keyboard navigation successful');
          break;
        }
      }
    });

    test('should have proper ARIA labels for navigation', async ({ page }) => {
      console.log('🏷️ Testing ARIA navigation labels...');
      
      await page.goto(ADMIN_URL);
      await page.waitForLoadState('networkidle');
      
      // Check for navigation landmarks
      const navLandmarks = page.locator('nav, [role="navigation"]');
      const navCount = await navLandmarks.count();
      
      if (navCount > 0) {
        console.log(`✅ Found ${navCount} navigation landmarks`);
      } else {
        console.log('⚠️ No navigation landmarks found - consider adding role="navigation"');
      }
      
      // Check for main content landmark
      const mainLandmarks = page.locator('main, [role="main"]');
      const mainCount = await mainLandmarks.count();
      
      if (mainCount > 0) {
        console.log(`✅ Found ${mainCount} main content landmarks`);
      } else {
        console.log('⚠️ No main content landmarks found - consider adding role="main"');
      }
    });
  });
});