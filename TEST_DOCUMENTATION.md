# Leave Management System - Test Suite

Comprehensive unit tests for the Employee Attendance & Leave Management System covering both backend API routes and frontend React components.

## 📋 Table of Contents

- [Overview](#overview)
- [Test Coverage](#test-coverage)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Backend Tests](#backend-tests)
- [Frontend Tests](#frontend-tests)
- [Writing New Tests](#writing-new-tests)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

This test suite provides comprehensive coverage for:

**Backend (Jest + Supertest)**
- API endpoint testing
- Business logic validation
- Database operations (mocked with Prisma)
- Error handling and edge cases

**Frontend (Vitest + React Testing Library)**
- Component rendering
- User interactions
- Form validation
- API integration
- Loading states and error handling

---

## 📊 Test Coverage

### Backend Tests (`leave.test.js`)

✅ **Helper Functions**
- Business day calculation (weekend exclusion)
- Edge cases (single day, weekends only, cross-month)

✅ **API Endpoints**
- `GET /api/leave-types` - Fetch active leave types
- `GET /api/leave-requests` - List and filter requests
- `POST /api/leave-requests` - Create new requests
- `PATCH /api/leave-requests/:id/status` - Approve/reject
- `GET /api/employees/:id/leave-balance` - Balance checking

✅ **Business Logic**
- Leave balance validation
- Insufficient balance rejection
- Attendance sync on approval
- Request number generation
- Weekend handling in attendance sync

### Frontend Tests (`LeaveRequestForm.test.tsx`)

✅ **Component Mounting**
- Initial render
- Data fetching (leave types, balances)
- Required field indicators

✅ **User Interactions**
- Leave type selection
- Date range input
- Business day calculation display
- File upload (for document-required leave types)
- Character counting

✅ **Form Validation**
- Required field checks
- Date range validation
- Reason length validation (minimum 10 characters)
- Balance sufficiency check
- Document requirement check
- File size validation (5MB limit)

✅ **Form Submission**
- Submit button disabled state
- Loading indicators
- Success/error messaging
- API request payload
- Callback invocation

✅ **Edge Cases**
- API failures
- Empty responses
- Zero balance scenarios
- Rapid submissions
- Network errors

---

## 🚀 Installation

### Prerequisites
```bash
Node.js >= 18.x
npm >= 9.x
```

### Install Dependencies
```bash
# Install all dependencies
npm install

# Or install separately
npm install --save-dev jest supertest jest-mock-extended
npm install --save-dev vitest @vitest/ui @testing-library/react @testing-library/user-event
```

---

## 🧪 Running Tests

### Backend Tests (Jest)

```bash
# Run all backend tests
npm run test:backend

# Watch mode (re-run on file changes)
npm run test:backend:watch

# With coverage report
npm run test:backend:coverage
```

**Individual test suites:**
```bash
# Run specific test file
npx jest leave.test.js

# Run tests matching pattern
npx jest --testNamePattern="business days"

# Run only failed tests
npx jest --onlyFailures
```

### Frontend Tests (Vitest)

```bash
# Run all frontend tests
npm run test:frontend

# Watch mode
npm run test:frontend:watch

# Interactive UI
npm run test:frontend:ui

# With coverage report
npm run test:frontend:coverage
```

**Individual test suites:**
```bash
# Run specific test file
npx vitest LeaveRequestForm.test.tsx

# Run tests matching pattern
npx vitest -t "validation"

# Debug mode
npx vitest --inspect-brk
```

### Run All Tests

```bash
# Run both backend and frontend tests
npm run test:all

# With coverage
npm run test:all:coverage
```

---

## 📁 Test Structure

```
project/
├── backend/
│   └── src/
│       └── routes/
│           ├── leave_routes.js          # Source code
│           └── leave.test.js            # Tests ✅
├── frontend/
│   └── src/
│       └── components/
│           └── leave/
│               ├── LeaveRequestForm.tsx        # Component
│               └── LeaveRequestForm.test.tsx   # Tests ✅
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Jest global setup
├── vitest.config.ts            # Vitest configuration
├── vitest.setup.ts             # Vitest global setup
└── package.json                # Test scripts
```

---

## 🔧 Backend Tests

### File: `leave.test.js`

**Key Test Scenarios:**

1. **Business Day Calculation**
   ```javascript
   test('should correctly skip weekends', () => {
     const result = calculateBusinessDays('2025-03-10', '2025-03-14');
     expect(result).toBe(5); // Mon-Fri
   });
   ```

2. **Insufficient Balance**
   ```javascript
   test('should reject request with insufficient balance', async () => {
     prisma.leave_balances.findUnique.mockResolvedValue({
       remaining: 3, // Less than requested 5 days
     });
     
     const response = await request(app)
       .post('/api/leave-requests')
       .send(validRequestBody)
       .expect(400);
       
     expect(response.body.error).toBe('Insufficient leave balance');
   });
   ```

3. **Attendance Sync on Approval**
   ```javascript
   test('should create IZIN attendance records for business days only', async () => {
     // Mocks...
     await request(app)
       .patch('/api/leave-requests/lr-1/status')
       .send({ status: 'APPROVED', reviewedBy: 'manager-1' });
       
     expect(prisma.attendance.create).toHaveBeenCalledTimes(5); // 5 business days
   });
   ```

**Mocking Strategy:**
- Uses `jest-mock-extended` for Prisma Client
- All database operations are mocked
- Request/response testing with Supertest

---

## 🎨 Frontend Tests

### File: `LeaveRequestForm.test.tsx`

**Key Test Scenarios:**

1. **Submit Button Disabled State**
   ```typescript
   test('should disable submit button while submitting', async () => {
     const { user } = await setupComponent();
     await fillValidForm(user);
     
     const submitButton = screen.getByRole('button', { name: /submit/i });
     await user.click(submitButton);
     
     expect(submitButton).toBeDisabled();
     expect(screen.getByText(/submitting.../i)).toBeInTheDocument();
   });
   ```

2. **Form Validation**
   ```typescript
   test('should show error when reason is too short', async () => {
     const { user } = await setupComponent();
     
     // Fill form with short reason
     await user.type(reasonTextarea, 'Short'); // Only 5 chars
     await user.click(submitButton);
     
     await waitFor(() => {
       expect(screen.getByText(/at least 10 characters/i)).toBeInTheDocument();
     });
   });
   ```

3. **Business Day Calculation**
   ```typescript
   test('should skip weekends in calculation', async () => {
     const { user } = await setupComponent();
     
     await user.type(startDateInput, '2025-03-10'); // Monday
     await user.type(endDateInput, '2025-03-17');   // Next Monday
     
     await waitFor(() => {
       expect(screen.getByText('6')).toBeInTheDocument(); // 6 business days
     });
   });
   ```

**Testing Utilities:**
- `@testing-library/react` for rendering
- `@testing-library/user-event` for realistic interactions
- `waitFor` for async operations
- Custom `setupComponent()` helper

---

## ✍️ Writing New Tests

### Backend Test Template

```javascript
describe('New Feature', () => {
  beforeEach(() => {
    mockReset(prisma);
  });

  test('should handle new scenario', async () => {
    // 1. Setup mocks
    prisma.model.method.mockResolvedValue(mockData);
    
    // 2. Make request
    const response = await request(app)
      .post('/api/endpoint')
      .send(requestBody)
      .expect(200);
    
    // 3. Assertions
    expect(response.body.success).toBe(true);
    expect(prisma.model.method).toHaveBeenCalledWith(expectedArgs);
  });
});
```

### Frontend Test Template

```typescript
describe('NewComponent', () => {
  test('should handle user interaction', async () => {
    // 1. Setup
    const { user } = await setupComponent();
    
    // 2. Interact
    const button = screen.getByRole('button', { name: /click me/i });
    await user.click(button);
    
    // 3. Assert
    await waitFor(() => {
      expect(screen.getByText(/expected result/i)).toBeInTheDocument();
    });
  });
});
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Cannot find module '@prisma/client'"**
```bash
# Ensure Prisma is installed and generated
npm install @prisma/client
npx prisma generate
```

**2. "fetch is not defined" (Node < 18)**
```bash
# Install node-fetch polyfill
npm install --save-dev node-fetch
```
```javascript
// In jest.setup.js
global.fetch = require('node-fetch');
```

**3. "JSDOM not found"**
```bash
npm install --save-dev jsdom
```

**4. Tests timeout**
```javascript
// Increase timeout in specific test
test('slow test', async () => {
  // ...
}, 10000); // 10 second timeout

// Or globally in jest.config.js / vitest.config.ts
testTimeout: 10000
```

**5. Mock not resetting between tests**
```javascript
// Ensure in jest.setup.js or vitest.setup.ts
afterEach(() => {
  vi.clearAllMocks(); // Vitest
  jest.clearAllMocks(); // Jest
});
```

---

## 📈 Coverage Reports

After running tests with coverage:

```bash
# View coverage summary in terminal
npm run test:backend:coverage

# Open detailed HTML report
open coverage/lcov-report/index.html

# Frontend coverage
npm run test:frontend:coverage
open coverage/index.html
```

**Coverage Thresholds:**
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

---

## 🔍 Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:all:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

---

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/)
- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Supertest](https://github.com/visionmedia/supertest)
- [jest-mock-extended](https://github.com/marchaos/jest-mock-extended)

---

## 📝 Notes

- All tests use mocked data - no real database operations
- Tests are isolated and can run in any order
- Each test suite is independent
- All async operations use proper `await` and `waitFor`
- File uploads are simulated with mock File objects
- Date calculations account for timezone (UTC)

---

## ✅ Best Practices

1. **Use descriptive test names** - Test name should explain what is being tested
2. **Arrange-Act-Assert** - Clear structure in each test
3. **One assertion focus** - Each test should verify one thing
4. **Mock external dependencies** - Isolate unit under test
5. **Test edge cases** - Don't just test the happy path
6. **Keep tests fast** - Mock slow operations
7. **Clean up after tests** - Reset state between tests
8. **Test user behavior** - Not implementation details

---

**Happy Testing! 🎉**
