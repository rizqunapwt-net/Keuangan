const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Cek apakah tanggal tertentu berada di payroll period yang LOCKED
 * @param {Date|string} date
 * @returns {Promise<boolean>}
 */
async function isPayrollLockedByDate(date) {
    if (!date) return false;
    const target = date instanceof Date ? date : new Date(date);

    const period = await prisma.payroll_periods.findFirst({
        where: {
            period_start: { lte: target },
            period_end: { gte: target },
            is_locked: true,
        },
    });

    return !!period;
}

module.exports = {
    isPayrollLockedByDate,
};
