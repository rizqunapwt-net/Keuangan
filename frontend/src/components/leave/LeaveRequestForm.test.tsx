// ============================================================================
// FRONTEND UNIT TESTS - LeaveRequestForm Component
// Framework: Vitest + React Testing Library
// Coverage: User interactions, validation, API calls, loading states
// ============================================================================

import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LeaveRequestForm from './LeaveRequestForm';

// ============================================================================
// MOCK SETUP
// ============================================================================

// Mock API client
vi.mock('@/utils/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  },
}));

import api from '@/utils/api';
const mockedApi = vi.mocked(api);

// ============================================================================
// TEST DATA FIXTURES
// ============================================================================

const mockUser = {
  success: true,
  data: {
    id: 'user-1',
    employee_id: '00000000-0000-0000-0000-000000000001',
    role: 'EMPLOYEE'
  }
};

const mockLeaveTypes = [
  {
    id: '00000000-0000-0000-0000-000000000011',
    code: 'ANNUAL',
    name: 'Cuti Tahunan',
    description: 'Jatah cuti tahunan reguler',
    maxDays: 12,
    requiresDoc: false,
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    code: 'SICK',
    name: 'Cuti Sakit',
    description: 'Cuti karena alasan kesehatan',
    maxDays: 10,
    requiresDoc: true,
  },
];

const mockBalances = [
  {
    leave_type_id: '00000000-0000-0000-0000-000000000011',
    total_quota: 12,
    used: 2,
    remaining: 10,
  },
  {
    leave_type_id: '00000000-0000-0000-0000-000000000012',
    total_quota: 10,
    used: 1,
    remaining: 9,
  },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const mockApiImplementation = () => {
  (mockedApi.get as any).mockImplementation((url: string) => {
    if (url === '/api/users/me') {
      return Promise.resolve({ data: mockUser });
    }
    if (url === '/api/leave-types') {
      return Promise.resolve({ data: { success: true, data: mockLeaveTypes } });
    }
    if (url.includes('/leave-balance')) {
      return Promise.resolve({ data: { success: true, data: mockBalances } });
    }
    return Promise.reject(new Error(`Unhandled GET request: ${url}`));
  });

  (mockedApi.post as any).mockImplementation((url: string) => {
    if (url === '/api/leave-requests') {
      return Promise.resolve({
        data: {
          success: true,
          message: 'Leave request submitted successfully',
          data: {
            id: 'lr-1',
            request_number: 'LV-2025-0001',
            status: 'PENDING',
          },
        },
      });
    }
    return Promise.reject(new Error(`Unhandled POST request: ${url}`));
  });
};

const setupComponent = async () => {
  mockApiImplementation();

  const user = userEvent.setup();
  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  const utils = render(
    <LeaveRequestForm onSuccess={onSuccess} onCancel={onCancel} />
  );

  // Wait for initial data to load (Searching for Indonesian localized text)
  await waitFor(() => {
    expect(screen.getByText('Cuti Tahunan')).toBeInTheDocument();
  });

  return { ...utils, user, onSuccess, onCancel };
};

const fillValidForm = async (user: any) => {
  // Select leave type
  const annualLeaveButton = screen.getByRole('button', { name: /cuti tahunan/i });
  await user.click(annualLeaveButton);

  // Fill dates (Monday to Friday)
  const startDateInput = screen.getByLabelText(/mulai/i);
  const endDateInput = screen.getByLabelText(/hingga/i);

  await user.type(startDateInput, '2025-03-10'); // Monday
  await user.type(endDateInput, '2025-03-14');   // Friday

  // Fill reason
  const reasonTextarea = screen.getByPlaceholderText(/jelaskan keperluan cuti anda.../i);
  await user.type(reasonTextarea, 'Ini adalah alasan yang valid untuk pengajuan cuti saya');
};

// ============================================================================
// COMPONENT MOUNTING AND INITIAL STATE TESTS
// ============================================================================

describe('LeaveRequestForm - Component Mounting', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('should render form with all required fields in Indonesian', async () => {
    await setupComponent();

    // SUCCESS: These matches the Indonesian labels in LeaveRequestForm.tsx
    expect(screen.getByText('Jenis Cuti')).toBeInTheDocument();
    expect(screen.getByText('Mulai')).toBeInTheDocument();
    expect(screen.getByText('Hingga')).toBeInTheDocument();
    expect(screen.getByText('Alasan')).toBeInTheDocument();
  });

  test('should fetch and display leave types on mount', async () => {
    await setupComponent();

    await waitFor(() => {
      expect(screen.getByText('Cuti Tahunan')).toBeInTheDocument();
      expect(screen.getByText('Cuti Sakit')).toBeInTheDocument();
    });

    expect(mockedApi.get).toHaveBeenCalledWith('/api/leave-types');
  });

  test('should display balance correctly', async () => {
    await setupComponent();

    const annualLeaveCard = screen.getByText('Cuti Tahunan').closest('button');
    expect(within(annualLeaveCard!).getByText('10')).toBeInTheDocument();
    expect(within(annualLeaveCard!).getByText('hari Sisa')).toBeInTheDocument();
  });
});

// ============================================================================
// FORM INTERACTION TESTS
// ============================================================================

describe('LeaveRequestForm - User Interactions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('should calculate business days correctly', async () => {
    const { user } = await setupComponent();

    const startDateInput = screen.getByLabelText(/mulai/i);
    const endDateInput = screen.getByLabelText(/hingga/i);

    // Monday to Friday = 5 business days
    await user.type(startDateInput, '2025-03-10');
    await user.type(endDateInput, '2025-03-14');

    await waitFor(() => {
      expect(screen.getByText(/total hari kerja:/i)).toBeInTheDocument();
      expect(screen.getByText(/5 Hari/i)).toBeInTheDocument();
    });
  });

  test('should show error for insufficient balance', async () => {
    const { user } = await setupComponent();

    const annualLeaveButton = screen.getByRole('button', { name: /cuti tahunan/i });
    await user.click(annualLeaveButton);

    const startDateInput = screen.getByLabelText(/mulai/i);
    const endDateInput = screen.getByLabelText(/hingga/i);

    // Request 15 days (Monday onwards for 3 weeks)
    await user.type(startDateInput, '2025-03-03');
    await user.type(endDateInput, '2025-03-21'); // 15 business days

    const reasonTextarea = screen.getByPlaceholderText(/jelaskan keperluan cuti anda.../i);
    await user.type(reasonTextarea, 'Ini adalah alasan yang sangat valid sekali');

    const submitButton = screen.getByRole('button', { name: /kirim pengajuan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/saldo cuti tidak mencukupi/i)).toBeInTheDocument();
    });
  });
});

// ============================================================================
// FORM SUBMISSION TESTS
// ============================================================================

describe('LeaveRequestForm - Submission', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  test('should submit valid form successfully', async () => {
    const { user, onSuccess } = await setupComponent();

    await fillValidForm(user);
    const submitButton = screen.getByRole('button', { name: /kirim pengajuan/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/api/leave-requests',
        expect.objectContaining({
          employeeId: '00000000-0000-0000-0000-000000000001',
          leaveTypeId: '00000000-0000-0000-0000-000000000011',
          startDate: '2025-03-10',
          endDate: '2025-03-14',
        })
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/pengajuan terkirim!/i)).toBeInTheDocument();
    });
  });
});
