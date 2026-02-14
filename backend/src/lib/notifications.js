const prisma = require('./prisma');

/**
 * Creates a system notification for an employee.
 * 
 * @param {string} employeeId - The ID of the employee to notify.
 * @param {string} type - The type of notification (e.g., 'LEAVE_APPROVED', 'PAYROLL_GENERATED').
 * @param {string} title - The notification title.
 * @param {string} message - The notification message content.
 * @param {string} [actionUrl] - Optional URL for the user to take action.
 * @returns {Promise<Object>} - The created notification object.
 */
async function createNotification(employeeId, type, title, message, actionUrl) {
    try {
        return await prisma.notifications.create({
            data: {
                employee_id: employeeId,
                type,
                title,
                message,
                action_url: actionUrl,
                is_read: false,
            }
        });
    } catch (error) {
        console.error(`[ERROR] Failed to create notification for employee ${employeeId}:`, error);
        // We don't throw here to avoid failing the main business logic (like leave approval) 
        // just because a notification failed to record.
        return null;
    }
}

module.exports = {
    createNotification
};
