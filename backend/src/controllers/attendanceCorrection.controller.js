const service = require('../services/attendanceCorrection.service');

async function correctAttendance(req, res) {
    try {
        const result = await service.correctAttendance({
            attendanceId: req.params.id,
            correctedByUser: req.user,
            changes: req.body.changes,
            reason: req.body.reason,
            attendanceDate: req.body.attendance_date,
        });

        res.status(200).json(result);
    } catch (err) {
        const status = err.status || 400;
        res.status(status).json({ message: err.message });
    }
}

module.exports = { correctAttendance };
