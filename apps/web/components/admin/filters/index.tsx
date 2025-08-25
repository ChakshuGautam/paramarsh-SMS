/**
 * Standardized Filter Component Library
 * 
 * Provides consistent filter components for all resource lists
 * ensuring uniform design and behavior across the application.
 */

import React from 'react';
import {
  TextInput,
  SelectInput,
  DateInput,
  NumberInput,
  ReferenceInput,
  AutocompleteInput,
  BooleanInput,
} from 'react-admin';
import { DateRangeInput } from '@/components/admin';
import styles from './filters.module.css';

// Standard search box that should be on every list
export const SearchFilter = ({ placeholder = "Search...", source = "q" }: { placeholder?: string; source?: string }) => (
  <TextInput 
    source={source}
    placeholder={placeholder}
    label=""
    alwaysOn
    className={styles.filterSearch}
    InputProps={{
      className: styles.filterSearch,
      style: { height: '40px', minWidth: '240px', maxWidth: '400px' }
    }}
  />
);

// Standard status filter with common choices
export const StatusFilter = ({ 
  source = "status",
  choices = [
    { id: 'active', name: 'Active' },
    { id: 'inactive', name: 'Inactive' },
    { id: 'pending', name: 'Pending' },
    { id: 'archived', name: 'Archived' },
  ],
  placeholder = "Filter by status"
}: { source?: string; choices?: Array<{id: string; name: string}>; placeholder?: string }) => (
  <SelectInput
    source={source}
    placeholder={placeholder}
    label=""
    choices={choices}
    className={styles.filterSelect}
    sx={{ minWidth: 180, maxWidth: 320, '& .MuiInputBase-root': { height: 40 } }}
  />
);

