import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateTicketNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `TS-${timestamp}-${random}`;
}

export function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function formatDate(date: Date | { toDate: () => Date }, locale: string = 'en'): string {
  const d = 'toDate' in date ? date.toDate() : date;
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatRelativeTime(date: Date | { toDate: () => Date }, locale: string = 'en'): string {
  const d = 'toDate' in date ? date.toDate() : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  if (minutes < 1) return rtf.format(0, 'minute');
  if (minutes < 60) return rtf.format(-minutes, 'minute');
  if (hours < 24) return rtf.format(-hours, 'hour');
  if (days < 30) return rtf.format(-days, 'day');
  
  return formatDate(d, locale);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + '...';
}

export function getSeverityColor(severity: string): string {
  switch (severity) {
    case 'low':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'open':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'resolved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'escalated_L2':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'escalated_human':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

export function getLevelColor(level: string): string {
  switch (level) {
    case 'L1':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'L2':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    case 'L3':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

// Privacy utilities
export function redactSensitiveData(text: string): string {
  // Redact potential API keys
  let redacted = text.replace(/([a-zA-Z0-9_-]{20,})/g, (match) => {
    if (match.length > 30) return '[REDACTED]';
    return match;
  });
  
  // Redact credit card numbers
  redacted = redacted.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '[CARD REDACTED]');
  
  // Redact SSN
  redacted = redacted.replace(/\b\d{3}[\s-]?\d{2}[\s-]?\d{4}\b/g, '[SSN REDACTED]');
  
  // Redact email addresses (partial)
  redacted = redacted.replace(/([a-zA-Z0-9._%+-]+)@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, (_, local, domain) => {
    const redactedLocal = local.substring(0, 2) + '***';
    return `${redactedLocal}@${domain}`;
  });
  
  return redacted;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  // Basic international phone validation
  return /^\+?[\d\s-()]{10,}$/.test(phone);
}
