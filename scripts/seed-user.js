require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('../packages/database/generated/management-client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    // 1. Create Tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'city-hospital' },
        update: {},
        create: {
            name: 'City Hospital',
            slug: 'city-hospital',
            address: '123 Health St, Metropolis'
        }
    });
    console.log({ tenant });

    // 2. Create Hospital Admin
    const email = 'testdoc@test.local';
    const password = 'Admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            tenantId: tenant.id,
            role: 'HOSPITAL_ADMIN'
        },
        create: {
            email,
            password: hashedPassword,
            name: 'Test Doctor',
            role: 'HOSPITAL_ADMIN',
            tenantId: tenant.id
        },
    });

    console.log({ user });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
