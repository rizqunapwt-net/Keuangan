// 1. Define the mock object (must start with 'mock')
const mockPrisma = {
    employees: {
        findFirst: jest.fn(),
    },
    attendance: {
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
    }
};

// 2. Mock the module BEFORE requiring the service
jest.mock('@prisma/client', () => ({
    PrismaClient: jest.fn().mockImplementation(() => ({
        employees: {
            findFirst: (...args) => mockPrisma.employees.findFirst(...args),
        },
        attendance: {
            findFirst: (...args) => mockPrisma.attendance.findFirst(...args),
            create: (...args) => mockPrisma.attendance.create(...args),
            update: (...args) => mockPrisma.attendance.update(...args),
        }
    }))
}));

// 3. Now require the service
const { checkIn, checkOut } = require('./attendance.service');

describe('Attendance Service Logic Tests', () => {
    const mockUser = { id: 'user-1' };
    const mockDate = '2026-03-10T10:00:00.000Z';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('checkIn - Success (REGULER)', async () => {
        mockPrisma.employees.findFirst.mockResolvedValue({ id: 'emp-1', category: 'REGULER' });
        mockPrisma.attendance.findFirst.mockResolvedValue(null);
        mockPrisma.attendance.create.mockResolvedValue({ id: 'att-1' });

        const result = await checkIn({
            user: mockUser,
            attendanceDate: mockDate,
            location: '-6.1,106.8',
            photo: 'data:image/png;base64,...'
        });

        expect(result.id).toBe('att-1');
        expect(mockPrisma.attendance.create).toHaveBeenCalled();
    });

    test('checkIn - Fail (Already checked in)', async () => {
        mockPrisma.employees.findFirst.mockResolvedValue({ id: 'emp-1', category: 'REGULER' });
        mockPrisma.attendance.findFirst.mockResolvedValue({ id: 'existing-att' });

        await expect(checkIn({
            user: mockUser,
            attendanceDate: mockDate
        })).rejects.toThrow('Already checked in for this date');
    });

    test('checkIn - Fail (KEBUN missing photo)', async () => {
        mockPrisma.employees.findFirst.mockResolvedValue({ id: 'emp-ke-1', category: 'KEBUN' });

        await expect(checkIn({
            user: mockUser,
            attendanceDate: mockDate,
            location: '-6.1,106.8'
        })).rejects.toThrow('Photo is required for KEBUN check-in');
    });

    test('checkOut - Success', async () => {
        mockPrisma.employees.findFirst.mockResolvedValue({ id: 'emp-1', category: 'REGULER' });
        mockPrisma.attendance.findFirst.mockResolvedValue({ id: 'att-1', check_out_time: null });
        mockPrisma.attendance.update.mockResolvedValue({ id: 'att-1', check_out_time: new Date() });

        const result = await checkOut({
            user: mockUser,
            attendanceDate: mockDate
        });

        expect(result.id).toBe('att-1');
        expect(mockPrisma.attendance.update).toHaveBeenCalled();
    });

    test('checkOut - Fail (No check-in found)', async () => {
        mockPrisma.employees.findFirst.mockResolvedValue({ id: 'emp-1', category: 'REGULER' });
        mockPrisma.attendance.findFirst.mockResolvedValue(null);

        await expect(checkOut({
            user: mockUser,
            attendanceDate: mockDate
        })).rejects.toThrow('Check-in not found');
    });
});
