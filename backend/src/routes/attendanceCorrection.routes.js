const express = require('express');
const router = express.Router();

const assertAuthenticated = require('../middlewares/assertAuthenticated');
const requireRole = require('../middlewares/requireRole');
const assertPayrollUnlocked = require('../guards/assertPayrollUnlocked');

const { correctAttendance } = require('../controllers/attendanceCorrection.controller');

// PUT /attendance/:id/correct
router.put(
    '/attendance/:id/correct',
    assertAuthenticated,
    requireRole('ADMIN'),
    assertPayrollUnlocked((req) => new Date(req.body.attendance_date)),
    correctAttendance
);

module.exports = router;
