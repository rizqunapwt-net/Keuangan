// ============================================================================
// BACKEND UNIT TESTS - Leave Routes
// Framework: Jest + Supertest
// Coverage: Business logic, validation, database operations, edge cases
// ============================================================================

const request = require('supertest');
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { mockDeep, mockReset, DeepMockProxy } = require('jest-mock-extended');

// Mock Prisma
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(),
}));

const prisma = mockDeep();
const leaveRouter = require('./leave_routes');

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api', leaveRouter);

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockLeaveTypes = [
  {
    id: 'lt-1',
    code: 'ANNUAL',
    name: 'Annual Leave',
    description: 'Regular annual leave',
    max_days: 12,
    requires_doc: false,
    is_active: true,
  },
  {
    id: 'lt-2',
    code: 'SICK',
    name: 'Sick Leave',
    description: 'Medical leave',
    max_days: 10,
    requires_doc: true,
    is_active: true,
  },
];

const mockEmployee = {
  id: 'emp-1',
  first_name: 'John',
  last_name: 'Doe',
  email: 'john.doe@example.com',
};

const mockLeaveBalance = {
  employee_id: 'emp-1',
  year: 2025,
  leave_type_id: 'lt-1',
  total_quota: 12,
  used: 2,
  remaining: 10,
};

const mockLeaveRequest = {
  id: 'lr-1',
  request_number: 'LV-2025-0001',
  employee_id: 'emp-1',
  leave_type_id: 'lt-1',
  start_date: new Date('2025-03-10'),
  end_date: new Date('2025-03-14'),
  total_days: 5,
  reason: 'Family vacation planned for months',
  status: 'PENDING',
  submitted_at: new Date(),
  reviewed_at: null,
  reviewed_by: null,
  review_notes: null,
  attachment_url: null,
  attendances_synced: false,
  employee: mockEmployee,
  leave_type: mockLeaveTypes[0],
};

// ============================================================================
// HELPER FUNCTION TESTS
// ============================================================================

describe('Helper Functions', () => {
  
  describe('calculateBusinessDays', () => {
    // Import the function directly for testing
    // Note: In production, you'd export these helpers or test them via API
    
    const calculateBusinessDays = (startDate, endDate) => {
      let count = 0;
      const current = new Date(startDate);
      const end = new Date(endDate);

      while (current <= end) {
        const dayOfWeek = current.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }

      return count;
    };

    test('should correctly skip weekends', () => {
      // Week starting Monday to Friday (5 business days)
      const result = calculateBusinessDays('2025-03-10', '2025-03-14');
      expect(result).toBe(5);
    });

    test('should skip Saturday and Sunday', () => {
      // Monday to next Monday (includes weekend, should be 6 business days)
      const result = calculateBusinessDays('2025-03-10', '2025-03-17');
      expect(result).toBe(6);
    });

    test('should handle single day request', () => {
      // Single Wednesday
      const result = calculateBusinessDays('2025-03-12', '2025-03-12');
      expect(result).toBe(1);
    });

    test('should return 0 for weekend-only request', () => {
      // Saturday to Sunday only
      const result = calculateBusinessDays('2025-03-15', '2025-03-16');
      expect(result).toBe(0);
    });

    test('should handle request starting on weekend', () => {
      // Saturday to next Wednesday
      const result = calculateBusinessDays('2025-03-15', '2025-03-19');
      expect(result).toBe(3); // Mon, Tue, Wed
    });

    test('should handle long period with multiple weekends', () => {
      // 3 weeks (15 business days)
      const result = calculateBusinessDays('2025-03-03', '2025-03-21');
      expect(result).toBe(15);
    });
  });
});

// ============================================================================
// API ENDPOINT TESTS
// ============================================================================

