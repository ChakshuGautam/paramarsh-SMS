/**
 * Backend Constants - Single source of truth for API configuration
 */

// Multi-tenancy
export const DEFAULT_BRANCH_ID = 'branch1';
export const BRANCH_HEADER_KEY = 'x-branch-id';

// API Configuration  
export const API_PREFIX = 'api/v1';
export const DEFAULT_PORT = 8080;

// Pagination
export const DEFAULT_PAGE_SIZE = 25;
export const DEFAULT_PAGE = 1;
export const MAX_PAGE_SIZE = 100;
export const MIN_PAGE_SIZE = 1;

// Database
export const SOFT_DELETE_FIELD = 'deletedAt';

// Status Values
export const STUDENT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  GRADUATED: 'graduated',
  TRANSFERRED: 'transferred',
  DROPPED: 'dropped',
  SUSPENDED: 'suspended',
} as const;

export const ENROLLMENT_STATUS = {
  ENROLLED: 'enrolled',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  COMPLETED: 'completed',
  TRANSFERRED: 'transferred',
  GRADUATED: 'graduated',
  DROPPED: 'dropped',
} as const;

export const STAFF_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  ON_LEAVE: 'on_leave',
  RESIGNED: 'resigned',
  RETIRED: 'retired',
} as const;

// Gender Values
export const GENDER = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

// Guardian Relations
export const GUARDIAN_RELATION = {
  FATHER: 'father',
  MOTHER: 'mother',
  GUARDIAN: 'guardian',
  GRANDFATHER: 'grandfather',
  GRANDMOTHER: 'grandmother',
  UNCLE: 'uncle',
  AUNT: 'aunt',
  OTHER: 'other',
} as const;

// Type exports
export type StudentStatus = typeof STUDENT_STATUS[keyof typeof STUDENT_STATUS];
export type EnrollmentStatus = typeof ENROLLMENT_STATUS[keyof typeof ENROLLMENT_STATUS];
export type StaffStatus = typeof STAFF_STATUS[keyof typeof STAFF_STATUS];
export type Gender = typeof GENDER[keyof typeof GENDER];
export type GuardianRelation = typeof GUARDIAN_RELATION[keyof typeof GUARDIAN_RELATION];