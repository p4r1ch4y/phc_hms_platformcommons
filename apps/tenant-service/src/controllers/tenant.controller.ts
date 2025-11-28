import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { managementClient } from '@phc/database';
import { createTenantSchema } from '../utils/schema-manager';

export const registerTenant = async (req: Request, res: Response) => {
    try {
        const { name, slug, address, adminEmail, adminPassword, adminName } = req.body;

        // Check if tenant exists
        const existingTenant = await managementClient.tenant.findUnique({
            where: { slug },
        });

        if (existingTenant) {
            return res.status(400).json({ message: 'Tenant identifier (slug) already exists' });
        }

        // Check if admin user exists
        const existingUser = await managementClient.user.findUnique({
            where: { email: adminEmail },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Admin email already registered' });
        }

        // 1. Create Tenant Record
        const tenant = await managementClient.tenant.create({
            data: {
                name,
                slug,
                address,
            },
        });

        // 2. Create Admin User
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const user = await managementClient.user.create({
            data: {
                email: adminEmail,
                password: hashedPassword,
                name: adminName,
                role: 'HOSPITAL_ADMIN',
                tenantId: tenant.id,
            },
        });

        // 3. Create Schema and Tables
        // Run this asynchronously to not block the response, or await if we want to ensure readiness
        await createTenantSchema(slug);

        res.status(201).json({
            message: 'Hospital registered successfully',
            tenant: { id: tenant.id, name: tenant.name, slug: tenant.slug },
            admin: { id: user.id, email: user.email }
        });

    } catch (error) {
        console.error('Tenant registration error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const listTenants = async (req: Request, res: Response) => {
    try {
        const tenants = await managementClient.tenant.findMany();
        res.json(tenants);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};
