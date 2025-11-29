import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error class with HTTP status code support.
 */
export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = 'AppError';
    }
}

/**
 * Express error handling middleware.
 * Should be registered after all routes.
 */
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction
) => {
    // Log the error
    console.error(`[${new Date().toISOString()}] Error:`, {
        path: req.path,
        method: req.method,
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
        userId: (req as any).user?.userId,
        tenantSlug: req.headers['x-tenant-slug']
    });

    // Handle known AppError instances
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: err.message,
            code: err.code
        });
    }

    // Handle Prisma errors
    if (err.name === 'PrismaClientKnownRequestError') {
        const prismaError = err as any;
        if (prismaError.code === 'P2002') {
            return res.status(409).json({
                error: 'A record with this value already exists',
                code: 'DUPLICATE_ENTRY'
            });
        }
        if (prismaError.code === 'P2025') {
            return res.status(404).json({
                error: 'Record not found',
                code: 'NOT_FOUND'
            });
        }
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token',
            code: 'INVALID_TOKEN'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expired',
            code: 'TOKEN_EXPIRED'
        });
    }

    // Default error response - don't leak internal details in production
    res.status(500).json({
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
        code: 'INTERNAL_ERROR'
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers.
 * Eliminates the need for try-catch in every controller.
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
