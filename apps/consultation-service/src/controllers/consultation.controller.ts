import { Request, Response } from 'express';
import { getTenantClient } from '../utils/tenant-db';

export const createConsultation = async (req: Request, res: Response) => {
    try {
        const { patientId, doctorId } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] as string;

        const actualDoctorId = doctorId || req.user?.userId;

        if (!tenantSlug) {
            return res.status(400).json({ message: 'Tenant slug header missing' });
        }

        const client = getTenantClient(tenantSlug);
        const consultation = await client.consultation.create({
            data: {
                patientId,
                doctorId: actualDoctorId,
                status: 'PENDING',
            },
        });

        res.status(201).json(consultation);
    } catch (error) {
        console.error('Create consultation error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const updateDiagnosis = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { diagnosis, prescription, status } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] as string;

        if (!tenantSlug) {
            return res.status(400).json({ message: 'Tenant slug header missing' });
        }

        const client = getTenantClient(tenantSlug);
        const consultation = await client.consultation.update({
            where: { id },
            data: {
                diagnosis,
                prescription,
                status: status || 'COMPLETED',
            },
        });

        res.json(consultation);
    } catch (error) {
        console.error('Update diagnosis error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const listConsultations = async (req: Request, res: Response) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        const { patientId, doctorId } = req.query;

        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const where: any = {};
        if (patientId) where.patientId = patientId as string;
        if (doctorId) where.doctorId = doctorId as string;

        const client = getTenantClient(tenantSlug);
        const consultations = await client.consultation.findMany({
            where,
            include: { patient: true },
            orderBy: { createdAt: 'desc' }
        });

        res.json(consultations);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getConsultationStats = async (req: Request, res: Response) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug);

        // Count consultations for today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayConsultations = await client.consultation.count({
            where: {
                createdAt: {
                    gte: today
                }
            }
        });

        const pendingConsultations = await client.consultation.count({
            where: {
                status: 'PENDING'
            }
        });

        res.json({ todayConsultations, pendingConsultations });
    } catch (error) {
        console.error('Get consultation stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
