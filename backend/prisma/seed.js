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

    const employee = await prisma.employees.upsert({
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

    // Create Leave Types
    console.log('Seeding leave types...');
    const annualLeave = await prisma.leave_types.upsert({
        where: { code: 'ANNUAL' },
        update: {},
        create: {
            code: 'ANNUAL',
            name: 'Cuti Tahunan',
            description: 'Jatah cuti tahunan reguler',
            max_days: 12,
            color: '#6366f1'
        }
    });

    const sickLeave = await prisma.leave_types.upsert({
        where: { code: 'SICK' },
        update: {},
        create: {
            code: 'SICK',
            name: 'Izin Sakit',
            description: 'Izin dengan surat keterangan dokter',
            max_days: 10,
            requires_doc: true,
            color: '#ef4444'
        }
    });

    // Create Leave Balances for the employee
    console.log('Seeding leave balances...');
    const currentYear = new Date().getFullYear();
    await prisma.leave_balances.upsert({
        where: {
            employee_id_year_leave_type_id: {
                employee_id: employee.id,
                year: currentYear,
                leave_type_id: annualLeave.id
            }
        },
        update: {},
        create: {
            employee_id: employee.id,
            year: currentYear,
            leave_type_id: annualLeave.id,
            total_quota: annualLeave.max_days,
            used: 0,
            remaining: annualLeave.max_days
        }
    });

    await prisma.leave_balances.upsert({
        where: {
            employee_id_year_leave_type_id: {
                employee_id: employee.id,
                year: currentYear,
                leave_type_id: sickLeave.id
            }
        },
        update: {},
        create: {
            employee_id: employee.id,
            year: currentYear,
            leave_type_id: sickLeave.id,
            total_quota: sickLeave.max_days,
            used: 0,
            remaining: sickLeave.max_days
        }
    });

    console.log('Seeding finished. Users & Leave configurations updated.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
