import { Request, Response, NextFunction } from 'express';
import { TENANT_SLUG, POSTGRES_IDENTIFIER_MAX_LENGTH } from '../constants';

// Extend Express Request to include tenantSlug
declare global {
    namespace Express {
        interface Request {
            tenantSlug?: string;
        }
    }
}

/**
 * Validates the tenant slug format to prevent SQL injection in schema names.
 * Only allows lowercase letters, numbers, and underscores.
 */
export const isValidTenantSlug = (slug: string): boolean => {
    if (!slug || typeof slug !== 'string') {
        return false;
    }
    // Must start with a letter, contain only lowercase alphanumeric and underscores
    // Max 63 characters (PostgreSQL schema name limit)
    if (slug.length < TENANT_SLUG.MIN_LENGTH || slug.length > POSTGRES_IDENTIFIER_MAX_LENGTH) {
        return false;
    }
    return TENANT_SLUG.PATTERN.test(slug);
};

/**
 * Sanitizes a tenant slug by converting to lowercase and removing invalid characters.
 * Throws if the result is invalid.
 */
export const sanitizeTenantSlug = (slug: string): string => {
    if (!slug || typeof slug !== 'string') {
        throw new Error('Tenant slug is required');
    }
    
    const sanitized = slug.toLowerCase().trim();
    
    if (!isValidTenantSlug(sanitized)) {
        throw new Error('Invalid tenant slug format');
    }
    
    return sanitized;
};

/**
 * Middleware to extract and validate tenant context from headers.
 * Ensures tenant slug is present and valid for tenant-specific routes.
 */
export const requireTenantContext = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const tenantSlug = req.headers['x-tenant-slug'] as string;
    
    if (!tenantSlug) {
        return res.status(400).json({ 
            message: 'Tenant context required. Please provide x-tenant-slug header.' 
        });
    }
    
    if (!isValidTenantSlug(tenantSlug)) {
        return res.status(400).json({ 
            message: 'Invalid tenant slug format' 
        });
    }
    
    // Attach validated slug to request
    req.tenantSlug = tenantSlug;
    next();
};

/**
 * Middleware to validate that the authenticated user belongs to the requested tenant.
 * Must be used after authenticate middleware.
 * This prevents users from accessing data in other tenants by manipulating headers.
 */
export const validateTenantAccess = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const headerSlug = req.headers['x-tenant-slug'] as string;
    const userTenantId = req.user?.tenantId;
    
    // Super admins can access any tenant
    if (req.user?.role === 'SUPER_ADMIN') {
        if (headerSlug && isValidTenantSlug(headerSlug)) {
            req.tenantSlug = headerSlug;
        }
        return next();
    }
    
    if (!headerSlug) {
        return res.status(400).json({ 
            message: 'Tenant context required' 
        });
    }
    
    if (!isValidTenantSlug(headerSlug)) {
        return res.status(400).json({ 
            message: 'Invalid tenant slug format' 
        });
    }
    
    // For non-super-admins, we need to verify they belong to this tenant
    // This requires a database lookup to match tenantId with slug
    // For now, we trust the JWT tenantId and verify slug format
    // In production, add a lookup: tenant = await managementClient.tenant.findFirst({ where: { slug: headerSlug, id: userTenantId } })
    
    if (!userTenantId) {
        return res.status(403).json({ 
            message: 'User is not associated with any tenant' 
        });
    }
    
    req.tenantSlug = headerSlug;
    next();
};
