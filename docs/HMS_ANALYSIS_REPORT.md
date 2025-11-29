# PHC HMS Platform - Comprehensive Analysis Report

## Executive Summary

This report provides a detailed analysis of the PHC (Primary Health Centre) Hospital Management System, a multi-tenant SaaS platform designed for managing healthcare facilities. The system follows a microservices architecture with schema-based multi-tenancy using PostgreSQL.

### Overall Assessment

| Area | Score | Status |
|------|-------|--------|
| Code Quality | 6/10 | Needs improvement |
| Security | 5/10 | Critical issues found |
| Architecture | 7/10 | Good foundation |
| Performance | 6/10 | Optimization needed |
| Feature Completeness | 5/10 | MVP incomplete |
| Frontend UX | 6/10 | Basic but functional |

---

## Section 1: Code Quality Findings & Fixes

### 1.1 Code Smells & Anti-patterns

#### Critical Issues

1. **Duplicate Tenant Client Logic**
   - Files: `apps/*/src/utils/tenant-db.ts` (4 identical files)
   - Problem: Same code duplicated across services
   - Fix: Move to `packages/common`

```typescript
// Before: Duplicated in each service
// After: packages/common/src/utils/tenant-db.ts
import { TenantClient } from '@phc/database';

const clients = new Map<string, TenantClient>();

export const getTenantClient = (tenantSlug: string): TenantClient => {
    if (!tenantSlug || typeof tenantSlug !== 'string') {
        throw new Error('Invalid tenant slug');
    }
    
    // Validate slug format to prevent injection
    if (!/^[a-z0-9_-]+$/i.test(tenantSlug)) {
        throw new Error('Invalid tenant slug format');
    }
    
    if (clients.has(tenantSlug)) {
        return clients.get(tenantSlug)!;
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('DATABASE_URL not configured');
    }
    
    const tenantUrl = `${databaseUrl}?schema=${tenantSlug}`;
    const client = new TenantClient({
        datasources: { db: { url: tenantUrl } },
    });

    clients.set(tenantSlug, client);
    return client;
};
```

2. **Inconsistent Error Handling**
   - Files: All controllers
   - Problem: Generic `catch` blocks with no error classification

```typescript
// Before
} catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Internal server error' });
}

// After: Create error handler middleware
// packages/common/src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
    }
}

export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error(`[${new Date().toISOString()}] Error:`, {
        path: req.path,
        method: req.method,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code
        });
    }

    res.status(500).json({
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
    });
};
```

3. **Missing Input Validation**
   - Files: All route handlers
   - Problem: No validation on request bodies

```typescript
// Add to packages/common/src/validation/schemas.ts
import { z } from 'zod';

export const PatientSchema = z.object({
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    dateOfBirth: z.string().refine((date) => !isNaN(Date.parse(date)), {
        message: 'Invalid date format'
    }),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    phone: z.string().regex(/^[0-9]{10}$/).optional(),
    address: z.string().max(500).optional(),
    abhaId: z.string().regex(/^\d{2}-\d{4}-\d{4}-\d{4}$/).optional()
});

export const LoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});

export const TenantSchema = z.object({
    name: z.string().min(1).max(200),
    slug: z.string().regex(/^[a-z0-9_]+$/).min(3).max(50),
    address: z.string().max(500).optional(),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(8),
    adminName: z.string().min(1).max(100)
});
```

### 1.2 TypeScript Issues

1. **Use of `any` type**
   - `apps/frontend/src/pages/dashboard/Home.tsx` line 15: `recentPatients<any[]>`
   - `apps/consultation-service/src/controllers/consultation.controller.ts` line 65: `where: any`

2. **Missing type definitions**
   - No shared DTOs between frontend and backend
   - Recommendation: Create `packages/types` with shared interfaces

### 1.3 Linting Issues Found

| File | Issue | Severity |
|------|-------|----------|
| `pharmacy-service/src/index.ts` | Missing `helmet` middleware | Medium |
| `auth.controller.ts` | Unused import potential | Low |
| Frontend components | Inconsistent prop types | Medium |

---

## Section 2: Security & Database Review

### 2.1 Database Security Analysis

#### Multi-Tenancy Implementation

**Current Approach**: Schema-based isolation ✓
**Assessment**: Good choice for data isolation

