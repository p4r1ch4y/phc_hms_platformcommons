import { Request, Response } from 'express';
import { getTenantClient } from '../utils/tenant-db';

export const seedTenantData = async (req: Request, res: Response) => {
    try {
        const tenantSlug = req.headers['x-tenant-slug'] as string;
        const userRole = (req as any).user?.role;

        if (!tenantSlug) {
            return res.status(400).json({ message: 'Tenant slug header missing' });
        }

        if (userRole !== 'HOSPITAL_ADMIN' && userRole !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Only admins can seed data' });
        }

        const client = getTenantClient(tenantSlug);

        // 1. Seed Medicines
        const medicines = [
            { name: 'Test Paracetamol', manufacturer: 'Test Pharma', unit: 'Tablet', stock: 500, batch: 'TEST-B001' },
            { name: 'Test Amoxicillin', manufacturer: 'Test Cipla', unit: 'Capsule', stock: 200, batch: 'TEST-B002' },
            { name: 'Test Metformin', manufacturer: 'Test Sun Pharma', unit: 'Tablet', stock: 300, batch: 'TEST-B003' },
            { name: 'Test Ibuprofen', manufacturer: 'Test Dr. Reddy', unit: 'Tablet', stock: 400, batch: 'TEST-B004' },
            { name: 'Test Cetirizine', manufacturer: 'Test Alkem', unit: 'Tablet', stock: 600, batch: 'TEST-B005' },
        ];

        for (const med of medicines) {
            const createdMed = await client.medicine.create({
                data: {
                    name: med.name,
                    manufacturer: med.manufacturer,
                    unit: med.unit,
                }
            });

            await client.batch.create({
                data: {
                    medicineId: createdMed.id,
                    batchNumber: med.batch,
                    quantity: med.stock,
                    expiryDate: new Date('2025-12-31'),
                }
            });
        }

        // 2. Seed Patients (Indian Context)
        const patients = [
            { firstName: 'Test Rahul', lastName: 'Sharma', gender: 'MALE', dob: '1985-06-15', phone: '9876543210', address: '123 MG Road, Mumbai', abhaId: '91-1111-2222-3333' },
            { firstName: 'Test Priya', lastName: 'Patel', gender: 'FEMALE', dob: '1992-09-20', phone: '9876543211', address: '456 Gandhi Nagar, Ahmedabad', abhaId: '91-4444-5555-6666' },
            { firstName: 'Test Amit', lastName: 'Singh', gender: 'MALE', dob: '1978-03-10', phone: '9876543212', address: '789 Civil Lines, Delhi', abhaId: '91-7777-8888-9999' },
            { firstName: 'Test Sneha', lastName: 'Reddy', gender: 'FEMALE', dob: '1995-11-05', phone: '9876543213', address: '101 Jubilee Hills, Hyderabad', abhaId: '91-0000-1111-2222' },
            { firstName: 'Test Vikram', lastName: 'Verma', gender: 'MALE', dob: '1960-01-25', phone: '9876543214', address: '202 Residency Road, Bangalore', abhaId: '91-3333-4444-5555' },
        ];

        const createdPatients = [];
        for (const p of patients) {
            const patient = await client.patient.create({
                data: {
                    firstName: p.firstName,
                    lastName: p.lastName,
                    gender: p.gender as any,
                    dateOfBirth: new Date(p.dob),
                    phone: p.phone,
                    address: p.address,
                    abhaId: p.abhaId,
                }
            });
            createdPatients.push(patient);
        }

        // 3. Seed Consultations
        const diagnoses = ['Viral Fever', 'Type 2 Diabetes', 'Hypertension', 'Common Cold', 'Migraine'];
        const adminUserId = (req as any).user?.userId || 'admin-seed-id';

        for (let i = 0; i < createdPatients.length; i++) {
            await client.consultation.create({
                data: {
                    patientId: createdPatients[i].id,
                    doctorId: adminUserId,
                    diagnosis: diagnoses[i],
                    prescription: JSON.stringify([{ medicine: 'Test Paracetamol', dosage: '500mg BD' }]),
                    status: 'COMPLETED',
                }
            });
        }

        res.json({ message: 'Seed data created successfully' });
    } catch (error) {
        console.error('Seed data error:', error);
        res.status(500).json({ message: 'Internal server error during seeding' });
    }
};
