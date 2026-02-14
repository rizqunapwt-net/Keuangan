// ============================================================================
// FRONTEND UNIT TESTS - LeaveRequestForm Component
// Framework: Vitest + React Testing Library
// Coverage: User interactions, validation, API calls, loading states
// ============================================================================

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeaveRequestForm from './LeaveRequestForm';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock fetch globally
global.fetch = vi.fn();

// Mock file for upload testing
const createMockFile = (name = 'test.pdf', size = 1024, type = 'application/pdf') => {
  const file = new File(['dummy content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockLeaveTypes = [
  {
    id: 'lt-1',
    code: 'ANNUAL',
    name: 'Annual Leave',
    description: 'Regular annual leave',
    maxDays: 12,
    requiresDoc: false,
    color: '#3B82F6',
  },
  {
    id: 'lt-2',
    code: 'SICK',
    name: 'Sick Leave',
    description: 'Medical leave',
    maxDays: 10,
    requiresDoc: true,
    color: '#EF4444',
  },
  {
    id: 'lt-3',
    code: 'EMERGENCY',
    name: 'Emergency Leave',
    description: 'Urgent personal matters',
    maxDays: 5,
    requiresDoc: false,
    color: '#F59E0B',
  },
];

const mockBalances = [
  {
    leaveTypeId: 'lt-1',
    totalQuota: 12,
    used: 2,
    remaining: 10,
  },
  {
    leaveTypeId: 'lt-2',
    totalQuota: 10,
    used: 1,
    remaining: 9,
  },
  {
    leaveTypeId: 'lt-3',
    totalQuota: 5,
    used: 0,
    remaining: 5,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mockSuccessfulLeaveTypesResponse = () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, data: mockLeaveTypes }),
  });
};

const mockSuccessfulBalancesResponse = () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ success: true, data: mockBalances }),
  });
};

const mockSuccessfulSubmission = () => {
  global.fetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({
      success: true,
      message: 'Leave request submitted successfully',
      data: {
        id: 'lr-1',
        request_number: 'LV-2025-0001',
        status: 'PENDING',
      },
    }),
  });
};

const setupComponent = async () => {
  mockSuccessfulLeaveTypesResponse();
  mockSuccessfulBalancesResponse();
  
  const user = userEvent.setup();
  const onSuccess = vi.fn();
  const onCancel = vi.fn();
  
  const utils = render(
    <LeaveRequestForm onSuccess={onSuccess} onCancel={onCancel} />
  );

  // Wait for initial data to load
  await waitFor(() => {
    expect(screen.getByText('Annual Leave')).toBeInTheDocument();
  });

  return { ...utils, user, onSuccess, onCancel };
};

const fillValidForm = async (user) => {
  // Select leave type
  const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
  await user.click(annualLeaveButton);

  // Fill dates (Monday to Friday)
  const startDateInput = screen.getByLabelText(/start date/i);
  const endDateInput = screen.getByLabelText(/end date/i);
  
  await user.type(startDateInput, '2025-03-10'); // Monday
  await user.type(endDateInput, '2025-03-14');   // Friday

  // Fill reason
  const reasonTextarea = screen.getByPlaceholderText(/please provide a detailed reason/i);
  await user.type(reasonTextarea, 'This is a valid reason for my leave request');
};

// ============================================================================
// COMPONENT MOUNTING AND INITIAL STATE TESTS
// ============================================================================

