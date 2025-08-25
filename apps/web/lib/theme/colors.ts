/**
 * Centralized color configuration for consistent theming across the application
 */

export const statusColors = {
  // Student statuses
  active: {
    border: 'border-l-green-500',
    background: 'bg-green-100',
    text: 'text-green-700',
    badgeVariant: 'default' as const,
  },
  inactive: {
    border: 'border-l-muted-foreground',
    background: 'bg-muted',
    text: 'text-muted-foreground',
    badgeVariant: 'secondary' as const,
  },
  graduated: {
    border: 'border-l-blue-500',
    background: 'bg-blue-100',
    text: 'text-blue-700',
    badgeVariant: 'outline' as const,
  },
  enrolled: {
    border: 'border-l-green-500',
    background: 'bg-green-100',
    text: 'text-green-700',
    badgeVariant: 'default' as const,
  },
  // Staff statuses
  on_leave: {
    border: 'border-l-yellow-500',
    background: 'bg-yellow-100',
    text: 'text-yellow-700',
    badgeVariant: 'outline' as const,
  },
  terminated: {
    border: 'border-l-red-500',
    background: 'bg-red-100',
    text: 'text-red-700',
    badgeVariant: 'destructive' as const,
  },
  // Application statuses
  pending: {
    border: 'border-l-yellow-500',
    background: 'bg-yellow-100',
    text: 'text-yellow-700',
    badgeVariant: 'outline' as const,
  },
  approved: {
    border: 'border-l-green-500',
    background: 'bg-green-100',
    text: 'text-green-700',
    badgeVariant: 'default' as const,
  },
  rejected: {
    border: 'border-l-red-500',
    background: 'bg-red-100',
    text: 'text-red-700',
    badgeVariant: 'destructive' as const,
  },
  draft: {
    border: 'border-l-gray-500',
    background: 'bg-gray-100',
    text: 'text-gray-700',
    badgeVariant: 'secondary' as const,
  },
  // Enrollment statuses
  transferred: {
    border: 'border-l-blue-500',
    background: 'bg-blue-100',
    text: 'text-blue-700',
    badgeVariant: 'outline' as const,
  },
  dropped: {
    border: 'border-l-red-500',
    background: 'bg-red-100',
    text: 'text-red-700',
    badgeVariant: 'destructive' as const,
  },
  suspended: {
    border: 'border-l-yellow-500',
    background: 'bg-yellow-100',
    text: 'text-yellow-700',
    badgeVariant: 'destructive' as const,
  },
  completed: {
    border: 'border-l-indigo-500',
    background: 'bg-indigo-100',
    text: 'text-indigo-700',
    badgeVariant: 'default' as const,
  },
  // Invoice statuses
  paid: {
    border: 'border-l-green-500',
    background: 'bg-green-100',
    text: 'text-green-700',
    badgeVariant: 'default' as const,
  },
  overdue: {
    border: 'border-l-red-500',
    background: 'bg-red-100',
    text: 'text-red-700',
    badgeVariant: 'destructive' as const,
  },
  partial: {
    border: 'border-l-orange-500',
    background: 'bg-orange-100',
    text: 'text-orange-700',
    badgeVariant: 'outline' as const,
  },
} as const;

export const genderColors = {
  male: {
    background: 'bg-blue-100',
    text: 'text-blue-700',
    badgeVariant: 'outline' as const,
  },
  female: {
    background: 'bg-pink-100',
    text: 'text-pink-700',
    badgeVariant: 'outline' as const,
  },
  other: {
    background: 'bg-purple-100',
    text: 'text-purple-700',
    badgeVariant: 'outline' as const,
  },
} as const;

