import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { managementClient } from '@phc/database';
import { signToken } from '@phc/common';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role, tenantId } = req.body;

        // Check if user exists
        const existingUser = await managementClient.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await managementClient.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role || 'HOSPITAL_ADMIN', // Default to Hospital Admin if not specified
                tenantId,
            },
        });

        // Generate token
        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId || undefined,
        });

        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Find user with tenant details
        const user = await managementClient.user.findUnique({
            where: { email },
            include: { tenant: true },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = signToken({
            userId: user.id,
            email: user.email,
            role: user.role,
            tenantId: user.tenantId || undefined,
        });

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                firstName: user.name?.split(' ')[0] || user.name,
                lastName: user.name?.split(' ')[1] || '',
            },
            tenant: user.tenant ? {
                id: user.tenant.id,
                name: user.tenant.name,
                slug: user.tenant.slug,
            } : null
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const createStaff = async (req: Request, res: Response) => {
    try {
        const { email, password, name, role } = req.body;
        const adminTenantId = req.user?.tenantId;

        if (!adminTenantId) {
            return res.status(400).json({ message: 'Admin must belong to a tenant to create staff' });
        }

        // Check if user exists
        const existingUser = await managementClient.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user linked to the same tenant
        const user = await managementClient.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: role, // Role should be passed (e.g., DOCTOR, NURSE)
                tenantId: adminTenantId,
            },
        });

        res.status(201).json({
            message: 'Staff created successfully',
            user: { id: user.id, email: user.email, role: user.role, name: user.name }
        });
    } catch (error) {
        console.error('Create staff error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getStaff = async (req: Request, res: Response) => {
    try {
        const tenantId = req.user?.tenantId;

        if (!tenantId) {
            return res.status(400).json({ message: 'User must belong to a tenant to view staff' });
        }

        const staff = await managementClient.user.findMany({
            where: { tenantId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true
            }
        });

        res.json(staff);
    } catch (error) {
        console.error('Get staff error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
