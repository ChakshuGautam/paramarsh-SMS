/**
 * CENTRALIZED AUTHENTICATION CONFIGURATION
 * 
 * ⚠️ CRITICAL: This is the SINGLE SOURCE OF TRUTH for test authentication
 * 
 * ALL tests MUST use this configuration. DO NOT hardcode credentials elsewhere.
 * 
 * Last Updated: 2025-09-15
 * Password Confirmed Working: P@ramarsh#Admin2024$Secure
 */

export const TEST_AUTH = {
  // ✅ CORRECT CREDENTIALS - VERIFIED WORKING
  admin: {
    username: 'admin',
    password: 'P@ramarsh#Admin2024$Secure',
    school: 'dps',
    schoolName: 'Delhi Public School',
    branch: 'main',
    branchName: 'Main Campus',
    compositeBranchId: 'dps-main'
  },
  
  // Alternative test users if needed
  teacher: {
    username: 'teacher',
    password: 'P@ramarsh#Admin2024$Secure',
    school: 'dps',
    branch: 'main'
  }
};

// URLs
export const TEST_URLS = {
  frontend: process.env.FRONTEND_URL || 'http://localhost:3001',
  backend: process.env.BACKEND_URL || 'http://localhost:3005',
  signIn: '/sign-in',
  admin: '/admin'
};

// Timeouts
export const TEST_TIMEOUTS = {
  navigation: 15000,  // Increased for auth flow
  element: 10000,
  network: 30000
};

/**
 * Authentication Process Documentation
 * 
 * The sign-in page uses:
 * 1. Clerk for authentication
 * 2. Custom school/branch selection
 * 3. Composite branch IDs (e.g., "dps-main")
 * 
 * Key Selectors:
 * - Username: #username
 * - Password: #password  
 * - School dropdown: button[role="combobox"] (first)
 * - Branch dropdown: button[role="combobox"] (second)
 * - Submit: button[type="submit"]
 * 
 * The AuthHelper in page-objects.ts handles this flow correctly.
 * Tests should use: await authHelper.login() with NO parameters
 * as it has the correct defaults.
 */

// Export a helper to log auth issues
export function logAuthDebug(message: string, error?: any) {
  console.log(`🔐 AUTH DEBUG: ${message}`);
  if (error) {
    console.error('Error details:', error);
  }
}