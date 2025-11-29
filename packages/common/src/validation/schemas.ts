import { z } from 'zod';

// Patient validation schemas
export const PatientSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format'
    }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
    address: z.string().max(500).optional(),
    abhaId: z.string().regex(/^\d{2}-\d{4}-\d{4}-\d{4}$/, 'Invalid ABHA ID format').optional().or(z.literal(''))
});

// Auth validation schemas
export const LoginSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required')
});

export const RegisterSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100).optional(),
    role: z.enum(['SUPER_ADMIN', 'HOSPITAL_ADMIN', 'DOCTOR', 'NURSE', 'ASHA', 'LAB_TECHNICIAN', 'PHARMACIST', 'PATIENT']).optional(),
    tenantId: z.string().uuid().optional()
});

export const StaffSchema = z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    name: z.string().min(1, 'Name is required').max(100),
    role: z.enum(['DOCTOR', 'NURSE', 'ASHA', 'LAB_TECHNICIAN', 'PHARMACIST'])
});

// Tenant validation schemas
export const TenantSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    slug: z.string()
        .regex(/^[a-z][a-z0-9_]*$/, 'Slug must start with letter and contain only lowercase letters, numbers, and underscores')
        .min(3, 'Slug must be at least 3 characters')
        .max(50, 'Slug must be at most 50 characters'),
    address: z.string().max(500).optional(),
    adminEmail: z.string().email('Invalid admin email format'),
    adminPassword: z.string().min(8, 'Admin password must be at least 8 characters'),
    adminName: z.string().min(1, 'Admin name is required').max(100)
});

// Vitals validation schema
export const VitalsSchema = z.object({
    temperature: z.union([z.string(), z.number()]).transform(v => parseFloat(String(v))).optional(),
    bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'Blood pressure format should be like 120/80').optional(),
    pulse: z.union([z.string(), z.number()]).transform(v => parseInt(String(v))).optional(),
    weight: z.union([z.string(), z.number()]).transform(v => parseFloat(String(v))).optional(),
    height: z.union([z.string(), z.number()]).transform(v => parseFloat(String(v))).optional(),
    bloodSugar: z.union([z.string(), z.number()]).transform(v => parseFloat(String(v))).optional().nullable()
});

// Consultation validation schemas
export const ConsultationSchema = z.object({
    patientId: z.string().uuid('Invalid patient ID'),
    doctorId: z.string().uuid('Invalid doctor ID').optional()
});

export const DiagnosisSchema = z.object({
    diagnosis: z.string().max(1000).optional(),
    prescription: z.string().max(5000).optional(),
    status: z.enum(['PENDING', 'COMPLETED', 'CANCELLED']).optional()
});

// Pharmacy validation schemas
export const MedicineSchema = z.object({
    name: z.string().min(1, 'Medicine name is required').max(200),
    manufacturer: z.string().max(200).optional(),
    unit: z.string().min(1, 'Unit is required').max(50),
    lowStockThreshold: z.number().int().min(0).optional()
});

export const BatchSchema = z.object({
    medicineId: z.string().uuid('Invalid medicine ID'),
    batchNumber: z.string().min(1, 'Batch number is required').max(50),
    expiryDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid expiry date format'
    }),
    quantity: z.union([z.string(), z.number()]).transform(v => parseInt(String(v))).refine(v => v > 0, 'Quantity must be positive')
});

// Type exports
export type PatientInput = z.infer<typeof PatientSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type StaffInput = z.infer<typeof StaffSchema>;
export type TenantInput = z.infer<typeof TenantSchema>;
export type VitalsInput = z.infer<typeof VitalsSchema>;
export type ConsultationInput = z.infer<typeof ConsultationSchema>;
export type DiagnosisInput = z.infer<typeof DiagnosisSchema>;
export type MedicineInput = z.infer<typeof MedicineSchema>;
export type BatchInput = z.infer<typeof BatchSchema>;
