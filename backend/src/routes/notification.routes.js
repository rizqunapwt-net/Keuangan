const express = require('express');
const prisma = require('../lib/prisma');

const router = express.Router();

// ============================================================================
// API ENDPOINTS
// ============================================================================

// GET /api/notifications
// Fetch notifications for the logged-in user
router.get('/notifications', async (req, res) => {
    try {
        const { employeeId } = req.query;

        // Security Audit Fix: Ensure user can only fetch their own notifications
        if (!employeeId || employeeId !== req.user.employee_id) {
            return res.status(403).json({ success: false, error: 'Unauthorized: You can only access your own notifications' });
        }

        const notifications = await prisma.notifications.findMany({
            where: {
                employee_id: employeeId
            },
            orderBy: {
                created_at: 'desc'
            },
            take: 50 // Limit to last 50 notifications
        });

        res.json({ success: true, data: notifications });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
    }
});

// PATCH /api/notifications/:id/read
// Mark a specific notification as read
router.patch('/notifications/:id/read', async (req, res) => {
    try {
        const { id } = req.params;

        const notification = await prisma.notifications.update({
            where: { id },
            data: { is_read: true }
        });

        res.json({ success: true, data: notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ success: false, error: 'Failed to update notification' });
    }
});

// PATCH /api/notifications/read-all
// Mark all notifications for an employee as read
router.patch('/notifications/read-all', async (req, res) => {
    try {
        const { employeeId } = req.body;

        // Security Audit Fix: Ensure user can only mark their own notifications as read
        if (!employeeId || employeeId !== req.user.employee_id) {
            return res.status(403).json({ success: false, error: 'Unauthorized: You can only modify your own notifications' });
        }

        await prisma.notifications.updateMany({
            where: {
                employee_id: employeeId,
                is_read: false
            },
            data: {
                is_read: true
            }
        });

        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ success: false, error: 'Failed to update notifications' });
    }
});

module.exports = router;
