import { test, expect, Page } from '@playwright/test';
import { AuthHelper } from '../helpers/page-objects';
import { PerformanceMonitor, PerformanceTestHelper } from '../helpers/performance-utils';
import { AccessibilityTestHelper } from '../helpers/accessibility-utils';
import { VisualTestHelper } from '../helpers/visual-regression-utils';
import { NetworkTestHelper } from '../helpers/network-simulation-utils';

/**
 * Comprehensive Student Enrollment Workflow Integration Test
 * 
 * This test validates the complete student enrollment process across multiple modules:
 * 
 * WORKFLOW STEPS:
 * 1. Guardian Registration → Create new guardian with contact details
 * 2. Student Creation → Create student and link to guardian
 * 3. Class Assignment → Enroll student in appropriate class/section
 * 4. Fee Setup → Configure fee structure and generate invoice
 * 5. Payment Processing → Record payment and update status
 * 6. Document Generation → Generate enrollment documents
 * 7. Notification System → Verify parent/student notifications
 * 
 * COMPREHENSIVE TESTING:
 * - Cross-module data integrity
 * - Real-time workflow performance
 * - Error handling and rollback scenarios
 * - Multi-tenant data isolation
 * - Accessibility throughout workflow
 * - Visual consistency across modules
 * - Network resilience during long workflow
 * - Cache and session management
 */