export const relationColors = {
  father: {
    border: 'border-l-blue-500',
    background: 'bg-blue-100',
    text: 'text-blue-700',
    badgeVariant: 'outline' as const,
  },
  mother: {
    border: 'border-l-pink-500',
    background: 'bg-pink-100',
    text: 'text-pink-700',
    badgeVariant: 'outline' as const,
  },
  guardian: {
    border: 'border-l-green-500',
    background: 'bg-green-100',
    text: 'text-green-700',
    badgeVariant: 'outline' as const,
  },
  grandfather: {
    border: 'border-l-purple-400',
    background: 'bg-purple-100',
    text: 'text-purple-700',
    badgeVariant: 'outline' as const,
  },
  grandmother: {
    border: 'border-l-purple-400',
    background: 'bg-purple-100',
    text: 'text-purple-700',
    badgeVariant: 'outline' as const,
  },
  uncle: {
    border: 'border-l-orange-400',
    background: 'bg-orange-100',
    text: 'text-orange-700',
    badgeVariant: 'outline' as const,
  },
  aunt: {
    border: 'border-l-orange-400',
    background: 'bg-orange-100',
    text: 'text-orange-700',
    badgeVariant: 'outline' as const,
  },
  other: {
    border: 'border-l-muted-foreground',
    background: 'bg-muted',
    text: 'text-muted-foreground',
    badgeVariant: 'secondary' as const,
  },
} as const;

export const experienceColors = {
  novice: {
    border: 'border-l-blue-400',
    background: 'bg-blue-100',
    text: 'text-blue-700',
    badgeVariant: 'outline' as const,
  },
  experienced: {
    border: 'border-l-green-500',
    background: 'bg-green-100',
    text: 'text-green-700',
    badgeVariant: 'outline' as const,
  },
  senior: {
    border: 'border-l-purple-500',
    background: 'bg-purple-100',
    text: 'text-purple-700',
    badgeVariant: 'outline' as const,
  },
} as const;

export const designationColors = {
  principal: {
    background: 'bg-purple-100',
    text: 'text-purple-700',
  },
  director: {
    background: 'bg-purple-100',
    text: 'text-purple-700',
  },
  teacher: {
    background: 'bg-blue-100',
    text: 'text-blue-700',
  },
  instructor: {
    background: 'bg-blue-100',
    text: 'text-blue-700',
  },
  admin: {
    background: 'bg-green-100',
    text: 'text-green-700',
  },
  coordinator: {
    background: 'bg-green-100',
    text: 'text-green-700',
  },
  clerk: {
    background: 'bg-orange-100',
    text: 'text-orange-700',
  },
  assistant: {
    background: 'bg-orange-100',
    text: 'text-orange-700',
  },
  default: {
    background: 'bg-gray-100',
    text: 'text-gray-700',
  },
} as const;

// Type exports for consistent usage
export type StatusType = keyof typeof statusColors;
export type GenderType = keyof typeof genderColors;
export type RelationType = keyof typeof relationColors;
export type ExperienceType = keyof typeof experienceColors;
export type DesignationType = keyof typeof designationColors;

// Helper functions
export const getStatusColor = (status: string) => {
  return statusColors[status as StatusType] || statusColors.inactive;
};

export const getGenderColor = (gender: string) => {
  return genderColors[gender as GenderType] || genderColors.other;
};

export const getRelationColor = (relation: string) => {
  return relationColors[relation as RelationType] || relationColors.other;
};

export const getExperienceColor = (years: number): typeof experienceColors[ExperienceType] => {
  if (years <= 3) return experienceColors.novice;
  if (years <= 10) return experienceColors.experienced;
  return experienceColors.senior;
};

export const getDesignationColor = (designation: string) => {
  const lower = designation.toLowerCase();
  if (lower.includes('principal') || lower.includes('director')) return designationColors.principal;
  if (lower.includes('teacher') || lower.includes('instructor')) return designationColors.teacher;
  if (lower.includes('admin') || lower.includes('coordinator')) return designationColors.admin;
  if (lower.includes('clerk') || lower.includes('assistant')) return designationColors.clerk;
  return designationColors.default;
};