**Issues Found**:

1. **SQL Injection Risk in Schema Creation**
   - File: `apps/tenant-service/src/utils/schema-manager.ts`
   
```typescript
// VULNERABLE CODE
await managementClient.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${slug}"`);

// FIX: Validate and sanitize slug before use
const sanitizeSchemaName = (slug: string): string => {
    if (!/^[a-z][a-z0-9_]*$/i.test(slug) || slug.length > 63) {
        throw new Error('Invalid schema name');
    }
    return slug.toLowerCase();
};

const safeSlug = sanitizeSchemaName(slug);
await managementClient.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${safeSlug}"`);
```

2. **Missing Database Indexes**
   - `PatientRegistry.tenantId` - needs index for queries
   - `Consultation.status` - needs index for queue filtering
   - `Batch.expiryDate` - needs index for expiry alerts

```prisma
// Add to schema.prisma
model PatientRegistry {
  // ... existing fields
  @@index([tenantId])
  @@index([abhaId])
}

// Add to tenant.prisma
model Consultation {
  // ... existing fields
  @@index([status])
  @@index([patientId])
  @@index([doctorId])
}

model Batch {
  // ... existing fields
  @@index([expiryDate])
  @@index([medicineId])
}
```

### 2.2 Authentication & Authorization

#### Current Implementation Analysis

| Feature | Status | Risk Level |
|---------|--------|------------|
| JWT Authentication | ✓ Implemented | Medium |
| Password Hashing | ✓ bcrypt | Low |
| Role-Based Access | ✓ Basic | Medium |
| Tenant Isolation | ⚠ Partial | HIGH |
| Token Expiry | ✓ 24h | Medium |
| Refresh Tokens | ✗ Missing | Medium |

#### Critical Security Issues

1. **Hardcoded JWT Secret**
   - File: `packages/common/src/utils/jwt.ts`
   
```typescript
// INSECURE
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

// FIX: Fail if not set in production
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production');
    }
    console.warn('WARNING: Using default JWT_SECRET. Set JWT_SECRET env var for production.');
}
const secret = JWT_SECRET || 'dev-only-secret-change-in-prod';
```

2. **Missing Tenant Context Validation**
   - Users can potentially access other tenant's data by modifying `x-tenant-slug` header
   
```typescript
// FIX: Add tenant context middleware
// packages/common/src/middleware/tenant-context.ts
export const validateTenantContext = async (
    req: Request, 
    res: Response, 
    next: NextFunction
) => {
    const headerSlug = req.headers['x-tenant-slug'] as string;
    const userTenantId = req.user?.tenantId;
    
    if (!headerSlug) {
        return res.status(400).json({ message: 'Tenant context required' });
    }
    
    // Verify user belongs to the requested tenant
    const tenant = await managementClient.tenant.findFirst({
        where: { 
            slug: headerSlug,
            id: userTenantId 
        }
    });
    
    if (!tenant) {
        return res.status(403).json({ message: 'Access denied to this tenant' });
    }
    
    req.tenantSlug = headerSlug;
    next();
};
```

3. **Open Registration Endpoint**
   - Anyone can register as HOSPITAL_ADMIN
   - File: `apps/auth-service/src/routes/auth.routes.ts`

```typescript
// Current - INSECURE
router.post('/register', register);

// FIX: Restrict registration to authenticated admins or require invitation
router.post('/register', authenticate, authorize(['SUPER_ADMIN']), register);
// OR implement invitation system
```

4. **No Rate Limiting**
   - Login endpoint vulnerable to brute force
   
```typescript
// Add rate limiting
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { error: 'Too many login attempts, try again later' }
});

