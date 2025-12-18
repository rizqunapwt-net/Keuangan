const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function correctAttendance({ attendanceId, correctedByUser, changes, reason }) {
    if (!changes || typeof changes !== 'object') {
        const err = new Error('Changes payload is required');
        err.status = 400;
        throw err;
    }
    if (!reason) {
        const err = new Error('Reason is required for correction');
        err.status = 400;
        throw err;
    }

    const attendance = await prisma.attendance.findUnique({ where: { id: attendanceId } });

    if (!attendance) {
        const err = new Error('Attendance record not found');
        err.status = 404;
        throw err;
    }

    // Transaction: audit entries + update must be atomic
    return prisma.$transaction(async (tx) => {
        for (const fieldName of Object.keys(changes)) {
            const beforeValue = attendance[fieldName];
            const afterValue = changes[fieldName];

            if (beforeValue === afterValue) continue;

            await tx.attendance_corrections.create({
                data: {
                    attendance_id: attendance.id,
                    corrected_by_user_id: correctedByUser.id,
                    field_name: fieldName,
                    before_value: String(beforeValue ?? ''),
                    after_value: String(afterValue ?? ''),
                    reason,
                },
            });
        }

        const updated = await tx.attendance.update({ where: { id: attendance.id }, data: changes });

        return updated;
    });
}

module.exports = { correctAttendance };