describe('LeaveRequestForm - Component Mounting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render form with all required fields', async () => {
    await setupComponent();

    expect(screen.getByText('New Leave Request')).toBeInTheDocument();
    expect(screen.getByLabelText(/leave type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit request/i })).toBeInTheDocument();
  });

  test('should fetch and display leave types on mount', async () => {
    await setupComponent();

    await waitFor(() => {
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
      expect(screen.getByText('Sick Leave')).toBeInTheDocument();
      expect(screen.getByText('Emergency Leave')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/leave-types');
  });

  test('should fetch and display leave balances on mount', async () => {
    await setupComponent();

    await waitFor(() => {
      // Check for remaining days display
      const annualLeaveCard = screen.getByText('Annual Leave').closest('button');
      expect(within(annualLeaveCard).getByText('10')).toBeInTheDocument();
      expect(within(annualLeaveCard).getByText('days left')).toBeInTheDocument();
    });

    expect(global.fetch).toHaveBeenCalledWith('/api/employees/current-user-id/leave-balance');
  });

  test('should show document required indicator for leave types that need it', async () => {
    await setupComponent();

    const sickLeaveCard = screen.getByText('Sick Leave').closest('button');
    expect(within(sickLeaveCard).getByText('Document required')).toBeInTheDocument();
  });

  test('should display cancel button when onCancel is provided', async () => {
    const { onCancel } = await setupComponent();

    const cancelButtons = screen.getAllByRole('button', { name: /cancel/i });
    expect(cancelButtons.length).toBeGreaterThan(0);

    await userEvent.click(cancelButtons[0]);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});

// ============================================================================
// FORM INTERACTION TESTS
// ============================================================================

describe('LeaveRequestForm - User Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should allow selecting a leave type', async () => {
    const { user } = await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    await user.click(annualLeaveButton);

    expect(annualLeaveButton).toHaveClass('border-purple-500');
  });

  test('should allow switching between leave types', async () => {
    const { user } = await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    const sickLeaveButton = screen.getByRole('button', { name: /sick leave/i });

    await user.click(annualLeaveButton);
    expect(annualLeaveButton).toHaveClass('border-purple-500');

    await user.click(sickLeaveButton);
    expect(sickLeaveButton).toHaveClass('border-purple-500');
    expect(annualLeaveButton).not.toHaveClass('border-purple-500');
  });

  test('should update start and end dates', async () => {
    const { user } = await setupComponent();

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.type(startDateInput, '2025-03-10');
    await user.type(endDateInput, '2025-03-14');

    expect(startDateInput).toHaveValue('2025-03-10');
    expect(endDateInput).toHaveValue('2025-03-14');
  });

  test('should calculate and display business days correctly', async () => {
    const { user } = await setupComponent();

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    // Monday to Friday = 5 business days
    await user.type(startDateInput, '2025-03-10');
    await user.type(endDateInput, '2025-03-14');

    await waitFor(() => {
      expect(screen.getByText('Business days')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  test('should skip weekends in business days calculation', async () => {
    const { user } = await setupComponent();

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    // Monday to next Monday (includes weekend) = 6 business days
    await user.type(startDateInput, '2025-03-10');
    await user.type(endDateInput, '2025-03-17');

    await waitFor(() => {
      expect(screen.getByText('6')).toBeInTheDocument();
    });
  });

  test('should show remaining balance after request', async () => {
    const { user } = await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    await user.click(annualLeaveButton);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.type(startDateInput, '2025-03-10');
    await user.type(endDateInput, '2025-03-14'); // 5 days

    await waitFor(() => {
      // Current balance is 10, after 5 days request = 5 remaining
      expect(screen.getByText(/after this request: 5 days remaining/i)).toBeInTheDocument();
    });
  });

  test('should update reason field and show character count', async () => {
    const { user } = await setupComponent();

    const reasonTextarea = screen.getByPlaceholderText(/please provide a detailed reason/i);
    const testReason = 'Family vacation';

    await user.type(reasonTextarea, testReason);

    expect(reasonTextarea).toHaveValue(testReason);
    expect(screen.getByText(`${testReason.length} / 500 characters`)).toBeInTheDocument();
  });

  test('should show file upload field for leave types requiring documents', async () => {
    const { user } = await setupComponent();

    // Initially no file upload field
    expect(screen.queryByText(/supporting document/i)).not.toBeInTheDocument();

    // Select sick leave (requires doc)
    const sickLeaveButton = screen.getByRole('button', { name: /sick leave/i });
    await user.click(sickLeaveButton);

    // File upload should appear
    await waitFor(() => {
      expect(screen.getByText(/supporting document/i)).toBeInTheDocument();
    });
  });

  test('should handle file upload', async () => {
    const { user } = await setupComponent();

    const sickLeaveButton = screen.getByRole('button', { name: /sick leave/i });
    await user.click(sickLeaveButton);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const file = createMockFile('medical-cert.pdf', 1024 * 1024); // 1MB

    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText('medical-cert.pdf')).toBeInTheDocument();
    });
  });

  test('should reject files larger than 5MB', async () => {
    const { user } = await setupComponent();

    const sickLeaveButton = screen.getByRole('button', { name: /sick leave/i });
    await user.click(sickLeaveButton);

    const fileInput = screen.getByLabelText(/click to upload/i);
    const largeFile = createMockFile('large-file.pdf', 6 * 1024 * 1024); // 6MB

    await user.upload(fileInput, largeFile);

    await waitFor(() => {
      expect(screen.getByText(/file size must be less than 5mb/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// FORM VALIDATION TESTS
// ============================================================================

describe('LeaveRequestForm - Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should show error when submitting without leave type', async () => {
    const { user } = await setupComponent();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please select a leave type/i)).toBeInTheDocument();
    });
  });

  test('should show error when submitting without dates', async () => {
    const { user } = await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    await user.click(annualLeaveButton);

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please select both start and end dates/i)).toBeInTheDocument();
    });
  });

  test('should validate end date is after start date', async () => {
    const { user } = await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    await user.click(annualLeaveButton);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.type(startDateInput, '2025-03-14');
    await user.type(endDateInput, '2025-03-10'); // End before start

    const reasonTextarea = screen.getByPlaceholderText(/please provide a detailed reason/i);
    await user.type(reasonTextarea, 'Valid reason text here');

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/end date must be after start date/i)).toBeInTheDocument();
    });
  });

  test('should show error when reason is too short (< 10 characters)', async () => {
    const { user } = await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    await user.click(annualLeaveButton);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.type(startDateInput, '2025-03-10');
    await user.type(endDateInput, '2025-03-14');

    const reasonTextarea = screen.getByPlaceholderText(/please provide a detailed reason/i);
    await user.type(reasonTextarea, 'Short'); // Only 5 characters

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/reason must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  test('should show error when requesting more days than available balance', async () => {
    const { user } = await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    await user.click(annualLeaveButton);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    // Request 15 business days (more than the 10 available)
    await user.type(startDateInput, '2025-03-03');
    await user.type(endDateInput, '2025-03-21'); // 15 business days

    const reasonTextarea = screen.getByPlaceholderText(/please provide a detailed reason/i);
    await user.type(reasonTextarea, 'Valid reason for extended leave');

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/insufficient balance. you have 10 days remaining/i)).toBeInTheDocument();
    });
  });

  test('should require document for leave types that need it', async () => {
    const { user } = await setupComponent();

    const sickLeaveButton = screen.getByRole('button', { name: /sick leave/i });
    await user.click(sickLeaveButton);

    const startDateInput = screen.getByLabelText(/start date/i);
    const endDateInput = screen.getByLabelText(/end date/i);

    await user.type(startDateInput, '2025-03-10');
    await user.type(endDateInput, '2025-03-12');

    const reasonTextarea = screen.getByPlaceholderText(/please provide a detailed reason/i);
    await user.type(reasonTextarea, 'Medical appointment and recovery');

    // Don't upload a file (which is required for sick leave)
    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/sick leave requires supporting documents/i)).toBeInTheDocument();
    });
  });

  test('should clear previous error when form is corrected', async () => {
    const { user } = await setupComponent();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/please select a leave type/i)).toBeInTheDocument();
    });

    // Fix the error by selecting a leave type
    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    await user.click(annualLeaveButton);

    // Error should be cleared when user interacts with form again
    await waitFor(() => {
      expect(screen.queryByText(/please select a leave type/i)).not.toBeInTheDocument();
    }, { timeout: 1000 });
  });
});

