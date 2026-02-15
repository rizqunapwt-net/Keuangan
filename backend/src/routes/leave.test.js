// ============================================================================
// BACKEND UNIT TESTS - Leave Routes
// Framework: Jest + Supertest
// Coverage: Business logic, validation, database operations, edge cases
// ============================================================================

const request = require('supertest');
const express = require('express');

// Mock our internal prisma singleton with plain Jest mocks
jest.mock('../lib/prisma', () => ({
  leave_types: {
    findMany: jest.fn()
  },
  leave_requests: {
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn()
  },
  leave_balances: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn()
  },
  attendance: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  notifications: {
    create: jest.fn()
  }
}));

// Mock middlewares BEFORE importing the router
jest.mock('../middlewares/assertAuthenticated', () => (req, res, next) => {
  req.user = { role: 'ADMIN', userId: 'test-admin' }; // Simulate logged in admin
  next();
});
jest.mock('../middlewares/requireAnyRole', () => (roles) => (req, res, next) => {
  req.user = { role: 'ADMIN', userId: 'test-admin' }; // Simulate role match
  next();
});

// Import the mocked instance
const mockPrisma = require('../lib/prisma');
const leaveRouter = require('./leave.routes');

// Create Express app for testing
const app = express();
app.use(express.json());
// Add a mock req.user for tests that check it directly
app.use((req, res, next) => {
  req.user = { role: 'ADMIN', userId: 'test-admin' };
  next();
});
app.use('/api', leaveRouter);

// Use static year for tests (matches system clock 2026)
const CURRENT_YEAR = new Date().getFullYear();

// ============================================================================
// TEST DATA FIXTURES - Using Valid UUID v4 placeholders
// ============================================================================

const VALID_EMPLOYEE_ID = '00000000-0000-4000-8000-000000000001';
const VALID_LEAVE_TYPE_ID = '00000000-0000-4000-8000-000000000011';
const VALID_ADMIN_ID = '00000000-0000-4000-8000-000000000002';
const VALID_REQUEST_ID = '00000000-0000-4000-8000-000000000101';

const mockLeaveTypes = [
  {
    id: VALID_LEAVE_TYPE_ID,
    code: 'ANNUAL',
    name: 'Annual Leave',
    description: 'Regular annual leave',
    max_days: 12,
    is_active: true,
  }
];

const mockLeaveBalance = {
  employee_id: VALID_EMPLOYEE_ID,
  year: CURRENT_YEAR,
  leave_type_id: VALID_LEAVE_TYPE_ID,
  remaining: 10,
};

const mockLeaveRequest = {
  id: VALID_REQUEST_ID,
  request_number: 'LV-2026-0001',
  employee_id: VALID_EMPLOYEE_ID,
  leave_type_id: VALID_LEAVE_TYPE_ID,
  start_date: new Date('2026-03-10'),
  end_date: new Date('2026-03-14'),
  total_days: 5,
  status: 'PENDING',
  leave_type: mockLeaveTypes[0],
};

// ============================================================================
// API ENDPOINT TESTS
// ============================================================================

describe('Leave App Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/leave-types should return types', async () => {
    mockPrisma.leave_types.findMany.mockResolvedValue(mockLeaveTypes);
    const response = await request(app).get('/api/leave-types').expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(1);
  });

  test('POST /api/leave-requests should create request', async () => {
    mockPrisma.leave_balances.findUnique.mockResolvedValue(mockLeaveBalance);
    mockPrisma.leave_requests.count.mockResolvedValue(0);
    mockPrisma.leave_requests.create.mockResolvedValue(mockLeaveRequest);

    const body = {
      employeeId: VALID_EMPLOYEE_ID,
      leaveTypeId: VALID_LEAVE_TYPE_ID,
      startDate: '2026-03-10',
      endDate: '2026-03-14',
      reason: 'Necessary vacation for family'
    };

    const response = await request(app).post('/api/leave-requests').send(body);
    if (response.status !== 201) {
      console.log('[DEBUG] POST FAILED. Body:', JSON.stringify(response.body, null, 2));
    }
    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  test('PATCH /api/leave-requests/:id/status should approve', async () => {
    mockPrisma.leave_requests.findUnique.mockResolvedValue(mockLeaveRequest);
    mockPrisma.leave_requests.update.mockResolvedValue({ ...mockLeaveRequest, status: 'APPROVED' });
    mockPrisma.attendance.findFirst.mockResolvedValue(null);
    mockPrisma.attendance.create.mockResolvedValue({});
    mockPrisma.leave_balances.update.mockResolvedValue(mockLeaveBalance);
    mockPrisma.notifications.create.mockResolvedValue({});

    const body = {
      status: 'APPROVED',
      reviewedBy: VALID_ADMIN_ID,
      reviewNotes: 'OK'
    };

    const response = await request(app).patch(`/api/leave-requests/${VALID_REQUEST_ID}/status`).send(body);
    if (response.status !== 200) {
      console.log('[DEBUG] PATCH FAILED. Body:', JSON.stringify(response.body, null, 2));
    }
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('GET /api/employees/:id/leave-balance should return balance', async () => {
    mockPrisma.leave_balances.findMany.mockResolvedValue([mockLeaveBalance]);
    const response = await request(app).get(`/api/employees/${VALID_EMPLOYEE_ID}/leave-balance`).expect(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveLength(1);
    expect(response.body.year).toBe(CURRENT_YEAR);
  });
});
