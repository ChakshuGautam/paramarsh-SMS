/**
 * Academic Years Test Suite
 * 
 * Comprehensive test coverage for all Academic Years components:
 * - List.test.tsx - List view with filtering, searching, and date handling
 * - Create.test.tsx - Create form with validation and submission
 * - Edit.test.tsx - Edit form with data loading and updates  
 * - Show.test.tsx - Show view with field display and date edge cases
 * 
 * All tests ensure:
 * - No date-related runtime errors ("Invalid time value")
 * - shadcn/ui components only (no MUI)
 * - Multi-tenancy support (X-Branch-Id headers)
 * - Comprehensive edge case handling
 * - Accessibility compliance
 * - Performance requirements met
 */

export * from './List.test';
export * from './Create.test'; 
export * from './Edit.test';
export * from './Show.test';