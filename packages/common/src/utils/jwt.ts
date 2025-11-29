import jwt from 'jsonwebtoken';

// Validate JWT_SECRET in production
const getJwtSecret = (): string => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        if (process.env.NODE_ENV === 'production') {
            throw new Error('JWT_SECRET environment variable must be set in production');
        }
        console.warn('WARNING: Using default JWT_SECRET. Set JWT_SECRET environment variable for production.');
        return 'dev-only-secret-do-not-use-in-production';
    }
    return secret;
};

// const JWT_SECRET = getJwtSecret();

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    tenantId?: string;
}

export const signToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, getJwtSecret(), { expiresIn: '24h' });
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, getJwtSecret()) as TokenPayload;
};
