import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Safe date formatting utility that handles null, undefined, and invalid dates
 * Follows the pattern from Issue #002 in CLAUDE.md
 */
export function formatDate(date: any, formatStr: string = 'MMM dd, yyyy'): string {
  if (!date || date === '' || date === 'invalid') {
    return '-';
  }
  
  try {
    const dateObj = new Date(date);
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return '-';
    }
    return format(dateObj, formatStr);
  } catch {
    return '-';
  }
}

/**
 * Safe date formatting for times with default format 'h:mm a'
 */
export function formatTime(date: any): string {
  return formatDate(date, 'h:mm a');
}

/**
 * Safe date formatting for datetime with default format 'MMM dd, yyyy HH:mm'
 */
export function formatDateTime(date: any): string {
  return formatDate(date, 'MMM dd, yyyy HH:mm');
}

/**
 * Safe date parsing that handles null, undefined, and invalid dates
 * Returns null for invalid dates instead of throwing errors
 */
export function safeParseDate(date: any): Date | null {
  if (!date || date === '' || date === 'invalid') {
    return null;
  }
  
  try {
    const dateObj = new Date(date);
    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return null;
    }
    return dateObj;
  } catch {
    return null;
  }
}

/**
 * Safe date comparison - checks if date1 is before date2
 * Returns false if either date is invalid
 */
export function safeDateIsBefore(date1: any, date2: any): boolean {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);
  
  if (!d1 || !d2) return false;
  return d1 < d2;
}

/**
 * Safe date comparison - checks if two dates are the same day
 * Returns false if either date is invalid
 */
export function safeDateIsSameDay(date1: any, date2: any): boolean {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);
  
  if (!d1 || !d2) return false;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

/**
 * Format currency in Indian Rupees (INR)
 * Handles null, undefined, and invalid numbers
 */
export function formatCurrency(amount: any): string {
  if (!amount || isNaN(Number(amount))) {
    return '₹0.00';
  }
  
  const number = Number(amount);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(number);
}

/**
 * Check if invoice is overdue based on due date and status
 */
export function isInvoiceOverdue(dueDate: any, status: string): boolean {
  if (status === 'paid') return false;
  
  const due = safeParseDate(dueDate);
  if (!due) return false;
  
  return due < new Date() && status !== 'paid';
}