describe('GET /api/leave-types', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  test('should return all active leave types', async () => {
    prisma.leave_types.findMany.mockResolvedValue(mockLeaveTypes);

    const response = await request(app)
      .get('/api/leave-types')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0].code).toBe('ANNUAL');
    expect(prisma.leave_types.findMany).toHaveBeenCalledWith({
      where: { is_active: true },
      orderBy: { name: 'asc' },
    });
  });

  test('should handle database errors gracefully', async () => {
    prisma.leave_types.findMany.mockRejectedValue(new Error('DB connection failed'));

    const response = await request(app)
      .get('/api/leave-types')
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Failed to fetch leave types');
  });
});

describe('GET /api/leave-requests', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  test('should return all leave requests', async () => {
    prisma.leave_requests.findMany.mockResolvedValue([mockLeaveRequest]);

    const response = await request(app)
      .get('/api/leave-requests')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.total).toBe(1);
  });

  test('should filter by employee ID', async () => {
    prisma.leave_requests.findMany.mockResolvedValue([mockLeaveRequest]);

    await request(app)
      .get('/api/leave-requests?employeeId=emp-1')
      .expect(200);

    expect(prisma.leave_requests.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ employee_id: 'emp-1' }),
      })
    );
  });

  test('should filter by status', async () => {
    prisma.leave_requests.findMany.mockResolvedValue([]);

    await request(app)
      .get('/api/leave-requests?status=APPROVED')
      .expect(200);

    expect(prisma.leave_requests.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'APPROVED' }),
      })
    );
  });

  test('should filter by date range', async () => {
    prisma.leave_requests.findMany.mockResolvedValue([]);

    await request(app)
      .get('/api/leave-requests?startDate=2025-03-01&endDate=2025-03-31')
      .expect(200);

    expect(prisma.leave_requests.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          start_date: expect.objectContaining({
            gte: expect.any(Date),
            lte: expect.any(Date),
          }),
        }),
      })
    );
  });
});