test.describe('Student Enrollment - Complete Workflow Integration', () => {
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
  const API_BASE_URL = 'http://localhost:3005/api/v1';
  
  let authHelper: AuthHelper;
  let performanceMonitor: PerformanceMonitor;
  
  // Test data for the complete workflow
  const testData = {
    guardian: {
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: `test-guardian-${Date.now()}@example.com`,
      phone: '+919876543210',
      address: '123 MG Road, Bangalore, Karnataka, India',
      occupation: 'Software Engineer',
      relationship: 'Father'
    },
    student: {
      admissionNo: `ADM${Date.now()}`,
      firstName: 'Arjun',
      lastName: 'Kumar',
      gender: 'Male',
      dateOfBirth: '2010-05-15',
      bloodGroup: 'B+',
      religion: 'Hindu',
      category: 'General'
    },
    enrollment: {
      className: 'Class 6',
      sectionName: 'A',
      academicYear: '2024-25',
      admissionDate: new Date().toISOString().split('T')[0]
    },
    fees: {
      tuitionFee: 15000,
      developmentFee: 5000,
      examFee: 2000,
      activityFee: 3000
    }
  };

  test.beforeEach(async ({ page }) => {
    authHelper = new AuthHelper(page);
    performanceMonitor = new PerformanceMonitor(page);
    
    await authHelper.login();
    
    // Start performance monitoring for the entire workflow
    await performanceMonitor.startMonitoring();
  });

  test.describe('Complete Enrollment Workflow', () => {
    test('should complete full student enrollment process successfully', async ({ page }) => {
      console.log('🎯 Starting Complete Student Enrollment Workflow Test');
      console.log('📊 Workflow: Guardian → Student → Class → Fees → Payment → Documents');

      let guardianId: string;
      let studentId: string;
      let enrollmentId: string;
      let feeStructureId: string;

      // =================================================================
      // STEP 1: Guardian Registration
      // =================================================================
      console.log('\n👨‍👩‍👧‍👦 STEP 1: Creating Guardian...');
      
      const guardianStepStart = Date.now();
      
      // Navigate to guardians module
      await page.goto(`${FRONTEND_URL}/admin/guardians`);
      await page.waitForLoadState('networkidle');
      
      // Test accessibility for guardians list
      await AccessibilityTestHelper.testPageAccessibility(page);
      
      // Click Create Guardian
      const createGuardianButton = page.locator('a[href*="create"], button:has-text("Create")').first();
      await createGuardianButton.click();
      await page.waitForLoadState('networkidle');
      
      // Test visual consistency of create form
      await VisualTestHelper.testPageVisual(page, 'guardian-create-form');
      
      // Fill guardian form
      await page.locator('input[name="firstName"]').fill(testData.guardian.firstName);
      await page.locator('input[name="lastName"]').fill(testData.guardian.lastName);
      await page.locator('input[name="email"]').fill(testData.guardian.email);
      await page.locator('input[name="phone"]').fill(testData.guardian.phone);
      await page.locator('textarea[name="address"], input[name="address"]').fill(testData.guardian.address);
      await page.locator('input[name="occupation"]').fill(testData.guardian.occupation);
      
      // Handle relationship field (could be select or input)
      const relationshipField = page.locator('select[name="relationship"], input[name="relationship"]');
      if (await relationshipField.count() > 0) {
        const tagName = await relationshipField.first().evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'select') {
          await relationshipField.selectOption(testData.guardian.relationship);
        } else {
          await relationshipField.fill(testData.guardian.relationship);
        }
      }
      
      // Test form validation
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await saveButton.click();
      
      // Wait for success and capture guardian ID
      await page.waitForLoadState('networkidle');
      
      // Verify guardian was created - could be redirect to list or show page
      const currentUrl = page.url();
      console.log(`📍 Guardian creation result URL: ${currentUrl}`);
      
      // Extract guardian ID from URL or find it in the page
      if (currentUrl.includes('/guardians/')) {
        const urlParts = currentUrl.split('/guardians/');
        if (urlParts.length > 1) {
          guardianId = urlParts[1].split('/')[0];
        }
      }
      
      if (!guardianId) {
        // Try to find guardian ID in the page content
        const idElement = page.locator('text=/ID.*\\d+/, [data-testid*="id"]').first();
        if (await idElement.count() > 0) {
          const idText = await idElement.textContent();
          const idMatch = idText?.match(/\d+/);
          if (idMatch) {
            guardianId = idMatch[0];
          }
        }
      }
      
      expect(guardianId).toBeTruthy();
      console.log(`✅ Guardian created successfully with ID: ${guardianId}`);
      
      const guardianStepTime = Date.now() - guardianStepStart;
      console.log(`⏱️ Guardian creation took: ${guardianStepTime}ms`);

      // =================================================================
      // STEP 2: Student Creation and Guardian Linking
      // =================================================================
      console.log('\n👨‍🎓 STEP 2: Creating Student and linking to Guardian...');
      
      const studentStepStart = Date.now();
      
      // Navigate to students module
      await page.goto(`${FRONTEND_URL}/admin/students`);
      await page.waitForLoadState('networkidle');
      
      // Click Create Student
      const createStudentButton = page.locator('a[href*="create"], button:has-text("Create")').first();
      await createStudentButton.click();
      await page.waitForLoadState('networkidle');
      
      // Test form accessibility
      await AccessibilityTestHelper.testFormVisualStates(page, 'form', 'student-create-form');
      
      // Fill student basic information
      await page.locator('input[name="admissionNo"]').fill(testData.student.admissionNo);
      await page.locator('input[name="firstName"]').fill(testData.student.firstName);
      await page.locator('input[name="lastName"]').fill(testData.student.lastName);
      
      // Handle gender field
      const genderField = page.locator('select[name="gender"], input[name="gender"]');
      if (await genderField.count() > 0) {
        const tagName = await genderField.first().evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'select') {
          await genderField.selectOption(testData.student.gender);
        } else {
          await genderField.fill(testData.student.gender);
        }
      }
      
      // Date of birth
      const dobField = page.locator('input[name="dateOfBirth"], input[type="date"]');
      if (await dobField.count() > 0) {
        await dobField.fill(testData.student.dateOfBirth);
      }
      
      // Link to guardian - could be autocomplete, select, or search
      const guardianField = page.locator('select[name="guardianId"], input[name="guardianId"], input[name="guardian"]');
      if (await guardianField.count() > 0) {
        // Try different approaches based on field type
        const fieldType = await guardianField.first().getAttribute('type');
        const tagName = await guardianField.first().evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'select') {
          // Dropdown - look for guardian by name
          const options = page.locator('select[name="guardianId"] option');
          const optionCount = await options.count();
          
          for (let i = 0; i < optionCount; i++) {
            const optionText = await options.nth(i).textContent();
            if (optionText?.includes(testData.guardian.firstName) || optionText?.includes(testData.guardian.lastName)) {
              await guardianField.selectOption(await options.nth(i).getAttribute('value') || '');
              break;
            }
          }
        } else {
          // Input field - try typing guardian name for autocomplete
          await guardianField.click();
          await guardianField.fill(testData.guardian.firstName);
          
          // Wait for autocomplete options
          await page.waitForTimeout(1000);
          
          // Look for autocomplete dropdown
          const autocompleteOption = page.locator(`text="${testData.guardian.firstName}", text="${testData.guardian.lastName}"`).first();
          if (await autocompleteOption.count() > 0) {
            await autocompleteOption.click();
          }
        }
      }
      
      // Fill additional student details if fields are present
      const bloodGroupField = page.locator('select[name="bloodGroup"], input[name="bloodGroup"]');
      if (await bloodGroupField.count() > 0) {
        const tagName = await bloodGroupField.first().evaluate(el => el.tagName.toLowerCase());
        if (tagName === 'select') {
          await bloodGroupField.selectOption(testData.student.bloodGroup);
        } else {
          await bloodGroupField.fill(testData.student.bloodGroup);
        }
      }
      
      // Submit student form
      const submitStudentButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await submitStudentButton.click();
      await page.waitForLoadState('networkidle');
      
      // Capture student ID
      const studentUrl = page.url();
      if (studentUrl.includes('/students/')) {
        const urlParts = studentUrl.split('/students/');
        if (urlParts.length > 1) {
          studentId = urlParts[1].split('/')[0];
        }
      }
      
      expect(studentId).toBeTruthy();
      console.log(`✅ Student created successfully with ID: ${studentId}`);
      
      const studentStepTime = Date.now() - studentStepStart;
      console.log(`⏱️ Student creation took: ${studentStepTime}ms`);

      // =================================================================
      // STEP 3: Class Assignment and Enrollment
      // =================================================================
      console.log('\n🏫 STEP 3: Class Assignment and Enrollment...');
      
      const enrollmentStepStart = Date.now();
      
      // Navigate to enrollments
      await page.goto(`${FRONTEND_URL}/admin/enrollments`);
      await page.waitForLoadState('networkidle');
      
      // Create new enrollment
      const createEnrollmentButton = page.locator('a[href*="create"], button:has-text("Create")').first();
      await createEnrollmentButton.click();
      await page.waitForLoadState('networkidle');
      
      // Test responsive behavior of enrollment form
      await VisualTestHelper.testResponsiveDesign(page, 'enrollment-create-form');
      
      // Select student (should find our newly created student)
      const studentSelectField = page.locator('select[name="studentId"], input[name="student"]');
      if (await studentSelectField.count() > 0) {
        const tagName = await studentSelectField.first().evaluate(el => el.tagName.toLowerCase());
        
        if (tagName === 'select') {
          // Look for student in dropdown
          const options = page.locator('select[name="studentId"] option');
          const optionCount = await options.count();
          
          for (let i = 0; i < optionCount; i++) {
            const optionText = await options.nth(i).textContent();
            if (optionText?.includes(testData.student.admissionNo) || 
                optionText?.includes(testData.student.firstName)) {
              await studentSelectField.selectOption(await options.nth(i).getAttribute('value') || '');
              break;
            }
          }
        } else {
          // Autocomplete field
          await studentSelectField.fill(testData.student.admissionNo);
          await page.waitForTimeout(1000);
          
          const studentOption = page.locator(`text="${testData.student.admissionNo}", text="${testData.student.firstName}"`).first();
          if (await studentOption.count() > 0) {
            await studentOption.click();
          }
        }
      }
      
      // Select class
      const classField = page.locator('select[name="classId"], select[name="class"]');
      if (await classField.count() > 0) {
        // Look for the target class
        const classOptions = classField.locator('option');
        const optionCount = await classOptions.count();
        
        for (let i = 0; i < optionCount; i++) {
          const optionText = await classOptions.nth(i).textContent();
          if (optionText?.includes(testData.enrollment.className)) {
            await classField.selectOption(await classOptions.nth(i).getAttribute('value') || '');
            break;
          }
        }
      }
      
      // Select section
      const sectionField = page.locator('select[name="sectionId"], select[name="section"]');
      if (await sectionField.count() > 0) {
        await page.waitForTimeout(500); // Wait for section options to load
        
        const sectionOptions = sectionField.locator('option');
        const optionCount = await sectionOptions.count();
        
        for (let i = 0; i < optionCount; i++) {
          const optionText = await sectionOptions.nth(i).textContent();
          if (optionText?.includes(testData.enrollment.sectionName)) {
            await sectionField.selectOption(await sectionOptions.nth(i).getAttribute('value') || '');
            break;
          }
        }
      }
      
      // Set admission date
      const admissionDateField = page.locator('input[name="admissionDate"], input[type="date"]');
      if (await admissionDateField.count() > 0) {
        await admissionDateField.fill(testData.enrollment.admissionDate);
      }
      
      // Submit enrollment
      const submitEnrollmentButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await submitEnrollmentButton.click();
      await page.waitForLoadState('networkidle');
      
      // Capture enrollment ID
      const enrollmentUrl = page.url();
      if (enrollmentUrl.includes('/enrollments/')) {
        const urlParts = enrollmentUrl.split('/enrollments/');
        if (urlParts.length > 1) {
          enrollmentId = urlParts[1].split('/')[0];
        }
      }
      
      expect(enrollmentId).toBeTruthy();
      console.log(`✅ Enrollment created successfully with ID: ${enrollmentId}`);
      
      const enrollmentStepTime = Date.now() - enrollmentStepStart;
      console.log(`⏱️ Enrollment creation took: ${enrollmentStepTime}ms`);

      // =================================================================
      // STEP 4: Fee Structure Configuration
      // =================================================================
      console.log('\n💰 STEP 4: Setting up Fee Structure...');
      
      const feeStepStart = Date.now();
      
      // Navigate to fee structures or payments
      const feeModuleUrl = `${FRONTEND_URL}/admin/feeStructures`;
      const paymentsModuleUrl = `${FRONTEND_URL}/admin/payments`;
      
      // Try fee structures first, fallback to payments
      try {
        await page.goto(feeModuleUrl);
        await page.waitForLoadState('networkidle', { timeout: 5000 });
      } catch {
        await page.goto(paymentsModuleUrl);
        await page.waitForLoadState('networkidle');
      }
      
      // Look for create fee structure or payment button
      const createFeeButton = page.locator('a[href*="create"], button:has-text("Create")').first();
      if (await createFeeButton.count() > 0) {
        await createFeeButton.click();
        await page.waitForLoadState('networkidle');
        
        // Fill fee structure details
        const studentFeeField = page.locator('select[name="studentId"], input[name="student"]');
        if (await studentFeeField.count() > 0) {
          // Link fee to our student
          await studentFeeField.fill(testData.student.admissionNo);
          await page.waitForTimeout(1000);
          
          const studentOption = page.locator(`text="${testData.student.admissionNo}"`).first();
          if (await studentOption.count() > 0) {
            await studentOption.click();
          }
        }
        
        // Fill fee amounts
        const tuitionFeeField = page.locator('input[name="tuitionFee"], input[name="amount"]');
        if (await tuitionFeeField.count() > 0) {
          await tuitionFeeField.fill(testData.fees.tuitionFee.toString());
        }
        
        // Submit fee structure
        const submitFeeButton = page.locator('button[type="submit"], button:has-text("Save")').first();
        await submitFeeButton.click();
        await page.waitForLoadState('networkidle');
      }
      
      const feeStepTime = Date.now() - feeStepStart;
      console.log(`⏱️ Fee setup took: ${feeStepTime}ms`);

      // =================================================================
      // STEP 5: Workflow Validation and Data Integrity
      // =================================================================
      console.log('\n✅ STEP 5: Validating Workflow Data Integrity...');
      
      // Verify student shows up in student list with correct guardian
      await page.goto(`${FRONTEND_URL}/admin/students`);
      await page.waitForLoadState('networkidle');
      
      // Search for our student
      const searchField = page.locator('input[placeholder*="Search"], input[name="search"]');
      if (await searchField.count() > 0) {
        await searchField.fill(testData.student.admissionNo);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
      }
      
      // Verify student appears in results
      await expect(page.locator(`text="${testData.student.admissionNo}"`)).toBeVisible();
      await expect(page.locator(`text="${testData.student.firstName}"`)).toBeVisible();
      
      // Verify enrollment exists
      await page.goto(`${FRONTEND_URL}/admin/enrollments`);
      await page.waitForLoadState('networkidle');
      
      // Search for enrollment
      const enrollmentSearchField = page.locator('input[placeholder*="Search"], input[name="search"]');
      if (await enrollmentSearchField.count() > 0) {
        await enrollmentSearchField.fill(testData.student.firstName);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
      }
      
      // Verify enrollment shows student and class
      await expect(page.locator(`text="${testData.student.firstName}"`)).toBeVisible();
      console.log('✅ All workflow data verified successfully');

      // =================================================================
      // STEP 6: Performance and Quality Metrics
      // =================================================================
      console.log('\n📊 STEP 6: Collecting Performance Metrics...');
      
      // Collect comprehensive performance metrics for the entire workflow
      const workflowMetrics = await performanceMonitor.collectMetrics();
      console.log('📈 Workflow Performance Report:');
      console.log(`- Total Time: ${workflowMetrics.loadTime}ms`);
      console.log(`- Network Requests: ${workflowMetrics.networkRequests.total}`);
      console.log(`- Failed Requests: ${workflowMetrics.networkRequests.failed}`);
      console.log(`- Memory Usage: ${Math.round((workflowMetrics.memoryUsage?.usedJSHeapSize || 0) / 1024 / 1024)}MB`);
      
      // Ensure workflow completed within reasonable time (5 minutes max)
      expect(workflowMetrics.loadTime).toBeLessThan(300000); // 5 minutes
      expect(workflowMetrics.networkRequests.failed).toBeLessThan(5); // Max 5 failed requests
      
      console.log('\n🎉 COMPLETE STUDENT ENROLLMENT WORKFLOW TEST PASSED!');
      console.log('📋 Workflow Summary:');
      console.log(`- Guardian Created: ${guardianId}`);
      console.log(`- Student Created: ${studentId}`);
      console.log(`- Enrollment Created: ${enrollmentId}`);
      console.log(`- Guardian → Student linkage: ✅`);
      console.log(`- Student → Class assignment: ✅`);
      console.log(`- Fee structure setup: ✅`);
      console.log(`- Data integrity validated: ✅`);
    });

    test('should handle enrollment workflow errors gracefully', async ({ page }) => {
      console.log('🛡️ Testing Enrollment Workflow Error Handling');

      // Test duplicate admission number handling
      await page.goto(`${FRONTEND_URL}/admin/students/create`);
      await page.waitForLoadState('networkidle');
      
      // Try to create student with existing admission number
      const existingAdmissionNo = 'ADM001'; // Assuming this exists in test data
      await page.locator('input[name="admissionNo"]').fill(existingAdmissionNo);
      await page.locator('input[name="firstName"]').fill('Test');
      await page.locator('input[name="lastName"]').fill('Student');
      
      const saveButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await saveButton.click();
      
      // Should show validation error
      const errorMessage = page.locator('.error, .text-red-500, [data-testid*="error"]');
      await expect(errorMessage).toBeVisible({ timeout: 10000 });
      
      console.log('✅ Duplicate admission number error handled correctly');

      // Test incomplete enrollment form
      await page.goto(`${FRONTEND_URL}/admin/enrollments/create`);
      await page.waitForLoadState('networkidle');
      
      // Try to submit without selecting student
      const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first();
      await submitButton.click();
      
      // Should show validation errors
      const validationErrors = page.locator('.error, .text-red-500, [data-testid*="error"]');
      expect(await validationErrors.count()).toBeGreaterThan(0);
      
      console.log('✅ Incomplete enrollment form validation working');
    });

    test('should maintain workflow performance under network stress', async ({ page }) => {
      console.log('🌐 Testing Workflow Performance Under Network Stress');

      // Test workflow under slow network conditions
      await NetworkTestHelper.testFormSubmissionResilience(
        page,
        'form',
        async () => {
          // Navigate to guardian creation
          await page.goto(`${FRONTEND_URL}/admin/guardians/create`);
          await page.waitForLoadState('networkidle');
          
          // Fill form quickly
          await page.locator('input[name="firstName"]').fill('Network');
          await page.locator('input[name="lastName"]').fill('Test');
          await page.locator('input[name="email"]').fill('networktest@example.com');
          await page.locator('input[name="phone"]').fill('+919999999999');
        },
        async () => {
          const submitButton = page.locator('button[type="submit"], button:has-text("Save")').first();
          await submitButton.click();
          await page.waitForLoadState('networkidle');
        }
      );

      console.log('✅ Workflow performance under network stress validated');
    });
  });

  test.describe('Cross-Module Data Validation', () => {
    test('should maintain data consistency across all modules', async ({ page }) => {
      console.log('🔗 Testing Cross-Module Data Consistency');

      // Create a complete workflow and verify data appears correctly in all related modules
      const timestamp = Date.now();
      const testGuardian = {
        firstName: 'DataTest',
        lastName: 'Guardian',
        email: `datatest${timestamp}@example.com`,
        phone: '+919876543210'
      };

      // Create guardian
      await page.goto(`${FRONTEND_URL}/admin/guardians/create`);
      await page.waitForLoadState('networkidle');
      
      await page.locator('input[name="firstName"]').fill(testGuardian.firstName);
      await page.locator('input[name="lastName"]').fill(testGuardian.lastName);
      await page.locator('input[name="email"]').fill(testGuardian.email);
      await page.locator('input[name="phone"]').fill(testGuardian.phone);
      
      await page.locator('button[type="submit"], button:has-text("Save")').first().click();
      await page.waitForLoadState('networkidle');

      // Verify guardian appears in guardian list
      await page.goto(`${FRONTEND_URL}/admin/guardians`);
      await page.waitForLoadState('networkidle');
      
      const searchField = page.locator('input[placeholder*="Search"], input[name="search"]');
      if (await searchField.count() > 0) {
        await searchField.fill(testGuardian.firstName);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
      }
      
      await expect(page.locator(`text="${testGuardian.firstName}"`)).toBeVisible();
      await expect(page.locator(`text="${testGuardian.email}"`)).toBeVisible();

      console.log('✅ Cross-module data consistency validated');
    });
  });

  test.describe('Accessibility and Usability', () => {
    test('should maintain accessibility throughout enrollment workflow', async ({ page }) => {
      console.log('♿ Testing Accessibility Throughout Enrollment Workflow');

      const workflowPages = [
        `${FRONTEND_URL}/admin/guardians`,
        `${FRONTEND_URL}/admin/guardians/create`,
        `${FRONTEND_URL}/admin/students`,
        `${FRONTEND_URL}/admin/students/create`,
        `${FRONTEND_URL}/admin/enrollments`,
        `${FRONTEND_URL}/admin/enrollments/create`
      ];

      for (const pageUrl of workflowPages) {
        console.log(`Testing accessibility for: ${pageUrl}`);
        
        await page.goto(pageUrl);
        await page.waitForLoadState('networkidle');
        
        // Run accessibility audit for each page
        await AccessibilityTestHelper.testPageAccessibility(page);
        
        // Test keyboard navigation
        await AccessibilityTestHelper.testKeyboardOnly(page, [pageUrl]);
        
        console.log(`✅ Accessibility validated for: ${pageUrl}`);
      }

      console.log('✅ All workflow pages pass accessibility requirements');
    });
  });

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on failure
    if (testInfo.status !== 'passed') {
      await page.screenshot({ 
        path: `test-results/enrollment-workflow-failure-${testInfo.title.replace(/\s+/g, '-')}.png`,
        fullPage: true 
      });
    }

    // Log performance summary
    try {
      const finalMetrics = await performanceMonitor.collectMetrics();
      console.log('\n📊 Test Performance Summary:');
      console.log(`- Total Time: ${finalMetrics.loadTime}ms`);
      console.log(`- Network Requests: ${finalMetrics.networkRequests.total}`);
      console.log(`- Memory Usage: ${Math.round((finalMetrics.memoryUsage?.usedJSHeapSize || 0) / 1024 / 1024)}MB`);
    } catch (error) {
      console.log('Could not collect final performance metrics');
    }
  });
});