// Security utilities for input validation and sanitization
// Urbane Haauz Hotel Booking System

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone validation (Indian phone numbers)
const PHONE_REGEX = /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/;

// Name validation (letters, spaces, common characters)
const NAME_REGEX = /^[a-zA-Z\u0900-\u097F\s.'-]{2,100}$/;

// SQL injection patterns to block
const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/i,
  /(--|#|\/\*|\*\/)/,
  /(\bOR\b|\bAND\b)\s*(\d+|'[^']*')\s*=\s*(\d+|'[^']*')/i,
  /(\bOR\b|\bAND\b)\s*1\s*=\s*1/i,
];

// XSS patterns to block
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<form/gi,
];

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

/**
 * Sanitize string input by removing potential XSS vectors
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') return '';

  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

/**
 * Validate and sanitize email address
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }

  const trimmed = email.trim().toLowerCase();

  if (trimmed.length > 254) {
    return { isValid: false, error: 'Email is too long' };
  }

  if (!EMAIL_REGEX.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, sanitizedValue: trimmed };
}

/**
 * Validate and sanitize phone number
 */
export function validatePhone(phone: string): ValidationResult {
  if (!phone) {
    return { isValid: true, sanitizedValue: '' }; // Phone is optional
  }

  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '');

  if (!PHONE_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid Indian phone number' };
  }

  // Normalize to +91 format
  let normalized = cleaned;
  if (!normalized.startsWith('+91')) {
    if (normalized.startsWith('91')) {
      normalized = '+' + normalized;
    } else if (normalized.startsWith('0')) {
      normalized = '+91' + normalized.substring(1);
    } else {
      normalized = '+91' + normalized;
    }
  }

  return { isValid: true, sanitizedValue: normalized };
}

/**
 * Validate and sanitize name
 */
