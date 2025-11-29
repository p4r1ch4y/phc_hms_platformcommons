require('dotenv').config({ path: '../.env' });
const { PrismaClient } = require('../packages/database/generated/management-client');

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
});

async function main() {
    const email = 'test@example.com';

    // 1. Create Tenant
    const tenant = await prisma.tenant.upsert({
        where: { slug: 'demo-phc' },
        update: {},
        create: {
            name: 'Demo PHC',
            slug: 'demo-phc',
            address: '123 Health St, Demo City',
        },
    });

    console.log({ tenant });

    // 2. Update User to link to Tenant
    const user = await prisma.user.update({
        where: { email },
        data: {
            tenantId: tenant.id,
            role: 'HOSPITAL_ADMIN',
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
