import { Request, Response } from 'express';
import { getTenantClient } from '../utils/tenant-db';
import { managementClient } from '@phc/database';

export const registerPatient = async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, dateOfBirth, gender, phone, address, abhaId } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        const tenantId = req.user?.tenantId;

        if (!tenantSlug || !tenantId) {
            return res.status(400).json({ message: 'Tenant context missing' });
        }

        const client = getTenantClient(tenantSlug);

        // Check if patient exists locally
        const existingPatient = await client.patient.findFirst({
            where: { abhaId }
        });

        if (existingPatient) {
            return res.status(400).json({ message: 'Patient with this ABHA ID already exists in this PHC' });
        }

        // Create patient in Tenant DB
        const patient = await client.patient.create({
            data: {
                firstName,
                lastName,
                dateOfBirth: new Date(dateOfBirth),
                gender,
                phone,
                address,
                abhaId
            }
        });

        // Sync to Global Registry (Management DB)
        if (abhaId) {
            try {
                await managementClient.patientRegistry.create({
                    data: {
                        abhaId,
                        tenantId,
                        patientId: patient.id
                    }
                });
            } catch (registryError) {
                console.error('Failed to sync to Patient Registry:', registryError);
            }
        }

        res.status(201).json(patient);
    } catch (error) {
        console.error('Register patient error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const searchGlobal = async (req: Request, res: Response) => {
    try {
        const { abhaId } = req.query;

        if (!abhaId || typeof abhaId !== 'string') {
            return res.status(400).json({ message: 'ABHA ID is required' });
        }

        // 1. Search in Global Registry
        const registryEntry = await managementClient.patientRegistry.findUnique({
            where: { abhaId },
            include: { tenant: true }
        });

        if (!registryEntry) {
            return res.status(404).json({ message: 'Patient not found in global registry' });
        }

        // 2. Fetch details from the specific Tenant DB
        const tenantSlug = registryEntry.tenant.slug;
        const client = getTenantClient(tenantSlug);

        const patient = await client.patient.findUnique({
            where: { id: registryEntry.patientId }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient record missing in home PHC' });
        }

        res.json({
            ...patient,
            homePhc: registryEntry.tenant.name
        });
    } catch (error) {
        console.error('Global search error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const listPatients = async (req: Request, res: Response) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug);
        const patients = await client.patient.findMany({
            orderBy: { createdAt: 'desc' }
        });

        res.json(patients);
    } catch (error) {
        console.error('List patients error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const recordVitals = async (req: Request, res: Response) => {
    try {
        const { patientId } = req.params;
        const { temperature, bloodPressure, pulse, weight, height, bloodSugar } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        const userId = req.user?.userId;

        if (!tenantSlug || !userId) return res.status(400).json({ message: 'Context missing' });

        const client = getTenantClient(tenantSlug);

        const vitals = await client.vitals.create({
            data: {
                patientId,
                temperature: parseFloat(temperature),
                bloodPressure,
                pulse: parseInt(pulse),
                weight: parseFloat(weight),
                height: parseFloat(height),
                bloodSugar: bloodSugar ? parseFloat(bloodSugar) : null,
                recordedBy: userId
            }
        });

        res.status(201).json(vitals);
    } catch (error) {
        console.error('Record vitals error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPatientStats = async (req: Request, res: Response) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug);

        const totalPatients = await client.patient.count();

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const newPatients = await client.patient.count({
            where: {
                createdAt: {
                    gte: today
                }
            }
        });

        res.json({ totalPatients, newPatients });
    } catch (error) {
        console.error('Get patient stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
