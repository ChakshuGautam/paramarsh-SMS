/**
 * Safe date formatting utilities
 * Handles null/undefined dates gracefully to prevent UI crashes
 */

/**
 * Safely formats a date value to localized date string
 * Returns '-' if date is null, undefined, or invalid
 */
export function formatDate(date: any): string {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleDateString();
  } catch {
    return '-';
  }
}

/**
 * Safely formats a date value to localized date and time string
 * Returns '-' if date is null, undefined, or invalid
 */
export function formatDateTime(date: any): string {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    return `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  } catch {
    return '-';
  }
}

/**
 * Safely formats a date to time string only
 * Returns '-' if date is null, undefined, or invalid
 */
export function formatTime(date: any): string {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '-';
  }
}

/**
 * Safely formats a date to relative time (e.g., "2 hours ago")
 * Returns '-' if date is null, undefined, or invalid
 */
export function formatRelativeTime(date: any): string {
  if (!date) return '-';
  
  try {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';
    
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return formatDate(date);
  } catch {
    return '-';
  }
}