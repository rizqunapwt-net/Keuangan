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

const generatePayrollSchema = z.object({
    month: z.number().min(1).max(12),
    year: z.number().min(2024),
    employeeIds: z.array(z.string().uuid()).optional(), // Generate for specific employees or all
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function calculateBusinessDays(month, year) {
    const lastDay = new Date(year, month, 0).getDate();
    let count = 0;
    for (let day = 1; day <= lastDay; day++) {
        const date = new Date(year, month - 1, day);
        const dayOfWeek = date.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
            count++;
        }
    }
    return count;
}

async function generatePayrollNumber() {
    const year = new Date().getFullYear();
    const count = await prisma.payrolls.count({
        where: {
            payroll_number: {
                startsWith: `PAY-${year}`
            }
        }
    });

    const number = String(count + 1).padStart(4, '0');
    return `PAY-${year}-${number}`;
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

router.get('/payrolls', assertAuthenticated, async (req, res) => {
    try {
        const { employeeId, month, year } = req.query;

        const where = {};
        if (employeeId) where.employee_id = employeeId;
        if (month) where.month = parseInt(month);
        if (year) where.year = parseInt(year);

        const payrolls = await prisma.payrolls.findMany({
            where,
            include: {
                employee: true,
            },
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });

        res.json({ success: true, data: payrolls });
    } catch (error) {
        console.error('Error fetching payrolls:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch payrolls' });
    }
});

router.post('/payrolls/generate', requireAnyRole(['ADMIN', 'OWNER']), async (req, res) => {
    try {
        const validatedData = generatePayrollSchema.parse(req.body);
        const { month, year, employeeIds } = validatedData;

        // 1. Get employees
        const whereEmployees = employeeIds ? { id: { in: employeeIds } } : {};
        const employees = await prisma.employees.findMany({
            where: whereEmployees,
            include: {
                user: true,
            }
        });

        const results = [];
        const businessDays = calculateBusinessDays(month, year);

        for (const employee of employees) {
            // 2. Fetch attendance summary
            const startOfMonth = new Date(year, month - 1, 1);
            const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

            const attendanceRecords = await prisma.attendance.findMany({
                where: {
                    employee_id: employee.id,
                    attendance_date: { gte: startOfMonth, lte: endOfMonth },
                }
            });

            const attendanceDays = attendanceRecords.filter(r => r.status === 'HADIR' || r.status === 'WFH').length;
            const lateCount = attendanceRecords.filter(r => r.is_late).length;

            // 3. Fetch approved overtime
            const approvedOvertime = await prisma.overtime_requests.findMany({
                where: {
                    employee_id: employee.id,
                    overtime_date: { gte: startOfMonth, lte: endOfMonth },
                    status: 'APPROVED'
                }
            });

            const totalOvertimeHours = approvedOvertime.reduce((sum, ot) => sum + ot.total_hours, 0);

            // 4. Calculate Earnings & Deductions
            // Base Salary logic: Use a default or fetch from employee profile if exists
            // Since our employees model doesn't have base_salary yet, we'll use a placeholder
            // In a real app, we'd add base_salary to the employees table.
            const baseSalary = 5000000; // Placeholder 5jt IDR
            const dailySalary = baseSalary / businessDays;

            // Overtime Pay: 1.5x hourly rate (baseSalary / 173 is a common Indonesian standard)
            const hourlyRate = baseSalary / 173;
            const overtimePay = totalOvertimeHours * hourlyRate * 1.5;

            // Deductions: 50k for each late (Placeholder)
            const lateDeduction = lateCount * 50000;

            // Absent deduction: proportional to daily salary
            const absentDays = Math.max(0, businessDays - attendanceDays);
            const absentDeduction = absentDays * dailySalary;

            const grossPay = (dailySalary * attendanceDays) + overtimePay;
            const netPay = grossPay - lateDeduction; // absent already handled by only paying for attendance days

            // 5. Save Payroll
            const payrollNumber = await generatePayrollNumber();

            const payroll = await prisma.payrolls.upsert({
                where: {
                    employee_id_month_year: {
                        employee_id: employee.id,
                        month,
                        year
                    }
                },
                update: {
                    base_salary: baseSalary,
                    attendance_days: attendanceDays,
                    daily_salary: dailySalary,
                    overtime_hours: totalOvertimeHours,
                    overtime_pay: overtimePay,
                    late_deduction: lateDeduction,
                    absent_deduction: absentDeduction,
                    gross_pay: grossPay,
                    net_pay: netPay,
                    updated_at: new Date(),
                },
                create: {
                    payroll_number: payrollNumber,
                    employee_id: employee.id,
                    month,
                    year,
                    base_salary: baseSalary,
                    attendance_days: attendanceDays,
                    daily_salary: dailySalary,
                    overtime_hours: totalOvertimeHours,
                    overtime_pay: overtimePay,
                    late_deduction: lateDeduction,
                    absent_deduction: absentDeduction,
                    gross_pay: grossPay,
                    net_pay: netPay,
                }
            });

            // 6. Notify employee
            await createNotification(
                employee.id,
                'PAYROLL_GENERATED',
                'Slip Gaji Diterbitkan',
                `Slip gaji Anda untuk periode ${month}/${year} telah tersedia.`,
                `/payroll`
            );

            results.push(payroll);
        }

        res.json({ success: true, message: `Berhasil menghasilkan ${results.length} slip gaji`, data: results });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, error: 'Validation error', details: error.issues });
        }
        console.error('Error generating payroll:', error);
        res.status(500).json({ success: false, error: 'Gagal menghasilkan payroll' });
    }
});

module.exports = router;
