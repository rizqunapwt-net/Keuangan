const request = require('supertest');
const express = require('express');

// Mock Middlewares
jest.mock('../middlewares/requireAnyRole', () => () => (req, res, next) => next());
jest.mock('../middlewares/assertAuthenticated', () => (req, res, next) => next());
jest.mock('../lib/notifications', () => ({ createNotification: jest.fn() }));

// Mock Prisma
const mockPrisma = require('../lib/prisma');
jest.mock('../lib/prisma', () => ({
    employees: { findMany: jest.fn() },
    attendance: { findMany: jest.fn() },
    overtime_requests: { findMany: jest.fn() },
    payrolls: { count: jest.fn(), upsert: jest.fn(), findMany: jest.fn() },
}));

const payrollRouter = require('./payroll.routes');
const app = express();
app.use(express.json());
app.use('/api', payrollRouter);

describe('Payroll Logic Internal Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /api/payrolls/generate - Calculation Check', async () => {
        // Mock 1 Employee
        mockPrisma.employees.findMany.mockResolvedValue([
            { id: 'emp-1', name: 'John Doe' }
        ]);

        // Mock 20 days attendance (Hadir)
        const attendance = Array(20).fill({ status: 'HADIR', is_late: false });
        attendance[0] = { status: 'HADIR', is_late: true }; // 1 Late
        mockPrisma.attendance.findMany.mockResolvedValue(attendance);

        // Mock 10 hours overtime
        mockPrisma.overtime_requests.findMany.mockResolvedValue([
            { total_hours: 10, status: 'APPROVED' }
        ]);

        mockPrisma.payrolls.count.mockResolvedValue(10);
        mockPrisma.payrolls.upsert.mockImplementation(({ create }) => create);

        const response = await request(app)
            .post('/api/payrolls/generate')
            .send({ month: 3, year: 2026 });

        expect(response.status).toBe(200);

        const payroll = response.body.data[0];

        // Base Salary = 5,000,000
        // Late Deduction = 1 * 50,000 = 50,000
        // Overtime Hours = 10
        // Overtime Pay = 10 * (5,000,000/173) * 1.5 ~= 433,526

        expect(payroll.late_deduction).toBe(50000);
        expect(payroll.overtime_hours).toBe(10);
        expect(payroll.net_pay).toBeGreaterThan(payroll.base_salary - 100000); // Rough sanity check
    });
});