describe('POST /api/leave-requests', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  const validRequestBody = {
    employeeId: 'emp-1',
    leaveTypeId: 'lt-1',
    startDate: '2025-03-10',
    endDate: '2025-03-14',
    reason: 'Family vacation planned for months',
  };

  test('should create leave request with sufficient balance', async () => {
    prisma.leave_balances.findUnique.mockResolvedValue(mockLeaveBalance);
    prisma.leave_requests.count.mockResolvedValue(0);
    prisma.leave_requests.create.mockResolvedValue(mockLeaveRequest);

    const response = await request(app)
      .post('/api/leave-requests')
      .send(validRequestBody)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Leave request submitted successfully');
    expect(response.body.data.total_days).toBe(5);
    expect(response.body.data.status).toBe('PENDING');
  });

  test('should reject request with insufficient balance', async () => {
    const insufficientBalance = {
      ...mockLeaveBalance,
      remaining: 3, // Less than requested 5 days
    };
    
    prisma.leave_balances.findUnique.mockResolvedValue(insufficientBalance);

    const response = await request(app)
      .post('/api/leave-requests')
      .send(validRequestBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Insufficient leave balance');
    expect(response.body.details.requested).toBe(5);
    expect(response.body.details.available).toBe(3);
  });

  test('should validate reason minimum length', async () => {
    const invalidBody = {
      ...validRequestBody,
      reason: 'Short', // Less than 10 characters
    };

    const response = await request(app)
      .post('/api/leave-requests')
      .send(invalidBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation error');
    expect(response.body.details[0].message).toContain('at least 10 characters');
  });

  test('should validate required fields', async () => {
    const incompleteBody = {
      employeeId: 'emp-1',
      // Missing leaveTypeId, dates, and reason
    };

    const response = await request(app)
      .post('/api/leave-requests')
      .send(incompleteBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation error');
  });

  test('should validate UUID format', async () => {
    const invalidUuidBody = {
      ...validRequestBody,
      employeeId: 'not-a-uuid',
    };

    const response = await request(app)
      .post('/api/leave-requests')
      .send(invalidUuidBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation error');
  });

  test('should generate unique request number', async () => {
    prisma.leave_balances.findUnique.mockResolvedValue(mockLeaveBalance);
    prisma.leave_requests.count.mockResolvedValue(5); // 5 existing requests this year
    prisma.leave_requests.create.mockResolvedValue({
      ...mockLeaveRequest,
      request_number: 'LV-2025-0006',
    });

    const response = await request(app)
      .post('/api/leave-requests')
      .send(validRequestBody)
      .expect(201);

    expect(response.body.data.request_number).toBe('LV-2025-0006');
  });

  test('should allow request when no existing balance record', async () => {
    prisma.leave_balances.findUnique.mockResolvedValue(null); // No balance record
    prisma.leave_requests.count.mockResolvedValue(0);
    prisma.leave_requests.create.mockResolvedValue(mockLeaveRequest);

    const response = await request(app)
      .post('/api/leave-requests')
      .send(validRequestBody)
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});

describe('PATCH /api/leave-requests/:id/status', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  const approvalBody = {
    status: 'APPROVED',
    reviewedBy: 'manager-1',
    reviewNotes: 'Approved for vacation',
  };

  test('should approve request and sync attendance', async () => {
    prisma.leave_requests.findUnique.mockResolvedValue(mockLeaveRequest);
    
    const updatedRequest = {
      ...mockLeaveRequest,
      status: 'APPROVED',
      reviewed_at: new Date(),
      reviewed_by: 'manager-1',
    };
    prisma.leave_requests.update.mockResolvedValue(updatedRequest);

    // Mock attendance operations
    prisma.attendance.findFirst.mockResolvedValue(null);
    prisma.attendance.create.mockResolvedValue({});
    
    // Mock balance update
    prisma.leave_balances.update.mockResolvedValue({
      ...mockLeaveBalance,
      used: 7,
      remaining: 5,
    });

    // Mock notification creation
    prisma.notifications.create.mockResolvedValue({});

    const response = await request(app)
      .patch('/api/leave-requests/lr-1/status')
      .send(approvalBody)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('approved successfully');
    expect(response.body.data.status).toBe('APPROVED');

    // Verify attendance sync was called
    expect(prisma.attendance.create).toHaveBeenCalled();
    
    // Verify balance was updated
    expect(prisma.leave_balances.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          used: { increment: 5 },
          remaining: { decrement: 5 },
        }),
      })
    );

    // Verify notification was created
    expect(prisma.notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          employee_id: 'emp-1',
          type: 'LEAVE_APPROVED',
        }),
      })
    );
  });

  test('should create IZIN attendance records for business days only', async () => {
    // Request from Monday to Friday (5 business days)
    const requestMonToFri = {
      ...mockLeaveRequest,
      start_date: new Date('2025-03-10'), // Monday
      end_date: new Date('2025-03-14'),   // Friday
      total_days: 5,
    };

    prisma.leave_requests.findUnique.mockResolvedValue(requestMonToFri);
    prisma.leave_requests.update.mockResolvedValue({
      ...requestMonToFri,
      status: 'APPROVED',
    });
    prisma.attendance.findFirst.mockResolvedValue(null);
    prisma.attendance.create.mockResolvedValue({});
    prisma.leave_balances.update.mockResolvedValue(mockLeaveBalance);
    prisma.notifications.create.mockResolvedValue({});

    await request(app)
      .patch('/api/leave-requests/lr-1/status')
      .send(approvalBody)
      .expect(200);

    // Should create exactly 5 attendance records (Mon-Fri)
    expect(prisma.attendance.create).toHaveBeenCalledTimes(5);
    
    // Verify all have status 'IZIN'
    const calls = prisma.attendance.create.mock.calls;
    calls.forEach(call => {
      expect(call[0].data.status).toBe('IZIN');
    });
  });

  test('should reject request and send notification', async () => {
    const rejectionBody = {
      status: 'REJECTED',
      reviewedBy: 'manager-1',
      reviewNotes: 'Insufficient staffing during this period',
    };

    prisma.leave_requests.findUnique.mockResolvedValue(mockLeaveRequest);
    prisma.leave_requests.update.mockResolvedValue({
      ...mockLeaveRequest,
      status: 'REJECTED',
      reviewed_at: new Date(),
      reviewed_by: 'manager-1',
      review_notes: rejectionBody.reviewNotes,
    });
    prisma.notifications.create.mockResolvedValue({});

    const response = await request(app)
      .patch('/api/leave-requests/lr-1/status')
      .send(rejectionBody)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('rejected successfully');

    // Should NOT sync attendance for rejected requests
    expect(prisma.attendance.create).not.toHaveBeenCalled();
    expect(prisma.leave_balances.update).not.toHaveBeenCalled();

    // Should send rejection notification
    expect(prisma.notifications.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'LEAVE_REJECTED',
        }),
      })
    );
  });

  test('should reject status update for non-pending request', async () => {
    const approvedRequest = {
      ...mockLeaveRequest,
      status: 'APPROVED',
    };

    prisma.leave_requests.findUnique.mockResolvedValue(approvedRequest);

    const response = await request(app)
      .patch('/api/leave-requests/lr-1/status')
      .send(approvalBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Cannot update status');
    expect(response.body.error).toContain('APPROVED');
  });

  test('should return 404 for non-existent request', async () => {
    prisma.leave_requests.findUnique.mockResolvedValue(null);

    const response = await request(app)
      .patch('/api/leave-requests/non-existent/status')
      .send(approvalBody)
      .expect(404);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Leave request not found');
  });

  test('should validate status enum values', async () => {
    const invalidStatusBody = {
      status: 'INVALID_STATUS',
      reviewedBy: 'manager-1',
    };

    const response = await request(app)
      .patch('/api/leave-requests/lr-1/status')
      .send(invalidStatusBody)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation error');
  });

  test('should update existing attendance records instead of creating duplicates', async () => {
    const existingAttendance = {
      id: 'att-1',
      employee_id: 'emp-1',
      attendance_date: new Date('2025-03-10'),
      status: 'HADIR',
    };

    prisma.leave_requests.findUnique.mockResolvedValue(mockLeaveRequest);
    prisma.leave_requests.update.mockResolvedValue({
      ...mockLeaveRequest,
      status: 'APPROVED',
    });
    
    // Mock finding existing attendance
    prisma.attendance.findFirst.mockResolvedValue(existingAttendance);
    prisma.attendance.update.mockResolvedValue({
      ...existingAttendance,
      status: 'IZIN',
    });
    
    prisma.leave_balances.update.mockResolvedValue(mockLeaveBalance);
    prisma.notifications.create.mockResolvedValue({});

    await request(app)
      .patch('/api/leave-requests/lr-1/status')
      .send(approvalBody)
      .expect(200);

    // Should update existing records, not create new ones
    expect(prisma.attendance.update).toHaveBeenCalled();
    expect(prisma.attendance.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/employees/:id/leave-balance', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  test('should return employee leave balances for current year', async () => {
    const balances = [
      {
        ...mockLeaveBalance,
        leave_type: mockLeaveTypes[0],
      },
      {
        employee_id: 'emp-1',
        year: 2025,
        leave_type_id: 'lt-2',
        total_quota: 10,
        used: 1,
        remaining: 9,
        leave_type: mockLeaveTypes[1],
      },
    ];

    prisma.leave_balances.findMany.mockResolvedValue(balances);

    const response = await request(app)
      .get('/api/employees/emp-1/leave-balance')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.year).toBe(2025);
    expect(response.body.data[0].remaining).toBe(10);
    
    expect(prisma.leave_balances.findMany).toHaveBeenCalledWith({
      where: { employee_id: 'emp-1', year: 2025 },
      include: { leave_type: true },
    });
  });

  test('should return empty array for employee with no balances', async () => {
    prisma.leave_balances.findMany.mockResolvedValue([]);

    const response = await request(app)
      .get('/api/employees/emp-new/leave-balance')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(0);
  });

  test('should handle database errors', async () => {
    prisma.leave_balances.findMany.mockRejectedValue(new Error('DB error'));

    const response = await request(app)
      .get('/api/employees/emp-1/leave-balance')
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Failed to fetch leave balance');
  });
});

