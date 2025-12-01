import { Request, Response } from 'express';
import { getTenantClient } from '../utils/tenant-db';
import type { PrismaClient as PharmacyClient } from '@phc/database';

// Type definitions for Prisma query results
interface Batch {
    id: string;
    medicineId: string;
    batchNumber: string;
    expiryDate: Date;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

interface MedicineWithBatches {
    id: string;
    name: string;
    manufacturer: string | null;
    unit: string;
    lowStockThreshold: number;
    createdAt: Date;
    updatedAt: Date;
    batches: Batch[];
}

interface MedicineWithStock extends MedicineWithBatches {
    totalStock: number;
    status?: string;
}

// Type definitions for Prisma query results
interface Batch {
    id: string;
    medicineId: string;
    batchNumber: string;
    expiryDate: Date;
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

interface MedicineWithBatches {
    id: string;
    name: string;
    manufacturer: string | null;
    unit: string;
    lowStockThreshold: number;
    createdAt: Date;
    updatedAt: Date;
    batches: Batch[];
}

interface MedicineWithStock extends MedicineWithBatches {
    totalStock: number;
    status?: string;
}

export const addMedicine = async (req: Request, res: Response) => {
    try {
        console.log('Add Medicine Request:', req.body);
        const { name, manufacturer, unit, lowStockThreshold } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] as string;

        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug) as any;

        // Check if medicine exists
        const existingMedicine = await client.medicine.findFirst({
            where: { name: { equals: name, mode: 'insensitive' } }
        });

        if (existingMedicine) {
            return res.status(400).json({ message: 'Medicine already exists' });
        }

        const medicine = await client.medicine.create({
            data: {
                name,
                manufacturer,
                unit,
                lowStockThreshold: lowStockThreshold || 10
            }
        });

        res.status(201).json(medicine);
    } catch (error) {
        console.error('Add medicine error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const addBatch = async (req: Request, res: Response) => {
    try {
        const { medicineId, batchNumber, expiryDate, quantity } = req.body;
        const tenantSlug = req.headers['x-tenant-slug'] as string;

        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug) as any;

        const batch = await client.batch.create({
            data: {
                medicineId,
                batchNumber,
                expiryDate: new Date(expiryDate),
                quantity: parseInt(quantity)
            }
        });

        res.status(201).json(batch);
    } catch (error) {
        console.error('Add batch error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getInventory = async (req: Request, res: Response) => {
    try {
        console.log('Get Inventory Request');
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug) as any;

        const inventory: MedicineWithBatches[] = await client.medicine.findMany({
            include: {
                batches: {
                    where: {
                        quantity: { gt: 0 }
                    },
                    orderBy: { expiryDate: 'asc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Calculate total stock and status for each medicine
        const processedInventory = inventory.map((med: MedicineWithBatches) => {
            const totalStock = med.batches.reduce((sum: number, batch: Batch) => sum + batch.quantity, 0);
            let status = 'IN_STOCK';
            if (totalStock === 0) status = 'OUT_OF_STOCK';
            else if (totalStock < med.lowStockThreshold) status = 'LOW_STOCK';

            return {
                ...med,
                totalStock,
                status
            };
        });

        res.json(processedInventory);
    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

export const getLowStockMedicines = async (req: Request, res: Response) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        if (!tenantSlug) return res.status(400).json({ message: 'Tenant slug header missing' });

        const client = getTenantClient(tenantSlug) as any;

        // Fetch all medicines with their batches
        const inventory: MedicineWithBatches[] = await client.medicine.findMany({
            include: {
                batches: {
                    where: {
                        quantity: { gt: 0 }
                    }
                }
            }
        });

        // Filter for low stock
        const lowStockMedicines = inventory.map((med: MedicineWithBatches) => {
            const totalStock = med.batches.reduce((sum: number, batch: Batch) => sum + batch.quantity, 0);
            return {
                ...med,
                totalStock
            };
        }).filter((med: MedicineWithStock) => med.totalStock <= med.lowStockThreshold);

        res.json(lowStockMedicines);
    } catch (error) {
        console.error('Get low stock medicines error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
