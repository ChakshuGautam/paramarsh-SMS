/**
 * Global Constants for Paramarsh SMS
 * Single source of truth for all magic strings and configuration values
 */

// Multi-tenancy
export const DEFAULT_BRANCH_ID = 'branch1' as const;
export const BRANCH_HEADER_KEY = 'X-Branch-Id' as const;

// API Configuration
export const API_PREFIX = 'api/v1' as const;
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
export const DEFAULT_PORT = 8080 as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 25 as const;
export const DEFAULT_PAGE = 1 as const;
export const MAX_PAGE_SIZE = 100 as const;
export const MIN_PAGE_SIZE = 1 as const;

// Date Formats
export const DATE_FORMAT = 'yyyy-MM-dd' as const;
export const DATE_DISPLAY_FORMAT = 'dd MMM yyyy' as const;
export const DATETIME_FORMAT = 'yyyy-MM-dd HH:mm:ss' as const;
export const DATETIME_DISPLAY_FORMAT = 'dd MMM yyyy, hh:mm a' as const;

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

// Employee Designations
export const STAFF_DESIGNATION = {
  PRINCIPAL: 'principal',
  VICE_PRINCIPAL: 'vice_principal',
  TEACHER: 'teacher',
  ADMIN: 'admin',
  ACCOUNTANT: 'accountant',
  CLERK: 'clerk',
  LIBRARIAN: 'librarian',
  LAB_ASSISTANT: 'lab_assistant',
  SECURITY: 'security',
  JANITOR: 'janitor',
  OTHER: 'other',
} as const;

// Employee Types
export const EMPLOYEE_TYPE = {
  TEACHING: 'teaching',
  NON_TEACHING: 'non_teaching',
  SUPPORT: 'support',
  ADMIN: 'admin',
} as const;

// Experience Levels
export const EXPERIENCE_LEVEL = {
  FRESHER: 'fresher',
  MID: 'mid',
  SENIOR: 'senior',
  EXPERT: 'expert',
} as const;

// Academic Years
export const ACADEMIC_YEAR_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active',
  COMPLETED: 'completed',
} as const;

// Fee Types
export const FEE_TYPE = {
  TUITION: 'tuition',
  ADMISSION: 'admission',
  TRANSPORT: 'transport',
  LIBRARY: 'library',
  LAB: 'lab',
  SPORTS: 'sports',
  EXAM: 'exam',
  OTHER: 'other',
} as const;

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PARTIAL: 'partial',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled',
} as const;

// UI Constants
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Empty State Messages
export const EMPTY_MESSAGES = {
  NO_DATA: 'No data available',
  NO_RECORDS: 'No records found',
  NO_RESULTS: 'No results match your search',
  NO_PHONE: 'Phone not provided',
  NO_EMAIL: 'Email not provided',
  NO_ADDRESS: 'Address not provided',
  NO_GUARDIAN: 'No guardian assigned',
  NO_STUDENTS: 'No students enrolled',
  NO_SUBJECTS: 'No subjects assigned',
  NO_QUALIFICATIONS: 'No qualifications listed',
  NO_WARDS: 'No wards linked',
  LOADING: 'Loading...',
  ERROR: 'An error occurred',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_DATE: 'Please enter a valid date',
  MIN_LENGTH: (min: number) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max: number) => `Must not exceed ${max} characters`,
  MIN_VALUE: (min: number) => `Must be at least ${min}`,
  MAX_VALUE: (max: number) => `Must not exceed ${max}`,
} as const;

// Type exports for TypeScript
export type StudentStatus = typeof STUDENT_STATUS[keyof typeof STUDENT_STATUS];
export type EnrollmentStatus = typeof ENROLLMENT_STATUS[keyof typeof ENROLLMENT_STATUS];
export type StaffStatus = typeof STAFF_STATUS[keyof typeof STAFF_STATUS];
export type Gender = typeof GENDER[keyof typeof GENDER];
export type GuardianRelation = typeof GUARDIAN_RELATION[keyof typeof GUARDIAN_RELATION];
export type StaffDesignation = typeof STAFF_DESIGNATION[keyof typeof STAFF_DESIGNATION];
export type EmployeeType = typeof EMPLOYEE_TYPE[keyof typeof EMPLOYEE_TYPE];
export type ExperienceLevel = typeof EXPERIENCE_LEVEL[keyof typeof EXPERIENCE_LEVEL];
export type AcademicYearStatus = typeof ACADEMIC_YEAR_STATUS[keyof typeof ACADEMIC_YEAR_STATUS];
export type FeeType = typeof FEE_TYPE[keyof typeof FEE_TYPE];
export type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];