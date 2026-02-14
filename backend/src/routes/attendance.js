const express = require('express');

module.exports = (prisma, { assertAuthenticated, requireRole, requireAnyRole, assertPayrollUnlocked }) => {
    const router = express.Router();

    const attendanceService = require('../services/attendance.service');

    // GET /attendance/status
    router.get('/status', assertAuthenticated, async (req, res) => {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Need employee ID from user
            const employee = await prisma.employees.findUnique({
                where: { user_id: req.user.id }
            });

            if (!employee) {
                return res.json({ status: 'NOT_EMPLOYEE' });
            }

            const attendance = await prisma.attendance.findFirst({
                where: {
                    employee_id: employee.id,
                    attendance_date: {
                        gte: today
                    }
                }
            });

            if (!attendance) {
                return res.json({ status: 'NOT_CHECKED_IN' });
            }

            if (attendance.check_out_time) {
                return res.json({ status: 'CHECKED_OUT', data: attendance });
            }

            return res.json({ status: 'CHECKED_IN', data: attendance });

        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'Server error' });
        }
    });

    // GET /attendance/history
    router.get('/history', assertAuthenticated, async (req, res) => {
        try {
            const employee = await prisma.employees.findUnique({
                where: { user_id: req.user.id }
            });

            if (!employee) return res.status(404).json({ message: 'Employee not found' });

            // Last 30 days
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const history = await prisma.attendance.findMany({
                where: {
                    employee_id: employee.id,
                    attendance_date: {
                        gte: thirtyDaysAgo
                    }
                },
                orderBy: {
                    attendance_date: 'desc'
                }
            });

            return res.json(history);
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
    });

    // GET /attendance/summary (ADMIN only)
    router.get('/summary', assertAuthenticated, requireRole('ADMIN'), async (req, res) => {
        try {
            // Default to today
            const dateStr = req.query.date || new Date().toISOString().split('T')[0];
            const startDate = new Date(dateStr);
            startDate.setHours(0, 0, 0, 0);

            const endDate = new Date(startDate);
            endDate.setHours(23, 59, 59, 999);

            const attendance = await prisma.attendance.findMany({
                where: {
                    attendance_date: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                include: {
                    employee: true
                }
            });

            const employees = await prisma.employees.findMany({
                where: { is_active: true }
            });

            const summary = employees.map(emp => {
                const att = attendance.find(a => a.employee_id === emp.id);
                return {
                    id: emp.id,
                    name: emp.name,
                    employee_code: emp.employee_code,
                    category: emp.category,
                    status: att ? att.status : 'ABSEN', // Default to ABSEN if no record
                    check_in: att?.check_in_time,
                    check_out: att?.check_out_time,
                    late_minutes: att?.late_minutes || 0
                };
            });

            return res.json({ date: dateStr, summary });

        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: 'Server error' });
        }
    });

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
