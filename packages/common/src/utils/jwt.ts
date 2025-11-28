import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    tenantId?: string;
}

export const signToken = (payload: TokenPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

export const verifyToken = (token: string): TokenPayload => {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
};