router.post('/login', loginLimiter, login);
```

### 2.3 Security Score Justification: 5/10

**Positives:**
- ✓ Schema-based tenant isolation
- ✓ Password hashing with bcrypt
- ✓ JWT-based authentication
- ✓ Basic RBAC implementation

**Critical Gaps:**
- ✗ No input validation on most endpoints
- ✗ SQL injection possible in schema creation
- ✗ Tenant context not properly validated
- ✗ No rate limiting
- ✗ Hardcoded secrets fallback
- ✗ No audit logging
- ✗ Open registration endpoint

---

## Section 3: Compliance & Data Protection

### 3.1 Healthcare Compliance Considerations

| Requirement | Status | Priority |
|-------------|--------|----------|
| Audit Logging | ✗ Not implemented | Critical |
| Data Encryption at Rest | ? DB dependent | High |
| Access Logging | ✗ Not implemented | Critical |
| Consent Management | ✗ Not implemented | High |
| Data Retention Policy | ✗ Not implemented | Medium |
| Data Export (Right to Access) | ✗ Not implemented | Medium |

### 3.2 Missing Audit Trail Implementation

```typescript
// packages/database/prisma/audit.prisma
model AuditLog {
  id          String   @id @default(uuid())
  timestamp   DateTime @default(now())
  userId      String
  userEmail   String
  tenantId    String?
  action      String   // CREATE, READ, UPDATE, DELETE
  resource    String   // Patient, Consultation, Medicine
  resourceId  String?
  details     Json?    // Changed fields
  ipAddress   String?
  userAgent   String?
  
  @@index([timestamp])
  @@index([userId])
  @@index([tenantId])
  @@index([resource, resourceId])
}

// packages/common/src/services/audit.service.ts
export const auditLog = async (params: {
    userId: string;
    userEmail: string;
    tenantId?: string;
    action: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
    resource: string;
    resourceId?: string;
    details?: Record<string, any>;
    req: Request;
}) => {
    await managementClient.auditLog.create({
        data: {
            ...params,
            ipAddress: params.req.ip,
            userAgent: params.req.get('user-agent')
        }
    });
};
```

### 3.3 Consent Flow Recommendations

```typescript
// Add to tenant.prisma
model ConsentRecord {
  id          String   @id @default(uuid())
  patientId   String
  patient     Patient  @relation(fields: [patientId], references: [id])
  consentType String   // DATA_COLLECTION, DATA_SHARING, TREATMENT
  granted     Boolean
  grantedAt   DateTime?
  revokedAt   DateTime?
  ipAddress   String?
  
  @@index([patientId])
}
```

---

## Section 4: Architecture & Performance

### 4.1 Current Architecture Assessment

**Strengths:**
- ✓ Microservices separation
- ✓ Shared packages (common, database)
- ✓ Docker containerization
- ✓ API Gateway pattern

**Weaknesses:**
- ✗ No service discovery
- ✗ No message queue for async operations
- ✗ Hardcoded service URLs
- ✗ No centralized logging

### 4.2 Performance Issues Identified

1. **N+1 Query in Patient Stats**
   - File: `apps/patient-service/src/controllers/patient.controller.ts`

```typescript
// PROBLEM: Fetches all patients to calculate age distribution
const patients = await client.patient.findMany({
    select: { dateOfBirth: true }
});

// FIX: Use database aggregation
const ageStats = await client.$queryRaw`
    SELECT 
        CASE 
            WHEN EXTRACT(YEAR FROM AGE(NOW(), "dateOfBirth")) <= 12 THEN '0-12'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), "dateOfBirth")) <= 18 THEN '13-18'
            WHEN EXTRACT(YEAR FROM AGE(NOW(), "dateOfBirth")) <= 60 THEN '19-60'
            ELSE '60+'
        END as age_group,
        COUNT(*) as count
    FROM "Patient"
    GROUP BY age_group
`;
```

2. **Missing Pagination**
   - `listPatients` - fetches all patients
   - `listConsultations` - fetches all consultations
   - `getInventory` - fetches all medicines

```typescript
// FIX: Add pagination
export const listPatients = async (req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;
    
    const [patients, total] = await Promise.all([
        client.patient.findMany({
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' }
        }),
        client.patient.count()
    ]);
    
    res.json({
        data: patients,
        pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
        }
    });
};
```

3. **No Caching Layer**
   - Frequent queries for stats
   - Medicine inventory lookups

### 4.3 Recommended Architecture Improvements

```
┌─────────────────┐     ┌─────────────────┐
│   Load Balancer │     │   Redis Cache   │
└────────┬────────┘     └────────┬────────┘
         │                       │
┌────────▼────────┐     ┌───────▼────────┐
│   API Gateway   │────►│  Rate Limiter  │
└────────┬────────┘     └────────────────┘
         │
    ┌────┴────┬─────────┬─────────┐
    │         │         │         │
