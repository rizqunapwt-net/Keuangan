const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 ENTERPRISE DATABASE INITIALIZATION STARTED');

    try {
        // Create KARYAWAN user
        const workerPass = bcrypt.hashSync('workerpass', 10);
        const worker = await prisma.users.upsert({
            where: { username: 'karyawan1' },
            update: { password_hash: workerPass },
            create: {
                username: 'karyawan1',
                password_hash: workerPass,
                role: 'KARYAWAN',
                is_active: true,
            },
        });
        console.log('✅ User "karyawan1" created/updated.');

        const emp = await prisma.employees.upsert({
            where: { user_id: worker.id },
            update: { name: 'Karyawan Satu' },
            create: {
                user_id: worker.id,
                employee_code: 'EMP001',
                name: 'Karyawan Satu',
                category: 'REGULER',
                is_active: true,
            },
        });
        console.log('✅ Employee profile linked.');

        // Admin
        const adminPass = bcrypt.hashSync('adminpass', 10);
        await prisma.users.upsert({
            where: { username: 'admin' },
            update: { password_hash: adminPass },
            create: { username: 'admin', password_hash: adminPass, role: 'ADMIN' },
        });
        console.log('✅ Admin account ready.');

        console.log('\n🌟 DATABASE READY FOR LOGIN');
        console.log('Credentials: karyawan1 / workerpass');
    } catch (err) {
        console.error('❌ Error during seeding:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