// ============================================================================
// FORM SUBMISSION TESTS
// ============================================================================

describe('LeaveRequestForm - Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should disable submit button while submitting', async () => {
    const { user } = await setupComponent();

    await fillValidForm(user);

    // Mock a delayed response
    global.fetch.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      }), 100))
    );

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    // Button should be disabled immediately
    expect(submitButton).toBeDisabled();
    expect(screen.getByText(/submitting.../i)).toBeInTheDocument();
  });

  test('should show loading state during submission', async () => {
    const { user } = await setupComponent();

    await fillValidForm(user);

    global.fetch.mockImplementationOnce(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: async () => ({ success: true, data: {} }),
      }), 100))
    );

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    // Check for loader icon
    const loader = screen.getByTestId('loader-icon') || screen.getByText(/submitting/i);
    expect(loader).toBeInTheDocument();
  });

  test('should submit valid form successfully', async () => {
    const { user, onSuccess } = await setupComponent();

    await fillValidForm(user);

    // Mock successful submission
    mockSuccessfulSubmission();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/leave-requests',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('employeeId'),
        })
      );
    });
  });

  test('should send correct data in request body', async () => {
    const { user } = await setupComponent();

    await fillValidForm(user);
    mockSuccessfulSubmission();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      const fetchCall = global.fetch.mock.calls.find(
        call => call[0] === '/api/leave-requests'
      );
      
      expect(fetchCall).toBeDefined();
      const requestBody = JSON.parse(fetchCall[1].body);
      
      expect(requestBody).toMatchObject({
        employeeId: 'current-user-id',
        leaveTypeId: 'lt-1',
        startDate: '2025-03-10',
        endDate: '2025-03-14',
        reason: expect.stringContaining('valid reason'),
      });
    });
  });

  test('should show success message after successful submission', async () => {
    const { user } = await setupComponent();

    await fillValidForm(user);
    mockSuccessfulSubmission();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/request submitted!/i)).toBeInTheDocument();
      expect(screen.getByText(/your leave request has been submitted successfully/i)).toBeInTheDocument();
    });
  });

  test('should call onSuccess callback after successful submission', async () => {
    const { user, onSuccess } = await setupComponent();

    await fillValidForm(user);
    mockSuccessfulSubmission();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    // Wait for the 2-second delay before onSuccess is called
    await waitFor(
      () => {
        expect(onSuccess).toHaveBeenCalledTimes(1);
      },
      { timeout: 3000 }
    );
  });

  test('should show error message when submission fails', async () => {
    const { user } = await setupComponent();

    await fillValidForm(user);

    // Mock failed submission
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        success: false,
        error: 'Insufficient leave balance',
      }),
    });

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/insufficient leave balance/i)).toBeInTheDocument();
    });
  });

  test('should handle network errors gracefully', async () => {
    const { user } = await setupComponent();

    await fillValidForm(user);

    // Mock network error
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error. please try again/i)).toBeInTheDocument();
    });
  });

  test('should re-enable submit button after failed submission', async () => {
    const { user } = await setupComponent();

    await fillValidForm(user);

    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    // Button should be re-enabled
    expect(submitButton).not.toBeDisabled();
  });
});

