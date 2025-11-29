import { Request, Response } from 'express';
import { getTenantClient } from '../utils/tenant-db';
import { managementClient } from '@phc/database';
import { calculateRisk } from '../utils/triage';

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

export const updatePatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log('Update Patient Request:', { id, body: req.body });
        const { firstName, lastName, dateOfBirth, gender, phone, address, abhaId } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] as string;

        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug);

        // Check if patient exists
        const existingPatient = await client.patient.findUnique({ where: { id } });
        if (!existingPatient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const updatedPatient = await client.patient.update({
            where: { id },
            data: {
                firstName,
                lastName,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                gender,
                phone,
                address,
                abhaId
            }
        });

        // Sync to Global Registry if ABHA ID changed
        if (abhaId && abhaId !== existingPatient.abhaId) {
            try {
                await managementClient.patientRegistry.updateMany({
                    where: { patientId: id },
                    data: { abhaId }
                });
            } catch (registryError) {
                console.error('Failed to sync update to Patient Registry:', registryError);
            }
        }

        res.json(updatedPatient);
    } catch (error) {
        console.error('Update patient error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getPatient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug);
        const patient = await client.patient.findUnique({
            where: { id },
            include: {
                vitals: {
                    orderBy: { recordedAt: 'desc' },
                    take: 10
                },
                consultations: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                }
            }
        });

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        res.json(patient);
    } catch (error) {
        console.error('Get patient error:', error);
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

        const vitalsData = {
            patientId,
            temperature: parseFloat(temperature),
            bloodPressure,
            pulse: parseInt(pulse),
            weight: parseFloat(weight),
            height: parseFloat(height),
            bloodSugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
            spo2: req.body.spo2 ? parseFloat(req.body.spo2) : undefined,
        };

        const { riskLevel, triageNote } = calculateRisk(vitalsData);

        const vitals = await client.vitals.create({
            data: {
                ...vitalsData,
                bloodSugar: vitalsData.bloodSugar ?? null, // Handle optional field for Prisma
                recordedBy: userId,
                riskLevel,
                triageNote
            } as any
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

        // Gender Distribution
        const genderStats = await client.patient.groupBy({
            by: ['gender'],
            _count: {
                gender: true
            }
        });

        // Age Distribution (Simplified)
        const patients = await client.patient.findMany({
            select: { dateOfBirth: true }
        });

        const ageGroups: Record<string, number> = {
            '0-12': 0,
            '13-18': 0,
            '19-60': 0,
            '60+': 0
        };

        const now = new Date();
        patients.forEach(p => {
            const age = now.getFullYear() - p.dateOfBirth.getFullYear();
            if (age <= 12) ageGroups['0-12']++;
            else if (age <= 18) ageGroups['13-18']++;
            else if (age <= 60) ageGroups['19-60']++;
            else ageGroups['60+']++;
        });

        res.json({
            totalPatients,
            newPatients,
            genderDistribution: genderStats.map(g => ({ name: g.gender, value: g._count.gender })),
            ageDistribution: Object.entries(ageGroups).map(([name, value]) => ({ name, value }))
        });
    } catch (error) {
        console.error('Get patient stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
export const getHighRiskPatients = async (req: Request, res: Response) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug);

        // Find patients with recent high risk vitals
        // We look for vitals recorded in the last 24 hours that are HIGH or CRITICAL
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const highRiskVitals = await client.vitals.findMany({
            where: {
                recordedAt: {
                    gte: yesterday
                },
                riskLevel: {
                    in: ['HIGH', 'CRITICAL']
                }
            },
            include: {
                patient: true
            },
            orderBy: {
                recordedAt: 'desc'
            }
        });

        // Deduplicate patients (keep latest vital)
        const patientMap = new Map();
        highRiskVitals.forEach(vital => {
            if (!patientMap.has(vital.patientId)) {
                patientMap.set(vital.patientId, {
                    patient: vital.patient,
                    vital: {
                        riskLevel: vital.riskLevel,
                        recordedAt: vital.recordedAt,
                        triageNote: vital.triageNote,
                        bloodPressure: vital.bloodPressure,
                        temperature: vital.temperature
                    }
                });
            }
        });

        res.json(Array.from(patientMap.values()));
    } catch (error) {
        console.error('Get high risk patients error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
