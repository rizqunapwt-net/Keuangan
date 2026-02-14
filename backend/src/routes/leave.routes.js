const express = require('express');
const { z } = require('zod');
const prisma = require('../lib/prisma');
const { createNotification } = require('../lib/notifications');
const assertAuthenticated = require('../middlewares/assertAuthenticated');
const requireAnyRole = require('../middlewares/requireAnyRole');

const router = express.Router();

// ============================================================================
// VALIDATION SCHEMAS (Zod)
// ============================================================================

const createLeaveRequestSchema = z.object({
    employeeId: z.string().uuid(),
    leaveTypeId: z.string().uuid(),
    startDate: z.string(),
    endDate: z.string(),
    reason: z.string().min(10, "Reason must be at least 10 characters"),
    attachmentUrl: z.string().url().optional(),
});

const updateLeaveStatusSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED']),
    reviewNotes: z.string().optional(),
    reviewedBy: z.string().uuid(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateBusinessDays(startDate, endDate) {
    let count = 0;
    const current = new Date(startDate);
    const end = new Date(endDate);

    while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
            count++;
        }
        current.setDate(current.getDate() + 1);
    }

    return count;
}

async function generateLeaveRequestNumber() {
    const year = new Date().getFullYear();
    const count = await prisma.leave_requests.count({
        where: {
            request_number: {
                startsWith: `LV-${year}`
            }
        }
    });

    const number = String(count + 1).padStart(4, '0');
    return `LV-${year}-${number}`;
}

async function syncLeaveWithAttendance(leaveRequest) {
    const startDate = new Date(leaveRequest.start_date);
    const endDate = new Date(leaveRequest.end_date);
    const current = new Date(startDate);

    const attendanceRecords = [];

    while (current <= endDate) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            attendanceRecords.push({
                employee_id: leaveRequest.employee_id,
                attendance_date: new Date(current),
                status: 'IZIN',
            });
        }
        current.setDate(current.getDate() + 1);
    }

    for (const record of attendanceRecords) {
        const existing = await prisma.attendance.findFirst({
            where: {
                employee_id: record.employee_id,
                attendance_date: record.attendance_date
            }
        });

        if (existing) {
            await prisma.attendance.update({
                where: { id: existing.id },
                data: { status: record.status }
            });
        } else {
            await prisma.attendance.create({
                data: record
            });
        }
    }

    return attendanceRecords.length;
}

// Notification centralized in ../lib/notifications.js

// ============================================================================
// API ENDPOINTS
// ============================================================================

router.get('/leave-types', async (req, res) => {
    try {
        const leaveTypes = await prisma.leave_types.findMany({
            where: { is_active: true },
            orderBy: { name: 'asc' }
        });

        res.json({ success: true, data: leaveTypes });
    } catch (error) {
        console.error('Error fetching leave types:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch leave types' });
    }
});

router.get('/leave-requests', async (req, res) => {
    try {
        const { employeeId, status, startDate, endDate } = req.query;

        const where = {};
        if (employeeId) where.employee_id = employeeId;
        if (status) where.status = status;
        if (startDate || endDate) {
            where.start_date = {};
            if (startDate) where.start_date.gte = new Date(startDate);
            if (endDate) where.start_date.lte = new Date(endDate);
        }

        const leaveRequests = await prisma.leave_requests.findMany({
            where,
            include: {
                employee: true,
                leave_type: true,
            },
            orderBy: { submitted_at: 'desc' }
        });

        res.json({ success: true, data: leaveRequests, total: leaveRequests.length });
    } catch (error) {
        console.error('Error fetching leave requests:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch leave requests' });
    }
});

