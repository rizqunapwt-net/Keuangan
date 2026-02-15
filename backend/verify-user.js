const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    console.log('--- USER DATABASE CHECK ---');
    const users = await prisma.users.findMany({
        include: { employee: true }
    });

    if (users.length === 0) {
        console.log('❌ NO USERS FOUND IN DATABASE');
    } else {
        users.forEach(u => {
            console.log(`👤 User: ${u.username} | Role: ${u.role} | Linked to Employee: ${u.employee ? u.employee.name : 'NO'}`);
        });
    }
    await prisma.$disconnect();
}

check();
