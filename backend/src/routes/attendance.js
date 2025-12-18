const express = require('express');

module.exports = (prisma, { assertAuthenticated, requireRole, requireAnyRole, assertPayrollUnlocked }) => {
    const router = express.Router();

    const attendanceService = require('../services/attendance.service');

    // POST /attendance/check-in
    router.post(
        '/check-in',
        assertAuthenticated,
        requireRole('KARYAWAN'),
        assertPayrollUnlocked((req) => new Date(req.body.attendance_date || req.body.timestamp || Date.now())),
        async (req, res) => {
            try {
                const result = await attendanceService.checkIn({
                    user: req.user,
                    attendanceDate: req.body.attendance_date || new Date().toISOString(),
                    location: req.body.location,
                    photo: req.body.photo,
                });

                return res.status(201).json(result);
            } catch (err) {
                console.error('check-in error', err);
                return res.status(err.status || 500).json({ message: err.message || 'Server error' });
            }
        }
    );

    // POST /attendance/check-out
    router.post(
        '/check-out',
        assertAuthenticated,
        requireRole('KARYAWAN'),
        assertPayrollUnlocked((req) => new Date(req.body.attendance_date || req.body.timestamp || Date.now())),
        async (req, res) => {
            try {
                const result = await attendanceService.checkOut({
                    user: req.user,
                    attendanceDate: req.body.attendance_date || new Date().toISOString(),
                    location: req.body.location,
                    photo: req.body.photo,
                });

                return res.status(200).json(result);
            } catch (err) {
                console.error('check-out error', err);
                return res.status(err.status || 500).json({ message: err.message || 'Server error' });
            }
        }
    );

    // PUT /attendance/:id/correct  (ADMIN only)
    router.put(
        '/:id/correct',
        assertAuthenticated,
        requireRole('ADMIN'),
        assertPayrollUnlocked((req) => new Date(req.body.attendance_date)),
        async (req, res) => {
            const { id } = req.params;
            const { field_name, after_value, reason } = req.body || {};
            if (!field_name || typeof after_value === 'undefined' || !reason) {
                return res.status(400).json({ message: 'field_name, after_value and reason are required' });
            }

            try {
                const attendance = await prisma.attendance.findUnique({ where: { id } });
                if (!attendance) return res.status(404).json({ message: 'Attendance not found' });

                // Record correction audit
                await prisma.attendance_corrections.create({
                    data: {
                        attendance_id: id,
                        corrected_by_user_id: req.user.id,
                        field_name,
                        before_value: String(attendance[field_name] ?? ''),
                        after_value: String(after_value),
                        reason,
                    },
                });

                // Apply correction to attendance row
                await prisma.attendance.update({ where: { id }, data: { [field_name]: after_value } });

                return res.json({ ok: true });
            } catch (err) {
                console.error('correction error', err);
                return res.status(500).json({ message: 'Server error' });
            }
        }
    );

    return router;
};