// Gender filter with standard choices
export const GenderFilter = ({ source = "gender" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by gender"
    label=""
    choices={[
      { id: 'male', name: 'Male' },
      { id: 'female', name: 'Female' },
      { id: 'other', name: 'Other' },
    ]}
    className={styles.filterSelect}
    sx={{ minWidth: 180, maxWidth: 320, '& .MuiInputBase-root': { height: 40 } }}
  />
);

// Standard date range filter
export const DateRangeFilter = ({ 
  sourceFrom = "date_gte",
  sourceTo = "date_lte",
  placeholder = "Filter by date range"
}: { sourceFrom?: string; sourceTo?: string; placeholder?: string }) => (
  <DateRangeInput
    source="dateRange" // Required source prop
    sourceFrom={sourceFrom}
    sourceTo={sourceTo}
    label=""
    placeholder={placeholder}
  />
);

// Single date filter
export const DateFilter = ({ 
  source = "date",
  placeholder = "Filter by date"
}: { source?: string; placeholder?: string }) => (
  <DateInput
    source={source}
    placeholder={placeholder}
    label=""
    className={styles.filterDate}
    sx={{ minWidth: 180, maxWidth: 240, '& .MuiInputBase-root': { height: 40 } }}
  />
);

// Amount/Number range filters
export const AmountRangeFilter = ({ 
  sourceMin = "amount_gte",
  sourceMax = "amount_lte",
  placeholderMin = "Min amount",
  placeholderMax = "Max amount"
}: { sourceMin?: string; sourceMax?: string; placeholderMin?: string; placeholderMax?: string }) => (
  <>
    <NumberInput
      source={sourceMin}
      placeholder={placeholderMin}
      label=""
      min={0}
    />
    <NumberInput
      source={sourceMax}
      placeholder={placeholderMax}
      label=""
      min={0}
    />
  </>
);

// Single number filter
export const NumberFilter = ({ 
  source,
  placeholder,
  min = 0
}: { source: string; placeholder: string; min?: number }) => (
  <NumberInput
    source={source}
    placeholder={placeholder}
    label=""
    min={min}
    className={styles.filterNumber}
    sx={{ minWidth: 120, maxWidth: 180, '& .MuiInputBase-root': { height: 40 } }}
  />
);

// Standard reference filter for entities with names
export const ReferenceFilter = ({ 
  source,
  reference,
  placeholder,
  optionText = "name"
}: { source: string; reference: string; placeholder: string; optionText?: string }) => (
  <ReferenceInput source={source} reference={reference}>
    <AutocompleteInput
      placeholder={placeholder}
      label=""
      optionText={optionText}
    />
  </ReferenceInput>
);

// Reference filter for people (with first/last names)
export const PersonReferenceFilter = ({ 
  source,
  reference,
  placeholder
}: { source: string; reference: string; placeholder: string }) => (
  <ReferenceInput source={source} reference={reference}>
    <AutocompleteInput
      placeholder={placeholder}
      label=""
      optionText={(record: any) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>
);

// Boolean filter with standard styling
export const BooleanFilter = ({ 
  source,
  label = ""
}: { source: string; label?: string }) => (
  <BooleanInput
    source={source}
    label={label}
  />
);

// Priority filter for tickets/tasks
export const PriorityFilter = ({ source = "priority" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by priority"
    label=""
    choices={[
      { id: 'low', name: 'Low' },
      { id: 'medium', name: 'Medium' },
      { id: 'high', name: 'High' },
      { id: 'urgent', name: 'Urgent' },
    ]}
  />
);

// Academic year filter
export const AcademicYearFilter = ({ source = "academicYearId" }: { source?: string }) => (
  <ReferenceInput source={source} reference="academicYears">
    <AutocompleteInput
      placeholder="Filter by academic year"
      label=""
      optionText="name"
    />
  </ReferenceInput>
);

// Class filter
export const ClassFilter = ({ source = "classId" }: { source?: string }) => (
  <ReferenceInput source={source} reference="classes">
    <AutocompleteInput
      placeholder="Filter by class"
      label=""
      optionText="name"
    />
  </ReferenceInput>
);

// Section filter
export const SectionFilter = ({ source = "sectionId" }: { source?: string }) => (
  <ReferenceInput source={source} reference="sections">
    <AutocompleteInput
      placeholder="Filter by section"
      label=""
      optionText="name"
    />
  </ReferenceInput>
);

// Subject filter
export const SubjectFilter = ({ source = "subjectId" }: { source?: string }) => (
  <ReferenceInput source={source} reference="subjects">
    <AutocompleteInput
      placeholder="Filter by subject"
      label=""
      optionText="name"
    />
  </ReferenceInput>
);

// Teacher filter
export const TeacherFilter = ({ source = "teacherId" }: { source?: string }) => (
  <ReferenceInput source={source} reference="teachers">
    <AutocompleteInput
      placeholder="Filter by teacher"
      label=""
      optionText={(record: any) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>
);

// Student filter
export const StudentFilter = ({ source = "studentId" }: { source?: string }) => (
  <ReferenceInput source={source} reference="students">
    <AutocompleteInput
      placeholder="Filter by student"
      label=""
      optionText={(record: any) => `${record.firstName} ${record.lastName}`}
    />
  </ReferenceInput>
);

// Email filter
export const EmailFilter = ({ source = "email" }: { source?: string }) => (
  <TextInput
    source={source}
    placeholder="Filter by email"
    label=""
  />
);

// Phone filter
export const PhoneFilter = ({ source = "phone" }: { source?: string }) => (
  <TextInput
    source={source}
    placeholder="Filter by phone"
    label=""
  />
);

// Relation filter for guardians
export const RelationFilter = ({ source = "relation" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by relation"
    label=""
    choices={[
      { id: 'father', name: 'Father' },
      { id: 'mother', name: 'Mother' },
      { id: 'guardian', name: 'Guardian' },
      { id: 'other', name: 'Other' },
    ]}
  />
);

// Grade level filter for classes
export const GradeLevelFilter = ({ source = "gradeLevel" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by grade"
    label=""
    choices={[
      { id: 1, name: 'Grade 1' },
      { id: 2, name: 'Grade 2' },
      { id: 3, name: 'Grade 3' },
      { id: 4, name: 'Grade 4' },
      { id: 5, name: 'Grade 5' },
      { id: 6, name: 'Grade 6' },
      { id: 7, name: 'Grade 7' },
      { id: 8, name: 'Grade 8' },
      { id: 9, name: 'Grade 9' },
      { id: 10, name: 'Grade 10' },
      { id: 11, name: 'Grade 11' },
      { id: 12, name: 'Grade 12' },
    ]}
  />
);

// Attendance status filter
export const AttendanceStatusFilter = ({ source = "status" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by status"
    label=""
    choices={[
      { id: 'present', name: 'Present' },
      { id: 'absent', name: 'Absent' },
      { id: 'late', name: 'Late' },
      { id: 'excused', name: 'Excused' },
    ]}
  />
);

// Invoice status filter
export const InvoiceStatusFilter = ({ source = "status" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by status"
    label=""
    choices={[
      { id: 'pending', name: 'Pending' },
      { id: 'paid', name: 'Paid' },
      { id: 'overdue', name: 'Overdue' },
      { id: 'cancelled', name: 'Cancelled' },
    ]}
  />
);

// Payment status filter
export const PaymentStatusFilter = ({ source = "status" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by status"
    label=""
    choices={[
      { id: 'pending', name: 'Pending' },
      { id: 'completed', name: 'Completed' },
      { id: 'failed', name: 'Failed' },
      { id: 'refunded', name: 'Refunded' },
    ]}
  />
);

// Payment method filter
export const PaymentMethodFilter = ({ source = "method" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by method"
    label=""
    choices={[
      { id: 'cash', name: 'Cash' },
      { id: 'card', name: 'Card' },
      { id: 'bank_transfer', name: 'Bank Transfer' },
      { id: 'upi', name: 'UPI' },
      { id: 'cheque', name: 'Cheque' },
    ]}
  />
);

// Enrollment status filter
export const EnrollmentStatusFilter = ({ source = "status" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by status"
    label=""
    choices={[
      { id: 'active', name: 'Active' },
      { id: 'enrolled', name: 'Enrolled' },
      { id: 'transferred', name: 'Transferred' },
      { id: 'graduated', name: 'Graduated' },
      { id: 'dropped', name: 'Dropped' },
    ]}
  />
);

// Message type filter
export const MessageTypeFilter = ({ source = "type" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by type"
    label=""
    choices={[
      { id: 'sms', name: 'SMS' },
      { id: 'email', name: 'Email' },
      { id: 'notification', name: 'Notification' },
      { id: 'announcement', name: 'Announcement' },
    ]}
  />
);

// Campaign status filter
export const CampaignStatusFilter = ({ source = "status" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by status"
    label=""
    choices={[
      { id: 'draft', name: 'Draft' },
      { id: 'scheduled', name: 'Scheduled' },
      { id: 'sent', name: 'Sent' },
      { id: 'failed', name: 'Failed' },
    ]}
  />
);

// Ticket status filter
export const TicketStatusFilter = ({ source = "status" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by status"
    label=""
    choices={[
      { id: 'open', name: 'Open' },
      { id: 'in_progress', name: 'In Progress' },
      { id: 'resolved', name: 'Resolved' },
      { id: 'closed', name: 'Closed' },
    ]}
  />
);

// Department filter for staff
export const DepartmentFilter = ({ source = "department" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by department"
    label=""
    choices={[
      { id: 'administration', name: 'Administration' },
      { id: 'academics', name: 'Academics' },
      { id: 'finance', name: 'Finance' },
      { id: 'operations', name: 'Operations' },
      { id: 'it', name: 'IT' },
      { id: 'hr', name: 'HR' },
      { id: 'maintenance', name: 'Maintenance' },
    ]}
  />
);

// Role filter for staff
export const RoleFilter = ({ source = "role" }: { source?: string }) => (
  <SelectInput
    source={source}
    placeholder="Filter by role"
    label=""
    choices={[
      { id: 'admin', name: 'Admin' },
      { id: 'teacher', name: 'Teacher' },
      { id: 'accountant', name: 'Accountant' },
      { id: 'receptionist', name: 'Receptionist' },
      { id: 'support', name: 'Support Staff' },
    ]}
  />
);

// Export filter groups for common use cases
export const StandardFilters = {
  // Basic filters for most resources
  basic: [SearchFilter, StatusFilter],
  
  // Academic resource filters
  academic: [SearchFilter, ClassFilter, SectionFilter, AcademicYearFilter],
  
  // Financial resource filters
  financial: [SearchFilter, DateRangeFilter, AmountRangeFilter],
  
  // People resource filters
  people: [SearchFilter, GenderFilter, EmailFilter, PhoneFilter],
  
  // Communication resource filters
  communication: [SearchFilter, MessageTypeFilter, DateRangeFilter],
};

export default {
  SearchFilter,
  StatusFilter,
  GenderFilter,
  DateRangeFilter,
  DateFilter,
  AmountRangeFilter,
  NumberFilter,
  ReferenceFilter,
  PersonReferenceFilter,
  BooleanFilter,
  PriorityFilter,
  AcademicYearFilter,
  ClassFilter,
  SectionFilter,
  SubjectFilter,
  TeacherFilter,
  StudentFilter,
  EmailFilter,
  PhoneFilter,
  RelationFilter,
  GradeLevelFilter,
  AttendanceStatusFilter,
  InvoiceStatusFilter,
  PaymentStatusFilter,
  PaymentMethodFilter,
  EnrollmentStatusFilter,
  MessageTypeFilter,
  CampaignStatusFilter,
  TicketStatusFilter,
  DepartmentFilter,
  RoleFilter,
  StandardFilters,
};