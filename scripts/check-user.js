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
    const email = 'asha.test@test.local';
    const user = await prisma.user.findUnique({
        where: { email },
        include: { tenant: true }
    });
    console.log(JSON.stringify(user, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
