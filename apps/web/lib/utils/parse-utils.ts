/**
 * Utility functions for parsing and transforming data
 * Eliminates duplicate parsing logic across components
 */

/**
 * Parses a flexible value that could be:
 * - A JSON string array
 * - A comma-separated string
 * - An actual array
 * - A single value
 * Returns an array of strings
 */
export function parseFlexibleArray(value: any): string[] {
  if (!value) return [];
  
  // Already an array
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }
  
  // String that might be JSON or comma-separated
  if (typeof value === 'string') {
    // Try parsing as JSON first
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item).trim()).filter(Boolean);
      }
      // If parsed but not array, convert to array
      return [String(parsed).trim()].filter(Boolean);
    } catch {
      // Not JSON, try comma-separated
      if (value.includes(',')) {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
      // Single value
      return [value.trim()].filter(Boolean);
    }
  }
  
  // Other types - convert to string
  return [String(value).trim()].filter(Boolean);
}

/**
 * Safely parses a JSON string with fallback
 * Returns the parsed value or the default value if parsing fails
 */
export function safeJsonParse<T = any>(
  value: string | undefined | null,
  defaultValue: T
): T {
  if (!value) return defaultValue;
  
  try {
    return JSON.parse(value) as T;
  } catch {
    return defaultValue;
  }
}

/**
 * Formats a name from first and last name parts
 * Handles missing parts gracefully
 */
export function formatFullName(
  firstName?: string | null,
  lastName?: string | null,
  fallback: string = 'Unknown'
): string {
  const first = firstName?.trim() || '';
  const last = lastName?.trim() || '';
  const full = `${first} ${last}`.trim();
  return full || fallback;
}

/**
 * Formats a phone number for display
 * Handles Indian phone numbers specifically
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Indian phone number format (10 digits)
  if (digits.length === 10) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  }
  
  // With country code
  if (digits.length === 12 && digits.startsWith('91')) {
    const number = digits.slice(2);
    return `+91 ${number.slice(0, 5)}-${number.slice(5)}`;
  }
  
  // Return as-is if doesn't match expected format
  return phone;
}

/**
 * Formats an address from components
 * Handles missing parts gracefully
 */
export function formatAddress(
  address?: string | null,
  city?: string | null,
  state?: string | null,
  pincode?: string | null
): string {
  const parts = [
    address?.trim(),
    city?.trim(),
    state?.trim(),
    pincode?.trim(),
  ].filter(Boolean);
  
  return parts.join(', ');
}

/**
 * Parses React Admin filter string from query params
 * Handles the complex filter format used by React Admin
 */
export function parseReactAdminFilter(filterStr?: string | null): Record<string, any> {
  if (!filterStr) return {};
  
  try {
    const parsed = JSON.parse(filterStr);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/**
 * Parses React Admin range parameter
 * Returns start and limit for pagination
 */
export function parseReactAdminRange(rangeStr?: string | null): {
  start: number;
  limit: number;
} {
  if (!rangeStr) {
    return { start: 0, limit: 25 };
  }
  
  try {
    const [start, end] = JSON.parse(rangeStr);
    return {
      start: Number(start) || 0,
      limit: (Number(end) || 25) - (Number(start) || 0),
    };
  } catch {
    return { start: 0, limit: 25 };
  }
}

/**
 * Parses React Admin sort parameter
 * Returns field and order for sorting
 */
export function parseReactAdminSort(sortStr?: string | null): {
  field: string;
  order: 'ASC' | 'DESC';
} {
  if (!sortStr) {
    return { field: 'id', order: 'ASC' };
  }
  
  try {
    const [field, order] = JSON.parse(sortStr);
    return {
      field: field || 'id',
      order: (order === 'DESC' ? 'DESC' : 'ASC') as 'ASC' | 'DESC',
    };
  } catch {
    return { field: 'id', order: 'ASC' };
  }
}

/**
 * Converts a value to boolean
 * Handles various truthy/falsy representations
 */
export function parseBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on';
  }
  if (typeof value === 'number') return value !== 0;
  return Boolean(value);
}

/**
 * Safely accesses nested object properties
 * Returns undefined if any part of the path doesn't exist
 */
export function getNestedValue<T = any>(
  obj: any,
  path: string,
  defaultValue?: T
): T | undefined {
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return current ?? defaultValue;
}

/**
 * Groups an array of objects by a key
 */
export function groupBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Removes duplicate objects from an array based on a key
 */
export function uniqueBy<T extends Record<string, any>>(
  array: T[],
  key: keyof T
): T[] {
  const seen = new Set<any>();
  return array.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
}