const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Create OWNER
    const ownerPass = bcrypt.hashSync('ownerpass', 10);
    const owner = await prisma.users.upsert({
        where: { username: 'owner' },
        update: {},
        create: {
            username: 'owner',
            password_hash: ownerPass,
            role: 'OWNER',
            is_active: true,
        },
    });

    // Create ADMIN
    const adminPass = bcrypt.hashSync('adminpass', 10);
    const admin = await prisma.users.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            username: 'admin',
            password_hash: adminPass,
            role: 'ADMIN',
            is_active: true,
        },
    });

    // Create KARYAWAN user + employee
    const workerPass = bcrypt.hashSync('workerpass', 10);
    const worker = await prisma.users.upsert({
        where: { username: 'karyawan1' },
        update: {},
        create: {
            username: 'karyawan1',
            password_hash: workerPass,
            role: 'KARYAWAN',
            is_active: true,
        },
    });

    await prisma.employees.upsert({
        where: { user_id: worker.id },
        update: {},
        create: {
            user_id: worker.id,
            employee_code: 'EMP001',
            name: 'Karyawan Satu',
            category: 'REGULER',
            is_active: true,
        },
    });

    console.log('Seeding finished. Users created: owner/admin/karyawan1');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