┌───▼───┐ ┌───▼───┐ ┌───▼───┐ ┌───▼───┐
│ Auth  │ │Patient│ │Consult│ │Pharma │
└───┬───┘ └───┬───┘ └───┬───┘ └───┬───┘
    │         │         │         │
    └─────────┴────┬────┴─────────┘
                   │
           ┌───────▼───────┐
           │   PostgreSQL  │
           │ (Multi-tenant)│
           └───────────────┘
```

### 4.4 Background Job Candidates

| Job | Current | Recommended |
|-----|---------|-------------|
| Report Generation | Sync | Bull Queue |
| Expiry Alerts | None | Cron Job |
| Data Backup | Manual | Scheduled |
| Audit Log Cleanup | None | Scheduled |

---

## Section 5: Feature Gaps & Roadmap

### 5.1 Current Feature Status

| Feature | Status | Completeness |
|---------|--------|--------------|
| Patient Registration | ✓ | 80% |
| Vitals Recording | ✓ | 70% |
| Consultation | ✓ | 60% |
| Prescription | ⚠ Partial | 40% |
| Pharmacy/Inventory | ✓ | 70% |
| Lab Management | ✗ | 0% |
| Billing | ✗ | 0% |
| Appointment Scheduling | ✗ | 0% |
| Reports | ⚠ Basic | 30% |
| ABHA Integration | ⚠ Partial | 20% |

### 5.2 Feature Roadmap

#### Tier 1: MVP Critical (1-2 months)

1. **Complete Prescription Module**
   - Files to modify: `consultation.controller.ts`, `tenant.prisma`
   - Add: Medicine selection from inventory
   - Add: Dosage instructions
   - Add: Print/PDF generation

2. **Appointment Scheduling**
   - New files needed: `apps/appointment-service/`
   - Add: Doctor availability slots
   - Add: Patient booking flow
   - Add: Queue management

3. **Basic Billing**
   - New files: `apps/billing-service/`
   - Add: Consultation charges
   - Add: Medicine billing
   - Add: Receipt generation

4. **Security Hardening**
   - Input validation on all endpoints
   - Rate limiting
   - Audit logging
   - Proper tenant isolation

#### Tier 2: Enhanced Usability (2-4 months)

1. **Lab Module**
   - Lab test ordering
   - Result entry
   - Report generation

2. **Enhanced Reports**
   - Exportable reports (PDF/Excel)
   - Custom date ranges
   - Disease outbreak tracking

3. **Notification System**
   - SMS notifications
   - Email alerts
   - Low stock alerts

4. **ABHA Integration**
   - Full ABDM compliance
   - Health record sharing
   - QR code scanning

#### Tier 3: Advanced Features (4-6 months)

1. **AI/ML Features**
   - OCR for prescriptions
   - Drug interaction warnings
   - Diagnostic suggestions

2. **Offline Support**
   - PWA implementation
   - Local data sync
   - Conflict resolution

3. **Multi-language Support**
   - Hindi, Regional languages
   - RTL support

4. **Advanced Analytics**
   - Disease patterns
   - Resource utilization
   - Predictive analytics

---

## Section 6: Frontend UX/UI Improvements

### 6.1 Current Issues

1. **No Loading Skeletons**
   - Currently shows "Loading..." text
   - Better: Skeleton placeholders

2. **Poor Error States**
   - Generic error messages
   - No retry functionality

3. **Form Validation**
   - Client-side validation missing
   - No inline error messages

4. **Accessibility Issues**
   - Missing ARIA labels
   - Poor keyboard navigation
   - No screen reader support

### 6.2 Quick Wins (Implementable Immediately)

#### 1. Add Loading Skeleton Component

```tsx
// apps/frontend/src/components/ui/Skeleton.tsx
export const Skeleton = ({ className }: { className?: string }) => (
    <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-10 w-1/4" />
            </div>
        ))}
    </div>
);
```

#### 2. Enhanced Error Boundary

```tsx
// apps/frontend/src/components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    state: State = { hasError: false };

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || (
                <div className="p-8 text-center">
                    <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-slate-900 mb-2">
                        Something went wrong
                    </h2>
                    <p className="text-slate-500 mb-4">
                        {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
```

#### 3. Form Validation with React Hook Form

```tsx
// Example: RegisterPatient.tsx with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
    gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
    phone: z.string().regex(/^[0-9]{10}$/, 'Invalid phone number').optional().or(z.literal('')),
    abhaId: z.string().regex(/^\d{2}-\d{4}-\d{4}-\d{4}$/, 'Invalid ABHA ID format').optional().or(z.literal(''))
});