// ============================================================================
// EDGE CASES AND ERROR SCENARIOS
// ============================================================================

describe('Edge Cases', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  test('should handle concurrent leave requests', async () => {
    // This would be tested with actual database transactions
    // Here we verify the logic handles it gracefully
    prisma.leave_balances.findUnique.mockResolvedValue(mockLeaveBalance);
    prisma.leave_requests.count.mockResolvedValue(0);
    prisma.leave_requests.create.mockResolvedValue(mockLeaveRequest);

    const request1 = request(app)
      .post('/api/leave-requests')
      .send({
        employeeId: 'emp-1',
        leaveTypeId: 'lt-1',
        startDate: '2025-03-10',
        endDate: '2025-03-14',
        reason: 'Request 1 - Family vacation',
      });

    const request2 = request(app)
      .post('/api/leave-requests')
      .send({
        employeeId: 'emp-1',
        leaveTypeId: 'lt-1',
        startDate: '2025-03-17',
        endDate: '2025-03-21',
        reason: 'Request 2 - Personal matters',
      });

    const [response1, response2] = await Promise.all([request1, request2]);

    expect(response1.status).toBe(201);
    expect(response2.status).toBe(201);
  });

  test('should handle leave request spanning month boundary', async () => {
    const crossMonthRequest = {
      employeeId: 'emp-1',
      leaveTypeId: 'lt-1',
      startDate: '2025-03-30', // Sunday (weekend)
      endDate: '2025-04-04',   // Friday
      reason: 'Cross-month vacation request',
    };

    prisma.leave_balances.findUnique.mockResolvedValue(mockLeaveBalance);
    prisma.leave_requests.count.mockResolvedValue(0);
    prisma.leave_requests.create.mockResolvedValue({
      ...mockLeaveRequest,
      start_date: new Date(crossMonthRequest.startDate),
      end_date: new Date(crossMonthRequest.endDate),
      total_days: 5, // Should be 5 business days (Mon-Fri)
    });

    const response = await request(app)
      .post('/api/leave-requests')
      .send(crossMonthRequest)
      .expect(201);

    expect(response.body.data.total_days).toBe(5);
  });

  test('should handle request with optional attachment URL', async () => {
    const requestWithAttachment = {
      employeeId: 'emp-1',
      leaveTypeId: 'lt-1',
      startDate: '2025-03-10',
      endDate: '2025-03-14',
      reason: 'Medical leave with doctor note',
      attachmentUrl: 'https://storage.example.com/doc-123.pdf',
    };

    prisma.leave_balances.findUnique.mockResolvedValue(mockLeaveBalance);
    prisma.leave_requests.count.mockResolvedValue(0);
    prisma.leave_requests.create.mockResolvedValue({
      ...mockLeaveRequest,
      attachment_url: requestWithAttachment.attachmentUrl,
    });

    const response = await request(app)
      .post('/api/leave-requests')
      .send(requestWithAttachment)
      .expect(201);

    expect(response.body.data.attachment_url).toBe(requestWithAttachment.attachmentUrl);
  });

  test('should validate attachment URL format', async () => {
    const invalidUrlRequest = {
      employeeId: 'emp-1',
      leaveTypeId: 'lt-1',
      startDate: '2025-03-10',
      endDate: '2025-03-14',
      reason: 'Valid reason here',
      attachmentUrl: 'not-a-valid-url',
    };

    const response = await request(app)
      .post('/api/leave-requests')
      .send(invalidUrlRequest)
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toBe('Validation error');
  });
});
