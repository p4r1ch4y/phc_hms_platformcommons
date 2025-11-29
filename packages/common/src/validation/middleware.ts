import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

/**
 * Express middleware factory for validating request bodies using Zod schemas.
 * Returns 400 with validation errors if validation fails.
 */
export const validateBody = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.body);
            // Replace body with validated and transformed data
            req.body = validated;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    message: 'Validation failed',
                    errors
                });
            }
            return res.status(400).json({
                message: 'Invalid request data'
            });
        }
    };
};

/**
 * Express middleware factory for validating request query parameters using Zod schemas.
 */
export const validateQuery = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.query);
            req.query = validated as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    message: 'Invalid query parameters',
                    errors
                });
            }
            return res.status(400).json({
                message: 'Invalid query parameters'
            });
        }
    };
};

/**
 * Express middleware factory for validating request params using Zod schemas.
 */
export const validateParams = <T>(schema: ZodSchema<T>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            const validated = schema.parse(req.params);
            req.params = validated as any;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));
                return res.status(400).json({
                    message: 'Invalid path parameters',
                    errors
                });
            }
            return res.status(400).json({
                message: 'Invalid path parameters'
            });
        }
    };
};
