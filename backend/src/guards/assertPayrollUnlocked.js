const { isPayrollLockedByDate } = require('../services/payrollPeriod.service');

/**
 * Guard untuk mencegah perubahan data pada payroll period yang locked
 * @param {Function} getDate - function(req) => Date
 */
module.exports = function assertPayrollUnlocked(getDate) {
    return async function (req, res, next) {
        try {
            const targetDate = getDate(req);

            if (!targetDate) {
                return res.status(400).json({
                    message: 'Target date is required for payroll lock validation',
                });
            }

            const locked = await isPayrollLockedByDate(targetDate);

            if (locked) {
                return res.status(423).json({
                    message: 'Payroll period is locked. Modification is not allowed.',
                });
            }

            next();
        } catch (err) {
            console.error('Payroll lock guard error:', err);
            return res.status(500).json({ message: 'Payroll lock validation failed' });
        }
    };
};