router.post('/leave-requests', async (req, res) => {
    try {
        const validatedData = createLeaveRequestSchema.parse(req.body);

        const startDate = new Date(validatedData.startDate);
        const endDate = new Date(validatedData.endDate);
        const totalDays = calculateBusinessDays(startDate, endDate);

        const currentYear = new Date().getFullYear();
        const leaveBalance = await prisma.leave_balances.findUnique({
            where: {
                employee_id_year_leave_type_id: {
                    employee_id: validatedData.employeeId,
                    year: currentYear,
                    leave_type_id: validatedData.leaveTypeId,
                }
            }
        });

        if (leaveBalance && leaveBalance.remaining < totalDays) {
            return res.status(400).json({
                success: false,
                error: 'Insufficient leave balance',
                details: { requested: totalDays, available: leaveBalance.remaining }
            });
        }

        const requestNumber = await generateLeaveRequestNumber();

        const leaveRequest = await prisma.leave_requests.create({
            data: {
                request_number: requestNumber,
                employee_id: validatedData.employeeId,
                leave_type_id: validatedData.leaveTypeId,
                start_date: startDate,
                end_date: endDate,
                total_days: totalDays,
                reason: validatedData.reason,
                attachment_url: validatedData.attachmentUrl,
                status: 'PENDING',
            },
            include: {
                employee: true,
                leave_type: true,
            }
        });

        res.status(201).json({ success: true, message: 'Leave request submitted successfully', data: leaveRequest });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
        }
        console.error('Error creating leave request:', error.message);
        res.status(500).json({ success: false, error: 'Failed to create leave request' });
    }
});

router.patch('/leave-requests/:id/status', requireAnyRole(['ADMIN', 'OWNER']), async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateLeaveStatusSchema.parse(req.body);

        const currentRequest = await prisma.leave_requests.findUnique({
            where: { id },
            include: { employee: true, leave_type: true }
        });

        if (!currentRequest) {
            return res.status(404).json({ success: false, error: 'Leave request not found' });
        }

        if (currentRequest.status !== 'PENDING') {
            return res.status(400).json({ success: false, error: `Cannot update status. Current status is ${currentRequest.status}` });
        }

        const updatedRequest = await prisma.leave_requests.update({
            where: { id },
            data: {
                status: validatedData.status,
                reviewed_at: new Date(),
                reviewed_by: validatedData.reviewedBy,
                review_notes: validatedData.reviewNotes,
            },
            include: { employee: true, leave_type: true }
        });

        if (validatedData.status === 'APPROVED') {
            await syncLeaveWithAttendance(updatedRequest);

            const currentYear = new Date().getFullYear();
            await prisma.leave_balances.update({
                where: {
                    employee_id_year_leave_type_id: {
                        employee_id: updatedRequest.employee_id,
                        year: currentYear,
                        leave_type_id: updatedRequest.leave_type_id,
                    }
                },
                data: {
                    used: { increment: updatedRequest.total_days },
                    remaining: { decrement: updatedRequest.total_days }
                }
            });

            await prisma.leave_requests.update({
                where: { id },
                data: { attendances_synced: true }
            });

            await createNotification(
                updatedRequest.employee_id,
                'LEAVE_APPROVED',
                'Leave Request Approved',
                `Your ${updatedRequest.leave_type.name} request from ${updatedRequest.start_date.toLocaleDateString()} to ${updatedRequest.end_date.toLocaleDateString()} has been approved.`,
                `/leaves/${updatedRequest.id}`
            );
        } else if (validatedData.status === 'REJECTED') {
            await createNotification(
                updatedRequest.employee_id,
                'LEAVE_REJECTED',
                'Leave Request Rejected',
                `Your ${updatedRequest.leave_type.name} request has been rejected. ${validatedData.reviewNotes || ''}`,
                `/leaves/${updatedRequest.id}`
            );
        }

        res.json({ success: true, message: `Leave request ${validatedData.status.toLowerCase()} successfully`, data: updatedRequest });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
        }
        console.error('Error updating leave status:', error.message);
        res.status(500).json({ success: false, error: 'Failed to update leave status' });
    }
});

router.get('/employees/:id/leave-balance', async (req, res) => {
    try {
        const { id } = req.params;
        const currentYear = new Date().getFullYear();

        const balances = await prisma.leave_balances.findMany({
            where: { employee_id: id, year: currentYear },
            include: { leave_type: true }
        });

        res.json({ success: true, data: balances, year: currentYear });
    } catch (error) {
        console.error('Error fetching leave balance:', error.message);
        res.status(500).json({ success: false, error: 'Failed to fetch leave balance' });
    }
});

module.exports = router;