const RegisterPatient = () => {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(schema)
    });
    
    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('firstName')} />
            {errors.firstName && (
                <span className="text-red-500 text-sm">{errors.firstName.message}</span>
            )}
            {/* ... rest of form */}
        </form>
    );
};
```

#### 4. API Error Toast Notifications

```tsx
// apps/frontend/src/hooks/useToast.tsx
import { useState, createContext, useContext } from 'react';

interface Toast {
    id: string;
    message: string;
    type: 'success' | 'error' | 'warning';
}

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);
    
    const addToast = (message: string, type: Toast['type'] = 'success') => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 5000);
    };
    
    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}
            <div className="fixed bottom-4 right-4 space-y-2 z-50">
                {toasts.map(toast => (
                    <div 
                        key={toast.id}
                        className={`px-4 py-2 rounded-lg shadow-lg ${
                            toast.type === 'error' ? 'bg-red-500' : 
                            toast.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
                        } text-white`}
                    >
                        {toast.message}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
};
```

#### 5. Improved Workflow Clarity

Add breadcrumbs and progress indicators for multi-step workflows:

```tsx
// apps/frontend/src/components/ui/Breadcrumb.tsx
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

export const Breadcrumb = ({ items }: { items: BreadcrumbItem[] }) => (
    <nav className="flex items-center gap-2 text-sm text-slate-500 mb-4">
        {items.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
                {i > 0 && <ChevronRight className="h-4 w-4" />}
                {item.href ? (
                    <Link to={item.href} className="hover:text-primary-600">
                        {item.label}
                    </Link>
                ) : (
                    <span className="text-slate-900 font-medium">{item.label}</span>
                )}
            </span>
        ))}
    </nav>
);
```

### 6.3 Accessibility Improvements

```tsx
// Add to all interactive elements
<button
    aria-label="Register new patient"
    aria-describedby="patient-form-help"
    // ...
>
    Register Patient
</button>

// Form fields
<label htmlFor="firstName" className="sr-only">First Name</label>
<input
    id="firstName"
    aria-required="true"
    aria-invalid={!!errors.firstName}
    aria-describedby={errors.firstName ? 'firstName-error' : undefined}
    // ...
/>
{errors.firstName && (
    <span id="firstName-error" role="alert" className="text-red-500">
        {errors.firstName.message}
    </span>
)}
```

---

## Appendix A: File Reference

### Backend Services
- `apps/api-gateway/` - Request routing and proxying
- `apps/auth-service/` - Authentication and user management
- `apps/tenant-service/` - Multi-tenancy management
- `apps/patient-service/` - Patient records and vitals
- `apps/consultation-service/` - Medical consultations
- `apps/pharmacy-service/` - Medicine inventory

### Shared Packages
- `packages/common/` - Middleware, utilities
- `packages/database/` - Prisma schemas, clients

### Frontend
- `apps/frontend/src/pages/` - Route components
- `apps/frontend/src/components/` - Reusable UI components
- `apps/frontend/src/api/` - API client configuration

---

## Appendix B: Recommended Dependency Updates

| Package | Current | Recommended | Reason |
|---------|---------|-------------|--------|
| express | 4.18.2 | 4.18.2 | Current ✓ |
| prisma | 5.10.2 | 5.x latest | Security patches |
| jsonwebtoken | 9.0.2 | 9.x latest | Security |
| bcryptjs | 2.4.3 | 2.4.3 | Current ✓ |
| react | (check) | 18.x | Performance |

### New Dependencies to Add

```json
{
    "dependencies": {
        "express-rate-limit": "^7.x",
        "zod": "^3.x",
        "winston": "^3.x",
        "ioredis": "^5.x"
    },
    "devDependencies": {
        "@types/express-rate-limit": "^6.x",
        "jest": "^29.x",
        "@testing-library/react": "^14.x"
    }
}
```

---

*Report generated for PHC HMS Platform Commons v1.0.0*
*Analysis Date: November 2024*