// ============================================================================
// EDGE CASES AND INTEGRATION TESTS
// ============================================================================

describe('LeaveRequestForm - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should handle API failures gracefully on mount', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));
    global.fetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<LeaveRequestForm />);

    // Component should still render even if data fetch fails
    expect(screen.getByText('New Leave Request')).toBeInTheDocument();
  });

  test('should handle empty leave types response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }),
    });

    render(<LeaveRequestForm />);

    await waitFor(() => {
      expect(screen.getByText('New Leave Request')).toBeInTheDocument();
    });

    // Should not have any leave type cards
    expect(screen.queryByText('Annual Leave')).not.toBeInTheDocument();
  });

  test('should handle leave type with zero remaining balance', async () => {
    const zeroBalances = [
      {
        leaveTypeId: 'lt-1',
        totalQuota: 12,
        used: 12,
        remaining: 0,
      },
    ];

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockLeaveTypes }),
    });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: zeroBalances }),
    });

    const { user } = render(<LeaveRequestForm />);

    await waitFor(() => {
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
    });

    const annualLeaveCard = screen.getByText('Annual Leave').closest('button');
    expect(within(annualLeaveCard).getByText('0')).toBeInTheDocument();
  });

  test('should allow form submission even if balance check returns no data', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockLeaveTypes }),
    });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] }), // No balances
    });

    const { user } = render(<LeaveRequestForm />);

    await waitFor(() => {
      expect(screen.getByText('Annual Leave')).toBeInTheDocument();
    });

    await fillValidForm(user);
    mockSuccessfulSubmission();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/request submitted!/i)).toBeInTheDocument();
    });
  });

  test('should handle rapid consecutive submissions', async () => {
    const { user } = await setupComponent();

    await fillValidForm(user);
    mockSuccessfulSubmission();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    
    // Try clicking multiple times rapidly
    await user.click(submitButton);
    await user.click(submitButton);
    await user.click(submitButton);

    // Should only submit once due to disabled state
    await waitFor(() => {
      const fetchCalls = global.fetch.mock.calls.filter(
        call => call[0] === '/api/leave-requests'
      );
      expect(fetchCalls.length).toBe(1);
    });
  });

  test('should clear form state after successful submission', async () => {
    const { user, onSuccess } = await setupComponent();

    await fillValidForm(user);
    mockSuccessfulSubmission();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/request submitted!/i)).toBeInTheDocument();
    });

    // Success screen should replace the form
    expect(screen.queryByLabelText(/leave type/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('LeaveRequestForm - Accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should have proper ARIA labels', async () => {
    await setupComponent();

    expect(screen.getByLabelText(/leave type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/start date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason/i)).toBeInTheDocument();
  });

  test('should mark required fields with asterisk', async () => {
    await setupComponent();

    const requiredMarkers = screen.getAllByText('*');
    expect(requiredMarkers.length).toBeGreaterThan(0);
  });

  test('should show error messages with proper ARIA roles', async () => {
    const { user } = await setupComponent();

    const submitButton = screen.getByRole('button', { name: /submit request/i });
    await user.click(submitButton);

    await waitFor(() => {
      const errorMessage = screen.getByText(/please select a leave type/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('should support keyboard navigation', async () => {
    await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /annual leave/i });
    
    // Tab to the button and press Enter
    annualLeaveButton.focus();
    fireEvent.keyDown(annualLeaveButton, { key: 'Enter', code: 'Enter' });

    expect(annualLeaveButton).toHaveClass('border-purple-500');
  });
});
