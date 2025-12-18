const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { validateCheckIn, validateCheckOut } = require('../validators/attendanceCategory.validator');

async function checkIn({ user, attendanceDate, location, photo }) {
    const employee = await prisma.employees.findFirst({
        where: { user_id: user.id, is_active: true },
    });

    if (!employee) {
        const err = new Error('Employee record not found');
        err.status = 404;
        throw err;
    }

    validateCheckIn({ category: employee.category, location, photo });

    const existing = await prisma.attendance.findFirst({
        where: {
            employee_id: employee.id,
            attendance_date: new Date(attendanceDate),
        },
    });

    if (existing) {
        const err = new Error('Already checked in for this date');
        err.status = 400;
        throw err;
    }

    return prisma.attendance.create({
        data: {
            employee_id: employee.id,
            attendance_date: new Date(attendanceDate),
            check_in_time: new Date(),
            check_in_location: location,
            check_in_photo: photo,
            status: 'HADIR',
        },
    });
}

async function checkOut({ user, attendanceDate, location, photo }) {
    const employee = await prisma.employees.findFirst({
        where: { user_id: user.id, is_active: true },
    });

    if (!employee) {
        const err = new Error('Employee record not found');
        err.status = 404;
        throw err;
    }

    validateCheckOut({ category: employee.category, location, photo });

    const attendance = await prisma.attendance.findFirst({
        where: {
            employee_id: employee.id,
            attendance_date: new Date(attendanceDate),
        },
    });

    if (!attendance) {
        const err = new Error('Check-in not found');
        err.status = 404;
        throw err;
    }

    if (attendance.check_out_time) {
        const err = new Error('Already checked out');
        err.status = 400;
        throw err;
    }

    return prisma.attendance.update({
        where: { id: attendance.id },
        data: {
            check_out_time: new Date(),
            check_out_location: location,
            check_out_photo: photo,
        },
    });
}

module.exports = {
    checkIn,
    checkOut,
};
