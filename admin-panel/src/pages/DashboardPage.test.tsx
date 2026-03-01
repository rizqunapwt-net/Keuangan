import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';

const mockNavigate = vi.fn();
const mockApiGet = vi.fn();

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('recharts', async () => {
    const React = await import('react');
    const simple = (name: string) => ({ children }: { children?: React.ReactNode }) =>
        React.createElement('div', { 'data-testid': `mock-${name}` }, children ?? null);

    return {
        ResponsiveContainer: simple('responsive-container'),
        AreaChart: simple('area-chart'),
        Area: simple('area'),
        XAxis: simple('x-axis'),
        YAxis: simple('y-axis'),
        CartesianGrid: simple('grid'),
        Tooltip: simple('tooltip'),
        Cell: simple('cell'),
    };
});

vi.mock('../api', () => ({
    default: { get: (...args: unknown[]) => mockApiGet(...args) },
}));

vi.mock('../contexts/AuthContext', () => ({
    useAuth: () => ({ user: { name: 'Test User', email: 'test@example.com' } }),
}));

import DashboardPage from './DashboardPage';

const mockDashboardStats = {
    data: {
        data: {
            summary: {
                totalSales: 50000000,
                totalExpenses: 15000000,
                outstandingInvoices: 5000000,
                netProfit: 35000000,
            },
            charts: {
                salesTrend: [
                    { date: '2026-02-01', amount: 5000000 },
                    { date: '2026-02-02', amount: 7000000 },
                    { date: '2026-02-03', amount: 6500000 },
                ],
            },
            recentTransactions: [
                { id: 1, date: '2026-02-05 14:30', amount: 2000000, status: 'paid' },
                { id: 2, date: '2026-02-05 13:15', amount: 1500000, status: 'pending' },
            ],
        },
    },
};

function setupApiMock() {
    mockApiGet.mockImplementation((url: string) => {
        if (url === '/admin/dashboard-stats') return Promise.resolve(mockDashboardStats);

        return Promise.reject(new Error(`Unexpected URL: ${url}`));
    });
}

function renderDashboard() {
    return render(
        <MemoryRouter>
            <DashboardPage />
        </MemoryRouter>,
    );
}

beforeEach(() => {
    vi.clearAllMocks();
});

describe('DashboardPage', () => {
    it('fetches dashboard endpoint on mount', async () => {
        setupApiMock();
        renderDashboard();

        await waitFor(() => {
            expect(mockApiGet).toHaveBeenCalledWith('/admin/dashboard-stats');
        });
    });

    it('renders key sections and metrics', async () => {
        setupApiMock();
        renderDashboard();

        await waitFor(() => {
            expect(screen.getByText('Ringkasan Finansial')).toBeInTheDocument();
            expect(screen.getByText('Total Penjualan')).toBeInTheDocument();
            expect(screen.getByText('Total Pengeluaran')).toBeInTheDocument();
            expect(screen.getByText('Piutang Pending')).toBeInTheDocument();
            expect(screen.getByText('Laba Bersih')).toBeInTheDocument();
            expect(screen.getByText('Grafik Tren Penjualan')).toBeInTheDocument();
            expect(screen.getByText('Transaksi Terbaru')).toBeInTheDocument();
        });
    });

    it('displays loading spinner while fetching data', () => {
        mockApiGet.mockImplementation((url: string) => {
            return new Promise(() => {}); // Never resolves to keep loading state
        });
        renderDashboard();

        // Should show the spinner text
        expect(screen.getByText(/Mempersiapkan data keuangan/i)).toBeInTheDocument();
    });

    it('renders layout when APIs fail', async () => {
        mockApiGet.mockRejectedValue(new Error('Network Error'));
        renderDashboard();

        await waitFor(() => {
            // Should still render heading even if API fails
            expect(screen.getByText('Ringkasan Finansial')).toBeInTheDocument();
        });
    });
});
