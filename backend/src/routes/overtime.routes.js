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

const createOvertimeRequestSchema = z.object({
    employeeId: z.string().uuid(),
    overtimeDate: z.string(), // ISO date string
    startTime: z.string(),    // ISO date string
    endTime: z.string(),      // ISO date string
    reason: z.string().min(10, "Reason must be at least 10 characters"),
});

const updateOvertimeStatusSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    reviewNotes: z.string().optional(),
    reviewedBy: z.string().uuid(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function generateOvertimeRequestNumber() {
    const year = new Date().getFullYear();
    const count = await prisma.overtime_requests.count({
        where: {
            request_number: {
                startsWith: `OT-${year}`
            }
        }
    });

    const number = String(count + 1).padStart(4, '0');
    return `OT-${year}-${number}`;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

router.get('/overtime-requests', assertAuthenticated, async (req, res) => {
    try {
        const { employeeId, status } = req.query;

        const where = {};
        if (employeeId) where.employee_id = employeeId;
        if (status) where.status = status;

        const overtimeRequests = await prisma.overtime_requests.findMany({
            where,
            include: {
                employee: true,
                approver: true,
            },
            orderBy: { submitted_at: 'desc' }
        });

        res.json({ success: true, data: overtimeRequests });
    } catch (error) {
        console.error('Error fetching overtime requests:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch overtime requests' });
    }
});

router.post('/overtime-requests', assertAuthenticated, async (req, res) => {
    try {
        const validatedData = createOvertimeRequestSchema.parse(req.body);

        const overtimeDate = new Date(validatedData.overtimeDate);
        const startTime = new Date(validatedData.startTime);
        const endTime = new Date(validatedData.endTime);

        // Validation: Verify if an attendance record exists for this date
        const attendance = await prisma.attendance.findFirst({
            where: {
                employee_id: validatedData.employeeId,
                attendance_date: {
                    gte: new Date(overtimeDate.setHours(0, 0, 0, 0)),
                    lte: new Date(overtimeDate.setHours(23, 59, 59, 999)),
                }
            }
        });

        if (!attendance) {
            return res.status(400).json({
                success: false,
                error: 'Attendance record required',
                message: 'Anda harus memiliki catatan kehadiran pada tanggal tersebut sebelum mengajukan lembur.'
            });
        }

        // Calculate total hours
        const diffMs = endTime - startTime;
        const totalHours = Math.max(0, diffMs / (1000 * 60 * 60));

        const requestNumber = await generateOvertimeRequestNumber();

        const overtimeRequest = await prisma.overtime_requests.create({
            data: {
                request_number: requestNumber,
                employee_id: validatedData.employeeId,
                overtime_date: new Date(validatedData.overtimeDate),
                start_time: startTime,
                end_time: endTime,
                total_hours: totalHours,
                reason: validatedData.reason,
                status: 'PENDING',
                attendance_id: attendance.id,
            },
            include: {
                employee: true,
            }
        });

        res.status(201).json({ success: true, message: 'Permintaan lembur berhasil diajukan', data: overtimeRequest });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
        }
        console.error('Error creating overtime request:', error);
        res.status(500).json({ success: false, error: 'Gagal mengajukan permintaan lembur' });
    }
});

router.patch('/overtime-requests/:id/status', requireAnyRole(['ADMIN', 'OWNER']), async (req, res) => {
    try {
        const { id } = req.params;
        const validatedData = updateOvertimeStatusSchema.parse(req.body);

        const currentRequest = await prisma.overtime_requests.findUnique({
            where: { id }
        });

        if (!currentRequest) {
            return res.status(404).json({ success: false, error: 'Permintaan lembur tidak ditemukan' });
        }

        if (currentRequest.status !== 'PENDING') {
            return res.status(400).json({ success: false, error: `Status tidak dapat diubah. Status saat ini adalah ${currentRequest.status}` });
        }

        const updatedRequest = await prisma.overtime_requests.update({
            where: { id },
            data: {
                status: validatedData.status,
                reviewed_at: new Date(),
                reviewed_by: validatedData.reviewedBy,
                review_notes: validatedData.reviewNotes,
            },
            include: { employee: true }
        });

        // Create notification for employee
        await createNotification(
            updatedRequest.employee_id,
            updatedRequest.status === 'APPROVED' ? 'OVERTIME_APPROVED' : 'OVERTIME_REJECTED',
            updatedRequest.status === 'APPROVED' ? 'Lembur Disetujui' : 'Lembur Ditolak',
            updatedRequest.status === 'APPROVED'
                ? `Permintaan lembur Anda tanggal ${new Date(updatedRequest.overtime_date).toLocaleDateString()} telah disetujui.`
                : `Permintaan lembur Anda tanggal ${new Date(updatedRequest.overtime_date).toLocaleDateString()} telah ditolak. ${validatedData.reviewNotes || ''}`,
            `/overtime`
        );

        res.json({ success: true, message: `Permintaan lembur berhasil di${validatedData.status === 'APPROVED' ? 'setujui' : 'tolak'}`, data: updatedRequest });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
        }
        console.error('Error updating overtime status:', error);
        res.status(500).json({ success: false, error: 'Gagal mengubah status lembur' });
    }
});

module.exports = router;
