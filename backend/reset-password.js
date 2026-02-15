const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function reset() {
    console.log('🔄 RESETTING PASSWORD FOR karyawan1...');
    const newPass = bcrypt.hashSync('123456', 10);

    try {
        await prisma.users.update({
            where: { username: 'karyawan1' },
            data: { password_hash: newPass }
        });
        console.log('✅ PASSWORD RESET SUCCESSFUL!');
        console.log('User: karyawan1');
        console.log('Pass: 123456');
    } catch (err) {
        console.error('❌ Failed to reset password:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

reset();