export function validateName(name: string, fieldName: string = 'Name'): ValidationResult {
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const trimmed = name.trim();

  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` };
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: `${fieldName} is too long` };
  }

  if (!NAME_REGEX.test(trimmed)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true, sanitizedValue: sanitizeString(trimmed) };
}

/**
 * Validate and sanitize general text input
 */
export function validateText(
  text: string,
  fieldName: string = 'Text',
  options: { required?: boolean; minLength?: number; maxLength?: number } = {}
): ValidationResult {
  const { required = false, minLength = 0, maxLength = 5000 } = options;

  if (!text && required) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (!text) {
    return { isValid: true, sanitizedValue: '' };
  }

  const trimmed = text.trim();

  if (trimmed.length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }

  if (trimmed.length > maxLength) {
    return { isValid: false, error: `${fieldName} is too long (max ${maxLength} characters)` };
  }

  // Check for SQL injection patterns
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn('Potential SQL injection attempt detected:', trimmed.substring(0, 50));
      return { isValid: false, error: 'Invalid input detected' };
    }
  }

  // Check for XSS patterns
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(trimmed)) {
      console.warn('Potential XSS attempt detected:', trimmed.substring(0, 50));
      return { isValid: false, error: 'Invalid input detected' };
    }
  }

  return { isValid: true, sanitizedValue: sanitizeString(trimmed) };
}

/**
 * Validate date input
 */
export function validateDate(
  dateString: string,
  fieldName: string = 'Date',
  options: { allowPast?: boolean; maxFutureDays?: number } = {}
): ValidationResult {
  const { allowPast = false, maxFutureDays = 365 } = options;

  if (!dateString) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return { isValid: false, error: `Invalid ${fieldName}` };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!allowPast && date < today) {
    return { isValid: false, error: `${fieldName} cannot be in the past` };
  }

  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + maxFutureDays);

  if (date > maxDate) {
    return { isValid: false, error: `${fieldName} is too far in the future (max ${maxFutureDays} days)` };
  }

  return { isValid: true, sanitizedValue: date.toISOString().split('T')[0] };
}

/**
 * Validate positive integer
 */
export function validatePositiveInt(
  value: number | string,
  fieldName: string = 'Number',
  options: { min?: number; max?: number } = {}
): ValidationResult {
  const { min = 1, max = 100 } = options;

  const num = typeof value === 'string' ? parseInt(value, 10) : value;

  if (isNaN(num) || !Number.isInteger(num)) {
    return { isValid: false, error: `${fieldName} must be a whole number` };
  }

  if (num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (num > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }

  return { isValid: true, sanitizedValue: String(num) };
}

/**
 * Validate promo code format
 */
export function validatePromoCode(code: string): ValidationResult {
  if (!code) {
    return { isValid: true, sanitizedValue: '' }; // Promo code is optional
  }

  const trimmed = code.trim().toUpperCase();

  if (!/^[A-Z0-9]{3,20}$/.test(trimmed)) {
    return { isValid: false, error: 'Invalid promo code format' };
  }

  return { isValid: true, sanitizedValue: trimmed };
}

/**
 * Validate booking form data
 */
export interface BookingFormData {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  roomType: string;
  specialRequests?: string;
  promoCode?: string;
}

export function validateBookingForm(data: BookingFormData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  const nameResult = validateName(data.guestName, 'Guest name');
  if (!nameResult.isValid) errors.guestName = nameResult.error!;

  const emailResult = validateEmail(data.guestEmail);
  if (!emailResult.isValid) errors.guestEmail = emailResult.error!;

  const phoneResult = validatePhone(data.guestPhone);
  if (!phoneResult.isValid) errors.guestPhone = phoneResult.error!;

  const checkInResult = validateDate(data.checkIn, 'Check-in date');
  if (!checkInResult.isValid) errors.checkIn = checkInResult.error!;

  const checkOutResult = validateDate(data.checkOut, 'Check-out date');
  if (!checkOutResult.isValid) {
    errors.checkOut = checkOutResult.error!;
  } else if (new Date(data.checkOut) <= new Date(data.checkIn)) {
    errors.checkOut = 'Check-out must be after check-in';
  }

  const adultsResult = validatePositiveInt(data.adults, 'Number of adults', { min: 1, max: 10 });
  if (!adultsResult.isValid) errors.adults = adultsResult.error!;

  const childrenResult = validatePositiveInt(data.children, 'Number of children', { min: 0, max: 10 });
  if (!childrenResult.isValid) errors.children = childrenResult.error!;

  if (!data.roomType || !['deluxe', 'family', 'super-deluxe'].includes(data.roomType)) {
    errors.roomType = 'Please select a valid room type';
  }

  if (data.specialRequests) {
    const requestsResult = validateText(data.specialRequests, 'Special requests', { maxLength: 1000 });
    if (!requestsResult.isValid) errors.specialRequests = requestsResult.error!;
  }

  if (data.promoCode) {
    const promoResult = validatePromoCode(data.promoCode);
    if (!promoResult.isValid) errors.promoCode = promoResult.error!;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Rate limiting helper - client-side implementation
 */
interface RateLimitStore {
  [key: string]: { count: number; resetTime: number };
}

const rateLimitStore: RateLimitStore = {};

export function checkRateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60000
): { allowed: boolean; remainingAttempts: number; resetIn: number } {
  const now = Date.now();

  if (!rateLimitStore[key] || rateLimitStore[key].resetTime < now) {
    rateLimitStore[key] = { count: 1, resetTime: now + windowMs };
    return { allowed: true, remainingAttempts: maxAttempts - 1, resetIn: windowMs };
  }

  rateLimitStore[key].count++;
  const remaining = maxAttempts - rateLimitStore[key].count;
  const resetIn = rateLimitStore[key].resetTime - now;

  return {
    allowed: remaining >= 0,
    remainingAttempts: Math.max(0, remaining),
    resetIn
  };
}

/**
 * Generate a secure random token (for CSRF, etc.)
 */
export function generateSecureToken(length: number = 32): string {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Check if a URL is safe (no javascript: or data: protocols)
 */
export function isSafeUrl(url: string): boolean {
  if (!url) return false;

  try {
    const parsed = new URL(url, window.location.origin);
    const unsafeProtocols = ['javascript:', 'data:', 'vbscript:'];
    return !unsafeProtocols.some(proto => parsed.protocol === proto);
  } catch {
    return false;
  }
}
