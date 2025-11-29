/**
 * Shared constants for the PHC HMS platform.
 * These constants should be used across all services and the frontend for consistency.
 */

// Tenant slug validation constants
export const TENANT_SLUG = {
    MIN_LENGTH: 3,
    MAX_LENGTH: 50,
    // Must start with a letter, contain only lowercase letters, numbers, and underscores
    PATTERN: /^[a-z][a-z0-9_]*$/,
    ERROR_MESSAGE: 'Slug must start with a letter and contain only lowercase letters, numbers, and underscores'
} as const;

// PostgreSQL identifier limit (63 characters)
export const POSTGRES_IDENTIFIER_MAX_LENGTH = 63;

// Phone validation (Indian format - 10 digits)
export const PHONE = {
    // Indian mobile numbers: 10 digits, optionally prefixed with +91 or 91
    PATTERN: /^(\+91|91)?[6-9]\d{9}$/,
    SIMPLE_PATTERN: /^[0-9]{10}$/,
    ERROR_MESSAGE: 'Phone must be a valid 10-digit Indian mobile number'
} as const;

// ABHA ID format (Ayushman Bharat Health Account)
export const ABHA = {
    PATTERN: /^\d{2}-\d{4}-\d{4}-\d{4}$/,
    ERROR_MESSAGE: 'Invalid ABHA ID format (expected: XX-XXXX-XXXX-XXXX)'
} as const;

// Valid staff roles (subset of all roles that can be created by admins)
export const VALID_STAFF_ROLES = [
    'DOCTOR',
    'NURSE',
    'ASHA',
    'LAB_TECHNICIAN',
    'PHARMACIST'
] as const;

// All system roles
export const ALL_ROLES = [
    'SUPER_ADMIN',
    'HOSPITAL_ADMIN',
    'DOCTOR',
    'NURSE',
    'ASHA',
    'LAB_TECHNICIAN',
    'PHARMACIST',
    'PATIENT'
] as const;

// Reserved schema names that cannot be used as tenant slugs
export const RESERVED_SCHEMA_NAMES = [
    'public',
    'pg_catalog',
    'information_schema',
    'pg_toast'
] as const;

// Password requirements
export const PASSWORD = {
    MIN_LENGTH: 8,
    ERROR_MESSAGE: 'Password must be at least 8 characters'
} as const;

// Type exports
export type StaffRole = typeof VALID_STAFF_ROLES[number];
export type Role = typeof ALL_ROLES[number];
